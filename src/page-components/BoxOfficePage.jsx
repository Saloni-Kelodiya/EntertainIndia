"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { TrendingUp } from "lucide-react";

import { moviesAPI } from "../lib/api";
import { getStrapiMedia } from "../lib/constants";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";

export default function BoxOfficePage({
  initialMovies = [],
  initialPagination = null,
  initialPage = 1,
  serverCategory,
}) {
  const [movies, setMovies] = useState(initialMovies);
  const [pagination, setPagination] = useState(initialPagination);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const isFirstRender = useRef(true);

  const tabs = [
    { id: "all", label: "सभी", href: "/box-office" },
    { id: "bollywood", label: "बॉलीवुड", href: "/bollywood/box-office" },
    { id: "hollywood", label: "हॉलीवुड", href: "/hollywood/box-office" },
    { id: "tollywood", label: "टॉलीवुड", href: "/tollywood/box-office" },
    { id: "bhojiwood", label: "भोजीवुड", href: "/bhojiwood/box-office" },
    { id: "korean", label: "कोरियाई", href: "/korean/box-office" },
  ];

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      const { movies, pagination } = await moviesAPI.getAll({
        page,
        pageSize: 12,
        sort: "boxOffice.worldwideCollection:desc",
        category: serverCategory !== "all" ? serverCategory : undefined,
      });
      setMovies(movies || []);
      setPagination(pagination);
    } catch (e) {
      console.error("Box Office fetch error", e);
    } finally {
      setLoading(false);
    }
  }, [page, serverCategory]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchMovies();
  }, [fetchMovies]);

  const getPageNumbers = useCallback(() => {
    if (!pagination?.pageCount) return [];
    return Array.from({ length: pagination.pageCount }, (_, i) => i + 1);
  }, [pagination]);

  const handlePageChange = useCallback((newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div>
        <TopCategoryTabs />

        <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <TrendingUp size={28} className="text-pink-500" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              बॉक्स ऑफिस
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              लेटेस्ट बॉक्स ऑफिस कलेक्शन, मूवी रैंकिंग, और इंडस्ट्री ट्रेंड्स
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* Category Tabs */}
        <div className="flex gap-3 mb-6 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => (
            <Link
              key={tab.id}
              href={tab.href}
              className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
                ${serverCategory === tab.id
                  ? "bg-pink-600 text-white shadow-sm"
                  : "bg-white text-gray-700 dark:bg-neutral-900 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20"
                }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <div className="divide-y bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">लोड हो रहा है...</p>
            </div>
          ) : movies.length > 0 ? (
            movies.map((m, i) => (
              <div
                key={m.id}
                className="group py-6 mb-4 card-theme px-3 rounded-lg bg-white dark:bg-gray-900 shadow-sm hover:shadow-md transition"
              >
                <Link
                  href={`/${serverCategory}/movies/${m.slug}`}
                  className="flex gap-4"
                >
                  {/* RANK */}
                  <span className="w-6 text-sm font-bold text-gray-400 flex-shrink-0">
                    {pagination ? (pagination.page - 1) * 10 + i + 1 : i + 1}
                  </span>

                  {/* POSTER - Optimized with next/image */}
                  <div className="relative w-16 h-24 rounded bg-gray-200 dark:bg-gray-800 overflow-hidden shrink-0">
                    {m.poster?.url && (
                      <Image
                        src={getStrapiMedia(m.poster.url)}
                        alt={m.title}
                        fill
                        sizes="64px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    )}
                  </div>

                  {/* CONTENT */}
                  <div className="flex-1">
                    <h3 className="font-bold text-sm uppercase group-hover:text-pink-600 transition dark:text-white">
                      {m.title}
                    </h3>

                    {/* DESCRIPTION */}
                    {m.boxOffice?.description && (
                      <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2 line-clamp-2 border-l-2 border-pink-500/20 pl-2">
                        {m.boxOffice.description}
                      </p>
                    )}

                    <div className="flex justify-between items-end mt-2">
                      <div>
                        {m.boxOffice?.verdict && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-50 text-blue-600 font-bold dark:bg-blue-900/20 dark:text-blue-400">
                            {m.boxOffice.verdict}
                          </span>
                        )}
                      </div>

                      <div className="text-right">
                        <p className="text-sm font-bold dark:text-white">
                          {m.boxOffice?.worldwideCollection || "-"}
                        </p>
                        <p className="text-[10px] text-gray-400">दुनिया भर में</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* BOTTOM STATS */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-[11px] text-gray-500 mt-4 pl-10 pt-3 border-t dark:border-neutral-800">
                  <p>
                    <span className="text-gray-400">बजट:</span>{" "}
                    {m.boxOffice?.budget || "-"}
                  </p>
                  <p>
                    <span className="text-gray-400">प्रारंभिक:</span>{" "}
                    {m.boxOffice?.opening || "-"}
                  </p>
                  <p>
                    <span className="text-gray-400">देशवार:</span>{" "}
                    {m.boxOffice?.domestic || "-"}
                  </p>
                  <p>
                    <span className="text-gray-400">वर्जित:</span>{" "}
                    <span className="text-blue-600 dark:text-blue-400 font-bold">
                      {m.boxOffice?.verdict || "-"}
                    </span>
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-lg">
              <p className="text-gray-500 dark:text-gray-400">कोई डेटा उपलब्ध नहीं है</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination && pagination.pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
            <button
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                ${pagination.page === 1
                  ? "text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-pink-500"
                }`}
            >
              ← पिछला
            </button>

            {getPageNumbers().map((p) => (
              <button
                key={p}
                onClick={() => handlePageChange(p)}
                className={`w-10 h-10 rounded-lg font-semibold text-sm border transition-all
                  ${pagination.page === p
                    ? "bg-gradient-to-r from-pink-600 to-pink-700 text-white border-pink-600 shadow-sm"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-pink-500"
                  }`}
              >
                {p}
              </button>
            ))}

            <button
              disabled={pagination.page === pagination.pageCount}
              onClick={() => handlePageChange(pagination.page + 1)}
              className={`px-4 py-2.5 rounded-lg border text-sm font-medium transition-all
                ${pagination.page === pagination.pageCount
                  ? "text-gray-400 border-gray-200 dark:border-gray-800 cursor-not-allowed"
                  : "text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 hover:border-pink-500"
                }`}
            >
              अगला →
            </button>
          </div>
        )}
      </div>
    </section>
  );
}