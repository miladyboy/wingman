import React from "react";
import { Navigate } from "react-router-dom";
import { useRequireSubscription } from "../../hooks/useRequireSubscription";

/**
 * Props interface for RequireSubscription component.
 */
interface RequireSubscriptionProps {
  children: React.ReactNode;
}

/**
 * Route guard that redirects to /subscribe if user doesn't have an active subscription.
 * Usage: <RequireSubscription><YourComponent /></RequireSubscription>
 *
 * TEMPORARY: Subscription check is disabled due to Stripe issues.
 * All registered users can access the app regardless of subscription status.
 */
export default function RequireSubscription({
  children,
}: RequireSubscriptionProps) {
  // TEMPORARY: Bypass subscription check due to Stripe issues
  // TODO: Re-enable subscription check once Stripe issues are resolved
  // const { loading, active } = useRequireSubscription();
  // if (loading) return null; // Optionally, render a spinner here
  // if (!active) return null; // The hook will handle navigation

  // Allow all registered users to access the app
  return children;
}
