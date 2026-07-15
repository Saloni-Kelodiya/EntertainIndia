import apiClient from "./client";
import { normalizeMedia } from "./helper";
import qs from "qs";


function computeUserStats(articles) {
  // Normalize to flat array
  const list = Array.isArray(articles)
    ? articles
    : Array.isArray(articles?.data)
    ? articles.data.map(({ id, attributes }) => ({ id, ...attributes }))
    : [];

  if (list.length === 0) return { articlesCount: 0, totalViews: 0 };

  // Sirf hindi + published + moderated articles count karein
  const filtered = list.filter(a =>
    a.publishedAt != null &&
    a.moderation_status === 'published' &&
    a.language === 'hi'
  );

  const totalViews = filtered.reduce((sum, a) => sum + (Number(a.views) || 0), 0);

  return {
    articlesCount: filtered.length,
    totalViews,
  };
}
export const normalizeUser = (user) => {
  if (!user) return null;

  // Strapi v5 Users are FLAT (no .attributes wrapper)
  const data = user.attributes || user;

  let avatarRaw = null;
  if (data.avatar) {
    if (data.avatar.data?.attributes) avatarRaw = data.avatar.data.attributes;
    else if (data.avatar.attributes)  avatarRaw = data.avatar.attributes;
    else                               avatarRaw = data.avatar;
  }

  const isTeamAccount = (raw = '') => {
    const lower = raw.toLowerCase().replace(/\s/g, '');
    return lower === 'entertainindiateam' || lower === 'entertainindiaofficial';
  };

  const slugify = (str) =>
    str?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') || '';

  const rawName = data.name || data.username || 'Anonymous';
  const rawUsername = data.username || data.name || '';

  return {
    id:         user.id || user.documentId,
    documentId: user.documentId || null,

    name:     isTeamAccount(rawName) ? 'EntertainIndia Team' : rawName,
    username: isTeamAccount(rawUsername) ? 'entertainindiateam' : slugify(rawUsername),

    // Hindi fields (from schema)
    username_hindi: data.username_hindi || null,
    bio_hindi:      data.bio_hindi || null,
    bio:            data.bio || null,

    confirmed:  data.confirmed || false,
    blocked:    data.blocked || false,
    provider:   data.provider || 'local',

    createdAt:   data.createdAt  || user.createdAt,
    updatedAt:   data.updatedAt  || user.updatedAt,
    publishedAt: data.publishedAt || user.publishedAt,

    role: (() => {
      const r = data.role?.name || data.role || 'Author';
      return r.toLowerCase() === 'writer' ? 'Author' : r;
    })(),

    avatar: avatarRaw
      ? normalizeMedia({ attributes: avatarRaw, id: avatarRaw.id })
      : null,

    profileImage: avatarRaw
      ? normalizeMedia({ attributes: avatarRaw }).url
      : null,

    // ─── Stats ────────────────────────────────────────────────────────────
    // Articles directly user.articles se aate hain (populate kiye hain)
    // Filtering: sirf published + moderation_status=published + language=hi
    ...computeUserStats(data.articles),

    socialLinks: data.social_links || null,
  };
};
export const usersAPI = {

  // getAll: avatar + role + articles stats (views sorting ke liye)
  getAll: async (params = {}) => {
    const query = qs.stringify({
      populate: {
        avatar: true,
        role:   true,
        // Sirf 4 fields — full article nahi, sirf stats ke liye
        articles: {
          fields: ['views', 'publishedAt', 'moderation_status', 'language'],
        },
      },
      pagination: { limit: 100 },
      filters: params.username
        ? { username: { $eq: params.username } }
        : undefined,
    }, { encodeValuesOnly: true });

    try {
      const res = await apiClient.get(`/users?${query}`);
      const rawUsers = Array.isArray(res?.data)
        ? res.data
        : (res?.data?.data || []);

      const users = rawUsers.map(normalizeUser);

      return {
        users,
        pagination: res?.data?.meta?.pagination || res?.meta?.pagination || {},
      };
    } catch (error) {
      console.error('[usersAPI.getAll] Error:', error.message);
      return { users: [], pagination: {} };
    }
  },

  // getById: avatar + articles (for SingleUser page stats)
  getById: async (id) => {
    if (!id) return null;
    try {
      const res = await apiClient.get(
        `/users/${id}?populate[avatar]=true&populate[articles][fields][0]=views&populate[articles][fields][1]=publishedAt&populate[articles][fields][2]=moderation_status&populate[articles][fields][3]=language`
      );
      return res?.data ? normalizeUser(res.data) : null;
    } catch (error) {
      console.error('[usersAPI.getById] Error:', error.message);
      return null;
    }
  },

  // getByUsername: username se dhundo, stats ke liye articles bhi populate
  getByUsername: async (username) => {
    if (!username) return null;
    try {
      const query = qs.stringify({
        filters:  { username: { $eq: username } },
        populate: {
          avatar:   true,
          articles: {
            fields: ['views', 'publishedAt', 'moderation_status', 'language'],
          },
        },
      }, { encodeValuesOnly: true });

      const res = await apiClient.get(`/users?${query}`);
      const list = Array.isArray(res?.data) ? res.data : [];

      if (list.length > 0) return normalizeUser(list[0]);

      // Team account fallback
      if (username === 'entertainindiateam') {
        const allRes = await apiClient.get(
          `/users?populate[avatar]=true&pagination[limit]=100`
        );
        const all = Array.isArray(allRes?.data) ? allRes.data : [];
        const team = all.find(u => {
          const lower = (u.username || '').toLowerCase().replace(/\s/g, '');
          return lower === 'entertainindiateam' || lower === 'entertainindiaofficial';
        });
        return team ? normalizeUser(team) : null;
      }

      return null;
    } catch (error) {
      console.error('[usersAPI.getByUsername] Error:', error.message);
      return null;
    }
  },
};