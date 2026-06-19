import MusicPage from '../../../page-components/MusicPage';
import LayoutWrapper from '../../LayoutWrapper';
import { songsAPI, articlesAPI } from '../../../lib/api';

const SITE_URL = "https://entertainindia.in";

// ✅ DYNAMIC MUSIC PAGE SCHEMA GENERATOR
function generateMusicSchema(songs, category, categoryName, page, currentYear) {
  const domain = SITE_URL;
  const listingUrl = `${domain}/${category}/music`;
  
  const graph = [];

  // 1️⃣ ORGANIZATION SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domain}/#organization`,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "url": domain,
    "logo": {
      "@type": "ImageObject",
      "url": `${domain}/logo.png`,
      "width": "512",
      "height": "512"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://x.com/EIndia99460",
      "https://www.instagram.com/entertainindiaofficial"
    ]
  });

  // 2️⃣ WEBSITE SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "description": "Latest music, songs, albums, and artist updates in Hindi",
    "inLanguage": "hi-IN",
    "publisher": {
      "@id": `${domain}/#organization`
    },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${domain}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  });

  // 3️⃣ BREADCRUMB SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${listingUrl}#breadcrumb`,
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": domain
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": categoryName,
        "item": `${domain}/${category}`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Music",
        "item": listingUrl
      }
    ]
  });

  // 4️⃣ COLLECTION PAGE SCHEMA
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${listingUrl}#collection-page`,
    "url": listingUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    }
  });

  // 5️⃣ ITEM LIST SCHEMA (Songs)
  if (songs && songs.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${listingUrl}#item-list`,
      "name": `${categoryName} नए गाने ${currentYear}`,
      "description": `Latest ${categoryName} songs, music videos, and trending tracks`,
      "numberOfItems": songs.length,
      "itemListElement": songs.slice(0, 30).map((song, index) => ({
        "@type": "ListItem",
        "position": (page - 1) * 10 + (index + 1),
        "item": {
          "@type": "MusicRecording",
          "name": song.title,
          "url": `${domain}/${category}/music/${song.slug}`,
          "byArtist": {
            "@type": "MusicGroup",
            "name": song.artist || "Various Artists"
          }
        }
      }))
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

// ✅ GET CATEGORY NAME IN HINDI
function getCategoryNameInHindi(category) {
  const names = {
    'bollywood': 'बॉलीवुड',
    'hollywood': 'हॉलीवुड',
    'bhojiwood': 'भोजीवुड',
    'tollywood': 'टॉलीवुड',
    'korean': 'कोरियाई',
    'music': 'संगीत'
  };
  return names[category] || category?.charAt(0).toUpperCase() + category?.slice(1);
}

// ✅ SEO METADATA - DYNAMIC
export async function generateMetadata({ params, searchParams }) {
  const { category } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;

  const currentYear = new Date().getFullYear();
  const nextYear = currentYear + 1;
  const categoryName = getCategoryNameInHindi(category);
  const pageSuffix = page > 1 ? ` - पेज ${page}` : "";

  const seoTitle = `नए ${categoryName} गाने ${currentYear}-${nextYear}: नवीनतम संगीत वीडियो और ट्रेंडिंग MP3 | EntertainIndia${pageSuffix}`;
  const seoDesc = `सुनें नवीनतम ${categoryName} गाने, ट्रेंडिंग संगीत वीडियो, और अनन्य साउंडट्रैक। ${categoryName} संगीत चार्ट, कलाकार अपडेट और नए रिलीज़ पर EntertainIndia पर एक्सप्लोर करें।`;
  const pageUrl = `${SITE_URL}/${category}/music`;

  return {
    title: seoTitle,
    description: seoDesc,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: seoTitle,
      description: seoDesc,
      url: pageUrl,
      siteName: 'EntertainIndia',
      images: [
        {
          url: `${SITE_URL}/og-music-${category}.jpg`,
          width: 1200,
          height: 630,
          alt: `${categoryName} संगीत संग्रह`,
        },
      ],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [`${SITE_URL}/og-music-${category}.jpg`],
    },
  };
}

// ✅ MAIN COMPONENT
export default async function Music({ params, searchParams }) {
  const { category } = await params; 
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;
  const currentYear = new Date().getFullYear();
  console.log(category, page);
  let songsData = { songs: [] };
  let trendingData = [];
  let articlesData = { articles: [], pagination: {} };

  try {
    const [sData, aData] = await Promise.all([
      songsAPI.getAll({ category, page, pageSize: 10, populate: '*', sort: "createdAt:desc" }),
      articlesAPI.getAll({
        category: 'music',
        industry: category,
        page,
        pageSize: 9,
        sort: "createdAt:desc",
      })
    ]);

    songsData = sData;
    const allSongs = songsData?.songs || [];
const trendingSongs = allSongs.filter(song => song.trending === true); // trending true wale
trendingData = trendingSongs;
    articlesData = aData;
    console.log("संगीत पेज डेटा:", {  trendingData});

    const categoryName = getCategoryNameInHindi(category);

    // ✅ GENERATE COMPLETE SCHEMA
    const schemaData = generateMusicSchema(
      songsData?.songs || [], 
      category, 
      categoryName, 
      page, 
      currentYear
    );

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        
        <h1 className="sr-only">{categoryName} नवीनतम गाने</h1>
        
        <LayoutWrapper>
          <MusicPage
      serverCategory={category}
      initialSongs={allSongs}
      initialTrending={trendingSongs}
      initialArticles={articlesData.articles}
      initialPagination={articlesData.pagination}
      initialPage={1}
    />
        </LayoutWrapper>
      </>
    );

  } catch (error) {
    console.error("संगीत SEO पेज त्रुटि:", error);
    return (
      <LayoutWrapper>
        <div className="p-20 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ कोई त्रुटि हुई</h2>
          <p className="text-gray-600">संगीत डेटा लोड नहीं हो पाया। कृपया कुछ समय बाद पुनः प्रयास करें।</p>
        </div>
      </LayoutWrapper>
    );
  }
}