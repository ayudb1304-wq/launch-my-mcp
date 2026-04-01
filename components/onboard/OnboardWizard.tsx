"use client";

import { useOnboardStore } from "@/lib/onboard-store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StepDescribe } from "./StepDescribe";
import { StepReview } from "./StepReview";
import { StepDeploy } from "./StepDeploy";

const steps = [
  { key: "describe" as const, label: "Describe", number: 1 },
  { key: "review" as const, label: "Review Tools", number: 2 },
  { key: "deploy" as const, label: "Deploy", number: 3 },
];

export function OnboardWizard() {
  const step = useOnboardStore((s) => s.step);
  const isGenerating = useOnboardStore((s) => s.isGenerating);

  const currentIndex = steps.findIndex((s) => s.key === step);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-1 items-start justify-center px-4 py-12 lg:px-8">
          <div className="w-full max-w-lg space-y-8">
            {/* Progress indicator */}
            <div className="flex items-center justify-center gap-2">
              {steps.map((s, i) => (
                <div key={s.key} className="flex items-center gap-2">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                      i < currentIndex
                        ? "bg-mcpl-cyan text-mcpl-deep"
                        : i === currentIndex
                          ? "border-2 border-mcpl-cyan text-mcpl-cyan"
                          : "border border-gray-700 text-gray-600"
                    }`}
                  >
                    {i < currentIndex ? "✓" : s.number}
                  </div>
                  <span
                    className={`hidden text-sm sm:inline ${
                      i === currentIndex ? "text-white" : "text-gray-500"
                    }`}
                  >
                    {s.label}
                  </span>
                  {i < steps.length - 1 && (
                    <div
                      className={`mx-2 h-px w-8 ${
                        i < currentIndex ? "bg-mcpl-cyan" : "bg-gray-700"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step title — hidden during generation (overlay has its own) */}
            {!isGenerating && (
              <div className="text-center">
                {step === "describe" && (
                  <>
                    <h1 className="font-heading text-2xl font-bold text-white">
                      Tell us about your product
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                      AI will generate MCP tools based on your description — no
                      code required.
                    </p>
                  </>
                )}
                {step === "review" && (
                  <>
                    <h1 className="font-heading text-2xl font-bold text-white">
                      Review your MCP tools
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                      These are the actions AI assistants will use. Toggle off
                      any you don&apos;t want, or edit descriptions.
                    </p>
                  </>
                )}
                {step === "deploy" && (
                  <>
                    <h1 className="font-heading text-2xl font-bold text-white">
                      Deploying your MCP server
                    </h1>
                    <p className="mt-2 text-sm text-gray-400">
                      Hang tight — we&apos;re setting everything up.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* Step content */}
            <div className="rounded-xl border border-gray-800 bg-gray-900/30 p-6">
              {step === "describe" && <StepDescribe />}
              {step === "review" && <StepReview />}
              {step === "deploy" && <StepDeploy />}
            </div>
          </div>
      </div>
    </TooltipProvider>
  );
}
