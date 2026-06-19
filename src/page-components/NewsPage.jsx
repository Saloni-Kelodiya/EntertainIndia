"use client";

import { useRouter } from "next/navigation";
import ArticleCard from "../components/ui/ArticleCard";
import { Newspaper, ChevronLeft, ChevronRight } from "lucide-react";

const TYPE_FILTERS = [
  { label: "सभी समाचार", value: null },
  { label: "ताज़ा समाचार", value: "LatestNews" },
  { label: "वायरल समाचार", value: "ViralNews" },
  { label: "सेलिब्रिटी समाचार", value: "CelebrityNews" },
];

export default function NewsPage({ initialArticles, currentType, pagination }) {
  const router = useRouter();
  const totalPages = pagination?.pageCount || 1;
  const currentPage = pagination?.page || 1;

  const handleTabChange = (typeValue) => {
    const url = typeValue ? `/news?type=${typeValue}` : '/news';
    router.push(url, { scroll: false });
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(window.location.search);
      params.set("page", newPage);
      router.push(`/news?${params.toString()}`, { scroll: true });
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
      <div>
        <nav className="flex items-center gap-2 text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-6">
          <a href="/" className="hover:text-pink-600 transition-colors">होम</a>
          <span className="w-1 h-1 rounded-full bg-pink-600/30"></span>
          <a href="/news" className={`hover:text-pink-600 transition-colors ${!currentType ? 'text-pink-600' : ''}`}>
            समाचार
          </a>
          {currentType && (
            <>
              <span className="w-1 h-1 rounded-full bg-pink-600/30"></span>
              <span className="text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                {currentType === "LatestNews" && "ताज़ा समाचार"}
                {currentType === "ViralNews" && "वायरल समाचार"}
                {currentType === "CelebrityNews" && "सेलिब्रिटी समाचार"}
              </span>
            </>
          )}
        </nav>
        
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-600 rounded-2xl shadow-lg">
                <Newspaper className="text-white w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  समाचार <span className="text-pink-600">हब</span>
                </h2>
                <p className="text-sm text-gray-500 font-medium mt-1">ताज़ा बज़ से अपडेट रहें</p>
              </div>
            </div>

            <div className="flex gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
              {TYPE_FILTERS.map((tab) => (
                <button
                  key={tab.label}
                  onClick={() => handleTabChange(tab.value)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    currentType === tab.value
                      ? 'bg-pink-600 text-white shadow-md'
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialArticles.length > 0 ? (
            initialArticles.map((article) => (
              <div key={article.id} className="flex h-full">
                <ArticleCard article={article} basePath="/news" />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">कोई समाचार नहीं मिला।</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-16 flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentPage === 1 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800" 
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-pink-500 text-gray-700 dark:text-gray-200 shadow-sm"
              }`}
            >
              <ChevronLeft size={20} className="inline mr-1" /> पिछला
            </button>

            <div className="flex gap-1 items-center mx-2">
              {[...Array(totalPages)].map((_, index) => {
                const pageNum = index + 1;
                if (totalPages > 5 && Math.abs(pageNum - currentPage) > 2) return null;
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-10 h-10 rounded-lg font-bold transition-all border ${
                      currentPage === pageNum
                      ? "bg-pink-600 border-pink-600 text-white shadow-lg scale-110"
                      : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-pink-500"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                currentPage === totalPages 
                ? "bg-gray-100 text-gray-400 cursor-not-allowed dark:bg-gray-800" 
                : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 hover:border-pink-500 text-gray-700 dark:text-gray-200 shadow-sm"
              }`}
            >
              अगला <ChevronRight size={20} className="inline ml-1" />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}