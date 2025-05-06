import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useRequireAuth';

/**
 * Route guard that redirects to /app if authenticated.
 * Usage: <RedirectIfAuth><YourComponent /></RedirectIfAuth>
 */
export default function RedirectIfAuth({ children }) {
  const { session, loading } = useRequireAuth();
  const location = useLocation();
  if (loading) return null; // Optionally, render a spinner here
  if (session) {
    return <Navigate to="/app" state={{ from: location }} replace />;
  }
  return children;
} 