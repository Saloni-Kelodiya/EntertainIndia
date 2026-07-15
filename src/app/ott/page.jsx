import CategoryPage from '../../page-components/CategoryPage';
import LayoutWrapper from '../LayoutWrapper';
import { webSeriesAPI } from '../../lib/api/web-series';
import { notFound } from 'next/navigation';
import { articlesAPI } from '../../lib/api/articles';

//  Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

const SITE_URL = 'https://entertainindia.in';

//  OTT Page Ke Liye Perfect Schema Generator
function generateOttSchema(webSeries = [], articles = [], categorySlug) {
  const domain = SITE_URL;
  const categoryUrl = `${domain}/ott`;
  
  const graph = [];

  // 1️⃣ Organization Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domain}/#organization`,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "url": domain,
    "logo": {
      "@type": "ImageObject",
      "url": `${domain}/og-logo.png`,
      "width": "512",
      "height": "512"
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://x.com/EIndia99460",
      "https://www.instagram.com/entertainindiaofficial"
    ]
  });

  // 2️⃣ WebSite Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "description": "Entertainment news in Hindi - OTT, Web Series, Netflix, Prime Video, Hotstar updates",
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

  // 3️⃣ Breadcrumb Schema (OTT ke liye)
  graph.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${categoryUrl}#breadcrumb`,
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
        "name": "OTT",
        "item": categoryUrl
      }
    ]
  });

  // 4️⃣ Collection Page Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection-page`,
    "name": "OTT News और Web Series अपडेट्स | EntertainIndia",
    "description": "Netflix, Prime Video, Hotstar पर नवीनतम OTT समाचार और वेब सीरीज अपडेट्स पढ़ें।",
    "url": categoryUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    }
  });

  // 5️⃣ Web Series List Schema
  if (webSeries && webSeries.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#webseries-list`,
      "name": "टॉप वेब सीरीज",
      "description": "OTT प्लेटफॉर्म्स की सबसे लोकप्रिय वेब सीरीज की सूची",
      "numberOfItems": webSeries.length,
      "itemListElement": webSeries.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "TVSeries",
          "name": item.title || item.name,
          "url": `${domain}/ott/web-series/${item.slug}`,
          "image": item.poster?.url || item.backdrop?.url || item.heroImage?.url,
          "datePublished": item.releaseDate || item.createdAt,
          "numberOfEpisodes": item.numberOfEpisodes,
          "numberOfSeasons": item.numberOfSeasons,
          "availableOn": {
            "@type": "BroadcastService",
            "name": item.platform || "OTT Platform",
            "url": item.platformUrl
          }
        }
      }))
    });
  }

  // 6️⃣ Articles List Schema (OTT News)
  if (articles && articles.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#articles-list`,
      "name": "नवीनतम OTT समाचार",
      "description": "OTT प्लेटफॉर्म्स, वेब सीरीज और डिजिटल कंटेंट से जुड़ी ताज़ा खबरें",
      "numberOfItems": articles.length,
      "itemListElement": articles.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "NewsArticle",
          "headline": article.title,
          "url": `${domain}/article/${article.slug}`,
          "image": article.heroImage?.url,
          "datePublished": article.createdAt,
          "dateModified": article.updatedAt || article.createdAt,
            "author": {
          "@type": "Person",
          "name": article.Authors?.name || "EntertainIndia Team", // 2. नाम न होने पर 'Missing Author' से बचाएगा
          "url": article.Authors?.name 
            ? `${SITE_URL}/author/${article.Authors.name?.toLowerCase().replace(/\s+/g, '-')}` 
            : `${SITE_URL}/about` // 'Missing URL' की चेतावनी को ठीक करेगा
        },
          "publisher": {
            "@type": "Organization",
            "name": "EntertainIndia",
            "logo": {
              "@type": "ImageObject",
              "url": `${domain}/og-logo.png`
            }
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

//  SEO Metadata (Updated with Schema)
export async function generateMetadata() {
  const siteUrl = SITE_URL;
  const category = 'ott';
  const categoryUrl = `${siteUrl}/${category}`;

  return {
    title: 'OTT News और Web Series अपडेट्स | EntertainIndia',
    description: 'Netflix, Prime Video, Hotstar पर नवीनतम OTT समाचार और वेब सीरीज अपडेट्स पढ़ें।',
    alternates: {
      canonical: categoryUrl,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    openGraph: {
      title: 'OTT News और Web Series | EntertainIndia',
      description: 'Netflix, Prime Video, Hotstar की ताज़ा खबरें',
      url: categoryUrl,
      siteName: 'EntertainIndia',
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'OTT News और Web Series | EntertainIndia',
      description: 'Netflix, Prime Video, Hotstar की ताज़ा खबरें',
    },
  };
}

//  Main Component with Schema
export default async function OttPage({ searchParams }) {
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;
  const category = "ott";

  try {
    const [articleData, webSeriesData] = await Promise.all([
  articlesAPI.getAllLight({
    category,
    page,
    pageSize: 12,
    mainCategory: "article",
    sort: "createdAt:desc",
  }),
  webSeriesAPI.getAllLight({
    category,
    pageSize: 20,
    sort: "releaseDate:desc",
    language: "hi",
  }),
]);

const articles = articleData?.articles || [];
const webSeries = webSeriesData || [];
    //  Generate OTT Schema
    const schemaData = generateOttSchema(webSeries, articles, category);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        
        <h1 className="sr-only">
          OTT News, Web Series Updates और Latest Streaming Content
        </h1>

        <LayoutWrapper>
          <CategoryPage
            category="ott"
            initialArticles={articles}
            initialMovies={webSeries}
            initialPagination={articleData.pagination || {}}
            initialPage={page}
          />
        </LayoutWrapper>
      </>
    );
  } catch (err) {
    console.error("OTT Page Error:", err);
    return (
      <LayoutWrapper>
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            डाटा लोड नहीं हो पाया
          </h2>
          <p className="text-gray-600">
            कृपया कुछ समय बाद पुनः प्रयास करें।
          </p>
        </div>
      </LayoutWrapper>
    );
  }
}