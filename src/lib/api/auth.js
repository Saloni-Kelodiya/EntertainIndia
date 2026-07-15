
import apiClient from './client';
import qs from "qs";
export const globalSearch = async (query) => {
  if (!query) return null;

  // Hamara proxy path:
  const res = await fetch(`/api/data?endpoint=search&q=${encodeURIComponent(query)}`);

  if (!res.ok) throw new Error("Search failed");
  return res.json();
};

export const normalizeComment = (comment) => {
  if (!comment) return null;
  const data = comment.attributes || comment;
  return {
    id: comment.id,
    userName: data.user_name,
    message: data.message,
    moderationStatus: data.moderation_status,
    createdAt: data.createdAt,
  };
};

export const commentsAPI = {
  getByArticle: (articleId) => {
    return apiClient
      .get(
        `/comments?filters[article][id][$eq]=${articleId}&filters[moderation_status][$eq]=approved&populate=*`
      )
      .then((res) => res.data.data.map(normalizeComment));
  },

  create: (commentData) => {
    return apiClient
      .post('/comments', { data: commentData })
      .then((res) => normalizeComment(res.data.data));
  },
};

export const authAPI = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/local', credentials);
    const { jwt, user: userData } = res.data;

    try {
      const fullUserRes = await apiClient.get(`/users/${userData.id}`, {
        params: {
          populate: ['avatar', 'role']
        },
        headers: { Authorization: `Bearer ${jwt}` }
      });

      const finalUser = fullUserRes.data;
      return {
        user: finalUser,
        jwt: jwt
      };

    } catch (err) {
      console.error("Profile fetch error", err);
      return { user: userData, jwt: jwt };
    }
  },

  register: async (userData) => {
    const res = await apiClient.post('/auth/local/register', userData);
    return res.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  resetPassword: async (email) => {
    const res = await apiClient.post('/auth/forgot-password', { email });
    return res.data;
  },

  updateProfile: async (userId, updatedData) => {
    const token = localStorage.getItem("token");

    const res = await apiClient.put(
      `/users/${userId}`,
      updatedData,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const freshUser = await apiClient.get(`/users/${userId}?populate=avatar`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    localStorage.setItem("user", JSON.stringify(freshUser.data));

    return freshUser.data;
  },

  getMe: async () => {
    const token = localStorage.getItem("authToken");
    const res = await apiClient.get(`/users/me?populate=avatar`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  },

  updateAvatar: async (userId, file) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User not authenticated");
    const baseUrl = process.env.STRAPI_BACKEND_URL || "https://admin.entertainindia.com/";

    const formData = new FormData();
    formData.append("files", file);

    const uploadRes = await apiClient.post("/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        Authorization: `Bearer ${token}`,
      },
    });

    const uploadedFileId = uploadRes.data[0].id;

    await apiClient.put(
      `/users/${userId}`,
      { avatar: uploadedFileId },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const fullProfileRes = await fetch(`${baseUrl}/api/users/me?populate[role]=true&populate[avatar][populate]=*`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!fullProfileRes.ok) throw new Error("Profile refresh failed after avatar update");

    const fullUser = await fullProfileRes.json();

    localStorage.setItem("user", JSON.stringify(fullUser));

    return fullUser;
  },

  syncProfile: async (userId) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Authentication token not found.");

    const res = await apiClient.get(`/users/${userId}`, {
      params: {
        populate: ['avatar', 'role']
      },
      headers: { Authorization: `Bearer ${token}` }
    });

    localStorage.setItem("user", JSON.stringify(res.data));
    return res.data;
  },

  requestAuthorRole: async (userData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("You are not authenticated");

    const res = await apiClient.post('/author-requests',
      {
        data: {
          username: userData.username,
          email: userData.email,
          request_status: "pending",
          applicant: userData.id,
        }
      },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data;
  },

  checkMyRequest: async (userId) => {
    if (!userId) {
      return null;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      return null;
    }

    try {
      const res = await apiClient.get('/author-requests', {
        params: {
          'filters[applicant][id][$eq]': userId,
          'sort': 'createdAt:desc',
          'pagination[limit]': 1
        },
        headers: { Authorization: `Bearer ${token}` }
      });
      return res.data;
    } catch (error) {
      console.error("checkMyRequest me error:", error.response?.data || error.message);
      return null;
    }
  },
};
