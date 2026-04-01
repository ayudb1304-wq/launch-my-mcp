"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

function scrollTo(hash: string) {
  document.querySelector(hash)?.scrollIntoView({ behavior: "smooth" });
}

export default function CTAFooter() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-24 md:py-32"
    >
      {/* Gradient background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--mcpl-cyan)]/[0.04] via-transparent to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,229,255,0.06)_0%,transparent_70%)]" />

      <div className="relative mx-auto max-w-3xl text-center">
        {/* Headline */}
        <motion.h2
          className="font-heading text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          Your first AI discovery event is 5 minutes away.
        </motion.h2>

        {/* Subtext */}
        <motion.p
          className="mx-auto mt-5 max-w-lg text-lg text-muted-foreground"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          Free to start. No credit card. No engineers.
        </motion.p>

        {/* CTA Button */}
        <motion.div
          className="mt-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Button
            size="lg"
            className="h-14 cursor-pointer rounded-xl bg-mcpl-cyan px-10 text-base font-bold text-mcpl-deep shadow-[0_0_30px_rgba(0,229,255,0.35)] transition-all hover:bg-mcpl-cyan/90 hover:shadow-[0_0_50px_rgba(0,229,255,0.5)]"
            onClick={() => scrollTo("#live-demo")}
          >
            Generate My MCP Server
            <ArrowRight className="ml-2 size-4" />
          </Button>
        </motion.div>

        {/* Mini footer links */}
        <motion.div
          className="mt-16 flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.45 }}
        >
          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {[
              { label: "Pricing", href: "#pricing" },
              { label: "FAQ", href: "#faq" },
              { label: "Demo", href: "#live-demo" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  scrollTo(item.href);
                }}
                className="cursor-pointer text-sm text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-4">
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter / X"
              className="text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground/50 transition-colors hover:text-foreground"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden="true">
                <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
              </svg>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
