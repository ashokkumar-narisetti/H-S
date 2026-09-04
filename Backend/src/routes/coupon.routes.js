import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getCoupons,
  createCoupon,
  toggleCouponStatus,
  deleteCoupon
} from '../controllers/coupon.controller.js';

const router = express.Router();

router.use(protectRoute);
router.use(adminRoute);

router.get('/', getCoupons);
router.post('/', createCoupon);
router.patch('/:id/status', toggleCouponStatus);
router.delete('/:id', deleteCoupon);

export default router;
