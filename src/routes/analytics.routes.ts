import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { auth } from '../middleware/auth.js';

const router = Router();

router.get('/overview', auth, analyticsController.getAnalyticsOverview);
router.get('/reply-rates-by-day', auth, analyticsController.getReplyRatesByDay);
router.get('/revenue-attribution', auth, analyticsController.getRevenueAttribution);

export default router;
