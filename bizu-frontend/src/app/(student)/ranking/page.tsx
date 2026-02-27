"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    BarChart3, Trophy, Flame, Star, Medal,
    TrendingUp, ChevronRight, Target, Crown,
    ArrowUp, ArrowDown, Minus, Zap, Filter,
    Loader2
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";

type RankingTab = "geral" | "semanal" | "materia";

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

// SUBJECTS will be fetched dynamically from the selected course


export default function RankingStudentPage() {
    const [activeTab, setActiveTab] = useState<RankingTab>("geral");
    const [selectedSubject, setSelectedSubject] = useState("Todas");
    const [topUsers, setTopUsers] = useState<RankedUser[]>([]);
    const [myRank, setMyRank] = useState<RankedUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [availableModules, setAvailableModules] = useState<string[]>([]);


    useEffect(() => {
        async function fetchRanking() {
            setLoading(true);
            try {
                const selectedCourseId = getStoredSelectedCourseId();
                const courseQuery = selectedCourseId ? `courseId=${selectedCourseId}` : "";

                // Fetch ranking data
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

                // Fetch modules for the selected course
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

    const subjects = ["Todas", ...availableModules];


    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const displayUsers = topUsers;
    const podiumOrder = topUsers.length >= 3
        ? [topUsers[1], topUsers[0], topUsers[2]]
        : topUsers.length === 2
            ? [topUsers[1], topUsers[0]]
            : topUsers.length === 1
                ? [topUsers[0]]
                : [];

    const podiumHeights = ["h-28", "h-36", "h-24"];
    const podiumColors = [
        { bg: "from-slate-300 to-slate-400", text: "text-slate-700", badge: "bg-slate-200" },
        { bg: "from-amber-400 to-yellow-500", text: "text-amber-800", badge: "bg-amber-100" },
        { bg: "from-orange-300 to-amber-400", text: "text-orange-800", badge: "bg-orange-100" },
    ];

    const DeltaIndicator = ({ delta }: { delta?: number }) => {
        if (!delta || delta === 0) return <span className="text-[10px] font-bold text-slate-400 flex items-center gap-0.5"><Minus size={9} /></span>;
        if (delta > 0) return <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5"><ArrowUp size={9} />{delta}</span>;
        return <span className="text-[10px] font-bold text-red-500 flex items-center gap-0.5"><ArrowDown size={9} />{Math.abs(delta)}</span>;
    };

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Competicao</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Ranking
                    </h1>
                    <p className="text-sm text-slate-500">Acompanhe sua posicao e suba no leaderboard.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <BarChart3 size={13} /> #{myRank?.rank || "-"}
                    </div>
                    {myRank?.delta !== undefined && myRank.delta !== 0 && (
                        <div className={`flex items-center gap-1.5 text-[11px] font-bold ${myRank.delta > 0 ? "text-emerald-600 bg-emerald-50 border border-emerald-100" : "text-red-500 bg-red-50 border border-red-100"} px-3 py-1.5 rounded-full`}>
                            {myRank.delta > 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />} {Math.abs(myRank.delta)} posicoes
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="card-elevated !rounded-2xl p-1.5 flex gap-1 mb-6">
                {([
                    { key: "geral" as RankingTab, label: "Geral", icon: Trophy },
                    { key: "semanal" as RankingTab, label: "Semanal", icon: Flame },
                    { key: "materia" as RankingTab, label: "Por Materia", icon: Target },
                ]).map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all ${active ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                                }`}>
                            <Icon size={14} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* Subject filter for "Por Materia" tab */}
            {activeTab === "materia" && (
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 mb-5 scrollbar-hide">
                    {subjects.map(s => (
                        <button key={s} onClick={() => setSelectedSubject(s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${selectedSubject === s
                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                }`}>
                            {s === "Todas" ? s : s
                                .replace("Direito ", "D. ")
                                .replace("Processo ", "P. ")
                                .replace("Legislação ", "Leg. ")
                                .substring(0, 25)}
                        </button>
                    ))}
                </div>

            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    {/* Podium */}
                    <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                        <div className="flex items-end justify-center gap-4 pt-4 pb-2 text-center">
                            {podiumOrder.map((user, i) => {
                                const rank = user.rank;
                                const colors = rank === 1
                                    ? { bg: "from-amber-400 to-yellow-500", text: "text-amber-800", badge: "bg-amber-100" }
                                    : rank === 2
                                        ? { bg: "from-slate-300 to-slate-400", text: "text-slate-700", badge: "bg-slate-200" }
                                        : { bg: "from-orange-300 to-amber-400", text: "text-orange-800", badge: "bg-orange-100" };

                                return (
                                    <div key={`${user.name}-${i}`} className="flex flex-col items-center">
                                        <div className="relative mb-3">
                                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center overflow-hidden shadow-lg border-2 border-white/20`}>
                                                {user.avatar && user.avatar.length > 2 ? (
                                                    <img
                                                        src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                                                        className="w-full h-full object-cover"
                                                        alt={user.name}
                                                    />
                                                ) : (
                                                    <span className="text-white font-extrabold text-sm">{user.avatar}</span>
                                                )}
                                            </div>
                                            {rank === 1 && (
                                                <Crown size={16} className="text-amber-500 absolute -top-3.5 left-1/2 -translate-x-1/2 drop-shadow-sm" />
                                            )}
                                        </div>
                                        <span className="text-[12px] font-bold text-slate-800 mb-0.5 max-w-[70px] truncate">{user.name.split(" ")[0]}</span>
                                        <span className="text-[10px] text-slate-400 font-semibold mb-2">{user.xp.toLocaleString()} XP</span>
                                        <div className={`${podiumHeights[i]} w-20 rounded-t-xl bg-gradient-to-t ${colors.bg} flex items-start justify-center pt-3 opacity-90 shadow-sm relative group`}>
                                            <span className="text-white font-extrabold text-lg drop-shadow-md">#{rank}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Full Ranking List */}
                    <div className="card-elevated !rounded-2xl hover:!transform-none overflow-hidden">
                        <div className="px-5 py-4 border-b border-slate-100">
                            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                <Trophy size={14} className="text-indigo-500" />
                                {activeTab === "geral" ? "Ranking Geral" : activeTab === "semanal" ? "Ranking Semanal" : `Ranking - ${selectedSubject}`}
                            </h3>
                        </div>
                        <div className="divide-y divide-slate-50">
                            {displayUsers.length > 0 && displayUsers.map(user => (
                                <Link key={user.rank} href={user.nickname ? `/perfil/${user.nickname}` : '#'} className={`flex items-center gap-3 px-5 py-3 hover:bg-slate-50/50 transition-colors ${user.rank <= 3 ? "bg-indigo-50/10" : ""}`}>
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[12px] ${user.rank === 1 ? "bg-amber-100 text-amber-700" :
                                        user.rank === 2 ? "bg-slate-200 text-slate-600" :
                                            user.rank === 3 ? "bg-orange-100 text-orange-700" :
                                                "bg-slate-100 text-slate-500"
                                        }`}>
                                        {user.rank}
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center overflow-hidden text-[11px] font-bold text-indigo-700">
                                        {user.avatar && user.avatar.length > 2 ? (
                                            <img
                                                src={user.avatar.startsWith('http') ? user.avatar : `${process.env.NEXT_PUBLIC_API_URL}${user.avatar}`}
                                                className="w-full h-full object-cover"
                                                alt={user.name}
                                            />
                                        ) : (
                                            user.avatar
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-slate-800">{user.name}</div>
                                        {user.nickname && <div className="text-[10px] text-slate-400">@{user.nickname}</div>}
                                        <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                                            <span className="flex items-center gap-0.5"><Flame size={9} className="text-amber-500" /> {user.streak}d</span>
                                            {user.accuracy !== undefined && user.accuracy > 0 ? <span className="flex items-center gap-0.5"><Target size={9} /> {user.accuracy}%</span> : null}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[12px] font-extrabold text-slate-800">{user.xp.toLocaleString()} XP</div>
                                        <DeltaIndicator delta={user.delta} />
                                    </div>
                                </Link>
                            ))}

                            {/* My position */}
                            {myRank && (
                                <div className="flex items-center gap-3 px-5 py-3 bg-indigo-50 border-t-2 border-indigo-200 sticky bottom-0">
                                    <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-extrabold text-[11px] text-white">
                                        {myRank.rank > 0 ? myRank.rank : "-"}
                                    </div>
                                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden text-[11px] font-bold text-white">
                                        {myRank.avatar && myRank.avatar.length > 2 ? (
                                            <img
                                                src={myRank.avatar.startsWith('http') ? myRank.avatar : `${process.env.NEXT_PUBLIC_API_URL}${myRank.avatar}`}
                                                className="w-full h-full object-cover"
                                                alt={myRank.name}
                                            />
                                        ) : (
                                            myRank.avatar
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[13px] font-bold text-indigo-800">{myRank.name} (sua posicao)</div>
                                        <div className="text-[10px] text-indigo-500 flex items-center gap-2">
                                            <span className="flex items-center gap-0.5"><Flame size={9} /> {myRank.streak}d</span>
                                            {myRank.accuracy !== undefined && myRank.accuracy > 0 ? <span className="flex items-center gap-0.5"><Target size={9} /> {myRank.accuracy}%</span> : null}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[12px] font-extrabold text-indigo-800">{myRank.xp.toLocaleString()} XP</div>
                                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5 justify-end">
                                            {myRank.delta !== undefined && myRank.delta > 0 ? <><ArrowUp size={9} />{myRank.delta}</> : <span>-</span>}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Your Stats */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Star size={14} className="text-amber-500" /> Suas Estatisticas
                        </h3>
                        <div className="space-y-3">
                            {myRank && [
                                { label: "Posicao atual", value: myRank.rank > 0 ? `#${myRank.rank}` : "-", color: "text-indigo-600" },
                                { label: "XP total", value: myRank.xp > 0 ? myRank.xp.toLocaleString() : "0", color: "text-violet-600" },
                                { label: "Ofensiva", value: myRank.streak > 0 ? `${myRank.streak} dias` : "0 dias", color: "text-amber-600" },
                                { label: "Precisao", value: myRank.accuracy !== undefined && myRank.accuracy > 0 ? `${myRank.accuracy}%` : "0%", color: "text-emerald-600" },
                                { label: "Questoes/semana", value: String(myRank.questionsThisWeek || 0), color: "text-indigo-600" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between py-1.5">
                                    <span className="text-[12px] text-slate-500">{s.label}</span>
                                    <span className={`text-[13px] font-extrabold ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Weekly Goal */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Meta Semanal</span>
                        </div>
                        <p className="text-[11px] text-indigo-500 mb-3">Resolva 100 questoes esta semana para subir no ranking.</p>
                        <div className="text-2xl font-extrabold text-indigo-700 mb-1">{myRank?.questionsThisWeek || 0}/100</div>
                        <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden mt-2">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
                                style={{ width: `${Math.min(((myRank?.questionsThisWeek || 0) / 100) * 100, 100)}%` }} />
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <TrendingUp size={14} className="text-emerald-500" /> Como subir
                        </h3>
                        <div className="space-y-2">
                            {[
                                "Mantenha sua ofensiva diaria",
                                "Resolva questoes com alta precisao",
                                "Participe dos simulados semanais",
                                "Venca duelos na Arena PVP",
                            ].map((tip, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                    {tip}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
