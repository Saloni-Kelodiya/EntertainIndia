import FaqPage from '../../page-components/FaqPage';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'FAQ | EntertainIndia Hindi',
  description: 'EntertainIndia के बारे में अक्सर पूछे जाने वाले सवालों (FAQ) के जवाब यहाँ पढ़ें।',
  keywords: 'faq in hindi, frequently asked questions, entertainindia help, entertainment news faq hindi',
  alternates: {
    canonical: 'https://entertenindia.in/faq',
  },
};

export default function FAQ() {
  // --- ✅ FAQ Schema for Google Rich Results ---
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "EntertainIndia पर किस तरह का कंटेंट पब्लिश होता है?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "EntertainIndia पर बॉलीवुड, हॉलीवुड, OTT प्लेटफॉर्म और टीवी इंडस्ट्री से जुड़ी ताज़ा ख़बरें, रिव्यू और बॉक्स ऑफिस अपडेट्स पब्लिश किए जाते हैं।"
        }
      },
      {
        "@type": "Question",
        "name": "वेबसाइट को कितनी बार अपडेट किया जाता है?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "हमारी टीम दिन भर वेबसाइट को अपडेट करती रहती है ताकि आपको ब्रेकिंग न्यूज़ और ट्रेंडिंग स्टोरीज़ सबसे पहले मिल सकें।"
        }
      },
      {
        "@type": "Question",
        "name": "क्या फिल्मों और शोज़ के रिव्यू निष्पक्ष (unbiased) होते हैं?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "बिल्कुल। हमारी टीम बिना किसी बाहरी प्रभाव के पूरी ईमानदारी और निष्पक्षता के साथ रिव्यू लिखती है।"
        }
      },
      {
        "@type": "Question",
        "name": "क्या मैं EntertainIndia के लिए लिख सकता हूँ या कोई न्यूज़ टिप दे सकता हूँ?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "हाँ! हम हमेशा नए लेखकों और न्यूज़ टिप्स का स्वागत करते हैं। आप हमारे Contact पेज के ज़रिए या contact@entertenindia.in पर ईमेल करके हमसे जुड़ सकते हैं।"
        }
      }
    ]
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://entertenindia.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "FAQ",
        "item": "https://entertenindia.in/faq"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <LayoutWrapper>
        <h1 className="sr-only">अक्सर पूछे जाने वाले सवाल (FAQ) - EntertainIndia</h1>
        <FaqPage />
      </LayoutWrapper>
    </>
  );
}