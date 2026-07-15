import { NextResponse } from 'next/server';

const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

// 🔥 Force fresh data
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
    let allStories = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    // Date range for the given year (based on createdAt)
    const startDate = `${year}-01-01T00:00:00.000Z`;
    const endDate = `${year}-12-31T23:59:59.999Z`;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[moderation_status][$eq]': 'published',
        'filters[language][$eq]': 'hi', // Hindi only
        'filters[createdAt][$gte]': startDate,
        'filters[createdAt][$lte]': endDate,
        'fields[0]': 'slug',
        'fields[1]': 'title',
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort[0]': 'updatedAt:desc',
        'publicationState': 'live',
      });

      const apiUrl = `${STRAPI_URL}/api/web-stories?${queryParams.toString()}&_cb=${Date.now()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch stories: ${response.status}`);
      }

      const data = await response.json();
      const stories = data.data || [];

      if (stories.length === 0) {
        hasMore = false;
        break;
      }

      stories.forEach((storyItem) => {
        const attrs = storyItem.attributes || storyItem;
        const slug = attrs.slug;
        if (slug && slug.trim() !== '') {
          allStories.push({
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

      if (page > 50) break; // safety limit (5000 stories)
    }

    // Sort latest first
    allStories.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allStories
  .map((story) => {
    const lastmod = new Date(story.date).toISOString();
    return `  <url>
    <loc>${BASE_URL}/web-stories/${escapeXml(story.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
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
    console.error(`Error generating Web Stories sitemap for ${year}:`, error.message);
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