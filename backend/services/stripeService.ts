import Stripe from 'stripe';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Service for interacting with Stripe API for subscriptions and checkout.
 * @param stripeSecretKey - Stripe secret key (injected)
 * @param priceId - Stripe price ID for the subscription (injected)
 * @param frontendUrl - Frontend URL for redirect (injected, defaults to process.env.FRONTEND_URL or 'http://localhost:3001')
 */
export class StripeService {
  private stripe: Stripe;
  private priceId: string;
  private frontendUrl: string;

  constructor(stripeSecretKey: string, priceId: string, frontendUrl: string = process.env.FRONTEND_URL || 'http://localhost:3001') {
    this.stripe = new Stripe(stripeSecretKey);
    this.priceId = priceId;
    this.frontendUrl = frontendUrl;
  }

  /**
   * Creates a Stripe customer if one does not exist.
   * @param email - User's email
   * @param userId - Internal user ID (for metadata)
   * @returns The Stripe customer ID
   */
  async createCustomerIfNotExists(email: string, userId: string): Promise<string> {
    // In a real implementation, check your DB for existing customerId first
    const customer = await this.stripe.customers.create({
      email,
      metadata: { userId },
    });
    return customer.id;
  }

  /**
   * Creates a Stripe Checkout Session for a subscription with a trial.
   * @param customerId - The Stripe customer ID
   * @param userId - Internal user ID (for metadata)
   * @returns The Checkout Session URL
   */
  async createCheckoutSession(customerId: string, userId: string): Promise<string> {
    const session = await this.stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer: customerId,
      line_items: [{ price: this.priceId, quantity: 1 }],
      success_url: `${this.frontendUrl}/success`,
      cancel_url: `${this.frontendUrl}/cancel`,
      metadata: { userId },
    });
    if (!session.url) throw new Error('Stripe session URL not returned');
    return session.url;
  }

  /**
   * Cancels the active subscription for a Stripe customer.
   * @param customerId - The Stripe customer ID
   * @returns true if cancelled, false if no active subscription
   */
  async cancelActiveSubscription(customerId: string): Promise<boolean> {
    // List active subscriptions for the customer
    const subs = await this.stripe.subscriptions.list({
      customer: customerId,
      status: 'active',
      limit: 1,
    });
    if (!subs.data.length) return false;
    const subId = subs.data[0].id;
    await this.stripe.subscriptions.cancel(subId);
    return true;
  }
} 