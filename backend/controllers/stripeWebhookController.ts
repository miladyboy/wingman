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

  console.log('Received Stripe event:', event.type);

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const customerId = typeof session.customer === 'string' ? session.customer : undefined;
    console.log('Checkout session completed for userId:', userId, 'customerId:', customerId);
    if (userId && customerId && supabaseAdmin) {
      const { error, data } = await supabaseAdmin
        .from('profiles')
        .update({ is_paid: true, stripe_customer_id: customerId })
        .eq('id', userId);
      if (error) {
        console.error('Failed to update is_paid and stripe_customer_id in profiles:', error);
      } else {
        console.log('Successfully updated is_paid and stripe_customer_id for userId:', userId, data);
      }
    } else {
      if (!userId) console.error('userId missing in session metadata');
      if (!customerId) console.error('customerId missing in session object');
      if (!supabaseAdmin) console.error('supabaseAdmin not initialized');
    }
  }

  res.json({ received: true });
}; 