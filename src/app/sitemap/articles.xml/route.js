import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function safeISODate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  return d.toISOString();
}

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);

    let allArticles = [];
    let page = 1;
    const pageSize = 100;
    let totalPages = 1;

    do {
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

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Strapi API error: ${response.status}`);

      const data = await response.json();
      const articles = data.data || [];
     
      allArticles = allArticles.concat(articles);

      const meta = data.meta?.pagination;
      if (meta) {
        totalPages = meta.pageCount;
      } else {
        break;
      }

      page++;
    } while (page <= totalPages);

    const hindiArticles = allArticles.filter(item => {
      const attrs = item.attributes || item;
      const lang = attrs.language || item.language;
      return lang === 'hi';
    });

    hindiArticles.sort((a, b) => {
      const dateA = new Date(a.attributes?.createdAt || a.createdAt || 0).getTime();
      const dateB = new Date(b.attributes?.createdAt || b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    if (hindiArticles.length === 0) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    const urlBlocks = hindiArticles.map(item => {
      const attrs = item.attributes || item;
      const slug = attrs.slug || item.slug || '';
      const title = attrs.title || '';

      const lastmod = safeISODate(attrs.updatedAt || item.updatedAt)
                   || safeISODate(attrs.createdAt || item.createdAt);
      const createdAt = safeISODate(attrs.createdAt || item.createdAt);

      if (!lastmod || !slug) return '';

      let heroImageUrl = null;
      if (attrs.hero_image) {
        const heroData = attrs.hero_image.data || attrs.hero_image;
        heroImageUrl = heroData?.attributes?.url || heroData?.url || null;
      }
      if (heroImageUrl && !heroImageUrl.startsWith('http')) {
        heroImageUrl = heroImageUrl.startsWith('/')
          ? `${BASE_URL}${heroImageUrl}`
          : `${BASE_URL}/${heroImageUrl}`;
      }

      const imageTag = heroImageUrl
        ? `
        <image:image>
            <image:loc>${escapeXml(heroImageUrl)}</image:loc>
            <image:caption>${escapeXml(title)}</image:caption>
        </image:image>`
        : '';

      return `
    <url>
        <loc>${BASE_URL}/article/${escapeXml(slug)}</loc>
        <lastmod>${lastmod}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>${imageTag}
    </url>`;
    }).filter(Boolean).join('');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
    xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
    ${urlBlocks}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store, max-age=0'
      }
    });

  } catch (error) {
    console.error('Hindi Sitemap error:', error);
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
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