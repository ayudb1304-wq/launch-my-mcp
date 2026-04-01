import { createAdminClient } from "@/lib/supabase/admin";
import { getPlanByProductId } from "@/lib/payments/dodo";
import { NextResponse } from "next/server";
import crypto from "crypto";

function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSig),
  );
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("webhook-signature") ?? "";
  const signingKey = process.env.DODO_SIGNING_KEY!;

  // Verify webhook signature
  if (signingKey && signature) {
    try {
      const isValid = verifyWebhookSignature(body, signature, signingKey);
      if (!isValid) {
        console.error("Invalid webhook signature");
        return NextResponse.json(
          { error: "Invalid signature" },
          { status: 401 },
        );
      }
    } catch {
      console.warn(
        "Webhook signature verification failed, continuing in test mode",
      );
    }
  }

  const event = JSON.parse(body);
  const supabase = createAdminClient();

  // Log the full event for debugging
  console.log("Dodo webhook received:", JSON.stringify(event, null, 2));

  const type = event.type as string;
  // Dodo may nest data under event.data or send it flat
  const data = event.data ?? event;

  switch (type) {
    case "subscription.active":
    case "subscription.updated": {
      // Try multiple paths for metadata — Dodo may put it at different levels
      const metadata =
        data.metadata ?? event.metadata ?? data.checkout_metadata ?? {};
      const userId =
        metadata.user_id ?? data.metadata?.user_id ?? null;

      // Product ID could be in data directly or nested
      const productId =
        data.product_id ??
        data.items?.[0]?.product_id ??
        data.plan?.product_id ??
        null;

      // Also try to find user by email if metadata is missing
      const customerEmail =
        data.customer?.email ?? data.email ?? null;

      console.log(
        `Webhook ${type}: userId=${userId}, productId=${productId}, email=${customerEmail}`,
      );

      let resolvedUserId = userId;

      // If no user_id in metadata, look up by email
      if (!resolvedUserId && customerEmail) {
        const { data: userRow } = await supabase
          .from("users")
          .select("id")
          .eq("email", customerEmail)
          .maybeSingle();

        if (userRow) {
          resolvedUserId = userRow.id;
          console.log(`Resolved user by email: ${customerEmail} → ${resolvedUserId}`);
        }
      }

      if (!resolvedUserId) {
        console.error(
          `Cannot resolve user for ${type}. metadata:`,
          metadata,
          "customerEmail:",
          customerEmail,
        );
        break;
      }

      // Resolve plan from product ID or metadata
      let plan: string | null = null;
      if (productId) {
        plan = getPlanByProductId(productId);
      }
      if (!plan && metadata.plan) {
        plan = metadata.plan;
      }

      if (!plan) {
        console.error("Cannot determine plan. productId:", productId);
        break;
      }

      // Update user's plan
      const { error: updateError } = await supabase
        .from("users")
        .update({ plan })
        .eq("id", resolvedUserId);

      if (updateError) {
        console.error("Failed to update user plan:", updateError);
      }

      // Store subscription
      const subscriptionId =
        data.subscription_id ?? data.id ?? `sub_${Date.now()}`;

      const { error: upsertError } = await supabase
        .from("subscriptions")
        .upsert(
          {
            user_id: resolvedUserId,
            subscription_id: subscriptionId,
            product_id: productId ?? "unknown",
            plan,
            status: "active",
            current_period_start:
              data.current_period_start ?? new Date().toISOString(),
            current_period_end: data.current_period_end ?? null,
          },
          { onConflict: "user_id" },
        );

      if (upsertError) {
        console.error("Failed to upsert subscription:", upsertError);
      }

      console.log(
        `Subscription activated: user=${resolvedUserId}, plan=${plan}`,
      );
      break;
    }

    case "subscription.renewed": {
      const subscriptionId = data.subscription_id ?? data.id;
      const productId = data.product_id;

      if (subscriptionId) {
        // Update subscription record
        await supabase
          .from("subscriptions")
          .update({
            status: "active",
            product_id: productId ?? undefined,
            current_period_start:
              data.current_period_start ?? new Date().toISOString(),
            current_period_end: data.current_period_end ?? null,
          })
          .eq("subscription_id", subscriptionId);

        // Also sync the user's plan from product_id (handles plan changes)
        if (productId) {
          const plan = getPlanByProductId(productId);
          if (plan) {
            const metadata = data.metadata ?? {};
            const userId = metadata.user_id;
            const customerEmail = data.customer?.email;

            let resolvedUserId = userId;
            if (!resolvedUserId && customerEmail) {
              const { data: userRow } = await supabase
                .from("users")
                .select("id")
                .eq("email", customerEmail)
                .maybeSingle();
              resolvedUserId = userRow?.id;
            }

            if (resolvedUserId) {
              await supabase
                .from("users")
                .update({ plan })
                .eq("id", resolvedUserId);
              console.log(`Subscription renewed: user=${resolvedUserId}, plan synced to ${plan}`);
            }
          }
        }
      }
      break;
    }

    case "subscription.on_hold": {
      const subscriptionId = data.subscription_id ?? data.id;
      if (subscriptionId) {
        await supabase
          .from("subscriptions")
          .update({ status: "on_hold" })
          .eq("subscription_id", subscriptionId);
      }
      break;
    }

    case "subscription.failed": {
      const metadata =
        data.metadata ?? event.metadata ?? data.checkout_metadata ?? {};
      const userId = metadata.user_id;
      const customerEmail = data.customer?.email ?? data.email;

      let resolvedUserId = userId;
      if (!resolvedUserId && customerEmail) {
        const { data: userRow } = await supabase
          .from("users")
          .select("id")
          .eq("email", customerEmail)
          .maybeSingle();
        resolvedUserId = userRow?.id;
      }

      if (resolvedUserId) {
        await supabase
          .from("users")
          .update({ plan: "free" })
          .eq("id", resolvedUserId);

        const subscriptionId = data.subscription_id ?? data.id;
        if (subscriptionId) {
          await supabase
            .from("subscriptions")
            .update({ status: "failed" })
            .eq("subscription_id", subscriptionId);
        }
      }
      break;
    }

    case "payment.succeeded":
    case "payment.failed":
      console.log(`Payment event: ${type}`, data.payment_id ?? data.id);
      break;

    default:
      console.log(`Unhandled webhook event: ${type}`);
  }

  return NextResponse.json({ received: true });
}
