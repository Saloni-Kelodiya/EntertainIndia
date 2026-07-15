"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Eye, Newspaper } from "lucide-react"; // TrendingUp hata diya
import { articlesAPI } from "../lib/api/articles";
import { getStrapiMedia } from "../lib/constants";
import { formatDate } from "../lib/helpers";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";

export default function LatestNewsPage({ serverCategory, initialArticles }) {
  const [filter, setFilter] = useState(serverCategory || "latest");
  const [articles, setArticles] = useState(initialArticles || []);
  const [loading, setLoading] = useState(false);
  const isFirstRender = useRef(true); // Double fetch rokne ke liye

  //  Naye Filters: Trending ki jagah TV aur OTT
 const filters = [
  { label: "नवीनतम", value: "latest" },
  { label: "बॉलीवुड", value: "bollywood" },
  { label: "हॉलीवुड", value: "hollywood" },
  { label: "टीवी", value: "tv" },
  { label: "ओटीटी", value: "ott" },
  {label: "टॉलीवुड", value: "tollywood" },
    {label: "भोजीवुड", value: "bhojiwood" },
    {label: "कोरियाई", value: "korean" },
];

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    fetchNews();
  }, [filter]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      let params = {
        pageSize: 12,
        mainCategory: "News", //  Sirf News data mangwane ke liye
      };

      if (filter !== "latest") {
        params.category = filter; //  Specific category filter
      }

      const res = await articlesAPI.getAll(params);
      setArticles(res?.articles || []);
    } catch (err) {
      console.error("Latest News fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div className="">
        <TopCategoryTabs />

       <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <Newspaper size={28} className="text-pink-500 " />
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              ताजा खबरें
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              सेलिब्रिटी की ताजा खबरें, फिल्म अपडेट और एंटरटेनमेंट बज़
            </p>
          </div>
        </div>
      </div>

      <div className="">
        {/* Filter Navbar - UI Bilkul Same */}
        <div className="flex gap-3 mb-6 overflow-x-auto">
          {filters.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition
                ${filter === f.value
                  ? "bg-pink-600 text-white"
                  : "bg-white text-gray-700 dark:bg-neutral-900 dark:text-gray-300"
                }
              `}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Grid - UI Bilkul Same */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-72 rounded-xl bg-gray-200 dark:bg-gray-800 animate-pulse"
              />
            ))}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => {
              const imgUrl = getStrapiMedia(article?.heroImage?.url);

              return (
                <Link
                  key={article.id}
                  href={`/news/${article.slug}`}
                  className="group card-theme overflow-hidden hover:shadow-lg transition"
                >
                  <div className="relative h-48">
                    {imgUrl ? (
                      <Image
                        src={imgUrl}
                        alt={article.title}
                        fill
                        className="object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center">
                        📰
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    {article.category?.name && (
                      <span className="text-xs bg-pink-600 text-white px-2 py-0.5 rounded">
                        {filters.find(f => f.value === article.category.slug)?.label || article.category.name}
                      </span>
                    )}

                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {article.title}
                    </h3>

                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                      {article.summary}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {formatDate(article.publishDate, "relative")}
                      </span>

                      {article.views > 0 && (
                        <span className="flex items-center gap-1">
                          <Eye size={12} />
                          {article.views}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}