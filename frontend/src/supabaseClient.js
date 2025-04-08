import { createClient } from '@supabase/supabase-js'

// Use Create React App's way of accessing environment variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key missing. Did you create a frontend/.env file and prefix variables with REACT_APP_?");
  throw new Error("Supabase URL and Anon Key must be provided in environment variables (REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY)")
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey) 