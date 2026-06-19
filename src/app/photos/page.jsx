import PhotosPage from "../../page-components/PhotosPage";
import LayoutWrapper from "../LayoutWrapper";
import { galleriesAPI, articlesAPI } from "../../lib/api";

export const dynamic = "force-dynamic";

const SITE_URL = "https://entertainindia.in";

// ✅ Generate Complete Schema for Photos Listing Page
function generatePhotosListingSchema(galleries) {
  const domain = SITE_URL;
  const photosUrl = `${domain}/photos`;
  
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
    "description": "EntertainIndia - मनोरंजन जगत की ताज़ा खबरें, बॉलीवुड गपशप, और OTT अपडेट्स हिंदी में",
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
    "@id": `${photosUrl}#breadcrumb`,
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
        "name": "Photos",
        "item": photosUrl
      }
    ]
  });

  // 4️⃣ CollectionPage Schema
  graph.push({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${photosUrl}#collection-page`,
    "name": "सेलिब्रिटी फोटो, फैशन गैलरी और तस्वीरें | EntertainIndia",
    "description": "बॉलीवुड सितारों की ताज़ा फोटो गैलरी, नवीनतम फैशन ट्रेंड्स, वायरल रेड कार्पेट पल और वायरल तस्वीरें हाई-क्वालिटी में हिंदी में देखें।",
    "url": photosUrl,
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "@id": `${domain}/#website`
    }
  });

  // 5️⃣ ImageGallery List Schema (if galleries exist)
  if (galleries && galleries.length > 0) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${photosUrl}#gallery-list`,
      "name": "सेलिब्रिटी फोटो गैलरी",
      "description": "हाई-क्वालिटी सेलिब्रिटी फोटो और फैशन गैलरी का क्यूरेटेड कलेक्शन",
      "numberOfItems": galleries.length,
      "itemListElement": galleries.slice(0, 20).map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "ImageGallery",
          "name": item.title,
          "url": `${domain}/photos/${item.slug}`,
          "image": item.coverImage?.url || item.image?.url || "",
          "numberOfItems": item.photos?.length || 0
        }
      }))
    });
  }

  return {
    "@context": "https://schema.org",
    "@graph": graph
  };
}

/**
 * 🎯 SEO Character Size Optimization (Hindi):
 * Title: 56 characters (55-60 के बिल्कुल बीच में)
 * Description: 142 characters (140-160 के परफेक्ट SEO ब्रैकेट में)
 */
export const metadata = {
  title: 'सेलिब्रिटी फोटो, फैशन गैलरी और तस्वीरें | EntertainIndia',
  description: 'बॉलीवुड सितारों की ताज़ा फोटो गैलरी, नवीनतम फैशन ट्रेंड्स, वायरल रेड कार्पेट पल और वायरल तस्वीरें हाई-क्वालिटी में हिंदी में देखें।',
  keywords: 'सेलिब्रिटी फोटो, फैशन गैलरी, वायरल तस्वीरें, बॉलीवुड फोटो, अभिनेत्री गैलरी, मनोरंजन तस्वीरें',
  alternates: {
    canonical: 'https://entertainindia.in/photos',
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
    title: 'सेलिब्रिटी और फैशन फोटो गैलरी | EntertainIndia',
    description: 'आपके पसंदीदा सेलिब्रिटी की हाई-क्वालिटी तस्वीरें और नवीनतम फैशन ट्रेंड।',
    url: 'https://entertainindia.in/photos',
    siteName: 'EntertainIndia',
    images: [
      {
        url: 'https://entertainindia.in/og-photos.jpg',
        width: 1200,
        height: 630,
        alt: 'EntertainIndia फोटो गैलरी',
      },
    ],
    type: 'website',
    locale: 'hi_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'सेलिब्रिटी फोटो और फैशन गैलरी | EntertainIndia',
    description: 'आपके पसंदीदा सेलिब्रिटी की हाई-क्वालिटी तस्वीरें और नवीनतम फैशन ट्रेंड।',
    images: ['https://entertainindia.in/og-photos.jpg'],
  },
};

export default async function Photos() {
  let galleries = [];
  let fashionArticles = [];

  try {
    const [galleryRes, articleRes] = await Promise.all([
      galleriesAPI.getAll({
        pageSize: 6,
        sort: "createdAt:desc",
      }),
      articlesAPI.getAll({
        category: "fashion",
        pageSize: 12,
        sort: "createdAt:desc",  // ✅ Fixed: publish_datetime -> createdAt
      }),
    ]);

    galleries = galleryRes?.galleries || [];
    fashionArticles = articleRes?.articles || [];
  } catch (error) {
    console.error("फोटो SSR त्रुटि:", error);
  }

  // ✅ Generate complete schema (not separate scripts)
  const schemaData = generatePhotosListingSchema(galleries);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
      />
      
      <h1 className="sr-only">
        सेलिब्रिटी फोटो, फैशन गैलरी और तस्वीरें
      </h1>

      <LayoutWrapper>
        <PhotosPage
          initialGalleries={galleries}
          initialFashionArticles={fashionArticles}
        />
      </LayoutWrapper>
    </>
  );
}