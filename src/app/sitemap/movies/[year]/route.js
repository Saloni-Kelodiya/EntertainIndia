import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

//  Pagination loop – ab createdAt ke hisaab se fetch
async function fetchAllMovies(cleanYear) {
  let allMovies = [];
  let page = 1;
  const pageSize = 100;
  let totalPages = 1;

  while (page <= totalPages) {
    const queryParams = new URLSearchParams({
      // 🔥 Filters – releaseDate ki jagah createdAt
      'filters[createdAt][$gte]': `${cleanYear}-01-01`,
      'filters[createdAt][$lt]': `${parseInt(cleanYear) + 1}-01-01`,
      'filters[publishedAt][$notNull]': 'true',
      'filters[language][$eq]': 'hi',
      'sort[0]': 'createdAt:desc',          // Sorting by createdAt
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
      'fields[0]': 'slug',
      'fields[1]': 'title',
      'fields[2]': 'createdAt',             // releaseDate → createdAt
      'fields[3]': 'updatedAt',
      'fields[4]': 'publishedAt',
      'fields[5]': 'language',
      'populate[category][fields][0]': 'slug',
      'populate[category][fields][1]': 'name',
      'populate[poster][fields][0]': 'url',
      'populate[poster][fields][1]': 'alternativeText',
    });

    const apiUrl = `${STRAPI_URL}/api/movies?${queryParams.toString()}`;
    console.log(`Fetching movies page ${page}...`);

    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status} on page ${page}`);
    }

    const data = await response.json();

    if (page === 1) {
      const total = data.meta?.pagination?.total || 0;
      totalPages = Math.ceil(total / pageSize);
      console.log(`Total movies: ${total}, Total pages: ${totalPages}`);
    }

    const movies = data.data || [];
    allMovies = [...allMovies, ...movies];
    console.log(`Page ${page}: ${movies.length} fetched, Total so far: ${allMovies.length}`);

    page++;
  }

  return allMovies;
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const year = resolvedParams.year;

    const cleanYearMatch = year.match(/\d{4}/);
    if (!cleanYearMatch) throw new Error("Invalid year format");
    const cleanYear = cleanYearMatch[0];

    //  Extra: agar current year (or future) ho to empty return
    const currentYear = new Date().getFullYear();
    if (parseInt(cleanYear) > currentYear) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    console.log('Fetching Hindi movies for year (by createdAt):', cleanYear);

    const allMovies = await fetchAllMovies(cleanYear);
    console.log(`Total movies fetched: ${allMovies.length}`);

    // Valid movies filter – slug aur Hindi language
    const validMovies = allMovies.filter(item => {
      const slug = item.slug || item.attributes?.slug;
      const lang = item.language || item.attributes?.language;
      return !!slug && lang === 'hi';
    });

    console.log(`Valid movies after filter: ${validMovies.length}`);

    if (validMovies.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${validMovies.map(item => {
        const slug = item.slug || item.attributes?.slug;
        const title = item.title || item.attributes?.title || '';
        const updatedAt = item.updatedAt || item.attributes?.updatedAt;
        const createdAt = item.createdAt || item.attributes?.createdAt;
        const lastmod = updatedAt || createdAt; // prefer updatedAt, fallback to createdAt

        // Category slug
        const category = item.category || item.attributes?.category;
        const categorySlug = category?.slug || category?.data?.attributes?.slug || 'movies';

        // Poster image
        let posterUrl = null;
        const poster = item.poster || item.attributes?.poster;
        if (poster) {
          if (poster.url) posterUrl = poster.url;
          else if (poster.data?.attributes?.url) posterUrl = poster.data.attributes.url;
        }

        if (posterUrl && !posterUrl.startsWith('http')) {
          posterUrl = posterUrl.startsWith('/')
            ? `${STRAPI_URL}${posterUrl}`
            : `${STRAPI_URL}/${posterUrl}`;
        }

        const imageTag = posterUrl ? `
        <image:image>
            <image:loc>${escapeXml(posterUrl)}</image:loc>
            <image:caption>${escapeXml(title)}</image:caption>
        </image:image>` : '';

        return `
    <url>
        <loc>${BASE_URL}/${escapeXml(categorySlug)}/movies/${escapeXml(slug)}</loc>
        <lastmod>${new Date(lastmod).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
        <title>${escapeXml(title)}</title>${imageTag}
    </url>`;
      }).join('')}
</urlset>`;

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400'
        },
      });
    }

    // No data – empty sitemap
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );

  } catch (error) {
    console.error(`Movies sitemap error:`, error.message);
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