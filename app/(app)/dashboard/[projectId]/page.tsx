import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { ProjectDetail } from "@/components/dashboard/ProjectDetail";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: project } = await supabase
    .from("mcp_projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    notFound();
  }

  const { data: tools } = await supabase
    .from("mcp_tools")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  const { data: events } = await supabase
    .from("discovery_events")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })
    .limit(50);

  const { count: totalEvents } = await supabase
    .from("discovery_events")
    .select("*", { count: "exact", head: true })
    .eq("project_id", projectId);

  return (
    <ProjectDetail
      project={project}
      tools={tools ?? []}
      events={events ?? []}
      totalEvents={totalEvents ?? 0}
    />
  );
}
