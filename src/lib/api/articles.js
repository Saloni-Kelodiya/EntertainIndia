import apiClient from './client';
import qs from "qs";
import { normalizeMedia, normalizeAuthor, DEFAULT_TEAM_AUTHOR, toIST } from './helper';
import { normalizeCategory } from './categories';
import { normalizeTags } from './tags';
import { getHindiGenreName } from './hindiMaps';


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
    h1_title:data.h1_title,
    slug: data.slug,
    summary: data.summary,
    body: data.body,
    keywords:data.meta_keywords,
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
    language: data.language, //  language field भी normalize करें

    //  THIS WAS BREAKING
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

  // Populate fields (light)
  q.append("populate[hero_image][fields][0]", "url");
  q.append("populate[hero_image][fields][1]", "formats");
  q.append("populate[category][fields][0]", "name");
  q.append("populate[category][fields][1]", "slug");
  q.append("populate[Authors][fields][0]", "username");

  // ---- फ़िल्टर्स ----
  if (params.featured) q.append("filters[featured][$eq]", "true");
  if (params.mainCategory) q.append("filters[MainCategory][$eq]", params.mainCategory);
  if (params.typeContent) q.append("filters[typecontent][$eq]", params.typeContent);
  if (params.category) q.append("filters[category][slug][$eq]", params.category);
  
  // ✅ नया – related_to फ़िल्टर
  if (params.related_to) {
    q.append("filters[related_to][$eq]", params.related_to);
  }

  if (params.limit) q.set("pagination[pageSize]", params.limit);
  if (params.search) {
    q.append("filters[$and][1][$or][0][title][$containsi]", params.search);
    q.append("filters[$and][1][$or][1][summary][$containsi]", params.search);
    q.append("filters[$and][1][$or][2][slug][$containsi]", params.search);
  }

  try {
    const res = await apiClient.get(`/articles?${q.toString()}`);
    const data = res?.data?.data || [];
    const pagination = res?.data?.meta?.pagination || {};

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
    
    //  Only sort by createdAt:desc (latest first)
    q.append("sort[0]", "createdAt:desc");
    
    //  Language filter
    q.append("filters[language][$eq]", "hi");
    
    //  Only published articles
    q.append("filters[moderation_status][$eq]", "published");

    //  Explicitly populate critical fields
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
  
  //  $containsi ki jagah $eq use karein taaki strictly wahi slug match ho
  q.append("filters[tags][slug][$eq]", cleanTag);
}

// Agar tags array se filter karna ho (Multiple tags matching)
if (params.tags && params.tags.length > 0) {
  params.tags.forEach((tag, idx) => {
    const cleanTag = tag.replace(/^#/, '').toLowerCase();
    //  Yahan bhi strict matching apply hogi
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

// ─── articlesAPI ऑब्जेक्ट के अंदर ──────────────────────────
// articlesAPI के अंदर – getWhattoWatch को इस तरह बदलें

getWhattoWatch: async (params = {}) => {
  let sort = params.sort || 'createdAt:desc';
  if (typeof sort === 'string') sort = [sort];

  const query = {
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 12,
    },
    sort,
    fields: ['title','h1_title', 'slug', 'createdAt', 'summary'],
    populate: {
      hero_image: { fields: ['url', 'formats'] }, // ← formats लेना ज़रूरी
      category: { fields: ['name', 'slug'] },
      watching_platform: { fields: ['platform'] },
      genres: { fields: ['name', 'slug'] },
    },
    filters: {
      language: { $eq: 'hi' },
      moderation_status: { $eq: 'published' },
      ...(params.hasPlatform === true && {
        watching_platform: { $notNull: true }
      }),
      ...(params.platform && params.platform !== 'all' && {
        watching_platform: {
          platform: { $eq: params.platform }
        }
      }),
    },
  };

  if (params.filters) {
    query.filters = { ...query.filters, ...params.filters };
  }

  try {
    const qs = require('qs');
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const res = await apiClient.get(`/articles?${queryString}`);
    const data = res?.data?.data || [];
    const pagination = res?.data?.meta?.pagination || {};

    const articles = data.map(item => {
      const attrs = item.attributes || item;

      // ─── Hero Image ──────────────────────────
      const heroRaw = attrs.hero_image?.data?.attributes || attrs.hero_image;
      let heroImage = null;
      if (heroRaw) {
        heroImage = {
          url: heroRaw.url || null,
          formats: heroRaw.formats || null, // includes medium, small, etc.
        };
      }

      // ─── Category ────────────────────────────
      let category = null;
      const catRaw = attrs.category;
      if (catRaw) {
        if (Array.isArray(catRaw)) {
          const first = catRaw[0];
          if (first) {
            const firstData = first.attributes || first;
            category = {
              name: firstData.name,
              slug: firstData.slug,
            };
          }
        } else {
          const catData = catRaw.data?.attributes || catRaw;
          category = {
            name: catData.name,
            slug: catData.slug,
          };
        }
      }

      // ─── Watching Platform ──────────────────
      let watching_platform = [];
      const wpRaw = attrs.watching_platform;
      if (wpRaw) {
        if (Array.isArray(wpRaw)) {
          watching_platform = wpRaw.map(p => {
            const pData = p.attributes || p;
            return { platform: pData.platform };
          }).filter(p => p.platform);
        } else if (wpRaw.data) {
          const wpList = Array.isArray(wpRaw.data) ? wpRaw.data : [wpRaw.data];
          watching_platform = wpList.map(p => {
            const pData = p.attributes || p;
            return { platform: pData.platform };
          }).filter(p => p.platform);
        }
      }

      // ─── Genres ─────────────────────────────
      let genres = [];
      const genresRaw = attrs.genres;
      if (genresRaw) {
        if (Array.isArray(genresRaw)) {
          genres = genresRaw.map(g => {
            const gData = g.attributes || g;
            return { name:  getHindiGenreName(gData.name),slug: gData.slug };
          }).filter(g => g.slug);
        } else if (genresRaw.data) {
          const gList = Array.isArray(genresRaw.data) ? genresRaw.data : [genresRaw.data];
          genres = gList.map(g => {
            const gData = g.attributes || g;
            return { name: gData.name, slug: gData.slug };
          }).filter(g => g.slug);
        }
      }

      return {
        id: item.id,
        title: attrs.title,
        h1_title:attrs.h1_title||attrs.title,
        slug: attrs.slug,
        summary: attrs.summary,
        createdAt: attrs.createdAt,
        heroImage,           // ← object with url & formats
        category,            // ← object { name, slug }
        watching_platform,   // ← array of { platform }
        genres,              // ← array of { name, slug }
      };
    });

    return { articles, pagination };
  } catch (error) {
    console.error('❌ getWhattoWatch error:', error);
    return { articles: [], pagination: {} };
  }
},

// ─── 2. टैग के आधार पर आर्टिकल (strict exact match) ──
getTagsArticle: async (params = {}) => {
  // यदि न तो tag और न tags दिया गया तो खाली लौटाएँ (या आप चाहें तो सभी)
  if (!params.tag && (!params.tags || params.tags.length === 0)) {
    return { articles: [], pagination: {} };
  }

  const filters = {
    language: { $eq: 'hi' },
    moderation_status: { $eq: 'published' },
  };

  // Strict tag filter – exact match on slug
  if (params.tag) {
    const cleanTag = params.tag.replace(/^#/, '').toLowerCase();
    filters.tags = { slug: { $eq: cleanTag } };
  } else if (params.tags && params.tags.length > 0) {
    const cleanTags = params.tags.map(t => t.replace(/^#/, '').toLowerCase());
    filters.tags = { slug: { $in: cleanTags } };
  }

  const query = {
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 12,
    },
    sort: ['createdAt:desc'],
    fields: ['title',"h1_title", 'slug', 'createdAt', 'summary'],
    populate: {
      hero_image: {
        fields: ['url', 'formats'],
      },
      category: {
        fields: ['name', 'slug'],
      },
      // tags को populate करने की ज़रूरत नहीं – बस filter के लिए
    },
    filters,
  };

  try {
    const qs = require('qs');
    const queryString = qs.stringify(query, { encodeValuesOnly: true });
    const res = await apiClient.get(`/articles?${queryString}`);
    const data = res?.data?.data || [];
    const pagination = res?.data?.meta?.pagination || {};
    const articles = data.map(item => {
      const attrs = item.attributes || item;
      const hero = attrs.hero_image?.data?.attributes || attrs.hero_image;
      return {
        id: item.id,
        title: attrs.title,
        slug: attrs.slug,
        summary: attrs.summary,
        createdAt: attrs.createdAt,
        heroImage: hero?.url || null,
        category: attrs.category?.data?.attributes?.slug || attrs.category?.slug || null,
      };
    });
    return { articles, pagination };
  } catch (error) {
    console.error('❌ getTagsArticle error:', error);
    return { articles: [], pagination: {} };
  }
},
 async  getCategoryArticles(params = {}) {
  const queryObj = {
    pagination: {
      page: params.page || 1,
      pageSize: params.pageSize || 6,
    },
    sort: params.sort || 'createdAt:desc',
    // ✅ Sirf zaroori fields — baaki kuch nahi
    fields: ['title', 'slug'],
    populate: {
      hero_image: {
        fields: ['url', 'formats'],
      },
    },
    filters: {
      language: { $eq: 'hi' },
      moderation_status: { $eq: 'published' },
    },
  };

  // Category filter
  if (params.category && params.category !== 'all') {
    queryObj.filters.category = { slug: { $eq: params.category } };
  }

  // MainCategory filter (article vs news)
  if (params.mainCategory) {
    queryObj.filters.MainCategory = { $eqi: params.mainCategory };
  }

  try {
    const query = qs.stringify(queryObj, { encodeValuesOnly: true });
    const res = await apiClient.get(`/articles?${query}`);

    const articles = (res.data?.data || []).map((item) => {
      const d = item.attributes || item; // Strapi v4/v5 dono handle
      const imgRaw = d.hero_image?.data ? d.hero_image.data.attributes : d.hero_image;

      return {
        id: item.id,
        title: d.title || '',
        slug: d.slug || '',
        poster: imgRaw?.url || null,
      };
    });

    return {
      articles,
      pagination: res.data?.meta?.pagination || {},
    };
  } catch (error) {
    console.error("❌ getCategoryArticles Error:", error);
    return { articles: [], pagination: {} };
  }
},
  //  DEDICATED LATEST NEWS FETCHER
  async getLatestNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "LatestNews",
      // No sort override - will use createdAt:desc
    });
  },
//  DEDICATED CELEBRITY NEWS FETCHER
  async getCelebrityNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "CelebrityNews",
    });
  },

  //  DEDICATED VIRAL NEWS FETCHER
  async getViralNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "ViralNews",
    });
  },

  //  DEDICATED OTT ARTICLES FETCHER
  async getOTTArticles(params = {}) {
    return articlesAPI.getAll({
      ...params,
      category: "ott",
    });
  },

  //  DEDICATED TV ARTICLES FETCHER
  async getTVArticles(params = {}) {
    return articlesAPI.getAll({
      ...params,
      category: "tv",
    });
  },

  getBySlug: async (slug) => {
  const queryParams = new URLSearchParams();
  
  // Filters
  queryParams.append('filters[slug][$eq]', slug);
  queryParams.append('filters[moderation_status][$eq]', 'published');
  queryParams.append('filters[language][$eq]', 'hi');
  queryParams.append('publicationState', 'live');
  
  // 1. Main article fields (सिर्फ detail page के लिए जरूरी fields)
  const fields = [
    'title', 'slug', 'h1_title','summary', 'body', 'meta_description', 'meta_keywords','featured',
    'publishedAt', 'updatedAt', 'reading_time', 'moderation_status','MainCategory'
  ];
  fields.forEach((field, index) => {
    queryParams.append(`fields[${index}]`, field);
  });
  
  // 2. Hero Image - url, alt text, and formats (responsive images के लिए)
  queryParams.append('populate[hero_image][fields][0]', 'url');
  queryParams.append('populate[hero_image][fields][1]', 'alternativeText');
  queryParams.append('populate[hero_image][fields][2]', 'formats');
   queryParams.append('populate[hero_image][fields][3]', 'caption');
  
  // 3. Category - sirf name aur slug (category detail page link ke liye)
  queryParams.append('populate[category][fields][0]', 'name');
  queryParams.append('populate[category][fields][1]', 'slug');
  
  // 4. Authors - sirf username (author name display karne ke liye)
  queryParams.append('populate[Authors][fields][0]', 'username');

queryParams.append('populate[tags][fields][0]', 'name');
  queryParams.append('populate[tags][fields][1]', 'slug');
  
  
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
      queryParams.append('sort', 'createdAt:desc'); //  Changed to createdAt
      const pageSize = 15;
      queryParams.append('pagination[pageSize]', pageSize);
      queryParams.append('pagination[page]', 1);
      queryParams.append('publicationState', 'live');
      queryParams.append('populate[1]', 'category');
      
  
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
  
  //  DEDICATED MY ARTICLES FETCHER (For Dashboard)
  async getMyArticles(userId, params = {}) {
    const token = localStorage.getItem("token");
    const q = new URLSearchParams({
      "pagination[page]": params.page || 1,
      "pagination[pageSize]": params.pageSize || 10,
    });

    q.append("filters[Authors][id][$eq]", userId);
    q.append("sort[0]", "createdAt:desc"); //  Changed to createdAt
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
    queryParams.append('sort', 'createdAt:desc'); //  Changed to createdAt

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
        sort: ['createdAt:desc'], //  Changed to createdAt
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