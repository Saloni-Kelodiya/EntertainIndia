import TermsPage from '../../page-components/TermsPage';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'Terms & Conditions - User Service Agreement | EntertainIndia',
  description: 'Learn about terms and services at EntertainIndia. Understand our policies and guidelines.',
  keywords: 'terms, services, policies, guidelines',
  alternates: {
    canonical: 'https://entertainindia.in/terms-services',
  },
};

export default function TermsServices() {
  // ---  1. WebPage Schema (Legal Information) ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Terms and Services - EntertainIndia",
    "description": "The official terms and services policy of EntertainIndia, outlining user guidelines and legal agreements.",
    "publisher": {
      "@type": "Organization",
      "name": "EntertainIndia",
      "logo": {
        "@type": "ImageObject",
        "url": "https://entertainindia.in/og-logo.png"
      }
    }
  };

  // ---  2. Breadcrumb Schema ---
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://entertainindia.in"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Terms & Services",
        "item": "https://entertainindia.in/terms-services"
      }
    ]
  };

  return (
    <>
      {/*  Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <LayoutWrapper>
        <h1 className="sr-only">Terms and Services of EntertainIndia</h1>
        <TermsPage />
      </LayoutWrapper>
    </>
  );
}