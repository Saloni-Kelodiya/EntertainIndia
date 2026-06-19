"use client";
import Link from "next/link";
import Image from "next/image";
import { Instagram, Twitter, Star, Film, Tv } from "lucide-react";

export default function CelebrityProfileSection({ initialData = [] }) {
  // 1. Direct variable usage (No State/Effect)
  const celebrities = initialData;

  // 2. Loading handle (Server data direct aata hai, isliye loading ki zarurat nahi)
  if (!celebrities?.length) return null;

  return (
    <section>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
        {celebrities.map((c) => (
          <Link 
            key={c.id} 
            href={`/celebrities/${c.slug}`} 
            prefetch={false}
            className="group relative card-theme rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Avatar Container */}
            <div className="relative aspect-[3/4] rounded-2xl w-full overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
              {c.avatar?.url ? (
                <Image 
                  src={c.avatar.url} 
                  alt={c.name} 
                  fill 
                  sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 16vw"
                  className="object-cover rounded-2xl group-hover:scale-110 transition-transform duration-500"
                  priority={false}
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Star className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {/* Gradient Overlay on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              
              {/* Quick View Badge */}
              <div className="absolute bottom-2 left-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="block text-center text-xs text-white bg-black/50 backdrop-blur-sm rounded-lg py-1.5 px-2">
                  View Profile →
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-3 space-y-2">
              {/* Name */}
              <h3 className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1 group-hover:text-pink-600 transition">
                {c.name}
              </h3>

              {/* Role/Professions */}
              <div className="flex items-center gap-1">
                <Film className="w-3 h-3 text-gray-400 flex-shrink-0" />
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                  {c.professions?.length > 0
                    ? c.professions.map(p => p.name).join(", ")
                    : "Actor"}
                </p>
              </div>

              {/* Social Icons */}
              {(c.instagram || c.twitter) && (
                <div className="flex items-center gap-3 pt-1">
                  {c.instagram && (
                    <a 
                      href={c.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()} 
                      className="text-gray-400 hover:text-pink-500 transition-colors"
                      aria-label={`${c.name} on Instagram`}
                    >
                      <Instagram size={14} />
                    </a>
                  )}
                  {c.twitter && (
                    <a 
                      href={c.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      onClick={(e) => e.stopPropagation()} 
                      className="text-gray-400 hover:text-sky-400 transition-colors"
                      aria-label={`${c.name} on Twitter`}
                    >
                      <Twitter size={14} />
                    </a>
                  )}
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}