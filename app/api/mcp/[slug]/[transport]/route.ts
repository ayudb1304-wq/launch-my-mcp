import { createMcpHandler } from "mcp-handler";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

// Build a Zod schema from stored parameter definitions
function buildInputSchema(
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>,
): Record<string, z.ZodTypeAny> {
  const schema: Record<string, z.ZodTypeAny> = {};

  for (const param of parameters) {
    let field: z.ZodTypeAny;
    switch (param.type) {
      case "number":
        field = z.number();
        break;
      case "boolean":
        field = z.boolean();
        break;
      case "array":
        field = z.array(z.unknown());
        break;
      case "object":
        field = z.record(z.string(), z.unknown());
        break;
      default:
        field = z.string();
    }

    field = field.describe(param.description);
    schema[param.name] = param.required ? field : field.optional();
  }

  return schema;
}

async function handleRequest(
  request: Request,
  { params }: { params: Promise<{ slug: string; transport: string }> },
) {
  const { slug } = await params;
  const supabase = createAdminClient();

  // Load project
  const { data: project } = await supabase
    .from("mcp_projects")
    .select("id, name, description, status")
    .eq("slug", slug)
    .eq("status", "live")
    .single();

  if (!project) {
    return new Response(
      JSON.stringify({ error: "MCP server not found or not live" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Load tools
  const { data: tools } = await supabase
    .from("mcp_tools")
    .select("*")
    .eq("project_id", project.id)
    .eq("enabled", true);

  if (!tools || tools.length === 0) {
    return new Response(
      JSON.stringify({ error: "No tools available for this MCP server" }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  // Create MCP handler with dynamic tools
  const handler = createMcpHandler(
    (server: McpServer) => {
      for (const tool of tools) {
        const inputSchema = buildInputSchema(
          tool.parameters as Array<{
            name: string;
            type: string;
            description: string;
            required: boolean;
          }>,
        );

        server.registerTool(
          tool.name,
          {
            description: tool.description,
            inputSchema,
          },
          async (args: Record<string, unknown>) => {
            const startTime = Date.now();

            try {
              // Log discovery event
              await supabase.from("discovery_events").insert({
                project_id: project.id,
                tool_name: tool.name,
                ai_client: request.headers.get("user-agent") ?? "unknown",
                latency_ms: Date.now() - startTime,
                status: "success",
              });

              return {
                content: [
                  {
                    type: "text" as const,
                    text: JSON.stringify({
                      tool: tool.name,
                      description: tool.description,
                      message: `Tool "${tool.name}" from ${project.name} was called successfully. This MCP server is hosted by MCPLaunch.`,
                      args,
                    }),
                  },
                ],
              };
            } catch (error) {
              await supabase.from("discovery_events").insert({
                project_id: project.id,
                tool_name: tool.name,
                ai_client: request.headers.get("user-agent") ?? "unknown",
                latency_ms: Date.now() - startTime,
                status: "error",
              });

              return {
                content: [
                  {
                    type: "text" as const,
                    text: `Error executing tool: ${error instanceof Error ? error.message : "Unknown error"}`,
                  },
                ],
                isError: true,
              };
            }
          },
        );
      }
    },
    {
      serverInfo: {
        name: `mcplaunch-${slug}`,
        version: "1.0.0",
      },
    },
    {
      basePath: `/api/mcp/${slug}`,
      maxDuration: 60,
    },
  );

  return handler(request);
}

export { handleRequest as GET, handleRequest as POST, handleRequest as DELETE };
