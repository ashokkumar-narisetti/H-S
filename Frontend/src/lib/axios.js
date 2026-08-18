import axios from 'axios';

export const axiosInstance = axios.create({
  baseURL: 'http://localhost:5000/api', // Point to our Express backend
  withCredentials: true, // This ensures HTTP-only cookies (like our JWT) are sent with every request
});
