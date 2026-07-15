import DisclaimerPage from '../../page-components/DisclaimerPage';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'अस्वीकरण (Disclaimer) | मनोरंजन समाचार एवं सामग्री नीति - EntertainIndia ' ,
  description: 'EntertainIndia (entertenindia.in) का आधिकारिक अस्वीकरण (Disclaimer) पढ़ें। हमारी कंटेंट पॉलिसी और कॉपीराइट नियम।',
  keywords: 'disclaimer in hindi, entertainindia disclaimer, copyright policy hindi',
  alternates: {
    canonical: 'https://entertenindia.in/disclaimer',
  },
};

export default function Disclaimer() {
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
        "name": "Disclaimer",
        "item": "https://entertenindia.in/disclaimer"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <LayoutWrapper>
        <h1 className="sr-only">अस्वीकरण (Disclaimer) - EntertainIndia</h1>
        <DisclaimerPage />
      </LayoutWrapper>
    </>
  );
}