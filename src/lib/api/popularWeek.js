import apiClient from './client';

const getLast7DaysISO = () => {
  const d = new Date();
  d.setDate(d.getDate() - 7);
  return d.toISOString();
};

// Articles ke liye
export const popularWeekArticleAPI = {
  async getAll(limit = 5) {
    const last7Days = getLast7DaysISO();
    const res = await apiClient.get(
      `/articles?filters[publishedAt][$gte]=${last7Days}&sort=views:desc&pagination[limit]=${limit}&populate=category`
    );
    return res.data?.data || [];
  },
};

// Movies ke liye
export const popularWeekMovieAPI = {
  async getAll(limit = 5) {
    const last7Days = getLast7DaysISO();
    const res = await apiClient.get(
      `/movies?filters[releaseDate][$gte]=2025-12-23T00:00:00.000Z&pagination[limit]=5`
    );
    return res.data?.data || [];
  },
};