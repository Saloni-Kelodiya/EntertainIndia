"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, 
  X, 
  Loader2, 
  ChevronRight,
  Image,
  Film,
  Star,
  Music,
  Newspaper,
  Camera,
  TrendingUp,
  Clock,
  Tv,
  Monitor,
  Video
} from "lucide-react";
import {
  articlesAPI,
  moviesAPI,
  galleriesAPI,
  celebritiesAPI,
  songsAPI,
  tvShowsAPI,
  webSeriesAPI,
  videosAPI,
} from "../../lib/api";
import { useStore } from "../../store/useStore";

/* ---------------- त्वरित लिंक ---------------- */
const QUICK_LINKS = [
  { label: "फोटो", path: "/photos", icon: Camera, color: "bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300" },
  { label: "क्या देखें", path: "/what-to-watch", icon: Film, color: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
  { label: "सेलिब्रिटी", path: "/celebrities", icon: Star, color: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  { label: "टीवी शो", path: "/tv/shows", icon: Tv, color: "bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300" },
  { label: "वेब सीरीज", path: "/ott/webseries", icon: Monitor, color: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300" },
  { label: "वीडियो", path: "/videos", icon: Video, color: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" },
];

const CHIP_COLORS = {
  मूवी: "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800/50",
  फोटो: "bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50",
  सेलिब्रिटी: "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-amber-800/50",
  गाने: "bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50",
  समाचार: "bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 hover:bg-red-200 dark:hover:bg-red-800/50",
  आलेख: "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-800/50",
  "टीवी शो": "bg-teal-100 dark:bg-teal-900/40 text-teal-700 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800/50",
  "वेब सीरीज": "bg-rose-100 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 hover:bg-rose-200 dark:hover:bg-rose-800/50",
  वीडियो: "bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-800/50",
};

export default function SearchBar() {
  const router = useRouter();
  const { setSearchQuery } = useStore();

  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cachedPopularSearches, setCachedPopularSearches] = useState(null);

  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const inputRef = useRef(null);

  // 🔧 Helper to get display category
  const getDisplayCategory = (item, type) => {
    const categoryMap = {
      movie: "मूवी",
      gallery: "फोटो",
      celebrity: "सेलिब्रिटी",
      music: "गाने",
      song: "गाने",
      tvshow: "टीवी शो",
      webseries: "वेब सीरीज",
      video: "वीडियो",
      article: item?.category === "news" ? "समाचार" : "आलेख",
      news: "समाचार"
    };
    return categoryMap[type] || categoryMap[item?.type] || "अन्य";
  };

  /* ---------------- लोकप्रिय खोज ---------------- */
  const fetchPopularSearches = useCallback(async () => {
    if (cachedPopularSearches) {
      setSuggestions(cachedPopularSearches);
      setShowSuggestions(true);
      return;
    }

    setIsLoading(true);
    try {
      const results = await Promise.allSettled([
        articlesAPI.getAll({ pageSize: 2, sort: "createdAt:desc" }),
        moviesAPI.simpleSearch("", { pageSize: 2 }),
        galleriesAPI.getAll({ pageSize: 2 }),
        celebritiesAPI.getAll({ pageSize: 2 }),
        songsAPI.getAll({ pageSize: 2 }),
        tvShowsAPI.getAll({ pageSize: 2, sort: "realeaseDate:desc" }),
        webSeriesAPI.getAll({ pageSize: 2, sort: "releaseDate:desc" }),
        videosAPI.getAll({ pageSize: 2 }),
      ]);

      const items = [];

      // Articles & News
      if (results[0].status === "fulfilled" && results[0].value?.articles) {
        results[0].value.articles.forEach((a) => {
          const isNews = a.mainCategory?.toLowerCase() === "news" || a.typeContent === "LatestNews";
          items.push({ 
            ...a, 
            type: "article", 
            category: isNews ? "news" : "article",
            displayCategory: isNews ? "समाचार" : "आलेख"
          });
        });
      }

      // Movies
      if (results[1].status === "fulfilled" && results[1].value?.movies) {
        results[1].value.movies.forEach((movie) =>
          items.push({ 
            ...movie, 
            type: "movie", 
            category: movie.category?.slug || "bollywood",
            displayCategory: "मूवी"
          })
        );
      }

      // Galleries
      if (results[2].status === "fulfilled" && results[2].value?.galleries) {
        results[2].value.galleries.forEach((gallery) =>
          items.push({ 
            ...gallery, 
            type: "gallery", 
            category: "photos",
            displayCategory: "फोटो"
          })
        );
      }

      // Celebrities
      if (results[3].status === "fulfilled" && results[3].value?.celebrities) {
        results[3].value.celebrities.forEach((celebrity) =>
          items.push({ 
            ...celebrity, 
            type: "celebrity", 
            category: "celebrities",
            displayCategory: "सेलिब्रिटी"
          })
        );
      }

      // Songs
      if (results[4].status === "fulfilled" && results[4].value?.songs) {
        results[4].value.songs.forEach((song) =>
          items.push({ 
            ...song, 
            type: "music", 
            category: "songs",
            displayCategory: "गाने"
          })
        );
      }

      // TV Shows
      if (results[5].status === "fulfilled" && results[5].value?.data) {
        results[5].value.data.forEach((show) =>
          items.push({ 
            ...show, 
            type: "tvshow", 
            category: show.category?.slug || "tv",
            displayCategory: "टीवी शो"
          })
        );
      }

      // Web Series
      if (results[6].status === "fulfilled" && results[6].value?.data) {
        results[6].value.data.forEach((series) =>
          items.push({ 
            ...series, 
            type: "webseries", 
            category: series.category?.slug || "ott",
            displayCategory: "वेब सीरीज"
          })
        );
      }

      // Videos
      if (results[7].status === "fulfilled" && results[7].value?.videos) {
        results[7].value.videos.forEach((video) =>
          items.push({ 
            ...video, 
            type: "video", 
            category: "videos",
            displayCategory: "वीडियो"
          })
        );
      }

      setSuggestions(items);
      setCachedPopularSearches(items);
      setShowSuggestions(true);
    } catch (e) {
      console.error("लोकप्रिय खोज त्रुटि:", e);
    } finally {
      setIsLoading(false);
    }
  }, [cachedPopularSearches]);

  /* ---------------- वैश्विक खोज ---------------- */
  const fetchSuggestions = useCallback(
    async (searchValue) => {
      if (!searchValue || searchValue.trim().length < 2) {
        fetchPopularSearches();
        return;
      }

      setIsLoading(true);
      try {
        const trimmedValue = searchValue.trim();
        
        const results = await Promise.allSettled([
          articlesAPI.getAll({ search: trimmedValue, pageSize: 3 }),
          moviesAPI.simpleSearch(trimmedValue, { pageSize: 3 }),
          galleriesAPI.getAll({ search: trimmedValue, pageSize: 3 }),
          celebritiesAPI.getAll({ search: trimmedValue, pageSize: 3 }),
          songsAPI.getAll({ search: trimmedValue, pageSize: 3 }),
          tvShowsAPI.getAll({ search: trimmedValue, pageSize: 3 }),
          webSeriesAPI.getAll({ search: trimmedValue, pageSize: 3 }),
          videosAPI.getAll({ search: trimmedValue, pageSize: 3 }),
        ]);

        const normalized = [];

        // Celebrities - Highest priority
        if (results[3].status === "fulfilled" && results[3].value?.celebrities) {
          results[3].value.celebrities.forEach((c) =>
            normalized.push({ ...c, type: "celebrity", category: "celebrities", displayCategory: "सेलिब्रिटी", match: 100 })
          );
        }

        // Movies
        if (results[1].status === "fulfilled" && results[1].value?.movies) {
          results[1].value.movies.forEach((m) =>
            normalized.push({ 
              ...m, 
              type: "movie", 
              category: m.category?.slug || "bollywood",
              displayCategory: "मूवी",
              match: 95 
            })
          );
        }

        // TV Shows
        if (results[5].status === "fulfilled" && results[5].value?.data) {
          results[5].value.data.forEach((show) =>
            normalized.push({ 
              ...show, 
              type: "tvshow", 
              category: show.category?.slug || "tv",
              displayCategory: "टीवी शो",
              match: 92 
            })
          );
        }

        // Web Series
        if (results[6].status === "fulfilled" && results[6].value?.data) {
          results[6].value.data.forEach((series) =>
            normalized.push({ 
              ...series, 
              type: "webseries", 
              category: series.category?.slug || "ott",
              displayCategory: "वेब सीरीज",
              match: 90 
            })
          );
        }

        // Songs
        if (results[4].status === "fulfilled" && results[4].value?.songs) {
          results[4].value.songs.forEach((s) =>
            normalized.push({ ...s, type: "music", category: "songs", displayCategory: "गाने", match: 85 })
          );
        }

        // Videos
        if (results[7].status === "fulfilled" && results[7].value?.videos) {
          results[7].value.videos.forEach((v) =>
            normalized.push({ ...v, type: "video", category: "videos", displayCategory: "वीडियो", match: 80 })
          );
        }

        // Galleries
        if (results[2].status === "fulfilled" && results[2].value?.galleries) {
          results[2].value.galleries.forEach((g) =>
            normalized.push({ ...g, type: "gallery", category: "photos", displayCategory: "फोटो", match: 70 })
          );
        }

        // Articles
        if (results[0].status === "fulfilled" && results[0].value?.articles) {
          results[0].value.articles.forEach((a) => {
            const isNews = a.mainCategory?.toLowerCase() === "news" || a.typeContent === "LatestNews";
            normalized.push({ 
              ...a, 
              type: "article", 
              category: isNews ? "news" : "article",
              displayCategory: isNews ? "समाचार" : "आलेख",
              match: 60 
            });
          });
        }

        normalized.sort((a, b) => b.match - a.match);
        setSuggestions(normalized.slice(0, 12));
        setShowSuggestions(true);
      } catch (err) {
        console.error("खोज त्रुटि:", err);
      } finally {
        setIsLoading(false);
      }
    },
    [fetchPopularSearches]
  );

  /* ---------------- प्रभाव ---------------- */
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("search-open");
    } else {
      document.body.classList.remove("search-open");
    }

    return () => {
      document.body.classList.remove("search-open");
    };
  }, [isOpen]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(query);
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query, fetchSuggestions]);

  useEffect(() => {
    if (isOpen && !query) {
      fetchPopularSearches();
    }
  }, [isOpen, query, fetchPopularSearches]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  /* ---------------- हैंडलर ---------------- */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearchQuery(query);
    router.push(`/search?q=${encodeURIComponent(query)}`);
    setIsOpen(false);
    setQuery("");
  };

  const getImageUrl = (item) => {
    if (item.poster?.url) return item.poster.url;
    if (item.thumbnail?.url) return item.thumbnail.url;
    if (item.thumbnail) return item.thumbnail;
    if (item.heroImage?.url) return item.heroImage.url;
    if (item.image?.url) return item.image.url;
    if (item.avatar?.url) return item.avatar.url;
    if (item.profile?.url) return item.profile.url;
    return null;
  };

  const getTypeIcon = (type) => {
    const iconProps = { className: "w-4 h-4", size: 16 };
    
    switch (type) {
      case "article":
        return <Newspaper {...iconProps} />;
      case "movie":
        return <Film {...iconProps} />;
      case "gallery":
        return <Image {...iconProps} />;
      case "celebrity":
        return <Star {...iconProps} />;
      case "music":
        return <Music {...iconProps} />;
      case "tvshow":
        return <Tv {...iconProps} />;
      case "webseries":
        return <Monitor {...iconProps} />;
      case "video":
        return <Video {...iconProps} />;
      default:
        return <Search {...iconProps} />;
    }
  };

  const getCategoryIcon = (displayCategory) => {
    const iconProps = { className: "w-3.5 h-3.5", size: 14 };
    
    switch (displayCategory) {
      case "आलेख":
        return <Newspaper {...iconProps} />;
      case "समाचार":
        return <Newspaper {...iconProps} />;
      case "मूवी":
        return <Film {...iconProps} />;
      case "फोटो":
        return <Image {...iconProps} />;
      case "सेलिब्रिटी":
        return <Star {...iconProps} />;
      case "गाने":
        return <Music {...iconProps} />;
      case "टीवी शो":
        return <Tv {...iconProps} />;
      case "वेब सीरीज":
        return <Monitor {...iconProps} />;
      case "वीडियो":
        return <Video {...iconProps} />;
      default:
        return null;
    }
  };

  const handleSuggestionClick = (item) => {
    setIsOpen(false);
    setQuery("");
    
    setTimeout(() => {
      if (item.type === "movie") {
        router.push(`/${item.category}/movies/${item.slug}`);
      }
      else if (item.type === "tvshow") {
        router.push(`/${item.category}/shows/${item.slug}`);
      }
      else if (item.type === "webseries") {
        router.push(`/${item.category}/web-series/${item.slug}`);
      }
      else if (item.type === "video") {
        router.push(`/videos/${item.slug}`);
      }
      else if (item.type === "article") {
        const isNews = item.category === "news";
        router.push(isNews ? `/news/${item.slug}` : `/article/${item.slug}`);
      }
      else if (item.type === "music" || item.type === "song") {
        const categorySlug = item.categories?.[0]?.slug || 'bollywood';
        router.push(`/${categorySlug}/music/${item.slug}`);
      }
      else if (item.type === "gallery") {
        router.push(`/photos/${item.slug}`);
      }
      else if (item.type === "celebrity") {
        router.push(`/celebrities/${item.slug}`);
      }
    }, 30);
  };

  const handleQuickLinkClick = (path) => {
    setIsOpen(false);
    setQuery("");
    setTimeout(() => {
      router.push(path);
    }, 30);
  };

  const handleClear = () => {
    setQuery("");
    inputRef.current?.focus();
    fetchPopularSearches();
  };

  /* ---------------- यूआई ---------------- */
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
          <div
            onClick={() => setIsOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <div className="relative z-[101] flex justify-center items-start pt-20 sm:pt-28 px-4">
            <div
              ref={searchRef}
              className="w-full max-w-2xl bg-white dark:bg-[#0b1220] rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-200"
            >
              {/* इनपुट हेडर */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                <form onSubmit={handleSubmit} className="flex gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      ref={inputRef}
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="सेलिब्रिटी, मूवी, गाने, समाचार, टीवी शो, वेब सीरीज खोजें..."
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#0b1220] text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition"
                      autoFocus
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={handleClear}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                      >
                        <X className="w-4 h-4 text-gray-400" />
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-medium transition disabled:opacity-50"
                    disabled={!query.trim()}
                  >
                    खोजें
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </form>
              </div>

              {/* सुझाव क्षेत्र */}
              <div className="max-h-[60vh] overflow-y-auto">
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-pink-600" />
                  </div>
                ) : showSuggestions && suggestions.length > 0 ? (
                  <>
                    {query ? (
                      /* खोज परिणाम - पूरी सूची */
                      <>
                        <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                          <Search className="w-4 h-4 text-gray-400" />
                          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                            खोज परिणाम
                          </p>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                          {suggestions.map((item, idx) => {
                            const imageUrl = getImageUrl(item);
                            const displayName = item.title || item.name;
                            const typeLabel = item.displayCategory || getDisplayCategory(item, item.type);

                            return (
                              <button
                                key={`${item.type}-${item.id || idx}`}
                                onClick={() => handleSuggestionClick(item)}
                                className="w-full px-4 py-3 flex items-center gap-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition group"
                              >
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                                  {imageUrl ? (
                                    <img
                                      src={imageUrl}
                                      alt={displayName}
                                      className="w-full h-full object-cover"
                                    />
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
                                  <p className="text-xs text-gray-500 mt-0.5">
                                    {typeLabel}
                                  </p>
                                </div>

                                <div className="opacity-0 group-hover:opacity-100 transition">
                                  <ChevronRight className="w-5 h-5 text-gray-400" />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </>
                    ) : (
                      /* लोकप्रिय खोज - रंगीन चिप्स */
                      <>
                        <div className="px-3 pt-3 pb-1 flex items-center gap-1.5">
                          <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
                          <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                            लोकप्रिय खोज
                          </p>
                        </div>
                        
                        <div className="px-3 py-1 grid grid-cols-1 gap-2">
                          {(() => {
                            const grouped = suggestions.reduce((acc, item) => {
                              const category = item.displayCategory;
                              if (!acc[category]) acc[category] = [];
                              acc[category].push(item);
                              return acc;
                            }, {});

                            return Object.entries(grouped).map(([category, items]) => (
                              <div key={category} className="flex flex-col gap-1.5 border-b border-gray-100 dark:border-gray-800 pb-2 last:border-0">
                                <div className="flex items-center gap-2 px-0.5">
                                  <span className="opacity-60 scale-75 origin-left">{getCategoryIcon(category)}</span>
                                  <p className="text-[9px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-tighter whitespace-nowrap">
                                    {category}
                                  </p>
                                  
                                  <div className="flex flex-nowrap gap-1.5 overflow-x-auto no-scrollbar pb-0.5 ml-3">
                                    {items.map((item, idx) => {
                                      const displayName = item.title || item.name;
                                      const chipColor = CHIP_COLORS[category] || "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/20";
                                      
                                      return (
                                        <div key={`${item.type}-${item.id || idx}`} className="relative flex-shrink-0 group">
                                          <button
                                            onClick={() => handleSuggestionClick(item)}
                                            className={`
                                              inline-flex items-center rounded-full 
                                              text-[10px] font-semibold transition-all duration-300 ease-in-out
                                              border border-transparent whitespace-nowrap
                                              hover:scale-110 hover:shadow-md hover:z-10 
                                              hover:border-pink-200 active:scale-95
                                              ${chipColor}
                                              px-2 py-0.5
                                              group-hover:px-3 group-hover:py-1
                                            `}
                                          >
                                            <span className="max-w-[80px] truncate block group-hover:max-w-[200px] transition-all duration-300">
                                              {displayName}
                                            </span>
                                          </button>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            ));
                          })()}
                        </div>
                      </>
                    )}
                  </>
                ) : showSuggestions && !query && suggestions.length === 0 ? (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">कोई परिणाम नहीं मिला</p>
                  </div>
                ) : null}

                {/* त्वरित लिंक */}
                {!query && !isLoading && (
                  <div className="border-t border-gray-100 dark:border-gray-800 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                        त्वरित लिंक
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_LINKS.map((link) => {
                        const Icon = link.icon;
                        return (
                          <button
                            key={link.label}
                            onClick={() => handleQuickLinkClick(link.path)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105 ${link.color}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {link.label}
                          </button>
                        );
                      })}
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