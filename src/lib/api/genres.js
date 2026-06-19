import apiClient from './client';
import { getHindiGenreName } from './hindiMaps';

// api.js - Update your GenresAPI
export const normalizeGenres = (genres) => {
  if (!genres || !Array.isArray(genres)) return [];

  return genres.map((genre) => {
    const data = genre.attributes || genre;
    return {
      id: genre.id,
      name: getHindiGenreName(data.name),
      slug: data.slug,
    };
  });
};

export const GenresAPI = {
  getAll: async () => {
    return apiClient
      .get("/genres?pagination[limit]=100") // Fetch all genres
      .then((res) => normalizeGenres(res.data.data));
  },

  getBySlug: async (slug) => {
    return apiClient
      .get(`/genres?filters[slug][$eq]=${encodeURIComponent(slug)}`)
      .then((res) =>
        res.data.data?.[0]
          ? normalizeGenres([res.data.data[0]])[0]
          : null
      );
  },
};

// ✅ GENRE NORMALIZER (simple, no hindi translation)
export const normalizeGenre = (genre) => {
  if (!genre) return null;
  const data = genre.attributes || genre;
  return {
    id: genre.id,
    name: data.name,
    slug: data.slug,
  };
};

// ✅ GENRE API (simple, no hindi translation)
export const genresAPI = {
  getAll: async () => {
    const q = new URLSearchParams({
      'pagination[pageSize]': 100, // ✅ VERY IMPORTANT
      sort: 'name:asc',
    });
    const res = await apiClient.get(`/genres?${q.toString()}`);
    return res.data.data.map(normalizeGenre);
  },
};