"use client";

import { useEffect, useState } from "react";
import { useOnboardStore } from "@/lib/onboard-store";
import { Button } from "@/components/ui/button";
import { Check, Rocket, ArrowRight, Copy } from "lucide-react";
import { useRouter } from "next/navigation";

const deploySteps = [
  "Creating MCP server...",
  "Registering tools...",
  "Configuring endpoints...",
  "Going live!",
];

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

  const mcpUrl = `mcplaunch.io/mcp/${store.slug}`;

  function copyUrl() {
    navigator.clipboard.writeText(`https://${mcpUrl}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-8 text-center">
      {/* Progress steps */}
      <div className="space-y-3">
        {deploySteps.map((step, i) => (
          <div
            key={i}
            className={`flex items-center gap-3 rounded-lg border px-4 py-3 transition-all ${
              i < currentStep
                ? "border-mcpl-cyan/30 bg-mcpl-cyan/5"
                : i === currentStep
                  ? "border-gray-600 bg-gray-900/50"
                  : "border-gray-800 bg-gray-900/20 opacity-40"
            }`}
          >
            {i < currentStep ? (
              <Check className="h-4 w-4 text-mcpl-cyan" />
            ) : i === currentStep ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-mcpl-cyan border-t-transparent" />
            ) : (
              <div className="h-4 w-4 rounded-full border border-gray-700" />
            )}
            <span
              className={`text-sm ${i < currentStep ? "text-mcpl-cyan" : i === currentStep ? "text-white" : "text-gray-600"}`}
            >
              {step}
            </span>
          </div>
        ))}
      </div>

      {/* Success state */}
      {done && (
        <div className="space-y-6">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-mcpl-cyan/10">
            <Rocket className="h-8 w-8 text-mcpl-cyan" />
          </div>

          <div>
            <h3 className="font-heading text-xl font-bold text-white">
              Your MCP server is ready!
            </h3>
            <p className="mt-2 text-sm text-gray-400">
              AI assistants can now discover {store.name}
            </p>
          </div>

          {/* Server URL */}
          <div className="rounded-lg border border-mcpl-cyan/20 bg-mcpl-cyan/5 p-4">
            <p className="mb-2 text-xs text-gray-400">Your MCP Server URL</p>
            <div className="flex items-center justify-center gap-2">
              <code className="text-sm font-medium text-mcpl-cyan">
                {mcpUrl}
              </code>
              <button
                onClick={copyUrl}
                className="text-gray-400 hover:text-white"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-400" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>

          <Button
            className="w-full bg-mcpl-cyan text-mcpl-deep hover:bg-mcpl-cyan/90"
            onClick={() => {
              store.reset();
              router.push("/dashboard");
            }}
          >
            Go to Dashboard
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
