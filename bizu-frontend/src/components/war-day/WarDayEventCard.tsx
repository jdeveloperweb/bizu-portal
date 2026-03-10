"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Swords, Trophy, Clock, Flame, Shield, Calendar, ArrowRight, Zap } from "lucide-react";
import { WarDayEvent } from "@/lib/warDayService";

export function formatWarDayDate(iso: string) {
  return new Date(iso).toLocaleString("pt-BR", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
  });
}

function EventStatusBadge({ status }: { status: WarDayEvent["status"] }) {
  const config = {
    ACTIVE:    { label: "AO VIVO",    color: "#F87171", bg: "rgba(239,68,68,0.15)", pulse: true },
    UPCOMING:  { label: "EM BREVE",   color: "#FBBF24", bg: "rgba(245,158,11,0.15)", pulse: false },
    FINISHED:  { label: "ENCERRADO",  color: "#6B7280", bg: "rgba(107,114,128,0.1)", pulse: false },
    CANCELLED: { label: "CANCELADO",  color: "#6B7280", bg: "rgba(107,114,128,0.1)", pulse: false },
  }[status];

  return (
    <div
      className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
      style={{ background: config.bg, color: config.color }}
    >
      {config.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />}
      {config.label}
    </div>
  );
}

export default function WarDayEventCard({ event }: { event: WarDayEvent }) {
  const isActive = event.status === "ACTIVE";
  const isUpcoming = event.status === "UPCOMING";
  const isFinished = event.status === "FINISHED";
  const totalZones = event.mapTemplate?.zones.length ?? 0;

  return (
    <motion.div
      className="rounded-2xl border overflow-hidden transition-all"
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(127,29,29,0.3), rgba(10,0,16,0.9))"
          : "rgba(15,15,30,0.8)",
        borderColor: isActive
          ? "rgba(248,113,113,0.4)"
          : isUpcoming
          ? "rgba(245,158,11,0.3)"
          : "rgba(255,255,255,0.07)",
        boxShadow: isActive ? "0 0 40px rgba(239,68,68,0.15)" : "none",
      }}
      whileHover={
        !isFinished
          ? { y: -3, borderColor: isActive ? "rgba(248,113,113,0.7)" : "rgba(99,102,241,0.4)" }
          : {}
      }
      transition={{ duration: 0.2 }}
    >
      {/* Top accent */}
      {isActive && (
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #7F1D1D, #EF4444, #F59E0B)" }} />
      )}
      {isUpcoming && (
        <div className="h-1 w-full" style={{ background: "linear-gradient(90deg, #78350F, #F59E0B)" }} />
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <EventStatusBadge status={event.status} />
            </div>
            <h3 className="text-xl font-black text-white">{event.title}</h3>
            {event.description && (
              <p className="text-gray-400 text-sm mt-1 line-clamp-2">{event.description}</p>
            )}
          </div>
          <div
            className="w-12 h-12 rounded-xl flex-shrink-0 flex items-center justify-center"
            style={{
              background: isActive ? "rgba(239,68,68,0.2)" : "rgba(255,255,255,0.05)",
              border: `1px solid ${isActive ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.1)"}`,
            }}
          >
            {isActive ? <Flame size={24} className="text-red-400" /> :
             isUpcoming ? <Calendar size={24} className="text-yellow-400" /> :
             <Shield size={24} className="text-gray-500" />}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Clock size={14} className="text-gray-500 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Início</p>
            <p className="text-xs font-semibold text-white">{formatWarDayDate(event.startAt)}</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Zap size={14} className="text-yellow-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">XP por acerto</p>
            <p className="text-sm font-bold text-yellow-400">+{event.xpRewardPerCorrect}</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: "rgba(255,255,255,0.04)" }}>
            <Trophy size={14} className="text-indigo-400 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Zonas</p>
            <p className="text-sm font-bold text-indigo-400">{totalZones > 0 ? totalZones : "—"}</p>
          </div>
        </div>

        {/* Guild status */}
        {event.guildJoined && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl mb-4"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)" }}
          >
            <Shield size={14} className="text-indigo-400" />
            <span className="text-xs text-indigo-300 font-semibold">Sua guild está participando</span>
            {event.guildScore !== undefined && (
              <span className="ml-auto text-xs font-bold text-yellow-400">
                {event.guildScore.toLocaleString("pt-BR")} pts
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        {isActive && (
          <Link href={`/war-day/${event.id}`}>
            <button
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-base transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg, #7F1D1D, #EF4444)", color: "white" }}
            >
              <Swords size={20} />
              {event.guildJoined ? "Voltar à Batalha" : "Entrar na Guerra!"}
              <ArrowRight size={18} />
            </button>
          </Link>
        )}

        {isUpcoming && (
          <div
            className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold"
            style={{ background: "rgba(245,158,11,0.08)", color: "#F59E0B", border: "1px solid rgba(245,158,11,0.2)" }}
          >
            <Clock size={16} />
            Começa em {formatWarDayDate(event.startAt)}
          </div>
        )}

        {isFinished && (
          <Link href={`/war-day/${event.id}`}>
            <button
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-gray-400 hover:text-white transition-colors"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Ver Resultado
              <ArrowRight size={16} />
            </button>
          </Link>
        )}
      </div>
    </motion.div>
  );
}
