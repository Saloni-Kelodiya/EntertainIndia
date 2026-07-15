"use client";

import Link from "next/link";
import {Clock , Flame } from "lucide-react";
import { formatDate } from "../../lib/helpers";
import { memo } from "react";
import { getResponsiveImageUrl } from "../../lib/api/helper"; // आपका ग्लोबल इमेज हेल्पर
import OptimizedImage from "./OptimizedImage"; //  आपका ग्लोबल इमेज कंपोनेंट

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

//  Memoized Secondary Article Card Component
const SecondaryArticleCard = memo(({ article }) => {
  //  ग्लोबल हेल्पर से छोटे साइडबार थंबनेल के लिए सिर्फ 'small' इमेज निकाली
  const imgUrl = getResponsiveImageUrl(article, "small");
  
  return (
    <Link 
      href={`/news/${article.slug}`} 
      className="flex gap-3 p-2 rounded-xl bg-white dark:bg-gray-900 touch-manipulation hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all border border-gray-100 dark:border-white/5 active:scale-[0.99] group"
    >
      {/* मोबाइल के अनुकूल थंबनेल आकार फिक्स किया (w-24 h-18) */}
      <div className="relative w-24 h-18 sm:w-28 sm:h-20 rounded-lg overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800">
        {imgUrl ? (
          /*  आपके OptimizedImage कंपोनेंट का उपयोग */
          <OptimizedImage 
            src={imgUrl} 
            alt={article.title} 
            type="thumbnail" // मोबाइल पर 100px का साइज फिक्स करने के लिए
            isPriority={false}
            className="transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200 dark:bg-gray-700">
              <Flame size={32} />
          </div>
        )}
      </div>
      
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        {article.category && (
          <span className={`inline-block mb-1 w-fit px-2 py-0.5 text-[10px] font-bold rounded-full uppercase tracking-wide ${categoryColors[article.category.slug] || "bg-gray-100 text-gray-600"}`}>
            {categoryHindiNames[article.category.slug] || article.category.name}
          </span>
        )}
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
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
    const dateA = new Date(a.updatedAt || a.publishedAt).getTime();
    const dateB = new Date(b.updatedAt || b.publishedAt).getTime();
    return dateB - dateA;
  });

  const primary = sorted[0];
  const secondary = sorted.slice(1, 5);
  
  //  ग्लोबल हेल्पर से मुख्य बड़े बैनर के लिए 'medium' इमेज निकाली
  const primaryImg = getResponsiveImageUrl(primary, "medium");

  return (
    <section className="w-full px-3 sm:px-4">
      {/*  ग्रिड लेआउट: मोबाइल पर सिंगल कॉलम, डेस्कटॉप पर साइड-बाय-साइड */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-3 lg:gap-4">
        
        {/* LEFT – Primary Article (Priority - NO lazy loading) */}
        <Link 
          href={`/news/${primary?.slug}`} 
          className="relative block w-full aspect-[16/11] sm:aspect-[3/2] rounded-xl sm:rounded-2xl overflow-hidden group shadow-md"
        >
          {primaryImg ? (
            /*  मुख्य बैनर के लिए OptimizedImage का उपयोग */
            <OptimizedImage 
              src={primaryImg} 
              alt={primary?.title || "Viral News"} 
              type="featured" 
              isPriority={true} // LCP स्कोर बूस्ट करने के लिए तुरंत लोड करेगा
              className="transition-transform duration-500 group-hover:scale-103"
            />
          ) : (
            <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-4xl"><Flame size={64} /></div>
          )}
          
          {/* डार्क ओवरले ग्रेडिएंट */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent p-4 sm:p-6 flex flex-col justify-end">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              {primary?.category && (
                <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full uppercase ${categoryColors[primary.category.slug] || "bg-white/20 text-white"}`}>
                  {categoryHindiNames[primary.category.slug] || primary.category.name}
                </span>
              )}
            </div>
            
            {/*  रेस्पॉन्सिव फॉन्ट: मोबाइल पर हेडिंग का साइज छोटा किया */}
            <h3 className="text-lg sm:text-2xl font-bold text-white leading-tight tracking-tight line-clamp-3 sm:line-clamp-none">
              {primary?.title}
            </h3>
            
            <div className="text-[11px] sm:text-xs text-gray-300 mt-2 flex gap-2 items-center">
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

        {/* RIGHT – Secondary Articles List */}
        <div className="flex flex-col gap-2.5 mt-1 lg:mt-0">
          {secondary.map((article) => (
            <SecondaryArticleCard key={article.id} article={article} />
          ))}
        </div>
      </div>
    </section>
  );
}
