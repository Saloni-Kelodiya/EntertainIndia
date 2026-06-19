
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { songsAPI } from "../lib/api";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "next/link";
import Image from "next/image";

// 📺 स्ट्रीमिंग प्लेटफॉर्म लोगो (ऑफिशियल ब्रांड आइकॉन)
const PLATFORM_ICONS = {
  // Music Platforms
  'spotify': 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64',
  'स्पोटिफाई': 'https://www.google.com/s2/favicons?domain=spotify.com&sz=64',
  'apple music': 'https://www.google.com/s2/favicons?domain=music.apple.com&sz=64',
  'एप्पल म्यूजिक': 'https://www.google.com/s2/favicons?domain=music.apple.com&sz=64',
  'jio savaan': 'https://www.google.com/s2/favicons?domain=jiosaavn.com&sz=64',
  'जियो सावन': 'https://www.google.com/s2/favicons?domain=jiosaavn.com&sz=64',
  'jiosaavn': 'https://www.google.com/s2/favicons?domain=jiosaavn.com&sz=64',
  'सावन': 'https://www.google.com/s2/favicons?domain=jiosaavn.com&sz=64',
  'gaana': 'https://www.google.com/s2/favicons?domain=gaana.com&sz=64',
  'गाना': 'https://www.google.com/s2/favicons?domain=gaana.com&sz=64',
  'wynk': 'https://www.google.com/s2/favicons?domain=wynk.in&sz=64',
  'विंक': 'https://www.google.com/s2/favicons?domain=wynk.in&sz=64',
  'hungama': 'https://www.google.com/s2/favicons?domain=hungama.com&sz=64',
  'हंगामा': 'https://www.google.com/s2/favicons?domain=hungama.com&sz=64',
  'youtube music': 'https://www.google.com/s2/favicons?domain=music.youtube.com&sz=64',
  'यूट्यूब म्यूजिक': 'https://www.google.com/s2/favicons?domain=music.youtube.com&sz=64',
  'soundcloud': 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=64',
  'साउंडक्लाउड': 'https://www.google.com/s2/favicons?domain=soundcloud.com&sz=64',
  
  // OTT Platforms
  'netflix': 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64',
  'नेटफ्लिक्स': 'https://www.google.com/s2/favicons?domain=netflix.com&sz=64',
  'amazon prime': 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=64',
  'अमेज़न प्राइम': 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=64',
  'prime video': 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=64',
  'प्राइम वीडियो': 'https://www.google.com/s2/favicons?domain=primevideo.com&sz=64',
  'hotstar': 'https://www.google.com/s2/favicons?domain=hotstar.com&sz=64',
  'हॉटस्टार': 'https://www.google.com/s2/favicons?domain=hotstar.com&sz=64',
  'disney+ hotstar': 'https://www.google.com/s2/favicons?domain=hotstar.com&sz=64',
  'डिज्नी+ हॉटस्टार': 'https://www.google.com/s2/favicons?domain=hotstar.com&sz=64',
  'zee5': 'https://www.google.com/s2/favicons?domain=zee5.com&sz=64',
  'जी5': 'https://www.google.com/s2/favicons?domain=zee5.com&sz=64',
  'sonyliv': 'https://www.google.com/s2/favicons?domain=sonyliv.com&sz=64',
  'सोनी लिव': 'https://www.google.com/s2/favicons?domain=sonyliv.com&sz=64',
  'sony liv': 'https://www.google.com/s2/favicons?domain=sonyliv.com&sz=64',
  'jiocinema': 'https://www.google.com/s2/favicons?domain=jiocinema.com&sz=64',
  'जियो सिनेमा': 'https://www.google.com/s2/favicons?domain=jiocinema.com&sz=64',
  'jio cinema': 'https://www.google.com/s2/favicons?domain=jiocinema.com&sz=64',
  'youtube': 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
  'यूट्यूब': 'https://www.google.com/s2/favicons?domain=youtube.com&sz=64',
  'apple tv': 'https://www.google.com/s2/favicons?domain=apple.com&sz=64',
  'एप्पल टीवी': 'https://www.google.com/s2/favicons?domain=apple.com&sz=64',
  'voot': 'https://www.google.com/s2/favicons?domain=voot.com&sz=64',
  'वूट': 'https://www.google.com/s2/favicons?domain=voot.com&sz=64',
  'mx player': 'https://www.google.com/s2/favicons?domain=mxplayer.in&sz=64',
  'एमएक्स प्लेयर': 'https://www.google.com/s2/favicons?domain=mxplayer.in&sz=64',
  'alt balaji': 'https://www.google.com/s2/favicons?domain=altbalaji.com&sz=64',
  'आल्ट बालाजी': 'https://www.google.com/s2/favicons?domain=altbalaji.com&sz=64',
};

const PlatformIcon = ({ platform }) => {
  if (!platform) return null;
  
  let platformName = '';
  
  // Extract platform name from different possible structures
  if (typeof platform === 'string') {
    platformName = platform;
  } else if (platform?.platform) {
    platformName = typeof platform.platform === 'string' 
      ? platform.platform 
      : platform.platform?.platform || '';
  } else if (platform?.name) {
    platformName = platform.name;
  }
  
  if (!platformName) return null;
  
  const name = platformName.toLowerCase().trim();
  
  let iconUrl = null;
  
  // Direct match
  if (PLATFORM_ICONS[name]) {
    iconUrl = PLATFORM_ICONS[name];
  } 
  // Spotify and variants
  else if (name.includes('spotify') || name.includes('स्पोटिफाई')) {
    iconUrl = PLATFORM_ICONS['spotify'];
  } 
  // Apple Music
  else if (name.includes('apple music') || name.includes('एप्पल म्यूजिक') || 
           (name.includes('apple') && name.includes('music'))) {
    iconUrl = PLATFORM_ICONS['apple music'];
  } 
  // JioSaavn / Saavn
  else if (name.includes('jio') || name.includes('savaan') || name.includes('saavn') || 
           name.includes('जियो') || name.includes('सावन')) {
    iconUrl = PLATFORM_ICONS['jiosaavn'];
  } 
  // Gaana
  else if (name.includes('gaana') || name.includes('गाना')) {
    iconUrl = PLATFORM_ICONS['gaana'];
  } 
  // Wynk
  else if (name.includes('wynk') || name.includes('विंक')) {
    iconUrl = PLATFORM_ICONS['wynk'];
  } 
  // Hungama
  else if (name.includes('hungama') || name.includes('हंगामा')) {
    iconUrl = PLATFORM_ICONS['hungama'];
  } 
  // SoundCloud
  else if (name.includes('soundcloud') || name.includes('साउंडक्लाउड')) {
    iconUrl = PLATFORM_ICONS['soundcloud'];
  } 
  // YouTube Music
  else if (name.includes('youtube music') || name.includes('यूट्यूब म्यूजिक') || 
           (name.includes('youtube') && name.includes('music'))) {
    iconUrl = PLATFORM_ICONS['youtube music'];
  } 
  // Netflix
  else if (name.includes('netflix') || name.includes('नेटफ्लिक्स')) {
    iconUrl = PLATFORM_ICONS['netflix'];
  } 
  // Amazon Prime / Prime Video
  else if (name.includes('prime') || name.includes('amazon') || 
           name.includes('प्राइम') || name.includes('अमेज़न')) {
    iconUrl = PLATFORM_ICONS['amazon prime'];
  } 
  // Hotstar / Disney+ Hotstar
  else if (name.includes('hotstar') || name.includes('disney') || 
           name.includes('हॉटस्टार') || name.includes('डिज्नी')) {
    iconUrl = PLATFORM_ICONS['hotstar'];
  } 
  // ZEE5
  else if (name.includes('zee') || name.includes('जी5') || name.includes('ज़ी')) {
    iconUrl = PLATFORM_ICONS['zee5'];
  } 
  // Sony LIV
  else if (name.includes('sony') || name.includes('liv') || 
           name.includes('सोनी') || name.includes('लिव')) {
    iconUrl = PLATFORM_ICONS['sony liv'];
  } 
  // Jio Cinema
  else if ((name.includes('jio') && (name.includes('cinema') || name.includes('movie'))) ||
           name.includes('जियो सिनेमा')) {
    iconUrl = PLATFORM_ICONS['jio cinema'];
  } 
  // YouTube
  else if (name.includes('youtube') || name.includes('यूट्यूब')) {
    iconUrl = PLATFORM_ICONS['youtube'];
  } 
  // Apple TV
  else if (name.includes('apple tv') || name.includes('एप्पल टीवी')) {
    iconUrl = PLATFORM_ICONS['apple tv'];
  }
  // Voot
  else if (name.includes('voot') || name.includes('वूट')) {
    iconUrl = PLATFORM_ICONS['voot'];
  }
  // MX Player
  else if (name.includes('mx player') || name.includes('एमएक्स प्लेयर')) {
    iconUrl = PLATFORM_ICONS['mx player'];
  }
  // Alt Balaji
  else if (name.includes('alt balaji') || name.includes('आल्ट बालाजी')) {
    iconUrl = PLATFORM_ICONS['alt balaji'];
  }
  
  if (!iconUrl) return null;
  
  return (
    <img 
      src={iconUrl} 
      alt={platformName}
      className="w-5 h-5 object-contain rounded-sm"
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = 'https://www.google.com/s2/favicons?domain=example.com&sz=64';
      }}
    />
  );
};

export default function MusicDetailPage() {
  const { slug } = useParams();
  const router = useRouter();
  const [song, setSong] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFullDesc, setShowFullDesc] = useState(false);

  useEffect(() => {
    if (!slug) return;

    async function fetchSong() {
      setLoading(true);
      setError(null);
      try {
        const songData = await songsAPI.getBySlug(slug);
        
        console.log("गाने का डेटा प्राप्त हुआ:", songData);
        
        if (songData) {
          setSong(songData);
        } else {
          setError("गाना नहीं मिला");
        }
      } catch (err) {
        console.error("गाना लोड करने में त्रुटि:", err);
        setError(err.message || "गाना लोड करने में विफल");
      } finally {
        setLoading(false);
      }
    }

    fetchSong();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-pink-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">गाना लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (error || !song) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-7xl mb-6">🎵</div>
          <h2 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">गाना नहीं मिला</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg">{error || "आप जिस गाने की तलाश कर रहे हैं, वह मौजूद नहीं है।"}</p>
          <button
            onClick={() => router.push("/")}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-xl transition font-semibold shadow-lg hover:shadow-xl"
          >
            ← होम पेज पर वापस जाएं
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* बैक बटन */}
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2.5 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl transition-all flex items-center gap-2 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow group"
      >
        <span className="text-lg group-hover:-translate-x-1 transition-transform">←</span>
        <span className="font-medium">वापस जाएं</span>
      </button>

      {/* मुख्य कार्ड */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* हीरो सेक्शन - थंबनेल और बेसिक जानकारी */}
        <div className="relative">
          {/* ग्रेडिएंट बैकग्राउंड */}
          <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 dark:from-pink-900/20 dark:to-purple-900/20"></div>
          
          <div className="relative p-6 md:p-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* थंबनेल */}
              <div className="lg:w-80 xl:w-96 flex-shrink-0">
                <div className="relative aspect-square rounded-xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700">
                  {song.thumbnail?.url ? (
                    <img
                      src={song.thumbnail.url}
                      alt={song.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 flex items-center justify-center">
                      <span className="text-7xl">🎵</span>
                    </div>
                  )}
                </div>
              </div>

              {/* गाने का विवरण */}
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 leading-tight">
                  {song.title}
                </h1>
                
                <div className="space-y-4">
                  {/* कलाकार */}
                  {song.song_artists && song.song_artists.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">कलाकार:</span>
                      <div className="flex flex-wrap items-center gap-2">
                        {song.song_artists.map((artist, index) => (
                          <span key={artist.id} className="flex items-center">
                            {artist.isClickable ? (
                              <Link
                                href={`/celebrities/${artist.slug}`}
                                className="text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 font-medium hover:underline transition"
                              >
                                {artist.name}
                              </Link>
                            ) : (
                              <span className="text-gray-700 dark:text-gray-300 font-medium">
                                {artist.name}
                              </span>
                            )}
                            {index < song.song_artists.length - 1 && (
                              <span className="text-gray-400 mx-1">,</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* एल्बम */}
                  {song.album && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">एल्बम:</span>
                      <span className="text-gray-700 dark:text-gray-300">{song.album}</span>
                    </div>
                  )}

                  {/* शैली */}
                  {song.music_genres && song.music_genres.length > 0 && (
                    <div className="flex items-start gap-2">
                      <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px] pt-1">शैली:</span>
                      <div className="flex flex-wrap gap-2">
                        {song.music_genres.map((genre) => (
                          <span
                            key={genre.id}
                            className="px-3 py-1 bg-pink-50 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-full text-xs font-medium border border-pink-200 dark:border-pink-800"
                          >
                            {genre.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                  {/* Language, Duration, Release Date, Label - Grid Layout */}
                  
                    {song.language && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">भाषा</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">{song.language}</span>
                      </div>
                    )}
                    
                    {song.duration && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">अवधि</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium flex items-center gap-1">
                          <span>⏱️</span> {song.duration}
                        </span>
                      </div>
                    )}
                    
                    {(song.releaseDate || song.release_date) && (
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500 dark:text-gray-400 font-medium min-w-[80px]">रिलीज़</span>
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {new Date(song.releaseDate || song.release_date).toLocaleDateString('hi-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </span>
                      </div>
                    )}
                
                    {song.label && (
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">लेबल</p>
                        <p className="text-gray-700 dark:text-gray-300 font-medium">{song.label}</p>
                      </div>
                    )}
                
                </div>

                {/* प्लेटफॉर्म */}
                {song.platforms && song.platforms.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">सुनें</h3>
                    <div className="flex flex-wrap gap-2">
                      {song.platforms.map((platform, index) => {
                        const hasUrl = platform.url && platform.url.trim() !== '';
                        const platformName = platform.name || 'प्लेटफॉर्म';
                        
                        const ButtonContent = (
                          <>
                            <PlatformIcon platform={platform} />
                            <span className="text-sm font-medium">{platformName}</span>
                            {hasUrl && <span className="text-xs opacity-60">↗</span>}
                          </>
                        );

                        if (hasUrl) {
                          return (
                            <a
                              key={index}
                              href={platform.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg transition-all border border-gray-200 dark:border-gray-600 hover:border-pink-400 dark:hover:border-pink-500 flex items-center gap-2 group"
                            >
                              {ButtonContent}
                            </a>
                          );
                        } else {
                          return (
                            <div
                              key={index}
                              className="px-4 py-2 bg-gray-50 dark:bg-gray-700/50 text-gray-400 dark:text-gray-500 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center gap-2 cursor-not-allowed opacity-60"
                              title="लिंक उपलब्ध नहीं है"
                            >
                              {ButtonContent}
                            </div>
                          );
                        }
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* विवरण सेक्शन */}
        {song.body && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-6 md:p-8">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">📝</span>
              इस गाने के बारे में
            </h3>
            <div className={`prose prose-lg dark:prose-invert max-w-none ${!showFullDesc ? 'line-clamp-6' : ''}`}>
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {song.body}
              </ReactMarkdown>
            </div>
            {song.body.split('\n').length > 8 && (
              <button
                onClick={() => setShowFullDesc(!showFullDesc)}
                className="mt-4 text-pink-600 dark:text-pink-400 font-medium hover:underline flex items-center gap-1"
              >
                {showFullDesc ? (
                  <>कम दिखाएं <span>↑</span></>
                ) : (
                  <>और पढ़ें <span>↓</span></>
                )}
              </button>
            )}
          </div>
        )}

        {/* संबंधित गाने */}
        {song.relatedSongs && song.relatedSongs.length > 0 && (
          <div className="border-t border-gray-100 dark:border-gray-700 p-6 md:p-8 bg-gray-50/50 dark:bg-gray-700/20">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <span className="text-2xl">🎶</span>
              संबंधित गाने
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {song.relatedSongs.map((relatedSong) => (
                <div
                  key={relatedSong.id}
                  onClick={() => router.push(`/music/${relatedSong.slug}`)}
                  className="group bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700 hover:border-pink-200 dark:hover:border-pink-800 transition-all cursor-pointer"
                >
                  <div className="relative aspect-square">
                    {relatedSong.thumbnail?.url ? (
                      <img
                        src={relatedSong.thumbnail.url}
                        alt={relatedSong.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 flex items-center justify-center">
                        <span className="text-3xl">🎵</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3">
                    <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-1 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition">
                      {relatedSong.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-1">
                      {relatedSong.artist || 'कलाकार'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}