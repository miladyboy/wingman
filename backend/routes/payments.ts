import express, { Router } from "express";
const router: Router = express.Router();

import {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
} from "../controllers/stripeController";
import { requireAuth } from "../middleware/requireAuth";

/**
 * Express router for handling payment-related routes.
 * Includes routes for creating payment intents and managing subscriptions.
 * All routes require authentication.
 */

router.post(
  "/create-checkout-session",
  requireAuth,
  createCheckoutSession as any
);
router.get("/subscription-status", requireAuth, getSubscriptionStatus as any);
router.post("/cancel-subscription", requireAuth, cancelSubscription as any);

export default router;
