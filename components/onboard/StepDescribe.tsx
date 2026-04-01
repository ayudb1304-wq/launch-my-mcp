"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/onboard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldTooltip } from "./FieldTooltip";
import { ArrowRight, Loader2, Sparkles } from "lucide-react";
import { GeneratingOverlay } from "./GeneratingOverlay";

export function StepDescribe() {
  const store = useOnboardStore();
  const [name, setName] = useState(store.name);
  const [description, setDescription] = useState(store.description);
  const [websiteUrl, setWebsiteUrl] = useState(store.websiteUrl);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = "Product name is required";
    if (name.trim().length > 100)
      errs.name = "Max 100 characters";
    if (!description.trim()) errs.description = "Description is required";
    if (description.trim().length < 10)
      errs.description = "At least 10 characters — help the AI understand your product";
    if (description.trim().length > 1000)
      errs.description = "Max 1000 characters";
    if (websiteUrl && !/^https?:\/\/.+\..+/.test(websiteUrl))
      errs.websiteUrl = "Enter a valid URL (e.g. https://example.com)";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    store.setDescribe({
      name: name.trim(),
      description: description.trim(),
      websiteUrl: websiteUrl.trim(),
    });
    store.setGenerating(true);

    try {
      const res = await fetch("/api/onboard/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          website_url: websiteUrl.trim() || undefined,
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
  }

  if (store.isGenerating) {
    return <GeneratingOverlay />;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Product Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            Product Name
            <FieldTooltip text="The name of your product or service. This is how AI assistants will refer to it (e.g. 'InvoiceHero', 'TableReady')." />
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. InvoiceHero"
            className="border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500"
          />
          {errors.name && (
            <p className="text-xs text-red-400">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            What does your product do?
            <FieldTooltip text="Describe what your product does in plain English. The more detail you give, the better tools AI will generate. Example: 'A restaurant booking platform where users can search restaurants by cuisine, make reservations, and manage their bookings.'" />
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe your product in a few sentences. What can users do with it?"
            rows={4}
            className="border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500"
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-red-400">{errors.description}</p>
            ) : (
              <p className="text-xs text-gray-500">
                {description.length}/1000 characters
              </p>
            )}
          </div>
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            Website URL
            <span className="text-xs text-gray-500">(optional)</span>
            <FieldTooltip text="Your product's website or API documentation page. This helps AI generate more accurate tools. You can skip this for now." />
          </label>
          <Input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourproduct.com"
            className="border-gray-700 bg-gray-900/50 text-white placeholder:text-gray-500"
          />
          {errors.websiteUrl && (
            <p className="text-xs text-red-400">{errors.websiteUrl}</p>
          )}
        </div>
      </div>

      {/* Error from generation */}
      {store.generateError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{store.generateError}</p>
        </div>
      )}

      {/* Submit */}
      <Button
        type="submit"
        disabled={store.isGenerating}
        className="w-full bg-mcpl-cyan text-mcpl-deep hover:bg-mcpl-cyan/90"
      >
        {store.isGenerating ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating tools with AI...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Generate MCP Tools
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>
    </form>
  );
}
