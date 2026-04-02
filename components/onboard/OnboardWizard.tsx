"use client";

import { useCallback } from "react";
import { useOnboardStore, type OnboardStep } from "@/lib/onboard-store";
import { TooltipProvider } from "@/components/ui/tooltip";
import { StepDescribe } from "./StepDescribe";
import { StepProductDetails } from "./StepProductDetails";
import { StepReview } from "./StepReview";
import { StepDeploy } from "./StepDeploy";
import { StepTransition } from "./StepTransition";

const steps = [
  { key: "describe" as const, label: "Describe" },
  { key: "details" as const, label: "Teach" },
  { key: "review" as const, label: "Review" },
  { key: "deploy" as const, label: "Launch" },
];

function getStepIndex(step: OnboardStep): number {
  if (step === "describe" || step === "transition-describe") return 0;
  if (step === "details" || step === "transition-details") return 1;
  if (step === "review" || step === "transition-review") return 2;
  return 3;
}

const TRANSITION_MESSAGES: Record<string, string[]> = {
  "transition-describe": [
    "Nice. Now let's give AI the details it needs to recommend you...",
  ],
  "transition-details": [
    "Analyzing your product...",
    "Writing your AI profile...",
    "Teaching AI when to recommend you...",
    "Done. Here's how AI will see your product",
  ],
  "transition-review": [
    "Everything looks good. Let's go live",
  ],
};

const headings: Record<string, { title: string; subtitle: string }> = {
  describe: {
    title: "Let's introduce your product to AI",
    subtitle:
      "Right now, when someone asks Claude or ChatGPT about tools like yours — they don't know you exist. Let's change that.",
  },
  details: {
    title: "Teach AI what makes you special",
    subtitle:
      "When someone asks an AI 'what's a good invoicing tool?' — this is exactly what it'll use to answer. The more you share, the smarter its recommendation.",
  },
  review: {
    title: "Here's how AI assistants will see your product",
    subtitle:
      "We created your AI discovery profile. Each card below is a question AI can now answer about you — powered by what you just told us.",
  },
  deploy: {
    title: "Launching your AI presence",
    subtitle:
      "In a few seconds, your product will be visible to AI assistants around the world.",
  },
};

export function OnboardWizard() {
  const step = useOnboardStore((s) => s.step);
  const isGenerating = useOnboardStore((s) => s.isGenerating);
  const setStep = useOnboardStore((s) => s.setStep);

  const currentIndex = getStepIndex(step);
  const isTransition = step.startsWith("transition-");

  const handleTransitionComplete = useCallback(() => {
    if (step === "transition-describe") {
      setStep("details");
    } else if (step === "transition-details") {
      // AI generation handles step change via setGeneratedTools → "review"
      // If generation already completed, go to review
      const currentStep = useOnboardStore.getState().step;
      if (currentStep === "transition-details" && !useOnboardStore.getState().isGenerating) {
        setStep("review");
      }
    } else if (step === "transition-review") {
      setStep("deploy");
    }
  }, [step, setStep]);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex flex-1 items-start justify-center px-4 py-12 lg:px-8">
        <div className="w-full max-w-lg space-y-8">
          {/* Progress indicator — narrative labels */}
          <div className="flex items-center justify-center gap-2">
            {steps.map((s, i) => (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    i < currentIndex
                      ? "bg-primary text-primary-foreground"
                      : i === currentIndex
                        ? "border-2 border-primary text-primary"
                        : "border border-border text-muted-foreground"
                  }`}
                >
                  {i < currentIndex ? "\u2713" : i + 1}
                </div>
                <span
                  className={`hidden text-sm sm:inline ${
                    i === currentIndex ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {s.label}
                </span>
                {i < steps.length - 1 && (
                  <div
                    className={`mx-2 h-px w-8 ${
                      i < currentIndex ? "bg-primary" : "bg-border"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {/* Step title — hidden during transitions and generation */}
          {!isTransition && !isGenerating && headings[step] && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground">
                {headings[step].title}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                {headings[step].subtitle}
              </p>
            </div>
          )}

          {/* Step content */}
          <div className="rounded-xl border border-border bg-card p-6">
            {isTransition && TRANSITION_MESSAGES[step] ? (
              <StepTransition
                messages={TRANSITION_MESSAGES[step]}
                onComplete={handleTransitionComplete}
              />
            ) : (
              <>
                {step === "describe" && <StepDescribe />}
                {step === "details" && <StepProductDetails />}
                {step === "review" && <StepReview />}
                {step === "deploy" && <StepDeploy />}
              </>
            )}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
