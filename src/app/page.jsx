import Home from '../page-components/Home';
import LayoutWrapper from './LayoutWrapper';
import { galleriesAPI, celebritiesAPI, articlesAPI, moviesAPI, songsAPI, videosAPI } from '../lib/api';
import { webStoriesAPIServer } from "../lib/api-server";
import LogoImg from '../../public/og-logo.png';

// ✅ ISR Caching - Revalidate every 5 minutes (300 seconds)
export const revalidate = 300;
export const dynamic = 'force-static';
export const fetchCache = 'force-cache';

const SITE_URL = 'https://entertainindia.in';

// ──────────────────────────────────────────────
// 1️⃣ LOGO (Square) – Favicon, Organization, Icons
// ──────────────────────────────────────────────
const LOGO_URL = LogoImg?.src?.startsWith('http')
  ? LogoImg.src
  : `${SITE_URL}${LogoImg?.src || '/logo.png'}`;
const LOGO_WIDTH = LogoImg?.width || 512;
const LOGO_HEIGHT = LogoImg?.height || 512;

// ──────────────────────────────────────────────
// 2️⃣ OG IMAGE (1200×630) – Open Graph, Twitter, Schema primaryImage
//    यह public फोल्डर में स्थित है, इसलिए सीधा URL
// ──────────────────────────────────────────────
const OG_IMAGE_URL = `${SITE_URL}/og-logo.png`;
const OG_IMAGE_WIDTH = 1200;
const OG_IMAGE_HEIGHT = 630;

// DEFAULT OG वेरिएबल्स – अब ये OG_IMAGE_URL को पॉइंट करेंगे
const DEFAULT_OG_IMAGE = OG_IMAGE_URL;
const DEFAULT_OG_WIDTH = OG_IMAGE_WIDTH;
const DEFAULT_OG_HEIGHT = OG_IMAGE_HEIGHT;

// ⚠️ ARTICLE_BASE_PATH – सही है (कोई 404 नहीं)
const ARTICLE_BASE_PATH = '/article';

// ✅ Helper function to safely get data
const getSafeData = (result, defaultValue = []) => {
  if (!result) return defaultValue;
  return result.articles || result.movies || result.songs || result.videos ||
    result.stories || result.galleries || result.celebrities || defaultValue;
};

// ✅ Strapi media object se absolute URL + real width/height
const resolveImageMeta = (img) => {
  if (!img) return null;
  const formats = img?.formats || {};
  const chosen = formats.large || formats.medium || formats.small || img;
  const rawUrl = chosen?.url;
  if (!rawUrl) return null;
  const url = rawUrl.startsWith('http') ? rawUrl : `${process.env.NEXT_PUBLIC_STRAPI_URL}${rawUrl}`;
  return {
    url,
    width: chosen?.width || 1200,
    height: chosen?.height || 630,
    alt: img?.alternativeText || null,
  };
};

// ✅ Featured article se meta nikalna (LCP ke liye)
const getFeaturedMeta = (featuredArticles) => {
  const primary = featuredArticles?.[0];
  if (!primary) return null;
  const img = primary?.heroImage || primary?.hero_image || primary?.image;
  return {
    title: primary?.title,
    description: primary?.metaDescription || primary?.excerpt || primary?.summary || null,
    image: resolveImageMeta(img),
    publishedAt: primary?.publishDate || primary?.publishedAt || null,
    updatedAt: primary?.updatedAt || null,
    author: primary?.author?.name || null,
    slug: primary?.slug || null,
  };
};

// ──────────────────────────────────────────────
// ✅ generateMetadata – अब DEFAULT OG वाली इमेज और सही DIMENSIONS
// ──────────────────────────────────────────────
export async function generateMetadata() {
  const title = 'एंटरटेनइंडिया | ताज़ा बॉलीवुड समाचार और फिल्म समीक्षाएं';
  const description = 'एंटरटेनइंडिया पर पाएं लेटेस्ट बॉलीवुड न्यूज़, हॉलीवुड अपडेट्स, ओटीटी बज़ और वायरल सेलिब्रिटी फोटोज।';

  // ✅ अब DEFAULT वाले वेरिएबल का उपयोग
  const ogImage = DEFAULT_OG_IMAGE;
  const ogImageWidth = DEFAULT_OG_WIDTH;   // 1200
  const ogImageHeight = DEFAULT_OG_HEIGHT; // 630
  const ogImageAlt = 'एंटरटेनइंडिया ताज़ा समाचार';

  return {
    title,
    description,
    icons: {
      icon: LOGO_URL,
      shortcut: LOGO_URL,
      apple: LOGO_URL,
    },
    keywords: ['बॉलीवुड समाचार', 'फिल्म समीक्षाएं', 'सेलिब्रिटी गपशप', 'ओटीटी अपडेट्स', 'लेटेस्ट ट्रेलर', 'एंटरटेनमेंट इंडिया न्यूज़'],
    alternates: { canonical: SITE_URL },
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1
      },
    },
    openGraph: {
      title,
      description,
      url: SITE_URL,
      siteName: 'एंटरटेनइंडिया',
      images: [{
        url: ogImage,
        width: ogImageWidth,
        height: ogImageHeight,
        alt: ogImageAlt
      }],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [{ url: ogImage, alt: ogImageAlt }],
      creator: '@EntertainIndia',
    },
  };
}

// ──────────────────────────────────────────────
// ✅ Main Page Component
// ──────────────────────────────────────────────
export default async function Page() {
  let initialData = {
    featured: [],
    latestSection: [],
    celebritySection: [],
    viralSection: [],
    webStories: [],
    galleries: [],
    celebrities: [],
    latestArticles: [],
    trendingList: []
  };

  try {
    const results = await Promise.allSettled([
      articlesAPI.getAllLight({ pageSize: 5, featured: true, mainCategory: "article", sort: "publishDate", populate: '*' }),
      articlesAPI.getAllLight({ mainCategory: "news", pageSize: 6, sort: 'publishedAt:desc', typeContent: 'LatestNews' }),
      articlesAPI.getAllLight({ mainCategory: "news", pageSize: 6, sort: 'publishDate:desc', typeContent: 'CelebrityNews' }),
      articlesAPI.getAllLight({ mainCategory: "news", pageSize: 6, sort: 'publishDate:desc', typeContent: 'ViralNews' }),
      articlesAPI.getAllLight({ mainCategory: "article", pageSize: 8, sort: 'publishDate:desc', populate: '*' }),
      webStoriesAPIServer.getAll(),
      galleriesAPI.getAll({ pageSize: 6, sort: 'publishedAt:desc' }),
      celebritiesAPI.getAll({ pageSize: 6, sort: 'updatedAt:desc', filters: { language: 'hi' } }),
      moviesAPI.getAllLight({ pageSize: 6, sort: 'publishedAt:desc', filters: { trending: true } }).catch(() => ({ movies: [] })),
      songsAPI.getAll({ pageSize: 6, sort: 'publishedAt:desc', filters: { trending: true } }).catch(() => ({ songs: [] })),
      videosAPI.getAll({ pageSize: 6, sort: 'publishedAt:desc', filters: { trending: true } }).catch(() => ({ videos: [] })),
    ]);

    const [
      featuredRes,
      latestRes,
      celebRes,
      viralRes,
      latestArticlesRes,
      webStoriesRes,
      galleriesRes,
      celebritiesRes,
      trendingMoviesRes,
      trendingSongsRes,
      trendingVideosRes,
    ] = results.map(result => result.status === 'fulfilled' ? result.value : null);

    initialData.featured = getSafeData(featuredRes);
    initialData.latestSection = getSafeData(latestRes);
    initialData.celebritySection = getSafeData(celebRes);
    initialData.viralSection = getSafeData(viralRes);
    initialData.webStories = getSafeData(webStoriesRes, []).slice(0, 10);
    initialData.galleries = getSafeData(galleriesRes);
    initialData.celebrities = getSafeData(celebritiesRes);
    initialData.latestArticles = getSafeData(latestArticlesRes);

    // Trending items logic
    const trendingMovies = (trendingMoviesRes?.movies || [])
      .filter(m => m.trending === true)
      .map(i => ({
        ...i,
        type: 'movies',
        label: 'फिल्म',
        path: 'movies',
        sortDate: new Date(i.publishedAt || i.createdAt || 0)
      }));

    const trendingSongs = (trendingSongsRes?.songs || [])
      .filter(s => s.trending === true)
      .map(i => ({
        ...i,
        type: 'music',
        label: 'संगीत',
        path: 'music',
        sortDate: new Date(i.publishedAt || i.createdAt || 0)
      }));

    const trendingVideos = (trendingVideosRes?.videos || [])
      .filter(v => v.trending === true)
      .map(i => ({
        ...i,
        type: 'videos',
        label: 'वीडियो',
        path: 'videos',
        sortDate: new Date(i.publishedAt || i.createdAt || 0)
      }));

    const trendingCelebrities = (initialData.celebrities || [])
      .filter(c => c.trending === true)
      .map(i => ({
        ...i,
        type: 'celebrities',
        label: 'सेलिब्रिटी',
        path: 'celebrities',
        sortDate: new Date(i.updatedAt || i.publishedAt || i.createdAt || 0)
      }));

    const trendingGalleries = (initialData.galleries || [])
      .filter(g => g.trending === true)
      .map(i => ({
        ...i,
        type: 'galleries',
        label: 'फोटो',
        path: 'photos',
        sortDate: new Date(i.publishedAt || i.createdAt || 0)
      }));

    const trendingWebStories = (initialData.webStories || [])
      .filter(s => s.trending === true)
      .map(i => ({
        ...i,
        type: 'webStories',
        label: 'कहानी',
        path: 'web-stories',
        sortDate: new Date(i.publishedAt || i.createdAt || 0)
      }));

    const combinedTrending = [
      ...trendingMovies,
      ...trendingSongs,
      ...trendingVideos,
      ...trendingCelebrities,
      ...trendingGalleries,
      ...trendingWebStories,
    ];

    const uniqueTrending = combinedTrending.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id && t.type === item.type)
    );

    const sortedTrending = uniqueTrending.sort((a, b) => {
      const dateA = a.sortDate || new Date(a.publishedAt || a.createdAt || a.updatedAt || 0);
      const dateB = b.sortDate || new Date(b.publishedAt || b.createdAt || b.updatedAt || 0);
      return dateB - dateA;
    });

    const topTrending = sortedTrending.slice(0, 15);
    const interleavedTrending = [];
    const maxLength = Math.max(...topTrending.map((_, idx) => idx));
    for (let i = 0; i <= maxLength; i++) {
      topTrending.forEach(item => {
        if (topTrending.indexOf(item) === i) interleavedTrending.push(item);
      });
    }
    initialData.trendingList = interleavedTrending.slice(0, 7);

  } catch (error) {
    console.error('Fetch error:', error);
  }

  // LCP Image – featured article ki hero image (अलग)
  const featuredMeta = getFeaturedMeta(initialData.featured);
  const lcpImageUrl = featuredMeta?.image?.url || null;

  // ──────────────────────────────────────────────
  // ✅ JSON-LD Schema
  // ──────────────────────────────────────────────

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "@id": `${SITE_URL}/#organization`,
    "name": "एंटरटेनइंडिया",
    "url": SITE_URL,
    "logo": {
      "@type": "ImageObject",
      "url": LOGO_URL,          // ✅ Square logo
      "width": LOGO_WIDTH,
      "height": LOGO_HEIGHT
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=61584375938569",
      "https://www.instagram.com/entertainindiaofficial/",
      "https://x.com/EIndia99460",
      "https://www.youtube.com/@EIndiaofficial"
    ]
  };

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_URL}/#website`,
    "name": "एंटरटेनइंडिया",
    "url": SITE_URL,
    "inLanguage": "hi-IN",
    "publisher": { "@id": `${SITE_URL}/#organization` }
  };

  const webpageLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/#webpage`,
    "url": SITE_URL,
    "name": "एंटरटेनइंडिया - ताज़ा बॉलीवुड समाचार और सेलिब्रिटी अपडेट्स",
    "description": "लेटेस्ट मनोरंजन समाचार, वायरल कहानियां और सेलिब्रिटी अपडेट्स प्राप्त करें।",
    "inLanguage": "hi-IN",
    "isPartOf": { "@id": `${SITE_URL}/#website` },
    "about": { "@id": `${SITE_URL}/#organization` },
    "primaryImageOfPage": {
      "@type": "ImageObject",
      "url": DEFAULT_OG_IMAGE   // ✅ अब /og-logo.png
    }
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [{
      "@type": "ListItem",
      "position": 1,
      "name": "होम",
      "item": SITE_URL
    }]
  };

  const latestArticlesForSchema = (initialData.latestArticles || []).filter(a => a?.title && a?.slug).slice(0, 8);
  const itemListLd = latestArticlesForSchema.length ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": latestArticlesForSchema.map((article, index) => {
      const img = article?.heroImage || article?.hero_image || article?.image;
      const imageMeta = resolveImageMeta(img);
      return {
        "@type": "ListItem",
        "position": index + 1,
        "url": `${SITE_URL}${ARTICLE_BASE_PATH}/${article.slug}`,
        "item": {
          "@type": "NewsArticle",
          "headline": article.title,
          ...(imageMeta?.url ? { "image": [imageMeta.url] } : {}),
          ...(article.publishDate || article.publishedAt
            ? { "datePublished": article.publishDate || article.publishedAt }
            : {}),
          ...(article.updatedAt ? { "dateModified": article.updatedAt } : {}),
          ...(article?.author?.name
            ? { "author": { "@type": "Person", "name": article.author.name } }
            : {}),
          "publisher": { "@id": `${SITE_URL}/#organization` }
        }
      };
    })
  } : null;

  return (
    <>
      {/* LCP Preload – यह फीचर्ड आर्टिकल की इमेज है, /og-logo.png नहीं */}
      {lcpImageUrl && (
        <link rel="preload" as="image" href={lcpImageUrl} fetchPriority="high" />
      )}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {itemListLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      )}
      <LayoutWrapper>
        <h1 className="sr-only">एंटरटेनइंडिया - ताज़ा बॉलीवुड समाचार और सेलिब्रिटी अपडेट्स</h1>
        <Home
          initialData={initialData}
          breadcrumbs={[{ label: 'होम', url: '/', active: true }]}
        />
      </LayoutWrapper>
    </>
  );
}