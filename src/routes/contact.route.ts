import { Router } from "express";
import { submitContactForm } from "../controllers/ContactController.js";

const router = Router();

router.post("/", submitContactForm);

export default router;
