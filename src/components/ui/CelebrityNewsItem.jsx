'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';

import { articlesAPI } from '../../lib/api';
import { getStrapiMedia } from '../../lib/constants';
import { formatDate } from '../../lib/helpers';

export default function CelebrityNewsItem() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCelebrityNews();
  }, []);

  const fetchCelebrityNews = async () => {
    try {
      setLoading(true);

      const res = await articlesAPI.getAll({
        pageSize: 6,
        sort: 'publishedAt:desc',
        filters: {
          typecontent: { $eq: 'CelebrityNews' },
        },
      });

      setArticles(res?.articles || []);
    } catch (err) {
      console.error('Celebrity news fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div 
            key={i} 
            className="h-64 bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" 
          />
        ))}
      </div>
    );
  }

  if (!articles.length) return null;

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              bg-white dark:bg-gray-900 
              rounded-lg overflow-hidden 
              hover:shadow-lg hover:-translate-y-1
              transition-all duration-300 cursor-pointer group
            "
          >
            {/* Image */}
            <div className="relative w-full h-44">
              {imgUrl ? (
                <Image
                  src={imgUrl}
                  alt={article.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                  📰
                </div>
              )}

              {/* Category badge */}
              {article.category?.name && (
                <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded bg-red-600 text-white">
                  {article.category.name}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-2">
              <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white">
                {article.title}
              </h3>

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
