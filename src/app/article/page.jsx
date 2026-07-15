import { articlesAPI } from '../../lib/api';
import LayoutWrapper from '../LayoutWrapper';
import ArticlePageClient from '../../page-components/ArticlePage';

const BASE_URL = 'https://entertainindia.in';
const MAIN_CATEGORY = 'article'; // locked — kabhi nahi badlega
const PAGE_SIZE = 12;

// Category display names (Hindi) for better SEO titles
const CATEGORY_NAMES = {
  bollywood:  'बॉलीवुड',
  hollywood:  'हॉलीवुड',
  ott:        'OTT',
  tv:         'टीवी',
  tollywood:  'टॉलीवुड',
  bhojiwood:  'भोजीवुड',
  korean:     'कोरियन',
};

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }) {
  const sParams  = await searchParams;
  const catSlug  = sParams.category || null;
  const page     = Math.max(1, parseInt(sParams.page) || 1);
  const catName  = catSlug ? (CATEGORY_NAMES[catSlug] || catSlug) : null;

  const title = catName
    ? `${catName} आर्टिकल${page > 1 ? ` - पेज ${page}` : ''} | EntertainIndia`
    : `मनोरंजन आर्टिकल${page > 1 ? ` - पेज ${page}` : ''} | EntertainIndia`;

  const description = catName
    ? `${catName} से जुड़े नवीनतम आर्टिकल पढ़ें EntertainIndia पर। बॉलीवुड, OTT, TV और मनोरंजन जगत की ताज़ी खबरें।`
    : `EntertainIndia पर नवीनतम बॉलीवुड, हॉलीवुड, OTT और मनोरंजन जगत के आर्टिकल पढ़ें। हिंदी में ताज़ी खबरें और समीक्षाएं।`;

  const canonicalUrl = catSlug
    ? `${BASE_URL}/article?category=${catSlug}${page > 1 ? `&page=${page}` : ''}`
    : `${BASE_URL}/article${page > 1 ? `?page=${page}` : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      // Page 2+ को index न करें — duplicate content avoid करें
      index:  page === 1,
      follow: true,
    },
    openGraph: {
      title,
      description,
      url:      canonicalUrl,
      siteName: 'EntertainIndia',
      locale:   'hi_IN',
      type:     'website',
    },
    twitter: {
      card:        'summary_large_image',
      title,
      description,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ArticlesListPage({ searchParams }) {
  const sParams     = await searchParams;
  const catSlug     = sParams.category || null;
  const currentPage = Math.max(1, parseInt(sParams.page) || 1);

  let articles   = [];
  let pagination = { page: currentPage, pageSize: PAGE_SIZE, total: 0, pageCount: 1 };

  try {
    const data = await articlesAPI.getAllLight({
      pageSize:     PAGE_SIZE,
      page:         currentPage,
      mainCategory: MAIN_CATEGORY, // हमेशा "article" — URL से नहीं लेते
      category:     catSlug,
      sort:         'publishedAt:desc',
    });

    articles   = data.articles   || [];
    pagination = data.pagination || pagination;
  } catch (err) {
    console.error('ArticlesListPage fetch error:', err.message);
  }

  const catName = catSlug ? (CATEGORY_NAMES[catSlug] || catSlug) : null;

  return (
    <LayoutWrapper>
      {/* Screen-reader heading — SEO ke liye */}
      <h1 className="sr-only">
        {catName
          ? `${catName} आर्टिकल - हिंदी मनोरंजन समाचार | EntertainIndia`
          : 'मनोरंजन आर्टिकल - हिंदी में बॉलीवुड, OTT, TV खबरें | EntertainIndia'}
      </h1>

      {articles.length === 0 && currentPage === 1 ? (
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            कोई आर्टिकल नहीं मिला
          </h2>
          <p className="text-gray-500">
            कृपया कुछ समय बाद पुनः प्रयास करें।
          </p>
        </div>
      ) : (
        <ArticlePageClient
          initialArticles={articles}
          currentCategory={catSlug}
          pagination={pagination}
          currentPage={currentPage}
        />
      )}
    </LayoutWrapper>
  );
}