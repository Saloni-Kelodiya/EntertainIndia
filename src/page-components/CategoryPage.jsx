"use client";

import { useEffect, useState, useRef, useCallback, useMemo, lazy, Suspense } from "react";
import { articlesAPI } from "../lib/api/articles";
import ArticleCard from "../components/ui/ArticleCard";
import Pagination from "../components/ui/Pagination";
import { ArticleListSkeleton } from "../components/ui/Skeleton";
import Image from "next/image";
import Link from "next/link";
import { getStrapiMedia } from "../lib/constants";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import CategorySidebar from "../components/layout/CategorySidebar";
import { Star } from "lucide-react";

//  Lazy load WebContentCategory (reduces initial bundle)
const WebContentCategory = lazy(() => import("./WebContentCategory"));

const DEFAULT_ARTICLES = [];
const DEFAULT_MOVIES = [];

//  Category name mapping (moved outside component)
const categoryNamesInHindi = {
  "tv": "टीवी",
  "ott": "ओटीटी",
  "movies": "फिल्में",
  "bollywood": "बॉलीवुड",
  "hollywood": "हॉलीवुड",
  "bhojiwood": "भोजीवुड",
  "tollywood": "टॉलीवुड",
  "korean": "कोरियाई"
};

const languageDisplayNames = {
  "hindi": "हिंदी",
  "english": "अंग्रेजी",
  "tamil": "तमिल",
  "telugu": "तेलुगु",
  "malayalam": "मलयालम",
  "kannada": "कन्नड़",
  "bengali": "बंगाली",
  "marathi": "मराठी",
  "punjabi": "पंजाबी",
  "korean": "कोरियाई",
  "japanese": "जापानी",
  "chinese": "चीनी",
  "spanish": "स्पेनिश",
  "french": "फ्रेंच",
  'marwari': 'मारवाड़ी',
};

const getCategoryDisplayName = (categoryKey) => {
  return categoryNamesInHindi[categoryKey] || categoryKey.toUpperCase();
};

const getContentTypeName = (category) => {
  const contentTypeMap = {
    "tv": "टीवी शोज",
    "ott": "वेब सीरीज",
    "movies": "फिल्में",
    "bollywood": "बॉलीवुड फिल्में",
    "hollywood": "हॉलीवुड फिल्में",
    "bhojiwood": "भोजीवुड फिल्में",
    "tollywood": "टॉलीवुड फिल्में",
    "korean": "कोरियाई फिल्में"
  };
  return contentTypeMap[category] || "फिल्में/शोज";
};

const getLanguageDisplayName = (lang) => {
  const lowerLang = lang.toLowerCase();
  return languageDisplayNames[lowerLang] || lang;
};

//  Separate MovieCard component for better memoization
const MovieCard = ({ movie, category }) => {
  let slugPath = "";
  if (category === "tv") slugPath = "shows";
  else if (category === "ott") slugPath = "web-series";
  else slugPath = "movies";
  
  const posterUrl = useMemo(() => {
    const url = movie.poster?.url || movie.poster;
    return url ? getStrapiMedia(url) : null;
  }, [movie.poster]);
  
  const languages = useMemo(() => {
    return (movie.languages || []).map(lang => {
      const langName = typeof lang === 'object' ? (lang.language || lang.name) : lang;
      return getLanguageDisplayName(langName);
    }).join(" | ");
  }, [movie.languages]);

  return (
    <Link href={`/${category}/${slugPath}/${movie.slug}`} prefetch={false}>
      <div className="group cursor-pointer">
        <div className="aspect-[2/3] relative rounded-lg overflow-hidden bg-gray-200">
          {posterUrl && (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          )}
        </div>
        <div className="mt-2 text-sm font-bold uppercase line-clamp-1 text-gray-900 dark:text-white">
          {movie.title}
        </div>
        <p className="text-xs text-gray-500 line-clamp-1">{languages}</p>
      </div>
    </Link>
  );
};

//  Memoized MovieGrid component
const MovieGrid = memo(({ movies, category, selectedLanguage }) => {
  const filteredMovies = useMemo(() => {
    if (selectedLanguage === "all") return movies;
    return movies.filter((m) =>
      (m.languages || []).some((lang) => {
        const langStr = typeof lang === 'object' ? (lang.language || lang.name || "") : lang;
        return (langStr || "").toLowerCase() === selectedLanguage.toLowerCase();
      })
    );
  }, [movies, selectedLanguage]);
  
  const displayMovies = useMemo(() => filteredMovies.slice(0, 4), [filteredMovies]);
  
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {displayMovies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} category={category} />
      ))}
    </div>
  );
});

MovieGrid.displayName = 'MovieGrid';

//  Memoized Language Filter component
const LanguageFilter = memo(({ languages, selectedLanguage, onLanguageChange }) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      {languages.map(lang => (
        <button
          key={lang}
          onClick={() => onLanguageChange(lang.toLowerCase())}
          className={`px-4 py-2 rounded-full text-sm font-medium transition
            ${selectedLanguage === lang.toLowerCase()
              ? "bg-pink-600 text-white"
              : "bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
            }`}
        >
          {lang === "all" ? "सभी भाषाएं" : getLanguageDisplayName(lang)}
        </button>
      ))}
    </div>
  );
});

LanguageFilter.displayName = 'LanguageFilter';

import { memo } from 'react';

export default function CategoryPage({
  category,
  categoryData,
  initialArticles = DEFAULT_ARTICLES,
  initialMovies = DEFAULT_MOVIES,
  initialPagination = null,
  initialPage = 1,
}) {
  const [allArticles, setAllArticles] = useState(initialArticles);
  const [articles, setArticles] = useState(initialArticles);
  const [movies, setMovies] = useState(initialMovies);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [searchQuery, setSearchQuery] = useState("");
  const [letterFilter, setLetterFilter] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const isFirstRender = useRef(true);

  //  Scroll to top on mount only
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, []);

  //  Sync SSR props
  useEffect(() => {
    if (initialArticles.length === 0 && allArticles.length > 0) return;
    
    const sorted = initialArticles.length
      ? [...initialArticles].sort(
          (a, b) =>
            new Date(b.publishedAt || b.publishDate) -
            new Date(a.publishedAt || a.publishDate)
        )
      : initialArticles;

    setAllArticles(sorted);
    setArticles(sorted);
    setMovies(initialMovies || []);
    if (initialPagination) setPagination(initialPagination);
  }, [initialArticles, initialMovies, initialPagination]);

  //  Fetch articles with useCallback
  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const data = await articlesAPI.getAllLight({
        category,
        page: currentPage,
        pageSize: 6,
        mainCategory: "article",
        sort: "publishedAt:desc,publish_datetime:desc",
      });

      if (data?.articles) {
        setAllArticles(data.articles);
        setArticles(data.articles);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error("Error fetching articles:", err);
    } finally {
      setLoading(false);
    }
  }, [category, currentPage]);

  //  Fetch on page change (not on first render)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchArticles();
  }, [fetchArticles]);

  //  Search + letter filter (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (!searchQuery.trim() && !letterFilter) {
        setArticles(allArticles);
        return;
      }

      let filtered = [...allArticles];

      if (searchQuery.trim()) {
        filtered = filtered.filter((a) =>
          a.title?.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }

      if (letterFilter) {
        filtered = filtered.filter((a) =>
          a.title?.toUpperCase().startsWith(letterFilter)
        );
      }

      setArticles(filtered);
    }, 300); //  Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchQuery, letterFilter, allArticles]);

  //  Languages memoization
  const languages = useMemo(() => {
    return ["all", ...new Set(movies.flatMap((m) =>
      (m.languages || []).map(lang => typeof lang === 'object' ? (lang.language || lang.name) : lang)
    ).filter(Boolean))];
  }, [movies]);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const handleSearch = useCallback((q) => {
    setSearchQuery(q);
    setLetterFilter("");
  }, []);

  const handleLetterFilter = useCallback((l) => {
    setLetterFilter(l);
    setSearchQuery("");
  }, []);

  const handleLanguageChange = useCallback((lang) => {
    setSelectedLanguage(lang);
  }, []);

  const categoryDisplayName = getCategoryDisplayName(category);
  const contentTypeName = getContentTypeName(category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div className="max-w-7xl mx-auto">
        <TopCategoryTabs />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <main className="lg:col-span-8 overflow-hidden">
            <div>
              {/*  Lazy loaded WebContentCategory */}
              <Suspense fallback={<div className="h-32 animate-pulse bg-gray-100 rounded-xl" />}>
                <WebContentCategory
                  title={categoryDisplayName}
                  description={`${categoryDisplayName} से जुड़ी ताज़ा खबरें, प्रोफाइल और अपडेट्स`}
                  icon={<Star className="w-10 h-10 text-pink-500" />}
                  noPadding
                  onSearch={handleSearch}
                  onLetterFilter={handleLetterFilter}
                />
              </Suspense>

              {/* MOVIES / TV SHOWS Section */}
              <section className="mt-8">
                <h2 className="text-xl font-bold mb-4">{contentTypeName}</h2>

                <LanguageFilter
                  languages={languages}
                  selectedLanguage={selectedLanguage}
                  onLanguageChange={handleLanguageChange}
                />

                <MovieGrid
                  movies={movies}
                  category={category}
                  selectedLanguage={selectedLanguage}
                />
              </section>

              {/* ARTICLES Section */}
              <div className="mt-8">
                <h2 className="text-xl font-bold mb-4">लेख</h2>
                {loading ? (
                  <ArticleListSkeleton count={6} />
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {articles.length > 0 ? (
                        articles.map((a) => <ArticleCard key={a.id} article={a} />)
                      ) : (
                        <p className="col-span-2 text-center py-10 text-gray-500">
                          कोई लेख नहीं मिला।
                        </p>
                      )}
                    </div>

                    {pagination?.pageCount > 1 && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={pagination.pageCount}
                        onPageChange={handlePageChange}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </main>

          <aside className="lg:col-span-4">
            <div className="sticky top-24 space-y-8">
              <CategorySidebar category={category} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}