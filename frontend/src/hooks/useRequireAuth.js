import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * Hook to get the current Supabase session and subscribe to auth state changes.
 * Returns { session, loading, error }
 */
export function useRequireAuth() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (mounted) {
        setSession(session);
        setLoading(false);
      }
    }).catch(e => {
      if (mounted) {
        setError(e);
        setLoading(false);
      }
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setSession(session);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, error };
} 