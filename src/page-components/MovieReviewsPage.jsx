"use client";

import { useEffect, useState, useCallback } from "react";
import { articlesAPI } from "../lib/api";
import Image from "next/image";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import Sidebar from "../components/layout/CategorySidebar";
import { Star, ThumbsUp, Calendar, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MovieReviewsPage({ industry, initialReviews, initialPagination, serverPage }) {
  const router = useRouter();

  const [reviews, setReviews] = useState(initialReviews);
  const [pagination, setPagination] = useState(initialPagination);
  const [page, setPage] = useState(serverPage || 1);
  const [loading, setLoading] = useState(false);

  const getPages = useCallback((pageCount) => {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }, []);

  // Pagination effect
  useEffect(() => {
    if (page === serverPage && reviews.length > 0) return;

    async function fetchReviews() {
      setLoading(true);
      try {
        const res = await articlesAPI.getAll({
          category: "reviews",
          industry,
          page,
          pageSize: 8,
          sort: "publish_datetime:desc",
        });

        setReviews(res.articles || []);
        setPagination(res.pagination || {});
        router.push(`?page=${page}`, { scroll: false });
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchReviews();
  }, [page, industry, router, serverPage, reviews.length]);

  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div>
        <TopCategoryTabs />

        <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <Star size={28} className="text-pink-500" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              समीक्षा
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              नवीनतम फिल्म समीक्षाएं और विश्लेषण, हमारे अनुभवी फिल्म समीक्षकों द्वारा लिखी गई। जानिए कौन सी फिल्में देखने लायक हैं और कौन सी नहीं, हमारे गहराई से विश्लेषण के साथ।
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 py-5">
        {/* Main reviews section */}
        <section className="lg:col-span-8">
          <div className="space-y-6 bg-[#f6f6f6] p-6 rounded-2xl dark:bg-gray-800">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">लोड हो रहा है...</p>
              </div>
            ) : reviews.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400">कोई समीक्षा उपलब्ध नहीं है</p>
              </div>
            ) : (
              reviews.map((article) => {
                const rating = article.rating || 0;
                const author = Array.isArray(article.Authors) ? article.Authors[0] : article.Authors;
                const authorName = author?.name || author?.username || "EntertainIndia Team";
                const authorAvatar = author?.avatar?.url;

                return (
                  <Link
                    key={article.id}
                    href={`/article/${article.slug}`}
                    className="block card-theme rounded-2xl overflow-hidden hover:border-pink-500/50 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl shadow-sm group"
                  >
                    <div className="flex flex-col md:flex-row min-h-[220px]">
                      {/* Image Container - Optimized with next/image */}
                      <div className="md:w-1/3 relative h-48 md:h-auto overflow-hidden bg-gray-200 dark:bg-gray-800">
                        {article.heroImage?.url ? (
                          <Image
                            src={article.heroImage.url}
                            alt={article.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 33vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-4xl text-gray-400">🎬</span>
                          </div>
                        )}
                        <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase rounded-full z-10">
                          {article.category?.name || "Movie Review"}
                        </div>
                      </div>

                      {/* Content Container */}
                      <div className="md:w-2/3 p-5 flex flex-col justify-between bg-white dark:bg-gray-900">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="heading-theme text-lg md:text-xl font-bold transition-colors group-hover:text-pink-600 line-clamp-2 leading-snug">
                              {article.title}
                            </h3>
                            <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-100 dark:border-gray-700 ml-3 shrink-0">
                              <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                              <span className="text-gray-900 dark:text-white font-bold text-sm">{rating}</span>
                              <span className="text-gray-400 text-[10px] text-nowrap">/ 5</span>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-400 text-xs line-clamp-2 mb-4 leading-normal">
                            {article.summary || article.body?.substring(0, 150)}
                          </p>

                          {/* Pros & Cons */}
                          <div className="grid grid-cols-2 gap-4 mt-auto">
                            {(article.pros_1 || article.pros_2) && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-green-600 font-bold uppercase tracking-wider">
                                  <ThumbsUp className="w-3 h-3" /> फायदे
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {article.pros_1 && (
                                    <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                      {article.pros_1}
                                    </span>
                                  )}
                                  {article.pros_2 && (
                                    <span className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border border-green-100 dark:border-green-800 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                      {article.pros_2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                            {(article.cons_1 || article.cons_2) && (
                              <div className="space-y-1">
                                <div className="flex items-center gap-1.5 text-[10px] text-pink-600 font-bold uppercase tracking-wider">
                                  <ThumbsUp className="w-3 h-3 rotate-180" /> नुकसान
                                </div>
                                <div className="flex flex-wrap gap-1.5">
                                  {article.cons_1 && (
                                    <span className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-800 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                      {article.cons_1}
                                    </span>
                                  )}
                                  {article.cons_2 && (
                                    <span className="bg-pink-50 dark:bg-pink-900/20 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-800 px-2 py-0.5 rounded-md text-[10px] font-medium">
                                      {article.cons_2}
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Author/Date Row */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                          <div className="flex items-center gap-2.5">
                            <div className="relative w-7 h-7 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center border border-gray-200 dark:border-gray-700 overflow-hidden">
                              {authorAvatar ? (
                                <Image
                                  src={authorAvatar}
                                  alt={authorName}
                                  fill
                                  className="object-cover"
                                  sizes="28px"
                                />
                              ) : (
                                <User className="w-3.5 h-3.5 text-gray-400" />
                              )}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-gray-900 dark:text-white text-[11px] font-bold leading-none mb-0.5">
                                {authorName}
                              </span>
                              <span className="text-gray-400 text-[9px] uppercase tracking-tighter leading-none">
                                फिल्म समीक्षक
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                            <Calendar className="w-3 h-3" />
                            <span className="text-[10px]">{formatDate(article.publishDate)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          {/* Pagination */}
          {!loading && pagination && pagination.pageCount > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
              <button
                disabled={pagination.page === 1}
                onClick={() => setPage((p) => p - 1)}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                  ${pagination.page === 1
                    ? "text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-yellow-400 dark:hover:border-yellow-600"
                  }`}
              >
                ← Previous
              </button>

              {getPages(pagination.pageCount).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-semibold text-sm border transition-all
                    ${pagination.page === p
                      ? "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white border-yellow-500 shadow-sm"
                      : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-yellow-400 dark:hover:border-yellow-600"
                    }`}
                >
                  {p}
                </button>
              ))}

              <button
                disabled={pagination.page === pagination.pageCount}
                onClick={() => setPage((p) => p + 1)}
                className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                  ${pagination.page === pagination.pageCount
                    ? "text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed"
                    : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-yellow-400 dark:hover:border-yellow-600"
                  }`}
              >
                Next →
              </button>
            </div>
          )}
        </section>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24 space-y-8">
            <Sidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}