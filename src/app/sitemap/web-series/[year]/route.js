import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

// Fresh data फ़ोर्स करने के लिए
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
  const resolvedParams = await params;
  const rawYear = resolvedParams.year || '';

  // साल में से केवल 4 डिजिट (जैसे "2026") निकालने के लिए
  const yearMatch = rawYear.match(/\d{4}/);
  if (!yearMatch) {
    return new NextResponse('Invalid year', { status: 400 });
  }
  const year = yearMatch; // अब इसमें शुद्ध "2026" है

  try {
    let allWebSeries = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    // यहाँ शुद्ध 4-डिजिट वाले `year` का उपयोग किया गया है
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[publishedAt][$notNull]': 'true',
        'filters[language][$eq]': 'hi',        // आपके JSON के अनुसार "hi" फ़िल्टर बिल्कुल सही है
        'filters[createdAt][$gte]': startDate,
        'filters[createdAt][$lte]': endDate,
        'fields[0]': 'slug',
        'fields[1]': 'title',
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort': 'updatedAt:desc',
        'publicationState': 'live',
      });

      const apiUrl = `${STRAPI_URL}/api/web-series-collections?${queryParams.toString()}&_cb=${Date.now()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch web-series: ${response.status}`);
      }

      const data = await response.json();
      const webSeries = data.data || [];

      if (webSeries.length === 0) {
        hasMore = false;
        break;
      }

      webSeries.forEach((item) => {
        // Strapi v4 और v5 दोनों के रिस्पॉन्स फॉर्मेट को सुरक्षित हैंडल करने के लिए
        const attrs = item.attributes || item;
        const slug = attrs.slug;
        if (slug && slug.trim() !== '') {
          allWebSeries.push({
            slug: slug.trim(),
            date: attrs.updatedAt || attrs.createdAt || new Date().toISOString(),
          });
        }
      });

      const pagination = data.meta?.pagination;
      if (pagination && pagination.page < pagination.pageCount) {
        page++;
      } else {
        hasMore = false;
      }

      if (page > 50) break; // सेफ्टी लिमिट
    }

    // लेटेस्ट को पहले दिखाने के लिए सॉर्ट करें
    allWebSeries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // XML जनरेट करें
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allWebSeries
  .map((ws) => {
    const lastmod = new Date(ws.date).toISOString();
    return `  <url>
    <loc>${BASE_URL}/ott/web-series/${escapeXml(ws.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error) {
    console.error(`Error generating web-series sitemap for ${year}:`, error.message);
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new NextResponse(emptyXml, {
      headers: { 'Content-Type': 'application/xml' },
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