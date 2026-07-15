"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Calendar, Trophy, MapPin, Users, ChevronRight, Image as ImageIcon, ArrowLeft, MessageSquare } from "lucide-react";
import { articlesAPI} from "../lib/api/articles";
import {AwardsAPI} from "../lib/api/awards"

export default function AwardDetailClient({ award }) {
  const router = useRouter();
  const params = useParams();
  const [highlightArticles, setHighlightArticles] = useState([]);
  const [moreAwards, setMoreAwards] = useState([]);
  const [loading, setLoading] = useState(true);

  const industry = params.category || "hollywood";

  useEffect(() => {
    const fetchExtraData = async () => {
      try {
        setLoading(true);
        // Fetch award related articles (Ceremony Highlights)
        const articlesRes = await articlesAPI.getAll({
          category: 'awards',
          pageSize: 3
        });
        setHighlightArticles(articlesRes.articles || []);

        //  FIX: AwardsAPI.getAll returns { data, pagination }
        const awardsRes = await AwardsAPI.getAll({
          pageSize: 10 // Get more awards for filtering
        });
        
        //  Extract the data array from the response
        const awardsList = awardsRes.data || [];
        
        // Filter out the current award and take top 3
        const others = awardsList
          .filter(a => a.id !== award.id)
          .slice(0, 3);
          
        setMoreAwards(others);
      } catch (err) {
        console.error("Error fetching extra award data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (award?.id) {
      fetchExtraData();
    }
  }, [award.id]);

  const createSlug = (text) => {
    return text
      ?.toLowerCase()
      .replace(/ /g, "-")
      .replace(/[^\w-]+/g, "");
  };

  // If loading, show skeleton
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-1 pb-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        <div className="animate-pulse">
          <div className="h-96 bg-gray-300 dark:bg-gray-700 rounded-2xl mb-4" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-3/4" />
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // If no award, show error
  if (!award) {
    return (
      <div className="max-w-7xl mx-auto px-4 pt-1 pb-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Award not found</h2>
          <button
            onClick={() => router.back()}
            className="mt-4 text-yellow-600 hover:text-yellow-700"
          >
            Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-1 pb-6 bg-[#f6f6f6] rounded-2xl dark:bg-gray-800">
      <div>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2  text-gray-500 hover:text-yellow-600 transition-colors mb-6 text-sm font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} /> पुरस्कारों पर वापस जाएं
        </button>

        {/* ================= AWARD HEADER CARD ================= */}
        <div className="card-theme relative min-h-[400px] sm:min-h-[500px] overflow-hidden group">
          {award.image?.url ? (
            <img
              src={award.image.url}
              alt={award.title}
              className="absolute inset-0 w-full h-full object-cover object-right-top transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-400 dark:from-neutral-700 dark:to-neutral-800" />
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-transparent dark:from-black/100 dark:via-black/70" />

          <div className="relative z-10 h-full flex flex-col justify-end">
            <div className="p-6 sm:p-10 lg:p-12 pb-2">
              <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-tighter mb-4 text-white">
                {award.subTitle || award.title}
              </h1>

              <p className="text-gray-200 max-w-3xl text-sm md:text-base font-medium leading-relaxed mb-6">
                {typeof award.description === 'string'
                  ? award.description
                  : award.description?.[0]?.children?.[0]?.text}
              </p>

              <div className="flex flex-wrap gap-4">
                <div className="inline-flex items-center gap-2 bg-yellow-500 text-black px-5 py-2.5 rounded-lg text-xs font-black uppercase shadow-lg">
                  <Calendar className="w-4 h-4" />
                  {award.date || "2025"}
                </div>
                {award.location && (
                  <div className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-lg text-xs font-bold backdrop-blur-md border border-white/20 uppercase">
                    <MapPin className="w-4 h-4" />
                    {award.location}
                  </div>
                )}
              </div>
            </div>

            {/* CEREMONY HIGHLIGHTS GRID - PINNED TO BOTTOM */}
            <div className="p-4 sm:p-6 bg-black/20 backdrop-blur-md border-t border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-3 mt-4">
              <StatCard
                icon={<Calendar className="w-4 h-4 text-yellow-500" />}
                label="Date"
                value={award.date || "March 2, 2025"}
              />
              <StatCard
                icon={<MapPin className="w-4 h-4 text-yellow-500" />}
                label="Location"
                value={award.location || "Dolby Theatre, Hollywood"}
              />
              <StatCard
                icon={<Users className="w-4 h-4 text-yellow-500" />}
                label="Host"
                value={award.host || "Jimmy Kimmel"}
              />
              <StatCard
                icon={<Trophy className="w-4 h-4 text-yellow-500" />}
                label="Categories"
                value={award.categoryCount || "23"}
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= CONTENT SECTIONS ================= */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">


        {/* Dynamic Stats Banner */}
        {(award.totalNominations || award.countriesRepresented || award.firstTimeWinners || award.viewership) && (
          <div className="card-theme bg-yellow-500/5 dark:bg-yellow-500/10 border border-yellow-500/20 p-6 sm:p-8 grid grid-cols-2 lg:grid-cols-4 gap-8">
            <HighlightStat label="Total Nominations" value={award.totalNominations || "300+"} />
            <HighlightStat label="Countries Represented" value={award.countriesRepresented || "45"} />
            <HighlightStat label="First-time Winners" value={award.firstTimeWinners || "12"} />
            <HighlightStat label="Viewership" value={award.viewership || "34.5M"} />
          </div>
        )}

        {/* Winners & Nominees Section */}
        <div className="card-theme p-4 sm:p-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white mb-2 uppercase tracking-tighter">
             विजेता और नामांकित व्यक्ति
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-widest font-bold">
             सभी कैटेगरी की पूरी लिस्ट
            </p>
            <div className="h-1 w-24 bg-yellow-500 mx-auto mt-4 rounded-full" />
          </div>

          <div className="space-y-12">
            {award.awardCategories?.map((cat, index) => (
              <div key={index} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-12 last:pb-0">
                {/* Category Header */}
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
                    {cat.categoryName}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-500 dark:text-gray-400 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 uppercase">
                    {cat.nominees?.length || 0} प्रत्याशियों
                  </span>
                </div>

                {/* Winner Card */}
                <div className="mb-8">
                  <Link href={`/${industry}/movies/${createSlug(cat.winner?.title)}`}>
                    <div className="group bg-yellow-500/5 dark:bg-yellow-500/10 rounded-2xl p-5 hover:shadow-lg transition-all duration-300 border border-yellow-200/50 dark:border-yellow-900/30">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Winner Image */}
                        <div className="relative flex-shrink-0 mx-auto md:mx-0">
                          <div className="w-28 h-40 rounded-xl overflow-hidden border-2 border-yellow-500 shadow-xl group-hover:scale-105 transition-transform duration-500">
                            {cat.winner?.image?.url ? (
                              <img src={cat.winner.image.url} alt={cat.winner.title} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center">
                                <Trophy size={32} className="text-yellow-500" />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Winner Details */}
                        <div className="flex-1">
                          <div className="inline-flex items-center gap-2 bg-yellow-500 text-black px-3 py-1 rounded-full text-[10px] font-black uppercase mb-4">
                            <Trophy size={10} /> पुरस्कार विजेता
                          </div>

                          <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                            <div className="flex-shrink-0 md:max-w-[40%]">
                              <h4 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white group-hover:text-yellow-600 transition-colors uppercase mb-1">
                                {cat.winner?.title}
                              </h4>
                              <p className="text-gray-600 dark:text-gray-300 text-sm md:text-base font-bold">
                                {cat.winner?.subTitle}
                              </p>
                            </div>

                            {cat.description && (
                              <div className="flex-1 md:border-l md:border-gray-200 dark:md:border-gray-700 md:pl-6">
                                <p className="text-gray-500 dark:text-gray-400 text-xs md:text-sm italic leading-relaxed line-clamp-4">
                                  {cat.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>

                {/* Nominees Grid */}
                {cat.nominees?.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                      <div className="h-px w-8 bg-gray-200 dark:bg-gray-700" />
                      अन्य नामांकित व्यक्ति
                    </h4>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {cat.nominees.map((nom, i) => (
                        <Link key={i} href={`/${industry}/movies/${nom.slug || createSlug(nom.name)}`}>
                          <div className="group bg-gray-50 dark:bg-gray-800/50 p-3 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-yellow-400 hover:bg-white dark:hover:bg-gray-800 transition-all duration-300">
                            <div className="flex items-center gap-4">
                              <div className="relative flex-shrink-0">
                                <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-gray-200 dark:border-gray-700 group-hover:border-yellow-500 transition-colors bg-gray-100 dark:bg-gray-900">
                                  {nom.image?.url ? (
                                    <img src={nom.image.url} alt={nom.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-[10px] text-gray-400">?</div>
                                  )}
                                </div>
                              </div>

                              <div className="flex-1 min-w-0">
                                <h5 className="text-sm font-black text-gray-900 dark:text-white truncate group-hover:text-yellow-600 transition-colors uppercase">
                                  {nom.name}
                                </h5>
                                <p className="text-gray-500 dark:text-gray-400 text-[10px] font-bold truncate">
                                  {nom.subTitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Explore More Awards */}
        {moreAwards.length > 0 && (
          <div className="card-theme p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-black mb-6 text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Trophy className="text-yellow-500" size={20} />
              Explore More Awards
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {moreAwards.map((otherAward) => (
                <Link
                  key={otherAward.id}
                  href={`/${industry}/awards/${otherAward.slug}`}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-yellow-500/50 hover:bg-white dark:hover:bg-gray-800 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                      {otherAward.image?.url ? (
                        <img
                          src={otherAward.image.url}
                          alt={otherAward.title}
                          className="w-8 h-8 object-contain"
                        />
                      ) : (
                        <Trophy className="w-6 h-6 text-yellow-600" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-black text-gray-900 dark:text-white text-xs line-clamp-1 uppercase group-hover:text-yellow-600 transition-colors">
                        {otherAward.title}
                      </h3>
                      <p className="text-gray-500 text-[10px] font-black">
                        {otherAward.date?.split('-')[0] || "2025"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 group-hover:text-yellow-500 transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Award Articles */}
        {highlightArticles.length > 0 && (
          <div className="card-theme p-4 sm:p-6 mb-12">
            <h2 className="text-lg sm:text-xl font-black mb-2 text-gray-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <ImageIcon className="text-blue-500" size={20} />
             पुरस्कार लेख
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest mb-8">
              रात के यादगार मौके
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {highlightArticles.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="group block bg-gray-50 dark:bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all duration-300"
                >
                  <div className="relative aspect-video overflow-hidden">
                    {article.heroImage?.url ? (
                      <img
                        src={article.heroImage.url}
                        alt={article.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-black text-xs md:text-sm line-clamp-2 uppercase leading-snug">
                        {article.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-gray-600 dark:text-gray-400 text-[11px] font-medium line-clamp-2 leading-relaxed">
                      {article.summary}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper Component for Award Basic Stats
function StatCard({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="bg-white/95 dark:bg-gray-800/90 backdrop-blur-sm p-4 sm:p-5 rounded-xl border border-gray-100 dark:border-gray-700/50 flex flex-col items-center justify-center text-center group hover:border-yellow-500/50 transition-all duration-300">
      <div className="mb-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-full group-hover:bg-yellow-500/10 transition-colors">
        {icon}
      </div>
      <p className="text-[9px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
        {label}
      </p>
      <p className="text-xs font-black text-gray-900 dark:text-white truncate w-full">
        {value}
      </p>
    </div>
  );
}

// Helper Component for Highlight Banner Stats
function HighlightStat({ label, value }) {
  if (!value) return null;
  return (
    <div className="flex flex-col items-center">
      <p className="text-2xl md:text-3xl font-black text-yellow-600 dark:text-yellow-500 mb-1">
        {value}
      </p>
      <p className="text-[9px] md:text-[11px] font-bold text-gray-600 dark:text-gray-400 uppercase tracking-widest">
        {label}
      </p>
    </div>
  );
}