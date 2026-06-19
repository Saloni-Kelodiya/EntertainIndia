import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

// 🔥 NEXT.JS CACHE KILLER
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
  try {
    const { year } = await params;
    
    // ✅ URL se exact saal nikalein
    const cleanYearMatch = year.match(/\d{4}/);
    if (!cleanYearMatch) throw new Error("Invalid year format");
    const cleanYear = cleanYearMatch[0];

    // Year ke hisaab se date range
    const startDate = new Date(`${cleanYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${parseInt(cleanYear) + 1}-01-01T00:00:00.000Z`);
   
    // ✅ URL Parameters proper format mein
    const queryParams = new URLSearchParams({
      'filters[MainCategory][$eq]': 'news',
      'filters[language][$eq]': 'hi', // 👈 CHANGE 1: Hindi set kiya
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

    const apiUrl = `${STRAPI_URL}/api/articles?${queryParams.toString()}&_cb=${new Date().getTime()}`;

    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store' 
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    const rawArticles = data.data || [];

    // 🔥 BRAHMASTRA: Frontend Filter (Sirf Hindi allow karega) 🔥
    const hindiArticles = rawArticles.filter(item => {
      const attrs = item.attributes || item;
      const lang = attrs.language || item.language;
      const title = attrs.title || '';

      const isHindiTag = lang === 'hi';
      const hasHindiChars = /[\u0900-\u097F]/.test(title);

      // 👈 CHANGE 2: Language 'hi' honi chahiye AUR title mein Hindi matra honi chahiye
      return isHindiTag && hasHindiChars; 
    });

    // 🔥 FRONTEND SORTING: LATEST FIRST 🔥
    hindiArticles.sort((a, b) => {
      const attrsA = a.attributes || a;
      const attrsB = b.attributes || b;
      
      const dateA = new Date(attrsA.createdAt || a.createdAt || 0).getTime();
      const dateB = new Date(attrsB.createdAt || b.createdAt || 0).getTime();
      
      return dateB - dateA; 
    });

    if (hindiArticles.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${hindiArticles.map(item => {
      const attrs = item.attributes || item;
      
      const slug = attrs.slug || item.slug;
      const createdAtDate = attrs.createdAt || item.createdAt;
      const updatedAtDate = attrs.updatedAt || item.updatedAt || createdAtDate;
      const title = attrs.title || '';
      
      let heroImageUrl = null;
      if (attrs.hero_image) {
        if (attrs.hero_image.data?.attributes?.url) {
          heroImageUrl = attrs.hero_image.data.attributes.url;
        } else if (attrs.hero_image.url) {
          heroImageUrl = attrs.hero_image.url;
        } else if (typeof attrs.hero_image === 'object' && attrs.hero_image?.url) {
          heroImageUrl = attrs.hero_image.url;
        }
      }
      
      if (heroImageUrl && !heroImageUrl.startsWith('http')) {
        heroImageUrl = heroImageUrl.startsWith('/') 
          ? `${BASE_URL}${heroImageUrl}`
          : `${BASE_URL}/${heroImageUrl}`;
      }
      
      const imageTag = heroImageUrl ? `
        <image:image>
            <image:loc>${escapeXml(heroImageUrl)}</image:loc>
            <image:caption>${escapeXml(title)}</image:caption>
        </image:image>` : '';
      
      return `
    <url>
        <loc>${BASE_URL}/news/${escapeXml(slug)}</loc>
        <lastmod>${new Date(updatedAtDate).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>${imageTag}
    </url>`;
    }).join('')}
</urlset>`;

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'no-store, max-age=0'
        },
      });
    } 
    
    else {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

  } catch (error) {
    console.error(`Error for year sitemap:`, error.message);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;').replace(/\n/g, ' ').replace(/\r/g, ''); 
}