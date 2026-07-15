import { celebritiesAPI } from '../../lib/api'; 
import { categoryAPIServer } from '../../lib/api-server'; 
import CelebritiesPage from '../../page-components/CelebritiesPage';
import LayoutWrapper from '../LayoutWrapper';
import { notFound } from 'next/navigation';

//  Force dynamic rendering to prevent caching
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

//  Dynamic SEO Metadata Function (SEO LIMITS के साथ)
export async function generateMetadata() {
  let categoryData = null;
  
  try {
    categoryData = await categoryAPIServer.getBySlug('celebrities');
  } catch (error) {
    console.error('Category metadata fetch error:', error);
  }
  
  const seo = categoryData?.seo;
  
  //  TITLE - MAX 60-70 characters
  let seoTitle = seo?.title || 'सेलिब्रिटी प्रोफाइल | व्यक्तिगत जीवन और समाचार - EntertainIndia';
  if (seoTitle.length > 65) {
    seoTitle = seoTitle.slice(0, 62) + '...';
  }
  
  //  DESCRIPTION - MAX 150-160 characters
  let seoDescription = seo?.description || 'बॉलीवुड, हॉलीवुड और भोजपुरी सेलिब्रिटी की जीवनी, व्यक्तिगत जीवन, परिवार विवरण और फिल्म अपडेट देखें।';
  if (seoDescription.length > 155) {
    seoDescription = seoDescription.slice(0, 152) + '...';
  }
  
  //  KEYWORDS - कॉमा सेपरेटेड (ज्यादा न डालें)
  const keywords = seo?.keywords || 'सेलिब्रिटी न्यूज, एक्टर प्रोफाइल, एक्ट्रेस बायोग्राफी, बॉलीवुड सेलिब्रिटी, हॉलीवुड सेलिब्रिटी, सितारे, मनोरंजन';

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: keywords,
    
    //  CANONICAL URL
    alternates: {
      canonical: 'https://entertainindia.in/celebrities',
    },
    
    //  ROBOTS CONFIG
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
    
    //  OPEN GRAPH (SOCIAL MEDIA)
    openGraph: {
      title: seoTitle.slice(0, 60),
      description: seoDescription.slice(0, 150),
      url: 'https://entertainindia.in/celebrities',
      type: 'website',
      siteName: 'EntertainIndia',
      locale: 'hi_IN',
      images: [
        {
          url: 'https://entertainindia.in/images/celebrities-og.jpg',
          width: 1200,
          height: 630,
          alt: 'EntertainIndia सेलिब्रिटी प्रोफाइल',
        },
      ],
    },
    
    //  TWITTER CARD
    twitter: {
      card: 'summary_large_image',
      title: seoTitle.slice(0, 60),
      description: seoDescription.slice(0, 150),
      images: ['https://entertainindia.in/images/celebrities-og.jpg'],
      site: '@EntertainIndia',
      creator: '@EntertainIndia',
    },
    
    //  VERIFICATION CODES
    verification: {
      google: 'your-google-verification-code',
      yandex: 'your-yandex-verification-code',
    },
    
    //  OTHER META TAGS
    category: 'entertainment',
    authors: [{ name: 'EntertainIndia Team', url: 'https://entertainindia.in/about' }],
    creator: 'EntertainIndia',
    publisher: 'EntertainIndia',
    
    //  APPLE & ANDROID
    appleWebApp: {
      capable: true,
      title: 'सेलिब्रिटीज',
      statusBarStyle: 'black-translucent',
    },
    
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    
    //  ADDITIONAL META
    other: {
      'facebook-domain-verification': 'your-facebook-code',
      'og:image:alt': 'EntertainIndia सेलिब्रिटी प्रोफाइल पेज',
      'twitter:image:alt': 'EntertainIndia सेलिब्रिटी प्रोफाइल पेज',
    },
  };
}

//  ITEMLIST स्कीमा (SEO RICH RESULTS के लिए)
function generateItemListSchema(categoryData, celebrities, categorySlug) {
  if (!celebrities || celebrities.length === 0) return null;
  
  //  सिर्फ 10 सेलिब्रिटी दिखाएं (बहुत ज्यादा नहीं)
  const celebrityItems = celebrities.slice(0, 10).map((celeb, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Person",  // Person schema use करें
      "name": celeb.name,
      "alternateName": celeb.stageName || celeb.nickname || '',
      "description": (celeb.bio || celeb.description || '').slice(0, 200),
      "url": `https://entertainindia.in/celebrities/${celeb.slug}`,
      "image": celeb.profileImage?.url || celeb.image?.url || '',
      "sameAs": celeb.socialLinks || [],  // Social media links
      "jobTitle": celeb.profession || 'Actor',
      "nationality": celeb.nationality || 'Indian',
    }
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": categoryData?.seo?.title || categoryData?.name || "सेलिब्रिटी प्रोफाइल",
    "description": (categoryData?.seo?.description || "EntertainIndia के सितारों की पूरी जानकारी").slice(0, 200),
    "url": `https://entertainindia.in/${categorySlug}`,
    "numberOfItems": celebrities.length,
    "itemListElement": celebrityItems,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://entertainindia.in/${categorySlug}`
    }
  };
}

//  BREADCRUMB स्कीमा
function generateBreadcrumbSchema(categorySlug) {
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
        "name": "सेलिब्रिटीज",
        "item": `https://entertainindia.in/${categorySlug}`
      }
    ]
  };
}

//  WEBSITE स्कीमा
function generateWebsiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "EntertainIndia",
    "url": "https://entertainindia.in",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://entertainindia.in/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "inLanguage": "hi-IN",
    "sameAs": [
      "https://facebook.com/entertainindia",
      "https://x.com/EIndia99460",
      "https://www.instagram.com/entertainindiaofficial/",
      "https://www.youtube.com/@EIndiaofficial"
    ]
  };
}

//  COLLECTIONPAGE स्कीमा
function generateCollectionPageSchema(categorySlug, categoryData) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": categoryData?.seo?.title || "सेलिब्रिटी प्रोफाइल",
    "description": (categoryData?.seo?.description || "बॉलीवुड और हॉलीवुड सेलिब्रिटी की पूरी जानकारी").slice(0, 200),
    "url": `https://entertainindia.in/${categorySlug}`,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "name": "EntertainIndia",
      "url": "https://entertainindia.in"
    },
    "about": {
      "@type": "Thing",
      "name": "Indian Celebrities",
      "description": "बॉलीवुड, हॉलीवुड और भोजपुरी फिल्म इंडस्ट्री के सितारे"
    },
    "significantLinks": {
      "@type": "ItemList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "url": "https://entertainindia.in/celebrities/bollywood"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "url": "https://entertainindia.in/celebrities/hollywood"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "url": "https://entertainindia.in/celebrities/bhojpuri"
        }
      ]
    }
  };
}

//  MAIN COMPONENT
export default async function Page({ searchParams }) {
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;
  const categorySlug = "celebrities";
  
  //  Cache busting
  const cacheBuster = Date.now();
  
  let categoryData = null;
  let celebrities = [];
  let pagination = { page: 1, pageSize: 8, total: 0, pageCount: 0 };
  let error = null;
  
  try {
    //  Parallel fetching
    const [catData, celebData] = await Promise.all([
      categoryAPIServer.getBySlug(categorySlug, { 
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }),
      celebritiesAPI.getAll({ 
        page, 
        pageSize: 8,
        _t: cacheBuster
      }, { 
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
        }
      })
    ]);
    
    categoryData = catData;
    celebrities = celebData?.celebrities || [];
    pagination = celebData?.pagination || { page: 1, pageSize: 8, total: 0, pageCount: 0 };
    
  } catch (err) {
    console.error('सेलिब्रिटी डाटा फेच करने में गड़बड़ी:', err);
    error = err.message;
  }
  
  //  अगर कोई डाटा नहीं है तो 404 न दिखाएं, बल्कि एरर मैसेज दिखाएं
  const hasData = celebrities.length > 0 || categoryData;
  
  //  सभी स्कीमा जनरेट करें
  const itemListSchema = generateItemListSchema(categoryData, celebrities, categorySlug);
  const breadcrumbSchema = generateBreadcrumbSchema(categorySlug);
  const websiteSchema = generateWebsiteSchema();
  const collectionPageSchema = generateCollectionPageSchema(categorySlug, categoryData);
  
  return (
    <>
      {/*  CACHE CONTROL META TAGS */}
      <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
      <meta httpEquiv="Pragma" content="no-cache" />
      <meta httpEquiv="Expires" content="0" />
      
      {/*  SCHEMA.ORG SCRIPTS */}
      {itemListSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />
      
      {/*  HIDDEN SEO H1 */}
      <h1 className="sr-only">
        {categoryData?.seo?.h1 || categoryData?.name || "सेलिब्रिटी प्रोफाइल"} | बॉलीवुड, हॉलीवुड और भोजपुरी सितारे - EntertainIndia
      </h1>
      
      <LayoutWrapper>
        {error && !hasData ? (
          //  ERROR STATE
          <div className="text-center py-20 px-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ डाटा लोड नहीं हो पाया
            </h2>
            <p className="text-gray-600">
              कृपया कुछ समय बाद पुनः प्रयास करें।
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              रिफ्रेश करें
            </button>
          </div>
        ) : (
          //  MAIN CONTENT
          <CelebritiesPage
            key={cacheBuster}
            categoryData={categoryData}
            initialCelebrities={celebrities}
            initialPagination={pagination}
            initialPage={page}
            breadcrumbs={[
              { label: 'होम', url: '/' },
              { label: 'सेलिब्रिटीज', url: '/celebrities', active: true }
            ]}
          />
        )}
      </LayoutWrapper>
    </>
  );
}