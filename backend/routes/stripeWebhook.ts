import express from "express";
import { handleStripeWebhook } from "../controllers/stripeWebhookController";

/**
 * Express router for handling Stripe webhooks.
 */
const router = express.Router();

// Stripe requires the raw body for webhook signature verification
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  handleStripeWebhook as any
);

export default router;
