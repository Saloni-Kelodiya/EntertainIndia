import { articlesAPI } from '../../lib/api';
import LayoutWrapper from '../LayoutWrapper';
import ArticlePageClient from '../../page-components/ArticlePage';
import { notFound } from 'next/navigation';

// ✅ Dynamic rendering for fresh articles
export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// ✅ SEO Metadata
export async function generateMetadata({ searchParams }) {
  const sParams = await searchParams;
  const categorySlug = sParams.category || "all";
  const page = parseInt(sParams.page) || 1;
  const baseUrl = 'https://entertainindia.in';

  let title = categorySlug === 'all' 
    ? `सभी आर्टिकल | EntertainIndia`
    : `${categorySlug} आर्टिकल | EntertainIndia`;

  let description = `EntertainIndia पर नवीनतम मनोरंजन आर्टिकल और खबरें पढ़ें।`;

  return {
    title,
    description,
    alternates: {
      canonical: `${baseUrl}/article`,
    },
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: title,
      description: description,
      url: `${baseUrl}/article`,
      siteName: 'EntertainIndia',
      locale: 'hi_IN',
      type: 'website',
    },
  };
}

// ✅ Main Component
export default async function ArticlesListPage({ searchParams }) {
  const sParams = await searchParams;
  const categorySlug = sParams.category || 'all';
  const currentPage = parseInt(sParams.page) || 1;

  let articles = [];
  let pagination = { page: 1, pageSize: 12, total: 0, pageCount: 1 };
  let error = null;

  try {
    const data = await articlesAPI.getAll({
      pageSize: 12,
      page: currentPage,
      mainCategory: "article",
      category: categorySlug === 'all' ? null : categorySlug,
      sort: 'createdAt:desc',
    });

    articles = data.articles || [];
    pagination = data.pagination || { page: currentPage, pageSize: 12, total: articles.length, pageCount: 1 };

  } catch (err) {
    console.error("Articles List Page Error:", err);
    error = err.message;
  }

  return (
    <LayoutWrapper>
      {error && articles.length === 0 ? (
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            आर्टिकल लोड नहीं हो पाए
          </h2>
          <p className="text-gray-600">
            कृपया कुछ समय बाद पुनः प्रयास करें।
          </p>
        </div>
      ) : (
        <ArticlePageClient 
          initialArticles={articles} 
          currentCategory={categorySlug === 'all' ? null : categorySlug}
          pagination={pagination}
          currentPage={currentPage}
        />
      )}
    </LayoutWrapper>
  );
}