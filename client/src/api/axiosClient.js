import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

export const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach token from localStorage if available
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('applytrack_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle session expiration
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 and not an auth check/login request, we can clear token
    if (error.response?.status === 401) {
      const url = error.config?.url || '';
      if (!url.includes('/auth/login') && !url.includes('/auth/register') && !url.includes('/auth/me')) {
        localStorage.removeItem('applytrack_token');
      }
    }
    return Promise.reject(error);
  }
);
