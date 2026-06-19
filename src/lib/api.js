
import axios from 'axios';
import { API_URL, getStrapiMedia, MEDIA_URL } from './constants';
import qs from "qs";


const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    // ✅ Cache control headers
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  // ✅ Important: Disable caching
  withCredentials: false, // Set to true if you need cookies
});

const PUBLIC_ENDPOINTS = [
  '/articles',
  '/categories',
  '/tags',
  '/videos',
  '/photos',
  '/comments',
  '/privacy-policy',
  '/terms-of-service',
  '/web-stories',
  "/web-series",
  '/authers',
  '/movies',
  '/celebrities-profiles',
  '/movie-reviews',
  '/web-series-reviews',
  '/genres',
  '/awards',
  '/reviews',
  '/shows-reviews',
];

apiClient.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  if (config.url && !config.url.startsWith('http')) {
      // 1. Endpoint name nikalo (e.g., /movies -> movies)
      const endpointName = config.url.replace(/^\//, ''); 
      
      // 2. Endpoint ko query param mein dalo
      config.params = { 
        ...config.params, 
        endpoint: endpointName 
      };
      
      // 3. URL ko change karke baseURL (api/data) par hi rakho
      config.url = ''; 
  }

  // Baki settings same rehne do
  return config;
});

const getImageUrl = (img) => {
  if (!img) return null;
  const url = typeof img === 'string' ? img : (img.attributes?.url || img.url);
  if (!url) return null;
  return url.startsWith('http') ? url : `${MEDIA_URL}${url}`;
};

// Add response interceptor to handle token errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If we get a 401/403 error, log it for debugging
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // ignore
    }
    return Promise.reject(error);
  }
);

const getMediaUrl = (media) => {
  if (!media) return null;



  // Prefer best quality
  const url =
    media.formats?.large?.url ||
    media.formats?.medium?.url ||
    media.formats?.small?.url ||
    media.formats?.thumbnail?.url ||
    media.url;

  if (!url) return null;

  return url.startsWith("http") ? url : `${MEDIA_URL}${url}`;
};
/* ---------- helpers ---------- */
// Add a constant for the default team author
const DEFAULT_TEAM_AUTHOR = {
  id: 'team',
  name: 'EntertainIndia Team',
  username: 'entertainindiateam',
  avatar: null
};

export const normalizeMedia = (media) => {
  if (!media) return null;
  const data = media.attributes || media;

  const normalizeUrl = (url) => {
    if (!url) return null;
    return url.startsWith('http') ? url : `${MEDIA_URL}${url}`;
  };

  const formats = {};
  if (data.formats) {
    Object.keys(data.formats).forEach(key => {
      formats[key] = {
        ...data.formats[key],
        url: normalizeUrl(data.formats[key].url)
      };
    });
  }

  return {
    id: media.id,
    url: normalizeUrl(data.url),
    alternativeText: data.alternativeText || '',
    caption: data.caption || '',
    width: data.width,
    height: data.height,
    formats: formats,
  };
};

export const normalizeAuthor = (author) => {
  if (!author) return null;
  const data = author.attributes || author;

  const rawName = data.name || data.username || data.fullName || data.display_name || data.displayName;
  // Format team accounts to 'EntertainIndia Team'
  let displayName = rawName;
  const lowerName = (rawName || "").toLowerCase().replace(/\s/g, "");
  let username = data.username || data.name || data.slug;

  if (lowerName === "entertainindiateam" || lowerName === "entertainindiaofficial") {
    displayName = "EntertainIndia Team";
    username = "entertainindiateam";
  }

  // Ensure username is a slug (no spaces)
  const slugify = (str) => str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const finalizedUsername = slugify(username);

  return {
    id: author.id,
    name: displayName,
    username: finalizedUsername,
    bio: data.bio,
    avatar: data.avatar ? normalizeMedia(data.avatar) : null,
    socialLinks: data.social_links,
  };
};

const toIST = (dateStr) => {
  if (!dateStr) return null;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(new Date(dateStr));
};


export const normalizeArticle = (article) => {
  if (!article) return null;

  // Handle both flat and attributes wrapped data (Strapi v4/v5)
  const data = article.attributes || article;
  const heroRaw = data.hero_image || null;

  // Handle authors/Authors relation
  const authorsRes = data.Authors || data.authors;
  let rawAuthors = [];
  if (Array.isArray(authorsRes)) {
    rawAuthors = authorsRes;
  } else if (authorsRes?.data) {
    rawAuthors = Array.isArray(authorsRes.data) ? authorsRes.data : [authorsRes.data];
  } else if (authorsRes) {
    rawAuthors = [authorsRes];
  }
// Helper function to get primary category (first if array)
const getPrimaryCategory = (category) => {
  if (!category) return null;
  
  // If it's an array, take the first one
  if (Array.isArray(category)) {
    if (category.length === 0) return null;
    const normalized = normalizeCategory(category[0]);
    // normalizeCategory might return array for array input
    return Array.isArray(normalized) ? normalized[0] : normalized;
  }
  
  // Single category
  return normalizeCategory(category);
};
  const normalizedAuthors = rawAuthors.map(normalizeAuthor).filter(Boolean);

  const normalized = {
    id: article.id,
    documentId: article.documentId || null,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    body: data.body,
    publishDate: data.createdAt,
    rawPublishDate: data.createdAt,
    updatedDate: toIST(data.updatedAt),
    // 📅 Dates
    mainCategory: data.MainCategory || data.mainCategory || null,
    moderation_status: data.moderation_status || 'pending',


    // 📊 Meta
    readingTime: data.reading_time || 0,
    views: data.views || 0,
    featured: data.featured,
    sponsored: data.sponsored,
    sponsorMeta: data.sponsor_meta,
    language: data.language, // ✅ language field भी normalize करें

    // ✅ THIS WAS BREAKING
    watching_platform: Array.isArray(data.watching_platform)
  ? data.watching_platform.map((item) => ({
      platform: item?.platform || '',
    }))
  : [],
    // ⭐ RATING
    rating: data.rating ?? null,
    related_to: data.related_to || null,
    pros_1: data.pros_1 || null,
    pros_2: data.pros_2 || null,
    cons_1: data.cons_1 || null,
    cons_2: data.cons_2 || null,
    // 🔞 AGE RATING
    ageRating: data.agerating ?? null,

    seoTitle: data.seo_title,
    metaDescription: data.meta_description,
    canonicalUrl: data.canonical_url,
    typeContent: data.typecontent,
trending:data.trending,
    // 🖼 Hero Image
    // heroImage: heroRaw ? normalizeMedia(heroRaw) : null,
    heroImage: heroRaw ? normalizeMedia(heroRaw.data || heroRaw) : null,

    // 🔗 Relations
    category: data.category ? getPrimaryCategory(data.category) : null,
   
     genres: Array.isArray(data.genres)
      ? data.genres.map((g) => ({
        id: g.id,
        name: getHindiGenreName(g.name),
        slug: g.slug,
      }))
      : [],


    tags: data.tags ? normalizeTags(data.tags) : [],
    authors: normalizedAuthors.length > 0 ? normalizedAuthors : [DEFAULT_TEAM_AUTHOR],
    Authors: normalizedAuthors.length > 0 ? normalizedAuthors[0] : DEFAULT_TEAM_AUTHOR,
    gallery: data.gallery || [],
  };

  return normalized;
};

export const articlesAPI = {
   async getAllLight(params = {}) {
    const q = new URLSearchParams({
      "pagination[page]": params.page || 1,
      "pagination[pageSize]": params.pageSize || 12,
    });
    
    // Basic filters
    q.append("filters[language][$eq]", "hi");
    q.append("filters[moderation_status][$eq]", "published");
    q.append("sort[0]", "createdAt:desc");
    
    // ✅ SIRF YAHI FIELDS POPULATE KARO - Home page ke liye bas itna kaafi hai
   q.append("populate[hero_image]", "true");
q.append("populate[category]", "true");
q.append("populate[Authors][fields][0]", "username");
    // ❌ YEH MAT POPULATE KARO - Home page pe inki zaroorat nahi
    // populate[2] = Authors (nahi chahiye)
    // populate[3] = genres (nahi chahiye)
    // populate[4] = tags (nahi chahiye)
    // populate[5] = gallery (nahi chahiye)
    // populate[6] = watching_platform (nahi chahiye)
    // populate[7] = movie (nahi chahiye)
    
    // =========================
    // 🔥 FILTERS (Home page ke liye basic filters)
    // =========================
    
    // Featured filter - Home page ke featured section ke liye
    if (params.featured) {
      q.append("filters[featured][$eq]", "true");
      q.delete("sort[0]");
      q.append("sort[0]", "createdAt:desc");
    }
    
    // MainCategory filter - news ya article
    if (params.mainCategory) {
      q.append("filters[MainCategory][$eq]", params.mainCategory);
    }
    
    // TypeContent filter - LatestNews, CelebrityNews, ViralNews
    if (params.typeContent) {
      q.append("filters[typecontent][$eq]", params.typeContent);
    }
    
    // Category filter
    if (params.category) {
      q.append("filters[category][slug][$eq]", params.category);
    }
    
    // Limit results - Home page pe zyada items ki zaroorat nahi
    if (params.limit) {
      q.set("pagination[pageSize]", params.limit);
    }
    
    try {
      const res = await apiClient.get(`/articles?${q.toString()}`);
      const data = res?.data?.data || [];
      const pagination = res?.data?.meta?.pagination || {};
      
      // ✅ Sirf home page wali fields normalize karo
      const lightArticles = data.map(article => normalizeArticle(article));
      
      return { articles: lightArticles, pagination };
    } catch (error) {
      console.error('Lightweight API error:', error);
      return { articles: [], pagination: {} };
    }
  },
  async getAll(params = {}) {
    const q = new URLSearchParams({
      "pagination[page]": params.page || 1,
      "pagination[pageSize]": params.pageSize || 12,
    });
    
    // ✅ Only sort by createdAt:desc (latest first)
    q.append("sort[0]", "createdAt:desc");
    
    // ✅ Language filter
    q.append("filters[language][$eq]", "hi");
    
    // ✅ Only published articles
    q.append("filters[moderation_status][$eq]", "published");

    // ✅ Explicitly populate critical fields
    q.append("populate[0]", "hero_image");
    q.append("populate[1]", "category");
    q.append("populate[2]", "Authors");
    q.append("populate[3]", "genres");
    q.append("populate[4]", "tags");
    q.append("populate[5]", "gallery");
    q.append("populate[6]", "watching_platform");

    // =========================
    // 🔥 CATEGORY FILTERS
    // =========================
    const slugMap = {
      bollywood: "bollywood",
      hollywood: "hollywood",
      news: "news",
      webseries: "web-series",
      tollywood: "tollywood",
      bhojiwood: "bhojiwood",
      ott: "ott",
      korean:'korean',
      tv: "tv",
      music: "music",
      reviews: "reviews",
      photos: "photos",
      videos: "videos",
      webstories: "web-stories",
      fashion: "fashion",
      awards: "awards",
      "celebrities-profile": "celebrities-profile",
    };

    // Related To Mapping (Enum values in Strapi) - Use arrays for inclusivity
    const relatedToMap = {
      music: ["Music", "music", "Music News", "MusicNews"],
      reviews: ["Movie Review", "movie review", "Movie Reviews", "movie reviews", "Review", "Reviews"],
      fashion: ["Fashion", "fashion", "Celebrity Fashion", "CelebrityFashion"],
      awards: ["Awards", "awards", "Award", "Award Show", "Award Ceremonies", "AwardCeremony"]
    };
    
    // 🔥 INDUSTRY FILTER (Category-based: bollywood, hollywood, etc.)
    if (params.industry) {
      q.append("filters[category][slug][$eq]", params.industry);
    }
    
    // Related to filter
    if (params.related_to) {
      if (Array.isArray(params.related_to)) {
        params.related_to.forEach((val, idx) => {
          q.append(`filters[related_to][$in][${idx}]`, val);
        });
      } else {
        q.append("filters[related_to][$eq]", params.related_to);
      }
    }
    
    // 🔥 AUTHOR FILTER
    if (params.author) {
      if (params.author === 'entertainindiateam') {
        q.append("filters[$or][10][Authors][username][$eq]", params.author);
        q.append("filters[$or][11][Authors][id][$null]", "true");
      } else {
        q.append("filters[Authors][username][$eq]", params.author);
      }
    }
    
    if (params.authorId) {
      q.append("filters[Authors][id][$eq]", params.authorId);
    }

    if (params.category && slugMap[params.category]) {
      const categorySlug = slugMap[params.category];
      const relatedToValues = relatedToMap[params.category];

      if (relatedToValues) {
        if (params.industry) {
          relatedToValues.forEach((val, idx) => {
            q.append(`filters[related_to][$in][${idx}]`, val);
          });
        } else {
          const s = categorySlug;
          const variants = [s, s.endsWith('s') ? s.slice(0, -1) : s + 's'];

          variants.filter(Boolean).forEach((v, idx) => {
            q.append(`filters[$or][2][category][slug][$in][${idx}]`, v);
          });

          relatedToValues.forEach((val, idx) => {
            q.append(`filters[$or][3][related_to][$in][${idx}]`, val);
          });
        }
      } else {
        if (!params.industry || params.industry !== categorySlug) {
          q.append("filters[category][slug][$eq]", categorySlug);
        }
      }
    }
    
    // 🔥 GENRE FILTER
    if (params.genres && params.genres.length > 0) {
      params.genres.forEach((genreSlug, index) => {
        q.append(`filters[genres][slug][$in][${index}]`, genreSlug);
      });
    }

    if (params.mainCategory) {
      q.append(`filters[$and][0][$or][0][MainCategory][$eq]`, params.mainCategory);
    }

    // 🔥 TYPE CONTENT FILTER
    if (params.typeContent) {
      q.append("filters[typecontent][$eq]", params.typeContent);
    }

    // 1️⃣ PLATFORM FILTER (for OTT)
    if (params.platform && params.platform !== "all") {
      q.append("filters[platform][$eq]", params.platform);
    }
    
    // GENRE
    if (params.genre && params.genre !== "all") {
      q.append("filters[genres][$contains]", params.genre);
    }

    // RATING
    if (params.rating && params.rating !== "all") {
      q.append("filters[rating][$gte]", Number(params.rating));
    }

    // AGE RATING
    if (params.ageRating && params.ageRating !== "all") {
      q.append("filters[agerating][$eq]", params.ageRating);
    }

    // 5️⃣ LANGUAGE FILTER
    if (params.language && params.language !== "all") {
      q.append("filters[language][$eq]", params.language);
    }

    // 6️⃣ SERIES TYPE FILTER (for TV)
    if (params.seriesType && params.seriesType !== "all") {
      q.append("filters[series_type][$eq]", params.seriesType);
    }

    // 7️⃣ STATUS FILTER
    if (params.status && params.status !== "all") {
      q.append("filters[status][$eq]", params.status);
    }

    // =========================
    // 🔥 FEATURED FILTER
    // =========================
    if (params.featured) {
      q.append("filters[featured][$eq]", "true");
      // Keep sorting by createdAt even for featured
      q.delete("sort[0]");
      q.append("sort[0]", "createdAt:desc");
    }

    // Published after date - removed, use createdAt instead
    if (params.publishedAfter) {
      q.append("filters[createdAt][$gt]", params.publishedAfter);
    }
// =========================
// 🔥 TAG FILTER - Strictly Exact Match Only
// =========================
if (params.tag) {
  // Clean the tag (remove # if present)
  const cleanTag = params.tag.replace(/^#/, '').toLowerCase();
  
  // ✅ $containsi ki jagah $eq use karein taaki strictly wahi slug match ho
  q.append("filters[tags][slug][$eq]", cleanTag);
}

// Agar tags array se filter karna ho (Multiple tags matching)
if (params.tags && params.tags.length > 0) {
  params.tags.forEach((tag, idx) => {
    const cleanTag = tag.replace(/^#/, '').toLowerCase();
    // ✅ Yahan bhi strict matching apply hogi
    q.append(`filters[tags][slug][$in][${idx}]`, cleanTag);
  });
}

    // Search filter
    if (params.search) {
      q.append("filters[$and][1][$or][0][title][$containsi]", params.search);
      q.append("filters[$and][1][$or][1][summary][$containsi]", params.search);
      q.append("filters[$and][1][$or][2][slug][$containsi]", params.search);
    }

    // Advanced filters
    if (params.filters) {
      Object.entries(params.filters).forEach(([field, condition]) => {
        Object.entries(condition).forEach(([op, value]) => {
          q.append(`filters[${field}][${op}]`, value);
        });
      });
    }
    
    try {
      const res = await apiClient.get(`/articles?${q.toString()}`);
      const data = res?.data?.data || [];
      const pagination = res?.data?.meta?.pagination || {};

      return { articles: data.map(normalizeArticle), pagination };
    } catch (error) {
      console.error("Error fetching articles:", error);
      return { articles: [], pagination: {} };
    }
  },

  // ✅ DEDICATED LATEST NEWS FETCHER
  async getLatestNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "LatestNews",
      // No sort override - will use createdAt:desc
    });
  },

  // ✅ DEDICATED CELEBRITY NEWS FETCHER
  async getCelebrityNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "CelebrityNews",
    });
  },

  // ✅ DEDICATED VIRAL NEWS FETCHER
  async getViralNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "ViralNews",
    });
  },

  // ✅ DEDICATED OTT ARTICLES FETCHER
  async getOTTArticles(params = {}) {
    return articlesAPI.getAll({
      ...params,
      category: "ott",
    });
  },

  // ✅ DEDICATED TV ARTICLES FETCHER
  async getTVArticles(params = {}) {
    return articlesAPI.getAll({
      ...params,
      category: "tv",
    });
  },

  getBySlug: async (slug) => {
    const queryParams = new URLSearchParams();
    queryParams.append('filters[slug][$eq]', slug);
    queryParams.append('filters[moderation_status][$eq]', 'published');
    queryParams.append("filters[language][$eq]", "hi");
    queryParams.append('publicationState', 'live');
    queryParams.append('populate[0]', 'hero_image');
    queryParams.append('populate[1]', 'category');
    queryParams.append('populate[2]', 'Authors');
    queryParams.append('populate[3]', 'genres');
    queryParams.append('populate[4]', 'tags');
    queryParams.append('populate[5]', 'gallery');

    const res = await apiClient.get(`/articles?${queryParams.toString()}`);
    const item = res?.data?.data?.[0];
    return item ? normalizeArticle(item) : null;
  },

  getTrending: async ({ limit = 10, categorySlug = null } = {}) => {
    try {
      const queryParams = new URLSearchParams();
  
      queryParams.append('filters[trending][$eq]', 'true');
      queryParams.append('filters[moderation_status][$eq]', 'published');
      queryParams.append('filters[language][$eq]', 'hi');
      queryParams.append('sort', 'createdAt:desc'); // ✅ Changed to createdAt
      
      const pageSize = 15;
      queryParams.append('pagination[pageSize]', pageSize);
      queryParams.append('pagination[page]', 1);
      queryParams.append('publicationState', 'live');
  
      queryParams.append('populate[0]', 'hero_image');
      queryParams.append('populate[1]', 'category');
      queryParams.append('populate[2]', 'Authors');
      queryParams.append('populate[3]', 'genres');
  
      if (categorySlug) {
        queryParams.append('filters[category][slug][$eq]', categorySlug);
      }
  
      const response = await apiClient.get(`/articles?${queryParams.toString()}`);
      const articles = response.data.data.map(normalizeArticle);
  
      return articles.slice(0, limit);
    } catch (error) {
      console.error('Error fetching trending articles:', error);
      return [];
    }
  },
  
  // ✅ DEDICATED MY ARTICLES FETCHER (For Dashboard)
  async getMyArticles(userId, params = {}) {
    const token = localStorage.getItem("token");
    const q = new URLSearchParams({
      "pagination[page]": params.page || 1,
      "pagination[pageSize]": params.pageSize || 10,
    });

    q.append("filters[Authors][id][$eq]", userId);
    q.append("sort[0]", "createdAt:desc"); // ✅ Changed to createdAt
    q.append("filters[language][$eq]", "hi");
    q.append("populate[0]", "hero_image");
    q.append("populate[1]", "category");

    try {
      const res = await apiClient.get(`/articles?${q.toString()}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res?.data?.data || [];
      const pagination = res?.data?.meta?.pagination || {};

      return { articles: data.map(normalizeArticle), pagination };
    } catch (error) {
      console.error("Error fetching author articles:", error);
      return { articles: [], pagination: {} };
    }
  },

  getPopular: async (limit = 5) => {
    const queryParams = new URLSearchParams();
    queryParams.append('sort', 'views:desc');
    queryParams.append('filters[moderation_status][$eq]', 'published');
    queryParams.append('pagination[pageSize]', limit);
    queryParams.append('publicationState', 'live');
    queryParams.append('populate[0]', 'hero_image');
    queryParams.append("filters[language][$eq]", "hi");
    queryParams.append('populate[1]', 'category');
    queryParams.append('populate[2]', 'Authors');

    return apiClient
      .get(`/articles?${queryParams.toString()}`)
      .then((res) => res.data.data.map(normalizeArticle));
  },

  getRelated: async (categorySlug, tagSlugs, excludeSlug, limit = 4) => {
    const queryParams = new URLSearchParams();

    if (categorySlug) {
      queryParams.append('filters[category][slug][$eq]', categorySlug);
    }

    if (tagSlugs && tagSlugs.length > 0) {
      tagSlugs.forEach((tagSlug, index) => {
        queryParams.append(`filters[tags][slug][$in][${index}]`, tagSlug);
      });
    }

    queryParams.append('filters[slug][$ne]', excludeSlug);
    queryParams.append('publicationState', 'live');
    queryParams.append('pagination[pageSize]', limit);
    queryParams.append('populate[0]', 'hero_image');
    queryParams.append('populate[1]', 'category');
    queryParams.append('populate[2]', 'Authors');
    queryParams.append("filters[language][$eq]", "hi");
    queryParams.append('sort', 'createdAt:desc'); // ✅ Changed to createdAt

    return apiClient
      .get(`/articles?${queryParams.toString()}`)
      .then((res) => res.data.data.map(normalizeArticle))
      .catch((err) => {
        console.error("Error fetching related articles:", err);
        return [];
      });
  },

  getByMovie: async (movieId) => {
    try {
      const query = qs.stringify({
        filters: {
          movie: { id: { $eq: movieId } },
        },
        populate: {
          hero_image: true,
          category: true,
          Authors: { populate: '*' },
        },
        sort: ['createdAt:desc'], // ✅ Changed to createdAt
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/articles?${query}`);
      return (res.data?.data || []).map(normalizeArticle);
    } catch (err) {
      console.error("Error fetching articles by movie:", err);
      return [];
    }
  },

  // Rest of the methods remain the same...
  uploadImage: async (file) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const formData = new FormData();
    formData.append("files", file);

    const res = await apiClient.post(`/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return res.data[0];
  },

  createWithImage: async (articleData, imageFile) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      let heroImageObj = null;
      if (imageFile) {
        const upload = await articlesAPI.uploadImage(imageFile);
        heroImageObj = { id: upload.id };
      }

      const payload = {
        data: {
          ...articleData,
          hero_image: heroImageObj,
        },
      };

      const res = await apiClient.post("/articles", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return normalizeArticle(res.data.data);
    } catch (err) {
      throw err;
    }
  },
};

export const normalizeCategory = (category) => {
  if (!category) return null;
  
  // Handle array of categories
  if (Array.isArray(category)) {
    return category.map(cat => normalizeCategory(cat)).filter(Boolean);
  }
  
  // Handle single category
  const data = category.attributes || category;
  return {
    id: category.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
  };
};

export const categoriesAPI = {
  getAll: async () => {
    return apiClient.get('/categories').then((res) => res.data.data.map(normalizeCategory));
  },

  getBySlug: (slug) => {
    return apiClient
      .get(`/categories?filters[slug][$eq]=${encodeURIComponent(slug)}`)
      .then((res) => normalizeCategory(res.data.data[0]));
  },
};


export const normalizeTags = (tags) => {
  if (!tags) return [];
  const data = tags.data || tags;
  if (!Array.isArray(data)) return [];

  return data.map((tag) => {
    const tData = tag.attributes || tag;
    return {
      id: tag.id,
      name: tData.name,
      slug: tData.slug,
    };
  });
};
// api.js - Update your GenresAPI
export const normalizeGenres = (genres) => {
  if (!genres || !Array.isArray(genres)) return [];

  return genres.map((genre) => {
    const data = genre.attributes || genre;
    return {
      id: genre.id,
       name: getHindiGenreName(data.name),
      slug: data.slug,
      
    };
  });
};

export const GenresAPI = {
  getAll: async () => {
    return apiClient
      .get("/genres?pagination[limit]=100") // Fetch all genres
      .then((res) => normalizeGenres(res.data.data));
  },

  getBySlug: async (slug) => {
    return apiClient
      .get(`/genres?filters[slug][$eq]=${encodeURIComponent(slug)}`)
      .then((res) =>
        res.data.data?.[0]
          ? normalizeGenres([res.data.data[0]])[0]
          : null
      );
  },
};

// Complete fixed GENRE_HINDI_MAP - All keys in lowercase with spaces
const GENRE_HINDI_MAP = {
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

// Fixed getHindiGenreName function - converts all formats
const getHindiGenreName = (genre) => {
  if (!genre) return "";
  
  // Extract the genre string
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


// Hindi Language Mapping
const LANGUAGE_HINDI_MAP = {
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

// Helper function to get Hindi language name
const getHindiLanguageName = (language) => {
  if (!language) return "";
  
  const langValue = typeof language === 'object' 
    ? (language.language || language.name || '') 
    : language;
  
  const lowerLang = langValue.toString().toLowerCase();
  
  // Direct match
  if (LANGUAGE_HINDI_MAP[lowerLang]) {
    return LANGUAGE_HINDI_MAP[lowerLang];
  }
  
  // Check without spaces
  const withoutSpaces = lowerLang.replace(/\s+/g, '');
  if (LANGUAGE_HINDI_MAP[withoutSpaces]) {
    return LANGUAGE_HINDI_MAP[withoutSpaces];
  }
  
  // Return original if no mapping found
  return langValue;
};


const normalizeRichText = (blocks = []) =>
  blocks
    .map((b) =>
      Array.isArray(b.children)
        ? b.children.map((c) => c.text).join("")
        : ""
    )
    .join("\n\n");

// Helper to extract display value from potential Strapi entity objects
const getDisplayValue = (val) => {
  if (!val) return null;
  // Handle Strapi relation structure { data: { attributes: { ... } } }
  const target = val.data ? (val.data.attributes || val.data) : (val.attributes || val);

  if (typeof target === 'object' && !Array.isArray(target)) {
    return target.language || target.name || target.title || target.value || target.slug || target.language_name || target.LanguageName || target.Name || target.lang || target.Lang || null;
  }
  return target;
};


const normalizeCast = (role) => {
  if (!role) return null;

  const rawActor = role.celebrities_profile?.data || role.celebrities_profile;
  if (!rawActor) return null;
  const actor = rawActor.attributes || rawActor;
  
 

  return {
    id: role.id,
    characterName: role.characterName || "",
    role: role.role || "",
    actor: {
      id: rawActor.id || actor.id,
      name: actor.name || "",
      slug: actor.Slug || actor.slug || "",
      industry: actor.industry || "",
      profession: actor.Profession || actor.professions || [],
      avatar: normalizeMedia(actor.Avatar?.data || actor.Avatar),
    },
  };
};

export const globalSearch = async (query) => {
  if (!query) return null;

  // Pehle: process.env.NEXT_PUBLIC_STRAPI_URL...
  // Ab hamara proxy path:
  const res = await fetch(`/api/data?endpoint=search&q=${encodeURIComponent(query)}`);

  if (!res.ok) throw new Error("Search failed");
  return res.json();
};


export const normalizeMovie = (movie) => {
  if (!movie) return null;
  // Strapi v4 safe
  const data = movie.attributes || movie;
  const rawBoxOffice = data.boxOffice || data.box_office || null;
  const boxOfficeItem = Array.isArray(rawBoxOffice)
    ? rawBoxOffice[0]
    : rawBoxOffice;
  return {
    id: movie.id,
    documentId: movie.documentId,
    // Basic info
    title: data.title || "",
    slug: data.slug || "",
    trandingRank: data.trandingRank ? Number(data.trandingRank) : 0,
    releaseType: data.releaseType || "",
    movieType: getDisplayValue(data.movieType),
    topSearchRank: data.topSearchRank || 0,
    language: getDisplayValue(data.language),
    languages: (() => {
      const langs = data.languages?.data || data.languages || data.Languages?.data || data.Languages;
      if (Array.isArray(langs)) {
        return langs.map(l => {
          const lData = l.attributes || l;
          return lData.language || lData.name || lData.title || lData.Name || lData.language_name || lData.LanguageName || lData.lang || lData.Lang || "";
        }).filter(Boolean);
      }
      const singleLang = data.language || data.Language;
      return singleLang ? [getDisplayValue(singleLang)] : [];
    })(),
    industry: getDisplayValue(data.industry),
    // Meta
    rating: getDisplayValue(data.rating),
    language: data.language, // ✅ language field भी normalize करें
    duration: data.duration || "",
    releaseDate: data.releaseDate || null,
    year: data.releaseDate ? new Date(data.releaseDate).getFullYear() : null,
    trending:data.trending,
    // Text content
    description: data.description,
    synopsis: data.synopsis || "",
    // People
    director: getDisplayValue(data.director),
    // Trailer
    trailer_id: data.trailer_id || "",
    // CERTIFICATE (UA / U / A / 18+)
    certificate: getDisplayValue(data.age_rating) || data.certificate || data.agerating || null,

    // Extract Many-to-Many genres (Confirmed plural 'genres' in dashboard)
    genres: normalizeGenres(data.genres?.data || data.genres),
    ratings_list: [getDisplayValue(data.rating)].filter(Boolean),
    age_rating: Array.isArray(data.age_rating)
      ? data.age_rating.map(age => ({
        id: age.id,
        name: age.name,
        slug: age.slug,
      }))
      : [],
    release_years_list: [getDisplayValue(data.release_year) || (data.releaseDate ? new Date(data.releaseDate).getFullYear() : null)].filter(Boolean),
    /* ---------- MEDIA ---------- */
    poster: normalizeMedia(data.poster),
    backdrop: data.backdrop
      ? {
        url: getImageUrl(data.backdrop),
      }
      : null,
    category: (() => {
      // Strapi v4 nested structure handle karne ke liye
      const catData = data.category?.data?.attributes || data.category?.attributes || data.category;
      if (!catData) return null;
      return {
        id: data.category?.data?.id || data.category?.id || null,
        name: catData.name || "",
        slug: catData.slug || "",
      };
    })(),

    // ✅ Categories (ARRAY)
    categories: Array.isArray(data.categories)
      ? data.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }))
      : [],
    /* ---------- RELATIONS ---------- */
    celebrities: Array.isArray(data.celebrities_profiles)
      ? data.celebrities_profiles.map(normalizeCelebrity)
      : [],
    cast: Array.isArray(data.cast)
      ? data.cast
        .map(normalizeCast)
        .filter(Boolean)
      : [],
    relatedMovies: Array.isArray(data.movies)
      ? data.movies.map((m) => ({
        id: m.id,
        documentId: m.documentId,
        title: m.title || "",
        slug: m.slug || "",
        poster: m.poster
          ? { url: getImageUrl(m.poster) }
          : null,
      }))
      : [],
    whereToWatch: Array.isArray(data.where_to_watch)
      ? data.where_to_watch.map((w) => ({
        platform: getDisplayValue(w.platform),
        status: w.watch_status || "",
        url: w.url || null,
      }))
      : [],
    reviews: data.movie_review || [],
    comments: data.comments || [],
    boxOffice: boxOfficeItem
      ? {
        budget: boxOfficeItem.budget ?? null,
        overseas: boxOfficeItem.overseas ?? null,
        opening: boxOfficeItem.opening ?? null,
        domestic: boxOfficeItem.domestic ?? null,
        description: boxOfficeItem.description ?? null,
        worldwideCollection: boxOfficeItem.worldwideCollection ?? null,
        verdict: getDisplayValue(boxOfficeItem.verdict) ?? null,
      }
      : null,
    articles: Array.isArray(data.articles)
      ? data.articles.map((a) => ({
        id: a.id,
        documentId: a.documentId,
        title: a.title || '',
        slug: a.slug || '',
        summary: a.summary || '',
        excerpt: a.summary || '',
        mainCategory:a.MainCategory||'',
        body: a.body || '',
        publishedAt: a.createdAt|| a.publishedAt,
        views: a.views ?? 0,
       
        hero_image: a.hero_image
          ? { url: getMediaUrl(a.hero_image) }
          : null,
      }))
      : [],

   // ✅ FIXED SIMILAR MOVIES
    similarMovies: (() => {
      // Check multiple possible paths
      let similarData = data.similarMovies || movie.similarMovies || [];
      
      if (!Array.isArray(similarData)) return [];
      
      // If empty, return empty array
      if (similarData.length === 0) return [];
      
      // Check if it's already an array of movie objects
      if (similarData[0] && similarData[0].title) {
        return similarData.map((m) => ({
          id: m.id,
          documentId: m.documentId,
          title: m.title || "",
          slug: m.slug || "",
          description: m.description || "",
          rating: m.rating?.title || m.rating || "",
          year: m.releaseDate ? new Date(m.releaseDate).getFullYear() : null,
          duration: m.duration || "",
         category: (() => {
  const cat = m.category?.data?.attributes || m.category;
  return cat?.name || "";
})(),
          poster: m.poster ? getImageUrl(m.poster) : null,
          backdrop: m.backdrop ? getImageUrl(m.backdrop) : null,
        }));
      }
      
      // Handle nested structure
      return similarData.flatMap((item) => {
        // Direct movie object
        if (item && item.title && !item.movies) {
          return {
            id: item.id,
            documentId: item.documentId,
            title: item.title || "",
            slug: item.slug || "",
            description: item.description || "",
            rating: item.rating?.title || item.rating || "",
            year: item.releaseDate ? new Date(item.releaseDate).getFullYear() : null,
            duration: item.duration || "",
            category: item.category?.name || item.category || "",
            poster: item.poster ? getImageUrl(item.poster) : null,
            backdrop: item.backdrop ? getImageUrl(item.backdrop) : null,
          };
        }
        
        // Item has movies array
        if (item && Array.isArray(item.movies)) {
          return item.movies.map((m) => {
            const movieData = m.attributes || m;
            return {
              id: m.id,
              documentId: m.documentId,
              title: movieData.title || "",
              slug: movieData.slug || "",
              description: movieData.description || "",
              rating: movieData.rating?.title || movieData.rating || "",
              year: movieData.releaseDate ? new Date(movieData.releaseDate).getFullYear() : null,
              duration: movieData.duration || "",
              category: (() => {
  const cat = (m.attributes || m).category?.data?.attributes || (m.attributes || m).category;
  return cat?.name || "";
})(),
              poster: movieData.poster ? getImageUrl(movieData.poster) : null,
              backdrop: movieData.backdrop ? getImageUrl(movieData.backdrop) : null,
            };
          });
        }
        
        return [];
      });
    })(),
    award: Array.isArray(data.award)
      ? data.award.map((a) => ({
        name: a.name || "",
        title: a.title || "",
        category: a.category || "",
        year: a.year || "",
        awardStatus: a.awardStatus || (a.won === true ? 'Won' : (a.won === false ? 'Nominated' : (a.status || 'Nominated'))),
        iconType: a.iconType || "gold",
        awardImage: normalizeMedia(a.awardImage),
      }))
      : [],
   
   /* ---------- CREW (INLINE NORMALIZATION) ---------- */
crew: Array.isArray(data?.data?.[0]?.crewMembers)
  ? data.data[0].crewMembers.map((crew) => {
      const photoObj = Array.isArray(crew.photo)
        ? crew.photo[0]
        : crew.photo || null;
      return {
        id: crew.id ?? null,
        name: crew.name || "",
        role: crew.role || "",
        photo: photoObj
          ? {
              url: photoObj.formats?.thumbnail?.url?.startsWith("http")
                ? photoObj.formats.thumbnail.url
                : photoObj.url?.startsWith("http")
                ? photoObj.url
                : null,
            }
          : null,
      };
    })
  : [],

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
  };
};
export const moviesAPI = {
  // Get all movies
  getAllLight: async (params = {}) => {
    let finalSort = params.sort || 'releaseDate:desc';
  
    const queryObj = {
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 12,
      },
      sort: finalSort,
      // ✅ SIRF POSTER POPULATE KARO - Baaki kuch nahi chahiye
      populate: ['poster','category'],
      filters: {
        language: { $eq: "hi" },

      }
    };
  // Trending filter
if (params.filters?.trending) {
  queryObj.filters.trending = {
    $eq: true
  };
}
    // 🔍 SEARCH FILTER
    if (params.search && params.search.trim().length > 1) {
      queryObj.filters.title = { $containsi: params.search.trim() };
    }
  
    // ✅ CATEGORY filter
    if (params.category && params.category !== 'all') {
      queryObj.filters.category = { slug: { $eq: params.category } };
    }
  
    // ✅ GENRE filter
    if (params.genre && params.genre !== 'All' && params.genre !== 'all') {
      queryObj.filters.genres = { name: { $eq: params.genre } };
    }
  
    try {
      const query = qs.stringify(queryObj, { encodeValuesOnly: true });
      const res = await apiClient.get(`/movies?${query}`);
      
      return {
        movies: (res.data?.data || []).map(normalizeMovie),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("❌ moviesAPI.getAllLight Error:", error);
      return { movies: [], pagination: {} };
    }
  },
  // Add this to your moviesAPI object
getCompleteMovieDetails: async (slug) => {
  try {
    const query = qs.stringify({
      filters: { 
        slug: { $eq: slug },
        language: { $eq: "hi" }
      },
      populate: {
        // Main movie data
        poster: true,
        backdrop: true,
        genres: true,
        category: true,
        boxOffice: true,
        languages: true,
        age_rating: true,
        rating: true,
        release_year: true,
        award: true,
        where_to_watch: true,
        
        // Cast with their profile images
        cast: {
          populate: {
            celebrities_profile: {
              populate: { Avatar: true }
            }
          }
        },
        
        // Crew with photos
        crewMembers: {
          populate: { photo: true }
        },
        
        // Articles (only published)
        articles: {
          filters: {
            moderation_status: { $eq: "published" }
          },
          populate: {
            hero_image: true
          }
        },
        
        // Similar movies (lightweight version)
        similarMovies: {
          populate: {
            poster: true,
            backdrop: true,
            category: true
          }
        }
      },
     
        // ... all your existing populations ...
        reviews: {
          sort: ['createdAt:desc'],
          pagination: { pageSize: 10 }
        }
    
    }, { encodeValuesOnly: true });

    const res = await apiClient.get(`/movies?${query}`);
    const item = res.data?.data?.[0];

    if (!item) return null;

    // Return everything in one object
    return {
      movie: normalizeMovie(item),
      cast: item.cast || [],
      crew: item.crewMembers || [],
      articles: item.articles || [],
      similarMovies: item.similarMovies || []
    };
  } catch (err) {
    console.error("❌ getCompleteMovieDetails error:", err);
    return null;
  }
},
  getAll: async (params = {}) => {
    // Sanitize sort - remove topSearchRank if present
    let finalSort = params.sort || 'releaseDate:desc';
  
    const queryObj = {
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 12,
      },
      sort: finalSort,
      populate: ['genres', 'poster', 'backdrop', 'boxOffice', 'languages', 'age_rating', 'rating', 'release_year', 'category'],
      filters: {
        // ✅ FORCE ENGLISH LANGUAGE FILTER
        language: { $eq: "hi" }
      }
    };
  
    // 🔍 SEARCH FILTER
   
    // Search filter
    if (params.search) {
      q.append("filters[$and][1][$or][0][title][$containsi]", params.search);
      q.append("filters[$and][1][$or][1][description][$containsi]", params.search);
      q.append("filters[$and][1][$or][2][slug][$containsi]", params.search);
    }
  
    // ✅ RELEASE TYPE filter
    if (params.releaseType) {
      queryObj.filters.releaseType = { $eq: params.releaseType };
    }
  
    // ✅ ADDITIONAL FILTERS
    if (params.filters) {
      if (params.filters.genre && params.filters.genre !== "All") {
        queryObj.filters.genres = { name: { $containsi: params.filters.genre } };
      }
      if (params.filters.year && params.filters.year !== "All") {
        queryObj.filters.releaseDate = { $contains: params.filters.year };
      }
      if (params.filters.rating && params.filters.rating !== "All") {
        queryObj.filters.rating = { $gte: Number(params.filters.rating) };
      }
      if (params.filters.certificate && params.filters.certificate !== "All") {
        queryObj.filters.age_rating = { $eq: params.filters.certificate };
      }
    }
  
    // ✅ CATEGORY filter only (INDUSTRY logic REMOVED)
    if (params.category && params.category !== 'all') {
      queryObj.filters.category = { slug: { $eq: params.category } };
    }
  
    // ✅ GENRE filter (Specific)
    if (params.genre && params.genre !== 'All' && params.genre !== 'all') {
      queryObj.filters.genres = { ...queryObj.filters.genres, name: { $eq: params.genre } };
    }
  
    try {
      const query = qs.stringify(queryObj, { encodeValuesOnly: true });
  
      const res = await apiClient.get(`/movies?${query}`);
      return {
        movies: (res.data?.data || []).map(normalizeMovie),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("❌ moviesAPI.getAll Error:", error);
      return { movies: [], pagination: {} };
    }
  },
  
  // ✅ SIMPLE SEARCH METHOD - सबसे सुरक्षित और तेज़
  simpleSearch: async (searchTerm, options = {}) => {
    try {
      const { page = 1, pageSize = 8, category } = options;
      
      const queryObj = {
        pagination: {
          page: page,
          pageSize: pageSize,
        },
        sort: 'releaseDate:desc',
        populate: ['poster', 'genres','category'],
        filters: {
          language: { $eq: "hi" }
        }
      };

      // Search filter
      if (searchTerm && searchTerm.trim().length > 0) {
        const term = searchTerm.trim();
        queryObj.filters.$or = [
          { title: { $containsi: term } },
          { slug: { $containsi: term } }
        ];
      }

      // Category filter
      if (category && category !== 'all') {
        queryObj.filters.category = { slug: { $eq: category } };
      }

      const query = qs.stringify(queryObj, { encodeValuesOnly: true });
      

      const res = await apiClient.get(`/movies?${query}`);
      return {
        movies: (res.data?.data || []).map(normalizeMovie),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("❌ simpleSearch Error:", error);
      return { movies: [], pagination: {} };
    }
  },

  // ✅ NEW: Get movies by movieType
  getByMovieType: async (movieType, params = {}) => {
    try {
      const queryObj = {
        pagination: {
          page: params.page || 1,
          pageSize: params.pageSize || 12,
        },
        sort: params.sort || 'releaseDate:desc',
        filters: {
          language: { $eq: "hi" },
          movieType: { $eq: movieType }
        },
        populate: ['genres', 'poster', 'backdrop']
      };

      const query = qs.stringify(queryObj, { encodeValuesOnly: true });
      const res = await apiClient.get(`/movies?${query}`);
      
      return {
        movies: (res.data?.data || []).map(normalizeMovie),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("❌ getByMovieType Error:", error);
      return { movies: [], pagination: {} };
    }
  },

  getBySlug: async (slug) => {
   try {
     const query = qs.stringify({
       filters: {
         slug: { $eq: slug },
         language: { $eq: "hi" }
       },
       populate: [
         'poster',
         'backdrop',
         'genres',
         'category',
         'boxOffice',
         'crewMembers.photo',
         'languages',
         'articles.hero_image',
         'similarMovies',  // ✅ Add this
         'similarMovies.poster',  // ✅ Add this for poster
         'similarMovies.backdrop',  // ✅ Optional
         'similarMovies.category',   // ✅ ADD THIS
         'award',
         'where_to_watch',
         'cast.celebrities_profile.Avatar'
       ]
     }, { encodeValuesOnly: true });
 
     const res = await apiClient.get(`/movies?${query}`);
     const item = res.data?.data?.[0];
 
     if (!item) return null;
 
     return normalizeMovie(item);
   } catch (err) {
     console.error("❌ Movie API Error:", err);
     return null;
   }
 },

  // Submit review using custom endpoint to bypass 403 Forbidden
  submitReview: async (movieId, reviewData) => {
    try {
      const res = await apiClient.post(`/movies/${movieId}/review`, {
        data: {
          username: reviewData.username,
          rating: reviewData.rating,
          comment: reviewData.comment
        }
      });
      return normalizeMovie(res.data?.data);
    } catch (err) {
      throw err;
    }
  },

  getBySlugWithSimMovie: async (slug) => {
  try {
    const query = qs.stringify({
      filters: { 
        slug: { $eq: slug },
        language: { $eq: "hi" }
      },
      populate: [
        'similarMovies',
        'similarMovies.poster',
        'similarMovies.backdrop',
        'similarMovies.category'
      ]
    }, { encodeValuesOnly: true });

    console.log("SimMovie Query:", query);

    const res = await apiClient.get(`/movies?${query}`);
    const item = res.data?.data?.[0];

    return item ? normalizeMovie(item) : null;

  } catch (err) {
    console.error("❌ getBySlugWithSimMovie error:", err);
    return null;
  }
},

  /* ---------- GET WITH CAST ---------- */
  getBySlugWithCast: async (slug) => {
    try {
      const query = qs.stringify({
        filters: { 
          slug: { $eq: slug },
          language: { $eq: "hi" }
        },
        populate: {
          cast: {
            populate: {
              celebrities_profile: {
                populate: { Avatar: true }
              }
            }
          }
        }
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/movies?${query}`);
      const item = res.data?.data?.[0];
      return item ? normalizeMovie(item) : null;
    } catch (err) {
      console.error("❌ getBySlugWithCast error:", err);
      return null;
    }
  },

  getBySlugWithCrew: async (slug) => {
    try {
      const query = qs.stringify({
        filters: { 
          slug: { $eq: slug },
          language: { $eq: "hi" }
        },
        populate: {
          crewMembers: { populate: { photo: true } }
        }
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/movies?${query}`);
      const item = res.data?.data?.[0];
      return item ? normalizeMovie(item) : null;
    } catch (err) {
      console.error("❌ getBySlugWithCrew error:", err);
      return null;
    }
  },
getBySlugWithArticles: async (slug) => {
  try {
    const query = qs.stringify({
      filters: {
        slug: { $eq: slug },
        language: { $eq: "hi" }
      },
      populate: {
        articles: {
          filters: {
            moderation_status: { $eq: "published" }
          },
          populate: {
            hero_image: true
          }
        },
        poster: true,
        backdrop: true,
        genres: true
      }
    }, { encodeValuesOnly: true });

  

    const res = await apiClient.get(`/movies?${query}`);
    const item = res.data?.data?.[0];

    if (!item) return null;

    return normalizeMovie(item);

  } catch (error) {
    console.error("❌ getBySlugWithArticles Error:", error);
    return null;
  }
}
};

// ================================
// 🎯 MOVIE REVIEWS API (NEW)
// ================================

export const movieReviewsAPI = {

  // ✅ Create review
  create: async (movieId, review) => {
    // Note: We bypass token in the interceptor for this endpoint
    const res = await apiClient.post('/movie-reviews', {
      data: {
        username: review.username || 'Anonymous',
        rating: review.rating,
        comment: review.comment,
        movie: movieId,
        publishedAt: new Date().toISOString()
      }
    });

    return res.data;
  },

  // ✅ Get reviews of a movie
  getByMovie: async (movieId) => {
    const query = qs.stringify({
      filters: {
        movie: movieId
      },
      sort: ['createdAt:desc']
    }, { encodeValuesOnly: true });

    const res = await apiClient.get(`/movie-reviews?${query}`);
    return res.data?.data || [];
  },

  // ✅ Delete review
  delete: async (reviewDocumentId) => {
    try {
      if (!reviewDocumentId) {
        throw new Error("Missing review documentId");
      }
      const response = await apiClient.delete(`/movie-reviews/${reviewDocumentId}`);
      return response.data;
    } catch (error) {
      console.error("❌ Delete movie review error:", error.response?.data || error.message);
      throw error;
    }
  }
};

// ✅ GENRE NORMALIZER
export const normalizeGenre = (genre) => {
  if (!genre) return null;
  const data = genre.attributes || genre;
  return {
    id: genre.id,
    name: data.name ,
    slug: data.slug,
  };
};

// ✅ GENRE API
export const genresAPI = {
  getAll: async () => {
    const q = new URLSearchParams({
      'pagination[pageSize]': 100, // ✅ VERY IMPORTANT
      sort: 'name:asc',
    });
    const res = await apiClient.get(`/genres?${q.toString()}`);
    return res.data.data.map(normalizeGenre);
  },
};

export const normalizeTag = (tag) => {
  if (!tag) return null;
  
  // Strapi v5 format
  const data = tag.attributes || tag;
  
  return {
    id: tag.id,
    name: data.name || tag.name,  // ✅ name सही से लें
    slug: data.slug || tag.slug,  // ✅ slug सही से लें
  };
};
export const tagsAPI = {
  getAll: async () => {
    const res = await apiClient.get('/tags');
    return res.data.data.map(normalizeTag);
  },

  getBySlug: (slug) => {
    return apiClient
      .get(`/tags?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[articles][populate]=*`)
      .then((res) => normalizeTag(res.data.data[0]));
  },
};

export const authersAPI = {
  getAll: async (params = {}) => {
    const q = new URLSearchParams({
      'pagination[page]': params.page || 1,
      'pagination[pageSize]': params.pageSize || 50,
      populate: '*',
      sort: params.sort || 'createdAt:desc'
    });

    try {
      const res = await apiClient.get(`/authers?${q.toString()}`);
      return res?.data?.data?.map(item => ({
        id: item.id,
        ...(item.attributes || item)
      })) || [];
    } catch (error) {
      return [];
    }
  },

  getBySlug: async (slug) => {
    const q = new URLSearchParams({
      'filters[Slug][$eq]': slug,
      populate: '*'
    });

    try {
      const res = await apiClient.get(`/authers?${q.toString()}`);
      const item = res?.data?.data?.[0];

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        ...(item.attributes || item)
      };
    } catch (error) {
      return null;
    }
  }
};

export const normalizeGallery = (gallery) => {
  if (!gallery) return null;

  const data = gallery.attributes || gallery;

  return {
    id: gallery.id,
    title: data.title,
    slug: data.slug,
    description: data.description || "",
    createdAt: data.createdAt,
     trending:data.trending,
    trandingRank: data.trandingRank,
    topSearchRank: data.topSearchRank || 0,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
language: data.language, // ✅ language field भी normalize करें
    fashionCategory: data.fashionCategory || data.category || "PHOTOSHOOTS",
    celebrity_name: data.celebrity_name || data.celebrity || data.artist || "",
    event: data.event || data.Event || data.event_name || data.eventName || "",
    location: data.location || data.Location || data.place || data.Place || "",
    event_date: data.event_date || data.eventDate || data.date || data.Date || "",
    
    // ✅ FIXED FOR YOUR FLAT API STRUCTURE
    image: data.image ? normalizeMedia(data.image) : null,
 categories: Array.isArray(data.categories)
      ? data.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }))
      : [],
    // ✅ PHOTOS ARRAY SAFE
    photos:
      data.photos?.map((p) => ({
        id: p.id,
        caption: p.caption || "",
        image: p.image ? normalizeMedia(p.image) : null,
        dressName:p.dress_brandName
      })) || [],
  };
};
export const galleriesAPI = {
  // ✅ GET ALL GALLERIES (ONLY HINDI)
  getAll: async (params = {}) => {
    try {
      const q = new URLSearchParams();
      
      // 1. ✅ SORT BY CREATED AT (Latest First)
      // Agar aap chahte hain ki latest publish hui galleries upar aayein toh 'publishedAt:desc' rehne dein
      // Lekin 'createdAt:desc' sabse accurate "Latest First" result deta hai.
      q.append('sort', 'createdAt:desc'); 
      
      // ✅ FORCE ENGLISH LANGUAGE FILTER
      q.append("filters[language][$eq]", "hi");
      
      if (params.language) {
        q.append("filters[language][$eq]", params.language);
      }
      
      if (params.category) {
        q.append("filters[categories][slug][$eq]", params.category);
      }

      if (params.search && params.search.trim().length > 1) {
        q.append('filters[title][$containsi]', params.search.trim());
      }

      // ✅ POPULATE
      q.append('populate[categories]', 'true');
      q.append('populate[photos][populate]', 'image');
      q.append('populate', 'image');

      const res = await apiClient.get(`/galleries?${q.toString()}`);

      return {
        galleries: res.data?.data?.map(normalizeGallery) || [],
      };
    } catch (error) {
      console.error("Error fetching galleries:", error);
      return { galleries: [] };
    }},
  // ✅ GET BY SLUG (ONLY HINDI)
  getBySlug: async (slug) => {
    try {
      const res = await apiClient.get(
        `/galleries?filters[slug][$eq]=${slug}&filters[language][$eq]=hi&populate[0]=image&populate[1]=photos&populate[2]=photos.image`
      );

      if (!res.data.data || !res.data.data.length) return null;
      return normalizeGallery(res.data.data[0]);
    } catch (error) {
      console.error("गैलरी लोड करने में त्रुटि:", error);
      return null;
    }
  },

  // ✅ RELATED GALLERIES (ONLY HINDI)
  getRelated: async (slug, limit = 6) => {
    try {
      const res = await apiClient.get(
        `/galleries?filters[slug][$ne]=${slug}&filters[language][$eq]=hi&populate[photos][populate]=image&populate=image&sort=publishedAt:desc`
      );

      return res.data.data?.slice(0, limit).map(normalizeGallery) || [];
    } catch (error) {
      console.error("संबंधित गैलरी लोड करने में त्रुटि:", error);
      return [];
    }
  },
};
export const normalizeVideo = (video) => {
  if (!video) return null;

  const data = video.attributes || video;
  const videoId = data.video_id;
    // ✅ Convert float to integer
 
return{
  id: data.id || null,
    documentId: data.documentId || null,
    title: data.title || '',
    videoId: videoId || null,
    embedUrl: videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null, // ✅ Use nocookie
    thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` : null,
    duration: data.duration || null,
    description: data.description|| '',
    slug: data.slug || '',
    views: data.views ?? 0,
    publishedDate: data.publishedAt || null,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
    videotype: data.videotype || '',
    language: data.language || '',
    trending: data.trending ?? false,
    
    // Normalized category
    category: data.category
      ? {
          id: data.category.id,
          documentId: data.category.documentId || null,
          name: data.category.name,
          slug: data.category.slug,
          description: data.category.description || null,
          language: data.category.language || null,
        }
      : null,
    
    // Normalized related content (with proper null checks and mapping)
    related_articles: data.related_articles && Array.isArray(data.related_articles)
      ? data.related_articles.map(normalizeArticle).filter(item => item !== null)
      : [],
    
    related_videos: data.related_videos && Array.isArray(data.related_videos)
      ? data.related_videos.map(normalizeVideo).filter(item => item !== null)
      : [],
    
    related_movies: data.related_movies && Array.isArray(data.related_movies)
      ? data.related_movies.map(normalizeMovie).filter(item => item !== null)
      : [],
};
};

export const videosAPI = {
 getAll: async (params = {}) => {
  const q = new URLSearchParams();

  q.append("pagination[page]", params.page || 1);
  q.append("pagination[pageSize]", params.pageSize || 12);
  q.append("publicationState", "live");
  q.append("populate", "*");
  q.append("filters[language][$eq]", "hi");
  
  /* ✅ SORT — LATEST FIRST */
  q.append("sort", params.sort || "publishedAt:desc");

  /* ✅ LANGUAGE FILTER */
  if (params.language) {
    q.append("filters[language][$eq]", params.language);
  }

  /* ✅ FILTERS (STRAPI v4 SAFE) */
  if (params.filters) {
    Object.entries(params.filters).forEach(([key, value]) => {
      if (typeof value === "object") {
        Object.entries(value).forEach(([op, val]) => {
          q.append(`filters[${key}][${op}]`, val);
        });
      } else {
        q.append(`filters[${key}][$eq]`, value);
      }
    });
  }

  /* 🔍 SEARCH FILTER - FIXED */
  if (params.search && params.search.trim().length > 1) {
    const searchTerm = params.search.trim();
    // Use URLSearchParams to add OR condition for search
    // Strapi v4 supports filters[$or][0][title][$containsi]=term
    q.append("filters[$or][0][title][$containsi]", searchTerm);
    q.append("filters[$or][1][slug][$containsi]", searchTerm);
  }

  /* ✅ VIDEO TYPE FILTER */
  if (params.videotype && params.videotype !== "all") {
    q.append("filters[videotype][$eq]", params.videotype);
  }

  try {
    const res = await apiClient.get(`/videos?${q.toString()}`);
    return {
      videos: res.data.data.map(normalizeVideo),
      pagination: res.data.meta.pagination,
    };
  } catch (error) {
    console.error("❌ videosAPI.getAll Error:", error);
    return { videos: [], pagination: {} };
  }
},

/* ✅ SIMPLE SEARCH METHOD - FIXED FOR VIDEOS */
simpleSearch: async (searchTerm, options = {}) => {
  try {
    const { page = 1, pageSize = 8, videotype } = options;
    
    const q = new URLSearchParams();
    
    q.append("pagination[page]", page);
    q.append("pagination[pageSize]", pageSize);
    q.append("sort", "publishedAt:desc");
    q.append("populate", "*");
    q.append("filters[language][$eq]", "hi");

    /* 🔍 SEARCH FILTER */
    if (searchTerm && searchTerm.trim().length > 0) {
      const term = searchTerm.trim();
      q.append("filters[$or][0][title][$containsi]", term);
      q.append("filters[$or][1][slug][$containsi]", term);
    }

    /* ✅ VIDEO TYPE FILTER */
    if (videotype && videotype !== 'all') {
      q.append("filters[videotype][$eq]", videotype);
    }

    const res = await apiClient.get(`/videos?${q.toString()}`);
    return {
      videos: res.data.data.map(normalizeVideo),
      pagination: res.data.meta.pagination,
    };
  } catch (error) {
    console.error("❌ videosAPI.simpleSearch Error:", error);
    return { videos: [], pagination: {} };
  }
},
getWithArticles: async (slug) => {
  try {
    // Use the same query structure that works with your API
    const query = qs.stringify({
      filters: { slug: { $eq: slug } },
      populate: {
        related_articles: {
          populate: '*',  // This deeply populates all relations including hero_image
          filters: {
            moderation_status: { $eq: 'published' }  // ✅ Only fetch published articles
          }
        }
      }
    }, { encodeValuesOnly: true });

    const res = await apiClient.get(`/videos?${query}`);
    const video = res.data?.data?.[0];
    
    if (!video) return { articles: [] };
    
    const videoData = video.attributes || video;
    let relatedArticles = videoData.related_articles || [];
    
    // ✅ Additional client-side filter to ensure only published articles
    const publishedArticles = relatedArticles.filter(article => {
      const articleData = article.attributes || article;
      return articleData.moderation_status === 'published';
    });
    
    // Normalize each article with proper image handling
    const normalizedArticles = publishedArticles.map(article => {
      const articleData = article.attributes || article;
      
      // Try multiple possible image paths
      const heroImage = 
        articleData.hero_image?.data?.attributes?.url ||
        articleData.hero_image?.url ||
        articleData.heroImage?.url ||
        articleData.hero_Image?.url ||
        null;
      
      // Get all image formats if available
      const imageFormats = articleData.hero_image?.data?.attributes?.formats || 
                          articleData.hero_image?.formats || 
                          articleData.heroImage?.formats || 
                          null;
      
      return {
        id: articleData.id || article.id,
        title: articleData.title || '',
        slug: articleData.slug || '',
        description: articleData.body || '',
        hero_Image: heroImage,
        hero_image: {
          url: heroImage,
          formats: imageFormats
        },
        heroImage: {
          url: heroImage,
          formats: imageFormats
        },
        publishedAt: articleData.publishedAt || articleData.createdAt,
        createdAt: articleData.createdAt,
        mainCategory: articleData.MainCategory || 'article',
        category: articleData.category ? normalizeCategory(articleData.category) : null,
        moderation_status: articleData.moderation_status, // Keep for debugging
      };
    }).filter(Boolean);
    
    return {
      articles: normalizedArticles,
      video: normalizeVideo(video)
    };
    
  } catch (err) {
    console.error("❌ getWithArticles error:", err);
    return { articles: [] };
  }
},
// In your videosAPI object
// In your videosAPI object
getWithMovies: async (slug) => {
  const q = new URLSearchParams();

    q.set('filters[slug][$eq]', slug);
    q.set('populate[related_movies][populate]', '*');
    

    const res = await apiClient.get(`/videos?${q.toString()}`);
    const data = res.data;

    const item =
      Array.isArray(data.data) && data.data.length > 0
        ? data.data[0]
        : null;

    return item ? normalizeMovie(item) : null;
},
};

export const normalizeUser = (user) => {
  if (!user) return null;

  // Strapi v5 Users are FLAT (no .attributes wrapper like collection types)
  const data = user.attributes || user;

  let avatarRaw = null;
  if (data.avatar) {
    if (data.avatar.data?.attributes) {
      // Nested v4 format
      avatarRaw = data.avatar.data.attributes;
    } else if (data.avatar.attributes) {
      // Direct populate format
      avatarRaw = data.avatar.attributes;
    } else {
      // Flat v5 format (your sample data)
      avatarRaw = data.avatar;
    }
  }

  return {
    id: user.id || user.documentId,
    documentId: user.documentId || null,
    name: (() => {
      const raw = data.name || data.username || 'Anonymous';
      const lower = raw.toLowerCase().replace(/\s/g, "");
      return (lower === "entertainindiateam" || lower === "entertainindiaofficial")
        ? "EntertainIndia Team"
        : raw;
    })(),
    username: (() => {
      const raw = data.username || data.name || '';
      const lower = raw.toLowerCase().replace(/\s/g, "");
      const slugify = (str) => str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      return (lower === "entertainindiateam" || lower === "entertainindiaofficial")
        ? "entertainindiateam"
        : slugify(raw);
    })(),
    bio: data.bio || null,
    confirmed: data.confirmed || false,
    blocked: data.blocked || false,
    provider: data.provider || 'local',

    // Dates
    createdAt: data.createdAt || user.createdAt,
    updatedAt: data.updatedAt || user.updatedAt,
    publishedAt: data.publishedAt || user.publishedAt,

    // Role - Map "Writer" to "Author" as per user request
    role: (() => {
      const r = data.role?.name || data.role || 'Author';
      return r.toLowerCase() === 'writer' ? 'Author' : r;
    })(),

    // Avatar (normalized media)
    avatar: avatarRaw ? normalizeMedia({ attributes: avatarRaw, id: avatarRaw.id }) : null,

    // Articles Stats
    articlesCount: Array.isArray(data.articles) ? data.articles.length : (data.articles?.data?.length || 0),
    totalViews: (Array.isArray(data.articles) ? data.articles : (data.articles?.data || [])).reduce((sum, art) => {
      const artData = art.attributes || art;
      return sum + (artData.views || 0);
    }, 0),

    // Social links (if you add them later)
    socialLinks: data.social_links || null,

    // Full profile picture URL (convenience)
    profileImage: avatarRaw ? normalizeMedia({ attributes: avatarRaw }).url : null,
  };
};

export const usersAPI = {
  // ✅ getAll - Matches your API perfectly
  getAll: async (params = {}) => {
    // 1. Fetch Users
    const query = qs.stringify({
      populate: {
        avatar: true,
        role: true
      },
      publicationState: 'live',
      pagination: { limit: 100 },
      filters: params.username ? { username: { $eq: params.username } } : undefined,
    }, { encodeValuesOnly: true });

    try {
      const usersRes = await apiClient.get(`/users?${query}`);
      const rawUsers = Array.isArray(usersRes?.data) ? usersRes.data : (usersRes?.data?.data || []);

      // 2. Fetch all recent articles to aggregate stats
      // Since Strapi /users doesn't populate articles in bulk, we fetch them separately
      const articlesRes = await articlesAPI.getAll({ pageSize: 500 });
      const allArticles = articlesRes.articles || [];

      // Create a map of stats per author username
      const statsMap = {};
      allArticles.forEach(art => {
        // Articles API uses "Authors" field (normalized by normalizeArticle)
        const authors = art.Authors || art.author;
        const authorList = Array.isArray(authors) ? authors : (authors ? [authors] : []);

        authorList.forEach(a => {
          const uname = a.username;
          if (uname) {
            if (!statsMap[uname]) statsMap[uname] = { count: 0, views: 0 };
            statsMap[uname].count += 1;
            statsMap[uname].views += (Number(art.views) || 0);
          }
        });

        // If no authors found, attribute to the team
        if (authorList.length === 0) {
          const teamUname = "entertainindiateam";
          if (!statsMap[teamUname]) statsMap[teamUname] = { count: 0, views: 0 };
          statsMap[teamUname].count += 1;
          statsMap[teamUname].views += (Number(art.views) || 0);
        }
      });

      // 3. Normalize users and merge stats
      const normalizedUsers = rawUsers.map(u => {
        const normalized = normalizeUser(u);
        const stats = statsMap[normalized.username];
        if (stats) {
          normalized.articlesCount = stats.count;
          normalized.totalViews = stats.views;
        }
        return normalized;
      });

     

      return {
        users: normalizedUsers,
        pagination: usersRes?.data?.meta?.pagination || usersRes?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("[usersAPI.getAll] Error:", error.message);
      return { users: [], pagination: {} };
    }
  },

  // ✅ getById - Uses /users/{id} route (WORKS!)
  getById: async (id) => {
    try {
      if (!id) return null;
      const res = await apiClient.get(`/users/${id}?populate=avatar`);

      // ✅ Handle Strapi single user response
      const userData = res?.data || null;
      return userData ? normalizeUser(userData) : null;
    } catch (error) {
      return null;
    }
  },

  // ✅ getByUsername - Filter by username
  getByUsername: async (username) => {
    try {
      if (!username) return null;

      // Use getAll to leverage its robust population and stats aggregation logic
      const res = await usersAPI.getAll({ username });

      // If exact username search fails and it's for the team, try a broader search
      if ((!res.users || res.users.length === 0) && username === "entertainindiateam") {
        // This is a bit recursive but since we're calling getAll with no params it will fetch everything
        const allUsers = await usersAPI.getAll();
        return allUsers.users?.find(u => {
          const lower = u.name.toLowerCase().replace(/\s/g, "");
          return lower === "entertainindiateam" || lower === "entertainindiaofficial";
        }) || null;
      }

      return res.users?.[0] || null;
    } catch (error) {
      return null;
    }
  },
  
  
  
};

export const normalizeWebStory = (story) => {
  if (!story) return null;

  const data = story.attributes || story;

  // Handle thumbnail - check multiple possible structures
  let thumbnailUrl = null;
  if (data.thumbnail) {
    if (data.thumbnail.data?.attributes?.url) {
      thumbnailUrl = data.thumbnail.data.attributes.url;
    } else if (data.thumbnail.url) {
      thumbnailUrl = data.thumbnail.url;
    } else if (typeof data.thumbnail === 'string') {
      thumbnailUrl = data.thumbnail;
    }
  }

  return {
    id: story.id,
    title: data.title,
    slug: data.slug,
    moderationStatus: data.moderation_status || "pending",
    heroText: data.heroText || "",
    seo_title: data.seo_title || data.title,
    seo_description: data.seo_description || data.heroText,
    category: data.category || null,
    trandingRank: data.trandingRank || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishDate: data.publishDate,
    publishedAt: data.publishedAt,
    trandingRank: data.trandingRank,
     trending:data.trending,
language: data.language, // ✅ language field भी normalize करें
    // ✅ THUMBNAIL
    thumbnail: thumbnailUrl
      ? {
        url: thumbnailUrl.startsWith("http")
          ? thumbnailUrl
          : `${MEDIA_URL}${thumbnailUrl}`,
      }
      : null,

    // ✅ SLIDES (STRAPI v4 SAFE)
    slides:
      data.slides?.map((slide) => {
        // Handle slide image - check multiple possible structures
        let slideImageUrl = null;
        if (slide.image) {
          if (slide.image.data?.attributes?.url) {
            slideImageUrl = slide.image.data.attributes.url;
          } else if (slide.image.url) {
            slideImageUrl = slide.image.url;
          } else if (typeof slide.image === 'string') {
            slideImageUrl = slide.image;
          }
        }

        return {
          id: slide.id,
          heading: slide.heading,
          description: slide.description,
          ctaText: slide.ctaText,
          ctaUrl: slide.ctaUrl,
          image: slideImageUrl
            ? {
              url: slideImageUrl.startsWith("http")
                ? slideImageUrl
                : `${MEDIA_URL}${slideImageUrl}`,
            }
            : null,
        };
      }) || [],

    // ✅ RELATED WEB STORIES
    relatedStories:
      (data.related_stories?.data || data.related_stories || [])
        .map((item) => {
          if (!item) return null;
          // Simple normalization for nested items to avoid deep recursion issues
          const itemData = item.attributes || item;
          let thumb = null;
          if (itemData.thumbnail) {
            const t = itemData.thumbnail.data?.attributes || itemData.thumbnail;
            thumb = t.url ? { url: t.url.startsWith("http") ? t.url : `${MEDIA_URL}${t.url}` } : null;
          }
          return {
            id: item.id,
            title: itemData.title,
            slug: itemData.slug,
            thumbnail: thumb
          };
        })
        .filter(Boolean),
  };
};

export const webStoriesAPI = {
  async getAll({
    page = 1,
    pageSize = 20,
    sort = 'publishedAt:desc',
  } = {}) {
    try { 
       q.append('filters[language][$eq]', "hi");
       /* ✅ LANGUAGE FILTER - यह सबसे important है */
    if (params.language) {
      q.append("filters[language][$eq]", params.language);
    }
      const res = await apiClient.get(
        `/web-stories`, {
        params: {
          sort,
          pagination: {
            page,
            pageSize,
          },

          filters: {
            // ✅ YE ADD KARNA ZAROORI HAI
            moderation_status: { $eq: "published" },
            publishedAt: { $notNull: true }
          },


          populate: {
            thumbnail: { populate: '*' },
            slides: { populate: 'image' },
          },
        },
      }
      );

      return {
        stories: res.data.data.map(normalizeWebStory),
        meta: res.data.meta,
      };
    } catch (error) {
      return { stories: [], meta: {} };
    }
  },

  async getBySlug(slug) {
    try {
      const query = qs.stringify({
        filters: {
          slug: {
            $eq: slug,
            language: { $eq: "hi" },
            moderation_status: { $eq: "published" }

          }
        },
        populate: {
          thumbnail: { populate: "*" },
          slides: { populate: "*" },
          related_stories: {
            populate: ["thumbnail"],
            filters: { moderation_status: { $eq: "published" } } // ✅ Related bhi published hon

          },

          filters: {
            moderation_status: { $eq: "published" },
            publishedAt: { $notNull: true }
          },
        }
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-stories?${query}`);
      const item = res.data.data?.[0];

      // if (item) {
      //   console.log("Fetched Story Data:", item);
      //   console.log("Related Stories Raw:", item.attributes?.related_stories || item.related_stories);
      // }

      return item ? normalizeWebStory(item) : null;
    } catch (error) {
      console.error("Error fetching web story:", error);
      return null;
    }
  },


  uploadImage: async (file) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");

    const formData = new FormData();
    formData.append("files", file);

    const res = await apiClient.post(`/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data[0]; // Returns the uploaded file object (with id)
  },
  createWebStory: async (storyData, thumbnailFile, slideImages = []) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      // 1. Thumbnail Upload
      let thumbnailId = null;
      if (thumbnailFile) {
        const upload = await webStoriesAPI.uploadImage(thumbnailFile);
        thumbnailId = upload.id;
      }

      // 2. Slide Images Upload
      const updatedSlides = await Promise.all(
        storyData.slides.map(async (slide, index) => {
          if (slideImages[index]) {
            const upload = await webStoriesAPI.uploadImage(slideImages[index]);
            return { ...slide, image: upload.id };
          }
          return slide;
        })
      );

      // 3. Final Payload (Draft Fix)
      const payload = {
        data: {
          ...storyData,
          thumbnail: thumbnailId,
          slides: updatedSlides,
          moderation_status: "pending",
          // 🔥 SABSE ZAROORI: Spelling check karein 'publishedAt'
          // Agar aapke Strapi schema mein 'auther' likha hai toh wahi rehne dein
          publishedAt: null,
        },
      };

      const res = await apiClient.post("/web-stories", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return normalizeWebStory(res.data.data);
    } catch (err) {
      console.error("🔥 Web Story Create Error:", err.response?.data || err.message);
      throw err;
    }
  },

  async getMyStories(authorId) {
    try {
      // Robust filter to handle different Strapi versions and relation names
      // Looks for author ID in 'author', 'Author', or 'auther' fields
      const query = qs.stringify({
        filters: {
          $or: [
            { auther: { id: { $eq: authorId } } },
            { auther: { documentId: { $eq: authorId } } }
          ]
        },
        populate: {
          thumbnail: { populate: "*" },
          slides: { populate: "*" }
        },
        sort: ['createdAt:desc']
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-stories?${query}`);
      return {
        stories: res.data.data.map(normalizeWebStory),
        meta: res.data.meta
      };
    } catch (error) {
      console.error("Error fetching my stories:", error);
      return { stories: [], meta: {} };
    }
  }


};


export const normalizeComment = (comment) => {
  if (!comment) return null;
  const data = comment.attributes || comment;
  return {
    id: comment.id,
    userName: data.user_name,
    message: data.message,
    moderationStatus: data.moderation_status,
    createdAt: data.createdAt,
  };
};

export const commentsAPI = {
  getByArticle: (articleId) => {
    return apiClient
      .get(
        // 👈 articleId ko dynamic kiya ($eq]=${articleId})
        `/comments?filters[article][id][$eq]=${articleId}&filters[moderation_status][$eq]=approved&populate=*`
      )
      .then((res) => res.data.data.map(normalizeComment));
  },

  create: (commentData) => {
    // commentData ab upar wala payload receive karega
    return apiClient
      .post('/comments', { data: commentData })
      .then((res) => normalizeComment(res.data.data));
  },
};

export const normalizeProfession = (professions) => {
  // ✅ FIX: Check professions parameter, not genres
  if (!professions || !Array.isArray(professions)) return [];

  return professions.map((profession) => {
    const data = profession.attributes || profession;
    const originalName = data.profession_Field || data.name;
    const hindiName = getHindiProfession(originalName);
    
    return {
      id: profession.id || data.id,
      name: hindiName, // ✅ हिंदी नाम
      originalName: originalName, // ✅ मूल नाम (अगर जरूरत हो)
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
const professionHindiMap = {
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
const getHindiProfession = (professionName) => {
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

export const normalizeCelebrity = (celebrity) => {
  if (!celebrity) return null;
  // 🔥 STRAPI v4 FIX
  const data = celebrity.attributes ? celebrity.attributes : celebrity;
  const id = celebrity.id ?? data.id;

  return {
    id: data.id,
    documentId: data.documentId,

    name: data.name || '',
    slug: data.Slug || data.slug || '',
    bio: data.Bio || data.bio || '',
    birthdate: data.Birthdate || data.birthdate || null,
    trandingRank: data.trandingRank ?? 0,
    popularname: data.popularname || '',
    tagline: data.tagline || '',
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishDate: data.publishDate,
    publishedAt: data.publishedAt,
    topSearchRank: data.topSearchRank || 0,
    total_awards: data.total_awards || 0,
    total_movies: data.total_movies || 0,
    total_tvshows: data.total_tvshows || 0,
    total_webseries: data.total_webseries || 0,
    language: data.language,
     trending:data.trending,
    // ✅ PROFESSIONS
 // ✅ PROFESSIONS - WITH HINDI TRANSLATION
    professions: Array.isArray(data.professions)
      ? data.professions.map((p) => {
          const prof = p.attributes ?? p;
          const originalName = prof.profession_Field || '';
          const hindiName = getHindiProfession(originalName);

          return {
            id: p.id,
            documentId: prof.documentId,
            name: hindiName, // ✅ हिंदी नाम
            originalName: originalName, // ✅ मूल नाम (अगर जरूरत हो)
            slug: originalName
              .toLowerCase()
              .replace(/\s+/g, '-')
              .replace(/[^a-z0-9-]/g, ''),
          };
        })
      : [],
    
    // ✅ AVATAR
   avatar: data.Avatar ? {
      id: data.Avatar.id,
      url: data.Avatar.url || data.Avatar.formats?.large?.url || null,
      alt: data.Avatar.alternativeText || data.name
    } : null,
    profile_bg_poster: data.profile_bg_poster ? {
      id: data.profile_bg_poster.id,
      url: data.profile_bg_poster.url || data.profile_bg_poster.formats?.large?.url || null,
      alt: data.profile_bg_poster.alternativeText || "बैकग्राउंड पोस्टर"
    } : null,

    articles: Array.isArray(data.articles)
      ? data.articles.map((a) => ({
        id: a.id,
        documentId: a.documentId,
        title: a.title || '',
        slug: a.slug || '',
        summary: a.summary || '',
        excerpt: a.summary || '',
        body: a.body || '',
        mainCategory:a.MainCategory||'',
        publishedAt: a.createdAt|| a.publishedAt,
        views: a.views ?? 0,
        trandingRank: a.trandingRank ?? 0,
        hero_image: getMediaUrl(a.hero_image)
          ? { url: getMediaUrl(a.hero_image) }
          : null,
      }))
      : [],

    // ✅ MOVIES
    movies: Array.isArray(data.movies)
      ? data.movies.map((movie) => ({
        id: movie.id,
        documentId: movie.documentId,
        title: movie.title || '',
        slug: movie.slug || '',
        releaseType: movie.releaseType || '',
        releaseDate: movie.releaseDate || null,
        trandingRank: movie.trandingRank ?? 0,
        duration: movie.duration || null,
        synopsis: movie.synopsis || '',
        rating: movie.rating || null,
        trailer_id: movie.trailer_id || null,
        totalVotes: movie.totalVotes || null,
        pollActive: movie.pollActive || false,
        genres: movie.genres || [],
        category: movie.category
          ? {
              id: movie.category.id,
              name: movie.category.name,
              slug: movie.category.slug
            }
          : null,
        poster: movie.poster?.url
          ? {
              url: movie.poster.url.startsWith("http")
                ? movie.poster.url
                : `${MEDIA_URL}${movie.poster.url}`,
            }
          : null,
      }))
      : [],

    // Social
    social_account: Array.isArray(data.social_account)
      ? data.social_account.map((s) => ({
        id: s.id,
        platform: s.platform || '',
        username: s.username || '',
        followers: s.followers || 0,
        verified: s.verified || false,
        profileurl: s.profileurl || '',
      }))
      : [],

    // Timeline
    carrerTimeline: Array.isArray(data.carrerTimeline)
      ? data.carrerTimeline.map((t) => ({
        id: t.id,
        year: t.year || '',
        title: t.title || '',
      }))
      : [],

    // Relations
    relatedCelebrity: Array.isArray(data.relatedCelebrity)
      ? data.relatedCelebrity.map((item) => {
        const person = Array.isArray(item.celebrities_profiles)
          ? item.celebrities_profiles[0]
          : item.celebrities_profiles;

        return {
          id: item.id,
          relation: item.relation || '',
          celebrity: person
            ? {
                id: person.id,
                name: person.name || '',
                slug: person.Slug || person.slug || '',
                avatar: normalizeMedia(person.Avatar),
              }
            : null,
        };
      })
      : [],

    // Awards
    awards: Array.isArray(data.awards)
      ? data.awards.map((a) => ({
        id: a.id,
        name: a.name || '',
        category: a.category || '',
        year: a.year || '',
        project: a.project || '',
        won: a.won || false,
      }))
      : [],

    // Personal Life
    personalLife: data.personalLife || null,
    familyDetails: data.familyDetails || null,

   // ✅ FIXED GALLERIES - Added slug extraction
      galleries: Array.isArray(data.galleries)
        ? data.galleries.map((g) => {
            // Get gallery data (handle both Strapi v4 and v5)
            const galleryData = g.attributes ? g.attributes : g;
            
            // Extract slug from multiple possible locations
            let gallerySlug = '';
            
            // Try to get slug from various possible locations
            if (galleryData.Slug) {
              gallerySlug = galleryData.Slug;
            } else if (galleryData.slug) {
              gallerySlug = galleryData.slug;
            } else if (g.slug) {
              gallerySlug = g.slug;
            } else if (g.Slug) {
              gallerySlug = g.Slug;
            }
            
            // If no slug found, create one from title
            if (!gallerySlug && galleryData.title) {
              gallerySlug = galleryData.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-|-$/g, '');
            }
            
            // Process photos
            const photos = Array.isArray(galleryData.photos)
              ? galleryData.photos.map((p) => {
                  const photoData = p.attributes ? p.attributes : p;
                  const imageUrl = photoData.image?.url || photoData.url;
                  
                  if (!imageUrl) return null;
                  
                  return {
                    id: p.id || photoData.id,
                    caption: photoData.caption || '',
                    url: imageUrl.startsWith('http')
                      ? imageUrl
                      : `${MEDIA_URL}${imageUrl}`,
                    width: photoData.image?.width || photoData.width || null,
                    height: photoData.image?.height || photoData.height || null,
                  };
                }).filter(Boolean)
              : [];
            
            return {
              id: g.id,
              title: galleryData.title || '',
              slug: gallerySlug, // ✅ NOW SLUG WILL BE INCLUDED
              photos: photos,
            };
          })
        : [],
    
    // ✅ Industry
    industry: Array.isArray(data.industry)
      ? data.industry.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }))
      : [],

    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
  };
};

export const celebritiesAPI = {
 getAll: async ({ page = 1, pageSize = 12, ...params } = {}) => {
    try {
      const q = new URLSearchParams({
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'sort': params.sort || 'updatedAt:desc',
        'filters[language][$eq]': "hi",
        'populate': '*',
      });

      // 🔥 SEARCH FILTER - सिर्फ उन्हीं फील्ड्स का use करें जो Strapi में exist करती हैं
      if (params.search && params.search.trim().length > 0) {
        const searchTerm = params.search.trim();
        
        // ✅ सही फील्ड नाम - अपने Strapi schema के अनुसार adjust करें
        q.append('filters[$or][0][name][$containsi]', searchTerm);
        q.append('filters[$or][1][Slug][$containsi]', searchTerm);
        // अगर Bio फील्ड है तो use करें, नहीं तो हटा दें
        // q.append('filters[$or][2][Bio][$containsi]', searchTerm); // Bio (B capital)
        // अगर popularname फील्ड है तो use करें
        // q.append('filters[$or][3][popularname][$containsi]', searchTerm);
      }
      
  // 🔤 LETTER FILTER - FIXED VERSION
if (params.letter && params.letter !== '') {
  const letterValue = params.letter.toUpperCase();
  
  // ✅ CORRECT: Use $or for multiple field search
  q.append('filters[$or][0][name][$startsWith]', letterValue);
  q.append('filters[$or][1][Slug][$startsWith]', letterValue);
  
  // ❌ DON'T do this:
  // q.append('filters[name][$startsWith]', params.letter.toUpperCase());
  // q.append('filters[slug][$startsWith]', params.letter.toUpperCase());
}

      // 🎬 INDUSTRY FILTER
      if (params.industry && params.industry !== 'all') {
        q.append('filters[industry][name][$eqi]', params.industry);
      }

      // 🎭 PROFESSION FILTER
      if (params.profession && params.profession !== '' && params.profession !== 'all') {
        q.append('filters[professions][slug][$eq]', params.profession);
      }

     
      
      const res = await apiClient.get(`/celebrities-profiles?${q.toString()}`);
      const data = res.data;

      return {
        celebrities: Array.isArray(data.data) ? data.data.map(normalizeCelebrity) : [],
        pagination: data.meta?.pagination || null,
      };
    } catch (error) {
      console.error("❌ SSR Fetch Error Details:", error.message);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }
      return { celebrities: [], pagination: null };
    }
  },
getDetailedProfile: async (slug) => {
  try {
    // 💡 KEY FIX: Strapi query standard nested objects format
    const query = {
      // Agar aapke Strapi admin me small 'slug' hai toh slug likhein, otherwise 'Slug'
      'filters[Slug][$eq]': slug, 
      'filters[language][$eq]': 'hi',
      
      // Saare direct structure/components components populate karein
      'populate[Avatar][populate]':'*',
      'populate[profile_bg_poster][populate]':'*',
      'populate[professions]': '*',
      'populate[carrerTimeline]': '*',
      'populate[familyDetails]': '*',
      'populate[personalLife]': '*',
      'populate[social_account]': '*',
      'populate[industry]': '*',
      'populate[awards][populate]':'*',
      
      // Deep Sub-relations populate filters
      'populate[movies][populate]': '*',
      'populate[galleries][populate][photos][populate]': '*',
      'populate[relatedCelebrity][populate][celebrities_profiles][populate]': '*',
      
      // Articles filtering
      'populate[articles][populate]': '*',
      'populate[articles][filters][moderation_status][$eq]': 'published',
    };

    const queryString = new URLSearchParams(query).toString();
    const res = await apiClient.get(`/celebrities-profiles?${queryString}`);
    
    const data = res.data;
    const item =
  Array.isArray(data?.data) && data.data.length > 0
    ? data.data[0]
    : null;

    return item ? normalizeCelebrity(item) : null;
  } catch (error) {
    console.error("❌ Error inside getDetailedProfile API:", error.response?.data || error.message);
    return null;
  }
},
  // 🆕 NEW: Simple search method for quick searches
  simpleSearch: async (searchTerm, options = {}) => {
    try {
      const { page = 1, pageSize = 12, industry, profession } = options;
      
      const q = new URLSearchParams({
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'sort': 'name:asc',
        'filters[language][$eq]': 'hi',
        'populate': '*',
      });
      
      if (searchTerm?.trim()) {
        const term = searchTerm.trim();
        q.append('filters[$or][0][name][$containsi]', term);
        q.append('filters[$or][1][Slug][$containsi]', term);
        q.append('filters[$or][2][bio][$containsi]', term);
        q.append('filters[$or][3][popularname][$containsi]', term);
      }
      
      if (industry && industry !== 'all') {
        q.append('filters[industry][name][$eqi]', industry);
      }
      
      if (profession && profession !== 'all') {
        q.append('filters[professions][slug][$eq]', profession);
      }
      
     
      const res = await apiClient.get(`/celebrities-profiles?${q.toString()}`);
      const data = res.data;
      
      return {
        celebrities: Array.isArray(data.data) ? data.data.map(normalizeCelebrity) : [],
        pagination: data.meta?.pagination || null,
      };
    } catch (error) {
      console.error("Simple search error:", error);
      return { celebrities: [], pagination: null };
    }
  },

  // 🆕 NEW: Search by name or slug only
  searchByNameOrSlug: async (query, page = 1, pageSize = 12) => {
    try {
      const q = new URLSearchParams({
        'pagination[page]': page,
        'pagination[pageSize]': pageSize,
        'sort': 'name:asc',
        'filters[language][$eq]': 'hi',
        'populate': '*',
      });
      
      if (query?.trim()) {
        const searchTerm = query.trim();
        q.append('filters[$or][0][name][$containsi]', searchTerm);
        q.append('filters[$or][1][Slug][$containsi]', searchTerm);
      }
     
      const res = await apiClient.get(`/celebrities-profiles?${q.toString()}`);
      const data = res.data;
      
      return {
        celebrities: Array.isArray(data.data) ? data.data.map(normalizeCelebrity) : [],
        pagination: data.meta?.pagination || null,
      };
    } catch (error) {
      console.error("Search by name/slug error:", error);
      return { celebrities: [], pagination: null };
    }
  },

  getBySlug: async (slug) => {
    const q = new URLSearchParams({
      'filters[Slug][$eq]': slug,
      'filters[language][$eq]': "hi",
      populate: '*',
    });

    const res = await apiClient.get(`/celebrities-profiles?${q.toString()}`);
    const data = res.data;

    const item = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;
    return item ? normalizeCelebrity(item) : null;
  },

  getBySlugWithRelation: async (slug) => {
    const q = new URLSearchParams();
    q.set('filters[Slug][$eq]', slug);
    q.set('populate[relatedCelebrity][populate][celebrities_profiles][populate]', '*');
    q.set('filters[language][$eq]', "hi");

    const res = await apiClient.get(`/celebrities-profiles?${q.toString()}`);
    const data = res.data;
    const item = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;
    return item ? normalizeCelebrity(item) : null;
  },

  getBySlugWithMovies: async (slug) => {
    const q = new URLSearchParams();
    q.set('filters[Slug][$eq]', slug);
    q.set('populate[movies][populate]', '*');
    q.set('filters[language][$eq]', "hi");

    const res = await apiClient.get(`/celebrities-profiles?${q.toString()}`);
    const data = res.data;
    const item = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;
    return item ? normalizeCelebrity(item) : null;
  },

  getBySlugWithPhotos: async (slug) => {
    const q = new URLSearchParams();
    q.set('filters[Slug][$eq]', slug);
    q.set('populate[galleries][populate][photos][populate]', '*');
    q.set('filters[language][$eq]', "hi");

    const res = await apiClient.get(`/celebrities-profiles?${q.toString()}`);
    const data = res.data;
    const item = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;
    return item ? normalizeCelebrity(item) : null;
  },

  getBySlugWithArticles: async (slug) => {
    const q = new URLSearchParams();
    q.set('filters[Slug][$eq]', slug);
    q.set('filters[language][$eq]', "hi");

    // Populate articles + hero image
    q.set('populate[articles][populate][hero_image][populate]', '*');

    // ✅ Only published articles
    q.set('populate[articles][filters][moderation_status][$eq]', 'published');
    
    const queryString = q.toString();
    
    try {
        const res = await apiClient.get(`/celebrities-profiles?${queryString}`);
        const data = res.data;
        
        const item = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;
        
        if (!item) {
            return null;
        }
        
        return normalizeCelebrity(item);
        
    } catch (error) {
        return null;
    }
}
};

export const contactMessagesAPI = {
  submit: (payload) => {
    return apiClient
      .post('/contact-messages', { data: payload })
      .then((res) => res.data.data)
  }
};

export const authAPI = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/local', credentials);
    const { jwt, user: userData } = res.data;

    try {
      // Strapi v5 Array Syntax for multiple populates
      const fullUserRes = await apiClient.get(`/users/${userData.id}`, {
        params: {
          populate: ['avatar', 'role']
        },
        headers: { Authorization: `Bearer ${jwt}` }
      });

    


      const finalUser = fullUserRes.data;
      return {
        user: finalUser,
        jwt: jwt
      };

    } catch (err) {
      console.error("Profile fetch error", err);
      // Fallback: Agar role nahi mila toh basic data bhej dein
      return { user: userData, jwt: jwt };
    }
  },

  register: async (userData) => {
    const res = await apiClient.post('/auth/local/register', userData);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  resetPassword: async (email) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  updateProfile: async (userId, updatedData) => {
    const token = localStorage.getItem("token");

    const res = await apiClient.put(
      `/users/${userId}`,
      updatedData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const freshUser = await apiClient.get(`/users/${userId}?populate=avatar`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    localStorage.setItem("user", JSON.stringify(freshUser.data));

    return freshUser.data;
  },

  getMe: async () => {
    const token = localStorage.getItem("authToken");
    const res = await apiClient.get(`/users/me?populate=avatar`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },
  updateAvatar: async (userId, file) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");
    const baseUrl = process.env.STRAPI_BACKEND_URL || "https://admin.entertainindia.com/";

    // 1. Photo Upload karein
    const formData = new FormData();
    formData.append("files", file);

    const uploadRes = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    const uploadedFileId = uploadRes.data[0].id;

    // 2. User ka Avatar ID update karein (PUT request)
    await apiClient.put(
      `/users/${userId}`,
      { avatar: uploadedFileId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    // 3. ✨ SABSE ZAROORI: Login wala wahi Double Fetch logic
    // Hum native fetch use kar rahe hain taaki login wala exact pattern repeat ho
    const fullProfileRes = await fetch(`${baseUrl}/api/users/me?populate[role]=true&populate[avatar][populate]=*`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!fullProfileRes.ok) throw new Error("Profile refresh failed after avatar update");

    const fullUser = await fullProfileRes.json();

    // 4. LocalStorage update (Ab Role bhi rahega aur Photo bhi refresh ho jayegi)
    localStorage.setItem("user", JSON.stringify(fullUser));

    return fullUser;
  },

  syncProfile: async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found.");

    const res = await apiClient.get(`/users/${userId}`, {
      params: {
        populate: ['avatar', 'role']
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    // Update local storage so data persists on refresh
    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  },

  requestAuthorRole: async (userData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("You are not authenticated");

    const res = await apiClient.post('/author-requests',
      {
        data: {
          username: userData.username,
          email: userData.email,
          request_status: "pending",
          applicant: userData.id, // User relation connect karne ke liye
        }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
  },


checkMyRequest: async (userId) => {
    // 🛑 GUARD: Agar userId undefined ya null hai, toh request mat bhejo
    if (!userId) {
      return null;
    }

    const token = localStorage.getItem("token");
    
    // Agar token nahi hai toh bhi API call rok dein
    if (!token) {
      return null;
    }

    try {
      const res = await apiClient.get('/author-requests', {
        params: {
          'filters[applicant][id][$eq]': userId,
          'sort': 'createdAt:desc', // Sabse latest request pehle
          'pagination[limit]': 1
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error) {
      console.error("checkMyRequest me error:", error.response?.data || error.message);
      return null; // Error aane par app crash na ho
    }
  },
};



export async function voteMovie(movieId, token) {
  const res = await fetch(`${API_URL}/poll-votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: JSON.stringify({
      data: {
        movie: movieId,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Vote failed");
  }

  return data;
}

export const pollAPI = {
  async vote(movieId) {
    const token = localStorage.getItem("token");
    return apiClient.post(
      "/poll-votes",
      { data: { movie: movieId } },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  },

  async results() {
    const token = localStorage.getItem("token");
    const res = await apiClient.get("/poll-votes?populate=movie", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data?.data || [];
  },

  async myVote() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const res = await apiClient.get("/poll-votes?populate=movie", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data?.[0] || null;
  },
};

// ✅ NEW: REVIEWS API (For separate movie-reviews collection)
export const reviewsAPI = {
  getByMovie: async (movieId) => {
    try {
      const query = qs.stringify({
        filters: {
          movie: {
            id: { $eq: movieId }
          }
        },
        populate: {
          user: {
            populate: ['avatar']
          }
        },
        sort: ['createdAt:desc'],
        publicationState: 'live'
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/movie-reviews?${query}`);

      const reviews = res.data?.data || [];

      if (!res.data?.data) {
        return [];
      }

      const normalized = reviews.map(r => {
        const data = r.attributes || r;
        const userRelation = data.user?.data?.attributes || data.user?.data || data.user || {};
        const displayUsername = data.username || userRelation.username || 'Anonymous';

        return {
          id: r.id || r.documentId,
          username: displayUsername,
          comment: data.comment || '',
          rating: data.rating || 0,
          createdAt: data.createdAt || new Date().toISOString(),
          user: userRelation
        };
      });
      return normalized;

    } catch (err) {
      return [];
    }
  },

  create: async (movieId, rating, comment, username, token) => {
    try {
      const payload = {
        data: {
          movie: movieId,
          rating: rating,
          comment: comment,
          username: username,
        }
      };

      const res = await apiClient.post('/movie-reviews', payload, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      return {
        success: true,
        data: res.data?.data
      };
    } catch (err) {
      throw err;
    }
  },

  delete: async (reviewId, token) => {
    try {
      await apiClient.delete(`/movie-reviews/${reviewId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        error: err.response?.data?.error?.message || err.message
      };
    }
  },
};

const getLast7DaysISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
};

// Articles ke liye
export const popularWeekArticleAPI = {
  async getAll(limit = 5) {
    const last7Days = getLast7DaysISO();
    const res = await apiClient.get(
      `/articles?filters[publishedAt][$gte]=${last7Days}&sort=views:desc&pagination[limit]=${limit}&populate=category`
    );
    return res.data?.data || [];
  },
};

// Movies ke liye
export const popularWeekMovieAPI = {
  async getAll(limit = 5) {
    const last7Days = getLast7DaysISO();
    const res = await apiClient.get(
      `/movies?filters[releaseDate][$gte]=2025-12-23T00:00:00.000Z&pagination[limit]=5`
    );
    return res.data?.data || [];
  },
};
// * ---------- SONGS API ---------- */

export const normalizeSong = (song) => {
  if (!song) return null;

  // Handle both direct data and attributes structure
  const data = song.attributes || song;

 
  return {
    id: song.id,
    documentId: song.documentId || data.documentId,

    title: data.title ?? '',
    slug: data.slug ?? '',
    body: data.body,
     trending:data.trending,
    metadescription: data.metadescription,
    releaseDate: data.releaseDate || data.release_date || null,
    duration: data.duration || '',
    artist: data.lead_artist_name || '',
    album: data.album || '',
    language: data.song_language || data.song_Language || '',
    label: data.label || '',
    trandingRank: data.trandingRank || null,
    Language: data.language, // ✅ language field भी normalize करें
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
topSearchRank:data.topSearchRank,
    // ✅ Thumbnail
    thumbnail: data.thumbnail ? normalizeMedia(data.thumbnail) : null,

    // ✅ Categories
    categories: Array.isArray(data.categories)
      ? data.categories.map(cat => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }))
      : [],

    music_genres: Array.isArray(data.music_genres)
      ? data.music_genres.map((g) => ({
        id: g.id,
        name: g.name,
        slug: g.slug,
      }))
      : [],

    // ✅ Platforms
    platforms: (() => {
      const platformData = data.Platform || data.platforms || data.platform;
      if (!platformData) return [];

      if (Array.isArray(platformData)) {
        return platformData.map(p => ({
          name: p.name || '',
          url: p.url || '',
          icon: p.icon || '',
        }));
      }

      if (typeof platformData === 'object') {
        return [{
          name: platformData.name || '',
          url: platformData.url || '',
          icon: platformData.icon || '',
        }];
      }

      return [];
    })(),



    // ✅ IMPORTANT: Song Artists - Repeatable Component
    song_artists: Array.isArray(data.song_artists)
      ? data.song_artists.map((item) => {
        // CASE 1: Profile exists (profile_Notexist = false)
        if (item.artist_profile) {
          return {
            id: item.id,
            // Display name from celebrity profile
            name: item.artist_profile.name || '',
            // Slug for linking
            slug: item.artist_profile.Slug || item.artist_profile.slug || '',
            // Profile exists = clickable
            isClickable: true,
            // Profile data (optional, for future use)
            profile: {
              id: item.artist_profile.id,
              documentId: item.artist_profile.documentId,
              avatar: item.artist_profile.Avatar?.url ?
                { url: item.artist_profile.Avatar.url } : null,
            }
          };
        }

        // CASE 2: Profile doesn't exist (profile_Notexist = true)
        return {
          id: item.id,
          // Display name from artist_name field
          name: item.artist_name || 'Unknown Artist',
          // No slug = not clickable
          slug: null,
          // Profile doesn't exist = not clickable
          isClickable: false,
        };
      })
      : [],

    // ✅ Helper: Get all artist names as comma-separated string (for display)
    artistNames: (() => {
      if (!Array.isArray(data.song_artists)) return '';

      return data.song_artists
        .map(item => {
          if (item.artist_profile) return item.artist_profile.name;
          if (item.artist_name) return item.artist_name;
          return '';
        })
        .filter(Boolean)
        .join(', ');
    })(),

    // ✅ Helper: Get all clickable artists (for linking)
    clickableArtists: (() => {
      if (!Array.isArray(data.song_artists)) return [];

      return data.song_artists
        .filter(item => item.artist_profile) // Sirf wahi jinke pas profile hai
        .map(item => ({
          name: item.artist_profile.name,
          slug: item.artist_profile.Slug || item.artist_profile.slug,
        }));
    })(),
    // ✅ Related Songs
    relatedSongs: Array.isArray(data.relatedSongs)
      ? data.relatedSongs.map(normalizeSong)
      : [],
  };
};
export const songsAPI = {
  // Add this to your songsAPI object
  getByCategory: async (categorySlug, params = {}) => {
    try {
      const query = qs.stringify(
        {
          filters: {
            categories: {
              slug: {
                $eq: categorySlug
              }
            },
            // ✅ FORCE HINDI LANGUAGE FILTER
            language: { $eq: params.language || "hi" }
          },
          populate: {
            thumbnail: true,
            categories: true,
            music_genres: true,
          },
          sort: params.sort || ["createdAt:desc"],
          pagination: {
            page: params.page || 1,
            pageSize: params.pageSize || 50,
          },
        },
        { encodeValuesOnly: true }
      );

      const res = await apiClient.get(`/songs?${query}`);

      return {
        songs: (res.data?.data || []).map(normalizeSong),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error fetching songs by category:", error);
      return { songs: [], pagination: {} };
    }
  },
  
  getAll: async (params = {}) => {
  try {
    const queryObj = {
      populate: {
        thumbnail: true,
        categories: true,
        music_genres: true,
        Platform: true,              // if you need platform info
        song_artists: true,
        song_singer: true,
        song_language: true,
      },
      filters: {},
      sort: params.sort || ["createdAt:desc"],
      pagination: {
        page: params.page || 1,
        pageSize: params.pageSize || 12,
      },
    };

    // Language filter (default to Hindi, but allow 'all' to skip)
    if (params.language && params.language !== 'all') {
      queryObj.filters.language = { $eq: params.language };
    } else if (!params.language) {
      queryObj.filters.language = { $eq: "hi" }; // default
    }

    // Category filter – FIXED: add to filters, not to undefined 'q'
    if (params.category && params.category !== "all") {
      queryObj.filters.categories = {
        slug: { $containsi: params.category }
      };
    }

    // Search filter
    if (params.search && params.search.trim().length > 1) {
      const searchTerm = params.search.trim();
      queryObj.filters.$or = [
        { title: { $containsi: searchTerm } },
        { slug: { $containsi: searchTerm } },
        { album: { $containsi: searchTerm } },
        { body: { $containsi: searchTerm } },
        { song_artists: { artist_name: { $containsi: searchTerm } } }
      ];
    }

    const query = qs.stringify(queryObj, { encodeValuesOnly: true });
    const res = await apiClient.get(`/songs?${query}`);

    return {
      songs: (res.data?.data || []).map(normalizeSong),
      pagination: res.data?.meta?.pagination || {},
    };
  } catch (error) {
    console.error("Error in songsAPI.getAll:", error);
    return { songs: [], pagination: {} };
  }
},
  
  // ✅ SIMPLE SEARCH METHOD - FIXED: Use term variable properly
  simpleSearch: async (searchTerm, options = {}) => {
    try {
      const { page = 1, pageSize = 8, language = "hi" } = options;
      
      const queryObj = {
        pagination: {
          page: page,
          pageSize: pageSize,
        },
        sort: 'createdAt:desc',
        populate: ['thumbnail', 'categories', 'music_genres'],
        filters: {
          language: { $eq: language }
        }
      };

      // Search filter
      if (searchTerm && searchTerm.trim().length > 0) {
        const term = searchTerm.trim();
        queryObj.filters.$or = [
          { title: { $containsi: term } },
          { slug: { $containsi: term } },
          { lead_artist_name: { $containsi: term } }, // ✅ FIXED
          { album: { $containsi: term } },
          {
            song_artists: {
              artist_name: { $containsi: term } // ✅ nested artist search
            }
          }
        ];
      }

      const query = qs.stringify(queryObj, { encodeValuesOnly: true });
     
      const res = await apiClient.get(`/songs?${query}`);
      return {
        songs: (res.data?.data || []).map(normalizeSong),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error in simpleSearch:", error);
      return { songs: [], pagination: {} };
    }
  },
  
  getBySlug: async (slug) => {
    try {
      const queryObj = {
        filters: {
          slug: { $eq: slug },
          // ✅ FORCE HINDI LANGUAGE FILTER
          language: { $eq: "hi" }
        },
        populate: {
          thumbnail: true,
          categories: true,
          music_genres: true,
          Platform: true,
          song_artists: {
            populate: {
              artist_profile: {
                populate: "*"
              }
            }
          }
        },
      };
      
      const query = qs.stringify(queryObj, { encodeValuesOnly: true });

      const res = await apiClient.get(`/songs?${query}`);

      const song = res.data?.data?.[0];
      if (!song) return null;

      return normalizeSong(song);
    } catch (error) {
      console.error("Error fetching song by slug:", error);
      return null;
    }
  },

  getTrending: async (limit = 10) => {
    try {
      const queryObj = {
        filters: {
          music_genres: {
            slug: { $eq: "trending" }
          },
          // ✅ FORCE HINDI LANGUAGE FILTER
          language: { $eq: "hi" }
        },
        populate: {
          thumbnail: true,
          categories: true,
          music_genres: true,
        },
        sort: ["createdAt:desc"],
        pagination: {
          page: 1,
          pageSize: limit,
        },
      };

      const query = qs.stringify(queryObj, { encodeValuesOnly: true });

      const res = await apiClient.get(`/songs?${query}`);
      return (res.data?.data || []).map(normalizeSong);
    } catch (error) {
      console.error("Error in getTrending:", error);
      return [];
    }
  },

  getByArtist: async (artistName, params = {}) => {
    try {
      const queryObj = {
        filters: {
          $or: [
            { artist: { $containsi: artistName } },
            { song_artists: { artist_name: { $containsi: artistName } } }
          ],
          // ✅ FORCE HINDI LANGUAGE FILTER
          language: { $eq: params.language || "hi" }
        },
        sort: ["release_date:desc"],
        pagination: {
          page: params.page || 1,
          pageSize: params.pageSize || 12,
        },
        populate: ["thumbnail", "song_artists"],
      };
      
      const query = qs.stringify(queryObj, { encodeValuesOnly: true });

      const res = await apiClient.get(`/songs?${query}`);

      return {
        songs: (res.data?.data || []).map(normalizeSong),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error in getByArtist:", error);
      return { songs: [], pagination: {} };
    }
  },

  getByGenre: async (genreSlug, params = {}) => {
    try {
      const queryObj = {
        filters: {
          music_genres: {
            slug: { $eq: genreSlug }
          },
          // ✅ FORCE HINDI LANGUAGE FILTER
          language: { $eq: params.language || "hi" }
        },
        populate: {
          thumbnail: true,
          categories: true,
          music_genres: true,
        },
        sort: ["createdAt:desc"],
        pagination: {
          page: params.page || 1,
          pageSize: params.pageSize || 12,
        },
      };

      const query = qs.stringify(queryObj, { encodeValuesOnly: true });

      const res = await apiClient.get(`/songs?${query}`);

      return {
        songs: (res.data?.data || []).map(normalizeSong),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error in getByGenre:", error);
      return { songs: [], pagination: {} };
    }
  },

  getRelated: async (songId, limit = 6) => {
    try {
      const queryObj = {
        filters: {
          id: { $ne: songId },
          // ✅ FORCE HINDI LANGUAGE FILTER
          language: { $eq: "hi" }
        },
        pagination: {
          page: 1,
          pageSize: limit
        },
        populate: ["thumbnail", "music_genres"],
        sort: ["release_date:desc"],
      };

      const query = qs.stringify(queryObj, { encodeValuesOnly: true });

      const res = await apiClient.get(`/songs?${query}`);
      return (res.data?.data || []).map(normalizeSong);
    } catch (error) {
      console.error("Error in getRelated:", error);
      return [];
    }
  },

  // ✅ SEARCH METHOD - पूरी तरह से फिक्स्ड
  search: async (searchTerm, params = {}) => {
    try {
      if (!searchTerm || searchTerm.trim().length < 2) {
        return { songs: [], pagination: {} };
      }
      
      const trimmedTerm = searchTerm.trim();
      
      const queryObj = {
        filters: {
          $or: [
            { title: { $containsi: trimmedTerm } },
            { slug: { $containsi: trimmedTerm } },
            { artist: { $containsi: trimmedTerm } },
            { album: { $containsi: trimmedTerm } },
            { description: { $containsi: trimmedTerm } }
          ],
          // ✅ FORCE HINDI LANGUAGE FILTER
          language: { $eq: params.language || "hi" }
        },
        pagination: {
          page: params.page || 1,
          pageSize: params.pageSize || 12,
        },
        populate: ["thumbnail", "categories", "music_genres"],
        sort: params.sort || ["release_date:desc"],
      };

      const query = qs.stringify(queryObj, { encodeValuesOnly: true });
      console.log("Songs Search Query:", query);

      const res = await apiClient.get(`/songs?${query}`);

      return {
        songs: (res.data?.data || []).map(normalizeSong),
        pagination: res.data?.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error in search:", error);
      return { songs: [], pagination: {} };
    }
  },

  updateStats: async (songId, stats) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      const payload = {
        data: stats
      };

      const res = await apiClient.put(`/songs/${songId}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      return normalizeSong(res.data?.data);
    } catch (error) {
      console.error("Error in updateStats:", error);
      throw error;
    }
  },
};
export const normalizeMusicGenres = (genres) => {
  if (!genres || !Array.isArray(genres)) return [];

  return genres.map((genre) => {
    const data = genre.attributes || genre;
    return {
      id: genre.id,
      name: data.name,
      slug: data.slug,
    };
  });
};

export const MusicGenresAPI = {
  getAll: async () => {
    return apiClient
      .get("/music-genres")
      .then((res) => normalizeMusicGenres(res.data.data));
  },

  getBySlug: async (slug) => {
    return apiClient
      .get(`/music-genres?filters[slug][$eq]=${encodeURIComponent(slug)}`)
      .then((res) =>
        res.data.data?.[0]
          ? normalizeMusicGenres([res.data.data[0]])[0]
          : null
      );
  },
};
// lib/api/awards.js

// Your existing normalizeAwards function (keep this as is)
const normalizeAwards = (data = []) =>
  data.map((item) => {
    const d = item.attributes || item;
    return {
      id: item.id,
      documentId: d.documentId || item.documentId,
      title: d.title,
      slug: d.slug,
      subTitle: d.subTitle,
      description: d.description || [], // BlocksRenderer ke liye
      date: d.date,
      location: d.location,
      host: d.host,
      categoryCount: d.categories || d.categoryCount,
      totalNominations: d.totalNominations,
      countriesRepresented: d.countriesRepresented,
      firstTimeWinners: d.firstTimeWinners,
      viewership: d.viewership,
      industry: getDisplayValue(d.industry),
      year: d.year,
      language:d.language,
      // ✅ Industry Categories
      industryCategories: Array.isArray(d.industry_category)
        ? d.industry_category.map((ind) => {
          const indData = ind.attributes || ind;
          return {
            id: ind.id,
            documentId: indData.documentId,
            name: indData.name,
            slug: indData.slug,
            description: indData.description,
          };
        })
        : [],

      // 
      image: d.image?.url || d.image?.data?.attributes?.url ? {
        url: getMediaUrl(d.image?.data?.attributes || d.image),
        alt: d.image?.data?.attributes?.alternativeText || d.image?.alternativeText || d.title,
      } : null,

      // ✅ Award Categories
      awardCategories: (d.awardCategories || d.award_categories)?.map((cat) => {
        const cd = cat.attributes || cat;
        return {
          id: cat.id,
          categoryName: cd.categoryName,
          description: cd.categoryDescription || "",
          winner: {
            title: cd.winnerTitle,
            subTitle: cd.winnerSubTitle,
            image: cd.winnerImage?.url || cd.winnerImage?.data?.attributes?.url ? {
              url: getMediaUrl(cd.winnerImage?.data?.attributes || cd.winnerImage),
              alt: cd.winnerImage?.data?.attributes?.alternativeText || cd.winnerImage?.alternativeText || cd.winnerTitle,
            } : null,
          },
          // ✅ Nominees List
          nominees: (cd.NomineesList || cd.nominees_list)?.map((nominee) => {
            const nd = nominee.attributes || nominee;
            return {
              id: nominee.id,
              name: nd.Name || nd.name,
              subTitle: nd.SubTitle || nd.subTitle,
              image: nd.Image?.url || nd.Image?.data?.attributes?.url ? {
                url: getMediaUrl(nd.Image?.data?.attributes || nd.Image),
                alt: nd.Image?.data?.attributes?.alternativeText || nd.Image?.alternativeText || (nd.Name || nd.name),
              } : null,
            };
          }) || [],
        };
      }) || [],
    };
  });
export const AwardsAPI = {
  // ✅ Get all awards with full population
  getAll: async (params = {}) => {
    try {
      // Build query string
      const q = new URLSearchParams( );
      
      // Always populate everything
      q.append("populate", "*");
      q.append("filters[language][$eq]", "hi");
      
      // Pagination
      if (params.page) {
        q.append("pagination[page]", params.page);
      }
      if (params.pageSize) {
        q.append("pagination[pageSize]", params.pageSize);
      }

      // Sorting
      if (params.sort) {
        q.append("sort[0]", params.sort);
      } else {
        q.append("sort[0]", "createdAt:desc");
      }

      // Filter by industry category (Bollywood, Hollywood, etc.)
      if (params.category && params.category !== "all") {
        q.append("filters[industry_category][slug][$containsi]", params.category);
      }

      // Filter by industry field (direct industry string)
      if (params.industry) {
        q.append("filters[industry][$containsi]", params.industry);
      }

      // Filter by year
      if (params.year) {
        q.append("filters[year][$eq]", params.year);
      }

      // Filter by title/search
      if (params.search) {
        q.append("filters[title][$containsi]", params.search);
      }

      const response = await apiClient.get(`/awards?${q.toString()}`);
      const result = response.data;

      // Use your existing normalizeAwards function
      const normalizedData = normalizeAwards(result.data || []);

      return {
        data: normalizedData,
        pagination: result.meta?.pagination || {
          page: 1,
          pageSize: 25,
          pageCount: 1,
          total: normalizedData.length
        }
      };

    } catch (error) {
      return { data: [], pagination: {} };
    }
  },// ✅ Get single award by slug
getBySlug: async (slug) => {
  try {
    const q = new URLSearchParams();

    q.append("filters[slug][$eq]", slug);
    q.append("filters[language][$eq]", "hi");
    q.append("populate[awardCategories][populate][winnerImage]", "true");
    q.append("populate[awardCategories][populate][NomineesList][populate]", "*");

    q.append("populate[industry_category]", "true");
    q.append("populate[image]", "true");

    const response = await apiClient.get(`/awards?${q.toString()}`);
    const result = response.data;

    if (result.data && result.data.length > 0) {
      const normalized = normalizeAwards([result.data[0]]);
      return normalized[0] || null;
    }

    return null;

  } catch (error) {
    console.error("Error fetching award by slug:", error);
    return null;
  }
}
,

  // ✅ Get awards by industry (using industry_category relation)
  getByIndustry: async (industrySlug) => {
    try {
      const q = new URLSearchParams({
        "filters[industry_category][slug][$eq]": industrySlug,
        "populate": "*"
      });

      const response = await apiClient.get(`/awards?${q.toString()}`);
      const result = response.data;

      const normalizedData = normalizeAwards(result.data || []);

      return {
        data: normalizedData,
        pagination: result.meta?.pagination || {}
      };

    } catch (error) {
      return { data: [], pagination: {} };
    }
  },

  // ✅ Get unique industry categories for filter UI
  getIndustryCategories: async () => {
    try {
      // Fetch all awards first
      const result = await AwardsAPI.getAll({ pageSize: 100 });

      const industries = new Map();

      // Extract unique industries from industry_category (singular)
      result.data.forEach(award => {
        // Check for industry_category (singular)
        if (award.industry_category) {
          const ind = award.industry_category;
          if (!industries.has(ind.slug)) {
            industries.set(ind.slug, {
              id: ind.id,
              slug: ind.slug,
              name: ind.name,
              count: 1
            });
          } else {
            const existing = industries.get(ind.slug);
            industries.set(ind.slug, { ...existing, count: existing.count + 1 });
          }
        }

        // Also check the direct industry field
        if (award.industry && award.industry.trim()) {
          const industrySlug = award.industry.toLowerCase().replace(/\s+/g, '-');
          if (!industries.has(industrySlug)) {
            industries.set(industrySlug, {
              slug: industrySlug,
              name: award.industry,
              count: 1
            });
          } else {
            const existing = industries.get(industrySlug);
            industries.set(industrySlug, { ...existing, count: existing.count + 1 });
          }
        }
      });

      const industryList = Array.from(industries.values());
      return industryList;

    } catch (error) {
      return [];
    }
  },

  // ✅ Get unique years for filter UI
  getYears: async () => {
    try {
      const result = await AwardsAPI.getAll({ pageSize: 100 });

      const years = new Set();

      result.data.forEach(award => {
        if (award.year) {
          years.add(award.year);
        }
      });

      const yearList = Array.from(years).sort().reverse();
      return yearList;

    } catch (error) {
      return [];
    }
  }
};

/* =======================
   ⭐ REVIEWS API
======================= */

// token auto attach
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

export const normalizeWebSeries = (item) => {
  if (!item) return null;

  // Helper for images - make sure this is consistent
// Helper for images - return full object instead of just URL
const normalizeImage = (img) => {
  if (!img) return null;
  
  // Agar already string hai to object mein convert karo
  if (typeof img === 'string') {
    return {
      url: img,
      caption: null,
      alternativeText: null
    };
  }
  
  // Agar object hai with url
  if (img.url) {
    const imageUrl = img.url.startsWith('http') ? img.url : `${MEDIA_URL}${img.url}`;
    return {
      url: imageUrl,
      caption: img.caption || null,
      alternativeText: img.alternativeText || null,
      width: img.width,
      height: img.height
    };
  }
  
  // Agar formats se lena hai
  if (img.formats) {
    const format = img.formats.large || img.formats.medium || img.formats.small || img.formats.thumbnail;
    if (format?.url) {
      const imageUrl = format.url.startsWith('http') ? format.url : `${MEDIA_URL}${format.url}`;
      return {
        url: imageUrl,
        caption: img.caption || null,
        alternativeText: img.alternativeText || null,
        width: format.width,
        height: format.height
      };
    }
  }
  
  return null;
};

  // ✅ FIXED: Cast normalizer - use normalizeImage consistently
  const normalizeCast = (castItems) => {
  if (!Array.isArray(castItems)) return [];

  return castItems.map(item => {
    const celebrity = Array.isArray(item.celebrities_profiles)
      ? item.celebrities_profiles[0]
      : item.celebrities_profiles;

    
    return {
      id: item.id,
      characterName: item.characterName,
      celebrity: celebrity
        ? {
            id: celebrity.id,
            name: celebrity.name,
            slug: celebrity.Slug,
            avatar: normalizeImage(celebrity.Avatar),
          }
        : null,

      avatar: normalizeImage(celebrity?.Avatar),
      name: celebrity?.name || item.characterName
    };
  });
};
  // ✅ FIXED: Crew normalizer
  const normalizeCrew = (crewItems) => {
    if (!Array.isArray(crewItems)) return [];

    return crewItems.map(item => {
      const celebrity = Array.isArray(item.celebrities_profiles)
        ? item.celebrities_profiles[0]
        : item.celebrities_profiles;

      const useCrewData = item.profile_not_exist === true;

      return {
        id: item.id,
        characterName: item.characterName || null,
        role: item.characterName || "Crew",
        profile_not_exist: item.profile_not_exist || false,

        name: useCrewData
          ? (item.realName || item.crew_realName || item.characterName || "Crew Member")
          : (celebrity?.name || item.characterName || "Crew Member"),

        avatar: useCrewData
          ? normalizeImage(item.photo || item.crew_photo)
          : normalizeImage(celebrity?.Avatar || celebrity?.avatar),

        celebrity: (!useCrewData && celebrity) ? {
          id: celebrity.id,
          documentId: celebrity.documentId,
          name: celebrity.name || '',
          slug: celebrity.Slug || celebrity.slug || '',
          avatar: normalizeImage(celebrity.Avatar || celebrity.avatar),
          popularname: celebrity.popularname || '',
        } : null,

        crew_realName: item.realName || item.crew_realName || null,
        crew_photo: normalizeImage(item.photo || item.crew_photo),
      };
    });
  };

  // ✅ FIXED: Awards normalizer
  const normalizeAwards = (awardItems) => {
    if (!Array.isArray(awardItems)) return [];

    return awardItems.map(item => {
      // Check for winner_profile based on user screenshot
      const isCelebrityWinner = item.award_winner_IsCelebrity === true;
      const celebrityProfile = item.winner_profile || item.celebrities_profiles;

      const celebrity = isCelebrityWinner && Array.isArray(celebrityProfile)
        ? celebrityProfile[0]
        : celebrityProfile;

      return {
        id: item.id,
        name: item.award_category || item.award_winnerName || "Award",
        category: item.award_category,
        year: item.award_year,
        organization: item.award_organization,
        won: item.won === true,

        winnerName: item.award_winnerName,

        award_photo: normalizeImage(item.award_photo),
      };
    });
  };
  // Update the normalizeReviews function in normalizeWebSeries
  const normalizeReviews = (reviewItems) => {
    if (!Array.isArray(reviewItems)) return [];

    return reviewItems.map(review => ({
      id: review.id,
      documentId: review.documentId,
      rating: review.rating || 0,
      comment: review.comment || '',
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      user: review.user ? {
        id: review.user.id,
        documentId: review.user.documentId,
        username: review.user.username || 'Anonymous',
        email: review.user.email
      } : {
        id: null,
        documentId: null,
        username: 'Anonymous',
        email: null
      }
    }));
  };

  return {
    id: item.id,
    documentId: item.documentId,

    title: item.title || '',
    slug: item.slug || '',
    description: item.description || '',
    releaseDate: item.releaseDate || null,
    running_status: item.running_status || '',
    country: item.country || '',
    age_rating: item.age_rating || '',
    seasonNumber: item.seasonNumber ?? null,
   language: item.language, // ✅ language field भी normalize करें
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    publishedAt: item.publishedAt,
    trailer_id:item.trailer_id,
     trending:item.trending,
    // Media
    poster: normalizeImage(item.poster),
    backdrop_poster: normalizeImage(item.backdrop_poster),

    // Categories
    categories: Array.isArray(item.categories)
      ? item.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }))
      : [],

    // ✅ Genres with Hindi mapping
    genres: Array.isArray(item.genres)
      ? item.genres.map((g) => ({
        id: g.id,
        name: getHindiGenreName(g.name),
        slug: g.slug,
        original_name: g.name // Keep original for reference
      }))
      : [],


    rating: item.rating || null,

    // Languages
   // ✅ Languages with Hindi mapping
    languages: Array.isArray(item.languages)
      ? item.languages.map((l) => ({
        id: l.id,
        language: getHindiLanguageName(l.language || "Unknown"),
        original_language: l.language // Keep original for reference
      }))
      : [],
    // Watching Platform
    watchingPlatform: Array.isArray(item.watchingPlatform)
      ? item.watchingPlatform.map((p) => ({
        id: p.id,
        platform: p.platform,
        watch_status: p.watch_status,
        url: p.url,
      }))
      : [],

    // Box Office
    box_office: Array.isArray(item.box_office)
      ? item.box_office.map((b) => ({
        id: b.id,
        season: b.season,
        earning: b.earning,
      }))
      : [],

    // Articles
    relatedArticles: Array.isArray(item.relatedArticles)
      ? item.relatedArticles.map((a) => ({
        id: a.id,
        title: a.title || '',
        slug: a.slug || '',
        publishedAt: a.publishedAt,
        views: a.views ?? 0,
        summary: a.summary,
        hero_image: a.hero_image,
         mainCategory:a.MainCategory||'',
      }))
      : [],

    // Cast
    cast: normalizeCast(item.cast),

    // Awards
    award: normalizeAwards(item.web_series_awards),

    // Similar Web Series - FIXED
    similarWebSeries: Array.isArray(item.similar_webseries)
      ? item.similar_webseries
        .flatMap((block) => {
          if (!block) return [];
          const related = block.related_web_series;
          const seriesList = Array.isArray(related) ? related : (related ? [related] : []);

          return seriesList.map((ws) => ({
            _key: `similar-${ws.id}`,
            id: ws.id,
            title: ws.title,
            slug: ws.slug,
            description: ws.description,
            releaseDate: ws.releaseDate,
            country: ws.country,
            seasons: ws.seasonNumber,
            age_rating: ws.age_rating,
            poster: ws.poster ? normalizeImage(ws.poster) : null, // ✅ FIXED: Use normalizeImage
          }));
        })
        .filter(Boolean)
      : [],

    // Crew
    crew: normalizeCrew(item.crew),

    // Seasons
   // Seasons
seasons: Array.isArray(item.series_seasons)
  ? item.series_seasons.map((s) => {
    const description = Array.isArray(s.season_description)
      ? s.season_description
        .map(b => b.children?.map(c => c.text).join(""))
        .join(" ")
      : s.season_description || "";

    return {
      id: s.id,
      season_number: s.season_number || "",
      releaseDate: s.season_releaseDate || null,
      description: description,
      season_episodes: s.season_episodes || null,  // Changed from episodes to season_episodes for consistency
      season_url: s.season_url || null,            // Changed from url to season_url
      watch_status: s.watch_status || null,
      platform: s.platform || null                 // Fixed typo: platfrom -> platform
    };
  })
  : [],

    web_series_reviews: normalizeReviews(item.web_series_reviews),
  };
};


export const webSeriesAPI = {
  // ✅ GetAll method restored and fixed
  getAll: async (params = {}) => {
    const q = new URLSearchParams({
      "pagination[page]": params.page || 1,
      "pagination[pageSize]": params.pageSize || 12,
    });
    q.append("filters[language][$eq]", "hi");
    q.append("sort[0]", params.sort || "releaseDate:desc");
   // ✅ FORCE ENGLISH LANGUAGE FILTER
    
    // Explicitly populate relations and media for listing and filtering
    // ⚠️ DO NOT populate scalar fields like 'age_rating' or 'seasons' to avoid 400 error
    // Populate all fields to ensure we get everything including nested components/relations
    // This avoids 400 errors caused by incorrect specific population
    q.append("populate", "*");
     // 🎬 Category Filter
      if (params.category) {
        q.append('filters[categories][slug][$eq]', params.category);
      }
   // 🔍 SEARCH FILTER - ADD THIS
    if (params.search && params.search.trim().length > 1) {
      const searchTerm = params.search.trim();
      q.append("filters[$or][0][title][$containsi]", searchTerm);
      q.append("filters[$or][1][slug][$containsi]", searchTerm);
    }
    // 🎭 GENRE FILTERnormalizeMovie
    if (params.filters?.genre && params.filters.genre !== "All") {
      q.append("filters[genres][name][$containsi]", params.filters.genre);
    }

    // 📅 YEAR FILTER
    if (params.filters?.year && params.filters.year !== "All") {
      q.append("filters[releaseDate][$contains]", params.filters.year);
    }

    // ⭐ RATING FILTER
    if (params.filters?.rating && params.filters.rating !== "All") {
      q.append("filters[rating][title][$containsi]", params.filters.rating);
    }

    // Category/Industry filter
    if (params.category && params.category !== "all") {
      q.append("filters[categories][slug][$containsi]", params.category);
    }

    // 🗣️ LANGUAGE FILTER
    if (params.filters?.language && params.filters.language !== "All") {
      q.append("filters[languages][language][$containsi]", params.filters.language);
    }
 // 🔥 TRENDING FILTER - Add this for trending web series
  if (params.trending === "true") {
    q.append("filters[trending][$eq]", true);
  }
    try {
      const res = await apiClient.get(`/web-series-collections?${q.toString()}`);
      const data = res?.data?.data || [];
      const pagination = res?.data?.meta?.pagination || {};
      return { data: data.map(normalizeWebSeries), pagination };
    } catch (error) {
      console.error("❌ webSeriesAPI.getAll Error:", error);
      return { data: [], pagination: {} };
    }
  },

  // ✅ Simple Search Method for Web Series
  simpleSearch: async (searchTerm, options = {}) => {
    try {
      const { page = 1, pageSize = 8 } = options;
      
      const q = new URLSearchParams({
        "pagination[page]": page,
        "pagination[pageSize]": pageSize,
        "sort[0]": "releaseDate:desc",
        "populate": "*",
        "filters[language][$eq]": "hi"
      });

      if (searchTerm && searchTerm.trim().length > 0) {
        const term = searchTerm.trim();
        q.append("filters[$or][0][title][$containsi]", term);
        q.append("filters[$or][1][slug][$containsi]", term);
      }

      const res = await apiClient.get(`/web-series-collections?${q.toString()}`);
      return {
        data: (res.data?.data || []).map(normalizeWebSeries),
        pagination: res.data?.meta?.pagination || {}
      };
    } catch (error) {
      console.error("❌ webSeriesAPI.simpleSearch Error:", error);
      return { data: [], pagination: {} };
    }
  },
  // In your webSeriesAPI.getBySlug method, update the populate object
  getBySlug: async (slug) => {
    try {
      const q = qs.stringify({
        filters: { slug: { $eq: slug },  language: { $eq: "hi" } },
        populate: {
          poster: { populate: '*' },
          backdrop_poster: { populate: '*' },
          categories: true,
          genres: true,
          languages: true,
          watchingPlatform: true,
          series_seasons: { populate: '*' },
          web_series_reviews: {  // This is the relation field name
            populate: {
              user: {  // Populate user data for each review
                fields: ['id', 'documentId', 'username', 'email']
              }
            }
          },
          web_series_awards: { populate: '*' },
         cast: {
  populate: {
    celebrities_profiles: {
      populate: {
        Avatar: {
          populate: "*"
        }
      }
    }
  }
},
        crew: {
  populate: {
    celebrities_profiles: {
      populate: {
        Avatar: {
          populate: "*"
        }
      }
    },
    photo: true
  }
},
          similar_webseries: {
            populate: {
              related_web_series: {
                populate: {
                  poster: true
                }
              }
            }
          },
          relatedArticles: {
            populate: "*"
          }
        }
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-series-collections?${q.toString()}`);
      const data = res.data;
      const item = Array.isArray(data.data) && data.data.length > 0 ? data.data[0] : null;

      if (item) {
        const normalizedShow = normalizeWebSeries(item);

        // Extract reviews and attach them separately with user data
        const reviews = item.web_series_reviews?.map(review => ({
          id: review.id,
          documentId: review.documentId,
          rating: review.rating || 0,
          comment: review.comment || '',
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: review.user ? {
            id: review.user.id,
            documentId: review.user.documentId,
            username: review.user.username || 'Anonymous',
            email: review.user.email
          } : {
            id: null,
            documentId: null,
            username: 'Anonymous',
            email: null
          }
        })) || [];

        return {
          ...normalizedShow,
          reviews: reviews // Add extracted reviews
        };
      }
      return null;
    } catch (error) {
      console.error("❌ webSeriesAPI.getBySlug Error:", error?.response?.data || error.message);
      return null;
    }
  },
  getBySlugWithCast: async (slug) => {
    const q = new URLSearchParams();
    q.set('filters[slug][$eq]', slug);

    q.set('populate[cast][populate][celebrities_profiles][populate][Avatar]', '*');

    const res = await apiClient.get(`/web-series-collections?${q.toString()}`);
    const item = res.data?.data?.[0];
    return item ? normalizeWebSeries(item) : null;
  },


  getBySlugWithCrew: async (slug) => {
    const q = new URLSearchParams();
    q.set('filters[slug][$eq]', slug);
    q.set('populate[crew][populate][celebrities_profiles][populate][Avatar]', '*');

    const res = await apiClient.get(`/web-series-collections?${q.toString()}`);
    const item = res.data?.data?.[0];
    return item ? normalizeWebSeries(item) : null;
  },


  // In your webSeriesAPI.getBySlugWithSimilar method
  getBySlugWithSimilar: async (slug) => {
    const q = qs.stringify({
      filters: { slug: { $eq: slug } },
      populate: {
        similar_webseries: {
          populate: {
            related_web_series: {
              populate: {
                poster: { // ✅ Make sure to populate poster
                  fields: ['url', 'formats']
                }
              }
            }
          }
        }
      }
    }, { encodeValuesOnly: true });

    const res = await apiClient.get(`/web-series-collections?${q.toString()}`);
    const item = res.data?.data?.[0];
    return item ? normalizeWebSeries(item) : null;
  },
  // In your webSeriesAPI.getBySlugWithArticles method
  getBySlugWithArticles: async (slug) => {
    const q = qs.stringify({
        filters: { slug: { $eq: slug }, language: { $eq: "hi" }  ,moderation_status:{$eq:"published"} },
        populate: {
          relatedArticles: {
            populate: "*"
          }
        }
      }, { encodeValuesOnly: true });
  

    const res = await apiClient.get(`/web-series-collections?${q.toString()}`);

   

    const item = res.data.data?.[0];

    if (item) {
      // console.log("🔍 Found web series:", item.title);
      // console.log("🔍 Related articles count:", item.relatedArticles?.length || 0);

      // Log each article's hero_image
      if (item.relatedArticles && item.relatedArticles.length > 0) {
        item.relatedArticles.forEach((article, index) => {
          console.log(`🔍 Article ${index + 1}:`, {
            id: article.id,
            title: article.title,
            hasHeroImage: !!article.hero_image,
            heroImageUrl: article.hero_image?.url,
            heroImageFormats: article.hero_image?.formats ? Object.keys(article.hero_image.formats) : null
          });
        });
      } else {
        console.log("🔍 No related articles found");
      }
    } else {
      console.log("🔍 No web series found with slug:", slug);
    }

    return item ? normalizeWebSeries(item) : null;
  },




};

export const webSeriesReviewsAPI = {
  // Get reviews by web series ID
  async getByWebSeriesId(webSeriesId) {
    try {
      // Try with both id and documentId to be safe
      const q = qs.stringify({
        filters: {
          $or: [
            { web_series: { id: { $eq: webSeriesId } } },
            { web_series: { documentId: { $eq: webSeriesId } } }
          ]
        },
        populate: ["user", "web_series"],
        sort: ["createdAt:desc"]
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-series-reviews?${q}`);

    
      return (res.data?.data || []).map(item => ({
        id: item.id,
        documentId: item.documentId,
        rating: item.rating || 0,
        comment: item.comment || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user ? {
          id: item.user.id,
          documentId: item.user.documentId,
          username: item.user.username || 'Anonymous',
          email: item.user.email
        } : {
          id: null,
          documentId: null,
          username: 'Anonymous',
          email: null
        },
        web_series: item.web_series ? {
          id: item.web_series.id,
          documentId: item.web_series.documentId,
          title: item.web_series.title,
          slug: item.web_series.slug
        } : null
      }));
    } catch (error) {
      console.error("❌ getByWebSeriesId error:", error.response?.data || error.message);
      return [];
    }
  },

  // Get reviews by web series slug
  async getBySlug(slug) {
    try {
      const q = qs.stringify({
        filters: { web_series: { slug: { $eq: slug } } },
        populate: ["user", "web_series"],
        sort: ["createdAt:desc"]
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-series-reviews?${q}`);

      return (res.data?.data || []).map(item => ({
        id: item.id,
        documentId: item.documentId,
        rating: item.rating || 0,
        comment: item.comment || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user ? {
          id: item.user.id,
          documentId: item.user.documentId,
          username: item.user.username || 'Anonymous',
          email: item.user.email
        } : {
          id: null,
          documentId: null,
          username: 'Anonymous',
          email: null
        },
        web_series: item.web_series ? {
          id: item.web_series.id,
          documentId: item.web_series.documentId,
          title: item.web_series.title,
          slug: item.web_series.slug
        } : null
      }));
    } catch (error) {
      console.error("❌ getBySlug error:", error.response?.data || error.message);
      return [];
    }
  },

  // Create a new review - FIXED VERSION
  async create({ rating, comment, webSeriesDocumentId, userId }) {
    try {
      // Validate required fields
      if (!webSeriesDocumentId) {
        throw new Error("Missing web series documentId");
      }
      if (!userId) {
        throw new Error("Missing userId");
      }
      if (!rating || rating < 1 || rating > 5) {
        throw new Error("Rating must be between 1 and 5");
      }
      if (!comment?.trim()) {
        throw new Error("Comment cannot be empty");
      }

      const webSeriesResponse = await apiClient.get(`/web-series-collections/${webSeriesDocumentId}`);
    
      const webSeriesNumericId = webSeriesResponse.data?.data?.id;

      if (!webSeriesNumericId) {
        throw new Error("Could not find web series numeric ID");
      }
      // IMPORTANT: For users, the endpoint might be different
      // Try different user endpoints
      let userNumericId = null;

      try {
       
        const userResponse = await apiClient.get(`/users/${userId}`);
       
        userNumericId = userResponse.data?.id;
      } catch (userError) {
       
        try {
          // Try /users/me endpoint
          const meResponse = await apiClient.get(`/users/me`);
       
          userNumericId = meResponse.data?.id;
        } catch (meError) {
          console.log("📤 Failed to get user from /users/me");
        }
      }

      // If we still don't have the numeric ID, try using the documentId directly
      if (!userNumericId) {
        console.log("📤 Could not find numeric ID, trying to use documentId directly");

        // Try to find user by documentId
        try {
          const q = qs.stringify({
            filters: { documentId: { $eq: userId } }
          }, { encodeValuesOnly: true });

          const userFilterResponse = await apiClient.get(`/users?${q}`);
          console.log("📤 User filter response:", userFilterResponse.data);

          if (userFilterResponse.data?.length > 0) {
            userNumericId = userFilterResponse.data[0].id;
          }
        } catch (filterError) {
          console.log("📤 Failed to filter users");
        }
      }

      // If still no user ID, use the provided userId as a fallback
      if (!userNumericId) {
        console.log("📤 Using provided userId as fallback:", userId);
        userNumericId = userId;
      }

      // Try different payload formats
      const payload = {
        data: {
          rating: Number(rating),
          comment: comment.trim(),
          web_series: webSeriesNumericId,  // Use numeric ID
          user: userNumericId               // Use numeric ID
        }
      };

   
      const res = await apiClient.post("/web-series-reviews", payload);

      return res.data;
    } catch (error) {
      console.error("❌ Create review failed:", error.response?.data || error.message);

      // Log detailed error for debugging
      if (error.response) {
        console.error("Error response data:", error.response.data);
        console.error("Error response status:", error.response.status);
      }

      throw error;
    }
  },

  // Simplified create method - try this first
  async createSimple({ rating, comment, webSeriesDocumentId, userId, userDocumentId }) {
    try {
      console.log("📤 Using simplified direct documentId create method");

      const payload = {
        data: {
          rating: Number(rating),
          comment: comment.trim(),
          web_series: webSeriesDocumentId,
          user: userDocumentId || userId,
          publishedAt: new Date().toISOString()
        }
      };

      console.log("📤 Simple payload (docId):", JSON.stringify(payload, null, 2));
      const res = await apiClient.post("/web-series-reviews", payload);
      return res.data;
    } catch (error) {
      console.error("❌ Simple create failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a review
  async delete(reviewDocumentId) {
    try {
      if (!reviewDocumentId) {
        throw new Error("Missing review documentId");
      }

      const response = await apiClient.delete(`/web-series-reviews/${reviewDocumentId}`);

      console.log("✅ Review deleted successfully");
      return response.data;
    } catch (error) {
      console.error("❌ Delete review error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update an existing review
  async update(reviewDocumentId, { rating, comment }) {
    try {
      if (!reviewDocumentId) {
        throw new Error("Missing review documentId");
      }

      const payload = {
        data: {
          ...(rating && { rating: Number(rating) }),
          ...(comment?.trim() && { comment: comment.trim() })
        }
      };

      console.log("📤 Updating review payload:", JSON.stringify(payload, null, 2));

      const res = await apiClient.put(`/web-series-reviews/${reviewDocumentId}`, payload);

      console.log("✅ Review updated successfully:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Update review failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get average rating for a web series
  async getAverageRating(webSeriesId) {
    try {
      const reviews = await this.getByWebSeriesId(webSeriesId);

      if (reviews.length === 0) return { average: 0, total: 0 };

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / reviews.length;

      return {
        average: Number(average.toFixed(1)),
        total: reviews.length
      };
    } catch (error) {
      console.error("❌ getAverageRating error:", error);
      return { average: 0, total: 0 };
    }
  },

  // Check if user has already reviewed a web series
  async hasUserReviewed(webSeriesId, userId) {
    try {
      const q = qs.stringify({
        filters: {
          $and: [
            { web_series: { id: { $eq: webSeriesId } } },
            { user: { id: { $eq: userId } } }
          ]
        },
        populate: ["user", "web_series"]
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-series-reviews?${q}`);

      return {
        hasReviewed: res.data?.data?.length > 0,
        review: res.data?.data?.[0] || null
      };
    } catch (error) {
      console.error("❌ hasUserReviewed error:", error);
      return { hasReviewed: false, review: null };
    }
  },

  // Debug method to check Strapi schema
  async debugSchema() {
    try {
      console.log("🔍 Debugging API...");

      // Check users endpoint
      try {
        const usersRes = await apiClient.get("/users?pagination[limit]=1");
        console.log("Users endpoint response:", usersRes.data);
      } catch (e) {
        console.log("Users endpoint error:", e.message);
      }

      // Check users-permissions users
      try {
        const usersPermissionsRes = await apiClient.get("/users-permissions/users?pagination[limit]=1");
        console.log("Users-permissions endpoint response:", usersPermissionsRes.data);
      } catch (e) {
        console.log("Users-permissions endpoint error:", e.message);
      }

      // Get current user
      try {
        const meRes = await apiClient.get("/users/me");
        console.log("/users/me response:", meRes.data);
      } catch (e) {
        console.log("/users/me error:", e.message);
      }

      // Try to get one review
      const res = await apiClient.get("/web-series-reviews?pagination[limit]=1&populate=*");
      console.log("Sample review data:", res.data);

      return res.data;
    } catch (error) {
      console.error("Debug error:", error);
    }
  }
};

export const normalizeTvShow = (item) => {
  if (!item) return null;

  // Helper for images - FIXED
  const normalizeImage = (img) => {
    if (!img) return null;
    
    // Agar already string hai to object mein convert karo
    if (typeof img === 'string') {
      return {
        url: img,
        caption: null,
        alternativeText: null
      };
    }
    
    // Agar object hai with url
    if (img.url) {
      const imageUrl = img.url.startsWith('http') ? img.url : `${MEDIA_URL}${img.url}`;
      return {
        url: imageUrl,
        caption: img.caption || null,
        alternativeText: img.alternativeText || null,
        width: img.width,
        height: img.height
      };
    }
    
    // Agar formats se lena hai
    if (img.formats) {
      const format = img.formats.large || img.formats.medium || img.formats.small || img.formats.thumbnail;
      if (format?.url) {
        const imageUrl = format.url.startsWith('http') ? format.url : `${MEDIA_URL}${format.url}`;
        return {
          url: imageUrl,
          caption: img.caption || null,
          alternativeText: img.alternativeText || null,
          width: format.width,
          height: format.height
        };
      }
    }
    
    return null;
  };

  // Cast normalizer
const normalizeCast = (castItems) => {
  if (!Array.isArray(castItems)) return [];

  return castItems.map(item => {
    const celebrity = Array.isArray(item.celebrities_profiles)
      ? item.celebrities_profiles[0]
      : item.celebrities_profiles;


    return {
      id: item.id,
      characterName: item.characterName,
      celebrity: celebrity
        ? {
            id: celebrity.id,
            name: celebrity.name,
            slug: celebrity.Slug,
            avatar: normalizeImage(celebrity.Avatar),
          }
        : null,

      avatar: normalizeImage(celebrity?.Avatar),
      name: celebrity?.name || item.characterName
    };
  });
};
  // Crew normalizer
  const normalizeCrew = (crewItems) => {
    if (!Array.isArray(crewItems)) return [];

    return crewItems.map(item => {
      const celebrity = Array.isArray(item.celebrities_profiles)
        ? item.celebrities_profiles[0]
        : item.celebrities_profiles;

      const useCrewData = item.profile_not_exist === true;

      return {
        id: item.id,
        characterName: item.characterName || null,
        role: item.characterName || "Crew",
        profile_not_exist: item.profile_not_exist || false,

        name: useCrewData
          ? (item.realName || item.crew_realName || item.characterName || "Crew Member")
          : (celebrity?.name || item.characterName || "Crew Member"),

        avatar: useCrewData
          ? normalizeImage(item.photo || item.crew_photo)
          : normalizeImage(celebrity?.Avatar || celebrity?.avatar),

        celebrity: (!useCrewData && celebrity) ? {
          id: celebrity.id,
          documentId: celebrity.documentId,
          name: celebrity.name || '',
          slug: celebrity.Slug || celebrity.slug || '',
          avatar: normalizeImage(celebrity.Avatar || celebrity.avatar),
          popularname: celebrity.popularname || '',
        } : null,

        crew_realName: item.realName || item.crew_realName || null,
        crew_photo: normalizeImage(item.photo || item.crew_photo),
      };
    });
  };

  // Awards normalizer - using tv_show_awards field
  const normalizeAwards = (awardItems) => {
    if (!Array.isArray(awardItems)) return [];

    return awardItems.map(item => {
      return {
        id: item.id,
        name: item.award_category || "Award",
        category: item.award_category,
        year: item.award_year,
        organization: item.award_organization,
        won: item.won === true,
        winnerName: item.award_winnerName,
        award_photo: normalizeImage(item.award_photo),
      };
    });
  };

  // Seasons normalizer - using shows_seasons field
  const normalizeSeasons = (seasonItems) => {
    if (!Array.isArray(seasonItems)) return [];

    return seasonItems.map(s => {
      // Extract text from Blocks format if necessary
      const description = Array.isArray(s.season_description)
        ? s.season_description.map(b => b.children?.map(c => c.text).join("")).join(" ")
        : s.season_description || "";

      return {
        id: s.id,
        season_number: s.season_number || "",
        releaseDate: s.season_releaseDate || null,
        description: description,
        season_episodes: s.season_episodes || null,
        season_url: s.season_url || null,
        watch_status: s.watch_status || null,
        platform: s.platform || null
      };
    });
  };

  const data = item.attributes || item;

  return {
    id: item.id,
    documentId: item.documentId,

    title: data.title || '',
    slug: data.slug || '',
    description: data.description || '',
    realeaseDate: data.realeaseDate || data.releaseDate || null,
    status: data.running_status || data.status || '',
    country: data.country || '',
    age_rating: data.age_rating || '',
    seasonNumber: data.seasonNumber ?? null,
    language: data.language,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
    trending: data.trending,
    trailer_id: data.trailer_id,
    
    // Media
    poster: data.poster ? normalizeImage(data.poster) : null,
    backdrop_poster: normalizeImage(data.backdrop_poster),
    
    // Awards
    awards: normalizeAwards(data.tv_show_awards || data.awards),
    
    // Categories
    categories: Array.isArray(data.categories)
      ? data.categories.map((cat) => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
        }))
      : [],

    // Genres
    genres: Array.isArray(data.genres)
      ? data.genres.map((g) => ({
          id: g.id,
          name: getHindiGenreName(g.name)||g.name,
          slug: g.slug,
        }))
      : [],

    // Rating
    rating: data.rating || null,

    // Languages
    languages: Array.isArray(data.languages)
      ? data.languages.map((l) => ({
          id: l.id,
            language: getHindiLanguageName(l.language || "Unknown")||l.language,
        }))
      : [],

    // Watching Platform
    watchingPlatform: Array.isArray(data.watchingPlatform)
      ? data.watchingPlatform.map((p) => ({
          id: p.id,
          platform: p.platform,
          watch_status: p.watch_status,
          url: p.url,
        }))
      : [],

    // Articles
    realted_articles: Array.isArray(data.realted_articles)
      ? data.realted_articles.map((a) => ({
          id: a.id,
          title: a.title || '',
          slug: a.slug || '',
          publishedAt: a.publishedAt,
          views: a.views ?? 0,
          hero_image: a.hero_image,
          summary: a.summary,
          mainCategory: a.MainCategory
        }))
      : [],

    // Cast
    cast: normalizeCast(data.cast),

    // Crew
    crew: normalizeCrew(data.crew),

    // Reviews
    shows_reviews: item.shows_reviews?.map(review => ({
      id: review.id,
      documentId: review.documentId,
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt,
      user: review.user ? {
        id: review.user.id,
        username: review.user.username || review.user.name || 'Anonymous',
        email: review.user.email
      } : { id: null, username: 'Anonymous' }
    })) || [],
    
    // Similar TV Shows
    similar_tv_shows: Array.isArray(data.similar_tv_shows)
      ? data.similar_tv_shows.map((s) => ({
          id: s.id,
          title: s.title,
          slug: s.slug,
          description: s.description,
          releaseDate: s.realeaseDate || s.releaseDate,
          age_rating: s.age_rating,
          poster: normalizeImage(s.poster),
          seasonNumber: s.seasonNumber,
        }))
      : [],

    // Seasons
    shows_seasons: normalizeSeasons(data.shows_seasons),
  };
};
export const tvShowsAPI = {
   // ✅ Fixed GetAll method
  getAll: async (params = {}) => {
    try {
      const q = new URLSearchParams();
      
      q.append("pagination[page]", params.page || 1);
      q.append("pagination[pageSize]", params.pageSize || 12);
      q.append("sort[0]", params.sort || "realeaseDate:desc");
      q.append("populate", "*");
      
      // Language filter
      const languageFilter = params.language || "hi";
      q.append("filters[language][$eq]", languageFilter);
      
    
     if (params.trending === true) {
        q.append("filters[trending][$eq]", true);
      }
      // Search filter
      if (params.search && params.search.trim().length > 1) {
        const searchTerm = params.search.trim();
        q.append("filters[$or][0][title][$containsi]", searchTerm);
        q.append("filters[$or][1][slug][$containsi]", searchTerm);
      }
      
      // Genre filter
      if (params.filters?.genre && params.filters.genre !== "All") {
        q.append("filters[genres][name][$containsi]", params.filters.genre);
      }
      
      // Year filter
      if (params.filters?.year && params.filters.year !== "All") {
        q.append("filters[realeaseDate][$contains]", params.filters.year);
      }
      
      // Rating filter
      if (params.filters?.rating && params.filters.rating !== "All") {
        q.append("filters[rating][$gte]", parseFloat(params.filters.rating));
      }
      
      // Category filter
      if (params.category && params.category !== "all") {
        q.append("filters[categories][slug][$containsi]", params.category);
      }
      
      const queryString = q.toString();
      const url = `/shows?${queryString}`;
      
      const res = await apiClient.get(url);
      const data = res?.data?.data || [];
      const pagination = res?.data?.meta?.pagination || {};
      
      
      
      return { data: data.map(normalizeTvShow), pagination };
    } catch (error) {
      console.error("❌ tvShowsAPI.getAll Error:", error);
      return { data: [], pagination: {} };
    }
  },

  // ✅ Fixed Simple Search Method
  simpleSearch: async (searchTerm, options = {}) => {
    try {
      const { page = 1, pageSize = 8, language = "hi" } = options;
      
      const q = new URLSearchParams();
      q.append("pagination[page]", page);
      q.append("pagination[pageSize]", pageSize);
      // ✅ FIXED: Use correct field name
      q.append("sort[0]", "realeaseDate:desc");
      q.append("populate", "*");
      q.append("filters[language][$eq]", language);

      if (searchTerm && searchTerm.trim().length > 0) {
        const term = searchTerm.trim();
        q.append("filters[$or][0][title][$containsi]", term);
        q.append("filters[$or][1][slug][$containsi]", term);
      }

      const queryString = q.toString();
      const url = `/shows?${queryString}`;
      
      const res = await apiClient.get(url);
      return {
        data: (res.data?.data || []).map(normalizeTvShow),
        pagination: res.data?.meta?.pagination || {}
      };
    } catch (error) {
      console.error("❌ tvShowsAPI.simpleSearch Error:", error);
      return { data: [], pagination: {} };
    }
  },
  // ✅ Get by slug with full population
  getBySlug: async (slug) => {
    const q = qs.stringify({
      filters: { 
        slug: { $eq: slug },
        language: { $eq: "hi" } 
      },
      populate: {
        poster: { fields: ['url', 'formats', 'caption'] },
        backdrop_poster: { fields: ['url', 'formats'] },
        languages: { fields: ['language'] },
        categories: { fields: ['name', 'slug'] },
        genres: { fields: ['name', 'slug'] },
        shows_seasons: { populate: '*' },
        watchingPlatform: { populate: '*' },
        tv_show_awards: { populate: '*' },
        cast: {
  populate: {
    celebrities_profiles: {
      populate: {
        Avatar: {
          populate: "*"
        }
      }
    }
  }
},
        crew: {
  populate: {
    celebrities_profiles: {
      populate: {
        Avatar: {
          populate: "*"
        }
      }
    },
    photo: true
  }
},
        similar_tv_shows: {
          populate: {
            poster: { fields: ['url', 'formats'] }
          }
        },
        realted_articles: {
          populate: "*"
        },
        shows_reviews: {
          populate: {
            user: {
              fields: ['id', 'documentId', 'username', 'email']
            }
          }
        }
      }
    }, { encodeValuesOnly: true });

    try {
      const res = await apiClient.get(`/shows?${q}`);
      const item = res.data?.data?.[0] ?? null;

      if (item) {
        const normalizedShow = normalizeTvShow(item);

        const reviews = item.shows_reviews?.map(review => ({
          id: review.id,
          documentId: review.documentId,
          rating: review.rating || 0,
          comment: review.comment || '',
          createdAt: review.createdAt,
          updatedAt: review.updatedAt,
          user: review.user ? {
            id: review.user.id,
            documentId: review.user.documentId,
            username: review.user.username || 'Anonymous',
            email: review.user.email
          } : {
            id: null,
            documentId: null,
            username: 'Anonymous',
            email: null
          }
        })) || [];

        return {
          ...normalizedShow,
          reviews: reviews
        };
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // ✅ Get by slug with cast only
  getBySlugWithCast: async (slug) => {
    const q = qs.stringify({
      filters: { slug: { $eq: slug } },
      populate: {
        cast: {
          populate: {
            celebrities_profiles: {
              populate: {
                Avatar: { fields: ['url', 'formats'] }
              }
            }
          }
        }
      }
    }, { encodeValuesOnly: true });

    try {
      const res = await apiClient.get(`/shows?${q.toString()}`);
      const item = res.data?.data?.[0];
      return item ? normalizeTvShow(item) : null;
    } catch (error) {
      return null;
    }
  },

  // ✅ Get by slug with crew only
  getBySlugWithCrew: async (slug) => {
    const q = qs.stringify({
      filters: { slug: { $eq: slug } },
      populate: {
        crew: {
          populate: {
            celebrities_profiles: {
              populate: {
                Avatar: { fields: ['url', 'formats'] }
              }
            },
            photo: { fields: ['url', 'formats'] }
          }
        }
      }
    }, { encodeValuesOnly: true });

    try {
      const res = await apiClient.get(`/shows?${q.toString()}`);
      const item = res.data?.data?.[0];
      return item ? normalizeTvShow(item) : null;
    } catch (error) {
      return null;
    }
  },

  // ✅ Get by slug with similar shows
  getBySlugWithSimilar: async (slug) => {
    const q = qs.stringify({
      filters: { slug: { $eq: slug } },
      populate: {
        similar_tv_shows: {
          populate: {
            poster: { fields: ['url', 'formats'] }
          }
        }
      }
    }, { encodeValuesOnly: true });

    try {
      const res = await apiClient.get(`/shows?${q.toString()}`);
      const item = res.data?.data?.[0];
      return item ? normalizeTvShow(item) : null;
    } catch (error) {
      return null;
    }
  },

  // ✅ Get by slug with articles
  getBySlugWithArticles: async (slug) => {
    const q = qs.stringify({
      filters: { 
        slug: { $eq: slug },
        language: { $eq: "hi" },
        moderation_status: { $eq: "published" }
      },
      populate: {
        realted_articles: {
          populate: {
            hero_image: { fields: ['url', 'formats'] }
          }
        }
      }
    }, { encodeValuesOnly: true });

    try {
      const res = await apiClient.get(`/shows?${q.toString()}`);
      const item = res.data.data?.[0];
      return item ? normalizeTvShow(item) : null;
    } catch (error) {
      return null;
    }
  },
};

export const tvShowReviewsAPI = {
  // Get reviews by TV show ID
  async getByShowId(showId) {
    try {
      const q = qs.stringify({
        filters: { tv_show: { id: { $eq: showId } } },
        populate: ["user", "tv_show"],
        sort: ["createdAt:desc"]
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/shows-reviews?${q}`);

      return (res.data?.data || []).map(item => ({
        id: item.id,
        documentId: item.documentId,
        rating: item.rating || 0,
        comment: item.comment || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user ? {
          id: item.user.id,
          documentId: item.user.documentId,
          username: item.user.username || 'Anonymous',
          email: item.user.email
        } : {
          id: null,
          documentId: null,
          username: 'Anonymous',
          email: null
        },
        tv_show: item.tv_show ? {
          id: item.tv_show.id,
          documentId: item.tv_show.documentId,
          title: item.tv_show.title,
          slug: item.tv_show.slug
        } : null
      }));
    } catch (error) {
      console.error("❌ getByShowId error:", error.response?.data || error.message);
      return [];
    }
  },

  // Get reviews by TV show slug
  async getBySlug(slug) {
    try {
      const q = qs.stringify({
        filters: { tv_show: { slug: { $eq: slug } } },
        populate: ["user", "tv_show"],
        sort: ["createdAt:desc"]
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/shows-reviews?${q}`);

      return (res.data?.data || []).map(item => ({
        id: item.id,
        documentId: item.documentId,
        rating: item.rating || 0,
        comment: item.comment || '',
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        user: item.user ? {
          id: item.user.id,
          documentId: item.user.documentId,
          username: item.user.username || 'Anonymous',
          email: item.user.email
        } : {
          id: null,
          documentId: null,
          username: 'Anonymous',
          email: null
        },
        tv_show: item.tv_show ? {
          id: item.tv_show.id,
          documentId: item.tv_show.documentId,
          title: item.tv_show.title,
          slug: item.tv_show.slug
        } : null
      }));
    } catch (error) {
      console.error("❌ getBySlug error:", error.response?.data || error.message);
      return [];
    }
  },

  // Create a new review
  async create({ rating, comment, showId, userId, showDocumentId }) {
    try {
      // Validate required fields
      if (!showId && !showDocumentId) {
        throw new Error("Missing show ID (either id or documentId required)");
      }
      if (!userId) {
        throw new Error("Missing userId");
      }
      if (!rating || rating < 1 || rating > 10) {
        throw new Error("Rating must be between 1 and 10");
      }
      if (!comment?.trim()) {
        throw new Error("Comment cannot be empty");
      }

      // Based on your API response, the relation field is 'tv_show'
      // and it expects the documentId
      const payload = {
        data: {
          rating: Number(rating),
          comment: comment.trim(),
          tv_show: showDocumentId || showId,  // The API expects documentId
          user: userId,                          // User documentId
          publishedAt: new Date().toISOString()
        }
      };

      console.log("📤 Creating review payload:", JSON.stringify(payload, null, 2));

      const res = await apiClient.post("/shows-reviews", payload);

      console.log("✅ Review created successfully:", res.data);
      return res.data;
    } catch (error) {
      console.error("❌ Create review failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Update an existing review
  async update(reviewDocumentId, { rating, comment }) {
    try {
      if (!reviewDocumentId) {
        throw new Error("Missing review documentId");
      }

      const payload = {
        data: {
          ...(rating && { rating: Number(rating) }),
          ...(comment?.trim() && { comment: comment.trim() })
        }
      };

      const res = await apiClient.put(`/shows-reviews/${reviewDocumentId}`, payload);

      return res.data;
    } catch (error) {
      console.error("❌ Update review failed:", error.response?.data || error.message);
      throw error;
    }
  },

  // Delete a review
  async delete(reviewDocumentId) {
    try {
      if (!reviewDocumentId) {
        throw new Error("Missing review documentId");
      }

      const response = await apiClient.delete(`/shows-reviews/${reviewDocumentId}`);

      return response.data;
    } catch (error) {
      console.error("❌ Delete review error:", error.response?.data || error.message);
      throw error;
    }
  },

  // Get average rating for a TV show
  async getAverageRating(showId) {
    try {
      const reviews = await this.getByShowId(showId);

      if (reviews.length === 0) return 0;

      const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
      const average = sum / reviews.length;

      return {
        average: Number(average.toFixed(1)),
        total: reviews.length,
        ratings: reviews.map(r => r.rating)
      };
    } catch (error) {
      console.error("❌ getAverageRating error:", error);
      return { average: 0, total: 0, ratings: [] };
    }
  },

  // Check if user has already reviewed a show
  async hasUserReviewed(showId, userId) {
    try {
      const q = qs.stringify({
        filters: {
          $and: [
            { tv_show: { id: { $eq: showId } } },
            { user: { id: { $eq: userId } } }
          ]
        },
        populate: ["user", "tv_show"]
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/shows-reviews?${q}`);

      return {
        hasReviewed: res.data?.data?.length > 0,
        review: res.data?.data?.[0] || null
      };
    } catch (error) {
      console.error("❌ hasUserReviewed error:", error);
      return { hasReviewed: false, review: null };
    }
  }
};


export default apiClient;