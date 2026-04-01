"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { MessageSquare, Rocket, Sparkles, ChevronRight, ChevronDown } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "DESCRIBE",
    icon: MessageSquare,
    description:
      "Tell us what your product does in plain English and drop in your API link. No coding needed.",
  },
  {
    number: 2,
    title: "DEPLOY",
    icon: Rocket,
    description:
      "We build and launch your AI-ready server in seconds. You don't touch any infrastructure.",
  },
  {
    number: 3,
    title: "GET DISCOVERED",
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
      <div className="mx-auto max-w-5xl">
        {/* Headline */}
        <motion.div
          className="mb-16 text-center md:mb-20"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            How It Works
          </h2>
          <div className="mx-auto mt-4 h-1 w-20 rounded-full bg-mcpl-cyan/80" />
        </motion.div>

        {/* Steps — 5-col grid on desktop: card | arrow | card | arrow | card */}
        <div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-[1fr_2rem_1fr_2rem_1fr] md:gap-0">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={step.number} className="contents">
                {/* Arrow between cards (desktop only) */}
                {index > 0 && (
                  <motion.div
                    className="hidden items-center justify-center md:flex"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.5 + index * 0.2 }}
                  >
                    <ChevronRight className="h-5 w-5 text-mcpl-cyan/40" />
                  </motion.div>
                )}

                {/* Mobile connecting arrow */}
                {index > 0 && (
                  <motion.div
                    className="flex justify-center md:hidden"
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.2 }}
                  >
                    <ChevronDown className="h-5 w-5 text-mcpl-cyan/40" />
                  </motion.div>
                )}

                {/* Card */}
                <motion.div
                  className="flex flex-col items-center text-center"
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.2 }}
                >
                  <div className="flex h-full w-full flex-col items-center rounded-xl border border-white/[0.08] bg-white/[0.03] p-6 backdrop-blur-md transition-colors duration-300 hover:border-mcpl-cyan/20 hover:bg-white/[0.05]">
                    <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full border-2 border-mcpl-cyan/60 bg-mcpl-cyan/10">
                      <span className="font-[family-name:var(--font-heading)] text-xl font-bold text-mcpl-cyan">
                        {step.number}
                      </span>
                    </div>
                    <div className="mb-4 flex justify-center">
                      <Icon className="h-6 w-6 text-mcpl-cyan/70" />
                    </div>
                    <h3 className="mb-3 font-[family-name:var(--font-heading)] text-lg font-bold tracking-wider text-foreground">
                      {step.title}
                    </h3>
                    <p className="mt-auto text-sm leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
