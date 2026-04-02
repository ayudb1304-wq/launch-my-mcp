"use client";

import { useEffect, useState, useMemo } from "react";
import { useOnboardStore } from "@/lib/onboard-store";
import { Button } from "@/components/ui/button";
import { Check, Rocket, ArrowRight, Copy, Share2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

const deploySteps = [
  "Setting up your AI server...",
  "Loading your product profile...",
  "Connecting to AI networks...",
  "Submitting to AI registries...",
  "You're live! AI can find you now.",
];

function ChatSimulation({
  productName,
  tools,
}: {
  productName: string;
  tools: Array<{ name: string; static_response?: Record<string, unknown> }>;
}) {
  const [visibleMessages, setVisibleMessages] = useState(0);

  // Build a simulated AI response from the actual static_response data
  const aiResponse = useMemo(() => {
    const overview = tools.find((t) => t.name === "get_product_overview");
    const pricing = tools.find((t) => t.name === "get_pricing");

    let response = `I'd recommend ${productName}.`;

    if (overview?.static_response) {
      const desc =
        (overview.static_response.description as string) ??
        (overview.static_response.summary as string);
      if (desc) {
        response += ` ${typeof desc === "string" ? desc.split(".").slice(0, 2).join(".") + "." : ""}`;
      }
      const audience = overview.static_response.target_audience as string;
      if (audience) {
        response += ` It's designed for ${audience.toLowerCase()}.`;
      }
    }

    if (pricing?.static_response) {
      const plans = (pricing.static_response.plans ??
        pricing.static_response.pricing_plans) as
        | Array<{ name: string; price: string }>
        | undefined;
      if (plans?.length) {
        const planStr = plans
          .slice(0, 3)
          .map((p) => `${p.name} (${p.price})`)
          .join(", ");
        response += ` Plans start at ${plans[0]?.price}, with options: ${planStr}.`;
      }
    }

    return response;
  }, [productName, tools]);

  useEffect(() => {
    if (visibleMessages < 3) {
      const delays = [400, 1200, 800];
      const timer = setTimeout(
        () => setVisibleMessages((v) => v + 1),
        delays[visibleMessages],
      );
      return () => clearTimeout(timer);
    }
  }, [visibleMessages]);

  return (
    <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-4">
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        Imagine this conversation happening right now
      </p>

      <AnimatePresence>
        {/* User message */}
        {visibleMessages >= 1 && (
          <motion.div
            key="user-msg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-end"
          >
            <div className="max-w-[80%] rounded-2xl rounded-br-md bg-primary/10 px-3 py-2">
              <p className="text-sm text-foreground">
                What&apos;s a good tool for{" "}
                {(() => {
                  const overview = tools.find(
                    (t) => t.name === "get_product_overview",
                  );
                  const audience =
                    (overview?.static_response?.target_audience as string) ?? "";
                  return audience ? audience.toLowerCase() : "my use case";
                })()}
                ?
              </p>
            </div>
          </motion.div>
        )}

        {/* Typing indicator */}
        {visibleMessages === 1 && (
          <motion.div
            key="typing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex gap-1 px-3 py-2"
          >
            <div className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground" />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
              style={{ animationDelay: "0.1s" }}
            />
            <div
              className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground"
              style={{ animationDelay: "0.2s" }}
            />
          </motion.div>
        )}

        {/* AI response */}
        {visibleMessages >= 2 && (
          <motion.div
            key="ai-msg"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="max-w-[90%] rounded-2xl rounded-bl-md bg-card px-3 py-2 ring-1 ring-foreground/10">
              <p className="text-sm text-foreground">{aiResponse}</p>
            </div>
          </motion.div>
        )}

        {/* Tagline */}
        {visibleMessages >= 3 && (
          <motion.p
            key="tagline"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="pt-1 text-center text-xs text-primary"
          >
            This is now possible because you&apos;re live.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

export function StepDeploy() {
  const store = useOnboardStore();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentStep < deploySteps.length) {
      const timer = setTimeout(
        () => setCurrentStep((s) => s + 1),
        800 + Math.random() * 400,
      );
      return () => clearTimeout(timer);
    } else {
      setDone(true);
    }
  }, [currentStep]);

  const mcpUrl = `launchmymcp.com/mcp/${store.slug}`;

  function copyUrl() {
    navigator.clipboard.writeText(`https://${mcpUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const tweetText = encodeURIComponent(
    `My product ${store.name} is now discoverable by AI assistants like Claude and ChatGPT — zero ad spend. Built my AI profile in 5 minutes with @LaunchMyMCP`,
  );

  return (
    <div className="space-y-8 text-center">
      {/* Progress steps */}
      <div className="space-y-3">
        {deploySteps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
              i < currentStep
                ? "border-primary/30 bg-primary/5"
                : i === currentStep
                  ? "border-border bg-card"
                  : "border-border bg-muted/50 opacity-40"
            }`}
          >
            {i < currentStep ? (
              <Check className="h-4 w-4 text-primary" />
            ) : i === currentStep ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-border" />
            )}
            <span
              className={`text-sm ${i < currentStep ? "text-primary" : i === currentStep ? "text-foreground" : "text-muted-foreground"}`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Success state */}
      {done && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-8 w-8 text-primary" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-foreground">
              Your product is now discoverable by AI
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              AI assistants can now learn about and recommend {store.name}
            </p>
          </div>

          {/* Chat simulation */}
          <ChatSimulation
            productName={store.name}
            tools={store.tools.filter((t) => t.enabled)}
          />

          {/* Server URL */}
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <p className="mb-2 text-xs text-muted-foreground">Your AI Server URL</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm font-medium text-primary">
                {mcpUrl}
              </code>
              <button
                onClick={copyUrl}
                className="text-muted-foreground hover:text-foreground"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          {/* Share + Dashboard */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() =>
                window.open(
                  `https://twitter.com/intent/tweet?text=${tweetText}`,
                  "_blank",
                )
              }
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share your launch
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                store.reset();
                router.push("/dashboard");
              }}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
