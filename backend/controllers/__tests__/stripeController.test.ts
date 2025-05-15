import { makeStripeController } from '../stripeController';
import * as supabaseServiceModule from '../../services/supabaseService';
import * as authUtils from '../../utils/auth';

jest.mock('../../services/supabaseService');
jest.mock('../../utils/auth');

describe('stripeController', () => {
  let req: any;
  let res: any;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let mockStripeService: any;
  let handlers: any;

  beforeEach(() => {
    req = { headers: {}, body: {}, method: 'POST' };
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson, send: mockSend }));
    res = { status: mockStatus, json: mockJson, send: mockSend };
    jest.clearAllMocks();
    mockStripeService = {
      createCustomerIfNotExists: jest.fn().mockResolvedValue('cus_123'),
      createCheckoutSession: jest.fn().mockResolvedValue('https://stripe.com/session'),
      cancelActiveSubscription: jest.fn().mockResolvedValue(true),
    };
    handlers = makeStripeController(mockStripeService);
  });

  describe('createCheckoutSession', () => {
    it('returns 401 if user is not found', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue(null);
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      };
      req.headers.authorization = 'Bearer token';
      await handlers.createCheckoutSession(req, res);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('creates customer and session if no customerId', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue('user1');
      const user = { id: 'user1', email: 'a@b.com' };
      const mockUpdate = jest.fn(() => ({ eq: jest.fn() }));
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: () => ({ data: user, error: null }) }),
          }),
          update: mockUpdate,
        }),
        update: mockUpdate,
      };
      req.headers.authorization = 'Bearer token';
      await handlers.createCheckoutSession(req, res);
      expect(mockStripeService.createCustomerIfNotExists).toHaveBeenCalledWith('a@b.com', 'user1');
      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith('cus_123', 'user1');
      expect(mockJson).toHaveBeenCalledWith({ url: 'https://stripe.com/session' });
    });

    it('returns 500 on error', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockImplementation(() => { throw new Error('fail'); });
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      };
      req.headers.authorization = 'Bearer token';
      await handlers.createCheckoutSession(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to create checkout session' });
    });
  });

  describe('getSubscriptionStatus', () => {
    it('returns 401 if user is not found', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue(null);
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      };
      req.headers.authorization = 'Bearer token';
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Unauthorized' });
    });

    it('returns 500 if supabaseAdmin is not configured', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue('user1');
      (supabaseServiceModule as any).supabaseAdmin = null;
      req.headers.authorization = 'Bearer token';
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to check subscription status' });
    });

    it('returns active true if is_paid is true', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue('user1');
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: { is_paid: true }, error: null }) }) }) }),
      };
      req.headers.authorization = 'Bearer token';
      await handlers.getSubscriptionStatus(req, res);
      expect(mockJson).toHaveBeenCalledWith({ active: true });
    });

    it('returns active false if is_paid is false', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue('user1');
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: { is_paid: false }, error: null }) }) }) }),
      };
      req.headers.authorization = 'Bearer token';
      await handlers.getSubscriptionStatus(req, res);
      expect(mockJson).toHaveBeenCalledWith({ active: false });
    });

    it('returns 500 if Supabase returns error', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue('user1');
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: { is_paid: false }, error: { message: 'fail' } }) }) }) }),
      };
      req.headers.authorization = 'Bearer token';
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to check subscription status' });
    });

    it('returns 500 on unexpected error', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockImplementation(() => { throw new Error('fail'); });
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({ select: () => ({ eq: () => ({ single: () => ({ data: null, error: null }) }) }) }),
      };
      req.headers.authorization = 'Bearer token';
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({ error: 'Failed to check subscription status' });
    });
  });

  describe('cancelSubscription', () => {
    it('cancels subscription, nulls stripe_customer_id, and logs out', async () => {
      jest.spyOn(authUtils, 'getUserIdFromAuthHeader').mockResolvedValue('user1');
      const user = { id: 'user1', email: 'a@b.com', stripe_customer_id: 'cus_123' };
      const mockUpdate = jest.fn(() => ({ eq: jest.fn() }));
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({ eq: () => ({ single: () => ({ data: user, error: null }) }) }),
          update: mockUpdate,
        }),
        update: mockUpdate,
      };
      mockStripeService.cancelActiveSubscription = jest.fn().mockResolvedValue(true);
      req.headers.authorization = 'Bearer token';
      await handlers.cancelSubscription(req, res);
      // Should update is_paid and stripe_customer_id to null
      expect(mockUpdate).toHaveBeenCalledWith({ is_paid: false, stripe_customer_id: null });
      expect(mockJson).toHaveBeenCalledWith({ success: true, logout: true });
    });
  });
}); 