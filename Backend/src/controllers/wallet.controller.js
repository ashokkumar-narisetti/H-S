import { prisma } from '../lib/prisma.js';

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
