import BoxOfficePage from '../../../page-components/BoxOfficePage';
import LayoutWrapper from '../../LayoutWrapper';
import { moviesAPI } from "../../../lib/api";
import { notFound } from 'next/navigation'; // ✅ 404 handle karne ke liye

// ✅ Force dynamic rendering
export const dynamic = 'force-dynamic';
export const revalidate = 300;
export const fetchCache = 'force-cache';


// ✅ Allowed Categories List (Iske alawa sab 404)
const ALLOWED_BOX_OFFICE_CATEGORIES = ['bollywood', 'tollywood', 'hollywood', 'bhojiwood', 'korean'];

// ✅ हिंदी ट्रांसलेशन (SEO, metadata aur schemas ke liye)
const categoryTranslations = {
  'bollywood': 'बॉलीवुड',
  'hollywood': 'हॉलीवुड',
  'tollywood': 'टॉलीवुड',
  'bhojiwood': 'भोजीवुड',
  'korean': 'कोरियाई',
};

// ✅ SEO: Dynamic Metadata Generation
export async function generateMetadata({ params }) {
  const { category } = await params;
  const categoryKey = category?.toLowerCase();

  // ❌ Agar category allowed list mein nahi hai, toh stop index
  if (!ALLOWED_BOX_OFFICE_CATEGORIES.includes(categoryKey)) {
    return {
      title: 'Page Not Found | EntertainIndia',
      robots: { index: false, follow: false },
    };
  }

  const categoryHindi = categoryTranslations[categoryKey] || categoryKey;

  // ✅ टाइटल
  let pageTitle = `${categoryHindi} बॉक्स ऑफिस कलेक्शन: वर्ल्डवाइड रैंकिंग | EntertainIndia`;
  if (pageTitle.length > 68) {
    pageTitle = pageTitle.slice(0, 65) + '...';
  }

  // ✅ डिस्क्रिप्शन
  let pageDesc = `नवीनतम ${categoryHindi} बॉक्स ऑफिस रिपोर्ट देखें। वर्ल्डवाइड कलेक्शन, बजट, और फिल्मों के वर्डिक्ट्स की तुलना करें। EntertainIndia के ऑफिशियल ट्रैकर पर।`;
  if (pageDesc.length > 155) {
    pageDesc = pageDesc.slice(0, 152) + '...';
  }

  return {
    title: pageTitle,
    description: pageDesc,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
      },
    },
    alternates: {
      canonical: `https://entertainindia.in/${categoryKey}/box-office`,
    },
    openGraph: {
      title: pageTitle.slice(0, 60),
      description: pageDesc.slice(0, 150),
      url: `https://entertainindia.in/${categoryKey}/box-office`,
      siteName: 'EntertainIndia',
      images: [{ 
        url: "/box-office-default-og.jpg", 
        width: 1200, 
        height: 630,
        alt: `${categoryHindi} बॉक्स ऑफिस रिपोर्ट`
      }],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle.slice(0, 60),
      description: pageDesc.slice(0, 150),
      images: ["/box-office-default-og.jpg"],
      creator: '@EntertainIndia',
    },
  };
}

// ✅ मेन कंपोनेंट
export default async function DynamicBoxOffice({ params, searchParams }) {
  const { category } = await params; 
  const categoryKey = category?.toLowerCase();
  
  // ❌ Strict Validation: Agar criteria match na ho toh seedhe Next.js 404 fetch karein
  if (!ALLOWED_BOX_OFFICE_CATEGORIES.includes(categoryKey)) {
    notFound();
  }

  const sParams = await searchParams;
  const page = parseInt(sParams.page) || 1;

  let initialData = { movies: [], pagination: null };
  let error = null;

  try {
    initialData = await moviesAPI.getAll({
      page,
      pageSize: 10,
      sort: "boxOffice.worldwideCollection:desc",
      category: categoryKey,
    });
  } catch (err) {
    console.error("सर्वर फेच एरर:", err);
    error = err.message;
  }

  const categoryHindi = categoryTranslations[categoryKey] || categoryKey;
  const siteUrl = 'https://entertainindia.in';

  // ✅ ब्रेडक्रंब स्कीमा - शुद्ध हिंदी में
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "होम", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": categoryHindi, "item": `${siteUrl}/${categoryKey}` },
      { "@type": "ListItem", "position": 3, "name": "बॉक्स ऑफिस", "item": `${siteUrl}/${categoryKey}/box-office` }
    ]
  };

  // ✅ आइटमलिस्ट स्कीमा (Cleaned Single Article URLs)
  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": `${categoryHindi} बॉक्स ऑफिस कलेक्शन सूची`,
    "description": `EntertainIndia पर ${categoryHindi} फिल्मों के कलेक्शन की सूची।`,
    "url": `${siteUrl}/${categoryKey}/box-office`,
    "numberOfItems": (initialData?.movies || []).length,
    "itemListElement": (initialData?.movies || []).slice(0, 10).map((movie, index) => {
      let imageUrl = movie.poster?.formats?.large?.url || movie.poster?.url || "/default-poster.jpg";
      const releaseDate = movie.releaseDate || null;
      
      let directorName = null;
      if (movie.crewMembers && Array.isArray(movie.crewMembers)) {
        const directorObj = movie.crewMembers.find(member => member.role === "Director");
        if (directorObj) directorName = directorObj.name;
      }
      
      return {
        "@type": "ListItem",
        "position": (page - 1) * 10 + (index + 1),
        "item": {
          "@type": "Movie",
          "name": movie.title,
          // ✅ FIXED PATTERN: Double '/movies' segments completely clean kar diye hain
          "url": `${siteUrl}/${movie.category?.slug }/${movie.slug}`,
          "image": imageUrl,
          ...(releaseDate && { dateCreated: releaseDate }),
          ...(directorName && { director: { "@type": "Person", "name": directorName } })
        }
      };
    })
  };

  // ✅ कलेक्शनपेज स्कीमा
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryHindi} बॉक्स ऑफिस कलेक्शन`,
    "description": `${categoryHindi} फिल्मों के बॉक्स ऑफिस कलेक्शन की विस्तृत जानकारी।`,
    "url": `${siteUrl}/${categoryKey}/box-office`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "EntertainIndia",
      "url": siteUrl
    }
  };

  return (
    <>
      {/* ✅ पैजिनेशन लिंक्स */}
      {page > 1 && (
        <link 
          rel="prev" 
          href={`${siteUrl}/${categoryKey}/box-office?page=${page - 1}`} 
        />
      )}
      {page < (initialData?.pagination?.pageCount || 1) && (
        <link 
          rel="next" 
          href={`${siteUrl}/${categoryKey}/box-office?page=${page + 1}`} 
        />
      )}

      {/* ✅ स्कीमा स्क्रिप्ट्स */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([breadcrumbLd, itemListLd, collectionLd]) }}
      />
      
      {/* ✅ हिडन H1 - सिर्फ गूगल के लिए */}
      <h1 className="sr-only">
        {categoryHindi} बॉक्स ऑफिस收藏 और रिपोर्ट | EntertainIndia
      </h1>
      
      <LayoutWrapper>
        {error && !initialData?.movies?.length ? (
          <div className="text-center py-20 px-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              ⚠️ बॉक्स ऑफिस डेटा लोड नहीं हो पाया
            </h2>
            <p className="text-gray-600">
              कृपया कुछ समय बाद पेज को रीलोड करके पुनः प्रयास करें।
            </p>
          </div>
        ) : (
          <BoxOfficePage 
            initialMovies={initialData?.movies || []} 
            initialPagination={initialData?.pagination}
            initialPage={page}
            serverCategory={categoryKey} 
          />
        )}
      </LayoutWrapper>
    </>
  );
}