// app/webseries/[slug]/page.js (Server Component)
import LayoutWrapper from '../../../LayoutWrapper';
import WebseriesDetailClient from "../../../../page-components/WebSeriesDetailPage"; 
import { webSeriesAPI } from "../../../../lib/api";
import { notFound } from 'next/navigation';

// ✅ Helper function to get actual category from DB
const getActualCategory = (item) => {
  if (item?.category?.slug) return item.category.slug.toLowerCase();
  if (item?.categories?.length > 0) return item.categories[0].slug.toLowerCase();
  return 'ott';
};

// ✅ Helper to convert category slug to Hindi display name
const getCategoryHindiName = (categorySlug) => {
  const mapping = {
    'ott': 'ओटीटी',
    'hindi': 'हिंदी',
    'english': 'अंग्रेज़ी',
    'telugu': 'तेलुगु',
    'tamil': 'तमिल',
    'malayalam': 'मलयालम',
    'kannada': 'कन्नड़',
    'bengali': 'बंगाली',
    'marathi': 'मराठी',
  };
  return mapping[categorySlug?.toLowerCase()] || categorySlug?.charAt(0).toUpperCase() + categorySlug?.slice(1);
};

// ✅ SEO: Dynamic Metadata Generation (Hindi)
export async function generateMetadata({ params }) {
  const { slug, category } = await params;

  try {
    const webseries = await webSeriesAPI.getBySlug(slug);

    const actualCategory = getActualCategory(webseries);
    if (!webseries || actualCategory !== category.toLowerCase()) {
      return {
        title: 'वेब सीरीज नहीं मिली | EntertainIndia',
        description: 'अनुरोधित वेब सीरीज नहीं मिल सकी।',
        robots: { index: false, follow: false }
      };
    }

    // Hindi SEO title and description
    const seoTitle = `${webseries.title} वेब सीरीज - कास्ट, समीक्षाएं, एपिसोड और ओटीटी अपडेट | EntertainIndia`;
    const seoDescription = webseries.description?.substring(0, 160) || 
      `${webseries.title} वेब सीरीज के नवीनतम अपडेट प्राप्त करें। पूरी कास्ट, क्रू, सीजन विवरण और विशेष समीक्षाएं देखें EntertainIndia पर।`;

    const pageUrl = `https://entertainindia.com/${category}/web-series/${slug}`;
    const ogImage = webseries.poster?.url || 'https://entertainindia.com/default-webseries-og.jpg';

    return {
      title: seoTitle,
      description: seoDescription,
      alternates: {
        canonical: pageUrl,
        languages: {
          'hi': pageUrl, // Hindi version (self)
        },
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
      },
      openGraph: {
        title: seoTitle,
        description: seoDescription,
        url: pageUrl,
        siteName: 'EntertainIndia',
        images: [
          {
            url: ogImage,
            width: 1200,
            height: 630,
            alt: webseries.title,
          }
        ],
        type: 'video.tv_show',
        locale: 'hi_IN',
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDescription,
        images: [ogImage],
        site: '@EntertainIndia',
        creator: '@EntertainIndia',
      },
    };
  } catch (error) {
    return {
      title: 'वेब सीरीज विवरण और समीक्षाएं | EntertainIndia',
      robots: { index: false, follow: false }
    };
  }
}
export const dynamic = 'force-static';
// Server Component
export default async function WebseriesDetailPage({ params }) {
  const { slug, category } = await params;

  try {
    const mainData = await webSeriesAPI.getBySlug(slug);
   
    if (!mainData) {
      return notFound();
    }

    const actualCategory = getActualCategory(mainData);
    if (actualCategory !== category.toLowerCase()) {
      return notFound(); 
    }

    const initialData = {
      webseries: mainData,
      crew: mainData.crew || [],
      cast: mainData.cast || [],
      articles: mainData.relatedArticles || [],
      similar: mainData.similarWebSeries || [],
      seasons: mainData.seasons || [],
      awards: mainData.award || [],
      reviews: mainData.web_series_reviews || [],
    };

    const categoryDisplay = getCategoryHindiName(category);
    const breadcrumbCategoryName = categoryDisplay; // Hindi display name

    // ✅ Breadcrumb Schema (Hindi labels)
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "होम", "item": "https://entertainindia.com" },
        { "@type": "ListItem", "position": 2, "name": breadcrumbCategoryName, "item": `https://entertainindia.com/${category}` },
        { "@type": "ListItem", "position": 3, "name": "वेब सीरीज", "item": `https://entertainindia.com/${category}/web-series` },
        { "@type": "ListItem", "position": 4, "name": mainData.title, "item": `https://entertainindia.com/${category}/web-series/${slug}` }
      ]
    };

    // TVSeries Schema with Hindi description fallback
    const seriesSchemaLd = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": mainData.title,
      "url": `https://entertainindia.com/${category}/web-series/${slug}`,
      "description": mainData.description?.substring(0, 200) || `${mainData.title} वेब सीरीज के बारे में विवरण।`,
      "image": mainData.poster?.url || "https://entertainindia.com/default-webseries.jpg",
      "genre": mainData.genres?.map(g => g.name) || ["Drama"],
      "startDate": mainData.releaseDate,
      "numberOfSeasons": mainData.seasons?.length || 1,
      
      "actor": (mainData.cast || []).slice(0, 8).map(person => ({
        "@type": "Person",
        "name": person.name || person.castName
      })),
      "creator": (mainData.crew || []).filter(c => c.job === 'Director' || c.job === 'Creator').map(c => ({
        "@type": "Person",
        "name": c.name || c.crewName
      })),

      "aggregateRating": mainData.rating ? {
        "@type": "AggregateRating",
        "ratingValue": mainData.rating,
        "bestRating": "10",
        "worstRating": "1",
        "ratingCount": mainData.web_series_reviews?.length || "1"
      } : undefined
    };

    return (
      <LayoutWrapper>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, seriesSchemaLd]) }}
        />
        <WebseriesDetailClient initialData={initialData} slug={slug} key={slug} ServerCategory={category} />
      </LayoutWrapper>
    );

  } catch (error) {
    console.error('Error in WebseriesDetailPage:', error);
    return notFound();
  }
}