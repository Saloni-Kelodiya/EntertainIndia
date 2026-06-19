import apiClient from './client';

export const normalizeMusicGenres = (genres) => {
  if (!genres || !Array.isArray(genres)) return [];

  return genres.map((genre) => {
    const data = genre.attributes || genre;
    return {
      id: genre.id,
      name: data.name,
      slug: data.slug,
    };
  });
};

export const MusicGenresAPI = {
  getAll: async () => {
    return apiClient
      .get("/music-genres")
      .then((res) => normalizeMusicGenres(res.data.data));
  },

  getBySlug: async (slug) => {
    return apiClient
      .get(`/music-genres?filters[slug][$eq]=${encodeURIComponent(slug)}`)
      .then((res) =>
        res.data.data?.[0]
          ? normalizeMusicGenres([res.data.data[0]])[0]
          : null
      );
  },
};