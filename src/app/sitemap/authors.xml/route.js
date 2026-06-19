import { NextResponse } from 'next/server';

const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');
const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  try {
    let allAuthors = [];
    let start = 0;
    const limit = 100;
    let hasMore = true;

    while (hasMore) {
      // 1. URL change karke /api/users kar diya
      const url = new URL(`${STRAPI_URL}/api/users`);
      
      url.searchParams.append('start', start);
      url.searchParams.append('limit', limit);
      url.searchParams.append('filters[role][name][$eq]', 'Author');

      console.log(`Fetching users starting from ${start}: ${url.toString()}`);

      const response = await fetch(url.toString(), {
        headers: {
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Users API Error Details:", errorText);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      // 3. Dhyan Dein: Users API direct array return karti hai (data.data nahi)
      const users = await response.json();
      
      // Agar array khali hai toh loop rok do
      if (!Array.isArray(users) || users.length === 0) {
        hasMore = false;
        break;
      }
      
      // Data extract karna
      users.forEach(user => {
        // Agar aapne custom 'slug' banaya hai toh wo lega, warna 'username' use karega
        const rawSlug = user.slug || user.username; 
        const updatedAt = user.updatedAt || user.createdAt || new Date().toISOString();
        
        if (rawSlug && String(rawSlug).trim() !== '') {
          // ✅ MAGIC HERE: Sab kuch small letters mein karega aur spaces ko '-' banayega
          const cleanSlug = String(rawSlug).toLowerCase().trim().replace(/\s+/g, '-');
          
          allAuthors.push({
            slug: cleanSlug, // Yahan clean wala slug jayega
            updatedAt: updatedAt
          });
        }
      });

      // Pagination check logic
      if (users.length < limit) {
        hasMore = false; // Aur data nahi bacha
      } else {
        start += limit; // Next batch ke liye start aage badha do
      }
      
      if (start > 1000) break; // Safety limit
    }

    console.log(`Total authors found: ${allAuthors.length}`);

    // Duplicates hatana
    const uniqueAuthors = Array.from(
      new Map(allAuthors.map(item => [item.slug, item])).values()
    );

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${uniqueAuthors
  .map(
    (author) => {
      const lastmod = new Date(author.updatedAt).toISOString().split('T')[0];
      
      // Note: URL mein /author/ hi rakha hai
      return `  <url>
    <loc>${BASE_URL}/author/${escapeXml(author.slug)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.6</priority>
  </url>`;
    }
  )
  .join('\n')}
</urlset>`;

    return new NextResponse(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating authors sitemap:', error);
    
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

// XML mein special characters ko escape karne ke liye function (Zaroori hai SEO ke liye)
function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}