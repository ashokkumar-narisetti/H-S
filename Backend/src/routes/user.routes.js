import express from 'express';
import { protectRoute } from '../middleware/auth.middleware.js';
import { getUserProfile, updateUserProfile } from '../controllers/user.controller.js';

const router = express.Router();

router.get('/profile', protectRoute, getUserProfile);
router.put('/profile', protectRoute, updateUserProfile);

export default router;
