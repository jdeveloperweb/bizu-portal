"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Lock, Swords, CheckCircle2, Star, Skull } from "lucide-react";
import { ZoneState } from "@/lib/warDayService";

interface WarZoneNodeProps {
  zone: ZoneState;
  onClick: (zone: ZoneState) => void;
  isSelected: boolean;
}

const ZONE_VISUALS: Record<string, { label: string; color: string; glowColor: string; bgColor: string }> = {
  CAMP: { label: "Acampamento", color: "#F59E0B", glowColor: "rgba(245,158,11,0.6)", bgColor: "#78350F" },
  WATCHTOWER: { label: "Torre de Vigia", color: "#22D3EE", glowColor: "rgba(34,211,238,0.6)", bgColor: "#164E63" },
  FORTRESS: { label: "Fortaleza", color: "#A78BFA", glowColor: "rgba(167,139,250,0.6)", bgColor: "#4C1D95" },
  CASTLE: { label: "Castelo", color: "#C084FC", glowColor: "rgba(192,132,252,0.6)", bgColor: "#581C87" },
  BOSS: { label: "Fortaleza das Trevas", color: "#F87171", glowColor: "rgba(248,113,113,0.8)", bgColor: "#7F1D1D" },
};

const STATUS_CONFIG = {
  LOCKED: { opacity: 0.35, scale: 0.9 },
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
      <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 20V9L4 7V20M22 20V9L20 7V20M2 13H22M7 13V20M17 13V20M10 20V16C10 14.8954 10.8954 14 12 14C13.1046 14 14 14.8954 14 16V20M6 7V4H8V7M16 7V4H18V7M11 7V2H13V7" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="9" y="9" width="6" height="4" rx="1" fill={iconColor} opacity="0.2" />
      </svg>
    );
  }
  if (zoneType === "FORTRESS") {
    return (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21V10L5 8V21M21 21V10L19 8V21M3 14H21M8 14V21M16 14V21M11 21V17C11 16.4477 11.4477 16 12 16C12.5523 16 13 16.4477 13 17V21M7 8V5H9V8M15 8V5H17V8" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (zoneType === "WATCHTOWER") {
    return (
      <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M8 21V18H16V21M6 18H18L16 6H8L6 18ZM10 6V3H14V6M9 13H15M12 13V6" stroke={iconColor} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="1.5" fill={iconColor} />
      </svg>
    );
  }
  // CAMP
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

  const nodeSize = isBoss ? 72 : 56;
  const difficultyStars = Array.from({ length: zone.difficultyLevel }, (_, i) => i);

  return (
    <motion.div
      className="absolute cursor-pointer select-none"
      style={{
        left: `${zone.positionX * 100}%`,
        top: `${zone.positionY * 100}%`,
        transform: "translate(-50%, -50%)",
        width: nodeSize,
        zIndex: isSelected ? 30 : isInProgress ? 20 : 10,
      }}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: statusCfg.opacity,
        scale: isSelected ? 1.15 : statusCfg.scale,
      }}
      transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
      onClick={() => !isLocked && onClick(zone)}
      title={isLocked ? "Zona bloqueada" : zone.name}
    >
      {/* Outer glow ring for available/in-progress */}
      {(isAvailable || isInProgress) && (
        <motion.div
          className="absolute inset-0 rounded-full border border-white/20"
          style={{ inset: -6, boxShadow: `0 0 25px 5px ${visual.glowColor}` }}
          animate={{ opacity: [0.3, 0.8, 0.3], scale: [1, 1.05, 1] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />
      )}

      {/* Boss pulsing aura */}
      {isBoss && isAvailable && (
        <motion.div
          className="absolute rounded-full"
          style={{
            inset: -12,
            border: `2px solid ${visual.color}`,
            boxShadow: `0 0 30px 10px ${visual.glowColor}`,
          }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}

      {/* Zone container */}
      <div
        className="relative flex flex-col items-center"
        style={{ width: nodeSize, height: nodeSize + 24 }}
      >
        {/* Main zone circle */}
        <div
          className="relative flex items-center justify-center rounded-full border transition-all"
          style={{
            width: nodeSize,
            height: nodeSize,
            background: isLocked
              ? "rgba(15,15,25,0.7)"
              : `linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%), ${visual.bgColor}`,
            borderColor: isLocked ? "rgba(255,255,255,0.1)" : `${visual.color}80`,
            boxShadow: isLocked
              ? "inset 0 0 10px rgba(0,0,0,0.5)"
              : isConquered
                ? `0 0 30px -5px ${visual.glowColor}, inset 0 0 15px ${visual.glowColor}`
                : `0 0 20px -8px ${visual.glowColor}, inset 0 0 10px ${visual.glowColor}`,
            backdropFilter: "blur(8px)",
          }}
        >
          {/* Inner ring for depth */}
          <div className="absolute inset-1 rounded-full border border-white/5 pointer-events-none" />
          {isLocked ? (
            <Lock size={22} className="text-gray-600" />
          ) : (
            <ZoneIcon zoneType={zone.zoneType} status={zone.status} color={visual.color} bgColor={visual.bgColor} />
          )}

          {/* Conquered checkmark */}
          {isConquered && (
            <motion.div
              className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-1"
              style={{ boxShadow: "0 0 10px rgba(16, 185, 129, 0.6)" }}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <CheckCircle2 size={16} className="text-white" />
            </motion.div>
          )}

          {/* In-progress indicator */}
          {isInProgress && (
            <motion.div
              className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1"
              style={{ boxShadow: "0 0 10px rgba(59, 130, 246, 0.6)" }}
              animate={{ rotate: 360 }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            >
              <Swords size={14} className="text-white" />
            </motion.div>
          )}

          {/* Progress ring for in-progress */}
          {isInProgress && zone.progressPercent > 0 && (
            <svg
              className="absolute"
              style={{ width: nodeSize + 8, height: nodeSize + 8, top: -4, left: -4 }}
              viewBox={`0 0 ${nodeSize + 8} ${nodeSize + 8}`}
            >
              <circle
                cx={(nodeSize + 8) / 2}
                cy={(nodeSize + 8) / 2}
                r={nodeSize / 2 + 2}
                fill="none"
                stroke={visual.color}
                strokeWidth="2.5"
                strokeDasharray={`${(zone.progressPercent / 100) * (Math.PI * (nodeSize + 4))} ${Math.PI * (nodeSize + 4)}`}
                strokeLinecap="round"
                transform={`rotate(-90 ${(nodeSize + 8) / 2} ${(nodeSize + 8) / 2})`}
                opacity={0.9}
              />
            </svg>
          )}
        </div>

        {/* Zone name */}
        <div
          className="mt-3 px-2.5 py-1 rounded-md text-center font-bold tracking-tight shadow-lg border border-white/5"
          style={{
            fontSize: "10px",
            lineHeight: "1.1",
            background: "rgba(10,10,20,0.85)",
            backdropFilter: "blur(12px)",
            color: isLocked ? "#6B7280" : "#F3F4F6",
            maxWidth: 140,
            whiteSpace: "normal",
            wordBreak: "break-word",
            textShadow: "0 2px 4px rgba(0,0,0,0.5)"
          }}
        >
          <span style={{ color: isLocked ? "#4B5563" : visual.color, display: 'block', fontSize: '8px', textTransform: 'uppercase', marginBottom: '2px', opacity: 0.8 }}>
            {zone.zoneType}
          </span>
          {zone.name}
        </div>

        {/* Difficulty stars */}
        {!isLocked && (
          <div className="flex gap-0.5 mt-0.5">
            {difficultyStars.map((_, i) => (
              <Star key={i} size={8} fill={visual.color} color={visual.color} />
            ))}
            {isBoss && <Skull size={10} fill="#F87171" color="#F87171" />}
          </div>
        )}
      </div>
    </motion.div>
  );
}
