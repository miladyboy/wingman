import { useState, useCallback, useEffect } from 'react';

/**
 * Custom hook to manage conversations state and fetching from Supabase.
 *
 * @param {object} supabase - The Supabase client instance.
 * @param {object|null} session - The current user session.
 * @returns {{
 *   conversations: Array,
 *   loading: boolean,
 *   error: string|null,
 *   fetchConversations: function,
 *   setConversations: function
 * }}
 */
export default function useConversations(supabase, session) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchConversations = useCallback(async (user) => {
    const targetUser = user || (session && session.user);
    if (!targetUser) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id, title, created_at, last_message_at')
        .eq('user_id', targetUser.id)
        .order('last_message_at', { ascending: false });
      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      setError('Could not fetch conversations.');
    } finally {
      setLoading(false);
    }
  }, [supabase, session]);

  // Fetch conversations when session changes
  useEffect(() => {
    if (session && session.user) {
      fetchConversations(session.user);
    } else {
      setConversations([]);
    }
  }, [session, fetchConversations]);

  return { conversations, loading, error, fetchConversations, setConversations };
} 