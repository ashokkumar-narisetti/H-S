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

const mapDbStatusToUi = (dbStatus) => {
  switch (dbStatus) {
    case 'IN_PROGRESS':
      return 'In Progress';
    case 'SHIPPING':
      return 'Shipping';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELED':
      return 'Cancelled';
    default:
      return dbStatus || 'In Progress';
  }
};

const mapUiStatusToDb = (uiStatus) => {
  switch ((uiStatus || '').toLowerCase()) {
    case 'in progress':
      return 'IN_PROGRESS';
    case 'shipping':
      return 'SHIPPING';
    case 'delivered':
    case 'completed':
      return 'DELIVERED';
    case 'cancelled':
    case 'canceled':
      return 'CANCELED';
    default:
      return 'IN_PROGRESS';
  }
};

const formatOrderForUi = (order) => {
  const firstItem = order.items?.[0] || {};
  const product = firstItem.product || {};
  const user = order.user || {};

  return {
    id: order.id,
    orderedDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    itemName: firstItem.name || 'Athletic Product',
    mfgItemName: product.manufactureName || firstItem.name || 'MFG Athletic Product',
    size: firstItem.size || 'L',
    color: firstItem.color || 'Standard',
    orderedBy: user.id || order.userId || 'USR-1001',
    fullName: user.fullName || 'Customer',
    phone: user.mobile || '+1 555-000-1122',
    country: user.country || 'United States',
    shippingAddress: order.shippingAddress || 'Customer Address',
    amountPaid: order.totalPrice || 0,
    mfgPayment: order.mfgPayment || Math.round((order.totalPrice || 100) * 0.6),
    shipperName: order.shipperName || 'None',
    trackingId: order.trackingNumber || 'None',
    trackingLink: order.trackingLink || 'None',
    status: mapDbStatusToUi(order.status),
    cancelReason: order.cancelReason || '',
    priceAdjustmentStatus: order.priceAdjustmentStatus || 'None',
    priceAdjustmentAmount: order.priceAdjustmentAmount || 0,
    priceAdjustmentReason: order.priceAdjustmentReason || '',
    mfgPaymentStatus: order.mfgPaymentStatus || 'Unpaid',
    mfgPaidDate: order.mfgPaidDate || null,
    completedDate: order.completedDate || null,
    productDetails: {
      mfgProductName: product.manufactureName || product.name || firstItem.name || 'MFG Athletic Item',
      frontViewUrl: product.images?.[0] || product.coverPhoto || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80',
      backViewUrl: product.images?.[1] || product.images?.[0] || 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&auto=format&fit=crop&q=80',
      neckLogoUrl: product.images?.[2] || '',
      printingDetails: product.manufactureSpec || {
        method: 'Direct-to-Film (DTF) Heat Transfer',
        frontPrintSpec: 'High-density chest print (10.5 in x 3.5 in)',
        backPrintSpec: 'Full graphic artwork back print (14 in x 18 in)',
        neckLogoSpec: 'Inner collar neck label 2.5 in x 1.0 in',
        fabricGSM: '240 GSM 100% Ring-Spun Cotton',
        pantoneCodes: '#1A1A1A / Washed Charcoal'
      }
    }
  };
};

// @desc    Get all orders (Formatted for Admin & Manufacturer portals)
// @route   GET /api/orders
// @access  Private (Admin / Manufacturer)
export const getAllOrders = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toUpperCase();
    const whereClause = {};

    // If manufacturer, filter by manufacturerId if set on order or show all non-draft orders
    if (userRole === 'MANUFACTURER' && req.user?.id) {
      // If order has manufacturerId specified, show matching or unassigned orders
      whereClause.OR = [
        { manufacturerId: req.user.id },
        { manufacturerId: null }
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: {
            product: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            mobile: true,
            country: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formattedOrders = orders.map(formatOrderForUi);

    res.json({
      success: true,
      count: formattedOrders.length,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    res.status(500).json({ success: false, message: 'Server error fetching orders' });
  }
};

// @desc    Update order to Shipping
// @route   PUT /api/orders/:id/ship
// @access  Private (Admin / Manufacturer)
export const shipOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipperName, trackingId, trackingLink } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'SHIPPING',
        shipperName: shipperName || 'FedEx Express',
        trackingNumber: trackingId || null,
        trackingLink: trackingLink || null
      }
    });

    res.json({
      success: true,
      message: 'Order status updated to Shipping',
      order: updated
    });
  } catch (error) {
    console.error('Error updating order to shipping:', error.message);
    res.status(500).json({ success: false, message: 'Failed to update order to shipping' });
  }
};

// @desc    Complete order (Mark as Delivered)
// @route   PATCH /api/orders/:id/complete
// @access  Private (Admin / Manufacturer)
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { completedDate } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'DELIVERED',
        completedDate: completedDate || new Date().toISOString().split('T')[0]
      }
    });

    res.json({
      success: true,
      message: 'Order marked as Delivered/Completed',
      order: updated
    });
  } catch (error) {
    console.error('Error completing order:', error.message);
    res.status(500).json({ success: false, message: 'Failed to complete order' });
  }
};

// @desc    Cancel order with reason
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Admin / Manufacturer)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'CANCELED',
        cancelReason: cancelReason || 'Cancelled by Manufacturer'
      }
    });

    res.json({
      success: true,
      message: 'Order cancelled successfully',
      order: updated
    });
  } catch (error) {
    console.error('Error cancelling order:', error.message);
    res.status(500).json({ success: false, message: 'Failed to cancel order' });
  }
};

// @desc    Request price adjustment for order
// @route   POST /api/orders/:id/price-adjustment
// @access  Private (Manufacturer)
export const requestPriceAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { priceAdjustmentAmount, priceAdjustmentReason, priceAdjustmentStatus } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        priceAdjustmentAmount: parseFloat(priceAdjustmentAmount) || 0,
        priceAdjustmentReason: priceAdjustmentReason || '',
        priceAdjustmentStatus: priceAdjustmentStatus || 'Pending Approval'
      }
    });

    res.json({
      success: true,
      message: 'Price adjustment request submitted',
      order: updated
    });
  } catch (error) {
    console.error('Error requesting price adjustment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit price adjustment' });
  }
};

// @desc    Request order cancellation
// @route   POST /api/orders/:id/cancel-request
// @access  Private (Manufacturer)
export const requestOrderCancellation = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    const updated = await prisma.order.update({
      where: { id },
      data: {
        cancelRequested: true,
        cancelReason: cancelReason || 'Manufacturer requested cancellation'
      }
    });

    res.json({
      success: true,
      message: 'Cancellation request submitted to Admin',
      order: updated
    });
  } catch (error) {
    console.error('Error requesting cancellation:', error.message);
    res.status(500).json({ success: false, message: 'Failed to submit cancellation request' });
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
          include: { product: { select: { images: true, manufactureSpec: true, manufactureName: true } } }
        },
        user: { select: { fullName: true, email: true, mobile: true, country: true } }
      }
    });

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const userRole = (req.user?.role || '').toUpperCase();
    if (order.userId !== req.user.id && userRole !== 'ADMIN' && userRole !== 'MANUFACTURER') {
      return res.status(403).json({ message: 'Not authorized to view this order' });
    }

    res.json(formatOrderForUi(order));
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
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(orders);
  } catch (error) {
    console.error('Error fetching user orders:', error);
    res.status(500).json({ message: 'Server error fetching orders' });
  }
};
