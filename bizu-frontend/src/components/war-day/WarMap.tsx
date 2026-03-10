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
    <div className="absolute inset-0 w-full h-full overflow-hidden bg-[#0d0d1a]">
      {/* Stone/Leather Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.25] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.6' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Deep Atmospheric Lighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_60%,rgba(5,5,15,0.8)_100%)]" />

      {/* Ancient Runic Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="ancientGrid" width="120" height="120" patternUnits="userSpaceOnUse">
            <path d="M 120 0 L 0 0 0 120" fill="none" stroke="#6366F1" strokeWidth="0.5" />
            <circle cx="0" cy="0" r="1.5" fill="#6366F1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#ancientGrid)" />
      </svg>

      {/* Floating Magic Embers */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="w-full h-full"
          animate={{ opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          style={{
            backgroundImage: 'radial-gradient(circle, rgba(167,139,250,0.3) 1px, transparent 1px)',
            backgroundSize: '120px 120px'
          }}
        />
      </div>

      {/* Dark Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,transparent_30%,rgba(5,5,15,1)_100%)] pointer-events-none" />

      {/* Decorative Border Frame */}
      <div className="absolute inset-4 border border-white/5 rounded-[2rem] pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]" />
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
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
      <motion.div
        className="relative w-80 max-w-[calc(100vw-2rem)] rounded-2xl border p-5 sm:p-6 text-white"
        style={{
          background: "linear-gradient(135deg, #0d1220 0%, #1a0a2e 100%)",
          borderColor: `${color}60`,
          boxShadow: `0 0 40px 10px ${color}20`,
        }}
        initial={{ scale: 0.8, y: 40 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 40 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-500 hover:text-white transition-colors">
          <X size={18} />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${color}33, ${color}11)`,
              border: `1px solid ${color}60`
            }}>
            {zone.zoneType === "BOSS" ? <Flame size={24} color={color} /> :
              zone.zoneType === "CASTLE" ? <Crown size={24} color={color} /> :
                zone.zoneType === "FORTRESS" ? <Shield size={24} color={color} /> :
                  <Sword size={24} color={color} />}
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color }}>
              {zone.zoneType === "BOSS" ? "⚔️ Chefe Final" :
                zone.zoneType === "CASTLE" ? "Castelo" :
                  zone.zoneType === "FORTRESS" ? "Fortaleza" :
                    zone.zoneType === "WATCHTOWER" ? "Torre de Vigia" : "Acampamento"}
            </p>
            <h3 className="text-xl font-black tracking-tight">{zone.name}</h3>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="rounded-lg p-2.5 bg-white/5 border border-white/5">
            <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Cota Mínima</p>
            <p className="text-lg font-black" style={{ color }}>{required}</p>
          </div>
          <div className="rounded-lg p-2.5 bg-white/5 border border-white/5">
            <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Recompensa</p>
            <p className="text-lg font-black" style={{ color }}>+{zone.pointsPerCorrect} pts</p>
          </div>
          <div className="rounded-lg p-2.5 bg-white/5 border border-white/5">
            <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Dificuldade</p>
            <div className="flex gap-0.5 mt-0.5">
              {Array.from({ length: zone.difficultyLevel }).map((_, i) => (
                <Star key={i} size={12} fill={color} color={color} />
              ))}
            </div>
          </div>
          <div className="rounded-lg p-2.5 bg-white/5 border border-white/5">
            <p className="text-[9px] text-gray-400 uppercase font-bold mb-1">Guild Status</p>
            <p className="text-base font-bold text-white leading-none mt-1">{zone.correctAnswers} / {required}</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-[10px] text-gray-400 font-bold mb-1 uppercase tracking-wider">
            <span>Domínio da Área</span>
            <span>{Math.round(zone.progressPercent)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
            <motion.div
              className="h-full rounded-full"
              style={{ background: `linear-gradient(90deg, ${color}aa, ${color})` }}
              initial={{ width: 0 }}
              animate={{ width: `${zone.progressPercent}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>

        {isConquered ? (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
            <Shield size={18} className="text-emerald-400" />
            <span className="text-emerald-400 font-black text-sm uppercase">Ponto de Vitória Garantido</span>
          </div>
        ) : isAvailable ? (
          <button
            onClick={() => onEnter(zone)}
            className="w-full group relative flex items-center justify-center gap-2 py-3.5 rounded-xl font-black text-black transition-all hover:scale-[1.02] active:scale-[0.98] overflow-hidden"
            style={{ background: color }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
            <Sword size={18} className="relative z-10" />
            <span className="relative z-10 uppercase text-sm tracking-wider">Lançar Ataque</span>
            <ChevronRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
          </button>
        ) : (
          <div className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-900/60 border border-gray-800">
            <span className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Caminho Bloqueado</span>
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
      className="relative w-full h-full overflow-hidden rounded-2xl shadow-2xl border border-white/5"
      style={{ minHeight: 600 }}
    >
      <MapBackground />

      {zones.length === 0 ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3 px-6 text-center">
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-indigo-500/10 border border-indigo-500/20 shadow-xl">
            <AlertTriangle size={32} className="text-indigo-400" />
          </div>
          <p className="text-gray-200 font-black text-lg uppercase tracking-tight">Mapa Vazio</p>
          <p className="text-gray-500 text-xs max-w-xs leading-relaxed">
            As forças do mal ainda não se organizaram. Um administrador deve definir as zonas de batalha para este evento.
          </p>
        </div>
      ) : (
        <>
          {dims.w > 0 && (
            <WarPathSVG
              zones={zones}
              containerWidth={dims.w}
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

      {/* Interface Overlays */}
      <div className="absolute bottom-6 left-6 flex items-center gap-3 z-10">
        <div className="px-4 py-2.5 rounded-xl text-xs font-black backdrop-blur-xl bg-black/40 border border-white/10 shadow-2xl flex items-center gap-2">
          <Shield size={14} className="text-indigo-400" />
          <span className="text-gray-500 uppercase tracking-widest text-[9px]">Fortaleza da Guilda:</span>
          <span className="text-white text-sm">{guildName}</span>
        </div>
        <div className="px-4 py-2.5 rounded-xl text-xs font-black backdrop-blur-xl bg-indigo-900/30 border border-indigo-500/30 shadow-2xl flex items-center gap-2">
          <Star size={14} className="text-amber-400 fill-amber-400" />
          <span className="text-amber-400 text-sm tracking-tight">{totalScore.toLocaleString("pt-BR")} ESPÓLIOS</span>
        </div>
      </div>
    </div>
  );
}
