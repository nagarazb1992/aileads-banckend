import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { connectSMTP, deleteEmailAccount, getEmailAccount, listEmailAccounts, updateEmailAccount } from '../controllers/EmailController.js';

const router = Router();

router.post("/connect/smtp", auth, connectSMTP)
router.get("/accounts", auth, listEmailAccounts)
router.get("/account/:id", auth, getEmailAccount)
router.put("/account/:id/update", auth, updateEmailAccount)
router.delete("/account/:id/delete", auth, deleteEmailAccount)


export default router;