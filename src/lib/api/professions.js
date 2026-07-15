import apiClient from './client';

export const normalizeProfession = (professions) => {
  //  FIX: Check professions parameter, not genres
  if (!professions || !Array.isArray(professions)) return [];

  return professions.map((profession) => {
    const data = profession.attributes || profession;
    const originalName = data.profession_Field || data.name;
    const hindiName = getHindiProfession(originalName);
    
    return {
      id: profession.id || data.id,
      name: hindiName, //  हिंदी नाम
      originalName: originalName, //  मूल नाम (अगर जरूरत हो)
      slug: data.slug || originalName?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };
  });
};

export const ProfessionAPI = {
  getAll: async (retryCount = 0) => {
    try {
      const cacheBuster = Date.now();
      
      const res = await apiClient.get("/professions", {
        params: {
          _t: cacheBuster,
          _retry: retryCount // Additional cache buster
        },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      });
      
      // Check if data is stale (optional)
      const data = res.data.data;
      if (!data || data.length === 0) {
        if (retryCount < 2) {
          // Retry after 100ms
          await new Promise(resolve => setTimeout(resolve, 100));
          return ProfessionAPI.getAll(retryCount + 1);
        }
      }
      
      return normalizeProfession(data);
    } catch (error) {
      console.error("ProfessionAPI.getAll error:", error);
      return [];
    }
  },

  getBySlug: async (slug, retryCount = 0) => {
    try {
      const cacheBuster = Date.now();
      
      const res = await apiClient.get(
        `/professions?filters[slug][$eq]=${encodeURIComponent(slug)}`,
        {
          params: {
            _t: cacheBuster,
            _retry: retryCount
          },
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
          }
        }
      );
      
      const data = res.data.data?.[0];
      if (!data && retryCount < 2) {
        await new Promise(resolve => setTimeout(resolve, 100));
        return ProfessionAPI.getBySlug(slug, retryCount + 1);
      }
      
      return data ? normalizeProfession([data])[0] : null;
    } catch (error) {
      console.error("ProfessionAPI.getBySlug error:", error);
      return null;
    }
  },
};
// Hindi Profession Mapping
export const professionHindiMap = {
  "actor": "अभिनेता",
  "actress": "अभिनेत्री",
  "singer": "गायक",
  "director": "निर्देशक",
  "producer": "निर्माता",
  "writer": "लेखक",
  "dancer": "नर्तक",
  "comedian": "हास्य अभिनेता",
  "politician": "राजनीतिज्ञ",
  "sports": "खिलाड़ी",
  "cricketer": "क्रिकेटर",
  "model": "मॉडल",
  "lyricist": "गीतकार",
  "music_director": "संगीत निर्देशक",
  "playback_singer": "पार्श्व गायक",
  "film_maker": "फिल्म निर्माता",
  "cinematographer": "छायाकार",
  "editor": "संपादक",
  "choreographer": "कोरियोग्राफर",
  "stuntman": "स्टंटमैन",
  "voice_artist": "आवाज अभिनेता",
  "social_worker": "समाजसेवी",
  "businessman": "व्यवसायी",
  "entrepreneur": "उद्यमी",
  "influencer": "इन्फ्लुएंसर",
  "youtuber": "यूट्यूबर",
  "tv_host": "टीवी होस्ट",
  "radio_jockey": "रेडियो जॉकी",
  "journalist": "पत्रकार",
  "anchor": "एंकर",
  "photographer": "फोटोग्राफर",
  "painter": "चित्रकार",
  "musician": "संगीतकार",
  "composer": "संगीतकार",
  "producer_director": "निर्माता-निर्देशक",
  "executive_producer": "कार्यकारी निर्माता",
  "assistant_director": "सहायक निर्देशक",
  "screenplay": "पटकथा लेखक",
  "dialogue": "संवाद लेखक",
  "story_writer": "कहानी लेखक",
  "sportsperson": "खिलाड़ी",
  "athlete": "एथलीट",
  "footballer": "फुटबॉलर",
  "tennis_player": "टेनिस खिलाड़ी",
  "badminton_player": "बैडमिंटन खिलाड़ी"
};

// Function to get Hindi profession name
 export const getHindiProfession = (professionName) => {
  if (!professionName) return professionName;
  const lowerProf = professionName.toLowerCase().trim();
  
  // Check direct mapping
  if (professionHindiMap[lowerProf]) {
    return professionHindiMap[lowerProf];
  }
  
  // Check by removing spaces and special chars
  const normalized = lowerProf.replace(/[^a-z]/g, '');
  for (const [key, value] of Object.entries(professionHindiMap)) {
    if (key.replace(/[^a-z]/g, '') === normalized) {
      return value;
    }
  }
  
  // Return original with first letter capitalized if no mapping found
  return professionName.charAt(0).toUpperCase() + professionName.slice(1);
};