import apiClient from './client';
import qs from "qs";
import { normalizeMedia} from './helpers';


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
