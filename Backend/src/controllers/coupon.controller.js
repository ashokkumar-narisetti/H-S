import { prisma } from '../lib/prisma.js';
import { initCustomTables } from '../services/dbInit.service.js';

// @desc    Get all coupons from database
// @route   GET /api/coupons
// @access  Private/Admin
export const getCoupons = async (req, res) => {
  try {
    await initCustomTables();

    const coupons = await prisma.$queryRawUnsafe(`
      SELECT 
        "id", "code", "type", 
        "discountValue"::float as "discountValue", 
        "discountType", 
        "minSpend"::float as "minSpend", 
        "usageLimit"::int as "usageLimit", 
        "usageCount"::int as "usageCount", 
        "expiryDate", "status",
        TO_CHAR("createdAt", 'YYYY-MM-DD') as "createdAt"
      FROM "Coupon"
      ORDER BY "createdAt" DESC
    `);

    const summary = {
      totalCoupons: coupons.length,
      publicCoupons: coupons.filter(c => c.type === 'Public').length,
      privateCoupons: coupons.filter(c => c.type === 'Private').length,
      activeCoupons: coupons.filter(c => c.status === 'Active').length
    };

    res.json({
      summary,
      coupons
    });
  } catch (error) {
    console.error('Error fetching coupons:', error.message);
    res.status(500).json({ success: false, message: 'Failed to retrieve coupons from database' });
  }
};

// @desc    Create a new coupon in database
// @route   POST /api/coupons
// @access  Private/Admin
export const createCoupon = async (req, res) => {
  try {
    await initCustomTables();

    const {
      code,
      type = 'Public',
      discountValue = 10,
      discountType = 'Percentage',
      minSpend = 0,
      usageLimit = 0,
      expiryDate = '2026-12-31'
    } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const id = `CPN-${Math.floor(100 + Math.random() * 900)}`;

    await prisma.$executeRawUnsafe(`
      INSERT INTO "Coupon" ("id", "code", "type", "discountValue", "discountType", "minSpend", "usageLimit", "usageCount", "expiryDate", "status")
      VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8, 'Active')
    `, id, cleanCode, type, Number(discountValue), discountType, Number(minSpend), Number(usageLimit), expiryDate);

    const created = {
      id,
      code: cleanCode,
      type,
      discountValue: Number(discountValue),
      discountType,
      minSpend: Number(minSpend),
      usageLimit: Number(usageLimit),
      usageCount: 0,
      expiryDate,
      status: 'Active',
      createdAt: new Date().toISOString().split('T')[0]
    };

    res.status(201).json(created);
  } catch (error) {
    console.error('Error creating coupon:', error.message);
    res.status(500).json({ success: false, message: 'Failed to create coupon in database' });
  }
};

// @desc    Toggle or update coupon status
// @route   PATCH /api/coupons/:id/status
// @access  Private/Admin
export const toggleCouponStatus = async (req, res) => {
  try {
    await initCustomTables();
    const { id } = req.params;
    const { status } = req.body;

    const existing = await prisma.$queryRawUnsafe(`SELECT * FROM "Coupon" WHERE "id" = $1`, id);
    if (!existing || existing.length === 0) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    const newStatus = status || (existing[0].status === 'Active' ? 'Disabled' : 'Active');

    await prisma.$executeRawUnsafe(`
      UPDATE "Coupon" SET "status" = $1, "updatedAt" = CURRENT_TIMESTAMP WHERE "id" = $2
    `, newStatus, id);

    res.json({ success: true, message: `Coupon status updated to ${newStatus}`, status: newStatus });
  } catch (error) {
    console.error('Error toggling coupon status:', error.message);
    res.status(500).json({ success: false, message: 'Failed to toggle coupon status' });
  }
};

// @desc    Validate coupon code and return authoritative discount
// @route   POST /api/coupons/validate
// @access  Private (Authenticated users)
export const validateCoupon = async (req, res) => {
  try {
    await initCustomTables();
    const { code, amount = 0 } = req.body;

    if (!code || !code.trim()) {
      return res.status(400).json({ success: false, message: 'Coupon code is required' });
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code: cleanCode } });

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Invalid coupon code' });
    }

    if (coupon.status !== 'Active') {
      return res.status(400).json({ success: false, message: 'This coupon is currently inactive or disabled' });
    }

    if (coupon.expiryDate) {
      const expiry = new Date(coupon.expiryDate);
      expiry.setHours(23, 59, 59, 999);
      if (expiry < new Date()) {
        return res.status(400).json({ success: false, message: 'This coupon has expired' });
      }
    }

    const orderAmt = Number(amount) || 0;
    if (coupon.minSpend > 0 && orderAmt < coupon.minSpend) {
      return res.status(400).json({
        success: false,
        message: `Minimum spend of ₹${coupon.minSpend.toLocaleString('en-IN')} required to apply this coupon`
      });
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ success: false, message: 'Coupon usage limit has been reached' });
    }

    let discount = 0;
    if (coupon.discountType === 'Percentage') {
      discount = (orderAmt * coupon.discountValue) / 100;
    } else {
      discount = Math.min(orderAmt, coupon.discountValue);
    }

    return res.status(200).json({
      success: true,
      message: 'Coupon is valid and applied',
      data: {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount: Number(discount.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error validating coupon:', error.message);
    res.status(500).json({ success: false, message: 'Server error validating coupon' });
  }
};

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private/Admin
export const deleteCoupon = async (req, res) => {
  try {
    await initCustomTables();
    const { id } = req.params;

    await prisma.$executeRawUnsafe(`DELETE FROM "Coupon" WHERE "id" = $1`, id);
    res.json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete coupon' });
  }
};


