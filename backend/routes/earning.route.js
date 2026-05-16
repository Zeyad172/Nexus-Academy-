import { Router } from 'express';
import { getEarnings, getEarningsAnalytics } from '../controllers/earning.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/', authenticate, authorize('instructor', 'admin'), getEarnings);
router.get('/analytics', authenticate, authorize('instructor', 'admin'), getEarningsAnalytics);

export default router;
