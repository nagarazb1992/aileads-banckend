import express from "express";
import bodyParser from "body-parser";
import { createCheckoutSession } from "../controllers/dodo.controller.js";
import { dodoWebhook } from "../controllers/dodo.webhook.js";

const router = express.Router();

router.post("/dodo/create-session", createCheckoutSession);

// Webhook requires RAW body
router.post(
  "/dodo/webhook",
  bodyParser.raw({ type: "*/*" }),
  dodoWebhook
);

export default router;
