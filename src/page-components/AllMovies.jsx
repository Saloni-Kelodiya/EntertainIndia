"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, Filter, ChevronDown, FilmIcon, X } from "lucide-react";

export default function MoviePage({ initialMovies = [] }) {
  const [movies] = useState(initialMovies);
  const [showFilters, setShowFilters] = useState(false);

  // Dynamic filter lists
  const [availableGenres, setAvailableGenres] = useState([]);
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availablePlatforms, setAvailablePlatforms] = useState([]);
  const [availableIndustries, setAvailableIndustries] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [availableCertificates, setAvailableCertificates] = useState([]);

  const [filters, setFilters] = useState({
    industry: "All",
    genre: "All",
    language: "All",
    year: "All",
    rating: "All",
    certificate: "All",
    platform: "All",
  });

  // Load More state
  const [visibleCounts, setVisibleCounts] = useState({
    trending: 12,
    latest: 12,
    upcoming: 12,
  });

  useEffect(() => {
    if (movies.length > 0) {
      // Industries
      const industries = [...new Set(movies.map(m => {
        if (!m.category) return null;
        return typeof m.category === 'object' ? (m.category.name || m.category.slug) : m.category;
      }).filter(Boolean))];
      setAvailableIndustries(industries);

      // Genres
      const genres = [...new Set(movies.flatMap(movie => {
        if (movie.genres && Array.isArray(movie.genres)) {
          return movie.genres.map(genre => {
            if (typeof genre === 'object') {
              return genre.name || genre.slug || null;
            }
            return genre;
          }).filter(Boolean);
        }
        return [];
      }))].sort();
      setAvailableGenres(genres);

      // Languages
      const languages = [...new Set(movies.flatMap(movie => {
        if (movie.languages && Array.isArray(movie.languages)) {
          return movie.languages.map(lang => {
            if (typeof lang === 'object') {
              return lang.language || lang.name || null;
            }
            return lang;
          }).filter(Boolean);
        }
        return [];
      }))].sort();
      setAvailableLanguages(languages);

      // Platforms
      const platforms = [
        ...new Set(
          movies.flatMap((movie) => {
            const whereToWatchData = movie.whereToWatch || movie.where_to_watch;
            if (whereToWatchData && Array.isArray(whereToWatchData)) {
              return whereToWatchData.map((w) => {
                if (typeof w === "object") {
                  return w.platform || null;
                }
                return w;
              }).filter(Boolean);
            }
            return [];
          })
        ),
      ].sort();
      setAvailablePlatforms(platforms);

      // Years
      const years = [...new Set(movies.map(m => {
        if (m.year) return String(m.year);
        if (m.releaseDate) return String(new Date(m.releaseDate).getFullYear());
        return null;
      }).filter(Boolean))].sort((a, b) => b - a);
      setAvailableYears(years);

      // Ratings
      const ratings = [...new Set(movies.map(m => {
        if (!m.rating) return null;
        return typeof m.rating === 'object'
          ? String(m.rating.title || m.rating.name || m.rating.value || m.rating.id)
          : String(m.rating);
      }).filter(Boolean))].sort((a, b) => b - a);
      setAvailableRatings(ratings);

      // Certificates
      const certs = [...new Set(movies.map(m => {
        if (!m.certificate) return null;
        return typeof m.certificate === 'object'
          ? String(m.certificate.name || m.certificate.title || m.certificate.id || "")
          : String(m.certificate);
      }).filter(Boolean))];
      setAvailableCertificates(certs);
    }
  }, [movies]);

  const applyFilter = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setVisibleCounts({ trending: 12, latest: 12, upcoming: 12 });
  };

  const clearAllFilters = () => {
    setFilters({
      industry: "All",
      genre: "All",
      language: "All",
      year: "All",
      rating: "All",
      certificate: "All",
      platform: "All"
    });
    setVisibleCounts({ trending: 12, latest: 12, upcoming: 12 });
  };

  // Apply all filters
  const filteredMovies = useMemo(() => {
    return movies.filter((movie) => {
      // Industry filter
      if (filters.industry !== "All") {
        const catName = typeof movie.category === 'object'
          ? (movie.category?.name || movie.category?.slug || "")
          : (movie.category || "");
        if (catName.toLowerCase().trim() !== filters.industry.toLowerCase().trim()) return false;
      }

      // Genre filter
      if (filters.genre !== "All") {
        const movieGenres = movie.genres?.map(g =>
          typeof g === 'object' ? (g.name || g.slug) : g
        ) || [];
        if (!movieGenres.some(g => g?.toLowerCase() === filters.genre.toLowerCase())) return false;
      }

      // Language filter
      if (filters.language !== "All") {
        const movieLanguages = movie.languages?.map(l =>
          typeof l === 'object' ? (l.language || l.name) : l
        ) || [];
        if (!movieLanguages.some(l => l?.toLowerCase() === filters.language.toLowerCase())) return false;
      }

      // Platform filter
      if (filters.platform !== "All") {
        const whereToWatchData = movie.whereToWatch || movie.where_to_watch;
        const moviePlatforms = whereToWatchData?.map((w) =>
          typeof w === "object" ? w.platform : w
        ) || [];
        if (!moviePlatforms.some((p) => p?.toLowerCase() === filters.platform.toLowerCase())) {
          return false;
        }
      }

      // Rating filter
      if (filters.rating !== "All") {
        const r = movie.rating;
        if (r == null) return false;
        const movieRating = typeof r === 'object' ? String(r.title || r.name || r.value || r.id) : String(r);
        if (movieRating !== filters.rating) return false;
      }

      // Certificate filter
      if (filters.certificate !== "All") {
        const c = movie.certificate;
        if (c == null) return false;
        const movieCert = typeof c === "object" ? String(c.name || c.title || c.id || "") : String(c);
        if (movieCert !== filters.certificate) return false;
      }

      // Year filter
      if (filters.year !== "All") {
        const movieYear = String(movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : ""));
        if (movieYear !== filters.year) return false;
      }

      return true;
    });
  }, [movies, filters]);

  // Split into sections
  const { trendingMovies, latestMovies, upcomingMovies } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const trending = [];
    const latest = [];
    const upcoming = [];

    filteredMovies.forEach(movie => {
      if (movie.trending === true) {
        trending.push(movie);
      }

      const release = movie.releaseDate ? new Date(movie.releaseDate) : null;

      if (release && release > today) {
        upcoming.push(movie);
      } else {
        latest.push(movie);
      }
    });

    upcoming.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
    latest.sort((a, b) => {
      const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
      const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
      return dateB - dateA;
    });

    return { trendingMovies: trending, latestMovies: latest, upcomingMovies: upcoming };
  }, [filteredMovies]);

  const activeFiltersCount = Object.values(filters).filter(v => v !== "All").length;

  const handleLoadMore = (section) => {
    setVisibleCounts(prev => ({
      ...prev,
      [section]: prev[section] + 12
    }));
  };

  const MovieCard = ({ movie }) => {
    const posterUrl = movie.poster?.url || null;
    const year = movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "उपलब्ध नहीं");

    //  सर्वर कैटेगरी हटा दी – अब सीधे movie.category.slug का उपयोग करें, या डिफ़ॉल्ट 'movies'
    const movieCategorySlug = movie.category?.slug ;
    const movieUrl = `/${movieCategorySlug}/movies/${movie.slug}`;

    return (
      <Link href={movieUrl} className="group block">
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-200 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 16vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-300 dark:bg-zinc-800 text-3xl">🎬</div>
          )}

          {movie.certificate && (
            <div className="absolute bottom-2 left-2 bg-pink-600 text-white px-2 py-1 rounded text-[10px] uppercase font-bold shadow-md">
              {typeof movie.certificate === 'object' ? (movie.certificate.name || movie.certificate.title) : movie.certificate}
            </div>
          )}

          {movie.rating && (
            <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-xs font-bold shadow-md">
              ⭐ {typeof movie.rating === 'object' ? (movie.rating.title || movie.rating.name) : movie.rating}
            </div>
          )}
        </div>

        <h3 className="text-gray-900 dark:text-white font-semibold line-clamp-1 group-hover:text-pink-500 transition-colors text-sm mt-1">
          {movie.title}
        </h3>

        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs">
            <Calendar className="w-3 h-3 mr-1" />
            <span className="mr-2">{year}</span>
            {movie.duration && (
              <>
                <Clock className="w-3 h-3 mr-1" />
                <span>{movie.duration}</span>
              </>
            )}
          </div>
        </div>
      </Link>
    );
  };

  const renderMovieSection = (title, moviesList, sectionKey) => {
    if (moviesList.length === 0) return null;

    const currentVisibleCount = visibleCounts[sectionKey];
    const displayMovies = moviesList.slice(0, currentVisibleCount);
    const hasMore = currentVisibleCount < moviesList.length;

    return (
      <div className="mb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-gray-900 dark:text-white text-2xl font-black uppercase tracking-tight">
            {title}
          </h2>
          <span className="bg-gray-200 dark:bg-zinc-800 text-gray-600 dark:text-zinc-400 text-xs font-bold px-2.5 py-1 rounded">
            {moviesList.length}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {displayMovies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-8 flex justify-center">
            <button
              onClick={() => handleLoadMore(sectionKey)}
              className="flex items-center gap-2 px-6 py-2.5 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-zinc-200 font-bold rounded-full hover:bg-pink-600 hover:text-white dark:hover:bg-pink-600 transition-colors shadow-sm"
            >
              और फिल्में देखें
              <ChevronDown className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] dark:bg-gray-900 rounded-2xl min-h-screen">
      {/* Header - अब Industry फ़िल्टर के अनुसार डायनामिक टाइटल */}
      <div className="border-b border-gray-300 dark:border-zinc-800 pb-6 mb-6 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-pink-600/10 rounded-2xl hidden sm:block">
            <FilmIcon size={36} className="text-pink-500" />
          </div>
          <div>
            <div className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {filters.industry === "All"
                ? "फिल्में खोजें"
                : `${filters.industry} फिल्में`}
            </div>
            <p className="text-gray-600 dark:text-zinc-400 mt-1 font-light">
              नई, ट्रेंडिंग और आने वाली फिल्मों को देखें
            </p>
          </div>
        </div>

        {/* Active Filters Chips */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-gray-500">सक्रिय फ़िल्टर:</span>
            {Object.entries(filters).map(([key, value]) => {
              if (value !== "All") {
                return (
                  <span key={key} className="inline-flex items-center gap-1 px-2 py-1 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 text-xs rounded-full">
                    {value}
                    <button onClick={() => applyFilter(key, "All")} className="hover:text-pink-900">
                      <X size={12} />
                    </button>
                  </span>
                );
              }
              return null;
            })}
          </div>
        )}
      </div>

      {/* Industry Buttons - अब availableIndustries से डायनामिक */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2">
          {["All", ...availableIndustries].map((industry) => (
            <button
              key={industry}
              onClick={() => applyFilter("industry", industry)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all shadow-sm border capitalize ${
                filters.industry === industry
                  ? "bg-pink-600 text-white border-pink-600 shadow-pink-500/30"
                  : "bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:border-pink-500 hover:text-pink-500"
              }`}
            >
              {industry === "All" ? "सभी फिल्में" : industry}
            </button>
          ))}
        </div>
      </div>

      {/* Filters Section - unchanged */}
      <div className="mb-8">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-gray-900 dark:text-white font-medium hover:text-pink-500 transition-colors bg-white dark:bg-zinc-900 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-zinc-800 shadow-sm"
        >
          <Filter className="w-4 h-4" />
          उन्नत फ़िल्टर
          {activeFiltersCount > 0 && (
            <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full ml-1">{activeFiltersCount}</span>
          )}
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
        </button>

        {showFilters && (
          <div className="mt-4 border border-gray-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900/50 p-6">
            {/* Genre Filter */}
            {availableGenres.length > 0 && (
              <div className="mb-6">
                <label className="text-gray-700 dark:text-gray-300 text-xs font-bold mb-3 uppercase tracking-wider block">
                  🎭 शैली
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyFilter("genre", "All")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.genre === "All"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    All
                  </button>
                  {availableGenres.map(genre => (
                    <button
                      key={genre}
                      onClick={() => applyFilter("genre", genre)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.genre === genre
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {genre}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Language Filter */}
            {availableLanguages.length > 0 && (
              <div className="mb-6">
                <label className="text-gray-700 dark:text-gray-300 text-xs font-bold mb-3 uppercase tracking-wider block">
                  🌐 भाषा
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyFilter("language", "All")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.language === "All"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    All
                  </button>
                  {availableLanguages.map(lang => (
                    <button
                      key={lang}
                      onClick={() => applyFilter("language", lang)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.language === lang
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Platform Filter */}
            {availablePlatforms.length > 0 && (
              <div className="mb-6">
                <label className="text-gray-700 dark:text-gray-300 text-xs font-bold mb-3 uppercase tracking-wider block">
                  📺 प्लेटफॉर्म
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => applyFilter("platform", "All")}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                      filters.platform === "All"
                        ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                    }`}
                  >
                    All
                  </button>
                  {availablePlatforms.map(platform => (
                    <button
                      key={platform}
                      onClick={() => applyFilter("platform", platform)}
                      className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                        filters.platform === platform
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700"
                      }`}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other Filters - Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Year Filter */}
              <div>
                <label className="text-gray-700 dark:text-gray-300 text-xs font-bold mb-3 uppercase tracking-wider block">
                  📅 रिलीज़ वर्ष
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => applyFilter("year", "All")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filters.year === "All"
                        ? "bg-pink-600 text-white"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {availableYears.map(y => (
                    <button
                      key={y}
                      onClick={() => applyFilter("year", y)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filters.year === y
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="text-gray-700 dark:text-gray-300 text-xs font-bold mb-3 uppercase tracking-wider block">
                  ⭐ रेटिंग
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => applyFilter("rating", "All")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filters.rating === "All"
                        ? "bg-pink-600 text-white"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {availableRatings.map(r => (
                    <button
                      key={r}
                      onClick={() => applyFilter("rating", r)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filters.rating === r
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              {/* Certificate Filter */}
              <div>
                <label className="text-gray-700 dark:text-gray-300 text-xs font-bold mb-3 uppercase tracking-wider block">
                  🔞 आयु रेटिंग
                </label>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  <button
                    onClick={() => applyFilter("certificate", "All")}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                      filters.certificate === "All"
                        ? "bg-pink-600 text-white"
                        : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    All
                  </button>
                  {availableCertificates.map(c => (
                    <button
                      key={c}
                      onClick={() => applyFilter("certificate", c)}
                      className={`px-3 py-1 rounded-full text-sm font-medium transition-all ${
                        filters.certificate === c
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Clear All Button */}
            {activeFiltersCount > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-200 dark:border-zinc-800">
                <button
                  onClick={clearAllFilters}
                  className="text-pink-500 hover:text-pink-600 text-sm font-medium flex items-center gap-2 transition-colors"
                >
                  <X size={14} />सभी फ़िल्टर हटाएं
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Movie Sections */}
      <div>
        {filteredMovies.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800">
            <div className="text-6xl mb-4">🎬</div>
            <p className="text-gray-900 dark:text-white text-xl font-bold mb-2">कोई फिल्म उपलब्ध नहीं है</p>
            <p className="text-gray-500 dark:text-zinc-500 text-sm">कृपया बाद में दोबारा देखें या अपने फ़िल्टर हटाएं।</p>
            {activeFiltersCount > 0 && (
              <button
                onClick={clearAllFilters}
                className="mt-4 px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
              >
                सभी फ़िल्टर हटाएं
              </button>
            )}
          </div>
        ) : (
          <>
            {renderMovieSection("🔥 ट्रेंडिंग फिल्में", trendingMovies, "trending")}
            {renderMovieSection(" नई रिलीज़", latestMovies, "latest")}
            {renderMovieSection("📅 आने वाली फिल्में", upcomingMovies, "upcoming")}
          </>
        )}
      </div>
    </div>
  );
}