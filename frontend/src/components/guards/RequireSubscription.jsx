import React from 'react';
import { useRequireSubscription } from '../../hooks/useRequireSubscription';

/**
 * Route guard that checks for active subscription and redirects to /subscribe if not.
 * Usage: <RequireSubscription><YourComponent /></RequireSubscription>
 */
export default function RequireSubscription({ children }) {
  const { loading, active } = useRequireSubscription();
  if (loading) return null; // Optionally, render a spinner here
  if (!active) return null; // The hook will handle navigation
  return children;
} 