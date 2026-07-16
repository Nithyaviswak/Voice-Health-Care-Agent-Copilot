"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  Phone,
  Clock,
  FileText,
  Stethoscope,
  ArrowRight,
  Plus,
  Calendar,
  Droplets,
  Pill,
  ChevronUp,
} from "lucide-react";
import { gsap } from "@/lib/gsap";
import { AIOrb } from "@/components/ai/ai-orb";
import { ReportScanner } from "@/components/ai/report-scanner";
import { useVoiceOS } from "@/hooks/use-voice-os";
import { useEmergency } from "@/hooks/use-emergency";

type ItemColor = "accent" | "secondary" | "danger";

const timelineItems = [
  {
    time: "09:00 AM",
    title: "Morning Voice Assessment",
    description: "Respiratory patterns stable. No signs of fatigue detected.",
    icon: Activity,
    color: "accent" as ItemColor,
    status: "COMPLETED",
  },
  {
    time: "11:45 AM",
    title: "Blood Work Insight",
    description: "HbA1c levels show a 0.2% improvement from last month.",
    icon: Droplets,
    color: "secondary" as ItemColor,
    status: "ANALYZED",
  },
  {
    time: "02:30 PM",
    title: "Water Hydration Goal",
    description: "You are 500ml behind your target for this afternoon.",
    icon: Pill,
    color: "danger" as ItemColor,
    status: "MISSED",
  },
];

const colorClasses: Record<ItemColor, { bg: string; text: string }> = {
  accent: { bg: "bg-accent/10", text: "text-accent" },
  secondary: { bg: "bg-secondary/10", text: "text-secondary" },
  danger: { bg: "bg-danger/10", text: "text-danger" },
};

const statusClasses: Record<ItemColor, string> = {
  accent: "bg-accent/10 text-accent",
  secondary: "bg-secondary/10 text-secondary",
  danger: "bg-white/5 text-text-tertiary",
};

export function BentoHub() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const widgetsRef = useRef<HTMLDivElement>(null);
  const { state } = useVoiceOS();
  const { triggerEmergency } = useEmergency();

  useEffect(() => {
    if (!widgetsRef.current) return;
    const widgets = widgetsRef.current.querySelectorAll(".magnetic-widget");

    const handleMove = (e: Event) => {
      const event = e as MouseEvent;
      const widget = event.currentTarget as HTMLElement;
      const rect = widget.getBoundingClientRect();
      const x = (event.clientX - rect.left - rect.width / 2) * 0.1;
      const y = (event.clientY - rect.top - rect.height / 2) * 0.1;

      gsap.to(widget, {
        x,
        y,
        rotateX: -y * 0.15,
        rotateY: x * 0.15,
        transformPerspective: 1000,
        duration: 0.4,
        ease: "power2.out",
        overwrite: "auto",
      });
    };

    const handleLeave = (e: Event) => {
      const widget = e.currentTarget as HTMLElement;
      gsap.to(widget, {
        x: 0,
        y: 0,
        rotateX: 0,
        rotateY: 0,
        duration: 0.8,
        ease: "elastic.out(1.1, 0.4)",
        overwrite: "auto",
      });
    };

    widgets.forEach((widget) => {
      widget.addEventListener("mousemove", handleMove);
      widget.addEventListener("mouseleave", handleLeave);
    });

    return () => {
      widgets.forEach((widget) => {
        widget.removeEventListener("mousemove", handleMove);
        widget.removeEventListener("mouseleave", handleLeave);
      });
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-canvas text-text overflow-hidden selection:bg-accent selection:text-canvas">
      {/* Background Video */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-10 overflow-hidden">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover grayscale brightness-50"
          poster="https://images.pexels.com/videos/11244983/pexels-photo-11244983.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=630&w=1200"
          src="https://videos.pexels.com/video-files/11244983/11244983-hd_1920_1080_24fps.mp4"
        />
      </div>

      {/* Dot matrix pattern overlay */}
      <div
        className="fixed inset-0 z-0 pointer-events-none opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.08) 0.5px, transparent 0.5px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Top Bar */}
      <nav className="relative z-20 w-full max-w-7xl px-8 pt-8 flex justify-between items-center mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 glass rounded-xl flex items-center justify-center border border-white/20">
            <Activity className="w-5 h-5 text-accent" />
          </div>
          <span className="text-lg font-bold tracking-tight">
            Bento<span className="text-text-tertiary">Health</span>
          </span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-sm font-mono text-text-tertiary">
            {new Date().toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {" • "}
            {new Date().toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          <button
            onClick={triggerEmergency}
            className="flex items-center gap-3 px-6 py-2.5 rounded-full bg-white text-canvas hover:bg-danger hover:text-white transition-colors group active:scale-95"
          >
            <span className="w-2 h-2 rounded-full bg-danger group-hover:bg-white animate-pulse" />
            <span className="text-[10px] font-mono font-bold tracking-[0.15em] uppercase">
              Emergency
            </span>
          </button>
        </div>
      </nav>

      {/* Main Dashboard */}
      <main className="relative z-10 w-full max-w-7xl px-8 py-12 mx-auto">
        <div ref={widgetsRef} className="grid grid-cols-4 grid-rows-2 gap-6">
          {/* Hero Widget - spans 2x1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="magnetic-widget col-span-2 glass rounded-[2rem] p-10 flex justify-between items-center relative overflow-hidden group"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="relative z-10 flex flex-col justify-between h-full">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                  <span className="text-[10px] font-mono text-accent tracking-[0.2em] uppercase">
                    System Active • AI Node 01
                  </span>
                </div>
                <h1 className="text-6xl font-geist font-light leading-none tracking-tight">
                  Good Evening,
                  <br />
                  <span className="font-bold">Alex Johnson</span>
                </h1>
              </div>
              <div className="mt-12 flex items-center gap-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-10 py-5 bg-accent text-canvas rounded-2xl font-bold text-sm hover:bg-white transition-colors"
                >
                  Start Voice Check
                </motion.button>
                <p className="text-sm text-text-secondary max-w-[200px] leading-snug">
                  &ldquo;I can analyze your blood reports or provide immediate
                  symptom triage.&rdquo;
                </p>
              </div>
            </div>
            <AIOrb state={state} size={160} />
          </motion.div>

          {/* Medication Tracker */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="magnetic-widget glass rounded-[2rem] p-8 flex flex-col justify-between group"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex justify-between items-start">
              <div className="px-3 py-1 bg-white/5 rounded-lg border border-white/10">
                <span className="text-[10px] font-mono text-text-tertiary">
                  PHARMA • LOG
                </span>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">
                  Next
                </p>
                <p className="text-lg font-bold tracking-tighter">20:30</p>
              </div>
            </div>
            <div className="relative flex items-center justify-center py-2">
              <svg className="w-36 h-36 -rotate-90">
                <circle cx="72" cy="72" r="64" fill="transparent" stroke="rgba(255,255,255,0.03)" strokeWidth="12" />
                <circle
                  cx="72"
                  cy="72"
                  r="64"
                  fill="transparent"
                  stroke="var(--color-accent)"
                  strokeWidth="12"
                  strokeDasharray="402"
                  strokeDashoffset="100"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-black font-geist">75%</span>
                <span className="text-[9px] font-mono uppercase text-text-tertiary">
                  Adherence
                </span>
              </div>
            </div>
            <div className="border-t border-white/5 pt-4">
              <h3 className="text-sm font-bold uppercase tracking-tight">
                Regimen Alpha
              </h3>
              <p className="text-xs text-text-tertiary font-mono mt-1">
                2/3 DOSES REMAINING
              </p>
            </div>
          </motion.div>

          {/* Health Snapshot */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="magnetic-widget glass rounded-[2rem] p-8 flex flex-col justify-between group"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono text-text-tertiary">
                VITAL SIGN • REALTIME
              </span>
              <span className="w-2 h-2 rounded-full bg-success" />
            </div>
            <div className="mt-4 text-center py-6 bg-white/5 rounded-2xl border border-white/5">
              <p className="text-6xl font-black tracking-tighter font-geist">98</p>
              <p className="text-[10px] font-mono text-secondary uppercase tracking-[0.3em] mt-2">
                BPM • VITAL
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] font-mono text-text-tertiary uppercase">
                  Sleep
                </p>
                <p className="text-sm font-bold">7.4h</p>
              </div>
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                <p className="text-[9px] font-mono text-text-tertiary uppercase">
                  Steps
                </p>
                <p className="text-sm font-bold">8.4k</p>
              </div>
            </div>
          </motion.div>

          {/* Report Upload */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="magnetic-widget glass rounded-[2rem] p-8 flex flex-col justify-between border border-dashed border-white/20 hover:border-accent transition-colors"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-accent" />
              <span className="text-[10px] font-mono text-text-tertiary uppercase">
                Report Intake
              </span>
            </div>
            <ReportScanner />
          </motion.div>

          {/* Symptoms */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="magnetic-widget glass rounded-[2rem] p-8 flex flex-col justify-between group cursor-pointer"
            style={{ transformStyle: "preserve-3d" }}
          >
            <div className="flex justify-between items-start">
              <div className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">
                Self Triage
              </div>
              <Stethoscope className="w-5 h-5 text-text-tertiary" />
            </div>
            <div className="mt-8">
              <h3 className="text-2xl font-bold tracking-tight">Symptom Checker</h3>
              <p className="text-xs text-text-tertiary leading-relaxed mt-2">
                AI-assisted diagnosis node. Ready for input.
              </p>
            </div>
            <div className="mt-8 flex items-center gap-3">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[10px] font-mono text-accent">ENGAGE NODE</span>
              <ArrowRight className="w-4 h-4 text-accent" />
            </div>
          </motion.div>

          {/* Quick Stats - spans 2x1 */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="magnetic-widget col-span-2 glass rounded-[2rem] p-8 grid grid-cols-3 gap-12"
            style={{ transformStyle: "preserve-3d" }}
          >
            <Stat
              label="Pressure"
              value="118/74"
              status="NOMINAL"
              fill={85}
              color="success"
            />
            <Stat
              label="Temp"
              value="36.6"
              unit="CELSIUS"
              status="STABLE"
              fill={95}
              color="success"
              bordered
            />
            <Stat
              label="Oxygen"
              value="99"
              unit="PERCENT"
              status="OPTIMAL"
              fill={99}
              color="accent"
              bordered
            />
          </motion.div>
        </div>
      </main>

      {/* Timeline Drawer */}
      <motion.div
        initial={false}
        animate={{ y: drawerOpen ? 0 : "calc(100% - 52px)" }}
        transition={{ type: "spring", stiffness: 280, damping: 30 }}
        className="fixed bottom-0 left-0 right-0 z-30"
      >
        <div className="max-w-7xl mx-auto px-8">
          <div className="bg-black/80 backdrop-blur-3xl rounded-t-[3rem] p-10 shadow-2xl border-t border-x border-white/10">
            <button
              onClick={() => setDrawerOpen(!drawerOpen)}
              className="w-full flex justify-center mb-10"
            >
              <motion.div
                animate={{ rotate: drawerOpen ? 180 : 0 }}
                className="w-20 h-1 bg-white/20 rounded-full hover:bg-white/40 transition-colors"
              />
            </button>

            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-3xl font-bold">Daily Timeline</h2>
                <p className="text-text-tertiary mt-1">
                  Activity Log for{" "}
                  {new Date().toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <button className="w-12 h-12 glass rounded-2xl flex items-center justify-center hover:bg-white/10">
                <Calendar className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {timelineItems.map((item, index) => {
                const Icon = item.icon;
                const colors = colorClasses[item.color];
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
                  >
                    <div
                      className={`w-16 h-16 rounded-[1.5rem] ${colors.bg} flex items-center justify-center text-3xl`}
                    >
                      <Icon className={`w-8 h-8 ${colors.text}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <span className="text-[10px] font-mono text-text-tertiary uppercase tracking-widest">
                          {item.time}
                        </span>
                        <span
                          className={`text-[10px] py-0.5 px-2 rounded font-bold ${statusClasses[item.color]}`}
                        >
                          {item.status}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold mt-1">{item.title}</h4>
                      <p className="text-sm text-text-tertiary">
                        {item.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="h-20" />
          </div>
        </div>
      </motion.div>

      {/* Floating Action Button for drawer */}
      <motion.button
        onClick={() => setDrawerOpen(!drawerOpen)}
        animate={{ y: drawerOpen ? -420 : -80 }}
        transition={{ type: "spring", stiffness: 280, damping: 22 }}
        className="fixed right-8 bottom-8 z-40 w-14 h-14 rounded-full glass flex items-center justify-center hover:bg-white/10"
      >
        <ChevronUp className="w-6 h-6" />
      </motion.button>
    </div>
  );
}

function Stat({
  label,
  value,
  unit,
  status,
  fill,
  color,
  bordered = false,
}: {
  label: string;
  value: string;
  unit?: string;
  status: string;
  fill: number;
  color: "success" | "accent";
  bordered?: boolean;
}) {
  const colorMap = {
    success: "bg-success",
    accent: "bg-accent",
  };

  return (
    <div className={`flex flex-col justify-between ${bordered ? "border-l border-white/10 pl-12" : ""}`}>
      <div>
        <p className="text-[10px] font-mono text-text-tertiary uppercase tracking-[0.2em] mb-4">
          {label}
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-black font-geist tracking-tighter">
            {value}
          </span>
          {unit && (
            <span className="text-xs font-mono text-text-tertiary">{unit}</span>
          )}
        </div>
      </div>
      <div className="mt-6 flex items-center gap-2">
        <div className="flex-1 h-1 bg-white/5 rounded-full overflow-hidden">
          <div
            className={`h-full ${colorMap[color]}`}
            style={{ width: `${fill}%` }}
          />
        </div>
        <span className="text-[9px] font-mono text-text-tertiary">{status}</span>
      </div>
    </div>
  );
}
