import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);
    
    // ✅ SIRF NEWS CATEGORY - Article filter nahi hai
    const queryParams = new URLSearchParams({
      'filters[language][$eq]': 'hi', 
      'filters[moderation_status][$eq]': 'published',
      'filters[MainCategory][$eq]': 'news', // ✅ Sirf news
      'filters[createdAt][$gte]': startDate.toISOString(),
      'filters[createdAt][$lt]': endDate.toISOString(),
      'sort': 'createdAt:desc',
      'pagination[pageSize]': '100', 
      'populate': 'hero_image'
    });

    // Fields specify karein
    const fieldsToFetch = ['slug', 'title', 'createdAt', 'updatedAt', 'language', 'MainCategory'];
    fieldsToFetch.forEach((field, index) => {
      queryParams.append(`fields[${index}]`, field);
    });

    const apiUrl = `${STRAPI_URL}/api/articles?${queryParams.toString()}&_cb=${new Date().getTime()}`;
    
   
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`Strapi Error: ${response.status}`);

    const data = await response.json();
    const rawArticles = data.data || [];

    // ✅ Sirf Hindi news filter (already language='hi' hai, phir bhi double-check)
    const hindiNews = rawArticles.filter(item => {
      const attrs = item.attributes || item; 
      const title = attrs.title || '';
      const hasHindiTitle = /[\u0900-\u097F]/.test(title);
      return hasHindiTitle;
    });

    

    if (hindiNews.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${hindiNews.map(item => {
      const attrs = item.attributes || item;
      const title = escapeXml(attrs.title);
      const slug = attrs.slug;
      const createdAt = attrs.createdAt || item.createdAt;
      const updatedAt = attrs.updatedAt || item.updatedAt || createdAt;
      
      let imgUrl = '';
      const heroImage = attrs.hero_image?.data?.attributes || attrs.hero_image;
      if (heroImage?.url) {
        imgUrl = heroImage.url.startsWith('http') ? heroImage.url : `${STRAPI_URL}${heroImage.url}`;
      }

      return `
    <url>
        <loc>${BASE_URL}/news/${escapeXml(slug)}</loc>
        <lastmod>${new Date(updatedAt).toISOString()}</lastmod>
        <changefreq>daily</changefreq>
        <priority>0.8</priority>
        <news:news>
            <news:publication>
                <news:name>Entertain India</news:name>
                <news:language>hindi</news:language>
            </news:publication>
            <news:publication_date>${new Date(createdAt).toISOString()}</news:publication_date>
            <news:title>${title}</news:title>
        </news:news>
        ${imgUrl ? `
        <image:image>
            <image:loc>${escapeXml(imgUrl)}</image:loc>
            <image:caption>${title}</image:caption>
        </image:image>` : ''}
    </url>`;
    }).join('')}
</urlset>`;

      return new NextResponse(xml, { 
        headers: { 
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=3600'
        } 
      });
    }

    // Agar koi news nahi mili
    console.log('No news articles found for the current year');
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    <!-- No news articles found -->
</urlset>`, {
      headers: { 'Content-Type': 'application/xml' }
    });

  } catch (error) {
    console.error('News Sitemap Error:', error.message);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    <!-- Error: ${error.message} -->
</urlset>`, { 
      status: 200, 
      headers: { 'Content-Type': 'application/xml' } 
    });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}