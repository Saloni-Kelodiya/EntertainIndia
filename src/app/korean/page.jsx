import CategoryPage from '../../page-components/CategoryPage';
import LayoutWrapper from '../LayoutWrapper';
import { categoryAPIServer } from '../../lib/api-server';
import { articlesAPI, moviesAPI } from "../../lib/api";

const SITE_URL = 'https://entertainindia.in';

// ✅ KOREAN Page Ke Liye Perfect Schema Generator
function generateKoreanSchema(categoryData, movies = [], articles = [], categorySlug) {
  const domain = SITE_URL;
  const categoryUrl = `${domain}/korean`;
  
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
    "description": "Entertainment news in Hindi - Korean, K-Drama, K-Pop, Bollywood, Hollywood updates",
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

  // 3️⃣ Breadcrumb Schema (Korean ke liye)
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
        "name": "Korean",
        "item": categoryUrl
      }
    ]
  });

  // 4️⃣ Collection Page Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection-page`,
    "name": "कोरियाई समाचार: के-पॉप, के-ड्रामा | EntertainIndia",
    "description": "कोरियाई सिनेमा की ताजा खबरें, के-पॉप (K-Pop) स्टार्स, कोरियन ड्रामा (K-Drama) अपडेट्स और मशहूर हस्तियों की गॉसिप हिंदी में पढ़ें।",
    "url": categoryUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    }
  });

  // 5️⃣ Korean Movies/Shows List Schema
  if (movies && movies.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#movies-list`,
      "name": "टॉप कोरियन ड्रामा और फिल्में",
      "description": "कोरियन सिनेमा और के-ड्रामा की सबसे लोकप्रिय सूची",
      "numberOfItems": movies.length,
      "itemListElement": movies.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": item.type === "TVSeries" ? "TVSeries" : "Movie",
          "name": item.title,
          "url": `${domain}/korean/movies/${item.slug}`,
          "image": item.poster?.url || item.backdrop?.url,
          "datePublished": item.releaseDate || item.createdAt,
          "countryOfOrigin": "South Korea"
        }
      }))
    });
  }

  // 6️⃣ Articles List Schema (Korean News)
  if (articles && articles.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#articles-list`,
      "name": "नवीनतम कोरियाई समाचार",
      "description": "कोरियाई एंटरटेनमेंट, के-पॉप, के-ड्रामा से जुड़ी ताज़ा खबरें हिंदी में",
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
            "name": article.author?.name || article.Authors?.name || "EntertainIndia Team"
          },
          "publisher": {
            "@type": "Organization",
            "name": "EntertainIndia",
            "logo": {
              "@type": "ImageObject",
              "url": `${domain}/logo.png`
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

// ✅ FIX 1: Separate viewport export
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

// ✅ FIX 2: Remove viewport from metadata
export async function generateMetadata() {
  const siteUrl = SITE_URL;
  const categoryUrl = `${siteUrl}/korean`;
  const category = 'korean';

  try {
    const [, artData] = await Promise.all([
      categoryAPIServer.getBySlug(category),
      articlesAPI.getAll({ category, pageSize: 1, sort: 'createdAt:desc' })
    ]);

    const topArticle = artData?.articles?.[0];

    const title = 'कोरियाई समाचार: के-पॉप, के-ड्रामा | EntertainIndia';
    const description = 'कोरियाई सिनेमा की ताजा खबरें, के-पॉप (K-Pop) स्टार्स, कोरियन ड्रामा (K-Drama) अपडेट्स और मशहूर हस्तियों की गॉसिप हिंदी में पढ़ें।';
    const ogImage = topArticle?.heroImage?.url || `${siteUrl}/og-default-korean.jpg`;

    return {
      title,
      description,
      alternates: { 
        canonical: categoryUrl 
      },
      keywords: ['कोरियाई समाचार', 'कोरियन ड्रामा हिंदी', 'korean news in hindi', 'k-pop hindi', 'k-drama updates'],
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
        title,
        description,
        url: categoryUrl,
        siteName: 'EntertainIndia',
        images: [
          { 
            url: ogImage,
            width: 1200,
            height: 630,
            alt: title
          }
        ],
        locale: 'hi_IN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
      // ❌ REMOVE viewport from here
      // viewport: 'width=device-width, initial-scale=1',
    };
  } catch (error) {
    return { 
      title: 'कोरियाई समाचार और के-ड्रामा अपडेट्स | EntertainIndia',
      description: 'कोरियाई एंटरटेनमेंट, फिल्मों और के-पॉप की ताजा खबरें हिंदी में।'
    };
  }
}

export default async function KoreanPage({ searchParams }) {
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;
  const category = "korean";

  const [categoryData, articleData, movieData] = await Promise.all([
    categoryAPIServer.getBySlug(category),
    articlesAPI.getAll({ category, page, pageSize: 6, mainCategory: "article", sort: "createdAt:desc" }),
    moviesAPI.getAll({ category, pageSize: 20, sort: "releaseDate:desc" })
  ]);

  // ✅ Use Korean specific schema, NOT generateCategorySchema
  const schemaData = generateKoreanSchema(
    categoryData, 
    movieData?.movies || [],    
    articleData?.articles || [], 
    category                    
  );

  return (
    <>
      <h1 className="sr-only">
        कोरियाई समाचार, लेटेस्ट के-पॉप और कोरियन ड्रामा अपडेट्स
      </h1>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <LayoutWrapper>
        <CategoryPage
          category={category}
          categoryData={categoryData} 
          initialArticles={articleData?.articles || []}
          initialMovies={movieData?.movies || []}
          initialPagination={articleData?.pagination || {}}
          initialPage={page}
        />
      </LayoutWrapper>
    </>
  );
}