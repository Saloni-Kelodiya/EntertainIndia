import { AwardsAPI} from "../../../../lib/api/awards";
import { articlesAPI } from "../../../../lib/api/articles";
import AwardDetailClient from "../../../../page-components/AwardDetailClient";
import LayoutWrapper from "../../../LayoutWrapper"; 
import { notFound } from "next/navigation"; // 👈 1. notFound को इम्पोर्ट करें

//  SEO: Dynamic Metadata Generation
export async function generateMetadata({ params }) {
  const { slug } = await params;
  
  try {
    const award = await AwardsAPI.getBySlug(slug);
    if (!award) return {}; // 👈 अगर अवार्ड नहीं है तो खाली ऑब्जेक्ट दें (यह अपने आप 404 पर चला जाएगा)

    const seoTitle = `${award.subTitle || award.title} Winners & Highlights | EntertainIndia`;
    const seoDesc = typeof award.description === 'string' 
      ? award.description.substring(0, 160) 
      : award.description?.[0]?.children?.[0]?.text?.substring(0, 160);

    return {
      title: seoTitle,
      description: seoDesc || `Get complete details of ${award.title}, winners list, nominees, and red carpet highlights.`,
      openGraph: {
        title: seoTitle,
        description: seoDesc,
        images: [{ url: award.image?.url || '' }],
      },
      robots: { index: true, follow: true },
    };
  } catch (error) {
    return {};
  }
}

export default async function Page({ params }) {
  const { slug, category } = await params; 
  
  try {
    //  Parallel Fetching for SEO Speed
    const award = await AwardsAPI.getBySlug(slug);

    // 👈 2. अगर अवार्ड नहीं मिलता है, तो Next.js का 404 पेज ट्रिगर करें
    if (!award) {
      notFound(); 
    }

    // Fetch articles and other awards in parallel
    const [articlesRes, awardsRes] = await Promise.all([
      articlesAPI.getAll({ category: 'awards', pageSize: 3 }),
      AwardsAPI.getAll({ pageSize: 10 }) // Get more awards for filtering
    ]);

    //  FIX: AwardsAPI.getAll returns { data, pagination }, not array
    const awardsList = awardsRes.data || [];
    
    // Data filtering for "Explore More"
    const otherAwards = awardsList
      .filter(a => a.id !== award.id)
      .slice(0, 3);

    const capitalizedCategory = category && category !== 'all' 
      ? category.charAt(0).toUpperCase() + category.slice(1) 
      : "Latest";

    // 1. Purana Event Schema
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": "Event",
      "name": award.title,
      "description": typeof award.description === 'string' 
        ? award.description.substring(0, 160) 
        : "Award ceremony winners and highlights.",
      "image": award.image?.url || "https://entertainindia.in//default-image.jpg",
      "startDate": award.date || new Date().toISOString(),
      "location": {
        "@type": "VirtualLocation",
        "url": `https://entertainindia.in//${category}/awards/${slug}`
      },
      "performer": {
        "@type": "Organization",
        "name": "EntertainIndia"
      }
    };

    // 2. NAYA Breadcrumb Schema
    const breadcrumbLd = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://entertainindia.in/" },
        { "@type": "ListItem", "position": 2, "name": capitalizedCategory, "item": `https://entertainindia.in/${category}` },
        { "@type": "ListItem", "position": 3, "name": "Awards", "item": `https://entertainindia.in/${category}/awards` },
        { "@type": "ListItem", "position": 4, "name": award.title, "item": `https://entertainindia.in/${category}/awards/${slug}` }
      ]
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }}
        />
        <LayoutWrapper>
          <AwardDetailClient 
            award={award} 
            initialHighlights={articlesRes.articles || []}
            initialOthers={otherAwards}
            serverCategory={category}
          />
        </LayoutWrapper>
      </>
    );
  } catch (error) {
    console.error("❌ Fetch error details:", {
      message: error.message,
      stack: error.stack
    });
    
    return (
      <LayoutWrapper>
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold text-red-500">Something went wrong</h2>
          <p className="text-gray-600 mt-2">Please try again later.</p>
        </div>
      </LayoutWrapper>
    );
  }
}