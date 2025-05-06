import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';

/**
 * Hook to check if the current user has an active subscription.
 * Redirects to /subscribe if not active.
 * Returns { loading, active }
 */
export function useRequireSubscription() {
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    async function check() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        const res = await fetch('/api/payments/subscription-status', {
          headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
        });
        const data = await res.json();
        if (data.active) {
          setActive(true);
        } else {
          navigate('/subscribe');
        }
      } catch {
        navigate('/subscribe');
      } finally {
        setLoading(false);
      }
    }
    check();
  }, [navigate]);

  return { loading, active };
} 