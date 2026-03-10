"use client";

import { motion } from "framer-motion";
import { ZoneState } from "@/lib/warDayService";

interface WarZoneNodeProps {
  zone: ZoneState;
  onClick: (zone: ZoneState) => void;
  isSelected: boolean;
}

// Regular octagon points on a 100×100 viewBox
const OCT = "50,4 87,17 96,50 87,83 50,96 13,83 4,50 13,17";
const OCT_INNER = "50,11 83,23 91,50 83,77 50,89 17,77 9,50 17,23";

const ZONE_THEME: Record<string, {
  color: string; glow: string; embers: string; label: string; tier: string;
}> = {
  CAMP:       { color: "#F59E0B", glow: "rgba(245,158,11,0.65)",  embers: "#FDE68A", label: "Acampamento",         tier: "I"    },
  WATCHTOWER: { color: "#22D3EE", glow: "rgba(34,211,238,0.65)",  embers: "#A5F3FC", label: "Torre de Vigia",      tier: "II"   },
  FORTRESS:   { color: "#A78BFA", glow: "rgba(167,139,250,0.65)", embers: "#DDD6FE", label: "Fortaleza",           tier: "III"  },
  CASTLE:     { color: "#C084FC", glow: "rgba(192,132,252,0.65)", embers: "#E9D5FF", label: "Castelo",             tier: "IV"   },
  BOSS:       { color: "#F87171", glow: "rgba(248,113,113,0.80)", embers: "#FECACA", label: "Fortaleza das Trevas", tier: "BOSS" },
};

// ── Zone Art Components ─────────────────────────────────────────────────────

function ArtCAMP({ c }: { c: string }) {
  return (
    <g transform="translate(50,52)">
      <ellipse cx="0" cy="24" rx="26" ry="7" fill={c} opacity="0.12" />
      {/* Tent */}
      <polygon points="0,-26 -24,20 24,20" fill={c} opacity="0.10" />
      <polygon points="0,-26 -24,20 24,20" fill="none" stroke={c} strokeWidth="2.2" strokeLinejoin="round" />
      <path d="M -9,20 Q 0,6 9,20" fill={c} opacity="0.22" />
      <line x1="0" y1="-22" x2="0" y2="20" stroke={c} strokeWidth="1.4" opacity="0.45" />
      {/* Flag */}
      <line x1="0" y1="-26" x2="0" y2="-38" stroke={c} strokeWidth="1.8" strokeLinecap="round" />
      <polygon points="0,-38 12,-33 0,-28" fill={c} opacity="0.85" />
      {/* Fire pit */}
      <ellipse cx="0" cy="28" rx="10" ry="3.5" fill={c} opacity="0.25" />
      {/* Flame */}
      <path d="M -4,26 Q -7,16 -3,11 Q -1,18 1,11 Q 5,16 4,26" fill={c} opacity="0.85" />
      <path d="M -2,24 Q -4,17 -1,14 Q 0,19 1,14 Q 4,17 2,24" fill="#FFFBEB" opacity="0.75" />
    </g>
  );
}

function ArtWATCHTOWER({ c }: { c: string }) {
  return (
    <g transform="translate(50,52)">
      {/* Base platform */}
      <rect x="-14" y="14" width="28" height="12" rx="2" fill={c} opacity="0.12" stroke={c} strokeWidth="1.5" />
      {/* Tower body */}
      <rect x="-10" y="-16" width="20" height="32" rx="2" fill={c} opacity="0.09" stroke={c} strokeWidth="1.5" />
      {/* Battlements */}
      {[-10, -3, 4].map((x, i) => (
        <rect key={i} x={x} y="-23" width="5" height="8" rx="1" fill={c} opacity="0.2" stroke={c} strokeWidth="1.2" />
      ))}
      {/* Light beam */}
      <path d="M 0,-20 L -26,-36 L 26,-36 Z" fill={c} opacity="0.09" />
      <path d="M 0,-20 L -20,-34 L 20,-34 Z" fill={c} opacity="0.07" />
      {/* Lantern */}
      <circle cx="0" cy="-4" r="5.5" fill={c} opacity="0.4" />
      <circle cx="0" cy="-4" r="2.5" fill="#FFFFFFCC" />
      {/* Arrow slit */}
      <rect x="-1.5" y="4" width="3" height="7" rx="1" fill={c} opacity="0.55" />
    </g>
  );
}

function ArtFORTRESS({ c }: { c: string }) {
  return (
    <g transform="translate(50,52)">
      {/* Wall */}
      <rect x="-32" y="6" width="64" height="18" rx="2" fill={c} opacity="0.10" stroke={c} strokeWidth="1.5" />
      {/* Left tower */}
      <rect x="-32" y="-16" width="15" height="24" rx="2" fill={c} opacity="0.10" stroke={c} strokeWidth="1.5" />
      {/* Right tower */}
      <rect x="17" y="-16" width="15" height="24" rx="2" fill={c} opacity="0.10" stroke={c} strokeWidth="1.5" />
      {/* Gate arch */}
      <path d="M -9,24 L -9,10 Q 0,-2 9,10 L 9,24" fill={c} opacity="0.18" />
      {/* Shield emblem */}
      <path d="M 0,-4 L -12,4 L -9,16 L 0,22 L 9,16 L 12,4 Z"
        fill={c} opacity="0.25" stroke={c} strokeWidth="1.8" strokeLinejoin="round" />
      <line x1="0" y1="-1" x2="0" y2="16" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
      <line x1="-8" y1="7" x2="8" y2="7" stroke="#FFFFFF" strokeWidth="1.5" opacity="0.5" />
      {/* Left battlements */}
      {[-30, -24].map((x, i) => (
        <rect key={i} x={x} y="-22" width="5" height="7" rx="1" fill={c} opacity="0.3" stroke={c} strokeWidth="1" />
      ))}
      {/* Right battlements */}
      {[19, 25].map((x, i) => (
        <rect key={i} x={x} y="-22" width="5" height="7" rx="1" fill={c} opacity="0.3" stroke={c} strokeWidth="1" />
      ))}
    </g>
  );
}

function ArtCASTLE({ c }: { c: string }) {
  return (
    <g transform="translate(50,52)">
      {/* Main tower */}
      <rect x="-11" y="-18" width="22" height="44" rx="2" fill={c} opacity="0.10" stroke={c} strokeWidth="1.5" />
      {/* Side towers */}
      <rect x="-30" y="-8" width="14" height="34" rx="1" fill={c} opacity="0.09" stroke={c} strokeWidth="1.5" />
      <rect x="16" y="-8" width="14" height="34" rx="1" fill={c} opacity="0.09" stroke={c} strokeWidth="1.5" />
      {/* Spires */}
      <polygon points="0,-36 -7,-18 7,-18" fill={c} opacity="0.75" />
      <polygon points="-23,-26 -28,-8 -18,-8" fill={c} opacity="0.55" />
      <polygon points="23,-26 18,-8 28,-8" fill={c} opacity="0.55" />
      {/* Crown */}
      <path d="M -14,-40 L -9,-34 L -4,-40 L 0,-34 L 4,-40 L 9,-34 L 14,-40"
        stroke={c} strokeWidth="2" fill="none" strokeLinejoin="round" />
      {/* Windows */}
      <rect x="-4" y="-10" width="8" height="10" rx="4" fill={c} opacity="0.4" />
      <rect x="-20" y="0" width="5" height="7" rx="2.5" fill={c} opacity="0.3" />
      <rect x="15" y="0" width="5" height="7" rx="2.5" fill={c} opacity="0.3" />
      {/* Gate */}
      <path d="M -7,26 L -7,12 Q 0,3 7,12 L 7,26" fill={c} opacity="0.22" />
    </g>
  );
}

function ArtBOSS({ c }: { c: string }) {
  return (
    <g transform="translate(50,54)">
      {/* Hell ground glow */}
      <ellipse cx="0" cy="28" rx="30" ry="9" fill={c} opacity="0.14" />
      {/* Flames */}
      <path d="M -22,28 Q -24,10 -14,2 Q -16,14 -8,8 Q -11,18 -4,12 Q -5,22 0,18 Q 5,22 4,12 Q 11,18 8,8 Q 16,14 14,2 Q 24,10 22,28"
        fill={c} opacity="0.38" />
      <path d="M -14,28 Q -15,16 -8,10 Q -10,18 -4,14 Q -2,20 0,16 Q 2,20 4,14 Q 10,18 8,10 Q 15,16 14,28"
        fill="#FEF3C7" opacity="0.28" />
      {/* Skull */}
      <ellipse cx="0" cy="-4" rx="18" ry="16" fill={c} opacity="0.14" stroke={c} strokeWidth="1.8" />
      {/* Horns */}
      <path d="M -16,-6 Q -26,-26 -12,-34 Q -10,-20 -14,-10" fill={c} opacity="0.65" stroke={c} strokeWidth="1.2" />
      <path d="M 16,-6 Q 26,-26 12,-34 Q 10,-20 14,-10" fill={c} opacity="0.65" stroke={c} strokeWidth="1.2" />
      {/* Eye sockets */}
      <ellipse cx="-7" cy="-6" rx="4.5" ry="3.5" fill={c} opacity="0.85" />
      <ellipse cx="7" cy="-6" rx="4.5" ry="3.5" fill={c} opacity="0.85" />
      <ellipse cx="-7" cy="-6" rx="2" ry="1.5" fill="#FFF" opacity="0.9" />
      <ellipse cx="7" cy="-6" rx="2" ry="1.5" fill="#FFF" opacity="0.9" />
      {/* Nasal cavity */}
      <path d="M -2,0 L 0,4 L 2,0" fill="none" stroke={c} strokeWidth="1.5" strokeLinejoin="round" opacity="0.6" />
      {/* Fangs */}
      <polygon points="-5,4 -3,11 -7,4" fill="white" opacity="0.6" />
      <polygon points="5,4 3,11 7,4" fill="white" opacity="0.6" />
    </g>
  );
}

function ZoneArt({ zoneType, color, isLocked }: { zoneType: string; color: string; isLocked: boolean }) {
  const c = isLocked ? "#374151" : color;
  switch (zoneType) {
    case "CAMP":        return <ArtCAMP c={c} />;
    case "WATCHTOWER":  return <ArtWATCHTOWER c={c} />;
    case "FORTRESS":    return <ArtFORTRESS c={c} />;
    case "CASTLE":      return <ArtCASTLE c={c} />;
    case "BOSS":        return <ArtBOSS c={c} />;
    default:            return <ArtCAMP c={c} />;
  }
}

// ── Progress Ring ────────────────────────────────────────────────────────────

function ProgressRing({ progress, color, size }: { progress: number; color: string; size: number }) {
  const r = 47;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - Math.min(progress, 100) / 100);

  return (
    <svg
      className="absolute pointer-events-none"
      style={{ inset: -7, width: size + 14, height: size + 14 }}
      viewBox="0 0 100 100"
    >
      {/* Track */}
      <circle cx="50" cy="50" r={r} fill="none" stroke={color} strokeWidth="2" opacity="0.12" />
      {/* Fill */}
      <motion.circle
        cx="50" cy="50" r={r}
        fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round"
        transform="rotate(-90 50 50)"
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.3, ease: "easeOut" }}
        style={{ filter: `drop-shadow(0 0 4px ${color})` }}
      />
    </svg>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function WarZoneNode({ zone, onClick, isSelected }: WarZoneNodeProps) {
  const theme = ZONE_THEME[zone.zoneType] ?? ZONE_THEME.CAMP;
  const isBoss      = zone.zoneType === "BOSS";
  const isConquered = zone.status === "CONQUERED";
  const isAvailable = zone.status === "AVAILABLE";
  const isInProgress = zone.status === "IN_PROGRESS";
  const isLocked    = zone.status === "LOCKED";
  const isActive    = isAvailable || isInProgress;

  const nodeSize  = isBoss ? 158 : 118;
  // Deterministic float delay from zone position to avoid hydration mismatch
  const floatDelay = (zone.positionX + zone.positionY) * 1.5;

  const uid = zone.zoneId; // shorthand for filter/gradient IDs

  return (
    <motion.div
      className="absolute"
      style={{
        left: `${zone.positionX * 100}%`,
        top: `${zone.positionY * 100}%`,
        transform: "translate(-50%, -50%)",
        width: nodeSize,
        zIndex: isSelected ? 30 : isInProgress ? 20 : isBoss ? 15 : 10,
        cursor: isLocked ? "default" : "pointer",
      }}
      initial={{ opacity: 0, scale: 0.35, y: 16 }}
      animate={{
        opacity: isLocked ? 0.42 : 1,
        scale: isSelected ? 1.18 : 1,
        y: isLocked ? 0 : [0, isBoss ? -9 : -5, 0],
      }}
      transition={{
        opacity: { duration: 0.5 },
        scale: { type: "spring", stiffness: 280, damping: 22 },
        y: { duration: isBoss ? 5 : 4, repeat: Infinity, ease: "easeInOut", delay: floatDelay },
      }}
      onClick={() => !isLocked && onClick(zone)}
    >
      <div className="relative flex flex-col items-center">

        {/* ── OUTER AURA (available / in-progress) ── */}
        {isActive && (
          <motion.div
            className="absolute rounded-full pointer-events-none"
            style={{
              inset: -28,
              background: `radial-gradient(circle, ${theme.glow} 0%, transparent 68%)`,
            }}
            animate={{ opacity: [0.35, 0.75, 0.35], scale: [1, 1.08, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          />
        )}

        {/* ── BOSS PULSE RINGS ── */}
        {isBoss && isAvailable && (
          <>
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ inset: -40, border: `2px solid ${theme.color}55` }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.7, 0, 0.7] }}
              transition={{ duration: 2.5, repeat: Infinity }}
            />
            <motion.div
              className="absolute rounded-full pointer-events-none"
              style={{ inset: -24, border: `1px solid ${theme.color}80` }}
              animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
              transition={{ duration: 2.5, repeat: Infinity, delay: 0.9 }}
            />
          </>
        )}

        {/* ── NODE BODY ── */}
        <div className="relative" style={{ width: nodeSize, height: nodeSize }}>

          {/* Progress ring for IN_PROGRESS */}
          {isInProgress && zone.progressPercent > 0 && (
            <ProgressRing progress={zone.progressPercent} color={theme.color} size={nodeSize} />
          )}

          {/* Blurred glow behind (HTML layer, cheaper than SVG filter) */}
          {!isLocked && (
            <div
              className="absolute inset-0 blur-2xl opacity-35 pointer-events-none"
              style={{ background: theme.glow }}
            />
          )}

          {/* SVG node */}
          <svg
            width={nodeSize} height={nodeSize}
            viewBox="0 0 100 100"
            className="relative"
            style={isSelected ? { filter: `drop-shadow(0 0 14px ${theme.color})` } : undefined}
          >
            <defs>
              {/* Background gradient */}
              <radialGradient id={`bg-${uid}`} cx="40%" cy="32%" r="68%">
                <stop offset="0%"   stopColor={isLocked ? "#1a1a2e" : "#180a30"} />
                <stop offset="100%" stopColor={isLocked ? "#0d0d18" : "#05030f"} />
              </radialGradient>
              {/* Color tint overlay */}
              <radialGradient id={`tint-${uid}`} cx="50%" cy="28%" r="60%">
                <stop offset="0%"   stopColor={theme.color} stopOpacity={isLocked ? "0" : "0.14"} />
                <stop offset="100%" stopColor={theme.color} stopOpacity="0" />
              </radialGradient>
              {/* Subtle art glow */}
              <filter id={`art-glow-${uid}`} x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="1.8" result="b" />
                <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
              {/* Conquered gold filter */}
              <filter id={`gold-glow-${uid}`} x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="b" />
                <feFlood floodColor="#FCD34D" floodOpacity="0.7" result="c" />
                <feComposite in="c" in2="b" operator="in" result="g" />
                <feMerge><feMergeNode in="g" /><feMergeNode in="SourceGraphic" /></feMerge>
              </filter>
            </defs>

            {/* ── Outer decorative ring ── */}
            <polygon
              points={OCT}
              fill="none"
              stroke={isLocked ? "#1a1a2e" : `${theme.color}30`}
              strokeWidth="9"
            />

            {/* ── Main octagon body ── */}
            <polygon points={OCT} fill={`url(#bg-${uid})`} />
            <polygon points={OCT} fill={`url(#tint-${uid})`} />

            {/* ── Inner decorative ring ── */}
            {!isLocked && (
              <polygon points={OCT_INNER} fill="none" stroke={theme.color} strokeWidth="0.6" opacity="0.22" />
            )}

            {/* ── Octagon border ── */}
            <polygon
              points={OCT} fill="none"
              stroke={isLocked ? "#2d2d4a" : theme.color}
              strokeWidth={isSelected ? "2.8" : "1.9"}
              opacity={isLocked ? 0.4 : 0.85}
            />

            {/* ── Zone art ── */}
            <g filter={!isLocked ? `url(#art-glow-${uid})` : undefined}>
              <ZoneArt zoneType={zone.zoneType} color={theme.embers} isLocked={isLocked} />
            </g>

            {/* ── CONQUERED: victory seal ── */}
            {isConquered && (
              <g filter={`url(#gold-glow-${uid})`}>
                {/* Golden border */}
                <polygon points={OCT} fill="none" stroke="#FCD34D" strokeWidth="2.5" opacity="0.7" />
                {/* Victory star */}
                <path
                  d="M50,32 L53.5,43 L66,43 L56,50.5 L59.5,62 L50,55 L40.5,62 L44,50.5 L34,43 L46.5,43 Z"
                  fill="#FCD34D" opacity="0.92"
                />
              </g>
            )}

            {/* ── LOCKED: padlock ── */}
            {isLocked && (
              <g>
                <rect x="36" y="40" width="28" height="22" rx="4" fill="#0f0f1a" stroke="#2d2d4a" strokeWidth="1.5" />
                <path d="M 42,40 Q 42,29 50,29 Q 58,29 58,40"
                  fill="none" stroke="#2d2d4a" strokeWidth="2.8" strokeLinecap="round" />
                <circle cx="50" cy="51" r="3.5" fill="#374151" />
                <rect x="48.5" y="51" width="3" height="6" rx="1.5" fill="#374151" />
              </g>
            )}

            {/* ── IN_PROGRESS: crossed swords badge ── */}
            {isInProgress && (
              <g>
                <circle cx="83" cy="17" r="11" fill="#1D4ED8" />
                <circle cx="83" cy="17" r="11" fill="none" stroke="#60A5FA" strokeWidth="1.5" />
                <line x1="78" y1="12" x2="88" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
                <line x1="88" y1="12" x2="78" y2="22" stroke="white" strokeWidth="2.2" strokeLinecap="round" />
              </g>
            )}
          </svg>
        </div>

        {/* ── LABEL ── */}
        <motion.div
          className="mt-3 flex flex-col items-center gap-1.5 pointer-events-none"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <div
            className="px-3.5 py-2 rounded-xl text-center"
            style={{
              background: "linear-gradient(135deg,rgba(4,4,20,0.94) 0%,rgba(8,4,28,0.90) 100%)",
              border: `1px solid ${isLocked ? "rgba(255,255,255,0.05)" : `${theme.color}45`}`,
              backdropFilter: "blur(18px)",
              boxShadow: isSelected
                ? `0 0 24px ${theme.glow}, 0 4px 20px rgba(0,0,0,0.6)`
                : "0 4px 20px rgba(0,0,0,0.6)",
              minWidth: 118,
            }}
          >
            <p
              className="text-[8px] font-black uppercase tracking-[0.22em] mb-0.5"
              style={{ color: isLocked ? "#374151" : theme.color }}
            >
              {isBoss ? "GRANDE CHEFE" : `${theme.tier} · ${theme.label}`}
            </p>
            <p className="text-[12px] font-black text-white leading-tight tracking-tight">
              {zone.name}
            </p>
          </div>

          {/* Difficulty dots */}
          {!isLocked && (
            <div className="flex gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: i < zone.difficultyLevel ? theme.color : "rgba(255,255,255,0.08)",
                    boxShadow: i < zone.difficultyLevel ? `0 0 5px ${theme.color}` : "none",
                  }}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.35 + i * 0.06, type: "spring" }}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
}
