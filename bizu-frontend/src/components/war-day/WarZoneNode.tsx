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
  CAMP:        { label: "Acampamento",       color: "#F59E0B", glowColor: "rgba(245,158,11,0.6)",  bgColor: "#78350F" },
  WATCHTOWER:  { label: "Torre de Vigia",    color: "#22D3EE", glowColor: "rgba(34,211,238,0.6)",  bgColor: "#164E63" },
  FORTRESS:    { label: "Fortaleza",         color: "#A78BFA", glowColor: "rgba(167,139,250,0.6)", bgColor: "#4C1D95" },
  CASTLE:      { label: "Castelo",           color: "#C084FC", glowColor: "rgba(192,132,252,0.6)", bgColor: "#581C87" },
  BOSS:        { label: "Fortaleza das Trevas", color: "#F87171", glowColor: "rgba(248,113,113,0.8)", bgColor: "#7F1D1D" },
};

const STATUS_CONFIG = {
  LOCKED:      { opacity: 0.35, scale: 0.9 },
  AVAILABLE:   { opacity: 1.0,  scale: 1.0 },
  IN_PROGRESS: { opacity: 1.0,  scale: 1.05 },
  CONQUERED:   { opacity: 1.0,  scale: 1.0 },
};

function ZoneIcon({ zoneType, size = 28 }: { zoneType: string; size?: number }) {
  const s = size;
  if (zoneType === "BOSS") {
    return (
      <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
        <polygon points="14,2 18,9 26,9 20,14 22,22 14,17 6,22 8,14 2,9 10,9" fill="#F87171" stroke="#7F1D1D" strokeWidth="1"/>
      </svg>
    );
  }
  if (zoneType === "CASTLE") {
    return (
      <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
        <rect x="4" y="12" width="20" height="12" rx="1" fill="#C084FC" stroke="#581C87" strokeWidth="1.5"/>
        <rect x="5" y="8" width="4" height="6" rx="0.5" fill="#C084FC" stroke="#581C87" strokeWidth="1"/>
        <rect x="12" y="6" width="4" height="8" rx="0.5" fill="#C084FC" stroke="#581C87" strokeWidth="1"/>
        <rect x="19" y="8" width="4" height="6" rx="0.5" fill="#C084FC" stroke="#581C87" strokeWidth="1"/>
        <rect x="11" y="16" width="6" height="8" rx="0.5" fill="#4C1D95" stroke="#581C87" strokeWidth="1"/>
      </svg>
    );
  }
  if (zoneType === "FORTRESS") {
    return (
      <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
        <rect x="4" y="10" width="20" height="14" rx="1" fill="#A78BFA" stroke="#4C1D95" strokeWidth="1.5"/>
        <rect x="4" y="7" width="5" height="5" fill="#A78BFA" stroke="#4C1D95" strokeWidth="1"/>
        <rect x="19" y="7" width="5" height="5" fill="#A78BFA" stroke="#4C1D95" strokeWidth="1"/>
        <rect x="11" y="15" width="6" height="9" rx="0.5" fill="#4C1D95" stroke="#4C1D95" strokeWidth="1"/>
      </svg>
    );
  }
  if (zoneType === "WATCHTOWER") {
    return (
      <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
        <rect x="10" y="4" width="8" height="18" rx="1" fill="#22D3EE" stroke="#164E63" strokeWidth="1.5"/>
        <rect x="7" y="3" width="14" height="4" rx="0.5" fill="#22D3EE" stroke="#164E63" strokeWidth="1"/>
        <rect x="8" y="18" width="12" height="6" rx="0.5" fill="#164E63" stroke="#22D3EE" strokeWidth="1"/>
        <circle cx="14" cy="11" r="2" fill="#164E63"/>
      </svg>
    );
  }
  // CAMP
  return (
    <svg width={s} height={s} viewBox="0 0 28 28" fill="none">
      <polygon points="14,4 24,22 4,22" fill="#F59E0B" stroke="#78350F" strokeWidth="1.5"/>
      <polygon points="8,22 14,12 20,22" fill="#78350F"/>
      <rect x="12" y="18" width="4" height="4" fill="#78350F"/>
      <circle cx="22" cy="16" r="3" fill="#EF4444" opacity="0.8"/>
      <circle cx="20" cy="20" r="2" fill="#EF4444" opacity="0.6"/>
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
          className="absolute inset-0 rounded-full"
          style={{ boxShadow: `0 0 20px 8px ${visual.glowColor}` }}
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
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
          className="relative flex items-center justify-center rounded-full border-2 transition-all"
          style={{
            width: nodeSize,
            height: nodeSize,
            background: isLocked
              ? "rgba(30,30,50,0.8)"
              : `radial-gradient(circle at 35% 35%, ${visual.color}33, ${visual.bgColor})`,
            borderColor: isLocked ? "#374151" : visual.color,
            boxShadow: isLocked
              ? "none"
              : isConquered
              ? `0 0 16px 4px ${visual.glowColor}, inset 0 0 12px ${visual.glowColor}`
              : `0 0 8px 2px ${visual.glowColor}`,
          }}
        >
          {isLocked ? (
            <Lock size={22} className="text-gray-600" />
          ) : (
            <ZoneIcon zoneType={zone.zoneType} size={isBoss ? 36 : 28} />
          )}

          {/* Conquered checkmark */}
          {isConquered && (
            <motion.div
              className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500 }}
            >
              <CheckCircle2 size={14} className="text-white" />
            </motion.div>
          )}

          {/* In-progress indicator */}
          {isInProgress && (
            <motion.div
              className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-0.5"
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <Swords size={12} className="text-white" />
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
          className="mt-1 px-2 py-0.5 rounded text-center font-semibold whitespace-nowrap"
          style={{
            fontSize: "9px",
            background: "rgba(0,0,0,0.7)",
            color: isLocked ? "#6B7280" : visual.color,
            maxWidth: 80,
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
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
