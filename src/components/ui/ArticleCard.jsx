import Link from 'next/link';
import Image from 'next/image';
import { memo, useMemo } from 'react';
import { formatDate } from '../../lib/helpers';
import { getStrapiMedia } from '../../lib/constants';
import { Eye } from 'lucide-react';

// ✅ Category colors mapping (moved outside to avoid re-creation)
const categoryColors = {
  bollywood: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  hollywood: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  ott: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  tv: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  music: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  reviews: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  tollywood: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  bhojiwood: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  korean: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
};

const hindiCategory = {
  bollywood: "बॉलीवुड",
  hollywood: "हॉलीवुड",
  tollywood: "टॉलीवुड",
  bhojiwood: 'भोजीवुड',
  korean: "कोरियाई",
  ott: "ओटीटी",
  tv: "टीवी",
};

// ✅ Helper function outside component (better performance)
const getAuthorName = (article) => {
  const fallback = 'EntertainIndia Team';
  const authors = article.authors;

  if (!authors) return fallback;

  // If it's a simple array (Normalized)
  if (Array.isArray(authors) && authors.length > 0) {
    return authors[0].name || authors[0].attributes?.name || fallback;
  }

  // If it's a Strapi Object (Raw)
  if (authors.data && Array.isArray(authors.data) && authors.data.length > 0) {
    const firstAuthor = authors.data[0];
    return firstAuthor.attributes?.name || firstAuthor.name || fallback;
  }

  return fallback;
};

// ✅ Separate Image Component with AVIF optimization
const OptimizedArticleImage = memo(({ imgUrl, title, category }) => {
  const categoryName = category?.slug || category;
  const colorClass = categoryColors[categoryName] || 'bg-gray-100 text-gray-700';
  const categoryHindiName = hindiCategory[categoryName] || category?.name || '';

  if (!imgUrl) {
    return (
      <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-gray-200 dark:bg-gray-700">
        <div className="w-full h-full flex items-center justify-center">
          <span className="text-gray-400 text-4xl">📰</span>
        </div>
        {categoryHindiName && (
          <div className={`absolute bottom-3 left-3 px-3 py-1 text-xs font-medium rounded-full shadow ${colorClass}`}>
            {categoryHindiName}
          </div>
        )}
      </div>
    );
  }

  // ✅ Extract image dimensions for better performance
  const imageSizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw";
  
  return (
    <div className="relative h-56 w-full overflow-hidden rounded-2xl bg-gray-100">
      <Image
        src={imgUrl}
        alt={title}
        fill
        sizes={imageSizes}
        className="object-cover transition-transform duration-500 hover:scale-110"
        loading="lazy"
        quality={75}
        // ✅ Next.js automatically serves AVIF if browser supports
        // No need for manual conversion
      />
      {categoryHindiName && (
        <div className={`absolute bottom-3 left-3 px-3 py-1 text-xs font-medium rounded-full shadow backdrop-blur-sm ${colorClass}`}>
          {categoryHindiName}
        </div>
      )}
    </div>
  );
});

OptimizedArticleImage.displayName = 'OptimizedArticleImage';

// ✅ Main ArticleCard Component with memo
const ArticleCard = memo(({ article, category, featured = false, basePath = "/article" }) => {
  // Early return if no article
  if (!article || !article.slug) return null;

  // ✅ Memoize expensive calculations
  const imgUrl = useMemo(() => {
    return getStrapiMedia(
      article?.heroImage?.formats?.medium?.url ||
      article?.hero_image?.formats?.medium?.url ||
      article?.heroImage?.formats?.small?.url ||
      article?.heroImage?.url ||
      article?.heroimage?.url
    );
  }, [article?.heroImage, article?.hero_image, article?.heroimage]);

  const authorName = useMemo(() => getAuthorName(article), [article]);
  
  const formattedDate = useMemo(() => {
    return formatDate(article.publishDate, 'relative');
  }, [article.publishDate]);
  
  const correctPath = useMemo(() => {
  // शुरू में '/' लगाना सबसे जरूरी बदलाव है
  return `/${article.mainCategory || category || 'article'}/${article.slug}`;
}, [article.mainCategory, article.slug, category]);

  const categoryKey = article.category?.slug || category;
  const categoryHindiName = hindiCategory[categoryKey] || article.category?.name || '';
  
  // ✅ Don't show if no Hindi category name (optional filter)
  // if (!categoryHindiName) return null;

  return (
    <article className="card-theme group h-full">
      <Link href={correctPath} className="block h-full" prefetch={false}>
        {/* Image Section */}
        <OptimizedArticleImage 
          imgUrl={imgUrl} 
          title={article.title} 
          category={article.category}
        />

        {/* Content Section */}
        <div className="p-4">
          {/* Author + Time */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
            <span className="font-medium truncate max-w-[60%]">
              @{authorName}
            </span>
            <span className="flex-shrink-0">
              {formattedDate}
            </span>
          </div>

          {/* Title - ✅ Improved with better truncation */}
          <h3 className="font-bold text-base md:text-lg mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
            {article.title}
          </h3>

          {/* Summary - ✅ Only show if exists */}
          {article.summary && (
            <p className="text-sm text-gray-600 dark:text-gray-300 opacity-90 line-clamp-3">
              {article.summary}
            </p>
          )}

          {/* Views - ✅ Only show if > 0 */}
          {(article.views > 0) && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 mt-3">
              <Eye size={14} /> 
              <span>{article.views?.toLocaleString() || 0} views</span>
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison for better memoization
  return (
    prevProps.article?.id === nextProps.article?.id &&
    prevProps.article?.updatedAt === nextProps.article?.updatedAt &&
    prevProps.article?.views === nextProps.article?.views &&
    prevProps.category === nextProps.category
  );
});

ArticleCard.displayName = 'ArticleCard';

export default ArticleCard;