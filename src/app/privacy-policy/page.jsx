import PrivacyPage from '../../page-components/PrivacyPolicy';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'Privacy Policy - Data Protection & User Privacy | EntertainIndia',
  description: 'Read the Privacy Policy of EntertainIndia to understand how we collect, use, and protect your personal data.',
  keywords: 'privacy policy, data protection, cookies policy, entertainindia privacy',
  alternates: {
    canonical: 'https://entertainindia.in/privacy-policy',
  },
};

export default function Privacy() {
  // ---  1. Privacy Policy Schema ---
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "PrivacyPolicy",
    "name": "EntertainIndia Privacy Policy",
    "url": "https://entertainindia.in/privacy-policy",
    "description": "This policy describes how EntertainIndia collects and uses your information.",
    "mainEntityOfPage": "https://entertainindia.in/privacy-policy",
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
        "name": "Privacy Policy",
        "item": "https://entertainindia.in/privacy-policy"
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
        {/* SEO H1 Tag */}
        <h1 className="sr-only">Privacy Policy - EntertainIndia</h1>
        <PrivacyPage />
      </LayoutWrapper>
    </>
  );
}