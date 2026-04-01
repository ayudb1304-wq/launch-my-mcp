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
      <h1 className="font-heading text-2xl font-bold text-white">Settings</h1>
      <p className="mt-1 text-sm text-gray-400">
        Manage your account and subscription.
      </p>

      <div className="mt-8 max-w-3xl space-y-6">
        {/* Account card */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <h2 className="text-lg font-medium text-white">Account</h2>
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between rounded-lg bg-gray-900/50 px-4 py-3">
              <span className="text-sm text-gray-400">Email</span>
              <span className="text-sm text-white">{user.email}</span>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-gray-900/50 px-4 py-3">
              <span className="text-sm text-gray-400">Auth provider</span>
              <span className="text-sm text-white">
                {user.app_metadata.provider ?? "email"}
              </span>
            </div>
          </div>
        </div>

        {/* Current Plan */}
        <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">
              Current Plan
            </h2>
            <Badge
              className={
                plan === "free"
                  ? "bg-gray-500/20 text-gray-400"
                  : plan === "starter"
                    ? "bg-mcpl-cyan/20 text-mcpl-cyan"
                    : "bg-mcpl-green/20 text-mcpl-green"
              }
            >
              {currentPlan.name}
            </Badge>
          </div>
          <div className="mt-3 flex items-baseline gap-1">
            <span className="text-3xl font-bold text-white">
              {currentPlan.price}
            </span>
            <span className="text-sm text-gray-400">{currentPlan.period}</span>
          </div>
          <div className="mt-3 text-sm text-gray-400">
            {currentPlan.limits.maxServers} MCP server
            {currentPlan.limits.maxServers > 1 ? "s" : ""} &middot;{" "}
            {currentPlan.limits.maxEventsPerMonth === -1
              ? "Unlimited"
              : currentPlan.limits.maxEventsPerMonth.toLocaleString()}{" "}
            events/month
          </div>
          {subscription && (
            <div className="mt-3 text-xs text-gray-500">
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

        {/* Upgrade Plans */}
        {plan === "free" && (
          <div>
            <h2 className="mb-4 text-lg font-medium text-white">
              Upgrade your plan
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {upgradePlans.map(([id, p]) => (
                <div
                  key={id}
                  className={`rounded-lg border p-6 ${
                    id === "starter"
                      ? "border-mcpl-cyan/30 bg-mcpl-cyan/5"
                      : "border-gray-800 bg-gray-900/50"
                  }`}
                >
                  <h3 className="font-heading text-lg font-bold text-white">
                    {p.name}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">
                      {p.price}
                    </span>
                    <span className="text-sm text-gray-400">{p.period}</span>
                  </div>
                  <ul className="mt-4 space-y-2">
                    {p.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-center gap-2 text-sm text-gray-300"
                      >
                        <Check className="h-4 w-4 shrink-0 text-mcpl-cyan" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`mt-6 w-full ${
                      id === "starter"
                        ? "bg-mcpl-cyan text-mcpl-deep hover:bg-mcpl-cyan/90"
                        : "bg-white/10 text-white hover:bg-white/20"
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
