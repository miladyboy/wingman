import { useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';

/**
 * Hook to fetch and manage the user's profile from Supabase.
 *
 * @param {string|null|undefined} userId - The user's ID. If falsy, no fetch occurs.
 * @returns {{ profile: object|null, loading: boolean, error: string|null }}
 */
export function useUserProfile(userId) {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }
    let mounted = true;
    setLoading(true);
    setError(null);
    supabase
      .from('profiles')
      .select('username, email')
      .eq('id', userId)
      .single()
      .then(({ data, error, status }) => {
        if (!mounted) return;
        if (error && status !== 406) {
          setError('Could not fetch user profile.');
          setProfile(null);
        } else if (data) {
          setProfile(data);
        } else {
          setProfile(null);
        }
      })
      .catch(() => {
        if (mounted) {
          setError('Could not fetch user profile.');
          setProfile(null);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [userId]);

  return { profile, loading, error };
} 