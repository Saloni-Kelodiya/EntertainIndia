'use client';

import { Suspense, useEffect, useState } from 'react';
// Add this import at the top with the other Next.js imports
import { useRouter } from 'next/navigation';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search, Music, Tv, Monitor, Video, Film, Image,
  Newspaper, User
} from 'lucide-react';

import { formatDate } from '../lib/helpers';
import {
  searchCelebrities,
  searchMovies,
  searchGalleries,
  searchArticles,
  searchNews,
  searchTvShows,
  searchWebSeries,
  searchVideos,
  searchSongs,
} from '../lib/api/search';

// ─── मुख्य कंपोनेंट ──────────────────────────────────────
export default function SearchPage() {
  return (
    <Suspense fallback={<SearchPageSkeleton />}>
      <SearchPageContent />
    </Suspense>
  );
}

// ─── अंदर का कंटेंट (useSearchParams के लिए Suspense ज़रूरी) ──
function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q')?.trim() || '';

  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // सभी कैटेगरी के स्टेट
  const [celebrities, setCelebrities] = useState([]);
  const [movies, setMovies] = useState([]);
  const [galleries, setGalleries] = useState([]);
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [videos, setVideos] = useState([]);
  const [songs, setSongs] = useState([]);

  const LIMIT = 4; // "सभी" टैब में दिखने वाली अधिकतम संख्या

  useEffect(() => {
    if (!query || query.length < 2) {
      setLoading(false);
      return;
    }

    const fetchAll = async () => {
      setLoading(true);
      try {
        const results = await Promise.allSettled([
          searchArticles(query, { limit: 8 }),
          searchNews(query, { limit: 8 }),
          searchMovies(query, { limit: 8 }),
          searchGalleries(query, { limit: 8 }),
          searchCelebrities(query, { limit: 6 }),
          searchSongs(query, { limit: 8 }),
          searchTvShows(query, { limit: 8 }),
          searchWebSeries(query, { limit: 8 }),
          searchVideos(query, { limit: 8 }),
        ]);

        if (results[0].status === 'fulfilled') setArticles(results[0].value);
        if (results[1].status === 'fulfilled') setNews(results[1].value);
        if (results[2].status === 'fulfilled') setMovies(results[2].value);
        if (results[3].status === 'fulfilled') setGalleries(results[3].value);
        if (results[4].status === 'fulfilled') setCelebrities(results[4].value);
        if (results[5].status === 'fulfilled') setSongs(results[5].value);
        if (results[6].status === 'fulfilled') setTvShows(results[6].value);
        if (results[7].status === 'fulfilled') setWebSeries(results[7].value);
        if (results[8].status === 'fulfilled') setVideos(results[8].value);
      } catch (err) {
        console.error('सर्च त्रुटि:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [query]);

  // ─── हेल्पर – कैटेगरी के अनुसार आइटम दिखाएँ ────────────
  const getItemsForTab = () => {
    const all = [
      ...celebrities.map(c => ({ ...c, type: 'celebrity', category: 'celebrities' })),
      ...movies.map(m => ({ ...m, type: 'movie' })),
      ...galleries.map(g => ({ ...g, type: 'gallery' })),
      ...articles.map(a => ({ ...a, type: 'article', category: 'article' })),
      ...news.map(n => ({ ...n, type: 'news', category: 'news' })),
      ...tvShows.map(t => ({ ...t, type: 'tvshow' })),
      ...webSeries.map(w => ({ ...w, type: 'webseries' })),
      ...videos.map(v => ({ ...v, type: 'video' })),
      ...songs.map(s => ({ ...s, type: 'song' })),
    ];
    return all;
  };

  const hasResults =
    celebrities.length || movies.length || galleries.length ||
    articles.length || news.length || tvShows.length ||
    webSeries.length || videos.length || songs.length;

  if (loading) return <SearchPageSkeleton />;

  if (!query || query.length < 2) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          कृपया कम से कम 2 अक्षर टाइप करें
        </h2>
      </div>
    );
  }

  if (!hasResults) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-700 dark:text-gray-300">
          “{query}” के लिए कोई परिणाम नहीं मिला
        </h2>
        <p className="text-gray-500 mt-2">अपनी खोज दोबारा करें या किसी और शब्द का प्रयोग करें।</p>
      </div>
    );
  }

  // ─── टैब्स ──────────────────────────────────────────────
  const tabs = [
    { key: 'all', label: 'सभी', icon: Search },
    { key: 'celebrities', label: 'सेलिब्रिटी', icon: User, count: celebrities.length },
    { key: 'movies', label: 'फिल्में', icon: Film, count: movies.length },
    { key: 'tvshows', label: 'टीवी शो', icon: Tv, count: tvShows.length },
    { key: 'webseries', label: 'वेब सीरीज', icon: Monitor, count: webSeries.length },
    { key: 'songs', label: 'गाने', icon: Music, count: songs.length },
    { key: 'videos', label: 'वीडियो', icon: Video, count: videos.length },
    { key: 'news', label: 'समाचार', icon: Newspaper, count: news.length },
    { key: 'articles', label: 'लेख', icon: Newspaper, count: articles.length },
    { key: 'photos', label: 'फोटो', icon: Image, count: galleries.length },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* सर्च बार (वैकल्पिक) */}
      <div className="mb-6">
        <SearchInputBar initialQuery={query} />
      </div>

      {/* टैब्स */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition
              ${activeTab === tab.key
                ? 'bg-pink-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }
            `}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            {tab.count > 0 && (
              <span className={`
                text-xs px-2 py-0.5 rounded-full
                ${activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}
              `}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* रिज़ल्ट्स */}
      <div className="space-y-12">
        {/* सेलिब्रिटी */}
        {(activeTab === 'all' || activeTab === 'celebrities') && celebrities.length > 0 && (
          <Section
            title="सेलिब्रिटी"
            icon={<User className="w-5 h-5 text-amber-500" />}
            items={activeTab === 'all' ? celebrities.slice(0, LIMIT) : celebrities}
            renderItem={(c) => <CelebrityCard key={c.id} celebrity={c} />}
            showMore={activeTab === 'all' && celebrities.length > LIMIT}
            onShowMore={() => setActiveTab('celebrities')}
          />
        )}

        {/* मूवीज़ */}
        {(activeTab === 'all' || activeTab === 'movies') && movies.length > 0 && (
          <Section
            title="फिल्में"
            icon={<Film className="w-5 h-5 text-purple-500" />}
            items={activeTab === 'all' ? movies.slice(0, LIMIT) : movies}
            renderItem={(m) => <MovieCard key={m.id} movie={m} />}
            showMore={activeTab === 'all' && movies.length > LIMIT}
            onShowMore={() => setActiveTab('movies')}
          />
        )}

        {/* टीवी शो */}
        {(activeTab === 'all' || activeTab === 'tvshows') && tvShows.length > 0 && (
          <Section
            title="टीवी शो"
            icon={<Tv className="w-5 h-5 text-teal-500" />}
            items={activeTab === 'all' ? tvShows.slice(0, LIMIT) : tvShows}
            renderItem={(t) => <TvShowCard key={t.id} tvShow={t} />}
            showMore={activeTab === 'all' && tvShows.length > LIMIT}
            onShowMore={() => setActiveTab('tvshows')}
          />
        )}

        {/* वेब सीरीज */}
        {(activeTab === 'all' || activeTab === 'webseries') && webSeries.length > 0 && (
          <Section
            title="वेब सीरीज"
            icon={<Monitor className="w-5 h-5 text-rose-500" />}
            items={activeTab === 'all' ? webSeries.slice(0, LIMIT) : webSeries}
            renderItem={(w) => <WebSeriesCard key={w.id} webSeries={w} />}
            showMore={activeTab === 'all' && webSeries.length > LIMIT}
            onShowMore={() => setActiveTab('webseries')}
          />
        )}

        {/* गाने */}
        {(activeTab === 'all' || activeTab === 'songs') && songs.length > 0 && (
          <Section
            title="गाने"
            icon={<Music className="w-5 h-5 text-green-500" />}
            items={activeTab === 'all' ? songs.slice(0, LIMIT) : songs}
            renderItem={(s) => <SongCard key={s.id} song={s} />}
            showMore={activeTab === 'all' && songs.length > LIMIT}
            onShowMore={() => setActiveTab('songs')}
          />
        )}

        {/* वीडियो */}
        {(activeTab === 'all' || activeTab === 'videos') && videos.length > 0 && (
          <Section
            title="वीडियो"
            icon={<Video className="w-5 h-5 text-orange-500" />}
            items={activeTab === 'all' ? videos.slice(0, LIMIT) : videos}
            renderItem={(v) => <VideoCard key={v.id} video={v} />}
            showMore={activeTab === 'all' && videos.length > LIMIT}
            onShowMore={() => setActiveTab('videos')}
          />
        )}

        {/* समाचार */}
        {(activeTab === 'all' || activeTab === 'news') && news.length > 0 && (
          <Section
            title="समाचार"
            icon={<Newspaper className="w-5 h-5 text-red-500" />}
            items={activeTab === 'all' ? news.slice(0, LIMIT) : news}
            renderItem={(n) => <ArticleCard key={n.id} article={n} basePath="/news" />}
            showMore={activeTab === 'all' && news.length > LIMIT}
            onShowMore={() => setActiveTab('news')}
          />
        )}

        {/* लेख */}
        {(activeTab === 'all' || activeTab === 'articles') && articles.length > 0 && (
          <Section
            title="लेख"
            icon={<Newspaper className="w-5 h-5 text-blue-500" />}
            items={activeTab === 'all' ? articles.slice(0, LIMIT) : articles}
            renderItem={(a) => <ArticleCard key={a.id} article={a} basePath="/article" />}
            showMore={activeTab === 'all' && articles.length > LIMIT}
            onShowMore={() => setActiveTab('articles')}
          />
        )}

        {/* फोटो */}
        {(activeTab === 'all' || activeTab === 'photos') && galleries.length > 0 && (
          <Section
            title="फोटो"
            icon={<Image className="w-5 h-5 text-green-500" />}
            items={activeTab === 'all' ? galleries.slice(0, LIMIT) : galleries}
            renderItem={(g) => <GalleryCard key={g.id} gallery={g} />}
            showMore={activeTab === 'all' && galleries.length > LIMIT}
            onShowMore={() => setActiveTab('photos')}
          />
        )}
      </div>
    </div>
  );
}

// ─── हेल्पर: सेक्शन ──────────────────────────────────────
function Section({ title, icon, items, renderItem, showMore, onShowMore }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        {icon}
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h2>
        <span className="text-sm text-gray-500 ml-2">({items.length})</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {items.map(renderItem)}
      </div>
      {showMore && (
        <button
          onClick={onShowMore}
          className="mt-4 text-pink-600 font-semibold hover:underline text-sm"
        >
          और {title} देखें →
        </button>
      )}
    </section>
  );
}

// ─── कार्ड कंपोनेंट्स ────────────────────────────────────

function CelebrityCard({ celebrity }) {
  return (
    <Link href={`/celebrities/${celebrity.slug}`} className="group">
      <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition">
        <img
          src={celebrity.avatar || '/placeholder-avatar.png'}
          alt={celebrity.name}
          className="w-12 h-12 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {celebrity.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {celebrity.profession || 'सेलिब्रिटी'}
          </p>
        </div>
      </div>
    </Link>
  );
}

function MovieCard({ movie }) {
  const categorySlug = movie.categorySlug || 'movies';
  return (
    <Link href={`/${categorySlug}/movies/${movie.slug}`} className="group">
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:shadow-xl transition hover:-translate-y-1">
        <div className="aspect-[2/3] relative bg-gray-200 dark:bg-gray-700">
          {movie.poster ? (
            <img src={movie.poster} alt={movie.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Film className="w-10 h-10 text-gray-400" />
            </div>
          )}
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {movie.title}
          </h3>
          {movie.releaseDate && (
            <p className="text-xs text-gray-500">{new Date(movie.releaseDate).getFullYear()}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function TvShowCard({ tvShow }) {
  const categorySlug = tvShow.categorySlug || 'tv';
  return (
    <Link href={`/${categorySlug}/shows/${tvShow.slug}`} className="group">
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:shadow-xl transition hover:-translate-y-1">
        <div className="aspect-[2/3] relative bg-gray-200 dark:bg-gray-700">
          {tvShow.poster ? (
            <img src={tvShow.poster} alt={tvShow.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <Tv className="w-10 h-10 text-gray-400 absolute inset-0 m-auto" />
          )}
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {tvShow.title}
          </h3>
          {tvShow.releaseDate && (
            <p className="text-xs text-gray-500">{new Date(tvShow.releaseDate).getFullYear()}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function WebSeriesCard({ webSeries }) {
  const categorySlug = webSeries.categorySlug || 'ott';
  return (
    <Link href={`/${categorySlug}/web-series/${webSeries.slug}`} className="group">
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:shadow-xl transition hover:-translate-y-1">
        <div className="aspect-[2/3] relative bg-gray-200 dark:bg-gray-700">
          {webSeries.poster ? (
            <img src={webSeries.poster} alt={webSeries.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <Monitor className="w-10 h-10 text-gray-400 absolute inset-0 m-auto" />
          )}
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {webSeries.title}
          </h3>
          {webSeries.releaseDate && (
            <p className="text-xs text-gray-500">{new Date(webSeries.releaseDate).getFullYear()}</p>
          )}
        </div>
      </div>
    </Link>
  );
}

function SongCard({ song }) {
  return (
    <Link href={`${song.categorySlug?.[0]?.slug}/music/${song.slug}`} className="group">
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:shadow-xl transition hover:-translate-y-1">
        <div className="aspect-square relative bg-gray-200 dark:bg-gray-700">
          {song.thumbnail ? (
            <img src={song.thumbnail} alt={song.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <Music className="w-10 h-10 text-gray-400 absolute inset-0 m-auto" />
          )}
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {song.title}
          </h3>
          {/* artistNames hata diya */}
        </div>
      </div>
    </Link>
  );
}

function VideoCard({ video }) {
  return (
    <Link href={`/videos/${video.slug}`} className="group">
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:shadow-xl transition hover:-translate-y-1">
        <div className="aspect-video relative bg-gray-200 dark:bg-gray-700">
          {video.thumbnail ? (
            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
          ) : (
            <Video className="w-10 h-10 text-gray-400 absolute inset-0 m-auto" />
          )}
          {video.duration && (
            <span className="absolute bottom-1 right-1 bg-black/70 text-white text-xs px-2 py-0.5 rounded">
              {video.duration}
            </span>
          )}
        </div>
        <div className="p-2">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {video.title}
          </h3>
          {video.videotype && (
            <p className="text-xs text-gray-500 capitalize">{video.videotype}</p>
          )}
        </div>
      </div>
    </Link>
  );
}


function ArticleCard({ article, basePath }) {
  // Format date from actual publishedAt field
  const dateLabel = article.publishedAt
    ? new Date(article.publishedAt).toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : '';

  return (
    <Link href={`${basePath}/${article.slug}`} className="group">
      <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414] hover:shadow-xl transition hover:-translate-y-1">
        <div className="aspect-video relative bg-gray-200 dark:bg-gray-700">
          {article.heroImage ? (
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <Newspaper className="w-10 h-10 text-gray-400 absolute inset-0 m-auto" />
          )}
        </div>
        <div className="p-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-2">
            {article.title}
          </h3>
          {/* ← actual publish date instead of new Date() */}
          {dateLabel && (
            <p className="text-xs text-gray-500 mt-1">{dateLabel}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
function GalleryCard({ gallery }) {
  const imageUrl = gallery.image?.url || gallery.image||gallery.image.url;
  return (
    <Link href={`/photos/${gallery.slug}`} className="group relative rounded-xl overflow-hidden aspect-square">
      {imageUrl ? (
        <img src={imageUrl} alt={gallery.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
      ) : (
        <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
          <Image className="w-10 h-10 text-gray-400" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-2">
        <p className="text-white text-sm font-medium line-clamp-2">{gallery.title}</p>
      </div>
    </Link>
  );
}

// ─── सर्च इनपुट बार (सर्च पेज के अंदर) ──────────────────
function SearchInputBar({ initialQuery }) {
  const [query, setQuery] = useState(initialQuery || '');
  const router = useRouter();

  const handleSubmit = (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  return (
    <form onSubmit={handleSubmit} className="w-full bg-gray-100 dark:bg-gray-800 rounded-full flex items-center gap-3 px-4 py-3">
      <Search className="w-5 h-5 text-gray-500 dark:text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="फिल्में, गाने, सेलिब्रिटी, टीवी शो, वेब सीरीज, वीडियो खोजें..."
        className="flex-1 bg-transparent text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none"
      />
      <button type="submit" className="bg-pink-600 hover:bg-pink-700 text-white text-sm px-5 py-2 rounded-full font-medium">
        खोजें
      </button>
    </form>
  );
}

// ─── स्केलेटन ─────────────────────────────────────────────
function SearchPageSkeleton() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-14 animate-pulse" />
      <div className="flex flex-wrap gap-2 my-8">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-24 h-10 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="space-y-12">
        {Array.from({ length: 4 }).map((_, sec) => (
          <div key={sec}>
            <div className="w-40 h-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#141414]">
                  <div className="aspect-[2/3] bg-gray-200 dark:bg-gray-800 animate-pulse" />
                  <div className="p-2 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-3/4 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-1/2 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}