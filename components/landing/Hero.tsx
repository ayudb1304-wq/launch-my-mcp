"use client";

import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Play, Star, Users, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/*  Terminal animation config                                          */
/* ------------------------------------------------------------------ */

const terminalLines = [
  {
    prefix: "> ",
    text: 'User asks Claude: "Find me a good invoicing tool"',
    color: "text-mcpl-cyan",
  },
  {
    prefix: "> ",
    text: "Claude calls: mcplaunch.io/mcp/invoicehero/search_tools",
    color: "text-mcpl-green",
  },
  {
    prefix: "> ",
    text: 'Claude responds: "I found InvoiceHero — it lets you...',
    color: "text-foreground/80",
  },
];

const TYPING_SPEED = 35;
const LINE_PAUSE = 600;
const RESTART_PAUSE = 3000;

/* ------------------------------------------------------------------ */
/*  Typewriter hook                                                    */
/* ------------------------------------------------------------------ */

function useTypewriter(lines: typeof terminalLines) {
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);

  const reset = useCallback(() => {
    setDisplayedLines([]);
    setCurrentLineIndex(0);
    setCurrentCharIndex(0);
    setIsTyping(true);
  }, []);

  useEffect(() => {
    if (!isTyping) return;

    if (currentLineIndex >= lines.length) {
      const timeout = setTimeout(reset, RESTART_PAUSE);
      return () => clearTimeout(timeout);
    }

    const fullText =
      lines[currentLineIndex].prefix + lines[currentLineIndex].text;

    if (currentCharIndex < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayedLines((prev) => {
          const copy = [...prev];
          copy[currentLineIndex] = fullText.slice(0, currentCharIndex + 1);
          return copy;
        });
        setCurrentCharIndex((c) => c + 1);
      }, TYPING_SPEED);
      return () => clearTimeout(timeout);
    }

    const timeout = setTimeout(() => {
      setCurrentLineIndex((i) => i + 1);
      setCurrentCharIndex(0);
    }, LINE_PAUSE);
    return () => clearTimeout(timeout);
  }, [currentLineIndex, currentCharIndex, isTyping, lines, reset]);

  return { displayedLines, currentLineIndex, lines };
}

/* ------------------------------------------------------------------ */
/*  Animated terminal component                                        */
/* ------------------------------------------------------------------ */

function AnimatedTerminal() {
  const { displayedLines, currentLineIndex, lines } =
    useTypewriter(terminalLines);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.96 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
      className="relative w-full"
    >
      <div className="absolute -inset-4 rounded-2xl bg-mcpl-cyan/5 blur-2xl" />

      <div className="relative overflow-hidden rounded-xl border border-mcpl-cyan/15 bg-[#0D1117] shadow-2xl shadow-mcpl-cyan/5">
        <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3">
          <span className="size-3 rounded-full bg-[#FF5F57]" />
          <span className="size-3 rounded-full bg-[#FEBC2E]" />
          <span className="size-3 rounded-full bg-[#28C840]" />
          <span className="ml-3 font-[family-name:var(--font-mono)] text-xs text-white/30">
            terminal
          </span>
        </div>

        <div className="min-h-[180px] p-5 font-[family-name:var(--font-mono)] text-sm leading-relaxed md:min-h-[200px]">
          {displayedLines.map((text, i) => (
            <div key={i} className={`mb-3 ${lines[i]?.color ?? ""}`}>
              {text}
              {i === currentLineIndex && (
                <span className="ml-0.5 inline-block h-4 w-[2px] translate-y-[2px] animate-pulse bg-mcpl-cyan" />
              )}
            </div>
          ))}
          {currentLineIndex >= lines.length && displayedLines.length > 0 && (
            <div className="mt-3">
              <span className="inline-block h-4 w-[2px] animate-pulse bg-mcpl-cyan" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/*  Stagger animation helpers                                          */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" as const },
  },
};

const proofItems = [
  { icon: Users, text: "Trusted by 400+ founders" },
  { icon: Star, text: "4.9 rating" },
  { icon: DollarSign, text: "Saved $12,400 in ads" },
];

/* ------------------------------------------------------------------ */
/*  Hero component                                                     */
/* ------------------------------------------------------------------ */

function scrollTo(hash: string) {
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
}

export function Hero() {
  return (
    <section
      id="hero"
      className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_40%,rgba(0,229,255,0.06),transparent_70%)]" />

      <div className="relative mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_0.7fr] lg:items-center lg:gap-16">
        {/* ---- Left column ---- */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col"
        >
          <motion.p
            variants={fadeUp}
            className="mb-5 text-xs font-semibold uppercase tracking-[0.2em] text-mcpl-cyan"
          >
            The future of zero-CAC distribution
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mb-6 font-[family-name:var(--font-heading)] text-5xl leading-[1.1] font-bold tracking-tight text-foreground md:text-7xl"
          >
            Let AI assistants
            <br />
            <span className="bg-gradient-to-r from-mcpl-cyan to-mcpl-green bg-clip-text text-transparent">
              discover your product.
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mb-8 max-w-lg text-base leading-relaxed text-muted-foreground md:text-lg"
          >
            Turn your product into something AI assistants recommend
            to their users — in under 5 minutes. No ads, no SEO tricks,
            no engineering team needed.
          </motion.p>

          {/* CTA row */}
          <motion.div
            variants={fadeUp}
            className="flex flex-wrap items-center gap-4"
          >
            <Button
              className="h-12 cursor-pointer rounded-lg bg-mcpl-cyan px-7 text-sm font-semibold text-mcpl-deep shadow-[0_0_24px_rgba(0,229,255,0.35)] transition-all hover:bg-mcpl-cyan/90 hover:shadow-[0_0_36px_rgba(0,229,255,0.55)]"
              asChild
            >
              <Link href="/login">
                Get Your MCP Server Free
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>

            <Button
              variant="outline"
              className="h-12 cursor-pointer gap-2 rounded-lg border-border/50 px-6 text-sm text-muted-foreground hover:border-mcpl-cyan/30 hover:text-foreground"
              onClick={() => scrollTo("#how-it-works")}
            >
              <Play className="size-4 fill-current" />
              See How It Works
            </Button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/30 pt-6"
          >
            {proofItems.map((item) => (
              <span
                key={item.text}
                className="flex items-center gap-2 text-xs text-muted-foreground"
              >
                <item.icon className="size-3.5 text-mcpl-cyan/70" />
                {item.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* ---- Right column: Animated terminal ---- */}
        <div className="flex items-center justify-center lg:justify-end">
          <AnimatedTerminal />
        </div>
      </div>
    </section>
  );
}
