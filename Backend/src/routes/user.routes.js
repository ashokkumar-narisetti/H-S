import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { adminRoute } from '../middleware/admin.middleware.js';
import { getUserProfile, updateUserProfile, getAllUsers } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/', protectRoute, adminRoute, getAllUsers);
router.get('/profile', protectRoute, getUserProfile);
router.put('/profile', protectRoute, updateUserProfile);

export default router;
