import { Activity } from "lucide-react";

interface DiscoveryEvent {
  id: string;
  tool_name: string;
  ai_client: string | null;
  latency_ms: number | null;
  status: string;
  created_at: string;
}

function parseAiClient(userAgent: string | null): string {
  if (!userAgent) return "Unknown AI";
  const ua = userAgent.toLowerCase();
  if (ua.includes("claude") || ua.includes("anthropic")) return "Claude";
  if (ua.includes("openai") || ua.includes("chatgpt")) return "ChatGPT";
  if (ua.includes("perplexity")) return "Perplexity";
  if (ua.includes("cursor")) return "Cursor";
  if (ua.includes("copilot")) return "Copilot";
  return "AI Assistant";
}

function timeAgo(dateStr: string): string {
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000,
  );
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function DiscoveryFeed({ events }: { events: DiscoveryEvent[] }) {
  if (events.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-700 p-8 text-center">
        <Activity className="mx-auto h-8 w-8 text-gray-600" />
        <p className="mt-3 text-sm text-gray-500">
          No discovery events yet. Once AI assistants start using your tools,
          events will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {events.map((event) => (
        <div
          key={event.id}
          className="flex items-center gap-3 rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2.5"
        >
          <div
            className={`h-2 w-2 shrink-0 rounded-full ${
              event.status === "success" ? "bg-green-400" : "bg-red-400"
            }`}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <code className="truncate text-xs font-medium text-mcpl-cyan">
                {event.tool_name}
              </code>
              <span className="shrink-0 text-xs text-gray-500">
                by {parseAiClient(event.ai_client)}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {event.latency_ms != null && (
              <span className="text-xs text-gray-600">
                {event.latency_ms}ms
              </span>
            )}
            <span className="text-xs text-gray-500">
              {timeAgo(event.created_at)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
