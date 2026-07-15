import CategoryPage from '../../page-components/CategoryPage';
import {  categoryAPIServer } from '../../lib/api-server';
import { articlesAPI } from '../../lib/api/articles';
import { moviesAPI } from '../../lib/api/movies';
import LayoutWrapper from '../LayoutWrapper';

const SITE_URL = 'https://entertainindia.in';
const CATEGORY = 'bhojiwood';

// ✅ Common article params — generateMetadata aur page component dono same params use karenge
function getArticleParams(page = 1) {
  return {
    category: CATEGORY,
    page,
    pageSize: 6,
    mainCategory: "article",
    sort: "createdAt:desc",
  };
}

// BHOJIWOOD Ke Liye Perfect Schema Generator
function generateBhojiwoodSchema(categoryData, movies = [], articles = [], categorySlug) {
  const domain = SITE_URL;
  const categoryUrl = `${domain}/bhojiwood`;

  const graph = [];

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

  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "description": "Entertainment news in Hindi - Bhojiwood, Bollywood, Bhojpuri Cinema updates",
    "inLanguage": "hi-IN",
    "publisher": { "@id": `${domain}/#organization` },
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${domain}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  });

  graph.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${categoryUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": domain },
      { "@type": "ListItem", "position": 2, "name": "Bhojiwood", "item": categoryUrl }
    ]
  });

  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection-page`,
    "name": "भोजीवुड न्यूज़: भोजपुरी फिल्मों की ताज़ा खबरें और गॉसिप",
    "description": "भोजपुरी सिनेमा (भोजीवुड) की ताज़ा खबरें, नई फिल्मों के रिव्यूज, बॉक्स ऑफिस कलेक्शन और अपने पसंदीदा भोजपुरी सितारों की गॉसिप यहाँ पढ़ें।",
    "url": categoryUrl,
    "inLanguage": "hi-IN",
    "isPartOf": { "@type": "WebSite", "@id": `${domain}/#website` }
  });

  if (movies && movies.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#movies-list`,
      "name": "टॉप भोजपुरी फिल्में",
      "description": "भोजीवुड की सबसे लोकप्रिय भोजपुरी फिल्मों की सूची",
      "numberOfItems": movies.length,
      "itemListElement": movies.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Movie",
          "name": item.title,
          "url": `${domain}/bhojiwood/movies/${item.slug}`,
          "image": item.poster?.url || null,
          "datePublished": item.releaseDate || null
        }
      }))
    });
  }

  if (articles && articles.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#articles-list`,
      "name": "नवीनतम भोजीवुड समाचार",
      "description": "भोजपुरी सिनेमा से जुड़ी ताज़ा खबरें, अपडेट्स और गपशप",
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
            "name": article.Authors?.name || "EntertainIndia Team",
            "url": article.Authors?.name
              ? `${SITE_URL}/author/${article.Authors.name?.toLowerCase().replace(/\s+/g, '-')}`
              : `${SITE_URL}/about`
          },
          "publisher": {
            "@type": "Organization",
            "name": "EntertainIndia",
            "logo": { "@type": "ImageObject", "url": `${domain}/og-logo.png` }
          }
        }
      }))
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

export async function generateMetadata() {
  const siteUrl = SITE_URL;
  const categoryUrl = `${siteUrl}/bhojiwood`;

  try {
    const [catData, artData] = await Promise.all([
      categoryAPIServer.getBySlug(CATEGORY),
      // ✅ FIX: getAllLight use kiya, same params jo page component use karega
      articlesAPI.getAllLight(getArticleParams(1)),
    ]);

    const seo = catData?.seo;
    const topArticle = artData?.articles?.[0];

    const title = seo?.title || 'भोजीवुड न्यूज़: भोजपुरी फिल्मों की ताज़ा खबरें और गॉसिप';
    const description = seo?.description || 'भोजपुरी सिनेमा (भोजीवुड) की ताज़ा खबरें, नई फिल्मों के रिव्यूज, बॉक्स ऑफिस कलेक्शन और अपने पसंदीदा भोजपुरी सितारों की गॉसिप यहाँ पढ़ें।';
    const ogImage = topArticle?.heroImage?.url || `${siteUrl}/og-default-bhojiwood.jpg`;

    return {
      title,
      description,
      alternates: { canonical: categoryUrl },
      keywords: seo?.keywords || ['भोजीवुड न्यूज', 'भोजपुरी फिल्में', 'bhojpuri movies', 'bhojiwood updates'],
      robots: {
        index: true,
        follow: true,
        googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
      },
      openGraph: {
        title,
        description,
        url: categoryUrl,
        siteName: 'EntertainIndia',
        images: [{ url: ogImage, width: 1200, height: 630 }],
        locale: 'hi_IN',
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [ogImage],
      },
    };
  } catch (error) {
    return {
      title: 'भोजीवुड न्यूज़: भोजपुरी फिल्मों की ताज़ा खबरें | EntertainIndia.in',
      description: 'भोजपुरी सिनेमा की ताजा खबरें, मूवी रिव्यूज और लेटेस्ट अपडेट्स।'
    };
  }
}

export default async function BhojiwoodPage({ searchParams }) {
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;

  const [categoryData, articleData, movieData] = await Promise.all([
    categoryAPIServer.getBySlug(CATEGORY),
    // ✅ FIX: getAllLight use kiya
    articlesAPI.getAllLight(getArticleParams(page)),
    moviesAPI.getAllLight({ category: CATEGORY, pageSize: 20, sort: "releaseDate:desc" }),
  ]);

  const schemaData = generateBhojiwoodSchema(
    categoryData,
    movieData?.movies || [],
    articleData?.articles || [],
    CATEGORY
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />

      <h1 className="sr-only">
        {categoryData?.seo?.h1 || "भोजीवुड लेटेस्ट न्यूज़, भोजपुरी फिल्में और गॉसिप"}
      </h1>

      <LayoutWrapper>
        <CategoryPage
          category={CATEGORY}
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