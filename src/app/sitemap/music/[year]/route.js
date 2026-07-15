import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

async function fetchAllMusic(cleanYear) {
  let allMusic = [];
  let page = 1;
  const pageSize = 100;
  let totalPages = 1;

  while (page <= totalPages) {
    const queryParams = new URLSearchParams({
      // 🔥 Filter by createdAt instead of releaseDate
      'filters[createdAt][$gte]': `${cleanYear}-01-01`,
      'filters[createdAt][$lt]': `${parseInt(cleanYear) + 1}-01-01`,
      'filters[publishedAt][$notNull]': 'true',
      'filters[language][$eq]': 'hi',
      'sort[0]': 'createdAt:desc',    // sorting by createdAt
      'pagination[page]': String(page),
      'pagination[pageSize]': String(pageSize),
      // Fields – include createdAt instead of releaseDate (or keep both if needed)
      'fields[0]': 'slug',
      'fields[1]': 'title',
      'fields[2]': 'createdAt',        // <-- use createdAt
      'fields[3]': 'updatedAt',
      'fields[4]': 'publishedAt',
      'fields[5]': 'language',
      'populate[categories][fields][0]': 'slug',
      'populate[thumbnail][fields][0]': 'url',
      'populate[thumbnail][fields][1]': 'alternativeText',
    });

    const apiUrl = `${STRAPI_URL}/api/songs?${queryParams.toString()}`;

    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Strapi error:', err);
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();

    if (page === 1) {
      const total = data.meta?.pagination?.total || 0;
      totalPages = Math.ceil(total / pageSize);
      console.log(`Total music: ${total}, Total pages: ${totalPages}`);
    }

    allMusic = [...allMusic, ...(data.data || [])];
    console.log(`Page ${page}: fetched, Total: ${allMusic.length}`);
    page++;
  }

  return allMusic;
}

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const year = resolvedParams.year;

    const cleanYearMatch = year.match(/\d{4}/);
    if (!cleanYearMatch) throw new Error("Invalid year format");
    const cleanYear = cleanYearMatch[0];

    //  Extra: agar current year (or future) ho to empty return kar sakte hain
    const currentYear = new Date().getFullYear();
    if (parseInt(cleanYear) > currentYear) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

    console.log('Fetching Hindi music for year (by createdAt):', cleanYear);

    const allMusic = await fetchAllMusic(cleanYear);

    // Hindi filter – already applied in API, but keep for safety
    const hindiMusic = allMusic.filter(item => {
      const slug = item.slug || item.attributes?.slug;
      const lang = item.language || item.attributes?.language;
      return !!slug && lang === 'hi';
    });

    console.log(`Hindi music after filter: ${hindiMusic.length}`);

    if (hindiMusic.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${hindiMusic.map(item => {
        const slug = item.slug || item.attributes?.slug;
        const title = item.title || item.attributes?.title || '';
        const updatedAt = item.updatedAt || item.attributes?.updatedAt;
        // lastmod ko updatedAt hi rakhenge (ya createdAt bhi use kar sakte hain)
        const lastmod = updatedAt || item.createdAt || item.attributes?.createdAt;

        // Category slug
        const categories = item.categories || item.attributes?.categories;
        const categorySlug = categories?.[0]?.slug || 
                            categories?.data?.[0]?.attributes?.slug || 
                            'bollywood';

        // Thumbnail
        let thumbUrl = null;
        const thumbnail = item.thumbnail || item.attributes?.thumbnail;
        if (thumbnail) {
          if (thumbnail.url) thumbUrl = thumbnail.url;
          else if (thumbnail.data?.attributes?.url) thumbUrl = thumbnail.data.attributes.url;
        }

        if (thumbUrl && !thumbUrl.startsWith('http')) {
          thumbUrl = thumbUrl.startsWith('/')
            ? `${STRAPI_URL}${thumbUrl}`
            : `${STRAPI_URL}/${thumbUrl}`;
        }

        const imageTag = thumbUrl ? `
        <image:image>
            <image:loc>${escapeXml(thumbUrl)}</image:loc>
            <image:title>${escapeXml(title)}</image:title>
            <image:caption>${escapeXml(title)}</image:caption>
        </image:image>` : '';

        return `
    <url>
        <loc>${BASE_URL}/${escapeXml(categorySlug)}/music/${escapeXml(slug)}</loc>
        <lastmod>${new Date(lastmod).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>${imageTag}
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
    console.error('Music sitemap error:', error.message);
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