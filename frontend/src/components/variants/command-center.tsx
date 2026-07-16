"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic,
  Pill,
  Activity,
  HeartPulse,
  ChevronRight,
  AlertTriangle,
  X,
  Settings,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { GlassCard } from "@/components/ui/glass-card";
import { AIOrb } from "@/components/ai/ai-orb";
import { Waveform } from "@/components/ai/waveform";
import { useVoiceOS } from "@/hooks/use-voice-os";
import { useEmergency } from "@/hooks/use-emergency";
import { SmoothScroll } from "@/components/smooth-scroll";

const timelineItems = [
  {
    time: "09:00 AM",
    type: "VOICE ASSESSMENT",
    title: "Vitals Check Successful",
    description:
      "Ambient voice analysis completed during your morning brief. Vocal clarity and resonance indicate optimal respiratory health.",
    color: "success",
  },
  {
    time: "11:00 AM",
    type: "MEDICATION LOG",
    title: "Dosage Confirmed",
    description:
      "Visual confirmation of supplement intake. System updated medication adherence metrics. Current streak: 14 days.",
    color: "success",
  },
  {
    time: "03:24 PM",
    type: "LAB REPORT",
    title: "Lab Results Analyzed",
    description:
      "Automated sync with Quest Diagnostics. CMP results processed. Identified slight elevation in Vitamin D.",
    color: "secondary",
  },
  {
    time: "08:30 PM",
    type: "UPCOMING",
    title: "Evening Medication",
    description:
      "Preparation for evening Lisinopril intake. System will provide a gentle audio cue at 08:25 PM.",
    color: "muted",
  },
];

export function CommandCenter() {
  const orbGlowRef = useRef<HTMLDivElement>(null);
  const [showVoice, setShowVoice] = useState(false);
  const { state, start, stop, transcript, response, isStreaming } = useVoiceOS({
    onEmergency: () => triggerEmergency(),
  });
  const { triggerEmergency } = useEmergency();

  useEffect(() => {
    if (!orbGlowRef.current) return;
    const ctx = gsap.context(() => {
      gsap.to(orbGlowRef.current, {
        scale: 1.15,
        opacity: 0.6,
        duration: 5,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    });
    return () => ctx.revert();
  }, []);

  const handleMicClick = () => {
    setShowVoice(true);
    start();
  };

  const handleCloseVoice = () => {
    setShowVoice(false);
    stop();
  };

  return (
    <SmoothScroll>
      <div className="relative min-h-screen bg-canvas text-text overflow-hidden">
        {/* Header */}
        <header className="fixed top-0 left-0 right-0 z-40 px-8 py-6 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-3 pointer-events-auto">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <Activity className="w-5 h-5 text-canvas" />
            </div>
            <span className="text-xs font-semibold uppercase tracking-[0.3em] text-text-secondary">
              Physician OS
            </span>
          </div>

          <div className="glass-dark px-4 py-2 rounded-full flex items-center gap-4 pointer-events-auto">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] font-medium text-text-tertiary">
                System Online
              </span>
            </div>
            <div className="h-3 w-px bg-white/10" />
            <LiveClock />
          </div>

          <button className="w-10 h-10 rounded-full glass-dark flex items-center justify-center hover:bg-white/10 transition-colors pointer-events-auto">
            <Settings className="w-5 h-5 text-text-tertiary" />
          </button>
        </header>

        {/* Voice Overlay */}
        <AnimatePresence>
          {showVoice && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-canvas/90 backdrop-blur-3xl flex flex-col items-center justify-center"
            >
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
                <div
                  className="w-full h-full rounded-full opacity-30 blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(79,209,197,0.6) 0%, transparent 70%)",
                  }}
                />
              </div>

              <div className="relative z-10 text-center space-y-8 max-w-2xl px-6">
                <motion.p
                  animate={{ opacity: [0.5, 1, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="text-accent text-sm uppercase tracking-widest"
                >
                  {state === "listening" && "Listening..."}
                  {state === "thinking" && "Thinking..."}
                  {state === "speaking" && "Speaking..."}
                </motion.p>

                <Waveform isActive={state === "listening" || state === "speaking"} />

                <div className="space-y-4 min-h-[120px]">
                  {transcript && (
                    <motion.p
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-xl text-text-secondary"
                    >
                      &ldquo;{transcript}&rdquo;
                    </motion.p>
                  )}
                  {response && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="text-2xl font-geist font-medium leading-relaxed"
                    >
                      {response}
                      {isStreaming && (
                        <span className="inline-block w-2 h-6 ml-1 bg-accent animate-pulse" />
                      )}
                    </motion.p>
                  )}
                </div>

                <motion.button
                  onClick={handleCloseVoice}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="mt-12 w-14 h-14 rounded-full glass flex items-center justify-center"
                >
                  <X className="w-6 h-6 text-text-secondary" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="relative z-10 pt-32 pb-20 px-8 max-w-7xl mx-auto space-y-24">
          {/* Hero */}
          <section className="min-h-[70vh] flex flex-col items-center justify-center text-center relative">
            <div
              ref={orbGlowRef}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-40 pointer-events-none"
              style={{
                background:
                  "radial-gradient(circle, rgba(79,209,197,0.5) 0%, rgba(122,166,255,0.3) 40%, transparent 70%)",
              }}
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="relative space-y-6"
            >
              <p className="text-accent text-sm font-medium uppercase tracking-[0.4em]">
                Health Intelligence OS
              </p>
              <h1 className="text-7xl font-geist font-medium tracking-tight">
                Good Evening.
              </h1>
              <p className="text-2xl font-geist text-text-secondary">
                How can I assist your health today?
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="mt-16 flex flex-col items-center"
            >
              <AIOrb state={state} size={180} />
              <motion.button
                onClick={handleMicClick}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-8 w-20 h-20 rounded-full glass border border-border-strong flex items-center justify-center relative group"
              >
                <div className="absolute inset-0 rounded-full border-2 border-accent/20 animate-ping opacity-30" />
                <Mic className="w-8 h-8 text-accent relative z-10" />
              </motion.button>
              <span className="mt-6 text-xs uppercase tracking-[0.2em] text-text-tertiary">
                Tap to speak
              </span>
            </motion.div>
          </section>

          {/* Bento Grid */}
          <section className="grid grid-cols-12 gap-6">
            {/* Medication Card */}
            <GlassCard className="col-span-12 md:col-span-4 min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center border border-success/20">
                    <Pill className="w-6 h-6 text-success" />
                  </div>
                  <span className="text-[10px] font-bold text-success bg-success/10 px-3 py-1 rounded-full uppercase tracking-widest">
                    Active Regimen
                  </span>
                </div>
                <h3 className="text-2xl font-geist font-medium mb-6">
                  Upcoming Doses
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-sm font-medium">Lisinopril</span>
                    </div>
                    <span className="text-xs text-text-tertiary">08:30 PM</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 opacity-60">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-white/20" />
                      <span className="text-sm font-medium">Metformin</span>
                    </div>
                    <span className="text-xs text-text-tertiary">Tomorrow</span>
                  </div>
                </div>
              </div>
              <button className="w-full text-center text-xs font-semibold uppercase tracking-widest text-text-tertiary hover:text-success transition-colors pt-6 border-t border-white/5">
                View Full Schedule
              </button>
            </GlassCard>

            {/* Vitals Card */}
            <GlassCard className="col-span-12 md:col-span-5 min-h-[380px] flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-12 h-12 rounded-2xl bg-secondary/10 flex items-center justify-center border border-secondary/20">
                  <HeartPulse className="w-6 h-6 text-secondary" />
                </div>
                <div className="flex gap-1">
                  <div className="w-1 h-4 bg-secondary/40 rounded-full" />
                  <div className="w-1 h-6 bg-secondary rounded-full" />
                  <div className="w-1 h-3 bg-secondary/60 rounded-full" />
                </div>
              </div>
              <h3 className="text-2xl font-geist font-medium mb-2">
                Vitals Stability
              </h3>
              <p className="text-text-secondary text-sm mb-8">
                Average HRV and Resting Heart Rate trends.
              </p>
              <div className="flex-1 flex items-end gap-2 pb-4">
                {[64, 72, 68, 75, 70, 66, 74].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 bg-secondary/10 rounded-t-xl relative group"
                    style={{ height: "120px" }}
                  >
                    <div
                      className="absolute bottom-0 left-0 right-0 bg-secondary rounded-t-xl transition-all duration-500 group-hover:h-full"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
              <div className="flex justify-between text-[10px] font-mono text-text-tertiary uppercase tracking-widest pt-4 border-t border-white/5">
                <span>Mon</span>
                <span>Tue</span>
                <span>Wed</span>
                <span>Thu</span>
                <span>Fri</span>
                <span>Sat</span>
                <span>Sun</span>
              </div>
            </GlassCard>

            {/* Symptom Card */}
            <GlassCard className="col-span-12 md:col-span-3 min-h-[380px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center mb-8 border border-accent/20">
                  <Activity className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-2xl font-geist font-medium mb-3">
                  Symptom Log
                </h3>
                <p className="text-text-secondary text-sm leading-relaxed">
                  System is learning your unique biological baselines.
                </p>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center text-accent font-bold text-xs">
                    AI
                  </div>
                  <div className="flex-1">
                    <div className="h-1 w-full bg-white/5 rounded-full mb-1">
                      <div className="h-full bg-accent w-2/3 rounded-full" />
                    </div>
                    <span className="text-[9px] font-mono text-text-tertiary uppercase">
                      Patterning
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </section>

          {/* Timeline */}
          <section className="grid grid-cols-12 gap-12 py-12">
            <div className="col-span-12 md:col-span-4 md:sticky md:top-32 h-fit">
              <h2 className="text-4xl font-geist font-medium mb-6">
                Activity Stream
              </h2>
              <p className="text-text-secondary text-sm leading-relaxed mb-8">
                Your real-time health narrative, captured and analyzed by the
                Physician OS.
              </p>
              <div className="glass p-6 rounded-3xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-tertiary uppercase tracking-widest">
                    Active Alerts
                  </span>
                  <span className="px-2 py-1 rounded bg-success/10 text-success text-[10px] font-bold">
                    ALL CLEAR
                  </span>
                </div>
                <div className="h-px bg-white/5" />
                <p className="text-[10px] text-text-tertiary italic">
                  &ldquo;Patient exhibiting consistent circadian patterns.&rdquo;
                </p>
              </div>
            </div>

            <div className="col-span-12 md:col-span-8 space-y-12 pl-8 border-l border-white/10 relative">
              {timelineItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: item.color === "muted" ? 0.4 : 1, x: 0 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="relative"
                >
                  <div
                    className={`absolute -left-[41px] top-1.5 w-4 h-4 rounded-full border-4 border-canvas ${
                      item.color === "success"
                        ? "bg-success shadow-[0_0_15px_rgba(74,222,128,0.4)]"
                        : item.color === "secondary"
                        ? "bg-secondary shadow-[0_0_15px_rgba(122,166,255,0.4)]"
                        : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`text-xs font-mono mb-2 block ${
                      item.color === "success"
                        ? "text-success"
                        : item.color === "secondary"
                        ? "text-secondary"
                        : "text-text-tertiary"
                    }`}
                  >
                    {item.time} • {item.type}
                  </span>
                  <h4 className="text-2xl font-geist font-medium mb-3">
                    {item.title}
                  </h4>
                  <p className="text-text-secondary text-sm leading-relaxed max-w-xl">
                    {item.description}
                  </p>
                  {item.color === "secondary" && (
                    <button className="mt-4 text-secondary text-xs font-semibold uppercase tracking-widest hover:underline flex items-center gap-1">
                      View Detailed Analysis
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          </section>

          {/* Emergency Trigger */}
          <section className="py-16 border-t border-white/10 text-center">
            <div className="max-w-xl mx-auto space-y-6">
              <AlertTriangle className="w-10 h-10 text-danger/40 mx-auto" />
              <h3 className="text-xl font-geist font-medium text-text-secondary">
                Emergency Protocol
              </h3>
              <p className="text-sm text-text-tertiary leading-relaxed">
                If you are experiencing a life-threatening emergency, please
                bypass the AI and contact emergency services immediately.
              </p>
              <button
                onClick={triggerEmergency}
                className="px-8 py-4 rounded-full glass-dark text-xs font-bold uppercase tracking-widest text-danger border border-danger/20 hover:bg-danger/10 transition-colors"
              >
                Simulate Emergency Mode
              </button>
            </div>
          </section>
        </main>
      </div>
    </SmoothScroll>
  );
}

function LiveClock() {
  const [time, setTime] = useState("");

  useEffect(() => {
    const update = () => {
      setTime(
        new Date().toLocaleTimeString("en-US", {
          hour12: true,
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return <span className="text-[10px] font-mono text-text-secondary">{time}</span>;
}
