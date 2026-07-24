/**
 * @BACKEND_TEAM - CART INTEGRATION:
 * Currently, this Zustand store manages the cart entirely in client-side memory.
 * 
 * To switch to a real-time production backend:
 * 1. `addToCart`: Instead of just updating local state, make an API call:
 *    `POST /api/cart` with body `{ productId, size, quantity }`.
 *    On success, update local state or re-fetch cart.
 * 2. `removeFromCart`: Make an API call:
 *    `DELETE /api/cart/:itemId`.
 * 3. `updateQuantity`: Make an API call:
 *    `PUT /api/cart/:itemId` with body `{ quantity }`.
 * 4. Add a `fetchCart` action that runs on app load (if user is authenticated)
 *    to sync `cartItems` with the server: `GET /api/cart`.
 * 5. Handle guest carts: Either store cart in localStorage and sync upon login,
 *    or use a guest session token attached to API requests.
 */
import { create } from 'zustand';

export const useCartStore = create((set) => ({
  cartItems: [],
  isCartOpen: false,
  
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  openCart: () => set({ isCartOpen: true }),
  closeCart: () => set({ isCartOpen: false }),

  addToCart: (product, size, quantity = 1) => set((state) => {
    const existingItem = state.cartItems.find(
      item => item.id === product.id && item.size === size
    );

    if (existingItem) {
      return {
        cartItems: state.cartItems.map(item => 
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + quantity }
            : item
        ),
        isCartOpen: true
      };
    }

    return { 
      cartItems: [...state.cartItems, { ...product, size, quantity }],
      isCartOpen: true
    };
  }),

  removeFromCart: (productId, size) => set((state) => ({
    cartItems: state.cartItems.filter(
      item => !(item.id === productId && item.size === size)
    )
  })),

  updateQuantity: (productId, size, newQuantity) => set((state) => ({
    cartItems: state.cartItems.map(item =>
      item.id === productId && item.size === size
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    )
  })),
  
  clearCart: () => set({ cartItems: [] }),
}));
