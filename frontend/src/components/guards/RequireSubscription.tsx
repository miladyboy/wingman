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
 */
export default function RequireSubscription({
  children,
}: RequireSubscriptionProps) {
  const { loading, active } = useRequireSubscription();
  if (loading) return null; // Optionally, render a spinner here
  if (!active) return null; // The hook will handle navigation
  return children;
}
