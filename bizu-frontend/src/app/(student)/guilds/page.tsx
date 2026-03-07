"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Plus, Shield, Users, Zap, Trophy,
  Lock, Globe, TrendingUp, Flame, Crown,
  ChevronRight, Filter, Star,
} from "lucide-react";
import { GuildBadge, GuildBadgeType, GUILD_BADGES } from "@/components/guilds/GuildBadge";
import { GuildService, GuildResponseDTO } from "@/lib/guildService";
import { useNotification } from "@/components/NotificationProvider";
import { Skeleton } from "@/components/ui/skeleton";

// ─── League config ────────────────────────────────────────────────────────────

const leagueConfig: Record<string, { label: string; color: string }> = {
  BRONZE:   { label: "Bronze",   color: "#CD7F32" },
  PRATA:    { label: "Prata",    color: "#C0C0C0" },
  OURO:     { label: "Ouro",     color: "#FFD700" },
  DIAMANTE: { label: "Diamante", color: "#B9F2FF" },
  MESTRE:   { label: "Mestre",   color: "#A855F7" },
};

// ─── Components ───────────────────────────────────────────────────────────────

function LeagueBadge({ league }: { league: string }) {
  const cfg = leagueConfig[league?.toUpperCase()] ?? leagueConfig.BRONZE;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color: cfg.color, background: `${cfg.color}20`, border: `1px solid ${cfg.color}40` }}
    >
      {cfg.label}
    </span>
  );
}

function GuildCardSkeleton() {
  return (
    <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-20 h-20 rounded-2xl shrink-0" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4 rounded" />
          <Skeleton className="h-4 w-1/3 rounded" />
        </div>
      </div>
      <Skeleton className="h-8 w-full rounded" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
      </div>
      <div className="flex justify-between pt-2 border-t border-slate-800">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function GuildCard({ guild, index, onJoin }: {
  guild: GuildResponseDTO;
  index: number;
  onJoin: (guild: GuildResponseDTO) => void;
}) {
  const badgeType = guild.badge as GuildBadgeType;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.35 }}
      className="group relative bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden hover:border-indigo-500/40 transition-all duration-300 hover:shadow-[0_0_30px_rgba(99,102,241,0.12)]"
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <GuildBadge type={badgeType} size="lg" showGlow />
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
        {guild.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {guild.tags.map(tag => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Users size={13} className="text-indigo-400" />
            <span>{guild.memberCount}<span className="text-slate-600">/{guild.maxMembers}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Zap size={13} className="text-yellow-400" />
            <span>{(guild.totalXp / 1000).toFixed(1)}k XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <TrendingUp size={13} className="text-green-400" />
            <span>+{(guild.weeklyXp / 1000).toFixed(1)}k/sem</span>
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

          {guild.isAdmin ? (
            <Link
              href={`/guilds/${guild.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Entrar
            </Link>
          ) : guild.memberCount >= guild.maxMembers ? (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed">
              Cheia
            </span>
          ) : guild.isPublic ? (
            <button
              onClick={() => onJoin(guild)}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 text-indigo-300 font-medium transition-colors"
            >
              Entrar
            </button>
          ) : (
            <button
              onClick={() => onJoin(guild)}
              className="text-xs px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-medium transition-colors flex items-center gap-1"
            >
              <Lock size={11} /> Pedir acesso
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function FeaturedCard({ guild }: { guild: GuildResponseDTO }) {
  const badgeType = guild.badge as GuildBadgeType;
  const badgeCfg = GUILD_BADGES.find(b => b.id === badgeType)!;

  return (
    <Link
      href={`/guilds/${guild.id}`}
      className="group relative rounded-2xl overflow-hidden border border-slate-800 hover:border-indigo-500/30 transition-all duration-300 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]"
    >
      <div className={`absolute inset-0 bg-gradient-to-br ${badgeCfg?.gradient ?? "from-indigo-900 to-slate-900"} opacity-10 group-hover:opacity-20 transition-opacity`} />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-transparent" />

      <div className="relative p-6">
        <div className="flex items-start justify-between mb-5">
          <GuildBadge type={badgeType} size="xl" showGlow />
          <div className="text-right">
            <div className="text-xs text-slate-500 mb-0.5">Ranking Global</div>
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
            <div className="text-lg font-bold text-yellow-400">{(guild.totalXp / 1000).toFixed(0)}k</div>
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
  const { notify } = useNotification();
  const [guilds, setGuilds] = useState<GuildResponseDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "public" | "private">("all");

  const fetchGuilds = useCallback(async (q?: string) => {
    setLoading(true);
    try {
      const data = await GuildService.getGuilds(q);
      setGuilds(data);
    } catch {
      notify("Erro", "Não foi possível carregar as guilds.", "error");
    } finally {
      setLoading(false);
    }
  }, [notify]);

  // Initial load
  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => fetchGuilds(search || undefined), 400);
    return () => clearTimeout(t);
  }, [search, fetchGuilds]);

  function handleJoin(guild: GuildResponseDTO) {
    if (guild.isPublic) {
      notify("Em breve", `Entrar em guilds públicas será liberado em breve.`, "info");
    } else {
      notify("Em breve", `Pedido de entrada na guild "${guild.name}" será liberado em breve.`, "info");
    }
  }

  const myGuilds = guilds.filter(g => g.isAdmin);
  const featured = [...guilds].sort((a, b) => a.rankPosition - b.rankPosition).slice(0, 3);

  const filtered = guilds.filter(g => {
    if (filter === "public") return g.isPublic;
    if (filter === "private") return !g.isPublic;
    return true;
  });

  return (
    <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-8">

      {/* Header */}
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
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/25"
        >
          <Plus size={16} /> Criar Guild
        </Link>
      </motion.div>

      {/* My Guilds */}
      {!loading && myGuilds.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={14} className="text-yellow-400" /> Minhas Guilds
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myGuilds.map((g, i) => (
              <GuildCard key={g.id} guild={g} index={i} onJoin={handleJoin} />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      {!loading && featured.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Crown size={14} className="text-purple-400" /> Guilds em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map(g => <FeaturedCard key={g.id} guild={g} />)}
          </div>
        </section>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar guilds por nome..."
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
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              }`}
            >
              {f === "all" ? "Todas" : f === "public" ? <><Globe size={11} />Públicas</> : <><Lock size={11} />Fechadas</>}
            </button>
          ))}
        </div>
      </div>

      {/* All Guilds */}
      <section>
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy size={14} className="text-indigo-400" /> Todas as Guilds
          {!loading && (
            <span className="text-slate-600 font-normal normal-case">— {filtered.length} encontradas</span>
          )}
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => <GuildCardSkeleton key={i} />)}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((g, i) => (
              <GuildCard key={g.id} guild={g} index={i} onJoin={handleJoin} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-500">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-white">Nenhuma guild encontrada</p>
            <p className="text-sm mt-1">Tente outros termos ou crie a sua própria guild</p>
          </div>
        )}
      </section>
    </div>
  );
}
