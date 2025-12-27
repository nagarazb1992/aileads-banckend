import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { createIcpProfile, deleteIcpProfile, getIcpProfileById, getIcpProfiles, updateIcpProfile } from "../controllers/icpProfile.controller.js";


const router = Router();

router.post("/", auth, createIcpProfile);
router.get("/", auth, getIcpProfiles);
router.get("/:id", auth, getIcpProfileById);
router.put("/:id", auth, updateIcpProfile);
router.delete("/:id", auth, deleteIcpProfile);
export default router;
