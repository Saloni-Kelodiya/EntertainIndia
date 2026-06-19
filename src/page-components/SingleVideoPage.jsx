"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { formatDate } from "../lib/helpers";
import MoviePoll from "../components/layout/MoviePoll";
import ShareBar from "../components/ui/ShareBar";
import Badge from "../components/ui/Badge";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Calendar,
  Clock,
  Tag,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";

export default function SingleVideoPage({ 
  initialVideo, 
  initialRelatedVideos, 
  initialRelatedArticles, 
  initialRelatedMovies 
}) {
  const router = useRouter();
  const scrollContainerRef = useRef(null);
  
  const [video, setVideo] = useState(initialVideo);
  const [relatedVideos, setRelatedVideos] = useState(initialRelatedVideos || []);
  const [relatedArticles, setRelatedArticles] = useState(initialRelatedArticles || []);
  const [relatedMovies, setRelatedMovies] = useState(initialRelatedMovies || []);
  const [loading, setLoading] = useState(!initialVideo);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (!initialVideo) {
      setLoading(true);
    } else {
      setLoading(false);
    }
  }, [initialVideo]);

  // Scroll handler with requestAnimationFrame for performance
  const scrollArticles = useCallback((direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  }, []);

  const getImageUrl = useCallback((url) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const baseUrl = process.env.NEXT_PUBLIC_STRAPI_URL || '';
    return `${baseUrl}${url}`;
  }, []);

  const getMovieUrl = useCallback((movie) => {
    if (!movie) return '#';
    const categorySlug = 
      movie.category?.slug || 
      movie.category?.name?.toLowerCase().replace(/ /g, '-') ||
      movie.movieType?.toLowerCase() ||
      'movies';
    return `/${categorySlug}/movies/${movie.slug}`;
  }, []);

  const getMovieCategoryName = useCallback((movie) => {
    return movie.category?.name || movie.movieType || 'फ़िल्म';
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        <div className="text-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">वीडियो लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!video) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">
          वीडियो नहीं मिला
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          हो सकता है कि वीडियो हटा दिया गया हो या URL गलत हो।
        </p>
        <button 
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-pink-500 text-white px-6 py-3 rounded-lg hover:bg-pink-600 transition"
        >
          <ChevronLeft size={18} /> वापस जाएं
        </button>
      </div>
    );
  }

  const currentUrl = typeof window !== "undefined" ? window.location.href : "";

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* MAIN COLUMN */}
        <div className="lg:col-span-8">

          <header className="mb-4">
            <h1 className="text-xl md:text-2xl lg:text-3xl font-bold mb-4 text-gray-900 dark:text-white">
              {video.title}
            </h1>

            <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-6">
              {video.publishedDate && (
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span>प्रकाशित: {formatDate(video.publishedDate, "DD MMM YYYY")}</span>
                </div>
              )}
              
              {video.duration && (
                <div className="flex items-center gap-2">
                  <Clock size={16} /> 
                  <span>अवधि: {video.duration}</span>
                </div>
              )}

              {video.views > 0 && (
                <div className="flex items-center gap-2">
                  <Eye size={16} /> 
                  <span>{video.views.toLocaleString()} व्यूज</span>
                </div>
              )}

              {video.category && (
                <Badge variant={video.category.slug}>
                  {video.category.name}
                </Badge>
              )}
            </div>
          </header>

          {/* VIDEO PLAYER */}
          <figure className="mb-8">
            <div className="overflow-hidden rounded-2xl shadow-lg bg-black">
              <div className="aspect-video">
                {video.embedUrl ? (
                  <iframe
                    key={video.id}
                    className="w-full h-full"
                    src={video.embedUrl}
                    title={video.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    loading="lazy"
                  />
                ) : video.videoId ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=0&rel=0&modestbranding=1`}
                    title={video.title}
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowFullScreen
                    frameBorder="0"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
                    <p>वीडियो उपलब्ध नहीं है</p>
                  </div>
                )}
              </div>
            </div>
          </figure>

          {/* DESCRIPTION */}
          {video.description && (
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
              <h2 className="text-xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                विवरण
              </h2>

              <div
                className={`relative overflow-hidden transition-[max-height] duration-500 ${showFullDesc ? "max-h-[3000px]" : "max-h-40"}`}
              >
                <article className="prose prose-sm dark:prose-invert max-w-none !text-[14px] sm:!text-[16px] [&_p]:!text-[14px] sm:[&_p]:!text-[16px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {video.description}
                  </ReactMarkdown>
                </article>

                {!showFullDesc && (
                  <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
                )}
              </div>

              {video.description.length > 250 && (
                <button
                  onClick={() => setShowFullDesc(!showFullDesc)}
                  className="mt-4 text-sm font-semibold text-pink-500 hover:text-pink-600"
                >
                  {showFullDesc ? "कम पढ़ें  ▲" : "अधिक पढ़ें ▼"}
                </button>
              )}
            </div>
          )}

          {/* SHARE BAR */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm">
              <ShareBar url={currentUrl} title={video.title} />
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 space-y-6">
            
            <MoviePoll />
            
            {/* RELATED VIDEOS */}
            {relatedVideos.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                  संबंधित वीडियो
                </h3>
                
                <div className="space-y-3">
                  {relatedVideos.slice(0, 5).map((relatedVideo) => (
                    <Link
                      key={relatedVideo.id}
                      href={`/videos/${relatedVideo.slug}`}
                      className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-all duration-200"
                    >
                      <div className="relative w-20 h-14 flex-shrink-0 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                        {relatedVideo.thumbnail ? (
                          <Image
                            src={relatedVideo.thumbnail}
                            alt={relatedVideo.title}
                            fill
                            sizes="80px"
                            className="object-cover group-hover:scale-105 transition duration-300"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-video.jpg';
                            }}
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-xs">
                            🎬
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 
                          line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400
                          transition-colors">
                          {relatedVideo.title}
                        </h4>
                        {relatedVideo.duration && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            ⏱️ {relatedVideo.duration}
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* RELATED MOVIES */}
            {relatedMovies.length > 0 && (
              <div className="bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-pink-500 rounded-full"></span>
                  संबंधित फ़िल्में
                </h3>
                
                <div className="space-y-3">
                  {relatedMovies.slice(0, 4).map((movie) => {
                    const posterUrl = movie.poster?.url || movie.poster_url || null;
                    const imageUrl = getImageUrl(posterUrl) || posterUrl;
                    
                    return (
                      <Link
                        key={movie.id}
                        href={getMovieUrl(movie)}
                        className="flex gap-3 group hover:bg-gray-50 dark:hover:bg-gray-800 p-2 rounded-lg transition-all duration-200"
                      >
                        <div className="relative w-14 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gradient-to-r from-pink-500/20 to-purple-500/20">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={movie.title}
                              fill
                              sizes="56px"
                              className="object-cover group-hover:scale-105 transition duration-300"
                              onError={(e) => {
                                e.currentTarget.src = '/movie-placeholder.jpg';
                              }}
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xs text-gray-500">
                              🎬
                            </div>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-gray-800 dark:text-gray-200 
                            line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400
                            transition-colors">
                            {movie.title}
                          </h4>
                          <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {getMovieCategoryName(movie) !== 'फ़िल्म' && (
                              <span className="px-1.5 py-0.5 bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 rounded text-xs">
                                {getMovieCategoryName(movie)}
                              </span>
                            )}
                            
                            {movie.releaseDate && (
                              <span>{new Date(movie.releaseDate).getFullYear()}</span>
                            )}
                            
                            {movie.rating && movie.rating > 0 && (
                              <>
                                <span>•</span>
                                <span>⭐ {movie.rating}/5</span>
                              </>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* RELATED ARTICLES - Horizontal Scroll */}
      {relatedArticles.length > 0 && (
        <section className="pt-8 mt-6 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Tag size={20} className="text-pink-500" />
              संबंधित लेख
            </h3>
          </div>

          <div className="relative group">
            <div 
              ref={scrollContainerRef}
              className="flex gap-5 overflow-x-auto scrollbar-hide snap-x snap-mandatory pb-4 scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {relatedArticles.map((article) => {
                const imageUrl = article.hero_image?.url || article.hero_Image || '/placeholder-image.jpg';
                const finalUrl = getImageUrl(imageUrl) || imageUrl;
                
                return (
                  <Link
                    key={article.id}
                    href={`/${article.mainCategory || 'article'}/${article.slug}`}
                    className="min-w-[280px] sm:min-w-[300px] w-[280px] sm:w-[300px] snap-start group"
                  >
                    <div className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full flex flex-col">
                      <div className="relative h-40 bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex-shrink-0">
                        <Image
                          src={finalUrl}
                          alt={article.title}
                          fill
                          sizes="(max-width: 768px) 280px, 300px"
                          className="object-cover group-hover:scale-105 transition duration-500"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder-image.jpg';
                          }}
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="font-bold text-gray-900 dark:text-white line-clamp-2 text-sm">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-3 mt-3 text-xs text-gray-500">
                          <span>{formatDate(article.createdAt || article.publishedAt, "DD MMM YYYY")}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Navigation Arrows with throttling via useCallback */}
            <button
              onClick={() => scrollArticles('left')}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 
                bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                hover:bg-pink-500 hover:text-white z-10
                border border-gray-200 dark:border-gray-700"
              aria-label="Previous"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              onClick={() => scrollArticles('right')}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2
                bg-white dark:bg-gray-800 rounded-full p-2 shadow-lg 
                opacity-0 group-hover:opacity-100 transition-opacity duration-300
                hover:bg-pink-500 hover:text-white z-10
                border border-gray-200 dark:border-gray-700"
              aria-label="Next"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </section>
      )}
    </div>
  );
}