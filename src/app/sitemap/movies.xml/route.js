import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

// 🔥 NEXT.JS CACHE KILLER
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allMovies = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;
    
    while (hasMore) {
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': pageSize.toString(),
        'filters[language][$eq]': 'hi', // 🔥 STRICT HINDI FILTER
        'populate[0]': 'category', // ✅ POPULATE CATEGORY
        'fields[0]': 'slug',
        'fields[1]': 'title',
        'fields[2]': 'updatedAt',
        'fields[3]': 'createdAt',
        'sort[0]': 'createdAt:desc',
        'publicationState': 'live'
      });

      // Cache buster for fresh data
      const apiUrl = `${STRAPI_URL}/api/movies?${queryParams.toString()}&_cb=${new Date().getTime()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch movies: ${response.status}`);
      }

      const data = await response.json();
      const movies = data.data || [];

      if (movies.length === 0) {
        hasMore = false;
        break;
      }

      // 🔥 HINDI ONLY LOGIC (English Block)
      movies.forEach(item => {
        // Handle Strapi v4 and v5 structure
        const attrs = item.attributes || item;
        const slug = attrs.slug;
        const title = attrs.title || '';
        
        // Get category from populated data
        let categorySlug = 'bollywood'; // Default category
        if (attrs.category) {
          const categoryData = attrs.category.data || attrs.category;
          if (categoryData && categoryData.attributes) {
            categorySlug = categoryData.attributes.slug || 'bollywood';
          } else if (categoryData && categoryData.slug) {
            categorySlug = categoryData.slug;
          } else if (typeof attrs.category === 'string') {
            categorySlug = attrs.category;
          }
        }
        
        // Strict Check: Title mein Hindi characters hone chahiye
        const hasHindiChars = /[\u0900-\u097F]/.test(title);
        
        if (slug && hasHindiChars) {
          allMovies.push({
            slug: slug.trim(),
            category: categorySlug,
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

    // ✅ FINAL SORTING: Latest First
    allMovies.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Generate XML
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allMovies
  .map((movie) => {
    // URL structure: /{category}/movies/{slug}/
    const url = `${BASE_URL}/${movie.category}/movies/${escapeXml(movie.slug)}`;
    return `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date(movie.date).toISOString()}</lastmod>
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
    console.error('Error generating Hindi movies sitemap:', error);
    return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      headers: { 'Content-Type': 'application/xml' },
    });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}