"use client";

import { motion } from "framer-motion";
import { Lock, Swords, CheckCircle2, Star, Skull } from "lucide-react";
import { ZoneState } from "@/lib/warDayService";

interface WarZoneNodeProps {
  zone: ZoneState;
  onClick: (zone: ZoneState) => void;
  isSelected: boolean;
}

const ZONE_VISUALS: Record<string, { label: string; color: string; glowColor: string; bgColor: string; accentColor: string }> = {
  CAMP: { label: "Acampamento", color: "#F59E0B", glowColor: "rgba(245,158,11,0.5)", bgColor: "#1e150a", accentColor: "#fbbf24" },
  WATCHTOWER: { label: "Torre de Vigia", color: "#22D3EE", glowColor: "rgba(34,211,238,0.5)", bgColor: "#0a1b1e", accentColor: "#67e8f9" },
  FORTRESS: { label: "Fortaleza", color: "#A78BFA", glowColor: "rgba(167,139,250,0.5)", bgColor: "#150a1e", accentColor: "#c4b5fd" },
  CASTLE: { label: "Castelo", color: "#C084FC", glowColor: "rgba(192,132,252,0.5)", bgColor: "#1a0a1e", accentColor: "#d8b4fe" },
  BOSS: { label: "Fortaleza das Trevas", color: "#F87171", glowColor: "rgba(248,113,113,0.7)", bgColor: "#1e0a0a", accentColor: "#fca5a5" },
};

const STATUS_CONFIG = {
  LOCKED: { opacity: 0.4, scale: 0.95 },
  AVAILABLE: { opacity: 1.0, scale: 1.0 },
  IN_PROGRESS: { opacity: 1.0, scale: 1.05 },
  CONQUERED: { opacity: 1.0, scale: 1.0 },
};

function ZoneIcon({ zoneType, status, color, bgColor }: { zoneType: string; status: string; color: string; bgColor: string }) {
  const isLocked = status === 'LOCKED';
  const iconColor = isLocked ? '#4B5563' : color;
  const secondaryColor = isLocked ? '#1F2937' : bgColor;

  if (zoneType === "BOSS") {
    return (
      <svg width="68" height="68" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="bossGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={iconColor} />
            <stop offset="100%" stopColor={secondaryColor} />
          </radialGradient>
        </defs>
        <path d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z" fill="url(#bossGrad)" stroke={iconColor} strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M12 13V18" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
        <path d="M9 16L12 13L15 16" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6" />
      </svg>
    );
  }
  if (zoneType === "CASTLE") {
    return (
      <svg width="58" height="58" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 20V9L4 7V20M22 20V9L20 7V20M2 13H22M7 13V20M17 13V20M10 20V16C10 14.8954 10.8954 14 12 14C13.1046 14 14 14.8954 14 16V20M6 7V4H8V7M16 7V4H18V7M11 7V2H13V7" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (zoneType === "FORTRESS") {
    return (
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21V10L5 8V21M21 21V10L19 8V21M3 14H21M8 14V21M16 14V21M11 21V17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17V21M7 8V5H9V8M15 8V5H17V8" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (zoneType === "WATCHTOWER") {
    return (
      <svg width="54" height="54" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 21V18H16V21M6 18H18L16 6H8L6 18ZM10 6V3H14V6M9 13H15M12 13V6" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="1.5" fill={iconColor} />
      </svg>
    );
  }
  // CAMP
  return (
    <svg width="50" height="50" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3L2 21H22L12 3Z" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 13L16 21H8L12 13Z" fill={iconColor} opacity="0.3" />
      <path d="M12 17V21" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function WarZoneNode({ zone, onClick, isSelected }: WarZoneNodeProps) {
  const visual = ZONE_VISUALS[zone.zoneType] ?? ZONE_VISUALS.CAMP;
  const statusCfg = STATUS_CONFIG[zone.status] ?? STATUS_CONFIG.LOCKED;
  const isBoss = zone.zoneType === "BOSS";
  const isConquered = zone.status === "CONQUERED";
  const isAvailable = zone.status === "AVAILABLE";
  const isInProgress = zone.status === "IN_PROGRESS";
  const isLocked = zone.status === "LOCKED";

  const nodeSize = isBoss ? 160 : 120;
  const difficultyStars = Array.from({ length: zone.difficultyLevel }, (_, i) => i);

  return (
    <motion.div
      className="absolute group"
      style={{
        left: `${zone.positionX * 100}%`,
        top: `${zone.positionY * 100}%`,
        transform: "translate(-50%, -50%)",
        width: nodeSize,
        zIndex: isSelected ? 30 : isInProgress ? 20 : 10,
        cursor: isLocked ? "default" : "pointer",
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: statusCfg.opacity,
        scale: isSelected ? 1.15 : statusCfg.scale,
        y: [0, -4, 0], // Subtle floating animation
      }}
      transition={{
        scale: { duration: 0.3, type: "spring", stiffness: 300 },
        y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }
      }}
      onClick={() => !isLocked && onClick(zone)}
    >
      {/* Active Area Glow */}
      {(isAvailable || isInProgress) && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ inset: -10, boxShadow: `0 0 35px 5px ${visual.glowColor}` }}
          animate={{ opacity: [0.2, 0.6, 0.2], scale: [1, 1.1, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Boss Pulse */}
      {isBoss && isAvailable && (
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: -15,
            border: `2px solid ${visual.color}44`,
            boxShadow: `0 0 40px 10px ${visual.glowColor}`,
          }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      )}

      <div className="relative flex flex-col items-center">
        {/* The Node Base */}
        <div
          className="relative flex items-center justify-center rounded-3xl border-2 transition-transform duration-300 group-hover:scale-110"
          style={{
            width: nodeSize,
            height: nodeSize,
            background: isLocked
              ? "rgba(10,10,20,0.8)"
              : `linear-gradient(135deg, ${visual.bgColor} 0%, #050510 100%)`,
            borderColor: isLocked ? "rgba(255,255,255,0.05)" : `${visual.color}60`,
            boxShadow: isLocked
              ? "none"
              : `0 10px 30px -5px rgba(0,0,0,0.8), inset 0 0 20px ${visual.color}15`,
            backdropFilter: "blur(12px)",
          }}
        >
          {/* Internal Glowing Ring */}
          {!isLocked && (
            <div className="absolute inset-2 rounded-2xl border border-white/5 shadow-[inset_0_0_15px_rgba(255,255,255,0.05)]" />
          )}

          {isLocked ? (
            <Lock size={24} className="text-gray-700 opacity-50" />
          ) : (
            <ZoneIcon zoneType={zone.zoneType} status={zone.status} color={visual.accentColor} bgColor={visual.bgColor} />
          )}

          {/* Badges */}
          <div className="absolute -top-1 -right-1 flex gap-1">
            {isConquered && (
              <motion.div
                className="bg-emerald-500 rounded-lg p-1.5 shadow-lg border border-emerald-400/50"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
              >
                <CheckCircle2 size={16} className="text-white" />
              </motion.div>
            )}
            {isInProgress && (
              <motion.div
                className="bg-blue-500 rounded-lg p-1.5 shadow-lg border border-blue-400/50"
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Swords size={18} className="text-white" />
              </motion.div>
            )}
          </div>

          {/* Progress Ring */}
          {isInProgress && zone.progressPercent > 0 && (
            <svg
              className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] -rotate-90 pointer-events-none"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={visual.color}
                strokeWidth="3"
                strokeDasharray={`${zone.progressPercent * 2.89} 289`}
                strokeLinecap="round"
                opacity="0.8"
              />
            </svg>
          )}
        </div>

        {/* Label and Info */}
        <div className="mt-5 flex flex-col items-center gap-2">
          <div
            className="px-4 py-2 rounded-xl backdrop-blur-xl bg-black/60 border border-white/5 shadow-2xl flex flex-col items-center"
            style={{
              minWidth: 140,
              boxShadow: isSelected ? `0 0 20px ${visual.glowColor}44` : '0 4px 20px rgba(0,0,0,0.4)'
            }}
          >
            <span className="text-[9px] font-black uppercase tracking-[0.2em] mb-1" style={{ color: isLocked ? "#444" : visual.color }}>
              {isBoss ? "GRANDE CHEFE" : zone.zoneType}
            </span>
            <span className="text-sm font-black text-white tracking-tight text-center">
              {zone.name}
            </span>
          </div>

          {/* Difficulty and Skull */}
          {!isLocked && (
            <div className="flex items-center gap-1 bg-black/40 px-2 py-1 rounded-full border border-white/5">
              {difficultyStars.map((_, i) => (
                <Star key={i} size={10} fill={visual.color} color={visual.color} />
              ))}
              {isBoss && <Skull size={12} className="text-red-500 ml-1" />}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
