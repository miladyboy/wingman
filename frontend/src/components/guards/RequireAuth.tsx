import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";

/**
 * Props interface for RequireAuth component.
 */
interface RequireAuthProps {
  children: React.ReactNode;
  session?: any; // Optional session prop that can be passed in
}

/**
 * Route guard that redirects to /auth if not authenticated.
 * Usage: <RequireAuth><YourComponent /></RequireAuth>
 */
export default function RequireAuth({
  children,
  session: passedSession,
}: RequireAuthProps) {
  const { session: hookSession, loading } = useAuthSession();
  const session = passedSession || hookSession;
  const location = useLocation();
  if (loading) return null; // Optionally, render a spinner here
  if (!session) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  return children;
}
