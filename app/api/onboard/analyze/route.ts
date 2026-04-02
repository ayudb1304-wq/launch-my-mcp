import { createClient } from "@/lib/supabase/server";
import { generateTools } from "@/lib/mcp/generator";
import { NextResponse } from "next/server";
import { z } from "zod";

const pricingPlanSchema = z.object({
  name: z.string(),
  price: z.string(),
  features: z.array(z.string()),
});

const productMetadataSchema = z.object({
  pricing_plans: z.array(pricingPlanSchema).optional().default([]),
  key_features: z.array(z.string()).optional().default([]),
  use_cases: z.array(z.string()).optional().default([]),
  target_audience: z.string().optional().default(""),
  differentiators: z.string().optional().default(""),
  integrations: z.array(z.string()).optional().default([]),
});

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  website_url: z.string().url().optional().or(z.literal("")),
  product_metadata: productMetadataSchema.optional(),
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

  try {
    const result = await generateTools(
      parsed.data.name,
      parsed.data.description,
      parsed.data.website_url || undefined,
      parsed.data.product_metadata,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Tool generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate tools. Please try again." },
      { status: 500 },
    );
  }
}
