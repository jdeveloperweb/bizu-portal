"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Zap, Star } from "lucide-react";

interface ZoneConquestAnimationProps {
  zoneName: string;
  zoneType: string;
  pointsEarned: number;
  show: boolean;
  onDone: () => void;
}

export default function ZoneConquestAnimation({
  zoneName, zoneType, pointsEarned, show, onDone
}: ZoneConquestAnimationProps) {
  const isBoss = zoneType === "BOSS";

  return (
    <AnimatePresence onExitComplete={onDone}>
      {show && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Dark overlay */}
          <motion.div
            className="absolute inset-0 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Conquest card */}
          <motion.div
            className="relative z-10 text-center px-12 py-10 rounded-2xl border"
            style={{
              background: isBoss
                ? "radial-gradient(ellipse at center, #7F1D1D 0%, #0F0F0F 70%)"
                : "radial-gradient(ellipse at center, #1A0A2E 0%, #0F172A 70%)",
              borderColor: isBoss ? "#F87171" : "#F59E0B",
              boxShadow: isBoss
                ? "0 0 60px 20px rgba(248,113,113,0.4)"
                : "0 0 60px 20px rgba(245,158,11,0.3)",
            }}
            initial={{ scale: 0.3, opacity: 0, y: 60 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -40 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onAnimationComplete={() => setTimeout(onDone, 2500)}
          >
            {/* Particle burst */}
            {Array.from({ length: 12 }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full"
                style={{
                  background: isBoss ? "#F87171" : "#F59E0B",
                  left: "50%",
                  top: "50%",
                }}
                initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                animate={{
                  x: Math.cos((i / 12) * Math.PI * 2) * 120,
                  y: Math.sin((i / 12) * Math.PI * 2) * 120,
                  opacity: 0,
                  scale: 0.3,
                }}
                transition={{ duration: 0.8, delay: 0.2 }}
              />
            ))}

            {/* Icon */}
            <motion.div
              className="flex justify-center mb-4"
              animate={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {isBoss ? (
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(248,113,113,0.2)", border: "2px solid #F87171" }}>
                  <Star size={40} fill="#F87171" color="#F87171" />
                </div>
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center"
                  style={{ background: "rgba(245,158,11,0.2)", border: "2px solid #F59E0B" }}>
                  <CheckCircle2 size={40} color="#F59E0B" />
                </div>
              )}
            </motion.div>

            <motion.p
              className="text-sm font-semibold uppercase tracking-widest mb-2"
              style={{ color: isBoss ? "#F87171" : "#F59E0B" }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              {isBoss ? "⚔️ Boss Derrotado!" : "Zona Conquistada!"}
            </motion.p>

            <motion.h2
              className="text-3xl font-black text-white mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              {zoneName}
            </motion.h2>

            <motion.div
              className="flex items-center justify-center gap-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              <Zap size={20} color="#F59E0B" fill="#F59E0B" />
              <span className="text-2xl font-bold" style={{ color: "#F59E0B" }}>
                +{pointsEarned} pts
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
