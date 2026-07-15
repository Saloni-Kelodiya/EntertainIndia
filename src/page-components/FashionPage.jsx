"use client";

import { useMemo, useState, useCallback, memo } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Heart, Crown, Shirt, Camera, TrendingUp, Grid, List, Eye, Calendar } from "lucide-react";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import Image from "next/image";

const filterIcons = {
  "red-carpet": Crown,
  "pink-carpet": Crown,
  "casual": Shirt,
  "photoshoot": Camera,
  "trends": TrendingUp,
  "met-gala": Crown,
  "default": Sparkles,
};

const englishToHindiFilter = {
  "all": "सभी",
  "red-carpet": "रेड कार्पेट",
  "pink-carpet": "पिंक कार्पेट",
  "casual": "कैज़ुअल",
  "photoshoot": "फोटोशूट",
  "trends": "ट्रेंड्स",
  "met-gala": "मेट गाला",
};

const fashionCategoryMap = {
  "red carpet": "रेड कार्पेट",
  "pink carpet": "पिंक कार्पेट",
  "red-carpet": "रेड कार्पेट",
  "pink-carpet": "पिंक कार्पेट",
  "casual": "कैज़ुअल",
  "photoshoot": "फोटोशूट",
  "trends": "ट्रेंड्स",
  "met gala": "मेट गाला",
  "met-gala": "मेट गाला",
};

const getHindiFashionCategory = (englishValue) => {
  if (!englishValue) return "";
  return fashionCategoryMap[englishValue.toLowerCase()] || englishValue;
};

const formatShortDate = (dateStr) =>
  dateStr
    ? new Date(dateStr).toLocaleDateString("hi-IN", { month: "short", day: "numeric" })
    : "हाल ही में";

const formatFullDate = (dateStr) =>
  dateStr ? new Date(dateStr).toLocaleDateString("hi-IN") : "हाल ही में";

//  Reusable, memoized gallery card
const GalleryCard = memo(function GalleryCard({ gallery, onClick }) {
  return (
    <div
      onClick={() => onClick(gallery.slug)}
      className="group relative overflow-hidden rounded-xl bg-gray-200 dark:bg-gray-800 aspect-[3/4] cursor-pointer hover:shadow-2xl hover:shadow-pink-600/20 transition-all duration-300 hover:-translate-y-1"
    >
      {gallery.image?.url ? (
        <div className="absolute inset-0">
          <Image
            src={gallery.image.url}
            alt={gallery.title || "Gallery image"}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-300 dark:bg-gray-800">
          <Camera className="w-16 h-16 text-gray-500 dark:text-gray-600" />
        </div>
      )}

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

      <button
        onClick={(e) => e.stopPropagation()}
        className="absolute top-3 right-3 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-pink-600/80 transition-colors z-10"
      >
        <Heart className="w-5 h-5 text-white" />
      </button>

      {gallery.photos?.length > 1 && (
        <div className="absolute top-3 left-3 bg-pink-600 rounded-full px-3 py-1 text-white font-bold text-xs z-10">
          +{gallery.photos.length - 1}
        </div>
      )}

      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-white text-sm font-bold line-clamp-2 group-hover:text-pink-300 transition-colors">
          {gallery.title}
        </h3>
      </div>

      {gallery.fashionCategory && gallery.fashionCategory !== "all" && (
        <div className="absolute bottom-14 left-4 z-10">
          <span className="inline-block bg-pink-600/90 text-white text-xs px-3 py-1 rounded-full font-medium">
            {getHindiFashionCategory(gallery.fashionCategory)}
          </span>
        </div>
      )}
    </div>
  );
});

//  Single reusable ArticleCard used everywhere (fixes duplication + the 'relative' bug)
const ArticleCard = memo(function ArticleCard({ article, variant = "grid", compact = false }) {
  const dateLabel = compact ? formatShortDate(article.publishDate) : formatFullDate(article.publishDate);

  if (variant === "list") {
    return (
      <a
        href={`/article/${article.slug}`}
        className="group flex gap-4 card-theme overflow-hidden hover:shadow-2xl hover:shadow-pink-600/20 transition-all duration-300 p-4"
      >
        <div className="relative w-40 sm:w-48 h-28 sm:h-32 flex-shrink-0 overflow-hidden rounded-lg">
          {article.heroImage?.url ? (
            <Image
              src={article.heroImage.url}
              alt={article.title || "Article thumbnail"}
              fill
              sizes="192px"
              className="object-cover group-hover:scale-110 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-3xl">
              📰
            </div>
          )}
        </div>
        <div className="flex-1 flex flex-col justify-between min-w-0">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              {article.category && (
                <span className="bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold">
                  {article.category.name}
                </span>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-500">
                <Calendar className="w-3 h-3" />
                <span>{dateLabel}</span>
              </div>
            </div>
            <h3 className="text-gray-900 dark:text-white font-bold text-lg sm:text-xl line-clamp-2 mb-2 group-hover:text-pink-400 transition-colors">
              {article.title}
            </h3>
            {article.summary && (
              <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 sm:line-clamp-3 mb-2">
                {article.summary}
              </p>
            )}
          </div>
          <div className="flex items-center gap-4 text-xs text-gray-600 dark:text-gray-500 mt-1">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views || 0} व्यूज</span>
            </div>
          </div>
        </div>
      </a>
    );
  }

  // grid variant
  return (
    <a
      href={`/article/${article.slug}`}
      className="group card-theme overflow-hidden hover:shadow-2xl hover:shadow-pink-600/20 transition-all duration-300 hover:-translate-y-1"
    >
      <div className={`relative overflow-hidden ${compact ? "h-40" : "h-48"}`}>
        {article.heroImage?.url ? (
          <Image
            src={article.heroImage.url}
            alt={article.title || "Article thumbnail"}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
            <span className="text-gray-500 dark:text-gray-500 text-4xl">📰</span>
          </div>
        )}
        {!compact && article.category && (
          <div className="absolute top-3 left-3 bg-pink-600 text-white text-xs px-3 py-1 rounded-full font-semibold z-10">
            {article.category.name}
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-gray-900 dark:text-white font-bold text-lg line-clamp-2 mb-2 group-hover:text-pink-400 transition-colors">
          {article.title}
        </h3>
        {!compact && article.summary && (
          <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-3">
            {article.summary}
          </p>
        )}
        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-500">
          {!compact && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>{article.views || 0}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{dateLabel}</span>
          </div>
        </div>
      </div>
    </a>
  );
});
const ViewToggle = memo(function ViewToggle({ mode, onChange }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onChange("grid")}
        className={`p-2.5 rounded-lg transition-all ${
          mode === "grid"
            ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
            : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-neutral-700"
        }`}
      >
        <Grid className="w-5 h-5" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={`p-2.5 rounded-lg transition-all ${
          mode === "list"
            ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
            : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-neutral-700"
        }`}
      >
        <List className="w-5 h-5" />
      </button>
    </div>
  );
});

export default function FashionPage({ initialGalleries, initialArticles, categorySlug = "bollywood" }) {
  const [galleries] = useState(initialGalleries);
  const [articles] = useState(initialArticles);

  const [activeFilter, setActiveFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("looks");
  const [previewViewMode, setPreviewViewMode] = useState("grid");
  const [viewMode, setViewMode] = useState("grid");
  const [displayCount, setDisplayCount] = useState(8);
  const [previewCount, setPreviewCount] = useState(8);

  const router = useRouter();

  const fashionFilters = useMemo(() => {
    const uniqueCategories = new Map();
    uniqueCategories.set("all", { id: "all", label: "सभी", icon: Sparkles });

    galleries.forEach((gallery) => {
      if (gallery.fashionCategory && gallery.fashionCategory !== "all") {
        let catId = gallery.fashionCategory.toLowerCase().replace(/\s+/g, "-");
        if (catId === "red-carpet" || catId === "red carpet") catId = "red-carpet";
        if (catId === "pink-carpet" || catId === "pink carpet") catId = "pink-carpet";
        if (catId === "met-gala" || catId === "met gala") catId = "met-gala";

        if (!uniqueCategories.has(catId)) {
          uniqueCategories.set(catId, {
            id: catId,
            label: englishToHindiFilter[catId] || gallery.fashionCategory,
            icon: filterIcons[catId] || filterIcons.default,
          });
        }
      }
    });

    return Array.from(uniqueCategories.values());
  }, [galleries]);

  const sortedArticles = useMemo(() => {
    if (!articles) return [];
    return [...articles].sort(
      (a, b) =>
        new Date(b.publishDate || b.publishedAt || 0) -
        new Date(a.publishDate || a.publishedAt || 0)
    );
  }, [articles]);

  const visibleArticles = useMemo(
    () => sortedArticles.slice(0, displayCount),
    [sortedArticles, displayCount]
  );

  const previewArticles = useMemo(
    () => sortedArticles.slice(0, previewCount),
    [sortedArticles, previewCount]
  );

  const filteredGalleries = useMemo(() => {
    if (activeFilter === "all") return galleries;

    return galleries.filter((gallery) => {
      if (!gallery.fashionCategory) return false;
      let galleryValue = gallery.fashionCategory.toLowerCase().trim();
      if (galleryValue === "red carpet") galleryValue = "red-carpet";
      if (galleryValue === "pink carpet") galleryValue = "pink-carpet";
      if (galleryValue === "met gala") galleryValue = "met-gala";
      return galleryValue === activeFilter;
    });
  }, [activeFilter, galleries]);

  const handleGalleryClick = useCallback(
    (slug) => router.push(`/photos/${slug}`),
    [router]
  );

  const loadMorePreview = useCallback(() => setPreviewCount((prev) => prev + 8), []);
  const loadMore = useCallback(() => setDisplayCount((prev) => prev + 8), []);

  const categoryName =
    categorySlug === "bollywood" ? "बॉलीवुड" : categorySlug === "hollywood" ? "हॉलीवुड" : "सेलिब्रिटी";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div>
        <TopCategoryTabs />
        <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <Shirt size={28} className="text-pink-500" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {categoryName} फैशन
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              नवीनतम {categoryName} सेलिब्रिटी लुक और स्टाइल ट्रेंड्स
            </p>
          </div>
        </div>
      </div>

      <div>
        <div className="flex gap-4 mb-4">
          <button
            className={`tab-base ${activeTab === "looks" ? "tab-active" : "tab-inactive"}`}
            onClick={() => setActiveTab("looks")}
          >
            फैशन लुक्स ({filteredGalleries.length})
          </button>
          <button
            className={`tab-base ${activeTab === "articles" ? "tab-active" : "tab-inactive"}`}
            onClick={() => setActiveTab("articles")}
          >
            फैशन आर्टिकल्स ({sortedArticles.length})
          </button>
        </div>

        {activeTab === "looks" && (
          <div>
            {fashionFilters.length > 1 && (
              <div className="flex flex-wrap gap-3 mb-8">
                {fashionFilters.map((filter) => {
                  const Icon = filter.icon;
                  return (
                    <button
                      key={filter.id}
                      onClick={() => setActiveFilter(filter.id)}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-medium transition-all ${
                        activeFilter === filter.id
                          ? "bg-pink-600 text-white shadow-md"
                          : "bg-white dark:bg-neutral-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-neutral-800 border border-gray-200 dark:border-gray-700"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {filter.label}
                    </button>
                  );
                })}
              </div>
            )}

            {filteredGalleries.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {filteredGalleries.map((gallery) => (
                  <GalleryCard key={gallery.id} gallery={gallery} onClick={handleGalleryClick} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  कोई फोटो नहीं मिली
                </h3>
                <p className="text-gray-500 dark:text-gray-500">
                  {categoryName} के लिए कोई फैशन गैलरी उपलब्ध नहीं है
                </p>
              </div>
            )}

            {articles.length > 0 && (
              <div className="mt-16">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">
                    फैशन आर्टिकल्स
                  </h2>
                  <ViewToggle mode={previewViewMode} onChange={setPreviewViewMode} />
                </div>

                {previewViewMode === "grid" ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {previewArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="grid" compact />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {previewArticles.map((article) => (
                      <ArticleCard key={article.id} article={article} variant="list" compact />
                    ))}
                  </div>
                )}

                {previewCount < sortedArticles.length && (
                  <div className="text-center mt-8">
                    <button
                      onClick={loadMorePreview}
                      className="px-8 py-3 bg-pink-600 text-white font-semibold rounded-full hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/30 inline-flex items-center gap-2"
                    >
                      और आर्टिकल्स लोड करें
                      <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                        {sortedArticles.length - previewCount} और
                      </span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === "articles" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-serif">
                फैशन आर्टिकल्स
                <span className="text-lg text-gray-600 dark:text-gray-400 ml-3 font-normal">
                  {sortedArticles.length} आर्टिकल्स
                </span>
              </h2>
              <ViewToggle mode={viewMode} onChange={setViewMode} />
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {visibleArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="grid" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {visibleArticles.map((article) => (
                  <ArticleCard key={article.id} article={article} variant="list" />
                ))}
              </div>
            )}

            {displayCount < sortedArticles.length && (
              <div className="text-center mt-10">
                <button
                  onClick={loadMore}
                  className="px-8 py-3 bg-pink-600 text-white font-semibold rounded-full hover:bg-pink-700 transition-colors shadow-lg shadow-pink-600/30 inline-flex items-center gap-2"
                >
                  और आर्टिकल्स लोड करें
                  <span className="bg-white/20 px-2 py-0.5 rounded-full text-xs">
                    {sortedArticles.length - displayCount} और
                  </span>
                </button>
              </div>
            )}

            {sortedArticles.length === 0 && (
              <div className="text-center py-20">
                <h3 className="text-2xl font-medium text-gray-700 dark:text-gray-300 mb-2">
                  अभी कोई आर्टिकल नहीं
                </h3>
                <p className="text-gray-500 dark:text-gray-500">फैशन आर्टिकल्स जल्द आ रहे हैं...</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}