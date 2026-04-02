"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/onboard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { FieldTooltip } from "./FieldTooltip";
import {
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  X,
  Pencil,
  RotateCcw,
  Lock,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Eye,
} from "lucide-react";
import { PLANS, type PlanId } from "@/lib/payments/plans";

const FRIENDLY_NAMES: Record<string, string> = {
  get_product_overview: "Product Overview",
  get_pricing: "Pricing & Plans",
  get_features: "Features",
  get_use_cases: "Use Cases",
  get_comparison: "How You Compare",
  compare_alternatives: "How You Compare",
  get_integrations: "Integrations",
};

function getFriendlyName(toolName: string): string {
  return (
    FRIENDLY_NAMES[toolName] ??
    toolName
      .replace(/^get_/, "")
      .replace(/_/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

function formatStaticResponse(data: Record<string, unknown>): string {
  const lines: string[] = [];

  function format(obj: unknown, indent = 0): void {
    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === "object" && item !== null) {
          format(item, indent);
          lines.push("");
        } else {
          lines.push(`${"  ".repeat(indent)}• ${item}`);
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const [key, value] of Object.entries(obj)) {
        const label = key
          .replace(/_/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase());
        if (typeof value === "string" || typeof value === "number") {
          lines.push(`${"  ".repeat(indent)}${label}: ${value}`);
        } else if (Array.isArray(value) && value.every((v) => typeof v === "string")) {
          lines.push(`${"  ".repeat(indent)}${label}: ${value.join(", ")}`);
        } else {
          lines.push(`${"  ".repeat(indent)}${label}:`);
          format(value, indent + 1);
        }
      }
    } else {
      lines.push(`${"  ".repeat(indent)}${obj}`);
    }
  }

  format(data);
  return lines.filter((l) => l.trim()).join("\n");
}

function QualityBadge({ score }: { score: number }) {
  if (score >= 8)
    return (
      <Badge className="bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400">
        Excellent ({score}/10)
      </Badge>
    );
  if (score >= 5)
    return (
      <Badge className="bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
        Good ({score}/10)
      </Badge>
    );
  return (
    <Badge className="bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400">
      Needs work ({score}/10)
    </Badge>
  );
}

export function StepReview() {
  const store = useOnboardStore();
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState(store.slug);
  const [editingDesc, setEditingDesc] = useState<number | null>(null);
  const [descInput, setDescInput] = useState("");
  const [expandedPreviews, setExpandedPreviews] = useState<Set<number>>(
    new Set(),
  );
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallPlan, setPaywallPlan] = useState<PlanId>("free");
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  const enabledCount = store.tools.filter((t) => t.enabled).length;

  function togglePreview(index: number) {
    setExpandedPreviews((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  async function handleUpgrade(targetPlan: PlanId) {
    setUpgradeLoading(targetPlan);
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
      setUpgradeLoading(null);
    }
  }

  async function handleSave() {
    if (enabledCount === 0) return;

    store.setSaving(true);

    try {
      const res = await fetch("/api/onboard/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: store.name,
          slug: store.slug,
          description: store.description,
          website_url: store.websiteUrl || undefined,
          product_metadata: store.productMetadata,
          tools: store.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
            enabled: t.enabled,
            quality_score: t.quality_score,
            tool_type: t.tool_type ?? "discovery",
            static_response: t.static_response,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.error === "plan_limit") {
          store.setSaving(false);
          setPaywallPlan(data.current_plan);
          setShowPaywall(true);
          return;
        }
        throw new Error(data.message || data.error || "Save failed");
      }

      const { project_id } = await res.json();
      store.setProjectId(project_id);
    } catch (err) {
      store.setSaveError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }

  function saveSlug() {
    const cleaned = slugInput
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
    store.setSlug(cleaned);
    setSlugInput(cleaned);
    setEditingSlug(false);
  }

  function startEditDesc(index: number) {
    setEditingDesc(index);
    setDescInput(store.tools[index].description);
  }

  function saveDesc(index: number) {
    store.updateToolDescription(index, descInput);
    setEditingDesc(null);
  }

  // Paywall overlay
  if (showPaywall) {
    const currentPlanInfo = PLANS[paywallPlan];
    const upgradePlans = (
      Object.entries(PLANS) as [PlanId, (typeof PLANS)[PlanId]][]
    ).filter(([id]) => {
      if (paywallPlan === "free") return id !== "free";
      if (paywallPlan === "starter") return id === "super";
      return false;
    });

    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 dark:bg-amber-950">
            <Lock className="h-7 w-7 text-amber-600 dark:text-amber-400" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            Upgrade to deploy more servers
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Your {currentPlanInfo.name} plan includes{" "}
            {currentPlanInfo.limits.maxServers} AI server
            {currentPlanInfo.limits.maxServers > 1 ? "s" : ""}. Upgrade to
            unlock more.
          </p>
        </div>

        <div className="rounded-lg border border-border bg-muted/50 p-4 opacity-50">
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Your AI profile for {store.name}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {store.tools
              .filter((t) => t.enabled)
              .map((t) => (
                <span
                  key={t.name}
                  className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground"
                >
                  {getFriendlyName(t.name)}
                </span>
              ))}
          </div>
        </div>

        <div className="space-y-3">
          {upgradePlans.map(([id, plan]) => (
            <div
              key={id}
              className={`rounded-lg p-5 ring-1 ${
                id === "starter"
                  ? "bg-primary/5 ring-primary/30"
                  : "bg-card ring-foreground/10"
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-foreground">
                    {plan.name}
                  </h4>
                  <div className="mt-1 flex items-baseline gap-1">
                    <span className="text-xl font-bold text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.limits.maxServers} AI servers &middot;{" "}
                    {plan.limits.maxEventsPerMonth === -1
                      ? "Unlimited"
                      : plan.limits.maxEventsPerMonth.toLocaleString()}{" "}
                    events/mo
                  </p>
                </div>
                <Button
                  className={
                    id === "starter"
                      ? ""
                      : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  }
                  disabled={upgradeLoading !== null}
                  onClick={() => handleUpgrade(id)}
                >
                  {upgradeLoading === id ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Upgrade
                </Button>
              </div>
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full"
          onClick={() => setShowPaywall(false)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to review
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Slug / Server URL */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          Your AI Server URL
          <FieldTooltip text="This is the unique URL where your AI profile lives. AI assistants use this URL to discover and learn about your product." />
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
          <span className="text-sm text-muted-foreground">launchmymcp.com/mcp/</span>
          {editingSlug ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                className="h-7 px-2 text-sm"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveSlug()}
              />
              <button
                onClick={saveSlug}
                className="text-green-600 hover:text-green-500 dark:text-green-400"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setEditingSlug(false);
                  setSlugInput(store.slug);
                }}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <span className="text-sm font-medium text-primary">
                {store.slug}
              </span>
              <button
                onClick={() => setEditingSlug(true)}
                className="text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Tools List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            Your AI Discovery Profile ({enabledCount} active)
            <FieldTooltip text="Each card is a question AI assistants can now answer about your product. Toggle off any you don't want, or expand to preview the response." />
          </label>
          <button
            onClick={() => store.setStep("describe")}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="h-3 w-3" />
            Start over
          </button>
        </div>

        {store.tools.map((tool, i) => (
          <div
            key={i}
            className={`rounded-lg ring-1 transition-colors ${
              tool.enabled
                ? "bg-card ring-foreground/10"
                : "bg-muted/50 ring-foreground/5 opacity-50"
            }`}
          >
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-foreground">
                      {getFriendlyName(tool.name)}
                    </span>
                    <code className="text-[10px] text-muted-foreground">
                      {tool.name}
                    </code>
                    <Badge className="bg-muted text-muted-foreground text-[10px] px-1.5 py-0">
                      Discovery Tool
                    </Badge>
                    <QualityBadge score={tool.quality_score} />
                  </div>

                  {editingDesc === i ? (
                    <div className="flex items-start gap-2">
                      <textarea
                        value={descInput}
                        onChange={(e) => setDescInput(e.target.value)}
                        rows={2}
                        className="flex-1 rounded border border-border bg-muted px-2 py-1 text-sm text-foreground"
                        autoFocus
                      />
                      <button
                        onClick={() => saveDesc(i)}
                        className="mt-1 text-green-600 hover:text-green-500 dark:text-green-400"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingDesc(null)}
                        className="mt-1 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <p
                      className="group cursor-pointer text-sm text-muted-foreground"
                      onClick={() => startEditDesc(i)}
                    >
                      {tool.description}
                      <Pencil className="ml-1 inline h-3 w-3 opacity-0 group-hover:opacity-100" />
                    </p>
                  )}
                </div>

                {/* Toggle */}
                <button
                  onClick={() => store.toggleTool(i)}
                  className={`mt-1 rounded-full p-1 transition-colors ${
                    tool.enabled
                      ? "bg-primary/20 text-primary"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {tool.enabled ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                </button>
              </div>

              {/* Preview toggle */}
              {tool.enabled && tool.static_response && (
                <button
                  onClick={() => togglePreview(i)}
                  className="mt-2 flex items-center gap-1 text-xs text-primary hover:text-primary/80"
                >
                  <Eye className="h-3 w-3" />
                  Preview what AI will say
                  {expandedPreviews.has(i) ? (
                    <ChevronDown className="h-3 w-3" />
                  ) : (
                    <ChevronRight className="h-3 w-3" />
                  )}
                </button>
              )}
            </div>

            {/* Expanded preview */}
            {expandedPreviews.has(i) && tool.static_response && (
              <div className="border-t border-border bg-muted/50 px-4 py-3">
                <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  When someone asks about this, AI will respond with:
                </p>
                <pre className="whitespace-pre-wrap text-xs leading-relaxed text-foreground/80">
                  {formatStaticResponse(
                    tool.static_response as Record<string, unknown>,
                  )}
                </pre>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom banner */}
      <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          Want AI to actually do things inside your product (like create
          invoices)? You can connect your API later from the dashboard.
        </p>
      </div>

      {/* Error */}
      {store.saveError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{store.saveError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          onClick={() => store.setStep("details")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="flex-1"
          disabled={enabledCount === 0 || store.isSaving}
          onClick={handleSave}
        >
          {store.isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating your AI profile...
            </>
          ) : (
            <>
              Launch my AI profile
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
