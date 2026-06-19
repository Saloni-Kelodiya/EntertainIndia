"use client";
import { useEffect, useState } from "react";

import { articlesAPI } from "../lib/api";
import ArticleCard from "../components/ui/ArticleCard";
import Pagination from "../components/ui/Pagination";
import { ArticleListSkeleton } from "../components/ui/Skeleton";
import Sidebar from "../components/layout/Sidebar";
import CategorySearch from "../components/ui/CategorySearch";
import { Film, Tv, Music2, Clapperboard, Star, MonitorPause, Video } from "lucide-react";

export default function ArticleCategory({ category }) {
  const [articles, setArticles] = useState([]);
  const [allArticles, setAllArticles] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [letterFilter, setLetterFilter] = useState("");

  // useEffect(() => {
  //   const fetchArticles = async () => {
  //     setLoading(true);
  //     try {
  //       const data = await articlesAPI.getAll({
  //         category,
  //         page: currentPage,
  //         pageSize: 12,
  //         sort: "-createdAt", // ⭐ FIXED: Ensure articles are sorted by newest first
  //       });
  //          const sortedArticles = [...data.articles].sort(
  //         (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  //       );
  //       // ✅ FIXED: Use the sorted articles instead of the original
  //       setArticles(sortedArticles); // Changed from data.articles to sortedArticles
  //       setPagination(data.pagination);
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  //   fetchArticles();
  // }, [category, currentPage]);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        // ✅ Use the correct sort parameter
        const data = await articlesAPI.getAll({
          category,
          page: currentPage,
          pageSize: 12,
          sort: "publish_datetime:desc", // ✅ This should work now
        });

        // Client-side sorting as backup
        const sortedArticles = [...data.articles].sort((a, b) => {
          return new Date(b.publishDate) - new Date(a.publishDate);
        });

        setAllArticles(sortedArticles);
        setArticles(sortedArticles);
        setPagination(data.pagination);

      } catch (error) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [category, currentPage]);

  // Filter articles based on search and letter
  useEffect(() => {
    let filtered = [...allArticles];

    if (searchQuery.trim()) {
      filtered = filtered.filter((article) =>
        article.title?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (letterFilter) {
      filtered = filtered.filter((article) =>
        article.title?.toUpperCase().startsWith(letterFilter)
      );
    }

    setArticles(filtered);
  }, [searchQuery, letterFilter, allArticles]);

  const handleSearch = (query) => {
    setSearchQuery(query);
    setLetterFilter("");
  };

  const handleLetterFilter = (letter) => {
    setLetterFilter(letter);
    setSearchQuery("");
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryNames = {
    bollywood: "Bollywood",
    hollywood: "Hollywood",
    webseries: "Web Series",
    ott: "OTT",
    tv: "TV Shows",
    music: "Music",
    reviews: "Reviews",
    webstories: "Web Stories",
  };

  const categoryIcons = {
    bollywood: <Clapperboard className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />,
    hollywood: <Film className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />,
    webseries: <Video className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />,
    ott: <MonitorPause className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />,
    tv: <Tv className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />,
    music: <Music2 className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />,
    reviews: <Star className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />,
    webstories: <Star className="w-10 h-10 text-indigo-500 dark:text-indigo-300" />, // ⭐ FIXED
  };

  return (
    <>

      <title>{categoryNames[category]} News - EntertainIndia</title>
      <meta
        name="description"
        content={`Latest ${categoryNames[category]} news, updates, and entertainment stories.`}
      />


      {/* ======================================
           CLASSIC HERO SECTION
      ====================================== */}
      <div className="border-b border-gray-300 dark:border-indigo-700/40 py-3 mb-10">
        <div className="container-custom">
          <div className="flex items-center gap-4 px-4">
            {/* Icon */}
            {categoryIcons[category]}

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-heading font-bold m-0 text-slate-900 dark:text-white">
              {categoryNames[category]}
            </h1>
          </div>

          <p className="mt-2 text-lg text-gray-600 dark:text-gray-300">
            Latest news and updates from {categoryNames[category]}
          </p>
        </div>
      </div>

      {/* ======================================
           MAIN LAYOUT
      ====================================== */}
      <div className="container-custom py-2">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT CONTENT */}
          <div className="lg:col-span-2">
            {/* Search Component */}
            <CategorySearch onSearch={handleSearch} onLetterFilter={handleLetterFilter} />

            {loading ? (
              <ArticleListSkeleton count={12} />
            ) : articles.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {articles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>

                {/* Pagination */}
                {pagination && pagination.pageCount > 1 && (
                  <div className="mt-10">
                    <Pagination
                      currentPage={currentPage}
                      totalPages={pagination.pageCount}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20 bg-gray-50 dark:bg-gray-800 rounded-xl shadow-inner">
                <p className="text-gray-600 dark:text-gray-300 text-xl font-medium">
                  No articles found in this category.
                </p>
              </div>
            )}
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-1">
            <Sidebar />
          </div>
        </div>
      </div>
    </>
  );
}
