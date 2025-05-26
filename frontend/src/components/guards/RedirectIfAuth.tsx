import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthSession } from "../../hooks/useAuthSession";

/**
 * Props interface for RedirectIfAuth component.
 */
interface RedirectIfAuthProps {
  children: React.ReactNode;
  session?: any; // Optional session prop that can be passed in
}

/**
 * Route guard that redirects to /app if authenticated.
 * Usage: <RedirectIfAuth><YourComponent /></RedirectIfAuth>
 */
export default function RedirectIfAuth({
  children,
  session: passedSession,
}: RedirectIfAuthProps) {
  const { session: hookSession, loading } = useAuthSession();
  const session = passedSession || hookSession;
  const location = useLocation();
  if (loading) return null; // Optionally, render a spinner here
  if (session) {
    return <Navigate to="/app" state={{ from: location }} replace />;
  }
  return children;
}
