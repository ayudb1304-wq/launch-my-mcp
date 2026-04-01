import { createClient } from "@supabase/supabase-js";

// Admin client using service role key — only use server-side.
// Bypasses RLS for operations like user sync on first login.
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
