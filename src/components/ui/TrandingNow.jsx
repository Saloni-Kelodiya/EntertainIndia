"use client";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import { getResponsiveImageUrl } from "../../lib/api/helper"; //  आपका ग्लोबल इमेज हेल्पर
import OptimizedImage from "./OptimizedImage"; //  आपका ग्लोबल इमेज कंपोनेंट

const TrendingNow = ({ trendingList = [] }) => {
  
 const getImageUrl = (item) => {
  // ✅ FIX: pehle actual media object dhoondo, fir usko function ko do
  const mediaObj = item.poster || item.thumbnail || item.image || item.Avatar || item.avatar;
  const globalImg = getResponsiveImageUrl(mediaObj, "medium");
  if (globalImg) return globalImg;

  const directUrl = item.poster?.url || item.poster || item.thumbnail?.url || item.thumbnail || item.image?.url || item.Avatar?.url || item.avatar?.url || item.avatar || item.image || item.posterImage || item.thumbnailImage;
  if (directUrl && typeof directUrl === "string") return directUrl;

  return item.videoId ? `https://ytimg.com/vi/${item.videoId}/mqdefault.jpg` : null;
};
  if (!trendingList || trendingList.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-2 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">कोई ट्रेंडिंग सामग्री उपलब्ध नहीं</p>
      </div>
    );
  }

  //  नियम: एक रो में 6 कार्ड्स दिखाने के लिए लिस्ट को 6 पर लिमिट (slice) किया
  const limitedTrendingList = trendingList.slice(0, 6);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-4">
      {/*  रेस्पॉन्सिव स्मॉल लेआउट: 
          मोबाइल पर 2, छोटे टैबलेट पर 3, बड़े टैबलेट पर 4 और कंप्यूटर स्क्रीन (lg) पर बिल्कुल परफेक्ट 6 कार्ड्स एक ही रो में */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {limitedTrendingList.map((item, index) => {
          let itemHref = `/${item.path}/${item.slug || item.id}`;

          if (item.type === "music") {
            const catSlug = item.categories?.[0]?.slug ;
            itemHref = `/${catSlug}/music/${item.slug}`;
          }

          if (item.type === "movies") {
            const catSlug = item.category?.slug || item.categories?.[0]?.slug ;
            itemHref = `/${catSlug}/movies/${item.slug}`;
          }

          const imageUrl = getImageUrl(item);
          const itemTitle = item.title || item.name || "ट्रेंडिंग आइटम";
          const altText = `${itemTitle} - ${item.label} ट्रेंडिंग`;

          return (
            <Link
              key={`${item.type}-${item.id || index}`}
              href={itemHref}
              className="group relative block rounded-xl overflow-hidden bg-black shadow-sm active:scale-[0.99] touch-manipulation hover:scale-[1.02] transition-all duration-300 ease-in-out transform-gpu"
              aria-label={itemTitle}
            >
              {/* पोस्टर्स के लिए 3/4 आस्पेक्ट रेशियो जो छोटे साइज़ में भी कमाल का दिखता है */}
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-900">
                {imageUrl ? (
                 <OptimizedImage
  src={imageUrl}
  alt={altText}
  type="thumbnail"
  isPriority={index < 2}
  quality={85}
  sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
  className="transition-transform duration-500 ease-in-out group-hover:scale-105"
/>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <ImageIcon className="w-6 h-6 text-gray-600" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent pointer-events-none" />

                {/* लेबल टैग */}
                <div className="absolute bottom-10 left-2 bg-black/60 backdrop-blur-sm text-[9px] text-white px-2 py-0.5 rounded-full uppercase border border-white/10 font-medium z-10">
                  {item.label}
                </div>
              </div>

              {/* टाइटल टेक्स्ट बार */}
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                <h3 className="text-[11px] font-medium text-white line-clamp-2 leading-tight transition-colors duration-300 group-hover:text-pink-400">
                  {itemTitle}
                </h3>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default TrendingNow;
