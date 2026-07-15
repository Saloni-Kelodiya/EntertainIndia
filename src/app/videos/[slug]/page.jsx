import LayoutWrapper from '../../LayoutWrapper';
import SingleVideoPage from '../../../page-components/SingleVideoPage';
import { videosAPI } from '../../../lib/api';
import { notFound } from 'next/navigation';

//  फोर्स डायनेमिक रेंडरिंग - कैशिंग से बचने के लिए
export const dynamic = 'force-dynamic';
export const revalidate = 0;

//  SEO के लिए मेटाडेटा जेनरेट करें
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  let videoTitle = slug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  let videoDesc = `EntertainIndia पर ${videoTitle} का एक्सक्लूसिव वीडियो देखें।`;

  try {
    const res = await videosAPI.getAll({ 
      filters: { slug: { $eq: slug } },
      populate: ['category']
    });
    if (res?.videos?.[0]) {
      videoTitle = res.videos[0].title;
      videoDesc = res.videos[0].description || videoDesc;
    }
  } catch (err) {
    console.error("SEO फेच करने में त्रुटि:", err);
  }

  return {
    title: `${videoTitle} | EntertainIndia`,
    description: videoDesc,
    alternates: { canonical: `https://entertainindia.in/videos/${slug}` },
  };
}

//  मुख्य सर्वर कंपोनेंट
export default async function Page({ params }) {
  const { slug } = await params;
  const baseUrl = "https://entertainindia.in";
  
  //  सर्वर पर सारा डेटा फेच करें
  let video = null;
  let relatedVideos = [];
  let relatedArticles = [];
  let relatedMovies = [];
  
  try {
    // 1. मुख्य वीडियो सभी रिलेशन के साथ फेच करें
    const res = await videosAPI.getAll({ 
      filters: { slug: { $eq: slug } },
      populate: [
        'category',
        'related_videos',
        'related_videos.category',
        'related_movies',
        'related_movies.category',
        'articles',
        'articles.hero_image',
        'articles.category'
      ],
      //  कैश बस्टिंग जोड़ें
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      }
    });
    
    video = res?.videos?.[0] || null;
    
    //  वीडियो नहीं मिला - सबसे पहले यह चेक करें
    if (!video) {
      console.log('वीडियो नहीं मिला:', slug);
      return notFound(); //  यहाँ notFound() कॉल करें
    }
    
    //  2. अगर related_videos सीधे वीडियो ऑब्जेक्ट में उपलब्ध है
    if (video?.related_videos && Array.isArray(video.related_videos)) {
      relatedVideos = video.related_videos;
    }
    
    //  3. अगर नहीं है, तो कैटेगरी से फेच करें (बैकअप तरीका)
    if (relatedVideos.length === 0 && video?.category?.slug) {
      const relatedRes = await videosAPI.getAll({
        pageSize: 6,
        filters: {
          slug: { $ne: video.slug },
          category: {
            slug: { $eq: video.category.slug },
          },
        },
        populate: ['category'],
        cache: 'no-store'
      });
      relatedVideos = relatedRes.videos || [];
    }
    
    // 4. संबंधित लेख फेच करें
    if (video?.slug) {
      try {
        const articlesData = await videosAPI.getWithArticles(video.slug);
        relatedArticles = articlesData.articles || [];
      } catch (err) {
        console.error("लेख फेच करने में त्रुटि:", err);
      }
    }
    
    // 5. वीडियो डेटा से संबंधित फिल्में
    if (video?.slug) {
      try {
        const moviesData = await videosAPI.getWithMovies(video.slug);
        relatedMovies = moviesData.movies || [];
      } catch (err) {
        console.error("फिल्म फेच करने में त्रुटि:", err);
      }
    }
    
  } catch (err) {
    console.error("सर्वर फेच त्रुटि:", err);
    return notFound(); //  त्रुटि होने पर भी 404 दिखाएं
  }

  //  अगर यहाँ तक पहुंचे और video null है तो 404 दिखाएं
  if (!video) {
    return notFound();
  }

  //  स्कीमा.ऑर्ग मार्कअप
  const breadcrumbJson = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "होम", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "वीडियो", "item": `${baseUrl}/videos` },
      { "@type": "ListItem", "position": 3, "name": video?.title || slug, "item": `${baseUrl}/videos/${slug}` }
    ]
  };

  const videoObjectJson = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    "name": video.title,
    "description": video.description || `EntertainIndia पर ${video.title} देखें`,
    "thumbnailUrl": [video.thumbnail || `${baseUrl}/default-video-thumbnail.jpg`],
    "uploadDate": video.publishedDate || new Date().toISOString(),
    "duration": video.duration ? `PT${video.duration}M` : undefined,
    "contentUrl": `${baseUrl}/videos/${slug}`,
    "embedUrl": video.embedUrl || `${baseUrl}/videos/${slug}`,
    "interactionStatistic": {
      "@type": "InteractionCounter",
      "interactionType": { "@type": "WatchAction" },
      "userInteractionCount": video.views || 0
    }
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJson) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectJson) }} />
      
      <LayoutWrapper>
        <SingleVideoPage 
          initialVideo={video}
          initialRelatedVideos={relatedVideos}
          initialRelatedArticles={relatedArticles}
          initialRelatedMovies={relatedMovies}
        />
      </LayoutWrapper>
    </>
  );
}