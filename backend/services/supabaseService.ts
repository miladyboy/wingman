import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl: string | undefined = process.env.SUPABASE_URL;
const supabaseServiceKey: string | undefined = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase URL or Service Role Key not found in .env. Backend Supabase operations may fail.');
}

const supabaseAdmin: SupabaseClient | null =
  supabaseUrl && supabaseServiceKey
    ? createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
          detectSessionInUrl: false,
        },
      })
    : null;

console.log(`Supabase Admin Client ${supabaseAdmin ? 'Initialized' : 'NOT Initialized (Missing ENV vars)'}`);

export { supabaseAdmin }; 