"use client";

import { useState, useCallback } from "react";
import { useOnboardStore, type PricingPlan } from "@/lib/onboard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldTooltip } from "./FieldTooltip";
import { GeneratingOverlay } from "./GeneratingOverlay";
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  X,
} from "lucide-react";

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if ((e.key === "Enter" || e.key === ",") && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput("");
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1));
    }
  }

  function removeTag(index: number) {
    onChange(tags.filter((_, i) => i !== index));
  }

  return (
    <div className="flex flex-wrap gap-1.5 rounded-md border border-input bg-input/20 px-3 py-2 dark:bg-input/30">
      {tags.map((tag, i) => (
        <span
          key={i}
          className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs text-primary"
        >
          {tag}
          <button
            type="button"
            onClick={() => removeTag(i)}
            className="text-primary/60 hover:text-primary"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={tags.length === 0 ? placeholder : ""}
        className="min-w-[120px] flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
      />
    </div>
  );
}

function PricingPlanRow({
  plan,
  onChange,
  onRemove,
}: {
  plan: PricingPlan;
  onChange: (plan: PricingPlan) => void;
  onRemove: () => void;
}) {
  const [featuresText, setFeaturesText] = useState(plan.features.join(", "));

  return (
    <div className="space-y-2 rounded-lg border border-border bg-muted/50 p-3">
      <div className="flex items-center gap-2">
        <Input
          value={plan.name}
          onChange={(e) => onChange({ ...plan, name: e.target.value })}
          placeholder="Plan name (e.g. Pro)"
          className="flex-1 text-sm"
        />
        <Input
          value={plan.price}
          onChange={(e) => onChange({ ...plan, price: e.target.value })}
          placeholder="$19/mo"
          className="w-28 text-sm"
        />
        <button
          type="button"
          onClick={onRemove}
          className="text-muted-foreground hover:text-destructive"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <Input
        value={featuresText}
        onChange={(e) => {
          setFeaturesText(e.target.value);
          onChange({
            ...plan,
            features: e.target.value
              .split(",")
              .map((f) => f.trim())
              .filter(Boolean),
          });
        }}
        placeholder="Features (comma-separated, e.g. Unlimited invoices, Payment tracking)"
        className="text-sm"
      />
    </div>
  );
}

export function StepProductDetails() {
  const store = useOnboardStore();

  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>(
    store.productMetadata.pricing_plans.length > 0
      ? store.productMetadata.pricing_plans
      : [{ name: "", price: "", features: [] }],
  );
  const [keyFeatures, setKeyFeatures] = useState<string[]>(
    store.productMetadata.key_features,
  );
  const [useCases, setUseCases] = useState(
    store.productMetadata.use_cases.join("\n"),
  );
  const [targetAudience, setTargetAudience] = useState(
    store.productMetadata.target_audience,
  );
  const [differentiators, setDifferentiators] = useState(
    store.productMetadata.differentiators,
  );
  const [integrations, setIntegrations] = useState<string[]>(
    store.productMetadata.integrations,
  );

  // AI readiness score
  const filledSections = [
    pricingPlans.some((p) => p.name && p.price),
    keyFeatures.length > 0,
    useCases.trim().length > 0,
    targetAudience.trim().length > 0,
    differentiators.trim().length > 0,
    integrations.length > 0,
  ].filter(Boolean).length;

  function updatePlan(index: number, plan: PricingPlan) {
    const updated = [...pricingPlans];
    updated[index] = plan;
    setPricingPlans(updated);
  }

  function removePlan(index: number) {
    setPricingPlans(pricingPlans.filter((_, i) => i !== index));
  }

  function addPlan() {
    setPricingPlans([...pricingPlans, { name: "", price: "", features: [] }]);
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanedPlans = pricingPlans.filter((p) => p.name.trim() || p.price.trim());
    const cleanedUseCases = useCases
      .split("\n")
      .map((u) => u.trim())
      .filter(Boolean);

    const metadata = {
      pricing_plans: cleanedPlans,
      key_features: keyFeatures,
      use_cases: cleanedUseCases,
      target_audience: targetAudience.trim(),
      differentiators: differentiators.trim(),
      integrations,
    };

    store.setProductMetadata(metadata);
    store.setStep("transition-details");
    store.setGenerating(true);

    try {
      const res = await fetch("/api/onboard/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: store.name,
          description: store.description,
          website_url: store.websiteUrl || undefined,
          product_metadata: metadata,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Generation failed");
      }

      const result = await res.json();
      store.setGeneratedTools(result.tools, result.slug_suggestion);
    } catch (err) {
      store.setGenerateError(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }, [pricingPlans, keyFeatures, useCases, targetAudience, differentiators, integrations, store]);

  if (store.isGenerating) {
    return <GeneratingOverlay />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* AI readiness bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            AI readiness: {filledSections}/6 sections filled
          </p>
          <p className="text-xs text-muted-foreground">
            The more you add, the better AI can represent you
          </p>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.max((filledSections / 6) * 100, 4)}%` }}
          />
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          Pricing Plans
          <span className="text-xs text-muted-foreground">(optional)</span>
          <FieldTooltip text="'How much does it cost?' is one of the most common questions people ask AI. If you add your pricing here, AI can answer accurately instead of guessing or saying 'I don't know.'" />
        </label>
        <div className="space-y-2">
          {pricingPlans.map((plan, i) => (
            <PricingPlanRow
              key={i}
              plan={plan}
              onChange={(p) => updatePlan(i, p)}
              onRemove={() => removePlan(i)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={addPlan}
          className="flex items-center gap-1.5 text-xs text-primary hover:text-primary/80"
        >
          <Plus className="h-3 w-3" />
          Add another plan
        </button>
      </div>

      {/* Key Features */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          Key Features
          <span className="text-xs text-muted-foreground">(optional)</span>
          <FieldTooltip text="AI assistants match products to user needs by features. 'I need something with recurring invoices and Stripe integration' — if those are in your feature list, you'll get recommended." />
        </label>
        <TagInput
          tags={keyFeatures}
          onChange={setKeyFeatures}
          placeholder="Type a feature and press Enter"
        />
      </div>

      {/* Use Cases */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          Use Cases
          <span className="text-xs text-muted-foreground">(optional)</span>
          <FieldTooltip text="This helps AI understand WHEN to recommend you. 'A freelancer needs to send a professional invoice in under 2 minutes' is exactly the kind of scenario an AI matches against." />
        </label>
        <Textarea
          value={useCases}
          onChange={(e) => setUseCases(e.target.value)}
          placeholder={"e.g.\nA freelancer needs to invoice a client quickly\nA small agency wants to track payments across multiple projects\nSomeone switching from FreshBooks wants a simpler alternative"}
          rows={3}
        />
      </div>

      {/* Target Audience */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          Target Audience
          <span className="text-xs text-muted-foreground">(optional)</span>
          <FieldTooltip text="Helps AI narrow down who you're for. 'Freelance designers and small creative agencies' is much more useful than 'everyone.'" />
        </label>
        <Input
          value={targetAudience}
          onChange={(e) => setTargetAudience(e.target.value)}
          placeholder="e.g. Freelancers and small businesses"
        />
      </div>

      {/* What Makes You Different */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          What Makes You Different
          <span className="text-xs text-muted-foreground">(optional)</span>
          <FieldTooltip text="When AI compares tools, this is your pitch. Think: what would you say if someone asked 'why should I use yours instead of the competition?'" />
        </label>
        <Textarea
          value={differentiators}
          onChange={(e) => setDifferentiators(e.target.value)}
          placeholder="e.g. Simpler than FreshBooks, half the price. One-click invoicing that takes less than 2 minutes."
          rows={2}
        />
      </div>

      {/* Integrations */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-foreground">
          Integrations
          <span className="text-xs text-muted-foreground">(optional)</span>
          <FieldTooltip text="People ask AI things like 'what invoicing tool works with Stripe?' — if you list your integrations, you'll show up in those conversations." />
        </label>
        <TagInput
          tags={integrations}
          onChange={setIntegrations}
          placeholder="Type an integration and press Enter (e.g. Stripe)"
        />
      </div>

      {/* Error from generation */}
      {store.generateError && (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3">
          <p className="text-sm text-destructive">{store.generateError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => store.setStep("describe")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          type="submit"
          disabled={store.isGenerating}
          className="flex-1"
        >
          Build my AI profile
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
