import axios from 'axios';
import { STRAPI_URL } from './client';

export const notificationsAPI = {
  create: async (notificationData) => {
    try {
      const payload = { data: notificationData };

      const response = await axios.post(
        `${STRAPI_URL}/api/notifications`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      return response.data.data;
    } catch (error) {
      console.error('❌ API Error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      throw error;
    }
  },

  getUserNotifications: async (userId) => {
    try {
      const response = await axios.get(
        `${STRAPI_URL}/api/notifications?filters[recipient][id][$eq]=${userId}&sort[0]=createdAt:desc&populate=*`,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  markAsRead: async (notificationId) => {
    try {
      const response = await axios.put(
        `${STRAPI_URL}/api/notifications/${notificationId}`,
        { data: { isRead: true, state: 'read' } },
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
      return response.data.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },
};