"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { moviesAPI } from "../lib/api/movies";
import { formatDate } from "../lib/helpers";

import Sidebar from "../components/layout/Sidebar";
import ShareBar from "../components/ui/ShareBar";

import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  ChevronLeft,
  Film,
} from "lucide-react";

export default function SingleMoviePage() {
  const { slug } = useParams();

  const [movie, setMovie] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);

    const fetchMovieData = async () => {
      setLoading(true);
      setError(null);

      try {
        const mainMovie = await moviesAPI.getBySlug(slug);
        setMovie(mainMovie);

        if (mainMovie?.releaseType) {
          const relatedRes = await moviesAPI.getAll({
            pageSize: 4,
            sort: ['releaseDate:desc'],
            filters: {
              releaseType: { $eq: mainMovie.releaseType },
              slug: { $ne: mainMovie.slug },
            }
          });
          setRelated(relatedRes.movies || []);
        }
      } catch (err) {
        if (err.message.includes("Network Error") || err.code === 'ERR_NETWORK') {
          setError("Could not connect to the API server. Please check your network connection or API URL.");
        } else {
          setError("An unknown error occurred while fetching movie data.");
        }
        setMovie(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchMovieData();
  }, [slug]);


  // --- Loading, Error, and Not Found Handling (Omitted for brevity, assumed functional) ---
  if (loading) {
    // ... (Your loading skeleton JSX)
    return (
      <div className="container-custom py-12">
        <div className="animate-pulse space-y-6 max-w-4xl mx-auto">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-[400px] bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-custom py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Data Loading Failed</h1>
        <p className="mb-6 text-red-600 dark:text-red-400 font-medium">
          {error}
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ChevronLeft size={18} /> Back to Home
        </Link>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="container-custom py-20 text-center">
        <AlertCircle size={48} className="mx-auto text-gray-400 mb-4" />
        <h1 className="text-3xl font-bold mb-2">Movie not found</h1>
        <p className="mb-6 text-gray-500">
          It looks like this movie link is broken or the content has been removed.
        </p>
        <Link href="/" className="btn-primary inline-flex items-center gap-2">
          <ChevronLeft size={18} /> Back to Home
        </Link>
      </div>
    );
  }
  // --- End of Error Handling ---


  const currentUrl =
    typeof window !== "undefined" ? window.location.href : "";
  const statusClassName = movie.releaseType === 'released' ? 'text-green-600' : 'text-blue-600';

  return (
    <>
      <title>{movie.title} - EntertainIndia</title>

      <article className="container-custom py-5">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/*  MAIN COLUMN (8/12) */}
          <div className="lg:col-span-8">

            {/*  HEADER (Omitted for brevity) */}
            <header className="mb-8">
              <div className="flex items-center gap-3 mb-2 text-sm font-semibold tracking-wider">
                <Film size={16} className={statusClassName} />
                <span className={statusClassName}>
                  {movie.releaseType.toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4">
                {movie.title}
              </h1>
              <div
                className="flex flex-wrap gap-y-3 gap-x-6 text-sm
                text-gray-500 border-b border-gray-200 dark:border-gray-800 pb-6"
              >
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  Release Date: **{formatDate(movie.releaseDate)}**
                </div>
                {movie.duration && (
                  <div className="flex items-center gap-2">
                    <Clock size={16} /> {movie.duration} min
                  </div>
                )}
              </div>
            </header>

            {/*  MOVIE POSTER (FIXED) */}
            {movie.poster && (
              <figure className="mb-10">
                <div className="overflow-hidden rounded-2xl shadow-lg bg-gray-100 dark:bg-gray-900">
                  <img
                    src={movie.poster.url}
                    className="w-full h-auto max-h-[500px] object-cover"
                    alt={movie.poster.alternativeText}
                  />
                </div>

              </figure>)}
            {/*  CAST LIST (FIXED) */}
            {movie.cast?.length > 0 && (
              <div className="mb-10">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Main Cast</h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-y-3 gap-x-6">
                  {movie.cast.slice(0, 6).map((role) => {
                    const actor = role.actor;
                    const actorSlug = actor?.slug;
                    const actorName = actor?.name;

                    // ⭐ Correct image fallback logic
                    const img =
                      actor?.avatar?.thumbnail ||   // Thumbnail
                      actor?.avatar?.url ||         // Full image
                      "/default-image.png";        // Final fallback

                    return (
                      <div key={role.id} className="flex items-center gap-3">
                        <div>
                          {img ? (
                            <Image
                              src={img}
                              alt={actorName || "Actor"}
                              width={48}
                              height={48}
                              className="rounded-full object-cover w-12 h-12"
                            />
                          ) : (
                            <div className="bg-gray-200 dark:bg-gray-700 rounded-full w-12 h-12 flex items-center justify-center">
                              <Users size={18} className="text-gray-500" />
                            </div>
                          )}
                        </div>

                        <div className="text-sm text-gray-900 dark:text-white">
                          {actorName && actorSlug ? (
                            <Link
                              href={`/celebrities/${actorSlug}`}
                              className="font-medium hover:text-primary-600 hover:underline transition-colors"
                            >
                              {actorName}
                            </Link>
                          ) : (
                            <span className="font-medium">
                              {actorName || role.characterName}
                            </span>
                          )}

                          {role.characterName && (
                            <div className="text-gray-500 text-xs">
                              as {role.characterName}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                </div>
              </div>
            )}
            {/*  DESCRIPTION (Omitted for brevity) */}
            {movie.description && (
              <div className="text-[12px] text-gray-700 dark:text-gray-300 mb-10 pl-6 ">
                <h2 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Synopsis</h2>
                <p className='leading-relaxed !text-[12px]'>{movie.description}</p>
              </div>
            )}



            {/*  SHARE BAR (Omitted for brevity) */}
            <div className="border-t border-gray-200 dark:border-gray-800 pt-8 mt-12">
              <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl">
                <ShareBar url={currentUrl} title={movie.title} />
              </div>
            </div>

            {/*  RELATED MOVIES (Omitted for brevity) */}
            {related.length > 0 && (
              <section className="pt-12 border-t border-gray-200 dark:border-gray-800">
                <h3 className="text-2xl font-bold mb-8">
                  More {movie.releaseType === 'released' ? 'Released' : 'Upcoming'} Movies
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {related.map((rm) => (
                    <Link
                      key={rm.id}
                      href={`/movies/${rm.slug}`}
                      className="group flex flex-col sm:flex-row gap-4 rounded-xl bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-shadow overflow-hidden p-4"
                    >
                      <div className="relative w-full h-40 sm:w-32 sm:h-32 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200">
                        <Image
                          src={rm.poster?.thumbnail || '/default-poster.png'}
                          alt={rm.title}
                          fill
                          sizes="128px"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold line-clamp-2 text-lg text-gray-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {rm.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                          <Calendar size={14} /> {formatDate(rm.releaseDate)}
                        </p>
                        <p className="text-xs text-primary-500 mt-2">
                          {rm.releaseType.toUpperCase()}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/*  SIDEBAR (4/12) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <Sidebar />
            </div>
          </div>

        </div>
      </article>
    </>
  );
}