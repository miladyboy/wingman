import express, { Router } from 'express';
const router: Router = express.Router();

import { createCheckoutSession, getSubscriptionStatus, cancelSubscription } from '../controllers/stripeController';

router.post('/create-checkout-session', createCheckoutSession as any);
router.get('/subscription-status', getSubscriptionStatus as any);
router.post('/cancel-subscription', cancelSubscription as any);

export default router; 