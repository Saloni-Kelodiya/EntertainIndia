import { webStoriesAPIServer } from '../../lib/api-server';
import WebStoriesPage from '../../page-components/WebStoriesPage';
import LayoutWrapper from '../LayoutWrapper';
import { notFound } from 'next/navigation';

// ✅ Dynamic Config - Fresh Data हमेशा
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// ✅ SEO मेटाडेटा (SEO लिमिट के साथ)
export async function generateMetadata() {
  // ✅ Title - MAX 60-70 characters
  const seoTitle = 'वेब स्टोरीज | शॉर्ट स्टोरीज |नवीनतम वेब स्टोरीज - EntertainIndia';
  // लंबाई: लगभग 55 characters
  
  // ✅ Description - MAX 150-160 characters
  const seoDescription = 'पढ़ें नवीनतम वेब स्टोरीज, शॉर्ट एंटरटेनमेंट स्टोरीज और एक्सक्लूसिव कंटेंट EntertainIndia पर।';
  // लंबाई: लगभग 120 characters (सेफ)

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: 'वेब स्टोरीज, शॉर्ट स्टोरीज, एंटरटेनमेंट स्टोरीज, वायरल स्टोरीज, हिंदी स्टोरीज, भोजपुरी स्टोरीज',
    alternates: {
      canonical: 'https://entertainindia.in/web-stories',
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-snippet': 150,
        'max-image-preview': 'large',
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: 'वेब स्टोरीज | शॉर्ट एंटरटेनमेंट स्टोरीज',
      description: seoDescription.slice(0, 150),
      url: 'https://entertainindia.in/web-stories',
      type: 'website',
      siteName: 'EntertainIndia',
      locale: 'hi_IN',
      images: [{
        url: 'https://entertainindia.in/web-stories-og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EntertainIndia वेब स्टोरीज'
      }],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'वेब स्टोरीज | EntertainIndia',
      description: seoDescription.slice(0, 150),
      images: ['https://entertainindia.in/web-stories-og-image.jpg'],
    },
    // ✅ अतिरिक्त SEO टैग्स
    category: 'entertainment',
    authors: [{ name: 'EntertainIndia Team' }],
    creator: 'EntertainIndia',
    publisher: 'EntertainIndia',
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
    verification: {
      google: 'your-google-verification-code', // ✅ Google Search Console के लिए
    },
    other: {
      'facebook-domain-verification': 'your-facebook-verification-code',
    },
  };
}

// ✅ WebStories स्कीमा (Google Web Stories के लिए जरूरी)
function generateWebStoriesSchema(stories) {
  if (!stories || stories.length === 0) return null;

  // ✅ सिर्फ 10 स्टोरीज दिखाएं (बहुत ज्यादा नहीं)
  const storyItems = stories.slice(0, 10).map((story, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "url": story.url || `https://entertainindia.in/web-stories/${story.slug}`,
    "name": story.title?.slice(0, 110) || 'वेब स्टोरी',
    "description": (story.description || story.excerpt || '').slice(0, 200),
    "image": story.coverImage?.url || story.image?.url || '',
    "datePublished": story.publishedAt || story.createdAt || new Date().toISOString(),
    "dateModified": story.updatedAt || story.publishedAt || new Date().toISOString(),
  }));

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "EntertainIndia वेब स्टोरीज",
    "description": "नवीनतम एंटरटेनमेंट वेब स्टोरीज और शॉर्ट स्टोरीज का संग्रह",
    "numberOfItems": stories.length,
    "itemListElement": storyItems,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": "https://entertainindia.in/web-stories"
    }
  };
}

// ✅ BreadcrumbList स्कीमा
function generateBreadcrumbSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "होम",
        "item": "https://entertainindia.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "वेब स्टोरीज",
        "item": "https://entertainindia.in/web-stories"
      }
    ]
  };
}

// ✅ CollectionPage स्कीमा (Web Stories के लिए)
function generateCollectionPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "वेब स्टोरीज | शॉर्ट एंटरटेनमेंट स्टोरीज",
    "description": "पढ़ें नवीनतम वेब स्टोरीज, शॉर्ट एंटरटेनमेंट स्टोरीज और एक्सक्लूसिव कंटेंट।",
    "url": "https://entertainindia.in/web-stories",
    "inLanguage": "hi-IN",
    "isPartOf": {
      "@type": "WebSite",
      "name": "EntertainIndia",
      "url": "https://entertainindia.in"
    },
    "about": {
      "@type": "Thing",
      "name": "Entertainment Stories"
    },
    "keywords": "वेब स्टोरीज, शॉर्ट स्टोरीज, एंटरटेनमेंट स्टोरीज"
  };
}

// ✅ मुख्य सर्वर कंपोनेंट
export default async function WebStories() {
  let stories = [];
  let error = null;

  try {
    const res = await webStoriesAPIServer.getAll();
    stories = res?.stories || [];
    
    // ✅ अगर कोई स्टोरी नहीं है तो 404 नहीं दिखाना (खाली पेज दिखाएं)
    if (stories.length === 0) {
      console.log('No web stories found');
    }
  } catch (e) {
    console.error('वेब स्टोरीज लोड करने में गड़बड़ी:', e);
    error = e.message;
  }

  // ✅ Schema जनरेट करें
  const webStoriesSchema = generateWebStoriesSchema(stories);
  const breadcrumbSchema = generateBreadcrumbSchema();
  const collectionPageSchema = generateCollectionPageSchema();

  return (
    <>
      {/* ✅ सभी Schema.org स्क्रिप्ट्स */}
      {webStoriesSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webStoriesSchema) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }}
      />

      <LayoutWrapper>
        <article>
          {/* ✅ Hidden SEO H1 - सिर्फ Google के लिए */}
        
          {/* ✅ एरर हैंडलिंग */}
          {error ? (
            <div className="text-center py-20 px-4">
              <h2 className="text-2xl font-bold text-red-600 mb-4">
                ⚠️ स्टोरीज लोड नहीं हो पाईं
              </h2>
              <p className="text-gray-600">
                कृपया कुछ समय बाद पुनः प्रयास करें।
              </p>
            </div>
          ) : (
            <WebStoriesPage stories={stories} />
          )}
        </article>
      </LayoutWrapper>
    </>
  );
}