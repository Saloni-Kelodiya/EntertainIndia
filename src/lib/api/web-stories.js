import apiClient from './client';
import qs from "qs";


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
    moderationStatus: data.moderation_status || "pending",
    heroText: data.heroText || "",
    seo_title: data.seo_title || data.title,
    seo_description: data.seo_description || data.heroText,
    category: data.category || null,
    trandingRank: data.trandingRank || null,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    publishDate: data.publishDate,
    publishedAt: data.publishedAt,
    trandingRank: data.trandingRank,
     trending:data.trending,
language: data.language, // ✅ language field भी normalize करें
    // ✅ THUMBNAIL
    thumbnail: thumbnailUrl
      ? {
        url: thumbnailUrl.startsWith("http")
          ? thumbnailUrl
          : `${MEDIA_URL}${thumbnailUrl}`,
      }
      : null,

    // ✅ SLIDES (STRAPI v4 SAFE)
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

    // ✅ RELATED WEB STORIES
    relatedStories:
      (data.related_stories?.data || data.related_stories || [])
        .map((item) => {
          if (!item) return null;
          // Simple normalization for nested items to avoid deep recursion issues
          const itemData = item.attributes || item;
          let thumb = null;
          if (itemData.thumbnail) {
            const t = itemData.thumbnail.data?.attributes || itemData.thumbnail;
            thumb = t.url ? { url: t.url.startsWith("http") ? t.url : `${MEDIA_URL}${t.url}` } : null;
          }
          return {
            id: item.id,
            title: itemData.title,
            slug: itemData.slug,
            thumbnail: thumb
          };
        })
        .filter(Boolean),
  };
};

export const webStoriesAPI = {
  async getAll({
    page = 1,
    pageSize = 20,
    sort = 'publishedAt:desc',
  } = {}) {
    try { 
       q.append('filters[language][$eq]', "hi");
       /* ✅ LANGUAGE FILTER - यह सबसे important है */
    if (params.language) {
      q.append("filters[language][$eq]", params.language);
    }
      const res = await apiClient.get(
        `/web-stories`, {
        params: {
          sort,
          pagination: {
            page,
            pageSize,
          },

          filters: {
            // ✅ YE ADD KARNA ZAROORI HAI
            moderation_status: { $eq: "published" },
            publishedAt: { $notNull: true }
          },


          populate: {
            thumbnail: { populate: '*' },
            slides: { populate: 'image' },
          },
        },
      }
      );

      return {
        stories: res.data.data.map(normalizeWebStory),
        meta: res.data.meta,
      };
    } catch (error) {
      return { stories: [], meta: {} };
    }
  },

  async getBySlug(slug) {
    try {
      const query = qs.stringify({
        filters: {
          slug: {
            $eq: slug,
            language: { $eq: "hi" },
            moderation_status: { $eq: "published" }

          }
        },
        populate: {
          thumbnail: { populate: "*" },
          slides: { populate: "*" },
          related_stories: {
            populate: ["thumbnail"],
            filters: { moderation_status: { $eq: "published" } } // ✅ Related bhi published hon

          },

          filters: {
            moderation_status: { $eq: "published" },
            publishedAt: { $notNull: true }
          },
        }
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-stories?${query}`);
      const item = res.data.data?.[0];

      // if (item) {
      //   console.log("Fetched Story Data:", item);
      //   console.log("Related Stories Raw:", item.attributes?.related_stories || item.related_stories);
      // }

      return item ? normalizeWebStory(item) : null;
    } catch (error) {
      console.error("Error fetching web story:", error);
      return null;
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
    return res.data[0]; // Returns the uploaded file object (with id)
  },
  createWebStory: async (storyData, thumbnailFile, slideImages = []) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User not authenticated");

      // 1. Thumbnail Upload
      let thumbnailId = null;
      if (thumbnailFile) {
        const upload = await webStoriesAPI.uploadImage(thumbnailFile);
        thumbnailId = upload.id;
      }

      // 2. Slide Images Upload
      const updatedSlides = await Promise.all(
        storyData.slides.map(async (slide, index) => {
          if (slideImages[index]) {
            const upload = await webStoriesAPI.uploadImage(slideImages[index]);
            return { ...slide, image: upload.id };
          }
          return slide;
        })
      );

      // 3. Final Payload (Draft Fix)
      const payload = {
        data: {
          ...storyData,
          thumbnail: thumbnailId,
          slides: updatedSlides,
          moderation_status: "pending",
          // 🔥 SABSE ZAROORI: Spelling check karein 'publishedAt'
          // Agar aapke Strapi schema mein 'auther' likha hai toh wahi rehne dein
          publishedAt: null,
        },
      };

      const res = await apiClient.post("/web-stories", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return normalizeWebStory(res.data.data);
    } catch (err) {
      console.error("🔥 Web Story Create Error:", err.response?.data || err.message);
      throw err;
    }
  },

  async getMyStories(authorId) {
    try {
      // Robust filter to handle different Strapi versions and relation names
      // Looks for author ID in 'author', 'Author', or 'auther' fields
      const query = qs.stringify({
        filters: {
          $or: [
            { auther: { id: { $eq: authorId } } },
            { auther: { documentId: { $eq: authorId } } }
          ]
        },
        populate: {
          thumbnail: { populate: "*" },
          slides: { populate: "*" }
        },
        sort: ['createdAt:desc']
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/web-stories?${query}`);
      return {
        stories: res.data.data.map(normalizeWebStory),
        meta: res.data.meta
      };
    } catch (error) {
      console.error("Error fetching my stories:", error);
      return { stories: [], meta: {} };
    }
  }


};