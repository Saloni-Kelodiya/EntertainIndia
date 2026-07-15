"use client";
import Image from "next/image";

export default function OptimizedImage({ 
  src, 
  alt, 
  isPriority = false, 
  type = "thumbnail",
  className = "",
  sizes: customSizes,
  quality: customQuality, // ✅ explicit quality override support
  ...rest 
}) {
  if (!src) {
    return (
      <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center text-xl animate-pulse">
        📰
      </div>
    );
  }

  const defaultSizes = type === "featured" 
    ? "(max-width: 640px) 100vw, (max-width: 1024px) 70vw, 60vw"
    : "(max-width: 640px) 96px, 112px";

  // ✅ Default quality thodi badhayi (75 → 80), aur agar caller khud specify kare toh wahi use hogi
  const defaultQuality = type === "featured" ? 82 : 78;

  return (
    <Image
      src={src}
      alt={alt || "EntertainIndia News"}
      fill
      priority={isPriority}
      fetchPriority={isPriority ? "high" : "auto"}
      sizes={customSizes || defaultSizes}
      className={`object-cover ${className}`}
      quality={customQuality || defaultQuality}
      loading={isPriority ? undefined : "lazy"}
      decoding="async"
      {...rest}
    />
  );
}