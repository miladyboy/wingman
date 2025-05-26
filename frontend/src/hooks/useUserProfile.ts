import { useState, useEffect } from "react";
import { supabase } from "../services/supabaseClient";

/**
 * User profile interface.
 */
interface UserProfile {
  username: string;
  email: string;
}

/**
 * Hook to fetch and manage the user's profile from Supabase.
 *
 * @param {string|null|undefined} userId - The user's ID. If falsy, no fetch occurs.
 * @returns {{ profile: object|null, loading: boolean, error: string|null }}
 */
export function useUserProfile(userId: string | null | undefined) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    (async () => {
      try {
        const { data, error, status } = await supabase
          .from("profiles")
          .select("username, email")
          .eq("id", userId)
          .single();

        if (!mounted) return;

        if (error && status !== 406) {
          setError("Could not fetch user profile.");
          setProfile(null);
        } else if (data) {
          setProfile(data as UserProfile);
        } else {
          setProfile(null);
        }
      } catch {
        if (mounted) {
          setError("Could not fetch user profile.");
          setProfile(null);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [userId]);

  return { profile, loading, error };
}
