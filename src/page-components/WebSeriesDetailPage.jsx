// app/webseries/[slug]/WebseriesDetailClient.js (Client Component)
'use client';

import { useState, useEffect,useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { webSeriesReviewsAPI, webSeriesAPI } from '../lib/api';
import {
  ArrowLeft, Star, Calendar, Users, Globe, TrendingUp, Award, ExternalLink,
  Film, MessageSquare, Video, Clock, Loader, Send, Trash2, User, ChevronDown, ChevronUp,Play, Maximize2,Info
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// 📺 स्ट्रीमिंग प्लेटफॉर्म के लोगो (आधिकारिक ब्रांड आइकॉन)
const PLATFORM_ICONS = {
  'netflix': '/platform-icons/Netflix.webp',
  'amazon prime': '/platform-icons/Amazon-Prime.svg',
  'prime video': '/platform-icons/Amazon-Prime.svg',
  'amazon prime video': '/platform-icons/Amazon-Prime.webp',
  'hotstar': '/platform-icons/JioHotstar.webp',
  'disney+ hotstar': '/platform-icons/JioHotstar.webp',
  'zee5': '/platform-icons/Zee5.svg',
  'sonyliv': '/platform-icons/SonyLIV.svg',
  'sony liv': '/platform-icons/SonyLIV.svg',
  'jiocinema': '/platform-icons/JioCinema.svg',
  'jio cinema': '/platform-icons/JioCinema.svg',
  'youtube': '/platform-icons/YouTube.svg',
  'apple tv': '/platform-icons/AppleTV.webp',
};

const PlatformIcon = ({ platform }) => {
  if (!platform) return null;

  let platformName = '';

  if (typeof platform === 'string') {
    platformName = platform;
  } else if (platform?.platform) {
    platformName = typeof platform.platform === 'string'
      ? platform.platform
      : platform.platform?.platform || '';
  } else if (platform?.name) {
    platformName = platform.name;
  }

  if (!platformName) return null;

  const name = platformName.toLowerCase().trim();

  let iconUrl = null;

  if (PLATFORM_ICONS[name]) {
    iconUrl = PLATFORM_ICONS[name];
  } else if (name.includes('netflix')) {
    iconUrl = PLATFORM_ICONS['netflix'];
  } else if (name.includes('prime') || name.includes('amazon')) {
    iconUrl = PLATFORM_ICONS['amazon prime'];
  } else if (name.includes('hotstar') || name.includes('disney')) {
    iconUrl = PLATFORM_ICONS['hotstar'];
  } else if (name.includes('zee')) {
    iconUrl = PLATFORM_ICONS['zee5'];
  } else if (name.includes('sony') || name.includes('liv')) {
    iconUrl = PLATFORM_ICONS['sony liv'];
  } else if (name.includes('jio')) {
    iconUrl = PLATFORM_ICONS['jio cinema'];
  } else if (name.includes('youtube')) {
    iconUrl = PLATFORM_ICONS['youtube'];
  } else if (name.includes('apple')) {
    iconUrl = PLATFORM_ICONS['apple tv'];
  }

  if (!iconUrl) return null;

  return (
    <img
      src={iconUrl}
      alt={platformName}
      className="w-6 h-6 object-contain rounded"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
      }}
    />
  );
};

function CompactSeasonItem({ season, isLast }) {
  const seasonNum = season?.season_number || season?.seasionNumber || "—";
  const year = season?.releaseDate ? new Date(season.releaseDate).getFullYear() : "";
  const episodes = season?.episodes;
  const [expanded, setExpanded] = useState(false);
  const isLongDescription = season?.description?.length > 150;

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-xs font-bold text-white shadow-md flex-shrink-0">
          {seasonNum}
        </div>
        {!isLast && (
          <div className="w-0.5 grow bg-pink-600/20 dark:bg-pink-600/30 mt-1" />
        )}
      </div>

      <div className="pb-8 w-full">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-bold text-gray-900 dark:text-white">
            सीज़न {seasonNum}
          </h4>
          {year && <span className="text-[10px] text-gray-400">({year})</span>}
          {episodes && (
            <span className="text-[10px] bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-gray-500 border border-gray-200 dark:border-gray-700">
              {episodes} एपिसोड
            </span>
          )}
        </div>

        {season.description && (
          <div className="mb-2">
            <article className={`prose prose-sm sm:prose-base dark:prose-invert max-w-none ${!expanded ? 'line-clamp-3' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {season.description}
              </ReactMarkdown>
            </article>
            {isLongDescription && (
              <button
                onClick={() => setExpanded(!expanded)}
                className="text-[10px] font-semibold text-red-500 hover:text-red-700 mt-0.5 block"
              >
                {expanded ? "कम पढ़ें" : "और पढ़ें"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function WebseriesDetailClient({ slug, initialData, ServerCategory }) {
  const router = useRouter();
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [showFullCast, setShowFullCast] = useState(false);
  const [showFullCrew, setShowFullCrew] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  // सर्वर डेटा से इनिशियलाइज़ करें
  const [webseries, setWebseries] = useState(initialData.webseries);
  const [crew, setCrew] = useState(initialData.crew);
  const [cast, setCast] = useState(initialData.cast);
  const [articles, setArticles] = useState(initialData.articles);
  const [similar, setSimilar] = useState(initialData.similar);
  const [seasons, setSeasons] = useState(initialData.seasons);
  const [reviews, setReviews] = useState(initialData.webseries?.reviews || []);

  // यूजर और रिव्यू स्टेट्स
  const [user, setUser] = useState(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showAllLanguages, setShowAllLanguages] = useState(false);
// मीडिया स्टेट्स
  const [isPlaying, setIsPlaying] = useState(false);
  const [trailerError, setTrailerError] = useState(false);
  const iframeRef = useRef(null);
   const [showCaption, setShowCaption] = useState(false);
     const posterCaption =  webseries?.poster?.caption|| "X"; 
  // क्लाइंट साइड पर लॉग इन यूजर चेक करें
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stopinkUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");
      if (stopinkUser && token) {
        try {
          const parsedUser = JSON.parse(stopinkUser);
          setUser(parsedUser);
          console.log("यूजर लोड किया गया:", parsedUser);
        } catch (e) {
          console.error("यूजर पार्स करने में विफल", e);
        }
      }
    }
  }, []);

  // जब कम्पोनेंट माउंट हो या वेबसीरीज बदले तो रिव्यू लोड करें
  useEffect(() => {
    loadReviews();
  }, [webseries?.documentId]);

  const loadReviews = async () => {
    if (webseries?.documentId) {
      try {
        const freshReviews = await webSeriesReviewsAPI.getByWebSeriesId(webseries.documentId);
        setReviews(freshReviews);
        console.log("रिव्यू लोड किए गए:", freshReviews);
      } catch (error) {
        console.error("रिव्यू लोड करने में त्रुटि:", error);
      }
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();

    if (!user || !localStorage.getItem('token')) {
      setShowLoginPrompt(true);
      return;
    }

    if (!reviewForm.comment.trim()) {
      alert('कृपया एक टिप्पणी लिखें');
      return;
    }

    if (reviewForm.rating < 1 || reviewForm.rating > 5) {
      alert('कृपया 1 और 5 के बीच रेटिंग चुनें');
      return;
    }

    setSubmittingReview(true);
    setReviewSuccess(false);

    try {
      const webSeriesDocumentId = webseries?.documentId;

      // अगर उपलब्ध हो तो यूजर का documentId उपयोग करें
      const userDocumentId = user?.documentId;
      const userId = user?.id;

    
      // पहले सरल क्रिएट विधि आज़माएं
      const result = await webSeriesReviewsAPI.createSimple({
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        webSeriesDocumentId: webSeriesDocumentId,
        userId: userId,
        userDocumentId: userDocumentId
      });

      
      // तुरंत प्रदर्शन के लिए ऑप्टिमिस्टिक रिव्यू बनाएं
      const newReview = {
        id: result.data?.id || Date.now(),
        documentId: result.data?.documentId || `temp-${Date.now()}`,
        rating: reviewForm.rating,
        comment: reviewForm.comment,
        createdAt: new Date().toISOString(),
        user: {
          id: user.id,
          documentId: user.documentId,
          username: user.username,
          email: user.email
        }
      };

      setReviews(prevReviews => [newReview, ...prevReviews]);
      setReviewForm({ rating: 5, comment: '' });
      setReviewSuccess(true);

      setTimeout(() => setReviewSuccess(false), 3000);

      // एपीआई से ताज़ा डेटा प्राप्त करें
      setTimeout(async () => {
        const freshReviews = await webSeriesReviewsAPI.getByWebSeriesId(webSeriesDocumentId);
        setReviews(freshReviews);
      }, 1000);

    } catch (error) {
      console.error('रिव्यू सबमिट करने में त्रुटि:', error);

      let errorMessage = 'रिव्यू सबमिट करने में विफल। ';
      if (error.response?.data?.error?.message) {
        errorMessage += error.response.data.error.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'कृपया पुनः प्रयास करें।';
      }

      alert(errorMessage);
    } finally {
      setSubmittingReview(false);
    }
  };
 
  const handleDeleteReview = async (reviewDocumentId) => {
    if (!confirm("क्या आप वाकई यह रिव्यू हटाना चाहते हैं?")) return;

    try {
      await webSeriesReviewsAPI.delete(reviewDocumentId);
      setReviews(prevReviews =>
        prevReviews.filter(review => review.documentId !== reviewDocumentId)
      );
    } catch (error) {
      console.error('रिव्यू हटाने में त्रुटि:', error);
      alert('रिव्यू हटाने में विफल');
    }
  };

  // हैंडलर
  const handlePlayTrailer = () => { setIsPlaying(true); setTrailerError(false); };
  const handleIframeError = () => { setTrailerError(true); setIsPlaying(false); };

  const pinkirectToLogin = () => {
    router.push('/login?pinkirect=' + encodeURIComponent(window.location.pathname));
  };
const getYouTubeThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  // सुरक्षित यूआरएल हेल्पर
  const safeImageUrl = (url) => {
    if (!url || typeof url !== "string") return null;
    const clean = url.trim();
    return clean.length > 0 ? clean : null;
  };

  // डेटा तैयार करना
  const posterUrl = webseries?.poster?.url || webseries?.poster || null;
  const backdropUrl = webseries?.backdrop_poster?.url || webseries?.backdrop_poster || null;

  const releaseDate = webseries?.releaseDate
    ? new Date(webseries.releaseDate).toLocaleDateString("hi-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
    : null;

  const ratingValue = webseries?.rating || "N/A";

  const languages = Array.isArray(webseries?.languages)
    ? webseries.languages
      .map((l) => l?.language || l?.name || l?.title)
      .filter(Boolean)
      .join(", ")
    : "N/A";

  const categories = Array.isArray(webseries?.categories)
    ? webseries.categories.map((c) => c?.name).filter(Boolean).join(", ")
    : "";

  const genres = Array.isArray(webseries?.genres)
    ? webseries.genres.map((g) => g?.name).filter(Boolean).join(", ")
    : "";

  const watchingPlatforms = Array.isArray(webseries?.watchingPlatform)
    ? webseries.watchingPlatform
    : [];

  const awards = Array.isArray(webseries?.award) ? webseries.award : [];
  const boxOffice = Array.isArray(webseries?.box_office)
    ? webseries.box_office[0] || null
    : null;

  const seasonsData = Array.isArray(seasons) ? seasons : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6]  rounded-2xl dark:bg-gray-800">
       {/* FULL BACKDROP */}
    <div className="relative w-full aspect-[2/0.8] rounded-xl overflow-hidden mb-8">
  {backdropUrl && (
    <Image
      src={backdropUrl}
      alt={`${webseries?.title} बैकड्रॉप`}
      fill
      priority
      className="object-cover object-top"
    />
  )}
  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />
  <button
    onClick={() => router.back()}
    className="absolute top-4 left-4 z-30 flex items-center gap-2 text-white bg-black/60 backdrop-blur px-3 py-2 rounded-lg text-xs sm:text-sm hover:bg-black/80 transition-all"
  >
    <ArrowLeft size={16} />
    वापस
  </button>
</div>
 
 {/* MOBILE POSTER - OUTSIDE BACKDROP (SOLUTION 1) */}
{posterUrl && (
  <div className="block lg:hidden px-4 -mt-16 mb-6 relative z-40">
    <div className="flex flex-col">
      {/* Poster - Centered at top */}
      <div 
        className="relative mx-auto mb-3"
        onMouseLeave={() => setShowCaption(false)}
      >
        {/* Poster with 3:4 ratio */}
        <div className="relative w-[120px] sm:w-[140px] aspect-[3/4] rounded-lg overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 mx-auto">
          <Image 
            src={posterUrl} 
            alt={webseries?.title} 
            fill 
            sizes="140px" 
            className="object-cover" 
          />
        </div>
        
        {/* Info button */}
        <div 
          className="absolute -bottom-1.5 -left-1.5 z-40 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 text-pink-600 dark:text-pink-400 rounded-full p-1.5 shadow-md transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700" 
          onMouseEnter={() => setShowCaption(true)}
        >
          <Info size={12} />
        </div>

        {/* Caption Chip on Hover */}
        {showCaption && (
          <div className="absolute bottom-2 left-10 z-50 max-w-xs">
            <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
              <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">छवि स्रोत:</span>
              <span>{posterCaption}</span>
            </div>
          </div>
        )}
      </div>

      {/* All Details Below Poster - Full Width */}
      <div className="w-full">
        <h1 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white text-center mb-2">
          {webseries?.title}
        </h1>
        
        <div className="text-center mb-3">
          <div className="inline-block bg-purple-500 text-white text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wide">
            टीवी शो • {webseries?.seasonNumber || seasonsData.length || 0} सीजन
          </div>
        </div>
        
        {/* Row 1: Country, Age Rating, Rating, Release Date */}
        <div className="flex flex-wrap justify-center gap-2 mb-3">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
            <Globe size={14} />
            <span>{webseries?.country || "N/A"}</span>
          </div>
          
          <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
            {webseries?.age_rating || "N/A"}
          </div>
          
          {webseries?.rating && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
              <Star size={14} className="text-yellow-400 fill-current" />
              <span>{ratingValue}/10</span>
            </div>
          )}
          
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
            <Calendar size={14} />
            <span>{releaseDate || "N/A"}</span>
          </div>
        </div>
        
        {/* Languages - Full width */}
        <div className="flex items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs mb-2 flex-wrap">
          <Users size={14} />
          {(() => {
            const languageArray = Array.isArray(webseries?.languages) ? webseries.languages : [];
            const languageNames = languageArray.map(l => l?.language || l?.name || l?.title).filter(Boolean);

            if (languageNames.length === 0) {
              return <span>N/A</span>;
            }

            if (languageNames.length <= 3 || showAllLanguages) {
              return (
                <>
                  <span>{languageNames.join(", ")}</span>
                  {languageNames.length > 3 && (
                    <button
                      onClick={() => setShowAllLanguages(false)}
                      className="ml-1 text-red-500 hover:text-red-600 font-semibold text-xs"
                    >
                      कम
                    </button>
                  )}
                </>
              );
            } else {
              const displayLanguages = languageNames.slice(0, 3).join(", ");
              const remainingCount = languageNames.length - 3;

              return (
                <>
                  <span>{displayLanguages}</span>
                  <button
                    onClick={() => setShowAllLanguages(true)}
                    className="flex items-center gap-1 ml-1 text-red-500 hover:text-red-600 font-semibold text-xs"
                  >
                    +{remainingCount}
                  </button>
                </>
              );
            }
          })()}
        </div>
        
        {/* Genres - Full width */}
        {genres && genres.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-xs">
            <span className="font-medium">शैलियाँ:</span>
            {webseries?.genres?.map((genre, i) => (
              <span key={i} className="text-red-600 dark:text-red-400 font-medium">
                {genre.name}
                {i < genres.length - 1 && ","}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
)}


     {/* सामग्री */}
<div className="relative z-10">
  <div className="lg:px-8">
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-5">
      
      {/* बायां साइडबार - मोबाइल: दूसरा, डेस्कटॉप: पहला */}
      <div className="w-full lg:w-80 flex-shrink-0 mt-6 lg:-mt-20 order-2 lg:order-1">
        <div className="lg:sticky md:top-24 space-y-5">
          {/* डेस्कटॉप पोस्टर */}
         <div className="hidden lg:block relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-neutral-800">
          {posterUrl ? (
            <div 
              className="relative w-full h-full"
              onMouseEnter={() => setShowCaption(true)}
              onMouseLeave={() => setShowCaption(false)}
            >
              <Image 
                src={posterUrl} 
                alt={webseries?.title} 
                fill 
                className="object-cover" 
              />
              
              {/* i Button - Left Side (Bottom-Left Corner) */}
              <div className="absolute bottom-2 left-2 z-40 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 text-pink-600 dark:text-pink-400 rounded-full p-1.5 shadow-md cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-700">
                <Info size={14} />
              </div>
        
              {/* Caption Chip - Appears on hover (to the right of i button) */}
              {showCaption && (
                <div className="absolute bottom-2 left-10 z-50">
                 <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
              <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">छवि स्रोत:</span>
              <span>
                { posterCaption}
              </span>
            </div>
                  {/* Arrow pointing to i button */}
                  <div className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-white dark:bg-gray-800 rotate-45 border-l border-b border-gray-200 dark:border-gray-700"></div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-gray-500">
              <Film size={64} />
            </div>
          )}
        </div>

          {/* कहां देखें अनुभाग - सीज़न से */}
          {seasonsData.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Video className="text-pink-500" size={20} />
                कहां देखें
              </h3>

              <div className="space-y-3">
                {seasonsData.map((season, index) => {
                  // जांचें कि सीज़न के पास वैध यूआरएल है या नहीं
                  const hasUrl = season.season_url && season.season_url !== '#' && season.season_url !== '';
                  
                  // प्लेटफॉर्म की जानकारी प्राप्त करें
                  let platformName = '';
                  let platformObj = null;
                  
                  if (season.platform) {
                    if (typeof season.platform === 'string') {
                      platformName = season.platform;
                      platformObj = { platform: season.platform };
                    } else if (season.platform?.platform) {
                      platformName = season.platform.platform;
                      platformObj = season.platform;
                    } else if (season.platform?.name) {
                      platformName = season.platform.name;
                      platformObj = season.platform;
                    }
                  }

                  return (
                    <div
                      key={index}
                      className={`
                        bg-[#f6f6f6] dark:bg-gray-800 rounded-2xl border-2 transition-all duration-300
                        ${hasUrl
                          ? 'border-gray-300 dark:border-neutral-700 hover:border-pink-400 hover:shadow-lg cursor-pointer'
                          : 'border-gray-200 dark:border-neutral-700 opacity-80'
                        }
                      `}
                    >
                      {hasUrl ? (
                        <a
                          href={season.season_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-4 group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              {/* प्लेटफॉर्म आइकन */}
                              {platformObj ? (
                                <div className="flex-shrink-0">
                                  <PlatformIcon platform={platformObj} />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-full bg-pink-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                                  {season.season_number}
                                </div>
                              )}
                              
                              <div className="flex-1">
                                {/* प्लेटफॉर्म का नाम या सीज़न शीर्षक */}
                                <div className="font-bold transition-colors text-base group-hover:text-pink-500">
                                  {platformName || `सीज़न ${season.season_number}`}
                                </div>
                                
                                {/* सीज़न संख्या (यदि प्लेटफॉर्म दिखाया गया है) */}
                                {platformName && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    सीज़न {season.season_number}
                                  </div>
                                )}
                                
                                {/* देखने की स्थिति */}
                                {season.watch_status && (
                                  <div className={`text-xs font-semibold uppercase tracking-wider mt-0.5 ${
                                    season.watch_status === 'Available' 
                                      ? 'text-green-600'
                                      : season.watch_status === 'Coming Soon'
                                      ? 'text-yellow-600'
                                      : 'text-gray-500'
                                  }`}>
                                    {season.watch_status === 'Available' ? 'उपलब्ध' : season.watch_status === 'Coming Soon' ? 'जल्द आ रहा है' : season.watch_status}
                                  </div>
                                )}
                                
                                {/* एपिसोड की संख्या */}
                                {season.season_episodes && (
                                  <div className="text-[10px] text-gray-400 mt-1">
                                    {season.season_episodes} एपिसोड
                                  </div>
                                )}
                              </div>
                            </div>
                            <ExternalLink
                              className="text-gray-400 group-hover:text-pink-500 transition-colors flex-shrink-0 ml-3"
                              size={18}
                            />
                          </div>
                        </a>
                      ) : (
                        <div className="p-4">
                          <div className="flex items-center gap-3">
                            {/* प्लेटफॉर्म आइकन */}
                            {platformObj ? (
                              <div className="flex-shrink-0">
                                <PlatformIcon platform={platformObj} />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-400 flex items-center justify-center text-white font-bold flex-shrink-0">
                                {season.season_number}
                              </div>
                            )}
                            
                            <div className="flex-1">
                              {/* प्लेटफॉर्म का नाम या सीज़न शीर्षक */}
                              <div className="font-bold text-gray-900 dark:text-white text-base">
                                {platformName || `सीज़न ${season.season_number}`}
                              </div>
                              
                              {/* सीज़न संख्या (यदि प्लेटफॉर्म दिखाया गया है) */}
                              {platformName && (
                                <div className="text-xs text-gray-500 mt-0.5">
                                  सीज़न {season.season_number}
                                </div>
                              )}
                              
                              {/* देखने की स्थिति */}
                              {season.watch_status && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 italic mt-0.5">
                                  {season.watch_status === 'Available' ? 'उपलब्ध' : season.watch_status === 'Coming Soon' ? 'जल्द आ रहा है' : season.watch_status}
                                </div>
                              )}
                              
                              {/* एपिसोड की संख्या */}
                              {season.season_episodes && (
                                <div className="text-[10px] text-gray-400 mt-1">
                                  {season.season_episodes} एपिसोड
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* पुरस्कार */}
          {awards.length > 0 && (
            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="text-yellow-600 dark:text-yellow-500" size={20} />
                पुरस्कार और सम्मान
              </h3>
              <div className="space-y-3">
                {awards.map((award, index) => {
                  const isWon = award.won;
                  let winnerName = award.winnerName || award.name;

                  return (
                    <div key={index} className={`rounded-lg p-3 border transition-all duration-300 ${isWon
                      ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/10 dark:to-amber-900/10 border-yellow-200 dark:border-yellow-700'
                      : 'bg-gray-50 dark:bg-neutral-800 border-gray-200 dark:border-neutral-700'
                      }`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden ${isWon
                          ? 'bg-gradient-to-br from-yellow-500 to-yellow-600'
                          : 'bg-gray-400 dark:bg-neutral-600'
                          }`}>
                          {isWon ? (
                            <img
                              src="https://www.shutterstock.com/image-vector/trophy-cup-gold-golden-icon-260nw-2721620449.jpg"
                              alt="विजेता ट्रॉफी"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <img
                              src="https://www.shutterstock.com/image-vector/vector-trophy-icon-silhouette-symbol-260nw-2563922069.jpg"
                              alt="नामांकित ट्रॉफी"
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="text-xs font-bold text-pink-500 uppercase tracking-wide mb-0.5">
                            {award.organization}
                            {award.year && <span className="text-gray-400 ml-1">• {award.year}</span>}
                          </div>

                          {award.category && (
                            <div className="font-bold text-gray-900 dark:text-white text-sm leading-tight mb-0.5">
                              {award.category}
                            </div>
                          )}

                          <div className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                            <span>{winnerName}</span>
                          </div>

                          <div className="mt-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ${isWon
                              ? 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800'
                              : 'bg-gray-50 text-gray-500 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700'
                              }`}>
                              {isWon ? <Award size={10} /> : null}
                              {award.type || (isWon ? 'जीता' : 'नामांकित')}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* मध्य - मुख्य सामग्री - मोबाइल: पहला, डेस्कटॉप: दूसरा */}
      <div className="order-1 lg:order-2 flex-1 space-y-8 pb-12">
        {/* शीर्षक और बुनियादी जानकारी */}
        <div className="hidden lg:block space-y-3">
          <h1 className="text-[20px] sm:text-[24px] lg:text-[34px] font-black leading-tight text-gray-900 dark:text-white">
            {webseries?.title}
          </h1>

          <div className="inline-block bg-purple-500 text-white text-xs px-3 py-1.5 rounded-md font-bold uppercase tracking-wide">
            वेब सीरीज • {webseries?.seasonNumber} सीज़न{webseries?.seasonNumber > 1 ? '' : ''}
            {webseries?.running_status && ` • ${webseries.running_status === 'Running' ? 'चल रही है' : webseries.running_status === 'Completed' ? 'समाप्त' : webseries.running_status}`}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border">
              <Globe size={18} />
              <span>{webseries?.country || "N/A"}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-600">
              <span className="text-xs bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border">
                {webseries?.age_rating || "N/A"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-gray-600 text-sm bg-gray-100 text-gray-800 px-2.5 py-1 rounded-full border">
              <Users size={18} />
              {(() => {
                const languageArray = Array.isArray(webseries?.languages) ? webseries.languages : [];
                const languageNames = languageArray.map(l => l?.language || l?.name || l?.title).filter(Boolean);

                if (languageNames.length === 0) {
                  return <span>N/A</span>;
                }

                if (languageNames.length <= 2 || showAllLanguages) {
                  return (
                    <>
                      <span>{languageNames.join(", ")}</span>
                      {languageNames.length > 2 && (
                        <button
                          onClick={() => setShowAllLanguages(false)}
                          className="ml-1 text-xs text-pink-500 hover:text-pink-600 font-semibold flex items-center gap-1"
                        >
                          <ChevronUp size={14} />
                          <span>कम</span>
                        </button>
                      )}
                    </>
                  );
                } else {
                  const displayLanguages = languageNames.slice(0, 2).join(", ");
                  const remainingCount = languageNames.length - 2;

                  return (
                    <>
                      <span>{displayLanguages}</span>
                      <button
                        onClick={() => setShowAllLanguages(true)}
                        className="flex items-center gap-1 ml-1 text-xs font-semibold text-pink-500 hover:text-pink-600"
                      >
                        <span>+{remainingCount}</span>
                        <ChevronDown size={14} />
                      </button>
                    </>
                  );
                }
              })()}
            </div>
          </div>

          {/* शैलियाँ */}
{genres && genres.length > 0 && (
  <div className="flex flex-wrap items-center gap-1">
    <span className="text-sm font-medium">शैलियाँ:</span>
    <div className="flex flex-wrap items-center gap-1">
      {webseries.genres.map((genre, i) => (
        <span key={i} className="text-pink-600 dark:text-pink-400 font-medium text-xs">
          {genre.name}
          {i < genres.length - 1 && <span className="text-gray-500 dark:text-gray-400 mx-0.5">,</span>}
        </span>
      ))}
    </div>
  </div>
)}

          {/* रेटिंग और मेटा */}
          <div className="flex flex-wrap gap-4 text-base text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>{releaseDate || "N/A"}</span>
            </div>
            {webseries?.rating && (
              <div className="flex items-center gap-2">
                <Star size={18} className="text-yellow-400 fill-current" />
                <span>{ratingValue}/10</span>
              </div>
            )}
          </div>
        </div>

        {/* विवरण अनुभाग */}
        {webseries?.description && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h2 className="text-xl font-bold mb-4">विवरण</h2>

            <div
              className={`relative overflow-hidden transition-[max-height] duration-500 ${showFullDesc ? "max-h-[3000px]" : "max-h-40"
                }`}
            >
              <article className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {webseries.description}
                </ReactMarkdown>
              </article>

              {!showFullDesc && (
                <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
              )}
            </div>

            {webseries.description.length > 250 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-4 text-sm font-semibold text-pink-500 hover:text-pink-600"
              >
                {showFullDesc ? "कम पढ़ें ▲" : "और पढ़ें ▼"}
              </button>
            )}
          </div>
        )}

        {/* सीज़न अनुभाग */}
        {seasonsData.length > 0 && (
          <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
              <Clock size={20} className="text-pink-500" />
              सीज़न और एपिसोड
            </h3>

            <div className="space-y-0">
              {seasonsData.map((season, index) => (
                <CompactSeasonItem
                  key={season.id || index}
                  season={season}
                  isLast={index === seasonsData.length - 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* कलाकार अनुभाग */}
        {cast.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Users className="text-gray-900 dark:text-white" size={22} />
              मुख्य कलाकार
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 bg-[#f6f6f6] p-5 rounded-2xl dark:bg-gray-800">
              {(showFullCast ? cast : cast.slice(0, 6)).map((role, i) => {
                const avatarUrl = safeImageUrl(
  role?.avatar?.url ||
  role?.Avatar?.url ||
  role?.celebrity?.avatar?.url
);

                const characterName = role.characterName || "अभिनेता";
                const actorName = role.name || "कलाकार सदस्य";

                return (
                  <div key={i} className="group">
                    <div className="flex flex-col items-center bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-gray-300 dark:border-neutral-700 hover:shadow-md hover:-translate-y-0.5 transition-all">
                      <div className="mb-2">
                        {role.celebrity ? (
                          <Link href={`/celebrities/${role.celebrity.slug}`} className="block">
                            {avatarUrl ? (
                              <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700 group-hover:border-pink-300">
                                <Image
                                  src={avatarUrl}
                                  alt={characterName}
                                  fill
                                  sizes="64px"
                                  className="object-cover group-hover:scale-110 transition-transform"
                                />
                              </div>
                            ) : (
                              <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                                <User size={26} className="text-gray-500" />
                              </div>
                            )}
                          </Link>
                        ) : (
                          avatarUrl ? (
                            <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700 group-hover:border-pink-300">
                              <Image
                                src={avatarUrl}
                                alt={characterName}
                                fill
                                sizes="64px"
                                className="object-cover group-hover:scale-110 transition-transform"
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                              <User size={26} className="text-gray-500" />
                            </div>
                          )
                        )}
                      </div>
                      <div className="text-center">
                        <span className="font-semibold text-[13px] text-gray-900 dark:text-white block line-clamp-2">
                          {characterName}
                        </span>
                        {role.celebrity?.slug ? (
                          <Link href={`/celebrities/${role.celebrity.slug}`} className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 hover:text-pink-500 block">
                            {actorName}
                          </Link>
                        ) : (
                          <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                            {actorName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {cast.length > 6 && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowFullCast(!showFullCast)}
                  className="text-[12px] font-semibold text-pink-500 hover:underline"
                >
                  {showFullCast
                    ? "कम कलाकार देखें"
                    : `और कलाकार देखें (${cast.length})`}
                </button>
              </div>
            )}
          </div>
        )}

        {/* क्रू अनुभाग */}
        {crew.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
            <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Film size={22} />
              क्रू
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 bg-[#f6f6f6] p-5 rounded-2xl dark:bg-gray-800">
              {(showFullCrew ? crew : crew.slice(0, 6)).map((member, i) => {
               const avatarUrl = safeImageUrl(
  member?.avatar?.url ||
  member?.Avatar?.url ||
  member?.celebrity?.avatar?.url
);
                const memberName = member.name || member.role || "क्रू सदस्य";
                const roleName = member.characterName || member.role || "क्रू";

                return (
                  <div key={i}>
                    <div className="group">
                      <div className="p-2.5 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-neutral-700 hover:shadow-md hover:-translate-y-0.5 transition-all">
                        <div className="flex flex-col items-center text-center">
                          <div className="mb-2">
                            {member.celebrity ? (
                              <Link href={`/celebrities/${member.celebrity.slug}`} className="block">
                                {avatarUrl ? (
                                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700 group-hover:border-pink-300">
                                    <Image
                                      src={avatarUrl}
                                      alt={memberName}
                                      fill
                                      sizes="64px"
                                      className="object-cover group-hover:scale-110 transition-transform"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                                    <User size={26} className="text-gray-500" />
                                  </div>
                                )}
                              </Link>
                            ) : (
                              avatarUrl ? (
                                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200 dark:border-neutral-700 group-hover:border-pink-300">
                                  <Image
                                    src={avatarUrl}
                                    alt={memberName}
                                    fill
                                    sizes="64px"
                                    className="object-cover group-hover:scale-110 transition-transform"
                                  />
                                </div>
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-neutral-800 flex items-center justify-center">
                                  <User size={26} className="text-gray-500" />
                                </div>
                              )
                            )}
                          </div>
                          {member.celebrity?.slug ? (
                            <Link href={`/celebrities/${member.celebrity.slug}`} className="font-semibold text-[13px] text-gray-900 dark:text-white line-clamp-2 hover:text-pink-500">
                              {memberName}
                            </Link>
                          ) : (
                            <div className="font-semibold text-[13px] text-gray-900 dark:text-white line-clamp-2">
                              {memberName}
                            </div>
                          )}
                          <div className="text-[10px] mt-0.5 uppercase tracking-wide font-semibold text-pink-500 line-clamp-1">
                            {roleName}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {crew.length > 6 && (
              <div className="mt-5 text-center">
                <button
                  onClick={() => setShowFullCrew(!showFullCrew)}
                  className="text-[12px] font-semibold text-pink-500 hover:underline"
                >
                  {showFullCrew
                    ? "कम क्रू देखें"
                    : `और क्रू देखें (${crew.length})`}
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* आधिकारिक ट्रेलर अनुभाग */}
        {webseries.trailer_id && (
          <div id="trailer-section" className="card-theme">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
              <Play className="text-pink-500" size={24} />
              आधिकारिक ट्रेलर
            </h2>

            <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
              {!isPlaying ? (
                <div
                  className="relative w-full h-full group cursor-pointer"
                  onClick={handlePlayTrailer}
                >
                  <Image
                    src={getYouTubeThumbnail(webseries.trailer_id)}
                    alt={`${webseries.title} ट्रेलर`}
                    fill
                    className="object-cover"
                  />

                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-20 h-20 bg-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                      <Play className="text-white ml-1" size={32} fill="white" />
                    </div>
                  </div>

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="bg-black/70 backdrop-blur-sm px-4 py-3 rounded-lg">
                      <p className="text-white font-bold">
                        {webseries.title} | आधिकारिक ट्रेलर
                      </p>
                      <p className="text-gray-300 text-xs mt-1">
                        यूट्यूब पर देखने के लिए क्लिक करें
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {trailerError ? (
                    <div className="flex flex-col items-center justify-center h-full text-white">
                      <AlertCircle size={40} className="mb-3 text-pink-500" />
                      <p className="text-lg mb-2">ट्रेलर लोड नहीं हो पाया</p>
                      <button
                        onClick={() =>
                          window.open(
                            `https://www.youtube.com/watch?v=${webseries.trailer_id}`,
                            "_blank"
                          )
                        }
                        className="px-5 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 text-sm"
                      >
                        <Play size={18} />
                        यूट्यूब पर देखें
                      </button>
                    </div>
                  ) : (
                    <iframe
                      ref={iframeRef}
                      src={`https://www.youtube.com/embed/${webseries.trailer_id}?autoplay=1&rel=0`}
                      title={`${webseries.title} आधिकारिक ट्रेलर`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      onError={handleIframeError}
                      className="w-full h-full"
                    />
                  )}
                </>
              )}
            </div>

            {!isPlaying && (
              <div className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                <div className="flex items-center justify-center gap-2">
                  <Maximize2 size={16} />
                  <span>सर्वोत्तम अनुभव के लिए फुल स्क्रीन में देखें</span>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* समीक्षा अनुभाग */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 flex items-center gap-3">
            <Star className="text-yellow-400" size={22} />
            उपयोगकर्ता समीक्षाएँ ({reviews.length})
          </h2>

          <div className="space-y-8">
            {/* लॉगिन प्रॉम्प्ट मोडल */}
            {showLoginPrompt && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-6 max-w-md w-full">
                  <h3 className="text-xl font-bold mb-4">लॉगिन आवश्यक</h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-6">
                    इस वेब सीरीज के लिए समीक्षा सबमिट करने के लिए कृपया लॉगिन करें।
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowLoginPrompt(false)}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      रद्द करें
                    </button>
                    <button
                      onClick={pinkirectToLogin}
                      className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition"
                    >
                      लॉगिन
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* समीक्षा फॉर्म */}
            <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-3 sm:p-5">
              <h3 className="text-sm sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2">
                <MessageSquare size={16} className="text-pink-500" />
                इस वेब सीरीज को रेट करें
              </h3>

              {reviewSuccess && (
                <div className="mb-3 p-2.5 bg-green-500 text-white rounded-lg text-xs sm:text-sm font-bold text-center animate-pulse">
                  ✓ धन्यवाद! समीक्षा सफलतापूर्वक सबमिट हो गई।
                </div>
              )}

              {!user ? (
                <div className="text-center py-3">
                  <p className="text-xs sm:text-sm text-gray-500 mb-2 sm:mb-3">
                    समीक्षा लिखने के लिए कृपया लॉगिन करें
                  </p>
                  <button
                    onClick={pinkirectToLogin}
                    className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-black transition"
                  >
                    समीक्षा के लिए लॉगिन करें
                  </button>
                </div>
              ) : (
                <form onSubmit={handleReviewSubmit} className="space-y-3 sm:space-y-4">
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 pb-1">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => setReviewForm({ ...reviewForm, rating: n })}
                        className="p-0.5 sm:p-0 transition-transform hover:scale-110"
                      >
                        <Star
                          size={24}
                          className={
                            n <= reviewForm.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300 dark:text-gray-600"
                          }
                        />
                      </button>
                    ))}
                    <span className="ml-1 sm:ml-2 font-black text-pink-600 text-sm">
                      {reviewForm.rating}/5
                    </span>
                  </div>

                  <textarea
                    value={reviewForm.comment}
                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                    placeholder="इस वेब सीरीज के बारे में अपने विचार साझा करें..."
                    rows={3}
                    className="w-full px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-pink-500 transition"
                    requipink
                  />

                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-2.5 sm:py-3 rounded-lg flex items-center justify-center gap-2 transition shadow-md text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReview ? (
                      <>
                        <Loader className="animate-spin" size={16} />
                        सबमिट हो रहा है...
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        समीक्षा पोस्ट करें
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

            {/* समीक्षा सूची */}
            <div className="space-y-4">
              {reviews.length > 0 ? (
                <>
                  {(showAllReviews ? reviews : reviews.slice(0, 5)).map((review) => (
                    <div key={review.documentId || review.id} className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold text-xs uppercase">
                            {review.user?.username?.[0] || 'A'}
                          </div>
                          <div>
                            <span className="font-bold text-sm block">
                              {review.user?.username || 'अनाम'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {review.createdAt ? new Date(review.createdAt).toLocaleDateString('hi-IN', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              }) : ''}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={14}
                              className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                          <span className="text-xs font-bold ml-1">{review.rating}/5</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-2">
                        "{review.comment}"
                      </p>

                      {user?.documentId === review.user?.documentId && (
                        <button
                          onClick={() => handleDeleteReview(review.documentId)}
                          className="text-xs text-pink-500 hover:text-pink-700 font-medium flex items-center gap-1 transition-colors"
                        >
                          <Trash2 size={14} />
                          मेरी समीक्षा हटाएं
                        </button>
                      )}
                    </div>
                  ))}

                  {reviews.length > 5 && (
                    <button
                      onClick={() => setShowAllReviews(!showAllReviews)}
                      className="w-full py-2 text-sm font-semibold text-pink-500 hover:text-pink-600 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                      {showAllReviews ? 'कम समीक्षाएँ दिखाएं' : `सभी ${reviews.length} समीक्षाएँ दिखाएं`}
                    </button>
                  )}
                </>
              ) : (
                <div className="text-center py-8 bg-gray-50 dark:bg-gray-800/60 rounded-xl border border-gray-200 dark:border-gray-700">
                  <MessageSquare className="mx-auto text-gray-400 mb-2" size={32} />
                  <p className="text-sm text-gray-500">अभी कोई समीक्षा नहीं। समीक्षा करने वाले पहले व्यक्ति बनें!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* दायां साइडबार - मोबाइल: तीसरा, डेस्कटॉप: तीसरा */}
      <div className="order-3 w-full lg:w-80 flex-shrink-0">
        <div className="sticky top-28 space-y-6 pb-12">
          {/* संबंधित लेख */}
          {articles.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="text-blue-500" size={20} />
                संबंधित लेख
              </h3>

              <div className="space-y-3 bg-[#f6f6f6] p-1 rounded-2xl dark:bg-gray-800">
                {articles.slice(0, 4).map((article) => {
                  const articleImageUrl = article.hero_image?.formats?.thumbnail?.url ||
                    article.hero_image?.formats?.small?.url ||
                    article.hero_image?.formats?.medium?.url ||
                    article.hero_image?.url;

                  return (
                    <Link
                      key={article.id}
                      href={`/${article.mainCategory}/${article.slug}`}
                      className="group flex gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="relative w-24 h-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-200 dark:bg-gray-700">
                        {articleImageUrl ? (
                          <Image
                            src={articleImageUrl}
                            alt={article.title || "लेख थंबनेल"}
                            fill
                            sizes="96px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film className="text-gray-400" size={24} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-500 transition-colors">
                          {article.title || "शीर्षक रहित"}
                        </h4>

                        
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* समान वेब सीरीज */}
          {similar.length > 0 && (
            <section className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6">
              <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white flex items-center gap-2">
                <Film className="text-pink-500" size={20} />
                समान वेब सीरीज
              </h3>

              <div className="space-y-3 bg-[#f6f6f6] p-1 rounded-2xl dark:bg-gray-800">
                {similar.slice(0, 4).map((item) => {
                  const posterUrl = safeImageUrl(item?.poster?.url || item?.poster);

                  return (
                    <Link
                      key={item.id || item._key}
                      href={`/${ServerCategory}/web-series/${item.slug}`}
                      className="group flex gap-3 p-2 bg-white dark:bg-gray-800 rounded-lg hover:shadow-md transition-all"
                    >
                      <div className="relative w-16 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-neutral-900">
                        {posterUrl ? (
                          <Image
                            src={posterUrl}
                            alt={item.title}
                            fill
                            sizes="64px"
                            className="object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-300 dark:bg-neutral-700">
                            <Film className="text-gray-400" size={22} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors line-clamp-2">
                          {item.title}
                        </h4>

                       
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  </div>
</div>
    </div>
  );
} 