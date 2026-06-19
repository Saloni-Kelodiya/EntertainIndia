import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

// 🔥 NEXT.JS CACHE KILLER
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    // Current Year (eg. 2026)
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);
    
    // ✅ API Query: Hindi mangwayenge
    const queryParams = new URLSearchParams({
      'filters[MainCategory][$eq]': 'article',
      'filters[language][$eq]': 'hi', // 👈 'en' ki jagah 'hi' kiya (Hindi filter)
      'filters[moderation_status][$eq]': 'published',
      'filters[createdAt][$gte]': startDate.toISOString(), 
      'filters[createdAt][$lt]': endDate.toISOString(),
      'sort[0]': 'createdAt:desc', 
      'pagination[pageSize]': 5000, 
      'fields[0]': 'slug',
      'fields[1]': 'title',
      'fields[2]': 'createdAt',
      'fields[3]': 'updatedAt',
      'fields[4]': 'language',
      'populate': 'hero_image'
    });

    // Cache Buster (_cb) taaki fresh data mile
    const apiUrl = `${STRAPI_URL}/api/articles?${queryParams.toString()}&_cb=${new Date().getTime()}`;
    
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) throw new Error(`Strapi API error: ${response.status}`);

    const data = await response.json();
    const rawArticles = data.data || [];
    
    // 🔥 ENGLISH BLOCKER & HINDI ALLOW 🔥
    const hindiArticles = rawArticles.filter(item => {
      const attrs = item.attributes || item;
      const lang = attrs.language || item.language;
      const title = attrs.title || '';
      
      // Strict Check: Lang 'hi' ho AUR Title mein Hindi (Devanagari) akshar hon. 
      // Isse English poori tarah block ho jayegi.
      return lang === 'hi' && /[\u0900-\u097F]/.test(title);
    });

    // 🔥 FRONTEND SORTING (Double Check for Latest Top) 🔥
    hindiArticles.sort((a, b) => {
      const dateA = new Date(a.attributes?.createdAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.attributes?.createdAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    if (hindiArticles.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${hindiArticles.map(item => {
      const attrs = item.attributes || item;
      const slug = attrs.slug || item.slug;
      
      // Strictly using createdAt and updatedAt as per your API logic
      const createdDate = attrs.createdAt || item.createdAt;
      const updatedDate = attrs.updatedAt || item.updatedAt || createdDate;
      const title = attrs.title || '';
      
      let heroImageUrl = null;
      if (attrs.hero_image) {
        const heroData = attrs.hero_image.data || attrs.hero_image;
        heroImageUrl = heroData.attributes?.url || heroData.url;
      }
      
      if (heroImageUrl && !heroImageUrl.startsWith('http')) {
        heroImageUrl = heroImageUrl.startsWith('/') ? `${BASE_URL}${heroImageUrl}` : `${BASE_URL}/${heroImageUrl}`;
      }
      
      const imageTag = heroImageUrl ? `
        <image:image>
            <image:loc>${escapeXml(heroImageUrl)}</image:loc>
            <image:caption>${escapeXml(title)}</image:caption>
        </image:image>` : '';
      
      return `
    <url>
        <loc>${BASE_URL}/article/${escapeXml(slug)}</loc>
        <lastmod>${new Date(updatedDate).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>${imageTag}
    </url>`;
    }).join('')}
</urlset>`;

      return new NextResponse(xml, { 
        headers: { 
          'Content-Type': 'application/xml', 
          'Cache-Control': 'no-store, max-age=0' 
        } 
      });
    } 
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, { headers: { 'Content-Type': 'application/xml' } });

  } catch (error) {
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, { headers: { 'Content-Type': 'application/xml' } });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/\n/g, ' ').replace(/\r/g, ''); 
}