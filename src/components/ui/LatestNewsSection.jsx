import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { getStrapiMedia } from '../../lib/constants';
import { formatDate } from '../../lib/helpers';

const categoryHindiNames = {
  bollywood: "बॉलीवुड",
  hollywood: "हॉलीवुड",
  ott: "ओटीटी",
  tv: "टीवी",
  tollywood: "टॉलीवुड",
  bhojiwood: "भोजीवुड",
  korean: "कोरियाई",
};

// No "use client" – this is now a Server Component
export default function LatestNewsList ({ initialData = [] }) {
  if (!initialData || initialData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        कोई समाचार उपलब्ध नहीं
      </div>
    );
  }

  return (
    <div
      className="
        max-h-[500px] overflow-y-auto pr-2 space-y-3 p-1
        bg-gray-50 dark:bg-gray-900/50
        scrollbar-thin
        scrollbar-thumb-indigo-300
        scrollbar-track-transparent
        hover:scrollbar-thumb-indigo-500
      "
    >
      {initialData.map((article) => {
        // Get the best available image URL
        const imgUrl = getStrapiMedia(
          article?.heroImage?.formats?.thumbnail?.url ||
          article?.heroImage?.formats?.small?.url ||
          article?.heroImage?.url
        );

        const articleTitle = article.title || "समाचार";
        const altText = `${articleTitle} - समाचार थंबनेल`;

        return (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="
              flex gap-4 items-start p-1 rounded-xl
              bg-white hover:bg-gray-50
              dark:bg-gray-800 dark:hover:bg-gray-700
              transition-all duration-200
              border border-gray-100 dark:border-gray-700
              hover:shadow-md
              group
            "
            aria-label={articleTitle}
          >
            {/* Thumbnail Container - fixed dimensions prevent CLS */}
            <div className="relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt={altText}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                  sizes="(max-width: 768px) 112px, 112px"
                  quality={75}
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200 dark:bg-gray-700">
                  📰
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Category Badge */}
              {article.category?.slug && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-pink-600 text-white font-medium">
                  {categoryHindiNames[article.category.slug.toLowerCase()] || article.category.name}
                </span>
              )}

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                {articleTitle}
              </h3>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" />
                  {formatDate(article.publishDate, 'relative')}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}