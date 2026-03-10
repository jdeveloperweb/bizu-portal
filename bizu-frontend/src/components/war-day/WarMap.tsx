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

// ── Epic map background ──────────────────────────────────────────────────────

function MapBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden" style={{ background: "#050310" }}>

      {/* SVG parchment/stone texture via fractalNoise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.18] mix-blend-overlay pointer-events-none">
        <filter id="mb-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.72" numOctaves="4" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#mb-noise)" />
      </svg>

      {/* Aurora pulse — top */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: "radial-gradient(ellipse 80% 45% at 50% -10%, rgba(99,102,241,0.28) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Aurora pulse — bottom right */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: "radial-gradient(ellipse 60% 40% at 85% 110%, rgba(248,113,113,0.18) 0%, transparent 65%)",
        }}
        animate={{ opacity: [0.3, 0.7, 0.3] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      {/* Aurora pulse — left */}
      <motion.div
        className="absolute pointer-events-none"
        style={{
          inset: 0,
          background: "radial-gradient(ellipse 50% 50% at -10% 60%, rgba(139,92,246,0.2) 0%, transparent 70%)",
        }}
        animate={{ opacity: [0.4, 0.9, 0.4] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 5 }}
      />

      {/* Ancient runic grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06] pointer-events-none">
        <defs>
          <pattern id="runicGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#7C3AED" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="2" fill="#7C3AED" />
            {/* Rune marks at cross-points */}
            <path d="M -4,0 L 4,0 M 0,-4 L 0,4" stroke="#A78BFA" strokeWidth="0.8" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#runicGrid)" />
      </svg>

      {/* Slowly rotating arcane circle — center */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        animate={{ rotate: 360 }}
        transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
      >
        <svg
          viewBox="0 0 600 600"
          style={{ width: "min(90vw, 90vh)", height: "min(90vw, 90vh)", opacity: 0.04 }}
        >
          <circle cx="300" cy="300" r="280" fill="none" stroke="#A78BFA" strokeWidth="1.5" strokeDasharray="8 18" />
          <circle cx="300" cy="300" r="240" fill="none" stroke="#7C3AED" strokeWidth="0.8" />
          {/* Octagram points */}
          {Array.from({ length: 8 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 8 - Math.PI / 2;
            return (
              <line
                key={i}
                x1={300 + 240 * Math.cos(angle)}
                y1={300 + 240 * Math.sin(angle)}
                x2="300" y2="300"
                stroke="#6D28D9" strokeWidth="0.6"
              />
            );
          })}
          <circle cx="300" cy="300" r="180" fill="none" stroke="#A78BFA" strokeWidth="0.5" strokeDasharray="3 12" />
        </svg>
      </motion.div>

      {/* Counter-rotating inner circle */}
      <motion.div
        className="absolute pointer-events-none"
        style={{ inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
        animate={{ rotate: -360 }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      >
        <svg
          viewBox="0 0 400 400"
          style={{ width: "min(60vw, 60vh)", height: "min(60vw, 60vh)", opacity: 0.05 }}
        >
          <circle cx="200" cy="200" r="185" fill="none" stroke="#F59E0B" strokeWidth="0.8" strokeDasharray="5 25" />
          {Array.from({ length: 6 }).map((_, i) => {
            const angle = (i * Math.PI * 2) / 6;
            const x = 200 + 185 * Math.cos(angle);
            const y = 200 + 185 * Math.sin(angle);
            return <circle key={i} cx={x} cy={y} r="3" fill="#F59E0B" opacity="0.7" />;
          })}
        </svg>
      </motion.div>

      {/* Floating ember particles */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.15, 0.35, 0.15] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
        style={{
          backgroundImage: "radial-gradient(circle, rgba(167,139,250,0.4) 1px, transparent 1px)",
          backgroundSize: "90px 90px",
        }}
      />
      <motion.div
        className="absolute inset-0 pointer-events-none"
        animate={{ opacity: [0.08, 0.2, 0.08] }}
        transition={{ duration: 11, repeat: Infinity, ease: "easeInOut", delay: 4 }}
        style={{
          backgroundImage: "radial-gradient(circle, rgba(245,158,11,0.3) 1px, transparent 1px)",
          backgroundSize: "140px 140px",
          backgroundPosition: "45px 45px",
        }}
      />

      {/* Scanning beam */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "linear-gradient(transparent 0%, rgba(99,102,241,0.06) 50%, transparent 100%)",
          backgroundSize: "100% 60px",
        }}
        animate={{ backgroundPositionY: ["0%", "100%"] }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
      />

      {/* Heavy vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at 50% 50%, transparent 25%, rgba(3,2,12,0.85) 100%)" }}
      />

      {/* Bottom fog */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(3,2,12,0.7) 0%, transparent 100%)" }}
      />

      {/* Ornate frame */}
      <div className="absolute inset-3 rounded-[2rem] pointer-events-none"
        style={{ border: "1px solid rgba(99,102,241,0.12)", boxShadow: "inset 0 0 80px rgba(0,0,0,0.7)" }}
      />
      {/* Corner ornaments */}
      {[
        { top: 12, left: 12 },
        { top: 12, right: 12 },
        { bottom: 12, left: 12 },
        { bottom: 12, right: 12 },
      ].map((pos, i) => (
        <svg
          key={i}
          width="28" height="28"
          className="absolute pointer-events-none opacity-20"
          style={{ ...pos }}
          viewBox="0 0 28 28"
        >
          <path d="M 2,2 L 14,2 L 14,6 L 6,6 L 6,14 L 2,14 Z" fill="#A78BFA" />
          <circle cx="2" cy="2" r="2" fill="#7C3AED" />
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
  CAMP:       { color: "#F59E0B", label: "Acampamento",         heroFrom: "#2D1500", heroTo: "#0D0800", icon: <Sword   size={36} /> },
  WATCHTOWER: { color: "#22D3EE", label: "Torre de Vigia",      heroFrom: "#001A1F", heroTo: "#020A0D", icon: <Shield  size={36} /> },
  FORTRESS:   { color: "#A78BFA", label: "Fortaleza",           heroFrom: "#130720", heroTo: "#060310", icon: <Shield  size={36} /> },
  CASTLE:     { color: "#C084FC", label: "Castelo",             heroFrom: "#180825", heroTo: "#070312", icon: <Crown   size={36} /> },
  BOSS:       { color: "#F87171", label: "Fortaleza das Trevas", heroFrom: "#240808", heroTo: "#0D0303", icon: <Flame   size={36} /> },
};

// ── Zone Detail Modal ────────────────────────────────────────────────────────

function ZoneDetailModal({
  zone, onClose, onEnter,
}: {
  zone: ZoneState;
  onClose: () => void;
  onEnter: (zone: ZoneState) => void;
}) {
  const cfg     = MODAL_ZONE[zone.zoneType] ?? MODAL_ZONE.CAMP;
  const color   = cfg.color;
  const isConquered  = zone.status === "CONQUERED";
  const isAvailable  = zone.status === "AVAILABLE" || zone.status === "IN_PROGRESS";
  const required     = Math.ceil(zone.questionCount * 0.7);
  const progress     = Math.min(zone.progressPercent, 100);
  const circ         = 2 * Math.PI * 22;

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
        border: "1px solid rgba(99,102,241,0.18)",
        boxShadow: "0 0 80px rgba(99,102,241,0.12), 0 30px 80px rgba(0,0,0,0.9)",
      }}
    >
      <MapBackground />

      {zones.length === 0 ? (
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
      ) : (
        <>
          {dims.w > 0 && (
            <WarPathSVG zones={zones} containerWidth={dims.w} containerHeight={dims.h} />
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
      <div className="absolute bottom-5 left-5 flex items-center gap-2.5 z-10 flex-wrap">
        {/* Guild name */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(5,3,20,0.85) 0%, rgba(8,4,28,0.85) 100%)",
            border: "1px solid rgba(99,102,241,0.2)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Shield size={14} className="text-indigo-400 flex-none" />
          <span className="text-gray-500 uppercase tracking-widest text-[8px] font-black">Guilda</span>
          <span className="text-white text-xs font-black">{guildName}</span>
        </motion.div>

        {/* Score */}
        <motion.div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
          style={{
            background: "linear-gradient(135deg, rgba(20,10,5,0.85) 0%, rgba(30,16,4,0.85) 100%)",
            border: "1px solid rgba(245,158,11,0.25)",
            backdropFilter: "blur(20px)",
            boxShadow: "0 4px 24px rgba(0,0,0,0.6), 0 0 20px rgba(245,158,11,0.08)",
          }}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Star size={14} className="text-amber-400 fill-amber-400 flex-none" />
          <span className="text-amber-400 text-xs font-black tracking-tight">
            {totalScore.toLocaleString("pt-BR")}
          </span>
          <span className="text-amber-700 text-[8px] font-black uppercase tracking-widest">pts</span>
        </motion.div>

        {/* Conquered counter */}
        {zones.length > 0 && (
          <motion.div
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl"
            style={{
              background: "linear-gradient(135deg, rgba(4,12,8,0.85) 0%, rgba(5,18,10,0.85) 100%)",
              border: "1px solid rgba(16,185,129,0.2)",
              backdropFilter: "blur(20px)",
              boxShadow: "0 4px 24px rgba(0,0,0,0.6)",
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Crown size={14} className="text-emerald-400 flex-none" />
            <span className="text-emerald-400 text-xs font-black">
              {conqueredCount}/{zones.length}
            </span>
            <span className="text-emerald-800 text-[8px] font-black uppercase tracking-widest">zonas</span>
          </motion.div>
        )}
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
