/**
 * Pages Sitemap
 * Generates sitemap for static pages (excluding auth-only pages)
 */

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';
  
  // Static pages (excluding auth-only routes)
  const staticPages = [
      { path: '/', lastmod: new Date().toISOString(), priority: 1.0 },
    { path: '/about', lastmod: new Date().toISOString(), priority: 0.8 },
    { path: '/contact', lastmod: new Date().toISOString(), priority: 0.8 },
    { path: '/bollywood', lastmod: new Date().toISOString(), priority: 0.9 },
    { path: '/hollywood', lastmod: new Date().toISOString(), priority: 0.9 },
    { path: '/music', lastmod: new Date().toISOString(), priority: 0.9 },
   { path: '/tollywood', lastmod: new Date().toISOString(), priority: 0.9 },
    { path: '/bhojiwood', lastmod: new Date().toISOString(), priority: 0.9 },
     { path: '/korean', lastmod: new Date().toISOString(), priority: 0.9 },
    { path: '/tv', lastmod: new Date().toISOString(), priority: 0.9 },
    { path: '/ott', lastmod: new Date().toISOString(), priority: 0.9 },
    { path: '/videos', lastmod: new Date().toISOString(), priority: 0.8 },
    { path: '/photos', lastmod: new Date().toISOString(), priority: 0.8 },
    { path: '/celebrities', lastmod: new Date().toISOString(), priority: 0.8 },
    { path: '/web-stories', lastmod: new Date().toISOString(), priority: 0.8 },
    { path: '/author', lastmod: new Date().toISOString(), priority: 0.7 },
    { path: '/privacy-policy', lastmod: new Date().toISOString(), priority: 0.5 },
  ]
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${staticPages
  .map(
    (page) => `  <url>
    <loc>${baseUrl}${page.path}</loc>
    <lastmod>${page.lastmod}</lastmod>
    <changefreq>${page.priority >= 0.9 ? 'daily' : page.priority >= 0.7 ? 'weekly' : 'monthly'}</changefreq>
    <priority>${page.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
