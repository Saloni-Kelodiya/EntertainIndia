import Link from 'next/link';
import { Clock } from 'lucide-react';
import { formatDate } from '../../lib/helpers';
import { getResponsiveImageUrl } from '../../lib/api/helper'; //  आपका ग्लोबल इमेज हेल्पर
import OptimizedImage from './OptimizedImage'; //  आपका ग्लोबल इमेज कंपोनेंट

const categoryHindiNames = {
  bollywood: "बॉलीवुड",
  hollywood: "हॉलीवुड",
  ott: "ओटीटी",
  tv: "टीवी",
  tollywood: "टॉलीवुड",
  bhojiwood: "भोजीवुड",
  korean: "कोरियाई",
};

// No "use client" – this remains a Server Component
export default function LatestNewsList ({ initialData = [] }) {
  if (!initialData || initialData.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        कोई समाचार उपलब्ध नहीं
      </div>
    );
  }

  return (
    <div
      className="
        max-h-[500px] overflow-y-auto pr-2 space-y-3 p-1
        bg-gray-50 dark:bg-gray-900/50
        scrollbar-thin
        scrollbar-thumb-indigo-300
        scrollbar-track-transparent
        hover:scrollbar-thumb-indigo-500
      "
    >
      {initialData.map((article) => {
        //  ग्लोबल परफॉर्मेंस सुधार: पुराना बड़ा स्ट्रैपी लॉजिक हटाया
        // इस साइडबार लिस्ट के थंबनेल्स के लिए 'small' साइज़ की इमेज सबसे लाइटवेट और बेस्ट रहेगी
        const imgUrl = getResponsiveImageUrl(article, "small");

        const articleTitle = article.title || "समाचार";
        const altText = `${articleTitle} - समाचार थंबनेल`;

        return (
          <Link
            key={article.id}
            href={`/news/${article.slug}`}
            className="
              flex gap-4 items-start p-1 rounded-xl
              bg-white hover:bg-gray-50
              dark:bg-gray-800 dark:hover:bg-gray-700
              transition-all duration-200
              border border-gray-100 dark:border-gray-700
              hover:shadow-md
              group
              touch-manipulation
            "
            aria-label={articleTitle}
          >
            {/* Thumbnail Container - w-28 h-20 (Prevent CLS) */}
            <div className="relative w-28 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-700">
              {imgUrl ? (
                /*  आपके OptimizedImage कंपोनेंट का उपयोग */
                <OptimizedImage
                  src={imgUrl}
                  alt={altText}
                  type="thumbnail" // यह खुद-ब-खुद मोबाइल और डेस्कटॉप के हिसाब से 100px-120px का नाप (sizes) ब्राउज़र को दे देगा
                  isPriority={false} // यह साइडबार लिस्ट नीचे होती है, इसलिए इसे लेज़ी लोड (lazy load) होने देंगे
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-2xl bg-gray-200 dark:bg-gray-700">
                  📰
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 space-y-1.5">
              {/* Category Badge */}
              {article.category?.slug && (
                <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-pink-600 text-white font-medium">
                  {categoryHindiNames[article.category.slug.toLowerCase()] || article.category.name}
                </span>
              )}

              {/* Title */}
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-snug">
                {articleTitle}
              </h3>

              {/* Meta Info */}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <Clock size={12} aria-hidden="true" />
                  {formatDate(article.publishDate, 'relative')}
                </span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
