// app/sitemap/videos/[year]/route.js
import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const yearStr = resolvedParams.year || '';
    
    // साल में से केवल 4 डिजिट (जैसे "2026") निकालने के लिए
    const yearMatch = yearStr.match(/\d{4}/);
    if (!yearMatch) {
      return new NextResponse('Invalid year', { status: 400 });
    }
    const cleanYear = yearMatch;
    const requestedYear = parseInt(cleanYear);
    const currentYear = new Date().getFullYear();
    
    //  Future years के लिए खाली सैटमैप रिटर्न करें
    if (requestedYear > currentYear) {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  </urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }
    
    // Date range setup
    const startDate = `${cleanYear}-01-01T00:00:00.000Z`;
    const endDate = `${cleanYear}-12-31T23:59:59.999Z`;
    
    const queryParams = new URLSearchParams({
      'filters[publishedAt][$notNull]': 'true',
      'filters[createdAt][$gte]': startDate,
      'filters[createdAt][$lte]': endDate,
      'filters[language][$eq]': 'hi',
      'sort': 'createdAt:desc',
      'pagination[pageSize]': '1000',
    });

    // populate=* को सीधे स्ट्रिंग के साथ जोड़ा गया है ताकि Strapi रिलेशंस सही से दें
    const apiUrl = `${STRAPI_URL}/api/videos?${queryParams.toString()}&populate=*&_cb=${Date.now()}`;
    console.log("Fetching Videos from URL:", apiUrl);

    const response = await fetch(apiUrl, {
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    const items = data.data || [];
    
    console.log(`Videos found for ${cleanYear}:`, items.length);

    if (items.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    ${items.map(item => {
      const video = normalizeVideoForSitemap(item);
      
      return `
    <url>
        <loc>${BASE_URL}/videos/${escapeXml(video.slug)}</loc>
        <video:video>
            <video:thumbnail_loc>${escapeXml(video.thumbnail)}</video:thumbnail_loc>
            <video:title>${escapeXml(video.title)}</video:title>
            <video:description>${escapeXml(video.description || video.title)}</video:description>
            <video:player_loc>${escapeXml(video.embedUrl)}</video:player_loc>
            ${video.duration ? `<video:duration>${video.duration}</video:duration>` : ''}
            <video:publication_date>${new Date(video.publishedDate || video.createdAt).toISOString()}</video:publication_date>
            <video:family_friendly>yes</video:family_friendly>
            <video:uploader info="${BASE_URL}">EntertainIndia</video:uploader>
            <video:live>no</video:live>
            ${video.videotype ? `<video:tag>${escapeXml(video.videotype)}</video:tag>` : ''}
            ${video.category ? `<video:category>${escapeXml(video.category)}</video:category>` : ''}
        </video:video>
        <lastmod>${new Date(video.publishedDate || video.createdAt).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    `}).join('')}
</urlset>`;

      return new NextResponse(xml, {
        headers: {
          'Content-Type': 'application/xml',
          'Cache-Control': 'no-store, max-age=0',
        },
      });
    } else {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  </urlset>`,
        { headers: { 'Content-Type': 'application/xml' } }
      );
    }

  } catch (error) {
    console.error('Error generating year sitemap:', error);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  </urlset>`,
      { headers: { 'Content-Type': 'application/xml' } }
    );
  }
}

function normalizeVideoForSitemap(video) {
  const attrs = video.attributes || video;
  const videoId = attrs.video_id || '';
  
  return {
    id: video.id || attrs.id,
    title: attrs.title || '',
    slug: attrs.slug || `video-${videoId}`,
    videoId: videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnail: attrs.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
    duration: attrs.duration || null,
    description: attrs.description || attrs.title || '',
    publishedDate: attrs.publishedAt || attrs.createdAt,
    createdAt: attrs.createdAt,
    videotype: attrs.videotype || null,
    category: attrs.category?.name || attrs.category || null,
  };
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

export const dynamic = 'force-dynamic';
export const revalidate = 0;