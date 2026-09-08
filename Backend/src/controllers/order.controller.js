import * as orderService from '../services/order.service.js';

// @desc    Create new order (supports direct Admin/Staff order creation & customer checkout)
// @route   POST /api/orders, POST /api/orders/checkout
// @access  Private
export const createOrder = async (req, res) => {
  try {
    const { orderItems, itemName } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not identified',
        data: null,
        errors: ['User not found in session']
      });
    }

    let createdOrder;

    // Case 1: Direct Order Creation (from Admin/Staff/MFG UI modal)
    if (itemName || !Array.isArray(orderItems)) {
      if (!itemName || !itemName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Item name is required for order creation',
          data: null,
          errors: ['Missing itemName']
        });
      }

      createdOrder = await orderService.createDirectOrder(req.body, userId);
    } else {
      // Case 2: Customer Cart Checkout (array of items with product IDs)
      if (orderItems.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No order items provided in checkout',
          data: null,
          errors: ['Empty orderItems array']
        });
      }

      const { shippingAddress, paymentMethod, couponCode } = req.body;
      createdOrder = await orderService.createCheckoutOrder(
        orderItems,
        shippingAddress,
        paymentMethod,
        userId,
        couponCode
      );
    }

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: createdOrder,
      order: createdOrder,
      ...createdOrder
    });
  } catch (error) {
    console.error('Error creating order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error creating order',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Get all orders (Filtered for Admin & Manufacturer portals)
// @route   GET /api/orders
// @access  Private (Admin / Manufacturer)
export const getAllOrders = async (req, res) => {
  try {
    const formattedOrders = await orderService.getOrdersForUser(req.user);

    return res.status(200).json({
      success: true,
      message: 'Orders retrieved successfully',
      count: formattedOrders.length,
      data: formattedOrders,
      orders: formattedOrders
    });
  } catch (error) {
    console.error('Error fetching all orders:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Update order to Shipping
// @route   PUT /api/orders/:id/ship
// @access  Private (Admin / Manufacturer)
export const shipOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { shipperName, trackingId, trackingLink } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    const updated = await orderService.updateShipping(id, {
      shipperName,
      trackingId,
      trackingLink
    });

    return res.status(200).json({
      success: true,
      message: 'Order status updated to Shipping',
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error updating order to shipping:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update order to shipping',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Complete order (Mark as Delivered)
// @route   PATCH /api/orders/:id/complete
// @access  Private (Admin / Manufacturer)
export const completeOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { completedDate } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    const updated = await orderService.completeOrder(id, completedDate);

    return res.status(200).json({
      success: true,
      message: 'Order marked as Delivered/Completed',
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error completing order:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to complete order',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Cancel order directly with reason
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Admin / Manufacturer)
export const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    const updated = await orderService.cancelOrder(id, cancelReason);

    return res.status(200).json({
      success: true,
      message: 'Order cancelled successfully',
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error cancelling order:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to cancel order',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Request price adjustment for order
// @route   POST /api/orders/:id/price-adjustment
// @access  Private (Manufacturer)
export const requestPriceAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { priceAdjustmentAmount, priceAdjustmentReason } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    const updated = await orderService.requestPriceAdjustment(
      id,
      priceAdjustmentAmount,
      priceAdjustmentReason
    );

    return res.status(200).json({
      success: true,
      message: 'Price adjustment request submitted',
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error requesting price adjustment:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit price adjustment',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Respond to price adjustment request (approve / reject)
// @route   PATCH /api/orders/:id/price-adjustment
// @access  Private (Admin)
export const respondToPriceAdjustment = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    if (!action || (action !== 'approve' && action !== 'reject')) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "approve" or "reject"',
        data: null,
        errors: ['Invalid action']
      });
    }

    const updated = await orderService.handlePriceAdjustmentResponse(id, action);

    return res.status(200).json({
      success: true,
      message: `Price adjustment request ${action}ed successfully`,
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error responding to price adjustment:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to price adjustment',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Request order cancellation
// @route   POST /api/orders/:id/cancel-request
// @access  Private (Manufacturer)
export const requestOrderCancellation = async (req, res) => {
  try {
    const { id } = req.params;
    const { cancelReason } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    const updated = await orderService.requestOrderCancellation(id, cancelReason);

    return res.status(200).json({
      success: true,
      message: 'Cancellation request submitted to Admin',
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error requesting cancellation:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to submit cancellation request',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Respond to cancellation request (accept / reject)
// @route   PATCH /api/orders/:id/cancel-request
// @access  Private (Admin)
export const respondToCancelRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    if (!action || (action !== 'accept' && action !== 'reject')) {
      return res.status(400).json({
        success: false,
        message: 'Action must be "accept" or "reject"',
        data: null,
        errors: ['Invalid action']
      });
    }

    const updated = await orderService.handleCancellationResponse(id, action);

    return res.status(200).json({
      success: true,
      message: `Cancellation request ${action}ed`,
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error responding to cancellation request:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to respond to cancellation request',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Update Manufacturer Payment Status (Paid / Unpaid)
// @route   PATCH /api/orders/:id/mfg-payment-status
// @access  Private (Admin)
export const updateMfgPaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { mfgPaymentStatus, mfgPaidDate } = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Order ID is required',
        data: null,
        errors: ['Missing order ID']
      });
    }

    const updated = await orderService.updateMfgPaymentStatus(id, mfgPaymentStatus, mfgPaidDate);

    return res.status(200).json({
      success: true,
      message: `Manufacturer payment status updated to ${mfgPaymentStatus}`,
      data: updated,
      order: updated
    });
  } catch (error) {
    console.error('Error updating manufacturer payment status:', error.message);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to update manufacturer payment status',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Get order by ID (with tracking data)
// @route   GET /api/orders/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found',
        data: null,
        errors: ['Order not found']
      });
    }

    const userRole = (req.user?.role || '').toUpperCase();
    if (userRole === 'MANUFACTURER') {
      if (order.manufacturerId && order.manufacturerId !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: Access denied to orders assigned to another manufacturer',
          code: 'FORBIDDEN'
        });
      }
    } else if (userRole !== 'ADMIN' && userRole !== 'ADMINISTRATOR') {
      if (order.orderedBy !== req.user.id) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You do not have permission to view this order',
          code: 'FORBIDDEN'
        });
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Order retrieved successfully',
      data: order,
      order
    });
  } catch (error) {
    console.error('Error fetching order:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching order',
      data: null,
      errors: [error.message]
    });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await orderService.getOrdersForUser(req.user);
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching orders',
      data: null,
      errors: [error.message]
    });
  }
};
