import { createClient } from '@supabase/supabase-js'

// Server-side client — uses service role key, bypasses RLS for admin operations
// NEVER expose this key to the browser
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
