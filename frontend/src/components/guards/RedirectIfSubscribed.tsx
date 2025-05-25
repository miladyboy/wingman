import { Navigate } from 'react-router-dom';
import { useRequireSubscription } from '../../hooks/useRequireSubscription';

/**
 * Guard that redirects authenticated, subscribed users from /subscribe to /app.
 * Usage: <RedirectIfSubscribed><SubscribePage /></RedirectIfSubscribed>
 */
export default function RedirectIfSubscribed({ children }) {
  const { loading, active } = useRequireSubscription();
  if (loading) return null; // Optionally, render a spinner
  if (active) return <Navigate to="/app" replace />;
  return children;
} 