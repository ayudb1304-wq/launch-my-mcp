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
  name: z.string().describe("Tool name in snake_case (e.g. search_products)"),
  description: z
    .string()
    .describe(
      "Clear 1-2 sentence description of what this tool does, written so an AI assistant understands when to use it",
    ),
  parameters: z
    .array(toolParameterSchema)
    .describe("Input parameters the tool accepts"),
  quality_score: z
    .number()
    .describe(
      "How discoverable this tool is by AI, integer from 1 to 10 (1=poor, 10=excellent). Score based on clarity of name, description, and parameter naming.",
    ),
});

const responseSchema = z.object({
  tools: z
    .array(generatedToolSchema)
    .describe("3-6 MCP tools for this product"),
  slug_suggestion: z
    .string()
    .describe(
      "URL-friendly slug for this MCP server (lowercase, hyphens only)",
    ),
});

export type GeneratedTool = z.infer<typeof generatedToolSchema>;
export type ToolParameter = z.infer<typeof toolParameterSchema>;
export type GenerateResult = z.infer<typeof responseSchema>;

const SYSTEM_PROMPT = `You are an expert at designing MCP (Model Context Protocol) tool definitions that make products discoverable by AI assistants like Claude, ChatGPT, and Perplexity.

Given a product description, generate 3-6 MCP tools that would make this product useful to AI assistants. Each tool should represent a distinct action users would want an AI to perform.

Guidelines for high-quality tools:
- Tool names should be clear verbs in snake_case (e.g., search_restaurants, create_invoice)
- Descriptions should explain WHEN and WHY an AI would use this tool, not just what it does
- Parameters should have descriptive names and clear types
- Include both "discovery" tools (search, list, find) and "action" tools (create, book, send)
- Score each tool 1-10 on AI discoverability based on name clarity, description quality, and parameter design

For the slug, suggest a short URL-friendly identifier (e.g., "invoicehero", "tableready").`;

export async function generateTools(
  productName: string,
  productDescription: string,
  websiteUrl?: string,
): Promise<GenerateResult> {
  const userPrompt = [
    `Product: ${productName}`,
    `Description: ${productDescription}`,
    websiteUrl ? `Website: ${websiteUrl}` : null,
  ]
    .filter(Boolean)
    .join("\n");

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
