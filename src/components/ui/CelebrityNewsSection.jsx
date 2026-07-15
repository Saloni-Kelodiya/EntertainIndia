import Link from 'next/link';
import { Clock } from 'lucide-react';
import { formatDate } from '../../lib/helpers';
import { memo } from 'react';
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

//  Memoized component to prevent unnecessary re-renders
const CelebrityNewsCard = memo(({ article, isPriority }) => {
  //  ग्लोबल परफॉर्मेंस सुधार: इस ग्रिड कार्ड के लिए 'medium' साइज़ की इमेज परफेक्ट बैलेंस देगी
  const imgUrl = getResponsiveImageUrl(article, "medium");

  return (
    <Link
      href={`/news/${article.slug}`}
      className="
        bg-white dark:bg-gray-900 
        rounded-lg overflow-hidden 
        hover:shadow-lg hover:-translate-y-1
        transition-all duration-300 cursor-pointer group
        touch-manipulation
      "
      prefetch={false} // Only prefetch on hover
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 dark:bg-gray-800">
        {imgUrl ? (
          /*  आपके OptimizedImage कंपोनेंट का उपयोग */
          <OptimizedImage
            src={imgUrl}
            alt={article.title}
            type="featured" // इस ग्रिड कार्ड का साइज़ बड़ा है, इसलिए 'featured' टाइप का उपयोग किया ताकि रेस्पॉन्सिव नाप सही रहे
            isPriority={isPriority} // पहले कुछ कार्ड्स को मोबाइल LCP बूस्ट करने के लिए प्रायोरिटी मिलेगी
            className="transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl bg-gray-200 dark:bg-gray-700">
            📰
          </div>
        )}

        {article.category?.name && (
          <span className="absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full bg-pink-600 text-white font-medium shadow-md z-10">
            {categoryHindiNames[article.category.slug] || article.category.name}
          </span>
        )}
      </div>

      <div className="p-4 space-y-2">
        <h3 className="text-sm font-semibold line-clamp-2 text-gray-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors leading-snug">
          {article.title}
        </h3>

        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <span className="flex items-center gap-1">
            <Clock size={12} />
            {formatDate(article.publishDate || article.createdAt, 'relative')}
          </span>
        </div>
      </div>
    </Link>
  );
});

CelebrityNewsCard.displayName = 'CelebrityNewsCard';

export default function CelebrityNewsSection({ initialData = [] }) {
  if (!initialData || initialData.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 px-1">
      {initialData.map((article, index) => (
        <CelebrityNewsCard 
          key={article.id} 
          article={article} 
          isPriority={index < 2} //  मोबाइल स्क्रीन पर दिखने वाले पहले 2 कार्ड्स को तुरंत लोड करेगा
        />
      ))}
    </div>
  );
}
