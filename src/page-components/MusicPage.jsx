"use client";
import { useState, useCallback, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Music, ChevronDown, ChevronUp, Play, Clock } from "lucide-react";
import ArticleCard from "../components/ui/ArticleCard";
import Pagination from "../components/ui/Pagination";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import { articlesAPI } from "../lib/api/articles";

// ─── Genre Mapping ──────────────────────────────────────────
const GENRE_HINDI_MAP = {
  "latest-release": "नवीनतम रिलीज़",
  trending: "ट्रेंडिंग",
  romantic: "रोमांटिक",
  "party-hits": "पार्टी हिट्स",
  pop: "पॉप",
  rock: "रॉक",
  "hip-hop": "हिप हॉप",
  classical: "शास्त्रीय",
  bhajan: "भजन",
  gazal: "ग़ज़ल",
  remix: "रीमिक्स",
  instrumental: "वाद्य",
  folk: "लोक",
  patriotic: "देशभक्ति",
  sad: "उदास",
  happy: "खुशनुमा",
  workout: "वर्कआउट",
  devotional: "भक्ति",
  "action-soundtrack": "एक्शन साउंडट्रैक",
  "arabic-music": "अरबी संगीत",
  bhangra: "भांगड़ा",
  "bhojpuri-song": "भोजपुरी गाना",
  bollywood: "बॉलीवुड",
  dance: "डांस",
  filmi: "फिल्मी",
  "item-number": "आइटम नंबर",
  "item-song": "आइटम गाना",
  edm: "ईडीएम",
  electronic: "इलेक्ट्रॉनिक",
  jazz: "जैज़",
  lofi: "लोफाई",
  melody: "मेलोडी",
  qawwali: "क़व्वाली",
  sufi: "सूफ़ी",
  wedding: "वेडिंग",
  "year-end": "साल के अंत में",
  retro: "रेट्रो",
  birthday: "जन्मदिन",
};

const getGenreInHindi = (slug, name) => {
  if (!slug && !name) return "अन्य";
  const key = slug?.toLowerCase();
  if (key && GENRE_HINDI_MAP[key]) return GENRE_HINDI_MAP[key];
  const nameKey = name?.toLowerCase().replace(/\s+/g, "-");
  if (nameKey && GENRE_HINDI_MAP[nameKey]) return GENRE_HINDI_MAP[nameKey];
  return name || slug || "अन्य";
};

// ─── Small Song Card (memoized) ──────────────────────────
const SongCard = memo(function SongCard({ song, index, onClick, isActive }) {
  const thumbUrl =
    song.thumbnail?.url ||
    song.thumbnail?.formats?.thumbnail?.url ||
    null;

  return (
    <div
      onClick={() => onClick(song)}
      className={`group relative cursor-pointer rounded-xl overflow-hidden border transition-all duration-200 hover:-translate-y-1 hover:shadow-lg
        ${isActive
          ? "border-pink-500 shadow-md shadow-pink-100 dark:shadow-pink-900/20"
          : "border-gray-200 dark:border-gray-800 hover:border-pink-400"
        }
        bg-white dark:bg-gray-900`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gradient-to-br from-pink-500 to-purple-600">
        {thumbUrl ? (
          <Image
            src={thumbUrl}
            alt={song.title || "गाना"}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 200px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            priority={index < 4}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white text-3xl">🎵</div>
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="w-10 h-10 rounded-full bg-pink-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 scale-75 group-hover:scale-100 shadow-lg">
            <Play className="w-4 h-4 ml-0.5" fill="white" />
          </div>
        </div>
        <div className="absolute top-2 left-2 w-6 h-6 rounded-full bg-black/50 text-white text-[10px] font-bold flex items-center justify-center">
          {index + 1}
        </div>
        {song.duration && (
          <div className="absolute bottom-2 right-2 flex items-center gap-0.5 bg-black/60 text-white text-[10px] rounded px-1.5 py-0.5">
            <Clock className="w-2.5 h-2.5" />
            {song.duration}
          </div>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-pink-600 transition leading-snug">
          {song.title?.trim() || song.slug?.replace(/-/g, " ") || "बिना शीर्षक"}
        </h3>
        {song.music_genres?.length > 0 && (
          <p className="text-[10px] text-gray-400 dark:text-gray-500 truncate mt-0.5">
            {song.music_genres.slice(0, 2).map((g) => getGenreInHindi(g.slug, g.name)).join(" · ")}
          </p>
        )}
      </div>
    </div>
  );
});

// ─── Trending Song Row (memoized) ────────────────────────
const TrendingSongRow = memo(function TrendingSongRow({ song, index, onClick }) {
  const thumbUrl = song.thumbnail?.url || song.thumbnail?.formats?.thumbnail?.url || null;
  return (
    <div
      onClick={() => onClick(song)}
      className="group flex items-center gap-2.5 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition cursor-pointer border border-transparent hover:border-pink-300"
    >
      <span className="text-xs font-bold text-pink-600 w-5 text-center shrink-0">{index + 1}</span>
      <div className="relative w-9 h-9 rounded-md overflow-hidden shrink-0 bg-gradient-to-br from-pink-400 to-purple-500">
        {thumbUrl ? (
          <Image src={thumbUrl} alt={song.title || "ट्रेंडिंग"} fill sizes="36px" className="object-cover" loading="lazy" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-white text-sm">🎵</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-gray-900 dark:text-white truncate group-hover:text-pink-600 transition">
          {song.title?.trim() || "बिना शीर्षक"}
        </p>
        {song.music_genres?.length > 0 && (
          <p className="text-[10px] text-gray-400 truncate">
            {getGenreInHindi(song.music_genres[0].slug, song.music_genres[0].name)}
          </p>
        )}
      </div>
      {song.duration && <span className="text-[10px] text-gray-400 shrink-0">{song.duration}</span>}
    </div>
  );
});

// ─── Main Page ──────────────────────────────────────────────
export default function MusicPage({
  serverCategory,
  initialSongs = [],
  initialTrending = [],
  initialArticles = [],
  initialPagination = {},
  initialPage = 1,
}) {
  const router = useRouter();

  const [songs] = useState(initialSongs);
  const [trendingSongs] = useState(initialTrending);
  const [articles, setArticles] = useState(initialArticles);
  const [articlePagination, setArticlePagination] = useState(initialPagination);
  const [articlePage, setArticlePage] = useState(initialPage);

  const [activeGenre, setActiveGenre] = useState("all");
  const [showAllSongs, setShowAllSongs] = useState(false);
  const [showAllTrending, setShowAllTrending] = useState(false);
  const [showGenreDropdown, setShowGenreDropdown] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [articlesLoading, setArticlesLoading] = useState(false);

  // ─── Memoized derived data ────────────────────────────
  const availableGenres = useMemo(() => {
    const seen = new Set();
    const genres = [];
    songs.forEach((song) => {
      song.music_genres?.forEach((g) => {
        if (g.slug && !seen.has(g.slug)) {
          seen.add(g.slug);
          genres.push({ slug: g.slug, name: g.name });
        }
      });
    });
    return genres;
  }, [songs]);

  const filteredSongs = useMemo(() => {
    return songs.filter((song) => {
      const catOk = serverCategory
        ? song.categories?.some((c) => c.slug?.toLowerCase() === serverCategory.toLowerCase())
        : true;
      const genreOk =
        activeGenre === "all" ||
        song.music_genres?.some((g) => g.slug?.toLowerCase() === activeGenre.toLowerCase());
      return catOk && genreOk;
    });
  }, [songs, serverCategory, activeGenre]);

  const visibleSongs = useMemo(() => showAllSongs ? filteredSongs : filteredSongs.slice(0, 18), [filteredSongs, showAllSongs]);
  const visibleTrending = useMemo(() => showAllTrending ? trendingSongs : trendingSongs.slice(0, 6), [trendingSongs, showAllTrending]);

  const pageTitle = useMemo(() => {
    if (!serverCategory) return "संगीत";
    const map = { bollywood: "बॉलीवुड संगीत", hollywood: "हॉलीवुड संगीत", tollywood: "टॉलीवुड संगीत", bhojiwood: "भोजपुरी संगीत", korean: "कोरियाई संगीत" };
    return map[serverCategory.toLowerCase()] || `${serverCategory} संगीत`;
  }, [serverCategory]);

  // ─── Callbacks ──────────────────────────────────────────
  const handleSongClick = useCallback((song) => {
    if (!song?.slug) return;
    router.push(serverCategory ? `/${serverCategory}/music/${song.slug}` : `/music/${song.slug}`);
  }, [serverCategory, router]);

  const handlePageChange = useCallback(async (newPage) => {
    setArticlePage(newPage);
    setArticlesLoading(true);
    try {
      const res = await articlesAPI.getAll({
        page: newPage,
        pageSize: 12,
        moderation_status: "published",
        related_to: "music",
        ...(serverCategory && { category: serverCategory }),
      });
      setArticles(res.articles || []);
      setArticlePagination(res.pagination || {});
    } catch (err) {
      console.error("Page change error:", err);
    } finally {
      setArticlesLoading(false);
    }
    router.push(
      serverCategory ? `/${serverCategory}/music?page=${newPage}` : `/music?page=${newPage}`,
      { scroll: false }
    );
  }, [serverCategory, router]);

  // ─── Render ──────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <TopCategoryTabs />

      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
        <Music size={28} className="text-pink-500 shrink-0" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">{pageTitle}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">नए हिट गाने, ट्रेंडिंग ट्रैक और कालजयी क्लासिक्स</p>
        </div>
      </div>

      {/* Genre Filter */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">शैली</h2>
          {availableGenres.length > 10 && (
            <button
              onClick={() => setShowGenreDropdown(!showGenreDropdown)}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-pink-600 transition"
            >
              {showGenreDropdown ? "कम दिखाएं" : "सभी"}
              {showGenreDropdown ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveGenre("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
              activeGenre === "all"
                ? "bg-pink-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-pink-400"
            }`}
          >
            सभी
          </button>
          {(showGenreDropdown ? availableGenres : availableGenres.slice(0, 10)).map((g) => (
            <button
              key={g.slug}
              onClick={() => setActiveGenre(g.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition ${
                activeGenre === g.slug
                  ? "bg-pink-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-pink-400"
              }`}
            >
              {getGenreInHindi(g.slug, g.name)}
            </button>
          ))}
        </div>
      </div>

      {/* Songs + Trending */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-gray-900 dark:text-white">
              {activeGenre === "all" ? "सभी गाने" : `${getGenreInHindi(activeGenre)} गाने`}
              <span className="ml-2 text-xs font-normal text-gray-400">({filteredSongs.length})</span>
            </h2>
          </div>
          {filteredSongs.length > 0 ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {visibleSongs.map((song, i) => (
                  <SongCard key={song.id || i} song={song} index={i} onClick={handleSongClick} isActive={false} />
                ))}
              </div>
              {filteredSongs.length > 18 && (
                <button
                  onClick={() => setShowAllSongs(!showAllSongs)}
                  className="w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-sm font-semibold transition"
                >
                  {showAllSongs ? "▲ कम दिखाएं" : `▼ सभी ${filteredSongs.length} गाने देखें`}
                </button>
              )}
            </>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
              <Music className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">कोई गाना उपलब्ध नहीं है</p>
            </div>
          )}
        </div>

        {/* Trending Sidebar */}
        <div className="lg:col-span-1">
          <div className="sticky top-24 bg-white dark:bg-gray-900 rounded-xl p-4 border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">🔥</span>
              <h3 className="text-sm font-bold text-gray-900 dark:text-white">ट्रेंडिंग</h3>
            </div>
            {trendingSongs.length > 0 ? (
              <>
                <div className="space-y-1">
                  {visibleTrending.map((song, i) => (
                    <TrendingSongRow key={song.id || i} song={song} index={i} onClick={handleSongClick} />
                  ))}
                </div>
                {trendingSongs.length > 6 && (
                  <button
                    onClick={() => setShowAllTrending(!showAllTrending)}
                    className="w-full mt-3 py-1.5 text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-50 dark:bg-pink-900/20 rounded-lg hover:bg-pink-100 transition"
                  >
                    {showAllTrending ? "▲ कम दिखाएं" : `▼ सभी देखें (${trendingSongs.length})`}
                  </button>
                )}
              </>
            ) : (
              <p className="text-center text-sm text-gray-400 py-6">कोई ट्रेंडिंग गाना नहीं</p>
            )}
          </div>
        </div>
      </div>

      {/* ─── Articles Section (direct render) ────────────── */}
      <div id="articles" className="scroll-mt-24">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">संगीत आर्टिकल</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {articlesLoading ? "लोड हो रहा है..." : `${articles.length} आर्टिकल`}
            </p>
          </div>
          <div className="flex gap-1.5">
            {["grid", "list"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`p-2 rounded-lg border text-sm transition ${
                  viewMode === mode
                    ? "bg-pink-600 border-pink-600 text-white"
                    : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 hover:bg-gray-50"
                }`}
              >
                {mode === "grid" ? "▦" : "☰"}
              </button>
            ))}
          </div>
        </div>

        {articlesLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : articles.length > 0 ? (
          <>
            <div className={
              viewMode === "grid"
                ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
                : "flex flex-col gap-3"
            }>
              {articles.map((article) => {
                if (viewMode === "list") {
                  const imgUrl =
                    article.heroImage?.formats?.medium?.url ||
                    article.heroImage?.formats?.small?.url ||
                    article.heroImage?.url ||
                    null;
                  const path = `/${article.mainCategory || "article"}/${article.slug}`;
                  return (
                    <Link key={article.id} href={path} className="block group">
                      <div className="flex gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-pink-400 hover:shadow-sm transition">
                        <div className="shrink-0 relative w-24 h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                          {imgUrl ? (
                            <Image
                              src={imgUrl}
                              alt={article.title || ""}
                              fill
                              sizes="96px"
                              className="object-cover group-hover:scale-105 transition-transform"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">📰</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-600 transition">
                            {article.title}
                          </h4>
                          {article.publishedAt && (
                            <p className="text-[11px] text-gray-400 mt-1.5">
                              {new Date(article.publishedAt).toLocaleDateString("hi-IN")}
                            </p>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                }
                // Grid mode – use existing ArticleCard component
                return <ArticleCard key={article.id} article={article} viewMode={viewMode} />;
              })}
            </div>

            {articlePagination?.pageCount > 1 && (
              <div className="mt-6">
                <Pagination
                  currentPage={articlePagination.page || 1}
                  totalPages={articlePagination.pageCount}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
            <p className="text-gray-500 text-sm">कोई आर्टिकल उपलब्ध नहीं</p>
          </div>
        )}
      </div>
    </div>
  );
}