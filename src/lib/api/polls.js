import apiClient from './client';
import { API_URL } from '../constants';

export async function voteMovie(movieId, token) {
  const res = await fetch(`${API_URL}/poll-votes`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : undefined,
    },
    body: JSON.stringify({
      data: {
        movie: movieId,
      },
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error?.message || "Vote failed");
  }

  return data;
}

export const pollAPI = {
  async vote(movieId) {
    const token = localStorage.getItem("token");
    return apiClient.post(
      "/poll-votes",
      { data: { movie: movieId } },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
  },

  async results() {
    const token = localStorage.getItem("token");
    const res = await apiClient.get("/poll-votes?populate=movie", {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return res.data?.data || [];
  },

  async myVote() {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const res = await apiClient.get("/poll-votes?populate=movie", {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.data?.data?.[0] || null;
  },
};