import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Creates a base axios instance configured for our API
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to inject the Access Token into every request
api.interceptors.request.use(
  (config) => {
    const { accessToken } = useAuthStore.getState();
    if (accessToken && accessToken !== 'mock' && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor to handle specific global responses (like 401 Unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.includes('/auth/login')) {
      // Token expired or invalid -> Force logout (only if NOT trying to login)
      useAuthStore.getState().logout();
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);
