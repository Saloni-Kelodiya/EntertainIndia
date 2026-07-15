"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Search, X, Loader2, ChevronRight,
  Image, Film, Star, Music, Newspaper,
  Camera, TrendingUp, Clock, Tv, Monitor, Video
} from "lucide-react";
import {
  searchCelebrities,
  searchMovies,
  searchArticles,
  searchNews,
  searchTvShows,
  searchWebSeries,
  searchVideos,
  searchSongs,
  searchGalleries,
} from "../../lib/api/search";
import { useStore } from "../../store/useStore";

const QUICK_LINKS = [
  { label: "फोटो", path: "/photos", icon: Camera, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
  { label: "क्या देखें", path: "/what-to-watch", icon: Film, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  { label: "सेलिब्रिटी", path: "/celebrities", icon: Star, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  { label: "टीवी शो", path: "/tv/shows", icon: Tv, color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" },
  { label: "वेब सीरीज", path: "/ott/webseries", icon: Monitor, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" },
  { label: "वीडियो", path: "/videos", icon: Video, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
];

const CHIP_COLORS = {
  मूवी: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200",
  फोटो: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200",
  सेलिब्रिटी: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200",
  गाने: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200",
  समाचार: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200",
  आलेख: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200",
  "टीवी शो": "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200",
  "वेब सीरीज": "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200",
  वीडियो: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200",
};

// ─── Module-level cache — component unmount pe reset nahi hoga ──
const popularCache = { data: null, fetchedAt: 0 };
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export default function SearchBar() {
  const router = useRouter();
  const { setSearchQuery } = useStore();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null); // abort previous search

  // ─── Popular searches — sirf 3 APIs, 2 items each ──────────
  const fetchPopularSearches = useCallback(async () => {
    // Cache valid hai toh dobara fetch mat karo
    if (popularCache.data && Date.now() - popularCache.fetchedAt < CACHE_TTL) {
      setSuggestions(popularCache.data);
      return;
    }

    setIsLoading(true);
    try {
      // Sirf 3 lightweight calls — celebrities, movies, articles
      const [celebResult, movieResult, articleResult, newsResult] = await Promise.allSettled([
        searchCelebrities("a", { limit: 4 }), // popular celebrities
        searchMovies("", { limit: 4 }),
        searchArticles("", { limit: 4 }),
        searchNews("", { limit: 4 }),
      ]);

      const items = [];

      if (celebResult.status === "fulfilled") {
        celebResult.value.forEach(c =>
          items.push({ ...c, type: "celebrity", displayCategory: "सेलिब्रिटी" })
        );
      }
      if (movieResult.status === "fulfilled") {
        movieResult.value.forEach(m =>
          items.push({ ...m, type: "movie", displayCategory: "मूवी" })
        );
      }
      if (articleResult.status === "fulfilled") {
        articleResult.value.forEach(a => {
          const isNews = a.mainCategory?.toLowerCase() === "article";
          items.push({ ...a, type: "article", displayCategory: isNews ? "आलेख" : "समाचार" });
        });
      }
      if (newsResult.status === "fulfilled") {

        newsResult.value.forEach(n =>{
          const isNews = n.mainCategory?.toLowerCase() === "news";
          items.push({ ...n, type: "news", displayCategory: isNews ? "समाचार" : "आलेख" });
       } );
      }

      popularCache.data = items;
      popularCache.fetchedAt = Date.now();
      setSuggestions(items);
    } catch (e) {
      console.error("Popular fetch error:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ─── Search — parallel calls, abort previous ───────────────
  const fetchSuggestions = useCallback(async (searchValue) => {
  if (!searchValue || searchValue.trim().length < 2) {
    fetchPopularSearches();
    return;
  }

  if (abortRef.current) abortRef.current = false;
  const thisSearch = {};
  abortRef.current = thisSearch;

  setIsLoading(true);
  try {
    const q = searchValue.trim();

    const [
      celebResult, movieResult, tvResult, webResult,
      articleResult, newsResult, songResult, videoResult, galleryResult
    ] = await Promise.allSettled([
      searchCelebrities(q, { limit: 3 }),
      searchMovies(q, { limit: 3 }),
      searchTvShows(q, { limit: 2 }),
      searchWebSeries(q, { limit: 2 }),
      searchArticles(q, { limit: 2 }),
      searchNews(q, { limit: 2 }),
      searchSongs(q, { limit: 2 }),
      searchVideos(q, { limit: 2 }),
       searchGalleries(q, { limit: 2 })
    ]);

    if (abortRef.current !== thisSearch) return;

    // ✅ FIX: har category ka apna list + type/label, priority order maintained
    const categoryBuckets = [
      { list: celebResult.status === "fulfilled" ? celebResult.value : [], type: "celebrity", displayCategory: "सेलिब्रिटी" },
      { list: movieResult.status === "fulfilled" ? movieResult.value : [], type: "movie", displayCategory: "मूवी" },
      { list: tvResult.status === "fulfilled" ? tvResult.value : [], type: "tvshow", displayCategory: "टीवी शो" },
      { list: webResult.status === "fulfilled" ? webResult.value : [], type: "web-series", displayCategory: "वेब सीरीज" },
      { list: songResult.status === "fulfilled" ? songResult.value : [], type: "music", displayCategory: "गाने" },
      { list: videoResult.status === "fulfilled" ? videoResult.value : [], type: "video", displayCategory: "वीडियो" },
      { list: newsResult.status === "fulfilled" ? newsResult.value : [], type: "news", displayCategory: "समाचार" },
      { list: articleResult.status === "fulfilled" ? articleResult.value : [], type: "article", displayCategory: "आलेख" },
      { list: galleryResult.status === "fulfilled" ? galleryResult.value : [], type: "gallery", displayCategory: "गैलरी" }
    ];

    // ✅ Round-robin merge: har category se ek-ek item lo baari-baari, jab tak 12 na ho jaayein
    const normalized = [];
    let round = 0;
    let addedInThisRound = true;

    while (addedInThisRound && normalized.length < 12) {
      addedInThisRound = false;
      for (const bucket of categoryBuckets) {
        const item = bucket.list[round];
        if (item) {
          normalized.push({ ...item, type: bucket.type, displayCategory: bucket.displayCategory });
          addedInThisRound = true;
          if (normalized.length >= 12) break;
        }
      }
      round++;
    }

    setSuggestions(normalized);
  } catch (err) {
    console.error("Search error:", err);
  } finally {
    if (abortRef.current === thisSearch) setIsLoading(false);
  }
}, [fetchPopularSearches]);
  // ─── Effects ───────────────────────────────────────────────
  useEffect(() => {
    document.body.classList.toggle("search-open", isOpen);
    return () => document.body.classList.remove("search-open");
  }, [isOpen]);

  // Debounced search
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 300); // 300ms — 250ms se thoda zyada, less API spam
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  // Popular search sirf jab open ho aur query empty ho
  useEffect(() => {
    if (isOpen && !query) fetchPopularSearches();
  }, [isOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Click outside / Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target))
        setIsOpen(false);
    };
    const handleEscape = (e) => { if (e.key === "Escape") setIsOpen(false); };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  // ─── Helpers ───────────────────────────────────────────────
  const getImageUrl = (item) => {
    if (typeof item.poster === "string") return item.poster;
    if (item.poster?.url) return item.poster.url;
    if (typeof item.thumbnail === "string") return item.thumbnail;
    if (item.thumbnail?.url) return item.thumbnail.url;
    if (item.heroImage?.url) return item.heroImage.url;
    if (typeof item.heroImage === "string") return item.heroImage;
    if (item.avatar?.url) return item.avatar.url;
    if (typeof item.avatar === "string") return item.avatar;
    if (typeof item.image === "string") return item.image;
if (item.image?.url) return item.image.url;
    return null;
  };

  const getTypeIcon = (type) => {
    const p = { className: "w-4 h-4" };
    const icons = {
      article: <Newspaper {...p} />, movie: <Film {...p} />,
      gallery: <Image {...p} />, celebrity: <Star {...p} />,
      music: <Music {...p} />, tvshow: <Tv {...p} />,
      webseries: <Monitor {...p} />, video: <Video {...p} />,
    };
    return icons[type] || <Search {...p} />;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchQuery(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setQuery("");
  };

  const handleSuggestionClick = (item) => {
  setIsOpen(false);
  setQuery("");

  let path = null;

  switch (item.type) {
    case 'movie':
      path = `/${item.categorySlug}/movies/${item.slug}`;
      break;

    case 'tvshow':
      path = `/tv/shows/${item.slug}`;
      break;

    case 'webseries':
      path = `/ott/web-series/${item.slug}`;
      break;

    case 'video':
      path = `/videos/${item.slug}`;
      break;

    case 'music':
  if (item.categorySlug?.[0]?.slug) {
    console.log('Music item with categorySlug:', item.categorySlug?[0]?.slug : 'No categorySlug');
    path = `/${item.categorySlug?.[0]?.slug}/music/${item.slug}`;
  } else {
    path = `/music/${item.slug}`;
  }
  break;
     

    case 'gallery':
      path = `/photos/${item.slug}`;
      break;

    case 'celebrity':
      path = `/celebrities/${item.slug}`;
      break;

    case 'article':
      // ✅ Use displayCategory (set in fetch functions) instead of missing mainCategory
      if (item.displayCategory === "समाचार") {
        path = `/news/${item.slug}`;
      } else {
        path = `/article/${item.slug}`;
      }
      break;

    case 'news':
      // In case some items have type 'news' directly
      path = `/news/${item.slug}`;
      break;

    default:
      path = null;
  }

  if (path) {
    setTimeout(() => router.push(path), 30);
  }
};

  // ─── UI ────────────────────────────────────────────────────
  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        aria-label="खोजें"
      >
        <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] animate-in fade-in duration-150">
          <div onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

          <div className="relative z-[101] flex justify-center items-start pt-20 sm:pt-28 px-4">
            <div ref={searchRef}
              className="w-full max-w-2xl bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200">

              {/* Input */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="सेलिब्रिटी, मूवी, गाने, समाचार खोजें..."
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 transition"
                      autoFocus
                    />
                    {query && (
                      <button type="button" onClick={() => { setQuery(""); fetchPopularSearches(); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800">
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <button type="submit" disabled={!query.trim()}
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition disabled:opacity-50">
                    खोजें
                  </button>
                  <button type="button" onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
                    <X className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* Results */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                  </div>
                ) : suggestions.length > 0 ? (
                  query ? (
                    /* Search results */
                    <div className="divide-y divide-gray-100 dark:divide-gray-800">
                      {suggestions.map((item, idx) => {
                        const imageUrl = getImageUrl(item);
                        const displayName = item.title || item.name;
                        return (
                          <button key={`${item.type}-${item.id || idx}`}
                            onClick={() => handleSuggestionClick(item)}
                            className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group">
                            <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                              {imageUrl ? (
                                <img src={imageUrl} alt={displayName} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  {getTypeIcon(item.type)}
                                </div>
                              )}
                            </div>
                            <div className="flex-1 text-left">
                              <p className="font-medium text-gray-900 dark:text-white group-hover:text-pink-600 transition line-clamp-1">
                                {displayName}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">{item.displayCategory}</p>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 transition" />
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    /* Popular — chips grouped by category */
                    <div className="px-3 py-2">
                      <div className="flex items-center gap-1.5 mb-2">
                        <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                        <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">लोकप्रिय</p>
                      </div>
                      {Object.entries(
                        suggestions.reduce((acc, item) => {
                          const cat = item.displayCategory;
                          if (!acc[cat]) acc[cat] = [];
                          acc[cat].push(item);
                          return acc;
                        }, {})
                      ).map(([category, items]) => (
                        <div key={category} className="flex items-center gap-2 mb-2 border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter whitespace-nowrap w-14 shrink-0">
                            {category}
                          </p>
                          <div className="flex flex-wrap gap-1.5">
                            {items.map((item, idx) => (
                              <button key={`${item.type}-${item.id || idx}`}
                                onClick={() => handleSuggestionClick(item)}
                                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold transition hover:scale-105 ${CHIP_COLORS[category] || "bg-gray-100 text-gray-700"}`}>
                                <span className="max-w-[100px] truncate">{item.title || item.name}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  !isLoading && query.length >= 2 && (
                    <div className="text-center py-12">
                      <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">"{query}" के लिए कोई परिणाम नहीं</p>
                    </div>
                  )
                )}

                {/* Quick links */}
                {!query && !isLoading && (
                  <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">त्वरित लिंक</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_LINKS.map((link) => (
                        <button key={link.label}
                          onClick={() => { setIsOpen(false); router.push(link.path); }}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition hover:scale-105 ${link.color}`}>
                          <link.icon className="w-3.5 h-3.5" />
                          {link.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}