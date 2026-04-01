import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const supabase = createAdminClient();

  // Get all live MCP servers
  const { data: projects } = await supabase
    .from("mcp_projects")
    .select("name, slug, description")
    .eq("status", "live")
    .order("created_at", { ascending: true });

  if (!projects || projects.length === 0) {
    return NextResponse.json({ servers: [] });
  }

  const origin = new URL(request.url).origin;

  const servers = projects.map((project) => ({
    name: project.name,
    description: project.description,
    url: `${origin}/api/mcp/${project.slug}/mcp`,
    transport: "streamable-http",
  }));

  return NextResponse.json(
    { servers },
    {
      headers: {
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    },
  );
}
