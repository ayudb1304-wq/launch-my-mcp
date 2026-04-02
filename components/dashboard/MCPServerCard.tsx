"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Copy,
  Check,
  Globe,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  event_count: number;
  propagation_status?: {
    registries?: Record<string, { status: string }>;
  } | null;
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  live: { label: "Live", className: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
  draft: { label: "Draft", className: "bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  error: { label: "Error", className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

export function MCPServerCard({ project }: { project: Project }) {
  const [copied, setCopied] = useState(false);

  const mcpUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/mcp/${project.slug}/mcp`;
  const status = statusConfig[project.status] ?? statusConfig.draft;

  function copyUrl() {
    navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg bg-card p-5 ring-1 ring-foreground/10 transition-colors hover:ring-foreground/20">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h3 className="truncate text-lg font-bold text-foreground">
              {project.name}
            </h3>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          {/* Description */}
          <p className="mt-1 line-clamp-1 text-sm text-muted-foreground">
            {project.description}
          </p>

          {/* MCP URL */}
          <div className="mt-3 flex items-center gap-2">
            <code className="truncate rounded bg-muted px-2 py-1 text-xs text-primary">
              /api/mcp/{project.slug}/mcp
            </code>
            <button
              onClick={copyUrl}
              className="shrink-0 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary" />
              {project.event_count} discovery events
            </span>
            {(() => {
              const regs = project.propagation_status?.registries;
              const indexed = regs
                ? Object.values(regs).filter((r) => r.status === "indexed").length
                : 0;
              const total = 4;
              return (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Globe className="h-3.5 w-3.5 text-primary" />
                  {indexed > 0
                    ? `Listed on ${indexed}/${total} registries`
                    : "Not listed yet"}
                </span>
              );
            })()}
            <span className="text-xs text-muted-foreground">
              Created{" "}
              {new Date(project.created_at).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex shrink-0 items-center gap-2">
          <Link href={`/dashboard/${project.id}`}>
            <Button
              variant="ghost"
              size="sm"
            >
              Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
