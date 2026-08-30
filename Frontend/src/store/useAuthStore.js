import { create } from 'zustand';
import { axiosInstance } from '../lib/axios';
import toast from 'react-hot-toast';

export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  isCheckingAuth: true,
  isLoggingIn: false,
  isSigningUp: false,

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get('/auth/check');
      set({ user: res.data, isAuthenticated: true });
    } catch (error) {
      localStorage.removeItem('hs_auth_token');
      set({ user: null, isAuthenticated: false });
      console.log('Error checking auth', error);
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post('/auth/register', data);
      localStorage.setItem('hs_auth_token', res.data.token);
      set({ user: res.data, isAuthenticated: true });
      toast.success('Account created successfully!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Something went wrong';
      toast.error(msg);
      throw error;
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post('/auth/login', data);
      localStorage.setItem('hs_auth_token', res.data.token);
      set({ user: res.data, isAuthenticated: true });
      toast.success('Welcome back!');
    } catch (error) {
      const msg = error.response?.data?.message || 'Invalid credentials';
      toast.error(msg);
      throw error;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post('/auth/logout');
      localStorage.removeItem('hs_auth_token');
      set({ user: null, isAuthenticated: false });
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Error logging out');
      console.log('Error logging out', error);
    }
  }
}));
