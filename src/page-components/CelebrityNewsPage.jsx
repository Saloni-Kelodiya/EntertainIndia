"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, TrendingUp } from "lucide-react";

import { articlesAPI } from "../lib/api";
import { getStrapiMedia } from "../lib/constants";
import { formatDate } from "../lib/helpers";

export default function CelebrityNewsPage() {
  const [filter, setFilter] = useState("latest");
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  const filters = [
    { label: "नवीनतम", value: "latest" },
    { label: "ट्रेंडिंग", value: "trending" },
    { label: "बॉलीवुड", value: "bollywood" },
    { label: "हॉलीवुड", value: "hollywood" },
  ];

  useEffect(() => {
    fetchCelebrityNews();
  }, [filter]);

  const fetchCelebrityNews = async () => {
    try {
      setLoading(true);

      let params = {
        pageSize: 12,
        typeContent: "CelebrityNews",
        sort: "publish_datetime:desc",
      };

      if (filter === "bollywood" || filter === "hollywood") {
        params.category = filter;
      }

      if (filter === "trending") {
        params.sort = "trandingRank:desc,views:desc";
      }

      const res = await articlesAPI.getAll(params);
      setArticles(res?.articles || []);
    } catch (err) {
      console.error("Celebrity news fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] p-6 rounded-2xl dark:bg-gray-800">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-5 text-gray-900 dark:text-white">
        सेलिब्रिटी न्यूज
      </h1>

      {/* Filter Navbar */}
      <div className="flex gap-3 mb-6 overflow-x-auto">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`
              px-4 py-1.5 rounded-full text-sm whitespace-nowrap transition
              ${
                filter === f.value
                  ? "bg-red-600 text-white"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200"
              }
            `}
          >
            {f.label}
            {f.value === "trending" && filter === "trending" && (
              <TrendingUp size={14} className="inline ml-1" />
            )}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-64 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {articles.map((article) => {
            const imgUrl = getStrapiMedia(
              article?.heroImage?.formats?.medium?.url ||
                article?.heroImage?.formats?.small?.url ||
                article?.heroImage?.url
            );

            return (
              <Link
                key={article.id}
                href={`/article/${article.slug}`}
                className="
                  bg-white dark:bg-[#141414]
                  rounded-xl overflow-hidden
                  hover:shadow-xl hover:-translate-y-1
                  transition-all duration-300 group
                "
              >
                {/* Image */}
                <div className="relative aspect-video overflow-hidden">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={article.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                      📰
                    </div>
                  )}

                  {/* Category */}
                  {article.category?.name && (
                    <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                      {article.category.name === "Bollywood" ? "बॉलीवुड" : 
                       article.category.name === "Hollywood" ? "हॉलीवुड" : 
                       article.category.name}
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-4 space-y-2">
                  <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white">
                    {article.title}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {formatDate(article.publishDate, "relative")}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}