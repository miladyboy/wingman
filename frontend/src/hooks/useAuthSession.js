import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

/**
 * @typedef {import('@supabase/supabase-js').Session} Session
 */

/**
 * Custom hook to manage Supabase authentication session.
 * It initializes the session state and listens for authentication changes.
 *
 * @returns {{ session: Session | null }} An object containing the current session.
 */
export function useAuthSession() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    // Check current session on initial load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  return { session };
} 