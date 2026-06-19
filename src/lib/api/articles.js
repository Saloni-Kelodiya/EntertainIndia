import apiClient from './client';
import qs from "qs";
import { normalizeMedia, normalizeAuthor, DEFAULT_TEAM_AUTHOR, toIST } from './helpers';
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
    trending: data.trending,
    // 🖼 Hero Image
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

    q.append("sort[0]", "createdAt:desc");
    q.append("filters[language][$eq]", "hi");
    q.append("filters[moderation_status][$eq]", "published");

    q.append("populate[0]", "hero_image");
    q.append("populate[1]", "category");
    q.append("populate[2]", "Authors");
    q.append("populate[3]", "genres");
    q.append("populate[4]", "tags");
    q.append("populate[5]", "gallery");
    q.append("populate[6]", "watching_platform");

    const slugMap = {
      bollywood: "bollywood",
      hollywood: "hollywood",
      news: "news",
      webseries: "web-series",
      tollywood: "tollywood",
      bhojiwood: "bhojiwood",
      ott: "ott",
      korean: 'korean',
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

    const relatedToMap = {
      music: ["Music", "music", "Music News", "MusicNews"],
      reviews: ["Movie Review", "movie review", "Movie Reviews", "movie reviews", "Review", "Reviews"],
      fashion: ["Fashion", "fashion", "Celebrity Fashion", "CelebrityFashion"],
      awards: ["Awards", "awards", "Award", "Award Show", "Award Ceremonies", "AwardCeremony"]
    };

    if (params.industry) {
      q.append("filters[category][slug][$eq]", params.industry);
    }

    if (params.related_to) {
      if (Array.isArray(params.related_to)) {
        params.related_to.forEach((val, idx) => {
          q.append(`filters[related_to][$in][${idx}]`, val);
        });
      } else {
        q.append("filters[related_to][$eq]", params.related_to);
      }
    }

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

    if (params.genres && params.genres.length > 0) {
      params.genres.forEach((genreSlug, index) => {
        q.append(`filters[genres][slug][$in][${index}]`, genreSlug);
      });
    }

    if (params.mainCategory) {
      q.append(`filters[$and][0][$or][0][MainCategory][$eq]`, params.mainCategory);
    }

    if (params.typeContent) {
      q.append("filters[typecontent][$eq]", params.typeContent);
    }

    if (params.platform && params.platform !== "all") {
      q.append("filters[platform][$eq]", params.platform);
    }

    if (params.genre && params.genre !== "all") {
      q.append("filters[genres][$contains]", params.genre);
    }

    if (params.rating && params.rating !== "all") {
      q.append("filters[rating][$gte]", Number(params.rating));
    }

    if (params.ageRating && params.ageRating !== "all") {
      q.append("filters[agerating][$eq]", params.ageRating);
    }

    if (params.language && params.language !== "all") {
      q.append("filters[language][$eq]", params.language);
    }

    if (params.seriesType && params.seriesType !== "all") {
      q.append("filters[series_type][$eq]", params.seriesType);
    }

    if (params.status && params.status !== "all") {
      q.append("filters[status][$eq]", params.status);
    }

    if (params.featured) {
      q.append("filters[featured][$eq]", "true");
      q.delete("sort[0]");
      q.append("sort[0]", "createdAt:desc");
    }

    if (params.publishedAfter) {
      q.append("filters[createdAt][$gt]", params.publishedAfter);
    }

    if (params.tag) {
      const cleanTag = params.tag.replace(/^#/, '').toLowerCase();
      q.append("filters[tags][slug][$eq]", cleanTag);
    }

    if (params.tags && params.tags.length > 0) {
      params.tags.forEach((tag, idx) => {
        const cleanTag = tag.replace(/^#/, '').toLowerCase();
        q.append(`filters[tags][slug][$in][${idx}]`, cleanTag);
      });
    }

    if (params.search) {
      q.append("filters[$and][1][$or][0][title][$containsi]", params.search);
      q.append("filters[$and][1][$or][1][summary][$containsi]", params.search);
      q.append("filters[$and][1][$or][2][slug][$containsi]", params.search);
    }

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

  async getLatestNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "LatestNews",
    });
  },

  async getCelebrityNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "CelebrityNews",
    });
  },

  async getViralNews(params = {}) {
    return articlesAPI.getAll({
      ...params,
      typeContent: "ViralNews",
    });
  },

  async getOTTArticles(params = {}) {
    return articlesAPI.getAll({
      ...params,
      category: "ott",
    });
  },

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
      queryParams.append('sort', 'createdAt:desc');

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

  async getMyArticles(userId, params = {}) {
    const token = localStorage.getItem("token");
    const q = new URLSearchParams({
      "pagination[page]": params.page || 1,
      "pagination[pageSize]": params.pageSize || 10,
    });

    q.append("filters[Authors][id][$eq]", userId);
    q.append("sort[0]", "createdAt:desc");
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
    queryParams.append('sort', 'createdAt:desc');

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
        sort: ['createdAt:desc'],
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/articles?${query}`);
      return (res.data?.data || []).map(normalizeArticle);
    } catch (err) {
      console.error("Error fetching articles by movie:", err);
      return [];
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