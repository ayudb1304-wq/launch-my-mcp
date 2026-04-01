import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/app/AppShell";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Load user's projects for sidebar
  const { data: projects } = await supabase
    .from("mcp_projects")
    .select("id, name, slug, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <AppShell email={user.email ?? ""} projects={projects ?? []}>
      {children}
    </AppShell>
  );
}
