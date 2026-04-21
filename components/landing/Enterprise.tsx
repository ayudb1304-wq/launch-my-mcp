"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  AlertCircle,
  Clock,
  FileText,
  Network,
  Lock,
  ClipboardCheck,
  Workflow,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Phase = "Problem" | "Solution" | "Outcome";

interface Step {
  phase: Phase;
  icon: typeof Lock;
  title: string;
  body: string;
}

const steps: Step[] = [
  {
    phase: "Problem",
    icon: AlertCircle,
    title: "Agents everywhere. Access nowhere.",
    body:
      "Foundry, Copilot, and Jules are live across your org. None of them can reach the internal systems that matter.",
  },
  {
    phase: "Problem",
    icon: Clock,
    title: "The integration backlog.",
    body:
      "Every new agent use case lands on your platform team. Pilots stall before they ever see production.",
  },
  {
    phase: "Solution",
    icon: FileText,
    title: "Describe the system.",
    body:
      "Point us at an internal API. We generate the MCP tool definitions for your team to review and approve.",
  },
  {
    phase: "Solution",
    icon: Network,
    title: "Deploy into your tenant.",
    body:
      "Azure Container Apps in your subscription, over Private Link. Regulated data never leaves your VNet.",
  },
  {
    phase: "Solution",
    icon: Lock,
    title: "Entra ID on every call.",
    body:
      "Tool calls run on behalf of the real user, not a shared service account. Your existing RBAC applies as-is.",
  },
  {
    phase: "Solution",
    icon: ClipboardCheck,
    title: "Audit trail by default.",
    body:
      "Every tool invocation is logged, tamper-evident, and exportable to your SIEM on your existing schedule.",
  },
  {
    phase: "Solution",
    icon: Workflow,
    title: "Register once. Reach every agent.",
    body:
      "Foundry Agent Service, M365 Copilot, GitHub Copilot, and any MCP client — from a single server.",
  },
  {
    phase: "Outcome",
    icon: Check,
    title: "Pilots reach production.",
    body:
      "Security signs off. Procurement approves. Your platform team stops being the bottleneck.",
  },
];

const phaseLabel: Record<Phase, string> = {
  Problem: "01 · The pain",
  Solution: "02 · What we ship",
  Outcome: "03 · The outcome",
};

export default function Enterprise() {
  return (
    <section id="enterprise" className="relative px-6 py-24 md:py-32">
      <div className="mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="mb-5 flex items-center gap-3"
        >
          <Badge
            variant="outline"
            className="rounded-full border-border px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            Coming soon — Enterprise
          </Badge>
          <span className="hidden text-xs text-muted-foreground/70 sm:inline">
            Private preview · Q3 2026
          </span>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-4 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          From stalled pilots to production agents.{" "}
          <span className="text-muted-foreground">Here&apos;s the path.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16 max-w-2xl text-base leading-relaxed text-muted-foreground"
        >
          How an enterprise agent program goes from demo to deployed — without
          another custom integration project.
        </motion.p>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical rail */}
          <div
            aria-hidden
            className="absolute left-[19px] top-2 bottom-2 w-px bg-border md:left-[23px]"
          />

          <ol className="flex flex-col gap-10">
            {steps.map((step, i) => {
              const prevPhase = i > 0 ? steps[i - 1].phase : null;
              const showPhaseLabel = step.phase !== prevPhase;
              const Icon = step.icon;

              return (
                <motion.li
                  key={step.title}
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{
                    duration: 0.5,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="relative pl-14 md:pl-16"
                >
                  {/* Node dot */}
                  <span
                    aria-hidden
                    className="absolute left-0 top-0 flex size-10 items-center justify-center rounded-full border border-border bg-background md:size-12"
                  >
                    <Icon className="size-4 text-foreground md:size-[18px]" />
                  </span>

                  {showPhaseLabel && (
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/80">
                      {phaseLabel[step.phase]}
                    </p>
                  )}

                  <h3 className="mb-1.5 text-lg font-semibold leading-snug text-foreground md:text-xl">
                    {step.title}
                  </h3>
                  <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
                    {step.body}
                  </p>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {/* CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mt-20 flex flex-col items-start gap-6 rounded-2xl border border-foreground/20 bg-foreground p-8 text-background md:flex-row md:items-center md:justify-between md:p-10"
        >
          <div className="max-w-xl">
            <h3 className="mb-2 text-xl font-bold tracking-tight md:text-2xl">
              Join the design partner program.
            </h3>
            <p className="text-sm leading-relaxed text-background/80">
              A small cohort is shaping the roadmap before GA. Hands-on
              implementation support and preferential pricing at launch.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              variant="secondary"
              className="h-11 cursor-pointer rounded-lg px-6 text-sm font-semibold"
              asChild
            >
              <a href="mailto:enterprise@launchmymcp.com?subject=Enterprise%20early%20access">
                Request early access
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 cursor-pointer rounded-lg border-background/30 bg-transparent px-6 text-sm font-semibold text-background hover:bg-background/10 hover:text-background"
              asChild
            >
              <a href="mailto:enterprise@launchmymcp.com?subject=Enterprise%20briefing%20request">
                Talk to our team
              </a>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
