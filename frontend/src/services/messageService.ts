import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Conversation data structure returned from Supabase.
 */
export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at?: string;
  last_message_at?: string;
  [key: string]: any;
}

/**
 * Creates a new conversation in Supabase.
 * @param {object} supabase - The Supabase client instance.
 * @param {string} userId - The user ID.
 * @param {string} title - The conversation title.
 * @returns {Promise<object>} The created conversation data.
 */
export async function createConversation(
  supabase: SupabaseClient,
  userId: string,
  title: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("conversations")
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  if (!data)
    throw new Error("Failed to create conversation: No data returned.");
  return {
    ...data,
    last_message_at: data.created_at, // Set initial last_message_at to created_at
  } as Conversation;
}

/**
 * Sends a message to the backend API.
 * @param {string} backendUrl - The backend endpoint base URL.
 * @param {string} accessToken - The user's access token for auth.
 * @param {FormData} formData - The form data to send.
 * @param {function} fetchImpl - (Optional) fetch implementation for testability.
 * @returns {Promise<Response>} The fetch response.
 */
export async function sendMessageToBackend(
  backendUrl: string,
  accessToken: string,
  formData: FormData,
  fetchImpl: typeof fetch = fetch
): Promise<Response> {
  return fetchImpl(`${backendUrl}/analyze`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
}
