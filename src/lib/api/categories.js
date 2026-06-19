import apiClient from './client';

export const normalizeCategory = (category) => {
  if (!category) return null;

  // Handle array of categories
  if (Array.isArray(category)) {
    return category.map(cat => normalizeCategory(cat)).filter(Boolean);
  }

  // Handle single category
  const data = category.attributes || category;
  return {
    id: category.id,
    name: data.name,
    slug: data.slug,
    description: data.description,
  };
};

export const categoriesAPI = {
  getAll: async () => {
    return apiClient.get('/categories').then((res) => res.data.data.map(normalizeCategory));
  },

  getBySlug: (slug) => {
    return apiClient
      .get(`/categories?filters[slug][$eq]=${encodeURIComponent(slug)}`)
      .then((res) => normalizeCategory(res.data.data[0]));
  },
};