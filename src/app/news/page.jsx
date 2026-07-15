import NewsPage from '../../page-components/NewsPage';
import LayoutWrapper from '../LayoutWrapper';
import { articlesAPI } from '../../lib/api/articles';

const BASE_URL     = 'https://entertainindia.in';
const MAIN_CATEGORY = 'news'; // locked — URL se kabhi nahi lenge
const PAGE_SIZE    = 12;

// News type display names (Hindi) — schema: typecontent enum
const TYPE_NAMES = {
  LatestNews:    'ताज़ा समाचार',
  CelebrityNews: 'सेलिब्रिटी समाचार',
  ViralNews:     'वायरल समाचार',
};

// ─── SEO Metadata ─────────────────────────────────────────────────────────────

export async function generateMetadata({ searchParams }) {
  const sParams  = await searchParams;
  const type     = sParams.type || null;
  const page     = Math.max(1, parseInt(sParams.page) || 1);
  const typeName = type ? (TYPE_NAMES[type] || type) : null;

  const title = typeName
    ? `${typeName}${page > 1 ? ` - पेज ${page}` : ''} | EntertainIndia`
    : `बॉलीवुड, हॉलीवुड, OTT: ताज़ा मनोरंजन समाचार${page > 1 ? ` - पेज ${page}` : ''} | EntertainIndia`;

  const description = typeName
    ? `${typeName} - बॉलीवुड, हॉलीवुड, टीवी और OTT जगत की ${typeName} हिंदी में पढ़ें EntertainIndia पर।`
    : `बॉलीवुड फिल्मों की गॉसिप, हॉलीवुड अपडेट्स, टीवी सीरियल्स, OTT वेब सीरीज और सेलिब्रिटी की सभी ताज़ा खबरें हिंदी में पढ़ें।`;

  const canonicalUrl = type
    ? `${BASE_URL}/news?type=${type}${page > 1 ? `&page=${page}` : ''}`
    : `${BASE_URL}/news${page > 1 ? `?page=${page}` : ''}`;

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index:  page === 1, // page 2+ index नहीं — duplicate content avoid
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

export default async function NewsListPage({ searchParams }) {
  const sParams     = await searchParams;
  const activeType  = sParams.type || null;
  const currentPage = Math.max(1, parseInt(sParams.page) || 1);

  // Validate type — sirf schema enum values accept karo, baaki ignore
  const validType = activeType && TYPE_NAMES[activeType] ? activeType : null;

  let articles   = [];
  let pagination = { page: currentPage, pageSize: PAGE_SIZE, total: 0, pageCount: 1 };

  try {
    const data = await articlesAPI.getAllLight({
      pageSize:     PAGE_SIZE,
      page:         currentPage,
      mainCategory: MAIN_CATEGORY, // हमेशा "news" — URL से नहीं लेते
      typeContent:  validType,
      sort:         'publishedAt:desc',
    });

    articles   = data.articles   || [];
    pagination = data.pagination || pagination;
  } catch (err) {
    console.error('NewsListPage fetch error:', err.message);
  }

  const typeName = validType ? TYPE_NAMES[validType] : null;

  return (
    <LayoutWrapper>
      {/* Screen-reader heading — SEO ke liye */}
      <h1 className="sr-only">
        {typeName
          ? `${typeName} - हिंदी मनोरंजन समाचार | EntertainIndia`
          : 'ताज़ा मनोरंजन समाचार - बॉलीवुड, हॉलीवुड, OTT, TV | EntertainIndia'}
      </h1>

      {articles.length === 0 && currentPage === 1 ? (
        <div className="text-center py-20 px-4">
          <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-4">
            कोई समाचार नहीं मिला
          </h2>
          <p className="text-gray-500">
            कृपया कुछ समय बाद पुनः प्रयास करें।
          </p>
        </div>
      ) : (
        <NewsPage
          initialArticles={articles}
          currentType={validType}
          pagination={pagination}
          currentPage={currentPage}
        />
      )}
    </LayoutWrapper>
  );
}