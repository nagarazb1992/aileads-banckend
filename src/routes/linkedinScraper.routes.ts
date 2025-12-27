import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { paidGuard } from '../middleware/paidGuard.js';
import { creditGuard } from '../middleware/creditGuard.js';
import { estimateCredits, getScrapeResults, getScrapeStatus, startLinkedInScrape } from '../controllers/linkedinScrape.controller.js';

const router = Router();

router.post(
  '/estimate',
  auth,
  paidGuard,
  estimateCredits
);

router.post(
  '/start',
  auth,
  paidGuard,
  creditGuard({ cost: 1, reason: 'linkedin_scrape' }),
  startLinkedInScrape
);

router.get(
  '/status/:jobId',
  auth,
  getScrapeStatus
);

router.get(
  '/results/:jobId',
  auth,
  getScrapeResults
);

export default router;
