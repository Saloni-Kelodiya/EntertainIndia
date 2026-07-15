// app/[category]/awards/page.jsx
import AwardsPage from '../../../page-components/AwardsPage';
import LayoutWrapper from '../../LayoutWrapper';
import { AwardsAPI} from "../../../lib/api/awards";
import { articlesAPI } from '../../../lib/api/articles';

//  SEO: Dynamic Metadata Generation
export async function generateMetadata({ params }) {
  const { category } = await params;
  const capitalized = category && category !== 'all' 
    ? category.charAt(0).toUpperCase() + category.slice(1) 
    : "Latest";

  return {
    title: `${capitalized} Award Ceremonies & Winners List | EntertainIndia`,
    description: `Stay updated with the latest ${category} award  Explore winners list, nominees, event dates, and exclusive coverage of film awards on EntertainIndia.`,
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
    alternates: {
      canonical: `https://entertainindia.in/${category}/awards`,
    },
    openGraph: {
      title: `${capitalized} Movie Awards & Events`,
      description: `Complete coverage of ${category} award shows and winner announcements.`,
      type: 'website',
    },
  };
}

export default async function Awards({ params }) {
  const { category } = await params;

  let initialAwards = [];
  let initialArticles = [];

  try {
    console.log(`🔍 Fetching awards for category: ${category}`);
    
    // Fetch awards based on category
    const awardsResponse = await AwardsAPI.getAll({
      category: category !== 'all' ? category : undefined,
      pageSize: 50
    });
    
    initialAwards = awardsResponse.data || [];
    
    
    // Fetch articles
    const articlesData = await articlesAPI.getAll({ 
      category,
    related_to: 'Awards',
      pageSize: 6 
    });
  
    initialArticles = articlesData?.articles || [];
    
  } catch (error) {
    console.error("❌ Awards Page Fetch Error:", error);
    initialAwards = [];
    initialArticles = [];
  }

  const capitalizedCategory = category && category !== 'all' 
    ? category.charAt(0).toUpperCase() + category.slice(1) 
    : "Latest";

  // 1. Purana ItemList Schema
 const jsonLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "name": `${capitalizedCategory} Award Ceremonies`,
  "description": `...`,
  "itemListElement": initialAwards.map((award, index) => ({
    "@type": "ListItem",
    "position": index + 1,
    "item": {
      "@type": "Event",               // 👈 better than just a URL
      "name": award.title,
      "url": `https://entertainindia.in/${category}/awards/${award.slug}`,
      "startDate": award.event_date,  // agar API se mil raha ho
      "location": {
        "@type": "Place",
        "name": award.location
      },
      "image": award.image?.url       // agar image available ho
    }
  }))
};

  // 2. NAYA Breadcrumb Schema
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://entertainindia.in" },
      { "@type": "ListItem", "position": 2, "name": capitalizedCategory, "item": `https://entertainindia.in/${category}` },
      { "@type": "ListItem", "position": 3, "name": "Awards", "item": `https://entertainindia.in/${category}/awards` }
    ]
  };
 
  return (


    <>
    <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([jsonLd, breadcrumbLd]) }}
      />
    <LayoutWrapper>


      <h1 className="sr-only">
        {category === 'all' ? 'All Awards' : `${category} Awards`} Ceremonies and News
      </h1>
      
      <AwardsPage 
        serverCategory={category} 
        initialAwards={initialAwards} 
        initialArticles={initialArticles}
      />
    </LayoutWrapper>
    </>

  );
}