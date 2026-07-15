// app/article/[slug]/page.js
import { notFound } from 'next/navigation';
import ArticlePageServer from '../../../page-components/ArticlePageServer';
import LayoutWrapper from '../../LayoutWrapper';
import {articlesAPI} from '../../../lib/api/articles';
const SITE_URL = 'https://entertainindia.in';

//  सिर्फ article URL बनाने का फंक्शन
function getArticleUrl(slug) {
  return `${SITE_URL}/article/${slug}`;
}

//  बिल्ड टाइम पर सभी आर्टिकल slugs प्री-जेनरेट करें
export async function generateStaticParams() {
  try {
    const res = await articlesAPI.getAllLight({
      mainCategory: 'article',    // सिर्फ article वाले
      pageSize: 100,
      fields: ['slug'],
    });
    const articles = res?.articles || [];
    return articles.map((article) => ({ slug: article.slug }));
  } catch (err) {
    console.error('generateStaticParams error:', err);
    return [];
  }
}

//  ISR: 60 सेकंड बाद कैश रिफ्रेश (पेज फास्ट रहेगा)
export const revalidate = 60;
export const dynamicParams = true;   // नए आर्टिकल को भी अनुमति

//  SEO Metadata
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const article = await articlesAPI.getBySlug(slug);
  if (!article || article.mainCategory !== 'article') {
    return { title: 'पेज नहीं मिला', robots: { index: false } };
  }
  const articleUrl = getArticleUrl(slug);
  const imageUrl = article.heroImage?.url || `${SITE_URL}/default-og.jpg`;
  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.summary,
    keywords: article.meta_keywords|| article.keywords || undefined,   // <-- ye line add karo
    alternates: { canonical: articleUrl },
    openGraph: {
      title: article.title,
      description: article.summary,
      url: articleUrl,
      images: [{ url: imageUrl, width: 1200, height: 630 }],
      type: 'article',
    },
  };
}

//  एक ही JSON-LD स्कीमा (सब कुछ एक साथ)
function generateCombinedSchema(article, articleUrl) {
  const domain = SITE_URL;
  const imageUrl = article.heroImage?.url || `${domain}/default-image.jpg`;
  const authorName = article.Articles?.name || article.Authors?.name || 'EntertainIndia Team';
  const publishDate = article.createdAt || article.publishedAt || new Date().toISOString();
  const modifiedDate = article.updatedAt || article.publishedAt || publishDate;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${domain}/#organization`,
        "name": "EntertainIndia",
        "url": domain,
        "logo": { "@type": "ImageObject", "url": `${domain}/og-logo.png` }
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
        "@id": `${articleUrl}#breadcrumb`,
        "itemListElement": [
          { "@type": "ListItem", "position": 1, "name": "होम", "item": domain },
          { "@type": "ListItem", "position": 2, "name": "आर्टिकल्स", "item": `${domain}/article` },
          { "@type": "ListItem", "position": 3, "name": article.title?.substring(0, 50), "item": articleUrl }
        ]
      },
      {
        "@type": "Article",
        "@id": `${articleUrl}#article`,
        "url": articleUrl,
        "headline": article.seoTitle || article.title,
        "description": article.metaDescription || article.summary,
        "datePublished": publishDate,
        "dateModified": modifiedDate,
        "author": { "@type": "Person", "name": authorName },
        "publisher": { "@id": `${domain}/#organization` },
        "image": { "@type": "ImageObject", "url": imageUrl, "width": 1200, "height": 630 },
        "mainEntityOfPage": { "@type": "WebPage", "@id": articleUrl },
        "inLanguage": "hi-IN"
      }
    ]
  };
}

export default async function ArticleSlugPage({ params }) {
  const { slug } = await params;
  let article = null;

  try {
    article = await articlesAPI.getBySlug(slug);
    //  सिर्फ वही आर्टिकल जिनकी mainCategory === 'article' – बाकी 404
    if (!article || article.mainCategory !== 'article') {
      return notFound();
    }
  } catch (error) {
    return notFound();
  }

  const articleUrl = getArticleUrl(slug);
  const combinedSchema = generateCombinedSchema(article, articleUrl);
// सम्बंधित आर्टिकल (Perfect Fix)
let related = [];
try {
  // 1. बिना किसी एक्स्ट्रा फ़ील्ड्स या कैटेगरी फ़िल्टर के लेटेस्ट आर्टिकल्स मंगाएं
  const relatedData = await articlesAPI.getAllLight({
    mainCategory: 'article', // अगर इसे रखने पर भी 0 आए, तो इस लाइन को पूरी तरह हटा दें
    pageSize: 15,            // वर्तमान आर्टिकल हटाने के बाद भी बैकअप रहे
    sort: 'createdAt:desc',
  });

  const rawArticles = relatedData?.articles || [];
  
  // 2. फ्रंटएंड पर ही वर्तमान आर्टिकल को लिस्ट से बाहर करें और केवल 8 आर्टिकल्स काटें
  related = rawArticles
    .filter(a => a && a.slug && a.slug !== slug)
    .slice(0, 8);
} catch (err) {
  console.error('सम्बंधित आर्टिकल fetch error:', err);
}

  return (
    <LayoutWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchema) }}
      />
      <ArticlePageServer article={article} related={related} />
    </LayoutWrapper>
  );
}