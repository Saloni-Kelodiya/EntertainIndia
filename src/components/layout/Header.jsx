'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import dynamic from 'next/dynamic';

import Menu from "lucide-react/dist/esm/icons/menu";
import X from "lucide-react/dist/esm/icons/x";
import Bell from "lucide-react/dist/esm/icons/bell";
import User from "lucide-react/dist/esm/icons/user";
import Tv from "lucide-react/dist/esm/icons/tv";
import Heart from "lucide-react/dist/esm/icons/heart";
import Mail from "lucide-react/dist/esm/icons/mail";
import Shield from "lucide-react/dist/esm/icons/shield";
import ExternalLink from "lucide-react/dist/esm/icons/external-link";
import ChevronDown from "lucide-react/dist/esm/icons/chevron-down";
import Instagram from "lucide-react/dist/esm/icons/instagram";
import Twitter from "lucide-react/dist/esm/icons/twitter";
import Youtube from "lucide-react/dist/esm/icons/youtube";
import Facebook from "lucide-react/dist/esm/icons/facebook";
import EllipsisVertical from "lucide-react/dist/esm/icons/ellipsis-vertical"; // ✅ Ekdum sahi
import LogOut from "lucide-react/dist/esm/icons/log-out";

// Isi tarah baaki ke icons ko bhi unke naam ke mutabik small letters me likh kar...

// Components & Config Imports

import ThemeToggle from "./ThemeToggle";
import Logo from "../../app/assets/entertainindia_logo.png";
import { useStore } from "../../store/useStore";
import { CATEGORIES } from "../../lib/constants";
import { debounce } from "../../lib/helpers";
import TrendingTicker from "./TrendingTicker";
import { articlesAPI } from "../../lib/api";

// Dynamic Import for MenuSidebar (Bundle Size Optimization)
const MenuSidebar = dynamic(() => import("./MenuSidebar"), { ssr: false });
const GlobalSearchbar = dynamic(
  () => import('./GlobalSearchbar'),
  { 
    loading: () => <div className="h-10 w-full bg-gray-100 animate-pulse rounded" />, // Temporary skeleton loader
    ssr: false // Optional: Disable SSR if it relies heavily on window/browser APIs like ⌘K listeners
  }
);
/* ---------------- Static Constants (Baahar shifted) ---------------- */
const HEADER_CATEGORY_SLUGS = ['/', 'bollywood', 'hollywood', 'ott', 'tv'];

const socialLinks = [
  { name: "इंस्टाग्राम", icon: Instagram, url: "https://www.instagram.com/entertainindiaofficial/", color: "hover:text-pink-600" },
  { name: "ट्विटर", icon: Twitter, url: "https://x.com/EIndia99460", color: "hover:text-sky-500" },
  { name: "यूट्यूब", icon: Youtube, url: "https://www.youtube.com/@EIndiaofficial", color: "hover:text-red-600" },
  { name: "फेसबुक", icon: Facebook, url: "https://www.facebook.com/profile.php?id=61584375938569", color: "hover:text-blue-600" }
];

const supportLinks = [
  { name: "हमारे बारे में", icon: Heart, url: "/about" },
  { name: "संपर्क करें", icon: Mail, url: "/contact" },
  { name: "गोपनीयता नीति", icon: Shield, url: "/privacy-policy" },
  { name: "सेवा की शर्तें", icon: Shield, url: "/terms-services" },
];

export default function Header({ theme, setTheme }) {
  const router = useRouter();
  const pathname = usePathname();

  const { searchQuery, setSearchQuery, user, token } = useStore();

  const [mounted, setMounted] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery || "");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [profileOpen, setProfileOpen] = useState(false);
  const [open, setOpen] = useState(false);

  const searchRef = useRef(null);
  const profileRef = useRef(null);

  /* ---------------- Effects ---------------- */
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    setLocalSearch(searchQuery || "");
  }, [searchQuery]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, [mobileMenuOpen]);

  const goToEnglish = () => { window.location.href = "https://entertainindia.com"; };

  // Search Suggestions Fetcher
  useEffect(() => {
    const fetchSuggestions = debounce(async (query) => {
      if (!query?.trim() || query.length < 2) {
        setSuggestions([]);
        setShowSuggestions(false);
        return;
      }
      try {
        const data = await articlesAPI.getAll({ search: query, pageSize: 5 });
        setSuggestions(data.articles || []);
        setShowSuggestions(true);
      } catch (error) {
        console.error('सुझाव लाने में त्रुटि:', error);
        setSuggestions([]);
      }
    }, 300);

    fetchSuggestions(localSearch);
    return () => fetchSuggestions.cancel?.();
  }, [localSearch]);

  // Click Outside Handlers
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    };
    if (profileOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [profileOpen]);

  /* ---------------- Handlers ---------------- */
  const handleLogout = () => {
    const { logout } = useStore.getState();
    logout?.();
    router.push("/");
    setMobileMenuOpen(false);
    setProfileOpen(false);
  };

  const handleGoToComDashboard = () => {
    const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('token') : null);
    if (currentToken) {
      window.location.href = `https://entertainindia.com/auth-bridge?token=${currentToken}`;
    } else {
      router.push("/author-dashboard");
    }
  };

  /* ---------------- Category Filter ---------------- */
  const headerCategories = CATEGORIES.filter(cat => HEADER_CATEGORY_SLUGS.includes(cat.slug));
  const sidebarCategories = CATEGORIES.filter(cat => !HEADER_CATEGORY_SLUGS.includes(cat.slug));

  return (
    <>
      {/* ================= HEADER ================= */}
      <header
        className={`fixed top-0 inset-x-0 z-50 backdrop-blur-xl transition-all duration-300 ${
          isScrolled ? "bg-white/95 dark:bg-[#071028]/95 shadow-md" : "bg-white/80 dark:bg-[#071028]/80 shadow-none"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2" aria-label="EntertainIndia होम पेज">
            <Image src={Logo} alt="एंटरटेनइंडिया लोगो" className="w-6 h-6 object-contain" />
            <span className="text-xl font-extrabold dark:text-white">EntertainIndia</span>
          </Link>
          
          {/* Language Switcher */}
          <div className="relative hidden md:block" onMouseLeave={() => setOpen(false)}>
            <button
              onClick={() => setOpen(!open)}
              onMouseEnter={() => setOpen(true)}
              className="flex gap-1 px-3 py-1.5 text-sm font-semibold bg-pink-600 text-white rounded-md hover:bg-pink-700 transition"
              aria-label="भाषा चुनें - वर्तमान: हिन्दी"
              aria-expanded={open}
            >
              हिन्दी <ChevronDown size={16} aria-hidden="true" />
            </button>

            {open && (
              <div className="absolute left-0 top-full mt-0 bg-white dark:bg-slate-800 rounded-lg shadow-lg border z-50 min-w-[100px]" role="menu">
                <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700" role="menuitem">हिन्दी</button>
                <button onClick={goToEnglish} className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700" role="menuitem">English</button>
              </div>
            )}
          </div>
          
          {/* Categories Desktop */}
          <nav className="hidden md:block" aria-label="मुख्य नेविगेशन">
            <div className="max-w-7xl mx-auto px-2 sm:px-6 py-1 lg:px-10">
              <div className="flex items-center justify-center gap-1 py-1 overflow-x-auto whitespace-nowrap">
                {headerCategories?.length > 0 ? (
                  headerCategories.map((category) => {
                    const isActive = pathname === category.path;
                    return (
                      <Link
                        key={category.slug || category.path}
                        href={category.path}
                        className={`px-2 text-sm font-semibold uppercase tracking-wide rounded-full transition-colors ${
                          isActive ? "bg-[#fef3c7] text-[#92400e] dark:bg-[#16304a] dark:text-yellow-300 shadow-sm" : "text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#0f253b] hover:text-yellow-400"
                        }`}
                        aria-current={isActive ? "page" : undefined}
                      >
                        {category.name}
                      </Link>
                    );
                  })
                ) : (
                  <span className="text-sm text-gray-500 px-2">लोड हो रहा है...</span>
                )}
                
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="w-6 h-6 cursor-pointer text-gray-700 dark:text-gray-200 hover:text-yellow-400 flex-shrink-0 inline-flex items-center justify-center"
                  aria-label="अधिक श्रेणियाँ देखें"
                  title="अधिक श्रेणियाँ"
                >
                  <EllipsisVertical size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
            
            {sidebarOpen && (
              <MenuSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} categories={sidebarCategories} />
            )}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            <div className="hidden md:flex flex-1 max-w-xl mx-2 relative" ref={searchRef}>
              <GlobalSearchbar variant="desktop" />
            </div>
            
            <ThemeToggle theme={theme} setTheme={setTheme} />

            {mounted && (
              <button
                onClick={() => { if (user) { router.push("/notifications"); } else { useStore.getState().openLoginModal(); } }}
                className="p-2 hover:bg-gray-100 dark:hover:bg-[#0f2236] rounded-full"
                aria-label="Notifications"
              >
                <Bell className="w-6 h-6 text-yellow-400" aria-hidden="true" />
              </button>
            )}

            {mounted && user ? (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setProfileOpen((prev) => !prev)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-[#0b1220] rounded-full hover:ring-2 hover:ring-yellow-400 transition"
                  aria-label={`प्रोफाइल मेनू: ${user?.username}`}
                  aria-expanded={profileOpen}
                >
                  <User className="w-5 h-5" aria-hidden="true" />
                  <span className="text-sm font-medium dark:text-white">{user?.username}</span>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 mt-3 w-64 bg-gradient-to-b from-white/90 to-gray-50/90 dark:from-slate-800/95 dark:to-slate-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/50 dark:border-slate-700/50 z-" role="menu">
                    <button onClick={() => setProfileOpen(false)} className="absolute top-4 right-4 w-6 h-6 bg-slate-200/80 dark:bg-slate-700/80 rounded-lg flex items-center justify-center group -m-2">
                      <X className="w-4 h-4 text-slate-600 dark:text-slate-300" aria-hidden="true" />
                    </button>
                    
                    <div className="px-5 py-4 border-b border-white/30 dark:border-slate-700/50">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">के रूप में साइन इन किया</p>
                      <p className="font-bold text-lg bg-gradient-to-r from-slate-900 to-slate-700 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate">{user?.username}</p>
                    </div>

                    <div className="py-1">
                      <button onClick={() => { router.push("/profile"); setProfileOpen(false); }} className="flex items-center w-full px-5 py-3 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group" role="menuitem">
                        <User className="w-5 h-5 mr-3 ml-1 bg-gradient-to-br from-blue-500 to-indigo-600 text-white rounded-lg p-1 shadow-md" /> प्रोफाइल
                      </button>

                      <button onClick={() => { router.push("/notifications"); setProfileOpen(false); }} className="flex items-center w-full px-5 py-3 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group" role="menuitem">
                        <Bell className="w-5 h-5 mr-3 ml-1 bg-gradient-to-br from-orange-500 to-yellow-500 text-white rounded-lg p-1 shadow-md" /> सूचनाएँ
                      </button>

                      {user?.role?.type === "author" && (
                        <button onClick={() => { handleGoToComDashboard(); setProfileOpen(false); }} className="flex items-center w-full px-5 py-3 hover:bg-white/50 dark:hover:bg-slate-700/50 transition-all group" role="menuitem">
                          <div className="w-5 h-5 mr-3 ml-1 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-lg p-1 shadow-md flex items-center justify-center"><Tv className="w-3 h-3" /></div>
                          <span className="font-medium">लेखक डैशबोर्ड</span>
                        </button>
                      )}

                      <button onClick={handleLogout} className="flex items-center w-full px-5 py-3 hover:bg-red-500/10 hover:text-red-600 transition-all group mt-1" role="menuitem">
                        <LogOut className="w-5 h-5 mr-3 ml-1 bg-gradient-to-br from-red-500 to-rose-500 text-white rounded-lg p-1 shadow-md" /> लॉगआउट
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => useStore.getState().openLoginModal()} className="px-4 py-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white rounded-full hover:opacity-90 transition">लॉगिन</button>
            )}
          </div>

          {/* ================= MOBILE ACTIONS ================= */}
          <div className="md:hidden flex items-center gap-2">
            <div className="flex-1"><GlobalSearchbar /></div>
            <button onClick={() => { if (user) { router.push("/profile"); } else { useStore.getState().openLoginModal(); } }} aria-label={user ? "प्रोफाइल देखें" : "लॉगिन करें"}>
              <User className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
            </button>
            <button onClick={() => setMobileMenuOpen(true)} aria-label="मेनू खोलें" aria-expanded={mobileMenuOpen}>
              <Menu className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
            </button>
          </div>
        </div>

        <TrendingTicker />
      </header>

      {/* ================= MOBILE DRAWER ================= */}
      {mobileMenuOpen && (
      <div
  className={`fixed top-0 right-0 h-full w-80 z-[9999] bg-white dark:bg-[#071028] shadow-xl transition-transform duration-300 overflow-y-auto ${mobileMenuOpen ? "translate-x-0" : "translate-x-full"}`}
  role="dialog"
  aria-label="मोबाइल मेनू"
  aria-modal="true"
>
          <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white dark:bg-[#071028] z-10">
            <div className="flex items-center gap-4">
              <span className="font-bold dark:text-white">मेनू</span>
              <ThemeToggle theme={theme} setTheme={setTheme} />
              <div className="relative block">
                <button onClick={() => setOpen(!open)} className="flex gap-1 px-3 py-1.5 text-sm font-semibold bg-pink-600 text-white rounded-md">
                  हिन्दी <ChevronDown size={16} />
                </button>
                {open && (
                  <div className="absolute left-0 top-9 w-24 bg-white dark:bg-slate-800 rounded-lg shadow-lg border z-50">
                    <button className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700">हिन्दी</button>
                    <button onClick={goToEnglish} className="block w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-slate-700">English</button>
                  </div>
                )}
              </div>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 hover:bg-gray-100 dark:hover:bg-[#0f2236] rounded-full" aria-label="मेनू बंद करें">
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {mounted && user && (
            <div className="p-4 border-b bg-gradient-to-r from-pink-50 to-purple-50 dark:from-[#1a1035] dark:to-[#1a1a3a]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-pink-600 to-purple-600 flex items-center justify-center text-white font-bold text-lg border-2 border-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold dark:text-white text-lg">{user?.username}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                    {user?.role?.type === 'author' ? 'लेखक' : user?.role?.type === 'admin' ? 'प्रशासक' : 'उपयोगकर्ता'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Categories List */}
          <div className="p-4 space-y-2 border-b">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">श्रेणियाँ</p>
            {CATEGORIES.map((cat) => (
              <button key={cat.slug} onClick={() => { router.push(cat.path); setMobileMenuOpen(false); }} className="w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-[#0f2236]">
                {cat.name}
              </button>
            ))}
          </div>

          {/* Social Links */}
          <div className="p-4 border-b">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">हमें फॉलो करें</p>
            <div className="grid grid-cols-2 gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a key={social.name} href={social.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gray-50 dark:bg-[#0f2236] group">
                    <Icon className={`w-4 h-4 ${social.color}`} />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{social.name}</span>
                  </a>
                );
              })}
            </div>
          </div>

          {/* Support Links */}
          <div className="p-4 border-b">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">सहायता</p>
            <div className="space-y-1">
              {supportLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <button key={link.name} onClick={() => { router.push(link.url); setMobileMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#0f2236] group">
                    <Icon className="w-4 h-4 text-gray-500 dark:text-gray-400 group-hover:text-pink-600" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{link.name}</span>
                    <ExternalLink className="w-3 h-3 ml-auto text-gray-400" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Version Footer */}
          <div className="p-4"><p className="text-xs text-center text-gray-400">© 2024 एंटरटेनइंडिया। सर्वाधिकार सुरक्षित।<br />संस्करण 2.0.0</p></div>

          {/* Drawer Action Buttons */}
          <div className="border-t p-4 space-y-3 sticky bottom-0 bg-white dark:bg-[#071028]">
            {mounted && user ? (
              <>
                <button onClick={() => { router.push("/profile"); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-purple-600 text-white py-2 rounded-lg">
                  <User className="w-4 h-4" /> प्रोफाइल
                </button>
                {user?.role?.type === "author" && (
                  <button onClick={() => { handleGoToComDashboard(); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-100 dark:border-emerald-800 py-2 rounded-lg">
                    <Tv className="w-4 h-4" /> लेखक डैशबोर्ड
                  </button>
                )}
                <button onClick={() => { router.push("/notifications"); setMobileMenuOpen(false); }} className="w-full flex items-center justify-center gap-2 bg-gray-100 dark:bg-[#0f2236] text-gray-700 dark:text-gray-300 py-2 rounded-lg">
                  <Bell className="w-4 h-4" /> सूचनाएँ
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 rounded-lg">
                  <LogOut className="w-4 h-4" /> लॉगआउट
                </button>
              </>
            ) : (
              <button onClick={() => { useStore.getState().openLoginModal(); setMobileMenuOpen(false); }} className="block w-full text-center bg-gradient-to-r from-pink-600 to-purple-600 text-white py-3 rounded-lg font-semibold">
                लॉगिन / रजिस्टर
              </button>
            )}
          </div>
        </div>
      )}

     {mobileMenuOpen && <div className="fixed inset-0 bg-black/40 z-[9990]" onClick={() => setMobileMenuOpen(false)} aria-hidden="true" />}
    </>
  );
}