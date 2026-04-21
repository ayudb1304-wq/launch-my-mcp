"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Lock,
  Network,
  ClipboardCheck,
  Building2,
  Workflow,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const pillars = [
  {
    icon: Lock,
    title: "Entra ID & on-behalf-of auth",
    body:
      "Every tool call carries the caller's identity, not a shared service account. Your existing SSO policies, conditional access, and RBAC apply without a second identity system to maintain.",
  },
  {
    icon: Network,
    title: "Private deployment, your tenant",
    body:
      "Deploy MCP servers into your own Azure subscription over Private Link. Regulated data never leaves your VNet, and your cloud team keeps the infrastructure it already knows how to operate.",
  },
  {
    icon: Workflow,
    title: "Native integrations across agents",
    body:
      "One-click registration with Azure AI Foundry Agent Service, Microsoft 365 Copilot, GitHub Copilot, and any MCP-compliant client your teams adopt next. Register once, everywhere.",
  },
  {
    icon: ClipboardCheck,
    title: "Audit & compliance",
    body:
      "SOC 2 Type II and ISO 27001 on the platform. A complete, tamper-evident audit trail of every tool call is exportable to your SIEM with role-based access controls at the tool level.",
  },
  {
    icon: Shield,
    title: "Governance at the protocol level",
    body:
      "PII redaction, prompt shields, per-tenant rate limits, and human-in-the-loop approval workflows for write operations. Security guardrails enforced on the server, not on every client.",
  },
  {
    icon: Building2,
    title: "Azure Marketplace transactable",
    body:
      "Procure through Azure Marketplace and draw down committed Azure spend. Standard MSA, DPA, and vendor security reviews on file — designed for the way enterprise actually buys.",
  },
];

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
};

export default function Enterprise() {
  return (
    <section
      id="enterprise"
      className="relative px-6 py-24 md:py-32"
    >
      <div className="mx-auto max-w-7xl">
        {/* Eyebrow */}
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
            Private preview begins Q3 2026
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="mb-6 max-w-3xl text-3xl font-bold leading-tight tracking-tight text-foreground md:text-4xl lg:text-5xl"
        >
          Your agents already know how to reach your customers.{" "}
          <span className="text-muted-foreground">
            Now let them reach your operations.
          </span>
        </motion.h2>

        {/* Lead narrative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-14 max-w-3xl space-y-5 text-base leading-relaxed text-muted-foreground md:text-lg"
        >
          <p>
            Walk into most enterprises today and the pattern is the same.
            Azure AI Foundry is running pilots. Copilot is deployed across
            sales and support. A handful of engineering teams are running
            Jules against their repositories. And every one of them hits the
            same wall — the internal systems that would make those agents
            genuinely useful are locked behind authentication models built
            for humans, not agents.
          </p>
          <p>
            So a central platform team becomes the bottleneck. Integrations
            get built one at a time. Six months later, three systems are
            connected and every pilot is stuck in demo-land. The promise of
            agents doing real work never meets the reality of production
            access controls.
          </p>
          <p className="text-foreground">
            Launch My MCP for Enterprise is built to close that gap — without
            asking your security team to approve anything they haven&apos;t
            seen before.
          </p>
        </motion.div>

        {/* Story card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="mb-12 rounded-2xl border border-border bg-card p-8 md:p-10"
        >
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                How it works
              </h3>
              <p className="text-lg font-medium leading-snug text-foreground md:text-xl">
                Turn any internal API into a governed MCP server in under an
                hour — with the controls your security team will actually
                sign off on.
              </p>
            </div>

            <div className="space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
              <p>
                You describe the system in plain English. We generate the
                MCP tool definitions, deploy them into your own Azure
                subscription, and wire them to Entra ID so every call is
                made on behalf of the user asking. Your audit log gets a
                record of each tool invocation, exportable to your SIEM on
                the same schedule as the rest of your logs.
              </p>
              <p>
                Register the server once. It becomes immediately discoverable
                by Foundry Agent Service, Microsoft 365 Copilot, GitHub
                Copilot, and any MCP-compliant agent your teams adopt next —
                without another integration project.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Pillars grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className="mb-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          {pillars.map((pillar) => (
            <motion.div
              key={pillar.title}
              variants={fadeUp}
              className="flex flex-col rounded-xl border border-border bg-card p-6"
            >
              <div className="mb-4 inline-flex size-9 items-center justify-center rounded-lg border border-border bg-background">
                <pillar.icon className="size-4 text-foreground" />
              </div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">
                {pillar.title}
              </h4>
              <p className="text-sm leading-relaxed text-muted-foreground">
                {pillar.body}
              </p>
            </motion.div>
          ))}
        </motion.div>

        {/* CTA band */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="flex flex-col items-start gap-6 rounded-2xl border border-foreground/20 bg-foreground p-8 text-background md:flex-row md:items-center md:justify-between md:p-10"
        >
          <div className="max-w-2xl">
            <h3 className="mb-2 text-xl font-bold tracking-tight md:text-2xl">
              Join the design partner program
            </h3>
            <p className="text-sm leading-relaxed text-background/80 md:text-base">
              We&apos;re working with a small cohort across financial
              services, healthcare, and manufacturing to shape the roadmap
              before general availability. Early partners get hands-on
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
