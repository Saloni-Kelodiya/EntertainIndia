"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { galleriesAPI } from "../lib/api";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Download,
  Share2,
  Calendar,
  MapPin,
  Tag,
  Camera,
  ArrowLeft,
  Info,
} from "lucide-react";

export default function GalleryPage({ slug, initialGallery, initialRelated }) {
  const [gallery, setGallery] = useState(initialGallery);
  const [related, setRelated] = useState(initialRelated || []);
  const [loading, setLoading] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const thumbnailsRef = useRef(null);

  // ─── Scroll to top on mount ───────────────────────────────────────────────
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, []);

  // ─── Fetch gallery data ───────────────────────────────────────────────────
  useEffect(() => {
    const fetchGallery = async () => {
      setLoading(true);
      try {
        const data = await galleriesAPI.getBySlug(slug);
        setGallery(data);
        if (data?.slug) {
          const relatedData = await galleriesAPI.getRelated(data.slug, 6);
          setRelated(relatedData);
        }
      } catch (error) {
        console.error("गैलरी लोड करने में त्रुटि:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGallery();
  }, [slug]);

  // ─── Navigation handlers (memoized) ──────────────────────────────────────
  const showNext = useCallback(
    (e) => {
      e?.stopPropagation();
      if (gallery?.photos?.length) {
        setCurrentIndex((prev) => (prev + 1) % gallery.photos.length);
      }
    },
    [gallery?.photos?.length]
  );

  const showPrev = useCallback(
    (e) => {
      e?.stopPropagation();
      if (gallery?.photos?.length) {
        setCurrentIndex(
          (prev) => (prev - 1 + gallery.photos.length) % gallery.photos.length
        );
      }
    },
    [gallery?.photos?.length]
  );

  // ─── Keyboard navigation ──────────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "ArrowRight") showNext();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
      if (e.key === "i" && isLightboxOpen) setShowInfo((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showNext, showPrev, isLightboxOpen]);

  // ─── Auto-scroll active thumbnail into view ───────────────────────────────
  useEffect(() => {
    if (thumbnailsRef.current) {
      const activeThumb = thumbnailsRef.current.children[currentIndex];
      if (activeThumb) {
        activeThumb.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, [currentIndex]);

  // ─── Prevent body scroll when lightbox open ───────────────────────────────
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      setShowInfo(false);
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  // ─── Download current photo ───────────────────────────────────────────────
  const handleDownload = useCallback(async () => {
    const photo = gallery?.photos?.[currentIndex];
    if (!photo?.image?.url) return;
    try {
      const response = await fetch(photo.image.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${gallery.slug}-${currentIndex + 1}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      window.open(photo.image.url, "_blank");
    }
  }, [gallery, currentIndex]);

  // ─── Share ────────────────────────────────────────────────────────────────
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: gallery?.title,
        url: window.location.href,
      });
    }
  }, [gallery?.title]);

  // ─── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-pink-600 dark:border-pink-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-400 dark:text-gray-500 font-medium tracking-widest uppercase text-xs">
            गैलरी लोड हो रही है...
          </p>
        </div>
      </div>
    );
  }

  // ─── Not found state ──────────────────────────────────────────────────────
  if (!gallery) {
    return (
      <div className="min-h-screen bg-white dark:bg-black flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl text-gray-900 dark:text-white font-bold mb-4">
            गैलरी नहीं मिली
          </h2>
          <Link
            href="/fashion"
            className="text-pink-600 dark:text-pink-500 hover:text-pink-500 dark:hover:text-pink-400 flex items-center justify-center gap-2"
          >
            <ArrowLeft size={20} /> फैशन पर वापस जाएं
          </Link>
        </div>
      </div>
    );
  }

  const currentPhoto = gallery.photos?.[currentIndex];
 
  // ─── Main render ──────────────────────────────────────────────────────────
  return (
    <>
      <div className="w-full px-4 py-4 bg-[#f6f6f6] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">

          {/* ── Gallery Card ── */}
          <div className="flex flex-col lg:flex-row bg-white dark:bg-gray-900 rounded-3xl overflow-hidden border border-gray-100 dark:border-gray-800 lg:h-[700px]">

            {/* ── Sidebar ── */}
            <aside className="w-full lg:w-[340px] lg:max-w-[340px] flex-shrink-0 p-4 lg:border-r border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="flex flex-col h-full space-y-4">

                {/* Category badge */}
                <div className="flex-shrink-0">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-pink-50 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 text-[9px] font-bold uppercase tracking-widest">
                    {gallery.fashionCategory || "फोटोशूट"}
                  </span>
                </div>

                {/* Title & celebrity */}
                <div className="flex-shrink-0">
                  <h1 className="text-xl font-bold leading-tight mb-1 text-gray-900 dark:text-white uppercase">
                    {gallery.title}
                  </h1>
                  {gallery.celebrity_name && (
                    <p className="text-pink-600 dark:text-pink-500 font-semibold text-sm">
                      {gallery.celebrity_name}
                    </p>
                  )}
                  <div className="mt-2 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <Camera size={12} className="text-pink-400 dark:text-pink-500" />
                    {gallery.photos?.length} फोटो
                  </div>
                </div>

                {/* Description — fixed height, scrollable, NO expand/collapse */}
                <div className="border-t border-gray-100 dark:border-gray-800 pt-3 flex-shrink-0 min-h-0">
                  <h3 className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-black mb-1.5">
                    विवरण
                  </h3>
                  <div
                    className="text-gray-500 dark:text-gray-400 leading-relaxed text-[15px] pr-1 custom-scroll"
                    style={{ height: "200px", overflowY: "auto" }}
                  >
                    {gallery.description ||
                      "एक्सक्लूसिव फैशन गैलरी जिसमें नवीनतम लुक और ट्रेंड्स शामिल हैं।"}
                  </div>
                </div>

                {/* Details — event / location / date */}
                <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-800 pt-3 flex-shrink-0">
                  <h3 className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-black mb-1.5">
                    जानकारी
                  </h3>

                  {/* Event */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-pink-100 dark:bg-pink-900/40 flex items-center justify-center text-pink-600 dark:text-pink-400 flex-shrink-0">
                      <Tag size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase font-bold text-gray-400 dark:text-gray-500 leading-none mb-0.5">
                        कार्यक्रम
                      </p>
                      <p className="text-gray-900 dark:text-white font-bold text-[11px] truncate">
                        {gallery.event || "उपलब्ध नहीं"}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                      <MapPin size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase font-bold text-gray-400 dark:text-gray-500 leading-none mb-0.5">
                        स्थान
                      </p>
                      <p className="text-gray-900 dark:text-white font-bold text-[11px] truncate">
                        {gallery.location || "उपलब्ध नहीं"}
                      </p>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                    <div className="w-7 h-7 rounded-lg bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center text-orange-600 dark:text-orange-400 flex-shrink-0">
                      <Calendar size={14} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-[8px] uppercase font-bold text-gray-400 dark:text-gray-500 leading-none mb-0.5">
                        तारीख
                      </p>
                      <p className="text-gray-900 dark:text-white font-bold text-[11px] truncate">
                        {gallery.event_date ||
                          (gallery.publishedAt
                            ? new Date(gallery.publishedAt).toLocaleDateString(
                                "hi-IN",
                                { month: "short", year: "numeric" }
                              )
                            : "जल्द आ रहा है")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex-shrink-0 mt-auto">
                  <div className="flex gap-2">
                    <button
                      onClick={handleDownload}
                      className="flex-1 h-10 rounded-xl bg-pink-600 hover:bg-pink-700 text-white text-[10px] font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-colors active:scale-95"
                    >
                      <Download size={14} /> डाउनलोड
                    </button>
                    <button
                      onClick={handleShare}
                      className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-400 dark:text-gray-500 transition-colors active:scale-95"
                    >
                      <Share2 size={16} />
                    </button>
                  </div>
                </div>

              </div>
            </aside>

            {/* ── Main viewer ── */}
            <main className="flex-1 min-w-0  flex flex-col">

              {/* Image area — fills remaining height, sidebar changes won't affect it */}
              <div
                className="relative h-[50vh] md:flex-1 bg-black/5 dark:bg-black/20 cursor-zoom-in"
                onClick={() => setIsLightboxOpen(true)}
              >
                <div className="absolute inset-0 flex items-center justify-center p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={currentIndex}
                    src={currentPhoto?.image?.url}
                    alt={currentPhoto?.caption || gallery.title}
                    className="max-w-full max-h-full w-auto h-auto object-contain select-none"
                    onContextMenu={(e) => e.preventDefault()}
                    draggable={false}
                    style={{ pointerEvents: "none" }}
                    // priority image loads immediately; rest are lazy
                    loading={currentIndex === 0 ? "eager" : "lazy"}
                  />
                </div>

                {/* Prev button */}
                <button
                  onClick={(e) => { showPrev(e); }}
                  className="absolute left-3 lg:left-6 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/80 dark:bg-black/80 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white hover:bg-pink-600 hover:text-white z-10 transition-colors"
                  aria-label="पिछली फोटो"
                >
                  <ChevronLeft size={24} />
                </button>

                {/* Next button */}
                <button
                  onClick={(e) => { showNext(e); }}
                  className="absolute right-3 lg:right-6 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-white/80 dark:bg-black/80 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-900 dark:text-white hover:bg-pink-600 hover:text-white z-10 transition-colors"
                  aria-label="अगली फोटो"
                >
                  <ChevronRight size={24} />
                </button>

                {/* Counter */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-black/70 text-[10px] lg:text-[11px] font-bold text-white z-10 pointer-events-none">
                  {currentIndex + 1} / {gallery.photos?.length}
                </div>

                {/* Fullscreen button */}
                <button
                  onClick={(e) => { e.stopPropagation(); setIsLightboxOpen(true); }}
                  className="absolute top-4 right-4 w-8 h-8 lg:w-10 lg:h-10 rounded-lg bg-white/80 dark:bg-black/80 border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-800 dark:text-gray-200 hover:text-pink-600 z-10 transition-colors"
                  aria-label="फुलस्क्रीन"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="15 3 21 3 21 9" />
                    <polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" />
                    <line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                </button>
              </div>

              {/* Thumbnails strip */}
              <div className="h-24 flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center py-3">
                <div
                  ref={thumbnailsRef}
                  className="flex gap-2 h-full overflow-x-auto scrollbar-hide scroll-smooth px-4 items-center"
                >
                  {gallery.photos.slice(0, 15).map((photo, index) => (
                    <button
                      key={photo.id || index}
                      onClick={() => setCurrentIndex(index)}
                      className={`relative flex-shrink-0 h-[75%] aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all ${
                        currentIndex === index
                          ? "border-pink-600 scale-105 shadow-lg"
                          : "border-transparent opacity-40 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={photo.image?.url}
                        className="w-full h-full object-cover"
                        alt={`थंबनेल ${index + 1}`}
                        draggable={false}
                        loading="lazy"
                      />
                    </button>
                  ))}

                  {gallery.photos.length > 15 && (
                    <button
                      onClick={() => setIsLightboxOpen(true)}
                      className="flex-shrink-0 h-[75%] aspect-[3/4] rounded-lg bg-gray-100 dark:bg-gray-800 flex flex-col items-center justify-center text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
                    >
                      <span className="text-sm font-bold">+{gallery.photos.length - 15}</span>
                      <span className="text-[8px] uppercase font-bold">फोटो</span>
                    </button>
                  )}
                </div>
              </div>

            </main>
          </div>

          {/* ── Related galleries ── */}
          {related.length > 0 && (
            <section className="mt-12">
              <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white">
                <span className="w-6 h-1 bg-pink-600 dark:bg-pink-500 rounded-full" />
                और भी गैलरी
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {related.map((g) => (
                  <Link
                    key={g.id}
                    href={`/photos/${g.slug}`}
                    className="group relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:-translate-y-1 transition-transform duration-300"
                  >
                    <Image
                      src={g?.image?.url || "/no-image.jpg"}
                      alt={g.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h4 className="text-[10px] font-bold line-clamp-2 text-white group-hover:text-pink-300 dark:group-hover:text-pink-400 uppercase leading-tight">
                        {g.title}
                      </h4>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ── Lightbox ── */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black flex items-center justify-center"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Top bar — counter + close */}
          <div className="absolute top-6 right-6 flex items-center gap-4 z-20">
            <span className="bg-white/10 px-3 py-1.5 rounded-full text-white/80 font-medium text-sm">
              {currentIndex + 1} / {gallery.photos?.length}
            </span>
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-pink-600 hover:border-pink-600 transition-colors"
              aria-label="बंद करें"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main image */}
          <div className="w-full h-full flex items-center justify-center max-w-[90vw] py-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={gallery.photos[currentIndex]?.image?.url}
              className="max-w-full max-h-full object-contain select-none"
              alt={currentPhoto?.caption || gallery.title}
              onClick={(e) => e.stopPropagation()}
              draggable={false}
            />
          </div>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); showPrev(); }}
            className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-pink-600 hover:border-pink-600 transition-colors z-10"
            aria-label="पिछली फोटो"
          >
            <ChevronLeft size={28} />
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); showNext(); }}
            className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white hover:bg-pink-600 hover:border-pink-600 transition-colors z-10"
            aria-label="अगली फोटो"
          >
            <ChevronRight size={28} />
          </button>

          {/* Info toggle button */}
          {!showInfo && (
            <button
              onClick={(e) => { e.stopPropagation(); setShowInfo(true); }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 w-12 h-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center transition-colors hover:bg-pink-600 text-white/80 hover:text-white"
              aria-label="छवि की जानकारी देखें"
            >
              <Info size={22} />
            </button>
          )}

          {/* Info panel */}
      {showInfo && (
  <div
    className="absolute bottom-0 left-0 right-0 bg-black/90 text-white z-20"
    onClick={(e) => e.stopPropagation()}
  >
    <div className="max-w-6xl mx-auto px-6 py-5 relative">
      <button
        onClick={() => setShowInfo(false)}
        className="absolute top-4 right-6 text-white/60 hover:text-white transition-colors"
        aria-label="बंद करें"
      >
        <X size={20} />
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pr-8">
        {/* बाईं ओर (Title, Caption) - अपरिवर्तित */}
        <div>
          <h3 className="text-xl font-bold text-white mb-1">{gallery.title}</h3>
          {currentPhoto?.caption && (
            <p className="text-white/70 text-xs leading-relaxed line-clamp-2">
              {currentPhoto.caption}
            </p>
          )}
        </div>

        {/* ✅ दाईं ओर - 2 कॉलम ग्रिड (Explicit Row/Col के साथ) */}
       <div className="grid grid-cols-2 gap-x-4 gap-y-3">
  
  {/* सेलिब्रिटी */}
  <div>
    <p className="text-[10px] uppercase text-white/50 font-semibold tracking-wider mb-1">
      सेलिब्रिटी
    </p>
    <p className="text-sm text-white font-medium">
      {currentPhoto?.caption || "जानकारी उपलब्ध नहीं"}
    </p>
  </div>

  {/* आयोजन */}
  <div>
    <p className="text-[10px] uppercase text-white/50 font-semibold tracking-wider mb-1">
      आयोजन
    </p>
    <p className="text-sm text-white font-medium">
      {gallery.event || "अनिर्धारित"}
    </p>
  </div>

  {/* ड्रेस ब्रांड */}
  {currentPhoto?.dressName && (
    <div>
      <p className="text-[10px] uppercase text-white/50 font-semibold tracking-wider mb-1">
        ड्रेस ब्रांड
      </p>
      <p className="text-sm text-white font-medium">
        {currentPhoto.dressName}
      </p>
    </div>
  )}

  {/* स्थान */}
  {gallery.location && (
    <div>
      <p className="text-[10px] uppercase text-white/50 font-semibold tracking-wider mb-1">
        स्थान
      </p>
      <p className="text-xs text-white/80">
        {gallery.location}
      </p>
    </div>
  )}

  {/* तिथि */}
  {gallery.event_date && (
    <div>
      <p className="text-[10px] uppercase text-white/50 font-semibold tracking-wider mb-1">
        तिथि
      </p>
      <p className="text-xs text-white/80">
        {new Date(gallery.event_date).toLocaleDateString("hi-IN", {
          month: "long",
          year: "numeric",
        })}
      </p>
    </div>
  )}

  {/* फोटो साभार - पूरी चौड़ाई */}
  <div className="col-span-2">
    <p className="text-[10px] uppercase text-white/50 font-semibold tracking-wider mb-1">
      फोटो साभार
    </p>
    <p className="text-xs text-white/80 leading-relaxed">
      {currentPhoto?.image?.caption || "कोई विवरण उपलब्ध नहीं"}
    </p>
  </div>

</div>
      </div>
    </div>
  </div>
)}
        </div>
      )}
    </>
  );
}