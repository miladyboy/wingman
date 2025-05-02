import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Extracts the user ID from the Authorization header using Supabase JWT validation.
 * @param authHeader The Authorization header value (e.g., 'Bearer <token>')
 * @param supabase The Supabase admin client
 * @returns The user ID if valid, otherwise null
 */
export async function getUserIdFromAuthHeader(authHeader: string | undefined, supabase: SupabaseClient | null): Promise<string | null> {
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const userAccessToken = authHeader.split(' ')[1];
    try {
      if (supabase) {
        const { data: { user }, error: userError } = await supabase.auth.getUser(userAccessToken);
        if (!userError && user) {
          return user.id;
        }
      }
    } catch (e) {
      // Optionally log error
    }
  }
  return null;
} 