import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { Flame } from 'lucide-react';
import { articlesAPI } from '../../lib/api';

export default function TrendingTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const tickerRef = useRef(null);

  // Fetch trending articles directly
  useEffect(() => {
    const fetchTrending = async () => {
      try {
        setLoading(true);
        // API already returns trending=true articles first
        const data = await articlesAPI.getTrending({
          limit: 15,

        });
        setArticles(data);
      } catch (error) {
        console.error('Error fetching trending articles:', error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTrending();
    
    // Auto refresh every 5 minutes
    const interval = setInterval(fetchTrending, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading || articles.length === 0) return null;

  const handleArticleClick = () => {
    setIsStopped(true);
    setIsPaused(true);
  };

  // Dynamic animation speed
  const getAnimationDuration = () => {
    const baseSpeed = 10;
    const articleCount = articles.length;
    return Math.max(baseSpeed, articleCount * 1.2);
  };

  return (
    <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-2 overflow-hidden border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="bg-gradient-to-r from-pink-500 to-pink-600 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 tracking-wide shadow-lg">
            <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
            <span className="text-white">  ट्रेंडिंग </span>
          </div>
        </div>

        <div
          className="flex-1 overflow-hidden"
          onMouseEnter={() => !isStopped && setIsPaused(true)}
          onMouseLeave={() => !isStopped && setIsPaused(false)}
        >
          <div
            ref={tickerRef}
            className={`flex gap-8 items-center whitespace-nowrap ${
              !isStopped ? 'animate-scroll' : ''
            } ${isPaused || isStopped ? 'pause-scroll' : ''}`}
            style={{
              animationDuration: `${getAnimationDuration()}s`,
            }}
          >
            {/* Double for seamless loop */}
            {[...articles, ...articles].map((article, index) => (
              <Link
                key={`${article.id}-${index}`}
                href={`/${article.mainCategory || 'article'}/${article.slug}`}
                onClick={handleArticleClick}
                className="flex-shrink-0 hover:text-pink-400 transition-all duration-200 text-sm md:text-[13px] font-medium group"
              >
                <span className="group-hover:translate-x-1 inline-block transition-transform">
                  {article.title}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll linear infinite;
        }
        .pause-scroll {
          animation-play-state: paused !important;
        }
      `}</style>
    </div>
  );
}