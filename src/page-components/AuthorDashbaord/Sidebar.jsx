"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "../../store/useStore";
import { Home, FileText, BookOpen, User, PlusCircle, Menu, X, Sparkles, ChevronRight, LogOut } from "lucide-react";

const Sidebar = ({ isSidebarOpen, toggleSidebar, openModal, activeSection, setActiveSection, openWebStoryModal }) => {
  const [isMobile, setIsMobile] = useState(false);
    const {  logout } = useStore();
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const menuItems = [
    { id: "profile", label: "Profile", icon: User, color: "from-blue-400 to-blue-600" },
    { id: "articles", label: "My Articles", icon: FileText, color: "from-green-400 to-green-600" },
    { id: "webstories", label: "Web Stories", icon: BookOpen, color: "from-purple-400 to-purple-600" },
  ];

      const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <>
      {/* Mobile Header with Menu Button */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 p-4 z-40 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-white transition-all"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <h2 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Author Portal
          </h2>
        </div>
        <button
          onClick={openModal}
          className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all shadow-lg"
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 fixed md:sticky top-0 left-0 w-72 h-screen bg-gradient-to-b from-gray-900 to-gray-800 border-r border-gray-800 p-6 transition-all duration-300 ease-in-out z-50 flex flex-col shadow-2xl overflow-y-auto`}
      >
        {/* Logo Section */}
        <div className="mb-8 pb-6 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Author<span className="text-blue-400">Hub</span>
                </h3>
                <p className="text-gray-400 text-xs mt-0.5">Content Creator</p>
              </div>
            </div>
            {/* Close button for mobile */}
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all"
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-4">
            Main Menu
          </p>
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setActiveSection(item.id);
                      if (isMobile) toggleSidebar();
                    }}
                    className={`w-full group relative overflow-hidden rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg shadow-blue-600/20"
                        : "hover:bg-gray-800/80"
                    }`}
                  >
                    <div className="flex items-center px-4 py-3">
                      <div className={`relative z-10 flex items-center space-x-3 ${
                        isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                      }`}>
                        <Icon size={20} className={isActive ? "text-white" : "text-gray-500 group-hover:text-white"} />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      {isActive && (
                        <ChevronRight size={16} className="absolute right-4 text-white/70" />
                      )}
                    </div>
                    
                    {/* Hover effect */}
                    <div className={`absolute inset-0 bg-gradient-to-r ${item.color} opacity-0 ${
                      isActive ? "opacity-100" : "group-hover:opacity-10"
                    } transition-opacity duration-300`} />
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Create Buttons Section */}
          <div className="mt-8 space-y-3">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-4">
              Quick Actions
            </p>
            
            {/* Create Story Button */}
            <button
              onClick={() => {
                openWebStoryModal();
                if (isMobile) toggleSidebar();
              }}
              className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600 hover:to-pink-600 border border-purple-500/30 hover:border-transparent transition-all duration-300"
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center space-x-3">
                  <Sparkles size={20} className="text-purple-400 group-hover:text-white transition-colors" />
                  <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
                    Create Story
                  </span>
                </div>
                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 group-hover:bg-white/20 text-purple-300 group-hover:text-white">
                  New
                </span>
              </div>
            </button>

            {/* Create Article Button */}
            <button
              onClick={() => {
                openModal();
                if (isMobile) toggleSidebar();
              }}
              className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-green-600/20 to-blue-600/20 hover:from-green-600 hover:to-blue-600 border border-green-500/30 hover:border-transparent transition-all duration-300"
            >
              <div className="flex items-center px-4 py-3">
                <PlusCircle size={20} className="text-green-400 group-hover:text-white mr-3 transition-colors" />
                <span className="font-medium text-gray-300 group-hover:text-white transition-colors">
                  Create Article
                </span>
              </div>
            </button>
          </div>
        </nav>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-gray-800">
          <div className="bg-gray-800/50 rounded-xl p-4 mb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')?.name?.charAt(0) || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')?.name || 'Author'}
                </p>
                <p className="text-xs text-gray-400 truncate">
                  {typeof window !== 'undefined' && JSON.parse(localStorage.getItem('user') || '{}')?.email || 'author@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Logout Button (optional) */}
          {/* <button className="w-full py-2.5 px-4 rounded-lg bg-red-600/10 hover:bg-red-600 text-red-400 hover:text-white transition-all duration-300 flex items-center justify-center space-x-2 group"> */}
                       <button onClick={handleLogout} className="px-6 py-2 flex items-center gap-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm"><LogOut className="w-5 h-5" /> Logout</button>

          {/* </button> */}
        </div>
      </aside>

      {/* Add custom animation styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Sidebar;