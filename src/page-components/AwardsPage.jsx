"use client";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Calendar, MapPin, Award as AwardIcon, ChevronRight, Newspaper } from "lucide-react";
import TopCategoryTabs from "../components/ui/TopCategoryTabs";
import MenuSidebar from "../components/layout/Sidebar";
import ArticleCard from "../components/ui/ArticleCard";

export default function AwardsListPage({ serverCategory, initialAwards, initialArticles }) {
  // ✅ Data seedha props se state mein load ho raha hai (No initial useEffect fetch)
  const [awards] = useState(initialAwards || []);
  const [awardArticles] = useState(initialArticles || []);
  const [loading] = useState(false); // Page load hote hi data ready hai
  
  const router = useRouter();
  const { category } = useParams();

  // ❌ REMOVED ALL FILTERING - directly use the awards array as is
  const filteredAwards = awards; // No filtering applied

  const extractText = (field) => {
    if (!field) return "";
    if (typeof field === "string") return field;
    if (Array.isArray(field)) return field[0]?.children?.[0]?.text || "";
    return "";
  };

  // Condition checks for empty state
  if (loading) return <div className="p-20 text-center min-h-screen">Loading...</div>;

  // Show message if no awards found
  if (filteredAwards.length === 0) {
    return (
      <section className="max-w-7xl mx-auto px-4 py-6 rounded-2xl bg-[#f6f6f6] dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pl-4 md:pl-10">
          <TopCategoryTabs />
          
          {/* HEADER */}
          <div className="border-b border-gray-200 dark:border-gray-800 py-4 mb-6 flex items-start gap-4">
            <div className="p-2 rounded-lg bg-pink-100 dark:bg-pink-900/30">
              <AwardIcon className="text-pink-600 dark:text-pink-400 w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                पुरस्कार समारोह
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mt-1 text-sm">
                किसी भी पुरस्कार पर क्लिक करें ताकि पूरी जानकारी देखें
              </p>
            </div>
          </div>
          
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">कोई पुरस्कार नहीं मिला।</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-7xl mx-auto px-4 py-6 rounded-2xl bg-[#f6f6f6] dark:bg-gray-800">
     

        

        <div className="">
               <TopCategoryTabs />
       
               <div className="border-b border-gray-300 dark:border-gray-700 py-4 mb-4 flex flex-row gap-4">
                 <AwardIcon size={28} className="text-pink-500 " />
                 <div>
                   <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                     पुरस्कार समारोह
                   </h2>
                   <p className="text-gray-600 dark:text-gray-300 mt-1">
                     एंटरटेनमेंट की दुनिया से लेटेस्ट अवॉर्ड सेरेमनी, न्यूज़ और अपडेट्स
                   </p>
                 </div>
               </div>
            
        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT – AWARDS LIST (2/3) */}
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredAwards.map((award) => (
                <div
                  key={award.id}
                  onClick={() => router.push(`/${category}/awards/${award.slug}`)}
                  className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 hover:border-pink-500 dark:hover:border-pink-500 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl dark:shadow-gray-900/50"
                >
                  {/* IMAGE */}
                  <div className="relative h-44 overflow-hidden">
                    {award.image?.url && (
                      <>
                        <img
                          src={award.image.url}
                          alt={award.image.alt || award.title}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-900/20 to-transparent dark:from-gray-900/90" />
                      </>
                    )}
                    <div className="absolute top-4 left-4 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm p-2 rounded-lg border border-gray-300 dark:border-gray-700">
                      <AwardIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                    </div>

                    <span className="absolute top-4 right-4 bg-white/90 dark:bg-gray-900/90 text-xs px-3 py-1 rounded-full border border-gray-300 dark:border-gray-700 font-semibold text-gray-800 dark:text-gray-200">
                      {award.year || "TBA"}
                    </span>
                  </div>

                  {/* CONTENT */}
                  <div className="p-5">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {award.title}
                    </h2>

                    <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                      {award.subTitle || "Annual Film Awards"}
                    </p>

                    <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed mb-4 line-clamp-2">
                      {extractText(award.description)}
                    </p>

                    <div className="flex items-center gap-6 text-xs text-gray-500 dark:text-gray-400 mb-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        <span>{award.date || "TBA"}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                        <span>{award.location || "World"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded bg-pink-100 dark:bg-pink-900/30">
                          <AwardIcon className="w-3 h-3 text-pink-600 dark:text-pink-400" />
                        </div>
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                          {award.categoryCount ?? 0} श्रेणियाँ
                        </span>
                      </div>
                      <span className="text-pink-600 dark:text-pink-400 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                        विवरण देखें <ChevronRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* RELATED ARTICLES SECTION - Moved inside left column */}
            {awardArticles.length > 0 && (
              <div className="mt-12 border-t border-gray-200 dark:border-gray-800 pt-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                    <Newspaper className="text-blue-600 dark:text-blue-400 w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">
                      संबंधित पुरस्कार लेख
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      पुरस्कार की दुनिया से लेटेस्ट न्यूज़ और अपडेट्स
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {awardArticles.map((article) => (
                    <ArticleCard key={article.id} article={article} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT – SIDEBAR (1/3) */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24">
              <MenuSidebar />
            </div>
          </aside>

        </div>
      </div>
    </section>
  );
}