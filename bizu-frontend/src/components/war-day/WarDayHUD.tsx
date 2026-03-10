"use client";

import { motion } from "framer-motion";
import { Clock, Trophy, Map, Users, Swords, ChevronDown } from "lucide-react";
import { GuildMapState, WarDayEvent } from "@/lib/warDayService";

interface WarDayHUDProps {
  event: WarDayEvent;
  mapState: GuildMapState | null;
  timeRemaining: number;
  participantCount?: number;
  onToggleRanking: () => void;
  showRanking: boolean;
}

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function TimerBadge({ seconds }: { seconds: number }) {
  const isUrgent = seconds < 300; // < 5 min
  return (
    <motion.div
      className="flex items-center gap-2 px-4 py-2 rounded-xl font-mono font-bold text-lg"
      style={{
        background: isUrgent ? "rgba(239,68,68,0.15)" : "rgba(0,0,0,0.5)",
        border: `1px solid ${isUrgent ? "rgba(239,68,68,0.4)" : "rgba(255,255,255,0.1)"}`,
        color: isUrgent ? "#F87171" : "#F1F5F9",
      }}
      animate={isUrgent ? { scale: [1, 1.03, 1] } : {}}
      transition={{ duration: 1, repeat: Infinity }}
    >
      <Clock size={18} className={isUrgent ? "text-red-400" : "text-gray-400"} />
      {formatTime(seconds)}
    </motion.div>
  );
}

export default function WarDayHUD({
  event, mapState, timeRemaining, participantCount, onToggleRanking, showRanking,
}: WarDayHUDProps) {
  const totalZones = mapState?.zones.length ?? 0;
  const conquered = mapState?.zonesConquered ?? 0;
  const progressPercent = totalZones > 0 ? (conquered / totalZones) * 100 : 0;

  return (
    <div className="flex flex-wrap items-center gap-3 px-4 py-3 w-full"
      style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>

      {/* Event title */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
          <Swords size={18} className="text-red-400" />
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wider">War Day</p>
          <p className="text-sm font-bold text-white leading-tight truncate max-w-[120px]">{event.title}</p>
        </div>
      </div>

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      {/* Timer */}
      <TimerBadge seconds={timeRemaining} />

      <div className="h-8 w-px bg-white/10 hidden sm:block" />

      {/* Guild score */}
      {mapState && (
        <div className="flex items-center gap-2">
          <Trophy size={16} className="text-yellow-400" />
          <div>
            <p className="text-xs text-gray-500">Pontuação</p>
            <p className="text-sm font-bold text-yellow-400">
              {mapState.totalScore.toLocaleString("pt-BR")} pts
            </p>
          </div>
        </div>
      )}

      {/* Zone progress */}
      {mapState && totalZones > 0 && (
        <div className="flex items-center gap-2">
          <Map size={16} className="text-indigo-400" />
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <p className="text-xs text-gray-500">Zonas</p>
              <p className="text-xs font-bold text-indigo-300">{conquered}/{totalZones}</p>
            </div>
            <div className="w-20 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-indigo-500"
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Participants */}
      {participantCount !== undefined && (
        <div className="flex items-center gap-1.5">
          <Users size={14} className="text-gray-400" />
          <span className="text-xs text-gray-400">{participantCount} guilds</span>
        </div>
      )}

      {/* Ranking toggle */}
      <button
        onClick={onToggleRanking}
        className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:scale-105"
        style={{
          background: showRanking ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
          border: showRanking ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
          color: showRanking ? "#818CF8" : "#94A3B8",
        }}
      >
        <Trophy size={14} />
        <span>Ranking</span>
        <ChevronDown
          size={12}
          style={{ transform: showRanking ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
        />
      </button>
    </div>
  );
}
