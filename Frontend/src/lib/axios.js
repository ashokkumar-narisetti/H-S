import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Uses Vercel environment variable in production
  withCredentials: true, // This ensures HTTP-only cookies (like our JWT) are sent with every request
});

// Add a request interceptor to attach the token from sessionStorage (fixes cross-domain third-party cookie blocking)
axiosInstance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('hs_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});
