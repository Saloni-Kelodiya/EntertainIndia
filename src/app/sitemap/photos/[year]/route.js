import { NextResponse } from 'next/server';

// Configuration
const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

// Force fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request, { params }) {
 const resolvedParams = await params;
  const rawYear = resolvedParams.year || '';
  const yearMatch = rawYear.match(/^(\d{4})(?:\.xml)?$/);
  if (!yearMatch) {
    return new NextResponse('Invalid year', { status: 400 });
  }
  const year = yearMatch[1];

  try {
    let allGalleries = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    // Date range for the given year
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[language][$eq]': 'hi',
        // Filter by createdAt (or change to updatedAt if you prefer)
        'filters[createdAt][$gte]': startDate,
        'filters[createdAt][$lte]': endDate,
        'fields[0]': 'slug',
        'fields[1]': 'title',
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort[0]': 'updatedAt:desc',
        'publicationState': 'live',
      });

      const apiUrl = `${STRAPI_URL}/api/galleries?${queryParams.toString()}&_cb=${Date.now()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Strapi error: ${response.status}`);
      }

      const data = await response.json();
      const galleries = data.data || [];

      if (galleries.length === 0) {
        hasMore = false;
        break;
      }

      galleries.forEach((item) => {
        const attrs = item.attributes || item;
        const slug = attrs.slug;
        const title = attrs.title || '';

        // Ensure Hindi title (extra safety)
        const hasHindi = /[\u0900-\u097F]/.test(title);
        if (slug && slug.trim() !== '' && hasHindi) {
          allGalleries.push({
            slug: slug.trim(),
            updatedAt: attrs.updatedAt || attrs.createdAt || new Date().toISOString(),
          });
        }
      });

      const pagination = data.meta?.pagination;
      if (pagination && pagination.page < pagination.pageCount) {
        page++;
      } else {
        hasMore = false;
      }

      // Safety limit
      if (page > 50) break;
    }

    // Sort by latest updated first
    allGalleries.sort((a, b) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allGalleries
  .map((gallery) => {
    const lastmod = new Date(gallery.updatedAt).toISOString();
    return `  <url>
    <loc>${BASE_URL}/photos/${escapeXml(gallery.slug)}</loc>
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
    console.error(`Error generating sitemap for year ${year}:`, error.message);
    // Return empty sitemap to avoid breaking the index
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