/**
 * @BACKEND_TEAM - WISHLIST INTEGRATION:
 * Currently, this Zustand store manages the wishlist entirely in client-side memory.
 * 
 * To switch to a real-time production backend:
 * 1. Add a `fetchWishlist` action that runs on app load (if user is authenticated): `GET /api/wishlist`.
 * 2. `toggleWishlist`: Make an API call based on whether it's being added or removed:
 *    - Add: `POST /api/wishlist` with body `{ productId }`.
 *    - Remove: `DELETE /api/wishlist/:productId`.
 * 3. Update the local state only upon successful API response to prevent desync.
 */
import { create } from 'zustand';

export const useWishlistStore = create((set) => ({
  wishlistItems: [],
  
  toggleWishlist: (product) => set((state) => {
    const isSaved = state.wishlistItems.some(item => item.id === product.id);
    if (isSaved) {
      return { wishlistItems: state.wishlistItems.filter(item => item.id !== product.id) };
    } else {
      return { wishlistItems: [...state.wishlistItems, product] };
    }
  }),
}));
