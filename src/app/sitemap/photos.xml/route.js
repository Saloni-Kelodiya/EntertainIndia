import { NextResponse } from 'next/server';

// 1. URLs setup
const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

// 🔥 NEXT.JS CACHE KILLER
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allGalleries = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      //  Proper Query Parameters with Hindi Filter
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[language][$eq]': 'hi', // 🇮🇳 🔥 STRICTLY HINDI ONLY
        'fields[0]': 'slug',
        'fields[1]': 'title', // Hindi check karne ke liye title field zaroori hai
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort[0]': 'updatedAt:desc', // Naye wale pehle aayenge
        'publicationState': 'live'
      });

      // Cache buster for fresh data
      const apiUrl = `${STRAPI_URL}/api/galleries?${queryParams.toString()}&_cb=${new Date().getTime()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch galleries: ${response.status}`);
      }

      const data = await response.json();
      const galleries = data.data || [];

      if (galleries.length === 0) {
        hasMore = false;
        break;
      }

      // 🔥 Hindi Accepter & Extraction Logic (Sirf Hindi allow karega)
      galleries.forEach(galleryItem => {
        const attrs = galleryItem.attributes || galleryItem;
        const slug = attrs.slug;
        const title = attrs.title || '';
        
        // 🛑 Hindi Characters Check (Brahmastra)
        const hasHindiChars = /[\u0900-\u097F]/.test(title);
        
        //  Agar slug hai aur title mein HINDI hai, tabhi add hoga
        if (slug && slug.trim() !== '' && hasHindiChars) {
          allGalleries.push({
            slug: slug.trim(),
            updatedAt: attrs.updatedAt || attrs.createdAt || new Date().toISOString()
          });
        }
      });

      const pagination = data.meta?.pagination;
      if (pagination && pagination.page < pagination.pageCount) {
        page++;
      } else {
        hasMore = false;
      }

      if (page > 50) break; // 5000 galleries max safety limit
    }

    //  FINAL SORTING: Latest First (Newest update top par)
    allGalleries.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allGalleries
  .map((gallery) => {
    // Clean Date Format for GSC
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
    console.error('Error generating Hindi galleries sitemap:', error.message);
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