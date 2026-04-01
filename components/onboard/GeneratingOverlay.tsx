"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

const loadingMessages = [
  "Analyzing your product description...",
  "Designing tool definitions for AI discovery...",
  "Crafting parameters for each tool...",
  "Scoring discoverability quality...",
  "Optimizing tool names for AI assistants...",
  "Almost there — finalizing your MCP tools...",
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
          <div className="absolute -inset-4 animate-pulse rounded-full bg-mcpl-cyan/10" />
          <div className="absolute -inset-8 animate-pulse rounded-full bg-mcpl-cyan/5" style={{ animationDelay: "0.5s" }} />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-mcpl-cyan/30 bg-mcpl-cyan/10">
            <Sparkles className="h-7 w-7 animate-bounce text-mcpl-cyan" />
          </div>
        </div>
      </div>

      {/* Main message */}
      <div className="text-center">
        <h3 className="font-heading text-lg font-bold text-white">
          AI is crafting your MCP tools
        </h3>
        <p className="mt-1 text-sm text-gray-400">
          This usually takes 5-10 seconds
        </p>
      </div>

      {/* Cycling status message */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-mcpl-cyan" />
          <p className="text-sm text-gray-300">
            {loadingMessages[messageIndex]}
            <span className="inline-block w-6 text-gray-500">{dots}</span>
          </p>
        </div>
      </div>

      {/* Progress bar */}
      <div className="space-y-2">
        <div className="h-1.5 overflow-hidden rounded-full bg-gray-800">
          <div
            className="h-full animate-[loading_8s_ease-in-out_infinite] rounded-full bg-gradient-to-r from-mcpl-cyan to-mcpl-green"
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
      <p className="text-center text-xs text-gray-500">
        Your tools will help AI assistants like Claude and ChatGPT recommend
        your product to their users — for free.
      </p>
    </div>
  );
}
