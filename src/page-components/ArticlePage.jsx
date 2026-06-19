"use client";

import { useRouter, useSearchParams } from "next/navigation";
import ArticleCard from "../components/ui/ArticleCard";
import MenuSidebar from "../components/layout/Sidebar";
import { LayoutGrid, ChevronLeft, ChevronRight } from "lucide-react";

const FILTER_CATEGORIES = [
  { name: "सभी", slug: null },
  { name: "बॉलीवुड", slug: "bollywood" },
  { name: "हॉलीवुड", slug: "hollywood" },
  { name: "ओटीटी", slug: "ott" },
  { name: "टीवी", slug: "tv" },
  { name: "टॉलीवुड", slug: "tollywood" },
  { name: "भोजीवुड", slug: "bhojiwood" },
  { name: "कोरियाई", slug: "korean" },
];

export default function ArticlePageClient({ initialArticles, pagination, currentPage, currentCategory }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalPages = pagination?.pageCount || 1;

  // कैटेगरी फिल्टर हैंडलर
  const handleFilterChange = (slug) => {
    const params = new URLSearchParams(searchParams.toString());
    if (slug) {
      params.set("category", slug);
    } else {
      params.delete("category");
    }
    params.set("page", 1);
    router.push(`/article?${params.toString()}`, { scroll: true });
  };

  // पेजिनेशन हैंडलर
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage);
      router.push(`/article?${params.toString()}`, { scroll: true });
    }
  };

  const Breadcrumbs = () => (
    <nav className="flex items-center gap-2 text-[10px] md:text-xs font-black uppercase tracking-[0.15em] text-gray-400 mb-8 px-1">
      <a href="/" className="hover:text-pink-600 transition-colors">होम</a>
      <span className="w-1 h-1 rounded-full bg-pink-600/30"></span>
      
      <button 
        onClick={() => handleFilterChange(null)}
        className={`hover:text-pink-600 transition-colors ${!currentCategory ? 'text-pink-600' : ''}`}
      >
        आर्टिकल
      </button>

      {currentCategory && (
        <>
          <span className="w-1 h-1 rounded-full bg-pink-600/30"></span>
          <span className="text-pink-600 bg-pink-50 dark:bg-pink-900/20 px-2 py-0.5 rounded">
            {currentCategory}
          </span>
        </>
      )}
    </nav>
  );

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 rounded-2xl bg-gray-50 dark:bg-gray-800">
      <div > 
        
        <Breadcrumbs/>
        
        {/* हेडर और टैब */}
        <div className="border-b border-gray-200 dark:border-gray-800 pb-6 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-600 rounded-2xl shadow-lg">
                <LayoutGrid className="text-white w-7 h-7" />
              </div>
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-gray-900 dark:text-white">
                  आर्टिकल <span className="text-pink-600">हब</span>
                </h2>
                <p className="text-sm text-gray-500 font-medium mt-1">
                  हमारी नवीनतम कहानियाँ देखें
                </p>
              </div>
            </div>

            {/* फिल्टर बार */}
            <div className="flex gap-2 bg-white dark:bg-gray-900 p-1.5 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-x-auto no-scrollbar">
              {FILTER_CATEGORIES.map((cat) => (
                <button
                  key={cat.name}
                  onClick={() => handleFilterChange(cat.slug)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                    (currentCategory === cat.slug) || (!currentCategory && cat.slug === null)
                      ? "bg-pink-600 text-white shadow-md"
                      : "text-gray-500 hover:text-gray-900 dark:hover:text-white"
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* मुख्य लेआउट */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialArticles.length > 0 ? (
            initialArticles.map((article) => (
              <div key={article.id} className="flex h-full">
                <ArticleCard article={article} />
              </div>
            ))
          ) : (
            <div className="col-span-full py-20 text-center bg-white dark:bg-gray-900 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
              <p className="text-gray-500">इस श्रेणी में कोई आर्टिकल नहीं मिला।</p>
            </div>
          )}

         
        </div>
         {/* पेजिनेशन */}
          {totalPages > 1 && (
            <div className="mt-16 flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-bold transition-all border ${
                  currentPage === 1 
                  ? "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800" 
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-pink-500 text-gray-700 dark:text-gray-200 shadow-sm"
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
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-300 hover:border-pink-500"
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
                className={`px-4 py-2 rounded-lg font-bold transition-all border ${
                  currentPage === totalPages 
                  ? "opacity-30 cursor-not-allowed bg-gray-100 dark:bg-gray-800" 
                  : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-pink-500 text-gray-700 dark:text-gray-200 shadow-sm"
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