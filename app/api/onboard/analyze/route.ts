import { createClient } from "@/lib/supabase/server";
import { generateTools } from "@/lib/mcp/generator";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(10).max(1000),
  website_url: z.string().url().optional().or(z.literal("")),
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
