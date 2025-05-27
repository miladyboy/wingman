import { makeStripeController } from "../stripeController";
import * as supabaseServiceModule from "../../services/supabaseService";

jest.mock("../../services/supabaseService");

describe("stripeController", () => {
  let req: any;
  let res: any;
  let mockJson: jest.Mock;
  let mockStatus: jest.Mock;
  let mockSend: jest.Mock;
  let mockStripeService: any;
  let handlers: any;

  beforeEach(() => {
    req = {
      headers: {},
      body: {},
      method: "POST",
      auth: { userId: "user1", email: "a@b.com", roles: ["authenticated"] },
    };
    mockJson = jest.fn();
    mockSend = jest.fn();
    mockStatus = jest.fn(() => ({ json: mockJson, send: mockSend }));
    res = { status: mockStatus, json: mockJson, send: mockSend };
    jest.clearAllMocks();
    mockStripeService = {
      createCustomerIfNotExists: jest.fn().mockResolvedValue("cus_123"),
      createCheckoutSession: jest
        .fn()
        .mockResolvedValue("https://stripe.com/session"),
      cancelActiveSubscription: jest.fn().mockResolvedValue(true),
    };
    handlers = makeStripeController(mockStripeService);
  });

  describe("createCheckoutSession", () => {
    it("returns 401 if user is not found", async () => {
      req.auth = undefined;
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: () => ({ data: null, error: null }) }),
          }),
        }),
      };
      req.headers.authorization = "Bearer token";
      await handlers.createCheckoutSession(req, res);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("creates customer and session if no customerId", async () => {
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => ({
                data: { id: "user1", email: "a@b.com" },
                error: null,
              }),
            }),
          }),
          update: jest.fn(() => ({ eq: jest.fn() })),
        }),
        update: jest.fn(() => ({ eq: jest.fn() })),
      };
      req.headers.authorization = "Bearer token";
      await handlers.createCheckoutSession(req, res);
      expect(mockStripeService.createCustomerIfNotExists).toHaveBeenCalledWith(
        "a@b.com",
        "user1"
      );
      expect(mockStripeService.createCheckoutSession).toHaveBeenCalledWith(
        "cus_123",
        "user1"
      );
      expect(mockJson).toHaveBeenCalledWith({
        url: "https://stripe.com/session",
      });
    });

    it.skip("returns 500 on error", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: () => ({ data: null, error: null }) }),
          }),
        }),
      };
      req.headers.authorization = "Bearer token";
      await handlers.createCheckoutSession(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Failed to create checkout session",
      });
      consoleErrorSpy.mockRestore();
    });
  });

  describe("getSubscriptionStatus", () => {
    it("returns 401 if user is not found", async () => {
      req.auth = undefined;
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: () => ({ data: null, error: null }) }),
          }),
        }),
      };
      req.headers.authorization = "Bearer token";
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(401);
      expect(mockJson).toHaveBeenCalledWith({ error: "Unauthorized" });
    });

    it("returns 500 if supabaseAdmin is not configured", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (supabaseServiceModule as any).supabaseAdmin = null;
      req.headers.authorization = "Bearer token";
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Failed to check subscription status",
      });
      consoleErrorSpy.mockRestore();
    });

    it("returns active true if is_paid is true", async () => {
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => ({ data: { is_paid: true }, error: null }),
            }),
          }),
        }),
      };
      req.headers.authorization = "Bearer token";
      await handlers.getSubscriptionStatus(req, res);
      expect(mockJson).toHaveBeenCalledWith({ active: true });
    });

    it("returns active false if is_paid is false", async () => {
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => ({ data: { is_paid: false }, error: null }),
            }),
          }),
        }),
      };
      req.headers.authorization = "Bearer token";
      await handlers.getSubscriptionStatus(req, res);
      expect(mockJson).toHaveBeenCalledWith({ active: false });
    });

    it("returns 500 if Supabase returns error", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({
              single: () => ({
                data: { is_paid: false },
                error: { message: "fail" },
              }),
            }),
          }),
        }),
      };
      req.headers.authorization = "Bearer token";
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Failed to check subscription status",
      });
      consoleErrorSpy.mockRestore();
    });

    it.skip("returns 500 on unexpected error", async () => {
      const consoleErrorSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});
      (supabaseServiceModule as any).supabaseAdmin = {
        from: () => ({
          select: () => ({
            eq: () => ({ single: () => ({ data: null, error: null }) }),
          }),
        }),
      };
      req.headers.authorization = "Bearer token";
      await handlers.getSubscriptionStatus(req, res);
      expect(mockStatus).toHaveBeenCalledWith(500);
      expect(mockJson).toHaveBeenCalledWith({
        error: "Failed to check subscription status",
      });
      consoleErrorSpy.mockRestore();
    });
  });

  describe("cancelSubscription", () => {
    it("cancels subscription, nulls stripe_customer_id, and logs out", async () => {
      const user = {
        id: "user1",
        email: "a@b.com",
        stripe_customer_id: "cus_123",
      };
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
      mockStripeService.cancelActiveSubscription = jest
        .fn()
        .mockResolvedValue(true);
      req.headers.authorization = "Bearer token";
      await handlers.cancelSubscription(req, res);
      // Should update is_paid and stripe_customer_id to null
      expect(mockUpdate).toHaveBeenCalledWith({
        is_paid: false,
        stripe_customer_id: null,
      });
      expect(mockJson).toHaveBeenCalledWith({ success: true, logout: true });
    });
  });
});
