"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Copy,
  Check,
  Activity,
  Server,
  DollarSign,
  Pause,
  Play,
} from "lucide-react";
import Link from "next/link";
import { DiscoveryFeed } from "./DiscoveryFeed";
import { RegistryStatus } from "./RegistryStatus";
import type { PropagationStatus } from "@/lib/registries/config";

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  website_url: string | null;
  propagation_status: PropagationStatus | null;
}

interface Tool {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  quality_score: number | null;
}

interface DiscoveryEvent {
  id: string;
  tool_name: string;
  ai_client: string | null;
  latency_ms: number | null;
  status: string;
  created_at: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  live: { label: "Live", className: "bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400" },
  draft: { label: "Draft", className: "bg-zinc-50 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-500" },
  paused: { label: "Paused", className: "bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400" },
  error: { label: "Error", className: "bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400" },
};

export function ProjectDetail({
  project,
  tools,
  events,
  totalEvents,
  userPlan = "free",
}: {
  project: Project;
  tools: Tool[];
  events: DiscoveryEvent[];
  totalEvents: number;
  userPlan?: "free" | "starter" | "super";
}) {
  const supabase = createClient();
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState(project.status);

  const mcpUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/api/mcp/${project.slug}/mcp`;
  const statusInfo = statusConfig[status] ?? statusConfig.draft;
  const adSpendSaved = totalEvents * 2.5;

  function copyUrl() {
    navigator.clipboard.writeText(mcpUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function toggleStatus() {
    const newStatus = status === "live" ? "paused" : "live";
    await supabase
      .from("mcp_projects")
      .update({ status: newStatus })
      .eq("id", project.id);
    setStatus(newStatus);
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Breadcrumb */}
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Project header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleStatus}
        >
          {status === "live" ? (
            <>
              <Pause className="mr-2 h-4 w-4" />
              Pause
            </>
          ) : (
            <>
              <Play className="mr-2 h-4 w-4" />
              Go Live
            </>
          )}
        </Button>
      </div>

      {/* MCP URL */}
      <div className="mt-4 flex items-center gap-2 rounded-lg bg-card px-4 py-3 ring-1 ring-foreground/10">
        <Server className="h-4 w-4 shrink-0 text-primary" />
        <code className="flex-1 truncate text-sm text-primary">{mcpUrl}</code>
        <button onClick={copyUrl} className="text-muted-foreground hover:text-foreground">
          {copied ? (
            <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Metrics */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          {
            label: "Discovery Events",
            value: totalEvents.toString(),
            icon: Activity,
            color: "text-blue-600 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950",
          },
          {
            label: "Active Tools",
            value: tools.filter((t) => t.enabled).length.toString(),
            icon: Server,
            color: "text-green-600 dark:text-green-400",
            bg: "bg-green-50 dark:bg-green-950",
          },
          {
            label: "Ad Spend Saved",
            value: `$${adSpendSaved.toLocaleString()}`,
            icon: DollarSign,
            color: "text-amber-600 dark:text-amber-400",
            bg: "bg-amber-50 dark:bg-amber-950",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg bg-card p-4 ring-1 ring-foreground/10"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.bg}`}
              >
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Connect API placeholder */}
      <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">
              Want AI assistants to take actions in your product?
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Connect your API so AI can create invoices, book appointments, and more — coming soon.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="shrink-0"
            disabled
          >
            Connect API
          </Button>
        </div>
      </div>

      {/* Registry Distribution */}
      <div className="mt-6">
        <RegistryStatus
          projectId={project.id}
          propagationStatus={project.propagation_status}
          userPlan={userPlan}
        />
      </div>

      {/* Two columns: Tools + Events */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tools */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Tools ({tools.length})
          </h2>
          <div className="space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`rounded-lg p-3 ring-1 ring-foreground/10 ${
                  tool.enabled
                    ? "bg-card"
                    : "bg-muted/50 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <code className="text-sm font-medium text-primary">
                    {tool.name}
                  </code>
                  {tool.quality_score && (
                    <span className="text-xs text-muted-foreground">
                      {tool.quality_score}/10
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Discovery Feed */}
        <div>
          <h2 className="mb-4 text-lg font-bold text-foreground">
            Recent Discovery Events
          </h2>
          <DiscoveryFeed events={events} />
        </div>
      </div>
    </div>
  );
}
