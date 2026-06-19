import MoviePage from '../../page-components/AllMovies';
import LayoutWrapper from '../LayoutWrapper';
import { moviesAPI } from '../../lib/api';

const SITE_URL    = "https://entertainindia.in";
const ORG_NAME    = "EntertainIndia";
const ORG_NAME_HI = "एंटरटेनइंडिया";
const PAGE_URL    = `${SITE_URL}/movies`;

export const revalidate = 3600;

// ─────────────────────────────────────────────────────────────
// SEO METADATA (हिंदी में)
// ─────────────────────────────────────────────────────────────

export const metadata = {
  title: 'सभी मूवीज़ देखें - बॉलीवुड, हॉलीवुड, साउथ की लेटेस्ट फिल्में | EntertainIndia',
  description: 'बॉलीवुड, हॉलीवुड, भोजपुरी, तेलुगु और कोरियन फिल्मों का पूरा कलेक्शन हिंदी में। कास्ट, रिव्यू, बॉक्स ऑफिस और रिलीज़ डेट देखें।',
  keywords: 'मूवीज़, बॉलीवुड फिल्में, हॉलीवुड फिल्में, साउथ की फिल्में, latest movies, movie collection, फिल्म रिव्यू',
  alternates: {
    canonical: PAGE_URL,
    languages: { 'hi-IN': PAGE_URL },
  },
  robots: {
    index: true,
    follow: true,
    'max-image-preview': 'large',
    'max-snippet': -1,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
    },
  },
  openGraph: {
    type: 'website',
    url: PAGE_URL,
    siteName: ORG_NAME,
    locale: 'hi_IN',
    title: 'सभी मूवीज़ देखें - बॉलीवुड, हॉलीवुड, साउथ की फिल्में | EntertainIndia',
    description: 'बॉलीवुड, हॉलीवुड, भोजपुरी, तेलुगु और कोरियन फिल्मों का पूरा कलेक्शन हिंदी में पढ़ें।',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@entertainindia',
    title: 'सभी मूवीज़ देखें | EntertainIndia',
    description: 'बॉलीवुड, हॉलीवुड और साउथ की फिल्मों का पूरा कलेक्शन हिंदी में।',
  },
};

// ─────────────────────────────────────────────────────────────
// SCHEMA GENERATOR (CollectionPage + ItemList — listing pages ke liye)
// ─────────────────────────────────────────────────────────────

function cleanText(text, maxLen) {
  if (!text) return '';
  const clean = String(text).replace(/\s+/g, ' ').trim();
  return clean.length > maxLen ? clean.slice(0, maxLen - 3) + '...' : clean;
}

function generateMoviesListSchema(movies) {
  // 1️⃣ संगठन
  const organization = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    "name": ORG_NAME,
    "alternateName": ORG_NAME_HI,
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "@id": `${SITE_URL}/#logo`,
      "url": `${SITE_URL}/logo.png`,
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://x.com/EIndia99460",
      "https://www.instagram.com/entertainindiaofficial",
    ],
  };

  // 2️⃣ वेबसाइट
  const website = {
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "url": SITE_URL,
    "name": ORG_NAME,
    "alternateName": ORG_NAME_HI,
    "inLanguage": "hi-IN",
    "publisher": { "@id": `${SITE_URL}/#organization` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  // 3️⃣ ब्रेडक्रंब
  const breadcrumb = {
    "@type": "BreadcrumbList",
    "@id": `${PAGE_URL}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "होम",    "item": SITE_URL },
      { "@type": "ListItem", "position": 2, "name": "मूवीज़", "item": PAGE_URL },
    ],
  };

  // 4️⃣ ItemList — हर मूवी एक ListItem के रूप में (Google इसे carousel जैसे दिखा सकता है)
  const itemList = {
    "@type": "ItemList",
    "@id": `${PAGE_URL}#itemlist`,
    "name": "सभी मूवीज़ की लिस्ट",
    "numberOfItems": movies.length,
    "itemListElement": movies.slice(0, 100).map((movie, index) => {
      const category = movie.category?.slug || 'bollywood';
      const movieUrl = `${SITE_URL}/${category}/movies/${movie.slug}`;
      const year = movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : undefined);

      return {
        "@type": "ListItem",
        "position": index + 1,
        "url": movieUrl,
        "item": {
          "@type": "Movie",
          "name": movie.title,
          "url": movieUrl,
          ...(movie.poster?.url && { "image": movie.poster.url }),
          ...(movie.releaseDate && { "datePublished": movie.releaseDate }),
          ...(year && { "dateCreated": String(year) }),
          ...(movie.genres?.length && {
            "genre": movie.genres.map(g => g.name).filter(Boolean),
          }),
          ...(movie.rating && parseFloat(movie.rating) > 0 && {
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": parseFloat(movie.rating).toFixed(1),
              "bestRating": "10",
              "ratingCount": movie.totalVotes > 0 ? movie.totalVotes : 1,
            },
          }),
        },
      };
    }),
  };

  // 5️⃣ कलेक्शन पेज
  const collectionPage = {
    "@type": "CollectionPage",
    "@id": `${PAGE_URL}#webpage`,
    "url": PAGE_URL,
    "name": "सभी मूवीज़ - बॉलीवुड, हॉलीवुड, साउथ की फिल्में",
    "description": "बॉलीवुड, हॉलीवुड, भोजपुरी, तेलुगु और कोरियन फिल्मों का पूरा कलेक्शन हिंदी में।",
    "inLanguage": "hi-IN",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "breadcrumb": { "@id": `${PAGE_URL}#breadcrumb` },
    "mainEntity": { "@id": `${PAGE_URL}#itemlist` },
    "publisher": { "@id": `${SITE_URL}/#organization` },
  };

  return {
    "@context": "https://schema.org",
    "@graph": [organization, website, breadcrumb, itemList, collectionPage],
  };
}

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT
// ─────────────────────────────────────────────────────────────

export default async function MoviesRoutePage() {
  let initialMovies = [];

  try {
    // ✅ SERVER SIDE FETCHING: Saari mixed movies ek saath fetch ho rahi hain
    const response = await moviesAPI.getAll({
      pageSize: 100,
      sort: "publishedAt:desc",
    });

    initialMovies = response.movies || response.data || [];
  } catch (error) {
    console.error("❌ Server Fetching Error:", error);
  }

  const schema = generateMoviesListSchema(initialMovies);

  return (
    <>
      {/* Structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      {/* SEO ke लिए छुपा हुआ H1 — अगर MoviePage component में पहले से H1 नहीं है */}
      <h1 className="sr-only">
        सभी मूवीज़ - बॉलीवुड, हॉलीवुड और साउथ की लेटेस्ट फिल्में
      </h1>

      <LayoutWrapper>
        <MoviePage
          initialMovies={initialMovies}
        />
      </LayoutWrapper>
    </>
  );
}