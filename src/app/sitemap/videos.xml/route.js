// app/sitemap/videos.xml/route.js
import { NextResponse } from 'next/server';

const STRAPI_URL = process.env.STRAPI_URL || 'http://13.201.143.7:1337';
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

export async function GET() {
  try {
    const currentYear = new Date().getFullYear();
    
    //  Sirf current year ki videos fetch karein
    const startDate = new Date(`${currentYear}-01-01T00:00:00.000Z`);
    const endDate = new Date(`${currentYear + 1}-01-01T00:00:00.000Z`);
    
    const queryParams = new URLSearchParams({
      'filters[publishedAt][$gte]': startDate.toISOString(),
      'filters[publishedAt][$lt]': endDate.toISOString(),
      'filters[language][$eq]': 'hi',
      'sort[0]': 'publishedAt:desc',
      'pagination[pageSize]': 50000,
      'populate': '*'
    });

    const response = await fetch(
      `${STRAPI_URL}/api/videos?${queryParams.toString()}`,
      {
        headers: { 'Content-Type': 'application/json' },
        next: { revalidate: 86400 }
      }
    );

    if (!response.ok) {
      throw new Error(`Strapi API error: ${response.status}`);
    }

    const data = await response.json();
    
    console.log(`Videos found for ${currentYear}:`, data.data?.length || 0);

    if (data.data && data.data.length > 0) {
      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
    ${data.data.map(item => {
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
          'Cache-Control': 'public, max-age=86400, s-maxage=86400',
        },
      });
    } else {
      return new NextResponse(
        `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <!-- No videos found for ${currentYear} -->
</urlset>`,
        {
          headers: { 'Content-Type': 'application/xml' },
        }
      );
    }

  } catch (error) {
    console.error('Error generating videos sitemap:', error);
    
    return new NextResponse(
      `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
    xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">
  <!-- Error: ${escapeXml(error.message)} -->
</urlset>`,
      {
        headers: { 'Content-Type': 'application/xml' },
      }
    );
  }
}

function normalizeVideoForSitemap(video) {
  const attrs = video.attributes || video;
  const videoId = attrs.video_id;
  let rawDuration = parseInt(attrs.duration, 10);
  
  return {
    id: video.id || attrs.id,
    title: attrs.title || '',
    slug: attrs.slug || `video-${videoId}`,
    videoId: videoId,
    embedUrl: `https://www.youtube.com/embed/${videoId}`,
    thumbnail: attrs.thumbnail || `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`,
   duration: (!isNaN(rawDuration) && rawDuration > 0) ? rawDuration : null,
    description: attrs.description || attrs.title || '',
    publishedDate: attrs.publishedAt || attrs.createdAt,
    createdAt: attrs.createdAt,
    videotype: attrs.videotype || null,
    category: attrs.category?.name || null,
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

export const revalidate = 86400;