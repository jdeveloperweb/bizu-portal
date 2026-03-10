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

function MapBackground() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#050510]">
      {/* Precision Technical Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="smallGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99,102,241,0.2)" strokeWidth="0.5" />
          </pattern>
          <pattern id="mainGrid" width="100" height="100" patternUnits="userSpaceOnUse">
            <rect width="100" height="100" fill="url(#smallGrid)" />
            <path d="M 100 0 L 0 0 0 100" fill="none" stroke="rgba(99,102,241,0.4)" strokeWidth="1" />
          </pattern>
          <filter id="technicalGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="url(#mainGrid)" />

        {/* Decorative corner markers */}
        <g stroke="rgba(99,102,241,0.6)" strokeWidth="2" fill="none" filter="url(#technicalGlow)">
          <path d="M 40 40 L 10 40 L 10 10 L 40 10" transform="translate(20, 20)" />
          <path d="M 40 40 L 10 40 L 10 10 L 40 10" transform="translate(calc(100% - 60px), 20) rotate(90 25 25)" />
          <path d="M 40 40 L 10 40 L 10 10 L 40 10" transform="translate(calc(100% - 60px), calc(100% - 60px)) rotate(180 25 25)" />
          <path d="M 40 40 L 10 40 L 10 10 L 40 10" transform="translate(20, calc(100% - 60px)) rotate(270 25 25)" />
        </g>
      </svg>

      {/* Animated Scanning Beam */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-500/5 to-transparent h-[40%] w-full"
        animate={{ translateY: ['-100%', '300%'] }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      />

      {/* Deep Space Background Layer */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(13,18,32,0)_0%,rgba(5,7,12,0.8)_100%)] pointer-events-none" />

      {/* Technical HUD Elements around nodes */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] border-[2px] border-dashed border-indigo-500/30 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] border-[1px] border-indigo-500/20 rounded-full" />
      </div>
    </div>
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
