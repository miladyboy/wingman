import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';

/**
 * @typedef {import('@supabase/supabase-js').User} User
 */

/**
 * Represents a user profile.
 * @typedef {object} Profile
 * @property {string} username
 * @property {string} email
 */

/**
 * Custom hook to manage user profile data.
 *
 * @param {User | null} user - The Supabase user object.
 * @returns {{ profile: Profile | null, loadingProfile: boolean, profileError: string | null, fetchProfile: (user: User) => Promise<void> }}
 */
export function useUserProfile(user) {
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState(null);

  const fetchProfileCallback = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      // It's not an error if there's no user, so don't set an error.
      // setProfileError(null); 
      // setLoadingProfile(false); // Not strictly necessary as it won't be true.
      return;
    }
    setLoadingProfile(true);
    setProfileError(null);
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select(`username, email`)
        .eq('id', currentUser.id)
        .single();

      if (error && status !== 406) {
        throw error;
      }

      if (data) {
        setProfile(data);
      } else {
        // This case might occur if a profile hasn't been created yet (e.g., on first sign-up)
        // The trigger in Supabase should handle profile creation.
        // console.log("Profile not found yet, trigger should create it.");
        setProfile(null); // Explicitly set to null if no data
      }
    } catch (err) {
      console.error('Error fetching profile:', err);
      setProfileError('Could not fetch user profile.');
      setProfile(null); // Ensure profile is null on error
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfileCallback(user);
    } else {
      setProfile(null);
      setLoadingProfile(false); 
      setProfileError(null);
    }
  }, [user, fetchProfileCallback]);

  return { profile, loadingProfile, profileError, fetchProfile: fetchProfileCallback };
} 