'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye, Flame } from 'lucide-react';

import { articlesAPI } from '../../lib/api';
import { getStrapiMedia } from '../../lib/constants';
import { formatDate } from '../../lib/helpers';

export default function ViralNewsPage() {
  const [featured, setFeatured] = useState(null);
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchViralNews();
  }, []);

  const fetchViralNews = async () => {
    try {
      setLoading(true);

      const res = await articlesAPI.getAll({
        pageSize: 6,
        mainCategory:"news",
        sort: 'publishedAt:desc',
        filters: {
          typecontent: { $eq: 'ViralNews' },
        },
      });

      const articles = res?.articles || [];
      setFeatured(articles[0] || null);
      setList(articles.slice(1));
    } catch (err) {
      console.error('Viral news fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[300px] bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
    );
  }

  if (!featured) return null;

  const featuredImg = getStrapiMedia(
    featured?.heroImage?.formats?.thumbnail?.url ||
    featured?.heroImage?.formats?.small?.url ||
    featured?.heroImage?.url
  );

  return (
    <div>
      {/* Layout */}
      <div className="grid lg:grid-cols-3 gap-4">
        {/* LEFT – Featured */}
        <Link
          href={`/article/${featured.slug}`}
          className="
            relative lg:col-span-2 rounded-xl overflow-hidden
            group bg-gray-100 dark:bg-gray-900
          "
        >
          {featuredImg && (
            <Image
              src={featuredImg}
              alt={featured.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              unoptimized
            />
          )}

          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* Badge */}
          <span className="absolute top-4 left-4 text-xs px-2 py-1 rounded bg-red-600 text-white flex items-center gap-1">
            🔥 HOT
          </span>

          {/* Content */}
          <div className="absolute bottom-4 left-4 right-4 space-y-4">
            <h3 className="text-xl font-bold text-white line-clamp-2">
              {featured.title}
            </h3>

            <div className="flex items-center gap-4 text-sm text-gray-200">
              <span className="flex items-center gap-1">
                <Eye size={14} />
                {featured.views || '2.5M'}
              </span>

              <span className="flex items-center gap-1">
                <Clock size={14} />
                {formatDate(featured.publishedAt, 'relative')}
              </span>
            </div>
          </div>
        </Link>

        {/* RIGHT – List */}
        <div className="space-y-4">
          {list.map((article) => {
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
                  flex gap-3 items-start p-3 rounded-lg
                  bg-white hover:bg-gray-50
                  dark:bg-gray-800 dark:hover:bg-gray-700
                  transition-all duration-200 border border-gray-200 dark:border-gray-700
                "
              >
                {/* Thumb */}
                <div className="relative w-16 h-14 rounded overflow-hidden flex-shrink-0">
                  {imgUrl ? (
                    <Image
                      src={imgUrl}
                      alt={article.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                      📰
                    </div>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1">
                  {article.category?.name && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-orange-600 text-white">
                      {article.category.name}
                    </span>
                  )}

                  <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mt-1">
                    {article.title}
                  </h4>

                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                    <Clock size={12} />
                    {formatDate(article.publishedAt, 'relative')}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
