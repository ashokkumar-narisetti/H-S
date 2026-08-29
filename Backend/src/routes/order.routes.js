import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { createOrder, getOrderById, getMyOrders } from '../controllers/order.controller.js';

const router = express.Router();

// All order routes require authentication
router.use(protectRoute);

router.post('/checkout', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById); // Note: Make sure :id is last so it doesn't catch 'myorders'

export default router;
