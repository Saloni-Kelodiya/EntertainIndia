"use client";  // ✅ यह जरूरी है क्योंकि component में client-side interactivity (hover, etc.) है

import Link from "next/link";
import Image from "next/image";
import { getStrapiMedia } from "../../lib/constants";
import { formatDate } from "../../lib/helpers";

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

export default function FeaturedStories({ articles = [] }) {
  if (!articles || articles.length === 0) return null;

  const sorted = [...articles].sort((a, b) => {
    const dateA = new Date(a.publishDate || a.createdAt).getTime();
    const dateB = new Date(b.publishDate || b.createdAt).getTime();
    if (dateB !== dateA) return dateB - dateA;
    return (b.id || 0) - (a.id || 0);
  });

  const primary = sorted[0];
  const secondary = sorted.slice(1, 5);
  const primaryImg = getImageUrl(primary);

  return (
    <section className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-4 h-fit">
        <Link href={`/article/${primary?.slug}`} className="relative aspect-[4/3] lg:aspect-[3/2] rounded-2xl overflow-hidden group">
          {primaryImg ? (
            <Image 
              src={primaryImg} 
              alt={primary?.title || "Featured Image"} 
              fill 
              priority={true}
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              quality={75}
            />
          ) : (
            <div className="w-full h-full bg-muted flex items-center justify-center text-4xl">📰</div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-6 flex flex-col justify-end h-full">
            <div className="flex flex-wrap gap-2 mb-2">
              {primary?.category && (
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColors[primary.category.slug] || "bg-muted text-muted-foreground"}`}>
                  {categoryHindiNames[primary.category.slug] || primary.category.name}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-3xl font-bold text-white leading-tight">{primary?.title}</h3>
            <div className="text-xs text-gray-300 mt-3 flex gap-2 items-center">
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

        <div className="lg:h-full flex flex-col gap-3">
          {secondary.map((article) => {
            const imgUrl = getImageUrl(article);
            return (
              <Link key={article.id} href={`/article/${article.slug}`} className="flex gap-4 px-2 py-2 rounded-xl bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-200 hover:shadow-lg border border-gray-200 dark:border-white/10">
                <div className="relative w-28 h-20 rounded-lg overflow-hidden shrink-0">
                  <Image 
                    src={imgUrl || "/placeholder.jpg"} 
                    alt={article.title} 
                    fill 
                    className="object-cover" 
                    loading="lazy"
                    decoding="async"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {article.category && (
                    <span className={`inline-block mb-1 px-2 py-0.5 text-xs font-medium rounded-full ${categoryColors[article.category.slug] || "bg-muted text-muted-foreground"}`}>
                      {categoryHindiNames[article.category.slug] || article.category.name}
                    </span>
                  )}
                  <h4 className="font-semibold text-slate-900 dark:text-white text-sm leading-tight line-clamp-2">{article.title}</h4>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex gap-2 items-center">
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