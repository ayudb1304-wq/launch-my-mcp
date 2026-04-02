import { createClient } from "@/lib/supabase/server";
import { checkAndUpdateRegistry } from "@/lib/registries/check-indexed";
import { type RegistryId } from "@/lib/registries/config";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  projectId: z.string().uuid(),
  registryId: z.enum(["smithery", "mcp_so", "glama", "pulsemcp"]),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = bodySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { projectId, registryId } = parsed.data;

  // Verify user owns the project
  const { data: project } = await supabase
    .from("mcp_projects")
    .select("id, user_id")
    .eq("id", projectId)
    .eq("user_id", user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const result = await checkAndUpdateRegistry(
    projectId,
    registryId as RegistryId,
  );
  return NextResponse.json(result);
}
