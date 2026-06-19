"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Images, Camera, Calendar, Filter, X, Loader2 } from "lucide-react";
import Sidebar from "../components/layout/Sidebar";
import { useState, useEffect, useMemo, useCallback } from "react";

export default function PhotosPage({
  initialGalleries = [],
  initialFashionArticles = [],
}) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [mounted, setMounted] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [filteredGalleries, setFilteredGalleries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const itemsPerPage = 6;

  // Sort galleries and articles
  const galleries = useMemo(() => {
    return [...initialGalleries].sort((a, b) => 
      new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    );
  }, [initialGalleries]);

  const fashionArticles = useMemo(() => {
    return [...initialFashionArticles].sort((a, b) => 
      new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt)
    );
  }, [initialFashionArticles]);

  const news = useMemo(() => fashionArticles, [fashionArticles]);

  // Extract unique categories
  const categories = useMemo(() => {
    const uniqueCategories = new Map();
    galleries.forEach(gallery => {
      if (gallery.categories && Array.isArray(gallery.categories)) {
        gallery.categories.forEach(cat => {
          if (!uniqueCategories.has(cat.slug)) {
            uniqueCategories.set(cat.slug, {
              name: cat.name,
              slug: cat.slug,
              id: cat.id
            });
          }
        });
      }
    });
    return [
      { name: "सभी", slug: "all", id: null },
      ...Array.from(uniqueCategories.values())
    ];
  }, [galleries]);

  // Filter galleries by category
  useEffect(() => {
    if (activeCategory === "all" || !activeCategory) {
      setFilteredGalleries(galleries);
    } else {
      setFilteredGalleries(
        galleries.filter(g => 
          g.categories?.some(cat => cat.slug === activeCategory)
        )
      );
    }
  }, [activeCategory, galleries]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredGalleries.length]);

  const totalGalleryPages = Math.ceil(filteredGalleries.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedGalleries = filteredGalleries.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = useCallback((pageNumber) => {
    setIsLoading(true);
    setCurrentPage(pageNumber);
    const gallerySection = document.getElementById('gallery-section');
    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // Simulate loading for smooth transition
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const Pagination = ({ currentPage, totalPages, onPageChange }) => {
    if (totalPages <= 1) return null;

    const getPageNumbers = () => {
      const delta = 2;
      const range = [];
      const rangeWithDots = [];
      let l;

      for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
          range.push(i);
        }
      }

      range.forEach((i) => {
        if (l) {
          if (i - l === 2) {
            rangeWithDots.push(l + 1);
          } else if (i - l !== 1) {
            rangeWithDots.push('...');
          }
        }
        rangeWithDots.push(i);
        l = i;
      });

      return rangeWithDots;
    };

    const pageNumbers = getPageNumbers();

    return (
      <div className="flex justify-center items-center gap-2 mt-8 mb-4 flex-wrap">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === 1
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-md'
          }`}
        >
          ← पिछला
        </button>

        {pageNumbers.map((pageNum, index) => (
          <button
            key={index}
            onClick={() => typeof pageNum === 'number' && onPageChange(pageNum)}
            className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-all ${
              currentPage === pageNum
                ? 'bg-pink-600 text-white shadow-md'
                : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
            disabled={typeof pageNum !== 'number'}
          >
            {pageNum}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            currentPage === totalPages
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-500 cursor-not-allowed'
              : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700 hover:shadow-md'
          }`}
        >
          अगला →
        </button>
      </div>
    );
  };

  // Format date helper
  const formatDate = useCallback((dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('hi-IN', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }, []);

  if (!mounted) {
    return (
      <div className="container-custom py-6 bg-[#f6f6f6] dark:bg-gray-800 rounded-2xl min-h-[400px] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container-custom py-6 bg-[#f6f6f6] dark:bg-gray-800 rounded-2xl">
      {/* Hero Section */}
      <div className="border-b border-gray-300 dark:border-pink-700/40 pb-6 mb-8">
        <div className="flex items-center gap-4">
          <Images className="w-9 h-9 text-pink-500" />
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
            फोटो और गैलरी
          </h1>
        </div>
        <p className="mt-2 text-gray-600 dark:text-gray-300">
          ताज़ा मनोरंजन तस्वीरें और इवेंट्स
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Content */}
        <main className="lg:col-span-8 space-y-12">
          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="flex flex-wrap items-center gap-2 pb-2">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
              {categories.map((category) => (
                <button
                  key={category.slug}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
                    activeCategory === category.slug
                      ? 'bg-pink-500 text-white shadow-md'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  {category.name}
                </button>
              ))}
              {activeCategory !== "all" && (
                <button
                  onClick={() => setActiveCategory("all")}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  aria-label="Clear filter"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          )}

          {/* Photo Grid */}
          {filteredGalleries.length > 0 ? (
            <section id="gallery-section">
              {isLoading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                  {paginatedGalleries.map((gallery) => {
                    const photos = gallery.photos || [];
                    const mainImg = gallery.image?.url;
                    const thumb1 = photos[0]?.image?.url || mainImg;
                    const thumb2 = photos[1]?.image?.url || mainImg;
                    const extraCount = photos.length > 2 ? `+${photos.length - 2}` : "";

                    return (
                      <div
                        key={gallery.id}
                        onClick={() => router.push(`/photos/${gallery.slug}`)}
                        className="group cursor-pointer"
                      >
                        {/* Double Image Layout */}
                        <div className="flex gap-2 h-[280px] sm:h-[260px] mb-4">
                          {/* Main large image */}
                          <div className="relative w-[50%] h-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                            {mainImg ? (
                              <Image
                                src={mainImg}
                                alt={gallery.title}
                                fill
                                sizes="(max-width: 768px) 50vw, 25vw"
                                className="object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                                onError={(e) => {
                                  e.currentTarget.src = "/placeholder.jpg";
                                }}
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                                <Camera className="w-8 h-8" />
                              </div>
                            )}
                            
                            {/* Category Badge */}
                            {gallery.categories && gallery.categories.length > 0 && (
                              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-pink-500/90 backdrop-blur-sm text-white text-[10px] font-medium z-10">
                                {gallery.categories[0].name}
                              </div>
                            )}

                            {/* Photo Count Badge */}
                            <div className="absolute bottom-2 left-2 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-white text-xs font-medium flex items-center gap-1.5 z-10">
                              <Camera className="w-3 h-3" />
                              {gallery?.photos?.length || 0} तस्वीरें
                            </div>
                          </div>

                          {/* Two small images */}
                          <div className="flex flex-col w-[50%] gap-2 h-full">
                            {/* First small image */}
                            <div className="relative h-1/2 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                              {thumb1 && thumb1 !== mainImg ? (
                                <Image
                                  src={thumb1}
                                  alt={`${gallery.title} - thumbnail 1`}
                                  fill
                                  sizes="(max-width: 768px) 25vw, 12vw"
                                  className="object-cover bg-gray-100 dark:bg-gray-800 transition-transform duration-500 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.src = "/placeholder.jpg";
                                  }}
                                />
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                  <Images className="w-5 h-5" />
                                </div>
                              )}
                            </div>

                            {/* Second small image */}
                            <div className="relative h-1/2 rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                              {thumb2 && thumb2 !== mainImg ? (
                                <>
                                  <Image
                                    src={thumb2}
                                    alt={`${gallery.title} - thumbnail 2`}
                                    fill
                                    sizes="(max-width: 768px) 25vw, 12vw"
                                    className="object-cover bg-gray-100 dark:bg-gray-800 brightness-75 group-hover:brightness-90 transition-all duration-500"
                                    onError={(e) => {
                                      e.currentTarget.src = "/placeholder.jpg";
                                    }}
                                  />
                                  {extraCount && (
                                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                                      <div className="bg-white/95 dark:bg-gray-900/95 px-3 py-1.5 rounded-xl text-sm font-bold text-gray-900 dark:text-white shadow-lg border border-white/50 dark:border-gray-800/50">
                                        {extraCount}
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                                  <Images className="w-5 h-5" />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Title Section */}
                        <div className="space-y-1 px-1">
                          <h3 className="text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-pink-500 transition-colors duration-300">
                            {gallery.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                            <Calendar className="w-3 h-3" />
                            {formatDate(gallery.publishedAt || gallery.createdAt)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pagination */}
              {totalGalleryPages > 1 && (
                <>
                  <Pagination 
                    currentPage={currentPage}
                    totalPages={totalGalleryPages}
                    onPageChange={handlePageChange}
                  />
                  <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
                    दिखा रहे हैं {startIndex + 1} से {Math.min(startIndex + itemsPerPage, filteredGalleries.length)} तक, कुल {filteredGalleries.length} गैलरी में से
                  </div>
                </>
              )}
            </section>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl">
              <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-500">कोई गैलरी नहीं मिली।</p>
            </div>
          )}

          {/* Fashion Articles Section */}
          {news.length > 0 && (
            <section className="mt-14 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                फैशन आर्टिकल्स
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {news.slice(0, 6).map((article) => (
                  <div
                    key={article.id}
                    onClick={() => router.push(`/article/${article.slug}`)}
                    className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition transform hover:-translate-y-1 duration-200 group"
                  >
                    <div className="relative h-32 bg-gray-100 dark:bg-gray-800 overflow-hidden">
                      {(article?.heroImage?.formats?.small?.url || article?.heroImage?.url) ? (
                        <Image
                          src={article.heroImage.formats?.small?.url || article.heroImage.url}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder-news.jpg";
                          }}
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                          <Images className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div className="p-2">
                      <h3 className="text-xs font-semibold line-clamp-2 text-gray-900 dark:text-white group-hover:text-pink-500 transition">
                        {article.title}
                      </h3>
                    </div>
                  </div>
                ))}
              </div>
              
              {news.length > 6 && (
                <div className="text-center mt-4">
                  <button
                    onClick={() => router.push('/fashion')}
                    className="text-pink-500 hover:text-pink-600 text-sm font-medium transition-colors"
                  >
                    सभी फैशन आर्टिकल्स देखें →
                  </button>
                </div>
              )}
            </section>
          )}
        </main>

        {/* Sidebar */}
        <aside className="lg:col-span-4">
          <div className="sticky top-24">
            <Sidebar />
          </div>
        </aside>
      </div>
    </div>
  );
}