import Link from 'next/link';
import Image from 'next/image';
import { Clock } from 'lucide-react';
import { getStrapiMedia } from '../../lib/constants';
import { formatDate } from '../../lib/helpers';
import { memo } from 'react';
import { getResponsiveImageUrl } from "../../lib/api/helper"; // आपका ग्लोबल इमेज हेल्पर
import OptimizedImage from "./OptimizedImage"; //  आपका ग्लोबल इमेज कंपोनेंट

const categoryHindiNames = {
  bollywood: "बॉलीवुड",
  hollywood: "हॉलीवुड",
  ott: "ओटीटी",
  tv: "टीवी",
  tollywood: "टॉलीवुड",
  bhojiwood: "भोजीवुड",
  korean: "कोरियाई",
};

//  Memoized Article Card Component for better performance
const ArticleCard = memo(({ article }) => {
  const imgUrl = getResponsiveImageUrl(article, "medium"); // ✅ "small" se "medium" kiya

  const categoryName = article?.categories?.[0]?.name || article?.category?.name;

  return (
    <Link
      href={`/article/${article.slug}`}
      className="flex flex-col w-full bg-white dark:bg-gray-900 rounded-xl overflow-hidden hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer group border border-gray-100 dark:border-gray-800"
      prefetch={false}
    >
      <div className="relative w-full aspect-[16/9] overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imgUrl ? (
          <OptimizedImage
            src={imgUrl}
            alt={article.title}
            type="featured"
            isPriority={false}
            quality={85} // ✅ quality badhayi
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // ✅ grid breakpoints se match
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200 dark:bg-gray-700">
            📰
          </div>
        )}

        <span className="absolute top-3 left-3 text-[10px] px-2.5 py-1 rounded-md bg-pink-600 text-white uppercase font-bold tracking-widest shadow-md">
          {categoryHindiNames[article.category?.slug] || categoryName}
        </span>
      </div>

      <div className="p-4 flex flex-col flex-grow space-y-3">
        <h3 className="text-sm font-bold line-clamp-2 text-gray-900 dark:text-white leading-tight group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors duration-200">
          {article.title}
        </h3>

        <div className="mt-auto flex items-center gap-3 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
          <Clock size={12} className="shrink-0" />
          <span>{formatDate(article.publishDate || article.publishedAt, 'relative')}</span>
        </div>
      </div>
    </Link>
  );
});

ArticleCard.displayName = 'ArticleCard';

export default function LatestArticlesSection({ initialData = [] }) {
  if (!initialData || initialData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 w-full">
      {initialData.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}