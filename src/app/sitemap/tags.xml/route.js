import { NextResponse } from 'next/server';

// Aapke diye gaye sahi URLs
const STRAPI_URL = process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in';

// .replace(/\/$/, '') use kiya hai taaki agar aap '.in/' likhein ya '.in', dono mein double slash (//) ka error na aaye
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  try {
    let allTags = [];
    let page = 1;
    const pageSize = 100;
    let hasMore = true;

    while (hasMore) {
      // Tags ke liye API endpoint
      const url = new URL(`${STRAPI_URL}/api/tags`);
      
      // Pagination
      url.searchParams.append('pagination[page]', page);
      url.searchParams.append('pagination[pageSize]', pageSize);
      
      // Fields jo hume chahiye (Tags mein 'slug' small 's' se hota hai)
      url.searchParams.append('fields[0]', 'slug');
      url.searchParams.append('fields[1]', 'updatedAt');
      url.searchParams.append('fields[2]', 'publishedAt');
      url.searchParams.append('fields[3]', 'createdAt');
      
      // Sort by updatedAt
      url.searchParams.append('sort[0]', 'updatedAt:desc');

      console.log(`Fetching tags page ${page}: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch tags: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract tags from response
      const tags = data.data || [];
      
      // Process each tag safely
      tags.forEach(tagItem => {
        // Strapi v4/v5 dono ke liye safe 
        const attributes = tagItem.attributes || tagItem;
        
        // Tag ka slug
        const slug = attributes.slug;
        
        // Date handling
        const updatedAt = attributes.updatedAt || 
                          attributes.publishedAt || 
                          attributes.createdAt || 
                          new Date().toISOString();
        
        // Agar slug exist karta hai, tabhi add karo
        if (slug && slug.trim() !== '') {
          allTags.push({
            slug: slug.trim(),
            updatedAt: updatedAt
          });
        }
      });

      // Check if there are more pages
      const pagination = data.meta?.pagination;
      if (pagination) {
        hasMore = pagination.page < pagination.pageCount;
        page++;
      } else {
        hasMore = false;
      }
      
      // Loop ko infinite hone se bachane ke liye safety break
      if (page > 10) break;
    }

    console.log(`Total tags found: ${allTags.length}`);

    // Remove duplicates by slug (Duplicate URLs SEO ke liye kharab hote hain)
    const uniqueTags = Array.from(
      new Map(allTags.map(item => [item.slug, item])).values()
    );

    console.log(`Unique tags: ${uniqueTags.length}`);

    // XML Sitemap Generate karna
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueTags
  .map(tag => {
    // Date ko YYYY-MM-DD format mein clean karna
    const lastmod = new Date(tag.updatedAt).toISOString().split('T')[0];
    return `  <url>
    <loc>${BASE_URL}/tag/${tag.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });

  } catch (error) {
    console.error('Error generating tags sitemap:', error);
    
    // Agar api fail bhi ho jaye toh empty sitemap bhej do taaki Google Search Console error na de
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  </urlset>`;

    return new NextResponse(xml, {
      status: 200, 
      headers: {
        'Content-Type': 'application/xml',
      },
    });
  }
}