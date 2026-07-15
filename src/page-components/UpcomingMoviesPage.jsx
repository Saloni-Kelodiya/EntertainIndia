"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { moviesAPI } from "../lib/api/movies";
import { getStrapiMedia } from "../lib/constants";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";

export default function UpcomingMoviesPage() {
  /* ================= STATE ================= */
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);

  const [selectedGenre, setSelectedGenre] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("asc");
  const [page, setPage] = useState(1);

  const pageSize = 10;
  const getPages = (pageCount) => {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  };


  /* ================= CATEGORY FROM URL ================= */
  const pathname = usePathname();

  const category =
    pathname.includes("bollywood")
      ? "bollywood"
      : pathname.includes("hollywood")
        ? "hollywood"
        : "all";

  /* ================= TABS ================= */
  const tabs = [
    { id: "all", label: "All", href: "/upcoming-movies" },
    { id: "bollywood", label: "Bollywood", href: "/bollywood/upcoming-movies" },
    { id: "hollywood", label: "Hollywood", href: "/hollywood/upcoming-movies" },
     { id: "tollywood", label: "Tollywood", href: "/tollywood/upcoming-movies" },  
    { id: "bhojiwood", label: "Bhojiwood", href: "/bhojiwood/upcoming-movies" },
    { id: "korean", label: "Korean", href: "/korean/upcoming-movies" },
  ];

  /* ================= FETCH UPCOMING MOVIES ================= */
  useEffect(() => {
    const fetchUpcomingMovies = async () => {
      setLoading(true);
      try {
        const { movies, pagination } = await moviesAPI.getAll({
          releaseType: "upcoming",
          page,
          pageSize,
          sort: "releaseDate:asc",
          category: category !== "all" ? category : undefined,
        });

        setMovies(movies || []);
        setFilteredMovies(movies || []);
        setPagination(pagination);
      } catch (err) {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingMovies();
  }, [category, page]);

  /* ================= GENRES (AUTO) ================= */
  const genres = useMemo(() => {
    const set = new Set(["all"]);
    movies.forEach((movie) => {
      movie.genres?.forEach((g) => {
        if (g?.slug) set.add(g.slug);
      });
    });
    return Array.from(set);
  }, [movies]);

  /* ================= FRONTEND FILTER ================= */
  useEffect(() => {
    let data = [...movies];

    if (selectedGenre !== "all") {
      data = data.filter((movie) =>
        movie.genres?.some((g) => g.slug === selectedGenre)
      );
    }

    if (search.trim()) {
      data = data.filter((movie) =>
        movie.title?.toLowerCase().includes(search.toLowerCase())
      );
    }

    data.sort((a, b) =>
      sort === "asc"
        ? new Date(a.releaseDate) - new Date(b.releaseDate)
        : new Date(b.releaseDate) - new Date(a.releaseDate)
    );

    setFilteredMovies(data);
  }, [movies, selectedGenre, search, sort]);

  /* ================= UI ================= */
  return (
    <div className="container-custom py-8  bg-[#f6f6f6] p-6 rounded-2xl  dark:bg-gray-800">
      <TopCategoryTabs />
      {/* HEADER */}
      <div className="px-4">
        <h1 className="text-2xl font-bold mb-2">
          Upcoming{" "}
          {category === "bollywood"
            ? "Bollywood"
            : category === "hollywood"
              ? "Hollywood"
              : ""}{" "}
          Movies
        </h1>
      </div>

      {/* TABS */}
      <div className="flex gap-4 border-b mb-6">
        {tabs.map((t) => (
          <Link
            key={t.id}
            href={t.href}
            className={`pb-2 text-sm font-semibold ${category === t.id
              ? "border-b-2 border-blue-600 text-blue-600"
              : "text-gray-500 hover:text-gray-800"
              }`}
          >
            {t.label}
          </Link>
        ))}
      </div>


      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] bg-gray-300 animate-pulse rounded-lg"
            />
          ))}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {filteredMovies.map((movie) => {
            const poster = movie?.poster?.url;
            const daysLeft = movie.releaseDate
              ? Math.ceil(
                (new Date(movie.releaseDate) - new Date()) / 86400000
              )
              : null;

            return (
              <Link
                key={movie.id}
                href={`/${category}/movie/${movie.slug}`}
                className="group"
              >
                <div className="relative aspect-[2/3] rounded-lg overflow-hidden shadow">
                  {poster ? (
                    <Image
                      src={getStrapiMedia(poster)}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-gray-300 h-full flex items-center justify-center">
                      🎬
                    </div>
                  )}

                  <span className="absolute top-2 left-2 bg-yellow-400 text-black text-xs px-2 py-1 rounded">
                    Upcoming
                  </span>

                  {daysLeft > 0 && (
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {daysLeft} days left
                    </span>
                  )}
                </div>

                <h3 className="mt-2 text-sm font-semibold line-clamp-2">
                  {movie.title}
                </h3>

                <p className="text-xs text-gray-500">
                  {movie.genres?.map((g) => g.name).join(", ")}
                </p>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No upcoming movies found 🎬
        </p>
      )}

      {/* PAGINATION */}
      {pagination && pagination.pageCount > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">

          {/* PREVIOUS */}
          <button
            disabled={pagination.page === 1}
            onClick={() => setPage((p) => p - 1)}
            className={`px-4 py-2 rounded border text-sm font-medium
        ${pagination.page === 1
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"}
      `}
          >
            ← Previous
          </button>

          {/* PAGE NUMBERS */}
          {getPages(pagination.pageCount).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-10 h-10 rounded font-semibold text-sm border
          ${pagination.page === p
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
                }
        `}
            >
              {p}
            </button>
          ))}

          {/* NEXT */}
          <button
            disabled={pagination.page === pagination.pageCount}
            onClick={() => setPage((p) => p + 1)}
            className={`px-4 py-2 rounded border text-sm font-medium
        ${pagination.page === pagination.pageCount
                ? "text-gray-400 border-gray-200 cursor-not-allowed"
                : "text-gray-700 border-gray-300 hover:bg-gray-100"}
      `}
          >
            Next →
          </button>

        </div>
      )}

    </div>
  );
}
