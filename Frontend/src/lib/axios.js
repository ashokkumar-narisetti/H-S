import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api', // Uses Vercel environment variable in production
  withCredentials: true, // This ensures HTTP-only cookies (like our JWT) are sent with every request
});
