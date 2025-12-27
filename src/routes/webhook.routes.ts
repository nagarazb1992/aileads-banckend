import { Router } from 'express';
import { paddleWebhook } from '../controllers/webhook.controller.js';

const router = Router();

router.post('/payment', paddleWebhook);

export default router;
