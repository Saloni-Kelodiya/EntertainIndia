import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getStrapiMedia } from "../../lib/constants";
import { memo } from "react";

// ✅ Memoized Story Card Component
const StoryCard = memo(({ story, isFirst, isLast, meta }) => {
  const imageUrl = story.thumbnail?.url || story.coverImage?.url
    ? getStrapiMedia(story.thumbnail?.url || story.coverImage?.url)
    : null;

  return (
    <div className="relative flex-shrink-0 group">
      {/* STORY CARD */}
      <Link
        href={`/web-stories/${story.slug}`}
        className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-200 block w-40 snap-start"
        prefetch={false}
      >
        <div className="relative w-full aspect-[9/16] overflow-hidden bg-gradient-to-br from-purple-500 to-indigo-600">
          
          {/* IMAGE - Removed unoptimized for WebP conversion */}
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={story.title}
              fill
              sizes="160px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              quality={75}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-purple-500 to-indigo-600">
              📖
            </div>
          )}

          {/* TITLE */}
          <div className="absolute bottom-0 inset-x-0 p-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent">
            <h3 className="text-sm font-bold text-white line-clamp-2">
              {story.title}
            </h3>
          </div>
        </div>
      </Link>

      {/* 👈 PREV OVERLAY (UI ONLY) */}
      {isFirst && meta?.page > 1 && (
        <div className="pointer-events-none absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl shadow-lg text-sm font-medium">
            <ChevronLeft className="w-4 h-4" />
            Prev
          </div>
        </div>
      )}

      {/* 👉 NEXT OVERLAY (UI ONLY) */}
      {isLast && meta?.page < meta?.pageCount && (
        <div className="pointer-events-none absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-2xl z-20">
          <div className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-xl shadow-lg text-sm font-medium">
            Next
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}
    </div>
  );
});

StoryCard.displayName = 'StoryCard';

export default function WebStoriesSection({ initialData }) {
  // ✅ Get stories from initialData
  const stories = Array.isArray(initialData)
    ? initialData
    : initialData?.stories || [];

  const meta = initialData?.meta?.pagination;

  if (!stories.length) return null;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="relative">
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 min-w-max snap-x snap-mandatory pb-2">
            {stories.map((story, index) => {
              const isFirst = index === 0;
              const isLast = index === stories.length - 1;

              return (
                <StoryCard
                  key={story.id}
                  story={story}
                  isFirst={isFirst}
                  isLast={isLast}
                  meta={meta}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Optional: Scroll Hint Indicator */}
      {stories.length > 3 && (
        <div className="flex justify-center mt-4 gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600"></div>
          <div className="w-1.5 h-1.5 rounded-full bg-purple-600 dark:bg-purple-400"></div>
        </div>
      )}
    </div>
  );
}