// ✅ FIXED: Client Component with better props handling
"use client";

import { useState, useMemo, useEffect } from "react";
import Sidebar from "../components/layout/Sidebar";
import { Video, ChevronLeft, ChevronRight, Filter } from "lucide-react";
import Link from "next/link";
import { formatDate } from "../lib/helpers";

export default function VideosClientPage({ 
  initialVideos = [], 
  initialVideoTypes = ['सभी'], 
  initialCategories = [],
  initialTotalCount = 0 
}) {
  // ✅ State initialization with props
  const [videos, setVideos] = useState(initialVideos);
  const [videoTypes] = useState(initialVideoTypes);
  const [categories] = useState(initialCategories);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // ✅ फ़िल्टर स्टेट्स
  const [activeType, setActiveType] = useState("सभी");
  const [activeCategory, setActiveCategory] = useState("सभी");
  
  // ✅ पेजिनेशन स्टेट
  const [currentPage, setCurrentPage] = useState(1);
  const videosPerPage = 12; // Changed from 10 to 12 for better grid

  
  /* ================= फ़िल्टर किए गए वीडियो ================= */
  const filteredVideos = useMemo(() => {
    if (!videos || videos.length === 0) return [];
    
    let result = [...videos];
    
    // वीडियो टाइप के हिसाब से फ़िल्टर करें
    if (activeType !== "सभी") {
      result = result.filter((v) => v.videotype === activeType);
    }
    
    // कैटेगरी के हिसाब से फ़िल्टर करें
    if (activeCategory !== "सभी") {
      result = result.filter((v) => v.category?.slug === activeCategory);
    }
    
    console.log("🎯 Filtered videos:", result.length);
    return result;
  }, [videos, activeType, activeCategory]);

  /* ================= पेजिनेशन लॉजिक ================= */
  const totalPages = Math.ceil(filteredVideos.length / videosPerPage);
  
  const currentVideos = useMemo(() => {
    const indexOfLastVideo = currentPage * videosPerPage;
    const indexOfFirstVideo = indexOfLastVideo - videosPerPage;
    return filteredVideos.slice(indexOfFirstVideo, indexOfLastVideo);
  }, [filteredVideos, currentPage]);

  // फ़िल्टर बदलने पर पेज 1 पर रीसेट करें
  const handleTypeChange = (type) => {
    setActiveType(type);
    setCurrentPage(1);
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setActiveType("सभी");
    setActiveCategory("सभी");
    setCurrentPage(1);
  };

  // पेजिनेशन हैंडलर
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const categoryColors = {
    bollywood: "bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300",
    hollywood: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300",
    ott: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
    tv: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300",
    music: "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300",
    reviews: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",
  };
// English to Hindi Translation
const videohinditype = {
  "Trailers": "ट्रेलर",
  "Celeb Interviews": "सेलिब इंटरव्यू",
  "First Day First Show": "फर्स्ट डे फर्स्ट शो",
  "Parties & Events": "पार्टियाँ और इवेंट्स",
  "Exclusive & Specials": "एक्सक्लूसिव और स्पेशल",
  "Movie Songs": "मूवी सॉन्ग्स",
  "Music": "संगीत"
};
const hindicategory={
  "bollywood": "बॉलीवुड",
  "hollywood": "हॉलीवुड",
  "ott": "ओटीटी",
  "tv": "टीवी",
  "music": "संगीत",
  "reviews": "रिव्यू",
  "bhojiwood": "भोजीवुड",
  "tollywood": "टॉलीवुड",
  "korean": "कोरियाई",
}
  const getCategoryColor = (categorySlug) => {
    return categoryColors[categorySlug] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300";
  };

  // ✅ Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">वीडियो लोड हो रहे हैं...</p>
        </div>
      </div>
    );
  }

  // ✅ Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        <div className="text-center py-20">
          <Video size={48} className="mx-auto text-red-400 mb-4" />
          <p className="text-red-500 dark:text-red-400 text-lg">Error: {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
          >
            पुनः प्रयास करें
          </button>
        </div>
      </div>
    );
  }

  /* ================= यूआई ================= */
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      

      {/* ================= हीरो ================= */}
      <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
        <Video size={28} className="text-pink-500" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            वीडियो
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            नवीनतम सेलिब्रिटी वीडियो, फिल्म ट्रेलर, साक्षात्कार और भी बहुत कुछ
          </p>
        </div>
      </div>

      {/* Rest of your JSX remains the same... */}
      {/* ================= फ़िल्टर सेक्शन ================= */}
      <div className="mb-6 space-y-4">
        {/* वीडियो टाइप फ़िल्टर */}
        {videoTypes.length > 1 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">वीडियो प्रकार:</span>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              {videoTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => handleTypeChange(type)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                    ${activeType === type
                      ? "bg-pink-600 text-white shadow"
                      : "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                  {type === "सभी" ? "सभी प्रकार" : videohinditype[type] || type}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* कैटेगरी फ़िल्टर */}
        {categories.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Filter size={16} className="text-gray-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">श्रेणी:</span>
            </div>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide">
              <button
                onClick={() => handleCategoryChange("सभी")}
                className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                  ${activeCategory === "सभी"
                    ? "bg-pink-600 text-white shadow"
                    : "bg-gray-200 dark:bg-gray-900 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-700"
                  }`}
              >
                सभी श्रेणियाँ
              </button>
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => handleCategoryChange(category.slug)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition whitespace-nowrap
                    ${activeCategory === category.slug
                      ? "bg-pink-600 text-white shadow"
                      : `${getCategoryColor(category.slug)} hover:opacity-80`
                    }`}
                >
                  {hindicategory[category.slug] || category.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= परिणामों की संख्या ================= */}
      <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {filteredVideos.length > 0 
          ? `${currentVideos.length} में से ${filteredVideos.length} वीडियो दिखाए जा रहे हैं`
          : "कोई वीडियो नहीं मिला"
        }
      </div>

      {/* ================= मुख्य ग्रिड ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pb-4">
        {/* बाएं - वीडियो ग्रिड */}
        <div className="lg:col-span-2">
          {currentVideos.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {currentVideos.map((video) => (
                  <article
                    key={video.id}
                    className="group rounded-xl border border-gray-200 dark:border-gray-700
                      bg-white dark:bg-gray-900
                      overflow-hidden transition-all duration-300
                      hover:-translate-y-1 hover:shadow-lg"
                  >
                    <Link href={`/videos/${video.slug}`} className="block">
                      <div className="relative aspect-video overflow-hidden">
                        <img
                          src={video.thumbnail || video.hero_image?.url || '/placeholder-video.jpg'}
                          alt={video.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.target.src = '/placeholder-video.jpg';
                          }}
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                          <span className="text-white text-3xl">▶</span>
                        </div>
                        {video.category && (
                          <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded ${categoryColors[video.category.slug] || categoryColors.bollywood}`}>
                            {hindicategory[video.category.slug] || video.category.name}
                          </span>
                        )}
                        {video.videotype && (
                          <span className="absolute top-2 right-2 px-2 py-0.5 text-[10px] rounded bg-black/70 text-white">
                            {video.videotype}
                          </span>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white">
                          {video.title}
                        </h3>
                        {video.publishedAt && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {formatDate(video.publishedAt)}
                          </p>
                        )}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>

              {/* पेजिनेशन कंट्रोल्स */}
              {totalPages > 1 && (
                <div className="mt-8 flex justify-center items-center gap-2 flex-wrap">
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    className={`p-2 rounded-lg border ${
                      currentPage === 1
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </button>

                  {(() => {
                    const pages = [];
                    const maxVisible = 5;
                    
                    if (totalPages <= maxVisible) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      if (currentPage <= 3) {
                        for (let i = 1; i <= 4; i++) pages.push(i);
                        pages.push('...');
                        pages.push(totalPages);
                      } else if (currentPage >= totalPages - 2) {
                        pages.push(1);
                        pages.push('...');
                        for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
                      } else {
                        pages.push(1);
                        pages.push('...');
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
                        pages.push('...');
                        pages.push(totalPages);
                      }
                    }
                    
                    return pages.map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="text-gray-400 px-2">...</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => goToPage(page)}
                          className={`w-10 h-10 rounded-lg border ${
                            currentPage === page
                              ? 'bg-pink-600 text-white border-pink-600'
                              : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    ));
                  })()}

                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-lg border ${
                      currentPage === totalPages
                        ? 'border-gray-200 text-gray-400 cursor-not-allowed dark:border-gray-700'
                        : 'border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                    }`}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Video size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                {filteredVideos.length === 0 && videos.length > 0 
                  ? "चयनित फ़िल्टर के साथ कोई वीडियो नहीं मिला"
                  : "कोई वीडियो उपलब्ध नहीं है"
                }
              </p>
              {(activeType !== "सभी" || activeCategory !== "सभी") && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition"
                >
                  सभी फ़िल्टर साफ़ करें
                </button>
              )}
            </div>
          )}
        </div>

        {/* साइडबार */}
        <aside className="lg:col-span-1">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}