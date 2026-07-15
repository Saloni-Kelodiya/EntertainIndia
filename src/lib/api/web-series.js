import apiClient from './client';
import qs from "qs";
import { getHindiGenreName,getHindiLanguageName } from './hindiMaps';


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

  //  FIXED: Cast normalizer - use normalizeImage consistently
  const normalizeCast = (castItems) => {
  if (!Array.isArray(castItems)) return [];

  return castItems.map(item => {
    const celebrity = Array.isArray(item.celebrities_profiles)
      ? item.celebrities_profiles[0]
      : item.celebrities_profiles;

    
    return {
      id: item.id,
      characterName: item.characterName,
      seasons:item.seasons,
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
  //  FIXED: Crew normalizer
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

  //  FIXED: Awards normalizer
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
   language: item.language, //  language field भी normalize करें
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

    //  Genres with Hindi mapping
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
   //  Languages with Hindi mapping
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
      h1_title: a.h1_title || a.title,
      title:a.title,
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
            poster: ws.poster ? normalizeImage(ws.poster) : null, //  FIXED: Use normalizeImage
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
  //  GetAll method restored and fixed
  getAll: async (params = {}) => {
    const q = new URLSearchParams({
      "pagination[page]": params.page || 1,
      "pagination[pageSize]": params.pageSize || 12,
    });
    q.append("filters[language][$eq]", "hi");
    q.append("sort[0]", params.sort || "releaseDate:desc");
   //  FORCE ENGLISH LANGUAGE FILTER
    
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

getAllLight: async (options = {}) => {
  const {
    language = "hi",
    pageSize = 20,
    sort = "releaseDate:desc",
  } = options;

  try {
    const query = {
      filters: {
        language: { $eq: language },
      },
      fields: ["title", "slug", "releaseDate", "language"], // 👈 relation hataya, slug add kiya
      populate: {
        poster: {
          fields: ["url"],
        },
        languages: {
          fields: ["language"],
        },
      },
      pagination: {
        pageSize,
      },
      sort: [sort],
    };

    const q = qs.stringify(query, { encodeValuesOnly: true });

    const res = await apiClient.get(`/web-series-collections?${q}`);
    const items = res.data?.data || [];

    return items.map((item) => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,                          // 👈 add kiya
      releaseDate: item.releaseDate,
      language: item.language,
      languages: Array.isArray(item.languages)   // 👈 add kiya
        ? item.languages.map((l) => ({
            id: l.id,
            language: l.language,
          }))
        : [],
      poster: item.poster?.url || null,
    }));
  } catch (error) {
    console.error(
      "❌ webSeriesAPI.getAllLight Error:",
      error?.response?.data || error.message
    );
    return [];
  }
},
getAllTrending: async (options = {}) => {
  const {
    language = 'hi',
    category = null,
    pageSize = 20,
    sort = 'releaseDate:desc',
    trending = false,
  } = options;

  try {
    const query = {
      filters: { language: { $eq: language } },
      fields: ['title', 'slug', 'releaseDate'],
      populate: {
        categories: { fields: ['name', 'slug'] },
        languages: { fields: ['language'] },
      },
      pagination: { pageSize },
      sort: [sort],
    };

    if (category) {
      query.filters.categories = { slug: { $eq: category } };
    }

    if (trending) {
      query.filters.trending = { $eq: true };
    }

    const q = qs.stringify(query, { encodeValuesOnly: true });
    const res = await apiClient.get(`/web-series-collections?${q}`);
    const items = res.data?.data || [];

    const mapped = items.map(item => ({
      id: item.id,
      documentId: item.documentId,
      title: item.title,
      slug: item.slug,
      releaseDate: item.releaseDate,
      categories: item.categories?.map(c => c.name) || [],
      languages: item.languages?.map(l => l.language) || [],
    }));

    return { webSeries: mapped };

  } catch (error) {
    
    return { webSeries: [] };
  }
},
  //  Simple Search Method for Web Series
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
    seasons: true,
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
                poster: { //  Make sure to populate poster
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

      console.log(" Review deleted successfully");
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

      console.log(" Review updated successfully:", res.data);
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