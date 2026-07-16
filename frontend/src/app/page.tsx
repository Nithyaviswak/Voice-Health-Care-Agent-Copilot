"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CommandCenter } from "@/components/variants/command-center";
import { Conversational } from "@/components/variants/conversational";
import { BentoHub } from "@/components/variants/bento-hub";
import { EmergencyOverlay } from "@/components/overlays/emergency-overlay";

type Variant = "command" | "conversational" | "bento";

export default function Home() {
  const [variant, setVariant] = useState<Variant>("command");

  return (
    <main className="min-h-screen bg-canvas text-text font-inter">
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4 flex items-center justify-between glass-dark">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
            <span className="text-canvas font-bold text-sm">AI</span>
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
            Physician OS
          </span>
        </div>
        <div className="flex items-center gap-2 glass px-2 py-1.5 rounded-full">
          {(["command", "conversational", "bento"] as Variant[]).map((v) => (
            <button
              key={v}
              onClick={() => setVariant(v)}
              className={`px-4 py-1.5 rounded-full text-[11px] font-medium uppercase tracking-wider transition-all ${
                variant === v
                  ? "bg-accent text-canvas"
                  : "text-text-tertiary hover:text-text"
              }`}
            >
              {v === "command" && "Command"}
              {v === "conversational" && "Conversational"}
              {v === "bento" && "Health Hub"}
            </button>
          ))}
        </div>
      </nav>

      <div className="pt-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={variant}
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, y: -20, filter: "blur(10px)" }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            {variant === "command" && <CommandCenter />}
            {variant === "conversational" && <Conversational />}
            {variant === "bento" && <BentoHub />}
          </motion.div>
        </AnimatePresence>
      </div>

      <EmergencyOverlay />
    </main>
  );
}
