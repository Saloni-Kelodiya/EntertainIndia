'use client';

import {
  Star, Calendar, MapPin, Film, User, Crown, Heart,
  ChevronDown, ChevronUp, Users, Award, Clock, Share2,
  TrendingUp, GraduationCap, Instagram, Twitter, Facebook,
  Sparkles, Quote, ImageIcon, FileText, ScreenShare, Eye,
  MonitorPlay, Cake, Info
} from 'lucide-react';
import Image from 'next/image';
import { useState, useMemo, useCallback, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import Link from 'next/link';
import Head from 'next/head';
import { getStrapiMedia } from '../lib/constants';
import { formatDate } from '../lib/helpers';

// ─── Helper ────────────────────────────────────────────────
const calculateAge = (birthdate, deathdate = null) => {
  if (!birthdate) return null;
  const end = deathdate ? new Date(deathdate) : new Date();
  const birth = new Date(birthdate);
  let age = end.getFullYear() - birth.getFullYear();
  const monthDiff = end.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && end.getDate() < birth.getDate())) age--;
  return age;
};

// ─── Custom Hook for Pagination ──────────────────────────
function usePagination(items, itemsPerPage = 6) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);
  const goToPage = useCallback((page) => setCurrentPage(Math.min(Math.max(page, 1), totalPages)), [totalPages]);
  const next = useCallback(() => goToPage(currentPage + 1), [goToPage, currentPage]);
  const prev = useCallback(() => goToPage(currentPage - 1), [goToPage, currentPage]);
  return { currentItems, currentPage, totalPages, goToPage, next, prev, startIndex, endIndex };
}

// ─── Reusable Pagination Controls ────────────────────────
const PaginationControls = memo(({ currentPage, totalPages, goToPage, prev, next, startIndex, endIndex, totalItems }) => {
  const getPageNumbers = useCallback(() => {
    const pages = [];
    const maxVisible = 5;
    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');
      for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      pages.push('...');
      for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
      pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  }, [currentPage, totalPages]);

  return (
    <div className="flex items-center justify-between border-t border-gray-200 dark:border-gray-700 pt-3 mt-2">
      <div className="text-[12px] text-gray-400 dark:text-gray-500">{startIndex + 1}–{Math.min(endIndex, totalItems)} / {totalItems}</div>
      <div className="flex items-center gap-1">
        <button onClick={prev} disabled={currentPage === 1} className={`w-6 h-6 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center ${currentPage === 1 ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600'}`}>←</button>
        <div className="flex items-center">
          {getPageNumbers().map((page, idx) => page === '...' ? <span key={`ellipsis-${idx}`} className="w-5 text-center text-xs text-gray-400 dark:text-gray-500">•</span> : <button key={page} onClick={() => goToPage(page)} className={`w-6 h-6 rounded-md text-xs font-medium transition-all duration-200 ${currentPage === page ? 'bg-red-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600'}`}>{page}</button>)}
        </div>
        <button onClick={next} disabled={currentPage === totalPages} className={`w-6 h-6 rounded-md text-xs font-medium transition-all duration-200 flex items-center justify-center ${currentPage === totalPages ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed' : 'text-gray-600 dark:text-gray-400 hover:bg-red-600 hover:text-white dark:hover:bg-red-600'}`}>→</button>
      </div>
    </div>
  );
});
PaginationControls.displayName = 'PaginationControls';

// ─── Memoized Sub‑components ─────────────────────────────
const StatCard = memo(({ icon, label, value, isGreen }) => (
  <div className="group bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md hover:-translate-y-0.5 p-2 sm:p-3 rounded-lg transition-all duration-300 ease-out relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent dark:via-gray-700/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    <div className="flex flex-row items-center gap-1 sm:gap-2 w-full mb-1 relative z-10">
      <div className={`p-1 sm:p-1.5 rounded-lg bg-gradient-to-br ${isGreen ? 'from-green-50/50 to-emerald-100/50 dark:from-green-500/10 dark:to-emerald-600/10' : 'from-red-50/50 to-pink-100/50 dark:from-red-500/10 dark:to-pink-600/10'} backdrop-blur-sm shadow-sm border border-white/50 dark:border-gray-700/50 transition-all duration-300 group-hover:scale-105`}>
        <div className="text-sm sm:text-base group-hover:scale-110 transition-transform duration-200">{icon}</div>
      </div>
      <p className="text-[12px] sm:text-[14px] uppercase tracking-widest font-bold bg-gradient-to-r from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-300 bg-clip-text text-transparent leading-tight relative z-10">{label}</p>
    </div>
    <p className={`text-xs sm:text-sm md:text-base font-black leading-none relative z-10 text-center ${isGreen ? 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400 bg-clip-text text-transparent' : 'bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-100 dark:to-gray-50 bg-clip-text text-transparent'}`}>{value}</p>
    <div className={`absolute -inset-1 opacity-0 group-hover:opacity-100 rounded-lg blur-xl transition-opacity duration-500 ${isGreen ? 'bg-green-400/20 dark:bg-green-500/20' : 'bg-red-400/20 dark:bg-red-500/20'}`} />
  </div>
));
StatCard.displayName = 'StatCard';

const SidebarRow = memo(({ label, value, isVertical = false }) => (
  <div className={`py-2 border-b border-gray-200 dark:border-gray-700 last:border-0 ${isVertical ? 'flex flex-col gap-1' : 'flex items-start justify-between gap-4'}`}>
    <span className="text-gray-500 dark:text-gray-400 text-[12px] uppercase font-bold tracking-wider">{label}</span>
    <span className={`text-gray-900 dark:text-gray-100 text-sm font-medium ${!isVertical && 'text-right leading-tight'}`}>{value || '—'}</span>
  </div>
));
SidebarRow.displayName = 'SidebarRow';

const InfoItem = memo(({ icon, label, value }) => (
  <div className="flex gap-4">
    <div className="mt-1">{icon}</div>
    <div>
      <p className="text-[12px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">{label}</p>
      <p className="text-gray-900 dark:text-gray-100 font-medium text-sm leading-tight">{value || 'N/A'}</p>
    </div>
  </div>
));
InfoItem.displayName = 'InfoItem';

const SectionHeader = memo(({ title, icon }) => (
  <div className="flex items-center gap-2 mb-4">
    <span className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400">{icon}</span>
    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{title}</h3>
  </div>
));
SectionHeader.displayName = 'SectionHeader';

const SocialIconBadge = memo(({ social }) => {
  const platforms = {
    Instagram: { icon: <Instagram size={12} />, color: 'text-pink-600 dark:text-pink-400 bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-700' },
    Twitter: { icon: <Twitter size={12} />, color: 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' },
    Facebook: { icon: <Facebook size={12} />, color: 'text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700' },
  };
  const config = platforms[social?.platform] || { icon: <Share2 size={12} />, color: 'text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700' };
  const followersStr = social?.followers || '';
  return (
    <a href={social?.profileurl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-2 py-1 rounded-lg border font-medium hover:scale-105 transition-all duration-300 ${config.color}`}>
      {config.icon}
      <span className="text-[12px] font-bold text-gray-900 dark:text-gray-100">{followersStr}</span>
    </a>
  );
});
SocialIconBadge.displayName = 'SocialIconBadge';

const CompactTimelineItem = memo(({ year, text, isLast }) => (
  <div className="flex gap-4">
    <div className="flex flex-col items-center">
      <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-[12px] text-white z-10 shadow-md flex-shrink-0">{year?.toString() || 'N/A'}</div>
      {!isLast && <div className="w-0.5 h-5 bg-red-600/20 dark:bg-red-600/30" />}
    </div>
    <div className="pt-1 pb-6">
      <p className="text-gray-900 dark:text-gray-100 text-xs font-medium leading-snug">{text}</p>
    </div>
  </div>
));
CompactTimelineItem.displayName = 'CompactTimelineItem';

const AwardBadge = memo(({ award }) => (
  <div className={`p-3 rounded-lg border flex items-center justify-between transition-all duration-300 ${award.won ? 'bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'}`}>
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg ${award.won ? 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-300' : 'bg-gray-100 dark:bg-gray-700/50 text-gray-500 dark:text-gray-400'}`}>
        <Award size={16} />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-900 dark:text-gray-100 leading-tight">{award.name}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{award.project}</p>
        <p className="text-[12px] text-gray-500 dark:text-gray-400">{award.category} • {award.year}</p>
      </div>
    </div>
    {award.won ? (
      <span className="text-[12px] font-black uppercase text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-lg">विजेता</span>
    ) : (
      <span className="text-[12px] font-black uppercase text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700/50 px-2 py-0.5 rounded-lg">नामांकित</span>
    )}
  </div>
));
AwardBadge.displayName = 'AwardBadge';

const MovieSmallCard = memo(({ movie, isUpcoming = false }) => {
  const catSlug = movie?.category?.slug || movie?.category?.attributes?.slug || movie?.categories?.[0]?.slug || movie?.categories?.[0]?.attributes?.slug || movie?.primaryCategory?.slug || "movies";
  const movieUrl = `/${catSlug}/movies/${movie.slug}`;
  return (
    <Link href={movieUrl} className="group block rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-all bg-white dark:bg-gray-800">
      <div className="relative w-full h-40 bg-gray-200 dark:bg-gray-700">
        {movie.poster?.url ? (
          <Image 
            src={movie.poster.url} 
            alt={movie.title} 
            fill 
            sizes="(max-width: 768px) 40vw, 25vw"
            quality={70}
            className="object-cover transition-transform duration-500 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center"><Film className="text-gray-500" size={32} /></div>
        )}
      </div>
      <div className="p-3">
        <h5 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-1">{movie.title}</h5>
        <p className="text-[12px] text-gray-500 dark:text-gray-400">{isUpcoming ? `रिलीज़: ${formatDate(movie.releaseDate)}` : `रिलीज़ हुई: ${formatDate(movie.releaseDate)}`}</p>
      </div>
    </Link>
  );
});
MovieSmallCard.displayName = 'MovieSmallCard';

const ArticleCard = memo(({ article }) => {
  const imgUrl = getStrapiMedia(article?.hero_image?.formats?.thumbnail?.url || article?.hero_image?.formats?.small?.url || article?.hero_image?.url);
  return (
    <Link href={`/${article.mainCategory}/${article.slug}`} className="flex gap-3 items-start p-2 rounded-lg bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition group">
      <div className="relative w-20 h-14 rounded-md overflow-hidden flex-shrink-0">
        {imgUrl ? (
          <Image 
            src={imgUrl} 
            alt={article.title} 
            fill 
            sizes="80px" 
            quality={60}
            className="object-cover group-hover:scale-105 transition-transform" 
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs">📰</div>
        )}
      </div>
      <div className="flex-1 space-y-1">
        {article.category?.name && <span className="inline-block text-[8px] px-1.5 py-0.5 rounded bg-red-600 text-white font-semibold">{article.category.name}</span>}
        <h3 className="text-xs font-semibold text-gray-900 dark:text-white line-clamp-2">{article.title}</h3>
        <div className="flex items-center gap-2 text-[9px] text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1"><Clock size={8} />{formatDate(article.publishedAt, 'relative')}</span>
          {article.views > 0 && <span className="flex items-center gap-1"><Eye size={8} />{article.views > 999 ? `${(article.views/1000).toFixed(1)}K` : article.views}</span>}
        </div>
      </div>
    </Link>
  );
});
ArticleCard.displayName = 'ArticleCard';

// ─── Section‑specific Pagination Components (memoized) ──

const AwardsSection = memo(({ awards }) => {
  const { currentItems, currentPage, totalPages, goToPage, next, prev, startIndex, endIndex } = usePagination(awards, 6);
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
        {currentItems.map(award => <AwardBadge key={award.id} award={award} />)}
      </div>
      {totalPages > 1 && <PaginationControls {...{ currentPage, totalPages, goToPage, next, prev, startIndex, endIndex, totalItems: awards.length }} />}
    </>
  );
});
AwardsSection.displayName = 'AwardsSection';

const MoviesSection = memo(({ movies, isUpcoming = false }) => {
  const { currentItems, currentPage, totalPages, goToPage, next, prev, startIndex, endIndex } = usePagination(movies, 4);
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
        {currentItems.map(movie => <MovieSmallCard key={movie.id} movie={movie} isUpcoming={isUpcoming} />)}
      </div>
      {totalPages > 1 && <PaginationControls {...{ currentPage, totalPages, goToPage, next, prev, startIndex, endIndex, totalItems: movies.length }} />}
    </>
  );
});
MoviesSection.displayName = 'MoviesSection';

const ArticlesSection = memo(({ articles }) => {
  const sorted = useMemo(
    () => [...articles].sort((a, b) => new Date(b.createdAt || b.publishedAt || 0) - new Date(a.createdAt || a.publishedAt || 0)),
    [articles]
  );
  const { currentItems, currentPage, totalPages, goToPage, next, prev, startIndex, endIndex } = usePagination(sorted, 4);
  return (
    <>
      <div className="space-y-2 mb-4">
        {currentItems.map(article => <ArticleCard key={article.id} article={article} />)}
      </div>
      {totalPages > 1 && <PaginationControls {...{ currentPage, totalPages, goToPage, next, prev, startIndex, endIndex, totalItems: sorted.length }} />}
    </>
  );
});
ArticlesSection.displayName = 'ArticlesSection';

// ─── Timeline (with show/hide) ──────────────────────────
const TimelineSection = memo(({ items }) => {
  const [showAll, setShowAll] = useState(false);
  const total = items.length;

  if (total <= 9) {
    return items.map((item, idx) => (
      <CompactTimelineItem key={item.id || idx} year={item.year} text={item.title} isLast={idx === total - 1} />
    ));
  }

  const firstThree = items.slice(0, 3);
  const lastThree = items.slice(total - 3, total);
  const hiddenItems = items.slice(3, total - 3);
  const hiddenCount = hiddenItems.length;

  return (
    <>
      {firstThree.map((item, idx) => (
        <CompactTimelineItem
          key={`first-${item.id || idx}`}
          year={item.year}
          text={item.title}
          isLast={idx === firstThree.length - 1 && !showAll && hiddenCount === 0}
        />
      ))}

      {showAll && hiddenItems.map((item, idx) => (
        <CompactTimelineItem
          key={`hidden-${item.id || idx}`}
          year={item.year}
          text={item.title}
          isLast={idx === hiddenItems.length - 1 && lastThree.length === 0}
        />
      ))}

      {!showAll && hiddenCount > 0 && (
        <div className="flex gap-4 relative group">
          <div className="flex flex-col items-center">
            <div className="w-0.5 h-5 bg-red-600/20 dark:bg-red-600/30 absolute my-8 left-4" />
          </div>
          <div className="pt-1 pb-4 flex-1">
            <button onClick={() => setShowAll(true)} className="text-gray-500 dark:text-gray-400 text-xs font-medium italic hover:text-red-600 dark:hover:text-red-400 transition-colors flex items-center gap-1 group-hover:text-red-600">
              {hiddenCount} और माइलस्टोन <ChevronDown size={12} className="group-hover:translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      )}

      {showAll && (
        <div className="flex gap-4 relative">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 flex items-center justify-center" />
          </div>
          <div className="pt-1 pb-4 flex-1">
            <button onClick={() => setShowAll(false)} className="text-red-600 dark:text-red-400 text-xs font-medium hover:underline flex items-center gap-1">
              <ChevronUp size={12} /> कम दिखाएं
            </button>
          </div>
        </div>
      )}

      {lastThree.map((item, idx) => (
        <CompactTimelineItem
          key={`last-${item.id || idx}`}
          year={item.year}
          text={item.title}
          isLast={idx === lastThree.length - 1}
        />
      ))}
    </>
  );
});
TimelineSection.displayName = 'TimelineSection';

// ─── Sidebar Components ──────────────────────────────────
const FamilyRelations = memo(({ relations = [] }) => {
  if (!relations.length) return null;
  return (
    <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
        <Users size={20} className="text-red-600 dark:text-red-400" /> संबंधित सेलिब्रिटी
      </h3>
      <div className="space-y-4">
        {relations.map(item => (
          <div key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 hover:scale-[1.02] transition-all">
            <div className="relative w-14 h-14 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700 flex-shrink-0">
              {item.celebrity?.avatar?.url ? (
                <Image src={item.celebrity.avatar.url} alt={item.celebrity.name} fill className="object-cover object-top" sizes="56px" quality={60} />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><User size={22} className="text-gray-500" /></div>
              )}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{item.celebrity?.name || 'अज्ञात'}</p>
              <p className="text-[12px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">{item.relation}</p>
            </div>
            {item.celebrity?.slug && (
              <a href={`/celebrities/${item.celebrity.slug}`} className="text-xs font-bold text-red-600 dark:text-red-400 hover:underline">प्रोफाइल देखें →</a>
            )}
          </div>
        ))}
      </div>
    </div>
  );
});
FamilyRelations.displayName = 'FamilyRelations';

const CelebrityPhotos = memo(({ galleries = [] }) => {
  if (!galleries.length) return null;
  const featured = galleries.slice(0, 4);
  return (
    <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><ImageIcon className="text-red-600" size={22} /> नवीनतम तस्वीरें</h3>
      <div className="grid grid-cols-1 md:grid-cols-1 lg:grid-cols-1 gap-6 lg:gap-8">
        {featured.map(gallery => {
          const photos = gallery.photos || [];
          const mainImg = photos[0]?.url;
          const thumb1 = photos[1]?.url || mainImg;
          const thumb2 = photos[2]?.url || mainImg;
          const extraCount = photos.length > 3 ? `+${photos.length - 3}` : '+1';
          return (
            <Link key={gallery.id} href={`/photos/${gallery.slug}`} className="group block">
              <div className="flex gap-2 h-[220px] sm:h-[200px] mb-4">
                <div className="relative w-1/2 h-full rounded-lg overflow-hidden shadow-lg border border-white/20 dark:border-white/10">
                  {mainImg ? (
                    <Image 
                      src={mainImg} 
                      alt={gallery.title} 
                      fill 
                      sizes="(max-width: 768px) 60vw, 30vw" 
                      quality={65}
                      className="object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center"><ImageIcon className="text-gray-400" /></div>
                  )}
                </div>
                <div className="flex flex-col w-1/2 gap-2 h-full">
                  <div className="relative h-1/2 rounded-lg overflow-hidden shadow-md border border-white/20 dark:border-white/10">
                    {thumb1 && (
                      <Image 
                        src={thumb1} 
                        alt="" 
                        fill 
                        sizes="(max-width: 768px) 40vw, 20vw" 
                        quality={60}
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                      />
                    )}
                  </div>
                  <div className="relative h-1/2 rounded-lg overflow-hidden shadow-md border border-white/20 dark:border-white/10">
                    {thumb2 && (
                      <Image 
                        src={thumb2} 
                        alt="" 
                        fill 
                        sizes="(max-width: 768px) 40vw, 20vw" 
                        quality={60}
                        className="object-cover brightness-75" 
                      />
                    )}
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                      <span className="bg-white/90 dark:bg-gray-900/90 px-3 py-1.5 rounded-lg text-sm font-bold text-gray-900 dark:text-white">{extraCount}</span>
                    </div>
                  </div>
                </div>
              </div>
              <h4 className="text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-red-500 transition-colors">{gallery.title}</h4>
            </Link>
          );
        })}
      </div>
    </div>
  );
});
CelebrityPhotos.displayName = 'CelebrityPhotos';

const TopAnotherCelebrityBadge = memo(({ celebrity }) => {
  if (!celebrity) return null;
  return (
    <div className="rounded-xl shadow-md border border-yellow-400 bg-yellow-50 dark:bg-yellow-900/30 p-6 hover:shadow-lg transition-all duration-300">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
        <Crown size={20} /> टॉप सेलिब्रिटी स्पॉटलाइट
      </h3>
      <div className="flex items-center gap-4">
        <div className="relative w-20 h-20 rounded-full overflow-hidden border-4 border-yellow-400 shadow-lg bg-gray-100 flex-shrink-0">
          {celebrity.avatar?.url ? (
            <Image 
              src={celebrity.avatar.url} 
              alt={celebrity.name} 
              fill 
              className="object-cover object-top" 
              sizes="80px" 
              quality={70}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200"><User size={32} className="text-gray-500" /></div>
          )}
        </div>
        <div className="flex-1">
          <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{celebrity.name}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{celebrity.popularname || celebrity.slug?.toUpperCase()}</p>
          <Link href={`/celebrities/${celebrity.slug}`} className="inline-block px-4 py-2 bg-yellow-400 text-gray-900 font-bold rounded-lg hover:bg-yellow-500 transition-colors">प्रोफाइल देखें →</Link>
        </div>
      </div>
    </div>
  );
});
TopAnotherCelebrityBadge.displayName = 'TopAnotherCelebrityBadge';

function NotFoundState() {
  return <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center text-gray-900 dark:text-gray-100">सेलिब्रिटी नहीं मिला</div>;
}

// ─── Main Component ──────────────────────────────────────

export default memo(function CelebrityProfilePage({ 
  slug, 
  initialData, 
  allCelebrities = [], 
  topCelebrity: topCelebrityProp = null  // new prop – compute on server for best performance
}) {
  const celebrity = initialData;
  const [isBioExpanded, setIsBioExpanded] = useState(false);
  const [showCaption, setShowCaption] = useState(false);

  // Memoized derived data
  const avatarUrl = celebrity?.Avatar?.url || celebrity?.avatar?.url;
  const birthdate = celebrity?.Birthdate || celebrity?.birthdate;
  const deathdate = celebrity?.deathDate || celebrity?.deathdate;
  const age = useMemo(() => calculateAge(birthdate, deathdate), [birthdate, deathdate]);

  const latestMovies = useMemo(() => 
    (celebrity?.movies || [])
      .filter(m => m?.releaseType === 'released')
      .sort((a, b) => new Date(b?.releaseDate) - new Date(a?.releaseDate)),
    [celebrity?.movies]
  );

  const upcomingMovies = useMemo(() => 
    (celebrity?.movies || [])
      .filter(m => m?.releaseType === 'upcoming')
      .sort((a, b) => new Date(a?.releaseDate) - new Date(b?.releaseDate)),
    [celebrity?.movies]
  );

  const articles = celebrity?.articles || [];

  // Use the passed topCelebrity if available, otherwise compute (fallback)
  const topAnotherCelebrity = useMemo(() => {
    if (topCelebrityProp) return topCelebrityProp;
    // fallback (client‑side) – remove this if you always pass the prop
    if (!allCelebrities || allCelebrities.length === 0) return null;
    return allCelebrities
      .filter(c => c?.slug && c.slug !== celebrity?.slug && c.trandingRank != null)
      .sort((a, b) => (a.trandingRank ?? 9999) - (b.trandingRank ?? 9999))[0] || null;
  }, [topCelebrityProp, allCelebrities, celebrity?.slug]);

  const captionText = celebrity?.avatar?.caption || celebrity?.name || "Celebrity photo";

  // Memoized callbacks
  const toggleBio = useCallback(() => setIsBioExpanded(prev => !prev), []);
  const toggleCaption = useCallback((state) => setShowCaption(state), []);

  if (!celebrity) return <NotFoundState />;

  // SEO JSON‑LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    "name": celebrity.name,
    "alternateName": celebrity.popularname || undefined,
    "description": celebrity.tagline || celebrity.bio || undefined,
    "birthDate": birthdate || undefined,
    "deathDate": deathdate || undefined,
    "nationality": celebrity?.personalLife?.nationality || undefined,
    "jobTitle": celebrity?.professions?.map(p => p.name).join(', ') || undefined,
    "url": `https://yourdomain.com/celebrities/${celebrity.slug}`,
    "image": avatarUrl || undefined,
  };

  return (
    <>
      <Head>
        <title>{celebrity.name} – Profile, Movies, Awards & More</title>
        <meta name="description" content={`${celebrity.name} – ${celebrity.tagline || 'Celebrity profile with movies, awards, and biography'}`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </Head>

      <div className="max-w-7xl mx-auto px-4 py-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">

        {/* ─── Hero Section ──────────────────────────────────── */}
        <section className="rounded-2xl relative w-full h-[200px] sm:h-[300px] lg:h-[500px] overflow-hidden">
          <div className="absolute inset-0">
            {celebrity?.profile_bg_poster?.url ? (
              <Image
                src={celebrity.profile_bg_poster.url}
                alt="बैकग्राउंड पोस्टर"
                fill
                priority
                quality={80}
                className="object-cover object-top"
                sizes="100vw"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-black" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent z-10" />
          </div>

          {/* Desktop: avatar + content inside backdrop */}
          <div className="hidden lg:block relative z-20 max-w-7xl mx-auto px-4 sm:px-6 h-full">
            <div className="flex flex-row items-end justify-between h-full pb-16">
              {/* Avatar */}
              <div className="relative" onMouseEnter={() => toggleCaption(true)} onMouseLeave={() => toggleCaption(false)}>
                <div className="relative w-52 h-64 rounded-full overflow-hidden border-4 border-white/40 bg-white/10 shadow-2xl shrink-0">
                  {avatarUrl ? (
                    <Image
                      src={avatarUrl}
                      alt={celebrity?.name}
                      fill
                      priority
                      sizes="(max-width: 768px) 100vw, 208px"
                      className="object-cover"
                    />
                  ) : (
                    <User size={48} className="text-white m-auto" />
                  )}
                </div>
                <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-50 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 text-pink-600 dark:text-pink-400 rounded-full p-1.5 shadow-md cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-700">
                  <Info size={12} />
                </div>
                {showCaption && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                    <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs sm:text-sm rounded-lg px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                      <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">छवि स्रोत:</span>
                      <span className="text-gray-900 dark:text-white">{captionText?.length > 40 ? captionText.substring(0, 40) + '...' : captionText}</span>
                    </div>
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white dark:bg-gray-800 rotate-45 border-l border-t border-gray-200 dark:border-gray-700" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 text-center lg:text-left space-y-3 lg:space-y-3 px-10">
                <h2 className="text-[20px] sm:text-[24px] lg:text-[34px] font-black text-white leading-tight">{celebrity?.name}</h2>
                {celebrity?.popularname && <p className="text-xs sm:text-sm lg:text-base text-white/60 font-semibold tracking-wide italic"><span className="font-semibold">{celebrity.popularname}</span></p>}
                {celebrity?.professions?.length > 0 && (
                  <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                    {celebrity.professions.map(p => <span key={p.id} className="px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md">{p.name}</span>)}
                  </div>
                )}
                {celebrity?.tagline && <p className="max-w-xl mx-auto lg:mx-0 text-base sm:text-lg italic text-white/90 leading-relaxed font-light">“{celebrity.tagline}”</p>}
                {celebrity?.social_account?.length > 0 && (
                  <div className="flex justify-center lg:justify-start pt-3">
                    <div className="inline-flex items-center gap-3 bg-black/30 backdrop-blur-xl px-4 py-2.5 rounded-2xl border border-white/10 hover:bg-black/40 transition-all">
                      <span className="text-[11px] uppercase tracking-[0.25em] text-white/60 font-bold">सोशल रीच</span>
                      {celebrity.social_account.slice(0, 3).map(s => <SocialIconBadge key={s.id} social={s} />)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── Mobile: Avatar + Content ────────────────────── */}
        <div className="block lg:hidden max-w-7xl mx-auto px-4 relative z-30 -mt-12 mb-6">
          <div className="relative mx-auto mb-4" onMouseEnter={() => toggleCaption(true)} onMouseLeave={() => toggleCaption(false)}>
            <div className="relative w-24 h-32 mx-auto rounded-full overflow-hidden border-4 border-white dark:border-gray-800 bg-white/10 shadow-2xl">
              {avatarUrl ? (
                <Image 
                  src={avatarUrl} 
                  alt={celebrity?.name} 
                  fill 
                  priority
                  sizes="96px" 
                  className="object-cover" 
                />
              ) : (
                <User size={48} className="text-gray-500 m-auto" />
              )}
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-50 bg-white/95 hover:bg-white dark:bg-gray-800/95 dark:hover:bg-gray-800 text-pink-600 dark:text-pink-400 rounded-full p-1.5 shadow-md cursor-pointer transition-all duration-200 border border-gray-200 dark:border-gray-700">
              <Info size={12} />
            </div>
            {showCaption && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50">
                <div className="bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs rounded-lg px-3 py-2 shadow-lg border border-gray-200 dark:border-gray-700 whitespace-nowrap">
                  <span className="font-medium text-gray-500 dark:text-gray-400 mr-1">छवि स्रोत:</span>
                  <span className="text-gray-900 dark:text-white">{captionText?.length > 35 ? captionText.substring(0, 35) + '...' : captionText}</span>
                </div>
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white dark:bg-gray-800 rotate-45 border-l border-t border-gray-200 dark:border-gray-700" />
              </div>
            )}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-black text-gray-900 dark:text-white mb-2">{celebrity?.name}</h2>
            {celebrity?.popularname && <p className="text-xs text-gray-600 dark:text-gray-400 font-semibold tracking-wide italic mb-3">{celebrity.popularname}</p>}
            {celebrity?.professions?.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-3">
                {celebrity.professions.map(p => <span key={p.id} className="px-3 py-1 rounded-full bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-400 text-xs font-semibold">{p.name}</span>)}
              </div>
            )}
            {celebrity?.tagline && <p className="text-sm italic text-gray-700 dark:text-gray-300 leading-relaxed max-w-md mx-auto mb-3">“{celebrity.tagline}”</p>}
            {celebrity?.social_account?.length > 0 && (
              <div className="flex justify-center">
                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700">
                  <span className="text-[9px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400 font-bold">सोशल</span>
                  {celebrity.social_account.slice(0, 3).map(s => <SocialIconBadge key={s.id} social={s} />)}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─── Stats ────────────────────────────────────────── */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4 lg:mt-[-12] mb-8 z-40 relative">
          <StatCard icon={<Film size={14} />} label="फिल्में" value={celebrity?.total_movies || 0} />
          <StatCard icon={<ScreenShare size={14} />} label="शो" value={celebrity?.total_tvshows || 0} />
          <StatCard icon={<MonitorPlay size={14} />} label="वेब सीरीज" value={celebrity?.total_webseries || 0} />
          <StatCard icon={<Award size={14} />} label="अवॉर्ड" value={celebrity?.total_awards || 0} />
          <StatCard icon={<Clock size={14} />} label={deathdate ? "मृत्यु के समय आयु" : "आयु"} value={age ? `${age} वर्ष` : 'N/A'} />
          <StatCard icon={<TrendingUp size={14} />} label="नेट वर्थ" value={celebrity?.personalLife?.netWorth || 'N/A'} isGreen />
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8 lg:mt-12">

          {/* ─── Sidebar (desktop only) ────────────────────── */}
          <div className="hidden lg:block lg:col-span-4 space-y-6 sticky top-20 self-start">
            {/* पारिवारिक विवरण */}
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Users size={20} className="text-red-600 dark:text-red-400" /> पारिवारिक विवरण
              </h2>
              <div className="space-y-4">
                <SidebarRow label="पिता" value={celebrity?.familyDetails?.father} />
                <SidebarRow label="माता" value={celebrity?.familyDetails?.mother} />
                <SidebarRow label="जीवनसाथी" value={celebrity?.familyDetails?.spouse} />
                <SidebarRow label="बहन" value={celebrity?.familyDetails?.sister} />
                <SidebarRow label="भाई" value={celebrity?.familyDetails?.brother} />
                <SidebarRow label="बच्चे" value={celebrity?.familyDetails?.children} />
              </div>
            </div>

            {/* व्यक्तिगत जीवन */}
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <h2 className="text-lg font-bold mb-6 flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                <Sparkles size={20} className="text-yellow-600 dark:text-yellow-400" /> व्यक्तिगत जीवन
              </h2>
              <div className="space-y-5">
                <InfoItem icon={<MapPin size={18} className="text-red-600 dark:text-red-400" />} label="गृहनगर" value={celebrity?.personalLife?.hometown} />
                <InfoItem icon={<GraduationCap size={18} className="text-red-600 dark:text-red-400" />} label="शिक्षा" value={celebrity?.personalLife?.education} />
                <InfoItem icon={<Heart size={18} className="text-red-600 dark:text-red-400" />} label="धर्म" value={celebrity?.personalLife?.religion} />
                <InfoItem icon={<Cake size={18} className="text-red-600 dark:text-red-400" />} label="जन्म तिथि" value={celebrity?.birthdate} />
                {celebrity?.deathdate && (
                  <InfoItem icon={<Star size={18} className="text-red-600 dark:text-red-400" />} label="मृत्यु की तारीख" value={celebrity.deathdate} />
                )}
                <SidebarRow label="शौक" value={celebrity?.personalLife?.hobbies} isVertical />
                <SidebarRow label="वैवाहिक स्थिति" value={celebrity?.personalLife?.maritalStatus} />
                <SidebarRow label="वर्तमान पता" value={celebrity?.personalLife?.current_address} />
                <SidebarRow label="राष्ट्रीयता" value={celebrity?.personalLife?.nationality} />
                <SidebarRow label="ऊंचाई" value={celebrity?.personalLife?.height} />
              </div>
            </div>

            <FamilyRelations relations={celebrity?.relatedCelebrity || []} />
            <CelebrityPhotos galleries={celebrity?.galleries || []} />
            {topAnotherCelebrity && <TopAnotherCelebrityBadge celebrity={topAnotherCelebrity} />}
          </div>

          {/* ─── Main Content ──────────────────────────────── */}
          <div className="lg:col-span-8 space-y-8 scroll-auto">
            {/* Biography */}
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <User className="text-red-600 dark:text-red-400" /> जीवनी
              </h2>
              {celebrity?.tagline && (
                <div className="mb-8 p-6 bg-gray-50 dark:bg-gray-800/50 border-l-4 border-red-500 dark:border-red-400 rounded-r-2xl relative overflow-hidden group">
                  <Quote className="absolute -right-2 -top-2 w-16 h-16 text-gray-200 dark:text-gray-600 rotate-12 group-hover:rotate-0 transition-transform duration-700" />
                  <p className="text-xl italic text-gray-700 dark:text-gray-200 leading-relaxed relative z-10 font-serif">"{celebrity.tagline}"</p>
                </div>
              )}
              <div className={`relative ${!isBioExpanded ? 'max-h-48 overflow-hidden' : ''}`}>
                <div className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ p: ({ children }) => <p className="mb-4 whitespace-pre-line">{children}</p>, li: ({ children }) => <li className="ml-5 list-disc">{children}</li> }}>
                    {celebrity?.bio || celebrity?.Bio || ''}
                  </ReactMarkdown>
                </div>
                {!isBioExpanded && <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />}
              </div>
              <button onClick={toggleBio} className="mt-4 text-red-600 dark:text-red-400 font-bold flex items-center gap-1 hover:text-red-500 transition-colors">
                {isBioExpanded ? 'कम पढ़ें' : 'और पढ़ें'}
                {isBioExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
            </div>

            {/* Awards */}
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Award className="text-amber-500 dark:text-amber-400" /> अवॉर्ड और सम्मान
              </h3>
              {celebrity?.awards?.length > 0 ? (
                <AwardsSection awards={celebrity.awards} />
              ) : (
                <p className="text-gray-500 col-span-full text-center py-8">कोई अवॉर्ड डेटा उपलब्ध नहीं है</p>
              )}
            </div>

            {/* Career Timeline */}
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Clock className="text-red-600 dark:text-red-400" size={18} /> करियर सफर
              </h3>
              <div className="ml-2">
                {celebrity?.carrerTimeline?.length > 0 ? (
                  <TimelineSection items={celebrity.carrerTimeline} />
                ) : (
                  <p className="text-gray-500 text-center py-8">कोई करियर टाइमलाइन उपलब्ध नहीं है</p>
                )}
              </div>
            </div>

            {/* Movies */}
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <Film className="text-red-600 dark:text-red-400" /> प्रमुख फिल्में
              </h3>
              {latestMovies.length > 0 && (
                <div className="mb-10">
                  <SectionHeader title="नवीनतम रिलीज" icon={<Star />} />
                  <MoviesSection movies={latestMovies} />
                </div>
              )}
              {upcomingMovies.length > 0 && (
                <div>
                  <SectionHeader title="आगामी फिल्में" icon={<Calendar />} />
                  <MoviesSection movies={upcomingMovies} isUpcoming />
                </div>
              )}
              {!latestMovies.length && !upcomingMovies.length && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">कोई फिल्म उपलब्ध नहीं है।</p>
              )}
            </div>

            {/* Articles */}
            <div className="rounded-xl shadow-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 hover:shadow-lg transition-all duration-300">
              <h3 className="text-xl font-bold mb-8 flex items-center gap-2 text-gray-900 dark:text-gray-100">
                <FileText className="text-red-600 dark:text-red-400" /> आर्टिकल
              </h3>
              {articles.length > 0 ? (
                <ArticlesSection articles={articles} />
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-8">कोई आर्टिकल उपलब्ध नहीं है।</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
});