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
 */
export default function RedirectIfSubscribed({
  children,
}: RedirectIfSubscribedProps) {
  const { loading, active } = useRequireSubscription();
  if (loading) return null; // Optionally, render a spinner
  if (active) return <Navigate to="/app" replace />;
  return children;
}
