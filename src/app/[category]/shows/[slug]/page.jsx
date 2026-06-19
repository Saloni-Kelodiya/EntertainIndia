import LayoutWrapper from '../../../LayoutWrapper';
import TvShowDetailClient from "../../../../page-components/TvShowDetailPage";
import { tvShowsAPI } from "../../../../lib/api";
import { notFound } from 'next/navigation';

// ✅ SEO: Dynamic Metadata Generation
export async function generateMetadata({ params }) {
  const { slug, category } = await params;

  try {
    const tvShow = await tvShowsAPI.getBySlug(slug);

    if (!tvShow) return { title: 'TV Show Not Found' };

    const capitalizedCat = category.charAt(0).toUpperCase() + category.slice(1);
    const seoTitle = `${tvShow.title} (${capitalizedCat} Show) - Cast, Seasons & Reviews | EntertainIndia`;
    const seoDesc = tvShow.description?.substring(0, 160) || `Watch ${tvShow.title} online. Get the latest details on seasons, cast, crew and expert reviews on EntertainIndia.`;

    return {
      title: seoTitle,
      description: seoDesc,
      alternates: {
        canonical: `https://entertainindia.in/${category}/tv-shows/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
      },
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        url: `https://entertainindia.in/${category}/tv-shows/${slug}`,
        siteName: 'EntertainIndia',
        images: [
          {
            url: tvShow.poster?.url || '/default-tv-og.jpg',
            width: 1200,
            height: 630,
            alt: tvShow.title,
          },
        ],
        type: 'video.tv_show',
      },
      twitter: {
        card: 'summary_large_image',
        title: seoTitle,
        description: seoDesc,
        images: [tvShow.poster?.url || '/default-tv-og.jpg'],
      },
    };
  } catch (error) {
    return { title: 'TV Show Details | EntertainIndia' };
  }
}

export default async function TvShowDetailPage({ params }) {
  const { slug, category } = await params;

  try {
    // ✅ Only fetch main data via getBySlug
    const mainData = await tvShowsAPI.getBySlug(slug);

    if (!mainData) {
      notFound();
    }

    // Prepare initial data for client – missing fields become empty arrays
   // Inside TvShowDetailPage, replace the initialData object:
const initialData = {
  show: mainData,
  crew: mainData.crew || [],
  cast: mainData.cast || [],
  articles: mainData.realted_articles || [],   // also use existing articles if needed
  similar: mainData.similar_tv_shows || [],    // ✅ FIX: use API data
  seasons: mainData.shows_seasons || [],
  awards: mainData.tv_show_awards || [],
  reviews: mainData.shows_reviews || [],
};
    const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : "TV Shows";

    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://entertainindia.in" },
        { "@type": "ListItem", "position": 2, "name": categoryName, "item": `https://entertainindia.in/${category}` },
        { "@type": "ListItem", "position": 3, "name": "TV Shows", "item": `https://entertainindia.in/${category}/tv-shows` },
        { "@type": "ListItem", "position": 4, "name": mainData.title, "item": `https://entertainindia.in/${category}/tv-shows/${slug}` }
      ]
    };

    const tvSeriesLd = {
      "@context": "https://schema.org",
      "@type": "TVSeries",
      "name": mainData.title,
      "description": mainData.description?.substring(0, 160) || `Watch ${mainData.title} online. Details about cast, crew, and seasons.`,
      "image": mainData.poster?.url || "https://entertainindia.in/default-tv.jpg",
      "genre": mainData.genres?.map(g => g.name) || ["Entertainment"],
      "startDate": mainData.releaseDate || mainData.createdAt,
      "actor": (mainData.cast || []).slice(0, 5).map(person => ({
        "@type": "PerformanceRole",
        "actor": {
          "@type": "Person",
          "name": person.name || person.castName
        }
      })),
      "author": (mainData.crew || []).slice(0, 2).map(person => ({
        "@type": "Person",
        "name": person.name || person.crewName
      })),
      "numberOfSeasons": mainData.shows_seasons?.length || 1,
      "aggregateRating": mainData.shows_reviews?.length > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": mainData.rating || "4.5",
        "reviewCount": mainData.shows_reviews.length
      } : undefined
    };

    return (
      <LayoutWrapper>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, tvSeriesLd]) }}
        />
        <TvShowDetailClient initialData={initialData} slug={slug} serverCategory={category} />
      </LayoutWrapper>
    );

  } catch (error) {
    console.error('Error in TvShowDetailPage:', error);
    notFound();
  }
}