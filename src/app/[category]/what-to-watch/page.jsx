// =============================================
// FILE: app/[category]/what-to-watch/page.js (Server Component)
// =============================================

import { articlesAPI } from '../../../lib/api/articles';
import WhatToWatchClient from '../../../page-components/WhatToWatch';
import LayoutWrapper from '../../LayoutWrapper';

// ==========================================
// 1️⃣ SEO METADATA - Hindi
// ==========================================
export async function generateMetadata({ searchParams, params }) {
  const s = await searchParams;
  const platform = s.platform;
  const { category } = await params;

  const getPlatformName = (plat) => {
    const map = {
      Netflix: 'नेटफ्लिक्स',
      'Amazon Prime': 'अमेज़न प्राइम',
      Prime: 'अमेज़न प्राइम',
      Hotstar: 'हॉटस्टार',
      JioCinema: 'जियोसिनेमा',
      SonyLIV: 'सोनीलिव',
      ZEE5: 'ज़ी5',
      all: 'सभी प्लेटफॉर्म',
    };
    return map[plat] || plat;
  };

  const getCategoryName = (cat) => {
    const map = {
      bollywood: 'बॉलीवुड',
      hollywood: 'हॉलीवुड',
      ott: 'ओटीटी',
      tv: 'टीवी',
      tollywood: 'टॉलीवुड',
      bhojiwood: 'भोजपुरी',
      korean: 'कोरियाई',
      All: 'सभी',
    };
    return map[cat?.toLowerCase()] || cat || 'मनोरंजन';
  };

  const platformName = getPlatformName(platform);
  const categoryName = getCategoryName(category);
  const categorySlug = category?.toLowerCase() || 'entertainment';
  const title = `${categoryName} पर क्या देखें | बेस्ट ${categoryName} सिफारिशें`;
  const description = `समय बर्बाद मत करो! ${platformName} पर सबसे अच्छी ${categoryName} फिल्में और सीरीज़ देखें। रोज़ाना चुनिंदा सिफारिशें।`;
  const siteUrl = `https://entertainindia.in/${categorySlug}/what-to-watch`;
  const ogImage = 'https://entertainindia.in/og-what-to-watch.jpg';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: siteUrl,
      siteName: 'EntertainIndia',
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
      creator: '@EntertainIndia',
    },
    alternates: { canonical: siteUrl },
    robots: 'index, follow',
  };
}

// ==========================================
// 2️⃣ MAIN PAGE COMPONENT (Server)
// ==========================================
export default async function WhatToWatchPage({ searchParams, params }) {
  const sParams = await searchParams;
  const { category } = await params;
  const platform = sParams.platform || 'all';

  // 1️⃣ Fetch articles using getWhattoWatch (which returns correct structure)
  //    and also fetch genres separately (if needed for filter UI)
  const [articlesRes, genres] = await Promise.all([
    articlesAPI.getWhattoWatch({
      pageSize: 100, // load more to support client-side filtering
      hasPlatform: true,
      platform: platform !== 'all' ? platform : undefined,
      category: category && category !== 'All' ? category.toLowerCase() : undefined,
      sort: 'publish_datetime:desc',
    }),
    // GenresAPI.getAll() - if you have a separate API for genres, else extract from articles
    // For now, we'll extract genres from articles on client side, but we keep this for compatibility
    Promise.resolve([]), // remove this line if you have a real genre API
  ]);

  // Extract genres from the articles themselves (to avoid extra API call)
  const genreSet = new Map();
  articlesRes.articles.forEach((article) => {
    if (article.genres && Array.isArray(article.genres)) {
      article.genres.forEach((g) => {
        if (g.slug && !genreSet.has(g.slug)) {
          genreSet.set(g.slug, { id: g.slug, name: g.name, slug: g.slug });
        }
      });
    }
  });
  const extractedGenres = Array.from(genreSet.values());

  const filteredArticles = articlesRes?.articles || [];
  const finalGenres = genres.length > 0 ? genres : extractedGenres;

  // ==========================================
  // 3️⃣ SCHEMA GENERATION (Breadcrumb + CollectionPage)
  // ==========================================
  const getCategoryName = (cat) => {
    const map = {
      bollywood: 'बॉलीवुड',
      hollywood: 'हॉलीवुड',
      ott: 'ओटीटी',
      tv: 'टीवी',
      tollywood: 'टॉलीवुड',
      bhojiwood: 'भोजपुरी',
      korean: 'कोरियाई',
      All: 'सभी',
    };
    return map[cat?.toLowerCase()] || cat || 'मनोरंजन';
  };
  const getPlatformName = (plat) => {
    const map = {
      Netflix: 'नेटफ्लिक्स',
      'Amazon Prime': 'अमेज़न प्राइम',
      Prime: 'अमेज़न प्राइम',
      Hotstar: 'हॉटस्टार',
      JioCinema: 'जियोसिनेमा',
      SonyLIV: 'सोनीलिव',
      ZEE5: 'ज़ी5',
      all: 'सभी प्लेटफॉर्म',
    };
    return map[plat] || plat;
  };

  const categoryName = getCategoryName(category);
  const platformName = getPlatformName(platform);
  const categorySlug = category?.toLowerCase() || 'entertainment';

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'होम', item: 'https://entertainindia.in' },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryName,
        item: `https://entertainindia.in/${categorySlug}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'क्या देखें',
        item: `https://entertainindia.in/${categorySlug}/what-to-watch`,
      },
    ],
  };

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${platformName} पर देखने के लिए बेस्ट ${categoryName} फिल्में और सीरीज़`,
    description: `${platformName} पर ${categoryName} कंटेंट की चुनिंदा सिफारिशें। ट्रेंडिंग फिल्मों और वेब सीरीज़ की रोज़ाना अपडेटेड लिस्ट।`,
    url: `https://entertainindia.in/${categorySlug}/what-to-watch`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: filteredArticles.length || 0,
      itemListElement: filteredArticles.map((article, index) => {
        const mainCat = (article.mainCategory || 'article').toLowerCase();
        const articleUrl = `https://entertainindia.in/${mainCat}/${article.slug}`;
        return {
          '@type': 'ListItem',
          position: index + 1,
          url: articleUrl,
          name: article.title,
          image: article.heroImage?.url || 'https://entertainindia.in/default-share.jpg',
        };
      }),
    },
  };

  return (
    <LayoutWrapper>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([breadcrumbLd, collectionLd]),
        }}
      />
      <h1 className="sr-only">{`${platformName} पर देखने के लिए सुझाई गई फिल्में और वेब सीरीज़ - EntertainIndia`}</h1>
      <WhatToWatchClient
        initialArticles={filteredArticles}
        initialGenres={finalGenres}
        serverCategory={category}
        serverPlatform={platform}
      />
    </LayoutWrapper>
  );
}