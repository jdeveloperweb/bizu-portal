"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoneState } from "@/lib/warDayService";
import WarZoneNode from "./WarZoneNode";
import WarPathSVG from "./WarPathSVG";
import { Sword, Shield, Crown, Flame, ChevronRight, Clock, Star, X, Map, AlertTriangle } from "lucide-react";

interface WarMapProps {
  zones: ZoneState[];
  onZoneClick: (zone: ZoneState) => void;
  guildName: string;
  totalScore: number;
}

// Terrain patches for visual variety
const TERRAIN_PATCHES = [
  { cx: 15, cy: 20, rx: 12, ry: 6, fill: "rgba(34,85,34,0.3)", label: "forest" },
  { cx: 80, cy: 15, rx: 8, ry: 4, fill: "rgba(34,85,34,0.25)", label: "forest2" },
  { cx: 70, cy: 75, rx: 10, ry: 5, fill: "rgba(60,45,30,0.3)", label: "mountains" },
  { cx: 25, cy: 70, rx: 9, ry: 4, fill: "rgba(20,60,80,0.25)", label: "swamp" },
  { cx: 50, cy: 50, rx: 6, ry: 3, fill: "rgba(50,30,10,0.2)", label: "ruins" },
  { cx: 90, cy: 50, rx: 7, ry: 5, fill: "rgba(60,45,30,0.2)", label: "rocks" },
];

function MapBackground() {
  return (
    <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="mapBg" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1a0a2e"/>
          <stop offset="60%" stopColor="#0d1220"/>
          <stop offset="100%" stopColor="#050810"/>
        </radialGradient>
        <pattern id="hexGrid" x="0" y="0" width="40" height="35" patternUnits="userSpaceOnUse">
          <polygon
            points="20,0 40,10 40,25 20,35 0,25 0,10"
            fill="none"
            stroke="rgba(99,102,241,0.06)"
            strokeWidth="0.5"
          />
        </pattern>
        <filter id="fogBlur">
          <feGaussianBlur stdDeviation="8"/>
        </filter>
        <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
          <stop offset="40%" stopColor="transparent"/>
          <stop offset="100%" stopColor="rgba(0,0,0,0.7)"/>
        </radialGradient>
      </defs>

      {/* Base dark background */}
      <rect width="100%" height="100%" fill="url(#mapBg)"/>

      {/* Hex grid overlay */}
      <rect width="100%" height="100%" fill="url(#hexGrid)" opacity="0.5"/>

      {/* Terrain patches */}
      {TERRAIN_PATCHES.map((t) => (
        <ellipse
          key={t.label}
          cx={`${t.cx}%`}
          cy={`${t.cy}%`}
          rx={`${t.rx}%`}
          ry={`${t.ry}%`}
          fill={t.fill}
          filter="url(#fogBlur)"
        />
      ))}

      {/* Atmospheric fog patches */}
      <ellipse cx="30%" cy="40%" rx="20%" ry="15%" fill="rgba(99,102,241,0.04)" filter="url(#fogBlur)"/>
      <ellipse cx="70%" cy="60%" rx="15%" ry="12%" fill="rgba(167,139,250,0.04)" filter="url(#fogBlur)"/>

      {/* Vignette */}
      <rect width="100%" height="100%" fill="url(#vignette)"/>

      {/* Decorative border runes */}
      <rect x="8" y="8" width="calc(100% - 16px)" height="calc(100% - 16px)"
        fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="1" rx="8"/>
      <rect x="12" y="12" width="calc(100% - 24px)" height="calc(100% - 24px)"
        fill="none" stroke="rgba(99,102,241,0.08)" strokeWidth="0.5" rx="6"/>
    </svg>
  );
}

function ZoneDetailModal({ zone, onClose, onEnter }: {
  zone: ZoneState;
  onClose: () => void;
  onEnter: (zone: ZoneState) => void;
}) {
  const ZONE_COLORS: Record<string, string> = {
    CAMP: "#F59E0B", WATCHTOWER: "#22D3EE",
    FORTRESS: "#A78BFA", CASTLE: "#C084FC", BOSS: "#F87171",
  };
  const color = ZONE_COLORS[zone.zoneType] ?? "#6366F1";
  const isConquered = zone.status === "CONQUERED";
  const isAvailable = zone.status === "AVAILABLE" || zone.status === "IN_PROGRESS";
  const required = Math.ceil(zone.questionCount * 0.7);

  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center z-40"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <motion.div
        className="relative w-80 max-w-[calc(100vw-2rem)] rounded-2xl border p-5 sm:p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #0d1220 0%, #1a0a2e 100%)",
          borderColor: color,
          boxShadow: `0 0 30px 5px ${color}40`,
        }}
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>

        {/* Zone type badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ background: `${color}22`, border: `2px solid ${color}` }}>
            {zone.zoneType === "BOSS" ? <Flame size={24} color={color} /> :
             zone.zoneType === "CASTLE" ? <Crown size={24} color={color} /> :
             zone.zoneType === "FORTRESS" ? <Shield size={24} color={color} /> :
             <Sword size={24} color={color} />}
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color }}>
              {zone.zoneType === "BOSS" ? "⚔️ Chefe Final" :
               zone.zoneType === "CASTLE" ? "Castelo" :
               zone.zoneType === "FORTRESS" ? "Fortaleza" :
               zone.zoneType === "WATCHTOWER" ? "Torre de Vigia" : "Acampamento"}
            </p>
            <h3 className="text-xl font-bold">{zone.name}</h3>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg p-2.5" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-xs text-gray-400 mb-1">Questões para conquistar</p>
            <p className="text-lg font-bold" style={{ color }}>{required}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-xs text-gray-400 mb-1">Pontos por acerto</p>
            <p className="text-lg font-bold" style={{ color }}>+{zone.pointsPerCorrect}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-xs text-gray-400 mb-1">Dificuldade</p>
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({ length: zone.difficultyLevel }).map((_, i) => (
                <Star key={i} size={14} fill={color} color={color} />
              ))}
            </div>
          </div>
          <div className="rounded-lg p-3" style={{ background: "rgba(255,255,255,0.05)" }}>
            <p className="text-xs text-gray-400 mb-1">Progresso da guild</p>
            <p className="text-base font-bold text-white">{zone.correctAnswers} / {required}</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Progresso de conquista</span>
            <span>{Math.round(zone.progressPercent)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full"
              style={{ background: color }}
              initial={{ width: 0 }}
              animate={{ width: `${zone.progressPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Action button */}
        {isConquered ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-900/40 border border-emerald-500/40">
            <Shield size={18} className="text-emerald-400" />
            <span className="text-emerald-400 font-semibold">Zona Conquistada!</span>
          </div>
        ) : isAvailable ? (
          <button
            onClick={() => onEnter(zone)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-black transition-all hover:scale-105 active:scale-95"
            style={{ background: color }}
          >
            <Sword size={18} />
            <span>Entrar na Batalha</span>
            <ChevronRight size={18} />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-800/60 border border-gray-700">
            <span className="text-gray-400 text-sm">Complete as zonas anteriores</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

export default function WarMap({ zones, onZoneClick, guildName, totalScore }: WarMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [selectedZone, setSelectedZone] = useState<ZoneState | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      const rect = entries[0].contentRect;
      setDims({ w: rect.width, h: rect.height });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleZoneClick = useCallback((zone: ZoneState) => {
    setSelectedZone(zone);
  }, []);

  const handleEnter = useCallback((zone: ZoneState) => {
    setSelectedZone(null);
    onZoneClick(zone);
  }, [onZoneClick]);

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden rounded-2xl"
      style={{ minHeight: 480 }}
    >
      {/* RPG Map Background */}
      <MapBackground />

      {zones.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3 px-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.3)" }}>
            <AlertTriangle size={30} className="text-indigo-400" />
          </div>
          <p className="text-gray-300 font-semibold text-base">Nenhuma zona configurada</p>
          <p className="text-gray-600 text-sm max-w-xs">
            Este evento não possui um mapa de batalha. Um administrador precisa vincular um template de mapa ao evento.
          </p>
        </div>
      ) : (
        <>
          {/* Paths between zones */}
          {dims.w > 0 && (
            <WarPathSVG
              zones={zones}
              containerWidth={dims.w}
              containerHeight={dims.h}
            />
          )}

          {/* Zone nodes */}
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

          {/* Zone detail modal */}
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

      {/* Guild name watermark */}
      <div className="absolute bottom-4 left-4 flex items-center gap-2 z-10">
        <div className="px-3 py-1.5 rounded-lg text-xs font-semibold"
          style={{ background: "rgba(0,0,0,0.6)", color: "#6366F1", border: "1px solid rgba(99,102,241,0.3)" }}>
          <span className="text-gray-400">Guilda: </span>
          <span>{guildName}</span>
        </div>
        <div className="px-3 py-1.5 rounded-lg text-xs font-bold"
          style={{ background: "rgba(0,0,0,0.6)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.3)" }}>
          {totalScore.toLocaleString("pt-BR")} pts
        </div>
      </div>

    </div>
  );
}
