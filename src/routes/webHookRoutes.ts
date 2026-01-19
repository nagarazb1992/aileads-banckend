import { Router } from 'express';
import { linkedinWebhook } from '../controllers/webhookLinkedin.controller.js';
import { whatsappWebhook } from '../controllers/webhookWhatsapp.controller.js';

const router = Router();

router.post('/apify/linkedin', linkedinWebhook);
router.post('/whatsapp/inbound', whatsappWebhook);

export default router;
