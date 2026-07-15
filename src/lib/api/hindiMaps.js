//cd /home/claude/api && cat > hindiMaps.js << 'EOF'
//  Genre, Language, Profession ke Hindi translation maps + helper functions
// Genres, Movies, WebSeries, TvShows, Celebrities, Professions sabhi isko use karte hain

export const GENRE_HINDI_MAP = {
  // Basic Genres
  "action": "एक्शन",
  "adventure": "साहसिक",
  "comedy": "कॉमेडी",
  "drama": "नाटक",
  "horror": "डरावनी",
  "thriller": "रोमांचक",
  "romance": "रोमांस",
  "sci-fi": "साइंस फिक्शन",
  "fantasy": "काल्पनिक",
  "crime": "अपराध",
  "mystery": "रहस्य",
  "music": "संगीत",
  "family": "परिवार",
  "sports": "खेल",
  "animation": "एनीमेशन",
  "documentary": "वृत्तचित्र",
  "biography": "जीवनी",
  "history": "इतिहास",
  "war": "युद्ध",
  "spy": "जासूसी",
  "epic": "महाकाव्य",
  "tragedy": "दुखांत",
  "revenge": "बदला",
  "survival": "उत्तरजीविता",
  "supernatural": "अलौकिक",
  "suspense": "सस्पेंस",
  "emotional": "भावुक",
  "quest": "खोज",
  "disaster": "आपदा",
  "heist": "लूटपाट",
  "musical": "संगीतमय",
  "political": "राजनीतिक",
  "devotional": "भक्तिपूर्ण",
  "fashion": "फैशन",
  "youth": "युवा",
  "teen": "किशोर",

  // ========== WITH SPACES (as they come from API) ==========
  "courtroom comedy": "कोर्टरूम कॉमेडी",
  "courtroom drama": "कोर्टरूम नाटक",
  "social issue drama": "सामाजिक मुद्दा नाटक",
  "social drama": "सामाजिक नाटक",
  "science fiction": "विज्ञान कथा",
  "soap opera": "धारावाहिक",
  "dark thriller": "डार्क थ्रिलर",
  "psychological thriller": "साइकोलॉजिकल थ्रिलर",
  "psychological horror": "साइकोलॉजिकल हॉरर",
  "teen horror": "टीन हॉरर",
  "teen drama": "टीन ड्रामा",
  "cop drama": "कॉप ड्रामा",
  "period drama": "पीरियड ड्रामा",
  "dark fantasy": "डार्क फैंटेसी",
  "time travel": "टाइम ट्रैवल",
  "alien invasion": "एलियन आक्रमण",
  "sword and sandal": "तलवार और सैंडल",
  "buddy cop": "बडी कॉप",
  "coming of age": "प्रौढ़ता-आगमन",
  "slice of life": "जीवन का अंश",
  "reality television": "रियलिटी टेलीविजन",
  "cooking show": "कुकिंग शो",
  "social commentary": "सामाजिक टिप्पणी",
  "one person army action": "एकल सेना एक्शन",
  "car action": "कार एक्शन",
  "gun fu": "गन फू",
  "tragic romance": "दुखद रोमांस",
  "dark comedy": "डार्क कॉमेडी",
  "crime thriller": "क्राइम थ्रिलर",
  "action thriller": "एक्शन थ्रिलर",
  "super hero": "सुपरहीरो",

  // ========== WITH HYPHENS (slug format) ==========
  "courtroom-comedy": "कोर्टरूम कॉमेडी",
  "courtroom-drama": "कोर्टरूम नाटक",
  "social-issue-drama": "सामाजिक मुद्दा नाटक",
  "social-drama": "सामाजिक नाटक",
  "science-fiction": "विज्ञान कथा",
  "soap-opera": "धारावाहिक",
  "dark-thriller": "डार्क थ्रिलर",
  "psychological-thriller": "साइकोलॉजिकल थ्रिलर",
  "psychological-horror": "साइकोलॉजिकल हॉरर",
  "teen-horror": "टीन हॉरर",
  "teen-drama": "टीन ड्रामा",
  "cop-drama": "कॉप ड्रामा",
  "period-drama": "पीरियड ड्रामा",
  "dark-fantasy": "डार्क फैंटेसी",
  "time-travel": "टाइम ट्रैवल",
  "alien-invasion": "एलियन आक्रमण",
  "sword-and-sandal": "तलवार और सैंडल",
  "buddy-cop": "बडी कॉप",
  "coming-of-age": "प्रौढ़ता-आगमन",
  "slice-of-life": "जीवन का अंश",
  "reality-television": "रियलिटी टेलीविजन",
  "cooking-show": "कुकिंग शो",
  "social-commentary": "सामाजिक टिप्पणी",
  "one-person-army-action": "एकल सेना एक्शन",
  "car-action": "कार एक्शन",
  "gun-fu": "गन फू",
  "tragic-romance": "दुखद रोमांस",
  "dark-comedy": "डार्क कॉमेडी",
  "super-hero": "सुपरहीरो",
  "mythology": "पौराणिक",
  "historical-1": "ऐतिहासिक",
  "sci-fi-1": "साइंस फिक्शन",
  // Simple ones
  "historical": "ऐतिहासिक",
  "superhero": "सुपरहीरो",
  "concert": "कॉन्सर्ट",
  "mythological": "पौराणिक",
  "gangster": "गैंगस्टर",
  "psychological": "मनोवैज्ञानिक",
  "murder": "हत्या",

  // ========== HINDI DIRECT ==========
  "राजनीति": "राजनीति",
  "सामाजिक": "सामाजिक",
  "रोमांस": "रोमांस",
  "ड्रामा": "नाटक",
  "कॉमेडी": "कॉमेडी",
  "एक्शन": "एक्शन",
  "युद्ध": "युद्ध",
  "ऐतिहासिक": "ऐतिहासिक",

  // ========== MUSIC RELATED ==========
  "pop": "पॉप",
  "rock": "रॉक",
  "hip-hop": "हिप हॉप",
  "classical": "शास्त्रीय",
  "bhajan": "भजन",
  "gazal": "ग़ज़ल",
  "remix": "रीमिक्स",
  "instrumental": "वाद्य",
  "folk": "लोक",
  "patriotic": "देशभक्ति",
  "sad": "उदास",
  "happy": "खुशनुमा",
  "workout": "वर्कआउट",
  "edm": "ईडीएम",
  "electronic": "इलेक्ट्रॉनिक",
  "jazz": "जैज़",
  "lofi": "लोफाई",
  "melody": "मेलोडी",
  "qawwali": "क़व्वाली",
  "sufi": "सूफ़ी",
  "wedding": "वेडिंग",
  "retro": "रेट्रो",
  "birthday": "जन्मदिन",
  "bhangra": "भांगड़ा",
  "bhojpuri-song": "भोजपुरी गाना",
  "bollywood": "बॉलीवुड",
  "dance": "डांस",
  "filmi": "फिल्मी",
  "item-number": "आइटम नंबर",
  "item-song": "आइटम गाना",
  "arabic-music": "अरबी संगीत",
  "action-soundtrack": "एक्शन साउंडट्रैक"
};

//  Genre name (slug/string/object) -> Hindi name
export const getHindiGenreName = (genre) => {
  if (!genre) return "";

  let genreStr = typeof genre === 'object'
    ? (genre.slug || genre.name || '')
    : genre;

  genreStr = genreStr.toString().trim();

  if (!genreStr) return "";

  const lowerGenre = genreStr.toLowerCase();

  // TRY 1: Direct match
  if (GENRE_HINDI_MAP[lowerGenre]) {
    return GENRE_HINDI_MAP[lowerGenre];
  }

  // TRY 2: Replace hyphens with spaces
  const withSpaces = lowerGenre.replace(/-/g, ' ');
  if (GENRE_HINDI_MAP[withSpaces]) {
    return GENRE_HINDI_MAP[withSpaces];
  }

  // TRY 3: Replace spaces with hyphens
  const withHyphens = lowerGenre.replace(/ /g, '-');
  if (GENRE_HINDI_MAP[withHyphens]) {
    return GENRE_HINDI_MAP[withHyphens];
  }

  // TRY 4: Remove all spaces and hyphens
  const compressed = lowerGenre.replace(/[-\s]/g, '');
  if (GENRE_HINDI_MAP[compressed]) {
    return GENRE_HINDI_MAP[compressed];
  }

  // TRY 5: Check if it's a Hindi word already
  if (lowerGenre.match(/[\u0900-\u097F]/)) {
    return genreStr;
  }

  // FALLBACK: Return beautified version
  return genreStr
    .split(/[- ]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

//  Hindi Language Mapping
export const LANGUAGE_HINDI_MAP = {
  // Indian Languages
  "hindi": "हिंदी",
  "hindhi": "हिंदी",
  "urdu": "उर्दू",
  "english": "अंग्रेज़ी",
  "bengali": "बंगाली",
  "telugu": "तेलुगू",
  "tamil": "तमिल",
  "malayalam": "मलयालम",
  "kannada": "कन्नड़",
  "marathi": "मराठी",
  "gujarati": "गुजराती",
  "punjabi": "पंजाबी",
  "bhojpuri": "भोजपुरी",
  "odia": "ओड़िया",
  "assamese": "असमिया",
  "sanskrit": "संस्कृत",
  "rajasthani": "राजस्थानी",
  "haryanvi": "हरियाणवी",

  // International Languages
  "chinese": "चीनी",
  "mandarin": "मंदारिन",
  "japanese": "जापानी",
  "korean": "कोरियाई",
  "french": "फ्रेंच",
  "german": "जर्मन",
  "spanish": "स्पेनिश",
  "italian": "इतालवी",
  "russian": "रूसी",
  "portuguese": "पुर्तगाली",
  "arabic": "अरबी",
  "turkish": "तुर्की",
  "thai": "थाई",
  "vietnamese": "वियतनामी",
  "indonesian": "इंडोनेशियाई",
  "dutch": "डच",
  "swedish": "स्वीडिश",
  "polish": "पोलिश",
  "greek": "ग्रीक",
  "hebrew": "हिब्रू",
  "latin": "लैटिन",

  // Dubbed/Other
  "dubbed": "डबbed",
  "subtitled": "उपशीर्षक",
  "silent": "मूक",

  // Multi-language
  "multilingual": "बहुभाषी",
  "multiple": "एकाधिक"
};

//  Language name -> Hindi name
export const getHindiLanguageName = (language) => {
  if (!language) return "";

  const langValue = typeof language === 'object'
    ? (language.language || language.name || '')
    : language;

  const lowerLang = langValue.toString().toLowerCase();

  if (LANGUAGE_HINDI_MAP[lowerLang]) {
    return LANGUAGE_HINDI_MAP[lowerLang];
  }

  const withoutSpaces = lowerLang.replace(/\s+/g, '');
  if (LANGUAGE_HINDI_MAP[withoutSpaces]) {
    return LANGUAGE_HINDI_MAP[withoutSpaces];
  }

  return langValue;
};

//  Hindi Profession Mapping
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

//  Profession name -> Hindi name
export const getHindiProfession = (professionName) => {
  if (!professionName) return professionName;
  const lowerProf = professionName.toLowerCase().trim();

  if (professionHindiMap[lowerProf]) {
    return professionHindiMap[lowerProf];
  }

  const normalized = lowerProf.replace(/[^a-z]/g, '');
  for (const [key, value] of Object.entries(professionHindiMap)) {
    if (key.replace(/[^a-z]/g, '') === normalized) {
      return value;
    }
  }

  return professionName.charAt(0).toUpperCase() + professionName.slice(1);
};