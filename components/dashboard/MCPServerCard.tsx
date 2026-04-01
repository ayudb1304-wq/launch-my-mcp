"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Copy,
  Check,
  ExternalLink,
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
}

const statusConfig: Record<
  string,
  { label: string; className: string }
> = {
  live: { label: "Live", className: "bg-green-500/20 text-green-400" },
  draft: { label: "Draft", className: "bg-gray-500/20 text-gray-400" },
  paused: { label: "Paused", className: "bg-yellow-500/20 text-yellow-400" },
  error: { label: "Error", className: "bg-red-500/20 text-red-400" },
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
    <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-5 transition-colors hover:border-gray-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {/* Header */}
          <div className="flex items-center gap-3">
            <h3 className="truncate font-heading text-lg font-bold text-white">
              {project.name}
            </h3>
            <Badge className={status.className}>{status.label}</Badge>
          </div>

          {/* Description */}
          <p className="mt-1 line-clamp-1 text-sm text-gray-400">
            {project.description}
          </p>

          {/* MCP URL */}
          <div className="mt-3 flex items-center gap-2">
            <code className="truncate rounded bg-gray-800 px-2 py-1 text-xs text-mcpl-cyan">
              /api/mcp/{project.slug}/mcp
            </code>
            <button
              onClick={copyUrl}
              className="shrink-0 text-gray-500 hover:text-white"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>

          {/* Stats row */}
          <div className="mt-3 flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-xs text-gray-400">
              <Activity className="h-3.5 w-3.5 text-mcpl-cyan" />
              {project.event_count} discovery events
            </span>
            <span className="text-xs text-gray-500">
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
              className="text-gray-400 hover:text-white"
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
