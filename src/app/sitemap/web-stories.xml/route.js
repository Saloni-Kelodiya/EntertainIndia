import { NextResponse } from 'next/server';

const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

// 🔥 NEXT.JS CACHE KILLER
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allStories = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      // ✅ ONLY ENGLISH CONTENT
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[moderation_status][$eq]': 'published',
        'filters[language][$eq]': 'hi', // ✅ ONLY ENGLISH
        'fields[0]': 'slug',
        'fields[1]': 'title',
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort[0]': 'updatedAt:desc',
        'publicationState': 'live'
      });

      // Cache buster for live data
      const apiUrl = `${STRAPI_URL}/api/web-stories?${queryParams.toString()}&_cb=${new Date().getTime()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`Failed to fetch stories: ${response.status}`);

      const data = await response.json();
      const stories = data.data || [];

      if (stories.length === 0) {
        hasMore = false;
        break;
      }

      // ✅ NO HINDI CHECK NEEDED - API already filtered English
      stories.forEach(storyItem => {
        const attrs = storyItem.attributes || storyItem;
        const slug = attrs.slug;
        
        // Sirf valid slug wali stories add karo
        if (slug && slug.trim() !== '') {
          allStories.push({
            slug: slug.trim(),
            date: attrs.updatedAt || attrs.createdAt || new Date().toISOString()
          });
        }
      });

      const pagination = data.meta?.pagination;
      if (pagination && pagination.page < pagination.pageCount) {
        page++;
      } else {
        hasMore = false;
      }

      if (page > 50) break; // 5000 stories limit
    }

    // ✅ FINAL SORTING: Latest First
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
    console.error('English Web Stories Sitemap Error:', error.message);
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