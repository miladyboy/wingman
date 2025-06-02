import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";
import { useRequireSubscription } from "../../hooks/useRequireSubscription";

/**
 * Props interface for RedirectIfSubscribed component.
 */
interface RedirectIfSubscribedProps {
  children: React.ReactNode;
}

/**
 * Guard that redirects authenticated, subscribed users from /subscribe to /app.
 * Usage: <RedirectIfSubscribed><SubscribePage /></RedirectIfSubscribed>
 *
 * TEMPORARY: Since subscription check is disabled due to Stripe issues,
 * all authenticated users are redirected to /app instead of /subscribe.
 */
export default function RedirectIfSubscribed({
  children,
}: RedirectIfSubscribedProps) {
  // TEMPORARY: Redirect all authenticated users to /app since subscription is disabled
  // TODO: Re-enable subscription check once Stripe issues are resolved
  const { session } = useAuthSession();
  if (session) {
    return <Navigate to="/app" replace />;
  }

  // Original logic (commented out temporarily)
  // const { loading, active } = useRequireSubscription();
  // if (loading) return null; // Optionally, render a spinner
  // if (active) return <Navigate to="/app" replace />;

  return children;
}
