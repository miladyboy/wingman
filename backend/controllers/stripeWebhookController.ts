import { Request, Response } from 'express';
import Stripe from 'stripe';
import { supabaseAdmin } from '../services/supabaseService';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;
const stripe = new Stripe(STRIPE_SECRET_KEY);

/**
 * Handler for Stripe webhook events.
 * @param req Express request (raw body)
 * @param res Express response
 */
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err);
    return res.status(400).send(`Webhook Error: ${(err as Error).message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    if (userId && supabaseAdmin) {
      // Mark user as paid in Supabase
      await supabaseAdmin.from('users').update({ is_paid: true }).eq('id', userId);
    }
  }

  res.json({ received: true });
}; 