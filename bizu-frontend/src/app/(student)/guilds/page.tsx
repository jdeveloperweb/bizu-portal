"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Search, Plus, Shield, Users, Zap, Trophy,
  Lock, Globe, TrendingUp, Flame, Crown,
  ChevronRight, Filter, Star,
} from "lucide-react";
import { GuildBadge, GuildBadgeType } from "@/components/guilds/GuildBadge";
import { GuildService, GuildResponseDTO, GuildInviteDTO } from "@/lib/guildService";
import { useNotification } from "@/components/NotificationProvider";
import { Skeleton } from "@/components/ui/skeleton";

// ─── League config ────────────────────────────────────────────────────────────

const leagueConfig: Record<string, { label: string; color: string }> = {
  BRONZE: { label: "Bronze", color: "#CD7F32" },
  PRATA: { label: "Prata", color: "#94A3B8" },
  OURO: { label: "Ouro", color: "#D97706" },
  DIAMANTE: { label: "Diamante", color: "#0EA5E9" },
  MESTRE: { label: "Mestre", color: "#A855F7" },
};

// ─── Components ───────────────────────────────────────────────────────────────

function LeagueBadge({ league }: { league: string }) {
  const cfg = leagueConfig[league?.toUpperCase()] ?? leagueConfig.BRONZE;
  return (
    <span
      className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
      style={{ color: cfg.color, background: `${cfg.color}18`, border: `1px solid ${cfg.color}40` }}
    >
      {cfg.label}
    </span>
  );
}

function GuildCardSkeleton() {
  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-5 space-y-4">
      <div className="flex items-start gap-4">
        <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
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
      <div className="flex justify-between pt-2 border-t border-[var(--border)]">
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
      className="group relative bg-[var(--card)] border border-[var(--border)] rounded-xl overflow-hidden hover:border-indigo-300 hover:shadow-md transition-all duration-300"
    >
      <div className="h-0.5 w-full bg-gradient-to-r from-transparent via-indigo-400/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="p-5">
        {/* Header */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative shrink-0">
            <GuildBadge type={badgeType} size="lg" showGlow />
            {guild.rankPosition <= 5 && (
              <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center">
                <span className="text-[9px] font-black text-white">#{guild.rankPosition}</span>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-[var(--foreground)] text-base truncate">{guild.name}</h3>
              {!guild.isPublic && <Lock size={12} className="text-[var(--muted-foreground)] shrink-0" />}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <LeagueBadge league={guild.league} />
              {guild.streak >= 7 && (
                <span className="text-[10px] text-orange-500 flex items-center gap-0.5 font-medium">
                  <Flame size={10} /> {guild.streak}d
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-[var(--muted-foreground)] line-clamp-2 mb-4 leading-relaxed">
          {guild.description}
        </p>

        {/* Tags */}
        {guild.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {guild.tags.map(tag => (
              <span key={tag} className="text-[11px] px-2 py-0.5 rounded-md bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className="flex items-center gap-4 mb-4 pb-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Users size={13} className="text-indigo-600" />
            <span>{guild.memberCount}<span className="text-[var(--muted-foreground)] opacity-50">/{guild.maxMembers}</span></span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <Zap size={13} className="text-amber-500" />
            <span>{(guild.totalXp / 1000).toFixed(1)}k XP</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-[var(--muted-foreground)]">
            <TrendingUp size={13} className="text-green-600" />
            <span>+{(guild.weeklyXp / 1000).toFixed(1)}k/sem</span>
          </div>
        </div>

        {/* CTA */}
        <div className="flex items-center justify-between">
          <Link
            href={`/guilds/${guild.id}`}
            className="text-xs text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1 font-medium"
          >
            Ver guild <ChevronRight size={12} />
          </Link>

          {(guild.isAdmin || guild.isMember) ? (
            <Link
              href={`/guilds/${guild.id}`}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
            >
              Entrar
            </Link>
          ) : guild.memberCount >= guild.maxMembers ? (
            <span className="text-xs px-3 py-1.5 rounded-lg bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] cursor-not-allowed">
              Cheia
            </span>
          ) : guild.isPublic ? (
            <button
              onClick={() => onJoin(guild)}
              className="text-xs px-3 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-medium transition-colors"
            >
              Entrar
            </button>
          ) : (
            <button
              onClick={() => onJoin(guild)}
              className="text-xs px-3 py-1.5 rounded-lg bg-[var(--muted)] hover:bg-slate-200 border border-[var(--border)] text-[var(--foreground)] font-medium transition-colors flex items-center gap-1"
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
  const leagueCfg = leagueConfig[guild.league?.toUpperCase()] ?? leagueConfig.BRONZE;

  return (
    <Link
      href={`/guilds/${guild.id}`}
      className="group relative rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--card)] hover:border-indigo-300 hover:shadow-md transition-all duration-300 block"
    >
      {/* Top league color accent */}
      <div className="h-1 w-full" style={{ background: leagueCfg.color }} />

      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <GuildBadge type={badgeType} size="lg" showGlow />
          <div className="text-right">
            <div className="text-[10px] text-[var(--muted-foreground)] mb-0.5">Ranking Global</div>
            <div className="text-xl font-black text-[var(--foreground)]">#{guild.rankPosition}</div>
          </div>
        </div>

        <h3 className="text-lg font-black text-[var(--foreground)] mb-1 leading-tight">{guild.name}</h3>
        <p className="text-xs text-[var(--muted-foreground)] line-clamp-2 mb-4 leading-relaxed">{guild.description}</p>

        <div className="flex items-center gap-3 pt-3 border-t border-[var(--border)]">
          <div className="text-center">
            <div className="text-base font-bold text-[var(--foreground)]">{guild.memberCount}</div>
            <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider">membros</div>
          </div>
          <div className="text-center border-l border-[var(--border)] pl-3">
            <div className="text-base font-bold text-amber-600">{(guild.totalXp / 1000).toFixed(0)}k</div>
            <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider">XP total</div>
          </div>
          <div className="text-center border-l border-[var(--border)] pl-3">
            <div className="text-base font-bold text-orange-500">{guild.streak}d</div>
            <div className="text-[9px] text-[var(--muted-foreground)] uppercase tracking-wider">streak</div>
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
  const [invites, setInvites] = useState<GuildInviteDTO[]>([]);
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

  const fetchInvites = useCallback(async () => {
    try {
      const data = await GuildService.getPendingInvites();
      setInvites(data);
    } catch {
      // silent fail
    }
  }, []);

  useEffect(() => {
    fetchGuilds();
    fetchInvites();
  }, [fetchGuilds, fetchInvites]);

  useEffect(() => {
    const t = setTimeout(() => fetchGuilds(search || undefined), 400);
    return () => clearTimeout(t);
  }, [search, fetchGuilds]);

  async function handleAcceptInvite(id: string) {
    try {
      await GuildService.acceptInvite(id);
      notify("Sucesso", "Você entrou na guilda!", "success");
      fetchInvites();
      fetchGuilds();
    } catch (err: any) {
      notify("Erro", err.message || "Erro ao aceitar convite", "error");
    }
  }

  async function handleDeclineInvite(id: string) {
    try {
      await GuildService.declineInvite(id);
      notify("Sucesso", "Convite recusado.", "info");
      fetchInvites();
    } catch (err: any) {
      notify("Erro", err.message || "Erro ao recusar convite", "error");
    }
  }

  function handleJoin(guild: GuildResponseDTO) {
    if (guild.isPublic) {
      notify("Em breve", `Entrar em guilds públicas será liberado em breve.`, "info");
    } else {
      notify("Em breve", `Pedido de entrada na guild "${guild.name}" será liberado em breve.`, "info");
    }
  }

  const myGuilds = guilds.filter(g => g.isAdmin || g.isMember);
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
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
              <Shield size={20} className="text-indigo-600" />
            </div>
            <h1 className="text-3xl font-black text-[var(--foreground)] tracking-tight">Guilds</h1>
          </div>
          <p className="text-[var(--muted-foreground)] text-sm">
            Una-se a outros estudantes, compartilhe materiais e suba no ranking em grupo.
          </p>
        </div>
        <Link
          href="/guilds/criar"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20"
        >
          <Plus size={16} /> Criar Guild
        </Link>
      </motion.div>

      {/* Invites Section */}
      {!loading && invites.length > 0 && (
        <motion.section
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-indigo-50 border border-indigo-100 rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 border border-indigo-200 flex items-center justify-center">
              <Star size={16} className="text-indigo-600" />
            </div>
            <h2 className="text-base font-bold text-[var(--foreground)] tracking-tight">Convites para Guilda</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invites.map((invite) => (
              <div key={invite.id} className="bg-[var(--card)] border border-[var(--border)] rounded-xl p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <GuildBadge type={invite.badge as GuildBadgeType} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[var(--foreground)] truncate">{invite.guildName}</p>
                    <p className="text-[11px] text-[var(--muted-foreground)] truncate">Convidado por {invite.inviterName}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleDeclineInvite(invite.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-[var(--muted-foreground)] hover:text-red-500 transition-colors"
                    title="Recusar"
                  >
                    <Plus size={16} className="rotate-45" />
                  </button>
                  <button
                    onClick={() => handleAcceptInvite(invite.id)}
                    className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
                    title="Aceitar"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      )}

      {/* My Guilds */}
      {!loading && myGuilds.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Star size={13} className="text-amber-500" /> Minhas Guilds
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
          <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-3 flex items-center gap-2">
            <Crown size={13} className="text-purple-500" /> Guilds em Destaque
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featured.map(g => <FeaturedCard key={g.id} guild={g} />)}
          </div>
        </section>
      )}

      {/* Search + Filter */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]" />
          <input
            type="text"
            placeholder="Buscar guilds por nome..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--input)] border border-[var(--border)] rounded-xl text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/10 transition-all"
          />
        </div>
        <div className="flex gap-2 items-center">
          <Filter size={14} className="text-[var(--muted-foreground)]" />
          {(["all", "public", "private"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-xs px-3 py-2 rounded-lg font-medium transition-colors flex items-center gap-1 ${filter === f
                ? "bg-indigo-600 text-white"
                : "bg-[var(--card)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                }`}
            >
              {f === "all" ? "Todas" : f === "public" ? <><Globe size={11} />Públicas</> : <><Lock size={11} />Fechadas</>}
            </button>
          ))}
        </div>
      </div>

      {/* All Guilds */}
      <section>
        <h2 className="text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider mb-4 flex items-center gap-2">
          <Trophy size={13} className="text-indigo-600" /> Todas as Guilds
          {!loading && (
            <span className="text-[var(--muted-foreground)] font-normal normal-case opacity-70">— {filtered.length} encontradas</span>
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
          <div className="text-center py-20 text-[var(--muted-foreground)]">
            <Shield size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-[var(--foreground)]">Nenhuma guild encontrada</p>
            <p className="text-sm mt-1">Tente outros termos ou crie a sua própria guild</p>
          </div>
        )}
      </section>
    </div>
  );
}
