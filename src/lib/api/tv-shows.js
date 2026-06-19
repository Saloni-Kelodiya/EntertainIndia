import apiClient from './client';
import qs from "qs";
import { getHindiGenreName } from './hindiMaps';

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