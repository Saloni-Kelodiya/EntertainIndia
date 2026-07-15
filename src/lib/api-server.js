// Server-side API calls using native fetch (works with Next.js Server Components)
import { API_URL, MEDIA_URL } from './constants';

export const normalizeAuthor = (author) => {
  if (!author) return null;
  const data = author.attributes || author;

  const rawName = data.name || data.username || data.fullName || data.display_name || data.displayName;
  const lowerName = (rawName || "").toLowerCase().replace(/\s/g, "");

  return {
    id: author.id,
    name: (lowerName === "entertainindiateam" || lowerName === "entertainindiaofficial")
      ? "EntertainIndia Team"
      : rawName,
    username: (lowerName === "entertainindiateam" || lowerName === "entertainindiaofficial")
      ? "entertainindiateam"
      : (data.username || data.name || data.slug),
    bio: data.bio,
    avatar: data.avatar ? normalizeMedia(data.avatar) : null,
    socialLinks: data.social_links,
  };
};

// Reuse the normalization functions from api.js
export const normalizeArticle = (article) => {
  if (!article) return null;

  const data = article.attributes || article;
  const heroRaw = data.hero_image || null;
  const authorsRes = data.Authors || data.authors;
  let rawAuthors = [];
  if (Array.isArray(authorsRes)) {
    rawAuthors = authorsRes;
  } else if (authorsRes?.data) {
    rawAuthors = Array.isArray(authorsRes.data) ? authorsRes.data : [authorsRes.data];
  } else if (authorsRes) {
    rawAuthors = [authorsRes];
  }

  const normalizedAuthors = rawAuthors.map(normalizeAuthor).filter(Boolean);

  //  FIX: Category ko handle karo – array ho toh pehla element lo, warna seedha normalize karo
  let normalizedCategory = null;
  if (data.category) {
    if (Array.isArray(data.category) && data.category.length > 0) {
      normalizedCategory = normalizeCategory(data.category[0]);
    } else if (!Array.isArray(data.category)) {
      normalizedCategory = normalizeCategory(data.category);
    }
  }

  const normalizedArticle = {
    id: article.id,
    title: data.title,
    slug: data.slug,
    summary: data.summary,
    body: data.body,
    mainCategory: data.MainCategory || data.mainCategory || null,
    publishDate: data.publish_datetime || data.createdAt,
    updatedDate: data.updated_datetime || data.updatedAt,
    publishedAt: data.publishedAt,
    moderation_status: data.moderation_status || 'pending',
    readingTime: data.reading_time || 0,
    views: data.views || 0,
    featured: data.featured,
    typeContent: data.typecontent,
    rating: data.rating ?? null,
    related_to: data.related_to || null,
    canonicalUrl: data.canonical_url,
    pros_1: data.pros_1 || null,
    pros_2: data.pros_2 || null,
    cons_1: data.cons_1 || null,
    cons_2: data.cons_2 || null,
    heroImage: heroRaw ? normalizeMedia(heroRaw) : null,
    category: normalizedCategory, // ab single object hai, array nahi
    genres: data.genres ? normalizeGenres(data.genres.data || data.genres) : [],
    tags: data.tags || [],
    authors: normalizedAuthors,
    Authors: normalizedAuthors.length > 0 ? normalizedAuthors[0] : null,
    gallery: data.gallery || [],
  };

  return normalizedArticle;
};

export const normalizeCategory = (category) => {
  if (!category) return null;
  const data = category.attributes || category;
  return {
    id: category.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
  };
};

export const normalizeTag = (tag) => {
  if (!tag) return null;
  const data = tag.attributes || tag;
  return {
    id: tag.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
  };
};

export const normalizeGenres = (genres) => {
  if (!genres) return [];
  // Ensure genres is an array, then map
  const genresArray = Array.isArray(genres) ? genres : [genres];
  return genresArray.map(genre => {
    const data = genre.attributes || genre;
    return {
      id: genre.id,
      name: data.name,
      slug: data.slug,
    };
  });
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


// Server-side articles API using fetch
export const articlesAPIServer = {
  async getAll(params = {}) {
    try {
      const q = new URLSearchParams({
        "pagination[page]": params.page || 1,
        "pagination[pageSize]": params.pageSize || 12,
      });

      // Handle sort as array if not already
      const sortValue = params.sort || "publishedAt:desc,publish_datetime:desc";
      if (sortValue.includes(',')) {
        sortValue.split(',').forEach((s, i) => q.append(`sort[${i}]`, s));
      } else {
        q.append("sort[0]", sortValue);
      }
       q.append("filters[language][$eq]", "hi");
      q.append("populate[0]", "hero_image");
      q.append("filters[moderation_status][$eq]", "published");
      q.append("populate[1]", "category");
      q.append("populate[2]", "Authors");
      q.append("populate[3]", "genres");
      q.append("populate[4]", "tags");

 
      const slugMap = {
        bollywood: "bollywood",
        hollywood: "hollywood",
        webseries: "web-series",
        ott: "ott",
        tv: "tv",
        music: "music",
        reviews: "reviews",
        photos: "photos",
        videos: "videos",
        webstories: "web-stories",
        korean:"korean",
        "celebrities-profile": "celebrities-profile",
        fashion: "fashion"
      };

      // Related To Mapping (Enum values in Strapi) - Use arrays for inclusivity
      const relatedToMap = {
        music: ["Music", "music", "Music News", "MusicNews"],
        reviews: ["Movie Review", "movie review", "Movie Reviews", "movie reviews", "Review", "Reviews"],
        fashion: ["Fashion", "fashion", "Celebrity Fashion", "CelebrityFashion"]
      };
      

      if (params.category && slugMap[params.category]) {
        const categorySlug = slugMap[params.category];
        const relatedToValues = relatedToMap[params.category];

        if (relatedToValues) {
          // Use indices 2 and 3 to avoid conflict with search (0 and 1)
          // OR filter: category slug matches OR related_to matches
          const s = categorySlug;
          const variants = [s, s.endsWith('s') ? s.slice(0, -1) : s + 's'];

          variants.filter(Boolean).forEach((v, idx) => {
            q.append(`filters[$or][2][category][slug][$in][${idx}]`, v);
          });


          relatedToValues.forEach((val, idx) => {
            q.append(`filters[$or][3][related_to][$in][${idx}]`, val);
          });
        } else {
          q.append("filters[category][slug][$eq]", categorySlug);
        }
      }

      q.append("filters[publishedAt][$notNull]", true);

      if (params.featured) q.append("filters[featured][$eq]", true);




      if (params.mainCategory) {
        q.append("filters[$and][0][$or][0][MainCategory][$eq]", params.mainCategory);
       
      }

      if (params.search) {
        q.append("filters[$and][1][$or][0][title][$containsi]", params.search);
        q.append("filters[$and][1][$or][1][summary][$containsi]", params.search);
      }

      //  FIX: URL Structure
      const url = `${API_URL}?endpoint=articles&${q.toString()}`;

      const res = await fetch(url, {
        next: { revalidate: 60 } // Revalidate every 60 seconds
      });



      const json = await res.json();
      const data = json?.data || [];
      const pagination = json?.meta?.pagination || {};
    //  Updated Console Log
     console.log("📦 JSON DATA:", json);
console.log("📦 TOTAL RECORDS:", json?.data?.length);
console.log("📦 PAGINATION:", json?.meta?.pagination);
      return { articles: data.map(normalizeArticle), pagination };
    } catch (error) {
      console.error('Error fetching articles:', error);
      return { articles: [], pagination: {} };
    }
  },

 async getBySlug(slug) {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('filters[slug][$eq]', slug);
    queryParams.append('publicationState', 'live');
    queryParams.append("sort[0]", "createdAt:desc"); // Changed to createdAt
    // Removed the second sort parameter - only use one
    queryParams.append('filters[moderation_status][$eq]', 'published');
    queryParams.append("filters[language][$eq]", "hi");
    queryParams.append('populate[0]', 'hero_image');
    queryParams.append('populate[1]', 'category');
    queryParams.append('populate[2]', 'Authors');
    queryParams.append('populate[3]', 'genres');
    queryParams.append('populate[4]', 'tags');

    //  FIX: URL Structure - Make sure API_URL is defined
    const url = `${API_URL}?endpoint=articles&${queryParams.toString()}`;
    
    const res = await fetch(url, {
      next: { revalidate: 60 }
    });

    if (!res.ok) {
      console.error('API Error:', res.status, res.statusText);
      const errorText = await res.text(); // Get more error details
      console.error('Error details:', errorText);
      return null;
    }

    const json = await res.json();
    const data = json?.data?.[0];

    if (!data) return null;

    // Increment view count (fire and forget - don't wait)
    if (data.id) {
      fetch(`${API_URL}?endpoint=articles/${data.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          data: { views: (data.attributes?.views || 0) + 1 }
        })
      }).catch(() => { });
    }

    return normalizeArticle(data);
  } catch (error) {
    console.error('Error fetching article by slug:', error);
    return null;
  }
}
};

// Normalize web story
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
    moderationStatus: data.moderation_status || "pending", //  Status mapping
    heroText: data.heroText || "",
    seo_title: data.seo_title || data.title,
    seo_description: data.seo_description || data.heroText,
    category: data.category || null,
    trandingRank: data.trandingRank || null,
    createdAt: data.createdAt,
    featured: data.featured,
    thumbnail: thumbnailUrl
      ? {
        url: thumbnailUrl.startsWith("http")
          ? thumbnailUrl
          : `${MEDIA_URL}${thumbnailUrl}`,
      }
      : null,

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
  };
};

// Server-side web stories API using fetch
// Server-side web stories API using fetch
export const webStoriesAPIServer = {
   async getAllLight(params = {}) {
      try {
        const limit = params.limit || 10;
        const category = params.category || '';
        
        //  SIRF THUMBNAIL POPULATE KARO - Slides nahi chahiye home page pe
        let url = `${API_URL}?endpoint=web-stories&` +
          `filters[moderation_status][$eq]=published` +
          `&filters[language][$eq]=hi` +
          `&populate[thumbnail][populate]=*` +
          `&pagination[limit]=${limit}` +
          `&sort=createdAt:desc`;
        
        // Optional category filter
        if (category) {
          url += `&filters[category][slug][$eq]=${category}`;
        }
        
        const res = await fetch(url, {
          cache: 'no-store'
        });
        
        if (!res.ok) {
          console.error('Web Stories Light API Error:', res.status);
          return { stories: [], pagination: {} };
        }
        
        const json = await res.json();
        
        //  Sirf light fields normalize karo
        const lightStories = (json.data || []).map(item => normalizeWebStory(item));
        
        return {
          stories: lightStories,
          pagination: json.meta?.pagination || {},
        };
      } catch (error) {
        console.error("Error fetching light web stories:", error);
        return { stories: [], pagination: {} };
      }
    },
  async getAll() {
    try {
      //  FIX: URL Structure & String concat with "&" instead of "?"
      const url = `${API_URL}?endpoint=web-stories&` +
        `filters[moderation_status][$eq]=published` +
        `&filters[language][$eq]=hi` + // सिर्फ हिंदी वेब स्टोरीज
        `&populate[thumbnail][populate]=*` +
        `&populate[slides][populate]=image` +
        `&sort=createdAt:desc`;

    

      const res = await fetch(url, {
        cache: 'no-store' // Testing ke liye cache band rakhein
      });

      const json = await res.json();
      console.log("API Response Data Length:", json.data?.length);

      return {
        stories: json.data ? json.data.map(normalizeWebStory) : [],
        pagination: json.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error fetching web stories:", error);
      return { stories: [], pagination: {} };
    }
  },

  async getBySlug(slug) {
    try {
      //  FIX: URL Structure with language filter
      const url = `${API_URL}?endpoint=web-stories&` +
        `filters[slug][$eq]=${slug}` +
        `&filters[language][$eq]=hi` + // सिर्फ हिंदी वेब स्टोरी
        `&populate[thumbnail][populate]=*` +
        `&populate[slides][populate]=*`;

      const res = await fetch(url, {
        next: { revalidate: 60 }
      });

      if (!res.ok) {
        console.error('Web Story API Error:', res.status, res.statusText);
        return null;
      }

      const json = await res.json();
      const item = json.data?.[0];
      return item ? normalizeWebStory(item) : null;
    } catch (error) {
      console.error("Error fetching web story by slug:", error);
      return null;
    }
  },

  // अगर सिर्फ हिंदी स्टोरीज चाहिए तो यह हेल्पर मेथड
  async getHindiStories() {
    return this.getAll(); // getAll पहले से ही हिंदी फिल्टर कर रहा है
  },

  // अगर किसी खास कैटेगरी की हिंदी स्टोरीज चाहिए
  async getByCategory(categorySlug) {
    try {
      const url = `${API_URL}?endpoint=web-stories&` +
        `filters[moderation_status][$eq]=published` +
        `&filters[language][$eq]=hi` +
        `&filters[category][slug][$eq]=${categorySlug}` +
        `&populate[thumbnail][populate]=*` +
        `&populate[slides][populate]=image` +
        `&sort=createdAt:desc`;

      const res = await fetch(url, {
        next: { revalidate: 60 }
      });

      const json = await res.json();
      return {
        stories: json.data ? json.data.map(normalizeWebStory) : [],
        pagination: json.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error fetching web stories by category:", error);
      return { stories: [], pagination: {} };
    }
  },

  // अगर किसी खास यूजर की हिंदी स्टोरीज चाहिए
  async getByAuthor(authorId) {
    try {
      const url = `${API_URL}?endpoint=web-stories&` +
        `filters[moderation_status][$eq]=published` +
        `&filters[language][$eq]=hi` +
        `&filters[author][id][$eq]=${authorId}` +
        `&populate[thumbnail][populate]=*` +
        `&populate[slides][populate]=image` +
        `&sort=createdAt:desc`;

      const res = await fetch(url, {
        next: { revalidate: 60 }
      });

      const json = await res.json();
      return {
        stories: json.data ? json.data.map(normalizeWebStory) : [],
        pagination: json.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error fetching web stories by author:", error);
      return { stories: [], pagination: {} };
    }
  },

  // अगर फ्रंटएंड पर डायनामिक फिल्टर चाहिए
  async getFiltered(filters = {}) {
    try {
      // बेस फिल्टर - हमेशा हिंदी और पब्लिश्ड
      let filterString = `filters[moderation_status][$eq]=published&filters[language][$eq]=hi`;
      
      // अतिरिक्त फिल्टर जोड़ें
      if (filters.category) {
        filterString += `&filters[category][slug][$eq]=${filters.category}`;
      }
      if (filters.author) {
        filterString += `&filters[author][username][$eq]=${filters.author}`;
      }
      if (filters.limit) {
        filterString += `&pagination[limit]=${filters.limit}`;
      }
      if (filters.page) {
        filterString += `&pagination[page]=${filters.page}`;
      }

      const url = `${API_URL}?endpoint=web-stories&${filterString}&populate[thumbnail][populate]=*&populate[slides][populate]=image&sort=createdAt:desc`;

      const res = await fetch(url, {
        next: { revalidate: 60 }
      });

      const json = await res.json();
      return {
        stories: json.data ? json.data.map(normalizeWebStory) : [],
        pagination: json.meta?.pagination || {},
      };
    } catch (error) {
      console.error("Error fetching filtered web stories:", error);
      return { stories: [], pagination: {} };
    }
  }
};


// helper function agar nahi hai toh yahan define kar lo
const getImageUrl = (media) => {
  if (!media) return null;
  const data = media.data?.attributes || media.attributes || media;
  const url = data?.url || null;
  if (!url) return null;
  // Agar URL relative hai (/uploads/...) toh base URL jodo
  return url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_STRAPI_API_URL || 'https://api.entertainindia.com'}${url}`;
};

export const normalizeMovieServer = (movie) => {
  if (!movie) return null;

  try {
    const d = movie.attributes || movie;
    if (!d) return null;

    // Genres handling (Very Important)
    const genresData = d.genres?.data || d.genres || [];
    const normalizedGenres = Array.isArray(genresData)
      ? genresData.map(g => (g.attributes?.name || g.name || g))
      : [];

    return {
      id: movie.id,
      documentId: movie.documentId || d.documentId,
      title: d.title || "Untitled Movie",
      slug: d.slug || "",
      releaseDate: d.releaseDate || null,
      rating: d.rating || 0,
      movieType: d.movieType || d.releaseType || "",

      // Genres (Ab ye khali nahi aayega)
      genres: normalizedGenres,

      // Poster (Safely handling)
      poster: d.poster ? {
        url: getImageUrl(d.poster),
      } : null,

      // Metadata for SEO
      description: d.description || d.synopsis || "",
    };
  } catch (err) {
    console.error("Error in normalizeMovieServer:", err);
    return null; // Taaki sirf ek card khali ho, puri site nahi
  }
};

export const moviesAPIServer = {
  //  1. Get All Movies (with Search, Category, and Filters)
  getAll: async (params = {}) => {
    const q = new URLSearchParams();

    // Basic Pagination & Sort
    q.append('pagination[page]', params.page || 1);
    q.append('pagination[pageSize]', params.pageSize || 12);
    q.append('sort', params.sort || 'releaseDate:desc');
    q.append('populate', '*'); // Default populate

    // 🔍 Search Filter
    if (params.search && params.search.trim().length > 1) {
      q.append('filters[title][$containsi]', params.search.trim());
    }

    // 🎬 Category Filter
    if (params.category) {
      q.append('filters[category][slug][$eq]', params.category);
    }

    // 🎭 Genre Filter
    if (params.genre && params.genre !== 'all') {
      q.append('filters[genres][name][$containsi]', params.genre);
    }

    // 📅 Extra Filters (Year, Rating etc.)
    if (params.filters) {
      if (params.filters.year && params.filters.year !== "All") {
        q.append('filters[releaseDate][$contains]', params.filters.year);
      }
      if (params.filters.rating && params.filters.rating !== "All") {
        q.append('filters[rating][$gte]', Number(params.filters.rating));
      }
    }

    try {
      //  FIX: URL Structure
      const res = await fetch(`${API_URL}?endpoint=movies&${q.toString()}`, {
        next: { revalidate: 60 }, // Cache for 60 seconds
      });

      if (!res.ok) throw new Error("Fetch failed");

      const json = await res.json();
      return {
        movies: (json.data || []).map(normalizeMovieServer),
        pagination: json.meta?.pagination || {},
      };
    } catch (error) {
      console.error("❌ Movies Server fetch error:", error);
      return { movies: [], pagination: {} };
    }
  },

  //  2. Get Single Movie by Slug (with Deep Populate)
  getBySlug: async (slug) => {
    try {
      // Step 1: Get Basic Data to find DocumentID
      const q = new URLSearchParams();
      q.append('filters[slug][$eq]', slug);
      q.append('populate', '*');

      //  FIX: URL Structure
      const res = await fetch(`${API_URL}?endpoint=movies&${q.toString()}`, {
        next: { revalidate: 60 },
      });

      const json = await res.json();
      const item = json.data?.[0];

      if (!item) return null;

      // Step 2: Deep Populate (Cast, Crew, Reviews)
      // Note: Agar aapka Strapi v4/v5 hai toh complex objects ke liye deep fetch zaroori hota hai
      const documentId = item.documentId || item.id;
      
      //  FIX: URL Structure
      const deepRes = await fetch(`${API_URL}?endpoint=movies/${documentId}&populate[cast][populate][celebrities_profile][populate]=*&populate[crewMembers][populate]=*&populate[poster]=*&populate[backdrop]=*&populate[movie_review]=*&populate[similar_movies][populate]=*`, {
        next: { revalidate: 60 },
      });

      const deepJson = await deepRes.json();
      return normalizeMovieServer(deepJson.data || item);
    } catch (err) {
      console.error('❌ Movie Detail server error:', err);
      return null;
    }
  }
};


// Server-side normalization for celebrities
// Server-side normalization

// Aapke api.js se image logic copy kiya gaya hai
const getMediaUrl = (media) => {
  if (!media) return null;
  const data = media.data?.attributes || media.attributes || media;
  const url = data?.url || media.url;

  if (!url) return null;
  return url.startsWith("http") ? url : `${MEDIA_URL}${url}`;
};

export const normalizeCelebrityServer = (celebrity) => {
  if (!celebrity) return null;

  // Strapi v4/v5 Attributes compatibility
  const d = celebrity.attributes || celebrity;

  return {
    id: celebrity.id,
    name: d.name || d.Name || '',
    slug: d.Slug || d.slug || '',
    industry: d.industry || '',
    // Card component expects avatar.url format
    avatar: getMediaUrl(d.Avatar) ? { url: getMediaUrl(d.Avatar) } : null,
    trandingRank: d.trandingRank ?? 0,
    updatedAt: d.updatedAt,
  };
};

export const celebritiesAPIServer = {
  async getAll(params = {}) {
    try {
      const q = new URLSearchParams({
        "pagination[page]": params.page || 1,
        "pagination[pageSize]": params.pageSize || 12,
        "populate": "*", // Explicit populate everything
        "sort": params.sort || "updatedAt:desc",
      });

      // Industry Filter
      if (params.industry && params.industry !== 'all') {
        q.append("filters[industry][$eq]", params.industry);
      }

      //  FIX: URL Structure
      const res = await fetch(`${API_URL}?endpoint=celebrities-profiles&${q.toString()}`, {
        next: { revalidate: 60 } // Cache for 1 minute
      });

      if (!res.ok) {
        console.error("❌ API Response Not OK:", res.status);
        return { celebrities: [], pagination: {} };
      }

      const json = await res.json();
      const data = json?.data || [];
      const pagination = json?.meta?.pagination || {};

      return {
        celebrities: data.map(normalizeCelebrityServer),
        pagination
      };
    } catch (err) {
      console.error("❌ Celebrity Server Fetch Error:", err);
      return { celebrities: [], pagination: {} };
    }
  }
};

const normalizeCategorySEO = (item) => {
  if (!item) return null;

  return {
    id: item.id,
    name: item.name,
    slug: item.slug,
    seo: item.seoinfo ? {
      title: item.seoinfo.seo_title,
      description: item.seoinfo.seo_description,
      keywords: item.seoinfo.seo_keywords,
      h1: item.seoinfo.h1_heading,
      content: item.seoinfo.page_description, // Rich Text Blocks
    } : null
  };
};

export const categoryAPIServer = {
  async getBySlug(slug) {
    try {
      //  FIX: URL Structure
      const url = `${API_URL}?endpoint=categories&filters[slug][$eq]=${slug}&populate[seoinfo]=*`;

      const res = await fetch(url, {
        next: { revalidate: 60 }
      });

      if (!res.ok) {
        console.error('Category API Error:', res.status, res.statusText);
        return null;
      }

      const json = await res.json();
      const item = json.data?.[0];

      return item ? normalizeCategorySEO(item) : null;
    } catch (error) {
      console.error("Error fetching category SEO by slug:", error);
      return null;
    }
  }
};

// Server-side normalization for web series
export const normalizeWebSeriesServer = (webSeries) => {
  if (!webSeries) return null;
  const d = webSeries.attributes || webSeries;
  if (!d) return null;

  const normalizeImageServer = (media) => {
    if (!media) return null;
    const data = media.data?.attributes || media.attributes || media;
    const url = data?.url || media.url;
    if (!url) return null;
    return url.startsWith("http") ? url : `${MEDIA_URL}${url}`;
  };

  return {
    id: webSeries.id,
    documentId: webSeries.documentId || d.documentId,
    title: d.title || "",
    slug: d.slug || "",
    description: d.description || "",
    releaseDate: d.releaseDate || null,
    running_status: d.running_status,
    country: d.country,
    age_rating: d.age_rating,
    seasonNumber: d.seasonNumber,
    year: d.releaseDate ? new Date(d.releaseDate).getFullYear() : (d.year || ""),
language:d.language,
    // Rating
    rating: d.rating ? (d.rating.title || d.rating) : null,

    // Media
    poster: normalizeImageServer(d.poster),
    backdrop_poster: normalizeImageServer(d.backdrop_poster),

    // Categories
    categories: Array.isArray(d.categories?.data || d.categories)
      ? (d.categories.data || d.categories).map(c => {
        const cd = c.attributes || c;
        return { id: c.id, name: cd.name, slug: cd.slug };
      })
      : [],

    // Genres
    genres: Array.isArray(d.genres?.data || d.genres)
      ? (d.genres.data || d.genres).map(g => {
        const gd = g.attributes || g;
        return { id: g.id, name: gd.name, slug: gd.slug };
      })
      : [],
      

    // Languages
    languages: Array.isArray(d.languages)
      ? d.languages.map(l => ({ id: l.id, language: l.language || l.name }))
      : [],

    // Platforms (Crucial for filter)
    watchingPlatform: Array.isArray(d.watchingPlatform)
      ? d.watchingPlatform.map(p => ({
        id: p.id,
        platform: p.platform?.platform || p.platform || "",
        url: p.url
      }))
      : [],
  };
};

export const webSeriesAPIServer = {
  getAll: async (params = {}) => {
    try {
      const q = new URLSearchParams({
        "pagination[page]": params.page || 1,
        "pagination[pageSize]": params.pageSize || 12,
        "sort": params.sort || "releaseDate:desc",
      });
  q.append("filters[language][$eq]", "hi");
      // Populate all fields to ensure we get everything including nested components/relations
      q.append("populate", "*");
      // 🎬 Category Filter
      if (params.category) {
        q.append('filters[categories][slug][$eq]', params.category);
      }

      //  FIX: URL Structure
      const url = `${API_URL}?endpoint=web-series-collections&${q.toString()}`;

      const res = await fetch(url, { next: { revalidate: 60 } });

      if (!res.ok) {
        console.error("❌ Web Series API Error:", res.status);
        return { webSeries: [], pagination: {} };
      }

      const json = await res.json();
      return {
        webSeries: (json.data || []).map(normalizeWebSeriesServer),
        pagination: json.meta?.pagination || {}
      };
    } catch (error) {
      console.error("❌ webSeriesAPIServer.getAll Error:", error);
      return { webSeries: [], pagination: {} };
    }
  }
};