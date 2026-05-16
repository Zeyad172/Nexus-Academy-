import express from "express";
import { createCheckoutSession, stripeWebhook } from "../controllers/payment.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = express.Router();

// NOTE: The webhook route is handled with express.raw in server.js 
// but we still define the POST handler here.
router.post("/create-checkout-session", authenticate, createCheckoutSession);
router.post("/webhook", stripeWebhook);

export default router;
