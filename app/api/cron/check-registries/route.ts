// Batch indexing check for all projects with pending registry submissions.
// Can be called by: Vercel Cron (Pro plan), external cron service, or manually.
// Auth: CRON_SECRET Bearer token if set, otherwise open (protect via Vercel/firewall).

import { createAdminClient } from "@/lib/supabase/admin";
import { checkAllRegistries } from "@/lib/registries/check-indexed";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // If CRON_SECRET is configured, enforce it
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const supabase = createAdminClient();

  // Find all projects that have at least one registry in "submitted" status
  const { data: projects, error } = await supabase
    .from("mcp_projects")
    .select("id, slug, propagation_status")
    .eq("status", "live")
    .not("propagation_status", "is", null);

  if (error || !projects) {
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 },
    );
  }

  // Filter to projects that have submitted (not yet indexed) registries
  const pendingProjects = projects.filter((p) => {
    const registries = p.propagation_status?.registries;
    if (!registries) return false;
    return Object.values(registries).some(
      (r) => (r as { status: string }).status === "submitted",
    );
  });

  let checked = 0;
  let newlyIndexed = 0;

  for (const project of pendingProjects) {
    const results = await checkAllRegistries(project.id);
    checked++;
    newlyIndexed += Object.values(results).filter((r) => r.indexed).length;
  }

  return NextResponse.json({
    checked,
    newlyIndexed,
    timestamp: new Date().toISOString(),
  });
}
