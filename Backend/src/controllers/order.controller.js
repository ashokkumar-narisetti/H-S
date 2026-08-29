import { prisma } from '../lib/prisma.js';

/**
 * @TEAMMATE_NOTE: PAYMENT GATEWAY INTEGRATION
 * Currently, this checkout function bypasses the payment gateway for frontend testing.
 * It simulates a successful COD/Test order.
 * 
 * TODO FOR PAYMENT INTEGRATION:
 * 1. Initialize Stripe/Razorpay SDK at the top of this file.
 * 2. In `createOrder`, receive the `paymentToken` from `req.body`.
 * 3. Charge the token using `stripe.charges.create()` or `razorpay.orders.create()`.
 * 4. If the charge fails, return a 400 error immediately BEFORE creating the Prisma Order.
 * 5. If the charge succeeds, save the `transactionId` into the Prisma Order and set `paymentStatus` to 'SUCCESSFUL'.
 */

// @desc    Create new order (Bypass Payment Mode)
// @route   POST /api/orders/checkout
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;
    const userId = req.user.id;

    if (!orderItems || orderItems.length === 0) {
      return res.status(400).json({ message: 'No order items provided' });
    }

    // 1. Calculate prices securely on the backend
    let itemsPrice = 0;
    const itemsToCreate = [];

    for (const item of orderItems) {
      const product = await prisma.product.findUnique({ where: { id: item.productId } });
      if (!product) {
        return res.status(404).json({ message: `Product ${item.name} not found` });
      }

      const itemTotal = product.price * item.quantity;
      itemsPrice += itemTotal;

      itemsToCreate.push({
        productId: product.id,
        name: product.name,
        size: item.size,
        color: item.color || null,
        quantity: item.quantity,
        price: product.price // Freeze price
      });
    }

    const taxPrice = itemsPrice > 2500 ? itemsPrice * 0.18 : itemsPrice * 0.05;
    const shippingPrice = itemsPrice > 150 ? 0 : 10;
    const totalPrice = itemsPrice + taxPrice + shippingPrice;

    // 2. Mock Payment Processing would happen here (see Teammate Note above)
    const paymentStatus = paymentMethod === 'COD' ? 'PENDING' : 'SUCCESSFUL';

    // 3. Create the order in the database
    const order = await prisma.order.create({
      data: {
        userId,
        shippingAddress: typeof shippingAddress === 'string' ? shippingAddress : JSON.stringify(shippingAddress),
        taxPrice,
        shippingPrice,
        totalPrice,
        paymentStatus,
        status: 'IN_PROGRESS',
        items: {
          create: itemsToCreate
        }
      }
    });

    res.status(201).json(order);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Server error creating order' });
  }
};

// @desc    Get order by ID (with tracking data)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: { product: { select: { images: true } } }
        },
        user: { select: { fullName: true, email: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if the order belongs to the user (or if admin)
    if (order.userId !== req.user.id && req.user.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ message: 'Server error fetching order' });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};
