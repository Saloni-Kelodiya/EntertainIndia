'use client';

import ArticleCard from '../components/ui/ArticleCard';
import { ArticleListSkeleton } from '../components/ui/Skeleton';
import Link from 'next/link';

export default function TagClientView({ formattedTagName, initialArticles, initialTotal }) {
  const articles = initialArticles || [];
  const tagCount = initialTotal || articles.length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      {/* हीरो सेक्शन */}
      <div className="bg-gradient-to-r from-pink-600 to-pink-800 text-white rounded-xl overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 py-10 md:py-10 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full px-6 py-2">
              <span className="text-sm font-semibold text-white">🏷️ टैग</span>
            </div>
          </div>
         
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-3">
            #{formattedTagName}
          </h1>
          
          <p className="text-pink-100 text-lg">
            {tagCount} {tagCount === 1 ? 'लेख मिला' : 'लेख मिले'}
          </p>
        </div>
      </div>

      <div className="bg-[#f6f6f6] dark:bg-gray-800 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* सेक्शन हेडर */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white">
                सभी लेख और समाचार
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                {formattedTagName} के बारे में नवीनतम अपडेट खोजें
              </p>
            </div>
            
            <Link 
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 hover:border-pink-300 dark:hover:border-pink-500/50 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              होम पर वापस जाएं
            </Link>
          </div>

          {articles.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                  <div key={article.id} className="transform transition-all duration-300 hover:-translate-y-1">
                    <ArticleCard article={article} />
                  </div>
                ))}
              </div>
              
              {articles.length >= 24 && (
                <div className="text-center mt-12">
                  <button className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-200 font-medium shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40">
                    और लेख लोड करें
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16 md:py-24">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-4xl">🔍</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
                  कोई लेख नहीं मिला
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  हमें "{formattedTagName}" टैग वाला कोई लेख नहीं मिला।
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-pink-600 text-white rounded-xl hover:bg-pink-700 transition-all duration-200 font-medium"
                >
                  सभी लेख देखें
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* संबंधित टैग अनुभाग */}
      {articles.length > 0 && (
        <div className="bg-white dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 rounded-xl mt-4">
          <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">संबंधित टैग</p>
              <div className="flex flex-wrap justify-center gap-2">
                {[...new Set(articles.slice(0, 10).flatMap(a => a.tags || []))].slice(0, 8).map((tagItem, i) => (
                  <Link
                    key={i}
                    href={`/tag/${tagItem.slug}`}
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm border border-gray-200 dark:border-gray-700 hover:border-pink-300 dark:hover:border-pink-500/50 hover:bg-pink-50 dark:hover:bg-gray-750 hover:text-pink-600 dark:hover:text-pink-400 transition-all duration-200"
                  >
                    #{tagItem.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}