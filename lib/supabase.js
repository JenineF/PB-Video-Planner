import { createClient } from '@supabase/supabase-js'

// Public client — safe to use in the browser
// These environment variables are exposed to the frontend (NEXT_PUBLIC_ prefix)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
