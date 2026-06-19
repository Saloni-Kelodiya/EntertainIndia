import apiClient from './client';

export const normalizeTags = (tags) => {
  if (!tags) return [];
  const data = tags.data || tags;
  if (!Array.isArray(data)) return [];

  return data.map((tag) => {
    const tData = tag.attributes || tag;
    return {
      id: tag.id,
      name: tData.name,
      slug: tData.slug,
    };
  });
};

export const normalizeTag = (tag) => {
  if (!tag) return null;

  // Strapi v5 format
  const data = tag.attributes || tag;

  return {
    id: tag.id,
    name: data.name || tag.name,
    slug: data.slug || tag.slug,
  };
};

export const tagsAPI = {
  getAll: async () => {
    const res = await apiClient.get('/tags');
    return res.data.data.map(normalizeTag);
  },

  getBySlug: (slug) => {
    return apiClient
      .get(`/tags?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[articles][populate]=*`)
      .then((res) => normalizeTag(res.data.data[0]));
  },
};