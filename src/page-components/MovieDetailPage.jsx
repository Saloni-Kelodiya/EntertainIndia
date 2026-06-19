"use client";
import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft, Star, Clock, Calendar, Play, Film, User, Users,
  Globe, Camera, DollarSign, TrendingUp, BarChart, Award, Eye,
  Ticket, AlertCircle, Maximize2, ExternalLink, Video, Send, MessageSquare,
  Loader, Trash2, LogIn, MonitorPlay, IndianRupee, Wallet, Trophy, 
  TrendingUp as TrendingUpIcon, Calendar as CalendarIcon, Coins, PiggyBank,Info
} from "lucide-react";
import { movieReviewsAPI } from '../lib/api';
import { MEDIA_URL } from '../lib/constants';
import { useStore } from '../store/useStore';
import { formatDate } from '../lib/helpers';
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

// ✅ PLATFORM ICONS CONFIG
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

const getPlatformLogo = (platformName) => {
  if (!platformName) return null;
  const name = platformName.toLowerCase().trim();

  if (PLATFORM_ICONS[name]) return PLATFORM_ICONS[name];

  if (name.includes('netflix')) return PLATFORM_ICONS['netflix'];
  if (name.includes('prime') || name.includes('amazon')) return PLATFORM_ICONS['amazon prime'];
  if (name.includes('hotstar') || name.includes('disney')) return PLATFORM_ICONS['hotstar'];
  if (name.includes('zee')) return PLATFORM_ICONS['zee5'];
  if (name.includes('sony') || name.includes('liv')) return PLATFORM_ICONS['sony liv'];
  if (name.includes('jio')) return PLATFORM_ICONS['jio cinema'];
  if (name.includes('youtube')) return PLATFORM_ICONS['youtube'];
  if (name.includes('apple')) return PLATFORM_ICONS['apple tv'];

  return null;
};

// ✅ Complete Genre mapping for Hindi display
const getHindiGenreName = (genre) => {
  if (!genre) return "";
  
  // English to Hindi mapping
  const genreMap = {
    // Action & Adventure
    "Action": "एक्शन",
    "Adventure": "साहसिक",
    "Epic": "महाकाव्य",
    "Heist": "लूटपाट",
    "Spy": "जासूसी",
    "SuperHero": "सुपरहीरो",
    "Superhero": "सुपरहीरो",
    "War": "युद्ध",
    
    // Comedy & Light
    "Comedy": "कॉमेडी",
    "Coming-of-Age": "प्रौढ़ता-आगमन",
    "Cooking Show": "कुकिंग शो",
    "Family": "परिवार",
    "Fashion": "फैशन",
    "Reality Television": "रियलिटी टेलीविजन",
    "Slice of Life": "जीवन का अंश",
    "Teen": "किशोर",
    "Youth": "युवा",
    
    // Drama & Emotional
    "Biography": "जीवनी",
    "Drama": "नाटक",
    "Romance": "रोमांस",
    "Romantic": "रोमांटिक",
    
    // Crime & Thriller
    "Crime": "अपराध",
    "Mystery": "रहस्य",
    "Political": "राजनीतिक",
    "Politics": "राजनीति",
    "Thriller": "रोमांचक",
    "Psychological": "मनोवैज्ञानिक",
    
    // Horror & Supernatural
    "Horror": "डरावनी",
    "Supernatural": "अलौकिक",
    "Survival": "उत्तरजीविता",
    
    // Sci-Fi & Fantasy
    "Animation": "एनीमेशन",
    "Fantasy": "काल्पनिक",
    "Mythology": "पौराणिक",
    "Science Fiction": "विज्ञान कथा",
    "Sci-Fi": "साइंस फिक्शन",
    
    // Social & Historical
    "Historical": "ऐतिहासिक",
    "Social": "सामाजिक",
    "Social Commentary": "सामाजिक टिप्पणी",
    
    // Music & Entertainment
    "Music": "संगीत",
    "Musical": "संगीतमय",
    
    // Sports
    "Sports": "खेल",
    
    // Devotional
    "Devotional": "भक्तिपूर्ण",
    
    // Hindi entries (already in Hindi)
    "राजनीति": "राजनीति",
    "सामाजिक": "सामाजिक",
    "ऐतिहासिक": "ऐतिहासिक",
    "रोमांस": "रोमांस",
    "ड्रामा": "नाटक",
    "कॉमेडी": "कॉमेडी",
    "एक्शन": "एक्शन",
    "युद्ध": "युद्ध",
    "थ्रिलर": "रोमांचक",
    "हॉरर": "डरावनी",
    "साइंस फिक्शन": "साइंस फिक्शन",
    "रोमांटिक": "रोमांटिक",
    "परिवार": "परिवार",
  };
  
  // Check if genre exists in map
  if (genreMap[genre]) {
    return genreMap[genre];
  }
  
  // Handle case-insensitive matching
  const lowerGenre = genre.toLowerCase();
  for (const [key, value] of Object.entries(genreMap)) {
    if (key.toLowerCase() === lowerGenre) {
      return value;
    }
  }
  
  // Return original if no mapping found
  return genre;
};
// ✅ Language Mapping Function - English to Hindi
export const getHindiLanguageName = (englishName) => {
  const languageMap = {
    // Indian Languages
    "Hindi": "हिंदी",
    "hindi": "हिंदी",
    "Tamil": "तमिल",
    "tamil": "तमिल",
    "Telugu": "तेलुगु",
    "telugu": "तेलुगु",
    "Kannada": "कन्नड़",
    "kannada": "कन्नड़",
    "Malayalam": "मलयालम",
    "malayalam": "मलयालम",
    "Marathi": "मराठी",
    "marathi": "मराठी",
    'Marwari': 'मारवाड़ी',
    'marwari': 'मारवाड़ी',
    "Bengali": "बंगाली",
    "bengali": "बंगाली",
    "Marathi": "मराठी",
    "marathi": "मराठी",
    "Gujarati": "गुजराती",
    "gujarati": "गुजराती",
    "Punjabi": "पंजाबी",
    "punjabi": "पंजाबी",
    "Urdu": "उर्दू",
    "urdu": "उर्दू",
    "Sanskrit": "संस्कृत",
    "sanskrit": "संस्कृत",
    "Bhojpuri": "भोजपुरी",
    "bhojpuri": "भोजपुरी",
    "Odia": "ओड़िया",
    "odia": "ओड़िया",
    "Assamese": "असमिया",
    "assamese": "असमिया",
    
    // Foreign Languages
    "English": "अंग्रेजी",
    "english": "अंग्रेजी",
    "Spanish": "स्पेनिश",
    "spanish": "स्पेनिश",
    "French": "फ्रेंच",
    "french": "फ्रेंच",
    "German": "जर्मन",
    "german": "जर्मन",
    "Italian": "इतालवी",
    "italian": "इतालवी",
    "Portuguese": "पुर्तगाली",
    "portuguese": "पुर्तगाली",
    "Russian": "रूसी",
    "russian": "रूसी",
    "Japanese": "जापानी",
    "japanese": "जापानी",
    "Chinese": "चीनी",
    "chinese": "चीनी",
    "Korean": "कोरियाई",
    "korean": "कोरियाई",
    "Arabic": "अरबी",
    "arabic": "अरबी",
    
    // Other
    "Multilingual": "बहुभाषी",
    "multilingual": "बहुभाषी",
    "Dubbed": "डबbed",
    "dubbed": "डबbed",
  };
  
  if (!englishName) return "";
  
  // Return Hindi name if mapping exists, otherwise return original
  return languageMap[englishName] || englishName;
};
// ✅ HOVER POPUP CARD COMPONENT - Small Portrait Design
const HoverPopupCard = ({ children, name, role, imageUrl, slug, type = 'cast' }) => {
  const [isHovepink, setIsHovepink] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef(null);
  const timeoutRef = useRef(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 5
      });
    }
    setIsHovepink(true);
  };

  const handleMouseLeave = () => {
  setIsHovepink(false);
};

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const Content = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden w-56">
      <div className="relative h-40 bg-gradient-to-r from-pink-500 to-pink-600">
        {imageUrl ? (
          <Image 
            src={imageUrl} 
            alt={name || "सेलिब्रिटी"} 
            fill 
            className="object-cover object-top" 
            sizes="224px"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-900">
            <User size={40} className="text-white/40" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        {slug && (
          <Link 
            href={`/celebrities/${slug}`}
            className="absolute bottom-2 right-2 bg-black/60 hover:bg-pink-500 backdrop-blur rounded-md p-1.5 transition-all duration-200 hover:scale-105"
          >
            <ExternalLink size={12} className="text-white" />
          </Link>
        )}
      </div>
      
      <div className="p-2.5">
        <h4 className="font-bold text-gray-900 dark:text-white text-xs line-clamp-1 text-center">
          {name || "अज्ञात"}
        </h4>
        
        {type === 'crew' && role && (
          <p className="text-[9px] font-semibold text-pink-500 dark:text-pink-400 mt-0.5 uppercase tracking-wide text-center">
            {role}
          </p>
        )}
        
        {type === 'cast' && role && (
          <p className="text-[9px] text-gray-500 dark:text-gray-400 mt-0.5 italic text-center line-clamp-1">
            {role} के रूप में
          </p>
        )}
        
        {slug && (
          <Link 
            href={`/celebrities/${slug}`}
            className="mt-2 block text-center text-[10px] font-semibold text-white bg-pink-500 hover:bg-pink-600 py-1 rounded-md transition-colors"
          >
            प्रोफाइल देखें
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <div 
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative inline-block w-full"
    >
      {children}
      {isHovepink && (
        <div 
          className="fixed z-50 animate-fadeInUp"
          style={{
            left: position.x - 112,
            top: position.y - 230,
          }}
        >
          <Content />
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1.5 w-3 h-3 bg-white dark:bg-gray-800 border-r border-b border-gray-200 dark:border-gray-700 rotate-45"></div>
        </div>
      )}
    </div>
  );
};

// ✅ COMPONENT START
export default function MovieDetailPage({ serverSlug, serverCategory, initialData, initialReviews }) {
  const [showFullDesc, setShowFullDesc] = useState(false);
  const router = useRouter();
  const { user, token, loadAuthFromStorage } = useStore();

  const [movie] = useState(initialData);
  const [reviews, setReviews] = useState(initialReviews || []);
  const [relatedArticles] = useState(initialData?.articles || []);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [trailerError, setTrailerError] = useState(false);
  const iframeRef = useRef(null);

  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showAllSimilar, setShowAllSimilar] = useState(false);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);
  const [showAllCrew, setShowAllCrew] = useState(false);
  const [showCaption, setShowCaption] = useState(false);
   const posterCaption = movie?.poster?.caption || movie?.title || "Movie poster";

  useEffect(() => {
    loadAuthFromStorage();
  }, [loadAuthFromStorage]);

  const getImageUrl = (img) => {
    if (!img) return null;
    if (typeof img === 'string') return img.startsWith('http') ? img : `${MEDIA_URL}${img}`;
    if (img.url) return img.url.startsWith('http') ? img.url : `${MEDIA_URL}${img.url}`;
    return null;
  };

  const getCategoryBadge = () => {
    if (!serverCategory) return null;
    const category = serverCategory.toLowerCase();
    
    if (category === 'bollywood') {
      return { text: "🎬 बॉलीवुड", color: "bg-purple-600", icon: "🎬" };
    } else if (category === 'hollywood') {
      return { text: "🎥 हॉलीवुड", color: "bg-blue-600", icon: "🎥" };
    } else if (category === 'tollywood') {
      return { text: "🎭 टॉलीवुड", color: "bg-orange-600", icon: "🎭" };
    } else if (category === 'bhojiwood') {
      return { text: "🎪 भोजीवुड", color: "bg-green-600", icon: "🎪" };
    } else if (category === 'ott') {
      return { text: "📺 ओटीटी", color: "bg-pink-600", icon: "📺" };
    } else if (category === 'tv') {
      return { text: "📡 टीवी शो", color: "bg-teal-600", icon: "📡" };
    }
    return { text: `🎬 ${serverCategory}`, color: "bg-gray-600", icon: "🎬" };
  };

  const handlePlayTrailer = () => { setIsPlaying(true); setTrailerError(false); };
  const handleIframeError = () => { setTrailerError(true); setIsPlaying(false); };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!user || !token) { setShowLoginPrompt(true); return; }
    if (!reviewForm.comment.trim()) { alert('कृपया अपनी समीक्षा लिखें'); return; }
    setSubmittingReview(true);
    try {
      const username = user?.username || user?.name || 'अज्ञात उपयोगकर्ता';
      const reviewData = { username, rating: reviewForm.rating, comment: reviewForm.comment };
      await movieReviewsAPI.create(movie.id, reviewData);
      const freshReviews = await movieReviewsAPI.getByMovie(movie.id);
      setReviews(freshReviews);
      setReviewSuccess(true);
      setReviewForm({ rating: 5, comment: '' });
      setTimeout(() => setReviewSuccess(false), 3000);
    } catch (err) {
      alert(`समीक्षा सबमिट करने में विफल: ${err.message}`);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewDocumentId) => {
    if (!window.confirm("क्या आप वाकई अपनी समीक्षा हटाना चाहते हैं?")) return;
    try {
      await movieReviewsAPI.delete(reviewDocumentId);
      const freshReviews = await movieReviewsAPI.getByMovie(movie.id);
      setReviews(freshReviews);
    } catch (err) {
      alert(`समीक्षा हटाने में विफल: ${err.message}`);
    }
  };

  const redirectToLogin = () => {
    router.push('/login?redirect=' + encodeURIComponent(window.location.pathname));
  };

  const getYouTubeThumbnail = (videoId) => `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;

  if (!movie || error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-800 text-xl font-bold mb-4">{error || "फ़िल्म नहीं मिली"}</p>
          <button onClick={() => router.push(`/${serverCategory || 'movies'}`)} className="px-6 py-2 bg-pink-500 rounded-lg text-white font-black">फ़िल्मों पर वापस जाएं</button>
        </div>
      </div>
    );
  }

  const backdropUrl = getImageUrl(movie.backdrop) || getImageUrl(movie.poster);
  const posterUrl = getImageUrl(movie.poster);
  const rating = movie.rating || 0;
  const releaseDate = movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString('hi-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : null;
  const categoryBadge = getCategoryBadge();
  const genresList = Array.isArray(movie.genres) ? movie.genres : [];
  const boxOfficeData = movie.boxOffice || {};
  const whereToWatch = Array.isArray(movie.whereToWatch) ? movie.whereToWatch : [];
  const cast = Array.isArray(movie.cast) ? movie.cast : [];
  const crewMembers = Array.isArray(movie.crew) ? movie.crew : [];

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">

   <div className="relative w-full aspect-[2/0.8] rounded-2xl mb-8 ">
  {backdropUrl ? (
    <Image
      src={backdropUrl}
      alt={movie.title || "फ़िल्म का बैकड्रॉप"}
      fill
      priority
      className="object-cover object-top "
    />
  ) : (
    <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-400" />
  )}

  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/10" />

  {/* वापस बटन */}
  <button
    onClick={() => router.back()}
    className="absolute top-4 left-4 z-30 flex items-center gap-2 text-white bg-black/60 backdrop-blur px-3 py-2 rounded-lg text-xs sm:text-sm"
  >
    <ArrowLeft size={16} /> वापस
  </button>

 
 
</div>
 {/* मोबाइल पोस्टर - बैकड्रॉप के नीचे (समाधान 1) */}
{posterUrl && (
  <div className="block lg:hidden px-4 -mt-16 mb-6 relative z-40">
    <div className="flex flex-col">
      {/* पोस्टर - सेंटर में ऊपर */}
      <div 
        className="relative mx-auto mb-3 group"
        onMouseLeave={() => setShowCaption(false)}
      >
        {/* पोस्टर इमेज */}
        <div className="relative w-[120px] sm:w-[140px] aspect-[2/3] rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-800 mx-auto bg-gray-900">
          <Image
            src={posterUrl}
            alt={movie.title || "Movie poster"}
            fill
            sizes="140px"
            className="object-cover"
          />
        </div>
        
        {/* इन्फो बटन */}
        <div 
          className="absolute -bottom-1.5 -left-1.5 z-40 bg-pink-600 text-white rounded-full p-1.5 shadow-lg cursor-pointer transition-all duration-200 hover:bg-pink-700"  
          onMouseEnter={() => setShowCaption(true)}
        >
          <Info size={12} />
        </div>

        {/* कैप्शन चिप */}
        {showCaption && (
          <div className="absolute bottom-2 left-10 z-50">
            <div className="bg-white dark:bg-gray-800 text-[10px] sm:text-xs rounded-lg px-3 py-1.5 shadow-xl border border-gray-200 dark:border-gray-700 whitespace-nowrap">
              <span className="font-medium text-gray-500 mr-1">स्रोत:</span>
              <span>{posterCaption}</span>
            </div>
          </div>
        )}
      </div>

      {/* सारी जानकारी नीचे - पूरी चौड़ाई में */}
      <div className="w-full ">
        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white text-center mb-1">
          {movie.title}
        </h2>
        
        <div className="text-center">
          <div className="inline-block bg-purple-500 text-white text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wide">
            {movie.type || "MOVIE"} • {movie.releaseYear || "N/A"}
          </div>
        </div>
        
        {/* रो 1: कंट्री, एज रेटिंग, रेटिंग, ड्यूरेशन */}
        <div className="flex flex-wrap justify-center items-center gap-2">
          {movie.country && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
              <Globe size={14} />
              <span>{movie.country}</span>
            </div>
          )}
          
          {movie.age_rating && (
            <div className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
              {movie.age_rating}
            </div>
          )}
          
          {rating > 0 && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
              <Star size={14} className="text-yellow-400 fill-current" />
              <span>{rating}/10</span>
            </div>
          )}
          
          {movie.releaseDate && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
              <Calendar size={14} />
              <span>{movie.releaseDate}</span>
            </div>
          )}
          
          {movie.duration && (
            <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full text-xs">
              <Clock size={14} />
              <span>{movie.duration}</span>
            </div>
          )}
        </div>
        
        {/* भाषाएँ */}
        {movie.languages && movie.languages.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-1.5">
            <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">भाषाएँ:</span>
            <div className="flex flex-wrap items-center gap-1">
              {movie.languages.map((lang, idx) => (
                <span key={idx} className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                  {getHindiLanguageName(lang)}
                  {idx < movie.languages.length - 1 ? "," : ""}
                  
                </span>
              ))}
            </div>
          </div>
        )}

       {/* शैली/जीनर */}
{genresList && genresList.length > 0 && (
  <div className="flex flex-wrap items-center justify-center gap-1.5">
    <span className="font-bold text-gray-700 dark:text-gray-300 text-xs">शैली:</span>
    <div className="flex flex-wrap items-center gap-1">
      {genresList.map((genre, i) => (
        <span key={i} className="text-pink-600 dark:text-pink-400 font-medium text-xs">
          {typeof genre === 'object' ? getHindiGenreName(genre.name || genre) : getHindiGenreName(genre)}
          {i < genresList.length - 1 ? "," : ""}
        </span>
      ))}
    </div>
  </div>
)}
      </div>
    </div>
  </div>
)}
      {/* MOVIE CONTENT SECTION */}
      <div className="relative z-10">
        <div className="lg:px-4">
          <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 mt-5">

            {/* LEFT SIDEBAR - Poster & Where to Watch (Desktop only) */}
            <div className="hidden lg:block w-full lg:w-80 flex-shrink-0 mt-6 lg:-mt-20">
              <div className="lg:sticky md:top-24 space-y-5">
                {/* DESKTOP POSTER */}
               <div className="relative aspect-[2/3] rounded-xl overflow-hidden shadow-2xl bg-gray-100 dark:bg-neutral-800">
                 {posterUrl ? (
                   <div 
                     className="relative group w-full h-full"
                     onMouseLeave={() => setShowCaption(false)}
                   >
                     <Image
                       src={posterUrl}
                       alt={movie.title || "Movie poster"}
                       fill
                       className="object-cover"
                     />
                     
                     {/* Small Info Button - Top Right Corner */}
                     <div className="absolute bottom-2 left-2 z-40 bg-white/90 hover:bg-white dark:bg-gray-800/90 dark:hover:bg-gray-800 text-pink-600 dark:text-pink-400 rounded-full p-1.5 shadow-lg transition-all duration-200 cursor-pointer border border-gray-200 dark:border-gray-700"  onMouseEnter={() => setShowCaption(true)}>
                       <Info size={14} />
                     </div>
               
                     {/* Small Caption Chip - appears on hover - opens next to i button (to the left) */}
                    {showCaption && (
                 <div className="absolute bottom-2 left-10 z-50 max-w-xs">
                   <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg px-3 py-1.5 shadow-lg border border-gray-200 dark:border-gray-700">
                     <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">छवि स्रोत:</span>
                     <span>
                       {posterCaption}
                     </span>
                   </div>
                 </div>
               )}
                   </div>
                 ) : (
                   <div className="flex h-full items-center justify-center text-gray-500">
                     <Film size={64} />
                   </div>
                 )}
               </div>
               
                {/* Watch Trailer Button */}
                {movie.trailer_id && (
                  <button
                    onClick={() => {
                      const trailerSection = document.getElementById('trailer-section');
                      if (trailerSection) {
                        trailerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => handlePlayTrailer(), 800);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    <Play size={20} fill="white" />
                    ट्रेलर देखें
                  </button>
                )}

                {/* WHERE TO WATCH SECTION */}
                {whereToWatch.length > 0 && (
                  <WhereToWatchSection whereToWatch={whereToWatch} getPlatformLogo={getPlatformLogo} />
                )}

                {/* AWARDS & RECOGNITION SECTION */}
                <Awards awards={movie.award} />
              </div>
            </div>

            {/* MAIN CONTENT AREA - Mobile First Order */}
            <div className="order-1 lg:order-2 flex-1 space-y-6 lg:space-y-8 pb-12">
               {/* मोबाइल में टॉप पैडिंग - पोस्टर के नीचे ज्यादा स्पेस */}
  <div className="lg:hidden mt-20 sm:mt-28"></div>
              {/* Movie Title and Basic Info */}
             <div className="space-y-4 px-2 sm:px-0 hidden lg:block">
                <h2 className="text-[20px] sm:text-[24px] lg:text-[34px] font-black leading-tight text-gray-900 dark:text-white">
                  {movie.title}
                </h2>
                
                {movie.languages && movie.languages.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">भाषाएँ:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {movie.languages.map((lang, idx) => (
                        <span key={idx} className="text-blue-600 dark:text-blue-400 font-medium text-xs">
                          {getHindiLanguageName(lang)}
                          {idx < movie.languages.length - 1 ? " ·" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {genresList.length > 0 && (
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    <span className="font-bold text-gray-900 dark:text-white">शैली:</span>
                    <div className="flex flex-wrap items-center gap-1.5">
                      {genresList.map((genre, i) => (
                        <span key={i} className="text-pink-600 dark:text-pink-400 font-medium text-xs">
                          {typeof genre === 'object' ? getHindiGenreName(genre.name || genre) : getHindiGenreName(genre)}
                          {i < genresList.length - 1 ? " ·" : ""}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-base text-gray-600 dark:text-gray-300">
                  {rating > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="fill-yellow-400 text-yellow-400" size={18} />
                      <span className="font-bold">{rating}/10</span>
                    </div>
                  )}
                  {releaseDate && (
                    <div className="flex items-center gap-2">
                      <Calendar size={18} />
                      <span>{releaseDate}</span>
                    </div>
                  )}
                  {movie.duration && (
                    <div className="flex items-center gap-2">
                      <Clock size={18} />
                      <span>{movie.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== 1. DESCRIPTION - FIRST ON MOBILE ===== */}
              {movie.description && (
                <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
                  <h2 className="text-xl font-black mb-4 text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                    <Film className="text-pink-500" size={20} />
                    विवरण
                  </h2>

                  <div
                    className={`relative overflow-hidden transition-[max-height] duration-500 ${showFullDesc ? "max-h-[3000px]" : "max-h-40"}`}
                  >
                    <article className="prose prose-sm dark:prose-invert max-w-none !text-[14px] sm:!text-[16px] [&_p]:!text-[14px] sm:[&_p]:!text-[16px]">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {movie.description}
                      </ReactMarkdown>
                    </article>

                    {!showFullDesc && (
                      <div className="absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-white dark:from-gray-900 to-transparent" />
                    )}
                  </div>

                  {movie.description.length > 250 && (
                    <button
                      onClick={() => setShowFullDesc(!showFullDesc)}
                      className="mt-4 text-sm font-semibold text-pink-500 hover:text-pink-600"
                    >
                      {showFullDesc ? "कम पढ़ें ▲" : "और पढ़ें ▼"}
                    </button>
                  )}
                </div>
              )}

              {/* MOBILE SIDEBAR CONTENT */}
              <div className="lg:hidden space-y-6">
                {movie.trailer_id && (
                  <button
                    onClick={() => {
                      const trailerSection = document.getElementById('trailer-section');
                      if (trailerSection) {
                        trailerSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        setTimeout(() => handlePlayTrailer(), 800);
                      }
                    }}
                    className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 shadow-lg"
                  >
                    <Play size={20} fill="white" />
                    ट्रेलर देखें
                  </button>
                )}

                {whereToWatch.length > 0 && (
                  <WhereToWatchSection whereToWatch={whereToWatch} getPlatformLogo={getPlatformLogo} />
                )}

                <Awards awards={movie.award} />
              </div>

              {/* ===== 2. BOX OFFICE SECTION ===== */}
              {boxOfficeData && Object.keys(boxOfficeData).length > 0 && (
                <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
                  <h2 className="text-xl font-bold mb-5 flex items-center gap-3 text-gray-900 dark:text-white">
                    <DollarSign className="text-green-500" size={22} />
                    बॉक्स ऑफिस कलेक्शन
                  </h2>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <BoxOfficeItem label="बजट" value={boxOfficeData.budget} icon={<Coins size={18} className="text-purple-500" />} />
                    <BoxOfficeItem label="विश्व भर में" value={boxOfficeData.worldwideCollection} icon={<Globe size={18} className="text-green-500" />} isGreen />
                    <BoxOfficeItem label="फैसला" value={boxOfficeData.verdict} icon={<Trophy size={18} className="text-yellow-500" />} verdict={boxOfficeData.verdict} />
                    <BoxOfficeItem label="घरेलू" value={boxOfficeData.domestic} icon={<IndianRupee size={18} className="text-orange-500" />} />
                    <BoxOfficeItem label="शुरुआत" value={boxOfficeData.opening} icon={<CalendarIcon size={18} className="text-blue-500" />} />
                    <BoxOfficeItem label="विदेशी आय" value={boxOfficeData.overseas} icon={<TrendingUpIcon size={18} className="text-pink-500" />} />
                  </div>
                </div>
              )}

              {/* ===== 3. CAST SECTION ===== */}
              {cast.length > 0 && (
                <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
                  <h3 className="text-xl font-bold mb-5 flex items-center gap-3">
                    <Users className="text-gray-900 dark:text-white" size={22} />
                    मुख्य कलाकार
                  </h3>

                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {(showAllCast ? cast : cast.slice(0, 6)).map((role, idx) => {
    // ✅ Access the celebrity profile data correctly
    const celebrity = role.celebrities_profile || {};
    
    const actorName = celebrity.name || role.characterName;
    const actorSlug = celebrity.Slug || celebrity.slug;
    const actorAvatar = celebrity.Avatar;
    
    // Get image URL from Avatar
    const img = actorAvatar?.url || 
                actorAvatar?.formats?.thumbnail?.url || 
                null;

    return (
      <HoverPopupCard
        key={role.id || idx}
        name={actorName}
        role={role.characterName}
        imageUrl={img}
        slug={actorSlug}
        type="cast"
      >
        <CastCard 
          name={actorName}
          slug={actorSlug}
          img={img}
          characterName={role.characterName}
        />
      </HoverPopupCard>
    );
  })}
</div>
                  {cast.length > 6 && (
                    <button
                      onClick={() => setShowAllCast(!showAllCast)}
                      className="mt-5 w-full text-center text-sm font-semibold text-pink-500 hover:text-pink-600 transition-colors"
                    >
                      {showAllCast ? "कम कलाकार दिखाएं ▲" : `और कलाकार दिखाएं (${cast.length - 6}) ▼`}
                    </button>
                  )}
                </div>
              )}

              {/* ===== 4. CREW SECTION ===== */}
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
  {(showAllCrew ? crewMembers : crewMembers.slice(0, 6)).map((member, idx) => {
    let avatarUrl = null;
    const photoData = member.photo;
    
    // ✅ FIX: Handle photo as an array
    if (photoData && Array.isArray(photoData) && photoData.length > 0) {
      const firstPhoto = photoData[0];
      if (firstPhoto) {
        // Get thumbnail URL (prefer thumbnail for better performance)
        avatarUrl = firstPhoto.formats?.thumbnail?.url || 
                    firstPhoto.formats?.small?.url || 
                    firstPhoto.url;
      }
    }
    // If photo is not an array but a single object
    else if (photoData && !Array.isArray(photoData)) {
      if (typeof photoData === "string") {
        avatarUrl = photoData;
      } else if (photoData.url) {
        avatarUrl = photoData.formats?.thumbnail?.url || photoData.url;
      }
    }

    return (
      <HoverPopupCard
        key={member.id || idx}
        name={member.name}
        role={member.role}
        imageUrl={avatarUrl}
        slug={member.slug}
        type="crew"
      >
        <CrewCard
          name={member.name}
          slug={member.slug}
          role={member.role}
          avatarUrl={avatarUrl}
        />
      </HoverPopupCard>
    );
  })}
</div>


              {/* ===== 5. OFFICIAL TRAILER SECTION ===== */}
              {movie.trailer_id && (
                <div id="trailer-section" className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
                  <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                    <Play className="text-pink-500" size={22} />
                    आधिकारिक ट्रेलर
                  </h2>

                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                    {!isPlaying ? (
                      <div
                        className="relative w-full h-full group cursor-pointer"
                        onClick={handlePlayTrailer}
                      >
                        <Image
                          src={getYouTubeThumbnail(movie.trailer_id)}
                          alt={`${movie.title} ट्रेलर`}
                          fill
                          className="object-cover"
                        />

                        <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                          <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shadow-2xl">
                            <Play className="text-white ml-1" size={28} fill="white" />
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
                              onClick={() => window.open(`https://www.youtube.com/watch?v=${movie.trailer_id}`, "_blank")}
                              className="px-5 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors flex items-center gap-2 text-sm"
                            >
                              <Play size={18} />
                              YouTube पर देखें
                            </button>
                          </div>
                        ) : (
                          <iframe
                            ref={iframeRef}
                            src={`https://www.youtube.com/embed/${movie.trailer_id}?autoplay=1&rel=0`}
                            title={`${movie.title} आधिकारिक ट्रेलर`}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            onError={handleIframeError}
                            className="w-full h-full"
                          />
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ===== 6. REVIEWS SECTION ===== */}
              <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 hover:shadow-lg transition-all duration-300">
                <h2 className="text-xl font-bold mb-5 flex items-center gap-3">
                  <Star className="text-yellow-400" size={22} />
                  उपयोगकर्ता समीक्षाएँ
                </h2>

                <div className="space-y-6">
                  {/* Review Form */}
                  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
                    <h3 className="text-base font-bold mb-3 flex items-center gap-2">
                      <MessageSquare size={16} className="text-pink-500" />
                      इस फ़िल्म को रेट करें
                    </h3>

                    {reviewSuccess && (
                      <div className="mb-3 p-2 bg-green-500 text-white rounded-lg text-xs font-bold text-center">
                        ✓ धन्यवाद! समीक्षा सबमिट कर दी गई है।
                      </div>
                    )}

                    {!user ? (
                      <div className="text-center py-3">
                        <p className="text-xs text-gray-500 mb-2">कृपया समीक्षा लिखने के लिए लॉगिन करें</p>
                        <button onClick={redirectToLogin} className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-xs font-black transition">
                          समीक्षा के लिए लॉगिन करें
                        </button>
                      </div>
                    ) : (
                      <form onSubmit={handleReviewSubmit} className="space-y-3">
                        <div className="flex flex-wrap items-center justify-center gap-1 pb-1">
                          {[...Array(10)].map((_, i) => (
                            <button
                              key={i}
                              type="button"
                              onClick={() => setReviewForm({ ...reviewForm, rating: i + 1 })}
                              className="p-0.5 transition-transform hover:scale-110"
                            >
                              <Star
                                size={18}
                                className={i < reviewForm.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300 dark:text-gray-600"}
                                fill={i < reviewForm.rating ? "currentColor" : "none"}
                              />
                            </button>
                          ))}
                          <span className="ml-1 font-black text-pink-600 text-sm">{reviewForm.rating}/10</span>
                        </div>

                        <textarea
                          value={reviewForm.comment}
                          onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                          placeholder="अपने विचार साझा करें..."
                          rows={3}
                          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 outline-none focus:border-pink-500 transition"
                          required
                        />

                        <button
                          type="submit"
                          disabled={submittingReview}
                          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-black py-2.5 rounded-lg flex items-center justify-center gap-2 transition shadow-md text-sm"
                        >
                          {submittingReview ? <Loader className="animate-spin" size={16} /> : <><Send size={16} /> समीक्षा पोस्ट करें</>}
                        </button>
                      </form>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-3">
                    {reviews.length > 0 ? (
                      <>
                        {(showAllReviews ? reviews : reviews.slice(0, 3)).map((review, index) => (
                          <ReviewCard
                            key={index}
                            review={review}
                            user={user}
                            onDelete={handleDeleteReview}
                          />
                        ))}

                        {reviews.length > 3 && (
                          <button
                            onClick={() => setShowAllReviews(!showAllReviews)}
                            className="w-full py-2 text-xs font-black text-pink-500 hover:text-pink-600 underline uppercase tracking-widest"
                          >
                            {showAllReviews ? "कम दिखाएं" : `सभी ${reviews.length} समीक्षाएँ पढ़ें`}
                          </button>
                        )}
                      </>
                    ) : (
                      <div className="text-center py-6">
                        <p className="text-sm text-gray-400">अभी तक कोई समीक्षा नहीं। पहले बनें!</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* ===== 7. SIMILAR MOVIES - MOBILE ===== */}
              {movie?.similarMovies?.length > 0 && (
                <div className="lg:hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <Film className="text-pink-500" size={20} />
                    समान फ़िल्में
                  </h3>
                  <div className="space-y-3">
                    {movie.similarMovies.slice(0, showAllSimilar ? 999 : 4).map((simMovie) => {
                      const posterUrl = getImageUrl(simMovie.poster);
                      return (
                        <Link key={simMovie.id || simMovie.slug} href={`/${serverCategory}/movies/${simMovie.slug}`} className="flex gap-3 group">
                          <div className="relative w-14 h-20 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-neutral-900">
                            {posterUrl ? (
                              <Image src={posterUrl} alt={simMovie.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="56px" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-600">
                                <Film className="text-gray-400" size={20} />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors line-clamp-2">
                              {simMovie.title}
                            </h4>
                            {simMovie.year && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{simMovie.year}</div>}
                            {simMovie.rating > 0 && (
                              <div className="flex items-center gap-1 mt-1">
                                <Star size={10} className="fill-yellow-400 text-yellow-400" />
                                <span className="text-[10px] font-semibold">{simMovie.rating}/10</span>
                              </div>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  {movie.similarMovies.length > 4 && (
                    <button onClick={() => setShowAllSimilar(!showAllSimilar)} className="w-full mt-4 text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors text-center">
                      {showAllSimilar ? "कम दिखाएं" : `${movie.similarMovies.length - 4} और दिखाएं`}
                    </button>
                  )}
                </div>
              )}

              {/* ===== 8. RELATED ARTICLES - MOBILE ===== */}
              {movie?.articles?.length > 0 && (
                <div className="lg:hidden rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
                  <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <MessageSquare className="text-blue-500" size={20} />
                    संबंधित लेख
                  </h3>
                  <div className="space-y-3">
                    {movie.articles.slice(0, showAllArticles ? 999 : 4).map((article) => (
                      <Link key={article.id} href={`/${article.mainCategory}/${article.slug}`} className="flex gap-3 group">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          {article.hero_image?.url ? (
                            <Image src={article.hero_image.url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="64px" />
                          ) : (
                            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg">📄</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          {article.category?.name && <span className="inline-block text-[8px] px-1.5 py-0.5 rounded bg-pink-600 text-white font-semibold mb-1">{article.category.name}</span>}
                          <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-500 transition-colors">
                            {article.title}
                          </h4>
                          <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-1">
                            <span className="flex items-center gap-1"><Clock size={8} />{article.publishedAt ? formatDate(article.publishedAt, 'relative') : 'हाल ही में'}</span>
                            <span className="flex items-center gap-1"><Eye size={8} />{Number(article.views || 0).toLocaleString()}</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                  {movie.articles.length > 4 && (
                    <button onClick={() => setShowAllArticles(!showAllArticles)} className="w-full mt-4 text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors text-center">
                      {showAllArticles ? "कम दिखाएं" : `${movie.articles.length - 4} और दिखाएं`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT SIDEBAR - Similar Movies & Related Articles (Desktop only) */}
            <div className="hidden lg:block order-3 w-full lg:w-80 flex-shrink-0">
              <div className="sticky top-28 space-y-6 pb-12">
                <SimilarMoviesSection 
                  similarMovies={movie?.similarMovies || []} 
                  serverCategory={serverCategory}
                  showAllSimilar={showAllSimilar}
                  setShowAllSimilar={setShowAllSimilar}
                  getImageUrl={getImageUrl}
                  loading={loading}
                />
                
                <RelatedArticlesSection 
                  articles={movie?.articles || []}
                  serverCategory={serverCategory}
                  showAllArticles={showAllArticles}
                  setShowAllArticles={setShowAllArticles}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== SUB-COMPONENTS =====

const BoxOfficeItem = ({ label, value, icon, isGreen, verdict }) => {
  const getVerdictColor = (v) => {
    if (!v) return 'text-gray-900 dark:text-white';
    const verdictLower = v.toLowerCase();
    if (verdictLower.includes('blockbuster') || verdictLower.includes('superhit')) return 'text-green-600 dark:text-green-400';
    if (verdictLower.includes('hit')) return 'text-blue-600 dark:text-blue-400';
    if (verdictLower.includes('flop')) return 'text-pink-600 dark:text-pink-400';
    return 'text-gray-900 dark:text-white';
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800/50 dark:to-gray-900 rounded-xl p-3 text-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all duration-300">
      <div className="flex justify-center mb-2">{icon}</div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">{label}</div>
      <div className={`text-xs font-black ${isGreen ? 'text-green-600 dark:text-green-400' : getVerdictColor(verdict)}`}>
        {value || "N/A"}
      </div>
    </div>
  );
};

const CastCard = ({ name, slug, img, characterName }) => {
  const Wrapper = ({ children }) => 
    slug ? <Link href={`/celebrities/${slug}`} className="block group">{children}</Link> : <div className="group">{children}</div>;

  return (
    <Wrapper>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer">
        <div className="relative w-20 h-20 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 group-hover:border-pink-400 transition-colors">
          {img ? (
            <Image src={img} alt={name || "अभिनेता"} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="80px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <User size={28} className="text-gray-500" />
            </div>
          )}
        </div>
        <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-pink-500 transition-colors">
          {name || "अज्ञात"}
        </h4>
        {characterName && (
          <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
            {characterName} के रूप में
          </p>
        )}
      </div>
    </Wrapper>
  );
};

const CrewCard = ({ name, slug, role, avatarUrl }) => {
  const Wrapper = ({ children }) => 
    slug ? <Link href={`/celebrities/${slug}`} className="block group">{children}</Link> : <div className="group">{children}</div>;

  return (
    <Wrapper>
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-3 text-center border border-gray-200 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer min-h-[130px] flex flex-col items-center justify-center">
        <div className="relative w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-600 group-hover:border-pink-400 transition-colors">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={name || "क्रू"} fill className="object-cover group-hover:scale-110 transition-transform duration-300" sizes="64px" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-gray-700">
              <User size={24} className="text-gray-500" />
            </div>
          )}
        </div>
        <h4 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1 group-hover:text-pink-500 transition-colors">
          {name || "अज्ञात"}
        </h4>
        <p className="text-[10px] font-semibold text-pink-500 dark:text-pink-400 mt-1 uppercase tracking-wide">
          {role}
        </p>
      </div>
    </Wrapper>
  );
};

const ReviewCard = ({ review, user, onDelete }) => {
  return (
    <div className="rounded-xl bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 dark:text-pink-400 font-bold text-xs">
            {review.username?.[0]?.toUpperCase() || "A"}
          </div>
          <span className="font-bold text-sm">{review.username || "अज्ञात"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Star size={12} className="fill-yellow-400 text-yellow-400" />
          <span className="text-xs font-black">{review.rating}/10</span>
        </div>
      </div>
      <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed italic mb-2">
        “{review.comment}”
      </p>
      {(user && review.username === (user.username || user.name)) && (
        <button onClick={() => onDelete(review.documentId || review.id)} className="text-xs text-pink-500 hover:text-pink-700 font-medium flex items-center gap-1 transition-colors">
          <Trash2 size={14} /> मेरी समीक्षा हटाएं
        </button>
      )}
    </div>
  );
};

const WhereToWatchSection = ({ whereToWatch, getPlatformLogo }) => (
  <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <Video className="text-pink-500" size={20} />
      कहाँ देखें
    </h3>
    <div className="space-y-2">
      {whereToWatch.map((item, index) => {
        const hasUrl = item?.url && item.url !== '#' && item.url !== '';
        const statusText = item?.status || 'जल्द आ रहा है';
        const statusLower = statusText.toLowerCase();
        const logoSrc = getPlatformLogo(item.platform);
        
        // Helper to render logo or fallback icon
        const renderLogo = () => {
          if (!logoSrc) {
            return <Video className="text-gray-400" size={20} />;
          }
          return (
            <img
              src={logoSrc}
              alt={item.platform || 'platform'}
              className="w-full h-full object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                const parent = e.target.parentNode;
                if (parent) {
                  const fallback = document.createElement('div');
                  fallback.innerHTML = '<svg class="text-gray-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="5" width="20" height="14" rx="2"></rect><path d="M7 10l4 2-4 2V10z"></path></svg>';
                  parent.appendChild(fallback.firstChild);
                }
              }}
            />
          );
        };
        
        return (
          <div key={index} className={`bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border transition-all duration-300 ${hasUrl ? 'border-gray-200 dark:border-gray-700 hover:border-pink-400 hover:shadow-md' : 'border-gray-200 dark:border-gray-700'}`}>
            {hasUrl ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer" className="block">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center p-1.5 border shadow-sm">
                      {renderLogo()}
                    </div>
                    <div>
                      <div className="font-bold text-gray-900 dark:text-white text-sm">{item?.platform || 'प्लेटफॉर्म'}</div>
                      <div className={`text-[10px] font-semibold uppercase tracking-wider mt-0.5 ${statusLower.includes('now showing') || statusLower.includes('streaming') ? 'text-green-600' : statusLower.includes('coming soon') ? 'text-blue-600' : 'text-gray-500'}`}>
                        {statusText}
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="text-gray-400 hover:text-pink-500 transition-colors" size={16} />
                </div>
              </a>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-gray-700 flex items-center justify-center p-1.5 border shadow-sm">
                  {renderLogo()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 dark:text-white text-sm">{item?.platform || 'प्लेटफॉर्म'}</div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 italic">{statusText}</div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  </div>
);
const SimilarMoviesSection = ({ similarMovies, serverCategory, showAllSimilar, setShowAllSimilar, getImageUrl, loading }) => (
  <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <Film className="text-pink-500" size={20} />
      समान फ़िल्में
    </h3>
    
    {similarMovies.length > 0 ? (
      <>
        <div className="space-y-3">
          {similarMovies.slice(0, showAllSimilar ? 999 : 4).map((simMovie) => {
            const posterUrl = getImageUrl(simMovie.poster);
            const categorySlug = simMovie.category?.slug?.toLowerCase() || simMovie.category?.toLowerCase() || "";
            
            return (
              <Link 
                key={simMovie.id || simMovie.documentId || simMovie.slug} 
                href={`/${categorySlug}/movies/${simMovie.slug}`}
                className="flex gap-3 group"
              >
                <div className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-neutral-900">
                  {posterUrl ? (
                    <Image 
                      src={posterUrl} 
                      alt={simMovie.title || 'फ़िल्म का पोस्टर'} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-300" 
                      sizes="80px" 
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-neutral-700 dark:to-neutral-600">
                      <Film className="text-gray-400" size={24} />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white group-hover:text-pink-500 transition-colors line-clamp-2 mb-1">
                    {simMovie.title || 'शीर्षकहीन'}
                  </h4>
                  
                  <div className="flex items-center gap-2 flex-wrap">
                    {simMovie.category && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 font-semibold uppercase tracking-wider">
                        {simMovie.category.name || simMovie.category}
                      </span>
                    )}
                    
                    {simMovie.year && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {simMovie.year}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
        
        {similarMovies.length > 4 && (
          <button 
            onClick={() => setShowAllSimilar(!showAllSimilar)} 
            className="w-full mt-4 text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors text-center py-2 border-t border-gray-200 dark:border-gray-700 pt-3"
          >
            {showAllSimilar ? "कम दिखाएं ▲" : `${similarMovies.length - 4} और दिखाएं ▼`}
          </button>
        )}
      </>
    ) : (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <Film className="mx-auto mb-2 text-gray-300 dark:text-gray-600" size={32} />
        <p className="text-sm font-medium">कोई समान फ़िल्म नहीं मिली</p>
        <p className="text-xs mt-1">बाद में सुझावों के लिए वापस आएं</p>
      </div>
    )}
  </div>
);

const RelatedArticlesSection = ({ articles, serverCategory, showAllArticles, setShowAllArticles }) => (
  <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
      <MessageSquare className="text-blue-500" size={20} />
      संबंधित लेख
    </h3>
    
    {articles?.length > 0 ? (
      <>
        <div className="space-y-3">
          {articles.slice(0, showAllArticles ? 999 : 4).map((article) => (
            <Link key={article.id} href={`/${article.MainCategory}/${article.slug}`} className="flex gap-3 group">
              <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                {article.hero_image?.url ? (
                  <Image src={article.hero_image.url} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform" sizes="64px" />
                ) : (
                  <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-lg">📄</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                {article.category?.name && <span className="inline-block text-[8px] px-1.5 py-0.5 rounded bg-pink-600 text-white font-semibold mb-1">{article.category.name}</span>}
                <h4 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-500 transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-2 text-[9px] text-gray-500 mt-1">
                  <span className="flex items-center gap-1"><Clock size={8} />{article.publishedAt ? formatDate(article.publishedAt, 'relative') : 'हाल ही में'}</span>
                  <span className="flex items-center gap-1"><Eye size={8} />{Number(article.views || 0).toLocaleString()}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {articles.length > 4 && (
          <button onClick={() => setShowAllArticles(!showAllArticles)} className="w-full mt-4 text-xs font-semibold text-pink-500 hover:text-pink-600 transition-colors text-center">
            {showAllArticles ? "कम दिखाएं" : `${articles.length - 4} और दिखाएं`}
          </button>
        )}
      </>
    ) : (
      <div className="text-center py-6 text-gray-500 dark:text-gray-400">
        <p className="text-sm">कोई संबंधित लेख नहीं मिला</p>
      </div>
    )}
  </div>
);

// Awards Component
// Awards Component - using local icons from /trophy-icons/
const Awards = ({ awards = [] }) => {
  if (!awards || !awards.length) return null;

  return (
    <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Award className="text-yellow-600 dark:text-yellow-500" size={20} />
        पुरस्कार और सम्मान
      </h3>
      <div className="space-y-3">
        {awards.map((award, index) => {
          const isWon = award.awardStatus?.toLowerCase() === 'won';
          return (
            <div
              key={index}
              className={`rounded-lg p-3 border transition-all duration-300 ${
                isWon
                  ? 'bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-600'
                  : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Local trophy icon */}
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden bg-gray-100 dark:bg-gray-700">
                  <img
                    src={isWon ? '/trophy-icons/won.webp' : '/trophy-icons/nominated.webp'}
                    alt={isWon ? 'विजेता' : 'नामांकित'}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // Fallback if image missing – show emoji or nothing
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = isWon ? '🏆' : '🎭';
                    }}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  {award.title && (
                    <p className="text-[10px] font-bold text-pink-600 dark:text-pink-400 uppercase tracking-wide">
                      {award.title}
                    </p>
                  )}
                  <h4 className="font-bold text-gray-900 dark:text-white text-sm leading-tight">
                      {award.name}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                    {award.category} • {award.year}
                  </p>
                  <span
                    className={`inline-block mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
                      isWon
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-400 dark:bg-gray-600 text-white'
                    }`}
                  >
                    {award.awardStatus || 'नामांकित'}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};