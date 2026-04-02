"use client";

import { useState } from "react";
import { useOnboardStore } from "@/lib/onboard-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { FieldTooltip } from "./FieldTooltip";
import { ArrowRight } from "lucide-react";

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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;

    store.setDescribe({
      name: name.trim(),
      description: description.trim(),
      websiteUrl: websiteUrl.trim(),
    });
    store.setStep("transition-describe");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        {/* Product Name */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            What&apos;s your product called?
            <FieldTooltip text="The name of your product or service. This is how AI assistants will refer to it when recommending it to users." />
          </label>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. InvoiceHero"
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name}</p>
          )}
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            Describe it like you&apos;re telling a friend at a coffee shop
            <FieldTooltip text="The more detail you share, the better AI will understand and recommend your product. Think: what it does, who it's for, and what makes it great." />
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g. We built an invoicing tool for freelancers. You can create invoices, track payments, and send automatic reminders. It's simpler than FreshBooks and half the price."
            rows={4}
          />
          <div className="flex items-center justify-between">
            {errors.description ? (
              <p className="text-xs text-destructive">{errors.description}</p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {description.length}/1000 characters
              </p>
            )}
          </div>
        </div>

        {/* Website URL */}
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-foreground">
            Got a website?
            <span className="text-xs text-muted-foreground">(optional)</span>
            <FieldTooltip text="Your product's website. AI assistants can include this when recommending you so users know where to learn more." />
          </label>
          <Input
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourproduct.com"
          />
          {errors.websiteUrl && (
            <p className="text-xs text-destructive">{errors.websiteUrl}</p>
          )}
        </div>
      </div>

      {/* Submit */}
      <Button
        type="submit"
        className="w-full"
      >
        Next
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
