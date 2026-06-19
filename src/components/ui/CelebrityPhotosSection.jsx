import Link from 'next/link';
import Image from 'next/image';

export default function CelebrityPhotosSection({ initialData = [] }) {
  // Use the data passed from server (already fetched in page.js)
  const galleries = initialData.slice(0, 4);

  if (!galleries.length) {
    return null; // or a placeholder if needed
  }

  return (
    <section className="bg-gradient-to-b">
      <div className="max-w-8xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 lg:gap-8">
          {galleries.map((gallery) => {
            const photos = gallery.photos || [];
            const mainImg = gallery.image?.url;
            const thumb1 = photos[0]?.image?.url || mainImg;
            const thumb2 = photos[1]?.image?.url || mainImg;
            const extraCount = photos.length > 2 ? `+${photos.length - 2}` : "+1";
            const galleryTitle = gallery.title || "सेलिब्रिटी फोटो गैलरी";

            return (
              <Link
                key={gallery.id}
                href={`/photos/${gallery.slug}`}
                className="group block"
                aria-label={galleryTitle}
              >
                <div className="flex gap-2 h-[220px] sm:h-[200px] mb-4">
                  {/* Main Image (left) */}
                  <div className="relative w-[50%] h-full rounded-2xl overflow-hidden shadow-lg border border-white/20 dark:border-white/10">
                    {mainImg ? (
                      <Image
                        src={mainImg}
                        alt={`${galleryTitle} - मुख्य तस्वीर`}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 768px) 65vw, 35vw"
                        quality={75}
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        📷
                      </div>
                    )}
                  </div>

                  {/* Right column (two stacked images) */}
                  <div className="flex flex-col w-[50%] gap-2 h-full">
                    {/* Top right image */}
                    <div className="relative h-1/2 rounded-xl overflow-hidden shadow-md border border-white/20 dark:border-white/10">
                      {thumb1 ? (
                        <Image
                          src={thumb1}
                          alt={`${galleryTitle} - अतिरिक्त तस्वीर 1`}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 35vw, 20vw"
                          quality={75}
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>

                    {/* Bottom right image with "+X" overlay */}
                    <div className="relative h-1/2 rounded-xl overflow-hidden shadow-md border border-white/20 dark:border-white/10">
                      {thumb2 ? (
                        <>
                          <Image
                            src={thumb2}
                            alt={`${galleryTitle} - और तस्वीरें`}
                            fill
                            className="object-cover brightness-75 group-hover:brightness-90 transition-all duration-500"
                            sizes="(max-width: 768px) 35vw, 20vw"
                            quality={75}
                            loading="lazy"
                            decoding="async"
                          />
                          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
                            <div className="bg-white/90 dark:bg-gray-900/90 px-3 py-1.5 rounded-xl text-lg font-bold text-gray-900 dark:text-white border border-white/50 dark:border-gray-800/50">
                              {extraCount}
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-200 dark:bg-gray-700" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Title */}
                <div className="space-y-2 px-1">
                  <h3 className="text-sm font-semibold leading-tight text-gray-900 dark:text-gray-100 line-clamp-2 group-hover:text-pink-500 transition-colors duration-300">
                    {galleryTitle}
                  </h3>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}