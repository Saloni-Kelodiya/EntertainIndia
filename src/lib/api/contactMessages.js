import apiClient from './client';

export const contactMessagesAPI = {
  submit: (payload) => {
    return apiClient
      .post('/contact-messages', { data: payload })
      .then((res) => res.data.data)
  }
};
