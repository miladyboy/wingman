import { StripeService } from '../stripeService';

let mockStripeInstance: any;

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    mockStripeInstance = {
      customers: {
        create: jest.fn(),
      },
      checkout: {
        sessions: {
          create: jest.fn(),
        },
      },
    };
    return mockStripeInstance;
  });
});

const MockStripe = require('stripe');

describe('StripeService', () => {
  const stripeSecretKey = 'sk_test_123';
  const priceId = 'price_abc';
  const frontendUrl = 'http://localhost:3001';
  let service: StripeService;

  beforeEach(() => {
    service = new StripeService(stripeSecretKey, priceId, frontendUrl);
    jest.clearAllMocks();
  });

  describe('createCustomerIfNotExists', () => {
    it('creates a customer and returns the id', async () => {
      mockStripeInstance.customers.create.mockResolvedValue({ id: 'cus_123' });
      const id = await service.createCustomerIfNotExists('test@example.com', 'user1');
      expect(mockStripeInstance.customers.create).toHaveBeenCalledWith({
        email: 'test@example.com',
        metadata: { userId: 'user1' },
      });
      expect(id).toBe('cus_123');
    });

    it('throws if Stripe throws', async () => {
      mockStripeInstance.customers.create.mockRejectedValue(new Error('fail'));
      await expect(service.createCustomerIfNotExists('a@b.com', 'u1')).rejects.toThrow('fail');
    });
  });

  describe('createCheckoutSession', () => {
    const customerId = 'cus_123';
    const userId = 'user1';

    it('creates a session and returns the url', async () => {
      mockStripeInstance.checkout.sessions.create.mockResolvedValue({ url: 'https://stripe.com/session' });
      const url = await service.createCheckoutSession(customerId, userId);
      expect(mockStripeInstance.checkout.sessions.create).toHaveBeenCalledWith({
        mode: 'subscription',
        payment_method_types: ['card'],
        customer: customerId,
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${frontendUrl}/success`,
        cancel_url: `${frontendUrl}/cancel`,
        metadata: { userId },
      });
      expect(url).toBe('https://stripe.com/session');
    });

    it('throws if session.url is missing', async () => {
      mockStripeInstance.checkout.sessions.create.mockResolvedValue({});
      await expect(service.createCheckoutSession(customerId, userId)).rejects.toThrow('Stripe session URL not returned');
    });

    it('throws if Stripe throws', async () => {
      mockStripeInstance.checkout.sessions.create.mockRejectedValue(new Error('fail'));
      await expect(service.createCheckoutSession(customerId, userId)).rejects.toThrow('fail');
    });
  });
}); 