import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

// 🔥 NEXT.JS CACHE KILLER
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allCelebrities = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[language][$eq]': 'hi', // 🔥 STRICT HINDI FILTER ('en' ko 'hi' kiya)
        // 'locale': 'hi', // Agar Strapi i18n use kar rahe ho toh isko uncomment kar lena
        'fields[0]': 'Slug',
        'fields[1]': 'name', // Check karne ke liye ki title Hindi mein hai ya nahi
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort[0]': 'updatedAt:desc', // LATEST UPDATED FIRST
        'publicationState': 'live'
      });

      const apiUrl = `${STRAPI_URL}/api/celebrities-profiles?${queryParams.toString()}&_cb=${new Date().getTime()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) throw new Error(`Failed to fetch celebrities: ${response.status}`);

      const data = await response.json();
      const celebrities = data.data || [];

      if (celebrities.length === 0) {
        hasMore = false;
        break;
      }

      // 🔥 HINDI ONLY ALLOW: Sirf wahi profiles aayengi jinme Hindi characters hon
      celebrities.forEach(item => {
        const attrs = item.attributes || item;
        const slug = attrs.Slug || attrs.slug;
        const name = attrs.name || '';
        
        // Strict Check: Name mein Hindi (Devanagari) characters hone hi chahiye
        const hasHindiChars = /[\u0900-\u097F]/.test(name);
        
        if (slug && hasHindiChars) {
          allCelebrities.push({
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

      if (page > 50) break; // Safety limit (5000 celebrities max)
    }

    // ✅ FINAL SORTING: Latest First (Updated date ke hisaab se)
    allCelebrities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Remove duplicates
    const uniqueCelebrities = Array.from(
      new Map(allCelebrities.map(item => [item.slug, item])).values()
    );

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueCelebrities
  .map(celeb => `  <url>
    <loc>${BASE_URL}/celebrities/${escapeXml(celeb.slug)}</loc>
    <lastmod>${new Date(celeb.date).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`)
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'no-store, max-age=0',
      },
    });

  } catch (error) {
    console.error('Hindi Celebrities Sitemap Error:', error.message);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}