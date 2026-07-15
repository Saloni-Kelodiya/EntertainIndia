import axios from 'axios';
import { API_URL } from '../constants';

export const STRAPI_URL = process.env.STRAPI_BACKEND_URL || "http://13.201.143.7:1337";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    //  Cache control headers
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  },
  //  Important: Disable caching
  withCredentials: false, // Set to true if you need cookies
});

export const PUBLIC_ENDPOINTS = [
  '/articles',
  '/categories',
  '/tags',
  '/videos',
  '/photos',
  '/comments',
  '/privacy-policy',
  '/terms-of-service',
  '/web-stories',
  "/web-series",
  '/authers',
  '/movies',
  '/celebrities-profiles',
  '/movie-reviews',
  '/web-series-reviews',
  '/genres',
  '/awards',
  '/reviews',
  '/shows-reviews',
];

// 1) Endpoint name ko query param mein convert karne wala interceptor
apiClient.interceptors.request.use((config) => {
  if (config.url && !config.url.startsWith('http')) {
    const endpointName = config.url.replace(/^\//, '');
    config.params = {
      ...config.params,
      endpoint: endpointName
    };
    config.url = '';
  }
  return config;
});

// 2) 401/403 errors ko handle karne wala interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // ignore
    }
    return Promise.reject(error);
  }
);

// 3) Auth token auto-attach karne wala interceptor
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
export default apiClient;