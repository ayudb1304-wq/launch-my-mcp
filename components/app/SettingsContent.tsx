"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PLANS, type PlanId } from "@/lib/payments/plans";
import { Check, Loader2, ExternalLink } from "lucide-react";
import type { User } from "@supabase/supabase-js";

interface Subscription {
  subscription_id: string;
  plan: string;
  status: string;
  current_period_end: string | null;
}

export function SettingsContent({
  user,
  plan,
  subscription,
}: {
  user: User;
  plan: string;
  subscription: Subscription | null;
}) {
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(targetPlan: PlanId) {
    setLoading(targetPlan);
    try {
      const res = await fetch("/api/payments/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: targetPlan }),
      });
      const data = await res.json();
      if (data.checkout_url) {
        window.location.href = data.checkout_url;
      }
    } catch {
      setLoading(null);
    }
  }

  const currentPlan = PLANS[plan as PlanId] ?? PLANS.free;
  const upgradePlans = (
    Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]
  ).filter(([id]) => id !== "free");

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your account and subscription.
      </p>

      <div className="mt-8 max-w-3xl space-y-6">
        {/* Account card */}
        <div className="rounded-lg bg-card p-6 ring-1 ring-foreground/10">
          <h2 className="text-lg font-medium text-foreground">Account</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">Email</span>
              <span className="text-sm text-foreground">{user.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-3">
              <span className="text-sm text-muted-foreground">Auth provider</span>
              <span className="text-sm text-foreground">
                {user.app_metadata.provider ?? "email"}
              </span>
            </div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="rounded-lg bg-card p-6 ring-1 ring-foreground/10">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-foreground">
              Current Plan
            </h2>
            <Badge
              className={
                plan === "free"
                  ? "bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500"
                  : plan === "starter"
                    ? "bg-primary/10 text-primary"
                    : "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400"
              }
            >
              {currentPlan.name}
            </Badge>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-foreground">
              {currentPlan.price}
            </span>
            <span className="text-sm text-muted-foreground">{currentPlan.period}</span>
          </div>
          <div className="mt-3 text-sm text-muted-foreground">
            {currentPlan.limits.maxServers} MCP server
            {currentPlan.limits.maxServers > 1 ? "s" : ""} &middot;{" "}
            {currentPlan.limits.maxEventsPerMonth === -1
              ? "Unlimited"
              : currentPlan.limits.maxEventsPerMonth.toLocaleString()}{" "}
            events/month
          </div>
          {subscription && (
            <div className="mt-3 text-xs text-muted-foreground">
              Status: {subscription.status}
              {subscription.current_period_end && (
                <>
                  {" "}
                  &middot; Renews{" "}
                  {new Date(
                    subscription.current_period_end,
                  ).toLocaleDateString()}
                </>
              )}
            </div>
          )}
        </div>

        {/* Upgrade Plans — show plans higher than current */}
        {plan !== "super" && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-foreground">
              Upgrade your plan
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {upgradePlans.filter(([id]) => {
                if (plan === "free") return true;
                if (plan === "starter") return id === "super";
                return false;
              }).map(([id, p]) => (
                <div
                  key={id}
                  className={`rounded-lg p-6 ring-1 ${
                    id === "starter"
                      ? "bg-primary/5 ring-primary/30"
                      : "bg-card ring-foreground/10"
                  }`}
                >
                  <h3 className="text-lg font-bold text-foreground">
                    {p.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-foreground">
                      {p.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{p.period}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-6 w-full ${
                      id === "starter"
                        ? ""
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    }`}
                    disabled={loading !== null}
                    onClick={() => handleUpgrade(id)}
                  >
                    {loading === id ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <ExternalLink className="mr-2 h-4 w-4" />
                    )}
                    Upgrade to {p.name}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
