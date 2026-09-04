import { prisma } from '../lib/prisma.js';

// Helper to resolve an order by UUID or TXN- prefix
const findOrderByIdOrTxn = async (txnOrOrderId) => {
  let order = await prisma.order.findUnique({
    where: { id: txnOrOrderId },
    include: {
      user: { select: { fullName: true, username: true } },
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
        user: { select: { fullName: true, username: true } },
        manufacturer: { select: { companyName: true, fullName: true } }
      }
    });
  }

  return order;
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
      select: {
        totalPrice: true,
        mfgPayment: true,
        mfgPaymentStatus: true,
        priceAdjustmentAmount: true,
        priceAdjustmentStatus: true
      }
    });

    let lifetimeEarnings = 0;
    let approvedAdjustmentsTotal = 0;
    let pendingPayouts = 0;
    let paidPayouts = 0;

    orders.forEach(order => {
      const payment = order.mfgPayment || Math.round((order.totalPrice || 100) * 0.6);
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

    res.json({
      walletBalance: paidPayouts,
      lifetimeEarnings,
      approvedAdjustmentsTotal,
      pendingPayouts,
      paidPayouts
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
          select: {
            name: true,
            size: true,
            color: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const earnings = orders.map((order, idx) => {
      const firstItem = order.items?.[0] || {};
      const payment = order.mfgPayment || Math.round((order.totalPrice || 100) * 0.6);
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
      select: {
        totalPrice: true,
        mfgPayment: true,
        mfgPaymentStatus: true
      }
    });

    let grossRevenue = 0;
    let manufactureEarnings = 0;
    let paidToManufacture = 0;
    let pendingPayoutToManufacture = 0;

    orders.forEach(order => {
      const sale = Number(order.totalPrice) || 0;
      const mfgPay = Number(order.mfgPayment) || Math.round(sale * 0.6);

      grossRevenue += sale;
      manufactureEarnings += mfgPay;

      if (order.mfgPaymentStatus === 'Paid') {
        paidToManufacture += mfgPay;
      } else {
        pendingPayoutToManufacture += mfgPay;
      }
    });

    const ourEarnings = Number((grossRevenue - manufactureEarnings).toFixed(2));

    res.json({
      grossRevenue: Number(grossRevenue.toFixed(2)),
      manufactureEarnings: Number(manufactureEarnings.toFixed(2)),
      paidToManufacture: Number(paidToManufacture.toFixed(2)),
      pendingPayoutToManufacture: Number(pendingPayoutToManufacture.toFixed(2)),
      ourEarnings
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
        user: { select: { fullName: true, username: true } },
        manufacturer: { select: { companyName: true, fullName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transactions = orders.map(order => {
      const grossSale = Number(order.totalPrice) || 0;
      const mfgPay = Number(order.mfgPayment) || Math.round(grossSale * 0.6);
      const isAdjusted = Boolean(
        order.priceAdjustmentStatus === 'Approved' ||
        (order.priceAdjustmentAmount && order.priceAdjustmentAmount > 0)
      );

      return {
        id: `TXN-${order.id.slice(0, 8).toUpperCase()}`,
        orderId: order.id,
        customerName: order.user?.fullName || order.user?.username || 'Customer',
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
    const order = await findOrderByIdOrTxn(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Transaction / Order not found' });
    }

    const now = new Date();
    const formattedDate = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    await prisma.order.update({
      where: { id: order.id },
      data: {
        mfgPaymentStatus: 'Paid',
        mfgPaidDate: formattedDate
      }
    });

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

    const currentlyAdjusted = Boolean(
      order.priceAdjustmentStatus === 'Approved' ||
      (order.priceAdjustmentAmount && order.priceAdjustmentAmount > 0)
    );

    const defaultAdj = 300.0;
    let newMfgPayment;
    let newAdjAmount;
    let newStatus;
    let newReason;

    if (currentlyAdjusted) {
      // Toggle off
      const adjToSubtract = order.priceAdjustmentAmount || defaultAdj;
      newMfgPayment = Math.max(0, (order.mfgPayment || 0) - adjToSubtract);
      newAdjAmount = 0;
      newStatus = 'None';
      newReason = null;
    } else {
      // Toggle on
      newMfgPayment = (order.mfgPayment || 0) + defaultAdj;
      newAdjAmount = defaultAdj;
      newStatus = 'Approved';
      newReason = 'Custom Specification Surcharge';
    }

    await prisma.order.update({
      where: { id: order.id },
      data: {
        mfgPayment: newMfgPayment,
        priceAdjustmentAmount: newAdjAmount,
        priceAdjustmentStatus: newStatus,
        priceAdjustmentReason: newReason
      }
    });

    // Return the fresh transactions list
    return getAdminWalletTransactions(req, res);
  } catch (error) {
    console.error('Error toggling transaction adjustment:', error.message);
    res.status(500).json({ success: false, message: 'Failed to toggle transaction adjustment' });
  }
};
