import LayoutWrapper from "../../LayoutWrapper";
import { tvShowsAPI, GenresAPI } from "../../../lib/api";
import TVShowsPage from "../../../page-components/TvshowsPage";

const SITE_URL = "https://entertainindia.in";

// ✅ TV SHOWS LISTING - PERFECT SCHEMA FOR GOOGLE INDEXING
function generateTVShowsListingSchema(tvShows) {
  const domain = SITE_URL;
  const listingUrl = `${domain}/tv/shows`;
  
  const graph = [];

  // 1️⃣ ORGANIZATION
  graph.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domain}/#organization`,
    "name": "EntertainIndia",
    "url": domain,
    "logo": `${domain}/logo.png`,
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://x.com/EIndia99460"
    ]
  });

  // 2️⃣ WEBSITE
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "inLanguage": "hi-IN",
    "publisher": { "@id": `${domain}/#organization` }
  });

  // 3️⃣ BREADCRUMB
  graph.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${listingUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": domain },
      { "@type": "ListItem", "position": 2, "name": "TV", "item": `${domain}/tv` },
      { "@type": "ListItem", "position": 3, "name": "TV Shows", "item": listingUrl }
    ]
  });

  // 4️⃣ COLLECTION PAGE
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${listingUrl}#collection-page`,
    "url": listingUrl,
    "inLanguage": "hi-IN",
    "isPartOf": { "@id": `${domain}/#website` }
  });

  // 5️⃣ ITEM LIST - TV SHOWS
  if (tvShows && tvShows.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${listingUrl}#item-list`,
      "numberOfItems": tvShows.length,
      "itemListElement": tvShows.slice(0, 30).map((show, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "TVSeries",
          "name": show.title,
          "url": `${domain}/tv/shows/${show.slug}`,
          "image": show.poster?.url || ""
        }
      }))
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

// ✅ SEO METADATA - BACKEND SE REAL DATA
export async function generateMetadata() {
  try {
    const tvShowsData = await tvShowsAPI.getAll({ pageSize: 1 });
    const latestShow = tvShowsData?.data?.[0];
    
    // Agar backend se kuch mile toh use karo, nahi toh basic
    const title = latestShow?.seoTitle || "TV Shows | EntertainIndia";
    const description = latestShow?.seoDescription || "Watch latest TV shows, serials, reality shows updates in Hindi";

    return {
      title: title,
      description: description,
      alternates: { canonical: `${SITE_URL}/tv/shows` },
      robots: { index: true, follow: true },
      openGraph: {
        title: title,
        description: description,
        url: `${SITE_URL}/tv/shows`,
        siteName: 'EntertainIndia',
        locale: 'hi_IN',
        type: 'website',
      }
    };
  } catch (error) {
    return {
      title: "TV Shows | EntertainIndia",
      description: "Latest TV serials, reality shows updates in Hindi",
      robots: { index: true, follow: true }
    };
  }
}

// ✅ MAIN COMPONENT
export default async function TVShowsListing() {
  const category = "tv";

  try {
    const [showsRes, genresRes] = await Promise.all([
      tvShowsAPI.getAll({ pageSize: 50, category: category, sort: "createdAt:desc" }),
      GenresAPI.getAll()
    ]);

    const initialShows = showsRes?.data || [];
    const initialGenres = genresRes ? [...new Set(genresRes.map(i => i.name).filter(Boolean))] : [];

    const schemaData = generateTVShowsListingSchema(initialShows);

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
        <LayoutWrapper>
          <TVShowsPage
            serverCategory={category}
            initialShows={initialShows}
            initialGenres={initialGenres}
          />
        </LayoutWrapper>
      </>
    );
  } catch (error) {
    console.error("TV Shows Page Error:", error);
    return (
      <LayoutWrapper>
        <div className="p-20 text-center">
          <p>Failed to load TV shows. Please try again.</p>
        </div>
      </LayoutWrapper>
    );
  }
}