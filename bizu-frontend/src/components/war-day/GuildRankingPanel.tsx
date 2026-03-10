"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Swords, ChevronRight, X } from "lucide-react";
import { GuildRankingEntry } from "@/lib/warDayService";
import { GuildBadge } from "@/components/guilds/GuildBadge";

interface GuildRankingPanelProps {
  ranking: GuildRankingEntry[];
  myGuildId?: string;
  onClose?: () => void;
}

const POSITION_STYLES: Record<number, { icon: React.ReactNode; color: string; bg: string }> = {
  1: { icon: <Crown size={16} />, color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
  2: { icon: <Medal size={16} />, color: "#94A3B8", bg: "rgba(148,163,184,0.1)" },
  3: { icon: <Medal size={16} />, color: "#CD7F32", bg: "rgba(205,127,50,0.1)" },
};

export default function GuildRankingPanel({ ranking, myGuildId, onClose }: GuildRankingPanelProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-yellow-400" />
          <span className="font-bold text-white text-sm">Ranking ao Vivo</span>
          <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
        </div>
        {onClose && (
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={16} />
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1 p-3">
        {ranking.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Nenhuma guild entrou ainda
          </div>
        ) : (
          ranking.map((entry, idx) => {
            const posStyle = POSITION_STYLES[entry.position];
            const isMe = entry.guildId === myGuildId;

            return (
              <motion.div
                key={entry.guildId}
                layout
                layoutId={entry.guildId}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all"
                style={{
                  background: isMe
                    ? "rgba(99,102,241,0.15)"
                    : posStyle?.bg ?? "rgba(255,255,255,0.04)",
                  border: isMe
                    ? "1px solid rgba(99,102,241,0.4)"
                    : posStyle
                    ? `1px solid ${posStyle.color}30`
                    : "1px solid transparent",
                }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                {/* Position */}
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
                  style={{
                    background: posStyle?.bg ?? "rgba(255,255,255,0.08)",
                    color: posStyle?.color ?? "#6B7280",
                  }}
                >
                  {posStyle ? posStyle.icon : entry.position}
                </div>

                {/* Guild badge */}
                {entry.guildBadge && (
                  <GuildBadge type={entry.guildBadge as any} size="sm" />
                )}

                {/* Guild info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1">
                    <p className={`text-sm font-semibold truncate ${isMe ? "text-indigo-300" : "text-white"}`}>
                      {entry.guildName}
                    </p>
                    {isMe && (
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 flex-shrink-0">
                        você
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-gray-500">
                      {entry.zonesConquered} zona{entry.zonesConquered !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {/* Score */}
                <div className="text-right flex-shrink-0">
                  <p
                    className="font-bold text-sm"
                    style={{ color: posStyle?.color ?? (isMe ? "#6366F1" : "#94A3B8") }}
                  >
                    {entry.totalScore.toLocaleString("pt-BR")}
                  </p>
                  <p className="text-xs text-gray-600">pts</p>
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* Footer note */}
      <div className="px-4 py-2 border-t border-white/10 text-center">
        <p className="text-xs text-gray-600">Atualizado em tempo real</p>
      </div>
    </div>
  );
}
