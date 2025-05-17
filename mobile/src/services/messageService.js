/**
 * Creates a new conversation in Supabase.
 * @param {object} supabase - The Supabase client instance.
 * @param {string} userId - The user ID.
 * @param {string} title - The conversation title.
 * @returns {Promise<object>} The created conversation data.
 */
export async function createConversation(supabase, userId, title) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({ user_id: userId, title })
    .select()
    .single();
  if (error) throw error;
  if (!data) throw new Error('Failed to create conversation: No data returned.');
  return data;
}

/**
 * Sends a message to the backend API.
 * @param {string} backendUrl - The backend endpoint base URL.
 * @param {string} accessToken - The user's access token for auth.
 * @param {FormData} formData - The form data to send.
 * @param {function} fetchImpl - (Optional) fetch implementation for testability.
 * @returns {Promise<Response>} The fetch response.
 */
export async function sendMessageToBackend(backendUrl, accessToken, formData, fetchImpl = fetch) {
  return fetchImpl(`${backendUrl}/analyze`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });
} 
