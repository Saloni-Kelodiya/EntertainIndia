import axios from 'axios';


const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://entertainindia.in';

// ✅ Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getStory(slug) {
  try {
    const API_URL = 'https://admin.entertainindia.com';
    
    // ✅ Add cache busting timestamp
    const cacheBuster = Date.now();

    const response = await axios.get(`${API_URL}/api/web-stories`, {
      params: {
        'filters[slug][$eq]': slug,
        'filters[language][$eq]': "hi",
        'populate[slides][populate]': '*',
        'populate[thumbnail][populate]': '*',
        'populate[auther][populate]': '*',
        'populate[related_stories][populate]': 'thumbnail',
        '_t': cacheBuster // Cache busting
      },
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });

    const storyData = response.data?.data?.[0];

    if (!storyData) {
      console.log('Story not found for slug:', slug);
      return null; // ✅ Return null instead of notFound
    }

    const story = storyData;

    const normalizeImageUrl = (url) => {
      if (!url) return '';
      if (url.startsWith('https')) return url;
      return `${API_URL}${url}`;
    };

    const slides = (story.slides || []).map(slide => ({
      heading: slide.heading || '',
      description: slide.description || '',
      ctaText: slide.ctaText || '',
      ctaUrl: slide.ctaUrl || '',
      image: slide.image?.url ? {
        url: normalizeImageUrl(slide.image.url),
        alt: slide.image.alternativeText || slide.description || ''
      } : null
    }));

    const authorName = story.auther?.username || 'EntertainIndia';
    const publishDate = story.publishedAt
      ? new Date(story.publishedAt).toDateString()
      : '';

    const thumbnailData = story.thumbnail;
    const posterUrl = thumbnailData?.url
      ? normalizeImageUrl(thumbnailData.url)
      : (slides[0]?.image?.url || '');

    return {
      title: story.title || '',
      publisher: 'EntertainIndia',
      publisherLogo: normalizeImageUrl('/uploads/logo_b7a6f4d1ab.png'),
      poster: posterUrl,
      author: authorName,
      publishDate,
      seo_title: story.seo_title,
      seo_description: story.seo_description,
      cover: {
        image: posterUrl,
        title: story.title,
        author: authorName,
        date: new Date(publishDate || Date.now()).toDateString()
      },
      slides,
      relatedStories: (story.related_stories || []).map(item => ({
        title: item.title,
        slug: item.slug,
        thumbnail: item.thumbnail?.url ? normalizeImageUrl(item.thumbnail.url) : ''
      }))
    };

  } catch (error) {
    console.error('Error fetching web story:', error.message);
    return null;
  }
}

// ✅ Escape HTML special characters function
function escapeHtml(str) {
  if (!str) return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, ' ');
}
// Helper function to return 404 HTML response
function return404() {
  const notFoundHTML = `
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>404 - Page Not Found</title>
  <style>
    /* Full body height ko remove kiya gaya hai */
    .not-found-wrapper {
      padding: 60px 20px;
      text-align: center;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      /* Ye ensure karega ki content center mein rahe */
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .container { 
      max-width: 500px;
      margin: 0 auto;
    }

    h1 { 
      font-size: 5rem; 
      margin: 0; 
      color: #333;
      line-height: 1;
    }

    h2 { 
      font-size: 1.5rem; 
      color: #666; 
      margin: 10px 0;
      font-weight: normal;
    }

    p { 
      color: #999; 
      margin-top: 20px;
      font-size: 1rem;
    }

    .button {
      margin-top: 25px;
      display: inline-block;
      padding: 12px 24px;
      background-color: #0070f3;
      color: white;
      text-decoration: none;
      border-radius: 6px;
      font-weight: 500;
      transition: background 0.2s;
    }

    .button:hover {
      background-color: #0051af;
    }
  </style>
</head>
<body>
  <div class="not-found-wrapper">
    <div class="container">
      <h1>404</h1>
      <h2>Page Not Found</h2>
      <p>Oops! The page you're looking for doesn't exist.</p>
      <a href="/" class="button">Go Back Home</a>
    </div>
  </div>
</body>
</html>
  `;

  return new Response(notFoundHTML, {
    status: 404,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
export async function GET(request, { params }) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;
    
    if (!slug) {
      return return404();
    }
    
    const story = await getStory(slug);

    // ✅ Proper notFound check
    if (!story || !story.slides || story.slides.length === 0) {
      return return404();
    }

    const {
      title,
      slides,
      publisher,
      publisherLogo,
      poster,
      author,
      publishDate,
      relatedStories,
      seo_title,
      seo_description
    } = story;

    const finalSeoDesc = (seo_description || slides?.description || title || 'Web Story').substring(0, 160);
    const finalSeoTitle = seo_title || title || 'Web Story';
    const isoDate = publishDate ? new Date(publishDate).toISOString() : new Date().toISOString();
    const storyUrl = `${baseUrl}/web-stories/${slug}`;

    const ampHTML = `<!doctype html>
<html amp lang="hi">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(finalSeoTitle)}</title>
    <link rel="canonical" href="${storyUrl}">
    <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(finalSeoTitle)}">
    <meta name="description" content="${escapeHtml(finalSeoDesc)}">
    <meta property="og:description" content="${escapeHtml(finalSeoDesc)}">
    <meta property="og:url" content="${storyUrl}">
    <meta property="og:image" content="${poster}">
    <meta property="article:published_time" content="${isoDate}">
    <meta property="article:author" content="${escapeHtml(author)}">

    <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "NewsArticle",
      "headline": "${escapeHtml(finalSeoTitle)}",
      "description": "${escapeHtml(finalSeoDesc)}",
      "image": ["${poster}"],
      "datePublished": "${new Date(publishDate || Date.now()).toISOString()}",
      "author": {"@type": "Person", "name": "${escapeHtml(author)}"},
      "publisher": {
        "@type": "Organization",
        "name": "${escapeHtml(publisher)}",
        "logo": {"@type": "ImageObject", "url": "${publisherLogo}"}
      }
    }
    </script>
    
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-story" src="https://cdn.ampproject.org/v0/amp-story-1.0.js"></script>
    
    <style amp-boilerplate>body{-webkit-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-moz-animation:-amp-start 8s steps(1,end) 0s 1 normal both;-ms-animation:-amp-start 8s steps(1,end) 0s 1 normal both;animation:-amp-start 8s steps(1,end) 0s 1 normal both}@-webkit-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-moz-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-ms-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@-o-keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}@keyframes -amp-start{from{visibility:hidden}to{visibility:visible}}</style>
    <noscript><style amp-boilerplate>body{-webkit-animation:none;-moz-animation:none;-ms-animation:none;animation:none}</style></noscript>

    <style amp-custom>
      amp-story {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      }
      
      amp-story-page {
        background: #000;
      }

      .gradient-overlay {
        background: linear-gradient(to top, 
          rgba(0,0,0,0.95) 0%, 
          rgba(0,0,0,0.6) 30%, 
          rgba(0,0,0,0.2) 60%,
          transparent 100%);
        pointer-events: none;
        z-index: 1;
      }

      .story-content {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        align-items: center;
        height: 100%;
        width: 100%;
        padding: 0 20px 40px 20px;
        box-sizing: border-box;
        text-align: center;
      }

      .story-title {
        font-size: 28px;
        font-weight: 700;
        color: #fff;
        margin: 0 0 10px 0;
        text-shadow: 0 2px 10px rgba(0,0,0,0.7);
        line-height: 1.3;
        max-width: 90%;
      }

      .slide-title {
        font-size: 26px;
        font-weight: 700;
        color: #fff;
        margin: 0 0 12px 0;
        text-shadow: 0 2px 10px rgba(0,0,0,0.8);
        line-height: 1.3;
        max-width: 90%;
      }

      .story-description {
        font-size: 16px;
        font-weight: 400;
        color: #fff;
        line-height: 1.5;
        text-shadow: 0 2px 8px rgba(0,0,0,0.8);
        margin: 0 0 20px 0;
        padding: 0;
        max-width: 90%;
      }

      .story-meta {
        font-size: 14px;
        color: rgba(255,255,255,0.9);
        text-shadow: 0 1px 4px rgba(0,0,0,0.5);
        margin: 5px 0 0 0;
      }

      .cta-button {
        display: inline-block;
        margin-top: 15px;
        padding: 8px 0;
        color: #3b82f6 ;
        text-decoration: none;
        font-weight: 700;
        font-size: 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
        cursor: pointer;
        z-index: 10;
      }

      .cta-button:hover {
        opacity: 0.8;
      }
      
      .cta-button:active {
        transform: scale(0.98);
      }

      .related-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-gap: 8px;
        padding: 0 15px;
        width: 100%;
        box-sizing: border-box;
        margin-top: 10px;
      }

      .related-card {
        position: relative;
        aspect-ratio: 8/12;
        border-radius: 5px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.15);
        text-decoration: none;
        box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      }

      .related-title {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        padding: 10px 8px;
        background: linear-gradient(transparent, rgba(0,0,0,0.95));
        color: #fff;
        font-size: 12px;
        font-weight: 600;
        line-height: 1.3;
        text-align: left;
      }

      .see-more-btn {
        display: inline-block;
        margin-top: 20px;
        padding: 14px 32px;
        background: #E50914;
        color: #fff;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 700;
        font-size: 15px;
        text-transform: uppercase;
        letter-spacing: 1px;
        box-shadow: 0 4px 15px rgba(229, 9, 20, 0.3);
        border: 2px solid rgba(255,255,255,0.15);
      }

      .image-fallback {
        background: linear-gradient(145deg, #1a1a1a 0%, #2d2d2d 100%);
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #666;
        font-size: 48px;
      }

      amp-img {
        object-fit: cover;
      }
    </style>
  </head>
  <body>
    <amp-story
      standalone
      title="${escapeHtml(title)}"
      publisher="${escapeHtml(publisher)}"
      publisher-logo-src="${publisherLogo}"
      poster-portrait-src="${poster}">

      <amp-story-page id="cover" auto-advance-after="5s">
        <amp-story-grid-layer template="fill">
          <amp-img
            src="${poster}"
            width="720"
            height="1280"
            layout="responsive"
            alt="${escapeHtml(title)}">
          </amp-img>
        </amp-story-grid-layer>

        <amp-story-grid-layer template="fill" class="gradient-overlay"></amp-story-grid-layer>

        <amp-story-grid-layer template="fill">
          <div class="story-content">
            <h1 class="story-title">${escapeHtml(title)}</h1>
            <p class="story-meta">
              By <strong>${escapeHtml(author)}</strong> • ${publishDate}
            </p>
          </div>
        </amp-story-grid-layer>
      </amp-story-page>

      ${slides.map((slide, index) => {
        const imageUrl = slide.image?.url || '';
        const hasImage = imageUrl && imageUrl.trim() !== '';
        const hasCta = slide.ctaText && slide.ctaUrl;

        return `
        <amp-story-page id="page-${index + 1}" auto-advance-after="${hasCta ? '10s' : '5s'}">
          <amp-story-grid-layer template="fill">
            ${hasImage ? `
            <amp-img
              src="${imageUrl}"
              width="720"
              height="1280"
              layout="responsive"
              alt="${escapeHtml(slide.image?.alt || '')}">
            </amp-img>
            ` : `
            <div class="image-fallback">
              <span>📷</span>
            </div>
            `}
          </amp-story-grid-layer>

          <amp-story-grid-layer template="fill" class="gradient-overlay"></amp-story-grid-layer>

          <amp-story-grid-layer template="fill">
            <div class="story-content">
              ${slide.heading ? `<h2 class="slide-title">${escapeHtml(slide.heading)}</h2>` : ''}
              ${slide.description ? `<p class="story-description">${escapeHtml(slide.description)}</p>` : ''}
              
              ${hasCta ? `
              <a 
                href="${slide.ctaUrl}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="cta-button"
              >
                ${escapeHtml(slide.ctaText)} →
              </a>
              ` : ''}
            </div>
          </amp-story-grid-layer>
        </amp-story-page>
      `}).join('')}

      ${relatedStories && relatedStories.length > 0 ? `
      <amp-story-page id="related-stories">
        <amp-story-grid-layer template="fill">
          <div style="background: linear-gradient(145deg, #0a0a0a 0%, #1a1a1a 100%); height: 100%; width: 100%;"></div>
        </amp-story-grid-layer>
        
        <amp-story-grid-layer template="vertical">
          <div style="display: flex; flex-direction: column; height: 100%; padding: 20px 0 30px 0; box-sizing: border-box;">
            
            <div class="related-grid">
              ${relatedStories.slice(0, 4).map(item => `
              <a href="${baseUrl}/web-stories/${item.slug}" class="related-card">
                <amp-img 
                  src="${item.thumbnail || poster}" 
                  width="150" 
                  height="250" 
                  layout="responsive"
                  alt="${escapeHtml(item.title)}">
                </amp-img>
                <div class="related-title">${escapeHtml(item.title)}</div>
              </a>
              `).join('')}
            </div>

            <div style="flex: 1;"></div>
            
            <div style="text-align: center; padding: 0 20px;">
              <a href="${baseUrl}/web-stories" class="see-more-btn">
                See All Stories
              </a>
            </div>
          </div>
        </amp-story-grid-layer>
      </amp-story-page>
      ` : ''}
    </amp-story>
  </body>
</html>`;

    // ✅ Note: Your custom headers below are already properly handling no-cache requirements!
    return new Response(ampHTML, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
    
  } catch (error) {
    console.error('Error in GET handler:', error);
    return return404();
  }
}