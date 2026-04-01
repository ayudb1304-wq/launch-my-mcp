import { anthropic } from "@ai-sdk/anthropic";
import { generateText, Output } from "ai";
import { z } from "zod";
import { DEMO_PRESETS } from "@/lib/demo-presets";

const requestSchema = z.object({
  description: z.string().min(20),
  api_base_url: z.string().url(),
});

const toolSchema = z.object({
  name: z.string(),
  description: z.string(),
  http_method: z.enum(["GET", "POST", "PUT", "DELETE", "PATCH"]),
  endpoint_path: z.string(),
});

const responseSchema = z.object({
  tools: z.array(toolSchema),
  demo_query: z.string(),
  demo_response: z.string(),
});

// Simple in-memory rate limiting (per IP, 3/hour for real API calls)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + 3600_000 });
    return false;
  }
  const limit = process.env.NODE_ENV === "development" ? 50 : 3;
  if (entry.count >= limit) return true;
  entry.count++;
  return false;
}

// Check if input exactly matches a preset
function findPreset(description: string, apiUrl: string) {
  return DEMO_PRESETS.find(
    (preset) =>
      preset.description === description && preset.api_base_url === apiUrl,
  );
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: "Invalid input", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { description, api_base_url } = parsed.data;

  // 1. Check for preset match (free, instant)
  const preset = findPreset(description, api_base_url);
  if (preset) {
    return Response.json(preset.result);
  }

  // 2. Rate limit only applies to real API calls
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  if (isRateLimited(ip)) {
    return Response.json(
      { error: "Rate limit exceeded. Try again in an hour." },
      { status: 429 },
    );
  }

  // 3. Custom input — use Haiku (10x cheaper than Sonnet)
  try {
    const result = await generateText({
      model: anthropic("claude-haiku-4-5"),
      output: Output.object({ schema: responseSchema }),
      system: `You are an expert at creating Model Context Protocol (MCP) tool definitions.
Given a product description and API base URL, generate MCP tool definitions
that will make AI assistants naturally discover and use this product.

Rules:
1. Tool names must be snake_case, action-oriented: search_products, create_invoice, get_weather
2. Tool descriptions must be written FOR AI ASSISTANTS, not humans.
   They should answer "when would an AI want to call this tool?"
3. Generate 3-5 tools. Quality over quantity.
4. Endpoint paths should be realistic REST paths based on the product description.
5. Also generate a demo_query (a natural question a user might ask an AI that would trigger these tools)
   and a demo_response (a natural response the AI would give after using the tools).
6. The demo_response should mention the product by name and feel helpful and natural.`,
      prompt: `Product description: ${description}
API base URL: ${api_base_url}

Generate MCP tool definitions, a demo query, and a demo response for this product.`,
    });

    return Response.json(result.output);
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("Claude API error:", msg);
    return Response.json(
      { error: "Failed to generate MCP tools. Please try again." },
      { status: 500 },
    );
  }
}
