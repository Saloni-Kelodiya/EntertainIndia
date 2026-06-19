"use client";
import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { moviesAPI, genresAPI } from "../lib/api";
import { getStrapiMedia } from "../lib/constants";
import { Calendar, Clock, ChevronRight, Filter, ChevronDown, FilmIcon } from "lucide-react";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";

// ✅ Genre mapping for Hindi display
const genreHindiMap = {
  // English to Hindi
  "Action": "एक्शन",
  "Adventure": "साहसिक",
  "Animation": "एनीमेशन",
  "Biography": "जीवनी",
  "Comedy": "कॉमेडी",
  "Coming-of-Age": "प्रौढ़ता-आगमन",
  "Cooking Show": "कुकिंग शो",
  "Crime": "अपराध",
  "Devotional": "भक्तिपूर्ण",
  "Drama": "नाटक",
  "Epic": "महाकाव्य",
  "Family": "परिवार",
  "Fantasy": "काल्पनिक",
  "Fashion": "फैशन",
  "Heist": "लूटपाट",
  "Historical": "ऐतिहासिक",
  "Horror": "डरावनी",
  "Music": "संगीत",
  "Mystery": "रहस्य",
  "Mythology": "पौराणिक",
  "Political": "राजनीतिक",
  "Politics": "राजनीति",
  "Reality Television": "रियलिटी टेलीविजन",
  "Romance": "रोमांस",
  "Science Fiction": "विज्ञान कथा",
  "Sci-Fi": "साइंस फिक्शन",
  "Slice of Life": "जीवन का अंश",
  "Social": "सामाजिक",
  "Social Commentary": "सामाजिक टिप्पणी",
  "Sports": "खेल",
  "Spy": "जासूसी",
  "SuperHero": "सुपरहीरो",
  "Supernatural": "अलौकिक",
  "Survival": "उत्तरजीविता",
  "Teen": "किशोर",
  "Thriller": "रोमांचक",
  "War": "युद्ध",
  "Youth": "युवा",
  
  // Direct Hindi entries from your database
  "राजनीति": "राजनीति",
  "सामाजिक": "सामाजिक",
  "ऐतिहासिक": "ऐतिहासिक",
  "रोमांस": "रोमांस",
  "ड्रामा": "नाटक",
  "कॉमेडी": "कॉमेडी",
  "एक्शन": "एक्शन",
  "युद्ध": "युद्ध",
};
// ✅ Language Mapping Function - English to Hindi
export const getHindiLanguageName = (englishName) => {
  const languageMap = {
    // Indian Languages
    "Hindi": "हिंदी",
    "hindi": "हिंदी",
    "Tamil": "तमिल",
    "tamil": "तमिल",
    "Telugu": "तेलुगु",
    "telugu": "तेलुगु",
    "Kannada": "कन्नड़",
    "kannada": "कन्नड़",
    "Malayalam": "मलयालम",
    "malayalam": "मलयालम",
    "Marathi": "मराठी",
    "marathi": "मराठी",
    'Marwari': 'मारवाड़ी',
    'marwari': 'मारवाड़ी',
    "Bengali": "बंगाली",
    "bengali": "बंगाली",
    "Marathi": "मराठी",
    "marathi": "मराठी",
    "Gujarati": "गुजराती",
    "gujarati": "गुजराती",
    "Punjabi": "पंजाबी",
    "punjabi": "पंजाबी",
    "Urdu": "उर्दू",
    "urdu": "उर्दू",
    "Sanskrit": "संस्कृत",
    "sanskrit": "संस्कृत",
    "Bhojpuri": "भोजपुरी",
    "bhojpuri": "भोजपुरी",
    "Odia": "ओड़िया",
    "odia": "ओड़िया",
    "Assamese": "असमिया",
    "assamese": "असमिया",
    
    // Foreign Languages
    "English": "अंग्रेजी",
    "english": "अंग्रेजी",
    "Spanish": "स्पेनिश",
    "spanish": "स्पेनिश",
    "French": "फ्रेंच",
    "french": "फ्रेंच",
    "German": "जर्मन",
    "german": "जर्मन",
    "Italian": "इतालवी",
    "italian": "इतालवी",
    "Portuguese": "पुर्तगाली",
    "portuguese": "पुर्तगाली",
    "Russian": "रूसी",
    "russian": "रूसी",
    "Japanese": "जापानी",
    "japanese": "जापानी",
    "Chinese": "चीनी",
    "chinese": "चीनी",
    "Korean": "कोरियाई",
    "korean": "कोरियाई",
    "Arabic": "अरबी",
    "arabic": "अरबी",
    
    // Other
    "Multilingual": "बहुभाषी",
    "multilingual": "बहुभाषी",
    "Dubbed": "डबbed",
    "dubbed": "डबbed",
  };
  
  if (!englishName) return "";
  
  // Return Hindi name if mapping exists, otherwise return original
  return languageMap[englishName] || englishName;
};
// Function to get display name (Hindi) for a genre
const getGenreDisplayName = (genreName) => {
  if (!genreName) return genreName;
  if (genreHindiMap[genreName]) {
    return genreHindiMap[genreName];
  }
  return genreName;
};

export default function MoviesPage({ serverCategory, initialMovies, initialGenres }) {
  // ✅ Server se aaye data ko initial state banana
  const [movies] = useState(initialMovies || []);
  const [loading] = useState(false); // No more initial loading

  const [showFilters, setShowFilters] = useState(false);
  const [expandedGenres, setExpandedGenres] = useState({});

  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [availableRatings, setAvailableRatings] = useState([]);
  const [availableCertificates, setAvailableCertificates] = useState([]);

  const [filters, setFilters] = useState({
    genre: "सभी",
    year: "सभी",
    rating: "सभी",
    certificate: "सभी",
    language: "All",
  });

  // Extract languages from movies
  useEffect(() => {
    if (movies.length > 0) {
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
    }
  }, [movies]);

  useEffect(() => {
    if (movies.length > 0) {
      // Release Years
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

      // Certificates (Age Rating)
      const certs = [...new Set(movies.map(m => {
        if (!m.certificate) return null;
        return typeof m.certificate === 'object'
          ? String(m.certificate.name || m.certificate.title || m.certificate.id || "")
          : String(m.certificate);
      }).filter(Boolean))];
      setAvailableCertificates(certs);
    }
  }, [movies]);

  // Get unique genres from data with Hindi display names
  const uniqueGenres = useMemo(() => {
    const genres = new Set();
    movies.forEach(item => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach(g => {
          const genreName = typeof g === 'object' ? g.name : g;
          if (genreName && genreName !== "undefined" && genreName !== "null") {
            genres.add(genreName);
          }
        });
      }
    });
    // Convert to array and sort
    return Array.from(genres).sort((a, b) => {
      const nameA = getGenreDisplayName(a);
      const nameB = getGenreDisplayName(b);
      return nameA.localeCompare(nameB, 'hi');
    });
  }, [movies]);

  const applyFilter = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      genre: "सभी",
      year: "सभी",
      rating: "सभी",
      certificate: "सभी",
      language: "All",
    });
  };

  const applyFrontendFilters = (items) => {
    return items.filter((movie) => {
      // LANGUAGE filter
      if (filters.language !== "All") {
        const hasLanguage = movie.languages?.some(lang => {
          const langStr = typeof lang === 'object' ? (lang.language || lang.name) : lang;
          return langStr === filters.language;
        });
        if (!hasLanguage) return false;
      }

      // GENRE (relation check)
      if (filters.genre !== "सभी") {
        const hasGenre = movie.genres?.some(g => {
          const genreStr = typeof g === 'object' ? (g.name || g.slug || "") : g;
          return (genreStr || "").toLowerCase().trim() === filters.genre.toLowerCase().trim();
        });
        if (!hasGenre) return false;
      }

      // RATING
      if (filters.rating !== "सभी") {
        const r = movie.rating;
        if (r == null) return false;
        const movieRating = typeof r === 'object'
          ? String(r.title || r.name || r.value || r.id)
          : String(r);
        if (movieRating !== filters.rating) return false;
      }

      // CERTIFICATE / AGE RATING
      if (filters.certificate !== "सभी") {
        const c = movie.certificate;
        if (c == null) return false;
        const movieCert = typeof c === "object"
          ? String(c.name || c.title || c.id || "")
          : String(c);
        if (movieCert !== filters.certificate) return false;
      }

      // YEAR
      if (filters.year !== "सभी") {
        const movieYear = String(movie.year);
        if (movieYear !== filters.year) return false;
      }

      return true;
    });
  };

  const filtered = applyFrontendFilters(movies)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  const moviesByGenre = {};

  const showAllMoviesWithGenres =
    filters.genre === "सभी" &&
    filters.year === "सभी" &&
    filters.rating === "सभी" &&
    filters.certificate === "सभी" &&
    filters.language === "All";

  const moviesToGroup = showAllMoviesWithGenres ? movies : [];

  if (moviesToGroup.length > 0) {
    moviesToGroup.forEach((movie) => {
      const g = movie.genres?.[0];
      if (!g) return;

      const primaryGenre = typeof g === 'object' ? (g.name || g.slug) : g;
      if (!primaryGenre) return;

      if (!moviesByGenre[primaryGenre]) {
        moviesByGenre[primaryGenre] = [];
      }
      moviesByGenre[primaryGenre].push(movie);
    });
  }

  const activeFiltersCount = Object.values(filters).filter(v => v !== "सभी" && v !== "All").length;

  const toggleGenre = (genreName) => {
    setExpandedGenres(prev => ({
      ...prev,
      [genreName]: !prev[genreName]
    }));
  };

  const MovieCard = ({ movie }) => {
    const posterUrl = movie.poster?.url || null;

    const year = movie.year || (movie.releaseDate ? new Date(movie.releaseDate).getFullYear() : "N/A");

    return (
      <Link
        href={`/${serverCategory}/movies/${movie.slug}`}
        className="group block"
      >
        <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-200 dark:bg-gray-900">
          {posterUrl ? (
            <Image
              src={posterUrl}
              alt={movie.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 16vw"
               loading="lazy"
            quality={75}
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gray-300 dark:bg-gray-800 text-3xl">
              🎬
            </div>
          )}

          {movie.certificate && (
            <div className="absolute bottom-2 left-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">
              {typeof movie.certificate === 'object'
                ? (movie.certificate.name || movie.certificate.title)
                : movie.certificate}
            </div>
          )}

          {movie.rating && (
            <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-sm font-bold">
              ⭐ {typeof movie.rating === 'object'
                ? (movie.rating.title || movie.rating.name)
                : movie.rating}
            </div>
          )}
        </div>

        <h3 className="text-gray-900 dark:text-white font-semibold line-clamp-1 group-hover:text-pink-500 transition-colors text-sm mt-1">
          {movie.title}
        </h3>

        <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mt-1">
          <Calendar className="w-3 h-3 mr-1" />
          <span className="mr-2">{year}</span>

          {movie.duration && (
            <>
              <Clock className="w-3 h-3 mr-1" />
              <span>{movie.duration}</span>
            </>
          )}
        </div>

        {movie.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {movie.genres.slice(0, 3).map((genre, idx) => {
              const genreName = typeof genre === 'object' ? (genre.name || genre.slug) : genre;
              return (
                <span
                  key={idx}
                  className="px-2 py-1 text-xs rounded-full bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 line-clamp-1"
                >
                  {getGenreDisplayName(genreName)}
                </span>
              );
            })}
            {movie.genres.length > 3 && (
              <span className="px-2 py-1 text-xs rounded-full bg-gray-300 dark:bg-neutral-700 text-gray-600 dark:text-gray-400">
                +{movie.genres.length - 3}
              </span>
            )}
          </div>
        )}
      </Link>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] p-6 rounded-2xl dark:bg-gray-800">
      <div>
        <TopCategoryTabs />

        <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <FilmIcon size={28} className="text-pink-500" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              फिल्में
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              हर जॉनर, रेटिंग और रिलीज ईयर की फिल्मों का हमारा विशाल कलेक्शन देखें
            </p>
          </div>
        </div>
      </div>

      <div>
        {/* LANGUAGE FILTER */}
       {availableLanguages.length > 0 && (
  <div className="mt-4">
    <div className="flex flex-wrap gap-2">
      {["All", ...availableLanguages].map((language) => (
        <button
          key={language}
          onClick={() => applyFilter("language", language)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${
            filters.language === language
              ? "bg-pink-600 text-white shadow-md"
              : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
          }`}
        >
          {language === "All" ? "सभी भाषाएँ" : getHindiLanguageName(language)}
        </button>
      ))}
    </div>
  </div>
)}

        {/* Filters Section */}
        <div className="border-gray-200 dark:border-gray-800 mb-6">
          <div className="py-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 text-gray-900 dark:text-white font-medium hover:text-pink-500 transition-colors"
            >
              <Filter className="w-5 h-5" />
              फिल्टर
              {activeFiltersCount > 0 && (
                <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFiltersCount}
                </span>
              )}
              <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            {showFilters && (
              <div className="mt-6 pb-6 border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-gray-50 dark:bg-neutral-900/50">
                <div className="">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => applyFilter("genre", "सभी")}
                      className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${filters.genre === "सभी"
                        ? "bg-pink-600 text-white"
                        : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                      }`}
                    >
                      सभी जॉनर
                    </button>
                    {uniqueGenres.map((genre) => (
                      <button
                        key={genre}
                        onClick={() => applyFilter("genre", genre)}
                        className={`px-6 py-2 rounded-full text-sm font-semibold transition-all shadow-sm ${filters.genre === genre
                          ? "bg-pink-600 text-white"
                          : "bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-neutral-700"
                        }`}
                      >
                        {getGenreDisplayName(genre)}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
                  {/* Year Filter */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">रिलीज ईयर</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => applyFilter("year", "सभी")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.year === "सभी"
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                          : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                        }`}
                      >
                        सभी
                      </button>
                      {availableYears.map(y => (
                        <button
                          key={y}
                          onClick={() => applyFilter("year", y)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.year === y
                            ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                            : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {y}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">रेटिंग</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => applyFilter("rating", "सभी")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.rating === "सभी"
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                          : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                        }`}
                      >
                        सभी
                      </button>
                      {availableRatings.map(r => (
                        <button
                          key={r}
                          onClick={() => applyFilter("rating", r)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.rating === r
                            ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                            : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Age Rating Filter */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">आयु रेटिंग</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => applyFilter("certificate", "सभी")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.certificate === "सभी"
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                          : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                        }`}
                      >
                        सभी
                      </button>
                      {availableCertificates.map(c => (
                        <button
                          key={c}
                          onClick={() => applyFilter("certificate", c)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.certificate === c
                            ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                            : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {activeFiltersCount > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <button
                      onClick={clearAllFilters}
                      className="text-pink-500 hover:text-pink-400 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                      <span>✕</span> सभी फिल्टर हटाएं
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Movies Grid */}
        <div className="py-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] bg-gray-300 dark:bg-gray-800 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : showAllMoviesWithGenres ? (
            <div className="space-y-12">
              {Object.entries(moviesByGenre).length === 0 && filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filtered.map(movie => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ) : Object.entries(moviesByGenre).length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">कोई फिल्म उपलब्ध नहीं</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">कृपया बाद में दोबारा जाँच करें</p>
                </div>
              ) : (
                Object.entries(moviesByGenre)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .map(([genreName, genreMovies]) => {
                    const isExpanded = expandedGenres[genreName];
                    const displayMovies = isExpanded ? genreMovies : genreMovies.slice(0, 6);

                    return (
                      <div key={genreName}>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-gray-900 dark:text-white text-2xl font-bold">
                            {getGenreDisplayName(genreName)}
                            <span className="text-gray-500 dark:text-gray-400 text-lg ml-2 font-normal">
                              ({genreMovies.length} फिल्में)
                            </span>
                          </h2>

                          {genreMovies.length > 6 && (
                            <button
                              onClick={() => toggleGenre(genreName)}
                              className="flex items-center gap-1 text-pink-500 hover:text-pink-400 font-medium transition-colors"
                            >
                              {isExpanded ? "कम दिखाएं" : "सभी देखें"}
                              <ChevronRight className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                          {displayMovies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                          ))}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-gray-900 dark:text-white text-2xl font-bold">
                  {filters.genre !== "सभी" ? getGenreDisplayName(filters.genre) : "फिल्में"}
                  <span className="text-gray-500 dark:text-gray-400 text-lg ml-2 font-normal">
                    ({filtered.length} फिल्में)
                  </span>
                </h2>
              </div>

              {filtered.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filtered.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">🎬</div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">कोई फिल्म नहीं मिली</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">अपने फिल्टर बदलकर देखें</p>
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition-colors"
                  >
                    सभी फिल्टर हटाएं
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}