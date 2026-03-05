"use client";

import { useState, useEffect } from "react";
import {
    Trophy, Flame, Star, Medal,
    TrendingUp, Target, Crown,
    ArrowUp, ArrowDown, Minus, Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import { getStoredSelectedCourseId } from "@/lib/course-selection";
import { useAuth } from "@/components/AuthProvider";
import { Avatar } from "@/components/ui/Avatar";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { UserProfileModal } from "@/components/UserProfileModal";

type RankingTab = "geral" | "semanal" | "simulado" | "materia";

interface RankedUser {
    rank: number;
    name: string;
    nickname?: string;
    avatar: string;
    xp: number;
    streak: number;
    accuracy?: number;
    questionsThisWeek?: number;
    delta?: number;
}

interface RankedSimulado {
    rank: number;
    id: string;
    name: string;
    nickname?: string;
    avatar: string;
    best_score: number;
    total_simulados?: number;
}

export default function RankingStudentPage() {
    const { isFree } = useAuth();
    const [activeTab, setActiveTab] = useState<RankingTab>("geral");
    const [selectedSubject, setSelectedSubject] = useState("Todas");
    const [topUsers, setTopUsers] = useState<RankedUser[]>([]);
    const [myRank, setMyRank] = useState<RankedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [selectedProfileNickname, setSelectedProfileNickname] = useState<string | null>(null);
    const [simuladoRanking, setSimuladoRanking] = useState<RankedSimulado[]>([]);
    const [simuladoLoading, setSimuladoLoading] = useState(false);

    useEffect(() => {
        async function fetchRanking() {
            setLoading(true);
            try {
                const selectedCourseId = getStoredSelectedCourseId();
                const courseQuery = selectedCourseId ? `courseId=${selectedCourseId}` : "";

                const [globalRes, meRes] = await Promise.all([
                    apiFetch(`/student/ranking/global?limit=50${courseQuery ? `&${courseQuery}` : ""}`),
                    apiFetch(`/student/ranking/me${courseQuery ? `?${courseQuery}` : ""}`)
                ]);

                if (globalRes.ok) {
                    const data = await globalRes.json();
                    setTopUsers(data.map((u: any) => ({
                        rank: parseInt(u.rank),
                        name: u.name,
                        nickname: u.nickname,
                        avatar: u.avatar || u.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase(),
                        xp: u.xp,
                        streak: u.streak || 0,
                        accuracy: u.accuracy ? Math.round(Number(u.accuracy)) : 0,
                        questionsThisWeek: u.questionsThisWeek || 0,
                        delta: u.delta || 0
                    })));
                }

                if (meRes.ok) {
                    const u = await meRes.json();
                    setMyRank({
                        rank: parseInt(u.rank),
                        name: "Você",
                        nickname: u.nickname,
                        avatar: u.avatar || "EU",
                        xp: u.xp,
                        streak: u.streak || 0,
                        accuracy: u.accuracy ? Math.round(Number(u.accuracy)) : 0,
                        questionsThisWeek: u.questionsThisWeek || 0,
                        delta: u.delta || 0
                    });
                }

                if (selectedCourseId) {
                    const courseRes = await apiFetch(`/public/courses/${selectedCourseId}`);
                    if (courseRes.ok) {
                        const courseData = await courseRes.json();
                        if (courseData.modules) {
                            setAvailableModules(courseData.modules.map((m: any) => m.title));
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching ranking or modules:", error);
            } finally {
                setLoading(false);
            }
        }
        fetchRanking();
    }, []);

    const fetchSimuladoRanking = async () => {
        if (simuladoRanking.length > 0) return;
        setSimuladoLoading(true);
        try {
            const selectedCourseId = getStoredSelectedCourseId();
            const courseQuery = selectedCourseId ? `&courseId=${selectedCourseId}` : "";
            const res = await apiFetch(`/student/ranking/simulados?limit=50${courseQuery}`);
            if (res.ok) {
                const data = await res.json();
                setSimuladoRanking(data.map((u: any, i: number) => ({
                    rank: Number(u.rank ?? i + 1),
                    id: u.id,
                    name: u.name || "Usuário",
                    nickname: u.nickname,
                    avatar: u.avatar || (u.name || "?").split(" ").map((n: string) => n[0]).join("").substring(0, 2).toUpperCase(),
                    best_score: Number(u.best_score ?? 0),
                    total_simulados: Number(u.total_simulados ?? 0),
                })));
            }
        } catch (error) {
            console.error("Error fetching simulado ranking:", error);
        } finally {
            setSimuladoLoading(false);
        }
    };

    const handleTabChange = (tab: RankingTab) => {
        setActiveTab(tab);
        if (tab === "simulado") fetchSimuladoRanking();
    };

    const subjects = ["Todas", ...availableModules];
    const maxXP = topUsers.length > 0 ? Math.max(...topUsers.map(u => u.xp)) : 1;
    const weeklyProgress = Math.min(((myRank?.questionsThisWeek || 0) / 100) * 100, 100);

    if (loading) {
        return (
            <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-5">
                <Skeleton className="h-28 w-full rounded-2xl" />
                <Skeleton className="h-12 w-full rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">
                        <Skeleton className="h-64 w-full rounded-2xl" />
                        <Skeleton className="h-96 w-full rounded-2xl" />
                    </div>
                    <div className="space-y-5">
                        <Skeleton className="h-52 w-full rounded-2xl" />
                        <Skeleton className="h-44 w-full rounded-2xl" />
                    </div>
                </div>
            </div>
        );
    }

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Ranking Premium"
                    description="O Ranking de estudantes é exclusivo para assinantes. Veja sua posição e compita com os melhores!"
                />
            </div>
        );
    }

    const podiumOrder = topUsers.length >= 3
        ? [topUsers[1], topUsers[0], topUsers[2]]
        : topUsers.length === 2
            ? [topUsers[1], topUsers[0]]
            : topUsers.length === 1
                ? [topUsers[0]]
                : [];

    const DeltaIndicator = ({ delta }: { delta?: number }) => {
        if (!delta || delta === 0) return (
            <span className="text-[10px] font-bold text-slate-300 flex items-center gap-0.5"><Minus size={9} /></span>
        );
        if (delta > 0) return (
            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><ArrowUp size={9} />{delta}</span>
        );
        return (
            <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><ArrowDown size={9} />{Math.abs(delta)}</span>
        );
    };

    // Per-rank visual config
    const rankMeta = (rank: number) => {
        if (rank === 1) return {
            ring: "ring-2 ring-amber-400",
            avatarBg: "shadow-[0_0_0_4px_#fef3c7]",
            badgeBg: "bg-amber-50 text-amber-700 border border-amber-200",
            accent: "text-amber-600",
            accentBg: "bg-amber-50",
            bar: "bg-gradient-to-r from-amber-400 to-yellow-300",
            platform: "bg-gradient-to-t from-amber-500 to-amber-300",
            leftBorder: "bg-amber-400",
            podiumH: "h-32",
            label: "Ouro",
        };
        if (rank === 2) return {
            ring: "ring-2 ring-slate-400",
            avatarBg: "shadow-[0_0_0_4px_#f1f5f9]",
            badgeBg: "bg-slate-100 text-slate-600 border border-slate-200",
            accent: "text-slate-500",
            accentBg: "bg-slate-50",
            bar: "bg-gradient-to-r from-slate-400 to-slate-300",
            platform: "bg-gradient-to-t from-slate-500 to-slate-400",
            leftBorder: "bg-slate-400",
            podiumH: "h-20",
            label: "Prata",
        };
        if (rank === 3) return {
            ring: "ring-2 ring-orange-300",
            avatarBg: "shadow-[0_0_0_4px_#fff7ed]",
            badgeBg: "bg-orange-50 text-orange-700 border border-orange-200",
            accent: "text-orange-600",
            accentBg: "bg-orange-50",
            bar: "bg-gradient-to-r from-orange-400 to-amber-300",
            platform: "bg-gradient-to-t from-orange-500 to-orange-400",
            leftBorder: "bg-orange-400",
            podiumH: "h-14",
            label: "Bronze",
        };
        return {
            ring: "",
            avatarBg: "",
            badgeBg: "bg-slate-100 text-slate-500 border border-slate-200",
            accent: "text-slate-500",
            accentBg: "bg-slate-50",
            bar: "bg-gradient-to-r from-indigo-400 to-violet-400",
            platform: "bg-slate-300",
            leftBorder: "bg-slate-200",
            podiumH: "h-10",
            label: "",
        };
    };

    const MEDALS = ["🥇", "🥈", "🥉"];
    // Podium visual heights: [2nd, 1st, 3rd]
    const PODIUM_H = ["h-20", "h-32", "h-14"];

    return (
        <>
            <div className="p-4 lg:p-8 w-full max-w-[1600px] mx-auto">

                {/* ── HEADER ── */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Competição</span>
                        </div>
                        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">Ranking</h1>
                        <p className="text-sm text-slate-500">Acompanhe sua posição e suba no leaderboard</p>
                    </div>

                    {myRank && (
                        <div className="flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                                <Trophy size={12} /> #{myRank.rank > 0 ? myRank.rank : "–"}
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-violet-600 bg-violet-50 border border-violet-100 px-3 py-1.5 rounded-full">
                                <Zap size={12} /> {(myRank.xp || 0).toLocaleString()} XP
                            </div>
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                                <Flame size={12} /> {myRank.streak}d streak
                            </div>
                            {!!myRank.delta && (
                                <div className={`flex items-center gap-1.5 text-[11px] font-bold px-3 py-1.5 rounded-full ${myRank.delta > 0 ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-red-500 bg-red-50 border border-red-100"}`}>
                                    {myRank.delta > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                                    {Math.abs(myRank.delta ?? 0)} posições
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* ── TABS ── */}
                <div className="card-elevated !rounded-2xl p-1.5 flex gap-1 mb-5 hover:!transform-none">
                    {([
                        { key: "geral" as RankingTab, label: "Geral", icon: Trophy },
                        { key: "semanal" as RankingTab, label: "Semanal", icon: Flame },
                        { key: "simulado" as RankingTab, label: "Simulado", icon: Star },
                        { key: "materia" as RankingTab, label: "Por Matéria", icon: Target },
                    ]).map(tab => {
                        const Icon = tab.icon;
                        const active = activeTab === tab.key;
                        return (
                            <button key={tab.key} onClick={() => handleTabChange(tab.key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                                    active
                                        ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm"
                                        : "text-slate-500 hover:bg-slate-50"
                                }`}>
                                <Icon size={13} />{tab.label}
                            </button>
                        );
                    })}
                </div>

                {/* Subject filter */}
                {activeTab === "materia" && (
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-hide">
                        {subjects.map(s => (
                            <button key={s} onClick={() => setSelectedSubject(s)}
                                className={`px-3 py-1.5 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all border ${
                                    selectedSubject === s
                                        ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50 border-transparent"
                                }`}>
                                {s === "Todas" ? s : s.replace("Direito ", "D. ").replace("Processo ", "P. ").replace("Legislação ", "Leg. ").substring(0, 25)}
                            </button>
                        ))}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                    <div className="lg:col-span-2 space-y-5">

                        {/* ── SIMULADO RANKING ── */}
                        {activeTab === "simulado" && (
                            <div className="card-elevated !rounded-2xl hover:!transform-none overflow-hidden">
                                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                    <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2">
                                        <Star size={13} className="text-amber-500" />
                                        Ranking de Simulados
                                    </h3>
                                    <span className="text-[10px] text-slate-400 font-semibold tabular-nums">{simuladoRanking.length} participantes</span>
                                </div>
                                {simuladoLoading ? (
                                    <div className="divide-y divide-slate-50">
                                        {[1,2,3,4,5].map(i => (
                                            <div key={i} className="flex items-center gap-3 px-5 py-3">
                                                <div className="w-8 h-8 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                                                <div className="w-9 h-9 rounded-xl bg-slate-100 animate-pulse shrink-0" />
                                                <div className="flex-1 space-y-1.5">
                                                    <div className="h-3 w-32 bg-slate-100 rounded animate-pulse" />
                                                    <div className="h-2 w-20 bg-slate-100 rounded animate-pulse" />
                                                </div>
                                                <div className="h-4 w-14 bg-slate-100 rounded animate-pulse" />
                                            </div>
                                        ))}
                                    </div>
                                ) : simuladoRanking.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-16 gap-3">
                                        <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center">
                                            <Trophy size={22} className="text-amber-400" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-[13px] font-bold text-slate-500">Nenhum simulado realizado ainda</p>
                                            <p className="text-[11px] text-slate-400 mt-0.5">Seja o primeiro a pontuar!</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {simuladoRanking.map((user, idx) => {
                                            const m = rankMeta(user.rank);
                                            const maxScore = simuladoRanking[0]?.best_score || 1;
                                            const scorePct = maxScore > 0 ? (user.best_score / maxScore) * 100 : 0;
                                            return (
                                                <button
                                                    type="button"
                                                    key={user.id}
                                                    onClick={() => user.nickname && setSelectedProfileNickname(user.nickname)}
                                                    className="rank-row row-slide w-full text-left relative flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors"
                                                    style={{ animationDelay: `${idx * 0.025}s` }}
                                                >
                                                    <div className={`xp-fill absolute inset-y-0 left-0 ${m.bar} pointer-events-none rounded-r-xl`} style={{ width: `${scorePct}%` }} />
                                                    {user.rank <= 3 && <div className={`absolute left-0 inset-y-0 w-[3px] ${m.leftBorder} rounded-r`} />}
                                                    <div className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center font-black text-[13px] flex-shrink-0 ${m.badgeBg}`}>
                                                        {user.rank <= 3 ? MEDALS[user.rank - 1] : user.rank}
                                                    </div>
                                                    <div className={`relative z-10 flex-shrink-0 rounded-xl overflow-hidden ${user.rank <= 3 ? m.ring : ""}`}>
                                                        <Avatar src={user.avatar} name={user.name} size="sm" className="border-0" />
                                                    </div>
                                                    <div className="relative z-10 flex-1 min-w-0">
                                                        <div className="text-[13px] font-bold text-slate-800 truncate">{user.name}</div>
                                                        {user.nickname && <div className="text-[10px] text-slate-400">@{user.nickname}</div>}
                                                        {user.total_simulados !== undefined && user.total_simulados > 0 && (
                                                            <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-0.5">
                                                                <Trophy size={8} />{user.total_simulados} simulado{user.total_simulados !== 1 ? "s" : ""}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="relative z-10 text-right flex-shrink-0">
                                                        <div className={`text-[13px] font-black ${user.rank <= 3 ? m.accent : "text-slate-700"}`}>
                                                            {user.best_score.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                                                            <span className="text-[10px] font-bold text-slate-400 ml-0.5">pts</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ── PODIUM ── */}
                        {activeTab !== "simulado" && podiumOrder.length > 0 && (
                            <div className="card-elevated !rounded-2xl p-6 pb-0 hover:!transform-none overflow-hidden relative">
                                {/* Subtle tinted bg */}
                                <div className="absolute inset-0 bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none" />

                                <div className="flex items-end justify-center gap-4 sm:gap-10 pt-6 relative z-10">
                                    {podiumOrder.map((user, i) => {
                                        const m = rankMeta(user.rank);
                                        return (
                                            <div
                                                key={`${user.name}-${i}`}
                                                className="flex flex-col items-center cursor-pointer group"
                                                onClick={() => user.nickname && setSelectedProfileNickname(user.nickname)}
                                            >
                                                {/* Crown for #1 */}
                                                {user.rank === 1 ? (
                                                    <Crown size={20} className="crown-bob text-amber-500 mb-1 drop-shadow-sm" />
                                                ) : (
                                                    <div className="h-[28px]" />
                                                )}

                                                {/* Avatar */}
                                                <div className={`rounded-full group-hover:scale-105 transition-transform mb-3 ${m.avatarBg}`}>
                                                    <Avatar
                                                        src={user.avatar}
                                                        name={user.name}
                                                        size={user.rank === 1 ? "lg" : "md"}
                                                        className={`border-2 border-white ${m.ring}`}
                                                    />
                                                </div>

                                                {/* Name + XP */}
                                                <span className="text-[12px] font-black text-slate-800 mb-0.5 max-w-[80px] truncate text-center">
                                                    {user.name.split(" ")[0]}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-semibold mb-3">
                                                    {user.xp.toLocaleString()} XP
                                                </span>

                                                {/* Platform */}
                                                <div className={`${PODIUM_H[i]} w-20 sm:w-24 rounded-t-2xl ${m.platform} relative flex items-start justify-center pt-3 group-hover:brightness-105 transition-all shadow-sm`}>
                                                    <span className="text-white font-black text-lg drop-shadow">#{user.rank}</span>
                                                    <div className="absolute inset-0 rounded-t-2xl bg-gradient-to-b from-white/25 to-transparent pointer-events-none" />
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="h-px mt-0 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
                            </div>
                        )}

                        {/* ── RANKING LIST ── */}
                        <div className="card-elevated !rounded-2xl hover:!transform-none overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-[13px] font-black text-slate-800 flex items-center gap-2">
                                    <Trophy size={13} className="text-indigo-500" />
                                    {activeTab === "geral" ? "Ranking Geral" : activeTab === "semanal" ? "Ranking Semanal" : `Ranking — ${selectedSubject}`}
                                </h3>
                                <span className="text-[10px] text-slate-400 font-semibold tabular-nums">{topUsers.length} participantes</span>
                            </div>

                            <div className="divide-y divide-slate-50">
                                {topUsers.map((user, idx) => {
                                    const m = rankMeta(user.rank);
                                    const xpPct = maxXP > 0 ? (user.xp / maxXP) * 100 : 0;

                                    return (
                                        <button
                                            type="button"
                                            key={user.rank}
                                            onClick={() => user.nickname && setSelectedProfileNickname(user.nickname)}
                                            className="rank-row row-slide w-full text-left relative flex items-center gap-3 px-5 py-3 hover:bg-slate-50/70 transition-colors"
                                            style={{ animationDelay: `${idx * 0.025}s` }}
                                        >
                                            {/* XP background fill */}
                                            <div
                                                className={`xp-fill absolute inset-y-0 left-0 ${m.bar} pointer-events-none rounded-r-xl`}
                                                style={{ width: `${xpPct}%` }}
                                            />

                                            {/* Top 3 left accent */}
                                            {user.rank <= 3 && (
                                                <div className={`absolute left-0 inset-y-0 w-[3px] ${m.leftBorder} rounded-r`} />
                                            )}

                                            {/* Rank badge */}
                                            <div className={`relative z-10 w-8 h-8 rounded-xl flex items-center justify-center font-black text-[13px] flex-shrink-0 ${m.badgeBg}`}>
                                                {user.rank <= 3 ? MEDALS[user.rank - 1] : user.rank}
                                            </div>

                                            {/* Avatar */}
                                            <div className={`relative z-10 flex-shrink-0 rounded-xl overflow-hidden ${user.rank <= 3 ? m.ring : ""}`}>
                                                <Avatar src={user.avatar} name={user.name} size="sm" className="border-0" />
                                            </div>

                                            {/* Info */}
                                            <div className="relative z-10 flex-1 min-w-0">
                                                <div className="text-[13px] font-bold text-slate-800 truncate">{user.name}</div>
                                                {user.nickname && (
                                                    <div className="text-[10px] text-slate-400">@{user.nickname}</div>
                                                )}
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    {user.streak > 0 && (
                                                        <span className="text-[10px] text-amber-500 flex items-center gap-0.5 font-semibold">
                                                            <Flame size={9} />{user.streak}d
                                                        </span>
                                                    )}
                                                    {user.accuracy !== undefined && user.accuracy > 0 && (
                                                        <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-semibold">
                                                            <Target size={9} />{user.accuracy}%
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* XP + Delta */}
                                            <div className="relative z-10 text-right flex-shrink-0">
                                                <div className={`text-[13px] font-black ${user.rank <= 3 ? m.accent : "text-slate-700"}`}>
                                                    {user.xp.toLocaleString()}
                                                    <span className="text-[10px] font-bold text-slate-400 ml-0.5">XP</span>
                                                </div>
                                                <DeltaIndicator delta={user.delta} />
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* My position sticky row */}
                                {myRank && (
                                    <div className="relative flex items-center gap-3 px-5 py-3.5 bg-indigo-50 border-t-2 border-indigo-200">
                                        <div className="absolute left-0 inset-y-0 w-[3px] bg-gradient-to-b from-indigo-500 to-violet-500 rounded-r" />

                                        <div className="w-8 h-8 rounded-xl bg-indigo-100 border border-indigo-200 flex items-center justify-center font-black text-[11px] text-indigo-700 flex-shrink-0">
                                            {myRank.rank > 0 ? myRank.rank : "–"}
                                        </div>
                                        <div className="flex-shrink-0 rounded-xl overflow-hidden ring-2 ring-indigo-400">
                                            <Avatar
                                                src={myRank.avatar}
                                                name={myRank.name}
                                                size="sm"
                                                className="border-0"
                                                fallbackClassName="bg-indigo-600 text-white"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-bold text-indigo-800">Você</div>
                                            <div className="text-[10px] text-indigo-400 flex items-center gap-2">
                                                <span className="flex items-center gap-0.5"><Flame size={9} />{myRank.streak}d</span>
                                                {myRank.accuracy !== undefined && myRank.accuracy > 0 && (
                                                    <span className="flex items-center gap-0.5"><Target size={9} />{myRank.accuracy}%</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="text-right flex-shrink-0">
                                            <div className="text-[13px] font-black text-indigo-700">
                                                {myRank.xp.toLocaleString()}
                                                <span className="text-[10px] font-bold text-indigo-400 ml-0.5">XP</span>
                                            </div>
                                            <DeltaIndicator delta={myRank.delta} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* ── SIDEBAR ── */}
                    <div className="space-y-4">

                        {/* Suas Estatísticas */}
                        <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-xl bg-indigo-100 flex items-center justify-center">
                                    <Star size={13} className="text-indigo-600" />
                                </div>
                                <h3 className="text-[13px] font-black text-slate-800">Suas Estatísticas</h3>
                            </div>
                            {myRank && (
                                <div className="grid grid-cols-2 gap-2">
                                    {[
                                        { label: "Posição", value: myRank.rank > 0 ? `#${myRank.rank}` : "–", color: "text-indigo-600", bg: "bg-indigo-50 border-indigo-100" },
                                        { label: "XP Total", value: (myRank.xp || 0).toLocaleString(), color: "text-violet-600", bg: "bg-violet-50 border-violet-100" },
                                        { label: "Ofensiva", value: `${myRank.streak}d`, color: "text-amber-600", bg: "bg-amber-50 border-amber-100" },
                                        { label: "Precisão", value: `${myRank.accuracy || 0}%`, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-100" },
                                    ].map(s => (
                                        <div key={s.label} className={`rounded-2xl border ${s.bg} p-3.5`}>
                                            <div className="text-[9px] uppercase tracking-widest text-slate-400 font-black mb-1.5">{s.label}</div>
                                            <div className={`text-xl font-black ${s.color} leading-none`}>{s.value}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Meta Semanal */}
                        <div className="rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 to-violet-50 p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={13} className="text-indigo-600" />
                                <span className="text-[12px] font-black text-indigo-800">Meta Semanal</span>
                            </div>
                            <p className="text-[11px] text-indigo-500/80 mb-4 leading-relaxed">
                                Resolva 100 questões para subir no ranking semanal.
                            </p>
                            <div className="flex items-baseline gap-1 mb-3">
                                <span className="text-3xl font-black text-indigo-700">{myRank?.questionsThisWeek || 0}</span>
                                <span className="text-sm font-bold text-indigo-300">/100</span>
                            </div>
                            <div className="h-2 bg-indigo-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                                    style={{ width: `${weeklyProgress}%` }}
                                />
                            </div>
                            <div className="text-[10px] text-indigo-400 font-semibold mt-2">
                                {weeklyProgress >= 100 ? "Meta atingida!" : `${Math.round(weeklyProgress)}% concluído`}
                            </div>
                        </div>

                        {/* Dicas */}
                        <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-7 h-7 rounded-xl bg-emerald-100 flex items-center justify-center">
                                    <TrendingUp size={13} className="text-emerald-600" />
                                </div>
                                <h3 className="text-[13px] font-black text-slate-800">Como subir</h3>
                            </div>
                            <div className="space-y-3">
                                {[
                                    { icon: Flame, label: "Mantenha sua ofensiva diária", color: "text-amber-500" },
                                    { icon: Target, label: "Resolva questões com alta precisão", color: "text-emerald-600" },
                                    { icon: Star, label: "Participe dos simulados semanais", color: "text-indigo-500" },
                                    { icon: Medal, label: "Vença duelos na Arena PvP", color: "text-violet-600" },
                                ].map((tip, i) => {
                                    const TipIcon = tip.icon;
                                    return (
                                        <div key={i} className="flex items-center gap-2.5 text-[11px] text-slate-500">
                                            <TipIcon size={11} className={`${tip.color} flex-shrink-0`} />
                                            {tip.label}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                <UserProfileModal
                    nickname={selectedProfileNickname}
                    isOpen={!!selectedProfileNickname}
                    onClose={() => setSelectedProfileNickname(null)}
                />
            </div>
        </>
    );
}
