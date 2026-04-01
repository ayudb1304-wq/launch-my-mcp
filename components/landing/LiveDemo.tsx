"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  motion,
  AnimatePresence,
  useInView,
} from "framer-motion";
import {
  Loader2,
  Check,
  ArrowRight,
  Sparkles,
  Circle,
  AlertCircle,
  RotateCcw,
  Zap,
  Globe,
  DollarSign,
  Users,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DEMO_PRESETS } from "@/lib/demo-presets";

// ---------------------------------------------------------------------------
// Schema
// ---------------------------------------------------------------------------

const formSchema = z.object({
  description: z
    .string()
    .min(20, "Please describe your product in at least 20 characters."),
  api_base_url: z.string().url("Please enter a valid URL."),
});

type FormValues = z.infer<typeof formSchema>;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tool {
  name: string;
  description: string;
  http_method: string;
  endpoint_path: string;
}

interface DemoResult {
  tools: Tool[];
  demo_query: string;
  demo_response: string;
}

type DemoState = "input" | "loading" | "result" | "error";

// ---------------------------------------------------------------------------
// Typewriter hook
// ---------------------------------------------------------------------------

function useTypewriter(text: string, speed = 20, enabled = false) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!enabled) {
      setDisplayed("");
      setDone(false);
      return;
    }
    let i = 0;
    setDisplayed("");
    setDone(false);
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed, enabled]);

  return { displayed, done };
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function StepIndicator({ step, total }: { step: number; total: number }) {
  return (
    <span className="font-mono text-[0.65rem] tracking-[0.2em] text-mcpl-cyan/70 uppercase">
      Step {step} of {total}
    </span>
  );
}

function LoadingStep({
  label,
  complete,
  active,
  delay,
}: {
  label: string;
  complete: boolean;
  active: boolean;
  delay: number;
}) {
  return (
    <motion.div
      className="flex items-center gap-3"
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <div className="flex h-6 w-6 shrink-0 items-center justify-center">
        {complete ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 15 }}
          >
            <Check className="h-4 w-4 text-mcpl-green" />
          </motion.div>
        ) : active ? (
          <Loader2 className="h-4 w-4 animate-spin text-mcpl-cyan" />
        ) : (
          <Circle className="h-3 w-3 text-muted-foreground/40" />
        )}
      </div>
      <span
        className={`font-mono text-sm ${
          complete
            ? "text-mcpl-green"
            : active
              ? "text-foreground"
              : "text-muted-foreground/50"
        }`}
      >
        {label}
      </span>
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LiveDemo() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-80px" });

  const [demoState, setDemoState] = useState<DemoState>("input");
  const [result, setResult] = useState<DemoResult | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  // Loading step states
  const [loadingSteps, setLoadingSteps] = useState([false, false, false]);

  // Result animation states
  const [showDiscovery, setShowDiscovery] = useState(false);
  const [showThinking, setShowThinking] = useState(false);
  const [showToolFound, setShowToolFound] = useState(false);
  const [showResponse, setShowResponse] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    trigger,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      description: "",
      api_base_url: "",
    },
  });

  const descriptionValue = watch("description");
  const urlValue = watch("api_base_url");

  const responseTypewriter = useTypewriter(
    result?.demo_response ?? "",
    15,
    showResponse,
  );

  // ------ Loading progression ------
  useEffect(() => {
    if (demoState !== "loading") return;

    const t1 = setTimeout(
      () => setLoadingSteps((s) => [true, s[1], s[2]]),
      1500,
    );
    const t2 = setTimeout(
      () => setLoadingSteps((s) => [s[0], true, s[2]]),
      3000,
    );
    const t3 = setTimeout(
      () => setLoadingSteps((s) => [s[0], s[1], true]),
      4500,
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [demoState]);

  // ------ Result reveal sequence ------
  useEffect(() => {
    if (demoState !== "result") return;

    const t1 = setTimeout(() => setShowDiscovery(true), 400);
    const t2 = setTimeout(() => setShowThinking(true), 1200);
    const t3 = setTimeout(() => setShowToolFound(true), 2800);
    const t4 = setTimeout(() => setShowResponse(true), 3800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [demoState]);

  const prefillPreset = useCallback(
    (index: number) => {
      const preset = DEMO_PRESETS[index];
      setValue("description", preset.description, { shouldValidate: true });
      setValue("api_base_url", preset.api_base_url, { shouldValidate: true });
    },
    [setValue],
  );

  const resetDemo = useCallback(() => {
    setDemoState("input");
    setResult(null);
    setErrorMessage("");
    setLoadingSteps([false, false, false]);
    setShowDiscovery(false);
    setShowThinking(false);
    setShowToolFound(false);
    setShowResponse(false);
  }, []);

  const onSubmit = useCallback(
    async (data: FormValues) => {
      setDemoState("loading");
      setLoadingSteps([false, false, false]);

      try {
        const res = await fetch("/api/demo/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        if (!res.ok) {
          throw new Error(
            `Request failed (${res.status}). Please try again.`,
          );
        }

        const json: DemoResult = await res.json();
        setResult(json);

        // Wait for loading animation to finish before showing result
        setTimeout(() => setDemoState("result"), 5200);
      } catch (err) {
        setErrorMessage(
          err instanceof Error ? err.message : "Something went wrong.",
        );
        setDemoState("error");
      }
    },
    [],
  );

  // ---------- Render ----------

  return (
    <section
      ref={sectionRef}
      id="live-demo"
      className="relative px-6 py-24 md:py-32"
    >
{/* removed radial glow — was creating blue bleed behind card */}

      <div className="mx-auto max-w-3xl">
        {/* Section headline */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl">
            See it work. Right now.{" "}
            <span className="text-mcpl-cyan">With YOUR product.</span>
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            No signup needed. Just describe your product and see how AI
            assistants would recommend it to their users.
          </p>
        </motion.div>

        {/* Main card */}
        <motion.div
          className="relative rounded-2xl"
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.15 }}
        >
          <div className="rounded-2xl border border-white/[0.1] bg-white/[0.03] p-6 backdrop-blur-xl md:p-8">
            <AnimatePresence mode="wait">
              {/* ============== STATE 1: INPUT ============== */}
              {demoState === "input" && (
                <motion.div
                  key="input"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                >
                  <StepIndicator step={1} total={2} />

                  <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="mt-5 space-y-5"
                  >
                    {/* Description */}
                    <div className="space-y-2">
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-foreground"
                      >
                        What does your product do?
                      </label>
                      <Textarea
                        id="description"
                        placeholder="e.g. An API that lets users search, book, and manage travel accommodations worldwide..."
                        className={`min-h-24 border-white/[0.1] bg-white/[0.04] text-sm focus-visible:border-mcpl-cyan/50 focus-visible:ring-mcpl-cyan/20 ${
                          errors.description ? "border-destructive/50" : ""
                        }`}
                        {...register("description")}
                      />
                      <div className="flex items-center justify-between">
                        {errors.description ? (
                          <p className="text-xs text-destructive">
                            {errors.description.message}
                          </p>
                        ) : (
                          <span />
                        )}
                        <span
                          className={`text-xs ${
                            (descriptionValue?.length ?? 0) >= 20
                              ? "text-mcpl-green/70"
                              : "text-muted-foreground/50"
                          }`}
                        >
                          {descriptionValue?.length ?? 0}/20 min
                        </span>
                      </div>
                    </div>

                    {/* URL */}
                    <div className="space-y-2">
                      <label
                        htmlFor="api_base_url"
                        className="flex items-center gap-2 text-sm font-medium text-foreground"
                      >
                        <Globe className="h-3.5 w-3.5 text-muted-foreground" />
                        Your API base URL
                      </label>
                      <Input
                        id="api_base_url"
                        type="url"
                        placeholder="https://api.yourproduct.com/v1"
                        className={`border-white/[0.1] bg-white/[0.04] text-sm focus-visible:border-mcpl-cyan/50 focus-visible:ring-mcpl-cyan/20 ${
                          errors.api_base_url ? "border-destructive/50" : ""
                        }`}
                        {...register("api_base_url")}
                      />
                      {errors.api_base_url && (
                        <p className="text-xs text-destructive">
                          {errors.api_base_url.message}
                        </p>
                      )}
                    </div>

                    {/* Submit */}
                    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
                      <Button
                        type="submit"
                        size="lg"
                        disabled={!isValid || isSubmitting}
                        className="h-10 cursor-pointer gap-2 bg-mcpl-cyan px-5 text-sm font-semibold text-mcpl-deep hover:bg-mcpl-cyan/85 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <Sparkles className="h-4 w-4" />
                        Generate My MCP Preview
                        <ArrowRight className="h-4 w-4" />
                      </Button>

                    </div>

                    {/* Quick-pick presets */}
                    <div className="space-y-2 border-t border-white/[0.06] pt-4">
                      <p className="flex items-center gap-1.5 text-xs text-muted-foreground/70">
                        <Zap className="h-3 w-3" />
                        Or try an example:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {DEMO_PRESETS.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => prefillPreset(i)}
                            className="cursor-pointer rounded-md border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-mcpl-cyan/80 transition-colors hover:border-mcpl-cyan/30 hover:bg-mcpl-cyan/5 hover:text-mcpl-cyan"
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* ============== STATE 2: LOADING ============== */}
              {demoState === "loading" && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.4 }}
                  className="flex min-h-[220px] flex-col justify-center space-y-5 py-4"
                >
                  <LoadingStep
                    label="Analyzing your product..."
                    complete={loadingSteps[0]}
                    active={!loadingSteps[0]}
                    delay={0}
                  />
                  <LoadingStep
                    label="Generating MCP tool definitions..."
                    complete={loadingSteps[1]}
                    active={loadingSteps[0] && !loadingSteps[1]}
                    delay={1.5}
                  />
                  <LoadingStep
                    label="Preparing AI discovery simulation..."
                    complete={loadingSteps[2]}
                    active={loadingSteps[1] && !loadingSteps[2]}
                    delay={3}
                  />
                </motion.div>
              )}

              {/* ============== STATE: ERROR ============== */}
              {demoState === "error" && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="flex min-h-[220px] flex-col items-center justify-center gap-4 py-8 text-center"
                >
                  <AlertCircle className="h-8 w-8 text-destructive" />
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {errorMessage}
                  </p>
                  <Button
                    variant="outline"
                    size="lg"
                    className="h-9 cursor-pointer gap-2 text-sm"
                    onClick={resetDemo}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Try Again
                  </Button>
                </motion.div>
              )}

              {/* ============== STATE 3: RESULT ============== */}
              {demoState === "result" && result && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-6"
                >
                  {/* Header */}
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mcpl-green opacity-75" />
                      <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-mcpl-green" />
                    </span>
                    <span className="font-mono text-xs tracking-wider text-mcpl-green uppercase">
                      Your product is now discoverable by AI
                    </span>
                  </div>

                  <Separator className="bg-white/[0.08]" />

                  {/* Scenario explainer */}
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-foreground">
                      Here&apos;s what happens when someone needs what you sell:
                    </h3>
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      Instead of searching Google, clicking ads, and comparing
                      options — they just ask their AI assistant. And your
                      product shows up as the answer.
                    </p>
                  </div>

                  {/* AI Discovery Simulation */}
                  <div className="space-y-3 rounded-lg border border-white/[0.06] bg-white/[0.02] p-4">
                    <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground/60 uppercase">
                      A real user, asking for help...
                    </p>

                    {/* User query */}
                    <AnimatePresence>
                      {showDiscovery && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="rounded-md bg-white/[0.03] px-3 py-2"
                        >
                          <p className="text-sm text-foreground/90 italic">
                            &ldquo;{result.demo_query}&rdquo;
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Claude thinks */}
                    <AnimatePresence>
                      {showThinking && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                          className="flex items-center gap-2 py-1"
                        >
                          {!showToolFound ? (
                            <>
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-mcpl-cyan" />
                              <span className="text-xs text-muted-foreground">
                                AI is searching for the best tool to help...
                              </span>
                            </>
                          ) : (
                            <>
                              <Check className="h-3.5 w-3.5 text-mcpl-green" />
                              <span className="text-xs text-mcpl-green">
                                Found your product! Using{" "}
                                <span className="font-mono font-semibold">
                                  {result.tools[0]?.name ?? "your_tool"}
                                </span>
                              </span>
                            </>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Claude responds */}
                    <AnimatePresence>
                      {showResponse && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.4 }}
                        >
                          <Separator className="my-2 bg-white/[0.06]" />
                          <p className="mb-1 text-[0.65rem] font-medium tracking-wider text-mcpl-cyan/60 uppercase">
                            AI recommends your product
                          </p>
                          <p className="text-sm leading-relaxed text-foreground/90">
                            {responseTypewriter.displayed}
                            {!responseTypewriter.done && (
                              <span className="ml-0.5 inline-block h-4 w-[2px] animate-pulse bg-mcpl-cyan" />
                            )}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Value props — show after typewriter finishes */}
                  <AnimatePresence>
                    {responseTypewriter.done && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-4"
                      >
                        {/* Impact metrics */}
                        <div className="grid grid-cols-3 gap-3">
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                            <DollarSign className="mx-auto mb-1 h-4 w-4 text-mcpl-green" />
                            <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-mcpl-green">
                              $0
                            </p>
                            <p className="text-[0.6rem] text-muted-foreground">
                              Cost per referral
                            </p>
                          </div>
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                            <Users className="mx-auto mb-1 h-4 w-4 text-mcpl-cyan" />
                            <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-mcpl-cyan">
                              24/7
                            </p>
                            <p className="text-[0.6rem] text-muted-foreground">
                              Always discoverable
                            </p>
                          </div>
                          <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 text-center">
                            <TrendingUp className="mx-auto mb-1 h-4 w-4 text-mcpl-cyan" />
                            <p className="font-[family-name:var(--font-heading)] text-lg font-bold text-mcpl-cyan">
                              Auto
                            </p>
                            <p className="text-[0.6rem] text-muted-foreground">
                              Grows over time
                            </p>
                          </div>
                        </div>

                        {/* Explainer */}
                        <div className="rounded-lg border border-mcpl-cyan/10 bg-mcpl-cyan/[0.03] px-4 py-3">
                          <p className="text-xs leading-relaxed text-muted-foreground">
                            <span className="font-medium text-foreground">
                              This is your zero-cost ad.
                            </span>{" "}
                            Every time someone asks an AI assistant for help
                            with a problem your product solves, your product
                            gets recommended — not your competitor&apos;s. No
                            bidding on keywords. No ad budget. It just works,
                            all the time.
                          </p>
                        </div>

                        {/* Tools as proof */}
                        <div className="space-y-2">
                          <p className="text-[0.65rem] font-medium tracking-wider text-muted-foreground/60 uppercase">
                            {result.tools.length} capabilities AI can recommend
                            you for
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {result.tools.map((tool, i) => (
                              <motion.div
                                key={tool.name}
                                initial={{ opacity: 0, scale: 0.85 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{
                                  duration: 0.3,
                                  delay: i * 0.1,
                                }}
                              >
                                <Badge
                                  variant="outline"
                                  className="gap-1.5 border-mcpl-cyan/30 bg-mcpl-cyan/5 px-3 py-1 font-mono text-[0.65rem] text-mcpl-cyan"
                                >
                                  {tool.name}
                                </Badge>
                              </motion.div>
                            ))}
                          </div>
                        </div>

                        {/* CTA */}
                        <div className="rounded-xl border border-mcpl-green/20 bg-mcpl-green/[0.04] p-5">
                          <p className="mb-1 text-sm font-medium text-foreground">
                            Make this live — start getting discovered today
                          </p>
                          <p className="mb-4 text-xs text-muted-foreground">
                            Deploy in 2 minutes. Free plan includes 50 AI
                            referrals/month.
                          </p>
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Button
                              size="lg"
                              className="h-10 cursor-pointer gap-2 bg-mcpl-green px-5 text-sm font-semibold text-mcpl-deep hover:bg-mcpl-green/85"
                              asChild
                            >
                              <a href="/signup">
                                Create Free Account
                                <ArrowRight className="h-4 w-4" />
                              </a>
                            </Button>
                            <button
                              type="button"
                              onClick={resetDemo}
                              className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
                            >
                              <RotateCcw className="h-3 w-3" />
                              Try another product
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
