import { NextResponse } from 'next/server';

const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allMusic = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': '100',
        'filters[language][$eq]': 'hi', // ✅ SECURITY 1: STRICT HINDI FILTER
        'fields[0]': 'slug',
        'fields[1]': 'title', 
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'populate[0]': 'categories',
        'sort[0]': 'updatedAt:desc',
        'publicationState': 'live'
      });

      const apiUrl = `${STRAPI_URL}/api/songs?${queryParams.toString()}&_cb=${new Date().getTime()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`Failed to fetch songs: ${response.status}`);

      const data = await response.json();
      const musics = data.data || [];

      if (musics.length === 0) {
        hasMore = false;
        break;
      }

      musics.forEach(item => {
        const attrs = item.attributes || item;
        const slug = attrs.slug;
        const title = attrs.title || '';
        
        // 🛑 SMART CATEGORY EXTRACTOR 🛑
        let categorySlug = 'bollywood'; // Default fallback
        
        if (attrs.categories) {
          const catData = attrs.categories.data || attrs.categories; // Handle v4 & v5
          if (Array.isArray(catData) && catData.length > 0) {
            const firstCat = catData[0].attributes || catData[0];
            if (firstCat.slug) {
              categorySlug = firstCat.slug;
            }
          }
        }

        // Clean up category slug
        categorySlug = String(categorySlug).toLowerCase().trim().replace(/\s+/g, '-');
        
        // ✅ SECURITY 2: Hindi Accepter (Sirf Hindi title aayega)
        const hasHindiChars = /[\u0900-\u097F]/.test(title);
        
        // Agar slug hai aur title mein Hindi characters hain, tabhi sitemap mein add karega
        if (slug && slug.trim() !== '' && hasHindiChars) {
          allMusic.push({
            slug: slug.trim(),
            category: categorySlug, 
            date: attrs.updatedAt || attrs.createdAt || new Date().toISOString()
          });
        }
      });

      const pagination = data.meta?.pagination;
      if (pagination && pagination.page < pagination.pageCount) page++;
      else hasMore = false;

      if (page > 50) break; // Safety limit
    }

    // Sabse latest update wale gaane sabse upar
    allMusic.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allMusic
  .map((music) => {
    const lastmod = new Date(music.date).toISOString();
    // ✅ URL Format: /category/music/song-name
    return `  <url>
    <loc>${BASE_URL}/${escapeXml(music.category)}/music/${escapeXml(music.slug)}</loc>
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
    console.error('Hindi Music Sitemap Error:', error.message);
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new NextResponse(emptyXml, { headers: { 'Content-Type': 'application/xml' } });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}