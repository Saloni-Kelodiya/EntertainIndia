"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useMemo, useCallback, memo } from "react";
import { usePathname } from "next/navigation";
import { Film, Users, FileText, Eye, Clock, Tv } from "lucide-react";
import { webSeriesAPI } from "../../lib/api/web-series";
import { usersAPI } from "../../lib/api/users";
import { tvShowsAPI } from "../../lib/api/tv-shows";
import { formatDate } from "../../lib/helpers";
import { articlesAPI } from "../../lib/api/articles";
import { moviesAPI } from "../../lib/api/movies";

const REFRESH_INTERVAL = 5 * 60 * 1000;

function timeAgo(dateString) {
  if (!dateString) return "N/A";
  const diffMs = Date.now() - new Date(dateString).getTime();
  const diffDays = Math.floor(diffMs / 86400000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffDays > 0) return `${diffDays} दिन पहले`;
  if (diffHours > 0) return `${diffHours} घंटे पहले`;
  if (diffMinutes > 0) return `${diffMinutes} मिनट पहले`;
  return "अभी";
}

function getAvatarSrc(user) {
  return (
    user.avatar?.formats?.thumbnail?.url ||
    user.avatar?.formats?.small?.url ||
    user.avatar?.url ||
    null
  );
}

const SkeletonItem = memo(() => (
  <div className="space-y-2">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse" />
  </div>
));
SkeletonItem.displayName = "SkeletonItem";

const SectionWrapper = memo(function SectionWrapper({
  children,
  title,
  icon: Icon,
  isLoading,
  isEmpty,
  height = "h-[330px]",
}) {
  return (
    <div
      className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm overflow-hidden flex flex-col ${height}`}
    >
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <Icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
          <h3 className="font-bold text-lg text-gray-900 dark:text-gray-100">
            {title}
          </h3>
        </div>
      </div>

      <div className="p-4 overflow-y-auto flex-1">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonItem key={i} />
            ))}
          </div>
        ) : isEmpty ? (
          <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 text-sm">
            कोई डेटा उपलब्ध नहीं
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
});

//  Memoized list item components — prevent re-render when sibling data unchanged
const ArticleItem = memo(function ArticleItem({ article, idx }) {
  return (
    <div className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
      <Link href={`/${article.mainCategory}/${article.slug}`} className="block group">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 mb-2">
          <span className="inline-block w-6 text-primary-600 dark:text-primary-400 font-bold">
            {idx + 1}.
          </span>{" "}
          {article.title}
        </h4>
      </Link>
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        <div className="flex items-center space-x-3">
          <span className="flex items-center space-x-1">
            <Eye className="w-3 h-3" />
            <span>{article.views?.toLocaleString() || 0}</span>
          </span>
          <span className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{timeAgo(article.publishDate)}</span>
          </span>
        </div>
      </div>
    </div>
  );
});

const TrendingItem = memo(function TrendingItem({ item, idx, getLink, getDate }) {
  return (
    <div className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
      <Link href={getLink(item)} className="block group">
        <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 mb-2">
          <span className="inline-block w-6 text-primary-600 dark:text-primary-400 font-bold">
            {idx + 1}.
          </span>{" "}
          {item.title}
        </h4>
      </Link>
      <p className="text-xs text-gray-500 dark:text-gray-400">{getDate(item)}</p>
    </div>
  );
});

const AuthorItem = memo(function AuthorItem({ user }) {
  const avatarSrc = getAvatarSrc(user);
  const displayName = user.username_hindi || user.name || user.username;
  const views = user.totalViews || 0;
  const viewsLabel =
    views >= 1_000_000
      ? `${(views / 1_000_000).toFixed(1)}M`
      : views >= 1_000
      ? `${(views / 1_000).toFixed(1)}K`
      : views;

  return (
    <div className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
      <Link
        href={`/author/${user.username || user.id}`}
        className="flex items-center space-x-3 group"
      >
        <div className="relative w-10 h-10 overflow-hidden rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-primary-500 transition-all flex-shrink-0">
          {avatarSrc ? (
            <Image
              src={avatarSrc}
              alt={displayName}
              fill
              sizes="40px"
              className="object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-500">
              {(displayName || "A")[0]}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
            {displayName}
          </h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {viewsLabel} व्यूज · {user.articlesCount || 0} लेख
          </p>
        </div>
      </Link>
    </div>
  );
});

export default function CategorySidebar({ category }) {
  const pathname = usePathname();
  const urlCategory = pathname.split("/")[1];
  const finalCategory = category || urlCategory;

  const isOTTCategory = finalCategory === "ott";
  const isTVCategory = finalCategory === "tv";

  const [articles, setArticles] = useState([]);
  const [movies, setMovies] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [shows, setShows] = useState([]);

  const [loading, setLoading] = useState({
    articles: true,
    movies: true,
    webSeries: false,
    authors: true,
    shows: true,
  });

  const setLoadingKey = useCallback((key, value) => {
    setLoading((prev) => ({ ...prev, [key]: value }));
  }, []);

  //  Trending articles — fixed stale-closure bug (finalCategory now in deps)
  useEffect(() => {
    let ignore = false;

    const fetchTrending = async () => {
      setLoadingKey("articles", true);
      try {
        const data = await articlesAPI.getTrending({
          limit: 5,
          categorySlug: finalCategory,
        });
        if (!ignore) setArticles(data || []);
      } catch (error) {
        console.error("Error fetching trending articles:", error);
        if (!ignore) setArticles([]);
      } finally {
        if (!ignore) setLoadingKey("articles", false);
      }
    };

    fetchTrending();
    const interval = setInterval(fetchTrending, REFRESH_INTERVAL);

    return () => {
      ignore = true;
      clearInterval(interval);
    };
  }, [finalCategory, setLoadingKey]);

  //  Movies (non-OTT, non-TV) — race-safe with ignore flag
  useEffect(() => {
    if (isOTTCategory || isTVCategory) return;
    let ignore = false;

    (async () => {
      setLoadingKey("movies", true);
      try {
        const res = await moviesAPI.getTrending({
          category: finalCategory,
          pageSize: 5,
          sort: "releaseDate:desc",
        });
        if (!ignore) setMovies(res.movies || []);
      } catch (err) {
        console.error("फिल्म त्रुटि:", err);
        if (!ignore) setMovies([]);
      } finally {
        if (!ignore) setLoadingKey("movies", false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [finalCategory, isOTTCategory, isTVCategory, setLoadingKey]);

  //  Web series (OTT only) — race-safe
  useEffect(() => {
    if (!isOTTCategory) return;
    let ignore = false;

    (async () => {
      setLoadingKey("webSeries", true);
      try {
        const res = await webSeriesAPI.getAllTrending({
          pageSize: 8,
          sort: "releaseDate:desc",
          trending: true,
        });
        if (!ignore) setWebSeries(res.webSeries || []);
      } catch (err) {
        console.error("वेब सीरीज त्रुटि:", err);
        if (!ignore) setWebSeries([]);
      } finally {
        if (!ignore) setLoadingKey("webSeries", false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isOTTCategory, setLoadingKey]);

  //  TV shows (TV only) — race-safe
  useEffect(() => {
    if (!isTVCategory) return;
    let ignore = false;

    (async () => {
      setLoadingKey("shows", true);
      try {
        const res = await tvShowsAPI.getAllTrending({
          pageSize: 8,
          sort: "realeaseDate:desc",
          trending: true,
        });
        const filtered = (res?.data || []).filter((item) => item.trending === true);
        if (!ignore) setShows(filtered);
      } catch (err) {
        console.error("टीवी शो त्रुटि:", err);
        if (!ignore) setShows([]);
      } finally {
        if (!ignore) setLoadingKey("shows", false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [isTVCategory, setLoadingKey]);

  //  Authors — fetch only once (independent of category)
  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoadingKey("authors", true);
      try {
        // If backend supports pagination, prefer passing pageSize/sort here
        // e.g. usersAPI.getAll({ pageSize: 20, sort: 'totalViews:desc' })
        // to avoid fetching the entire user list just to slice top 5.
        const res = await usersAPI.getAll();
        const list = Array.isArray(res.users) ? res.users : [];

        const top = list
          .filter((user) => user.role !== "Authenticated")
          .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0))
          .slice(0, 5);

        if (!ignore) setAuthors(top);
      } catch (err) {
        console.error("लेखक त्रुटि:", err);
        if (!ignore) setAuthors([]);
      } finally {
        if (!ignore) setLoadingKey("authors", false);
      }
    })();

    return () => {
      ignore = true;
    };
  }, [setLoadingKey]);

  //  Memoized trending content config (no recompute unless deps change)
  const trendingContent = useMemo(() => {
    if (isTVCategory) {
      return {
        title: "ट्रेंडिंग टीवी शो",
        icon: Tv,
        data: shows,
        loading: loading.shows,
        getLink: (item) => `/${finalCategory}/shows/${item.slug}`,
        getDate: (item) => formatDate(item.releaseDate),
      };
    }
    if (isOTTCategory) {
      return {
        title: "ट्रेंडिंग वेब सीरीज",
        icon: Tv,
        data: webSeries,
        loading: loading.webSeries,
        getLink: (item) => `/${finalCategory}/web-series/${item.slug}`,
        getDate: (item) => formatDate(item.releaseDate),
      };
    }
    return {
      title: "ट्रेंडिंग फिल्में",
      icon: Film,
      data: movies,
      loading: loading.movies,
      getLink: (item) => `/${finalCategory}/movies/${item.slug}`,
      getDate: (item) => formatDate(item.releaseDate),
    };
  }, [isTVCategory, isOTTCategory, shows, webSeries, movies, loading.shows, loading.webSeries, loading.movies, finalCategory]);

  return (
    <aside className="space-y-6">
      <SectionWrapper
        title="इस सप्ताह लोकप्रिय"
        icon={FileText}
        isLoading={loading.articles}
        isEmpty={!loading.articles && articles.length === 0}
        height="h-[510px]"
      >
        <div className="space-y-3 card-theme">
          {articles.map((article, idx) => (
            <ArticleItem key={article.id} article={article} idx={idx} />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        title={trendingContent.title}
        icon={trendingContent.icon}
        isLoading={trendingContent.loading}
        isEmpty={!trendingContent.loading && trendingContent.data.length === 0}
        height="h-[450px]"
      >
        <div className="space-y-3 card-theme">
          {trendingContent.data.map((item, idx) => (
            <TrendingItem
              key={item.id}
              item={item}
              idx={idx}
              getLink={trendingContent.getLink}
              getDate={trendingContent.getDate}
            />
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        title="शीर्ष लेखक"
        icon={Users}
        isLoading={loading.authors}
        isEmpty={!loading.authors && authors.length === 0}
        height="h-[430px]"
      >
        <div className="space-y-4 card-theme">
          {authors.map((user) => (
            <AuthorItem key={user.id} user={user} />
          ))}
        </div>
      </SectionWrapper>
    </aside>
  );
}