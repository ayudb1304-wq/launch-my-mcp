"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const loadingMessages = [
  "Analyzing your product description...",
  "Building your AI discovery profile...",
  "Writing responses for each question AI might ask...",
  "Teaching AI when to recommend you...",
  "Optimizing for maximum discoverability...",
  "Almost there — finalizing your AI profile...",
];

export function GeneratingOverlay() {
  const [messageIndex, setMessageIndex] = useState(0);
  const [dots, setDots] = useState("");

  useEffect(() => {
    const msgInterval = setInterval(() => {
      setMessageIndex((i) => (i + 1) % loadingMessages.length);
    }, 3000);
    return () => clearInterval(msgInterval);
  }, []);

  useEffect(() => {
    const dotInterval = setInterval(() => {
      setDots((d) => (d.length >= 3 ? "" : d + "."));
    }, 500);
    return () => clearInterval(dotInterval);
  }, []);

  return (
    <div className="space-y-8 py-4">
      {/* Animated icon */}
      <div className="flex justify-center">
        <div className="relative">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/10" />
          <div className="absolute -inset-8 animate-pulse rounded-full bg-primary/5" style={{ animationDelay: "0.5s" }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
            <Sparkles className="h-7 w-7 animate-bounce text-primary" />
          </div>
        </div>
      </div>

      {/* Main message */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-foreground">
          AI is building your discovery profile
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          This usually takes 5-10 seconds
        </p>
      </div>

      {/* Cycling status message */}
      <div className="rounded-lg border border-border bg-muted/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          <p className="text-sm text-foreground/80">
            {loadingMessages[messageIndex]}
            <span className="inline-block w-6 text-muted-foreground">{dots}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary"
            style={{
              animation: "loading 8s ease-in-out infinite",
            }}
          />
        </div>
        <style jsx>{`
          @keyframes loading {
            0% { width: 0%; }
            20% { width: 25%; }
            40% { width: 45%; }
            60% { width: 65%; }
            80% { width: 85%; }
            100% { width: 95%; }
          }
        `}</style>
      </div>

      {/* Fun fact */}
      <p className="text-center text-xs text-muted-foreground">
        Your AI profile will help assistants like Claude and ChatGPT recommend
        your product to their users — for free.
      </p>
    </div>
  );
}
