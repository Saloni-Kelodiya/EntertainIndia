"use client";

import Image from "next/image";
import Link from "next/link";
import { Users, Calendar, Edit, ArrowLeft, Eye, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { WebStoryCard } from "./WebStoriesPage";
import { Layers } from "lucide-react";
import { formatDate } from '../lib/helpers';
import { getStrapiMedia } from '../lib/constants';

// Category colors mapping (वही रहेगा)
const categoryColors = {
  bollywood: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300',
  hollywood: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  ott: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  tv: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  tollywood: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
  bhojiwood: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  korean:'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
};

// Helper function to get category from initialArticle structure
const getCategory = (article) => {
  if (article.category) {
    if (typeof article.category === 'object') {
      return article.category;
    }
  }
  
  if (article.category?.data?.attributes) {
    return article.category.data.attributes;
  }
  
  return { name: 'सामान्य', slug: 'general' };
};

// Helper function to get hero image from initialArticle structure
const getHeroImage = (article) => {
  const heroImage = article.hero_image || article.heroImage;
  
  if (!heroImage) return null;
  
  if (heroImage.formats) {
    return heroImage.formats.medium?.url || 
           heroImage.formats.large?.url || 
           heroImage.formats.small?.url || 
           heroImage.url;
  }
  
  if (heroImage.data?.attributes?.formats) {
    const formats = heroImage.data.attributes.formats;
    return formats.medium?.url || 
           formats.large?.url || 
           formats.small?.url || 
           heroImage.data.attributes.url;
  }
  
  if (heroImage.url) {
    return heroImage.url;
  }
  
  return null;
};

// Internal Article Card Component
const ArticleCard = ({ article }) => {
  if (!article || !article.slug) return null;

  const imgUrl = getHeroImage(article);
  const fullImgUrl = imgUrl ? getStrapiMedia(imgUrl) : null;
  const category = getCategory(article);
  const isNews = article.MainCategory?.toLowerCase() === 'news';
  const correctPath = isNews ? `/news/${article.slug}` : `/article/${article.slug}`;
  const publishDate = article.publishDate || article.publishedAt;
  const views = article.views || 0;

  return (
    <article className="card-theme">
      <Link href={correctPath} className="block h-full">
        <div className="relative h-64 w-full overflow-hidden rounded-2xl">
          {fullImgUrl ? (
            <img
              src={fullImgUrl}
              alt={article.title || "Article image"}
              className="w-full h-full object-cover transition-all duration-500 hover:scale-110"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
              <span className="text-gray-400 text-4xl">📰</span>
            </div>
          )}

          {category && category.name && (
            <div
              className={`absolute bottom-3 left-3 px-3 py-1 text-xs font-medium rounded-full shadow 
              ${categoryColors[category.slug] || 'bg-gray-100 text-gray-700'}`}
            >
              {category.name}
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-2 line-clamp-2 text-gray-900 dark:text-gray-100">
            {article.title}
          </h3>

          <p className="text-sm text-gray-600 dark:text-gray-300 opacity-90 line-clamp-3">
            {article.summary || article.excerpt || "कोई सारांश उपलब्ध नहीं"}
          </p>

          {/* VIEWS & DATE - हिंदी में */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-4">
            <div className="flex items-center gap-1.5">
              <Eye size={14} className="text-gray-400" /> 
              <span className="font-medium">{views} {views === 1 ? 'दृश्य' : 'दृश्य'}</span>
            </div>
            <span className="text-gray-400">
              {publishDate ? formatDate(publishDate, 'relative') : 'हाल ही में'}
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
};

// Main SingleUserPage Component
export default function SingleUserPage({ 
  initialUser, 
  initialArticles = [], 
  initialWebStories = [] 
}) {
  const user = initialUser;
  const [articles, setArticles] = useState([]);
  const [news, setNews] = useState([]);
  const [webStories, setWebStories] = useState(initialWebStories);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("articles");

  useEffect(() => {
    if (initialArticles && initialArticles.length > 0) {
      const sortedArticles = [...initialArticles].sort((a, b) => {
        const dateA = new Date(a.publishDate || a.publishedAt || 0);
        const dateB = new Date(b.publishDate || b.publishedAt || 0);
        return dateB - dateA;
      });
      
      const regularArticles = sortedArticles.filter(a => a.MainCategory === 'article');
      const newsArticles = sortedArticles.filter(a => a.MainCategory === 'news');
      
      setArticles(regularArticles);
      setNews(newsArticles);
    }
  }, [initialArticles]);

  useEffect(() => {
    if (initialWebStories && initialWebStories.length > 0) {
      setWebStories(initialWebStories);
    }
  }, [initialWebStories]);

  if (!user) return null;

  const avatarUrl =
    user?.avatar?.formats?.medium?.url ||
    user?.avatar?.formats?.small?.url ||
    user?.avatar?.url ||
    "/default-avatar.png";

  const bioText = typeof user.bio === "string"
    ? user.bio_hindi
    : user.bio?.[0]?.children?.[0]?.text || "मनोरंजन में डूबे, खेल के प्रति जुनूनी।";

  const totalViews = [...articles, ...news, ...webStories].reduce((sum, item) => sum + (item.views || 0), 0);
  
  const formatCount = (count) => {
    if (count >= 1000000) return (count / 1000000).toFixed(1) + 'M';
    if (count >= 1000) return (count / 1000).toFixed(1) + 'K';
    return count;
  };

  const articlesCount = articles.length;
  const newsCount = news.length;
  const webStoriesCount = webStories.length;

  return (
    <div className="bg-slate-50 dark:bg-[#0f1115] min-h-screen">
      <div className="container-custom py-8">

        {/* BACK BUTTON - हिंदी में */}
        <div className="flex mb-8">
          <Link
            href="/author"
            className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 font-medium transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            लेखक टीम पर वापस जाएं
          </Link>
        </div>

        {/* PROFILE HEADER CARD */}
        <div className="bg-white dark:bg-[#1a1c23] rounded-2xl shadow-xl overflow-hidden mb-12 border border-gray-100 dark:border-gray-800">
          <div className="p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">

            {/* Avatar */}
            <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
              <Image
                src={avatarUrl}
                alt={user.username || user.name || "User avatar"}
                fill
                className="rounded-2xl object-cover border-4 border-gray-50 dark:border-gray-700 shadow-md"
                sizes="(max-width: 768px) 128px, 160px"
              />
            </div>

            {/* Info - हिंदी में */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4 mb-4">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">
                  {user.username_hindi|| user.username}
                </h1>
              </div>

              <div className="flex flex-wrap items-center justify-center md:justify-start gap-y-2 gap-x-6 text-sm md:text-base text-gray-500 dark:text-gray-400 mb-6 font-medium">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  लेखक
                </span>
                <span className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-indigo-500" />
                  {articlesCount} {articlesCount === 1 ? 'आर्टिकल' : 'आर्टिकल्स'}
                </span>
                <span className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-blue-500" />
                  {newsCount} {newsCount === 1 ? 'समाचार' : 'समाचार'}
                </span>
                <span className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-pink-500" />
                  {webStoriesCount} {webStoriesCount === 1 ? 'वेब स्टोरी' : 'वेब स्टोरीज'}
                </span>
              </div>

              <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl">
                {bioText}
              </p>
            </div>

            {/* Stats - हिंदी में */}
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

        {/* TABS SECTION - हिंदी में */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-4 sm:gap-8 border-b border-gray-200 dark:border-gray-800 mb-8">
            <button
              onClick={() => setActiveTab("articles")}
              className={`pb-4 px-2 text-lg font-bold transition-all relative ${
                activeTab === "articles"
                  ? "text-indigo-600 dark:text-indigo-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                आर्टिकल्स ({articlesCount})
              </div>
              {activeTab === "articles" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 dark:bg-indigo-400 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("news")}
              className={`pb-4 px-2 text-lg font-bold transition-all relative ${
                activeTab === "news"
                  ? "text-blue-600 dark:text-blue-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                समाचार ({newsCount})
              </div>
              {activeTab === "news" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 dark:bg-blue-400 rounded-t-full"></div>
              )}
            </button>

            <button
              onClick={() => setActiveTab("stories")}
              className={`pb-4 px-2 text-lg font-bold transition-all relative ${
                activeTab === "stories"
                  ? "text-pink-600 dark:text-pink-400"
                  : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              }`}
            >
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                वेब स्टोरीज ({webStoriesCount})
              </div>
              {activeTab === "stories" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-pink-600 dark:bg-pink-400 rounded-t-full"></div>
              )}
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <>
              {activeTab === "articles" && (
                articlesCount > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {articles.map((article) => (
                      <ArticleCard 
                        key={article.id || article.documentId} 
                        article={article}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500 bg-white dark:bg-[#1a1c23] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Edit className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">अभी तक कोई आर्टिकल पोस्ट नहीं किया गया।</p>
                  </div>
                )
              )}

              {activeTab === "news" && (
                newsCount > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {news.map((item) => (
                      <ArticleCard 
                        key={item.id || item.documentId} 
                        article={item}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500 bg-white dark:bg-[#1a1c23] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <FileText className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">अभी तक कोई समाचार पोस्ट नहीं किया गया।</p>
                  </div>
                )
              )}

              {activeTab === "stories" && (
                webStoriesCount > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {webStories.map((story) => (
                      <WebStoryCard key={story.id || story.documentId} story={story} />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-20 text-gray-500 bg-white dark:bg-[#1a1c23] rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                    <Layers className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-lg">अभी तक कोई वेब स्टोरी पोस्ट नहीं की गई।</p>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* ABOUT & DETAILS - हिंदी में */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="md:col-span-2 space-y-8">
            <section className="bg-white dark:bg-[#1a1c23] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold flex items-center gap-3 mb-6 text-slate-900 dark:text-white">
                <span className="w-1.5 h-6 bg-indigo-600 rounded-full"></span>
                {user.name || user.username} के बारे में
              </h2>
              <div className="prose prose-slate dark:prose-invert max-w-none text-gray-600 dark:text-gray-300">
                <p>{bioText}</p>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="bg-white dark:bg-[#1a1c23] rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-bold flex items-center gap-3 text-slate-900 dark:text-white mb-6">
                <Calendar className="w-5 h-5 text-indigo-500" />
                सदस्यता तिथि
              </h3>
              <p className="text-gray-600 dark:text-gray-400 font-medium">
                {new Date(user.createdAt || user.publishedAt || Date.now()).toLocaleDateString('hi-IN', {
                  year: 'numeric',
                  month: 'long'
                })} को जुड़े
              </p>
            </section>

            <div className="flex flex-col gap-3">
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
    </div>
  );
}