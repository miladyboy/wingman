import express, { Router } from 'express';
import { handleStripeWebhook } from '../controllers/stripeWebhookController';

const router: Router = express.Router();

// Stripe requires the raw body for webhook signature verification
router.post('/webhook', express.raw({ type: 'application/json' }), handleStripeWebhook as any);

export default router; 