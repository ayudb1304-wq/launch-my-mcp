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
      <div className="mx-auto max-w-5xl">
        {/* Headline */}
        <motion.h2
          className="font-heading mx-auto mb-14 max-w-3xl text-center text-3xl font-bold leading-tight tracking-tight text-foreground md:mb-20 md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          You&apos;re burning money on ads.{" "}
          <span className="text-mcpl-cyan">There&apos;s a better way.</span>
        </motion.h2>

        {/* Two-column comparison */}
        <div className="grid gap-6 md:grid-cols-[5fr_6fr] md:gap-8">
          {/* OLD WAY */}
          <motion.div
            className="relative rounded-xl border border-destructive/20 bg-destructive/[0.04] p-6 backdrop-blur-sm md:p-8"
            initial={{ opacity: 0, x: -40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h3 className="font-heading mb-6 text-lg font-bold tracking-wider text-destructive">
              The Old Way
            </h3>
            <ul className="flex flex-col gap-4">
              {oldWayItems.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed text-muted-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.4 + i * 0.08 }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/15">
                    <X className="h-3 w-3 text-destructive" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* NEW WAY */}
          <motion.div
            className="relative rounded-xl border border-mcpl-cyan/20 bg-mcpl-cyan/[0.04] p-6 shadow-[0_0_40px_-12px_rgba(0,229,255,0.15)] backdrop-blur-sm md:scale-[1.02] md:p-8"
            initial={{ opacity: 0, x: 40 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            {/* Subtle glow border accent */}
            <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-mcpl-cyan/10" />

            <h3 className="font-heading mb-6 text-lg font-bold tracking-wider text-mcpl-green">
              The MCPLaunch Way
            </h3>
            <ul className="flex flex-col gap-4">
              {newWayItems.map((item, i) => (
                <motion.li
                  key={i}
                  className="flex items-start gap-3 text-sm leading-relaxed text-foreground/90"
                  initial={{ opacity: 0, x: 10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.3, delay: 0.5 + i * 0.08 }}
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-mcpl-green/15">
                    <Check className="h-3 w-3 text-mcpl-green" />
                  </span>
                  {item}
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
