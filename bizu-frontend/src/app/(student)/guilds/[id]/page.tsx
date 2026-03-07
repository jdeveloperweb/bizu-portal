"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Zap, Trophy, Crown, Flame,
  Shield, Lock, Globe, Settings, UserPlus,
  MessageSquare, BookOpen, Layers, Target,
  Check, MoreVertical, ChevronRight, ChevronLeft,
  Upload, FileText, Video, Link2, Clock, Award,
  Bell, Sparkles, Calendar, Send, PenLine,
  CheckSquare, AlertCircle, RotateCcw, Eye, EyeOff,
  ListTodo, StickyNote,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { GuildBadge, GuildBadgeType } from "@/components/guilds/GuildBadge";
import {
  GuildService,
  GuildResponseDTO,
  GuildMemberDTO,
  GuildRequestDTO,
  GuildMaterialDTO,
  GuildMissionDTO,
  GuildActivityDTO,
  GuildMessageDTO,
  GuildNoteDTO,
  GuildTaskDTO,
  GuildFlashcardDeckDTO,
  GuildFlashcardDTO,
} from "@/lib/guildService";
import { useAuth } from "@/components/AuthProvider";
import { useNotification } from "@/components/NotificationProvider";
import { Skeleton } from "@/components/ui/skeleton";

// ─── Types ────────────────────────────────────────────────────────────────────

type GuildTab = "inicio" | "membros" | "materiais" | "flashcards" | "anotacoes" | "tarefas" | "ranking" | "missoes";

const TABS: { id: GuildTab; label: string; icon: React.ElementType }[] = [
  { id: "inicio",     label: "Início",      icon: Shield },
  { id: "membros",    label: "Membros",     icon: Users },
  { id: "materiais",  label: "Materiais",   icon: BookOpen },
  { id: "flashcards", label: "Flash Cards", icon: Layers },
  { id: "anotacoes",  label: "Anotações",   icon: StickyNote },
  { id: "tarefas",    label: "Tarefas",     icon: ListTodo },
  { id: "ranking",    label: "Rankings",    icon: Trophy },
  { id: "missoes",    label: "Missões",     icon: Target },
];

const leagueColors: Record<string, string> = {
  BRONZE: "#CD7F32", PRATA: "#C0C0C0", OURO: "#FFD700",
  DIAMANTE: "#B9F2FF", MESTRE: "#A855F7",
};

// ─── Shared sub-components ────────────────────────────────────────────────────

function MemberAvatar({ name, size = "md", online = false }: {
  name: string; size?: "sm" | "md" | "lg"; online?: boolean;
}) {
  const cls = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }[size];
  return (
    <div className="relative shrink-0">
      <div className={`${cls} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white`}>
        {name.charAt(0).toUpperCase()}
      </div>
      {online && (
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />
      )}
    </div>
  );
}

function XPBar({ value, max, color = "#6366F1", animated = true }: {
  value: number; max: number; color?: string; animated?: boolean;
}) {
  const pct = Math.min((value / Math.max(max, 1)) * 100, 100);
  return (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <motion.div
        initial={animated ? { width: 0 } : false}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="h-full rounded-full"
        style={{ background: color }}
      />
    </div>
  );
}

// ─── Tab: Início ─────────────────────────────────────────────────────────────

function InicioTab({
  guild, activity, members, missions, messages, onSendMessage,
}: {
  guild: GuildResponseDTO;
  activity: GuildActivityDTO[];
  members: GuildMemberDTO[];
  missions: GuildMissionDTO[];
  messages: GuildMessageDTO[];
  onSendMessage: (text: string) => void;
}) {
  const [chatInput, setChatInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const activeMission = missions.find(m => !m.completed);
  const top3 = [...members].slice(0, 3);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function handleSend() {
    const text = chatInput.trim();
    if (!text) return;
    onSendMessage(text);
    setChatInput("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column */}
      <div className="lg:col-span-2 space-y-5">

        {/* Weekly goal */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target size={15} className="text-indigo-400" />
              <span className="font-semibold text-white text-sm">Meta Semanal</span>
            </div>
            <span className="text-xs text-slate-500">
              {guild.weeklyXp.toLocaleString("pt-BR")} / {guild.weeklyGoal.toLocaleString("pt-BR")} XP
            </span>
          </div>
          <XPBar value={guild.weeklyXp} max={guild.weeklyGoal} color="#6366F1" />
          <p className="mt-2 text-xs text-slate-500">
            Faltam{" "}
            <span className="text-indigo-400 font-semibold">
              {Math.max(0, guild.weeklyGoal - guild.weeklyXp).toLocaleString("pt-BR")} XP
            </span>{" "}
            para a meta desta semana
          </p>
        </div>

        {/* Podium */}
        {top3.length >= 1 && (
          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 mb-5">
              <Crown size={15} className="text-yellow-400" />
              <span className="font-semibold text-white text-sm">Top Membros da Semana</span>
            </div>
            <div className="flex items-end justify-center gap-4">
              {/* 2nd */}
              {top3[1] && (
                <div className="flex flex-col items-center gap-2">
                  <MemberAvatar name={top3[1].name} size="md" online={top3[1].online} />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-white">{top3[1].nickname}</div>
                    <div className="text-[10px] text-slate-500">{top3[1].xp.toLocaleString()} XP</div>
                  </div>
                  <div className="w-16 h-14 rounded-t-xl flex items-center justify-center bg-slate-700 border border-slate-600">
                    <span className="text-2xl font-black text-slate-300">2</span>
                  </div>
                </div>
              )}
              {/* 1st */}
              <div className="flex flex-col items-center gap-2">
                <div className="relative">
                  <MemberAvatar name={top3[0].name} size="lg" online={top3[0].online} />
                  <Crown size={14} className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-semibold text-white">{top3[0].nickname}</div>
                  <div className="text-[10px] text-yellow-400">{top3[0].xp.toLocaleString()} XP</div>
                </div>
                <div className="w-16 h-20 rounded-t-xl flex items-center justify-center bg-gradient-to-t from-yellow-900/40 to-yellow-700/20 border border-yellow-700/40">
                  <span className="text-3xl font-black text-yellow-400">1</span>
                </div>
              </div>
              {/* 3rd */}
              {top3[2] && (
                <div className="flex flex-col items-center gap-2">
                  <MemberAvatar name={top3[2].name} size="md" online={top3[2].online} />
                  <div className="text-center">
                    <div className="text-xs font-semibold text-white">{top3[2].nickname}</div>
                    <div className="text-[10px] text-slate-500">{top3[2].xp.toLocaleString()} XP</div>
                  </div>
                  <div className="w-16 h-10 rounded-t-xl flex items-center justify-center bg-slate-800 border border-slate-700">
                    <span className="text-xl font-black text-amber-700">3</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Activity feed */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={15} className="text-yellow-400" />
            <span className="font-semibold text-white text-sm">Atividade Recente</span>
          </div>
          {activity.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-4">Nenhuma atividade ainda.</p>
          ) : (
            <div className="space-y-3">
              {activity.map(a => (
                <div key={a.id} className="flex items-center gap-3">
                  <MemberAvatar name={a.user} size="sm" />
                  <div className="flex-1 text-xs">
                    <span className="text-white font-medium">{a.user}</span>
                    <span className="text-slate-400"> {a.action}</span>
                  </div>
                  {a.xp > 0 && (
                    <span className="text-[10px] text-yellow-400 font-semibold">+{a.xp} XP</span>
                  )}
                  <span className="text-[10px] text-slate-600">{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right column */}
      <div className="space-y-5">

        {/* Active mission */}
        {activeMission && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20">
            <div className="flex items-center gap-2 mb-2">
              <Target size={13} className="text-indigo-400" />
              <span className="text-[10px] font-semibold text-indigo-300 uppercase tracking-wide">Missão Ativa</span>
            </div>
            <h4 className="font-bold text-white mb-1 text-sm">{activeMission.title}</h4>
            <p className="text-xs text-slate-400 mb-3">{activeMission.description}</p>
            <XPBar value={activeMission.progress} max={activeMission.total} color="#818CF8" />
            <div className="flex justify-between mt-1.5 text-[11px] text-slate-500">
              <span>{activeMission.progress}/{activeMission.total}</span>
              {activeMission.endsAt && (
                <span className="flex items-center gap-1"><Clock size={10} /> {activeMission.endsAt}</span>
              )}
            </div>
            <div className="mt-3 text-xs text-yellow-400 font-semibold flex items-center gap-1">
              <Award size={12} /> Recompensa: +{activeMission.xpReward} XP
            </div>
          </div>
        )}

        {/* Chat */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col" style={{ height: 320 }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={13} className="text-indigo-400" />
            <span className="text-xs font-semibold text-white">Chat da Guild</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 pr-1">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 text-center pt-4">Seja o primeiro a enviar uma mensagem!</p>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.isMe ? "flex-row-reverse" : ""}`}>
                  {!msg.isMe && <MemberAvatar name={msg.user} size="sm" />}
                  <div className={`max-w-[80%] flex flex-col gap-0.5 ${msg.isMe ? "items-end" : "items-start"}`}>
                    {!msg.isMe && <span className="text-[10px] text-slate-500">{msg.user}</span>}
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${msg.isMe ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-300"}`}>
                      {msg.text}
                    </div>
                    <span className="text-[10px] text-slate-600">{msg.time}</span>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex gap-2">
            <input
              value={chatInput}
              onChange={e => setChatInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder="Mensagem..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
            />
            <button
              onClick={handleSend}
              disabled={!chatInput.trim()}
              className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white text-xs transition-colors"
            >
              <Send size={13} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-3">
          {[
            { label: "Membros",  value: String(guild.memberCount),                          color: "text-white" },
            { label: "Streak",   value: `${guild.streak}d`,                                  color: "text-orange-400" },
            { label: "Ranking",  value: `#${guild.rankPosition}`,                            color: "text-yellow-400" },
            { label: "XP Total", value: `${(guild.totalXp / 1000).toFixed(0)}k`,             color: "text-indigo-400" },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-slate-800">
              <div className={`text-xl font-black ${s.color}`}>{s.value}</div>
              <div className="text-[10px] text-slate-500">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Membros ─────────────────────────────────────────────────────────────

function MembrosTab({
  members, pending, isAdmin, onAccept, onDecline,
}: {
  members: GuildMemberDTO[];
  pending: GuildRequestDTO[];
  isAdmin: boolean;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}) {
  return (
    <div className="space-y-6">
      {isAdmin && pending.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={14} className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">
              {pending.length} pedido(s) de entrada
            </span>
          </div>
          <div className="space-y-3">
            {pending.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60">
                <MemberAvatar name={req.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{req.name}</div>
                  <div className="text-xs text-slate-500">@{req.nickname} · Nível {req.level}</div>
                  {req.message && (
                    <div className="text-xs text-slate-400 mt-0.5 italic">"{req.message}"</div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => onAccept(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-600/30 transition-colors flex items-center gap-1"
                  >
                    <Check size={11} /> Aceitar
                  </button>
                  <button
                    onClick={() => onDecline(req.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-600/20 transition-colors"
                  >
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        {members.map((m, i) => (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="text-slate-600 font-bold text-sm w-6 text-center">{i + 1}</div>
            <MemberAvatar name={m.name} size="md" online={m.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm truncate">{m.name}</span>
                {(m.role === "founder" || m.role === "admin") && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold capitalize">
                    {m.role === "founder" ? "Fundador" : "Admin"}
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">@{m.nickname} · Nível {m.level}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-bold text-yellow-400">{m.xp.toLocaleString()}</div>
              <div className="text-[10px] text-slate-600">XP</div>
            </div>
            {m.streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-400 shrink-0">
                <Flame size={11} /> {m.streak}d
              </div>
            )}
            {isAdmin && m.role !== "founder" && (
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors shrink-0">
                <MoreVertical size={14} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {isAdmin && (
        <button className="w-full py-3 rounded-xl border border-dashed border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 text-sm flex items-center justify-center gap-2 transition-colors">
          <UserPlus size={14} /> Convidar Membros
        </button>
      )}
    </div>
  );
}

// ─── Tab: Materiais ───────────────────────────────────────────────────────────

function MateriaisTab({ materials, isAdmin }: { materials: GuildMaterialDTO[]; isAdmin: boolean }) {
  const iconMap: Record<string, React.ElementType> = { pdf: FileText, video: Video, link: Link2 };
  const colorMap: Record<string, string> = { pdf: "text-red-400", video: "text-blue-400", link: "text-green-400" };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <button className="w-full py-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-600/5 hover:bg-indigo-600/10 text-indigo-400 text-sm flex items-center justify-center gap-2 transition-colors">
          <Upload size={15} /> Compartilhar Material com a Guild
        </button>
      )}
      {materials.length === 0 ? (
        <div className="text-center py-16 text-slate-500">
          <BookOpen size={36} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Nenhum material compartilhado ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {materials.map(mat => {
            const Icon = iconMap[mat.type?.toLowerCase()] ?? FileText;
            const color = colorMap[mat.type?.toLowerCase()] ?? "text-slate-400";
            return (
              <motion.a
                key={mat.id}
                href={mat.url || "#"}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors group cursor-pointer"
              >
                <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${color} shrink-0`}>
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white text-sm truncate">{mat.title}</div>
                  <div className="text-[11px] text-slate-500">
                    por @{mat.uploader}{mat.size ? ` · ${mat.size}` : ""} · {mat.date}
                  </div>
                </div>
                <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
              </motion.a>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Tab: Ranking ─────────────────────────────────────────────────────────────

function RankingTab({ guild, members }: { guild: GuildResponseDTO; members: GuildMemberDTO[] }) {
  const leagueColor = leagueColors[guild.league?.toUpperCase()] ?? "#CD7F32";
  const leagueLabel = guild.league
    ? guild.league.charAt(0).toUpperCase() + guild.league.slice(1).toLowerCase()
    : "Bronze";

  return (
    <div className="space-y-6">
      <div
        className="p-6 rounded-2xl border"
        style={{ background: `linear-gradient(135deg, ${leagueColor}10, #0F172A)`, borderColor: `${leagueColor}30` }}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs uppercase tracking-wider mb-1" style={{ color: `${leagueColor}99` }}>
              Posição Global
            </div>
            <div className="text-4xl font-black" style={{ color: leagueColor }}>
              #{guild.rankPosition}
            </div>
          </div>
          <GuildBadge type={guild.badge as GuildBadgeType} size="lg" showGlow />
        </div>
        <div className="text-sm text-slate-400 mb-3">
          Liga:{" "}
          <span className="font-bold" style={{ color: leagueColor }}>
            {leagueLabel}
          </span>
        </div>
        <XPBar value={guild.weeklyXp} max={guild.weeklyGoal} color={leagueColor} />
        <div className="flex justify-between mt-1 text-xs text-slate-500">
          <span>{guild.weeklyXp.toLocaleString("pt-BR")}</span>
          <span>{guild.weeklyGoal.toLocaleString("pt-BR")} XP meta</span>
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
          <Trophy size={14} className="text-indigo-400" /> Ranking Interno
        </h3>
        <div className="space-y-2">
          {members.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 ${
                i === 0 ? "bg-yellow-500 text-black" :
                i === 1 ? "bg-slate-400 text-black" :
                i === 2 ? "bg-amber-700 text-white" :
                "bg-slate-800 text-slate-400"
              }`}>{i + 1}</div>
              <MemberAvatar name={m.name} size="sm" />
              <div className="flex-1 text-sm text-white font-medium truncate">{m.name}</div>
              <div className="text-right shrink-0">
                <div className="text-sm font-bold text-yellow-400">{m.xp.toLocaleString()}</div>
                <div className="text-[10px] text-slate-600">XP</div>
              </div>
              {i === 0 && <Crown size={13} className="text-yellow-400 shrink-0" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Tab: Missões ─────────────────────────────────────────────────────────────

function MissoesTab({ missions }: { missions: GuildMissionDTO[] }) {
  const typeCfg: Record<string, { label: string; color: string; border: string; bg: string }> = {
    daily:   { label: "Diária",  color: "text-green-400",  border: "border-green-400/20",  bg: "bg-green-400/10" },
    weekly:  { label: "Semanal", color: "text-indigo-400", border: "border-indigo-400/20", bg: "bg-indigo-400/10" },
    monthly: { label: "Mensal",  color: "text-purple-400", border: "border-purple-400/20", bg: "bg-purple-400/10" },
  };

  if (missions.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <Target size={36} className="mx-auto mb-3 opacity-30" />
        <p className="text-sm">Nenhuma missão disponível.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {missions.map(m => {
        const cfg = typeCfg[m.type?.toLowerCase()] ?? typeCfg.weekly;
        const isLargeNumber = m.total > 1000;
        const progressLabel = isLargeNumber
          ? `${(m.progress / 1000).toFixed(1)}k / ${(m.total / 1000).toFixed(1)}k XP`
          : `${m.progress} / ${m.total}`;

        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${m.completed ? "border-green-500/20 bg-green-950/10" : "border-slate-800 bg-slate-900/60"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                  {cfg.label}
                </span>
                {m.completed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 font-semibold flex items-center gap-1">
                    <Check size={9} /> Concluída
                  </span>
                )}
              </div>
              {m.endsAt && !m.completed && (
                <span className="text-xs text-slate-500 flex items-center gap-1 shrink-0">
                  <Clock size={11} /> {m.endsAt}
                </span>
              )}
            </div>
            <h4 className="font-bold text-white mb-1">{m.title}</h4>
            <p className="text-xs text-slate-400 mb-4">{m.description}</p>
            <XPBar value={m.progress} max={m.total} color={m.completed ? "#22C55E" : "#6366F1"} />
            <div className="flex justify-between mt-1.5 text-[11px] text-slate-500">
              <span>{progressLabel}</span>
              <span className="text-yellow-400 font-semibold flex items-center gap-1">
                <Award size={10} /> +{m.xpReward} XP
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

// ─── Tab: Anotações ───────────────────────────────────────────────────────────

function AnotacoesTab({ notes }: { notes: GuildNoteDTO[] }) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (notes.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <StickyNote size={36} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium text-white">Nenhuma anotação ainda.</p>
        <p className="text-sm mt-1">Membros podem compartilhar anotações de estudo com a guild.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {notes.map((note, i) => (
        <motion.div
          key={note.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.04 }}
          className="group bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/30 transition-all cursor-pointer"
          onClick={() => setExpanded(expanded === note.id ? null : note.id)}
        >
          {/* Color accent top */}
          <div className="h-1 bg-gradient-to-r from-indigo-500/60 via-purple-500/40 to-transparent" />
          <div className="p-5">
            <div className="flex items-start justify-between gap-2 mb-3">
              <h4 className="font-bold text-white text-sm leading-snug">{note.title}</h4>
              <ChevronRight
                size={14}
                className={`text-slate-500 shrink-0 transition-transform mt-0.5 ${expanded === note.id ? "rotate-90" : ""}`}
              />
            </div>
            <AnimatePresence initial={false}>
              {expanded === note.id ? (
                <motion.div
                  key="expanded"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap mb-3">
                    {note.content}
                  </p>
                </motion.div>
              ) : (
                <p className="text-xs text-slate-400 line-clamp-2 mb-3">{note.content}</p>
              )}
            </AnimatePresence>
            <div className="flex items-center justify-between text-[11px] text-slate-600">
              <span className="flex items-center gap-1">
                <PenLine size={10} /> {note.author}
              </span>
              <span>{note.updatedAt}</span>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Tab: Tarefas ─────────────────────────────────────────────────────────────

function TarefasTab({ tasks }: { tasks: GuildTaskDTO[] }) {
  const cols: { status: string; label: string; color: string; icon: React.ElementType }[] = [
    { status: "TODO",        label: "A Fazer",      color: "text-slate-400",  icon: ListTodo },
    { status: "IN_PROGRESS", label: "Em Progresso", color: "text-indigo-400", icon: RotateCcw },
    { status: "DONE",        label: "Concluído",    color: "text-green-400",  icon: CheckSquare },
  ];

  const priorityStyle: Record<string, string> = {
    LOW:    "text-slate-400 bg-slate-800 border-slate-700",
    MEDIUM: "text-yellow-400 bg-yellow-900/20 border-yellow-700/30",
    HIGH:   "text-red-400 bg-red-900/20 border-red-700/30",
  };
  const priorityLabel: Record<string, string> = { LOW: "Baixa", MEDIUM: "Média", HIGH: "Alta" };

  if (tasks.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <ListTodo size={36} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium text-white">Nenhuma tarefa criada.</p>
        <p className="text-sm mt-1">Organize o grupo com tarefas e prazos compartilhados.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cols.map(col => {
        const Icon = col.icon;
        const colTasks = tasks.filter(t => t.status === col.status);
        return (
          <div key={col.status} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-4">
            <div className={`flex items-center gap-2 mb-4 ${col.color}`}>
              <Icon size={14} />
              <span className="text-sm font-semibold">{col.label}</span>
              <span className="ml-auto text-[11px] bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">
                {colTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {colTasks.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">Vazio</p>
              ) : (
                colTasks.map((task, i) => (
                  <motion.div
                    key={task.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <p className="text-sm text-white font-medium leading-snug">{task.title}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold shrink-0 ${priorityStyle[task.priority] ?? priorityStyle.LOW}`}>
                        {priorityLabel[task.priority] ?? task.priority}
                      </span>
                    </div>
                    {task.description && (
                      <p className="text-xs text-slate-500 mb-2 line-clamp-2">{task.description}</p>
                    )}
                    <div className="flex items-center justify-between text-[11px] text-slate-600">
                      <span>{task.assignee}</span>
                      {task.dueDate && (
                        <span className="flex items-center gap-1">
                          <Clock size={10} /> {task.dueDate}
                        </span>
                      )}
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Tab: Flash Cards ─────────────────────────────────────────────────────────

function FlashCardsTab({ guildId, decks }: { guildId: string; decks: GuildFlashcardDeckDTO[] }) {
  const { notify } = useNotification();
  const [selectedDeck, setSelectedDeck] = useState<GuildFlashcardDeckDTO | null>(null);
  const [cards, setCards] = useState<GuildFlashcardDTO[]>([]);
  const [loadingCards, setLoadingCards] = useState(false);
  const [cardIndex, setCardIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  async function openDeck(deck: GuildFlashcardDeckDTO) {
    setSelectedDeck(deck);
    setCardIndex(0);
    setFlipped(false);
    setLoadingCards(true);
    try {
      const data = await GuildService.getFlashcardCards(guildId, deck.id);
      setCards(data);
    } catch {
      notify("Erro", "Não foi possível carregar os cards.", "error");
    } finally {
      setLoadingCards(false);
    }
  }

  function next() { setCardIndex(i => Math.min(i + 1, cards.length - 1)); setFlipped(false); }
  function prev() { setCardIndex(i => Math.max(i - 1, 0)); setFlipped(false); }

  if (decks.length === 0) {
    return (
      <div className="text-center py-20 text-slate-500">
        <Layers size={36} className="mx-auto mb-3 opacity-30" />
        <p className="font-medium text-white">Nenhum deck compartilhado.</p>
        <p className="text-sm mt-1">Membros podem compartilhar decks de flash cards com a guild.</p>
      </div>
    );
  }

  // Card viewer
  if (selectedDeck) {
    const card = cards[cardIndex];
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setSelectedDeck(null); setCards([]); }}
            className="flex items-center gap-1.5 text-slate-400 hover:text-white text-sm transition-colors group"
          >
            <ChevronLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
            Decks
          </button>
          <span className="text-slate-600">/</span>
          <span className="text-white font-semibold text-sm">{selectedDeck.title}</span>
          <span className="ml-auto text-xs text-slate-500">{cardIndex + 1} / {cards.length}</span>
        </div>

        {loadingCards ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="h-64 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 text-sm">
            Nenhum card neste deck.
          </div>
        ) : card ? (
          <>
            {/* Flip card */}
            <div
              className="relative h-64 cursor-pointer select-none"
              style={{ perspective: "1200px" }}
              onClick={() => setFlipped(f => !f)}
            >
              <motion.div
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.45, ease: "easeInOut" }}
                style={{ transformStyle: "preserve-3d" }}
                className="relative w-full h-full"
              >
                {/* Front */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 border border-slate-700 flex flex-col items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-4">Pergunta</div>
                  <p className="text-white text-lg font-semibold leading-relaxed">{card.front}</p>
                  <div className="absolute bottom-4 text-xs text-slate-600 flex items-center gap-1">
                    <Eye size={11} /> Clique para revelar
                  </div>
                </div>
                {/* Back */}
                <div
                  className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 flex flex-col items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="text-[10px] text-indigo-400 uppercase tracking-widest mb-4">Resposta</div>
                  <p className="text-white text-lg font-semibold leading-relaxed">{card.back}</p>
                  <div className="absolute bottom-4 text-xs text-slate-600 flex items-center gap-1">
                    <EyeOff size={11} /> Clique para ocultar
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between gap-4">
              <button
                onClick={prev}
                disabled={cardIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              >
                <ChevronLeft size={14} /> Anterior
              </button>
              {/* Progress dots */}
              <div className="flex gap-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCardIndex(i); setFlipped(false); }}
                    className={`rounded-full transition-all ${
                      i === cardIndex
                        ? "w-4 h-2 bg-indigo-500"
                        : "w-2 h-2 bg-slate-700 hover:bg-slate-600"
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={next}
                disabled={cardIndex === cards.length - 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-sm transition-colors"
              >
                Próximo <ChevronRight size={14} />
              </button>
            </div>
          </>
        ) : null}
      </div>
    );
  }

  // Deck list
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map((deck, i) => (
        <motion.button
          key={deck.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          onClick={() => openDeck(deck)}
          className="group text-left p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 hover:shadow-[0_0_20px_rgba(99,102,241,0.1)] transition-all duration-300"
        >
          {/* Icon / Color badge */}
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4"
            style={{ background: deck.color ? `${deck.color}30` : "#1e293b", border: `1px solid ${deck.color ?? "#334155"}40` }}
          >
            {deck.icon ?? "📚"}
          </div>
          <h4 className="font-bold text-white mb-1">{deck.title}</h4>
          {deck.description && (
            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{deck.description}</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">
              {deck.cardCount} {deck.cardCount === 1 ? "card" : "cards"}
            </span>
            <span className="text-xs text-indigo-400 flex items-center gap-1 group-hover:gap-2 transition-all">
              Estudar <ChevronRight size={12} />
            </span>
          </div>
        </motion.button>
      ))}
    </div>
  );
}

// ─── Page skeleton ────────────────────────────────────────────────────────────

function PageSkeleton() {
  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6">
      <Skeleton className="h-5 w-32 rounded" />
      <div className="rounded-2xl border border-slate-800 p-8">
        <div className="flex gap-6">
          <Skeleton className="w-28 h-28 rounded-2xl shrink-0" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-8 w-1/2 rounded" />
            <Skeleton className="h-4 w-full rounded" />
            <Skeleton className="h-4 w-3/4 rounded" />
            <div className="flex gap-4">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-4 w-24 rounded" />)}
            </div>
          </div>
        </div>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-9 w-24 rounded-xl" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-40 w-full rounded-2xl" />)}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuildDetailPage() {
  const params = useParams();
  const guildId = params.id as string;
  const { notify } = useNotification();

  const [tab, setTab] = useState<GuildTab>("inicio");
  const [guild, setGuild] = useState<GuildResponseDTO | null>(null);
  const [members, setMembers] = useState<GuildMemberDTO[]>([]);
  const [pending, setPending] = useState<GuildRequestDTO[]>([]);
  const [materials, setMaterials] = useState<GuildMaterialDTO[]>([]);
  const [missions, setMissions] = useState<GuildMissionDTO[]>([]);
  const [activity, setActivity] = useState<GuildActivityDTO[]>([]);
  const [messages, setMessages] = useState<GuildMessageDTO[]>([]);
  const [notes, setNotes] = useState<GuildNoteDTO[]>([]);
  const [tasks, setTasks] = useState<GuildTaskDTO[]>([]);
  const [decks, setDecks] = useState<GuildFlashcardDeckDTO[]>([]);
  const [loading, setLoading] = useState(true);

  // ── Initial data load ──
  useEffect(() => {
    if (!guildId) return;

    const load = async () => {
      setLoading(true);
      try {
        // Load all data in parallel
        const [
          guildData, membersData, materialsData, missionsData,
          activityData, chatData, notesData, tasksData, decksData,
        ] = await Promise.allSettled([
          GuildService.getGuild(guildId),
          GuildService.getMembers(guildId),
          GuildService.getMaterials(guildId),
          GuildService.getMissions(guildId),
          GuildService.getActivity(guildId),
          GuildService.getChatMessages(guildId),
          GuildService.getNotes(guildId),
          GuildService.getTasks(guildId),
          GuildService.getFlashcardDecks(guildId),
        ]);

        if (guildData.status === "fulfilled") setGuild(guildData.value);
        else { notify("Erro", "Guild não encontrada.", "error"); return; }

        if (membersData.status === "fulfilled") {
          setMembers(membersData.value.members ?? []);
          setPending(membersData.value.pendingRequests ?? []);
        }
        if (materialsData.status === "fulfilled") setMaterials(materialsData.value);
        if (missionsData.status === "fulfilled")  setMissions(missionsData.value);
        if (activityData.status === "fulfilled")  setActivity(activityData.value);
        if (chatData.status === "fulfilled")      setMessages(chatData.value);
        if (notesData.status === "fulfilled")     setNotes(notesData.value);
        if (tasksData.status === "fulfilled")     setTasks(tasksData.value);
        if (decksData.status === "fulfilled")     setDecks(decksData.value);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [guildId, notify]);

  // ── Chat polling (every 8s) ──
  useEffect(() => {
    if (!guildId) return;
    const interval = setInterval(async () => {
      try {
        const data = await GuildService.getChatMessages(guildId);
        setMessages(data);
      } catch {
        // silent fail
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [guildId]);

  // ── Send chat message ──
  const handleSendMessage = useCallback(async (text: string) => {
    try {
      const msg = await GuildService.sendMessage(guildId, text);
      setMessages(prev => [...prev, msg]);
    } catch {
      notify("Erro", "Não foi possível enviar a mensagem.", "error");
    }
  }, [guildId, notify]);

  // ── Accept join request ──
  function handleAccept(requestId: string) {
    notify("Em breve", "Aprovação de membros será liberada em breve.", "info");
  }

  // ── Decline join request ──
  function handleDecline(requestId: string) {
    notify("Em breve", "Rejeição de membros será liberada em breve.", "info");
  }

  if (loading) return <PageSkeleton />;
  if (!guild) return (
    <div className="p-8 text-center text-slate-500">
      <Shield size={40} className="mx-auto mb-3 opacity-30" />
      <p>Guild não encontrada.</p>
      <Link href="/guilds" className="text-indigo-400 hover:text-indigo-300 text-sm mt-2 inline-block">
        Voltar para Guilds
      </Link>
    </div>
  );

  const leagueColor = leagueColors[guild.league?.toUpperCase()] ?? "#CD7F32";
  const leagueLabel = guild.league
    ? guild.league.charAt(0).toUpperCase() + guild.league.slice(1).toLowerCase()
    : "Bronze";

  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6">

      {/* Back */}
      <Link
        href="/guilds"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group"
      >
        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Guilds
      </Link>

      {/* Guild Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden border border-slate-800 p-6 lg:p-8"
        style={{ background: `linear-gradient(135deg, ${leagueColor}08 0%, #0F172A 60%, rgba(99,102,241,0.04) 100%)` }}
      >
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-8 -translate-x-1/2 -translate-y-1/2 pointer-events-none"
          style={{ background: leagueColor }} />

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <GuildBadge type={guild.badge as GuildBadgeType} size="xl" showGlow />

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-black text-white">{guild.name}</h1>
              {guild.isPublic
                ? <Globe size={14} className="text-green-400" />
                : <Lock size={14} className="text-orange-400" />
              }
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ color: leagueColor, background: `${leagueColor}20`, border: `1px solid ${leagueColor}40` }}
              >
                {leagueLabel}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold">
                #{guild.rankPosition} Global
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4 max-w-2xl">{guild.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5 text-slate-400">
                <Users size={13} className="text-indigo-400" />
                {guild.memberCount}/{guild.maxMembers} membros
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Zap size={13} className="text-yellow-400" />
                {(guild.totalXp / 1000).toFixed(1)}k XP
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Flame size={13} className="text-orange-400" />
                {guild.streak} dias streak
              </span>
              <span className="flex items-center gap-1.5 text-slate-400">
                <Calendar size={13} className="text-slate-500" />
                Criada em {guild.createdAt}
              </span>
            </div>
          </div>

          {guild.isAdmin && (
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium transition-colors shrink-0">
              <Settings size={14} /> Gerenciar
            </button>
          )}
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                tab === t.id
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}
            >
              <Icon size={14} />
              {t.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {tab === "inicio" && (
            <InicioTab
              guild={guild}
              activity={activity}
              members={members}
              missions={missions}
              messages={messages}
              onSendMessage={handleSendMessage}
            />
          )}
          {tab === "membros" && (
            <MembrosTab
              members={members}
              pending={pending}
              isAdmin={guild.isAdmin}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          )}
          {tab === "materiais" && (
            <MateriaisTab materials={materials} isAdmin={guild.isAdmin} />
          )}
          {tab === "ranking" && (
            <RankingTab guild={guild} members={members} />
          )}
          {tab === "missoes" && (
            <MissoesTab missions={missions} />
          )}
          {tab === "anotacoes" && <AnotacoesTab notes={notes} />}
          {tab === "tarefas"   && <TarefasTab tasks={tasks} />}
          {tab === "flashcards" && (
            <FlashCardsTab guildId={guildId} decks={decks} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
