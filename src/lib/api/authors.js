import apiClient from './client';

// NOTE: endpoint naam "authers" hi rakha gaya hai (Strapi collection ka actual naam)
export const authersAPI = {
  getAll: async (params = {}) => {
    const q = new URLSearchParams({
      'pagination[page]': params.page || 1,
      'pagination[pageSize]': params.pageSize || 50,
      populate: '*',
      sort: params.sort || 'createdAt:desc'
    });

    try {
      const res = await apiClient.get(`/authers?${q.toString()}`);
      return res?.data?.data?.map(item => ({
        id: item.id,
        ...(item.attributes || item)
      })) || [];
    } catch (error) {
      return [];
    }
  },

  getBySlug: async (slug) => {
    const q = new URLSearchParams({
      'filters[Slug][$eq]': slug,
      populate: '*'
    });

    try {
      const res = await apiClient.get(`/authers?${q.toString()}`);
      const item = res?.data?.data?.[0];

      if (!item) {
        return null;
      }

      return {
        id: item.id,
        ...(item.attributes || item)
      };
    } catch (error) {
      return null;
    }
  }
};