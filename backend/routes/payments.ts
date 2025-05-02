import express, { Router } from 'express';
const router: Router = express.Router();

import { createCheckoutSession } from '../controllers/stripeController';

router.post('/create-checkout-session', createCheckoutSession as any);

export default router; 