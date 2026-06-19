/**
 * 2024 Articles Sitemap
 */

import { API_URL } from '../../../../lib/constants';

export const dynamic = 'force-dynamic';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';
  const year = 2024;
  
  try {
    let allArticles = [];
    let page = 1;
    let hasMore = true;
    
    while (hasMore) {
      const response = await fetch(
        `${API_URL}/articles?` + new URLSearchParams({
          'pagination[page]': page,
          'pagination[pageSize]': 100,
          'fields[0]': 'slug',
          'fields[1]': 'updatedAt',
          'fields[2]': 'publish_datetime',
        }),
        {
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
        }
      );

      if (!response.ok) break;

      const data = await response.json();
      const articles = data.data || [];
      
      const filteredArticles = articles.filter(article => {
        if (!article.publish_datetime) return false;
        const articleYear = new Date(article.publish_datetime).getFullYear();
        return articleYear === year;
      });
      
      allArticles = allArticles.concat(filteredArticles);
      
      const pagination = data.meta?.pagination;
      hasMore = pagination && pagination.page < pagination.pageCount;
      page++;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allArticles
  .filter(article => article.slug)
  .map(article => {
    const lastmod = new Date(article.publish_datetime || article.updatedAt).toISOString();
    return `  <url>
    <loc>${baseUrl}/article/${article.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
</urlset>`;
    return new Response(xml, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}
