import { ImageResponse } from '@vercel/og';
import { createClient } from '@libsql/client/web';

export const config = {
    runtime: 'edge',
};

const SITE_URL = 'https://orbitsaas.cloud';
const FAVICON_URL = `${SITE_URL}/favicon.png`;
const FALLBACK_OG = `${SITE_URL}/og-banner-v2.png`;

function getClient() {
    return createClient({
        url: process.env.TURSO_DATABASE_URL!,
        authToken: process.env.TURSO_AUTH_TOKEN!,
    });
}

async function getProjectBySlug(slug: string) {
    const client = getClient();
    try {
        const cacheResult = await client.execute({
            sql: 'SELECT data FROM content_cache WHERE lang = ?',
            args: ['en'],
        });
        let content: any = {};
        if (cacheResult.rows.length > 0) {
            content = JSON.parse(cacheResult.rows[0].data as string);
        } else {
            const result = await client.execute({
                sql: "SELECT data FROM site_content WHERE section = 'projects' AND lang = 'en'",
                args: [],
            });
            if (result.rows.length > 0) {
                content = { projects: JSON.parse(result.rows[0].data as string) };
            }
        }
        const items: any[] = content.projects?.items || [];
        const project = items.find((item: any) => item.id === slug);
        if (project) return project;
        const idx = parseInt(slug, 10);
        if (!isNaN(idx) && idx >= 0 && idx < items.length) return items[idx];
        return null;
    } catch (e) {
        console.error('OG: DB fetch error', e);
        return null;
    }
}

function stripHtml(html: string): string {
    if (!html) return '';
    return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();
}

function escapeHtml(str: string): string {
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* ── Known bot user-agents ── */
const BOT_UA = /bot|crawler|spider|crawling|facebookexternalhit|whatsapp|telegram|twitterbot|linkedinbot|slackbot|discordbot|googlebot|bingbot|yandex|baidu|duckduck|sogou|exabot|ia_archiver|embedly|quora|outbrain|pinterest|vkshare|tumblr|skype|nuzzel|w3c_validator|preview/i;

export default async function handler(req: Request) {
    const url = new URL(req.url);
    const slug = url.searchParams.get('project') || '';
    const mode = url.searchParams.get('mode') || 'image';

    if (!slug) {
        return new Response('Missing project parameter', { status: 400 });
    }

    // ── MODE: meta — serve bot-friendly HTML or redirect real browsers ──
    if (mode === 'meta') {
        const ua = req.headers.get('user-agent') || '';
        const isBot = BOT_UA.test(ua);

        // Real browsers: serve index.html directly instead of redirecting (avoids loop)
        if (!isBot) {
            try {
                const spaResp = await fetch(`${SITE_URL}/index.html`);
                const spaHtml = await spaResp.text();
                return new Response(spaHtml, {
                    status: 200,
                    headers: {
                        'Content-Type': 'text/html; charset=utf-8',
                        'Cache-Control': 'no-cache',
                    },
                });
            } catch {
                // Fallback: redirect with a nonce to break loop
                return Response.redirect(`${SITE_URL}/?_redirect=/project/${slug}`, 302);
            }
        }

        // Bot: serve minimal HTML with OG meta tags
        const project = await getProjectBySlug(slug);
        const title = project?.seo?.title || (project ? `${project.title} | Orbit SaaS` : 'Project | Orbit SaaS');
        const desc = project?.seo?.description || stripHtml(project?.desc || '').substring(0, 160);
        const ogImageUrl = `${SITE_URL}/api/og?project=${encodeURIComponent(slug)}`;
        const canonicalUrl = `${SITE_URL}/project/${slug}`;

        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(desc)}">
<link rel="canonical" href="${canonicalUrl}">
<link rel="icon" type="image/png" href="${SITE_URL}/favicon.png">
<meta property="og:type" content="article">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(desc)}">
<meta property="og:image" content="${ogImageUrl}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${canonicalUrl}">
<meta property="og:site_name" content="ORBIT SaaS">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(desc)}">
<meta name="twitter:image" content="${ogImageUrl}">
</head>
<body><p>${escapeHtml(title)}</p></body>
</html>`;

        return new Response(html, {
            status: 200,
            headers: {
                'Content-Type': 'text/html; charset=utf-8',
                'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
            },
        });
    }

    // ── MODE: image — generate OG image with cover + favicon watermark ──
    const project = await getProjectBySlug(slug);
    const coverUrl = project?.images?.[0] || project?.image || '';
    const title = project?.title || 'Orbit SaaS Project';

    if (!coverUrl) {
        return Response.redirect(FALLBACK_OG, 302);
    }

    const absoluteCoverUrl = coverUrl.startsWith('http') ? coverUrl : `https://${coverUrl}`;

    try {
        return new ImageResponse(
            (
                <div style={{ width: '1200px', height: '630px', display: 'flex', position: 'relative', backgroundColor: '#0a0a0f' }}>
                    <img src={absoluteCoverUrl} style={{ width: '1200px', height: '630px', objectFit: 'cover' }} />
                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '120px', display: 'flex', background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }} />
                    <div style={{ position: 'absolute', bottom: '16px', right: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={FAVICON_URL} style={{ width: '36px', height: '36px', borderRadius: '8px' }} />
                        <span style={{ color: '#ffffff', fontSize: '18px', fontWeight: 700, letterSpacing: '-0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.6)' }}>ORBIT SaaS</span>
                    </div>
                    <div style={{ position: 'absolute', bottom: '16px', left: '24px', display: 'flex', maxWidth: '900px' }}>
                        <span style={{ color: '#ffffff', fontSize: '28px', fontWeight: 800, textShadow: '0 2px 12px rgba(0,0,0,0.8)', lineHeight: 1.2 }}>{title}</span>
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
                headers: {
                    'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
                },
            }
        );
    } catch (e) {
        console.error('OG image generation error:', e);
        return Response.redirect(FALLBACK_OG, 302);
    }
}
