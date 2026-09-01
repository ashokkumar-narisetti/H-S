import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getMfgWalletMetrics, getMfgWalletEarnings } from '../controllers/wallet.controller.js';

const router = express.Router();

// All wallet routes require authentication
router.use(protectRoute);

router.get('/mfg/metrics', getMfgWalletMetrics);
router.get('/mfg/earnings', getMfgWalletEarnings);

export default router;
