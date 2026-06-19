"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import UserProfile from "./UserProfile";
import CreateArticleModal from "./CreateArticleModal;";
import { useRouter } from "next/navigation";
import CreateWebStoryModal from "./CreateWebStoryModal";
import { useStore } from "../../store/useStore";
import { articlesAPI, webStoriesAPI } from "../../lib/api";
import { FileText, CheckCircle, Clock, Edit3, RefreshCw, Eye, TrendingUp, BarChart3 } from "lucide-react";

const AuthorDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [activeSection, setActiveSection] = useState("profile");
  const [activeTab, setActiveTab] = useState("all"); 
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [userStories, setUserStories] = useState([]);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [userArticles, setUserArticles] = useState([]);
  const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(true);

  const router = useRouter();
  const { user, token, authLoaded, loadAuthFromStorage, openLoginModal } = useStore();

  useEffect(() => { loadAuthFromStorage(); }, []);

  const fetchMyData = async () => {
    if (user?.id) {
      setLoading(true);
      try {
        const [artRes, storyRes] = await Promise.all([
          articlesAPI.getMyArticles(user.id),
          webStoriesAPI.getMyStories(user.id)
        ]);
        
        setUserArticles(artRes.articles || []);
        setUserStories(storyRes.stories || []);
      } catch (err) {
        console.error("Failed to load articles", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchMyData();
  }, [user]);

  useEffect(() => {
    if (!authLoaded) return;
    if (!user || !token) {
      openLoginModal();
    }
     if (user?.role?.name?.toLowerCase() !== "author") {
      setIsAuthorized(false);
      setTimeout(() => router.push("/profile"), )
     }

  }, [authLoaded, user, token, router]);

  // Calculate statistics
  const getStats = () => {
    const publishedArticles = userArticles.filter(
      art => art.moderation_status?.toLowerCase() === 'published'
    ).length;
    
    const pendingArticles = userArticles.filter(
      art => art.moderation_status?.toLowerCase() === 'pending'
    ).length;
    
    const totalArticleViews = userArticles.reduce((sum, art) => 
      sum + (art.views || art.viewCount || 0), 0
    );
    
    const totalStoryViews = userStories.reduce((sum, story) => 
      sum + (story.views || story.viewCount || 0), 0
    );
    
    const totalStories = userStories.length;
    
    return {
      publishedArticles,
      pendingArticles,
      totalArticles: userArticles.length,
      totalStories,
      totalArticleViews,
      totalStoryViews,
      totalViews: totalArticleViews + totalStoryViews
    };
  };

  const stats = getStats();

  const filteredArticles = userArticles.filter(art => {
    const status = art.moderation_status?.toLowerCase() || 'pending';
    if (activeTab === "published") return status === "published";
    if (activeTab === "pending") return status === "pending";
    return true; 
  });

  const handleEdit = (article) => {
    setSelectedArticle(article);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    fetchMyData();
  };

  const openWebStoryModal = () => {
    setShowStoryModal(true);
  };

  const closeWebStoryModal = () => {
    setShowStoryModal(false);
    fetchMyData();
  };

  // Statistics Cards Component
  const StatisticsCards = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {/* Total Views Card */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 p-4 sm:p-5 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-blue-200 font-medium">Total Views</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              {stats.totalViews.toLocaleString()}
            </p>
          </div>
          <Eye className="w-6 h-6 sm:w-8 sm:h-8 text-blue-300 opacity-75" />
        </div>
        <div className="mt-2 text-xs text-blue-200">
          <span className="font-medium">{stats.totalArticleViews}</span> articles • 
          <span className="font-medium ml-1">{stats.totalStoryViews}</span> stories
        </div>
      </div>

      {/* Published Articles Card */}
      <div className="bg-gradient-to-br from-green-600 to-green-800 p-4 sm:p-5 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-green-200 font-medium">Published</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              {stats.publishedArticles}
            </p>
          </div>
          <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 text-green-300 opacity-75" />
        </div>
        <div className="mt-2 text-xs text-green-200">
          Articles • {((stats.publishedArticles / stats.totalArticles) * 100 || 0).toFixed(0)}% success rate
        </div>
      </div>

      {/* Pending Articles Card */}
      <div className="bg-gradient-to-br from-yellow-600 to-yellow-800 p-4 sm:p-5 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-yellow-200 font-medium">Pending</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              {stats.pendingArticles}
            </p>
          </div>
          <Clock className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-300 opacity-75" />
        </div>
        <div className="mt-2 text-xs text-yellow-200">
          Awaiting moderation
        </div>
      </div>

      {/* Total Stories Card */}
      <div className="bg-gradient-to-br from-purple-600 to-purple-800 p-4 sm:p-5 rounded-xl shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs sm:text-sm text-purple-200 font-medium">Web Stories</p>
            <p className="text-xl sm:text-2xl font-bold text-white mt-1">
              {stats.totalStories}
            </p>
          </div>
          <TrendingUp className="w-6 h-6 sm:w-8 sm:h-8 text-purple-300 opacity-75" />
        </div>
        <div className="mt-2 text-xs text-purple-200">
          Interactive content
        </div>
      </div>
    </div>
  );
const renderArticlesList = () => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-800 pb-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <FileText className="text-blue-500 w-5 h-5" /> My Submissions
        </h3>
        
        <div className="flex bg-gray-800 p-1 rounded-lg border border-gray-700">
          {['all', 'published', 'pending'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 rounded-md text-[10px] font-bold uppercase transition-all ${
                activeTab === tab ? "bg-blue-600 text-white shadow-md" : "text-gray-400 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10"><RefreshCw className="animate-spin text-blue-500" /></div>
      ) : (
        /* grid-cols-2 use kiya hai taaki ek line mein 2 articles aayein */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredArticles.map((article) => {
            const imgData = article.heroImage || article.hero_image;
            const url = imgData?.url || imgData?.data?.attributes?.url;
            const fullImgUrl = url ? (url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL}${url}`) : null;

            return (
              <div key={article.id} className="group bg-gray-800/40 hover:bg-gray-800 p-2 rounded-xl border border-gray-700/50 transition-all">
                <div className="flex gap-3">
                  
                  {/* Chhota Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-700 flex-shrink-0">
                    {fullImgUrl ? (
                      <img src={fullImgUrl} className="w-full h-full object-cover" alt="thumb" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><FileText size={20} className="text-gray-600" /></div>
                    )}
                  </div>

                  {/* Info Section */}
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <h4 className="font-bold text-white text-[13px] leading-tight line-clamp-2 group-hover:text-blue-400 transition-colors">
                      {article.title}
                    </h4>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase border ${
                        article.moderation_status?.toLowerCase() === 'published' 
                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                        : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                      }`}>
                        {article.moderation_status || 'Pending'}
                      </span>
                      <span className="text-gray-500 text-[9px] truncate">
                        {new Date(article.publishDate || article.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="flex items-center">
                    <button 
                      onClick={() => handleEdit(article)}
                      className="p-2 bg-gray-700/50 hover:bg-blue-600 rounded-lg text-white transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

  const renderWebStoriesList = () => {
  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h3 className="text-xl sm:text-2xl font-bold font-heading">My Web Stories</h3>
        <button 
          onClick={openWebStoryModal}
          className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg flex items-center justify-center gap-2"
        >
          <span>✨</span> Create Story
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <RefreshCw className="animate-spin text-blue-500 w-6 h-6" />
        </div>
      ) : userStories.length === 0 ? (
        <div className="text-center py-10 bg-gray-800/30 rounded-xl border-2 border-dashed border-gray-700">
          <p className="text-sm text-gray-500 italic">No web stories found. Start creating one!</p>
        </div>
      ) : (
        /* 4 Columns for smaller size cards */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {userStories.map((story) => {
            // Image URL nikaalne ka logic
            // Aapke API mein thumbnail field hai, slides ke andar image hai
            const thumbData = story.thumbnail;
            const imageUrl = thumbData?.url || thumbData?.data?.attributes?.url;
            const fullImageUrl = imageUrl 
              ? (imageUrl.startsWith('http') ? imageUrl : `${process.env.NEXT_PUBLIC_API_URL}${imageUrl}`)
              : null;

            return (
              <div key={story.id} className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 group hover:border-purple-500/50 transition-all flex flex-col">
                
                {/* Image Container */}
                <div className="relative aspect-[3/4] overflow-hidden bg-gray-900">
                  {fullImageUrl ? (
                    <img 
                      src={fullImageUrl} 
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-600">
                      <TrendingUp size={30} strokeWidth={1} />
                      <span className="text-[10px] mt-2">No Thumbnail</span>
                    </div>
                  )}
                  
                  {/* Badge */}
                  <div className="absolute top-2 left-2">
                    <span className="bg-purple-600/80 backdrop-blur-sm text-[8px] font-bold px-2 py-0.5 rounded text-white uppercase tracking-wider">
                      Story
                    </span>
                  </div>
                </div>

                {/* Details Section */}
                <div className="p-3">
                  <h4 className="font-semibold text-white text-xs sm:text-sm line-clamp-1 group-hover:text-purple-400 transition-colors">
                    {story.title}
                  </h4>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-700/50">
                    <span className="text-[10px] text-gray-400 flex items-center gap-1">
                      <FileText size={10} className="text-purple-500" /> 
                      {story.slides?.length || 0} Slides
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-gray-400">
                      <Eye size={10} className="text-blue-500" /> {story.views || 0}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

  return (
    <div className="flex mt-5 w-full min-h-screen bg-gray-900 text-white">
      <Sidebar 
        isSidebarOpen={isSidebarOpen} 
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} 
        openModal={() => setShowModal(true)} 
        openWebStoryModal={openWebStoryModal} 
        activeSection={activeSection} 
        setActiveSection={setActiveSection} 
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-gray-800 border-b border-gray-700 px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Author Dashboard
          </h2>
          <button 
            onClick={() => { setSelectedArticle(null); setShowModal(true); }} 
            className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs sm:text-sm font-bold shadow-lg whitespace-nowrap"
          >
            + Create New
          </button>
        </header>
        
        <main className="p-3 sm:p-4 md:p-6 max-w-6xl mx-auto w-full">
          {/* Statistics Cards - Always visible */}
          <StatisticsCards />
          
          {/* Dynamic Content */}
          {activeSection === "articles" && renderArticlesList()}
          {activeSection === "webstories" && renderWebStoriesList()} 
          {activeSection === "profile" && <UserProfile user={user} />}
        </main>
      </div>
      
      {showModal && (
        <CreateArticleModal 
          onClose={closeModal} 
          user={user} 
          editData={selectedArticle} 
        />
      )}
      
      {showStoryModal && (
        <CreateWebStoryModal 
          onClose={closeWebStoryModal} 
          user={user} 
        />
      )}
    </div>
  );
};

export default AuthorDashboard;