import { NextResponse } from 'next/server';

const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    let allAwards = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const queryParams = new URLSearchParams({
        'pagination[page]': page.toString(),
        'pagination[pageSize]': '100',
        'filters[language][$eq]': 'hi', //  Sirf Hindi language filter
        'populate': '*',
        'sort[0]': 'updatedAt:desc',
        'publicationState': 'live'
      });

      const apiUrl = `${STRAPI_URL}/api/awards?${queryParams.toString()}&_cb=${new Date().getTime()}`;

      const response = await fetch(apiUrl, {
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
      });

      if (!response.ok) throw new Error(`Failed to fetch awards: ${response.status}`);

      const data = await response.json();
      const awards = data.data || [];

      if (awards.length === 0) {
        hasMore = false;
        break;
      }

      //  Hindi character filter HATAYA - sirf slug check
      awards.forEach(item => {
        const attrs = item.attributes || item;
        const slug = attrs.slug;
        const title = attrs.title || '';
        
        // Category extraction
        let rawCategory = 'bollywood';
        
        if (attrs.industry_category) {
          const indCat = attrs.industry_category.data || attrs.industry_category;
          if (Array.isArray(indCat) && indCat.length > 0) {
            const firstCat = indCat[0].attributes || indCat[0];
            rawCategory = firstCat.slug || firstCat.name || rawCategory;
          }
        } 
        else if (attrs.industry && String(attrs.industry).trim() !== '') {
          rawCategory = attrs.industry;
        }

        const categorySlug = String(rawCategory).toLowerCase().trim().replace(/\s+/g, '-');
        
        //  Sirf slug check - Hindi character validation HATAYA
        if (slug && slug.trim() !== '') {
          allAwards.push({
            slug: slug.trim(),
            category: categorySlug, 
            date: attrs.updatedAt || attrs.createdAt || new Date().toISOString(),
            title: title // Optional: debugging ke liye
          });
        }
      });

      const pagination = data.meta?.pagination;
      if (pagination && pagination.page < pagination.pageCount) {
        page++;
      } else {
        hasMore = false;
      }

      if (page > 50) break; 
    }

    // Final sorting
    allAwards.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allAwards
  .map((award) => {
    const lastmod = new Date(award.date).toISOString();
    return `  <url>
    <loc>${BASE_URL}/${escapeXml(award.category)}/awards/${escapeXml(award.slug)}</loc>
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
    console.error('Awards Sitemap Error:', error.message);
    const emptyXml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
    return new NextResponse(emptyXml, { headers: { 'Content-Type': 'application/xml' } });
  }
}

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}