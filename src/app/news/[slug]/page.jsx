import { notFound } from 'next/navigation';
import ArticlePageServer from '../../../page-components/ArticlePageServer';
import LayoutWrapper from '../../LayoutWrapper';
import { articlesAPI} from '../../../lib/api/articles';

const SITE_URL = 'https://entertainindia.in';

// Helper function to extract main category safely
function getCategorySafe(article) {
  return String(article?.mainCategory || article?.MainCategory || '').trim().toLowerCase();
}

//  PERFECT NEWS SCHEMA GENERATOR - Using createdAt only
function generateNewsSchema(article, articleUrl) {
  const domain = SITE_URL;
  const imageUrl = article.heroImage?.url || `${domain}/default-news-image.jpg`;
  const authorName = article.Authors?.name || article.Authors?.username || article.author?.name || 'EntertainIndia Team';
  
  //  FIX: Sirf createdAt use karo, kyunki backend publish date wrong hai
  const publishDate = article.createdAt || new Date().toISOString();
  const modifiedDate = article.updatedAt || article.createdAt || publishDate;

  // 1️⃣ Organization Schema
  const organizationSchema = {
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
  };

  // 2️⃣ WebSite Schema
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${domain}/#website`,
    "url": domain,
    "name": "EntertainIndia",
    "alternateName": "एंटरटेनइंडिया",
    "description": "Entertainment news in Hindi - Latest Bollywood, Hollywood, TV, OTT updates",
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
  };

  // 3️⃣ Breadcrumb Schema for News
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${articleUrl}#breadcrumb`,
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
        "name": "News",
        "item": `${domain}/news`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": article.title?.substring(0, 50),
        "item": articleUrl
      }
    ]
  };

  // 4️⃣ Main NewsArticle Schema - createdAt based
  const newsArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "@id": `${articleUrl}#newsarticle`,
    "url": articleUrl,
    "headline": article.seoTitle || article.title,
    "alternativeHeadline": article.title,
    "description": article.metaDescription || article.summary || article.excerpt,
    "datePublished": publishDate,  //  Sirf createdAt
    "dateModified": modifiedDate,   //  createdAt ya updatedAt
    "dateCreated": publishDate,     //  Sirf createdAt
    "author": {
      "@type": "Person",
      "name": authorName,
      "url": `${domain}/author/${article.authorSlug || 'news-team'}`
    },
    "publisher": {
      "@id": `${domain}/#organization`
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "image": {
      "@type": "ImageObject",
      "url": imageUrl,
      "width": "1200",
      "height": "630",
      "caption": article.title
    },
    "thumbnailUrl": imageUrl,
    "articleSection": article.category?.name || "News",
    "keywords": article.keywords || "entertainment news, bollywood news, hollywood news",
    "inLanguage": "hi-IN",
    "isAccessibleForFree": true,
    "copyrightHolder": {
      "@id": `${domain}/#organization`
    },
    "copyrightYear": new Date(publishDate).getFullYear()
  };

  return [organizationSchema, websiteSchema, breadcrumbSchema, newsArticleSchema];
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await articlesAPI.getBySlug(slug);

  if (!article) return { title: 'Not Found - EntertainIndia' };

  // STRICT METADATA CHECK - Only News articles
  const cat = getCategorySafe(article);
  if (cat !== 'news') {
    return { title: 'Not Found - EntertainIndia' };
  }

  const articleUrl = `${SITE_URL}/news/${slug}`;
  const imageUrl = article.heroImage?.url || `${SITE_URL}/default-news-image.jpg`;
  const authorName = article.Authors?.name || article.Authors?.username || 'EntertainIndia Team';

  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.summary,
   keywords:  article.keywords || undefined,   // <-- ye line add karo
    alternates: { 
      canonical: articleUrl 
    },
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
      title: article.title,
      description: article.summary,
      url: articleUrl,
      siteName: 'EntertainIndia',
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      locale: 'hi_IN',
      type: 'article',
      publishedTime: article.createdAt,  //  Sirf createdAt
      authors: [authorName],
      section: "News"
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.summary,
      images: [imageUrl],
    },
    category: article.category?.name
  };
}

export default async function ArticleSlugPage({ params }) {
  const { slug } = await params;
  let article = null;
  let related = [];

  // 1. Article Fetch
  try {
    article = await articlesAPI.getBySlug(slug);
  } catch (error) {
    console.error('Error fetching article:', error);
  }

  // 2. STRICT NEWS CHECK - Agar news nahi hai toh 404
  const currentMainCat = getCategorySafe(article);
  
  if (!article || currentMainCat !== 'news') {
    return notFound();
  }

  const articleUrl = `${SITE_URL}/news/${slug}`;

  // 3. LATEST RELATED NEWS FETCH - Sirf createdAt se sort
  try {
    const relatedData = await articlesAPI.getAllLight({
      mainCategory: 'news', 
      pageSize: 20,
      sort: 'createdAt:desc',  //  Sirf createdAt se sort
    });

    const filteredArticles = (relatedData.articles || []).filter(a => {
      const aMainCat = getCategorySafe(a);
      return a.slug !== slug && aMainCat === 'news';
    });

    //  createdAt se sorting (backup sort)
    filteredArticles.sort((a, b) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    const wordCount = article.body?.trim().split(/\s+/).length || 0;
    const sliceCount = wordCount < 500 ? 8 : 12;

   related = filteredArticles.slice(0, sliceCount).map(item => ({
  id: item.id,
  title: item.title,
  slug: item.slug,
  mainCategory: 'news',  // 👈 यह लाइन यहाँ जोड़ना बेहद ज़रूरी है!
  publishDate: item.createdAt,
  heroImage: item.heroImage?.url ? { url: item.heroImage.url } : null
}));
    
  } catch (err) {
    console.error('Error fetching related articles:', err);
  }

  //  Generate NEWS specific schema
  const schemas = generateNewsSchema(article, articleUrl);

  return (
    <LayoutWrapper>
      {schemas.map((schema, index) => (
        <script
          key={`news-schema-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}        
        />
      ))}
      <ArticlePageServer
        article={article}
        related={related}
      />
    </LayoutWrapper>
  );
}