import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useRequireAuth } from '../../hooks/useRequireAuth';

/**
 * Route guard that redirects to / if not authenticated.
 * Usage: <RequireAuth><YourComponent /></RequireAuth>
 */
export default function RequireAuth({ children }) {
  const { session, loading } = useRequireAuth();
  const location = useLocation();
  if (loading) return null; // Optionally, render a spinner here
  if (!session) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }
  return children;
} 