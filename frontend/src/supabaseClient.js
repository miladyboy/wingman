import { createClient } from '@supabase/supabase-js'

// Use Vite's way of accessing environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key missing. Did you create a frontend/.env file and prefix variables with VITE_?");
  throw new Error("Supabase URL and Anon Key must be provided in environment variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 