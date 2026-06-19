"use client";

import { useEffect, useState } from "react";
import { moviesAPI, pollAPI } from "../../lib/api";
import apiClient from "../../lib/api";
import { CheckSquare } from "lucide-react";
import { useStore } from "../../store/useStore";

export default function MoviePoll() {
  const [movies, setMovies] = useState([]);
  const [votedId, setVotedId] = useState(null);
  const [results, setResults] = useState({});
  const [loading, setLoading] = useState(true);
  const user = useStore((state) => state.user);
const openLoginModal = useStore((state) => state.openLoginModal);

 async function loadPoll() {
  try {
    setLoading(true);
    const { movies } = await moviesAPI.getAll({ pageSize: 4 });
    setMovies(movies || []);

    const votes = await pollAPI.results();

    const count = {};
    votes.forEach((v) => {
      const item = v.attributes || v;
      const movieId = item.movie?.id || item.movie?.data?.id;
      
      if (movieId) {
        count[movieId] = (count[movieId] || 0) + 1;
      }
    });

    setResults(count);
  } catch (e) {
    console.error("Poll fetch error:", e);
    // अगर 401 आता है तो कम से कम UI न टूटे
    if (e.response?.status === 401) {
      console.warn("Permission Denied: Make sure Poll-votes are public in Strapi.");
    }
  } finally {
    setLoading(false);
  }
}

  useEffect(() => {
    loadPoll();
  }, []);

  const totalVotes = Object.values(results).reduce((a, b) => a + b, 0);

   async function vote(movieId) {
    if (!user) {
    openLoginModal();
    return;
  }

    try {
      await pollAPI.vote(movieId);
      setVotedId(movieId);
      loadPoll();
    } catch (e) {
      alert(e.response?.data?.error?.message || "Already voted");
    }
  }
  function PollSkeleton() {
  return (
    <div className="p-5 sm:p-6 bg-white/95 dark:bg-gray-900/95 border border-gray-200/50 dark:border-gray-700/50 rounded-2xl shadow-lg">
      {/* Header Skeleton */}
      <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/50 mb-3">
        <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>

      {/* Question Skeleton */}
      <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-4 animate-pulse" />

      {/* Options Skeleton */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-10 w-full bg-gray-100 dark:bg-gray-800/60 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}



if (loading) return <PollSkeleton />;

  return (
    <div className="
      p-5 sm:p-6 
      bg-white/95 dark:bg-gray-900/95 
      backdrop-blur-sm 
      border border-gray-200/50 dark:border-gray-700/50 
      rounded-2xl 
      shadow-lg dark:shadow-gray-900/20 
      hover:shadow-xl dark:hover:shadow-gray-800/30 
      transition-all duration-300
    ">
      {/* Header */}
    <div className="flex items-center gap-2 pb-3 border-b border-gray-100 dark:border-gray-700/50 mb-3">
        <CheckSquare className="w-5 h-5 text-red-500 dark:text-red-400 flex-shrink-0" />
        <h3 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white tracking-tight">
          एंटरटेनमेंट पोल
        </h3>
      </div>

      {/* Question */}
      <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 font-medium mb-4 leading-relaxed">
        आपकी पसंदीदा फिल्म कौन सी है?
      </p>
      {/* Options */}
      <div className="space-y-1 max-h-50 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300/50 dark:scrollbar-thumb-gray-600/50 scrollbar-track-transparent">
        {movies.map((movie) => {
          const count = results[movie.id] || 0;
          const percent = totalVotes
            ? Math.round((count / totalVotes) * 100)
            : 0;
          const isVoted = votedId === movie.id;

          return (
            <div
              key={movie.id}
              onClick={() => vote(movie.id)}
              className={`
                px-4 py-2 rounded-xl text-sm cursor-pointer
                transition-all duration-300 group
                border-2
                ${isVoted
                  ? "bg-gradient-to-r from-red-500/10 to-red-600/10 dark:from-red-500/20 dark:to-red-600/20 border-red-200/50 dark:border-red-500/40 shadow-md shadow-red-200/30 dark:shadow-red-500/20 text-gray-900 dark:text-gray-100 font-semibold"
                  : "bg-white/60 dark:bg-gray-800/40 border-gray-200/50 dark:border-gray-600/50 hover:border-red-300/60 dark:hover:border-red-500/50 hover:bg-white/80 dark:hover:bg-gray-700/60 hover:shadow-sm text-gray-800 dark:text-gray-200"
                }
                ${votedId && !isVoted ? "opacity-60 cursor-not-allowed" : ""}
              `}
            >
              <div className="flex items-center justify-between">
                <span className="truncate font-medium group-hover:text-red-600 dark:group-hover:text-red-400">
                  {movie.title}
                </span>
                {isVoted && (
                  <span className="text-xs font-bold bg-red-500/90 dark:bg-red-500/95 text-white px-2 py-0.5 rounded-full shadow-sm">
                    {percent}%
                  </span>
                )}
              </div>

              {/* Progress */}
              {votedId && (
                <div className="mt-2.5 h-1 bg-gray-200/50 dark:bg-gray-600/40 rounded-full overflow-hidden">
                  <div
                    className="h-1 bg-gradient-to-r from-red-500 to-red-600 rounded-full transition-all duration-700 shadow-sm"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

     
    </div>
  );
}
