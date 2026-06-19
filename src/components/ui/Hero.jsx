"use client";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Link from "next/link";
import { Calendar, ArrowRight } from "lucide-react";

export default function Hero({ articles }) {
  // Filter  articles without slugs and sort by date (newest first)
  const latestArticles = [...articles]
    .filter(article => article?.slug)
    .sort((a, b) => new Date(b.publishedAt) - new Date(a.publishedAt));

  const displayArticles = latestArticles.slice(0, 8);

  if (displayArticles.length === 0) return null;

  return (
    <div className="w-full relative py-4 px-4 md:px-10">

      {/* SWIPER START */}
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        pagination={{ clickable: true, dynamicBullets: true }}
        navigation={{
          nextEl: ".custom-next",
          prevEl: ".custom-prev",
        }}
        loop={displayArticles.length > 2}
        slidesPerView={1}
        spaceBetween={20}
        breakpoints={{
          640: { slidesPerView: 1, spaceBetween: 20 },
          768: { slidesPerView: 2, spaceBetween: 24 },
          1024: { slidesPerView: 2, spaceBetween: 32 },
        }}
        className="heroSwiper h-[250px] sm:h-[280px] md:h-[320px] !overflow-visible"
      >

        {displayArticles.map((article) => (
          <SwiperSlide key={article.id}>
            <Link
              href={`/article/${article.slug}`}
              className="block h-full w-full relative rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-200 dark:border-white/10 group cursor-pointer"
            >
              {/* Image */}
              <div className="absolute inset-0 overflow-hidden rounded-xl">
                <div
                  className="w-full h-full transition-transform duration-700 group-hover:scale-105"
                  style={{
                    backgroundImage: `url(${article.heroImage?.url})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center center",
                  }}
                />
              </div>

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent opacity-90 rounded-xl"></div>

              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5 z-10 flex flex-col justify-end h-full">
                <div>
                 

                  <h2 className="text-lg sm:text-xl md:text-2xl font-bold leading-tight text-white drop-shadow-sm line-clamp-2 mb-2">
                    {article.title}
                  </h2>

                  <div className="flex items-center gap-2 text-xs text-gray-300 mb-3">
                    <Calendar className="w-3 h-3" />
                    {article.publishDate?.split("T")[0]}
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 text-sm font-semibold text-pink-400 group-hover:text-pink-300 transition-colors duration-300">
                  Read Article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          </SwiperSlide>
        ))}

        {/* CUSTOM SVG ARROW BUTTONS */}
        <button className="custom-prev absolute top-1/2  -left-[-20px] z-20 transform -translate-y-1/2 bg-white/60 shadow-md rounded-full p-2  hover:bg-pink-600 text-black transition">
          {/* LEFT ARROW = ROTATED */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill=""
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="rotate-180"
          >
            <path d="M18 8L22 12L18 16" />
            <path d="M2 12H22" />
          </svg>
        </button>

        <button className="custom-next absolute top-1/2 right-[20px] z-20 transform -translate-y-1/2 bg-white/60 shadow-md rounded-full p-2 hover:bg-pink-600   text-black transition">
          {/* RIGHT ARROW */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="25"
            height="25"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8L22 12L18 16" />
            <path d="M2 12H22" />
          </svg>
        </button>

      </Swiper>
      {/* SWIPER END */}

      {/* CSS */}
      <style>{`
        /* Hide default Swiper arrows */
        .swiper-button-next,
        .swiper-button-prev {
          display: none !important;
        }

        /* Pagination dots */
        .swiper-pagination-bullets {
          bottom: -6px !important;
        }
        .swiper-pagination-bullet-active {
          background: #db2777 !important;
        }
      `}</style>

    </div>
  );
}
