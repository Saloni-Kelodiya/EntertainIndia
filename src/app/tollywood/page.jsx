import CategoryPage from '../../page-components/CategoryPage';
import { categoryAPIServer } from '../../lib/api-server';
import { articlesAPI, moviesAPI } from '../../lib/api';
import LayoutWrapper from '../LayoutWrapper';

const SITE_URL = 'https://entertainindia.in';

// ✅ TOLLYWOOD Page Ke Liye Perfect Schema Generator
function generateTollywoodSchema(categoryData, movies = [], articles = [], categorySlug) {
  const domain = SITE_URL;
  const categoryUrl = `${domain}/tollywood`;
  
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
    "description": "Entertainment news in Hindi - Tollywood, Telugu Movies, South Cinema updates",
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

  // 3️⃣ Breadcrumb Schema (Tollywood ke liye)
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
        "name": "Tollywood",
        "item": categoryUrl
      }
    ]
  });

  // 4️⃣ Collection Page Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection-page`,
    "name": "टॉलीवुड समाचार: तेलुगु फिल्में, गॉसिप और रिव्यूज | EntertainIndia",
    "description": "टॉलीवुड सिनेमा की ताजा खबरें, तेलुगु मूवी रिव्यूज, बॉक्स ऑफिस कलेक्शन और अपने पसंदीदा साउथ सितारों की गॉसिप हिंदी में पढ़ें।",
    "url": categoryUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    }
  });

  // 5️⃣ Movies List Schema (Tollywood/Telugu Movies)
  if (movies && movies.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#movies-list`,
      "name": "टॉप टॉलीवुड फिल्में",
      "description": "तेलुगु सिनेमा की सबसे लोकप्रिय फिल्मों की सूची",
      "numberOfItems": movies.length,
      "itemListElement": movies.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Movie",
          "name": item.title,
          "url": `${domain}/tollywood/movies/${item.slug}`,
          "image": item.poster?.url || item.backdrop?.url,
          "datePublished": item.releaseDate || item.createdAt
        }
      }))
    });
  }

  // 6️⃣ Articles List Schema (Tollywood News)
  if (articles && articles.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#articles-list`,
      "name": "नवीनतम टॉलीवुड समाचार",
      "description": "टॉलीवुड और तेलुगु सिनेमा से जुड़ी ताज़ा खबरें, अपडेट्स और गॉसिप",
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

// ✅ FIX 1: Separate viewport export (ADD THIS)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: true,
};

// ✅ FIX 2: Remove viewport from generateMetadata
export async function generateMetadata() {
  const siteUrl = SITE_URL;
  const categoryUrl = `${siteUrl}/tollywood`;
  const category = 'tollywood';
  
  try {
    const [, artData] = await Promise.all([
      categoryAPIServer.getBySlug(category),
      articlesAPI.getAll({ category, pageSize: 1, sort: 'createdAt:desc' })
    ]);
    
    const topArticle = artData?.articles?.[0];

    const title = 'टॉलीवुड समाचार: तेलुगु फिल्में, गॉसिप और रिव्यूज | EntertainIndia';
    const description = 'टॉलीवुड सिनेमा की ताजा खबरें, तेलुगु मूवी रिव्यूज, बॉक्स ऑफिस कलेक्शन और अपने पसंदीदा साउथ सितारों की गॉसिप हिंदी में पढ़ें।';
    const ogImage = topArticle?.heroImage?.url || `${siteUrl}/og-default-tollywood.jpg`;

    return {
      title,
      description,
      alternates: { 
        canonical: categoryUrl 
      },
      keywords: ['टॉलीवुड समाचार', 'तेलुगु फिल्में', 'tollywood news', 'telugu movies hindi'],
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
      title: 'टॉलीवुड समाचार और तेलुगु फिल्में | EntertainIndia',
      description: 'टॉलीवुड सिनेमा की ताजा खबरें, मूवी रिव्यूज और लेटेस्ट अपडेट्स हिंदी में।'
    };
  }
}

export default async function TollywoodPage({ searchParams }) {
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;
  const category = "tollywood";

  const [categoryData, articleData, movieData] = await Promise.all([
    categoryAPIServer.getBySlug(category),
    articlesAPI.getAll({ category, page, pageSize: 6, mainCategory: "article", sort: "createdAt:desc" }),
    moviesAPI.getAll({ category, pageSize: 20, sort: "releaseDate:desc" })
  ]);

  // ✅ Use Tollywood specific schema
  const schemaData = generateTollywoodSchema(
    categoryData, 
    movieData?.movies || [],    
    articleData?.articles || [], 
    category                    
  );

  return (
    <>
      <h1 className="sr-only">
        टॉलीवुड समाचार, लेटेस्ट तेलुगु फिल्में और गॉसिप
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