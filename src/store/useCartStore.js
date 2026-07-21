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
