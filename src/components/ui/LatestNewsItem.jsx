'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';

import { articlesAPI } from '../../lib/api';
import { getStrapiMedia } from '../../lib/constants';
import { formatDate } from '../../lib/helpers';

export default function LatestNewsList() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLatestNews();
  }, []);

  const fetchLatestNews = async () => {
    try {
      setLoading(true);

      const res = await articlesAPI.getAll({
        pageSize: 6,
        sort: 'publishedAt:desc',
        filters: {
          typecontent: { $eq: 'LatestNews' },
        },
      });

      setArticles(res?.articles || []);
    } catch (err) {
      console.error('Latest news fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="
              h-20 rounded-lg 
              bg-gray-200 dark:bg-gray-800
              animate-pulse
            "
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className="
        space-y-4
        bg-gray-100 dark:bg-gray-900
        p-3 rounded-lg
      "
    >
      {articles.map((article) => {
        const imgUrl = getStrapiMedia(
          article?.heroImage?.formats?.thumbnail?.url ||
            article?.heroImage?.formats?.small?.url ||
            article?.heroImage?.url
        );

        return (
          <Link
            key={article.id}
            href={`/article/${article.slug}`}
            className="
              flex gap-4 items-start p-3 rounded-lg
              bg-white hover:bg-gray-100
              dark:bg-[#141414] dark:hover:bg-[#1c1c1c]
              transition group
            "
          >
            {/* Thumbnail */}
            <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0">
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition"
                
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-gray-700">
                  📰
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 space-y-1">
              {/* Category */}
              {article.category?.name && (
                <span className="inline-block text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                  {article.category.name}
                </span>
              )}

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2">
                {article.title}
              </h3>

              {/* Meta */}
              <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} />
                  {formatDate(article.publishedAt, 'relative')}
                </span>

                <span className="flex items-center gap-1">
                  <Eye size={12} />
                  {article.views || 0}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
