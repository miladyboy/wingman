import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to manage Supabase session and user profile state.
 * Handles session retrieval, profile fetching, and auth state changes.
 *
 * @param {object} supabase - The Supabase client instance.
 * @returns {{
 *   session: object|null,
 *   profile: object|null,
 *   loading: boolean,
 *   error: string|null
 * }}
 */
export default function useSessionProfile(supabase) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchProfile = useCallback(async (user) => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, email`)
        .eq('id', user.id)
        .single();
      if (error && status !== 406) {
        throw error;
      }
      if (data) {
        setProfile(data);
      } else {
        // Profile not found yet, trigger should create it.
        setProfile(null);
      }
    } catch (error) {
      setError('Could not fetch user profile.');
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let subscription;
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user);
      }
    });
    subscription = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user);
      } else {
        setProfile(null);
      }
    });
    return () => {
      if (subscription && subscription.data && subscription.data.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, [supabase, fetchProfile]);

  return { session, profile, loading, error };
} 