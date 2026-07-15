import apiClient from './client';
import qs from "qs";
import { normalizeMedia } from './helper';

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
    Language: data.language, //  language field भी normalize करें
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishedAt: data.publishedAt,
topSearchRank:data.topSearchRank,
    //  Thumbnail
    thumbnail: data.thumbnail ? normalizeMedia(data.thumbnail) : null,

    //  Categories
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

    //  Platforms
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



    //  IMPORTANT: Song Artists - Repeatable Component
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

    //  Helper: Get all artist names as comma-separated string (for display)
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

    //  Helper: Get all clickable artists (for linking)
    clickableArtists: (() => {
      if (!Array.isArray(data.song_artists)) return [];

      return data.song_artists
        .filter(item => item.artist_profile) // Sirf wahi jinke pas profile hai
        .map(item => ({
          name: item.artist_profile.name,
          slug: item.artist_profile.Slug || item.artist_profile.slug,
        }));
    })(),
    //  Related Songs
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
            //  FORCE HINDI LANGUAGE FILTER
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
  
  //  SIMPLE SEARCH METHOD - FIXED: Use term variable properly
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
          { lead_artist_name: { $containsi: term } }, //  FIXED
          { album: { $containsi: term } },
          {
            song_artists: {
              artist_name: { $containsi: term } //  nested artist search
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
          //  FORCE HINDI LANGUAGE FILTER
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
          //  FORCE HINDI LANGUAGE FILTER
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
          //  FORCE HINDI LANGUAGE FILTER
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
          //  FORCE HINDI LANGUAGE FILTER
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
          //  FORCE HINDI LANGUAGE FILTER
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

  //  SEARCH METHOD - पूरी तरह से फिक्स्ड
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
          //  FORCE HINDI LANGUAGE FILTER
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