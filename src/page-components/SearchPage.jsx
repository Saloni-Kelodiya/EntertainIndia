"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Search, X, Clock, Music, Tv, Monitor, Video, Film, Image, Newspaper, User, Radio, Youtube } from "lucide-react";
import { formatDate } from "../lib/helpers";

import {
  articlesAPI,
  moviesAPI,
  galleriesAPI,
  celebritiesAPI,
  songsAPI,
  tvShowsAPI,
  webSeriesAPI,
  videosAPI,
} from "../lib/api";

export default function SearchPageContent() {
  const searchParams = useSearchParams();
  const rawQuery = searchParams.get("q");
  const query = rawQuery?.trim();

  const [activeTab, setActiveTab] = useState("all");
  const LIMIT = 4;

  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [movies, setMovies] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [celebrities, setCelebrities] = useState([]);
  const [songs, setSongs] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const limitResults = (arr) => arr.slice(0, LIMIT);

  useEffect(() => {
    if (!query || query.length < 2) {
      setArticles([]);
      setNews([]);
      setMovies([]);
      setGalleries([]);
      setCelebrities([]);
      setSongs([]);
      setTvShows([]);
      setWebSeries([]);
      setVideos([]);
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          articlesAPI.getAll({ search: query, pageSize: 8, mainCategory: "article" }),
          articlesAPI.getAll({ search: query, pageSize: 8, mainCategory: "news" }),
          moviesAPI.simpleSearch(query, { pageSize: 8 }),
          galleriesAPI.getAll({ search: query, pageSize: 8 }),
          celebritiesAPI.getAll({ search: query, pageSize: 6 }),
          songsAPI.getAll({ search: query, pageSize: 8 }),
          tvShowsAPI.getAll({ search: query, pageSize: 8 }),
          webSeriesAPI.getAll({ search: query, pageSize: 8 }),
          videosAPI.getAll({ search: query, pageSize: 8 }),
        ]);

        if (results[0].status === "fulfilled")
          setArticles(results[0].value?.articles || []);

        if (results[1].status === "fulfilled")
          setNews(results[1].value?.articles || []);

        if (results[2].status === "fulfilled")
          setMovies(results[2].value?.movies || []);

        if (results[3].status === "fulfilled")
          setGalleries(results[3].value?.galleries || []);

        if (results[4].status === "fulfilled")
          setCelebrities(results[4].value?.celebrities || []);

        if (results[5].status === "fulfilled")
          setSongs(results[5].value?.songs || []);

        if (results[6].status === "fulfilled")
          setTvShows(results[6].value?.data || []);

        if (results[7].status === "fulfilled")
          setWebSeries(results[7].value?.data || []);

        if (results[8].status === "fulfilled")
          setVideos(results[8].value?.videos || []);
      } catch (e) {
        console.error("सर्च त्रुटि:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [query]);

  if (loading) return <ArticleListSkeleton count={12} />;

  const hasResults =
    celebrities.length ||
    movies.length ||
    articles.length ||
    news.length ||
    galleries.length ||
    songs.length ||
    tvShows.length ||
    webSeries.length ||
    videos.length;

  return (
    <div className="container-custom py-10">

      {/* 🔍 सर्च बार */}
      <div className="mb-6">
        <SearchInputBar value={query} />
      </div>

      {!hasResults && (
        <p className="text-gray-500 text-center py-10">"{query}" के लिए कोई परिणाम नहीं मिला</p>
      )}

      <div className="flex flex-wrap gap-3 mb-10">
        {["all", "celebrities", "songs", "news", "movies", "tvshows", "webseries", "videos", "articles", "photos"].map((tab) => {
          const tabLabels = {
            all: "सभी",
            celebrities: "सेलिब्रिटी",
            songs: "गाने",
            news: "समाचार",
            movies: "फिल्में",
            tvshows: " टीवी शो",
            webseries: " वेब सीरीज",
            videos: " वीडियो",
            articles: "लेख",
            photos: "फोटो"
          };
          return (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`
                px-5 py-2 rounded-full text-sm font-medium capitalize
                ${activeTab === tab
                  ? "bg-pink-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                }
              `}
            >
              {tabLabels[tab] || tab}
            </button>
          );
        })}
      </div>

      {/* ⭐ सेलिब्रिटी */}
      {celebrities.length > 0 &&
        (activeTab === "all" || activeTab === "celebrities") && (
          <section className="mb-16">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-pink-600" />
              सेलिब्रिटी
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {(activeTab === "all" ? limitResults(celebrities) : celebrities).map((c) => (
                <CelebrityCard key={c.id} celebrity={c} />
              ))}
            </div>
            {activeTab === "all" && celebrities.length > LIMIT && (
              <button onClick={() => setActiveTab("celebrities")} className="mt-6 text-pink-600 font-semibold hover:underline">
                और सेलिब्रिटी देखें →
              </button>
            )}
          </section>
        )}

      {/* 🎵 गाने */}
      {songs.length > 0 && (activeTab === "all" || activeTab === "songs") && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Music className="w-5 h-5 text-pink-600" />
            गाने
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(activeTab === "all" ? limitResults(songs) : songs).map((song) => (
              <SongCard key={song.id} song={song} />
            ))}
          </div>
          {activeTab === "all" && songs.length > LIMIT && (
            <button onClick={() => setActiveTab("songs")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और गाने देखें →
            </button>
          )}
        </section>
      )}

      {/* 📺 टीवी शो */}
      {tvShows.length > 0 && (activeTab === "all" || activeTab === "tvshows") && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Tv className="w-5 h-5 text-teal-600" />
            टीवी शो
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(activeTab === "all" ? limitResults(tvShows) : tvShows).map((show) => (
              <TvShowCard key={show.id} tvShow={show} />
            ))}
          </div>
          {activeTab === "all" && tvShows.length > LIMIT && (
            <button onClick={() => setActiveTab("tvshows")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और टीवी शो देखें →
            </button>
          )}
        </section>
      )}

      {/* 🌐 वेब सीरीज */}
      {webSeries.length > 0 && (activeTab === "all" || activeTab === "webseries") && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Monitor className="w-5 h-5 text-rose-600" />
            वेब सीरीज
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(activeTab === "all" ? limitResults(webSeries) : webSeries).map((series) => (
              <WebSeriesCard key={series.id} webSeries={series} />
            ))}
          </div>
          {activeTab === "all" && webSeries.length > LIMIT && (
            <button onClick={() => setActiveTab("webseries")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और वेब सीरीज देखें →
            </button>
          )}
        </section>
      )}

      {/* 🎬 वीडियो */}
      {videos.length > 0 && (activeTab === "all" || activeTab === "videos") && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Video className="w-5 h-5 text-orange-600" />
            वीडियो
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {(activeTab === "all" ? limitResults(videos) : videos).map((video) => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
          {activeTab === "all" && videos.length > LIMIT && (
            <button onClick={() => setActiveTab("videos")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और वीडियो देखें →
            </button>
          )}
        </section>
      )}

      {/* 📰 समाचार */}
      {news.length > 0 && (activeTab === "all" || activeTab === "news") && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-pink-600" />
            समाचार
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "all" ? limitResults(news) : news).map((n) => (
              <ContentBoxCard key={n.id} article={n} basePath="/news" />
            ))}
          </div>
          {activeTab === "all" && news.length > LIMIT && (
            <button onClick={() => setActiveTab("news")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और समाचार देखें →
            </button>
          )}
        </section>
      )}

      {/* 🎬 फिल्में */}
      {movies.length > 0 && (activeTab === "all" || activeTab === "movies") && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Film className="w-5 h-5 text-purple-600" />
            फिल्में
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {(activeTab === "all" ? limitResults(movies) : movies).map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
          {activeTab === "all" && movies.length > LIMIT && (
            <button onClick={() => setActiveTab("movies")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और फिल्में देखें →
            </button>
          )}
        </section>
      )}

      {/* 📝 लेख */}
      {articles.length > 0 && (activeTab === "all" || activeTab === "articles") && (
        <section className="mb-16">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-blue-600" />
            लेख
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === "all" ? limitResults(articles) : articles).map((a) => (
              <ContentBoxCard key={a.id} article={a} basePath="/article" />
            ))}
          </div>
          {activeTab === "all" && articles.length > LIMIT && (
            <button onClick={() => setActiveTab("articles")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और लेख देखें →
            </button>
          )}
        </section>
      )}

      {/* 🖼️ फोटो */}
      {galleries.length > 0 && (activeTab === "all" || activeTab === "photos") && (
        <section>
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Image className="w-5 h-5 text-green-600" />
            फोटो
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {(activeTab === "all" ? limitResults(galleries) : galleries).map((g) => (
              <GalleryCard key={g.id} gallery={g} />
            ))}
          </div>
          {activeTab === "all" && galleries.length > LIMIT && (
            <button onClick={() => setActiveTab("photos")} className="mt-6 text-pink-600 font-semibold hover:underline">
              और फोटो देखें →
            </button>
          )}
        </section>
      )}
    </div>
  );
}

// ✅ टीवी शो कार्ड
function TvShowCard({ tvShow }) {
  const router = useRouter();
  const posterUrl = tvShow?.poster?.url || tvShow?.backdrop_poster?.url;

  return (
    <div
      onClick={() => router.push(`/${tvShow.category||'tv'}/shows/${tvShow.slug}`)}
      className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white dark:bg-[#141414]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={tvShow.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Tv className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-1 text-gray-900 dark:text-white">{tvShow.title}</h3>
        {tvShow.releaseDate && (
          <p className="text-xs text-gray-500 mt-1">{new Date(tvShow.releaseDate).getFullYear()}</p>
        )}
      </div>
    </div>
  );
}

// ✅ वेब सीरीज कार्ड
function WebSeriesCard({ webSeries }) {
  const router = useRouter();
  const posterUrl = webSeries?.poster?.url;

  return (
    <div
      onClick={() => router.push(`/${webSeries.category||'ott'}/web-series/${webSeries.slug}`)}
      className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white dark:bg-[#141414]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={webSeries.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Monitor className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-1 text-gray-900 dark:text-white">{webSeries.title}</h3>
        {webSeries.releaseDate && (
          <p className="text-xs text-gray-500 mt-1">{new Date(webSeries.releaseDate).getFullYear()}</p>
        )}
      </div>
    </div>
  );
}

// ✅ मूवी कार्ड
// ✅ मूवी कार्ड - FIXED
function MovieCard({ movie }) {
  const router = useRouter();
  const posterUrl = movie?.poster?.url;
  
  // ✅ Sahi order: pehle slug, phir string, phir fallback
  const categorySlug = movie?.category?.slug ||  // Object se slug
                       (typeof movie?.category === 'string' ? movie.category : null) || // String category
                       movie?.categories?.[0]?.slug || // Categories array se
                       "bollywood"; // Default fallback

  return (
    <div
      onClick={() => router.push(`/${categorySlug}/movies/${movie.slug}`)}
      className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white dark:bg-[#141414]"
    >
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {posterUrl ? (
          <img 
            src={posterUrl} 
            alt={movie.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Film className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-1 text-gray-900 dark:text-white">{movie.title}</h3>
        {movie.releaseDate && (
          <p className="text-xs text-gray-500 mt-1">{new Date(movie.releaseDate).getFullYear()}</p>
        )}
      </div>
    </div>
  );
}

// ✅ वीडियो कार्ड
function VideoCard({ video }) {
  const router = useRouter();
  const thumbnailUrl = video?.thumbnail || video?.poster?.url;

  return (
    <div
      onClick={() => router.push(`/videos/${video.slug}`)}
      className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white dark:bg-[#141414]"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Video className="w-10 h-10 text-gray-400" />
          </div>
        )}
        {video.duration && (
          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{video.duration}</div>
        )}
      </div>
      <div className="p-2 sm:p-3">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-2 text-gray-900 dark:text-white">{video.title}</h3>
        {video.videotype && <p className="text-xs text-gray-500 mt-1 capitalize">{video.videotype}</p>}
      </div>
    </div>
  );
}

// ✅ गाना कार्ड
function SongCard({ song }) {
  const router = useRouter();
  const getCategorySlug = () => {
    if (song.categories && song.categories.length > 0) return song.categories[0].slug;
    if (song.music_genres && song.music_genres.length > 0) return song.music_genres[0].slug;
    return "bollywood";
  };

  return (
    <div onClick={() => router.push(`/${getCategorySlug()}/music/${song.slug}`)} className="group rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer bg-white dark:bg-[#141414]">
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
        {song.thumbnail?.url ? (
          <img src={song.thumbnail.url} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Music className="w-10 h-10 text-gray-400" /></div>
        )}
        {song.duration && <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded-md">{song.duration}</div>}
      </div>
      <div className="p-2 sm:p-3 space-y-1">
        <h3 className="font-medium text-xs sm:text-sm line-clamp-1 text-gray-900 dark:text-white">{song.title}</h3>
        {song.artistNames && <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">{song.artistNames}</p>}
      </div>
    </div>
  );
}

// ✅ सेलिब्रिटी कार्ड
function CelebrityCard({ celebrity }) {
  const router = useRouter();
  return (
    <div onClick={() => router.push(`/celebrities/${celebrity.slug}`)} className="cursor-pointer flex items-center gap-3 p-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
      <img src={celebrity.avatar?.url || "/placeholder.png"} alt={celebrity.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
      <div className="flex flex-col min-w-0">
        <h3 className="text-gray-900 dark:text-white font-semibold text-sm leading-tight line-clamp-1">{celebrity.name}</h3>
        <p className="text-gray-500 dark:text-gray-400 text-xs">{celebrity.profession?.[0] || "सेलिब्रिटी"}</p>
      </div>
    </div>
  );
}

// ✅ कंटेंट कार्ड
function ContentBoxCard({ article, basePath = "/article" }) {
  const router = useRouter();
  const imgUrl = article?.heroImage?.formats?.medium?.url || article?.heroImage?.formats?.small?.url || article?.heroImage?.url;
  return (
    <div onClick={() => router.push(`${basePath}/${article.slug}`)} className="bg-white dark:bg-[#141414] rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer">
      <div className="relative aspect-video overflow-hidden">
        {imgUrl ? <img src={imgUrl} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800"><Newspaper className="w-8 h-8 text-gray-400" /></div>}
      </div>
      <div className="p-3 space-y-2">
        <h3 className="text-sm font-bold line-clamp-2 text-gray-900 dark:text-white leading-snug">{article.title}</h3>
        <div className="flex items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1 font-medium"><Clock size={12} />{formatDate(article.publishDate, "relative")}</span>
        </div>
      </div>
    </div>
  );
}

// ✅ गैलरी कार्ड
function GalleryCard({ gallery }) {
  const router = useRouter();
  return (
    <div onClick={() => router.push(`/gallery/${gallery.slug}`)} className="relative rounded-xl overflow-hidden cursor-pointer hover:scale-105 transition-transform aspect-square">
      <img src={gallery.image?.url || "/placeholder.png"} alt={gallery.title} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-2">
        <p className="text-white text-xs font-medium line-clamp-2">{gallery.title}</p>
      </div>
    </div>
  );
}

// ✅ सर्च इनपुट बार
function SearchInputBar({ value }) {
  const router = useRouter();
  const [inputValue, setInputValue] = useState(value || "");

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = inputValue.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-gray-100 dark:bg-gray-800 rounded-full flex items-center gap-3 px-4 py-3">
      <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <input name="search" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="फिल्में, गाने, सेलिब्रिटी, टीवी शो, वेब सीरीज, वीडियो खोजें..." className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none" />
      <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-5 py-2 rounded-full font-medium">खोजें</button>
    </form>
  );
}

// ✅ स्केलेटन कम्पोनेंट
function ArticleListSkeleton({ count = 12 }) {
  return (
    <div className="container-custom py-10">
      <div className="mb-6"><div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full flex items-center gap-3 px-4 py-3 animate-pulse"><div className="w-5 h-5 bg-gray-300 dark:bg-gray-700 rounded"></div><div className="flex-1 h-6 bg-gray-300 dark:bg-gray-700 rounded"></div><div className="w-16 h-8 bg-gray-300 dark:bg-gray-700 rounded-full"></div></div></div>
      <div className="flex flex-wrap gap-3 mb-10">{Array(10).fill(0).map((_, i) => (<div key={i} className="w-20 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse"></div>))}</div>
      <div className="space-y-16">{Array(6).fill(0).map((_, i) => (<div key={i}><div className="w-32 h-7 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse"></div><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">{Array(count).fill(0).map((_, j) => (<div key={j} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414]"><div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 animate-pulse"></div><div className="p-3"><div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 mb-2"></div><div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2"></div></div></div>))}</div></div>))}</div>
    </div>
  );
}