import express from 'express';
import { getUserStats, getGlobalStats } from '../controllers/statsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get current user's statistics
router.get('/user', protect, getUserStats);

// Get global platform statistics (optional)
router.get('/global', getGlobalStats);

export default router;
