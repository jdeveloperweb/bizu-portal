"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Plus, Swords, Clock, Play, Square, Trash2, Trophy, Edit3,
  BarChart2, Flame, Calendar, ChevronRight, AlertCircle, X,
} from "lucide-react";
import { AdminWarDayService, WarDayEvent, GuildRankingEntry } from "@/lib/warDayService";
import { useNotification } from "@/components/NotificationProvider";
import { Skeleton } from "@/components/ui/skeleton";

function StatusBadge({ status }: { status: WarDayEvent["status"] }) {
  const cfg = {
    ACTIVE:    { label: "Ativo",      color: "#4ADE80", bg: "rgba(74,222,128,0.1)" },
    UPCOMING:  { label: "Agendado",   color: "#FBBF24", bg: "rgba(245,158,11,0.1)" },
    FINISHED:  { label: "Encerrado",  color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
    CANCELLED: { label: "Cancelado",  color: "#6B7280", bg: "rgba(107,114,128,0.08)" },
  }[status];

  return (
    <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: cfg.color, background: cfg.bg }}>
      {cfg.label}
    </span>
  );
}

function RankingModal({ eventId, onClose }: { eventId: string; onClose: () => void }) {
  const [ranking, setRanking] = useState<GuildRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminWarDayService.getEventRankings(eventId)
      .then(setRanking)
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <motion.div
        className="w-full max-w-md rounded-2xl border bg-slate-900 border-white/10 overflow-hidden"
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <Trophy size={18} className="text-yellow-400" />
            <span className="font-bold text-white">Ranking do Evento</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X size={18} /></button>
        </div>
        <div className="p-4 space-y-2 max-h-80 overflow-y-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)
          ) : ranking.length === 0 ? (
            <p className="text-center text-gray-500 py-6 text-sm">Nenhuma guild participou</p>
          ) : (
            ranking.map((r) => (
              <div key={r.guildId} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-white/4">
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: r.position === 1 ? "rgba(245,158,11,0.2)" : "rgba(255,255,255,0.08)",
                           color: r.position === 1 ? "#F59E0B" : "#6B7280" }}>
                  {r.position}
                </span>
                <span className="flex-1 text-sm font-semibold text-white">{r.guildName}</span>
                <span className="text-xs text-gray-400">{r.zonesConquered} zonas</span>
                <span className="text-sm font-bold text-yellow-400">{r.totalScore.toLocaleString("pt-BR")} pts</span>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminWarDayPage() {
  const [events, setEvents] = useState<WarDayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [rankingModal, setRankingModal] = useState<string | null>(null);
  const { notify } = useNotification();

  const load = () => {
    setLoading(true);
    AdminWarDayService.listEvents()
      .then(setEvents)
      .catch(() => notify("Erro ao carregar eventos", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleStart = async (id: string) => {
    try {
      await AdminWarDayService.forceStart(id);
      notify("Evento iniciado!", "success");
      load();
    } catch (e: any) { notify(e.message ?? "Erro", "error"); }
  };

  const handleEnd = async (id: string) => {
    try {
      await AdminWarDayService.forceEnd(id);
      notify("Evento encerrado! XP distribuído.", "success");
      load();
    } catch (e: any) { notify(e.message ?? "Erro", "error"); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este evento?")) return;
    try {
      await AdminWarDayService.deleteEvent(id);
      notify("Evento excluído", "success");
      load();
    } catch (e: any) { notify(e.message ?? "Erro", "error"); }
  };

  return (
    <div className="p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-3">
            <Swords size={24} className="text-red-400" />
            War Day
          </h1>
          <p className="text-gray-400 text-sm mt-1">Gerencie os eventos de batalha entre guilds</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/war-day/map-templates">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-gray-300 border border-white/10 hover:border-white/20 transition-colors">
              <BarChart2 size={16} />
              Templates de Mapa
            </button>
          </Link>
          <Link href="/admin/war-day/novo">
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #7F1D1D, #EF4444)" }}>
              <Plus size={16} />
              Novo Evento
            </button>
          </Link>
        </div>
      </div>

      {/* Events list */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : events.length === 0 ? (
        <div className="rounded-2xl border border-white/7 p-12 text-center">
          <Swords size={40} className="text-gray-700 mx-auto mb-4" />
          <p className="text-gray-400 font-semibold mb-1">Nenhum evento criado</p>
          <p className="text-gray-600 text-sm mb-6">Crie seu primeiro War Day e veja as guilds em batalha!</p>
          <Link href="/admin/war-day/novo">
            <button className="px-6 py-2.5 rounded-xl text-sm font-bold text-white"
              style={{ background: "linear-gradient(135deg, #7F1D1D, #EF4444)" }}>
              Criar Evento
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <motion.div
              key={event.id}
              className="rounded-2xl border p-5"
              style={{
                background: event.status === "ACTIVE"
                  ? "linear-gradient(135deg, rgba(127,29,29,0.2), rgba(15,15,30,0.9))"
                  : "rgba(15,15,30,0.7)",
                borderColor: event.status === "ACTIVE"
                  ? "rgba(248,113,113,0.3)"
                  : "rgba(255,255,255,0.07)",
              }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <StatusBadge status={event.status} />
                    {event.status === "ACTIVE" && (
                      <span className="flex items-center gap-1 text-xs text-red-400 font-semibold">
                        <Flame size={12} />
                        Em andamento
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-white truncate">{event.title}</h3>
                  {event.description && (
                    <p className="text-gray-500 text-sm mt-0.5 truncate">{event.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {new Date(event.startAt).toLocaleDateString("pt-BR")} →{" "}
                      {new Date(event.endAt).toLocaleDateString("pt-BR")}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={12} />
                      {new Date(event.startAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    {event.mapTemplate && (
                      <span className="text-indigo-400">
                        Mapa: {event.mapTemplate.name} ({event.mapTemplate.zones.length} zonas)
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {event.status === "FINISHED" && (
                    <button
                      onClick={() => setRankingModal(event.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-yellow-400 border border-yellow-400/20 hover:bg-yellow-400/10 transition-colors"
                    >
                      <Trophy size={14} />
                      Ranking
                    </button>
                  )}

                  {event.status === "UPCOMING" && (
                    <button
                      onClick={() => handleStart(event.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-emerald-400 border border-emerald-400/20 hover:bg-emerald-400/10 transition-colors"
                    >
                      <Play size={14} />
                      Iniciar
                    </button>
                  )}

                  {event.status === "ACTIVE" && (
                    <button
                      onClick={() => handleEnd(event.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold text-red-400 border border-red-400/20 hover:bg-red-400/10 transition-colors"
                    >
                      <Square size={14} />
                      Encerrar
                    </button>
                  )}

                  {event.status !== "ACTIVE" && event.status !== "FINISHED" && (
                    <Link href={`/admin/war-day/${event.id}/editar`}>
                      <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gray-400 border border-white/10 hover:border-white/20 transition-colors">
                        <Edit3 size={14} />
                      </button>
                    </Link>
                  )}

                  {event.status !== "ACTIVE" && (
                    <button
                      onClick={() => handleDelete(event.id)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-red-400/60 border border-red-400/10 hover:border-red-400/30 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Ranking modal */}
      <AnimatePresence>
        {rankingModal && (
          <RankingModal eventId={rankingModal} onClose={() => setRankingModal(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
