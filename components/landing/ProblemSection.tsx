"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { X, Check } from "lucide-react";

const oldWayItems = [
  "$80\u2013200 cost per customer acquired",
  "Ads stop when budget stops",
  "Banner blindness, low trust",
  "Requires marketing expertise",
  "Algorithm changes kill your traffic",
];

const newWayItems = [
  "$0 — AI recommends you for free",
  "Gets better over time, not worse",
  "AI recommendation = instant credibility",
  "Set up once, works on autopilot",
  "Built on an open standard, not someone else's algorithm",
];

export default function ProblemSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  return (
    <section
      ref={sectionRef}
      className="relative px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-16">
          {/* Left: headline */}
          <motion.div
            className="lg:sticky lg:top-32"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl">
              You&apos;re burning money on ads.{" "}
              <span className="text-muted-foreground">There&apos;s a better way.</span>
            </h2>
          </motion.div>

          {/* Right: comparison cards */}
          <div className="space-y-4">
            {/* OLD WAY */}
            <motion.div
              className="rounded-xl border border-border bg-card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                The Old Way
              </h3>
              <ul className="flex flex-col gap-3">
                {oldWayItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-muted">
                      <X className="h-3 w-3 text-muted-foreground" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* NEW WAY */}
            <motion.div
              className="rounded-xl border border-foreground/20 bg-foreground p-6 text-background"
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.35 }}
            >
              <h3 className="mb-5 text-sm font-semibold uppercase tracking-wider text-background/60">
                The Launch My MCP Way
              </h3>
              <ul className="flex flex-col gap-3">
                {newWayItems.map((item, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 text-sm leading-relaxed text-background/90"
                  >
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-background/20">
                      <Check className="h-3 w-3 text-background" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
