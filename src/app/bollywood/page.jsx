import CategoryPage from '../../page-components/CategoryPage';
import { categoryAPIServer } from '../../lib/api-server'; 
import { articlesAPI, moviesAPI } from '../../lib/api';
import LayoutWrapper from '../LayoutWrapper';

const SITE_URL = 'https://entertainindia.in';

// ✅ BOLlywood Ke Liye Perfect Schema Generator
function generateBollywoodSchema(categoryData, movies = [], articles = [], categorySlug) {
  const domain = SITE_URL;
  const categoryUrl = `${domain}/bollywood`;
  
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
    "description": "Entertainment news in Hindi - Bollywood, Hollywood, TV, OTT updates",
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

  // 3️⃣ Breadcrumb Schema
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
        "name": "Bollywood",
        "item": categoryUrl
      }
    ]
  });

  // 4️⃣ Collection Page Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection-page`,
    "name": "बॉलीवुड समाचार: हिंदी फिल्में, गॉसिप और रिव्यूज | EntertainIndia",
    "description": "बॉलीवुड फिल्मों की ताजा खबरें, मूवी रिव्यूज, बॉक्स ऑफिस कलेक्शन और अपने पसंदीदा सितारों की गॉसिप पढ़ें।",
    "url": categoryUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    }
  });

  // 5️⃣ Movies List Schema (अगर मूवीज हैं तो)
  if (movies && movies.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#movies-list`,
      "name": "टॉप बॉलीवुड फिल्में",
      "description": "बॉलीवुड की सबसे लोकप्रिय फिल्मों की सूची",
      "numberOfItems": movies.length,
      "itemListElement": movies.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Movie",
          "name": item.title,
          "url": `${domain}/bollywood/movies/${item.slug}`,
          "image": item.poster?.url || item.backdrop?.url,
          "datePublished": item.releaseDate
        }
      }))
    });
  }

  // 6️⃣ Articles List Schema (अगर आर्टिकल्स हैं तो)
  if (articles && articles.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#articles-list`,
      "name": "नवीनतम बॉलीवुड समाचार",
      "description": "बॉलीवुड से जुड़ी ताज़ा खबरें, अपडेट्स और गपशप",
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
            "name": article.author?.name || "EntertainIndia Team"
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

export async function generateMetadata() {
  const siteUrl = SITE_URL;
  const categoryUrl = `${siteUrl}/bollywood`;
  
  try {
    const [catData, artData] = await Promise.all([
      categoryAPIServer.getBySlug('bollywood'),
      articlesAPI.getAll({ category: 'bollywood', pageSize: 1, sort: 'createdAt:desc' })
    ]);
    
    const topArticle = artData?.articles?.[0];
    const ogImage = topArticle?.heroImage?.url || `${siteUrl}/og-default-bollywood.jpg`;

    return {
      title: "बॉलीवुड समाचार: हिंदी फिल्में, गॉसिप और रिव्यूज | EntertainIndia",
      description: "बॉलीवुड फिल्मों की ताजा खबरें, मूवी रिव्यूज, बॉक्स ऑफिस कलेक्शन और अपने पसंदीदा सितारों की गॉसिप पढ़ें।",
      alternates: { canonical: categoryUrl },
      keywords: ['बॉलीवुड समाचार', 'हिंदी फिल्में', 'bollywood news', 'hindi movies'],
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
        title: "बॉलीवुड समाचार: हिंदी फिल्में, गॉसिप और रिव्यूज | EntertainIndia",
        description: "बॉलीवुड फिल्मों की ताजा खबरें, मूवी रिव्यूज, बॉक्स ऑफिस कलेक्शन और अपने पसंदीदा सितारों की गॉसिप पढ़ें।",
        url: categoryUrl,
        siteName: 'EntertainIndia',
        images: [{ url: ogImage, width: 1200, height: 630 }],
        locale: 'hi_IN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: "बॉलीवुड समाचार",
        description: "बॉलीवुड फिल्मों की ताजा खबरें",
        images: [ogImage],
      },
    };
  } catch (error) {
    return { 
      title: 'बॉलीवुड समाचार | EntertainIndia',
      description: 'बॉलीवुड सिनेमा की ताजा खबरें, मूवी रिव्यूज और लेटेस्ट अपडेट्स।'
    };
  }
}

export default async function BollywoodPage({ searchParams }) {
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;
  const category = "bollywood";

  const [categoryData, articleData, movieData] = await Promise.all([
    categoryAPIServer.getBySlug(category),
    articlesAPI.getAll({ category, page, pageSize: 6, mainCategory: "article", sort: "createdAt:desc" }),
    moviesAPI.getAll({ category, pageSize: 20, sort: "releaseDate:desc" })
  ]);

  // ✅ Perfect schema generate karo
  const schemaData = generateBollywoodSchema(
    categoryData, 
    movieData?.movies || [],    
    articleData?.articles || [], 
    category                    
  );

  return (
    <>
      <h1 className="sr-only">
        {categoryData?.seo?.h1 || "बॉलीवुड समाचार और लेटेस्ट हिंदी फिल्में"}
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