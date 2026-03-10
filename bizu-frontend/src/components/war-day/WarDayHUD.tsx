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
    <div
      className="w-full"
      style={{ background: "rgba(0,0,0,0.7)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
    >
      {/* Main row: always visible */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Icon + title */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
            style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>
            <Swords size={15} className="text-red-400" />
          </div>
          <p className="text-sm font-bold text-white truncate hidden xs:block sm:block">{event.title}</p>
        </div>

        {/* Timer — always visible */}
        <TimerBadge seconds={timeRemaining} />

        {/* Score (compact, mobile) */}
        {mapState && (
          <div className="flex items-center gap-1 sm:hidden">
            <Trophy size={13} className="text-yellow-400 flex-shrink-0" />
            <span className="text-xs font-bold text-yellow-400">{mapState.totalScore.toLocaleString("pt-BR")}</span>
          </div>
        )}

        {/* Ranking toggle */}
        <button
          onClick={onToggleRanking}
          className="flex-shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all active:scale-95"
          style={{
            background: showRanking ? "rgba(99,102,241,0.2)" : "rgba(255,255,255,0.06)",
            border: showRanking ? "1px solid rgba(99,102,241,0.4)" : "1px solid rgba(255,255,255,0.1)",
            color: showRanking ? "#818CF8" : "#94A3B8",
          }}
        >
          <Trophy size={13} />
          <span className="hidden sm:inline">Ranking</span>
          <ChevronDown
            size={12}
            style={{ transform: showRanking ? "rotate(180deg)" : "none", transition: "transform 0.2s" }}
          />
        </button>
      </div>

      {/* Secondary row: score + zones + participants on larger screens */}
      {mapState && (
        <div className="hidden sm:flex items-center gap-4 px-4 pb-2.5">
          <div className="h-px flex-1 bg-white/5" />

          <div className="flex items-center gap-1.5">
            <Trophy size={13} className="text-yellow-400" />
            <span className="text-xs text-gray-400">Pontuação</span>
            <span className="text-xs font-bold text-yellow-400">{mapState.totalScore.toLocaleString("pt-BR")} pts</span>
          </div>

          {totalZones > 0 && (
            <div className="flex items-center gap-2">
              <Map size={13} className="text-indigo-400" />
              <span className="text-xs text-gray-400">Zonas</span>
              <span className="text-xs font-bold text-indigo-300">{conquered}/{totalZones}</span>
              <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-indigo-500"
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            </div>
          )}

          {participantCount !== undefined && (
            <div className="flex items-center gap-1">
              <Users size={12} className="text-gray-500" />
              <span className="text-xs text-gray-500">{participantCount} guilds</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
