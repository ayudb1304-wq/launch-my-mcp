import { createClient } from "@/lib/supabase/server";
import { PLANS, type PlanId } from "@/lib/payments/plans";
import { NextResponse } from "next/server";
import { z } from "zod";

const toolSchema = z.object({
  name: z.string(),
  description: z.string(),
  parameters: z.array(
    z.object({
      name: z.string(),
      type: z.enum(["string", "number", "boolean", "object", "array"]),
      description: z.string(),
      required: z.boolean(),
    }),
  ),
  enabled: z.boolean(),
  quality_score: z.number().min(1).max(10),
});

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(60),
  description: z.string().min(10).max(1000),
  website_url: z.string().url().optional().or(z.literal("")),
  tools: z.array(toolSchema).min(1),
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

  const { name, slug, description, website_url, tools } = parsed.data;

  // Check plan limits
  const { data: userData } = await supabase
    .from("users")
    .select("plan")
    .eq("id", user.id)
    .single();

  const userPlan = (userData?.plan as PlanId) ?? "free";
  const planLimits = PLANS[userPlan].limits;

  const { count: projectCount } = await supabase
    .from("mcp_projects")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if ((projectCount ?? 0) >= planLimits.maxServers) {
    return NextResponse.json(
      {
        error: "plan_limit",
        message: `Your ${PLANS[userPlan].name} plan allows ${planLimits.maxServers} MCP server${planLimits.maxServers > 1 ? "s" : ""}. Upgrade to create more.`,
        current_plan: userPlan,
        limit: planLimits.maxServers,
      },
      { status: 403 },
    );
  }

  // Check slug uniqueness
  const { data: existing } = await supabase
    .from("mcp_projects")
    .select("id")
    .eq("slug", slug)
    .maybeSingle();

  if (existing) {
    return NextResponse.json(
      { error: "This slug is already taken. Please choose another." },
      { status: 409 },
    );
  }

  // Create project
  const { data: project, error: projectError } = await supabase
    .from("mcp_projects")
    .insert({
      user_id: user.id,
      name,
      slug,
      description,
      website_url: website_url || null,
      status: "live",
    })
    .select("id")
    .single();

  if (projectError || !project) {
    console.error("Project creation failed:", projectError);
    return NextResponse.json(
      { error: "Failed to create project." },
      { status: 500 },
    );
  }

  // Insert tools
  const toolRows = tools
    .filter((t) => t.enabled)
    .map((t) => ({
      project_id: project.id,
      name: t.name,
      description: t.description,
      parameters: t.parameters,
      quality_score: t.quality_score,
      enabled: true,
    }));

  const { error: toolsError } = await supabase
    .from("mcp_tools")
    .insert(toolRows);

  if (toolsError) {
    console.error("Tool insertion failed:", toolsError);
    // Clean up the project
    await supabase.from("mcp_projects").delete().eq("id", project.id);
    return NextResponse.json(
      { error: "Failed to save tools." },
      { status: 500 },
    );
  }

  return NextResponse.json({ project_id: project.id, slug });
}
