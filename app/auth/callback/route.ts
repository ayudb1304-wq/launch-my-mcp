import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.user) {
      // Sync user to public.users table on first login
      await syncUser(data.user.id, data.user.email!, data.user.user_metadata);
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth-code-error`);
}

async function syncUser(
  id: string,
  email: string,
  metadata: Record<string, unknown>,
) {
  const admin = createAdminClient();

  // Upsert — insert on first login, update on subsequent
  await admin.from("users").upsert(
    {
      id,
      email,
      full_name:
        (metadata.full_name as string) ??
        (metadata.name as string) ??
        null,
      avatar_url: (metadata.avatar_url as string) ?? null,
    },
    { onConflict: "id" },
  );
}
