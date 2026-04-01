import DodoPayments from "dodopayments";

// Server-only — do not import from client components
export const dodo = new DodoPayments({
  bearerToken: process.env.DODO_API_KEY!,
  environment: "test_mode",
});

// Map product IDs to plan IDs
const PRODUCT_TO_PLAN: Record<string, string> = {
  [process.env.STARTER_PRODUCT_ID!]: "starter",
  [process.env.SUPER_PRODUCT_ID!]: "super",
};

export function getPlanByProductId(productId: string): string | null {
  return PRODUCT_TO_PLAN[productId] ?? null;
}

export function getProductId(plan: "starter" | "super"): string {
  return plan === "starter"
    ? process.env.STARTER_PRODUCT_ID!
    : process.env.SUPER_PRODUCT_ID!;
}
