import apiClient from './client';
import qs from "qs";
import { normalizeCategory } from './categories';


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