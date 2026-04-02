"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Rocket, Sparkles } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "Describe",
    icon: MessageSquare,
    description:
      "Tell us what your product does in plain English and drop in your API link. No coding needed.",
  },
  {
    number: 2,
    title: "Deploy",
    icon: Rocket,
    description:
      "We build and launch your AI-ready server in seconds. You don't touch any infrastructure.",
  },
  {
    number: 3,
    title: "Get discovered",
    icon: Sparkles,
    description:
      "AI assistants start recommending your product to real users. No ads, no effort.",
  },
];

export default function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      id="how-it-works"
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
            <h2 className="text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
              Three steps.{" "}
              <span className="text-muted-foreground">That&apos;s it.</span>
            </h2>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground md:text-base">
              No engineers, no infrastructure, no configuration files. Just describe and deploy.
            </p>
          </motion.div>

          {/* Right: step cards stacked */}
          <div className="space-y-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  className="flex gap-5 rounded-xl border border-border bg-card p-6"
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.15 + index * 0.15 }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-background text-sm font-bold">
                    {step.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-semibold text-foreground">
                        {step.title}
                      </h3>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
