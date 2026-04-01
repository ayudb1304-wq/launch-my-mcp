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
      color: "text-mcpl-cyan",
      bgColor: "bg-mcpl-cyan/10",
    },
    {
      label: "Live Servers",
      value: `${liveServers}/${totalServers}`,
      icon: Server,
      color: "text-mcpl-green",
      bgColor: "bg-mcpl-green/10",
    },
    {
      label: "Ad Spend Saved",
      value: `$${adSpendSaved.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: DollarSign,
      color: "text-yellow-400",
      bgColor: "bg-yellow-400/10",
    },
  ];

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="rounded-lg border border-gray-800 bg-gray-900/50 p-4"
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg ${metric.bgColor}`}
            >
              <metric.icon className={`h-5 w-5 ${metric.color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{metric.value}</p>
              <p className="text-xs text-gray-400">{metric.label}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
