import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { getStrapiMedia } from '../../lib/constants';
import { formatDate } from '../../lib/helpers';
import { memo } from 'react';

const categoryHindiNames = {
  bollywood: "बॉलीवुड",
  hollywood: "हॉलीवुड",
  ott: "ओटीटी",
  tv: "टीवी",
  tollywood: "टॉलीवुड",
  bhojiwood: "भोजीवुड",
  korean: "कोरियाई",
};

// ✅ Memoized component to prevent unnecessary re-renders
const CelebrityNewsCard = memo(({ article }) => {
  const imgUrl = getStrapiMedia(
    article?.heroImage?.formats?.medium?.url ||
    article?.heroImage?.formats?.small?.url ||
    article?.heroImage?.url
  );

  return (
    <Link
      href={`/news/${article.slug}`}
      className="
        bg-white dark:bg-gray-900 
        rounded-lg overflow-hidden 
        hover:shadow-lg hover:-translate-y-1
        transition-all duration-300 cursor-pointer group
      "
      prefetch={false} // Only prefetch on hover
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imgUrl ? (
          <Image
            src={imgUrl}
            alt={article.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            quality={75}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-200 dark:bg-gray-700">
            📰
          </div>
        )}

        {article.category?.name && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-pink-600 text-white font-medium shadow-md">
            {categoryHindiNames[article.category.slug] || article.category.name}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
          {article.title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(article.publishDate || article.publishedAt, 'relative')}
          </span>
        </div>
      </div>
    </Link>
  );
});

CelebrityNewsCard.displayName = 'CelebrityNewsCard';

export default function CelebrityNewsSection({ initialData = [] }) {
  if (!initialData || initialData.length === 0) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
      {initialData.map((article) => (
        <CelebrityNewsCard key={article.id} article={article} />
      ))}
    </div>
  );
}