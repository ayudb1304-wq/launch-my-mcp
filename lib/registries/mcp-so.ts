// mcp.so registry adapter — submits via GitHub Issue on chatmcp/mcpso

import { RegistrySubmissionPayload } from "./build-payload";
import { getListingUrl } from "./config";

const REPO_OWNER = "chatmcp";
const REPO_NAME = "mcpso";

interface McpSoResult {
  success: boolean;
  listingUrl?: string;
  issueUrl?: string;
  error?: string;
}

export async function submit(
  payload: RegistrySubmissionPayload,
): Promise<McpSoResult> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    return { success: false, error: "GITHUB_TOKEN not configured" };
  }

  const toolList = payload.tools
    .map((t) => `- **${t.name}**: ${t.description}`)
    .join("\n");

  const issueTitle = `[Submit] ${payload.name} — ${payload.description.slice(0, 80)}`;
  const issueBody = `## MCP Server Submission

**Name:** ${payload.name}
**Server URL:** ${payload.serverUrl}
**Transport:** ${payload.transport}
**Homepage:** ${payload.homepage || "N/A"}

### Description
${payload.description}

### Tools (${payload.tools.length})
${toolList}

### Connection Info
\`\`\`json
{
  "url": "${payload.serverUrl}",
  "transport": "${payload.transport}"
}
\`\`\`

---
*Submitted automatically by [Launch My MCP](https://launchmymcp.com)*`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/issues`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: issueTitle,
          body: issueBody,
        }),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      return {
        success: false,
        error: `GitHub issue creation failed (${res.status}): ${err}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      listingUrl: getListingUrl("mcp_so", payload.slug),
      issueUrl: data.html_url,
    };
  } catch (err) {
    return {
      success: false,
      error: `mcp.so submission error: ${err instanceof Error ? err.message : String(err)}`,
    };
  }
}

export async function checkIndexed(
  slug: string,
): Promise<{ indexed: boolean; listingUrl?: string }> {
  try {
    // Check if the listing page exists on mcp.so
    const url = getListingUrl("mcp_so", slug);
    const res = await fetch(url, {
      method: "HEAD",
      signal: AbortSignal.timeout(10_000),
    });

    if (res.ok) {
      return { indexed: true, listingUrl: url };
    }
    return { indexed: false };
  } catch {
    return { indexed: false };
  }
}
