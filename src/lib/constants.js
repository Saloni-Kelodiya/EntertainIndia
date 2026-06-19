// constants.js (Next.js)

const isServer = typeof window === 'undefined';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

export const API_URL = isServer ? `${SITE_URL}/api/data` : '/api/data';
export const MEDIA_URL = 'https://admin.entertainindia.com'; 

export const getStrapiMedia = (url) => {
  if (!url) return null;
  return url.startsWith('http') ? url : `${MEDIA_URL}${url}`;
};

// -------------------------
// App Navigation Categories
// -------------------------
export const CATEGORIES = [
  { name: 'होम', slug: '/', path: '/' },
  { name: 'बॉलीवुड', slug: 'bollywood', path: '/bollywood' },
  { name: 'हॉलीवुड', slug: 'hollywood', path: '/hollywood' },
   { name: 'टॉलीवुड', slug: 'tollywood', path: '/tollywood' },
  { name: 'भोजीवुड', slug: 'bhojiwood', path: '/bhojiwood' },
  {name:'कोरियाई',slug:'korean',path:'/korean'},
  { name: 'ओटीटी', slug: 'ott', path: '/ott' },
  { name: 'टीवी', slug: 'tv', path: '/tv' },
  { name: 'फोटो', slug: 'photos', path: '/photos' },
  { name: 'वीडियो', slug: 'videos', path: '/videos' },
  { name: 'वेब स्टोरीज़', slug: 'web-stories', path: '/web-stories' },
  { name: 'सेलिब्रिटी प्रोफाइल', slug: 'celebrities-profile', path: '/celebrities' },
  { name: 'न्यूज़', slug: 'news', path: '/news' },
  { name: 'आर्टिकल', slug: 'article', path: '/article' },
   { name: 'सभी फिल्में', slug: 'all-movies', path: '/all-movies' },
  
 
];

// -------------------------
export const ITEMS_PER_PAGE = 12;
export const FEATURED_COUNT = 6;
export const RELATED_ARTICLES_COUNT = 4;
export const POPULAR_COUNT = 5;
export const TRENDING_COUNT = 10;

// -------------------------
export const WORDS_PER_MINUTE = 200;

// -------------------------
export const SOCIAL_LINKS = {
  facebook: 'https://www.facebook.com/profile.php?id=61584375938569',
  twitter: 'https://x.com/EIndia99460',
  instagram: 'https://www.instagram.com/entertainindiaofficial/',
  youtube: 'https://www.youtube.com/@EIndiaofficial',
};

// -------------------------
export const SOCIAL_SHARE = {
  facebook: (url) =>
    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
  twitter: (url, text = '') =>
    `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
  whatsapp: (url, text = '') =>
    `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`.trim())}`,
  linkedin: (url) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
};

// -------------------------
export const DATE_FORMATS = {
  full: 'MMMM DD, YYYY',
  short: 'MMM DD, YYYY',
  relative: 'relative',
};
