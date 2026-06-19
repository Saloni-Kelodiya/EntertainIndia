"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Pagination from "../components/ui/Pagination";
import { ArticleListSkeleton } from "../components/ui/Skeleton";
import Sidebar from "../components/layout/Sidebar";
import { Star, ArrowRight, Search, X, Filter, Newspaper } from "lucide-react";
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
  bhojiwood: "भोजपुरी ",
  korean:"कोरियाई"
};
/* ===============================
   CELEBRITY CARD
================================ */
function CelebrityCard({ celebrity, serverCategory }) {
  const name = celebrity.name;
  const slug = celebrity.slug;
  const avatar = celebrity.avatar;

  const matchingIndustry = Array.isArray(celebrity.industry)
    ? celebrity.industry.find((ind) => ind.slug === serverCategory)
    : null;

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
            className="object-cover object-top group-hover:scale-110 transition duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Star className="w-12 h-12 text-gray-400" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      <div className="p-3">
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white group-hover:text-pink-600 transition">
          {name}
        </h3>
        {matchingIndustry && (
          <span className="text-xs text-pink-600 mt-1 inline-block">
            {matchingIndustry.name}
          </span>
        )}
      </div>
    </Link>
  );
}

/* ===============================
   ARTICLE CARD FOR MAIN CONTENT
================================ */
function ArticleCard({ article }) {
  // Get the correct image URL
  const imageUrl =  article?.heroImage?.formats?.medium?.url ||
     article?.hero_image?.formats?.medium?.url ||
    article?.heroImage?.formats?.small?.url ||
    article?.heroImage?.url||
                   null;
  
  // Get the correct slug
  const articleSlug = article.slug || article.Slug || article.documentId;
  
  // Get publication date
  const publishDate = article.publishedAt || 
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
              className="object-cover group-hover:scale-110 transition duration-500"
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
                year: 'numeric'
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
}

// Custom debounce hook for search
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
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
  const searchParams = useSearchParams();
  const isInitialMount = useRef(true);

  const [celebrities, setCelebrities] = useState(initialCelebrities || []);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState(initialArticles || []);
  
  // State for filters - initialized from URL params
  const [search, setSearch] = useState(initialSearch);
  const [profession, setProfession] = useState(initialProfession);
  const [letter, setLetter] = useState(initialLetter);
  const [currentPage, setCurrentPage] = useState(initialPagination?.page || 1);

  const professions = initialProfessions;
  const industry = CATEGORY_TO_INDUSTRY[serverCategory] || "Entertainment";
  
  // Debounce search
  const debouncedSearch = useDebounce(search, 500);

  // 🔥 FIXED: Fetch celebrities with correct profession filter
  const fetchCelebrities = useCallback(async (pageNum, prof, srch, ltr) => {
    setLoading(true);
    try {
      const { celebritiesAPI } = await import("../lib/api");
      
      // Build params object
      const params = {
        industry: serverCategory,
        page: pageNum,
        pageSize: 8,
      };
      
      // 🔥 PROFESSION FILTER - सही तरीके से भेजें
      if (prof && prof !== "" && prof !== "all") {
        params.profession = prof;
      }
      
      // SEARCH FILTER
      if (srch && srch !== "") {
        params.search = srch;
      }
      
      // LETTER FILTER
      if (ltr && ltr !== "") {
        params.letter = ltr;
      }
      
    
      const data = await celebritiesAPI.getAll(params);
      
      setCelebrities(data?.celebrities || []);
      setPagination(data?.pagination || { 
        page: pageNum, 
        pageSize: 8, 
        pageCount: 1, 
        total: 0 
      });
    } catch (err) {
      console.error("Fetch error:", err);
      setCelebrities([]);
      setPagination({ page: pageNum, pageSize: 8, pageCount: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [serverCategory]);

  // Fetch articles when category changes
  const fetchArticles = useCallback(async () => {
    try {
      const { articlesAPI } = await import("../lib/api");
      
      const articlesData = await articlesAPI.getAll({
        contentType: "celebrity-news",
        mainCategory: "news",
        industry: serverCategory,
        pageSize: 5,
        sort: "publishedAt:desc",
      });
      
      setArticles(articlesData?.articles || []);
    } catch (err) {
      console.error("Error fetching articles:", err);
      setArticles([]);
    }
  }, [serverCategory]);

  // Effect to fetch celebrities when filters change
  useEffect(() => {
    // Skip the initial mount since we already have initial data
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
   
    fetchCelebrities(currentPage, profession, debouncedSearch, letter);
  }, [currentPage, profession, debouncedSearch, letter, fetchCelebrities]);

  // Effect to fetch articles on mount and when category changes
  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Update URL when filters change
  useEffect(() => {
    // Skip the initial mount to avoid URL update on first load
    if (isInitialMount.current) {
      return;
    }
    
    const params = new URLSearchParams();
    if (currentPage > 1) params.set('page', currentPage);
    if (profession && profession !== "" && profession !== "all") params.set('profession', profession);
    if (search && search !== "") params.set('search', search);
    if (letter && letter !== "") params.set('letter', letter);
    
    const queryString = params.toString();
    const newUrl = `/${serverCategory}/celebrities${queryString ? `?${queryString}` : ''}`;
    const currentUrl = window.location.pathname + window.location.search;
    
    // Only update URL if it's different
    if (currentUrl !== newUrl) {
      router.replace(newUrl, { scroll: false });
    }
  }, [currentPage, profession, search, letter, serverCategory, router]);

  /* ===============================
     HANDLERS
  =============================== */
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (value) => {
    setSearch(value);
    setLetter(""); // Clear letter filter when searching
    setCurrentPage(1); // Reset to first page
  };

  // 🔥 FIXED: Profession change handler
  const handleProfessionChange = (slug) => {
    console.log("Profession changed to:", slug);
    setProfession(slug);
    setCurrentPage(1); // Reset to first page
  };

  const handleLetterFilter = (ltr) => {
    console.log("Letter filter clicked:", ltr);
    // If clicking the same letter, clear it
    if (letter === ltr) {
      setLetter("");
    } else {
      setLetter(ltr);
    }
    setSearch(""); // Clear search when using letter filter
    setCurrentPage(1); // Reset to first page
  };

  const handleClearFilters = () => {
    setSearch("");
    setLetter("");
    setProfession("");
    setCurrentPage(1);
    // Navigate to clean URL without filters
    router.push(`/${serverCategory}/celebrities`);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (search && search !== "") count++;
    if (letter && letter !== "") count++;
    if (profession && profession !== "" && profession !== "all") count++;
    return count;
  };

  /* ===============================
     UI
  =============================== */
  return (
   <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <TopCategoryTabs />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
        {/* MAIN */}
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
              {getActiveFiltersCount() > 0 && (
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
                    {profession && professions.find(p => p.slug === profession) && (
                      <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                        {professions.find(p => p.slug === profession)?.name}
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

              {/* 🔥 FIXED: Profession Filter Bar */}
              {professions.length > 1 && (
                <div className="mb-6">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 md:flex-wrap md:overflow-visible">
                    <button
                      onClick={() => handleProfessionChange("")}
                      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                        ${!profession || profession === ""
                          ? 'bg-pink-600 text-white shadow-md'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                        }
                      `}
                    >
                      सभी
                    </button>
                    {professions.map((item) => {
                      const isActive = profession === item.slug;
                      return (
                        <button
                          key={item.id || item.slug}
                          onClick={() => handleProfessionChange(item.slug)}
                          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
                            ${isActive
                              ? 'bg-pink-600 text-white shadow-md'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30'
                            }
                          `}
                        >
                          {item.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Celebrities Grid */}
              {loading ? (
                <ArticleListSkeleton count={8} />
              ) : celebrities.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                    {celebrities.map((c) => (
                      <CelebrityCard
                        key={c.id}
                        celebrity={c}
                        serverCategory={serverCategory}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
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

              {/* ARTICLES SECTION */}
              {articles && articles.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 mb-6">
                    <Newspaper className="w-6 h-6 text-pink-600" />
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                      ताज़ा सेलिब्रिटी समाचार और अपडेट
                    </h2>
                  </div>
                  
                  {/* Article Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {articles.map((article, index) => (
                      <ArticleCard key={article.id || article.documentId || index} article={article} />
                    ))}
                  </div>
                  
                  {/* View All Link */}
                  <div className="mt-6 text-center">
                    <Link
                      href={`/news`}
                      className="inline-flex items-center gap-2 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition font-medium"
                    >
                      सभी सेलिब्रिटी समाचार देखें
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}
          
        </main>

        {/* SIDEBAR */}
        <aside className="lg:col-span-4">
          <Sidebar />
        </aside>
      </div>
    </div>
  );
}