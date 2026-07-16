"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { Mic, Settings, FileText, Heart, Moon, ChevronRight } from "lucide-react";
import { gsap } from "@/lib/gsap";
import { GlassCard } from "@/components/ui/glass-card";
import { AIOrb } from "@/components/ai/ai-orb";
import { Waveform } from "@/components/ai/waveform";
import { useVoiceOS } from "@/hooks/use-voice-os";

export function Conversational() {
  const [isActive, setIsActive] = useState(false);
  const [messages, setMessages] = useState<
    { type: "user" | "ai"; text: string; id: number }[]
  >([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { state, start, stop, transcript, response, isStreaming } = useVoiceOS();

  useEffect(() => {
    if (transcript && !messages.find((m) => m.type === "user" && m.text === transcript)) {
      setMessages((prev) => [...prev, { type: "user", text: transcript, id: Date.now() }]);
    }
  }, [transcript, messages]);

  useEffect(() => {
    if (response && !isStreaming && !messages.find((m) => m.type === "ai" && m.text === response)) {
      setMessages((prev) => [...prev, { type: "ai", text: response, id: Date.now() + 1 }]);
    }
  }, [response, isStreaming, messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, response]);

  const handleToggle = () => {
    if (isActive) {
      setIsActive(false);
      stop();
    } else {
      setIsActive(true);
      start();
    }
  };

  return (
    <div className="min-h-screen bg-canvas text-text flex overflow-hidden">
      {/* Left Panel - 60% */}
      <div className="w-[60%] h-screen flex flex-col p-12 relative border-r border-white/5">
        {/* Header */}
        <header className="flex justify-between items-center mb-12">
          <div className="space-y-1">
            <p className="text-sm font-medium tracking-widest text-text-tertiary uppercase">
              Healthcare OS v2
            </p>
            <h1 className="text-3xl font-geist font-semibold tracking-tight">
              Good Evening
            </h1>
          </div>
          <div className="flex gap-4">
            <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition-colors">
              <Settings className="w-5 h-5 text-text-tertiary" />
            </button>
            <div className="w-10 h-10 rounded-full glass overflow-hidden flex items-center justify-center bg-white/10 border border-white/20">
              <span className="text-xs font-bold text-text-secondary">JD</span>
            </div>
          </div>
        </header>

        {/* Conversation Canvas */}
        <div className="flex-1 flex flex-col gap-8 overflow-y-auto scrollbar-hide pb-32">
          <AnimatePresence mode="wait">
            {messages.length === 0 ? (
              <motion.div
                key="welcome"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                <div className="space-y-2">
                  <p className="text-4xl font-light leading-tight text-text-secondary">
                    How are you feeling today?
                  </p>
                  <p className="text-xl font-light text-text-tertiary">
                    Tap the microphone to begin a new health assessment.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-4 max-w-lg">
                  <QuickAction icon={<FileText className="w-5 h-5" />} label="Analyze Reports" />
                  <QuickAction icon={<Heart className="w-5 h-5" />} label="Medications" color="secondary" />
                </div>
              </motion.div>
            ) : (
              <motion.div key="chat" className="space-y-8">
                {messages.map((msg) => (
                  <MessageBubble key={msg.id} type={msg.type} text={msg.text} />
                ))}
                {state === "speaking" && isStreaming && response && !messages.find((m) => m.text === response) && (
                  <MessageBubble type="ai" text={response} isStreaming />
                )}
                <div ref={messagesEndRef} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Morphing FAB */}
        <div className="absolute bottom-12 left-12 right-12 flex justify-center pointer-events-none">
          <LayoutGroup>
            <motion.button
              layout
              onClick={handleToggle}
              initial={false}
              animate={{
                width: isActive ? 320 : 80,
                height: isActive ? 72 : 80,
                borderRadius: isActive ? 24 : 40,
              }}
              transition={{
                type: "spring",
                stiffness: 280,
                damping: 22,
              }}
              className="pointer-events-auto relative bg-accent flex items-center justify-center shadow-[0_0_50px_rgba(79,209,197,0.4)] border border-white/20 overflow-hidden"
            >
              <AnimatePresence mode="wait">
                {!isActive ? (
                  <motion.div
                    key="mic"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Mic className="w-8 h-8 text-canvas" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="waveform"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="flex items-center gap-6"
                  >
                    <Waveform isActive={true} barCount={9} className="h-8" />
                    <span className="text-canvas text-xs font-bold uppercase tracking-widest">
                      {state}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          </LayoutGroup>
        </div>
      </div>

      {/* Right Panel - 40% */}
      <div className="w-[40%] h-screen bg-[#091520] flex flex-col p-12 items-center justify-center relative overflow-hidden">
        <div className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-secondary/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-accent/5 blur-[100px] rounded-full" />

        <div className="relative z-10 flex flex-col items-center">
          <AIOrb state={state} size={280} />

          <div className="mt-12 text-center">
            <motion.p
              key={state}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs font-medium tracking-[0.3em] uppercase text-text-secondary mb-2"
            >
              {state === "idle" && "System Idle"}
              {state === "listening" && "Listening..."}
              {state === "thinking" && "Thinking..."}
              {state === "speaking" && "Speaking..."}
            </motion.p>
            <p className="text-sm text-text-tertiary">
              {state === "idle" && "Waiting for input..."}
              {state === "listening" && "Voice detected..."}
              {state === "thinking" && "Analyzing patterns..."}
              {state === "speaking" && "Forming response..."}
            </p>
          </div>
        </div>

        {/* Health Stats */}
        <div className="mt-16 w-full space-y-4 z-10">
          <GlassCard hover>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-danger/20 flex items-center justify-center border border-danger/20">
                <Heart className="w-7 h-7 text-danger" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-text-secondary font-bold uppercase tracking-[0.2em] mb-1">
                  Heart Rate
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">72</span>
                  <span className="text-xs text-text-tertiary">BPM</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-tertiary" />
            </div>
          </GlassCard>

          <GlassCard hover>
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-accent/20 flex items-center justify-center border border-accent/20">
                <Moon className="w-7 h-7 text-accent" />
              </div>
              <div className="flex-1">
                <p className="text-[11px] text-text-secondary font-bold uppercase tracking-[0.2em] mb-1">
                  Sleep Score
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">84</span>
                  <span className="text-xs text-text-tertiary">Optimal</span>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-text-tertiary" />
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  icon,
  label,
  color = "accent",
}: {
  icon: React.ReactNode;
  label: string;
  color?: "accent" | "secondary";
}) {
  const colorClass = color === "accent" ? "text-accent" : "text-secondary";
  const bgClass = color === "accent" ? "bg-accent/10" : "bg-secondary/10";

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="glass p-5 rounded-[2rem] flex items-center gap-4 cursor-pointer border-white/10 group shadow-lg"
    >
      <div
        className={`w-10 h-10 rounded-full ${bgClass} flex items-center justify-center group-hover:scale-110 transition-transform`}
      >
        <span className={colorClass}>{icon}</span>
      </div>
      <span className="text-sm font-medium text-text-secondary">{label}</span>
    </motion.div>
  );
}

function MessageBubble({
  type,
  text,
  isStreaming,
}: {
  type: "user" | "ai";
  text: string;
  isStreaming?: boolean;
}) {
  const isUser = type === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
      transition={{ type: "spring", stiffness: 280, damping: 22 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      {isUser ? (
        <div className="max-w-[80%] px-7 py-5 rounded-[2rem] glass text-xl leading-relaxed border-t border-white/15 shadow-2xl">
          {text}
        </div>
      ) : (
        <div className="max-w-[85%] space-y-4">
          <p className="text-2xl font-light leading-relaxed text-text-secondary">
            {text}
            {isStreaming && (
              <span className="inline-block w-2 h-6 ml-1 bg-accent animate-pulse" />
            )}
          </p>
        </div>
      )}
    </motion.div>
  );
}
