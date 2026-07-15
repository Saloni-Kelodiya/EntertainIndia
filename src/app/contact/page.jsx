import ContactPage from '../../page-components/ContactPage';
import LayoutWrapper from '../LayoutWrapper';

export const metadata = {
  title: 'Contact Us | EntertainIndia - Get in Touch',
  description: 'Have any queries, feedback, or business inquiries? Contact the EntertainIndia team via email or our contact form. We are here to help!',
  keywords: 'contact, contact us, email, feedback, inquiries, EntertainIndia support',
  alternates: {
    canonical: 'https://entertainindia.in/contact',
  },
};

export default function Contact() {
  // ---  1. Contact Page Schema ---
  const contactJsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": "Contact Us - EntertainIndia",
    "description": "Contact page for EntertainIndia to handle queries, feedback, and business inquiries.",
    "url": "https://entertainindia.in/contact",
    "mainEntity": {
      "@type": "Organization",
      "name": "EntertainIndia",
      "logo": "https://entertainindia.in/og-logo.png",
      "contactPoint": {
        "@type": "ContactPoint",
        "email": "contact@entertainindia.in", // Aapka official email yahan aayega
        "contactType": "customer service"
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
        "name": "Contact Us",
        "item": "https://entertainindia.in/contact"
      }
    ]
  };

  return (
    <>
      {/*  Structured Data Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <LayoutWrapper>
        {/*  SEO H1 (Screen Reader Only) */}
        <h1 className="sr-only">Contact EntertainIndia - Feedback and Inquiries</h1>
        
        <ContactPage />
      </LayoutWrapper>
    </>
  );
}