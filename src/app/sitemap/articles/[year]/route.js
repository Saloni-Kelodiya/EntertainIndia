/**
 * 2025 Articles Sitemap - Fixed Version
 * Same logic as news sitemap
 */

import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export const dynamic = 'force-dynamic';
export const revalidate = 86400; // 24 hours

export async function GET(request, { params }) {
  try {
    // ✅ params ko await karo
    const { year } = await params;
    
    // ✅ Year se '.xml' hatao agar ho to
    const cleanYear = year.replace('.xml', '');
    
    console.log('Fetching articles for year:', cleanYear);

    // Year ke hisaab se date range
    const startDate = new Date(`${cleanYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${parseInt(cleanYear) + 1}-01-01T00:00:00.000Z`);
    
    // ✅ Sirf "article" MainCategory wale articles
    const apiUrl = `${STRAPI_URL}/api/articles?` + new URLSearchParams({
      'filters[MainCategory][$eq]': 'article',
      'filters[language][$eq]': 'hi', 
      'filters[moderation_status][$eq]': 'published',
      'filters[createdAt][$gte]': startDate.toISOString(), // 👈 Filter by creation
      'filters[createdAt][$lt]': endDate.toISOString(),
      'sort[0]': 'createdAt:desc', // 👈 Latest first (Database Level)
      'pagination[pageSize]': 5000, 
      'fields[0]': 'slug',
      'fields[1]': 'title',
      'fields[2]': 'createdAt',
      'fields[3]': 'updatedAt',
      'fields[4]': 'language',
      'populate': 'hero_image'
    });
    
    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 86400 }
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    

    // Agar articles milen
    if (data.data && data.data.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
    ${data.data.map(item => {
      const attrs = item.attributes || item;
      
      const slug = attrs.slug || item.slug;
      const publishedAt = attrs.publishedAt || attrs.createdAt || item.publishedAt || item.createdAt;
      const updatedAt = attrs.updatedAt || attrs.publishedAt || publishedAt;
      const title = attrs.title || '';
      
      // Hero image URL
      let heroImageUrl = null;
      if (attrs.hero_image) {
        if (attrs.hero_image.data?.attributes?.url) {
          heroImageUrl = attrs.hero_image.data.attributes.url;
        } else if (attrs.hero_image.url) {
          heroImageUrl = attrs.hero_image.url;
        } else if (typeof attrs.hero_image === 'object' && attrs.hero_image?.url) {
          heroImageUrl = attrs.hero_image.url;
        }
      }
      
      // Ensure full URL for image
      if (heroImageUrl && !heroImageUrl.startsWith('http')) {
        heroImageUrl = heroImageUrl.startsWith('/') 
          ? `${BASE_URL}${heroImageUrl}`
          : `${BASE_URL}/${heroImageUrl}`;
      }
      
      const imageTag = heroImageUrl ? `
        <image:image>
            <image:loc>${escapeXml(heroImageUrl)}</image:loc>
            <image:caption>${escapeXml(title)}</image:caption>
        </image:image>` : '';
      
      return `
    <url>
        <loc>${BASE_URL}/article/${escapeXml(slug)}</loc>
        <lastmod>${new Date(updatedAt).toISOString()}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>${imageTag}
    </url>
    `}).join('')}
</urlset>`;

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'public, max-age=86400'
        },
      });
    } 
    
    // Agar koi article nahi mila
    else {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- No articles found for year ${cleanYear} -->
  <!-- Checked at: ${new Date().toISOString()} -->
</urlset>`,
        {
          headers: { 'Content-Type': 'application/xml' },
        }
      );
    }

  } catch (error) {
    // Error handling
    let yearValue = 'unknown';
    try {
      const { year } = await params;
      yearValue = year;
    } catch {
      // Ignore
    }
    
    console.error(`Error generating articles sitemap for year ${yearValue}:`, error.message);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Error: ${escapeXml(error.message)} -->
  <!-- Year: ${yearValue} -->
  <!-- Time: ${new Date().toISOString()} -->
</urlset>`,
      {
        headers: { 'Content-Type': 'application/xml' },
      }
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
    .replace(/\n/g, ' ') // Remove newlines
    .replace(/\r/g, '');  // Remove carriage returns
}

