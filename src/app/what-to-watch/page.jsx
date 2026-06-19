import { articlesAPI, GenresAPI } from '../../lib/api';
import WhatToWatchClient from '../../page-components/WhatToWatch';
import LayoutWrapper from '../LayoutWrapper';

// ✅ लाइव कैश रोकने और नया डेटा लाने के लिए
export const dynamic = 'force-dynamic';

export async function generateMetadata() {
  const शीर्षक = "क्या देखें - बेस्ट मूवीज और वेब सीरीज सुझाव";
  const विवरण = "समय बर्बाद मत करो! देखें बेस्ट मूवीज और सीरीज। रोज़ाना क्यूरेटेड सुझाव Netflix, Prime Video, Hotstar और अन्य से।";
  
  return {
    title: शीर्षक,
    description: विवरण,
    keywords: 'क्या देखें, मूवी सुझाव, बेस्ट वेब सीरीज, नेटफ्लिक्स सुझाव, प्राइम वीडियो मूवीज',
    openGraph: {
      title: शीर्षक,
      description: विवरण,
      url: 'https://entertainindia.in/what-to-watch',
      siteName: 'EntertainIndia',
      type: 'website',
      locale: 'hi_IN', // ✅ हिंदी लोकेल
      images: [{
        url: 'https://entertainindia.in/og-what-to-watch.jpg',
        width: 1200,
        height: 630,
        alt: शीर्षक,
      }],
    },
    // ✅ ट्विटर कार्ड
    twitter: {
      card: 'summary_large_image',
      title: शीर्षक,
      description: विवरण,
      images: ['https://entertainindia.in/og-what-to-watch.jpg'],
      site: '@EntertainIndia',
    },
    alternates: {
      canonical: 'https://entertainindia.in/what-to-watch',
    },
    // ✅ सही Next.js रोबोट्स फॉर्मेट
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
  };
}

export default async function क्या_देखें_मूल_पेज() {
  try {
    const [लेख_प्रतिक्रिया, शैलियाँ] = await Promise.all([
      articlesAPI.getAll({
        pageSize: 200, // 🔥 पुराने लेख मिस न हों इसलिए 200 किया
        filters: {
          moderation_status: { $eq: 'published' },
          watching_platform: { $notNull: true } // 🔥 सिर्फ प्लेटफॉर्म वाले लेख
        },
        sort: 'publish_datetime:desc',
      }),
      GenresAPI.getAll()
    ]);

    const लेख = लेख_प्रतिक्रिया?.articles || [];

    // ✅ अतिरिक्त सुरक्षा फिल्टर
    const फ़िल्टर_किए_लेख = लेख.filter(लेख => 
      लेख.watching_platform && 
      Array.isArray(लेख.watching_platform) && 
      लेख.watching_platform.length > 0 &&
      लेख.watching_platform[0].platform !== ""
    );

    // --- स्कीमा ---
    const जेसन_एलडी = {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "सुझाई गई मूवीज और वेब सीरीज",
      "url": "https://entertainindia.in/what-to-watch",
      // ✅ सिर्फ टॉप 30 स्कीमा में भेजें
      "itemListElement": फ़िल्टर_किए_लेख.slice(0, 30).map((आइटम, सूचकांक) => ({
        "@type": "ListItem",
        "position": सूचकांक + 1,
        "url": `https://entertainindia.in/article/${आइटम.slug}`,
        "name": आइटम.title
      }))
    };

    const ब्रेडक्रंब_एलडी = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "होम", "item": "https://entertainindia.in" },
        { "@type": "ListItem", "position": 2, "name": "क्या देखें", "item": "https://entertainindia.in/what-to-watch" }
      ]
    };

   return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(जेसन_एलडी) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ब्रेडक्रंब_एलडी) }} />

        <LayoutWrapper>
          <h1 className="sr-only">क्या देखें: बेस्ट मूवीज और वेब सीरीज सुझाव</h1>
          
          <WhatToWatchClient 
            initialArticles={फ़िल्टर_किए_लेख} 
            initialGenres={शैलियाँ || []}
            serverCategory="सभी"
            serverPlatform="all"
          />
        </LayoutWrapper>
      </>
    );
  } catch (त्रुटि) {
    console.error("❌ क्या-देखें डेटा लाने में त्रुटि:", त्रुटि);
    return (
      <LayoutWrapper>
        <WhatToWatchClient 
          key="सभी-श्रेणियां" 
          initialArticles={[]} 
          initialGenres={[]} 
          serverCategory="सभी" 
          serverPlatform="सभी" 
        />
      </LayoutWrapper>
    );
  }
}