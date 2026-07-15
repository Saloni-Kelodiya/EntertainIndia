import { celebritiesAPI,} from '../../../lib/api/celebrities';
import { articlesAPI } from '../../../lib/api/articles';
import CategoryCelebritiesPage from '../../../page-components/Category_Celebpage';
import LaayoutWrapper from "../../LayoutWrapper";

export const dynamic = 'force-dynamic';
export const revalidate = 300;
export const fetchCache = 'force-cache';

//  SEO मेटाडेटा
export async function generateMetadata({ params }) {
  const { category } = await params;

  const categoryName = category ? category.charAt(0).toUpperCase() + category.slice(1) : "सेलिब्रिटी";
  const pageTitle = `टॉप ${categoryName} सेलिब्रिटी, बायोग्राफी और समाचार | एंटरटेनइंडिया`;
  const pageDesc = `${categoryName} सेलिब्रिटी की पूरी सूची देखें। एंटरटेनइंडिया पर उनकी बायोग्राफी, आने वाली फिल्में, नवीनतम फोटो और व्यक्तिगत जीवन की जानकारी पढ़ें।`;
  const pageUrl = `https://entertainindia.in/${category}/celebrities`;
  const ogImage = "/celebrity-default-og.jpg";

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
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: pageTitle,
      description: pageDesc,
      url: pageUrl,
      siteName: 'एंटरटेनइंडिया',
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: `${categoryName} सेलिब्रिटी - एंटरटेनइंडिया`,
        },
      ],
      locale: 'hi_IN',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle,
      description: pageDesc,
      images: [ogImage],
      creator: '@EntertainIndia',
    },
  };
}

export default async function Page({ params, searchParams }) {
  const { category } = await params;
  const sParams = await searchParams;
  
  const PAGE_SIZE = 8;
  const page = parseInt(sParams?.page) || 1;
  const profession = sParams?.profession || "";
  const search = sParams?.search || "";
  const letter = sParams?.letter || "";

  try {
    // सर्वर पर प्रारंभिक सेलिब्रिटी डेटा फेच करें
    const celebritiesData = await celebritiesAPI.getLightList({
      industry: category,
      page: page,
      pageSize: PAGE_SIZE,
      profession: profession || undefined,
      search: search || undefined,
      letter: letter || undefined,
    });

    // साइडबार/समाचार अनुभाग के लिए आर्टिकल फेच करें
    // वे आर्टिकल लें जहां कंटेंट टाइप "सेलिब्रिटी न्यूज़" है और मुख्य श्रेणी "समाचार" है
    const articlesData = await fetchCelebrityNewsArticles(category);

    // फ़िल्टर ड्रॉपडाउन के लिए प्रोफेशन फेच करें
    const professions = await fetchProfessions();

    // पेज काउंट सही से कैलकुलेट करें
    const total = celebritiesData?.pagination?.total || 0;
    const pageCount = Math.ceil(total / PAGE_SIZE) || 1;

    return (
      <>
      <h1 className="sr-only">
        {`टॉप ${category.charAt(0).toUpperCase() + category.slice(1)} सेलिब्रिटी, बायोग्राफी और समाचार | एंटरटेनइंडिया`}
      </h1>
      <LaayoutWrapper>
        <CategoryCelebritiesPage
          serverCategory={category}
          initialCelebrities={celebritiesData?.celebrities || []}
          initialPagination={{
            page: page,
            pageSize: PAGE_SIZE,
            pageCount: pageCount,
            total: total
          }}
          initialProfessions={professions}
          initialSearch={search}
          initialProfession={profession}
          initialLetter={letter}
          initialArticles={articlesData?.articles || []} // आर्टिकल्स क्लाइंट कम्पोनेंट को पास करें
        />
      </LaayoutWrapper>
      </>
    );
  } catch (error) {
    console.error("एसएसआर त्रुटि - सेलिब्रिटी फेच करने में विफल:", error);
    
    // त्रुटि स्थिति में खाली डेटा के साथ रिटर्न करें
    return (
      <LaayoutWrapper>
        <CategoryCelebritiesPage
          serverCategory={category}
          initialCelebrities={[]}
          initialPagination={{ 
            page: 1, 
            pageSize: PAGE_SIZE, 
            pageCount: 1, 
            total: 0 
          }}
          initialProfessions={[{ id: "all", name: "सभी", slug: "" }]}
          initialSearch=""
          initialProfession=""
          initialLetter=""
          initialArticles={[]} // त्रुटि पर खाली आर्टिकल्स
          error="सेलिब्रिटी लोड करने में विफल। कृपया बाद में पुनः प्रयास करें।"
        />
      </LaayoutWrapper>
    );
  }
}

// हेल्पर फंक्शन - सेलिब्रिटी समाचार आर्टिकल फेच करने के लिए
async function fetchCelebrityNewsArticles(category) {
  try {
    // विशिष्ट फ़िल्टर के साथ आर्टिकल फेच करें
    const articles = await articlesAPI.getAllLight({
      typecontent: "CelebrityNews", // आपके एक्चुअल कंटेंट टाइप के आधार पर
      mainCategory: "news",
      category: category, // वैकल्पिक: इंडस्ट्री के आधार पर फ़िल्टर करें (बॉलीवुड, हॉलीवुड, आदि)
      pageSize: 4, // साइडबार के लिए 5 आर्टिकल सीमित करें
      sort: "publishedAt:desc", // नवीनतम आर्टिकल पहले लाएं

    });
  
    return articles;
  } catch (err) {
    console.error("सेलिब्रिटी समाचार आर्टिकल फेच करने में त्रुटि:", err);
    return { articles: [] };
  }
}

// हेल्पर फंक्शन - प्रोफेशन फेच करने के लिए (कैश किया जा सकता है)
async function fetchProfessions() {
  try {
    const { ProfessionAPI } = await import('../../../lib/api');
    const data = await ProfessionAPI.getAll();
    return [...(data || [])];
  } catch (err) {
    console.error("प्रोफेशन फेच त्रुटि:", err);
    return [{ id: "all", name: "सभी", slug: "" }];
  }
}