import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import {
  getSettings,
  updateTaxSettings,
  updateStoreSettings
} from '../controllers/settings.controller.js';

const router = express.Router();

router.use(protectRoute);
router.use(adminRoute);

router.get('/', getSettings);
router.put('/tax', updateTaxSettings);
router.put('/store', updateStoreSettings);

export default router;
