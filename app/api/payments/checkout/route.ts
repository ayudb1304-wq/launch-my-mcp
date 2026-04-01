import { createClient } from "@/lib/supabase/server";
import { dodo, getProductId } from "@/lib/payments/dodo";
import { NextResponse } from "next/server";
import { z } from "zod";

const bodySchema = z.object({
  plan: z.enum(["starter", "super"]),
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
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const productId = getProductId(parsed.data.plan);

  try {
    const origin =
      request.headers.get("origin") ?? "http://localhost:3000";

    const session = await dodo.checkoutSessions.create({
      product_cart: [{ product_id: productId, quantity: 1 }],
      customer: {
        email: user.email!,
        name: user.user_metadata?.full_name ?? user.email!,
      },
      return_url: `${origin}/settings?upgraded=true`,
      metadata: {
        user_id: user.id,
        plan: parsed.data.plan,
      },
    });

    return NextResponse.json({ checkout_url: session.checkout_url });
  } catch (error) {
    console.error("Checkout creation failed:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 },
    );
  }
}
