import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { MetricsBar } from "@/components/dashboard/MetricsBar";
import { MCPServerCard } from "@/components/dashboard/MCPServerCard";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: projects } = await supabase
    .from("mcp_projects")
    .select("id, name, slug, description, status, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (!projects || projects.length === 0) {
    redirect("/onboard");
  }

  // Get event counts per project
  const projectIds = projects.map((p) => p.id);
  const { data: eventCounts } = await supabase
    .from("discovery_events")
    .select("project_id")
    .in("project_id", projectIds);

  const countsMap: Record<string, number> = {};
  for (const event of eventCounts ?? []) {
    countsMap[event.project_id] = (countsMap[event.project_id] ?? 0) + 1;
  }

  const projectsWithCounts = projects.map((p) => ({
    ...p,
    event_count: countsMap[p.id] ?? 0,
  }));

  const totalEvents = projectsWithCounts.reduce(
    (sum, p) => sum + p.event_count,
    0,
  );
  const liveServers = projects.filter((p) => p.status === "live").length;

  return (
    <div className="p-6 lg:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Monitor your MCP servers and AI discovery events.
          </p>
        </div>
        <Link href="/onboard">
          <Button className="bg-mcpl-cyan text-mcpl-deep hover:bg-mcpl-cyan/90">
            <Plus className="mr-2 h-4 w-4" />
            New Server
          </Button>
        </Link>
      </div>

      <MetricsBar
        totalEvents={totalEvents}
        liveServers={liveServers}
        totalServers={projects.length}
      />

      <div className="mt-8 space-y-4">
        {projectsWithCounts.map((project) => (
          <MCPServerCard key={project.id} project={project} />
        ))}
      </div>
    </div>
  );
}
