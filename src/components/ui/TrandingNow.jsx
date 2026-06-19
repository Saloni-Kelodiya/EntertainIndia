"use client";
import Link from "next/link";
import { ImageIcon } from "lucide-react";
import Image from "next/image";

const TrendingNow = ({ trendingList = [] }) => {
  const getImageUrl = (item) => {
    const posterUrl = item.poster?.url || item.poster;
    const thumbnailUrl = item.thumbnail?.url || item.thumbnail;
    const imageUrl = item.image?.url || item.image;
    const avatarUrl = item.avatar?.url || item.avatar;
    const AvatarUrl = item.Avatar?.url || item.Avatar;

    return (
      posterUrl ||
      thumbnailUrl ||
      imageUrl ||
      avatarUrl ||
      AvatarUrl ||
      (item.videoId && `https://i.ytimg.com/vi/${item.videoId}/mqdefault.jpg`) ||
      "/placeholder-image.jpg"
    );
  };

  if (!trendingList.length) {
    return (
      <div className="max-w-7xl mx-auto px-2 py-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">कोई ट्रेंडिंग सामग्री उपलब्ध नहीं</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-2">
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2">
        {trendingList.map((item, index) => {
          let itemHref = `/${item.path}/${item.slug || item.id}`;

          if (item.type === "music") {
            const catSlug = item.categories?.[0]?.slug || "bollywood";
            itemHref = `/${catSlug}/music/${item.slug}`;
          }

          if (item.type === "movies") {
            const catSlug = item.category?.slug || item.categories?.[0]?.slug || "bollywood";
            itemHref = `/${catSlug}/movies/${item.slug}`;
          }

          const imageUrl = getImageUrl(item);
          const itemTitle = item.title || item.name || "ट्रेंडिंग आइटम";
          const altText = `${itemTitle} - ${item.label} ट्रेंडिंग`;

          return (
            <Link
              key={`${item.type}-${item.id || index}`}
              href={itemHref}
              className="group relative block rounded-xl overflow-hidden bg-black shadow-md hover:scale-[1.03] transition-all duration-300 ease-in-out transform-gpu"
              aria-label={itemTitle}
            >
              <div className="relative w-full aspect-[3/4] overflow-hidden bg-gray-800">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={altText}
                    fill
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 16vw, 14vw"
                    className="object-cover transition-all duration-500 ease-in-out group-hover:scale-110"
                    quality={75}
                    priority={index < 4}
                    loading={index < 4 ? "eager" : "lazy"}
                    decoding="async"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-700">
                    <ImageIcon className="w-8 h-8 text-gray-500" />
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />

                <div className="absolute bottom-10 left-2 bg-black/60 backdrop-blur-sm text-[9px] text-white px-2 py-0.5 rounded-full uppercase border border-white/10 font-medium z-10">
                  {item.label}
                </div>
              </div>

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