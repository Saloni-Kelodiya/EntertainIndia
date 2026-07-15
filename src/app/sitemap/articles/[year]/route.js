import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

//  Saare articles fetch karne ka function with pagination loop
async function fetchAllArticles(cleanYear) {
  const startDate = new Date(`${cleanYear}-01-01T00:00:00.000Z`);
  const endDate = new Date(`${parseInt(cleanYear) + 1}-01-01T00:00:00.000Z`);

  let allArticles = [];
  let page = 1;
  const pageSize = 100;
  let totalPages = 1;

  while (page <= totalPages) {
    const queryParams = new URLSearchParams({
      'filters[MainCategory][$eq]': 'article',
      'filters[language][$eq]': 'hi',
      'filters[moderation_status][$eq]': 'published',
      'filters[createdAt][$gte]': startDate.toISOString(),
      'filters[createdAt][$lt]': endDate.toISOString(),
      'sort[0]': 'createdAt:desc',
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
      'fields[0]': 'slug',
      'fields[1]': 'title',
      'fields[2]': 'createdAt',
      'fields[3]': 'updatedAt',
      'fields[4]': 'language',
      'populate': 'hero_image'
    });

    const apiUrl = `${STRAPI_URL}/api/articles?${queryParams.toString()}&_cb=${Date.now()}`;

    console.log(`Fetching page ${page} of ${totalPages}...`);

    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} on page ${page}`);
    }

    const data = await response.json();

    // Total pages calculate karo pehli baar
    if (page === 1) {
      const total = data.meta?.pagination?.total || 0;
      totalPages = Math.ceil(total / pageSize);
      console.log(`Total articles: ${total}, Total pages: ${totalPages}`);
    }

    const articles = data.data || [];
    allArticles = [...allArticles, ...articles];

    console.log(`Page ${page}: ${articles.length} articles fetched, Total so far: ${allArticles.length}`);

    page++;
  }

  return allArticles;
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const year = resolvedParams.year;
    const cleanYear = year.replace('.xml', '');

    console.log('Fetching Hindi articles for year:', cleanYear);

    //  Saare articles fetch karo pagination loop se
    const rawArticles = await fetchAllArticles(cleanYear);

    console.log(`Total articles from API: ${rawArticles.length}`);

    // Hindi filter
    const hindiArticles = rawArticles.filter(item => {
      const attrs = item.attributes || item;
      const lang = attrs.language || item.language;
      const title = attrs.title || '';
      const hasHindiChars = /[\u0900-\u097F]/.test(title);
      return lang === 'hi' && hasHindiChars;
    });

    console.log(`Hindi articles after filter: ${hindiArticles.length}`);

    // Latest first sort
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
        <loc>${BASE_URL}/article/${escapeXml(slug)}</loc>
        <lastmod>${new Date(updatedAtDate).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>${imageTag}
    </url>`;
      }).join('')}
</urlset>`;

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400'
        },
      });
    }

    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- No Hindi articles found for year ${cleanYear} -->
  <!-- Checked at: ${new Date().toISOString()} -->
</urlset>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );

  } catch (error) {
    console.error(`Articles sitemap error:`, error.message);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error: ${escapeXml(error.message)} -->
</urlset>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
    .replace(/\n/g, ' ')
    .replace(/\r/g, '');
}