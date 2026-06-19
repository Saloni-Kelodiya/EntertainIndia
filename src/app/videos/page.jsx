// ✅ Dynamic Config - No Caching (Fresh Data हमेशा)
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import VideosPage from '../../page-components/VideosPage';
import LayoutWrapper from '../LayoutWrapper';
import { videosAPI } from '../../lib/api';

// ✅ स्टेप 1: SEO मेटाडेटा (सीमा के अंदर)
export async function generateMetadata() {
  try {
    const data = await videosAPI.getAll({
      pageSize: 3,
      sort: 'publishedAt:desc',
    });
    
    const videos = data?.videos || [];
    const firstVideo = videos[0];
    
    // ✅ SEO लिमिट में Title (60-70 characters)
    const seoTitle = 'नवीनतम वीडियो | मनोरंजन वीडियो - EntertainIndia';
    // लंबाई: लगभग 55 characters
    
    // ✅ SEO लिमिट में Description (150-160 characters)
    let seoDescription = firstVideo?.description || 
      'देखें नवीनतम बॉलीवुड, हॉलीवुड और मनोरंजन वीडियो। एक्सक्लूसिव क्लिप, पर्दे के पीछे के कंटेंट और सेलिब्रिटी वीडियो।';
    
    if (seoDescription.length > 155) {
      seoDescription = seoDescription.slice(0, 152) + '...';
    }
    
    return {
      title: seoTitle,
      description: seoDescription,
      keywords: 'वीडियो, मनोरंजन वीडियो, बॉलीवुड वीडियो, हॉलीवुड वीडियो, एक्सक्लूसिव क्लिप, सेलिब्रिटी वीडियो, नवीनतम वीडियो',
      alternates: {
        canonical: 'https://entertainindia.in/videos',
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          'max-snippet': 150,
          'max-image-preview': 'large',
          'max-video-preview': -1,
        },
      },
      openGraph: {
        title: 'नवीनतम मनोरंजन वीडियो | EntertainIndia',
        description: seoDescription.slice(0, 150),
        url: 'https://entertainindia.in/videos',
        images: firstVideo?.thumbnail ? [{ 
          url: firstVideo.thumbnail,
          width: 1200,
          height: 630,
          alt: 'EntertainIndia वीडियो गैलरी'
        }] : [],
        type: 'website',
        siteName: 'EntertainIndia',
        locale: 'hi_IN',
      },
      twitter: {
        card: 'summary_large_image',
        title: 'मनोरंजन वीडियो | EntertainIndia',
        description: seoDescription.slice(0, 150),
        images: firstVideo?.thumbnail ? [firstVideo.thumbnail] : [],
      },
    };
  } catch (error) {
    console.error('वीडियो मेटाडेटा लोड करने में गड़बड़ी:', error);
  }

  // ✅ Fallback Metadata (अगर कोई error हो)
  return {
    title: 'नवीनतम वीडियो | मनोरंजन वीडियो - EntertainIndia',
    description: 'देखें नवीनतम बॉलीवुड, हॉलीवुड और मनोरंजन वीडियो। एक्सक्लूसिव क्लिप, पर्दे के पीछे के कंटेंट और सेलिब्रिटी वीडियो।',
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ✅ स्टेप 2: Video स्कीमा (VideoObject) बनाने का फंक्शन
function generateVideoSchema(videos) {
  if (!videos || videos.length === 0) return null;
  
  const videoItems = videos.slice(0, 10).map(video => ({
    "@type": "VideoObject",
    "name": video.title || "EntertainIndia वीडियो",
    "description": (video.description || "").slice(0, 200),
    "thumbnailUrl": video.thumbnail || "",
    "uploadDate": video.publishedAt || new Date().toISOString(),
    "duration": video.duration || "",
    "contentUrl": video.videoUrl || "",
    "embedUrl": video.embedUrl || "",
    "publisher": {
      "@type": "Organization",
      "name": "EntertainIndia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://entertainindia.in/logo.png"
      }
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": videoItems.map((video, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": video
    }))
  };
}

// ✅ स्टेप 3: BreadcrumbList स्कीमा
function generateBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "होम",
        "item": "https://entertainindia.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "वीडियो",
        "item": "https://entertainindia.in/videos"
      }
    ]
  };
}

// ✅ स्टेप 4: WebPage स्कीमा
function generateWebPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "मनोरंजन वीडियो गैलरी | EntertainIndia",
    "description": "नवीनतम बॉलीवुड, हॉलीवुड और मनोरंजन वीडियो देखें। एक्सक्लूसिव क्लिप और सेलिब्रिटी वीडियो।",
    "url": "https://entertainindia.in/videos",
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "name": "EntertainIndia",
      "url": "https://entertainindia.in"
    }
  };
}

// ✅ मुख्य सर्वर कंपोनेंट
export default async function Videos() {
  let allVideos = [];
  let totalCount = 0;
  
  try {
    const data = await videosAPI.getAll({
      sort: 'publishedAt:desc',
      pageSize: 100,
    });
    
    allVideos = data?.videos || [];
    totalCount = data?.pagination?.total || allVideos.length;
  
  } catch (error) {
    console.error('सर्वर पर वीडियो लोड करने में गड़बड़ी:', error);
  }

  // ✅ यूनिक कैटेगरी निकालें
  const uniqueCategories = [...new Map(
    allVideos
      .filter(v => v.category && v.category.slug)
      .map(v => [v.category.slug, v.category])
  ).values()];

  // ✅ यूनिक वीडियो टाइप निकालें
  const videoTypes = ['सभी', ...new Set(allVideos.map(v => v.videotype).filter(Boolean))];

  // ✅ Video स्कीमा जनरेट करें
  const videoListSchema = generateVideoSchema(allVideos);
  const breadcrumbSchema = generateBreadcrumbSchema();
  const webpageSchema = generateWebPageSchema();

  return (
    <>
      {/* ✅ सभी Schema.org स्क्रिप्ट्स */}
      {videoListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoListSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageSchema) }}
      />

      <LayoutWrapper>
        <article>
          {/* ✅ Hidden SEO H1 - सिर्फ Google के लिए */}
         
          
          {/* ✅ मुख्य वीडियो पेज कंपोनेंट */}
          <VideosPage 
            initialVideos={allVideos}
            initialVideoTypes={videoTypes}
            initialCategories={uniqueCategories}
            initialTotalCount={totalCount}
          />
        </article>
      </LayoutWrapper>
    </>
  );
}