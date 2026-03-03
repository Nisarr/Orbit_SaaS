import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';
import { setCorsHeaders } from './lib/cors.js';

// Extract all image URLs from content data recursively
function extractImageUrls(obj: unknown, urls: Set<string> = new Set()): Set<string> {
    if (!obj) return urls;
    if (typeof obj === 'string') {
        // Match common image URL patterns
        if (/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg|avif)/i.test(obj) ||
            /i\.ibb\.co|i\.imgbb\.com|image\.ibb\.co/i.test(obj)) {
            urls.add(obj);
        }
        return urls;
    }
    if (Array.isArray(obj)) {
        for (const item of obj) extractImageUrls(item, urls);
        return urls;
    }
    if (typeof obj === 'object') {
        for (const value of Object.values(obj as Record<string, unknown>)) {
            extractImageUrls(value, urls);
        }
    }
    return urls;
}

// Pre-warm images by sending HEAD requests (best-effort, non-blocking)
async function warmImages(imageUrls: string[]): Promise<number> {
    let warmed = 0;
    // Process in batches of 10 to avoid overwhelming
    const batchSize = 10;
    for (let i = 0; i < imageUrls.length; i += batchSize) {
        const batch = imageUrls.slice(i, i + batchSize);
        const results = await Promise.allSettled(
            batch.map(url =>
                fetch(url, { method: 'HEAD', signal: AbortSignal.timeout(5000) })
                    .then(res => { if (res.ok) warmed++; })
            )
        );
    }
    return warmed;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // CORS
    setCorsHeaders(req, res);
    if (req.method === 'OPTIONS') return res.status(200).end();

    try {
        // GET: Check cache status
        if (req.method === 'GET') {
            const result = await db.execute(
                `SELECT lang, updated_at FROM content_cache ORDER BY lang`
            );

            const status: Record<string, string> = {};
            for (const row of result.rows) {
                status[row.lang as string] = row.updated_at as string;
            }

            return res.status(200).json({
                success: true,
                cached: Object.keys(status).length > 0,
                languages: status,
            });
        }

        // POST: Build and save cache + warm images
        if (req.method === 'POST') {
            const { isAuthorized } = await import('./lib/auth.js');
            if (!isAuthorized(req)) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // 1. Ensure content_cache table exists
            await db.execute(`
                CREATE TABLE IF NOT EXISTS content_cache (
                    lang TEXT PRIMARY KEY,
                    data TEXT NOT NULL,
                    updated_at TEXT DEFAULT (datetime('now'))
                )
            `);

            // 2. Build cache for each language and collect all image URLs
            const languages = ['en', 'bn'];
            const allImageUrls = new Set<string>();

            for (const lang of languages) {
                // Fetch all sections for this language
                const result = await db.execute({
                    sql: 'SELECT section, data FROM site_content WHERE lang = ?',
                    args: [lang],
                });

                // Assemble into a single JSON object
                const content: Record<string, unknown> = {};
                for (const row of result.rows) {
                    const parsed = JSON.parse(row.data as string);
                    content[row.section as string] = parsed;
                    // Extract image URLs from this section
                    extractImageUrls(parsed, allImageUrls);
                }

                // Save the assembled blob
                await db.execute({
                    sql: `INSERT INTO content_cache (lang, data, updated_at)
                          VALUES (?, ?, datetime('now'))
                          ON CONFLICT(lang) DO UPDATE SET data = ?, updated_at = datetime('now')`,
                    args: [lang, JSON.stringify(content), JSON.stringify(content)],
                });
            }

            // 3. Invalidate all AI gists so chatbot regenerates fresh summaries
            try {
                await db.execute('DELETE FROM kb_gist');
            } catch {
                // kb_gist table might not exist — skip
            }

            // 4. Pre-warm images (best effort)
            const imageUrls = Array.from(allImageUrls);
            let imagesWarmed = 0;
            try {
                imagesWarmed = await warmImages(imageUrls);
            } catch {
                // Image warming is best-effort
            }

            // 5. Warm the CDN cache by hitting the content endpoints
            try {
                const baseUrl = `https://${req.headers.host}`;
                await Promise.allSettled(
                    languages.map(lang =>
                        fetch(`${baseUrl}/api/content?lang=${lang}`, {
                            method: 'GET',
                            signal: AbortSignal.timeout(5000),
                        })
                    )
                );
            } catch {
                // CDN warming is best-effort
            }

            return res.status(200).json({
                success: true,
                message: 'Cache published successfully',
                cachedAt: new Date().toISOString(),
                imagesFound: imageUrls.length,
                imagesWarmed,
            });
        }
        // DELETE: Clear all cache
        if (req.method === 'DELETE') {
            const { isAuthorized } = await import('./lib/auth.js');
            if (!isAuthorized(req)) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            let rowsDeleted = 0;
            try {
                const result = await db.execute('DELETE FROM content_cache');
                rowsDeleted = result.rowsAffected;
            } catch {
                // Table might not exist yet — that's fine
            }

            // Also clear AI gists
            try {
                await db.execute('DELETE FROM kb_gist');
            } catch {
                // kb_gist table might not exist — skip
            }

            return res.status(200).json({
                success: true,
                message: 'Cache cleared successfully',
                rowsDeleted,
                clearedAt: new Date().toISOString(),
            });
        }

        return res.status(405).json({ error: 'Method not allowed' });
    } catch (error) {
        console.error('Cache API error:', error);
        return res.status(500).json({
            error: 'Cache operation failed'
        });
    }
}
