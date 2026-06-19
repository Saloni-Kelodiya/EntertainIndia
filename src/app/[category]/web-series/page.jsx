import LayoutWrapper from "../../LayoutWrapper";
import { webSeriesAPI, GenresAPI } from "../../../lib/api";
import WebSeriesPage from "../../../page-components/WebSeriespage";

const SITE_URL = "https://entertainindia.in";

// ✅ OTT Web Series Listing Page Ke Liye Perfect Schema Generator
function generateWebSeriesListingSchema(webSeries, category) {
  const domain = SITE_URL;
  const listingUrl = `${domain}/ott/web-series`;
  
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

  // 2️⃣ WebSite Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "description": "OTT web series collection - Latest web series, reviews, ratings, and streaming platforms",
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

  // 3️⃣ Breadcrumb Schema (OTT > Web Series)
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
        "name": "OTT",
        "item": `${domain}/ott`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "Web Series",
        "item": listingUrl
      }
    ]
  });

  // 4️⃣ CollectionPage Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${listingUrl}#collection-page`,
    "name": `Best OTT Web Series 2026 - Reviews, Ratings & Where to Watch | EntertainIndia`,
    "description": `Explore the complete list of OTT web series. Get details on ratings, genres, release years, and streaming platforms for all web series.`,
    "url": listingUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    }
  });

  // 5️⃣ ItemList Schema (Web Series List)
  if (webSeries && webSeries.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${listingUrl}#item-list`,
      "name": `Top OTT Web Series 2026`,
      "description": `List of best OTT web series with ratings and reviews.`,
      "numberOfItems": webSeries.length,
      "itemListElement": webSeries.slice(0, 30).map((series, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "TVSeries",
          "name": series.title,
          "url": `${domain}/ott/web-series/${series.slug}`,
          "image": series.poster?.url || "",
          "description": series.description?.substring(0, 150),
          "aggregateRating": series.rating ? {
            "@type": "AggregateRating",
            "ratingValue": series.rating,
            "bestRating": "10",
            "worstRating": "1"
          } : undefined,
          "genre": series.genres?.map(g => g.name) || []
        }
      }))
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

// ✅ SEO: Dynamic Metadata Generation
export async function generateMetadata() {
  const seoTitle = `Best OTT Web Series 2026 - Reviews, Ratings & Where to Watch | EntertainIndia`;
  const seoDesc = `Explore the complete list of OTT web series. Get details on ratings, genres, release years, and streaming platforms for all web series.`;
  const pageUrl = `${SITE_URL}/ott/web-series`;

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
          url: `${SITE_URL}/og-webseries.jpg`,
          width: 1200,
          height: 630,
        },
      ],
      locale: 'hi_IN',
      type: 'website',
    },
    
    twitter: {
      card: 'summary_large_image',
      title: seoTitle,
      description: seoDesc,
      images: [`${SITE_URL}/og-webseries.jpg`],
    },
  };
}

export default async function WebSeriesListing() {
  const category = "ott"; // ✅ Fixed: Sirf OTT category

  try {
    // ✅ Server-side Parallel Data Fetching
    const [seriesRes, genresRes] = await Promise.all([
      webSeriesAPI.getAll({
        pageSize: 50,
        category: category,
        sort: "createdAt:desc",
      }),
      GenresAPI.getAll()
    ]);

    const initialSeries = seriesRes?.data || [];
    const initialGenres = [...new Set(genresRes.map(i => i.name).filter(Boolean))];

    // ✅ Generate Complete Schema
    const schemaData = generateWebSeriesListingSchema(initialSeries, category);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        
        {/* ❌ NO H1 HERE - Client component already has it */}
        
        <LayoutWrapper>
          <WebSeriesPage
            serverCategory={category}
            initialSeries={initialSeries}
            initialGenres={initialGenres}
          />
        </LayoutWrapper>
      </>
    );
  } catch (error) {
    console.error("WebSeries Page SEO Fetch Error:", error);
    return (
      <LayoutWrapper>
        <div className="p-20 text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ कोई त्रुटि हुई</h2>
          <p className="text-gray-600">वेब सीरीज लोड नहीं हो पाई। कृपया कुछ समय बाद पुनः प्रयास करें।</p>
        </div>
      </LayoutWrapper>
    );
  }
}