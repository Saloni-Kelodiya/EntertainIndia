import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const now = new Date();
    // Google News sitemap mein sirf aakhri 48 ghante ke articles aate hain
    const fortyEightHoursAgo = new Date(now.getTime() - (48 * 60 * 60 * 1000));
    
    const queryParams = new URLSearchParams({
      'filters[$or][0][MainCategory][$eq]': 'news',
      'filters[$or][1][MainCategory][$eq]': 'article',
      'filters[language][$eq]': 'hi', // ✅ SECURITY 1: Sirf Hindi language wala data aayega
      'filters[moderation_status][$eq]': 'published',
      'filters[createdAt][$gte]': fortyEightHoursAgo.toISOString(),
      'sort[0]': 'createdAt:desc',
      'pagination[pageSize]': 500,
      'populate': 'hero_image'
    });

    const apiUrl = `${STRAPI_URL}/api/articles?${queryParams.toString()}&_cb=${now.getTime()}`;
    const response = await fetch(apiUrl, { cache: 'no-store' });
    const data = await response.json();
    const rawArticles = data.data || [];

    const finalArticles = rawArticles.filter(item => {
      const attrs = item.attributes || item;
      const title = attrs.title || '';
      
      // ✅ SECURITY 2: Agar title mein Hindi akshar nahi hain, toh usko block kar do
      const hasHindiChars = /[\u0900-\u097F]/.test(title);
      return hasHindiChars; 
    });

    // XML Structure
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9 http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd http://www.google.com/schemas/sitemap-news/0.9 http://www.google.com/schemas/sitemap-news/0.9/sitemap-news.xsd">
    ${finalArticles.map(item => {
      const attrs = item.attributes || item;
      // Default ko news rakha hai, agar article hua toh article aayega
      const category = (attrs.MainCategory || 'news') === 'article' ? 'article' : 'news';
      const pubDate = new Date(attrs.createdAt).toISOString();
      const title = escapeXml(attrs.title);
      
      // Image fetcher
      let imgUrl = attrs.hero_image?.data?.attributes?.url || attrs.hero_image?.url || '';
      if (imgUrl && !imgUrl.startsWith('http')) imgUrl = `${STRAPI_URL}${imgUrl.startsWith('/') ? '' : '/'}${imgUrl}`;

      return `
    <url>
        <loc>${BASE_URL}/${category}/${attrs.slug}</loc>
        <news:news>
            <news:publication>
                <news:name>Entertain India</news:name>
                <news:language>hi</news:language> </news:publication>
            <news:publication_date>${pubDate}</news:publication_date>
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

    return new NextResponse(xml, { headers: { 'Content-Type': 'application/xml' } });
  } catch (e) {
    return new NextResponse('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>', { headers: { 'Content-Type': 'application/xml' } });
  }
}

function escapeXml(unsafe) {
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}