"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Anomaly {
  title: string;
  description: string;
  type: "warning" | "info";
}

export function ReportScanner() {
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Upload a PDF to begin analysis");
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);

  const startScan = () => {
    setIsScanning(true);
    setProgress(0);
    setAnomalies([]);
    setStatus("Scanning document...");
  };

  useEffect(() => {
    if (!isScanning) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15;
        if (next >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setStatus("Analysis complete");
          return 100;
        }

        if (next > 30 && anomalies.length === 0) {
          setAnomalies((a) => [
            ...a,
            {
              title: "Elevated WBC Count",
              description: "Indicates active immune response.",
              type: "warning",
            },
          ]);
          setStatus("Finding anomalies...");
        }

        if (next > 70 && anomalies.length === 1) {
          setAnomalies((a) => [
            ...a,
            {
              title: "Vitamin D Deficiency",
              description: "Levels below baseline. Supplementation recommended.",
              type: "info",
            },
          ]);
          setStatus("Generating explanation...");
        }

        return next;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isScanning, anomalies.length]);

  return (
    <div className="space-y-6">
      <div
        onClick={!isScanning && progress === 0 ? startScan : undefined}
        className={`relative h-48 rounded-2xl border border-dashed overflow-hidden cursor-pointer transition-colors ${
          progress === 100
            ? "border-success bg-success/5"
            : "border-white/20 hover:border-accent"
        }`}
      >
        {isScanning && (
          <motion.div
            animate={{ top: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-accent/60 blur-sm z-10"
          />
        )}

        <div className="absolute inset-0 p-6 space-y-4 opacity-40">
          <div className="h-3 bg-white/10 rounded w-3/4" />
          <div className="h-3 bg-white/10 rounded w-1/2" />
          <div className="h-20 bg-white/5 rounded w-full" />
          <div className="h-3 bg-white/10 rounded w-2/3" />
        </div>

        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {progress === 0 && !isScanning && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-xs font-mono uppercase tracking-widest text-text-secondary"
              >
                Tap to scan report
              </motion.p>
            )}
            {progress === 100 && !isScanning && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs font-mono uppercase tracking-widest text-success"
              >
                Analysis Complete
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">{status}</span>
          <span className="text-accent font-mono">{Math.round(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <div className="space-y-3">
        <AnimatePresence>
          {anomalies.map((anomaly, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className={`p-4 rounded-2xl glass border-l-2 ${
                anomaly.type === "warning"
                  ? "border-l-danger"
                  : "border-l-accent"
              }`}
            >
              <h5
                className={`font-semibold text-sm ${
                  anomaly.type === "warning" ? "text-danger" : "text-accent"
                }`}
              >
                {anomaly.title}
              </h5>
              <p className="text-xs text-text-tertiary mt-1">
                {anomaly.description}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
