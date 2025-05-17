import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

export default function useAuthSession() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (isMounted) {
          setSession(session);
          setLoading(false);
        }
      })
      .catch(e => {
        if (isMounted) {
          setError(e);
          setLoading(false);
        }
      });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (isMounted) {
        setSession(session);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  return { session, loading, error };
}
