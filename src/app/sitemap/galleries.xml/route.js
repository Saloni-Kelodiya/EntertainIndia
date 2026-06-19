import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allGalleries = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;
    
    while (hasMore) {
      // ✅ CHANGE 1: API filter ko 'hi' (Hindi) set kiya
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[language][$eq]': 'hi', 
        'fields[0]': 'slug',
        'fields[1]': 'title', 
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort[0]': 'createdAt:desc', 
        'publicationState': 'live'
      });

      const apiUrl = `${STRAPI_URL}/api/galleries?${queryParams.toString()}&_cb=${new Date().getTime()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch galleries: ${response.status}`);
      }

      const data = await response.json();
      const rawGalleries = data.data || [];

      if (rawGalleries.length === 0) {
        hasMore = false;
        break;
      }

      // ✅ CHANGE 2: Sirf wahi galleries rakhein jinke title mein Hindi ho
      rawGalleries.forEach(item => {
        const attrs = item.attributes || item;
        const slug = attrs.slug;
        const title = attrs.title || '';
        
        // Check karega ki title mein Hindi (Devanagari) ka koi akshar hai ya nahi
        const hasHindiChars = /[\u0900-\u097F]/.test(title);
        
        // Agar slug hai aur title mein Hindi hai, tabhi sitemap mein jodein
        if (slug && hasHindiChars) {
          allGalleries.push({
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

      if (page > 50) break; // Safety limit
    }

    // Sorting: Sabse nayi gallery sabse upar
    allGalleries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allGalleries
  .map((gallery) => {
    return `  <url>
    <loc>${BASE_URL}/photos/${escapeXml(gallery.slug)}</loc>
    <lastmod>${new Date(gallery.date).toISOString()}</lastmod>
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
    console.error('Error generating Hindi galleries sitemap:', error);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}