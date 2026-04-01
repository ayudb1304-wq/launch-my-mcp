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
      <div className="mx-auto max-w-4xl">
        {/* Headline */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            Products being recommended by AI right now
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-mcpl-cyan/80" />
        </motion.div>

        {/* Feed card */}
        <motion.div
          className="relative mx-auto max-w-2xl overflow-hidden rounded-xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-md"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Top fade */}
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-12 bg-gradient-to-b from-[var(--mcpl-deep)] to-transparent" />
          {/* Bottom fade */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-16 bg-gradient-to-t from-[var(--mcpl-deep)] to-transparent" />

          {/* Scrolling container */}
          <div className="h-[280px] overflow-hidden py-4">
            <div className="animate-scroll-up flex flex-col gap-0">
              {loopedEvents.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-white/[0.02]"
                >
                  {/* Pulsing green dot */}
                  <span className="relative flex h-2.5 w-2.5 shrink-0">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--mcpl-green)] opacity-75" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-[var(--mcpl-green)]" />
                  </span>

                  {/* Event text */}
                  <p className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">
                      {event.client}
                    </span>{" "}
                    used{" "}
                    <span className="font-mono text-xs text-mcpl-cyan">
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
          <div className="relative z-20 border-t border-white/[0.06] px-5 py-3">
            <p className="text-center text-xs text-muted-foreground/50">
              Example events from beta users
            </p>
          </div>
        </motion.div>
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
