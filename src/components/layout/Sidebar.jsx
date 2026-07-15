"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { formatDate } from "../../lib/helpers";
import { usersAPI} from "../../lib/api/users";
import {moviesAPI} from "../../lib/api/movies"
import MoviePoll from "./MoviePoll";
import {
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
  Tag,
  Users,
  ArrowRight,
  Film,
  Calendar,
  ChevronRight,
} from "lucide-react";
import WhatToWatch from "../layout/WhatToWatch";

// --- 1. HOOK: Top Users (unchanged) ---
function useTopUsers() {
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTopUsers() {
      try {
        const res = await usersAPI.getAll();
        const usersList = Array.isArray(res.users) ? res.users : [];
        const sorted = usersList
          .sort(
            (a, b) =>
              new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0)
          )
          .slice(0, 3);
        setTopUsers(sorted);
      } catch (e) {
        console.error("Error loading top users:", e);
        setTopUsers([]);
      } finally {
        setLoading(false);
      }
    }
    loadTopUsers();
  }, []);

  return { topUsers, loading };
}

// --- 2. FIXED HOOK: Movies ---
function useMoviesWidget(activeTab) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      setLoading(true);
      try {
        const res = await moviesAPI.getAllLight({
          pageSize: 20,
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let filteredMovies = [];

        if (activeTab === "released") {
          filteredMovies = (res.movies || [])
            .filter((movie) => {
              if (!movie.releaseDate) return false;
              const releaseDate = new Date(movie.releaseDate);
              releaseDate.setHours(0, 0, 0, 0);
              return releaseDate <= today;
            })
            .sort((a, b) => {
              const dateA = new Date(a.releaseDate);
              const dateB = new Date(b.releaseDate);
              return dateB - dateA;
            })
            .slice(0, 10);
        } else {
          filteredMovies = (res.movies || [])
            .filter((movie) => {
              if (!movie.releaseDate) return false;
              const releaseDate = new Date(movie.releaseDate);
              releaseDate.setHours(0, 0, 0, 0);
              return releaseDate > today;
            })
            .sort((a, b) => {
              const dateA = new Date(a.releaseDate);
              const dateB = new Date(b.releaseDate);
              return dateA - dateB;
            })
            .slice(0, 10);
        }

        setMovies(filteredMovies);
      } catch (error) {
        console.error("Error loading movies:", error);
        setMovies([]);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, [activeTab]);

  return { movies, loading };
}


// --- 3. FIXED Movie List Item ---
const MovieItem = ({ movie, disableScroll }) => {
  //  1. Pehle category nikal lo (Bina kuch fetch tode)

  let catSlug = movie?.category?.slug || movie?.categories?.[0]?.slug || "sidebar";
  const movieUrl = `/${catSlug}/movies/${movie.slug}`;

  return (
    <Link
      href={movieUrl}
      className={`
        flex gap-3 group/item hover:bg-gray-50 dark:hover:bg-gray-800 
        p-3 rounded-xl transition-all duration-200 border border-transparent
        hover:border-gray-200 dark:hover:border-gray-700
        ${disableScroll ? "pointer-events-none opacity-60" : ""}
      `}
    >
      {/* Circular Movie Poster */}
      <div className="relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
        {movie.poster?.url ? (
          <Image
            src={movie.poster.url}
            alt={movie.title}
            fill
            className="object-cover group-hover/item:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-[9px] text-gray-500 font-medium">
            कोई छवि नहीं
          </div>
        )}
      </div>

      {/* Movie Details */}
      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-1 group-hover/item:text-pink-600 transition-colors mb-1">
          {movie.title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>
            {movie.releaseDate
              ? formatDate(movie.releaseDate)
              : "जल्द आ रही है"}
          </span>
        </div>
      </div>
    </Link>
  );
};

// --- 4. Related Article List Item (Standard Horizontal) ---
const RelatedArticleItem = ({ article }) => {
 // सही कैटगरी ट्रैक करने के लिए सेफ चेक
const isNews = 
  article.mainCategory?.toLowerCase() === 'news' || 
  article.MainCategory?.toLowerCase() === 'news' || 
  article.category?.slug === 'news' ||
  article.attributes?.MainCategory?.toLowerCase() === 'news' ||
  article.attributes?.category?.data?.attributes?.slug === 'news';

const articleUrl = isNews ? `/news/${article.slug}` : `/article/${article.slug}`;
  

  return (
    <Link
      href={articleUrl}
      className="flex gap-3 group/item hover:bg-gray-50 dark:hover:bg-gray-800 p-3 rounded-xl transition-all duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-700"
    >
      <div className="relative flex-shrink-0 w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 shadow-sm ring-1 ring-gray-200/50 dark:ring-gray-700/50">
        {article.heroImage?.url ? (
          <Image
            src={article.heroImage.url}
            alt={article.title}
            fill
            className="object-cover group-hover/item:scale-105 transition-transform duration-300"
            sizes="80px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-[9px] text-gray-500">
            कोई छवि नहीं
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white leading-tight line-clamp-2 group-hover/item:text-pink-600 transition-colors mb-1">
          {article.title}
        </h4>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(article.publishDate || article.createdAt)}</span>
        </div>
      </div>
    </Link>
  );
};

// --- 5. Vertical Related Article Item (New Big Card Style) ---
const VerticalRelatedArticleItem = ({ article }) => {
  // सही कैटगरी ट्रैक करने के लिए सेफ चेक
const isNews = 
  article.mainCategory?.toLowerCase() === 'news' || 
  article.MainCategory?.toLowerCase() === 'news' || 
  article.category?.slug === 'news' ||
  article.attributes?.MainCategory?.toLowerCase() === 'news' ||
  article.attributes?.category?.data?.attributes?.slug === 'news';

const articleUrl = isNews ? `/news/${article.slug}` : `/article/${article.slug}`;

  return (
    <Link
      href={articleUrl}
      className="block group bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all mb-5 ring-1 ring-gray-200/50 dark:ring-gray-700/50"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {article.heroImage?.url ? (
          <Image
            src={article.heroImage.url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="400px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-400 text-xs">
            कोई प्रीव्यू नहीं
          </div>
        )}
      </div>
      <div className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
        <h4 className="text-sm md:text-base font-bold text-gray-900 dark:text-white leading-snug line-clamp-2 group-hover:text-pink-600 transition-colors">
         {article.title}
        </h4>
      </div>
    </Link>
  );
};


/* -------------------- SIDEBAR -------------------- */
export default function Sidebar({ relatedArticles = [], relatedTitle = "संबंधित लेख", isArticlePage = false, }) {

  const [activeMovieTab, setActiveMovieTab] = useState("released");
  const { movies: movieList, loading: moviesLoading } =
    useMoviesWidget(activeMovieTab);

  const [isPaused, setIsPaused] = useState(false);
  const scrollContainerRef = useRef(null);
  const startRef = useRef(null);

  const hasRelated = relatedArticles && relatedArticles.length > 0;

  useEffect(() => {
    if (hasRelated || !movieList.length || moviesLoading) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    let rafId;
    const SPEED = 0.5; // Scroll ki speed (adjust kar sakte hain)

    const step = () => {
      if (!isPaused) {
        // Container ke andar content ki poori height ka aadha (Yani ek list ki height)
        const halfHeight = container.scrollHeight / 2;

        container.scrollTop += SPEED;

        // Jaise hi poori ek list (10 movies) scroll ho jaye, bina jhatke ke wapas 0 pe le aao
        if (container.scrollTop >= halfHeight) {
          container.scrollTop -= halfHeight;
        }
      }
      rafId = requestAnimationFrame(step);
    };

    rafId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(rafId);
  }, [movieList, moviesLoading, isPaused, activeMovieTab, hasRelated]);

  /* -------- RESET ON TAB CHANGE -------- */
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    container.scrollTop = 0;
    startRef.current = null;
    setIsPaused(false);
  }, [activeMovieTab]);

  return (
    <aside className="space-y-6">
      <MoviePoll />

      <div className={isArticlePage ? "" : "p-6 rounded-2xl bg-white dark:bg-gray-900 shadow-xl"}>
        {/* Header */}
        {!isArticlePage ? (
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xl dark:text-white text-black font-bold">
              <Film className="text-pink-600" />
              {hasRelated ? relatedTitle : "फिल्में"}
            </div>

            {!hasRelated && (
              <div className="mt-4 flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                {["released", "upcoming"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveMovieTab(tab)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition
                      ${activeMovieTab === tab
                        ? "bg-pink-500 text-white"
                        : "text-gray-600 dark:text-gray-400"
                      }`}
                  >
                    {tab === "released" ? "नई फिल्में" : "आने वाली फिल्में"}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#78d7f7] py-2.5 px-4 rounded-lg mb-6 shadow-sm">
            <h3 className="text-sm md:text-base font-bold text-gray-900 text-center uppercase tracking-wide">
              {relatedTitle || "संबंधित लेख"}
            </h3>
          </div>
        )}

        {/* Scroll Container / Related Articles List */}
        <div className={isArticlePage ? "" : "relative h-[300px]"}>
          {hasRelated ? (
            <div className={isArticlePage ? "space-y-4" : "h-full overflow-y-auto pr-1 custom-scrollbar space-y-2"}>
              {relatedArticles.map((article) => (
                isArticlePage
                  ? <VerticalRelatedArticleItem key={article.id} article={article} />
                  : <RelatedArticleItem key={article.id} article={article} />
              ))}
            </div>
          ) : isArticlePage ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-sm font-medium">कोई संबंधित लेख नहीं मिला</p>
            </div>
          ) : (
            <>
              {moviesLoading ? (
                <div className="flex items-center justify-center h-full text-sm text-gray-400">
                  <Film className="w-8 h-8 animate-spin mr-2" />
                  फिल्में लोड हो रही हैं...
                </div>
              ) : movieList.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-sm text-gray-400">
                  <Film className="w-12 h-12 text-gray-300 mb-3" />
                  <p className="font-medium">कोई फिल्म नहीं मिली</p>
                  <p className="text-xs mt-1">बाद में दोबारा जाँच करें!</p>
                </div>
              ) : (
               <div
      ref={scrollContainerRef}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="h-full overflow-hidden"
    >
      <div
        className={`flex flex-col space-y-2 ${
          !isPaused ? "animate-scroll" : "animate-scroll-paused"
        }`}
      >
        {/* Render movies twice for seamless loop */}
        {[...movieList, ...movieList].map((m, idx) => (
          <MovieItem key={`loop-${m.id}-${idx}`} movie={m} />
        ))}
      </div>
    </div>
              )}
            </>
          )}

          {/* Fade Indicator */}
          {!hasRelated && !isArticlePage && (
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
          )}
        </div>

        {/* View All */}
        {/* {!hasRelated && !isArticlePage && (
          <Link
            href="bollywood/movies"
            className="inline-flex items-center gap-2 mt-4 text-sm font-semibold text-pink-600 hover:text-pink-700"
          >
            सभी फिल्में देखें
            <ArrowRight className="w-4 h-4" />
          </Link>
        )} */}
      </div>

      {!isArticlePage && <WhatToWatch />}
<style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll linear infinite;
        }
        .pause-scroll {
          animation-play-state: paused !important;
        }
      `}</style>
    </aside>
  );
}