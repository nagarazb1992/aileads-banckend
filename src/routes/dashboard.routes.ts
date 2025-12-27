import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { getDashboard, getLeadsBySource, getRecentActivity, getUpcomingMeetings } from '../controllers/dashboard.controller.js';

const router = Router();

router.get('/', auth, getDashboard);
router.get("/leads-by-source", auth, getLeadsBySource);
router.get("/upcoming-meetings", auth, getUpcomingMeetings);
router.get("/recent-activity", auth, getRecentActivity);

export default router;
