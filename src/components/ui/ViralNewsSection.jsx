import Link from "next/link";
import Image from "next/image";
import { getStrapiMedia } from "../../lib/constants";
import { formatDate } from "../../lib/helpers";
import { Clock, Eye, Flame } from "lucide-react";
import { memo } from "react";

// Category Colors and Names
const categoryColors = {
  bollywood: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
  hollywood: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  ott: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  tv: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  tollywood: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  bhojiwood: "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300",
  korean: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300",
};

const categoryHindiNames = {
  bollywood: "बॉलीवुड",
  hollywood: "हॉलीवुड",
  ott: "ओटीटी",
  tv: "टीवी",
  tollywood: "टॉलीवुड",
  bhojiwood: "भोजीवुड",
  korean: "कोरियाई",
};

const getImageUrl = (article) => {
  const img = article?.heroImage || article?.hero_image || article?.image;
  const rawUrl = img?.formats?.medium?.url || img?.formats?.small?.url || img?.url;
  return rawUrl ? getStrapiMedia(rawUrl) : null;
};

// ✅ Memoized Secondary Article Card Component
const SecondaryArticleCard = memo(({ article }) => {
  const imgUrl = getImageUrl(article);
  
  return (
    <Link 
      href={`/news/${article.slug}`} 
      className="flex gap-4 px-2 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-lg border border-gray-100 dark:border-white/5 group"
    >
      <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
        {imgUrl ? (
          <Image 
            src={imgUrl} 
            alt={article.title} 
            fill 
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 112px, 112px"
            quality={75}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200 dark:bg-gray-700">
            🔥
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {article.category && (
          <span className={`inline-block mb-1 w-fit px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${categoryColors[article.category.slug] || "bg-gray-100 text-gray-600"}`}>
            {categoryHindiNames[article.category.slug] || article.category.name}
          </span>
        )}
        <h4 className="font-bold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
          {article.title}
        </h4>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(article.publishDate || article.publishedAt, 'relative')}
          </span>
        </div>
      </div>
    </Link>
  );
});

SecondaryArticleCard.displayName = 'SecondaryArticleCard';

export default function ViralNewsSection({ initialData = [] }) {
  const articles = initialData;

  if (!articles || articles.length === 0) return null;

  const sorted = [...articles].sort((a, b) => {
    const dateA = new Date(a.updatedAt || a.publishedAt);
    const dateB = new Date(b.updatedAt || b.publishedAt);
    return dateB - dateA;
  });

  const primary = sorted[0];
  const secondary = sorted.slice(1, 5);
  const primaryImg = getImageUrl(primary);

  return (
    <section className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4">
        
        {/* LEFT – Primary Article (Priority - NO lazy loading) */}
        <Link 
          href={`/news/${primary?.slug}`} 
          className="relative aspect-[4/3] lg:aspect-[3/2] rounded-2xl overflow-hidden group shadow-md"
        >
          {primaryImg ? (
            <Image 
              src={primaryImg} 
              alt={primary?.title || "Viral News"} 
              fill 
              priority={true}
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 55vw, 50vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              quality={75}
            />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl">🔥</div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent p-4 sm:p-6 flex flex-col justify-end">
            <div className="flex flex-wrap gap-2 mb-2">
              {primary?.category && (
                <span className={`px-3 py-1 text-[10px] font-bold rounded-full uppercase ${categoryColors[primary.category.slug] || "bg-white/20 text-white"}`}>
                  {categoryHindiNames[primary.category.slug] || primary.category.name}
                </span>
              )}
            </div>
            
            <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight">
              {primary?.title}
            </h3>
            
            <div className="text-xs text-gray-300 mt-3 flex gap-2 items-center">
              {primary?.authors?.[0]?.username && (
               <span className="text-sm font-semibold text-[#EC4899]">
                 @{primary.authors[0].username}
               </span>
             )}
              <span>•</span>
              <span>{formatDate(primary?.publishedAt, "relative")}</span>
            </div>
          </div>
        </Link>

        {/* RIGHT – Secondary Articles List (Lazy loaded images) */}
        <div className="flex flex-col gap-2">
          {secondary.map((article) => (
            <SecondaryArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}