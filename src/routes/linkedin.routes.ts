import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { connectLinkedin, listLinkedinAccounts } from '../controllers/linkedinAccount.controller.js';

const router = Router();

router.post('/connect', auth, connectLinkedin);
router.get('/accounts', auth, listLinkedinAccounts);

export default router;
