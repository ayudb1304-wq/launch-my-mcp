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
} from "lucide-react";

function QualityBadge({ score }: { score: number }) {
  if (score >= 8) return <Badge className="bg-green-500/20 text-green-400">Excellent ({score}/10)</Badge>;
  if (score >= 5) return <Badge className="bg-yellow-500/20 text-yellow-400">Good ({score}/10)</Badge>;
  return <Badge className="bg-red-500/20 text-red-400">Needs work ({score}/10)</Badge>;
}

export function StepReview() {
  const store = useOnboardStore();
  const [editingSlug, setEditingSlug] = useState(false);
  const [slugInput, setSlugInput] = useState(store.slug);
  const [editingDesc, setEditingDesc] = useState<number | null>(null);
  const [descInput, setDescInput] = useState("");

  const enabledCount = store.tools.filter((t) => t.enabled).length;

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
          tools: store.tools.map((t) => ({
            name: t.name,
            description: t.description,
            parameters: t.parameters,
            enabled: t.enabled,
            quality_score: t.quality_score,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Save failed");
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

  return (
    <div className="space-y-6">
      {/* Slug / Server URL */}
      <div className="space-y-2">
        <label className="flex items-center gap-2 text-sm font-medium text-white">
          MCP Server URL
          <FieldTooltip text="This is the unique URL where your MCP server will live. AI assistants will use this URL to discover and call your product's tools. Choose something short and memorable." />
        </label>
        <div className="flex items-center gap-2 rounded-lg border border-gray-700 bg-gray-900/50 px-3 py-2">
          <span className="text-sm text-gray-500">mcplaunch.io/mcp/</span>
          {editingSlug ? (
            <div className="flex flex-1 items-center gap-2">
              <Input
                value={slugInput}
                onChange={(e) => setSlugInput(e.target.value)}
                className="h-7 border-gray-600 bg-gray-800 px-2 text-sm text-white"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && saveSlug()}
              />
              <button onClick={saveSlug} className="text-green-400 hover:text-green-300">
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => {
                  setEditingSlug(false);
                  setSlugInput(store.slug);
                }}
                className="text-gray-400 hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-1 items-center gap-2">
              <span className="text-sm font-medium text-mcpl-cyan">
                {store.slug}
              </span>
              <button
                onClick={() => setEditingSlug(true)}
                className="text-gray-500 hover:text-gray-300"
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
          <label className="flex items-center gap-2 text-sm font-medium text-white">
            Generated Tools ({enabledCount} enabled)
            <FieldTooltip text="These are the actions AI assistants can perform using your product. Toggle off any tools you don't want. You can edit descriptions to make them clearer." />
          </label>
          <button
            onClick={() => {
              store.setStep("describe");
            }}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-300"
          >
            <RotateCcw className="h-3 w-3" />
            Regenerate
          </button>
        </div>

        {store.tools.map((tool, i) => (
          <div
            key={i}
            className={`rounded-lg border p-4 transition-colors ${
              tool.enabled
                ? "border-gray-700 bg-gray-900/50"
                : "border-gray-800 bg-gray-900/20 opacity-50"
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <code className="text-sm font-medium text-mcpl-cyan">
                    {tool.name}
                  </code>
                  <QualityBadge score={tool.quality_score} />
                </div>

                {editingDesc === i ? (
                  <div className="flex items-start gap-2">
                    <textarea
                      value={descInput}
                      onChange={(e) => setDescInput(e.target.value)}
                      rows={2}
                      className="flex-1 rounded border border-gray-600 bg-gray-800 px-2 py-1 text-sm text-white"
                      autoFocus
                    />
                    <button
                      onClick={() => saveDesc(i)}
                      className="mt-1 text-green-400 hover:text-green-300"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setEditingDesc(null)}
                      className="mt-1 text-gray-400 hover:text-gray-300"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p
                    className="group cursor-pointer text-sm text-gray-400"
                    onClick={() => startEditDesc(i)}
                  >
                    {tool.description}
                    <Pencil className="ml-1 inline h-3 w-3 opacity-0 group-hover:opacity-100" />
                  </p>
                )}

                {/* Parameters */}
                {tool.parameters.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {tool.parameters.map((p) => (
                      <span
                        key={p.name}
                        className="rounded bg-gray-800 px-2 py-0.5 text-xs text-gray-400"
                      >
                        {p.name}
                        <span className="ml-1 text-gray-600">
                          {p.type}
                          {p.required ? "" : "?"}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Toggle */}
              <button
                onClick={() => store.toggleTool(i)}
                className={`mt-1 rounded-full p-1 transition-colors ${
                  tool.enabled
                    ? "bg-mcpl-cyan/20 text-mcpl-cyan"
                    : "bg-gray-800 text-gray-600"
                }`}
              >
                {tool.enabled ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <X className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Error */}
      {store.saveError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3">
          <p className="text-sm text-red-400">{store.saveError}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          variant="outline"
          className="border-gray-700 text-gray-400 hover:text-white"
          onClick={() => store.setStep("describe")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        <Button
          className="flex-1 bg-mcpl-cyan text-mcpl-deep hover:bg-mcpl-cyan/90"
          disabled={enabledCount === 0 || store.isSaving}
          onClick={handleSave}
        >
          {store.isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating project...
            </>
          ) : (
            <>
              Deploy MCP Server
              <ArrowRight className="ml-2 h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
