import apiClient from './client';
import qs from "qs";
import { normalizeMedia } from './helper';


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
language: data.language, //  language field भी normalize करें
    fashionCategory: data.fashionCategory || data.category || "PHOTOSHOOTS",
    celebrity_name: data.celebrity_name || data.celebrity || data.artist || "",
    event: data.event || data.Event || data.event_name || data.eventName || "",
    location: data.location || data.Location || data.place || data.Place || "",
    event_date: data.event_date || data.eventDate || data.date || data.Date || "",
    
    //  FIXED FOR YOUR FLAT API STRUCTURE
    image: data.image ? normalizeMedia(data.image) : null,
 categories: Array.isArray(data.categories)
      ? data.categories.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
      }))
      : [],
    //  PHOTOS ARRAY SAFE
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
  //  GET ALL GALLERIES (ONLY HINDI)
  getAll: async (params = {}) => {
    try {
      const q = new URLSearchParams();
      
      // 1.  SORT BY CREATED AT (Latest First)
      // Agar aap chahte hain ki latest publish hui galleries upar aayein toh 'publishedAt:desc' rehne dein
      // Lekin 'createdAt:desc' sabse accurate "Latest First" result deta hai.
      q.append('sort', 'createdAt:desc'); 
      
      //  FORCE ENGLISH LANGUAGE FILTER
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

      //  POPULATE
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
  //  GET BY SLUG (ONLY HINDI)
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

  //  RELATED GALLERIES (ONLY HINDI)
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