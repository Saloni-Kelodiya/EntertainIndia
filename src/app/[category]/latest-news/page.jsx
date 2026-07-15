import LatestNewsPage from '../../../page-components/LatestNewsPage';
import LayoutWrapper from '../../LayoutWrapper';
import { articlesAPI } from '../../../lib/api/articles';

//  कैटेगरी के हिंदी नाम की डिक्शनरी (URL slug -> Hindi translation)
const categoryTranslations = {
  all: 'मनोरंजन',
  latest: 'नवीनतम',
  bollywood: 'बॉलीवुड',
  hollywood: 'हॉलीवुड',
  tollywood: 'टॉलीवुड',
  ott: 'ओटीटी',
  tv: 'टीवी',
  bhojiwood: 'भोजीवुड',
  korean: 'कोरियाई',
};

//  SEO: डायनेमिक मेटाडेटा जनरेशन (हिंदी और .in डोमेन आधारित)
export async function generateMetadata({ params }) {
  const { category } = await params;
  
  // सुरक्षित फॉलबैक के साथ हिंदी नाम प्राप्त करें
  const categoryHindi = categoryTranslations[category?.toLowerCase()] || categoryTranslations['all'];

  const pageTitle = `${categoryHindi} न्यूज़ | सेलिब्रिटी खबरें, मूवी अपडेट्स और गॉसिप - EntertainIndia`;
  const pageDesc = `EntertainIndia पर पढ़ें ${categoryHindi} जगत की ताज़ा खबरें, ट्रेंडिंग सेलिब्रिटी गॉसिप, फिल्म अपडेट और बॉक्स ऑफिस रिव्यूज।`;
  const pageUrl = `https://entertainindia.in/${category}/latest-news`;
  const ogImage = "https://entertainindia.in/news-default-og.jpg"; 

  return {
    title: pageTitle,
    description: pageDesc,
    robots: { 
      index: true, 
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' }
    },
    alternates: { 
      canonical: pageUrl,
      languages: {
        'hi-IN': pageUrl,
        'x-default': pageUrl
      }
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: pageUrl,
      siteName: 'EntertainIndia',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${categoryHindi} मनोरंजन समाचार`,
        }
      ],
      locale: 'hi_IN', //  हिंदी लोकेल सेट किया गया
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [ogImage],
      site: '@EntertainIndia',
      creator: '@EntertainIndia',
    },
  };
}

export default async function LatestNews({ params }) {
  const { category } = await params;
  const currentCategory = category?.toLowerCase() || "latest";
  
  //  क्लाइंट/स्कीमा के लिए हिंदी नाम निर्धारित करें
  const categoryNameHindi = categoryTranslations[currentCategory] || categoryTranslations['all'];

  let initialArticles = [];

  try {
    let fetchParams = {
      pageSize: 12,
      mainCategory: "News",
      sort: "publishDate:desc",
    };

    if (currentCategory !== "all" && currentCategory !== "latest") {
      fetchParams.category = currentCategory; 
    }

    const res = await articlesAPI.getAllLight(fetchParams);
    initialArticles = res?.articles || [];

    //  1. ब्रेडक्रंब स्कीमा (Breadcrumb Schema in Hindi)
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "होम", "item": "https://entertainindia.in" },
        { "@type": "ListItem", "position": 2, "name": categoryNameHindi, "item": `https://entertainindia.in/${currentCategory}` },
        { "@type": "ListItem", "position": 3, "name": "ताजा खबरें", "item": `https://entertainindia.in/${currentCategory}/latest-news` }
      ]
    };

    //  2. न्यूज इंडेक्स स्कीमा (News Index Schema in Hindi)
    const itemListLd = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": `${categoryNameHindi} मनोरंजन समाचार और गॉसिप`,
      "description": `ताजा ${categoryNameHindi} सेलिब्रिटी न्यूज और फिल्म अपडेट्स की सूची।`,
      "itemListElement": initialArticles.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `https://entertainindia.in/news/${article.slug}`,
        "name": article.title
      }))
    };

    return (
      <LayoutWrapper>
        {/*  स्कीमा इंजेक्शन */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, itemListLd]) }}
        />

        {/*  SEO के लिए स्क्रीन रीडर हेडिंग हिंदी में */}
        <h1 className="sr-only">{categoryNameHindi} मनोरंजन समाचार और फिल्म अपडेट</h1>
        
        <LatestNewsPage 
          serverCategory={currentCategory} 
          initialArticles={initialArticles} 
        />
      </LayoutWrapper>
    );

  } catch (error) {
    console.error("Server Fetch Error:", error);
    return (
      <LayoutWrapper>
        <div className="text-center py-20 text-gray-600 dark:text-gray-400">
          कुछ गड़बड़ हुई। कृपया पेज को दोबारा लोड करें।
        </div>
      </LayoutWrapper>
    );
  }
}