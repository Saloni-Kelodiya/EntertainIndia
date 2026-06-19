'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { articlesAPI } from '../../lib/api';
import { getStrapiMedia } from '../../lib/constants';

const PLATFORM_COLORS = {
  Netflix: 'bg-red-600',
  Prime: 'bg-blue-600',
  SonyLIV: 'bg-purple-600',
  Hotstar: 'bg-sky-500',
  JioHotstar: 'bg-pink-600',
  Zee5: 'bg-orange-600',
  Stage: 'bg-green-600'
};

// ✅ Platform name mapping to Hindi
const getPlatformNameHindi = (platformName) => {
  const platformMap = {
    'Netflix': 'नेटफ्लिक्स',
    'Prime': 'अमेज़न प्राइम',
    'Amazon Prime': 'अमेज़न प्राइम',
    'SonyLIV': 'सोनीलिव',
    'JioHotstar': 'जियोहॉटस्टार',
    'Zee5': 'जी5',
    'Stage': 'स्टेज',
  };
  return platformMap[platformName?.trim()] || platformName;
};

// ✅ Helper to get platform color
const getPlatformColor = (platformName) => {
  return PLATFORM_COLORS[platformName?.trim()] || 'bg-gray-600';
};

export default function WhatToWatch() {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCatTab, setactiveCatTab] = useState('सभी');

  useEffect(() => {
    fetchWatchArticles();
  }, []);

  const fetchWatchArticles = async () => {
    try {
      setLoading(true);

      const res = await articlesAPI.getAll({
        pageSize: 4,
        sort: 'publish_datetime:desc',
        filters: {
          watching_platform: { $notNull: true },
          moderation_status: { $eq: 'published' }
        },
        populate: {
          watching_platform: { populate: '*' },
          heroImage: '*'
        }
      });

      setList(res?.articles || []);
    } catch (err) {
      console.error('❌ WhatToWatch error:', err);
      setList([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="card-theme p-4 rounded-xl">
        <p className="text-sm text-gray-400">लोड हो रहा है…</p>
      </section>
    );
  }

  if (!list.length) return null;

  return (
    <section className="card-theme w-full max-w-md rounded-2xl p-2 shadow-xl">
      {/* HEADER */}
      <div className="mb-4 flex items-center justify-between">
        <h3 className="flex items-center gap-2 text-lg font-semibold">
          <span className="text-red-500">▶</span> क्या देखें
        </h3>

        <Link
          href="/what-to-watch"
          className="text-xs font-medium text-red-400 hover:text-red-300"
        >
          सभी देखें →
        </Link>
      </div>

      {/* LIST */}
      <div className="space-y-1">
        {list.map((item) => {
          const img = getStrapiMedia(
            item?.heroImage?.formats?.thumbnail?.url ||
            item?.heroImage?.formats?.small?.url ||
            item?.heroImage?.url
          );

          // ✅ Get first watching platform (if multiple)
          const firstPlatform = item.watching_platform?.[0];
          const platformName = firstPlatform?.platform?.trim() || '';
          const platformNameHindi = getPlatformNameHindi(platformName);
          const platformUrl = firstPlatform?.url || '';
          const badgeColor = getPlatformColor(platformName);

          // ✅ Click handler for platform badge
          const handlePlatformClick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (platformUrl) {
              window.open(platformUrl, '_blank', 'noopener,noreferrer');
            }
          };

          return (
            <Link
              key={item.id}
              href={`/article/${item.slug}`}
              className="group flex items-center gap-2 rounded-xl bg-white/5 p-2 transition hover:bg-white/10"
            >
              {/* Thumbnail */}
              <div className="relative w-28 h-14 flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800">
                {img && (
                  <Image
                    src={img}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                )}
              </div>

              {/* Title + Platform */}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 text-xs font-medium group-hover:text-red-400">
                  {item.title}
                </p>

                {/* ✅ Platform badge with Hindi name */}
                {platformNameHindi && (
                  platformUrl ? (
                    <span
                      onClick={handlePlatformClick}
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold text-white ${badgeColor} cursor-pointer hover:opacity-90 hover:scale-105 transition-all duration-200`}
                    >
                      {platformNameHindi}
                    </span>
                  ) : (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[8px] font-semibold text-white ${badgeColor}`}
                    >
                      {platformNameHindi}
                    </span>
                  )
                )}
              </div>

              <span className="text-lg text-neutral-500 group-hover:text-white">
                ›
              </span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}