"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Phone, MapPin, X, AlertOctagon } from "lucide-react";
import { useEmergency } from "@/hooks/use-emergency";

export function EmergencyOverlay() {
  const { isEmergency, cancelEmergency } = useEmergency();

  return (
    <AnimatePresence>
      {isEmergency && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="fixed inset-0 z-[100] bg-canvas flex items-center justify-center overflow-hidden"
        >
          {/* Red radial gradient background */}
          <motion.div
            initial={{ opacity: 0, scale: 1.2 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(circle at 50% 30%, rgba(248,113,113,0.25) 0%, rgba(7,17,26,0.95) 60%, #07111A 100%)",
            }}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", stiffness: 280, damping: 22 }}
            className="relative z-10 w-full max-w-2xl mx-6 glass rounded-[3rem] border-danger/30 p-12 text-center"
          >
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-danger/20 border border-danger/50 flex items-center justify-center mx-auto mb-8"
            >
              <AlertOctagon className="w-12 h-12 text-danger" />
            </motion.div>

            <h2 className="text-5xl font-geist font-bold tracking-tight mb-4">
              Possible Emergency
            </h2>
            <p className="text-text-secondary text-lg mb-10">
              Critical symptoms detected. Please contact emergency services immediately.
            </p>

            <div className="grid grid-cols-2 gap-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="col-span-2 flex items-center justify-center gap-3 py-6 rounded-3xl bg-danger text-white font-bold text-xl"
              >
                <Phone className="w-6 h-6" />
                Call Emergency
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-5 rounded-3xl glass text-white font-medium"
              >
                <MapPin className="w-5 h-5" />
                Nearest Hospital
              </motion.button>

              <motion.button
                onClick={cancelEmergency}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.12)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center justify-center gap-2 py-5 rounded-3xl glass text-text-tertiary font-medium"
              >
                <X className="w-5 h-5" />
                Continue Chat
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
