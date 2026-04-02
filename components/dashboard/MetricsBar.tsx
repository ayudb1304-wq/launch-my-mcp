import { Activity, Server, DollarSign } from "lucide-react";

export function MetricsBar({
  totalEvents,
  liveServers,
  totalServers,
}: {
  totalEvents: number;
  liveServers: number;
  totalServers: number;
}) {
  // Estimate ad spend saved: ~$2.50 per discovery event (conservative CPC equivalent)
  const adSpendSaved = totalEvents * 2.5;

  const metrics = [
    {
      label: "Discovery Events",
      value: totalEvents.toLocaleString(),
      icon: Activity,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-50 dark:bg-blue-950",
    },
    {
      label: "Live Servers",
      value: `${liveServers}/${totalServers}`,
      icon: Server,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-50 dark:bg-green-950",
    },
    {
      label: "Ad Spend Saved",
      value: `$${adSpendSaved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "text-amber-600 dark:text-amber-400",
      bgColor: "bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg bg-card p-4 ring-1 ring-foreground/10"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bgColor}`}
            >
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metric.value}</p>
              <p className="text-xs text-muted-foreground">{metric.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
