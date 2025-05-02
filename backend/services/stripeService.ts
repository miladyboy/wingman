import Stripe from 'stripe';

/**
 * Service for interacting with Stripe API for subscriptions and checkout.
 * @param stripeSecretKey - Stripe secret key (injected)
 * @param priceId - Stripe price ID for the subscription (injected)
 */
export class StripeService {
  private stripe: Stripe;
  private priceId: string;

  constructor(stripeSecretKey: string, priceId: string) {
    this.stripe = new Stripe(stripeSecretKey);
    this.priceId = priceId;
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
      success_url: 'https://yourdomain.com/success', // TODO: Replace with your real URL
      cancel_url: 'https://yourdomain.com/cancel',
      metadata: { userId },
    });
    if (!session.url) throw new Error('Stripe session URL not returned');
    return session.url;
  }
} 