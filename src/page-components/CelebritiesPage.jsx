'use client';

import { useEffect, useState, useCallback, useRef, memo, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, User, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { celebritiesAPI, ProfessionAPI, articlesAPI } from '../lib/api';
import Pagination from '../components/ui/Pagination';
import Sidebar from '../components/layout/Sidebar';
import WebContentCategory from "../page-components/WebContentCategory";

//  Constants moved outside component
const INDUSTRIES = [
  { id: 'all', label: 'सभी', value: '' },
  { id: 'bollywood', label: 'बॉलीवुड', value: 'Bollywood' },
  { id: 'hollywood', label: 'हॉलीवुड', value: 'Hollywood' },
  { id: 'tollywood', label: 'टॉलीवुड', value: 'Tollywood' },
  { id: "bhojiwood", label: "भोजवुड", value: "Bhojiwood" },
  { id: "politics", label: "राजनीति", value: "Politics" },
  { id: "sports", label: "खेल", value: "Sports" },
  { id: "Korean", label: "कोरियाई", value: "Korean" },
];

// how many profession chips to show before collapsing into "See More"
const VISIBLE_PROFESSION_COUNT = 8;

//  Memoized Celebrity Card Component
const CelebrityCard = memo(({ celebrity, activeIndustry = "" }) => {
  const { name, slug, avatar, industry: celebrityIndustry } = celebrity;

  //  Memoize display industries
  const displayIndustries = useMemo(() => {
    if (!Array.isArray(celebrityIndustry) || celebrityIndustry.length === 0) {
      return [];
    }

    if (!activeIndustry || activeIndustry === '') {
      return celebrityIndustry.map(ind => ind.name);
    }

    const matchingIndustry = celebrityIndustry.find(
      ind => ind?.name?.toLowerCase() === activeIndustry.toLowerCase()
    );

    return matchingIndustry ? [matchingIndustry.name] : [celebrityIndustry[0]?.name].filter(Boolean);
  }, [celebrityIndustry, activeIndustry]);

  const avatarUrl = avatar?.url;
  const imageSizes = "(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw";

  return (
    <Link
      href={`/celebrities/${slug}`}
      className="group card-theme rounded-xl overflow-hidden shadow hover:shadow-lg transition block"
      prefetch={false}
    >
      <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={name}
            fill
            sizes={imageSizes}
            className="object-top  group-hover:scale-110 transition duration-500"
            loading="lazy"
            quality={75}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <User className="w-10 h-10 text-gray-400" />
          </div>
        )}
      </div>

      <div className="p-2">
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white">
          {name}
        </h3>

        {displayIndustries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {displayIndustries.map((industryName, index) => (
              <span key={index} className="text-xs text-pink-600">
                {industryName}{index < displayIndustries.length - 1 ? " • " : ""}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
});

CelebrityCard.displayName = 'CelebrityCard';

//  Skeleton Components
const CelebrityCardSkeleton = memo(() => (
  <div className="group card-theme rounded-xl overflow-hidden shadow animate-pulse">
    <div className="relative aspect-square bg-gray-200 dark:bg-gray-700">
      <div className="flex items-center justify-center h-full">
        <div className="w-10 h-10 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
      </div>
    </div>
    <div className="p-2 space-y-2">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
    </div>
  </div>
));

CelebrityCardSkeleton.displayName = 'CelebrityCardSkeleton';

const CelebrityGridSkeleton = memo(({ count = 10 }) => (
  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
    {Array(count).fill(0).map((_, index) => (
      <CelebrityCardSkeleton key={index} />
    ))}
  </div>
));

CelebrityGridSkeleton.displayName = 'CelebrityGridSkeleton';

//  News Card Component
const NewsCard = memo(({ article }) => {
  const imageUrl = useMemo(() => {
    return article?.heroImage?.formats?.small?.url ||
           article?.heroImage?.url ||
           "/placeholder-news.jpg";
  }, [article?.heroImage]);

  return (
    <Link
      href={`/${article.mainCategory}/${article.slug}`}
      className="cursor-pointer bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow hover:shadow-lg transition block"
      prefetch={false}
    >
      <div className="relative h-32 w-full bg-gray-200 dark:bg-gray-700">
        <Image
          src={imageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover"
          loading="lazy"
          quality={60}
        />
      </div>
      <div className="p-2">
        <h3 className="text-xs font-semibold line-clamp-2 text-gray-900 dark:text-white">
          {article.title}
        </h3>
      </div>
    </Link>
  );
});

NewsCard.displayName = 'NewsCard';

//  Filter Button Component
const FilterButton = memo(({ label, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-200 flex-shrink-0
      ${isActive
        ? 'bg-pink-600 text-white shadow-md'
        : 'bg-gray-100 dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-pink-100 dark:hover:bg-pink-900/30'
      }`}
  >
    {label}
  </button>
));

FilterButton.displayName = 'FilterButton';

//  Empty State Component
const EmptyState = memo(({ title = "No celebrities found", message = "Check back later for the latest celebrity profiles and updates." }) => (
  <div className="text-center py-20 bg-gradient-to-br from-gray-50/50 to-white/50 dark:from-gray-900/50 dark:to-gray-800/50 rounded-3xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl">
    <div className="w-20 h-20 bg-gradient-to-br from-yellow-400/20 to-pink-400/20 rounded-2xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
      <Star className="w-10 h-10 text-yellow-400" />
    </div>
    <p className="text-xl sm:text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
      {title}
    </p>
    <p className="text-gray-500 dark:text-gray-400 text-sm max-w-sm mx-auto">
      {message}
    </p>
  </div>
));

EmptyState.displayName = 'EmptyState';

//  Category Section Component — groups celebrities under an industry heading
const CategorySection = memo(({ title, celebrities, activeIndustry }) => {
  if (!celebrities || celebrities.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <span className="w-1.5 h-5 bg-pink-600 rounded-full inline-block"></span>
          {title}
        </h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
        {celebrities.map((celebrity) => (
          <CelebrityCard
            key={celebrity.id}
            celebrity={celebrity}
            activeIndustry={activeIndustry}
          />
        ))}
      </div>
    </div>
  );
});

CategorySection.displayName = 'CategorySection';

//  Main Component
export default function CelebritiesPage({ 
  categoryData, 
  initialCelebrities, 
  initialPagination, 
  initialPage 
}) {
  const [celebrities, setCelebrities] = useState(initialCelebrities || []);
  const [pagination, setPagination] = useState(initialPagination || null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage || 1);
  const [search, setSearch] = useState("");
  const [letter, setLetter] = useState("");
  const [industry, setIndustry] = useState("");
  const [professions, setProfessions] = useState([]);
  const [profession, setProfession] = useState("");
  const [showAllProfessions, setShowAllProfessions] = useState(false);
  const [news, setNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);
  
  const isFirstRender = useRef(true);
  const isFirstFilterApply = useRef(true);

  //  Fetch professions on mount
  useEffect(() => {
    const fetchProfessions = async () => {
      try {
        const data = await ProfessionAPI.getAll();
        setProfessions([
          { id: "all", name: "सभी", slug: "" },
          ...data,
        ]);
      } catch (err) {
        console.error("Profession fetch error:", err);
      }
    };

    fetchProfessions();
    fetchCelebrityNews();
  }, []);

  //  Fetch celebrity news
  const fetchCelebrityNews = useCallback(async () => {
    try {
      setNewsLoading(true);
      const res = await articlesAPI.getAll({
        pageSize: 6,
        mainCategory:"news",
        typeContent: "CelebrityNews",
        sort: "publish_datetime:desc",
      });
      setNews(res?.articles || []);
    } catch (err) {
      console.error("Celebrity news fetch error:", err);
    } finally {
      setNewsLoading(false);
    }
  }, []);

  //  Fetch celebrities with filters
  const fetchCelebrities = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: currentPage,
        pageSize: 12,
      };
      
      if (industry && industry !== '') params.industry = industry;
      if (profession && profession !== '') params.profession = profession;
      if (search && search.trim() !== '') params.search = search.trim();
      if (letter && letter !== '') params.letter = letter;
      
      const res = await celebritiesAPI.getAll(params);
      
      setCelebrities(res.celebrities || []);
      setPagination(res.pagination || null);
    } catch (err) {
      console.error('Celebrity fetch error:', err);
      setCelebrities([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  }, [currentPage, industry, profession, search, letter]);

  //  Fetch when filters change
  useEffect(() => {
    const hasFilters = industry || profession || search || letter;
    const isNotInitialPage = currentPage !== initialPage;
    
    if (hasFilters || isNotInitialPage) {
      fetchCelebrities();
    } else if (isFirstFilterApply.current && initialCelebrities?.length > 0) {
      isFirstFilterApply.current = false;
    }
  }, [fetchCelebrities, industry, profession, search, letter, currentPage, initialPage, initialCelebrities]);

  //  Handlers with useCallback
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleIndustryChange = useCallback((selectedIndustry) => {
    setIndustry(selectedIndustry);
    setCurrentPage(1);
  }, []);

  const handleProfessionChange = useCallback((slug) => {
    setProfession(slug);
    setCurrentPage(1);
  }, []);

  const handleSearch = useCallback((searchValue) => {
    setSearch(searchValue);
    setCurrentPage(1);
    setLetter("");
  }, []);

  const handleLetterFilter = useCallback((letterValue) => {
    setLetter(letterValue);
    setCurrentPage(1);
    setSearch("");
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch("");
    setLetter("");
    setProfession("");
    setIndustry("");
    setCurrentPage(1);
  }, []);

  const toggleShowAllProfessions = useCallback(() => {
    setShowAllProfessions((prev) => !prev);
  }, []);

  //  Memoized values
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (search && search !== "") count++;
    if (letter && letter !== "") count++;
    if (profession && profession !== "") count++;
    if (industry && industry !== "") count++;
    return count;
  }, [search, letter, profession, industry]);

  const hasCelebrities = celebrities.length > 0;
  const hasPagination = pagination?.pageCount > 1;
  const hasActiveFilters = Boolean(industry || profession || search || letter);

  const visibleProfessions = useMemo(() => {
    return showAllProfessions ? professions : professions.slice(0, VISIBLE_PROFESSION_COUNT);
  }, [professions, showAllProfessions]);

  //  Group celebrities by industry into sections (only shown when no filters are active)
  const groupedByIndustry = useMemo(() => {
    if (hasActiveFilters) return null;

    const groups = {};
    const order = [];

    celebrities.forEach((celebrity) => {
      const industries = Array.isArray(celebrity.industry) && celebrity.industry.length > 0
        ? celebrity.industry.map((ind) => ind?.name).filter(Boolean)
        : ['अन्य'];

      industries.forEach((name) => {
        if (!groups[name]) {
          groups[name] = [];
          order.push(name);
        }
        groups[name].push(celebrity);
      });
    });

    return order.map((name) => ({ name, items: groups[name] }));
  }, [celebrities, hasActiveFilters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      {/* MAIN CONTENT — full width, no sidebar column split */}
      <main className="w-full">
        <WebContentCategory
          title="हस्तियाँ"
          description="सेलिब्रिटी प्रोफाइल, बायोग्राफी, और लेटेस्ट अपडेट्स"
          icon={<Star className="w-10 h-10 text-pink-500" />}
          onSearch={handleSearch}
          onLetterFilter={handleLetterFilter}
          currentLetter={letter}
        />

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="mb-4 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-4 h-4 text-pink-600" />
              <span className="text-sm text-pink-600 dark:text-pink-400">Active Filters:</span>
              {industry && (
                <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                  Industry: {INDUSTRIES.find(i => i.value === industry)?.label || industry}
                </span>
              )}
              {profession && professions.find(p => p.slug === profession) && (
                <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                  {professions.find(p => p.slug === profession)?.name}
                </span>
              )}
              {letter && (
                <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                  Name starts with: {letter.toUpperCase()}
                </span>
              )}
              {search && (
                <span className="text-sm bg-pink-100 dark:bg-pink-900/40 px-2 py-1 rounded-full">
                  Search: {search}
                </span>
              )}
            </div>
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm text-pink-600 hover:text-pink-700 font-medium"
            >
              <X className="w-4 h-4" />
              Clear All
            </button>
          </div>
        )}

        {/* INDUSTRY FILTER BAR */}
        <div className="sticky top-0 z-30 backdrop-blur-sm py-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
            {INDUSTRIES.map((item) => (
              <FilterButton
                key={item.id}
                label={item.label}
                isActive={industry === item.value}
                onClick={() => handleIndustryChange(item.value)}
              />
            ))}
          </div>
        </div>

        {/* PROFESSION FILTER BAR — single line with See More toggle */}
        {professions.length > 1 && (
          <div className="mb-4">
            <div
              className={`flex gap-2 pb-2 ${
                showAllProfessions
                  ? 'flex-wrap'
                  : 'flex-nowrap overflow-x-auto scrollbar-hide'
              }`}
            >
              {visibleProfessions.map((item) => (
                <FilterButton
                  key={item.id || item.slug}
                  label={item.name}
                  isActive={profession === item.slug}
                  onClick={() => handleProfessionChange(item.slug)}
                />
              ))}

              {professions.length > VISIBLE_PROFESSION_COUNT && (
                <button
                  onClick={toggleShowAllProfessions}
                  className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap flex-shrink-0 border border-pink-300 text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-all duration-200"
                >
                  {showAllProfessions ? (
                    <>कम दिखाएं <ChevronUp className="w-4 h-4" /></>
                  ) : (
                    <>और देखें <ChevronDown className="w-4 h-4" /></>
                  )}
                </button>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 flex justify-between items-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {celebrities.length} of {pagination?.total || 0} celebrities
          </p>
        </div>

        {/* Celebrity Grid / Category Sections */}
        {loading ? (
          <CelebrityGridSkeleton count={12} />
        ) : hasCelebrities ? (
          <>
            {!hasActiveFilters && groupedByIndustry && groupedByIndustry.length > 0 ? (
              // Default view: grouped into category sections
              groupedByIndustry.map((group) => (
                <CategorySection
                  key={group.name}
                  title={group.name}
                  celebrities={group.items}
                  activeIndustry={industry}
                />
              ))
            ) : (
              // Filtered view: flat grid
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 lg:gap-5">
                {celebrities.map((celebrity) => (
                  <CelebrityCard
                    key={celebrity.id}
                    celebrity={celebrity}
                    activeIndustry={industry}
                  />
                ))}
              </div>
            )}

            {hasPagination && (
              <div className="mt-12">
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination.pageCount}
                  onPageChange={handlePageChange}
                  totalItems={pagination.total}
                  itemsPerPage={12}
                />
              </div>
            )}
          </>
        ) : (
          <EmptyState />
        )}
      </main>
    </div>
  );
}