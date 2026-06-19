"use client";

import CategorySearch from "../components/ui/CategorySearch";

export default function WebContentCategory({
  title,
  description,
  icon,
  onSearch,
  onLetterFilter,
  noPadding = false,
}) {
  const containerClass = noPadding ? "" : "container-custom";

  return (
    <>
      {/* HEADER */}
      <div className="border-b border-gray-300 dark:border-gray-700 pt-0 pb-4 mb-4">
        <div className={`${containerClass} flex items-center gap-4`}>
          <div>
            <div className="flex items-center gap-4">
              {icon}
              {/* SEO FIX: h1 टैग को बदलकर h2 किया गया ताकि एक पेज पर मल्टीपल h1 की समस्या न हो */}
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h2>
            </div>
            {description && (
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* SEARCH + ALPHABET */}
      <div className={containerClass}>
        <CategorySearch
          title={title}
          onSearch={onSearch}
          onLetterFilter={onLetterFilter}
        />
      </div>
    </>
  );
}