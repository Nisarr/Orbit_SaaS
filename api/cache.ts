import type { VercelRequest, VercelResponse } from '@vercel/node';
import db from './lib/db.js';
import { setCorsHeaders } from './lib/cors.js';

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

        // POST: Build and save cache
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

            // 2. Build cache for each language
            const languages = ['en', 'bn'];
            for (const lang of languages) {
                // Fetch all sections for this language
                const result = await db.execute({
                    sql: 'SELECT section, data FROM site_content WHERE lang = ?',
                    args: [lang],
                });

                // Assemble into a single JSON object
                const content: Record<string, unknown> = {};
                for (const row of result.rows) {
                    content[row.section as string] = JSON.parse(row.data as string);
                }

                // Save the assembled blob
                await db.execute({
                    sql: `INSERT INTO content_cache (lang, data, updated_at)
                          VALUES (?, ?, datetime('now'))
                          ON CONFLICT(lang) DO UPDATE SET data = ?, updated_at = datetime('now')`,
                    args: [lang, JSON.stringify(content), JSON.stringify(content)],
                });
            }

            // Invalidate all AI gists so chatbot regenerates fresh summaries
            try {
                await db.execute('DELETE FROM kb_gist');
            } catch {
                // kb_gist table might not exist — skip
            }

            return res.status(200).json({
                success: true,
                message: 'Cache published successfully',
                cachedAt: new Date().toISOString(),
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
