import { Router } from "express";
import { updateUserProfile, updateOrganization, updatePassword } from "../controllers/userController.js";
import { auth } from "../middleware/auth.js";

const router = Router();

// Update user profile
router.put("/profile", auth, updateUserProfile);
// Update organization
router.put("/organization", auth, updateOrganization);
// Update password
router.put("/password", auth, updatePassword);

export default router;
