
import apiClient from './client';
import { normalizeMedia } from './helpers';

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