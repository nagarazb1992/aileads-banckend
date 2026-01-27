import { Router } from "express";
import { bookDemo, submitContactForm } from "../controllers/ContactController.js";

const router = Router();

router.post("/", submitContactForm);
router.post("/book-demo", bookDemo);

export default router;
