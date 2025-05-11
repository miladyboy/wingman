import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import type { Session, AuthError } from '@supabase/supabase-js';

/**
 * Hook to get the current Supabase session and subscribe to auth state changes.
 * Returns { session, loading, error }
 */
export function useAuthSession(): {
  session: Session | null;
  loading: boolean;
  error: AuthError | null;
} {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const abortController = new AbortController();
    let isActive = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!abortController.signal.aborted) {
        setSession(session);
        setLoading(false);
      }
    }).catch((e: AuthError) => {
      if (!abortController.signal.aborted) {
        setError(e);
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isActive && !abortController.signal.aborted) setSession(session);
    });

    return () => {
      isActive = false;
      abortController.abort();
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, error };
} 