'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getStrapiMedia } from '../lib/constants';
import { TrendingUp, Flame } from 'lucide-react';

/* ---------------------------------------
   वेब स्टोरी टैब (स्टोरी से डायनामिक)
---------------------------------------- */
function WebStoryTabs({ activeTab, onChange, categories = [] }) {
  const activeRef = useRef(null);

  useEffect(() => {
    activeRef.current?.scrollIntoView({
      behavior: 'smooth',
      inline: 'center',
      block: 'nearest',
    });
  }, [activeTab]);

  // बेस टैब जो हमेशा दिखाए जाते हैं
  const baseTabs = [
    { label: 'सभी स्टोरी', value: 'all', id: 'base-all' },
    { label: 'ट्रेंडिंग', value: 'trending', id: 'base-trending' },
  ];

  // कैटेगरी को टैब फॉर्मेट में बदलें
  const categoryTabs = categories
    .filter(cat => !['all', 'trending'].includes(cat.value))
    .map(cat => ({
      label: cat.label,
      value: cat.value,
      id: `cat-${cat.value}`
    }));

  // सभी टैब को जोड़ें
  const allTabs = [...baseTabs, ...categoryTabs];

  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar items-center py-2">
      {allTabs.map((tab) => {
        const active = activeTab === tab.value;

        return (
          <button
            key={tab.id}
            ref={active ? activeRef : null}
            onClick={() => onChange(tab.value)}
            className={`px-4 py-2 mx-1 rounded-full text-sm font-medium whitespace-nowrap transition-all
              ${active
                ? "bg-pink-600 text-white shadow"
                : "bg-gray-300 text-gray-700 hover:bg-gray-200 dark:bg-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800"
              }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------
   स्टोरी कार्ड
---------------------------------------- */
export function WebStoryCard({ story }) {
  if (!story) return null;

  const imageUrl = story.thumbnail?.url
    ? (story.thumbnail.url.startsWith('http') ? story.thumbnail.url : getStrapiMedia(story.thumbnail.url))
    : null;

  // कैटेगरी लेबल (हिंदी में)
  const getCategoryLabel = (category) => {
    const categoryMap = {
      'trending': 'ट्रेंडिंग',
      'bollywood': 'बॉलीवुड',
      'hollywood': 'हॉलीवुड',
      'south': 'साउथ',
      'ott': 'ओटीटी',
      'tv': 'टीवी',
      'music': 'संगीत',
      'celebrity': 'सेलिब्रिटी',
      'fashion': 'फैशन',
      'lifestyle': 'लाइफस्टाइल',
    };
    return categoryMap[category] || category?.charAt(0).toUpperCase() + category?.slice(1).replace(/-/g, ' ');
  };

  const categoryLabel = story.category ? getCategoryLabel(story.category) : '';

  return (
    <Link
      href={`/web-stories/${story.slug}`}
      className="group relative overflow-hidden rounded-xl bg-black shadow hover:shadow-lg transition-all duration-300 h-full"
    >
      <div className="relative aspect-[9/16]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={story.title || 'वेब स्टोरी'}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-[1.05]"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl bg-gray-800">📖</div>
        )}

        {/* डार्क ग्रेडिएंट */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

        {/* टॉप बैज */}
        <div className="absolute top-2 left-2 right-2 z-10 flex justify-between items-start">
          <div className="rounded-full bg-pink-600 backdrop-blur-sm px-3 py-1 text-[11px] font-black tracking-wide text-white shadow-md border border-white/30 uppercase ml-auto">
            {categoryLabel}
          </div>
        </div>

        {/* टाइटल और मेटाडेटा */}
        <div className="absolute bottom-0 p-2.5 w-full">
          <h3 className="text-[12px] font-bold leading-tight text-white line-clamp-2 group-hover:text-pink-400 transition-colors">
            {story.title}
          </h3>

          {story.createdAt && (
            <p className="mt-1 text-[9px] text-gray-300 font-medium">
              {new Date(story.createdAt).toLocaleDateString('hi-IN', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}

/* ---------------------------------------
   मुख्य पेज
---------------------------------------- */
export default function WebStoriesPage({ stories = [] }) {
  const [activeCategory, setActiveCategory] = useState('all');

  /* ---------- सभी स्टोरी से यूनिक कैटेगरी निकालें ---------- */
  const uniqueCategories = useMemo(() => {
    if (!Array.isArray(stories)) return [];

    // सभी स्टोरी से कैटेगरी निकालें
    const categories = stories
      .map(story => story.category)
      .filter(category => category && typeof category === 'string')
      .filter((value, index, self) => self.indexOf(value) === index);

    // कैटेगरी को टैब फॉर्मेट में बदलें (हिंदी में)
    const categoryMap = {
      'trending': 'ट्रेंडिंग',
      'bollywood': 'बॉलीवुड',
      'hollywood': 'हॉलीवुड',
      'south': 'साउथ',
      'ott': 'ओटीटी',
      'tv': 'टीवी',
      'music': 'संगीत',
      'celebrity': 'सेलिब्रिटी',
      'fashion': 'फैशन',
      'lifestyle': 'लाइफस्टाइल',
    };

    return categories.map(cat => ({
      value: cat,
      label: categoryMap[cat] || cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')
    }));
  }, [stories]);

  /* ---------- फीचर्ड स्टोरी अलग करें ---------- */
  const { featuredStories, allOtherStories } = useMemo(() => {
    if (!Array.isArray(stories)) {
      return { featuredStories: [], allOtherStories: [] };
    }

    // केवल लेटेस्ट 6 फीचर्ड स्टोरी लें
    const featured = stories
      .filter((s) => s.featured === true)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 6);

    return {
      featuredStories: featured,
      allOtherStories: stories.filter((s) => !s.featured),
    };
  }, [stories]);

  /* ---------- फिल्टर लॉजिक ---------- */
  const filteredStories = useMemo(() => {
    if (activeCategory === 'all') return stories;

    if (activeCategory === 'trending') {
      return stories.filter((s) => s.category === 'trending');
    }

    return stories.filter((s) => s.category === activeCategory);
  }, [activeCategory, stories]);

  if (!stories.length) {
    return (
      <div className="py-20 text-center text-gray-500 dark:text-gray-400">
        अभी कोई स्टोरी नहीं है।
      </div>
    );
  }

  return (
    <div className="bg-[#f6f6f6] dark:bg-gray-900 max-w-7xl mx-auto px-4 py-6 rounded-2xl">

      {/* ---------- हेडर ---------- */}
      <div className="border-b border-gray-300 dark:border-gray-700 pb-5 mb-8 flex gap-4">
        <Flame className="text-pink-500 mt-1" size={28} />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            वेब स्टोरी
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            मनोरंजन जगत की छोटी विजुअल कहानियां
          </p>
        </div>
      </div>

      {/* ---------- फीचर्ड स्टोरी (केवल लेटेस्ट 6) ---------- */}
      {featuredStories.length > 0 && (
        <section className="mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Flame className="text-pink-500" size={20} />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              फीचर्ड स्टोरी
            </h2>
            {featuredStories.length === 6 && stories.filter(s => s.featured).length > 6 && (
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                (नवीनतम 6)
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
            {featuredStories.map((story) => (
              <WebStoryCard key={story.id} story={story} />
            ))}
          </div>
        </section>
      )}

      {/* ---------- वेब स्टोरी टैब (डायनामिक) ---------- */}
      <div className="mb-6">
        <WebStoryTabs
          activeTab={activeCategory}
          onChange={setActiveCategory}
          categories={uniqueCategories}
        />
      </div>

      {/* ---------- स्टोरी ग्रिड (सभी स्टोरी) ---------- */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
          {filteredStories.map((story) => (
            <WebStoryCard key={story.id} story={story} />
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="py-16 text-center text-gray-500 dark:text-gray-400">
            इस श्रेणी में कोई स्टोरी नहीं मिली।
          </div>
        )}
      </section>
    </div>
  );
}