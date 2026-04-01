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

interface Project {
  id: string;
  name: string;
  slug: string;
  description: string;
  status: string;
  created_at: string;
  website_url: string | null;
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
  live: { label: "Live", className: "bg-green-500/20 text-green-400" },
  draft: { label: "Draft", className: "bg-gray-500/20 text-gray-400" },
  paused: { label: "Paused", className: "bg-yellow-500/20 text-yellow-400" },
  error: { label: "Error", className: "bg-red-500/20 text-red-400" },
};

export function ProjectDetail({
  project,
  tools,
  events,
  totalEvents,
}: {
  project: Project;
  tools: Tool[];
  events: DiscoveryEvent[];
  totalEvents: number;
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
        className="mb-6 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Project header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-heading text-2xl font-bold text-white">
              {project.name}
            </h1>
            <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
          </div>
          <p className="mt-1 text-sm text-gray-400">{project.description}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700 text-gray-400 hover:text-white"
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
      <div className="mt-4 flex items-center gap-2 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
        <Server className="h-4 w-4 shrink-0 text-mcpl-cyan" />
        <code className="flex-1 truncate text-sm text-mcpl-cyan">{mcpUrl}</code>
        <button onClick={copyUrl} className="text-gray-500 hover:text-white">
          {copied ? (
            <Check className="h-4 w-4 text-green-400" />
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
            color: "text-mcpl-cyan",
            bg: "bg-mcpl-cyan/10",
          },
          {
            label: "Active Tools",
            value: tools.filter((t) => t.enabled).length.toString(),
            icon: Server,
            color: "text-mcpl-green",
            bg: "bg-mcpl-green/10",
          },
          {
            label: "Ad Spend Saved",
            value: `$${adSpendSaved.toLocaleString()}`,
            icon: DollarSign,
            color: "text-yellow-400",
            bg: "bg-yellow-400/10",
          },
        ].map((m) => (
          <div
            key={m.label}
            className="rounded-lg border border-gray-800 bg-gray-900/50 p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${m.bg}`}
              >
                <m.icon className={`h-5 w-5 ${m.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{m.value}</p>
                <p className="text-xs text-gray-400">{m.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Two columns: Tools + Events */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tools */}
        <div>
          <h2 className="mb-4 font-heading text-lg font-bold text-white">
            Tools ({tools.length})
          </h2>
          <div className="space-y-2">
            {tools.map((tool) => (
              <div
                key={tool.id}
                className={`rounded-lg border p-3 ${
                  tool.enabled
                    ? "border-gray-800 bg-gray-900/50"
                    : "border-gray-800/50 bg-gray-900/20 opacity-50"
                }`}
              >
                <div className="flex items-center justify-between">
                  <code className="text-sm font-medium text-mcpl-cyan">
                    {tool.name}
                  </code>
                  {tool.quality_score && (
                    <span className="text-xs text-gray-500">
                      {tool.quality_score}/10
                    </span>
                  )}
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-gray-400">
                  {tool.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Discovery Feed */}
        <div>
          <h2 className="mb-4 font-heading text-lg font-bold text-white">
            Recent Discovery Events
          </h2>
          <DiscoveryFeed events={events} />
        </div>
      </div>
    </div>
  );
}
