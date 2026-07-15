"use client";

import { useEffect, useState, useCallback, useMemo, useRef, memo } from "react";
import { useRouter } from "next/navigation";
import Pagination from "../components/ui/Pagination";
import { ArticleListSkeleton } from "../components/ui/Skeleton";
import Sidebar from "../components/layout/Sidebar";
import { Star, ArrowRight, X, Filter, Newspaper } from "lucide-react";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import Image from "next/image";
import Link from "next/link";
import WebContentCategory from "../page-components/WebContentCategory";

/* ===============================
   CATEGORY → INDUSTRY MAP
================================ */
const CATEGORY_TO_INDUSTRY = {
  bollywood: "बॉलीवुड",
  hollywood: "हॉलीवुड",
  ott: "ओटीटी",
  tv: "टीवी",
  tollywood: "टॉलीवुड",
  bhojiwood: "भोजपुरी",
  korean: "कोरियाई",
};

/* ===============================
   CELEBRITY CARD (memoized)
================================ */
const CelebrityCard = memo(function CelebrityCard({ celebrity, serverCategory }) {
  const { name, slug, avatar } = celebrity;

  const badgeLabel = useMemo(() => {
    if (Array.isArray(celebrity.industry)) {
      const found = celebrity.industry.find(
        (ind) =>
          ind?.slug?.toLowerCase() === serverCategory?.toLowerCase() ||
          ind?.name?.toLowerCase() === serverCategory?.toLowerCase()
      );
      if (found) return found.name || found.slug;
    }
    if (typeof celebrity.industry === "string" && celebrity.industry.trim()) {
      return celebrity.industry;
    }
    return CATEGORY_TO_INDUSTRY[serverCategory] || null;
  }, [celebrity.industry, serverCategory]);

  return (
    <Link
      href={`/celebrities/${slug}`}
      className="group bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="relative aspect-[3/4] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-700 overflow-hidden">
        {avatar?.url ? (
          <Image
            src={avatar.url}
            alt={name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-top group-hover:scale-110 transition duration-500"
            loading="lazy"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Star className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white group-hover:text-pink-600 transition">
          {name}
        </h3>
        {badgeLabel && (
          <span className="text-xs text-pink-600 mt-1 inline-block">
            {badgeLabel}
          </span>
        )}
      </div>
    </Link>
  );
});

/* ===============================
   ARTICLE CARD (memoized)
================================ */
const ArticleCard = memo(function ArticleCard({ article }) {
  const imageUrl =
    article?.heroImage?.formats?.medium?.url ||
    article?.hero_image?.formats?.medium?.url ||
    article?.heroImage?.formats?.small?.url ||
    article?.heroImage?.url ||
    null;

  const articleSlug = article.slug || article.Slug || article.documentId;

  const publishDate =
    article.publishedAt ||
    article.publish_datetime ||
    article.createdAt ||
    new Date().toISOString();

  return (
    <Link href={`/news/${articleSlug}`} className="group block">
      <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
        {imageUrl && (
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={imageUrl}
              alt={article.title || "Article"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover group-hover:scale-110 transition duration-500"
              loading="lazy"
            />
          </div>
        )}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-pink-600 transition line-clamp-2 mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">
            {article.summary || article.excerpt || "ताज़ा सेलिब्रिटी समाचार और अपडेट पढ़ें..."}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-500">
              {new Date(publishDate).toLocaleDateString('hi-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </span>
            <span className="text-sm text-pink-600 group-hover:text-pink-700 font-medium">
              और पढ़ें →
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
});

/* ===============================
   Debounce hook
================================ */
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/* ===============================
   PAGE
================================ */
export default function CategoryCelebritiesPage({
  serverCategory,
  initialCelebrities,
  initialPagination,
  initialProfessions = [],
  initialSearch = "",
  initialProfession = "",
  initialLetter = "",
  initialArticles = [],
}) {
  const router = useRouter();
  const isInitialMount = useRef(true);

  const [celebrities, setCelebrities] = useState(initialCelebrities || []);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);

  const articles = initialArticles || [];

  const [search, setSearch] = useState(initialSearch);
  const [profession, setProfession] = useState(initialProfession);
  const [letter, setLetter] = useState(initialLetter);
  const [currentPage, setCurrentPage] = useState(initialPagination?.page || 1);

  // 🔥 NEW: Professions filter bar के "Show more/less" के लिए state
  const [showAllProfessions, setShowAllProfessions] = useState(false);

  const professions = initialProfessions;
  const industry = CATEGORY_TO_INDUSTRY[serverCategory] || "Entertainment";

  const debouncedSearch = useDebounce(search, 500);

  // 🔥 NEW: Celebrities को Sort करना (industry[0] match करने वाले पहले)
  const sortedCelebrities = useMemo(() => {
  if (!celebrities || celebrities.length === 0) return [];

  const matched = [];
  const unmatched = [];

  celebrities.forEach((celebrity) => {
    let isMatch = false;
    const industryData = celebrity.industry;

    if (Array.isArray(industryData) && industryData.length > 0) {
      const first = industryData[0];
      if (typeof first === 'string') {
        isMatch = first.toLowerCase() === serverCategory?.toLowerCase();
      } else if (first && typeof first === 'object') {
        isMatch =
          first.slug?.toLowerCase() === serverCategory?.toLowerCase() ||
          first.name?.toLowerCase() === serverCategory?.toLowerCase();
      }
    }

    if (isMatch) matched.push(celebrity);
    else unmatched.push(celebrity);
  });

  // ========== 🔥 यहाँ से Console Logs डाले गए हैं ==========
  console.log("🏷️ Current Server Category:", serverCategory);
  
  console.log("✅ Matched Celebrities (Industry[0] match - ये पहले आएंगे):", 
    matched.map(c => ({ name: c.name, industry: c.industry }))
  );
  
  console.log("❌ Unmatched Celebrities (बाद में आएंगे):", 
    unmatched.map(c => ({ name: c.name, industry: c.industry }))
  );
  
  console.log("📋 Final Sorted Order (पूरी लिस्ट):", 
    [...matched, ...unmatched].map(c => c.name)
  );
  // =====================================================

  return [...matched, ...unmatched];
}, [celebrities, serverCategory]);
  // 🔥 NEW: Profession Filter Bar के लिए Display List (पहले 5 या सभी)
  const displayedProfessions = useMemo(() => {
    if (!professions || professions.length === 0) return [];
    if (showAllProfessions) return professions;
    return professions.slice(0, 5); // सिर्फ 5 दिखाओ
  }, [professions, showAllProfessions]);

  //  Celebrities fetch (API call)
  const fetchCelebrities = useCallback(async (pageNum, prof, srch, ltr) => {
    setLoading(true);
    try {
      const { celebritiesAPI } = await import("../lib/api/celebrities");

      const params = {
        industry: serverCategory,
        page: pageNum,
        pageSize: 8,
      };

      if (prof && prof !== "all") params.profession = prof;
      if (srch) params.search = srch;
      if (ltr) params.letter = ltr;

      const data = await celebritiesAPI.getLightListSorted(params); // celebritiesAPI.getLightList ki jagah
      setCelebrities(data?.celebrities || []);
      setPagination(
        data?.pagination || { page: pageNum, pageSize: 8, pageCount: 1, total: 0 }
      );
    } catch (err) {
      console.error("Fetch error:", err);
      setCelebrities([]);
      setPagination({ page: pageNum, pageSize: 8, pageCount: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [serverCategory]);

  //  Filters change hone par celebrities refetch
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    fetchCelebrities(currentPage, profession, debouncedSearch, letter);
  }, [currentPage, profession, debouncedSearch, letter, fetchCelebrities]);

  //  URL sync
  useEffect(() => {
    if (isInitialMount.current) return;

    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (profession && profession !== "all") params.set('profession', profession);
    if (search) params.set('search', search);
    if (letter) params.set('letter', letter);

    const queryString = params.toString();
    const newUrl = `/${serverCategory}/celebrities${queryString ? `?${queryString}` : ''}`;
    const currentUrl = window.location.pathname + window.location.search;

    if (currentUrl !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [currentPage, profession, search, letter, serverCategory, router]);

  /* ===============================
     HANDLERS (memoized)
  =============================== */
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearch = useCallback((value) => {
    setSearch(value);
    setLetter("");
    setCurrentPage(1);
  }, []);

  const handleProfessionChange = useCallback((slug) => {
    setProfession(slug);
    setCurrentPage(1);
  }, []);

  const handleLetterFilter = useCallback((ltr) => {
    setLetter((prev) => (prev === ltr ? "" : ltr));
    setSearch("");
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setLetter("");
    setProfession("");
    setCurrentPage(1);
    router.push(`/${serverCategory}/celebrities`);
  }, [serverCategory, router]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search) count++;
    if (letter) count++;
    if (profession && profession !== "all") count++;
    return count;
  }, [search, letter, profession]);

  const activeProfessionLabel = useMemo(
    () => professions.find((p) => p.slug === profession)?.name,
    [professions, profession]
  );

  /* ===============================
     UI
  =============================== */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <TopCategoryTabs />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        <main className="lg:col-span-8">
          <WebContentCategory
            title={`${industry} सेलिब्रिटी`}
            description="सेलिब्रिटी प्रोफाइल, व्यक्तिगत जीवन और फिल्मोग्राफी"
            icon={<Star className="w-8 h-8 text-pink-500" />}
            noPadding
            onSearch={handleSearch}
            onLetterFilter={handleLetterFilter}
            currentLetter={letter}
          />

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mb-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-pink-600" />
                <span className="text-sm text-pink-600 dark:text-pink-400">
                  सक्रिय फ़िल्टर:
                </span>
                {letter && (
                  <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                    नाम शुरू होता है: {letter.toUpperCase()}
                  </span>
                )}
                {search && (
                  <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                    खोज: {search}
                  </span>
                )}
                {activeProfessionLabel && (
                  <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                    {activeProfessionLabel}
                  </span>
                )}
              </div>
              <button
                onClick={handleClearFilters}
                className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
              >
                <X className="w-4 h-4" />
                सभी हटाएं
              </button>
            </div>
          )}

          {/* Results Count */}
          <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {celebrities.length} में से {pagination?.total || 0} सेलिब्रिटी दिखा रहे हैं
            </p>
          </div>

          {/* Profession Filter Bar - 🔥 UPDATED: Show Less/More with button */}
          {professions.length > 1 && (
            <div className="mb-6">
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:flex-wrap md:overflow-visible">
                <button
                  onClick={() => handleProfessionChange("")}
                  className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                    ${!profession
                      ? 'bg-pink-600 text-white shadow-md'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                    }`}
                >
                  सभी
                </button>
                
                {displayedProfessions.map((item) => {
                  const isActive = profession === item.slug;
                  return (
                    <button
                      key={item.id || item.slug}
                      onClick={() => handleProfessionChange(item.slug)}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                        ${isActive
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                        }`}
                    >
                      {item.name}
                    </button>
                  );
                })}

                {/* 🔥 NEW: और देखें / कम देखें बटन */}
                {professions.length > 5 && (
                  <button
                    onClick={() => setShowAllProfessions(prev => !prev)}
                    className="px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-white hover:bg-gray-400 dark:hover:bg-gray-500"
                  >
                    {showAllProfessions ? 'कम देखें' : `+ ${professions.length - 5} और देखें`}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Celebrities Grid - 🔥 UPDATED: Sorted list use कर रहे हैं */}
          {loading ? (
            <ArticleListSkeleton count={8} />
          ) : sortedCelebrities.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {sortedCelebrities.map((c) => (
                  <CelebrityCard key={c.id} celebrity={c} serverCategory={serverCategory} />
                ))}
              </div>

              {pagination?.pageCount > 1 && (
                <div className="mt-8">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={pagination.pageCount}
                    onPageChange={handlePageChange}
                  />
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12">
              <Star className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                कोई सेलिब्रिटी नहीं मिली
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                कृपया अपने फ़िल्टर या खोज शब्द बदलें
              </p>
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
              >
                सभी फ़िल्टर हटाएं
              </button>
            </div>
          )}

          {/* ARTICLES SECTION — SSR data only */}
          {articles.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-2 mb-6">
                <Newspaper className="w-6 h-6 text-pink-600" />
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  ताज़ा सेलिब्रिटी समाचार और अपडेट
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {articles.map((article, index) => (
                  <ArticleCard key={article.id || article.documentId || index} article={article} />
                ))}
              </div>

              <div className="mt-6 text-center">
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
                >
                  सभी सेलिब्रिटी समाचार देखें
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}
        </main>

        <aside className="lg:col-span-4">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}