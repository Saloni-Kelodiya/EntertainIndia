'use client';

import { useRouter } from 'next/navigation';
import { useStore } from '../store/useStore';
import { useState, useEffect } from 'react';
import { articlesAPI } from '../lib/api';
import ArticleCard from '../components/ui/ArticleCard';
import { ArticleListSkeleton } from '../components/ui/Skeleton';

export default function PremiumContentPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useStore();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Check if user has premium subscription
  const hasPremium = user?.subscription?.status === 'active';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated || !user) {
      router.push('/login');
    } else if (!hasPremium) {
      router.push('/premium');
    }
  }, [isAuthenticated, user, hasPremium, router]);

  if (!isAuthenticated || !user || !hasPremium) {
    return null;
  }

  useEffect(() => {
    const fetchPremiumContent = async () => {
      setLoading(true);
      try {
        // In a real app, you would fetch premium-only articles
        // For now, we'll fetch featured articles as a demo
        const data = await articlesAPI.getAll({ featured: true, limit: 12 });
        setArticles(data.articles);
      } catch (error) {
        console.error('Error fetching premium content:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPremiumContent();
  }, []);

  return (
    <>
             <title>Premium Content - EntertainIndia</title>
     
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-600 via-orange-600 to-red-600 text-white py-12">
        <div className="container-custom">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">👑</span>
                <h1 className="text-4xl md:text-5xl font-heading font-bold">
                  Premium Content
                </h1>
              </div>
              <p className="text-yellow-100 text-lg">
                Exclusive content just for premium members
              </p>
            </div>
            <div className="hidden md:block">
              <div className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-lg">
                <p className="text-sm font-medium">Premium Member</p>
                <p className="text-xs text-yellow-200">Active Subscription</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Premium Badge */}
        <div className="card p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-2 border-purple-200 mb-8">
          <div className="flex items-center gap-4">
            <span className="text-5xl">✨</span>
            <div className="flex-1">
              <h2 className="text-xl font-heading font-bold text-purple-900 mb-1">
                Welcome to Premium Content
              </h2>
              <p className="text-gray-700">
                Enjoy unlimited access to exclusive articles, interviews, and behind-the-scenes content.
              </p>
            </div>
            <button
              onClick={() => router.push('/premium')}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Manage Plan
            </button>
          </div>
        </div>

        {/* Content Categories */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '📰', label: 'Exclusive Articles', count: '120+' },
            { icon: '🎤', label: 'Interviews', count: '45+' },
            { icon: '🎬', label: 'Behind Scenes', count: '80+' },
            { icon: '⭐', label: 'Early Reviews', count: '50+' },
          ].map((category, index) => (
            <div key={index} className="card p-4 text-center hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-4xl mb-2">{category.icon}</div>
              <p className="font-bold text-purple-900">{category.label}</p>
              <p className="text-sm text-gray-600">{category.count}</p>
            </div>
          ))}
        </div>

        {/* Premium Articles */}
        <div className="mb-6">
          <h2 className="text-2xl font-heading font-bold mb-4 flex items-center gap-2">
            <span>🔒</span> Premium Articles
          </h2>
        </div>

        {loading ? (
          <ArticleListSkeleton count={12} />
        ) : articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <div key={article.id} className="relative">
                {/* Premium Badge */}
                <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                  👑 PREMIUM
                </div>
                <ArticleCard article={article} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 card">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold mb-2">No Premium Content Yet</h3>
            <p className="text-gray-600">Check back soon for exclusive content!</p>
          </div>
        )}

        {/* Premium Benefits Reminder */}
        <div className="card p-8 bg-gradient-to-br from-blue-50 to-purple-50 mt-12">
          <h3 className="text-xl font-heading font-bold text-center mb-6">
            Your Premium Benefits
          </h3>
          <div className="grid md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-3xl mb-2">🚫</div>
              <p className="font-bold text-sm">Ad-Free</p>
            </div>
            <div>
              <div className="text-3xl mb-2"></div>
              <p className="font-bold text-sm">Early Access</p>
            </div>
            <div>
              <div className="text-3xl mb-2">💎</div>
              <p className="font-bold text-sm">Exclusive Content</p>
            </div>
            <div>
              <div className="text-3xl mb-2">📥</div>
              <p className="font-bold text-sm">Downloads</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

