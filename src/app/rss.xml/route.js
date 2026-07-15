export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { articlesAPI } from '../../lib/api'; 

const BASE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in').replace(/\/$/, '');
const STRAPI_URL = (process.env.STRAPI_BACKEND_URL || 'https://admin.entertainindia.in').replace(/\/$/, '');

const getPubDate = (dateString) => {
  const date = new Date(dateString || new Date());
  return isNaN(date.getTime()) ? new Date().toUTCString() : date.toUTCString();
};

function escapeXml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function safeCdata(str) {
  if (!str) return '';
  const stringContent = typeof str === 'string' ? str : JSON.stringify(str);
  return stringContent.replace(/]]>/g, ']]&gt;');
}

export async function GET() {
  try {
    const response = await articlesAPI.getAll({ pageSize: 100, language: 'hi' });
    const allPosts = response.articles || []; 

    let itemsXml = '';

    for (const a of allPosts) {
      if (!a?.slug) continue;

      const title = a.title || '';
      const hasHindiChars = /[\u0900-\u097F]/.test(title);
      if (!hasHindiChars) continue;

      // 🛠️ DYNAMIC ROUTING LOGIC BASED ON YOUR SCHEMA:
      let urlPath = 'article'; 
      if (a.mainCategory) {
         const mainCat = String(a.mainCategory).toLowerCase();
         if (mainCat === 'news') {
            urlPath = 'news';
         }
      } else if (a.typecontent && typeof a.typecontent === 'string') {
         // Fallback code (purane data ke liye agar MainCategory empty ho)
         if (a.typecontent.toLowerCase().includes('news')) {
            urlPath = 'news';
         }
      }

      const url = `${BASE_URL}/${urlPath}/${escapeXml(a.slug)}`; 
      
      let authorName = 'EntertainIndia Desk';
      if (a.Authors && a.Authors.name) {
          authorName = a.Authors.name;
      } else if (Array.isArray(a.authors) && a.authors.length > 0 && a.authors.name) {
          authorName = a.authors.name;
      }

      let categoryName = 'Entertainment'; 
      if (a.mainCategory) {
         categoryName = typeof a.mainCategory === 'string' ? a.mainCategory : (a.mainCategory.name || a.mainCategory.slug);
      } else if (a.category) {
         categoryName = a.category.name || a.category.slug;
      }

      let imageUrl = '';
      if (a.heroImage?.url) {
         imageUrl = a.heroImage.url.startsWith('http') ? a.heroImage.url : `${STRAPI_URL}${a.heroImage.url}`;
      }

      const mediaTag = imageUrl ? `<media:content type="image/jpeg" medium="image" url="${escapeXml(imageUrl)}" />` : '';
      
      const safeDescription = safeCdata(a.summary || title);
      const fullContent = safeCdata(a.body || a.summary || ''); 
      const finalDate = a.updatedDate || a.publishDate || a.rawPublishDate;

      itemsXml += `
<item>
  <title><![CDATA[${safeCdata(title)}]]></title>
  <link>${url}</link>
  <guid isPermaLink="true">${url}</guid>
  <pubDate>${getPubDate(finalDate)}</pubDate>
  <dc:creator><![CDATA[${safeCdata(authorName)}]]></dc:creator>
  <category><![CDATA[${safeCdata(categoryName)}]]></category>
  <description><![CDATA[${safeDescription}]]></description>
  ${mediaTag}
  <content:encoded><![CDATA[${fullContent}]]></content:encoded>
</item>`;
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
  xmlns:content="http://purl.org/rss/1.0/modules/content/"
  xmlns:dc="http://purl.org/dc/elements/1.1/" 
  xmlns:atom="http://www.w3.org/2005/Atom" 
  xmlns:media="http://search.yahoo.com/mrss/">
<channel>
  <title>EntertainIndia - Latest Bollywood &amp; Hollywood News in Hindi</title>
  <description>Stay updated with the latest entertainment news, movie reviews, and exclusive articles from EntertainIndia in Hindi.</description>
  <link>${BASE_URL}</link>
  <language>hi</language> 
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <generator>EntertainIndia Master RSS Generator</generator>
  <atom:link href="${BASE_URL}/hindi-rss.xml" rel="self" type="application/rss+xml"/>
  <image>
    <url>${BASE_URL}/og-logo.png</url>
    <title>EntertainIndia</title>
    <link>${BASE_URL}</link>
    <width>144</width>
    <height>144</height>
  </image>
  ${itemsXml}
</channel>
</rss>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/rss+xml; charset=UTF-8',
        'Cache-Control': 's-maxage=1800, stale-while-revalidate',
      },
    });
  } catch (error) {
    console.error("Hindi RSS Generation Error:", error);
    return new Response('<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel></channel></rss>', {
      headers: { 'Content-Type': 'application/rss+xml' }
    });
  }
}