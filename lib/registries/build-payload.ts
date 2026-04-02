// Builds a standard submission payload from project + tools data

export interface RegistrySubmissionPayload {
  name: string;
  slug: string;
  description: string;
  serverUrl: string;
  transport: "streamable-http";
  tools: Array<{
    name: string;
    description: string;
    inputSchema: Record<string, unknown>;
  }>;
  homepage?: string;
}

interface ProjectData {
  name: string;
  slug: string;
  description: string;
  product_website?: string | null;
}

interface ToolData {
  name: string;
  description: string;
  parameters: Array<{
    name: string;
    type: string;
    description: string;
    required: boolean;
  }>;
  enabled: boolean;
}

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://launchmymcp.com";

export function buildSubmissionPayload(
  project: ProjectData,
  tools: ToolData[],
): RegistrySubmissionPayload {
  const enabledTools = tools.filter((t) => t.enabled);

  return {
    name: project.name,
    slug: project.slug,
    description: project.description,
    serverUrl: `${BASE_URL}/api/mcp/${project.slug}/mcp`,
    transport: "streamable-http",
    tools: enabledTools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: {
        type: "object",
        properties: Object.fromEntries(
          t.parameters.map((p) => [
            p.name,
            { type: p.type, description: p.description },
          ]),
        ),
        required: t.parameters
          .filter((p) => p.required)
          .map((p) => p.name),
      },
    })),
    homepage: project.product_website || undefined,
  };
}
