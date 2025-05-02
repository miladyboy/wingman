import { Request, Response } from 'express';
import { StripeService } from '../services/stripeService';
import { supabaseAdmin } from '../services/supabaseService';

// TODO: Replace with your actual price ID and inject via env/config
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || 'price_xxx';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const stripeService = new StripeService(STRIPE_SECRET_KEY, STRIPE_PRICE_ID);

/**
 * Handler to create a Stripe Checkout Session for the authenticated user.
 * @param req Express request
 * @param res Express response
 */
export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    // TODO: Implement getUserFromRequest to extract user from Supabase Auth
    const user = await getUserFromRequest(req);
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    // Check if user has a Stripe customer ID in Supabase
    let customerId = user.stripe_customer_id;
    if (!customerId) {
      customerId = await stripeService.createCustomerIfNotExists(user.email, user.id);
      // Save customerId to Supabase user record
      if (supabaseAdmin) {
        await supabaseAdmin.from('users').update({ stripe_customer_id: customerId }).eq('id', user.id);
      }
    }
    const url = await stripeService.createCheckoutSession(customerId, user.id);
    return res.json({ url });
  } catch (err) {
    console.error('Error creating Stripe Checkout Session:', err);
    return res.status(500).json({ error: 'Failed to create checkout session' });
  }
};

/**
 * Stub for extracting the authenticated user from the request.
 * Replace this with your actual Supabase Auth extraction logic.
 * @param req Express request
 * @returns User object with id, email, and stripe_customer_id
 */
async function getUserFromRequest(req: Request): Promise<any> {
  // TODO: Implement real extraction from Supabase JWT/session
  // Example placeholder:
  return {
    id: 'user_id',
    email: 'user@example.com',
    stripe_customer_id: null,
  };
} 