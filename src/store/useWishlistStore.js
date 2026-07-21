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
