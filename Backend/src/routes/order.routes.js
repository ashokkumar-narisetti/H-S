import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import {
  getAllOrders,
  createOrder,
  shipOrder,
  completeOrder,
  cancelOrder,
  requestPriceAdjustment,
  requestOrderCancellation,
  getOrderById,
  getMyOrders
} from '../controllers/order.controller.js';

const router = express.Router();

// All order routes require authentication
router.use(protectRoute);

router.get('/', getAllOrders);
router.post('/', createOrder);
router.post('/checkout', createOrder);
router.get('/myorders', getMyOrders);

router.put('/:id/ship', shipOrder);
router.patch('/:id/complete', completeOrder);
router.patch('/:id/cancel', cancelOrder);
router.post('/:id/price-adjustment', requestPriceAdjustment);
router.post('/:id/cancel-request', requestOrderCancellation);

router.get('/:id', getOrderById); // Note: Make sure :id is last so it doesn't catch named routes

export default router;
