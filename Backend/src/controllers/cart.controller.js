import { prisma } from '../lib/prisma.js';

// Helper to get or create a cart for a user
const getOrCreateCart = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } }
    });
  }
  return cart;
};

// @desc    Get user cart
// @route   GET /api/cart
// @access  Private
export const getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private
export const addToCart = async (req, res) => {
  try {
    const { productId, size, color, quantity } = req.body;
    
    // Ensure product exists
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const cart = await getOrCreateCart(req.user.id);

    // Check if item already exists in cart with same size/color
    const existingItem = cart.items.find(
      (item) => item.productId === productId && item.size === size && item.color === color
    );

    if (existingItem) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      // Add new item
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          size,
          color,
          quantity
        }
      });
    }

    // Fetch and return updated cart
    const updatedCart = await getOrCreateCart(req.user.id);
    res.status(201).json(updatedCart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update cart item quantity
// @route   PUT /api/cart/:itemId
// @access  Private
export const updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    // Verify item belongs to user's cart
    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.update({
      where: { id: itemId },
      data: { quantity: Math.max(1, quantity) }
    });

    const updatedCart = await getOrCreateCart(req.user.id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Remove item from cart
// @route   DELETE /api/cart/:itemId
// @access  Private
export const removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;

    const cartItem = await prisma.cartItem.findUnique({
      where: { id: itemId },
      include: { cart: true }
    });

    if (!cartItem || cartItem.cart.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({
      where: { id: itemId }
    });

    const updatedCart = await getOrCreateCart(req.user.id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error removing cart item:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Clear entire cart
// @route   DELETE /api/cart
// @access  Private
export const clearCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user.id } });
    if (cart) {
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id }
      });
    }
    const updatedCart = await getOrCreateCart(req.user.id);
    res.json(updatedCart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
