import MovieReviews from '../../../page-components/MovieReviewsPage';
import LayoutWrapper from '../../LayoutWrapper';
import { articlesAPI } from '../../../lib/api';

// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// ✅ SEO: सिर्फ टाइटल और डिस्क्रिप्शन ऑप्टिमाइज़्ड (हिंदी में)
export async function generateMetadata({ params }) {
  const { category } = await params;
  
  // ✅ कैटेगरी का नाम - बिल्कुल वैसा ही, कोई बदलाव नहीं
  const capitalized = category.charAt(0).toUpperCase() + category.slice(1);

  // ✅ टाइटल - ज्यादा से ज्यादा 60-70 अक्षर
  let seoTitle = `एक्सपर्ट ${capitalized} मूवी रिव्यू और रेटिंग्स | EntertainIndia`;
  if (seoTitle.length > 68) {
    seoTitle = seoTitle.slice(0, 65) + '...';
  }

  // ✅ डिस्क्रिप्शन - ज्यादा से ज्यादा 150-160 अक्षर
  let seoDescription = `पढ़ें नवीनतम ${category} मूवी रिव्यू, क्रिटिक्स और स्टार रेटिंग्स। हमारे एक्सपर्ट फिल्म क्रिटिक्स से नई रिलीज़ का गहन विश्लेषण प्राप्त करें।`;
  if (seoDescription.length > 155) {
    seoDescription = seoDescription.slice(0, 152) + '...';
  }

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: `${category} मूवी रिव्यू, फिल्म रेटिंग, ${category} सिनेमा, एक्सपर्ट रिव्यू, नई फिल्में`,
    robots: { 
      index: true, 
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': 150,
        'max-image-preview': 'large',
      }
    },
    alternates: { 
      canonical: `https://entertainindia.in/${category}/reviews` 
    },
    openGraph: {
      title: seoTitle.slice(0, 60),
      description: seoDescription.slice(0, 150),
      url: `https://entertainindia.in/${category}/reviews`,
      siteName: 'EntertainIndia',
      images: [{
        url: `/og-reviews-${category}.jpg`,
        width: 1200,
        height: 630,
        alt: `${capitalized} मूवी रिव्यू`
      }],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: seoTitle.slice(0, 60),
      description: seoDescription.slice(0, 150),
      images: [`/og-reviews-${category}.jpg`],
      creator: '@EntertainIndia',
    },
  };
}

// ✅ मेन कंपोनेंट - बिल्कुल वैसा ही, कुछ नहीं बदला
export default async function LatestReviewsPage({ params, searchParams }) {
  const { category } = await params;
  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : "Latest";
  let initialData = { articles: [], pagination: {} };
  let error = null;

  try {
    initialData = await articlesAPI.getAll({
      category: "reviews",
      industry: category,
      page: page,
      pageSize: 8,
      sort: "publish_datetime:desc",
    });

    const siteUrl = 'https://entertainindia.in';

    // ✅ 1. ब्रेडक्रंब स्कीमा (हिंदी में)
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "होम", "item": siteUrl },
        { "@type": "ListItem", "position": 2, "name": categoryName, "item": `${siteUrl}/${category}` },
        { "@type": "ListItem", "position": 3, "name": "रिव्यू", "item": `${siteUrl}/${category}/reviews` }
      ]
    };

    // ✅ 2. रिव्यू लिस्ट स्कीमा (हिंदी में)
  // ✅ 2. रिव्यू लिस्ट स्कीमा (अब ARTICLE की IMAGE भी शामिल है)
const reviewListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `${categoryName} मूवी रिव्यू और स्टार रेटिंग्स`,
  "description": `${categoryName} सिनेमा के लिए नवीनतम एक्सपर्ट रिव्यू और क्रिटिक्स।`,
  "numberOfItems": initialData?.articles?.length || 0,
  "itemListElement": (initialData?.articles || []).slice(0, 10).map((review, index) => {
    // 🖼️ ARTICLE की इमेज URL (hero_image से)
    let imageUrl = null;
    if (review.hero_image?.url) {
      imageUrl = review.hero_image.url;
      if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://img.entertainindia.com${imageUrl}`;
      }
    } else if (review.heroImage?.url) {
      imageUrl = review.heroImage.url;
      if (imageUrl && !imageUrl.startsWith('http')) imageUrl = `https://img.entertainindia.com${imageUrl}`;
    }

    // ✅ नया URL पैटर्न: /[mainCategory]/[slug]
    const mainCategory = review.MainCategory||review.mainCategory || 'article'; // fallback 'article'
    const articleUrl = `${siteUrl}/${mainCategory}/${review.slug}`;

    const movieName = review.title?.replace(/Review:/i, '').replace(/रिव्यू:/i, '').trim() || review.title;

    return {
      "@type": "ListItem",
      "position": (page - 1) * 8 + (index + 1),
      "item": {
        "@type": "Review",
        "itemReviewed": {
          "@type": "Movie",
          "name": movieName,
          ...(imageUrl && { "image": imageUrl })
        },
        "author": {
          "@type": "Organization",
          "name": "EntertainIndia"
        },
        "url": articleUrl,   // ✅ अब URL सही बनेगा
        "reviewRating": review.rating ? {
          "@type": "Rating",
          "ratingValue": review.rating,
          "bestRating": "5",
          "worstRating": "1"
        } : undefined,
        "datePublished": review.publish_datetime || review.createdAt
      }
    };
  })
};

    // ✅ 3. कलेक्शनपेज स्कीमा
    const collectionLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${categoryName} मूवी रिव्यू`,
      "description": `${categoryName} फिल्मों के एक्सपर्ट रिव्यू और रेटिंग्स का संग्रह।`,
      "url": `${siteUrl}/${category}/reviews`,
      "isPartOf": {
        "@type": "WebSite",
        "name": "EntertainIndia",
        "url": siteUrl
      }
    };

    return (
      <>
        {/* ✅ पैजिनेशन लिंक्स */}
        {page > 1 && (
          <link 
            rel="prev" 
            href={`${siteUrl}/${category}/reviews?page=${page - 1}`} 
          />
        )}
        {page < (initialData?.pagination?.pageCount || 1) && (
          <link 
            rel="next" 
            href={`${siteUrl}/${category}/reviews?page=${page + 1}`} 
          />
        )}

        {/* ✅ स्कीमा इंजेक्शन */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewListLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionLd) }}
        />

        {/* ✅ हिडन H1 - सिर्फ गूगल के लिए (हिंदी में) */}
        <h1 className="sr-only">
          {category.toUpperCase()} मूवी रिव्यू और रेटिंग्स - एक्सपर्ट फिल्म क्रिटिक्स | EntertainIndia
        </h1>
        
        <LayoutWrapper>
          <MovieReviews 
            industry={category} 
            initialReviews={initialData?.articles || []} 
            initialPagination={initialData?.pagination || {}}
            serverPage={page}
          />
        </LayoutWrapper>
      </>
    );

  } catch (error) {
    console.error("रिव्यू सर्वर फेच एरर:", error);
    return (
      <LayoutWrapper>
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            ⚠️ रिव्यू लोड नहीं हो पाए
          </h2>
          <p className="text-gray-600">
            कृपया कुछ समय बाद पुनः प्रयास करें।
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            रिफ्रेश करें
          </button>
        </div>
      </LayoutWrapper>
    );
  }
}