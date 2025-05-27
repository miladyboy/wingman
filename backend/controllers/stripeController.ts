import { Request, Response } from "express";
import { StripeService } from "../services/stripeService";
import { supabaseAdmin } from "../services/supabaseService";

// Helper to extract user from request using Supabase JWT
async function getUserFromRequest(req: Request): Promise<any | null> {
  if (!supabaseAdmin) throw new Error("Supabase not configured");
  const userId = req.auth?.userId;
  if (!userId) return null;
  const { data: user, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  if (error) throw new Error("Supabase query error");
  if (!user) return null;
  return user;
}

export function makeStripeController(stripeService: StripeService) {
  return {
    /**
     * Handler to create a Stripe Checkout Session for the authenticated user.
     * @param req Express request
     * @param res Express response
     */
    createCheckoutSession: async (req: Request, res: Response) => {
      try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        // Check if user has a Stripe customer ID in Supabase
        let customerId = user.stripe_customer_id;
        if (!customerId) {
          customerId = await stripeService.createCustomerIfNotExists(
            user.email,
            user.id
          );
          // Save customerId to Supabase user record
          if (supabaseAdmin) {
            await supabaseAdmin
              .from("profiles")
              .update({ stripe_customer_id: customerId })
              .eq("id", user.id);
          }
        }
        const url = await stripeService.createCheckoutSession(
          customerId,
          user.id
        );
        return res.json({ url });
      } catch (err: any) {
        if (
          err.message === "Supabase not configured" ||
          err.message === "Supabase query error"
        ) {
          return res
            .status(500)
            .json({ error: "Failed to create checkout session" });
        }
        console.error("Error creating Stripe Checkout Session:", err);
        return res
          .status(500)
          .json({ error: "Failed to create checkout session" });
      }
    },

    /**
     * Handler to check if the authenticated user has an active subscription.
     * @param req Express request
     * @param res Express response
     */
    getSubscriptionStatus: async (req: Request, res: Response) => {
      try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });

        // Query the profiles table for is_paid
        const { data, error } = await supabaseAdmin!
          .from("profiles")
          .select("is_paid")
          .eq("id", user.id)
          .single();
        if (error) {
          console.error("Supabase error:", error);
          return res
            .status(500)
            .json({ error: "Failed to check subscription status" });
        }
        return res.json({ active: !!data?.is_paid });
      } catch (err: any) {
        if (
          err.message === "Supabase not configured" ||
          err.message === "Supabase query error"
        ) {
          return res
            .status(500)
            .json({ error: "Failed to check subscription status" });
        }
        console.error("Error checking subscription status:", err);
        return res
          .status(500)
          .json({ error: "Failed to check subscription status" });
      }
    },

    /**
     * Handler to cancel the authenticated user's active subscription.
     * @param req Express request
     * @param res Express response
     */
    cancelSubscription: async (req: Request, res: Response) => {
      try {
        const user = await getUserFromRequest(req);
        if (!user) return res.status(401).json({ error: "Unauthorized" });
        const customerId = user.stripe_customer_id;
        if (!customerId)
          return res.status(400).json({ error: "No Stripe customer ID" });
        const cancelled = await stripeService.cancelActiveSubscription(
          customerId
        );
        if (!cancelled)
          return res
            .status(400)
            .json({ error: "No active subscription found" });
        // Update is_paid and stripe_customer_id in Supabase
        if (supabaseAdmin) {
          await supabaseAdmin
            .from("profiles")
            .update({ is_paid: false, stripe_customer_id: null })
            .eq("id", user.id);
        }
        // Signal frontend to log the user out
        return res.json({ success: true, logout: true });
      } catch (err: any) {
        if (
          err.message === "Supabase not configured" ||
          err.message === "Supabase query error"
        ) {
          return res
            .status(500)
            .json({ error: "Failed to cancel subscription" });
        }
        console.error("Error cancelling subscription:", err);
        return res.status(500).json({ error: "Failed to cancel subscription" });
      }
    },
  };
}

// Default export for production use
const STRIPE_PRICE_ID = process.env.STRIPE_PRICE_ID || "price_xxx";
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY!;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3001";
const stripeService = new StripeService(
  STRIPE_SECRET_KEY,
  STRIPE_PRICE_ID,
  FRONTEND_URL
);
export const {
  createCheckoutSession,
  getSubscriptionStatus,
  cancelSubscription,
} = makeStripeController(stripeService);
