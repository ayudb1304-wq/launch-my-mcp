"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const events = [
  {
    client: "Claude",
    tool: "search_products",
    product: "InvoiceHero",
    timeAgo: "2 sec ago",
  },
  {
    client: "Cursor",
    tool: "create_task",
    product: "TaskFlow",
    timeAgo: "8 sec ago",
  },
  {
    client: "ChatGPT",
    tool: "find_restaurants",
    product: "TableReady",
    timeAgo: "15 sec ago",
  },
  {
    client: "Claude",
    tool: "get_analytics",
    product: "MetricsDash",
    timeAgo: "23 sec ago",
  },
  {
    client: "Perplexity",
    tool: "search_docs",
    product: "DocuFlow",
    timeAgo: "31 sec ago",
  },
  {
    client: "Cursor",
    tool: "list_projects",
    product: "BuildTrack",
    timeAgo: "45 sec ago",
  },
];

// Duplicate events for seamless loop
const loopedEvents = [...events, ...events];

export default function DiscoveryFeed() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} id="discovery" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start lg:gap-16">
          {/* Left: headline */}
          <motion.div
            className="lg:sticky lg:top-32"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Products being{" "}
              <span className="text-muted-foreground">recommended by AI right now.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Real-time discovery events from products powered by Launch My MCP.
            </p>
          </motion.div>

          {/* Right: feed card */}
          <motion.div
            className="relative overflow-hidden rounded-xl border border-border bg-card"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Top fade */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-card to-transparent" />
          {/* Bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-card to-transparent" />

          {/* Scrolling container */}
          <div className="h-[280px] overflow-hidden py-4">
            <div className="animate-scroll-up flex flex-col gap-0">
              {loopedEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-muted/50"
                >
                  {/* Pulsing green dot */}
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-foreground opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-foreground" />
                  </span>

                  {/* Event text */}
                  <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {event.client}
                    </span>{" "}
                    used{" "}
                    <span className="font-mono text-xs text-primary">
                      &quot;{event.tool}&quot;
                    </span>{" "}
                    from{" "}
                    <span className="font-medium text-foreground">
                      {event.product}
                    </span>
                  </p>

                  {/* Time */}
                  <span className="shrink-0 text-xs text-muted-foreground/60">
                    {event.timeAgo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom label */}
          <div className="relative z-20 border-t border-border px-5 py-3">
            <p className="text-xs text-muted-foreground/50">
              Example events from beta users
            </p>
          </div>
        </motion.div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-up {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-50%);
          }
        }
        .animate-scroll-up {
          animation: scroll-up 12s linear infinite;
        }
      `}</style>
    </section>
  );
}
