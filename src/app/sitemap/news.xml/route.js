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

    let allArticles = [];
    let page = 1;
    const pageSize = 100; // Strapi max limit, per page
    let totalFetched = 0;

    // 🔁 Loop through all pages
    while (true) {
      const query = {
        filters: {
          MainCategory: { $eq: 'news' },
          language: { $eq: 'hi' },
          moderation_status: { $eq: 'published' },
          createdAt: {
            $gte: startDate.toISOString(),
            $lt: endDate.toISOString(),
          },
        },
        sort: ['createdAt:desc'],
        pagination: {
          page: page,
          pageSize: pageSize,
        },
        fields: ['slug', 'title', 'createdAt', 'updatedAt'], // language already filtered
        populate: {
          hero_image: {
            fields: ['url'],
          },
        },
      };

      // Convert query object to URLSearchParams
      const params = new URLSearchParams();
      const flattenObject = (obj, prefix = '') => {
        Object.entries(obj).forEach(([key, value]) => {
          const newKey = prefix ? `${prefix}[${key}]` : key;
          if (value && typeof value === 'object' && !Array.isArray(value)) {
            flattenObject(value, newKey);
          } else if (Array.isArray(value)) {
            value.forEach((item, idx) => {
              params.append(`${newKey}[${idx}]`, item);
            });
          } else {
            params.append(newKey, value);
          }
        });
      };
      flattenObject(query);
      params.append('_cb', Date.now());

      const apiUrl = `${STRAPI_URL}/api/articles?${params.toString()}`;
      console.log(`📡 Fetching page ${page}...`);

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Strapi Error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const articles = data.data || [];
      allArticles = allArticles.concat(articles);
      totalFetched += articles.length;

      console.log(` Page ${page} fetched: ${articles.length} articles`);

      // Agar current page mein pageSize se kam articles aaye, toh yeh last page hai
      if (articles.length < pageSize) {
        break;
      }
      page++;
    }

    console.log(`🎯 Total articles fetched: ${totalFetched}`);

    if (allArticles.length === 0) {
      console.warn('⚠️ No articles found for the current year.');
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    <!-- No news articles found -->
</urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    // 🚀 Generate XML from ALL articles (no extra Hindi regex filter needed)
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  ${allArticles.map((item) => {
    const attrs = item.attributes || item;
    const title = escapeXml(attrs.title || 'No Title');
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
        <news:name>EntertainIndia</news:name>
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
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('❌ News Sitemap Error:', error.message);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error: ${escapeXml(error.message)} -->
</urlset>`,
      { status: 200, headers: { 'Content-Type': 'application/xml' } }
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
    .replace(/'/g, '&apos;');
}