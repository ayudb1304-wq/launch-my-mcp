"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface StepTransitionProps {
  messages: string[];
  onComplete: () => void;
  /** Duration per message in ms (default 800) */
  messageDuration?: number;
}

export function StepTransition({
  messages,
  onComplete,
  messageDuration = 800,
}: StepTransitionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < messages.length) {
      const timer = setTimeout(() => {
        setCurrentIndex((i) => i + 1);
      }, messageDuration);
      return () => clearTimeout(timer);
    } else {
      // Small delay after last message before completing
      const timer = setTimeout(onComplete, 300);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, messages.length, messageDuration, onComplete]);

  return (
    <div className="flex min-h-[200px] flex-col items-center justify-center space-y-6 py-8">
      {/* Pulsing dot */}
      <motion.div
        className="flex h-12 w-12 items-center justify-center rounded-full border border-primary/30 bg-primary/10"
        animate={{ scale: [1, 1.1, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <motion.div
          className="h-3 w-3 rounded-full bg-primary"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </motion.div>

      {/* Animated message */}
      <div className="h-8 text-center">
        <AnimatePresence mode="wait">
          {currentIndex < messages.length && (
            <motion.p
              key={currentIndex}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-muted-foreground"
            >
              {messages[currentIndex]}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {messages.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-300 ${
              i <= currentIndex ? "bg-primary" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
