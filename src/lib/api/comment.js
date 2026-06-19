import apiClient from './client';


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
        // 👈 articleId ko dynamic kiya ($eq]=${articleId})
        `/comments?filters[article][id][$eq]=${articleId}&filters[moderation_status][$eq]=approved&populate=*`
      )
      .then((res) => res.data.data.map(normalizeComment));
  },

  create: (commentData) => {
    // commentData ab upar wala payload receive karega
    return apiClient
      .post('/comments', { data: commentData })
      .then((res) => normalizeComment(res.data.data));
  },
};