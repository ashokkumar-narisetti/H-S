import { prisma } from '../lib/prisma.js';

// Helper to resolve an order by UUID or TXN- prefix
const findOrderByIdOrTxn = async (txnOrOrderId) => {
  let order = await prisma.order.findUnique({
    where: { id: txnOrOrderId },
    include: {
      user: { select: { fullName: true, email: true } },
      manufacturer: { select: { companyName: true, fullName: true } }
    }
  });

  if (!order && txnOrOrderId.startsWith('TXN-')) {
    const rawIdPrefix = txnOrOrderId.replace('TXN-', '').toLowerCase();
    order = await prisma.order.findFirst({
      where: {
        id: { startsWith: rawIdPrefix, mode: 'insensitive' }
      },
      include: {
        user: { select: { fullName: true, email: true } },
        manufacturer: { select: { companyName: true, fullName: true } }
      }
    });
  }

  return order;
};

// Helper to compute accurate mfg payment from order record or catalog manufacturePrice
const computeOrderMfgPayment = (order) => {
  if (typeof order.mfgPayment === 'number' && order.mfgPayment > 0) {
    return order.mfgPayment;
  }
  if (Array.isArray(order.items) && order.items.length > 0) {
    let computed = 0;
    for (const it of order.items) {
      const unitMfg = (typeof it.product?.manufacturePrice === 'number' && it.product.manufacturePrice > 0)
        ? it.product.manufacturePrice
        : Math.round((it.price || it.product?.price || 0) * 0.6);
      computed += unitMfg * (it.quantity || 1);
    }
    if (computed > 0) return computed;
  }
  return Math.round((Number(order.totalPrice) || 100) * 0.6);
};

// ==========================================
// MANUFACTURER WALLET ENDPOINTS
// ==========================================

// @desc    Get Manufacturer Wallet Metrics
// @route   GET /api/wallet/mfg/metrics
// @access  Private (Manufacturer / Admin)
export const getMfgWalletMetrics = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toUpperCase();
    const whereClause = {};

    if (userRole === 'MANUFACTURER' && req.user?.id) {
      whereClause.OR = [
        { manufacturerId: req.user.id },
        { manufacturerId: null }
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    let lifetimeEarnings = 0;
    let approvedAdjustmentsTotal = 0;
    let pendingPayouts = 0;
    let paidPayouts = 0;

    orders.forEach(order => {
      const payment = computeOrderMfgPayment(order);
      lifetimeEarnings += payment;

      if (order.priceAdjustmentStatus === 'Approved' && order.priceAdjustmentAmount) {
        approvedAdjustmentsTotal += order.priceAdjustmentAmount;
      }

      if (order.mfgPaymentStatus === 'Paid') {
        paidPayouts += payment;
      } else {
        pendingPayouts += payment;
      }
    });

    const metricsData = {
      walletBalance: Number(paidPayouts.toFixed(2)),
      lifetimeEarnings: Number(lifetimeEarnings.toFixed(2)),
      approvedAdjustmentsTotal: Number(approvedAdjustmentsTotal.toFixed(2)),
      pendingPayouts: Number(pendingPayouts.toFixed(2)),
      paidPayouts: Number(paidPayouts.toFixed(2))
    };

    res.json({
      success: true,
      message: 'Manufacturer wallet metrics retrieved successfully',
      data: metricsData,
      ...metricsData
    });
  } catch (error) {
    console.error('Error computing mfg wallet metrics:', error.message);
    res.status(500).json({ success: false, message: 'Failed to compute wallet metrics' });
  }
};

// @desc    Get Manufacturer Earning Records (Wallet Table)
// @route   GET /api/wallet/mfg/earnings
// @access  Private (Manufacturer / Admin)
export const getMfgWalletEarnings = async (req, res) => {
  try {
    const userRole = (req.user?.role || '').toUpperCase();
    const whereClause = {};

    if (userRole === 'MANUFACTURER' && req.user?.id) {
      whereClause.OR = [
        { manufacturerId: req.user.id },
        { manufacturerId: null }
      ];
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const earnings = orders.map((order, idx) => {
      const firstItem = order.items?.[0] || {};
      const payment = computeOrderMfgPayment(order);
      const isAdjusted = Boolean(order.priceAdjustmentAmount && order.priceAdjustmentAmount > 0);

      return {
        id: `REC-${100 + idx + 1}`,
        orderId: order.id,
        orderedDate: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        itemName: firstItem.name || 'Athletic Wear',
        size: firstItem.size || 'L',
        color: firstItem.color || 'Default',
        manufacturerPayment: payment,
        isAdjusted,
        adjustmentAmount: order.priceAdjustmentAmount || 0,
        paymentStatus: order.mfgPaymentStatus === 'Paid' ? 'Paid' : 'Not Paid',
        paidDate: order.mfgPaidDate || null
      };
    });

    res.json(earnings);
  } catch (error) {
    console.error('Error fetching mfg earnings:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch earning records' });
  }
};

// ==========================================
// ADMIN WALLET ENDPOINTS (DATABASE BACKED)
// ==========================================

// @desc    Get Admin Wallet Financial Metrics
// @route   GET /api/wallet/admin/metrics
// @access  Private/Admin
export const getAdminWalletMetrics = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        }
      }
    });

    let grossRevenue = 0;
    let manufactureEarnings = 0;
    let paidToManufacture = 0;
    let pendingPayoutToManufacture = 0;

    orders.forEach(order => {
      const sale = Number(order.totalPrice) || 0;
      const mfgPay = computeOrderMfgPayment(order);

      grossRevenue += sale;
      manufactureEarnings += mfgPay;

      if (order.mfgPaymentStatus === 'Paid') {
        paidToManufacture += mfgPay;
      } else {
        pendingPayoutToManufacture += mfgPay;
      }
    });

    const ourEarnings = Number((grossRevenue - manufactureEarnings).toFixed(2));

    const metricsData = {
      grossRevenue: Number(grossRevenue.toFixed(2)),
      manufactureEarnings: Number(manufactureEarnings.toFixed(2)),
      paidToManufacture: Number(paidToManufacture.toFixed(2)),
      pendingPayoutToManufacture: Number(pendingPayoutToManufacture.toFixed(2)),
      ourEarnings
    };

    res.json({
      success: true,
      message: 'Admin wallet metrics retrieved successfully',
      data: metricsData,
      ...metricsData
    });
  } catch (error) {
    console.error('Error computing admin wallet metrics:', error.message);
    res.status(500).json({ success: false, message: 'Failed to compute admin wallet metrics' });
  }
};

// @desc    Get Admin Wallet Transactions (Ledger)
// @route   GET /api/wallet/admin/transactions
// @access  Private/Admin
export const getAdminWalletTransactions = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: { product: true }
        },
        user: { select: { fullName: true, email: true } },
        manufacturer: { select: { companyName: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transactions = orders.map(order => {
      const grossSale = Number(order.totalPrice) || 0;
      const mfgPay = computeOrderMfgPayment(order);
      const isAdjusted = Boolean(
        order.priceAdjustmentStatus === 'Approved' ||
        (order.priceAdjustmentAmount && order.priceAdjustmentAmount > 0)
      );

      return {
        id: `TXN-${order.id.slice(0, 8).toUpperCase()}`,
        orderId: order.id,
        customerName: order.user?.fullName || order.user?.email || 'Customer',
        manufacturerName: order.manufacturer?.companyName || order.manufacturer?.fullName || 'Unassigned',
        grossSaleValue: grossSale,
        manufacturerPayment: mfgPay,
        isAdjusted,
        adjustmentAmount: order.priceAdjustmentAmount || 0,
        adjustmentReason: order.priceAdjustmentReason || (isAdjusted ? 'Custom Specification Surcharge' : undefined),
        paymentStatus: order.mfgPaymentStatus === 'Paid' ? 'Paid' : 'Not Paid',
        paidDate: order.mfgPaidDate || null,
        ourEarnings: Number((grossSale - mfgPay).toFixed(2)),
        notes: order.mfgPaymentStatus === 'Paid' ? `Payout marked as Paid on ${order.mfgPaidDate || 'Recently'}` : undefined
      };
    });

    res.json(transactions);
  } catch (error) {
    console.error('Error fetching admin wallet transactions:', error.message);
    res.status(500).json({ success: false, message: 'Failed to fetch admin wallet transactions' });
  }
};

// @desc    Mark Transaction Payout as Paid
// @route   POST /api/wallet/admin/transactions/:id/pay
// @access  Private/Admin
export const markAdminTransactionPaid = async (req, res) => {
  try {
    const targetId = req.params?.id || req.body?.txnId || req.body?.id;
    if (!targetId) {
      return res.status(400).json({ success: false, message: 'Transaction ID is required' });
    }

    const order = await findOrderByIdOrTxn(targetId);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Transaction / Order not found' });
    }

    // Financial Safety Guard: Cannot payout cancelled order
    if (order.status === 'CANCELED') {
      return res.status(400).json({
        success: false,
        message: `Cannot process payout for cancelled order ${order.id}.`
      });
    }

    // Financial Safety Guard: duplicate payout rejection
    if (order.mfgPaymentStatus === 'Paid') {
      return res.status(400).json({
        success: false,
        message: `Transaction ${order.id} is already marked as Paid. Duplicate payout rejected.`
      });
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    // Atomic conditional update in PostgreSQL to eliminate payout race conditions
    const updateResult = await prisma.order.updateMany({
      where: {
        id: order.id,
        mfgPaymentStatus: { not: 'Paid' },
        status: { not: 'CANCELED' }
      },
      data: {
        mfgPaymentStatus: 'Paid',
        mfgPaidDate: formattedDate
      }
    });

    if (updateResult.count === 0) {
      return res.status(400).json({
        success: false,
        message: `Transaction ${order.id} is already marked as Paid or was cancelled. Duplicate payout rejected.`
      });
    }

    // Return updated transactions list for UI, or structured response if requested
    if (req.query?.format === 'item' || req.body?.format === 'item') {
      return res.status(200).json({
        success: true,
        message: 'Payout marked as Paid successfully',
        data: { id: order.id, mfgPaymentStatus: 'Paid', mfgPaidDate: formattedDate }
      });
    }

    // Return the fresh transactions list
    return getAdminWalletTransactions(req, res);
  } catch (error) {
    console.error('Error marking transaction as paid:', error.message);
    res.status(500).json({ success: false, message: 'Failed to mark transaction as paid' });
  }
};

// @desc    Toggle Price Adjustment for Transaction
// @route   POST /api/wallet/admin/transactions/:id/toggle-adjustment
// @access  Private/Admin
export const toggleAdminTransactionAdjustment = async (req, res) => {
  try {
    const order = await findOrderByIdOrTxn(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Transaction / Order not found' });
    }

    await prisma.$transaction(async (tx) => {
      const current = await tx.order.findUnique({ where: { id: order.id } });
      if (!current) {
        throw new Error('Order not found');
      }

      const currentlyAdjusted = Boolean(
        current.priceAdjustmentStatus === 'Approved' ||
        (current.priceAdjustmentAmount && current.priceAdjustmentAmount > 0)
      );

      const defaultAdj = 300.0;
      let newMfgPayment;
      let newAdjAmount;
      let newStatus;
      let newReason;

      if (currentlyAdjusted) {
        // Toggle off
        const adjToSubtract = current.priceAdjustmentAmount || defaultAdj;
        newMfgPayment = Math.max(0, (current.mfgPayment || 0) - adjToSubtract);
        newAdjAmount = 0;
        newStatus = 'None';
        newReason = null;
      } else {
        // Toggle on
        newMfgPayment = (current.mfgPayment || 0) + defaultAdj;
        newAdjAmount = defaultAdj;
        newStatus = 'Approved';
        newReason = 'Custom Specification Surcharge';
      }

      return await tx.order.update({
        where: { id: current.id },
        data: {
          mfgPayment: newMfgPayment,
          priceAdjustmentAmount: newAdjAmount,
          priceAdjustmentStatus: newStatus,
          priceAdjustmentReason: newReason
        }
      });
    });

    // Return the fresh transactions list
    return getAdminWalletTransactions(req, res);
  } catch (error) {
    console.error('Error toggling transaction adjustment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to toggle transaction adjustment' });
  }
};
