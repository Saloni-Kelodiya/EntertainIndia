"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Film, Users, FileText, Eye, Clock, TrendingUp, Tv } from "lucide-react";
import WhatToWatch from "./WhatToWatch";
import {webSeriesAPIServer} from "../../lib/api-server";
import { articlesAPI, moviesAPI, usersAPI ,tvShowsAPI} from "../../lib/api";
import { formatDate } from "../../lib/helpers";

function timeAgo(dateString) {
  if (!dateString) return "N/A";
  const now = new Date();
  const publish = new Date(dateString);
  const diffMs = now - publish;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMinutes = Math.floor(diffMs / (1000 * 60));

  if (diffDays > 0) return `${diffDays} दिन पहले`;
  else if (diffHours > 0) return `${diffHours} घंटे पहले`;
  else if (diffMinutes > 0) return `${diffMinutes} मिनट पहले`;
  else return "अभी";
}

const SkeletonItem = () => (
  <div className="space-y-2">
    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4 animate-pulse"></div>
  </div>
);

const SectionWrapper = ({
  children,
  title,
  icon: Icon,
  isLoading,
  isEmpty,
  height = "h-[330px]", 
}) => (
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

export default function CategorySidebar({ category }) {
  const pathname = usePathname();

  const urlCategory = pathname.split("/")[1];
  const finalCategory = category || urlCategory;

  const [articles, setArticles] = useState([]);
  const [movies, setMovies] = useState([]);
  const [webSeries, setWebSeries] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [trendingArticles, setTrendingArticles] = useState([]);
  const [shows, setShows] = useState([]);
  const [loadingArticles, setLoadingArticles] = useState(true);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [loadingWebSeries, setLoadingWebSeries] = useState(false);
  const [loadingAuthors, setLoadingAuthors] = useState(true);
  const [loadingTrending, setLoadingTrending] = useState(true);
  const [loadingShows, setLoadingShows] = useState(true);


  // Determine if current category is OTT
  const isOTTCategory = finalCategory === "ott";
   const isTVCategory = finalCategory === "tv";

   useEffect(() => {
       const fetchTrending = async () => {
         try {
           setLoadingArticles(true);
           // API already returns trending=true articles first
           const data = await articlesAPI.getTrending({
              limit:5,
              categorySlug: finalCategory , // Map "movies" to "movie" for API
           });
           setArticles(data);
         } catch (error) {
           console.error('Error fetching trending articles:', error);
           setArticles([]);
         } finally {
           setLoadingArticles(false);
         }
       };
   
       fetchTrending();
       
       // Auto refresh every 5 minutes
       const interval = setInterval(fetchTrending, 5 * 60 * 1000);
       return () => clearInterval(interval);
     }, []);
   
     

  // Fetch movies for non-OTT categories
  useEffect(() => {
    if (isOTTCategory) return; // Skip movies fetch for OTT category
    
    async function fetchMovies() {
      setLoadingMovies(true);
      try {
        const res = await moviesAPI.getAll({
          category: finalCategory,
          pageSize: 5,
          sort: "releaseDate:desc",
        });
        setMovies(res.movies || []);
      } catch (err) {
        console.error("फिल्म त्रुटि:", err);
      } finally {
        setLoadingMovies(false);
      }
    }

    fetchMovies();
  }, [finalCategory, isOTTCategory]);

  // Fetch trending web series for OTT category
  useEffect(() => {
    if (!isOTTCategory) return; // Only fetch web series for OTT category
    
    async function fetchTrendingWebSeries() {
      setLoadingWebSeries(true);
      try {
        const res = await webSeriesAPIServer.getAll({
          pageSize: 8,
          sort: "releaseDate:desc",
          trending: true
        });
        setWebSeries(res.webSeries || []);
       
      } catch (err) {
        console.error("वेब सीरीज त्रुटि:", err);
      } finally {
        setLoadingWebSeries(false);
      }
    }

    fetchTrendingWebSeries();
  }, [finalCategory, isOTTCategory]);

  useEffect(() => {
  if (!isTVCategory) return;

  async function fetchTrendingTvShows() {
    setLoadingShows(true);
    try {
      const res = await tvShowsAPI.getAll({
        pageSize: 8,
       sort: "realeaseDate:desc",
        trending: true // 🔥 MUST
      });

      // ✅ SAFE FILTER (force only true)
      const filtered = (res?.data || []).filter(
        (item) => item.trending === true
      );

      setShows(filtered);

    } catch (err) {
      console.error("टीवी शो त्रुटि:", err);
    } finally {
      setLoadingShows(false);
    }
  }

  fetchTrendingTvShows();
}, [finalCategory, isTVCategory]);
  

  useEffect(() => {
    async function fetchAuthors() {
      setLoadingAuthors(true);
      try {
        const res = await usersAPI.getAll();
        const list = Array.isArray(res.users) ? res.users : [];
        
        // Filter out basic users and sort by totalViews (Top Authors)
        const top = list
          .filter(user => user.role !== "Authenticated")
          .sort((a, b) => (b.totalViews || 0) - (a.totalViews || 0))
          .slice(0, 5);

        setAuthors(top);
      } catch (err) {
        console.error("लेखक त्रुटि:", err);
      } finally {
        setLoadingAuthors(false);
      }
    }

    fetchAuthors();
  }, []);

  // Get the appropriate content for the trending section
  const getTrendingContent = () => {
    if (isTVCategory) {
      return {
        title: "ट्रेंडिंग टीवी शो",
        icon: Tv,
        data: shows,
        loading: loadingShows,
        getLink: (item) => `/${finalCategory}/shows/${item.slug}`,
        getDate: (item) => formatDate(item.releaseDate)
      };
    }
  
    if (isOTTCategory) {
      return {
        title: "ट्रेंडिंग वेब सीरीज",
        icon: Tv,
        data: webSeries,
        loading: loadingWebSeries,
        getLink: (item) => `/${finalCategory}/web-series/${item.slug}`,
        getDate: (item) => formatDate(item.releaseDate)
      };
    } else {
      return {
        title: "ट्रेंडिंग फिल्में",
        icon: Film,
        data: movies,
        loading: loadingMovies,
        getLink: (item) => `/${finalCategory}/movies/${item.slug}`,
        getDate: (item) => formatDate(item.releaseDate)
      };
    }
  };

  const trendingContent = getTrendingContent();

  return (
    <aside className="space-y-6 ">
      
      <SectionWrapper
        title="इस सप्ताह लोकप्रिय"
        icon={FileText}
        isLoading={loadingArticles}
        isEmpty={!loadingArticles && articles.length === 0}
        height="h-[510px]"
      >
        <div className="space-y-3 card-theme">
          {articles.map((article, idx) => (
            <div
              key={article.id}
              className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
            >
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
            <div
              key={item.id}
              className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
            >
              <Link href={trendingContent.getLink(item)} className="block group">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 mb-2">
                  <span className="inline-block w-6 text-primary-600 dark:text-primary-400 font-bold">
                    {idx + 1}.
                  </span>{" "}
                  {item.title}
                </h4>
              </Link>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {trendingContent.getDate(item)}
              </p>
            </div>
          ))}
        </div>
      </SectionWrapper>

      <SectionWrapper
        title="शीर्ष लेखक"
        icon={Users}
        isLoading={loadingAuthors}
        isEmpty={!loadingAuthors && authors.length === 0}
        height="h-[430px]"
      >
        <div className="space-y-4 card-theme">
          {authors.map((user) => (
            <div
              key={user.id}
              className="pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0"
            >
              <Link
                href={`/author/${user.username || user.id}`}
                className="flex items-center space-x-3 group"
              >
                <div className="relative w-10 h-10 overflow-hidden rounded-full ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-primary-500 transition-all">
                  {user.avatar?.url ? (
                    <Image
                      src={user.avatar.url}
                      alt={user.name || user.username}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                      नहीं
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary-600 dark:group-hover:text-primary-400 truncate">
                    {user.name || user.username}
                  </h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {
                      user.totalViews >= 1000 
                      ? `${(user.totalViews / 1000).toFixed(1)}K` 
                      : (user.totalViews || 0)
                    } व्यूज
                  </p>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </SectionWrapper>
      
    </aside>
  );
}