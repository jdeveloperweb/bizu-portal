"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Plus, Shield, Users, Zap, Trophy,
  Lock, Globe, Star, TrendingUp, Flame, Crown,
  ChevronRight, Filter,
} from "lucide-react";
import { GuildBadge, GuildBadgeType, GUILD_BADGES } from "@/components/guilds/GuildBadge";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Guild {
  id: string;
  name: string;
  description: string;
  badge: GuildBadgeType;
  memberCount: number;
  maxMembers: number;
  totalXP: number;
  weeklyXP: number;
  rankPosition: number;
  league: "bronze" | "prata" | "ouro" | "diamante" | "mestre";
  isPublic: boolean;
  tags: string[];
  isMember?: boolean;
  hasPendingRequest?: boolean;
  streak: number;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_GUILDS: Guild[] = [
  {
    id: "1", name: "Espadas do Saber", badge: "espada",
    description: "Guerreiros dedicados a dominar o conhecimento jurídico com disciplina e foco total.",
    memberCount: 28, maxMembers: 30, totalXP: 124500, weeklyXP: 8200,
    rankPosition: 1, league: "mestre", isPublic: true, tags: ["Direito", "OAB"], streak: 14,
  },
  {
    id: "2", name: "Cristais Arcanos", badge: "cristal",
    description: "Grupo de estudo focado em medicina e ciências da saúde, com metodologia intensa.",
    memberCount: 19, maxMembers: 25, totalXP: 98700, weeklyXP: 6100,
    rankPosition: 2, league: "diamante", isPublic: true, tags: ["Medicina", "Residência"], streak: 21,
  },
  {
    id: "3", name: "Coroa de Ouro", badge: "coroa",
    description: "Os melhores do ranking se reúnem aqui. Acesso por convite apenas.",
    memberCount: 15, maxMembers: 15, totalXP: 87300, weeklyXP: 5800,
    rankPosition: 3, league: "diamante", isPublic: false, tags: ["Elite", "Concursos"], streak: 30,
  },
  {
    id: "4", name: "Fênix Renascida", badge: "fenix",
    description: "Para quem caiu e se levantou. Foco em recuperação e melhoria contínua.",
    memberCount: 22, maxMembers: 30, totalXP: 65400, weeklyXP: 4200,
    rankPosition: 7, league: "ouro", isPublic: true, tags: ["Motivação", "Reabilitação"], streak: 7, isMember: true,
  },
  {
    id: "5", name: "Trovão Veloz", badge: "trovao",
    description: "Velocidade e eficiência. Resolvemos questões no menor tempo possível.",
    memberCount: 12, maxMembers: 20, totalXP: 54200, weeklyXP: 3800,
    rankPosition: 10, league: "ouro", isPublic: true, tags: ["Velocidade", "Raciocínio"], streak: 5,
  },
  {
    id: "6", name: "Dragões do Norte", badge: "dragao",
    description: "Grupo regional focado em concursos estaduais do Norte e Nordeste do Brasil.",
    memberCount: 18, maxMembers: 25, totalXP: 43100, weeklyXP: 2900,
    rankPosition: 14, league: "prata", isPublic: true, tags: ["Concursos", "Regional"], streak: 3, hasPendingRequest: true,
  },
];

const MY_GUILDS = MOCK_GUILDS.filter(g => g.isMember);
const FEATURED = MOCK_GUILDS.slice(0, 3);

// ─── League Config ─────────────────────────────────────────────────────────

const leagueConfig = {
  bronze:   { label: "Bronze",   color: "#CD7F32", bg: "from-amber-900/40 to-amber-800/20" },
  prata:    { label: "Prata",    color: "#C0C0C0", bg: "from-slate-600/40 to-slate-500/20" },
  ouro:     { label: "Ouro",     color: "#FFD700", bg: "from-yellow-700/40 to-yellow-600/20" },
  diamante: { label: "Diamante", color: "#B9F2FF", bg: "from-cyan-700/40 to-cyan-600/20" },
  mestre:   { label: "Mestre",   color: "#A855F7", bg: "from-purple-700/40 to-purple-600/20" },
};

// ─── Components ───────────────────────────────────────────────────────────────

function LeagueBadge({ league }: { league: Guild["league"] }) {
  const cfg = leagueConfig[league];
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color: cfg.color, background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
    >
      {cfg.label}
    </span>
  );
}

function GuildCard({ guild, index }: { guild: Guild; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.4 }}
      className="group relative bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]"
    >
      {/* Top accent */}
      <div className="h-1 w-full bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <GuildBadge type={guild.badge} size="lg" showGlow />
            {/* Rank badge */}
            {guild.rankPosition <= 5 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                <span className="text-[9px] font-black text-black">#{guild.rankPosition}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-white text-base truncate">{guild.name}</h3>
              {!guild.isPublic && <Lock size={12} className="text-slate-500 shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <LeagueBadge league={guild.league} />
              {guild.streak >= 7 && (
                <span className="text-[10px] text-orange-400 flex items-center gap-0.5">
                  <Flame size={10} /> {guild.streak}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {guild.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {guild.tags.map(tag => (
            <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
              {tag}
            </span>
          ))}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} className="text-indigo-400" />
            <span>{guild.memberCount}<span className="text-slate-600">/{guild.maxMembers}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Zap size={13} className="text-yellow-400" />
            <span>{(guild.totalXP / 1000).toFixed(1)}k XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp size={13} className="text-green-400" />
            <span>+{(guild.weeklyXP / 1000).toFixed(1)}k/sem</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <Link
            href={`/guilds/${guild.id}`}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
          >
            Ver guild <ChevronRight size={12} />
          </Link>

          {guild.isMember ? (
            <Link
              href={`/guilds/${guild.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Entrar
            </Link>
          ) : guild.hasPendingRequest ? (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-400 border border-slate-700 cursor-default">
              Aguardando...
            </span>
          ) : guild.isPublic ? (
            <button className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-medium transition-colors">
              Entrar
            </button>
          ) : (
            <button className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition-colors flex items-center gap-1">
              <Lock size={11} /> Pedir acesso
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedGuildCard({ guild }: { guild: Guild }) {
  const badgeCfg = GUILD_BADGES.find(b => b.id === guild.badge)!;
  return (
    <Link href={`/guilds/${guild.id}`} className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]">
      {/* BG gradient */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${badgeCfg.gradient} opacity-10 group-hover:opacity-20 transition-opacity`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-6">
          <GuildBadge type={guild.badge} size="xl" showGlow />
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-1">Ranking Global</div>
            <div className="text-3xl font-black text-white">#{guild.rankPosition}</div>
          </div>
        </div>

        <h3 className="text-xl font-black text-white mb-1">{guild.name}</h3>
        <p className="text-sm text-slate-400 line-clamp-2 mb-4">{guild.description}</p>

        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{guild.memberCount}</div>
            <div className="text-[10px] text-slate-500">membros</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-yellow-400">{(guild.totalXP / 1000).toFixed(0)}k</div>
            <div className="text-[10px] text-slate-500">XP total</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-orange-400">{guild.streak}d</div>
            <div className="text-[10px] text-slate-500">streak</div>
          </div>
          <div className="ml-auto">
            <LeagueBadge league={guild.league} />
          </div>
        </div>
      </div>
    </Link>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function GuildsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  const filtered = MOCK_GUILDS.filter(g => {
    const matchSearch = g.name.toLowerCase().includes(search.toLowerCase()) ||
      g.description.toLowerCase().includes(search.toLowerCase()) ||
      g.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filter === "all" || (filter === "public" ? g.isPublic : !g.isPublic);
    return matchSearch && matchFilter;
  });

  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center">
              <Shield size={20} className="text-indigo-400" />
            </div>
            <h1 className="text-3xl font-black text-white tracking-tight">Guilds</h1>
          </div>
          <p className="text-slate-400 text-sm">
            Una-se a outros estudantes, compartilhe materiais e suba no ranking em grupo.
          </p>
        </div>
        <Link
          href="/guilds/criar"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/30"
        >
          <Plus size={16} /> Criar Guild
        </Link>
      </motion.div>

      {/* ── My Guilds ── */}
      {MY_GUILDS.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={14} className="text-yellow-400" /> Minhas Guilds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {MY_GUILDS.map((g, i) => <GuildCard key={g.id} guild={g} index={i} />)}
          </div>
        </section>
      )}

      {/* ── Featured ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Crown size={14} className="text-purple-400" /> Guilds em Destaque
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {FEATURED.map(g => <FeaturedGuildCard key={g.id} guild={g} />)}
        </div>
      </section>

      {/* ── Search + Filter ── */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar guilds por nome, tag ou área..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500/50 transition-colors"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter size={14} className="text-slate-500" />
          {(["all", "public", "private"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Todas" : f === "public" ? <span className="flex items-center gap-1"><Globe size={11} />Públicas</span> : <span className="flex items-center gap-1"><Lock size={11} />Fechadas</span>}
            </button>
          ))}
        </div>
      </div>

      {/* ── All Guilds ── */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy size={14} className="text-indigo-400" /> Todas as Guilds
          <span className="text-slate-600 font-normal normal-case">— {filtered.length} encontradas</span>
        </h2>
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((g, i) => <GuildCard key={g.id} guild={g} index={i} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-slate-500">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">Nenhuma guild encontrada</p>
            <p className="text-sm mt-1">Tente outros termos ou crie a sua própria guild</p>
          </div>
        )}
      </section>
    </div>
  );
}
