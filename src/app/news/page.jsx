import NewsPage from '../../page-components/NewsPage';
import LayoutWrapper from '../LayoutWrapper';
import { articlesAPI } from '../../lib/api';
import { notFound } from 'next/navigation';

// ✅ Dynamic rendering for fresh news
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// ✅ SEO: Dynamic Metadata Generation
export async function generateMetadata({ searchParams }) {
  const sParams = await searchParams;
  const activeType = sParams.type || "Latest";
  const page = parseInt(sParams.page) || 1;

  const siteUrl = 'https://entertainindia.in';

  return {
   title: `बॉलीवुड, हॉलीवुड, टीवी, OTT: ताज़ा मनोरंजन समाचार | EntertainIndia`,
description: `बॉलीवुड फिल्मों की गॉसिप, हॉलीवुड अपडेट्स, टीवी सीरियल्स के ट्विस्ट, OTT वेब सीरीज की खबरें और एंटरटेनमेंट जगत की सभी ताज़ा खबरें हिंदी में पढ़ें।`,
    alternates: {
      canonical: `${siteUrl}/news`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: `मनोरंजन समाचार | EntertainIndia`,
      description: `बॉलीवुड, हॉलीवुड, सेलिब्रिटी और मनोरंजन जगत की ताज़ा खबरें।`,
      url: `${siteUrl}/news`,
      siteName: 'EntertainIndia',
      locale: 'hi_IN',
      type: 'website',
    },
  };
}

// ✅ MAIN COMPONENT
export default async function News({ searchParams }) {
  const sParams = await searchParams;
  const activeType = sParams.type || null;
  const currentPage = parseInt(sParams.page) || 1;

  let articles = [];
  let pagination = { page: 1, pageSize: 12, total: 0, pageCount: 1 };
  let error = null;

  try {
    const data = await articlesAPI.getAll({
      pageSize: 12,
      page: currentPage,
      mainCategory: "news",
      typeContent: activeType,
      sort: 'createdAt:desc',
    });

    articles = data.articles || [];
    pagination = data.pagination || { page: currentPage, pageSize: 12, total: articles.length, pageCount: 1 };

  } catch (err) {
    console.error("News Page Error:", err);
    error = err.message;
  }

  return (
    <LayoutWrapper>
      {error && articles.length === 0 ? (
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            समाचार लोड नहीं हो पाए
          </h2>
          <p className="text-gray-600">
            कृपया कुछ समय बाद पुनः प्रयास करें।
          </p>
        </div>
      ) : (
        <NewsPage 
          initialArticles={articles} 
          currentType={activeType}
          pagination={pagination}
        />
      )}
    </LayoutWrapper>
  );
}