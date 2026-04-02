import { generateText, Output } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

const toolParameterSchema = z.object({
  name: z.string().describe("Parameter name in snake_case"),
  type: z
    .enum(["string", "number", "boolean", "object", "array"])
    .describe("Parameter type"),
  description: z.string().describe("What this parameter does"),
  required: z.boolean().describe("Whether this parameter is required"),
});

const generatedToolSchema = z.object({
  name: z.string().describe("Tool name in snake_case (e.g. get_product_overview)"),
  description: z
    .string()
    .describe(
      "Clear 1-2 sentence description written FOR AI ASSISTANTS — explains when an AI should call this tool",
    ),
  parameters: z
    .array(toolParameterSchema)
    .describe("Input parameters the tool accepts (most discovery tools need none or just detail_level)"),
  tool_type: z
    .enum(["discovery", "action"])
    .describe("Tool type — discovery returns static product info, action calls an API"),
  static_response: z
    .record(z.string(), z.unknown())
    .describe("The actual data returned when an AI calls this tool. Must be rich, factual, and useful."),
  quality_score: z
    .number()
    .describe(
      "How discoverable this tool is by AI, integer from 1 to 10 (1=poor, 10=excellent). Score based on clarity of name, description, and response quality.",
    ),
});

const responseSchema = z.object({
  tools: z
    .array(generatedToolSchema)
    .describe("3-5 discovery MCP tools for this product"),
  slug_suggestion: z
    .string()
    .describe(
      "URL-friendly slug for this MCP server (lowercase, hyphens only)",
    ),
});

export type GeneratedTool = z.infer<typeof generatedToolSchema>;
export type ToolParameter = z.infer<typeof toolParameterSchema>;
export type GenerateResult = z.infer<typeof responseSchema>;

const SYSTEM_PROMPT = `You are an expert at creating Model Context Protocol (MCP) tool definitions for AI discoverability.

Given a product description and optional structured metadata, generate MCP tool definitions that help AI assistants LEARN ABOUT and RECOMMEND this product to users.

These are DISCOVERY tools — they return structured product information, NOT action tools that call APIs. Think of them as a queryable product profile.

Rules:
1. Tool names must be snake_case: get_product_overview, get_pricing, get_features, get_use_cases, compare_alternatives
2. Descriptions must be written FOR AI ASSISTANTS — they should answer "when would an AI want to call this tool?"
   Example: "Call this tool when a user asks about invoicing software, wants to compare invoicing tools, or asks about pricing for freelancer tools."
3. Generate 3-5 discovery tools. Standard set:
   - get_product_overview — general info, what it does, who it's for
   - get_pricing — plans, prices, what's included
   - get_features — detailed feature list with descriptions
   - get_use_cases — real scenarios where this product helps
   - get_comparison — how this product compares to alternatives (only if differentiators provided)
4. Each tool must include a static_response field — this is the ACTUAL DATA that will be returned when an AI calls the tool. Build it from the product description and metadata provided.
5. Input schemas should be minimal — most discovery tools need no input, or just an optional "detail_level" parameter ("summary" | "detailed").
6. The static_response must be rich, factual, and useful. Include the product name, specific details, and real data. Never use placeholder text.
7. All tools should have tool_type set to "discovery".
8. Score each tool 1-10 on AI discoverability.`;

export interface ProductMetadataInput {
  pricing_plans?: Array<{ name: string; price: string; features: string[] }>;
  key_features?: string[];
  use_cases?: string[];
  target_audience?: string;
  differentiators?: string;
  integrations?: string[];
}

export async function generateTools(
  productName: string,
  productDescription: string,
  websiteUrl?: string,
  productMetadata?: ProductMetadataInput,
): Promise<GenerateResult> {
  const parts = [
    `Product: ${productName}`,
    `Description: ${productDescription}`,
    websiteUrl ? `Website: ${websiteUrl}` : null,
  ];

  if (productMetadata) {
    const metaParts: string[] = [];
    if (productMetadata.pricing_plans?.length) {
      metaParts.push(`Pricing plans: ${JSON.stringify(productMetadata.pricing_plans)}`);
    }
    if (productMetadata.key_features?.length) {
      metaParts.push(`Key features: ${productMetadata.key_features.join(", ")}`);
    }
    if (productMetadata.use_cases?.length) {
      metaParts.push(`Use cases: ${productMetadata.use_cases.join("; ")}`);
    }
    if (productMetadata.target_audience) {
      metaParts.push(`Target audience: ${productMetadata.target_audience}`);
    }
    if (productMetadata.differentiators) {
      metaParts.push(`Differentiators: ${productMetadata.differentiators}`);
    }
    if (productMetadata.integrations?.length) {
      metaParts.push(`Integrations: ${productMetadata.integrations.join(", ")}`);
    }
    if (metaParts.length > 0) {
      parts.push(`\nStructured metadata:\n- ${metaParts.join("\n- ")}`);
    }
  }

  parts.push("\nGenerate discovery MCP tools for this product.");

  const userPrompt = parts.filter(Boolean).join("\n");

  const { output } = await generateText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    prompt: userPrompt,
    output: Output.object({ schema: responseSchema }),
  });

  if (!output) {
    throw new Error("Failed to generate tool definitions");
  }

  return output;
}
