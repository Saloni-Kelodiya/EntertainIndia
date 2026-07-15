"use client";

import Link from "next/link";
import { formatDate } from "../../lib/helpers";
import { getResponsiveImageUrl } from "../../lib/api/helper";
import OptimizedImage from "./OptimizedImage";

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

export default function FeaturedStories({ articles = [] }) {
  if (!articles || articles.length === 0) return null;

  // Sort by date (newest first)
  const sorted = [...articles].sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdAt).getTime();
    const dateB = new Date(b.publishDate || b.createdAt).getTime();
    if (dateB !== dateA) return dateB - dateA;
    return (b.id || 0) - (a.id || 0);
  });

  const primary = sorted[0];
  const secondary = sorted.slice(1, 5);

  // ⚡ LCP Fix: Desktop और बड़ी स्क्रीन के लिए 'large' यूज़ करें ताकि इमेज स्ट्रेच न हो
  const primaryImg = getResponsiveImageUrl(primary, "large");
  const placeholderImg = primaryImg ? getResponsiveImageUrl(primary, "thumbnail") : null;

  return (
    <section className="w-full px-3 sm:px-4 max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3 lg:gap-4 h-fit">
        
        {/* Primary Card */}
        <Link
          href={`/article/${primary?.slug}`}
          className="relative block w-full aspect-[16/11] sm:aspect-[3/2] rounded-xl sm:rounded-2xl overflow-hidden group"
        >
          <OptimizedImage
            src={primaryImg}
            alt={primary?.title || "Featured article"}
            type="featured"
            isPriority={true}              
            fetchPriority="high"           
            placeholder={placeholderImg ? "blur" : "empty"}
            blurDataURL={placeholderImg || undefined}
            // ⚡ LCP Fix: Layout के हिसाब से सही sizes (Desktop पर 1.2fr = ~60vw)
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 60vw"
            className="transition-transform duration-300 group-hover:scale-103"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-6 flex flex-col justify-end h-full">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {primary?.category && (
                <span className={`px-2.5 py-0.5 text-[11px] font-medium rounded-full ${categoryColors[primary.category.slug] || "bg-muted text-muted-foreground"}`}>
                  {categoryHindiNames[primary.category.slug] || primary.category.name}
                </span>
              )}
            </div>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white leading-tight tracking-tight line-clamp-3 sm:line-clamp-none">
              {primary?.title}
            </h3>
            <div className="text-[11px] sm:text-xs text-gray-300 mt-2 flex gap-2 items-center">
              {primary?.authors?.[0]?.username && (
                <span className="text-sm font-semibold text-[#EC4899]">
                  @{primary.authors[0].username}
                </span>
              )}
              <span>•</span>
              <span>{formatDate(primary?.publishDate, "relative")}</span>
            </div>
          </div>
        </Link>

        {/* Secondary Cards – lazy loaded */}
        <div className="flex flex-col gap-2.5 sm:gap-3 mt-1 lg:mt-0">
          {secondary.map((article) => {
            const imgUrl = getResponsiveImageUrl(article, "thumbnail");
            return (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="flex gap-3 p-2 rounded-xl bg-white dark:bg-gray-900 touch-manipulation hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-gray-100 dark:border-white/5 active:scale-[0.99]"
              >
                <div className="relative w-24 h-18 sm:w-28 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
                  <OptimizedImage
                    src={imgUrl}
                    alt={article.title || "Article thumbnail"}
                    type="thumbnail"
                    loading="lazy"
                    sizes="(max-width: 640px) 96px, 112px"
                  />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {article.category && (
                    <span className={`inline-block w-fit mb-1 px-2 py-0.5 text-[10px] font-medium rounded-full ${categoryColors[article.category.slug] || "bg-muted text-muted-foreground"}`}>
                      {categoryHindiNames[article.category.slug] || article.category.name}
                    </span>
                  )}
                  <h4 className="font-medium sm:font-semibold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="text-[10px] text-gray-400 dark:text-gray-500 mt-1 flex gap-2 items-center">
                    <span>{formatDate(article.publishDate || article.createdAt, "relative")}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}