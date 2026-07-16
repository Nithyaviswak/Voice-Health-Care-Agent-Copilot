"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className,
  hover = true,
  onClick,
}: GlassCardProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={
        hover
          ? {
              y: -5,
              scale: 1.02,
              transition: {
                type: "spring",
                stiffness: 280,
                damping: 22,
              },
            }
          : undefined
      }
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={cn(
        "glass rounded-[2rem] p-8 transition-colors duration-300",
        hover && "hover:bg-surface-elevated cursor-pointer",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
