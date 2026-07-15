'use client';

import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Film,
  Tv,
  MonitorPlay,
  Layers,
  Tag,
  Sparkles,
  XCircle,
  Calendar,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import TopCategoryTabs from '../components/ui/TopCategoryTabs';

/* ---------------- CONSTANTS ---------------- */
const CATEGORY_ICONS = {
  All: Sparkles,
  Bollywood: Film,
  Hollywood: Film,
  OTT: MonitorPlay,
  TV: Tv,
  Tollywood: Film,
  Bhojiwood: Film,
};

const CATEGORY_HINDI = {
  All: 'सभी',
  Bollywood: 'बॉलीवुड',
  Hollywood: 'हॉलीवुड',
  OTT: 'ओटीटी',
  TV: 'टीवी',
  Tollywood: 'टॉलीवुड',
  Bhojiwood: 'भोजपुरी सिनेमा',
};

const PLATFORM_ICONS = {
  all: Layers,
  Netflix: MonitorPlay,
  Prime: MonitorPlay,
  Hotstar: MonitorPlay,
  JioHotstar: MonitorPlay,
  SonyLIV: MonitorPlay,
  Zee5: MonitorPlay,
  Stage: MonitorPlay,
};

const PLATFORM_HINDI = {
  all: 'सभी प्लेटफॉर्म',
  Netflix: 'नेटफ्लिक्स',
  Prime: 'अमेज़न प्राइम',
  Hotstar: 'हॉटस्टार',
  JioHotstar: 'जियोहॉटस्टार',
  SonyLIV: 'सोनीलिव',
  Zee5: 'ज़ी5',
  Stage: 'स्टेज',
};

const CATEGORIES = ['All', 'Bollywood', 'Hollywood', 'OTT', 'TV', 'Tollywood', 'Bhojiwood'];

const PLATFORMS = [
  { label: 'सभी प्लेटफॉर्म', value: 'all', color: 'bg-gray-600' },
  { label: 'नेटफ्लिक्स', value: 'Netflix', color: 'bg-red-600' },
 { label: 'अमेज़न प्राइम', value: 'Amazon Prime', color: 'bg-blue-600' },
  { label: 'ज़ी5', value: 'Zee5', color: 'bg-orange-600' },
  { label: 'जियोहॉटस्टार', value: 'JioHotstar', color: 'bg-pink-600' },
  { label: 'सोनीलिव', value: 'SonyLIV', color: 'bg-purple-600' },
  { label: 'स्टेज', value: 'Stage', color: 'bg-green-600' },
];

const GENRES_VISIBLE_LIMIT = 15;

// ─── हेल्पर: केस-इंसेंसिटिव हिंदी नाम ───────────────
const getHindiName = (map, key) => {
  if (!key) return key;
  const trimmed = key.trim();
  if (map[trimmed]) return map[trimmed];
  const lower = trimmed.toLowerCase();
  const foundKey = Object.keys(map).find(k => k.toLowerCase() === lower);
  return foundKey ? map[foundKey] : trimmed;
};

const getPlatformColor = (platformName) => {
  const platformColors = {
    Netflix: 'bg-red-600',
    Prime: 'bg-blue-600',
    Zee5: 'bg-orange-600',
    JioHotstar: 'bg-pink-600',
    SonyLIV: 'bg-purple-600',
    Stage: 'bg-green-600',
  };
  const key = platformName?.trim();
  return platformColors[key] || 'bg-gray-600';
};

const Badge = ({ children, className = 'bg-gray-600', icon: Icon = null }) => {
  return (
    <span
      className={`${className} rounded-full px-3 py-1 text-xs font-semibold text-white inline-flex items-center gap-1 shadow-sm`}
    >
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
};

// ─── आर्टिकल कार्ड ─────────────────────────────────────
const ArticleCard = ({ article }) => {
  const imageUrl =
    article?.heroImage?.formats?.medium?.url ||
    article?.hero_image?.formats?.medium?.url ||
    article?.heroImage?.formats?.small?.url ||
    article?.heroImage?.url ||
    null;

  const publishDate =
    article?.publishedAt ||
    article?.publish_datetime ||
    article?.createdAt ||
    new Date().toISOString();

  const formattedDate = new Date(publishDate).toLocaleDateString('hi-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ✅ कैटेगरी का हिंदी नाम – केस-इंसेंसिटिव
  const getCategoryName = () => {
    let categoryValue = null;
    if (Array.isArray(article.category) && article.category.length > 0) {
      categoryValue = article.category[0].name;
    } else if (article.category?.name) {
      categoryValue = article.category.name;
    }
    return categoryValue ? getHindiName(CATEGORY_HINDI, categoryValue) : null;
  };

  // ✅ जेनर निकालें
  const getGenres = () => {
    if (Array.isArray(article.genres) && article.genres.length > 0) {
      return article.genres.filter(g => g && g.name);
    }
    if (article.genres?.data && Array.isArray(article.genres.data)) {
      return article.genres.data.map(g => ({
        id: g.id,
        name: g.attributes?.name || g.name,
        slug: g.attributes?.slug || g.slug,
      })).filter(g => g.name);
    }
    if (Array.isArray(article.tags) && article.tags.length > 0) {
      return article.tags.filter(t => t && t.name);
    }
    if (article.tags?.data && Array.isArray(article.tags.data)) {
      return article.tags.data.map(t => ({
        id: t.id,
        name: t.attributes?.name || t.name,
        slug: t.attributes?.slug || t.slug,
      })).filter(t => t.name);
    }
    return [];
  };

  const genres = getGenres();
  const categoryName = getCategoryName();

  return (
    <Link
      href={`/article/${article.slug}`}
      className="group block card-theme overflow-hidden rounded-2xl bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-gray-100 dark:bg-gray-700">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={article.title || 'Article'}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            priority={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Film className="w-12 h-12 text-gray-400" />
          </div>
        )}

        <div className="absolute top-2 left-2 right-2 flex flex-wrap gap-2 z-10">
          {categoryName && <Badge className="bg-red-600">{categoryName}</Badge>}

          {article.watching_platform?.slice(0, 2).map((platform, idx) => {
            const platformName = platform.platform?.trim();
            return (
              <Badge
                key={idx}
                className={getPlatformColor(platformName)}
                icon={MonitorPlay}
              >
                {getHindiName(PLATFORM_HINDI, platformName)}
              </Badge>
            );
          })}

          {article.watching_platform?.length > 2 && (
            <Badge className="bg-gray-600">+{article.watching_platform.length - 2}</Badge>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 2).map((genre, idx) => (
              <Badge key={genre.id || idx} className="bg-purple-600" icon={Tag}>
                {genre.name}
              </Badge>
            ))}
            {genres.length > 2 && (
              <Badge className="bg-purple-600">+{genres.length - 2}</Badge>
            )}
          </div>
        )}

        <h3 className="text-base font-bold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-600 transition">
          {article.title}
        </h3>

        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
          {article.bio || article.summary || article.excerpt || 'नवीनतम अपडेट, समीक्षाएं और सिफारिशें प्राप्त करें...'}
        </p>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
            <Calendar size={12} />
            <span>{formattedDate}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-sm text-pink-600 group-hover:text-pink-700 font-medium transition">
            पूरा पढ़ें
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </div>
    </Link>
  );
};

// ─── फ़िल्टर रो कंपोनेंट ───────────────────────────────
function FilterRow({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="mb-3 text-sm font-semibold text-neutral-700 dark:text-neutral-300">
        {title}
      </h4>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

// ─── मुख्य कंपोनेंट ──────────────────────────────────────
export default function WhatToWatchClient({
  initialArticles,
  initialGenres,
  serverCategory,
  serverPlatform = 'all',
}) {
  const router = useRouter();
  const pathname = usePathname();

  const [articles, setArticles] = useState(initialArticles);
  const [isLoading, setIsLoading] = useState(false);
  const [showAllGenres, setShowAllGenres] = useState(false);

  const formatCategory = (cat) => {
    if (!cat || cat === '') return 'All';
    return cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase();
  };

  const visibleGenres = useMemo(() => {
    if (!initialGenres || initialGenres.length === 0) return [];
    if (showAllGenres) return initialGenres;
    return initialGenres.slice(0, GENRES_VISIBLE_LIMIT);
  }, [showAllGenres, initialGenres]);

  const hasMoreGenres = initialGenres?.length > GENRES_VISIBLE_LIMIT;
  const hiddenGenresCount = initialGenres?.length - GENRES_VISIBLE_LIMIT;

  const getCategoryFromUrl = () => {
    const pathSegments = pathname.split('/').filter(Boolean);
    if (pathSegments.length === 2 && pathSegments[1] === 'what-to-watch') {
      return formatCategory(pathSegments[0]);
    }
    return 'All';
  };

  const [category, setCategory] = useState(() => {
    if (serverCategory && serverCategory !== 'All') {
      return formatCategory(serverCategory);
    }
    return getCategoryFromUrl();
  });

  const [platform, setPlatform] = useState(serverPlatform || 'all');
  const [selectedGenres, setSelectedGenres] = useState([]);

  useEffect(() => {
    setArticles(initialArticles);
  }, [initialArticles]);

  useEffect(() => {
    const categoryFromUrl = getCategoryFromUrl();
    if (categoryFromUrl !== category) {
      setCategory(categoryFromUrl);
    }
  }, [pathname]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, category]);

  const isMainPage = pathname === '/what-to-watch';
  const hasActiveFilters = category !== 'All' || platform !== 'all' || selectedGenres.length > 0;

  const filteredArticles = articles.filter(article => {
    // Category filter
    if (category !== 'All') {
      let articleCategoryName = null;
      if (Array.isArray(article.category) && article.category.length > 0) {
        articleCategoryName = article.category[0]?.name;
      } else if (article.category?.name) {
        articleCategoryName = article.category.name;
      }
      if (articleCategoryName?.toLowerCase() !== category.toLowerCase()) {
        return false;
      }
    }

    // Platform filter
    if (platform !== 'all') {
      const hasPlatform = article.watching_platform?.some(
        p => p.platform?.trim() === platform
      );
      if (!hasPlatform) return false;
    }

    // Genre filter
    if (selectedGenres.length > 0) {
      const articleGenres = article.genres?.map(g => g.slug) || [];
      const hasMatchingGenre = selectedGenres.some(g => articleGenres.includes(g));
      if (!hasMatchingGenre) return false;
    }

    return true;
  });

  const clearAllFilters = () => {
    setPlatform('all');
    setSelectedGenres([]);
    setShowAllGenres(false);
    router.push('/what-to-watch');
  };

  const handleCategoryChange = (newCategory) => {
    setShowAllGenres(false);
    if (newCategory !== 'All') {
      router.push(`/${newCategory.toLowerCase()}/what-to-watch`);
    } else {
      router.push('/what-to-watch');
    }
  };

  const handlePlatformChange = (newPlatform) => {
    setPlatform(newPlatform);
  };

  const toggleSeeMoreGenres = () => {
    setShowAllGenres(!showAllGenres);
  };

  const getDisplayCategory = () => {
    if (category === 'All') return 'सभी';
    return getHindiName(CATEGORY_HINDI, category);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div>
        {!isMainPage && <TopCategoryTabs />}
        <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <Tv size={28} className="text-pink-500" />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {category !== 'All' ? `${getDisplayCategory()} - ` : ''}क्या देखें
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              टॉप स्ट्रीमिंग प्लेटफॉर्म से क्यूरेटेड सुझाव
            </p>
          </div>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="mb-10 space-y-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              फ़िल्टर
            </h3>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30"
              >
                <XCircle size={16} />
                सभी फ़िल्टर हटाएं
              </button>
            )}
          </div>

          {/* CATEGORY */}
          <FilterRow title="श्रेणी">
            {CATEGORIES.map((c) => {
              const Icon = CATEGORY_ICONS[c] || Film;
              const isActive = category?.toLowerCase() === c.toLowerCase();
              const hindiLabel = getHindiName(CATEGORY_HINDI, c);
              return (
                <button
                  key={c}
                  onClick={() => handleCategoryChange(c)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition whitespace-nowrap
                    ${isActive
                      ? 'bg-red-600 border-red-600 text-white'
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                >
                  <Icon size={14} />
                  {hindiLabel}
                </button>
              );
            })}
          </FilterRow>

          {/* PLATFORM */}
          <FilterRow title="स्ट्रीमिंग प्लेटफॉर्म">
            {PLATFORMS.map((p) => {
              const Icon = PLATFORM_ICONS[p.value] || MonitorPlay;
              const isActive = platform === p.value;
              return (
                <button
                  key={p.value}
                  onClick={() => handlePlatformChange(p.value)}
                  className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition whitespace-nowrap
                    ${isActive
                      ? `${p.color || 'bg-red-600'} text-white`
                      : 'border-neutral-300 text-neutral-700 hover:bg-neutral-200 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                    }`}
                >
                  <Icon size={14} />
                  {p.label}
                </button>
              );
            })}
          </FilterRow>

          {/* GENRES */}
          <FilterRow title="शैलियाँ">
            <div className="flex flex-wrap gap-2">
              {visibleGenres.map((g) => {
                const genreKey = g.slug || g.name;
                const active = selectedGenres.includes(genreKey);
                return (
                  <button
                    key={g.id || genreKey}
                    onClick={() =>
                      setSelectedGenres((prev) =>
                        active ? prev.filter((s) => s !== genreKey) : [...prev, genreKey]
                      )
                    }
                    className={`flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs font-medium transition whitespace-nowrap
                      ${active
                        ? 'bg-red-600 border-red-600 text-white'
                        : 'border-neutral-300 text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800'
                      }`}
                  >
                    <Tag size={12} />
                    {g.name}
                  </button>
                );
              })}

              {hasMoreGenres && (
                <button
                  onClick={toggleSeeMoreGenres}
                  className="flex items-center gap-1.5 rounded-full border border-dashed border-blue-500 bg-blue-50 px-4 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100 dark:border-blue-400 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30"
                >
                  {showAllGenres ? (
                    <>
                      <ChevronUp size={14} /> कम दिखाएं
                    </>
                  ) : (
                    <>
                      <ChevronDown size={14} /> और देखें ({hiddenGenresCount})
                    </>
                  )}
                </button>
              )}
            </div>
          </FilterRow>

          {/* Active Filters Summary */}
          {hasActiveFilters && (
            <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
              <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400">
                सक्रिय फ़िल्टर:
              </span>

              {category !== 'All' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  श्रेणी: {getHindiName(CATEGORY_HINDI, category)}
                  <button
                    onClick={() => handleCategoryChange('All')}
                    className="ml-1 hover:text-red-900"
                  >
                    ×
                  </button>
                </span>
              )}

              {platform !== 'all' && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                  प्लेटफॉर्म: {PLATFORMS.find(p => p.value === platform)?.label}
                  <button onClick={() => setPlatform('all')} className="ml-1 hover:text-blue-900">
                    ×
                  </button>
                </span>
              )}

              {selectedGenres.length > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-purple-100 px-3 py-1 text-xs font-medium text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                  शैलियाँ: {selectedGenres.length} चयनित
                  <button onClick={() => setSelectedGenres([])} className="ml-1 hover:text-purple-900">
                    ×
                  </button>
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6 flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {filteredArticles.length} में से {articles.length} सुझाव दिख रहे हैं
        </p>
      </div>

      {/* ARTICLES GRID */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-2xl h-96 animate-pulse" />
          ))}
        </div>
      ) : (
        <section className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredArticles.map((item) => (
            <ArticleCard key={item.id} article={item} />
          ))}
        </section>
      )}

      {/* No results */}
      {filteredArticles.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="flex justify-center mb-4">
            <Film className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            कोई सुझाव नहीं मिला
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            अधिक कंटेंट खोजने के लिए अपने फ़िल्टर बदलें
          </p>
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 transition"
          >
            सभी फ़िल्टर हटाएं
          </button>
        </div>
      )}
    </main>
  );
}