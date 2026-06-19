"use client";

import Image from "next/image";
import Link from "next/link";
import { Search, ChevronRight, ChevronLeft, User, Eye, Edit, X } from "lucide-react";
import { useState, useMemo, useRef, useEffect } from "react";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const ITEMS_PER_PAGE = 9;

function AllUserPage({ initialUsers = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLetter, setSelectedLetter] = useState(null);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const scrollRef = useRef(null);

  // ✅ Set users from initialUsers
  useEffect(() => {
    if (initialUsers && Array.isArray(initialUsers)) {
      // Filter out Authenticated users
      const filteredInitial = initialUsers.filter(user => {
        const roleName = typeof user.role === 'object' && user.role !== null 
          ? user.role.name || "" 
          : user.role || "";
        return roleName.toLowerCase() !== "authenticated";
      });
      setUsers(filteredInitial);
    }
    setIsLoading(false);
  }, [initialUsers]);

  // Filter Logic
  const filteredUsers = useMemo(() => {
    // Apply search and letter filters
    const filtered = users.filter((user) => {
      const name = (user.name || user.username || "").toLowerCase();
      const matchesSearch = searchQuery ? name.includes(searchQuery.toLowerCase()) : true;
      const matchesLetter = selectedLetter ? name.startsWith(selectedLetter.toLowerCase()) : true;
      return matchesSearch && matchesLetter;
    });
    
    // Sort by total posts (highest first)
    return filtered.sort((a, b) => (b.totalPosts || 0) - (a.totalPosts || 0));
  }, [users, searchQuery, selectedLetter]);

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedLetter(null);
    setCurrentPage(1);
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { scrollLeft } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - 200 : scrollLeft + 200;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      {/* HEADER SECTION */}
      <div className="px-4 sm:px-6 lg:px-8 pl-4 md:pl-10 mb-6">
        <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
          <User size={28} className="text-pink-500" />
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              लेखक (Authors)
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              हमारे प्रतिभाशाली लेखकों और उनके अद्भुत काम को देखें
            </p>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH SECTION */}
      <div className="px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex flex-col lg:flex-row gap-4 items-center">

          {/* Search Bar */}
          <div className="relative w-full lg:flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="लेखक खोजें..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value) setSelectedLetter(null);
                setCurrentPage(1);
              }}
              className="w-full bg-gray-100 dark:bg-neutral-800 border border-gray-200 dark:border-gray-700 rounded-full py-3 pr-12 pl-12 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all placeholder:text-gray-500"
            />
            {(searchQuery || selectedLetter) && (
              <button
                onClick={clearFilters}
                className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors"
                title="Clear all filters"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            )}
          </div>

          {/* Alphabet Filter Container */}
          <div className="flex items-center gap-2 w-full lg:max-w-lg h-12 bg-gray-100 dark:bg-neutral-800/50 rounded-xl px-2 border border-gray-200 dark:border-gray-700/50">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-800 transition-all flex-shrink-0"
              title="Scroll Left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div
              ref={scrollRef}
              className="flex items-center gap-1 overflow-x-auto no-scrollbar scroll-smooth h-full flex-1"
            >
              <button
                onClick={() => {
                  setSelectedLetter(null);
                  setSearchQuery("");
                  setCurrentPage(1);
                }}
                className={`px-3 h-8 rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                  selectedLetter === null
                    ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                    : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                }`}
              >
                ALL
              </button>
              {ALPHABET.map((letter) => (
                <button
                  key={letter}
                  onClick={() => {
                    setSelectedLetter(letter);
                    setSearchQuery("");
                    setCurrentPage(1);
                  }}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold transition-all flex-shrink-0 ${
                    selectedLetter === letter
                      ? "bg-pink-600 text-white shadow-lg shadow-pink-600/30"
                      : "bg-transparent text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800"
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>

            <button
              onClick={() => scroll('right')}
              className="p-1.5 bg-gray-200 dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded-lg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-300 dark:hover:bg-gray-800 transition-all flex-shrink-0"
              title="Scroll Right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* AUTHORS GRID */}
      <div className="px-4 sm:px-6 lg:px-8">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">👤</div>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-2">
              {users.length === 0 ? "कोई लेखक नहीं मिला" : "कोई मेल खाने वाला लेखक नहीं मिला"}
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-sm">
              {users.length === 0 
                ? "कृपया बाद में देखें" 
                : "अपनी खोज या फ़िल्टर समायोजित करें"}
            </p>
            {users.length > 0 && (
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
              >
                फ़िल्टर हटाएं
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {paginatedUsers.map((user, index) => {
                const imageUrl =
                  user?.avatar?.url ||
                  user?.profileImage ||
                  "";

                const hasImage = Boolean(imageUrl);

                const totalPosts =
                  Number(user?.totalPosts) || 0;

                const totalViews =
                  Number(user?.totalViews) || 0;

                return (
                  <div
                    key={user?.id || index}
                    className="bg-white dark:bg-neutral-900 rounded-2xl p-6 border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex gap-5">
                      {/* IMAGE */}
                      <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0">
                        {hasImage ? (
                          <img
                            src={imageUrl}
                            alt={user?.name || "लेखक"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <User className="w-10 h-10 text-gray-400" />
                        )}
                      </div>

                      {/* CONTENT */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                          {user?.username_hindi}
                        </h2>

                        <p className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mt-1 mb-4 font-bold">
                          {typeof user?.role === "object"
                            ? user?.role?.name
                            : user?.role || "लेखक"}
                        </p>

                        {/* ONLY TOTAL POSTS - Articles + Web Stories */}
                        <div className="flex flex-col gap-2 mb-5">
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Edit className="w-4 h-4" />
                            <span className="font-semibold">
                              {totalPosts} {totalPosts === 1 ? "पोस्ट" : "पोस्ट्स"}
                            </span>
                          </div>

                          {/* VIEWS */}
                          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                            <Eye className="w-4 h-4" />
                            <span className="font-semibold">
                              {totalViews >= 1000000
                                ? `${(totalViews / 1000000).toFixed(1)}M`
                                : totalViews >= 1000
                                ? `${(totalViews / 1000).toFixed(1)}K`
                                : totalViews}{" "}
                              व्यूज
                            </span>
                          </div>
                        </div>

                        {/* BUTTON */}
                        <Link
                          href={`/author/${user?.username || user?.id}`}
                          className="text-pink-500 text-xs font-black tracking-widest uppercase hover:underline"
                        >
                          पोस्ट देखें &gt;
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-10">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  पिछला
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-all ${
                          currentPage === pageNum
                            ? "bg-pink-500 text-white shadow-md"
                            : "border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  अगला
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default AllUserPage;