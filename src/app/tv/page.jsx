import CategoryPage from '../../page-components/CategoryPage';
import LayoutWrapper from '../LayoutWrapper';
import { categoryAPIServer } from '../../lib/api-server';
import { articlesAPI} from '../../lib/api/articles';
import { tvShowsAPI } from '../../lib/api/tv-shows';

const SITE_URL = 'https://entertainindia.in';

//  टीवी पेज - परफेक्ट स्कीमा जेनरेटर
function generateTvSchema(categoryData, tvShows = [], articles = [], categorySlug) {
  const domain = SITE_URL;
  const categoryUrl = `${domain}/tv`;
  
  const graph = [];

  // 1️⃣ संस्था स्कीमा
  graph.push({
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${domain}/#organization`,
    "name": "EntertainIndia",
    "url": domain,
    "logo": `${domain}/og-logo.png`
  });

  // 2️⃣ वेबसाइट स्कीमा
  graph.push({
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "inLanguage": "hi-IN",
    "publisher": { "@id": `${domain}/#organization` }
  });

  // 3️⃣ ब्रेडक्रंब स्कीमा
  graph.push({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${categoryUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "होम", "item": domain },
      { "@type": "ListItem", "position": 2, "name": "टीवी", "item": categoryUrl }
    ]
  });

  // 4️⃣ कलेक्शन पेज स्कीमा
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${categoryUrl}#collection-page`,
    "name": categoryData?.seo?.title || "टीवी शो | EntertainIndia",
    "description": categoryData?.seo?.description || "टीवी सीरियल्स और रियलिटी शो के ताजा अपडेट",
    "url": categoryUrl,
    "inLanguage": "hi-IN",
    "isPartOf": { "@id": `${domain}/#website` }
  });

  // 5️⃣ टीवी शो लिस्ट स्कीमा
  if (tvShows?.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#tvshows-list`,
      "numberOfItems": tvShows.length,
      "itemListElement": tvShows.slice(0, 10).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "TVSeries",
          "name": item.title || item.name,
          "url": `${domain}/tv/shows/${item.slug}`,
          "image": item.poster?.url || item.backdrop?.url
        }
      }))
    });
  }

  // 6️⃣ आर्टिकल लिस्ट स्कीमा
  if (articles?.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${categoryUrl}#articles-list`,
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
            "author": {
          "@type": "Person",
          "name": article.Authors?.name || "EntertainIndia Team", // 2. नाम न होने पर 'Missing Author' से बचाएगा
          "url": article.Authors?.name 
            ? `${SITE_URL}/author/${article.Authors.name?.toLowerCase().replace(/\s+/g, '-')}` 
            : `${SITE_URL}/about` // 'Missing URL' की चेतावनी को ठीक करेगा
        },
         "publisher": {
            "@type": "Organization",
            "name": "EntertainIndia",
            "logo": {
              "@type": "ImageObject",
              "url": `${SITE_URL}/og-logo.png`
            }
          }
        }
      }))
    });
  }

  return { "@context": "https://schema.org", "@graph": graph };
}

//  एसईओ मेटाडेटा - पूरी तरह बैकेंड से
export async function generateMetadata() {
  const category = 'tv';
  const categoryUrl = `${SITE_URL}/${category}`;

  try {
    //  सब कुछ बैकेंड से ले रहे हैं
    const categoryData = await categoryAPIServer.getBySlug(category);
    
    //  बैकेंड से डेटा मिला तो वो यूज करो, नहीं तो बेसिक
    const title = categoryData?.seo?.title || "टीवी शो | EntertainIndia";
    const description = categoryData?.seo?.description || "टीवी सीरियल्स और रियलिटी शो के ताजा अपडेट";
    const keywords = categoryData?.seo?.keywords || [];
    const ogImage = categoryData?.ogImage?.url || `${SITE_URL}/og-tv-default.jpg`;

    return {
      title,
      description,
      keywords,
      alternates: { canonical: categoryUrl },
      robots: { index: true, follow: true },
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
    //  एरर में भी डायनामिक
    return {
      title: "टीवी शो | EntertainIndia",
      description: "टीवी सीरियल्स और रियलिटी शो के ताजा अपडेट",
      robots: { index: true, follow: true },
      alternates: { canonical: categoryUrl },
    };
  }
}

//  मुख्य कंपोनेंट
export default async function TvPage({ searchParams }) {
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;
  const category = "tv";

const [categoryData, articleData, tvShowData] = await Promise.all([
  categoryAPIServer.getBySlug(category).catch(e => null),
  articlesAPI.getAllLight({ 
    category, 
    page, 
    pageSize: 6, 
    mainCategory: "article",
    sort: "createdAt:desc" 
  }).catch(e => ({ articles: [], pagination: {} })),
  tvShowsAPI.getAllLight({ 
    category, 
    pageSize: 20,
    sort: "createdAt:desc" 
  }).catch(e => [])          // 👈 array fallback
]);

const tvShows = Array.isArray(tvShowData) ? tvShowData : [];   // 👈 fix
const articles = articleData?.articles || [];
 

  //  कस्टम टीवी स्कीमा
  const schemaData = generateTvSchema(categoryData, tvShows, articles, category);

 return (
  <>
   
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
    
    <h1 className="sr-only">...</h1>

    <LayoutWrapper>
      <CategoryPage
        category={category}
        categoryData={categoryData}
        initialArticles={articles}
        initialMovies={tvShows}
        initialPagination={articleData?.pagination || {}}
        initialPage={page}
      />
    </LayoutWrapper>
  </>
);
}