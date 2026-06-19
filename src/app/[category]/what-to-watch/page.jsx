import { articlesAPI, GenresAPI } from '../../../lib/api';
import WhatToWatchClient from '../../../page-components/WhatToWatch';
import LayoutWrapper from '../../LayoutWrapper';

// ==========================================
// 1️⃣ COMPLETE SEO & OG TAGS BLOCK - Hindi Version
// ==========================================
export async function generateMetadata({ searchParams, params }) {
  const s = await searchParams;
  const platform = s.platform ;
  const { category } = await params;
  
  // Platform name mapping to Hindi
  const getPlatformName = (plat) => {
    const platformMap = {
      'Netflix': 'नेटफ्लिक्स',
      'Amazon Prime': 'अमेज़न प्राइम',
      'Prime': 'अमेज़न प्राइम',
      'Hotstar': 'हॉटस्टार',
      'JioCinema': 'जियोसिनेमा',
      'SonyLIV': 'सोनीलिव',
      'ZEE5': 'जी5',
      'all': 'सभी प्लेटफॉर्म',
    };
    return platformMap[plat] || plat;
  };
  
  // Category name mapping to Hindi
  const getCategoryName = (cat) => {
    const categoryMap = {
      'bollywood': 'बॉलीवुड',
      'hollywood': 'हॉलीवुड',
      'ott': 'ओटीटी',
      'tv': 'टीवी',
      'tollywood': 'टॉलीवुड',
      'bhojiwood': 'भोजपुरी',
      'korean': 'कोरियाई',
      'All': 'सभी'
    };
    return categoryMap[cat?.toLowerCase()] || cat || 'मनोरंजन';
  };
  
  const platformName = getPlatformName(platform);
  const categoryName = getCategoryName(category);
  
  const categorySlugPath = category?.toLowerCase() || 'entertainment';
  const title = `${categoryName} पर क्या देखें | बेस्ट ${categoryName} सिफारिशें`;
  const description = `समय बर्बाद मत करो! ${platformName} पर सबसे अच्छी ${categoryName} फिल्में और सीरीज़ देखें। रोज़ाना चुनिंदा सिफारिशें।`;
  const siteUrl = `https://entertainindia.in/${categorySlugPath}/what-to-watch`;
  const ogImage = 'https://entertainindia.in/og-what-to-watch.jpg';

  return {
    title,
    description,
    
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'EntertainIndia',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${platformName} पर देखने के लिए बेस्ट फिल्में और वेब सीरीज़`,
        },
      ],
      locale: 'hi_IN',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@EntertainIndia',
    },

    alternates: {
      canonical: siteUrl,
    },
    robots: "index, follow",
  };
}

// ==========================================
// 2️⃣ MAIN PAGE COMPONENT
// ==========================================
export default async function WhatToWatchPage({ searchParams, params }) {
  const sParams = await searchParams;
  const { category } = await params;
  const platform = sParams.platform || 'all';

  // ✅ Correctly prepare API filters based on page context
  const targetFilters = {
    watching_platform: { $notNull: true },
    moderation_status: { $eq: 'published' }
  };

  if (platform !== 'all') {
    targetFilters.watching_platform = {
      platform: { $eq: platform }
    };
  }

  // ✅ Fetching data with defined filters
  const [articlesRes, genres] = await Promise.all([
    articlesAPI.getAll({
      pageSize: 12,
      filters: targetFilters, // Passed correct server-side filters here
      category: category && category !== 'All' ? category.toLowerCase() : undefined,
    }),
    GenresAPI.getAll()
  ]);

  // ✅ Get normalized data (articles are already normalized inside articlesAPI.getAll)
  const filteredArticles = articlesRes?.articles || [];

  // Hindi name mapping helpers
  const getCategoryName = (cat) => {
    const categoryMap = {
      'bollywood': 'बॉलीवुड',
      'hollywood': 'हॉलीवुड',
      'ott': 'ओटीटी',
      'tv': 'टीवी',
      'tollywood': 'टॉलीवुड',
      'bhojiwood': 'भोजपुरी',
      'All': 'सभी'
    };
    return categoryMap[cat?.toLowerCase()] || cat || 'मनोरंजन';
  };
  
  const getPlatformName = (plat) => {
    const platformMap = {
      'Netflix': 'नेटफ्लिक्स',
      'Amazon Prime': 'अमेज़न प्राइम',
      'Prime': 'अमेज़न प्राइम',
      'Hotstar': 'हॉटस्टार',
      'JioCinema': 'जियोसिनेमा',
      'SonyLIV': 'सोनीलिव',
      'ZEE5': 'जी5',
      'All': 'सभी प्लेटफॉर्म', 
      'all': 'सभी प्लेटफॉर्म'
    };
    return platformMap[plat] || plat;
  };

  const categoryName = getCategoryName(category);
  const platformName = getPlatformName(platform);
  const categorySlugPath = category?.toLowerCase() || 'entertainment';

  // ==========================================
  // 3️⃣ VALIDATED SCHEMA GENERATION
  // ==========================================
  
  // 🔹 Breadcrumb Schema - Hindi
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "होम", "item": "https://entertainindia.in" },
      { "@type": "ListItem", "position": 2, "name": categoryName, "item": `https://entertainindia.in/${categorySlugPath}` },
      { "@type": "ListItem", "position": 3, "name": "क्या देखें", "item": `https://entertainindia.in/${categorySlugPath}/what-to-watch` }
    ]
  };

  // 🔹 Collection Page Schema - Strictly MainCategory Based URLs
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${platformName} पर देखने के लिए बेस्ट ${categoryName} फिल्में और सीरीज़`,
    "description": `${platformName} पर ${categoryName} कंटेंट की चुनिंदा सिफारिशें। ट्रेंडिंग फिल्मों और वेब सीरीज़ की रोज़ाना अपडेटेड लिस्ट।`,
    "url": `https://entertainindia.in/${categorySlugPath}/what-to-watch`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": filteredArticles.length || 0,
      "itemListElement": filteredArticles.map((article, index) => {
        
        // normalizeArticle से सीधा 'mainCategory' (जैसे: news या article) का उपयोग करें
        const currentMainCat = (article.mainCategory || 'article').toLowerCase();

        // Strict MainCategory Based URL Structuring
        const articleUrl = `https://entertainindia.in/${currentMainCat}/${article.slug}`;

        return {
          "@type": "ListItem",
          "position": index + 1,
          "url": articleUrl,
          "name": article.title,
          "image": article.heroImage?.url || "https://entertainindia.in/default-share.jpg" // गूगल सर्च कंसोल एरर प्रोटेक्शन फॉलबैक
        };
      })
    }
  };

  return (
    <LayoutWrapper>
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, collectionLd]) }}
      />
      
      {/* SEO H1 Hidden Title */}
      <h1 className="sr-only">{`${platformName} पर देखने के लिए सुझाई गई फिल्में और वेब सीरीज़ - EntertainIndia`}</h1>
      
      <WhatToWatchClient 
        initialArticles={filteredArticles}
        initialGenres={genres || []}
        serverCategory={category}
        serverPlatform={platform}
      />
    </LayoutWrapper>
  );
}