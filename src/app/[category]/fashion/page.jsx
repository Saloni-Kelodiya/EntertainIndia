import Fashion from '../../../page-components/FashionPage';
import LayoutWrapper from '../../LayoutWrapper';
import { articlesAPI, galleriesAPI } from "../../../lib/api";


export const dynamic = 'force-dynamic';
export const revalidate = 300;
export const fetchCache = 'force-cache';

// ✅ SEO: हिंदी में डायनेमिक मेटाडेटा जनरेट करें
export async function generateMetadata({ params }) {
  const { category } = await params;
  
  // कैटेगरी का हिंदी नाम
  let categoryName = "सेलिब्रिटी";
  let categoryDisplay = "सेलिब्रिटी";
  
  if (category && category !== "all") {
    if (category === "bollywood") categoryDisplay = "बॉलीवुड";
    else if (category === "hollywood") categoryDisplay = "हॉलीवुड";
    else if (category === "tv") categoryDisplay = "टीवी";
    else if (category === "ott") categoryDisplay = "ओटीटी";
    else categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
    categoryName = categoryDisplay;
  }
    
  const pageTitle = `नवीनतम ${categoryName} फैशन ट्रेंड्स, सेलिब्रिटी स्टाइल्स और आउटफिट्स | EntertainIndia`;
  const pageDesc = `EntertainIndia के साथ ${categoryName} फैशन एक्सप्लोर करें। ${categoryName} सेलिब्रिटी रेड कार्पेट लुक्स, फैशन शो गैलरी और स्टाइल टिप्स के नवीनतम अपडेट्स पाएं।`;
  const pageUrl = `https://entertainindia.in/${category}/fashion`;

  const ogImage = "https://entertainindia.in/fashion-default-og.jpg";
  
  return {
    title: pageTitle,
    description: pageDesc,

    // ✅ रोबोट्स इंस्ट्रक्शन्स
    robots: {
      index: true,
      follow: true,
      nocache: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    // ✅ कैनोनिकल URL
    alternates: {
      canonical: pageUrl,
    },

    // ✅ ओपन ग्राफ (सोशल मीडिया शेयरिंग)
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
          alt: `EntertainIndia पर नवीनतम ${categoryName} फैशन ट्रेंड्स`,
        },
      ],
      locale: 'hi_IN',
      type: 'website',
    },

    // ✅ ट्विटर कार्ड
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

// ✅ मुख्य पेज कंपोनेंट
export default async function FashionCategoryPage({ params }) {
  const { category } = await params;
  
  // कैटेगरी का हिंदी नाम
  let categoryDisplay = "सेलिब्रिटी";
  if (category && category !== "all") {
    if (category === "bollywood") categoryDisplay = "बॉलीवुड";
    else if (category === "hollywood") categoryDisplay = "हॉलीवुड";
    else if (category === "tv") categoryDisplay = "टीवी";
    else if (category === "ott") categoryDisplay = "ओटीटी";
    else categoryDisplay = category.charAt(0).toUpperCase() + category.slice(1);
  }

  try {
    // ✅ कैटेगरी के हिसाब से गैलरी फेच करें
    const galleriesRes = await galleriesAPI.getAll({ 
      category: category,
      language: "hi",
    }).catch(err => {
      console.error("गैलरी फेच करने में त्रुटि:", err);
      return { galleries: [] };
    });

    // ✅ कैटेगरी के हिसाब से आर्टिकल्स फेच करें
    const articlesRes = await articlesAPI.getAll({
      category: category,
      related_to: "Fashion",
      language: "hi",
      pageSize: 50,
    }).catch(err => {
      console.error("आर्टिकल्स फेच करने में त्रुटि:", err);
      return { articles: [] };
    });

    // ✅ कैटेगरी के हिसाब से गैलरी फ़िल्टर करें
    const filteredGalleries = (galleriesRes?.galleries || []).filter(gallery => {
      if (gallery.categories && Array.isArray(gallery.categories)) {
        return gallery.categories.some(cat => 
          cat.slug === category || cat.name.toLowerCase() === category?.toLowerCase()
        );
      }
      return gallery.category?.slug === category || 
             gallery.category?.name?.toLowerCase() === category?.toLowerCase();
    });

    // ✅ डायनेमिक ब्रेडक्रंब स्कीमा (हिंदी)
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "होम", "item": "https://entertainindia.in" },
        { "@type": "ListItem", "position": 2, "name": categoryDisplay, "item": `https://entertainindia.in/${category}` },
        { "@type": "ListItem", "position": 3, "name": "फैशन", "item": `https://entertainindia.in/${category}/fashion` }
      ]
    };

    // ✅ डायनेमिक कलेक्शन स्कीमा (हिंदी)
    const collectionLd = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${categoryDisplay} फैशन ट्रेंड्स और सेलिब्रिटी स्टाइल्स`,
      "description": `${categoryDisplay} सेलिब्रिटी फैशन, रेड कार्पेट लुक्स और स्टाइल ट्रेंड्स के दैनिक अपडेट्स।`,
      "url": `https://entertainindia.in/${category}/fashion`,
      "inLanguage": "hi-IN",
      "mainEntity": {
        "@type": "ItemList",
        "itemListElement": (articlesRes?.articles || []).slice(0, 10).map((article, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "url": `https://entertainindia.in/article/${article.slug}`,
          "name": article.title
        }))
      }
    };

    // ✅ वेबसाइट स्कीमा
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": "https://entertainindia.in/#website",
      "url": "https://entertainindia.in",
      "name": "EntertainIndia",
      "description": "EntertainIndia - मनोरंजन जगत की ताज़ा खबरें, बॉलीवुड गपशप, और OTT अपडेट्स हिंदी में",
      "inLanguage": "hi-IN",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://entertainindia.in/search?q={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    };

    return (
      <LayoutWrapper>
        {/* ✅ स्कीमा इंजेक्शन */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, collectionLd, websiteSchema]) }}
        />

        <h1 className="sr-only">{categoryDisplay} फैशन समाचार और फोटो गैलरी</h1>
        <Fashion 
          initialGalleries={filteredGalleries} 
          initialArticles={articlesRes?.articles || []} 
          categorySlug={category}
        />
      </LayoutWrapper>
    );
  } catch (error) {
    console.error("फैशन पेज एसएसआर त्रुटि:", error);
    return <div>फैशन कंटेंट लोड करने में त्रुटि हुई।</div>;
  }
}