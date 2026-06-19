// app/[category]/movies/page.js (Your current file with fixes)

import MoviesPage from '../../../page-components/MoviesPage';
import LayoutWrapper from '../../LayoutWrapper';
import { moviesAPI, genresAPI } from '../../../lib/api';

const SITE_URL = "https://entertainindia.in";
const VALID_CATEGORIES = ['bollywood', 'hollywood', 'bhojiwood', 'tollywood', 'korean'];

// ✅ Dynamic SEO Metadata
export async function generateMetadata({ params }) {
  const { category } = await params;
  
  // ✅ FIX: Check if category is valid
  if (!VALID_CATEGORIES.includes(category)) {
    return {
      title: 'Page Not Found',
      robots: { index: false }
    };
  }
  
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  const pageUrl = `${SITE_URL}/${category}/movies`;
  
  let seoTitle = `नवीनतम ${capitalized} मूवीज 2026 - रिव्यू और बॉक्स ऑफिस | EntertainIndia`;
  let seoDescription = `एक्सप्लोर करें नवीनतम ${capitalized} मूवीज डायरेक्टरी। रिलीज़ डेट, रेटिंग, रिव्यू और सभी ${category} फिल्मों के एक्सक्लूसिव अपडेट पाएं।`;

  return {
    title: seoTitle,
    description: seoDescription,
    alternates: { canonical: pageUrl },
    robots: { index: true, follow: true },
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      url: pageUrl,
      siteName: 'EntertainIndia',
      images: [{ url: `/og-image-${category}.jpg`, width: 1200, height: 630 }],
      locale: 'hi_IN',
      type: 'website',
    },
  };
}

// ✅ Main Component
export default async function MoviePage({ params }) {
  const { category } = await params;
  
  // ✅ FIX: Check if category is valid
  if (!VALID_CATEGORIES.includes(category)) {
    return notFound();
  }
  
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);
  const domain = SITE_URL;

  try {
    const apiParams = {
      pageSize: 50,
      sort: "createdAt:desc",  // ✅ Fixed: publishedAt -> createdAt
    };
    
    if (category && category !== 'all') {
      apiParams.category = category;
    }
    
    const [moviesRes, genresRes] = await Promise.all([
      moviesAPI.getAll(apiParams),
      genresAPI.getAll()
    ]);

    const initialMovies = moviesRes?.movies || [];
    const initialGenres = [...new Set(genresRes.map(i => i.name).filter(Boolean))];
    
    // ✅ FIX: Filter out movies with invalid category
    const validMovies = initialMovies.filter(movie => {
      const movieCategory = movie.category?.slug || '';
      return movieCategory !== 'movies';  // Exclude movies with category "movies"
    });
    
    // ✅ Schema with correct URLs
    const itemListElement = validMovies.slice(0, 10).map((movie, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Movie",
        "name": movie.title,
        "url": `${domain}/${category}/movies/${movie.slug}`,  // ✅ Correct URL
        "image": movie.poster?.url || movie.backdrop?.url || '',
        "datePublished": movie.releaseDate,
      }
    }));

    const jsonLd = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Organization",
          "@id": `${domain}/#organization`,
          "name": "EntertainIndia",
          "url": domain,
          "logo": `${domain}/logo.png`
        },
        {
          "@type": "WebSite",
          "@id": `${domain}/#website`,
          "url": domain,
          "name": "EntertainIndia",
          "publisher": { "@id": `${domain}/#organization` }
        },
        {
          "@type": "BreadcrumbList",
          "itemListElement": [
            { "@type": "ListItem", "position": 1, "name": "Home", "item": domain },
            { "@type": "ListItem", "position": 2, "name": capitalized, "item": `${domain}/${category}` },
            { "@type": "ListItem", "position": 3, "name": "Movies", "item": `${domain}/${category}/movies` }
          ]
        },
        {
          "@type": "CollectionPage",
          "@id": `${domain}/${category}/movies#collection-page`,
          "url": `${domain}/${category}/movies`,
          "isPartOf": { "@id": `${domain}/#website` }
        },
        {
          "@type": "ItemList",
          "name": `टॉप ${capitalized} मूवीज`,
          "numberOfItems": validMovies.length,
          "itemListElement": itemListElement
        }
      ]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <LayoutWrapper>
          <h1 className="sr-only">{category.toUpperCase()} मूवीज कलेक्शन</h1>
          <MoviesPage 
            serverCategory={category} 
            initialMovies={validMovies}
            initialGenres={initialGenres}
          />
        </LayoutWrapper>
      </>
    );
  } catch (error) {
    console.error("❌ सर्वर फेचिंग एरर:", error);
    return (
      <LayoutWrapper>
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ मूवीज लोड नहीं हो पाईं</h2>
          <p className="text-gray-600">कृपया कुछ समय बाद पुनः प्रयास करें।</p>
        </div>
      </LayoutWrapper>
    );
  }
}