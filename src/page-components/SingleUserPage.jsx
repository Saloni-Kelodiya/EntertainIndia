"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Calendar, Edit, ArrowLeft, Eye, FileText, Layers } from "lucide-react";
import { useState, useMemo } from "react";
import { WebStoryCard } from "./WebStoriesPage";
import { formatDate } from '../lib/helpers';
import { getStrapiMedia } from '../lib/constants';

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORY_COLORS = {
  bollywood: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  hollywood: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  ott:       'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  tv:        'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  tollywood: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  bhojiwood: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  korean:    'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
};

const TABS = [
  { key: 'articles', label: 'आर्टिकल्स', Icon: Edit,     color: 'indigo' },
  { key: 'news',     label: 'समाचार',    Icon: FileText,  color: 'blue'   },
  { key: 'stories',  label: 'वेब स्टोरीज', Icon: Layers,   color: 'pink'   },
];

const EMPTY_MESSAGES = {
  articles: { Icon: Edit,     text: 'अभी तक कोई आर्टिकल पोस्ट नहीं किया गया।'  },
  news:     { Icon: FileText, text: 'अभी तक कोई समाचार पोस्ट नहीं किया गया।'   },
  stories:  { Icon: Layers,   text: 'अभी तक कोई वेब स्टोरी पोस्ट नहीं की गई।' },
};

// ─── Helpers ────────────────────────────────────────────────────────────────

// API response confirmed: category is a flat array (manyToMany)
// Take first element directly — no .data.attributes wrapper (Strapi v5 flat)
const getCategory = (article) => {
  const cat = article.category;
  if (Array.isArray(cat) && cat.length > 0) return cat[0];       // v5 flat array
  if (cat?.data?.[0]?.attributes) return cat.data[0].attributes; // v4 nested fallback
  return { name: 'सामान्य', slug: 'general' };
};

// Web Story thumbnail helper
// API response confirmed: thumbnail = flat object with formats (same structure as hero_image)
// Pass to WebStoryCard — if WebStoryCard expects different field name, normalize here
const getStoryThumbnail = (story) => {
  const img = story.thumbnail;
  if (!img) return null;
  if (img.formats) return img.formats.small?.url || img.formats.medium?.url || img.url;
  return img.url || null;
};

// Normalize story for WebStoryCard (in case it expects coverImage or other field names)
const normalizeStory = (story) => ({
  ...story,
  coverImage: story.thumbnail, // alias if WebStoryCard uses coverImage
  image: getStoryThumbnail(story),
});

// formats.medium.url is the best choice for card display
const getHeroImage = (article) => {
  const img = article.hero_image;
  if (!img) return null;
  // v5 flat: img.formats.medium.url
  if (img.formats) return img.formats.medium?.url || img.formats.large?.url || img.formats.small?.url || img.url;
  // v4 nested fallback
  if (img.data?.attributes?.formats) {
    const f = img.data.attributes.formats;
    return f.medium?.url || f.large?.url || f.small?.url || img.data.attributes.url;
  }
  return img.url || null;
};

const formatCount = (n) => {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n;
};

// ─── ArticleCard ────────────────────────────────────────────────────────────

const ArticleCard = ({ article }) => {
  if (!article?.slug) return null;

  const imgUrl    = getHeroImage(article);
  const fullImg   = imgUrl ? getStrapiMedia(imgUrl) : null;
  const category  = getCategory(article);
  const isNews    = article.MainCategory?.toLowerCase() === 'news';
  const href      = isNews ? `/news/${article.slug}` : `/article/${article.slug}`;
  const date      = article.publishedAt;
  const views     = article.views || 0;

  return (
    <article className="card-theme">
      <Link href={href} className="block h-full">
        <div className="relative h-40 w-full overflow-hidden rounded-xl">
          {fullImg ? (
            <Image
              src={fullImg}
              alt={article.title || 'Article image'}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 220px"
              quality={60}
              className="object-cover transition-transform duration-500 hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 text-3xl">📰</span>
            </div>
          )}

          {category?.name && (
            <span className={`absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium rounded-full shadow
              ${CATEGORY_COLORS[category.slug] || 'bg-gray-100 text-gray-700'}`}>
              {category.name}
            </span>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-bold text-base mb-1.5 line-clamp-2 text-gray-900 dark:text-gray-100">
            {article.title}
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-300 opacity-90 line-clamp-2">
            {article.summary || 'कोई सारांश उपलब्ध नहीं'}
          </p>
          <div className="flex items-center justify-between text-[11px] text-gray-500 dark:text-gray-400 mt-3">
            <span className="flex items-center gap-1">
              <Eye size={12} className="text-gray-400" />
              <span className="font-medium">{views} दृश्य</span>
            </span>
            <span className="text-gray-400">
              {date ? formatDate(date, 'relative') : 'हाल ही में'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

// ─── TabButton ──────────────────────────────────────────────────────────────

const TabButton = ({ tab, count, active, onClick }) => {
  const { key, label, Icon, color } = tab;
  const isActive = active === key;

  return (
    <button
      onClick={() => onClick(key)}
      className={`pb-4 px-2 text-lg font-bold transition-all relative
        ${isActive
          ? `text-${color}-600 dark:text-${color}-400`
          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
    >
      <span className="flex items-center gap-2">
        <Icon className="w-5 h-5" />
        {label} ({count})
      </span>
      {isActive && (
        <span className={`absolute bottom-0 left-0 w-full h-1 bg-${color}-600 dark:bg-${color}-400 rounded-t-full`} />
      )}
    </button>
  );
};

// ─── EmptyState ─────────────────────────────────────────────────────────────

const EmptyState = ({ tabKey }) => {
  const { Icon, text } = EMPTY_MESSAGES[tabKey];
  return (
    <div className="text-center py-20 text-gray-500 bg-white dark:bg-[#1a1c23] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
      <Icon className="w-12 h-12 mx-auto mb-4 opacity-20" />
      <p className="text-lg">{text}</p>
    </div>
  );
};

// ─── SingleUserPage ─────────────────────────────────────────────────────────

export default function SingleUserPage({
  initialUser,
  initialArticles = [],
  initialWebStories = [],
}) {
  const [activeTab, setActiveTab] = useState('articles');

  // Client में re-sort + split (server पर हो चुका filter)
  const { articles, news } = useMemo(() => {
    const sorted = [...initialArticles].sort((a, b) =>
      new Date(b.publishDate || b.publishedAt || 0) - new Date(a.publishDate || a.publishedAt || 0)
    );
    return {
      articles: sorted.filter(a => a.MainCategory === 'article'),
      news:     sorted.filter(a => a.MainCategory === 'news'),
    };
  }, [initialArticles]);

  const user = initialUser;
  if (!user) return null;

  const avatarUrl =
    user?.avatar?.formats?.medium?.url ||
    user?.avatar?.formats?.small?.url ||
    user?.avatar?.url ||
    '/default-avatar.png';

  // Schema में bio plain text है (rich text नहीं) — bio_hindi को priority
  const bioText = user.bio_hindi || user.bio || 'मनोरंजन में डूबे, खेल के प्रति जुनूनी।';

  const counts = {
    articles: articles.length,
    news:     news.length,
    stories:  initialWebStories.length,
  };

  // web_stories में views field नहीं है — सिर्फ articles + news से calculate करें
  const totalViews = useMemo(
    () => [...articles, ...news].reduce((s, i) => s + (i.views || 0), 0),
    [articles, news]
  );

  const joinDate = new Date(user.createdAt || user.publishedAt || Date.now())
    .toLocaleDateString('hi-IN', { year: 'numeric', month: 'long' });

  return (
    <div className="bg-slate-50 dark:bg-[#0f1115] min-h-screen">
      <div className="container-custom py-8">

        {/* Back */}
        <div className="flex mb-8">
          <Link
            href="/author"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            लेखक टीम पर वापस जाएं
          </Link>
        </div>

        {/* Profile Card */}
        <div className="bg-white dark:bg-[#1a1c23] rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100 dark:border-gray-800">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">

            {/* Avatar */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
              <Image
                src={avatarUrl}
                alt={user.username || user.name || 'User avatar'}
                fill
                className="rounded-2xl object-cover border-4 border-gray-50 dark:border-gray-700 shadow-md"
                sizes="(max-width: 768px) 128px, 160px"
                priority
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
                {user.username_hindi || user.username}
              </h1>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500" />
                  लेखक
                </span>
                <span className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-indigo-500" />
                  {counts.articles} आर्टिकल्स
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  {counts.news} समाचार
                </span>
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-500" />
                  {counts.stories} वेब स्टोरीज
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                {bioText}
              </p>
            </div>

            {/* Total views */}
            <div className="md:border-l border-gray-100 dark:border-gray-800 md:pl-8 flex flex-col items-center justify-center min-w-[120px]">
              <div className="relative mb-2">
                <Eye className="w-12 h-12 text-indigo-500 opacity-20" />
                <Eye className="w-8 h-8 text-indigo-500 absolute inset-0 m-auto" />
              </div>
              <span className="text-3xl font-black text-slate-900 dark:text-white">
                {formatCount(totalViews)}
              </span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                कुल दृश्य
              </span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 border-b border-gray-200 dark:border-gray-800 mb-8">
            {TABS.map(tab => (
              <TabButton
                key={tab.key}
                tab={tab}
                count={counts[tab.key]}
                active={activeTab}
                onClick={setActiveTab}
              />
            ))}
          </div>

          {/* Articles */}
          {activeTab === 'articles' && (
            counts.articles > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {articles.map(article => <ArticleCard key={article.id || article.documentId} article={article} />)}
              </div>
            ) : <EmptyState tabKey="articles" />
          )}

          {/* News */}
          {activeTab === 'news' && (
            counts.news > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {news.map(item => <ArticleCard key={item.id || item.documentId} article={item} />)}
              </div>
            ) : <EmptyState tabKey="news" />
          )}

          {/* Web Stories */}
          {activeTab === 'stories' && (
            counts.stories > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {initialWebStories.map(story => (
                  <WebStoryCard key={story.id || story.documentId} story={normalizeStory(story)} />
                ))}
              </div>
            ) : <EmptyState tabKey="stories" />
          )}
        </div>

        {/* About & Details */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="md:col-span-2">
            <section className="bg-white dark:bg-[#1a1c23] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full" />
                {user.name || user.username} के बारे में
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{bioText}</p>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white dark:bg-[#1a1c23] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold flex items-center gap-3 text-slate-900 dark:text-white mb-6">
                <Calendar className="w-5 h-5 text-indigo-500" />
                सदस्यता तिथि
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {joinDate} को जुड़े
              </p>
            </section>

            <Link
              href="/author"
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white font-bold rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200 dark:shadow-none"
            >
              <Users className="w-5 h-5" />
              सभी लेखक देखें
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}