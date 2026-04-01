"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PlanFeature {
  text: string;
  included: boolean;
}

interface Plan {
  name: string;
  price: string;
  period: string;
  features: PlanFeature[];
  cta: string;
  highlighted?: boolean;
}

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    cta: "Start Free",
    features: [
      { text: "1 MCP server", included: true },
      { text: "50 events/mo", included: true },
      { text: "Manual registry", included: true },
      { text: "Health monitoring", included: false },
      { text: "Basic analytics", included: true },
    ],
  },
  {
    name: "Starter",
    price: "$29",
    period: "/mo",
    cta: "Get Started",
    highlighted: true,
    features: [
      { text: "3 MCP servers", included: true },
      { text: "2,000 events/mo", included: true },
      { text: "Auto registry", included: true },
      { text: "Health monitoring", included: true },
      { text: "Full analytics", included: true },
    ],
  },
  {
    name: "Pro",
    price: "$49",
    period: "/mo",
    cta: "Get Started",
    features: [
      { text: "10 MCP servers", included: true },
      { text: "Unlimited events", included: true },
      { text: "Auto registry", included: true },
      { text: "Health monitoring", included: true },
      { text: "Full analytics", included: true },
      { text: "Custom domain", included: true },
      { text: "Priority support", included: true },
    ],
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export function Pricing() {
  return (
    <section id="pricing" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.5 }}
          className="mb-16 text-center"
        >
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-muted-foreground">
            Start free. Scale when you&apos;re ready.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3 md:gap-0"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={cardVariants}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className={cn(
                "relative flex flex-col rounded-xl border p-6",
                plan.highlighted
                  ? "z-10 border-mcpl-cyan/50 bg-card shadow-[0_0_40px_-12px_var(--mcpl-cyan)] md:-my-4 md:rounded-xl md:p-8"
                  : "border-border bg-card hover:border-border/80 hover:shadow-lg",
              )}
            >
              {plan.highlighted && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 border-mcpl-cyan/30 bg-mcpl-cyan/10 text-mcpl-cyan">
                  Most Popular
                </Badge>
              )}

              <div className="mb-6">
                <h3 className="font-[family-name:var(--font-heading)] text-sm font-bold tracking-wide text-muted-foreground">
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-foreground">
                    {plan.price}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {plan.period}
                  </span>
                </div>
              </div>

              <ul className="mb-8 flex flex-1 flex-col gap-3">
                {plan.features.map((feature) => (
                  <li key={feature.text} className="flex items-center gap-2.5">
                    {feature.included ? (
                      <Check className="size-4 shrink-0 text-mcpl-green" />
                    ) : (
                      <X className="size-4 shrink-0 text-muted-foreground/50" />
                    )}
                    <span
                      className={cn(
                        "text-sm",
                        feature.included
                          ? "text-foreground"
                          : "text-muted-foreground/50",
                      )}
                    >
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                size="lg"
                className={cn(
                  "mt-auto w-full cursor-pointer",
                  plan.highlighted
                    ? "bg-mcpl-cyan text-mcpl-deep hover:bg-mcpl-cyan/80"
                    : "bg-secondary text-foreground hover:bg-secondary/80",
                )}
                asChild
              >
                <a href="/login">{plan.cta}</a>
              </Button>
            </motion.div>
          ))}
        </motion.div>

        <p className="mt-8 text-center text-xs text-muted-foreground/60">
          All plans include: Cloudflare edge hosting &middot; SSL &middot;
          Uptime monitoring
        </p>
      </div>
    </section>
  );
}
