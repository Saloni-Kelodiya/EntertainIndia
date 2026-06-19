"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import { webStoriesAPI } from "../lib/api";
import { getStrapiMedia } from "../lib/constants";
import {
  X,
  ChevronLeft,
  ChevronRight,
  Share2,
  MoreVertical,
  BookOpen,
} from "lucide-react";

export default function SingleWebStory({ params = {} }) {
  const { slug } = params;
  const router = useRouter();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const SLIDE_DURATION = 4000;

  // ✅ Disable scroll while story is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // ✅ Fetch Story
  useEffect(() => {
    const fetchStory = async () => {
      setLoading(true);
      try {
        const data = await webStoriesAPI.getBySlug(slug);
        console.log("Web Story Data in Component:", data);
        console.log("Related Stories in Component:", data?.relatedStories);
        setStory(data);
        setActiveIndex(0);
      } catch (error) {
        // ignore
      } finally {
        setLoading(false);
      }
    };
    fetchStory();
  }, [slug]);

  const slides = story?.slides || [];
  const relatedStories = story?.relatedStories || [];

  // ✅ Combine slides with related stories as the last slide
  const allSlides = [...slides];
  if (relatedStories.length > 0) {
    allSlides.push({ isRelatedSlide: true, title: "Related Stories" });
  }

  // ✅ Auto slide
  useEffect(() => {
    if (!allSlides.length || isPaused) return;
    const timer = setTimeout(nextSlide, SLIDE_DURATION);
    return () => clearTimeout(timer);
  }, [activeIndex, isPaused, allSlides]);

  // ✅ Keyboard Controls
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "ArrowRight") nextSlide();
      if (e.key === "ArrowLeft") prevSlide();
      if (e.key === "Escape") router.back();
      if (e.code === "Space") setIsPaused((prev) => !prev);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activeIndex, allSlides]);

  const nextSlide = () => {
    if (activeIndex < allSlides.length - 1) {
      setActiveIndex((prev) => prev + 1);
    } else {
      console.log("Already at the last slide");
    }
  };

  const prevSlide = () => {
    if (activeIndex > 0) {
      setActiveIndex((prev) => prev - 1);
    }
  };

  // ✅ Touch Events
  const onTouchStart = (e) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const onTouchMove = (e) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const onTouchEnd = () => {
    setIsPaused(false);
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) nextSlide();
    if (diff < -50) prevSlide();
  };

  // ✅ Share
  const handleShare = async () => {
    if (typeof window === 'undefined') return;

    const url = typeof window !== 'undefined' ? window.location.href : '';
    if (navigator.share) {
      await navigator.share({
        title: story.title,
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      alert("Link copied!");
    }
  };

  if (loading)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Loading...
      </div>
    );

  if (!story)
    return (
      <div className="h-screen bg-black flex items-center justify-center text-white">
        Story not found
      </div>
    );

  const activeSlide = allSlides[activeIndex];

  return (
    <>
      <Head>
        <title>{story.title}</title>
        <style>{`
          @keyframes fillProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
        `}</style>
      </Head>

      {/* 🌑 MASTER CONTAINER */}
      <div className="min-h-screen bg-black flex items-center justify-center pt-24 pb-10 px-2 overflow-hidden relative">

        {/* 🖥️ Blurred Backdrop */}
        <div className="absolute inset-0 hidden md:block opacity-30 pointer-events-none">
          <img
            src={getStrapiMedia(activeSlide?.image?.url)}
            className="w-full h-full object-cover blur-3xl scale-125"
            alt="backdrop"
          />
        </div>

        {/* 📱 STORY CARD */}
        <div
          className="relative w-full max-w-[380px] sm:max-w-md 
          h-[82vh] sm:h-[85vh] 
          aspect-[9/16] 
          bg-[#111] rounded-2xl shadow-2xl overflow-hidden 
          flex flex-col border border-white/10"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onMouseDown={() => setIsPaused(true)}
          onMouseUp={() => setIsPaused(false)}
        >
          {/* 🖼️ IMAGE */}
          <div className="absolute inset-0 z-0">
            {activeSlide?.isRelatedSlide ? (
              <div className="w-full h-full bg-[#0a0a0a]" />
            ) : (
              <img
                src={getStrapiMedia(activeSlide?.image?.url)}
                alt={activeSlide?.title}
                className="w-full h-full object-cover"
                loading="eager"
              />
            )}
          </div>

          {/* 🌑 GRADIENTS */}
          <div className="absolute inset-0 z-10 flex flex-col justify-between pointer-events-none">
            <div className="h-24 bg-gradient-to-b from-black/80 to-transparent" />
            <div className="h-[55%] bg-gradient-to-t from-black via-black/70 to-transparent" />
          </div>

          {/* 📊 PROGRESS BARS */}
          <div className="absolute top-3 left-3 right-3 z-50 flex gap-1.5 h-1">
            {allSlides.map((_, index) => (
              <div key={index} className="flex-1 bg-white/30 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white"
                  style={{
                    width:
                      index < activeIndex
                        ? "100%"
                        : index === activeIndex
                          ? "100%"
                          : "0%",
                    animationName:
                      index === activeIndex ? "fillProgress" : "none",
                    animationDuration: `${SLIDE_DURATION}ms`,
                    animationTimingFunction: "linear",
                    animationPlayState: isPaused ? "paused" : "running",
                    animationFillMode: "forwards",
                  }}
                />
              </div>
            ))}
          </div>

          {/* 🔘 CONTROLS */}
          <div className="absolute top-7 left-0 right-0 z-50 px-5 flex justify-between">
            <button
              onClick={() => router.back()}
              className="p-2 rounded-full bg-black/30 text-white"
            >
              <X size={20} />
            </button>

            <div className="flex gap-3">
              <button onClick={handleShare} className="p-2 rounded-full bg-black/30 text-white">
                <Share2 size={20} />
              </button>
              <button className="p-2 rounded-full bg-black/30 text-white">
                <MoreVertical size={20} />
              </button>
            </div>
          </div>

          {/* 👆 CLICK ZONES */}
          <div className="absolute inset-0 z-40 flex">
            <div className="w-1/3" onClick={prevSlide} />
            <div className="w-1/3" />
            <div className="w-1/3" onClick={nextSlide} />
          </div>

          {/* 📝 TEXT CONTENT */}
          <div className="absolute inset-0 z-50 p-6 flex flex-col justify-end">
            {activeSlide?.isRelatedSlide ? (
              <div className="h-full w-full flex flex-col pt-12 pb-4">
                <h2 className="text-white text-xl font-bold mb-4 text-center">
                  More Stories for You
                </h2>

                <div className="grid grid-cols-2 gap-3 flex-1 overflow-y-auto no-scrollbar pb-16">
                  {relatedStories.map((item, idx) => (
                    <div
                      key={item.id}
                      onClick={() => router.push(`/web-stories/${item.slug}`)}
                      className="relative aspect-[3/4] rounded-xl overflow-hidden group cursor-pointer border border-white/10"
                    >
                      <img
                        src={getStrapiMedia(item.thumbnail?.url)}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white text-[10px] sm:text-xs font-semibold line-clamp-2 leading-tight">
                          {item.title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="absolute bottom-6 left-6 right-6 pointer-events-auto">
                  <button
                    onClick={() => router.push('/web-stories')}
                    className="w-full bg-[#c00] hover:bg-red-700 text-white py-3 rounded-full text-sm font-bold transition-colors shadow-lg"
                  >
                    See More Stories
                  </button>
                </div>
              </div>
            ) : (
              <div className="pointer-events-none">
                <h1 className="text-white text-2xl font-bold">
                  {activeSlide?.title || activeSlide?.heading}
                </h1>

                {activeSlide?.description && (
                  <p className="text-gray-300 text-sm mt-2">
                    {activeSlide?.description}
                  </p>
                )}

                <div className="flex justify-center pt-4 pointer-events-auto">
                  <button className="bg-white text-black px-6 py-2 rounded-full text-xs font-bold">
                    <BookOpen size={14} className="inline mr-2" />
                    Read Full Story
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 🖥️ DESKTOP ARROWS */}
        <button onClick={prevSlide} className="hidden md:flex absolute left-4 text-white">
          <ChevronLeft size={28} />
        </button>

        <button onClick={nextSlide} className="hidden md:flex absolute right-4 text-white">
          <ChevronRight size={28} />
        </button>
      </div>
    </>
  );
}