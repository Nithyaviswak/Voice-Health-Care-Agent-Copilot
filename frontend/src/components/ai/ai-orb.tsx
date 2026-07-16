"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { VoiceState } from "@/hooks/use-voice-os";

interface AIOrbProps {
  state: VoiceState;
  size?: number;
  className?: string;
}

export function AIOrb({ state, size = 160, className = "" }: AIOrbProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!glowRef.current || !coreRef.current) return;

    const ctx = gsap.context(() => {
      // Base breathing animation
      gsap.to(glowRef.current, {
        scale: 1.2,
        opacity: 0.7,
        duration: 3,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      gsap.to(coreRef.current, {
        scale: 1.05,
        duration: 2.5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!coreRef.current || !glowRef.current) return;

    const ctx = gsap.context(() => {
      if (state === "listening") {
        gsap.to(coreRef.current, {
          boxShadow: "0 0 60px rgba(79, 209, 197, 0.6)",
          duration: 0.4,
        });
        gsap.to(glowRef.current, {
          background:
            "radial-gradient(circle, rgba(79,209,197,0.8) 0%, transparent 70%)",
          duration: 0.4,
        });
      } else if (state === "thinking") {
        gsap.to(coreRef.current, {
          boxShadow: "0 0 80px rgba(122, 166, 255, 0.7)",
          scale: 1.1,
          duration: 0.6,
          ease: "power2.out",
        });
        gsap.to(glowRef.current, {
          background:
            "radial-gradient(circle, rgba(122,166,255,0.7) 0%, transparent 70%)",
          scale: 1.4,
          duration: 0.6,
        });
      } else if (state === "speaking") {
        gsap.to(coreRef.current, {
          boxShadow: "0 0 50px rgba(79, 209, 197, 0.5)",
          scale: 1,
          duration: 0.4,
        });
        gsap.to(glowRef.current, {
          background:
            "radial-gradient(circle, rgba(79,209,197,0.6) 0%, transparent 70%)",
          scale: 1.2,
          duration: 0.4,
        });
      } else {
        gsap.to(coreRef.current, {
          boxShadow: "0 0 30px rgba(79, 209, 197, 0.3)",
          scale: 1,
          duration: 0.6,
        });
        gsap.to(glowRef.current, {
          background:
            "radial-gradient(circle, rgba(79,209,197,0.5) 0%, rgba(122,166,255,0.3) 50%, transparent 70%)",
          scale: 1,
          duration: 0.6,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [state]);

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Outer glow */}
      <div
        ref={glowRef}
        className="absolute inset-0 rounded-full opacity-50 blur-2xl"
        style={{
          background:
            "radial-gradient(circle, rgba(79,209,197,0.5) 0%, rgba(122,166,255,0.3) 50%, transparent 70%)",
        }}
      />

      {/* Core shell */}
      <div
        ref={coreRef}
        className="relative w-1/2 h-1/2 rounded-full glass border border-white/20 flex items-center justify-center"
        style={{ boxShadow: "0 0 30px rgba(79, 209, 197, 0.3)" }}
      >
        <div className="w-1/3 h-1/3 rounded-full bg-accent/80 blur-sm" />
        <div className="absolute inset-0 rounded-full border border-accent/20 animate-ping opacity-30" />
      </div>

      {/* Orbiting particles */}
      {state !== "idle" && (
        <>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "8s" }}>
            <div
              className="absolute w-2 h-2 rounded-full bg-secondary/60"
              style={{ top: "10%", left: "50%" }}
            />
          </div>
          <div className="absolute inset-0 animate-spin" style={{ animationDuration: "12s", animationDirection: "reverse" }}>
            <div
              className="absolute w-1.5 h-1.5 rounded-full bg-accent/60"
              style={{ bottom: "15%", right: "20%" }}
            />
          </div>
        </>
      )}
    </div>
  );
}
