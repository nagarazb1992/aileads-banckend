import { Router } from 'express';
import { forgotPassword, getUserDetails, login, register, resendVerification, resetPassword, updateOrganization, updatePassword, updateUserProfile } from '../controllers/userController.js';
import { auth } from '../middleware/auth.js';
import { verifyEmail } from '../controllers/emailVerifyController.js';

const router = Router();

router.post('/register', register);
router.post('/login', login); // New endpoint
router.get('/me', auth, getUserDetails);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);
router.put("/profile", auth, updateUserProfile);
router.put("/organization", auth, updateOrganization);
// Update password
router.put("/password", auth, updatePassword);



export default router;