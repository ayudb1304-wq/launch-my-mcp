export type PlanId = "free" | "starter" | "super";

export const PLANS: Record<
  PlanId,
  {
    name: string;
    price: string;
    period: string;
    limits: { maxServers: number; maxEventsPerMonth: number };
    features: string[];
  }
> = {
  free: {
    name: "Free",
    price: "$0",
    period: "forever",
    limits: { maxServers: 1, maxEventsPerMonth: 50 },
    features: ["1 MCP server", "50 events/month", "Community support"],
  },
  starter: {
    name: "Starter",
    price: "$29",
    period: "/mo",
    limits: { maxServers: 3, maxEventsPerMonth: 5000 },
    features: [
      "3 MCP servers",
      "5,000 events/month",
      "Priority support",
      "Analytics dashboard",
      "Custom slug",
    ],
  },
  super: {
    name: "Super",
    price: "$49",
    period: "/mo",
    limits: { maxServers: 10, maxEventsPerMonth: -1 },
    features: [
      "10 MCP servers",
      "Unlimited events",
      "Auto registry submission",
      "Health monitoring",
      "Full analytics",
      "Priority support",
    ],
  },
};
