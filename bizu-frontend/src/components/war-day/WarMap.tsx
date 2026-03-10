"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoneState } from "@/lib/warDayService";
import WarZoneNode from "./WarZoneNode";
import WarPathSVG from "./WarPathSVG";
import {
  Sword, Shield, Crown, Flame, ChevronRight,
  Star, X, AlertTriangle, Swords,
} from "lucide-react";

interface WarMapProps {
  zones: ZoneState[];
  onZoneClick: (zone: ZoneState) => void;
  guildName: string;
  totalScore: number;
}

// ── Map background ────────────────────────────────────────────────────────────

// Fixed star positions (avoids Math.random hydration mismatch)
const STARS: Array<{ x: number; y: number; r: number; o: number }> = [
  // Bright anchor stars
  { x: 90, y: 65, r: 1.6, o: 0.50 }, { x: 1085, y: 95, r: 1.7, o: 0.46 },
  { x: 48, y: 392, r: 1.4, o: 0.42 }, { x: 1142, y: 518, r: 1.5, o: 0.44 },
  { x: 552, y: 35, r: 1.5, o: 0.42 }, { x: 278, y: 640, r: 1.3, o: 0.36 },
  { x: 858, y: 620, r: 1.4, o: 0.40 },
  // Medium stars
  { x: 168, y: 155, r: 0.9, o: 0.32 }, { x: 418, y: 108, r: 1.0, o: 0.30 },
  { x: 718, y: 85, r: 0.8, o: 0.28 }, { x: 922, y: 190, r: 1.1, o: 0.32 },
  { x: 1028, y: 318, r: 0.9, o: 0.26 }, { x: 1118, y: 398, r: 0.8, o: 0.24 },
  { x: 962, y: 478, r: 1.0, o: 0.28 }, { x: 842, y: 538, r: 0.9, o: 0.26 },
  { x: 682, y: 582, r: 0.8, o: 0.24 }, { x: 498, y: 622, r: 1.0, o: 0.26 },
  { x: 382, y: 578, r: 0.9, o: 0.24 }, { x: 218, y: 548, r: 0.8, o: 0.22 },
  { x: 118, y: 478, r: 1.0, o: 0.26 }, { x: 78, y: 278, r: 0.9, o: 0.24 },
  { x: 142, y: 198, r: 0.8, o: 0.22 },
  // Small distant stars
  { x: 308, y: 178, r: 0.6, o: 0.18 }, { x: 462, y: 198, r: 0.5, o: 0.16 },
  { x: 578, y: 155, r: 0.6, o: 0.18 }, { x: 678, y: 198, r: 0.5, o: 0.15 },
  { x: 782, y: 158, r: 0.6, o: 0.17 }, { x: 842, y: 278, r: 0.5, o: 0.15 },
  { x: 902, y: 358, r: 0.6, o: 0.16 }, { x: 958, y: 418, r: 0.5, o: 0.15 },
  { x: 822, y: 458, r: 0.6, o: 0.16 }, { x: 742, y: 518, r: 0.5, o: 0.15 },
  { x: 638, y: 498, r: 0.6, o: 0.16 }, { x: 542, y: 538, r: 0.5, o: 0.15 },
  { x: 438, y: 508, r: 0.6, o: 0.16 }, { x: 338, y: 478, r: 0.5, o: 0.15 },
  { x: 258, y: 438, r: 0.6, o: 0.16 }, { x: 178, y: 398, r: 0.5, o: 0.15 },
  { x: 158, y: 338, r: 0.6, o: 0.17 }, { x: 198, y: 278, r: 0.5, o: 0.15 },
  { x: 262, y: 238, r: 0.6, o: 0.16 }, { x: 358, y: 258, r: 0.5, o: 0.15 },
  { x: 478, y: 278, r: 0.4, o: 0.13 }, { x: 598, y: 258, r: 0.5, o: 0.15 },
  { x: 698, y: 298, r: 0.4, o: 0.13 }, { x: 782, y: 358, r: 0.5, o: 0.15 },
  { x: 862, y: 418, r: 0.4, o: 0.13 }, { x: 1048, y: 222, r: 0.5, o: 0.14 },
  { x: 188, y: 92, r: 0.5, o: 0.14 }, { x: 382, y: 72, r: 0.4, o: 0.13 },
];

// Constellation line pairs (indices into STARS)
const CONSTELLATION_PAIRS = [
  [0, 7], [7, 22], [0, 22], [22, 23], [4, 8], [8, 23], [8, 25],
  [3, 11], [11, 12], [11, 10], [2, 19], [19, 20], [19, 18],
  [6, 14], [14, 15], [15, 16], [5, 16], [1, 10], [10, 11],
  [13, 14], [13, 31], [0, 48], [4, 49], [1, 47],
];

// Astrolabe radial line endpoints (pre-computed, 24 lines every 15°)
const ASTRO_LINES = Array.from({ length: 24 }, (_, i) => {
  const a = (i * Math.PI * 2) / 24;
  return {
    x1: 400 + 65 * Math.cos(a), y1: 400 + 65 * Math.sin(a),
    x2: 400 + 355 * Math.cos(a), y2: 400 + 355 * Math.sin(a),
    major: i % 3 === 0,
  };
});

// Astrolabe tick marks on outer ring (72 ticks every 5°)
const ASTRO_TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * Math.PI * 2) / 72;
  const inner = i % 6 === 0 ? 340 : i % 3 === 0 ? 348 : 353;
  return {
    x1: 400 + inner * Math.cos(a), y1: 400 + inner * Math.sin(a),
    x2: 400 + 360 * Math.cos(a), y2: 400 + 360 * Math.sin(a),
    major: i % 6 === 0,
  };
});

function MapBackground() {
  return (
    <div
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      style={{ background: "#0b081a", zIndex: 0 }}
    >

      {/* ── 1. Micro-grain stone texture ── */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.20] mix-blend-soft-light">
        <filter id="mbg-grain">
          <feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mbg-grain)" />
      </svg>

      {/* ── 2. Void colour clouds — static, slightly visible ── */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 70% 60% at 50% 10%, rgba(67,56,202,0.3) 0%, transparent 100%)",
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 60% 50% at 90% 90%, rgba(124,58,237,0.25) 0%, transparent 100%)",
      }} />
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse 55% 45% at 10% 80%, rgba(79,70,229,0.28) 0%, transparent 100%)",
      }} />

      {/* ── 3. Star field + constellation lines ── */}
      <svg
        className="absolute inset-0 w-full h-full"
        viewBox="0 0 1200 700"
        preserveAspectRatio="xMidYMid slice"
      >
        {/* Constellation lines — very faint */}
        {CONSTELLATION_PAIRS.map(([a, b], i) =>
          STARS[a] && STARS[b] ? (
            <line
              key={i}
              x1={STARS[a].x} y1={STARS[a].y}
              x2={STARS[b].x} y2={STARS[b].y}
              stroke="rgba(99,102,241,0.10)"
              strokeWidth="0.5"
            />
          ) : null
        )}
        {/* Stars */}
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="white" opacity={s.o} />
        ))}
      </svg>

      {/* ── 4. Astrolabe / polar navigation chart — very slow rotation ── */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{ rotate: 360 }}
        transition={{ duration: 200, repeat: Infinity, ease: "linear" }}
        style={{ opacity: 0.35 }}
      >
        <svg viewBox="0 0 800 800" style={{ width: "min(112%, 112vh)", height: "min(112%, 112vh)" }}>
          {/* Concentric rings */}
          <circle cx="400" cy="400" r="360" fill="none" stroke="#6D28D9" strokeWidth="0.7" strokeDasharray="5 22" />
          <circle cx="400" cy="400" r="292" fill="none" stroke="#5B21B6" strokeWidth="0.45" />
          <circle cx="400" cy="400" r="212" fill="none" stroke="#5B21B6" strokeWidth="0.38" />
          <circle cx="400" cy="400" r="135" fill="none" stroke="#6D28D9" strokeWidth="0.38" strokeDasharray="3 9" />
          <circle cx="400" cy="400" r="65" fill="none" stroke="#5B21B6" strokeWidth="0.38" />
          <circle cx="400" cy="400" r="2.5" fill="#8B5CF6" opacity="0.6" />
          {/* Radial lines */}
          {ASTRO_LINES.map((l, i) => (
            <line
              key={i}
              x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
              stroke="#5B21B6"
              strokeWidth={l.major ? "0.55" : "0.28"}
              opacity={l.major ? 1 : 0.55}
            />
          ))}
          {/* Tick marks */}
          {ASTRO_TICKS.map((t, i) => (
            <line
              key={i}
              x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
              stroke="#6D28D9"
              strokeWidth={t.major ? "0.6" : "0.35"}
            />
          ))}
          {/* Cardinal direction diamonds */}
          {Array.from({ length: 4 }, (_, i) => {
            const a = (i * Math.PI * 2) / 4 - Math.PI / 2;
            const cx = 400 + 372 * Math.cos(a);
            const cy = 400 + 372 * Math.sin(a);
            return (
              <polygon
                key={i}
                points={`${cx},${cy - 6} ${cx + 4},${cy} ${cx},${cy + 6} ${cx - 4},${cy}`}
                fill="#8B5CF6" opacity="0.7"
              />
            );
          })}
          {/* Intercardinal dots */}
          {Array.from({ length: 4 }, (_, i) => {
            const a = ((i + 0.5) * Math.PI * 2) / 4 - Math.PI / 2;
            return (
              <circle
                key={i}
                cx={400 + 370 * Math.cos(a)}
                cy={400 + 370 * Math.sin(a)}
                r="2.5" fill="#6D28D9" opacity="0.6"
              />
            );
          })}
        </svg>
      </motion.div>

      {/* ── 5. Stardust — two slow-breathing offset layers ── */}
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.15, 0.4, 0.15] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage: "radial-gradient(circle, rgba(99,102,241,0.6) 1.5px, transparent 1.5px)",
          backgroundSize: "130px 130px",
        }}
      />
      <motion.div
        className="absolute inset-0"
        animate={{ opacity: [0.12, 0.3, 0.12] }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 5 }}
        style={{
          backgroundImage: "radial-gradient(circle, rgba(139,92,246,0.55) 1.5px, transparent 1.5px)",
          backgroundSize: "190px 190px",
          backgroundPosition: "65px 65px",
        }}
      />

      {/* ── 6. Lighter vignette — no completely dark edge ── */}
      <div className="absolute inset-0" style={{
        background: "radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(11,8,26,0.2) 80%, rgba(6,4,17,0.4) 100%)",
      }} />

      {/* ── 7. Inset edge shadow ── */}
      <div className="absolute inset-0" style={{ boxShadow: "inset 0 0 150px rgba(1,0,6,0.9)" }} />

      {/* ── 8. Thin inner frame ── */}
      <div
        className="absolute"
        style={{
          inset: 10,
          borderRadius: "1.75rem",
          border: "1px solid rgba(67,56,202,0.08)",
        }}
      />

      {/* ── 9. Corner sigil marks ── */}
      {([
        { top: 10, left: 10, rot: 0 },
        { top: 10, right: 10, rot: 90 },
        { bottom: 10, right: 10, rot: 180 },
        { bottom: 10, left: 10, rot: 270 },
      ] as Array<{ top?: number; bottom?: number; left?: number; right?: number; rot: number }>)
        .map(({ rot, ...pos }, i) => (
          <svg
            key={i}
            width="20" height="20"
            className="absolute"
            style={{ ...pos, opacity: 0.35, transform: `rotate(${rot}deg)` }}
            viewBox="0 0 20 20"
          >
            <path d="M 2,2 L 11,2 L 11,5 L 5,5 L 5,11 L 2,11 Z" fill="#6D28D9" />
            <circle cx="2" cy="2" r="1.5" fill="#8B5CF6" />
          </svg>
        ))}
    </div>
  );
}

// ── Zone type config (modal) ─────────────────────────────────────────────────

const MODAL_ZONE: Record<string, {
  color: string; icon: React.ReactNode; label: string;
  heroFrom: string; heroTo: string;
}> = {
  CAMP: { color: "#F59E0B", label: "Acampamento", heroFrom: "#2D1500", heroTo: "#0D0800", icon: <Sword size={36} /> },
  WATCHTOWER: { color: "#22D3EE", label: "Torre de Vigia", heroFrom: "#001A1F", heroTo: "#020A0D", icon: <Shield size={36} /> },
  FORTRESS: { color: "#A78BFA", label: "Fortaleza", heroFrom: "#130720", heroTo: "#060310", icon: <Shield size={36} /> },
  CASTLE: { color: "#C084FC", label: "Castelo", heroFrom: "#180825", heroTo: "#070312", icon: <Crown size={36} /> },
  BOSS: { color: "#F87171", label: "Fortaleza das Trevas", heroFrom: "#240808", heroTo: "#0D0303", icon: <Flame size={36} /> },
};

// ── Zone Detail Modal ────────────────────────────────────────────────────────

function ZoneDetailModal({
  zone, onClose, onEnter,
}: {
  zone: ZoneState;
  onClose: () => void;
  onEnter: (zone: ZoneState) => void;
}) {
  const cfg = MODAL_ZONE[zone.zoneType] ?? MODAL_ZONE.CAMP;
  const color = cfg.color;
  const isConquered = zone.status === "CONQUERED";
  const isAvailable = zone.status === "AVAILABLE" || zone.status === "IN_PROGRESS";
  const required = Math.ceil(zone.questionCount * 0.7);
  const progress = Math.min(zone.progressPercent, 100);
  const circ = 2 * Math.PI * 22;

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-md" style={{ background: "rgba(3,2,12,0.75)" }} />

      {/* Card */}
      <motion.div
        className="relative w-[340px] max-w-[calc(100vw-2rem)] rounded-2xl overflow-hidden text-white"
        style={{
          background: "linear-gradient(160deg, #0e0820 0%, #080414 100%)",
          border: `1px solid ${color}50`,
          boxShadow: `0 0 60px 12px ${color}18, 0 30px 60px rgba(0,0,0,0.8)`,
        }}
        initial={{ scale: 0.75, y: 50, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.8, y: 40, opacity: 0 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Hero header ── */}
        <div
          className="relative px-6 pt-7 pb-6 flex items-center gap-4"
          style={{ background: `linear-gradient(135deg, ${cfg.heroFrom} 0%, ${cfg.heroTo} 100%)` }}
        >
          {/* Radial glow behind icon */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 60px 50%, ${color}22 0%, transparent 65%)` }}
          />
          {/* Zone icon */}
          <div
            className="relative flex-none flex items-center justify-center rounded-xl"
            style={{
              width: 68, height: 68,
              background: `linear-gradient(135deg, ${color}28, ${color}0a)`,
              border: `1px solid ${color}60`,
              boxShadow: `0 0 24px ${color}30`,
              color,
            }}
          >
            {cfg.icon}
          </div>
          {/* Zone name */}
          <div className="relative min-w-0">
            <p
              className="text-[9px] font-black uppercase tracking-[0.25em] mb-1"
              style={{ color }}
            >
              {zone.zoneType === "BOSS" ? "⚔ Grande Chefe Final" : cfg.label}
            </p>
            <h3 className="text-xl font-black leading-tight tracking-tight text-white">{zone.name}</h3>
            {/* Difficulty pips */}
            <div className="flex gap-1 mt-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: i < zone.difficultyLevel ? color : "rgba(255,255,255,0.1)",
                    boxShadow: i < zone.difficultyLevel ? `0 0 5px ${color}` : "none",
                  }}
                />
              ))}
            </div>
          </div>
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 rounded-lg p-1.5 transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.4)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 gap-2 px-5 pt-4">
          {[
            { label: "Cota Mínima", value: `${required} acertos` },
            { label: "Recompensa", value: `+${zone.pointsPerCorrect} pts` },
            { label: "Total de Questões", value: zone.questionCount },
            { label: "Guild Status", value: `${zone.correctAnswers} / ${required}` },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="rounded-xl px-3 py-2.5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}
            >
              <p className="text-[8px] font-black uppercase tracking-widest text-gray-500 mb-1">{label}</p>
              <p className="text-sm font-black" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Conquest progress ── */}
        <div className="px-5 pt-4 pb-5">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
              Domínio da Área
            </span>
            <span className="text-sm font-black" style={{ color }}>{Math.round(progress)}%</span>
          </div>

          {/* RPG resource bar */}
          <div
            className="relative h-3 rounded-full overflow-hidden"
            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}99, ${color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            {/* Shimmer */}
            <motion.div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)",
                backgroundSize: "200% 100%",
              }}
              animate={{ backgroundPositionX: ["100%", "-100%"] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
            />
          </div>

          {/* Circular conquest ring (decorative) */}
          <div className="flex justify-center mt-4">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <circle cx="30" cy="30" r="22" fill="none" stroke={`${color}18`} strokeWidth="3" />
              <motion.circle
                cx="30" cy="30" r="22"
                fill="none"
                stroke={color}
                strokeWidth="3"
                strokeLinecap="round"
                transform="rotate(-90 30 30)"
                strokeDasharray={circ}
                initial={{ strokeDashoffset: circ }}
                animate={{ strokeDashoffset: circ * (1 - progress / 100) }}
                transition={{ duration: 1.3, ease: "easeOut" }}
                style={{ filter: `drop-shadow(0 0 4px ${color})` }}
              />
              <text
                x="30" y="34"
                textAnchor="middle"
                fill={color}
                fontSize="10"
                fontWeight="900"
                fontFamily="sans-serif"
              >
                {Math.round(progress)}%
              </text>
            </svg>
          </div>
        </div>

        {/* ── Divider ── */}
        <div className="mx-5 mb-4" style={{ height: 1, background: `linear-gradient(90deg, transparent, ${color}40, transparent)` }} />

        {/* ── Action ── */}
        <div className="px-5 pb-5">
          {isConquered ? (
            <div
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl"
              style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.3)" }}
            >
              <Shield size={18} className="text-emerald-400" />
              <span className="text-emerald-400 font-black text-sm uppercase tracking-wider">
                Vitória Conquistada
              </span>
            </div>
          ) : isAvailable ? (
            <motion.button
              onClick={() => onEnter(zone)}
              className="w-full relative flex items-center justify-center gap-2 py-4 rounded-xl font-black text-[13px] uppercase tracking-wider overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${color}dd, ${color})`,
                color: "#0d0d0d",
                boxShadow: `0 0 30px ${color}60`,
              }}
              whileHover={{ scale: 1.02, boxShadow: `0 0 40px ${color}90` }}
              whileTap={{ scale: 0.98 }}
            >
              {/* Shine sweep */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.3) 50%, transparent 70%)",
                  backgroundSize: "200% 100%",
                }}
                animate={{ backgroundPositionX: ["-100%", "300%"] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
              />
              <Swords size={18} className="relative z-10" />
              <span className="relative z-10">Lançar Ataque</span>
              <ChevronRight size={18} className="relative z-10" />
            </motion.button>
          ) : (
            <div
              className="flex items-center justify-center gap-2 py-3.5 rounded-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
                Caminho Bloqueado
              </span>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export default function WarMap({ zones, onZoneClick, guildName, totalScore }: WarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [selectedZone, setSelectedZone] = useState<ZoneState | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver((entries) => {
      const r = entries[0].contentRect;
      setDims({ w: r.width, h: r.height });
    });
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const handleZoneClick = useCallback((zone: ZoneState) => {
    setSelectedZone(zone);
  }, []);

  const handleEnter = useCallback((zone: ZoneState) => {
    setSelectedZone(null);
    onZoneClick(zone);
  }, [onZoneClick]);

  const conqueredCount = zones.filter((z) => z.status === "CONQUERED").length;

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl"
      style={{
        minHeight: 600,
        background: "#0b081a",
        border: "1px solid rgba(99,102,241,0.25)",
        boxShadow: "0 0 100px rgba(99,102,241,0.15), 0 30px 80px rgba(0,0,0,0.9)",
      }}
    >
      {zones.length === 0 ? (
        <>
          {/* Background visible even on empty map */}
          <MapBackground />
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-4 px-6 text-center">
            <motion.div
              className="w-24 h-24 rounded-2xl flex items-center justify-center"
              style={{
                background: "rgba(99,102,241,0.08)",
                border: "1px solid rgba(99,102,241,0.2)",
                boxShadow: "0 0 40px rgba(99,102,241,0.15)",
              }}
              animate={{ scale: [1, 1.04, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <AlertTriangle size={36} className="text-indigo-400" />
            </motion.div>
            <p className="text-gray-200 font-black text-xl uppercase tracking-tight">Mapa Vazio</p>
            <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
              As forças das trevas ainda não se organizaram. Um administrador deve definir as zonas de batalha.
            </p>
          </div>
        </>
      ) : (
        <>
          {/* ── Scrollable map canvas ──
              MapBackground lives INSIDE the inner canvas so it shares the same
              compositor tree as nodes and paths — avoids GPU-layer opacity bugs
              caused by overflow-x:auto siblings covering an absolutely-positioned
              background div. The outer div's background:#020109 covers any gaps. */}
          <style>{`.wm-scroll::-webkit-scrollbar{display:none}`}</style>
          <div
            className="wm-scroll absolute inset-0 overflow-x-auto overflow-y-hidden"
            style={{ scrollbarWidth: "none" } as React.CSSProperties}
          >
            <div className="relative h-full" style={{ width: "100%", minWidth: 900 }}>
              {/* Background is the FIRST child — paints below paths and nodes */}
              <MapBackground />

              {dims.w > 0 && (
                <WarPathSVG
                  zones={zones}
                  containerWidth={Math.max(dims.w, 900)}
                  containerHeight={dims.h}
                />
              )}
              <div className="absolute inset-0" style={{ zIndex: 2 }}>
                {zones.map((zone) => (
                  <WarZoneNode
                    key={zone.zoneId}
                    zone={zone}
                    onClick={handleZoneClick}
                    isSelected={selectedZone?.zoneId === zone.zoneId}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Modal sits outside the scroll div so it overlays the full container */}
          <AnimatePresence>
            {selectedZone && (
              <ZoneDetailModal
                zone={selectedZone}
                onClose={() => setSelectedZone(null)}
                onEnter={handleEnter}
              />
            )}
          </AnimatePresence>
        </>
      )}

      {/* ── HUD overlays ── */}
      {/* Mobile: 3-column grid spanning the bottom edge.
          md+: reverts to a left-anchored flex row (original desktop layout). */}
      <div className="absolute bottom-3 left-3 right-3 md:left-5 md:right-auto grid grid-cols-3 md:flex md:items-center md:w-auto gap-1.5 md:gap-2.5 z-10">
        {/* Guild name */}
        <motion.div
          className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-xl min-w-0"
          style={{
            background: "linear-gradient(135deg, rgba(5,3,20,0.85) 0%, rgba(8,4,28,0.85) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Shield size={12} className="text-indigo-400 flex-none" />
          <div className="flex flex-col items-start min-w-0">
            <span className="text-gray-500 uppercase tracking-widest text-[6px] md:text-[8px] font-black leading-none">Guilda</span>
            <span className="text-white text-[9px] md:text-xs font-black truncate max-w-[72px] md:max-w-none leading-tight">{guildName}</span>
          </div>
        </motion.div>

        {/* Score */}
        <motion.div
          className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(20,10,5,0.85) 0%, rgba(30,16,4,0.85) 100%)",
            border: "1px solid rgba(245,158,11,0.25)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.08)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Star size={12} className="text-amber-400 fill-amber-400 flex-none" />
          <div className="flex flex-col items-center">
            <span className="text-amber-400 text-[9px] md:text-xs font-black tracking-tight leading-none">
              {totalScore.toLocaleString("pt-BR")}
            </span>
            <span className="text-amber-700 text-[6px] md:text-[8px] font-black uppercase tracking-widest leading-none mt-0.5">pts</span>
          </div>
        </motion.div>

        {/* Conquered counter */}
        <motion.div
          className="flex items-center justify-center gap-1 md:gap-2 px-2 md:px-4 py-2 md:py-2.5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(4,12,8,0.85) 0%, rgba(5,18,10,0.85) 100%)",
            border: "1px solid rgba(16,185,129,0.2)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Crown size={12} className="text-emerald-400 flex-none" />
          <div className="flex flex-col items-center">
            <span className="text-emerald-400 text-[9px] md:text-xs font-black leading-none">
              {conqueredCount}/{zones.length}
            </span>
            <span className="text-emerald-800 text-[6px] md:text-[8px] font-black uppercase tracking-widest leading-none mt-0.5">zonas</span>
          </div>
        </motion.div>
      </div>

      {/* Top-right: event title watermark */}
      <div className="absolute top-5 right-5 z-10 pointer-events-none">
        <p
          className="text-[9px] font-black uppercase tracking-[0.3em] opacity-30"
          style={{ color: "#A78BFA" }}
        >
          War Day · Battle Map
        </p>
      </div>
    </div>
  );
}
