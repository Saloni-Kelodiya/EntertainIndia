import Link from 'next/link';
import Sidebar from '../components/layout/Sidebar';
import FeaturedArticle from "../components/ui/FeaturedArticle";
import TrandingNow from "../components/ui/TrandingNow";
import LatestNewsSection from '../components/ui/LatestNewsSection';
import CelebrityNewsSection from '../components/ui/CelebrityNewsSection';
import { Star, Newspaper, Flame, PlayCircle, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';

const ViralNewsSection = dynamic(() => import('../components/ui/ViralNewsSection'));
const LatestArticlesSection = dynamic(() => import('../components/ui/LatestArticlesSection'));
const ExploreCategories = dynamic(() => import('../components/ui/ExploreCategories'));
const WebStoriesSection = dynamic(() => import('../components/ui/WebStoriesSection'));
const CelebrityPhotosSection = dynamic(() => import('../components/ui/CelebrityPhotosSection'));
const CelebrityProfileSection = dynamic(() => import('../components/ui/CelebrityProfileSection'));

// No "use client" – यह अब Server Component है
// No useState, useEffect, mounted – सब हटा दिया गया है

const SectionHeader = ({ title, icon: Icon, to }) => (
  <div className="flex items-center justify-between mb-2 border-b border-gray-300 dark:border-indigo-700/40">
    <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900 dark:text-slate-100 m-0 py-2">
      <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
      <span className="leading-none">{title}</span>
    </h2>
    {to && (
      <Link href={to} className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 font-medium flex items-center gap-1">
        सभी देखें →
      </Link>
    )}
  </div>
);

export default function Home({ initialData }) {
  // अब कोई mounted check नहीं, सीधे render
  const latestFeatured = (initialData?.featured || [])
    .sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate))
    .slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-2 py-4 space-y-5">
      {/* 1. फीचर्ड सेक्शन */}
      <section className='bg-[#f6f6f6] rounded-2xl dark:bg-gray-800'>
        <div className="px-2 py-4">
          <SectionHeader title="फीचर्ड स्टोरीज" icon={Star} />
          <FeaturedArticle articles={latestFeatured} priority={true} fetchPriority="high" />
        </div>
      </section>

      {/* 2. ट्रेंडिंग सेक्शन */}
      <section className='bg-[#f6f6f6] rounded-2xl dark:bg-gray-800'>
        <div className="px-2 py-4">
          <SectionHeader title="ट्रेंडिंग" icon={Zap} />
          <TrandingNow trendingList={initialData?.trendingList || []} />
        </div>
      </section>

      {/* 3. मुख्य सामग्री बॉक्स */}
      <section className="bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        <div className="px-2 py-4">
          <div className="space-y-10">
            {/* ऊपरी भाग: समाचार + साइडबार */}
            <div className="grid lg:grid-cols-4 gap-4 items-start">
              <div className="lg:col-span-3 space-y-10">
                <section>
                  <SectionHeader title="ताज़ा समाचार" icon={Newspaper} to="/news?type=LatestNews" />
                  <LatestNewsSection initialData={initialData?.latestSection || []} />
                </section>

                <section className='mb-10'>
                  <SectionHeader title="सेलिब्रिटी समाचार" icon={Star} to="/news?type=CelebrityNews" />
                  <CelebrityNewsSection initialData={initialData?.celebritySection || []} />
                </section>
              </div>

              <aside className="lg:col-span-1 sticky top-20 h-fit">
                <Sidebar />
              </aside>
            </div>

            {/* निचला भाग */}
            <div className="pt-1 space-y-10">
              <section>
                <SectionHeader title="वायरल समाचार" icon={Flame} to="/news?type=ViralNews" />
                <ViralNewsSection initialData={initialData?.viralSection || []} />
              </section>

              <section>
                <SectionHeader title="नवीनतम लेख" icon={Newspaper} to="/article" />
                <LatestArticlesSection initialData={initialData?.latestArticles || []} />
              </section>
            </div>
          </div>
        </div>
      </section>

      {/* कैटेगरी सेक्शन */}
      <ExploreCategories />

      {/* निचले सेक्शन */}
      <section className='bg-[#f6f6f6] rounded-2xl dark:bg-gray-800'>
        <div className="px-2 py-4">
          <SectionHeader title="वेब स्टोरीज" icon={PlayCircle} to="/web-stories" />
          <WebStoriesSection initialData={initialData?.webStories || []} />
        </div>
      </section>

      <section className='bg-[#f6f6f6] rounded-2xl dark:bg-gray-800'>
        <div className="px-2 py-4">
          <SectionHeader title="सेलिब्रिटी फोटो" icon={Star} to="/photos" />
          <CelebrityPhotosSection initialData={initialData?.galleries || []} />
        </div>
      </section>

      <section className='bg-[#f6f6f6] rounded-2xl dark:bg-gray-800'>
        <div className="px-2 py-4">
          <SectionHeader title="सेलिब्रिटी प्रोफाइल" icon={Star} to="/celebrities" />
          <CelebrityProfileSection initialData={initialData?.celebrities || []} />
        </div>
      </section>
    </div>
  );
}