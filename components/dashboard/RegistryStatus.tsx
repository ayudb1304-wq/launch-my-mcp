"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Globe,
  ExternalLink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Lock,
  Send,
} from "lucide-react";
import {
  type RegistryId,
  type RegistryStatus as RegistryStatusType,
  type PropagationStatus,
  REGISTRIES,
  REGISTRY_IDS,
  getRegistriesForPlan,
} from "@/lib/registries/config";

interface RegistryStatusProps {
  projectId: string;
  propagationStatus: PropagationStatus | null;
  userPlan: "free" | "starter" | "super";
}

const statusDisplay: Record<
  RegistryStatusType,
  { label: string; icon: typeof CheckCircle2; className: string }
> = {
  not_submitted: {
    label: "Not submitted",
    icon: Clock,
    className: "bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400",
  },
  submitting: {
    label: "Submitting...",
    icon: Loader2,
    className: "bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400",
  },
  submitted: {
    label: "Submitted",
    icon: Clock,
    className:
      "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400",
  },
  indexed: {
    label: "Listed",
    icon: CheckCircle2,
    className:
      "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400",
  },
  error: {
    label: "Error",
    icon: AlertCircle,
    className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400",
  },
};

export function RegistryStatus({
  projectId,
  propagationStatus,
  userPlan,
}: RegistryStatusProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [status, setStatus] = useState<PropagationStatus>(
    propagationStatus || { registries: {}, milestones: {} },
  );

  const availableRegistries = getRegistriesForPlan(userPlan);

  // Check indexing status on mount if any registries are in "submitted" state
  const checkIndexingStatus = useCallback(async () => {
    const hasSubmitted = Object.values(status.registries).some(
      (r) => r.status === "submitted",
    );
    if (!hasSubmitted) return;

    try {
      const res = await fetch("/api/registries/check-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (!res.ok) return;

      const { results } = await res.json();
      // Update any newly indexed registries
      setStatus((prev) => {
        const updated = { ...prev };
        for (const [registryId, result] of Object.entries(results)) {
          const r = result as { indexed: boolean; listingUrl?: string };
          if (r.indexed && updated.registries[registryId as RegistryId]) {
            updated.registries[registryId as RegistryId] = {
              ...updated.registries[registryId as RegistryId]!,
              status: "indexed",
              indexed_at: new Date().toISOString(),
              listing_url: r.listingUrl || updated.registries[registryId as RegistryId]!.listing_url,
            };
          }
        }
        return updated;
      });
    } catch {
      // Silent fail — non-critical background check
    }
  }, [projectId, status.registries]);

  useEffect(() => {
    checkIndexingStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function submitToRegistry(registryId: RegistryId) {
    setLoading(registryId);
    try {
      const res = await fetch("/api/registries/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, registryId }),
      });
      if (res.ok) {
        const result = await res.json();
        setStatus((prev) => ({
          ...prev,
          registries: {
            ...prev.registries,
            [registryId]: {
              status: result.success ? "submitted" : "error",
              submitted_at: result.success ? new Date().toISOString() : null,
              indexed_at: null,
              listing_url: result.listingUrl || null,
              error: result.error || null,
            },
          },
        }));
      }
    } finally {
      setLoading(null);
    }
  }

  async function submitAll() {
    setLoading("all");
    try {
      const res = await fetch("/api/registries/submit-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId }),
      });
      if (res.ok) {
        const { results } = await res.json();
        setStatus((prev) => {
          const updated = { ...prev };
          for (const r of results) {
            updated.registries[r.registryId as RegistryId] = {
              status: r.success ? "submitted" : "error",
              submitted_at: r.success ? new Date().toISOString() : null,
              indexed_at: null,
              listing_url: r.listingUrl || null,
              error: r.error || null,
            };
          }
          return updated;
        });
      }
    } finally {
      setLoading(null);
    }
  }

  const indexedCount = Object.values(status.registries).filter(
    (r) => r.status === "indexed",
  ).length;
  const submittedCount = Object.values(status.registries).filter(
    (r) => r.status === "submitted" || r.status === "indexed",
  ).length;

  return (
    <div className="rounded-lg bg-card p-5 ring-1 ring-foreground/10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">AI Registry Distribution</h3>
        </div>
        {availableRegistries.length > 1 && (
          <Button
            variant="outline"
            size="sm"
            onClick={submitAll}
            disabled={loading !== null}
          >
            {loading === "all" ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="mr-2 h-3.5 w-3.5" />
            )}
            Submit to all
          </Button>
        )}
      </div>

      <p className="mt-1 text-xs text-muted-foreground">
        {indexedCount > 0
          ? `Listed on ${indexedCount}/${REGISTRY_IDS.length} registries`
          : submittedCount > 0
            ? `Submitted to ${submittedCount} registries — waiting for indexing`
            : "Submit your server to AI registries for discovery"}
      </p>

      <div className="mt-4 space-y-2">
        {REGISTRY_IDS.map((registryId) => {
          const registry = REGISTRIES[registryId];
          const entry = status.registries[registryId];
          const entryStatus = entry?.status || "not_submitted";
          const display = statusDisplay[entryStatus];
          const isAvailable = availableRegistries.includes(registryId);
          const isLoading = loading === registryId || loading === "all";
          const DisplayIcon = display.icon;

          return (
            <div
              key={registryId}
              className="flex items-center justify-between rounded-lg px-3 py-2.5 ring-1 ring-foreground/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-foreground">
                    {registry.name}
                  </span>
                  {!registry.automatable && entryStatus === "not_submitted" && (
                    <span className="text-xs text-muted-foreground">
                      {registry.fallbackInstructions}
                    </span>
                  )}
                  {entry?.error && (
                    <span className="text-xs text-red-500">{entry.error}</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                {!isAvailable ? (
                  <Badge className="bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                    <Lock className="mr-1 h-3 w-3" />
                    Upgrade
                  </Badge>
                ) : entryStatus === "indexed" && entry?.listing_url ? (
                  <a
                    href={entry.listing_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1"
                  >
                    <Badge className={display.className}>
                      <DisplayIcon className="mr-1 h-3 w-3" />
                      {display.label}
                    </Badge>
                    <ExternalLink className="h-3 w-3 text-muted-foreground" />
                  </a>
                ) : entryStatus === "not_submitted" || entryStatus === "error" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => submitToRegistry(registryId)}
                    disabled={isLoading || !registry.automatable}
                  >
                    {isLoading ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : null}
                    {registry.automatable ? "Submit" : "Manual"}
                  </Button>
                ) : (
                  <Badge className={display.className}>
                    <DisplayIcon
                      className={`mr-1 h-3 w-3 ${entryStatus === "submitting" ? "animate-spin" : ""}`}
                    />
                    {display.label}
                  </Badge>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
