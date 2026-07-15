"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Clock, ChevronRight, Filter, ChevronDown, TvIcon, ExternalLink } from "lucide-react";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import { getStrapiMedia } from "../lib/constants";

// 📺 स्ट्रीमिंग प्लेटफॉर्म लोगो
const PLATFORM_ICONS = {
  'netflix': '/platform-icons/Netflix.webp',
  'amazon prime': '/platform-icons/Amazon-Prime.svg',
  'prime video': '/platform-icons/Amazon-Prime.svg',
  'amazon prime video': '/platform-icons/Amazon-Prime.webp',
  'hotstar': '/platform-icons/JioHotstar.webp',
  'disney+ hotstar': '/platform-icons/JioHotstar.webp',
  'zee5': '/platform-icons/Zee5.svg',
  'sonyliv': '/platform-icons/SonyLIV.svg',
  'sony liv': '/platform-icons/SonyLIV.svg',
  'jiocinema': '/platform-icons/JioCinema.svg',
  'jio cinema': '/platform-icons/JioCinema.svg',
  'youtube': '/platform-icons/YouTube.svg',
  'apple tv': '/platform-icons/AppleTV.webp',
};


const PlatformIcon = ({ platform }) => {
  if (!platform) return null;

  let platformName = '';

  if (typeof platform === 'string') {
    platformName = platform;
  } else if (platform?.platform) {
    platformName = typeof platform.platform === 'string'
      ? platform.platform
      : platform.platform?.platform || '';
  } else if (platform?.name) {
    platformName = platform.name;
  }

  if (!platformName) return null;

  const name = platformName.toLowerCase().trim();

  let iconUrl = null;

  if (PLATFORM_ICONS[name]) {
    iconUrl = PLATFORM_ICONS[name];
  } else if (name.includes('netflix')) {
    iconUrl = PLATFORM_ICONS['netflix'];
  } else if (name.includes('prime') || name.includes('amazon')) {
    iconUrl = PLATFORM_ICONS['amazon prime'];
  } else if (name.includes('hotstar') || name.includes('disney')) {
    iconUrl = PLATFORM_ICONS['hotstar'];
  } else if (name.includes('zee')) {
    iconUrl = PLATFORM_ICONS['zee5'];
  } else if (name.includes('sony') || name.includes('liv')) {
    iconUrl = PLATFORM_ICONS['sony liv'];
  } else if (name.includes('jio')) {
    iconUrl = PLATFORM_ICONS['jio cinema'];
  } else if (name.includes('youtube')) {
    iconUrl = PLATFORM_ICONS['youtube'];
  } else if (name.includes('apple')) {
    iconUrl = PLATFORM_ICONS['apple tv'];
  }

  if (!iconUrl) return null;

  return (
    <img
      src={iconUrl}
      alt={platformName}
      className="w-4 h-4 object-contain rounded-sm"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
      }}
    />
  );
};

//  Genre mapping for Hindi display
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

export default function TVShowsPage({ serverCategory, initialShows = [], initialGenres = [] }) {
  const [shows] = useState(initialShows);
  const [availableGenres] = useState(initialGenres);

  const [loading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [expandedGenres, setExpandedGenres] = useState({});

  const [filters, setFilters] = useState({
    genre: "All",
    year: "All",
    rating: "All",
    certificate: "All",
    language: "All",
    platform: "All",
  });

  // Get unique genres from data with Hindi display names
  const uniqueGenres = useMemo(() => {
    const genres = new Set();
    shows.forEach(item => {
      if (item.genres && Array.isArray(item.genres)) {
        item.genres.forEach(g => {
          const genreName = typeof g === 'object' ? g.name : g;
          if (genreName && genreName !== "undefined" && genreName !== "null") {
            genres.add(genreName);
          }
        });
      }
    });
    return Array.from(genres).sort((a, b) => {
      const nameA = getGenreDisplayName(a);
      const nameB = getGenreDisplayName(b);
      return nameA.localeCompare(nameB, 'hi');
    });
  }, [shows]);

  const availableYears = useMemo(() =>
    [...new Set(shows.map(s => {
      const date = s.realeaseDate || s.releaseDate;
      return date ? new Date(date).getFullYear().toString() : null;
    }).filter(Boolean))].sort((a, b) => b - a),
    [shows]
  );

  const availableRatings = useMemo(() =>
    [...new Set(shows.map(s => {
      const r = s.rating;
      if (!r) return null;
      return typeof r === 'object' ? String(r.title || r.name || "") : String(r);
    }).filter(r => r && r !== "undefined" && r !== "null"))].sort((a, b) => parseFloat(b) - parseFloat(a)),
    [shows]
  );

  const availableCertificates = useMemo(() =>
    [...new Set(shows.map(s => {
      const c = s.age_rating;
      if (!c) return null;
      return typeof c === 'object' ? String(c.name || c.title || "") : String(c);
    }).filter(c => c && c !== "undefined" && c !== "null"))].sort(),
    [shows]
  );

  const availableLanguages = useMemo(() =>
    [...new Set(shows.flatMap(s => s.languages?.map(l => l.language || l.name) || []).filter(Boolean))].sort(),
    [shows]
  );

  const availablePlatforms = useMemo(() =>
    [...new Set(shows.flatMap(s => s.watchingPlatform?.map(p => p.platform?.trim()) || []).filter(Boolean))].sort(),
    [shows]
  );

  const applyFilter = (key, value) => setFilters(prev => ({ ...prev, [key]: value }));
  const clearAllFilters = () => setFilters({ 
    genre: "All", 
    year: "All", 
    rating: "All", 
    certificate: "All", 
    language: "All", 
    platform: "All" 
  });

  const filteredItems = useMemo(() => {
    return shows.filter((item) => {
      if (filters.genre !== "All") {
        const hasGenre = item.genres?.some(g => (typeof g === 'object' ? g.name : g) === filters.genre);
        if (!hasGenre) return false;
      }

      if (filters.rating !== "All") {
        const itemRating = typeof item.rating === 'object' 
          ? String(item.rating.title || item.rating.name) 
          : String(item.rating || "");
        if (itemRating !== filters.rating) return false;
      }

      if (filters.certificate !== "All") {
        const itemCert = typeof item.age_rating === 'object' 
          ? String(item.age_rating.name || item.age_rating.title) 
          : String(item.age_rating || "");
        if (itemCert !== filters.certificate) return false;
      }

      if (filters.year !== "All") {
        const date = item.realeaseDate || item.releaseDate;
        const itemYear = date ? new Date(date).getFullYear().toString() : "";
        if (itemYear !== filters.year) return false;
      }

      if (filters.language !== "All") {
        const hasLang = item.languages?.some(l => (typeof l === 'object' ? (l.language || l.name) : l) === filters.language);
        if (!hasLang) return false;
      }

      if (filters.platform !== "All") {
        const hasPlatform = item.watchingPlatform?.some(p => p.platform?.trim() === filters.platform);
        if (!hasPlatform) return false;
      }

      return true;
    }).sort((a, b) => (b.rating || 0) - (a.rating || 0));
  }, [shows, filters]);

  const showsByGenre = useMemo(() => {
    const grouped = {};
    const showAll = Object.values(filters).every(v => v === "All");
    if (showAll) {
      shows.forEach((item) => {
        const g = item.genres?.[0];
        const primaryGenre = typeof g === 'object' ? g.name : g;
        if (primaryGenre) {
          if (!grouped[primaryGenre]) grouped[primaryGenre] = [];
          grouped[primaryGenre].push(item);
        }
      });
    }
    return grouped;
  }, [shows, filters]);

  const showAllShowsWithGenres = Object.values(filters).every(v => v === "All");
  const activeFiltersCount = Object.values(filters).filter(v => v !== "All").length;
  const toggleGenre = (genreName) => setExpandedGenres(prev => ({ ...prev, [genreName]: !prev[genreName] }));

  const TVShowCard = ({ show }) => {
    const posterUrl = typeof show.poster === 'string' ? show.poster : show.poster?.url || null;
    const releaseDate = show.realeaseDate || show.releaseDate;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : "N/A";
    
    const seasonsCount = Array.isArray(show.shows_seasons) ? show.shows_seasons.length : (show.seasonNumber || 0);
    
    const platforms = Array.isArray(show.watchingPlatform) 
      ? show.watchingPlatform.slice(0, 3) 
      : [];
    const hasMorePlatforms = Array.isArray(show.watchingPlatform) && show.watchingPlatform.length > 3;

    return (
      <div className="group block">
        <Link href={`/${serverCategory || 'entertainment'}/shows/${show.slug}`}>
          <div className="relative aspect-[2/3] rounded-lg overflow-hidden mb-2 bg-gray-200 dark:bg-gray-900">
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt={show.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 16vw"
                 loading="lazy"
            quality={75}
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gray-300 dark:bg-gray-800 text-3xl">📺</div>
            )}
            
            {show.age_rating && (
              <div className="absolute bottom-2 left-2 bg-pink-600 text-white px-2 py-1 rounded text-xs font-bold">
                {typeof show.age_rating === 'object' ? show.age_rating.name || show.age_rating.title : show.age_rating}
              </div>
            )}
            
            {show.rating && (
              <div className="absolute top-2 right-2 bg-black/80 text-yellow-400 px-2 py-1 rounded text-sm font-bold">
                ⭐ {typeof show.rating === 'object' ? (show.rating.title || show.rating.name) : show.rating}
              </div>
            )}
          </div>
          <h3 className="text-gray-900 dark:text-white font-semibold line-clamp-1 group-hover:text-pink-500 transition-colors text-sm mt-1">
            {show.title}
          </h3>
          <div className="flex items-center text-gray-600 dark:text-gray-400 text-xs mt-1">
            <Calendar className="w-3 h-3 mr-1" />
            <span className="mr-2">{year}</span>
            
            {seasonsCount > 0 && (
              <>
                <Clock className="w-3 h-3 mr-1" />
                <span>{seasonsCount} {seasonsCount === 1 ? 'सीजन' : 'सीजन'}</span>
              </>
            )}
          </div>
        </Link>

        {platforms.length > 0 && (
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {platforms.map((platform, idx) => {
              const platformName = platform.platform?.trim() || 'प्लेटफॉर्म';
              
              return platform.url && platform.url !== '#' ? (
                <a
                  key={idx}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-1.5 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded hover:bg-pink-100 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400 transition-all border border-gray-200 dark:border-gray-700"
                  title={`${platformName} पर देखें`}
                >
                  <PlatformIcon platform={platform} />
                  <span className="truncate max-w-[50px]">{platformName}</span>
                </a>
              ) : (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-1.5 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded border border-gray-200 dark:border-gray-700 cursor-default"
                  title={platform.watch_status === 'subscription' ? 'स्ट्रीमिंग के लिए उपलब्ध' : 'जल्द आ रहा है'}
                >
                  <PlatformIcon platform={platform} />
                  <span className="truncate max-w-[50px]">{platformName}</span>
                </span>
              );
            })}
            
            {hasMorePlatforms && (
              <Link
                href={`/${serverCategory || 'entertainment'}/shows/${show.slug}`}
                className="inline-flex items-center gap-1 px-2 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-all border border-gray-200 dark:border-gray-700"
                title="सभी प्लेटफॉर्म देखें"
              >
                <span>+{show.watchingPlatform.length - 3}</span>
                <ChevronRight size={8} />
              </Link>
            )}
          </div>
        )}

        {platforms.length === 0 && show.watchingPlatform?.[0]?.watch_status && (
          <div className="mt-2">
            <span className="inline-block px-2 py-1 text-[10px] font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-500 rounded border border-gray-200 dark:border-gray-700">
              {show.watchingPlatform[0].watch_status === 'subscription' ? 'जल्द आ रहा है' : 'स्ट्रीमिंग के लिए उपलब्ध'}
            </span>
          </div>
        )}

        {show.genres?.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {show.genres.slice(0, 2).map((genre, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-[10px] rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
              >
                {getGenreDisplayName(typeof genre === 'object' ? genre.name : genre)}
              </span>
            ))}
            {show.genres.length > 2 && (
              <span className="px-2 py-1 text-[10px] rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                +{show.genres.length - 2}
              </span>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div>
        <TopCategoryTabs currentCategory={serverCategory} />

        <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <TvIcon size={28} className="text-pink-500" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              टीवी शो
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              विभिन्न जीनर, रेटिंग और रिलीज वर्षों में टीवी शो का विशाल संग्रह देखें
            </p>
          </div>
        </div>
      </div>

      <div>
         {/* Language Filter */}
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">भाषा</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => applyFilter("language", "All")}
                        className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                          filters.language === "All"
                            ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                            : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                        }`}
                      >
                        सभी
                      </button>
                      {availableLanguages.map(l => (
                        <button
                          key={l}
                          onClick={() => applyFilter("language", l)}
                          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                            filters.language === l
                              ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                              : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                          }`}
                        >
                           {l === "All" ? "सभी भाषाएँ" : getHindiLanguageName(l)}
                        </button>
                      ))}
                    </div>
                  </div>
       

        {/* Filter Section */}
        {/* Genre Filter - Now inside filter section with row layout */}
              <div className="border-gray-200 dark:border-gray-800 mb-6">
                <div className="py-4">
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="flex items-center gap-2 text-gray-900 dark:text-white font-medium hover:text-pink-500 transition-colors"
                  >
                    <Filter className="w-5 h-5" />
                    फ़िल्टर
                    {activeFiltersCount > 0 && (
                      <span className="bg-pink-600 text-white text-xs px-2 py-0.5 rounded-full">
                        {activeFiltersCount}
                      </span>
                    )}
                    <ChevronDown className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                  </button>
      
                  {showFilters && (
                    <div className="mt-6 pb-6 border border-gray-200 dark:border-gray-800 rounded-lg p-6 bg-gray-50 dark:bg-neutral-900/50">
                      
                      {/* Genre Filter - Full width row with Hindi names */}
                      <div className="mb-8">
                        <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">शैली</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => applyFilter("genre", "All")}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.genre === "All"
                              ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                              : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                              }`}
                          >
                            सभी
                          </button>
                          {uniqueGenres.map(g => (
                            <button
                              key={g}
                              onClick={() => applyFilter("genre", g)}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.genre === g
                                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                                : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                }`}
                            >
                              {getGenreDisplayName(g)}
                            </button>
                          ))}
                        </div>
                      </div>
      
                      {/* Remaining filters in 4-column grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        {/* Year Filter */}
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">रिलीज़ वर्ष</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => applyFilter("year", "All")}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.year === "All"
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
                              onClick={() => applyFilter("rating", "All")}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.rating === "All"
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
                                {r} ★
                              </button>
                            ))}
                          </div>
                        </div>
      
                        {/* Age Rating Filter */}
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">आयु रेटिंग</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => applyFilter("certificate", "All")}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.certificate === "All"
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
      
                        {/* Platform Filter */}
                        <div>
                          <p className="text-gray-600 dark:text-gray-400 text-xs font-medium mb-3 uppercase tracking-wider">प्लेटफॉर्म</p>
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => applyFilter("platform", "All")}
                              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.platform === "All"
                                ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                                : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                }`}
                            >
                              सभी
                            </button>
                            {availablePlatforms.map(p => (
                              <button
                                key={p}
                                onClick={() => applyFilter("platform", p)}
                                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${filters.platform === p
                                  ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                                  : "bg-gray-200 dark:bg-neutral-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-neutral-700"
                                  }`}
                              >
                                {p}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
      
                      {activeFiltersCount > 0 && (
                        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-800">
                          <button
                            onClick={clearAllFilters}
                            className="text-pink-500 hover:text-pink-400 text-sm font-medium flex items-center gap-2 transition-colors"
                          >
                            <span>✕</span> सभी फ़िल्टर हटाएं
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

        {/* Shows Grid */}
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
          ) : showAllShowsWithGenres ? (
            <div className="space-y-12">
              {Object.entries(showsByGenre).length === 0 && filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredItems.map(item => (
                    <TVShowCard key={item.id} show={item} />
                  ))}
                </div>
              ) : Object.entries(showsByGenre).length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📺</div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">कोई टीवी शो उपलब्ध नहीं है</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm">कृपया बाद में देखें</p>
                </div>
              ) : (
                Object.entries(showsByGenre)
                  .sort(([, a], [, b]) => b.length - a.length)
                  .map(([genreName, genreShows]) => {
                    const isExpanded = expandedGenres[genreName];
                    const displayShows = isExpanded ? genreShows : genreShows.slice(0, 6);

                    return (
                      <div key={genreName}>
                        <div className="flex items-center justify-between mb-6">
                          <h2 className="text-gray-900 dark:text-white text-2xl font-bold">
                            {getGenreDisplayName(genreName)}
                            <span className="text-gray-500 dark:text-gray-400 text-lg ml-2 font-normal">
                              ({genreShows.length} शो)
                            </span>
                          </h2>

                          {genreShows.length > 6 && (
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
                          {displayShows.map((item) => (
                            <TVShowCard key={item.id} show={item} />
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
                  {filters.genre !== "All" ? getGenreDisplayName(filters.genre) : "टीवी शो"}
                  <span className="text-gray-500 dark:text-gray-400 text-lg ml-2 font-normal">
                    ({filteredItems.length} शो)
                  </span>
                </h2>
              </div>

              {filteredItems.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                  {filteredItems.map((item) => (
                    <TVShowCard key={item.id} show={item} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <div className="text-6xl mb-4">📺</div>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">कोई टीवी शो नहीं मिला</p>
                  <p className="text-gray-500 dark:text-gray-500 text-sm mb-4">कृपया अपने फिल्टर बदलें</p>
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