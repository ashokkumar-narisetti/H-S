import { create } from 'zustand';

/**
 * @BACKEND_TEAM - AUTHENTICATION INTEGRATION:
 * 
 * This is a mock authentication store for the frontend MVP.
 * 
 * To integrate with the real backend:
 * 1. `login(token, userData)`: Update this method to store the JWT (e.g., in localStorage or cookies) 
 *    and set `isAuthenticated: true`.
 * 2. `logout()`: Clear the JWT and reset state.
 * 3. `checkAuth()`: Create a method that runs on app initialization to check if a valid token exists
 *    and fetch the user's profile to populate `user`.
 */
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  user: null,
  login: (userData) => set({ isAuthenticated: true, user: userData || { name: 'Mock User' } }),
  logout: () => set({ isAuthenticated: false, user: null }),
}));
