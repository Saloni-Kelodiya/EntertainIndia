"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Music, ChevronDown, ChevronUp } from "lucide-react";
import ArticleCard from "../components/ui/ArticleCard";
import Pagination from "../components/ui/Pagination";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import { songsAPI, articlesAPI } from "../lib/api";

// Hindi genre mapping (unchanged)
const GENRE_HINDI_MAP = {
  'latest-release': 'नवीनतम रिलीज़',
  'trending': 'ट्रेंडिंग',
  'romantic': 'रोमांटिक',
  'party-hits': 'पार्टी हिट्स',
  'pop': 'पॉप',
  'rock': 'रॉक',
  'hip-hop': 'हिप हॉप',
  'classical': 'शास्त्रीय',
  'bhajan': 'भजन',
  'gazal': 'ग़ज़ल',
  'remix': 'रीमिक्स',
  'instrumental': 'वाद्य',
  'folk': 'लोक',
  'patriotic': 'देशभक्ति',
  'sad': 'उदास',
  'happy': 'खुशनुमा',
  'workout': 'वर्कआउट',
  'devotional': 'भक्ति',
  'action-soundtrack': 'एक्शन साउंडट्रैक',
  'arabic-music': 'अरबी संगीत',
  'bhangra': 'भांगड़ा',
  'bhojpuri-song': 'भोजपुरी गाना',
  'bollywood': 'बॉलीवुड',
  'dance': 'डांस',
  'filmi': 'फिल्मी',
  'item-number': 'आइटम नंबर',
  'item-song': 'आइटम गाना',
  'edm': 'ईडीएम',
  'electronic': 'इलेक्ट्रॉनिक',
  'jazz': 'जैज़',
  'lofi': 'लोफाई',
  'melody': 'मेलोडी',
  'qawwali': 'क़व्वाली',
  'sufi': 'सूफ़ी',
  'wedding': 'वेडिंग',
  'year-end': 'साल के अंत में',
  'retro': 'रेट्रो',
  'birthday': 'जन्मदिन'
};

const getGenreInHindi = (genreSlug, genreName) => {
  if (!genreSlug && !genreName) return "अन्य";
  if (genreSlug && GENRE_HINDI_MAP[genreSlug.toLowerCase()]) {
    return GENRE_HINDI_MAP[genreSlug.toLowerCase()];
  }
  if (genreName) {
    const nameKey = genreName.toLowerCase().replace(/\s+/g, '-');
    if (GENRE_HINDI_MAP[nameKey]) {
      return GENRE_HINDI_MAP[nameKey];
    }
  }
  return genreName || genreSlug || "अन्य";
};

export default function MusicPage({
  serverCategory,
  initialSongs = [],
  initialTrending = [],
  initialArticles = [],
  initialPagination = {},
  initialPage = 1,
}) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  const [articlePage, setArticlePage] = useState(initialPage);
  const [songs, setSongs] = useState(initialSongs);
  const [trendingSongs, setTrendingSongs] = useState(initialTrending);
  const [articles, setArticles] = useState(initialArticles);
  const [articlePagination, setArticlePagination] = useState(initialPagination);
  const [songsLoading, setSongsLoading] = useState(false);
  const [trendingSongsLoading, setTrendingSongsLoading] = useState(false);
  const [articlesLoading, setArticlesLoading] = useState(false);
  const [availableGenres, setAvailableGenres] = useState([]);

  const [activeGenre, setActiveGenre] = useState("all");
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [showAllTrendingSongs, setShowAllTrendingSongs] = useState(false);
  const [viewMode, setViewMode] = useState("list");
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);

  useEffect(() => setIsClient(true), []);

  // Extract unique genres
  useEffect(() => {
    if (songs.length > 0) {
      const genresSet = new Set();
      songs.forEach((song) => {
        song.music_genres?.forEach((genre) => {
          if (genre.slug) {
            genresSet.add(JSON.stringify({ slug: genre.slug, name: genre.name }));
          }
        });
      });
      setAvailableGenres(Array.from(genresSet).map((g) => JSON.parse(g)));
    }
  }, [songs]);

  // Client fallback fetch
  useEffect(() => {
    const fetchData = async () => {
      if (initialSongs.length === 0) setSongsLoading(true);
      if (initialTrending.length === 0) setTrendingSongsLoading(true);
      if (initialArticles.length === 0) setArticlesLoading(true);

      try {
        let allSongs = songs;
        if (initialSongs.length === 0) {
          const response = await songsAPI.getAll({
            category: serverCategory,
            pageSize: 100,
            sort: "createdAt:desc",
          });
          allSongs = response.songs || [];
          setSongs(allSongs);
        }

        if (initialTrending.length === 0) {
          const trending = allSongs.filter((song) => song.trending === true);
          setTrendingSongs(trending);
        }

        if (initialArticles.length === 0) {
          const articlesRes = await articlesAPI.getAll({
            page: articlePage,
            pageSize: 12,
            moderation_status: "published",
            related_to: "music",
            ...(serverCategory && { category: serverCategory }),
          });
          setArticles(articlesRes.articles || []);
          setArticlePagination(articlesRes.pagination || {});
        }
      } catch (error) {
        console.error("Client fetch error:", error);
      } finally {
        setSongsLoading(false);
        setTrendingSongsLoading(false);
        setArticlesLoading(false);
      }
    };
    fetchData();
  }, [serverCategory, articlePage]);

  const handlePageChange = useCallback((newPage) => {
    setArticlePage(newPage);
    const path = serverCategory
      ? `/${serverCategory}/music?page=${newPage}`
      : `/music?page=${newPage}`;
    router.push(path, { scroll: false });
  }, [serverCategory, router]);

  const handleSongClick = useCallback((song) => {
    if (!song?.slug) return;
    const path = serverCategory
      ? `/${serverCategory}/music/${song.slug}`
      : `/music/${song.slug}`;
    router.push(path);
  }, [serverCategory, router]);

  const filteredSongs = songs.filter((song) => {
    const categoryMatch = serverCategory
      ? song.categories?.some((cat) => cat.slug.toLowerCase() === serverCategory.toLowerCase())
      : true;
    const genreMatch = activeGenre === "all"
      ? true
      : song.music_genres?.some((genre) => genre.slug.toLowerCase() === activeGenre.toLowerCase());
    return categoryMatch && genreMatch;
  });

  const getPageTitle = () => {
    if (!serverCategory) return "संगीत";
    const categoryTitles = {
      bollywood: "बॉलीवुड संगीत",
      hollywood: "हॉलीवुड संगीत",
      tollywood: "टॉलीवुड संगीत",
      bhojiwood: "भोजपुरी संगीत",
      korean: "कोरियाई संगीत",
    };
    return categoryTitles[serverCategory.toLowerCase()] || `${serverCategory.charAt(0).toUpperCase() + serverCategory.slice(1)} संगीत`;
  };

  const getPageDescription = () => {
    if (!serverCategory) {
      return "बॉलीवुड और हॉलीवुड संगीत में नए हिट गाने, ट्रेंडिंग ट्रैक और कालजयी क्लासिक्स खोजें";
    }
    const categoryNames = {
      bollywood: "बॉलीवुड",
      hollywood: "हॉलीवुड",
      tollywood: "टॉलीवुड",
      bhojiwood: "भोजपुरी",
      korean: "कोरियाई",
    };
    const categoryName = categoryNames[serverCategory.toLowerCase()] || serverCategory;
    return `${categoryName} संगीत में नए हिट गाने, ट्रेंडिंग ट्रैक और कालजयी क्लासिक्स खोजें`;
  };

  // ✅ No early return – both loading and content are always rendered, visibility toggled after mount
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      {/* Loading placeholder – visible until client mounts */}
      <div className={!isClient ? "block" : "hidden"}>
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
          <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">लोड हो रहा है...</p>
        </div>
      </div>

      {/* Actual content – visible after client mounts */}
      <div className={isClient ? "block" : "hidden"}>
        {/* Header */}
        <div>
          <TopCategoryTabs />
          <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-6 flex flex-row gap-4">
            <Music size={32} className="text-pink-500" />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                {getPageTitle()}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                {getPageDescription()}
              </p>
            </div>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">शैली के अनुसार फ़िल्टर करें</h2>
            <button
              onClick={() => setShowGenreDropdown(!showGenreDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-sm bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-pink-500 transition"
            >
              {showGenreDropdown ? "कम दिखाएं" : "सभी शैलियाँ"}
              {showGenreDropdown ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveGenre("all")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                activeGenre === "all"
                  ? "bg-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-none"
                  : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-500"
              }`}
            >
              सभी गाने
            </button>
            {(showGenreDropdown ? availableGenres : availableGenres.slice(0, 12)).map((genre) => (
              <button
                key={genre.slug}
                onClick={() => setActiveGenre(genre.slug)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  activeGenre === genre.slug
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-200 dark:shadow-none"
                    : "bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-500"
                }`}
              >
                {getGenreInHindi(genre.slug, genre.name)}
              </button>
            ))}
          </div>
          {availableGenres.length > 0 && (
            <p className="text-xs text-gray-500 mt-3">कुल {availableGenres.length} शैलियाँ उपलब्ध</p>
          )}
        </div>

        {/* Songs + Trending grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
          {/* Main songs */}
          <div className="lg:col-span-2">
            {songsLoading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
                <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">गाने लोड हो रहे हैं...</p>
              </div>
            ) : filteredSongs.length > 0 ? (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                    {activeGenre === "all" ? "सभी गाने" : `${getGenreInHindi(activeGenre)} गाने`}
                  </h3>
                  <p className="text-sm text-gray-500">{filteredSongs.length} गाने</p>
                </div>
                <div className="space-y-2">
                  {(showAllSongs ? filteredSongs : filteredSongs.slice(0, 10)).map((song, index) => (
                    <div
                      key={song.id || index}
                      onClick={() => handleSongClick(song)}
                      className="bg-white dark:bg-gray-900 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-pink-500 hover:shadow-md group"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="text-sm font-bold text-pink-600 w-6 text-center">{index + 1}</span>
                          {song.thumbnail?.url ? (
                            <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden shadow-sm group-hover:scale-105 transition-transform">
                              <Image
                                src={song.thumbnail.url}
                                alt={song.title || "गाने का थंबनेल"}
                                fill
                                sizes="(max-width: 768px) 48px, 48px"
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-lg flex-shrink-0">🎵</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate group-hover:text-pink-600 transition">
                              {song.title?.trim() || song.slug?.replace(/-/g, " ") || "बिना शीर्षक वाला गाना"}
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
                              {song.metadescription || "अज्ञात कलाकार"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {song.music_genres?.slice(0, 2).map((g) => (
                            <span
                              key={g.slug}
                              className={`px-2 py-1 rounded-full text-[10px] font-medium border whitespace-nowrap ${
                                activeGenre === g.slug
                                  ? "bg-pink-600 text-white border-pink-600"
                                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700"
                              }`}
                            >
                              {getGenreInHindi(g.slug, g.name)}
                            </span>
                          ))}
                          {song.duration && <span className="text-xs text-gray-500 dark:text-gray-400">{song.duration}</span>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {filteredSongs.length > 10 && (
                  <button
                    onClick={() => setShowAllSongs(!showAllSongs)}
                    className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-semibold transition text-sm"
                  >
                    {showAllSongs ? "▲ कम दिखाएं" : `▼ सभी देखें (${filteredSongs.length})`}
                  </button>
                )}
              </>
            ) : (
              <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
                <p className="text-gray-600 dark:text-gray-400">कोई गाना उपलब्ध नहीं है</p>
              </div>
            )}
          </div>

          {/* Trending sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔥</span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">ट्रेंडिंग गाने</h3>
              </div>
              {trendingSongsLoading ? (
                <div className="text-center py-6">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-pink-600"></div>
                  <p className="mt-2 text-gray-600 dark:text-gray-400 text-xs">लोड हो रहा है...</p>
                </div>
              ) : trendingSongs.length > 0 ? (
                <>
                  <div className="space-y-2">
                    {(showAllTrendingSongs ? trendingSongs : trendingSongs.slice(0, 5)).map((song, index) => (
                      <div
                        key={song.id || index}
                        onClick={() => handleSongClick(song)}
                        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-pink-400 group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-pink-600 w-7 text-center">{index + 1}</span>
                          {song.thumbnail?.url ? (
                            <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden shadow-sm">
                              <Image
                                src={song.thumbnail.url}
                                alt={song.title || "ट्रेंडिंग गाने का थंबनेल"}
                                fill
                                sizes="40px"
                                className="object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-purple-500 rounded-md flex items-center justify-center text-white text-sm flex-shrink-0">🎵</div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-xs truncate group-hover:text-pink-600 transition">
                              {song.title?.trim() || song.slug?.replace(/-/g, " ") || "बिना शीर्षक"}
                            </h4>
                            {song.music_genres?.length > 0 && (
                              <p className="text-gray-500 dark:text-gray-400 text-[9px] truncate mt-0.5">
                                {song.music_genres.slice(0, 2).map((g) => getGenreInHindi(g.slug, g.name)).join(", ")}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {trendingSongs.length > 5 && (
                    <button
                      onClick={() => setShowAllTrendingSongs(!showAllTrendingSongs)}
                      className="w-full mt-3 px-3 py-1.5 bg-pink-50 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400 rounded-lg font-semibold transition text-xs hover:bg-pink-100 dark:hover:bg-pink-900/30"
                    >
                      {showAllTrendingSongs ? "▲ कम दिखाएं" : `▼ सभी देखें (${trendingSongs.length})`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-gray-600 dark:text-gray-400 text-sm">कोई ट्रेंडिंग गाना नहीं</div>
              )}
            </div>
          </div>
        </div>

        {/* Articles section */}
        <div id="articles" className="mt-10 scroll-mt-24">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">संगीत आर्टिकल</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
                {articlesLoading ? "लोड हो रहा है..." : `${articles.length} आर्टिकल`}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg transition border ${
                  viewMode === "grid"
                    ? "bg-pink-600 border-pink-600 text-white"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">▦</span>
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg transition border ${
                  viewMode === "list"
                    ? "bg-pink-600 border-pink-600 text-white"
                    : "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
              >
                <span className="text-lg">☰</span>
              </button>
            </div>
          </div>

          {articlesLoading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-pink-600"></div>
              <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm">आर्टिकल लोड हो रहे हैं...</p>
            </div>
          ) : articles.length > 0 ? (
            <>
              <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "flex flex-col gap-3"}>
                {articles.map((article) => {
                  if (viewMode === "list") {
                    const articlePath = `/${article.mainCategory || article.MainCategory || "article"}/${article.slug}`;
                    return (
                      <Link key={article.id} href={articlePath} className="block">
                        <div className="bg-white dark:bg-gray-900 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer border border-gray-200 dark:border-gray-800 hover:border-pink-400 group flex gap-3">
                          <div className="flex-shrink-0">
                            {(() => {
                              const imageUrl =
                                article.heroImage?.formats?.medium?.url ||
                                article.heroImage?.formats?.small?.url ||
                                article.heroImage?.url;
                              return imageUrl ? (
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden shadow-md group-hover:scale-105 transition-transform">
                                  <Image
                                    src={imageUrl}
                                    alt={article.title || "आर्टिकल थंबनेल"}
                                    fill
                                    sizes="(max-width: 768px) 96px, 96px"
                                    className="object-cover"
                                    loading="lazy"
                                  />
                                </div>
                              ) : (
                                <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl">📰</div>
                              );
                            })()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 group-hover:text-pink-600 transition">
                              {article.title}
                            </h4>
                            <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 line-clamp-2">
                              {typeof article.description === "string"
                                ? article.description
                                : typeof article.content === "string"
                                ? article.content
                                : ""}
                            </p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                              {article.category && (
                                <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded font-medium">
                                  {typeof article.category === "string" ? article.category : article.category?.name}
                                </span>
                              )}
                              {article.publishedAt && (
                                <span>{new Date(article.publishedAt).toLocaleDateString("hi-IN")}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  } else {
                    return <ArticleCard key={article.id} article={article} viewMode={viewMode} />;
                  }
                })}
              </div>
              {articlePagination?.pageCount > 1 && (
                <Pagination
                  currentPage={articlePagination.page || 1}
                  totalPages={articlePagination.pageCount}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          ) : (
            <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
              <p className="text-gray-600 dark:text-gray-400">कोई आर्टिकल उपलब्ध नहीं है</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}