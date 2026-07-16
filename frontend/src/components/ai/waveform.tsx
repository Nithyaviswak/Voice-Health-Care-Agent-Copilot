"use client";

import { motion } from "framer-motion";

interface WaveformProps {
  isActive: boolean;
  barCount?: number;
  className?: string;
}

export function Waveform({ isActive, barCount = 7, className }: WaveformProps) {
  return (
    <div className={`flex items-center justify-center gap-1 h-12 ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => (
        <motion.div
          key={i}
          className="w-1 bg-accent rounded-full"
          animate={
            isActive
              ? {
                  height: ["20%", "80%", "40%", "100%", "30%"],
                }
              : { height: "20%" }
          }
          transition={{
            duration: 0.8,
            repeat: isActive ? Infinity : 0,
            repeatType: "reverse",
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      ))}
    </div>
  );
}
