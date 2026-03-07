"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Users, Zap, Trophy, Crown, Flame,
  Shield, Lock, Globe, Settings, UserPlus, MessageSquare,
  BookOpen, Layers, Target, Star, TrendingUp, Check,
  MoreVertical, ChevronRight, Upload, FileText, Video,
  Link2, Swords, Clock, Award, ChevronUp,
  Bell, Sparkles, BarChart2, Calendar,
} from "lucide-react";
import Link from "next/link";
import { GuildBadge, GuildBadgeType } from "@/components/guilds/GuildBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

type GuildTab = "inicio" | "membros" | "materiais" | "flashcards" | "anotacoes" | "ranking" | "missoes";
type LeagueType = "bronze" | "prata" | "ouro" | "diamante" | "mestre";

// ─── Mock Data ────────────────────────────────────────────────────────────────

const GUILD = {
  id: "1",
  name: "Espadas do Saber",
  description: "Guerreiros dedicados a dominar o conhecimento jurídico com disciplina e foco total. Aqui, cada questão respondida é uma batalha vencida.",
  badge: "espada" as GuildBadgeType,
  memberCount: 28,
  maxMembers: 30,
  totalXP: 124500,
  weeklyXP: 8200,
  rankPosition: 1,
  league: "mestre" as LeagueType,
  streak: 14,
  isPublic: true,
  isAdmin: true,
  tags: ["Direito", "OAB", "Concursos"],
  createdAt: "Janeiro 2025",
  weeklyGoal: 10000,
  weeklyProgress: 8200,
};

const MEMBERS = [
  { id: "m1", name: "Você", nickname: "youuser", level: 31, xp: 18400, role: "admin" as const, streak: 14, joinDate: "Jan 2025", avatar: null, online: true },
  { id: "m2", name: "Ana Clara Souza", nickname: "anaclara", level: 28, xp: 15200, role: "admin" as const, streak: 10, joinDate: "Jan 2025", avatar: null, online: true },
  { id: "m3", name: "Bruno Mendes", nickname: "brunomds", level: 24, xp: 12800, role: "membro" as const, streak: 7, joinDate: "Fev 2025", avatar: null, online: false },
  { id: "m4", name: "Carla Figueiredo", nickname: "carlafig", level: 22, xp: 10500, role: "membro" as const, streak: 14, joinDate: "Fev 2025", avatar: null, online: true },
  { id: "m5", name: "Diego Alves", nickname: "diegoalv", level: 20, xp: 9200, role: "membro" as const, streak: 3, joinDate: "Mar 2025", avatar: null, online: false },
  { id: "m6", name: "Eduarda Lima", nickname: "edalima", level: 18, xp: 7800, role: "membro" as const, streak: 5, joinDate: "Mar 2025", avatar: null, online: true },
];

const PENDING_REQUESTS = [
  { id: "r1", name: "Felipe Torres", nickname: "felipt", level: 19, message: "Quero entrar para estudar para OAB!" },
  { id: "r2", name: "Gabriela Nunes", nickname: "gabinunes", level: 22, message: "Sou estudante de Direito, busco grupo sério." },
];

const MATERIALS = [
  { id: "mat1", title: "Resumo Direito Constitucional", type: "pdf", uploader: "anaclara", size: "2.4 MB", date: "2 dias atrás" },
  { id: "mat2", title: "Aula OAB - Parte 1", type: "video", uploader: "brunomds", size: "148 MB", date: "5 dias atrás" },
  { id: "mat3", title: "Links úteis para concursos", type: "link", uploader: "youuser", size: null, date: "1 semana atrás" },
  { id: "mat4", title: "Questões Comentadas 2024", type: "pdf", uploader: "carlafig", size: "5.8 MB", date: "2 semanas atrás" },
];

const MISSIONS = [
  {
    id: "ms1", title: "Maratona Semanal", type: "weekly" as const,
    description: "Todos os membros completam 20 questões esta semana",
    progress: 18, total: 28, xpReward: 500, endsAt: "3 dias",
    completed: false,
  },
  {
    id: "ms2", title: "Série de 7 dias", type: "weekly" as const,
    description: "Guild mantém streak ativo por 7 dias consecutivos",
    progress: 14, total: 14, xpReward: 1000, endsAt: null,
    completed: true,
  },
  {
    id: "ms3", title: "Desafio Diário", type: "daily" as const,
    description: "10 membros completam pelo menos 5 questões hoje",
    progress: 7, total: 10, xpReward: 150, endsAt: "18h",
    completed: false,
  },
  {
    id: "ms4", title: "Guerra de Guilds", type: "monthly" as const,
    description: "Acumule 30.000 XP coletivo este mês para subir de liga",
    progress: 24500, total: 30000, xpReward: 5000, endsAt: "12 dias",
    completed: false,
  },
];

const ACTIVITY = [
  { id: "a1", user: "Ana Clara", action: "completou 15 questões", xp: 150, time: "2 min atrás" },
  { id: "a2", user: "Diego", action: "subiu para Nível 20", xp: 0, time: "1h atrás" },
  { id: "a3", user: "Carla", action: "compartilhou material", xp: 50, time: "3h atrás" },
  { id: "a4", user: "Bruno", action: "completou missão diária", xp: 150, time: "5h atrás" },
  { id: "a5", user: "Eduarda", action: "iniciou streak de 5 dias", xp: 75, time: "1 dia atrás" },
];

const CHAT_MESSAGES = [
  { id: "c1", user: "Ana Clara", text: "Pessoal, alguém tem material sobre direito administrativo?", time: "14:32" },
  { id: "c2", user: "Bruno", text: "Compartilhei na aba de Materiais agora mesmo!", time: "14:35" },
  { id: "c3", user: "Carla", text: "Valeu! Simulado amanhã 20h, quem topa?", time: "14:40" },
  { id: "c4", user: "Você", text: "Topo sim! Vamos na arena depois?", time: "14:42", isMe: true },
];

// ─── League Config ──────────────────────────────────────────────────────────

const leagueConfig: Record<LeagueType, { label: string; color: string; next?: string }> = {
  bronze:   { label: "Bronze",   color: "#CD7F32", next: "Prata" },
  prata:    { label: "Prata",    color: "#C0C0C0", next: "Ouro" },
  ouro:     { label: "Ouro",     color: "#FFD700", next: "Diamante" },
  diamante: { label: "Diamante", color: "#B9F2FF", next: "Mestre" },
  mestre:   { label: "Mestre",   color: "#A855F7" },
};

// ─── Tab config ──────────────────────────────────────────────────────────────

const TABS: { id: GuildTab; label: string; icon: typeof Shield }[] = [
  { id: "inicio",     label: "Início",      icon: Shield },
  { id: "membros",    label: "Membros",     icon: Users },
  { id: "materiais",  label: "Materiais",   icon: BookOpen },
  { id: "flashcards", label: "Flash Cards", icon: Layers },
  { id: "anotacoes",  label: "Anotações",   icon: FileText },
  { id: "ranking",    label: "Rankings",    icon: Trophy },
  { id: "missoes",    label: "Missões",     icon: Target },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Avatar({ name, size = "md", online = false }: { name: string; size?: "sm" | "md" | "lg"; online?: boolean }) {
  const s = { sm: "w-7 h-7 text-xs", md: "w-9 h-9 text-sm", lg: "w-12 h-12 text-base" }[size];
  return (
    <div className="relative shrink-0">
      <div className={`${s} rounded-full bg-gradient-to-br from-indigo-600 to-purple-700 flex items-center justify-center font-bold text-white`}>
        {name.charAt(0)}
      </div>
      {online && <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-slate-900" />}
    </div>
  );
}

function XPBar({ value, max, color = "#6366F1", showLabel = true }: { value: number; max: number; color?: string; showLabel?: boolean }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between text-xs text-slate-500 mb-1">
          <span>{value.toLocaleString()}</span>
          <span>{max.toLocaleString()}</span>
        </div>
      )}
      <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

// ─── Tabs Content ──────────────────────────────────────────────────────────────

function InicioTab({ chatMsg, setChat }: { chatMsg: string; setChat: (v: string) => void }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left */}
      <div className="lg:col-span-2 space-y-5">

        {/* Weekly goal */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-indigo-400" />
              <span className="font-semibold text-white text-sm">Meta Semanal da Guild</span>
            </div>
            <span className="text-xs text-slate-500">{GUILD.weeklyXP.toLocaleString()} / {GUILD.weeklyGoal.toLocaleString()} XP</span>
          </div>
          <XPBar value={GUILD.weeklyXP} max={GUILD.weeklyGoal} color="#6366F1" showLabel={false} />
          <p className="mt-2 text-xs text-slate-500">
            Faltam <span className="text-indigo-400 font-semibold">{(GUILD.weeklyGoal - GUILD.weeklyXP).toLocaleString()} XP</span> para atingir a meta desta semana
          </p>
        </div>

        {/* Top 3 Podium */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-5">
            <Crown size={16} className="text-yellow-400" />
            <span className="font-semibold text-white text-sm">Top Membros da Semana</span>
          </div>
          <div className="flex items-end justify-center gap-4">
            {/* 2nd */}
            <div className="flex flex-col items-center gap-2">
              <Avatar name={MEMBERS[1].name} size="md" online={MEMBERS[1].online} />
              <div className="text-center">
                <div className="text-xs font-semibold text-white">{MEMBERS[1].nickname}</div>
                <div className="text-[10px] text-slate-500">{MEMBERS[1].xp.toLocaleString()} XP</div>
              </div>
              <div className="w-16 h-14 rounded-t-xl flex items-center justify-center bg-slate-700 border border-slate-600">
                <span className="text-2xl font-black text-slate-300">2</span>
              </div>
            </div>
            {/* 1st */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                <Avatar name={MEMBERS[0].name} size="lg" online={MEMBERS[0].online} />
                <Crown size={16} className="absolute -top-3 left-1/2 -translate-x-1/2 text-yellow-400" />
              </div>
              <div className="text-center">
                <div className="text-xs font-semibold text-white">{MEMBERS[0].nickname}</div>
                <div className="text-[10px] text-yellow-400">{MEMBERS[0].xp.toLocaleString()} XP</div>
              </div>
              <div className="w-16 h-20 rounded-t-xl flex items-center justify-center bg-gradient-to-t from-yellow-900/40 to-yellow-700/20 border border-yellow-700/40">
                <span className="text-3xl font-black text-yellow-400">1</span>
              </div>
            </div>
            {/* 3rd */}
            <div className="flex flex-col items-center gap-2">
              <Avatar name={MEMBERS[2].name} size="md" online={MEMBERS[2].online} />
              <div className="text-center">
                <div className="text-xs font-semibold text-white">{MEMBERS[2].nickname}</div>
                <div className="text-[10px] text-slate-500">{MEMBERS[2].xp.toLocaleString()} XP</div>
              </div>
              <div className="w-16 h-10 rounded-t-xl flex items-center justify-center bg-slate-800 border border-slate-700">
                <span className="text-xl font-black text-amber-700">3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <div className="flex items-center gap-2 mb-4">
            <Zap size={16} className="text-yellow-400" />
            <span className="font-semibold text-white text-sm">Atividade Recente</span>
          </div>
          <div className="space-y-3">
            {ACTIVITY.map(a => (
              <div key={a.id} className="flex items-center gap-3">
                <Avatar name={a.user} size="sm" />
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
        </div>
      </div>

      {/* Right */}
      <div className="space-y-5">

        {/* Active mission highlight */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-900/30 to-purple-900/20 border border-indigo-500/20">
          <div className="flex items-center gap-2 mb-3">
            <Target size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wide">Missão Ativa</span>
          </div>
          <h4 className="font-bold text-white mb-1">{MISSIONS[0].title}</h4>
          <p className="text-xs text-slate-400 mb-3">{MISSIONS[0].description}</p>
          <XPBar value={MISSIONS[0].progress} max={MISSIONS[0].total} color="#818CF8" showLabel={false} />
          <div className="flex justify-between mt-1.5 text-[11px] text-slate-500">
            <span>{MISSIONS[0].progress}/{MISSIONS[0].total} membros</span>
            <span className="flex items-center gap-1">
              <Clock size={10} /> {MISSIONS[0].endsAt}
            </span>
          </div>
          <div className="mt-3 text-xs text-yellow-400 font-semibold flex items-center gap-1">
            <Award size={12} /> Recompensa: +{MISSIONS[0].xpReward} XP para todos
          </div>
        </div>

        {/* Guild chat */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col" style={{ height: 320 }}>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={14} className="text-indigo-400" />
            <span className="text-xs font-semibold text-white">Chat da Guild</span>
          </div>
          <div className="flex-1 overflow-y-auto space-y-3 mb-3 scrollbar-thin">
            {CHAT_MESSAGES.map(msg => (
              <div key={msg.id} className={`flex gap-2 ${(msg as any).isMe ? "flex-row-reverse" : ""}`}>
                {!(msg as any).isMe && <Avatar name={msg.user} size="sm" />}
                <div className={`max-w-[75%] ${(msg as any).isMe ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                  {!(msg as any).isMe && (
                    <span className="text-[10px] text-slate-500">{msg.user}</span>
                  )}
                  <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed ${
                    (msg as any).isMe
                      ? "bg-indigo-600 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[10px] text-slate-600">{msg.time}</span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={chatMsg}
              onChange={e => setChat(e.target.value)}
              placeholder="Mensagem..."
              className="flex-1 px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/60"
            />
            <button className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs transition-colors">
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 gap-3">
          <div className="text-center p-3 rounded-xl bg-slate-800">
            <div className="text-xl font-black text-white">{GUILD.memberCount}</div>
            <div className="text-[10px] text-slate-500">Membros</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800">
            <div className="text-xl font-black text-orange-400">{GUILD.streak}d</div>
            <div className="text-[10px] text-slate-500">Streak</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800">
            <div className="text-xl font-black text-yellow-400">#{GUILD.rankPosition}</div>
            <div className="text-[10px] text-slate-500">Ranking</div>
          </div>
          <div className="text-center p-3 rounded-xl bg-slate-800">
            <div className="text-xl font-black text-indigo-400">{(GUILD.totalXP / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-slate-500">XP Total</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MembrosTab({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div className="space-y-6">
      {/* Pending requests (admin only) */}
      {isAdmin && PENDING_REQUESTS.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-950/20 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-4">
            <Bell size={15} className="text-amber-400" />
            <span className="text-sm font-semibold text-amber-300">
              {PENDING_REQUESTS.length} pedido(s) de entrada aguardando
            </span>
          </div>
          <div className="space-y-3">
            {PENDING_REQUESTS.map(req => (
              <div key={req.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60">
                <Avatar name={req.name} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm">{req.name}</div>
                  <div className="text-xs text-slate-500">@{req.nickname} · Nível {req.level}</div>
                  <div className="text-xs text-slate-400 mt-0.5 italic">"{req.message}"</div>
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-1.5 rounded-lg bg-green-600/20 border border-green-500/30 text-green-400 text-xs font-medium hover:bg-green-600/30 transition-colors flex items-center gap-1">
                    <Check size={11} /> Aceitar
                  </button>
                  <button className="px-3 py-1.5 rounded-lg bg-red-600/10 border border-red-500/20 text-red-400 text-xs font-medium hover:bg-red-600/20 transition-colors">
                    Recusar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Member list */}
      <div className="space-y-2">
        {MEMBERS.map((member, i) => (
          <motion.div
            key={member.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition-colors"
          >
            <div className="text-slate-600 font-bold text-sm w-6 text-center">{i + 1}</div>
            <Avatar name={member.name} size="md" online={member.online} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-white text-sm truncate">{member.name}</span>
                {member.role === "admin" && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-600/30 border border-indigo-500/30 text-indigo-300 font-semibold">
                    Admin
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-500">@{member.nickname} · Nível {member.level}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-yellow-400">{member.xp.toLocaleString()}</div>
              <div className="text-[10px] text-slate-600">XP</div>
            </div>
            {member.streak > 0 && (
              <div className="flex items-center gap-1 text-xs text-orange-400">
                <Flame size={12} /> {member.streak}d
              </div>
            )}
            {isAdmin && member.id !== "m1" && (
              <button className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-colors">
                <MoreVertical size={14} />
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {isAdmin && (
        <button className="w-full py-3 rounded-xl border border-dashed border-slate-800 text-slate-500 hover:text-white hover:border-slate-700 text-sm flex items-center justify-center gap-2 transition-colors">
          <UserPlus size={15} /> Convidar Membros
        </button>
      )}
    </div>
  );
}

function MateriaisTab({ isAdmin }: { isAdmin: boolean }) {
  const icons = { pdf: FileText, video: Video, link: Link2 };
  const colors = { pdf: "text-red-400", video: "text-blue-400", link: "text-green-400" };

  return (
    <div className="space-y-4">
      {isAdmin && (
        <button className="w-full py-4 rounded-xl border border-dashed border-indigo-500/30 bg-indigo-600/5 hover:bg-indigo-600/10 text-indigo-400 text-sm flex items-center justify-center gap-2 transition-colors">
          <Upload size={16} /> Compartilhar Material com a Guild
        </button>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {MATERIALS.map(mat => {
          const Icon = icons[mat.type as keyof typeof icons];
          const colorClass = colors[mat.type as keyof typeof colors];
          return (
            <motion.div
              key={mat.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 cursor-pointer transition-colors group"
            >
              <div className={`w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center ${colorClass}`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-white text-sm truncate">{mat.title}</div>
                <div className="text-[11px] text-slate-500">
                  por @{mat.uploader} · {mat.size ? mat.size + " · " : ""}{mat.date}
                </div>
              </div>
              <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400 transition-colors" />
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function RankingTab() {
  return (
    <div className="space-y-6">
      {/* Guild global position */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-yellow-900/20 to-amber-900/10 border border-yellow-700/20">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-yellow-600 uppercase tracking-wider mb-1">Posição Global</div>
            <div className="text-4xl font-black text-yellow-400">#{GUILD.rankPosition}</div>
          </div>
          <GuildBadge type={GUILD.badge} size="lg" showGlow />
        </div>
        <div className="text-sm text-slate-400">
          Liga: <span style={{ color: leagueConfig[GUILD.league].color }} className="font-bold">
            {leagueConfig[GUILD.league].label}
          </span>
        </div>
        <XPBar value={GUILD.weeklyXP} max={GUILD.weeklyGoal} color="#EAB308" showLabel />
        <div className="mt-1 text-xs text-slate-500">XP semanal para manter posição</div>
      </div>

      {/* Internal ranking */}
      <div>
        <h3 className="text-sm font-semibold text-slate-300 mb-3">Ranking Interno — Membros</h3>
        <div className="space-y-2">
          {MEMBERS.map((m, i) => (
            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                i === 0 ? "bg-yellow-500 text-black" :
                i === 1 ? "bg-slate-400 text-black" :
                i === 2 ? "bg-amber-700 text-white" :
                "bg-slate-800 text-slate-400"
              }`}>{i + 1}</div>
              <Avatar name={m.name} size="sm" />
              <div className="flex-1">
                <div className="text-sm text-white font-medium">{m.name}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-yellow-400">{m.xp.toLocaleString()}</div>
                <div className="text-[10px] text-slate-600">XP</div>
              </div>
              {i === 0 && <Crown size={14} className="text-yellow-400" />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MissoesTab() {
  const typeColors = {
    daily: { label: "Diária", color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
    weekly: { label: "Semanal", color: "text-indigo-400", bg: "bg-indigo-400/10", border: "border-indigo-400/20" },
    monthly: { label: "Mensal", color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  };

  return (
    <div className="space-y-4">
      {MISSIONS.map(m => {
        const cfg = typeColors[m.type];
        const pct = (m.progress / m.total) * 100;
        return (
          <motion.div
            key={m.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-5 rounded-2xl border ${m.completed ? "border-green-500/20 bg-green-950/10" : "border-slate-800 bg-slate-900/60"}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wider ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                  {cfg.label}
                </span>
                {m.completed && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-600/20 border border-green-500/30 text-green-400 font-semibold flex items-center gap-1">
                    <Check size={9} /> Concluída
                  </span>
                )}
              </div>
              {m.endsAt && (
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Clock size={11} /> {m.endsAt}
                </span>
              )}
            </div>

            <h4 className="font-bold text-white mb-1">{m.title}</h4>
            <p className="text-xs text-slate-400 mb-4">{m.description}</p>

            <XPBar
              value={m.progress}
              max={m.total}
              color={m.completed ? "#22C55E" : "#6366F1"}
              showLabel={false}
            />
            <div className="flex justify-between mt-1.5 text-[11px] text-slate-500">
              <span>{typeof m.progress === "number" && m.progress > 1000
                ? `${(m.progress / 1000).toFixed(1)}k / ${(m.total / 1000).toFixed(1)}k XP`
                : `${m.progress} / ${m.total}`
              }</span>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuildDetailPage({ params }: { params: { id: string } }) {
  const [tab, setTab] = useState<GuildTab>("inicio");
  const [chatMsg, setChatMsg] = useState("");
  const league = leagueConfig[GUILD.league];

  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6">

      {/* ── Back ── */}
      <Link
        href="/guilds"
        className="inline-flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors group"
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-1 transition-transform" />
        Voltar para Guilds
      </Link>

      {/* ── Guild Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative rounded-2xl overflow-hidden border border-slate-800 p-6 lg:p-8"
        style={{
          background: "linear-gradient(135deg, rgba(234,179,8,0.06) 0%, #0F172A 50%, rgba(99,102,241,0.04) 100%)",
        }}
      >
        {/* Glow */}
        <div className="absolute top-0 left-0 w-64 h-64 rounded-full blur-3xl opacity-10 bg-yellow-500 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
          <GuildBadge type={GUILD.badge} size="xl" showGlow />

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-2xl lg:text-3xl font-black text-white">{GUILD.name}</h1>
              {GUILD.isPublic
                ? <Globe size={14} className="text-green-400" />
                : <Lock size={14} className="text-orange-400" />
              }
              <span
                className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider"
                style={{ color: league.color, background: `${league.color}20`, border: `1px solid ${league.color}40` }}
              >
                {league.label}
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 font-semibold">
                #{GUILD.rankPosition} Global
              </span>
            </div>
            <p className="text-slate-400 text-sm mb-4 max-w-2xl">{GUILD.description}</p>
            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-400">
                <Users size={14} className="text-indigo-400" />
                {GUILD.memberCount}/{GUILD.maxMembers} membros
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Zap size={14} className="text-yellow-400" />
                {(GUILD.totalXP / 1000).toFixed(1)}k XP total
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Flame size={14} className="text-orange-400" />
                {GUILD.streak} dias de streak
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar size={14} className="text-slate-500" />
                Criada em {GUILD.createdAt}
              </div>
            </div>
          </div>

          {GUILD.isAdmin && (
            <div className="flex gap-2">
              <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-medium transition-colors">
                <Settings size={14} /> Gerenciar
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-thin">
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

      {/* ── Tab Content ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {tab === "inicio"     && <InicioTab chatMsg={chatMsg} setChat={setChatMsg} />}
          {tab === "membros"    && <MembrosTab isAdmin={GUILD.isAdmin} />}
          {tab === "materiais"  && <MateriaisTab isAdmin={GUILD.isAdmin} />}
          {tab === "ranking"    && <RankingTab />}
          {tab === "missoes"    && <MissoesTab />}

          {(tab === "flashcards" || tab === "anotacoes") && (
            <div className="text-center py-20 text-slate-500">
              <Sparkles size={40} className="mx-auto mb-3 opacity-30" />
              <p className="font-medium text-white">{tab === "flashcards" ? "Flash Cards" : "Anotações"} da Guild</p>
              <p className="text-sm mt-1">Em breve — compartilhe seus decks e anotações com o grupo</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
