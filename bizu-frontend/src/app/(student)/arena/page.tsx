"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Swords, Trophy, Zap, Users,
    Target, Crown, Flame,
    Shield, CheckCircle2, XCircle,
    BarChart3, Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";
import { DuelService, Duel } from "@/lib/duelService";
import ArenaDuelScreen from "@/components/arena/ArenaDuelScreen";
import Cookies from "js-cookie";

type ArenaTab = "online" | "ranking" | "historico";

interface OnlineUser {
    id: string;
    name: string;
    avatar: string;
    level: number;
    xp: number;
    winRate: number;
    status: "online" | "em_duelo";
}

// SUBJECTS will be fetched dynamically from the selected course


export default function ArenaPage() {
    const [activeTab, setActiveTab] = useState<ArenaTab>("online");
    const [selectedSubject, setSelectedSubject] = useState("Aleatorio");
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
    const [activeDuelId, setActiveDuelId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [myStats, setMyStats] = useState({ wins: 0, losses: 0, winRate: 0, streak: 0 });
    const [availableModules, setAvailableModules] = useState<string[]>([]);


    useEffect(() => {
        const token = Cookies.get("token");
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.sub);
            } catch (e) {
                console.error("Failed to decode token", e);
            }
        }

        const loadData = async () => {
            try {
                const res = await apiFetch("/duelos/online");
                if (res.ok) {
                    const users = await res.json();
                    setOnlineUsers(users.map((u: any) => ({
                        id: u.id,
                        name: u.name || "Usuário",
                        avatar: u.name?.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() || "US",
                        level: 1, // Need separate gamification call per user or include in DTO
                        xp: 0,
                        winRate: 0,
                        status: "online"
                    })));
                }

                const pending = await DuelService.getPendingDuels();
                setPendingDuels(pending);

                const statsRes = await apiFetch("/duelos/me/stats");
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setMyStats({
                        wins: data.wins || 0,
                        losses: data.losses || 0,
                        winRate: data.wins + data.losses > 0 ? Math.round((data.wins / (data.wins + data.losses)) * 100) : 0,
                        streak: 0
                    });
                }

                // Fetch modules for the selected course
                const selectedCourseId = getStoredSelectedCourseId();
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
                console.error("Failed to load arena data", error);
            }
        };


        loadData();
        const interval = setInterval(loadData, 15000);
        return () => clearInterval(interval);
    }, []);

    const handleChallenge = async (opponentId: string) => {
        try {
            await DuelService.createDuel(opponentId, selectedSubject);
            alert("Desafio enviado!");
        } catch (error) {
            console.error(error);
        }
    };

    const handleAccept = async (duelId: string) => {
        try {
            await DuelService.acceptDuel(duelId);
            setActiveDuelId(duelId);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDecline = async (duelId: string) => {
        try {
            await DuelService.declineDuel(duelId);
            setPendingDuels(prev => prev.filter(d => d.id !== duelId));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {activeDuelId && (
                <ArenaDuelScreen
                    duelId={activeDuelId}
                    onClose={() => setActiveDuelId(null)}
                    currentUserId={currentUserId}
                />
            )}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Competitivo</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Arena PVP
                    </h1>
                    <p className="text-sm text-slate-500">Desafie outros concurseiros em duelos de conhecimento.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                        <Trophy size={13} /> {myStats.wins}V / {myStats.losses}D
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Flame size={13} /> {myStats.streak} seguidas
                    </div>
                </div>
            </div>

            {/* Pending Challenges */}
            {pendingDuels.map(duel => (
                <div key={duel.id} className="relative rounded-2xl overflow-hidden p-5 text-white mb-6"
                    style={{ background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #9333EA 100%)" }}>
                    <div className="absolute inset-0 opacity-[0.08]" style={{
                        backgroundImage: "radial-gradient(circle, white 0.8px, transparent 0.8px)",
                        backgroundSize: "24px 24px",
                    }} />
                    <div className="relative z-10 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                            <Swords size={20} />
                        </div>
                        <div className="flex-1">
                            <h4 className="text-[14px] font-extrabold">Novo Desafio!</h4>
                            <p className="text-[12px] text-indigo-200">{duel.challenger.name} te desafiou em {duel.subject}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button onClick={() => handleAccept(duel.id)}
                                className="px-4 py-2 rounded-xl bg-white text-indigo-700 text-[12px] font-bold hover:bg-indigo-50 transition-all">
                                Aceitar
                            </button>
                            <button onClick={() => handleDecline(duel.id)}
                                className="px-4 py-2 rounded-xl bg-white/10 text-white text-[12px] font-bold hover:bg-white/20 transition-all">
                                Recusar
                            </button>
                        </div>
                    </div>
                </div>
            ))}

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Vitorias", val: String(myStats.wins), icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "Derrotas", val: String(myStats.losses), icon: XCircle, bg: "bg-red-50", text: "text-red-500" },
                    { label: "Aproveitamento", val: `${myStats.winRate}%`, icon: Target, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Sequencia", val: `${myStats.streak}W`, icon: Flame, bg: "bg-amber-50", text: "text-amber-600" },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-4 hover:!transform-none">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                                    <Icon size={13} className={s.text} />
                                </div>
                            </div>
                            <div className="text-xl font-extrabold text-slate-900">{s.val}</div>
                            <div className="text-[11px] text-slate-400">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="card-elevated !rounded-2xl p-1.5 flex gap-1 mb-6">
                {([
                    { key: "online" as ArenaTab, label: "Jogadores Online", icon: Users },
                    { key: "ranking" as ArenaTab, label: "Ranking de Duelos", icon: Trophy },
                    { key: "historico" as ArenaTab, label: "Historico", icon: Clock },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                    {/* Online Players */}
                    {activeTab === "online" && onlineUsers.map(user => (
                        <div key={user.id} className="card-elevated !rounded-2xl p-4 hover:!transform-none">
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-[12px] font-bold text-indigo-700">
                                        {user.avatar}
                                    </div>
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${user.status === "online" ? "bg-emerald-400" : "bg-amber-400"
                                        }`} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-[13px] font-bold text-slate-800">{user.name}</span>
                                        {user.status === "em_duelo" && (
                                            <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">Em duelo</span>
                                        )}
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                        <span className="flex items-center gap-0.5"><Zap size={9} className="text-amber-500" /> Lv.{user.level}</span>
                                        <span>{user.xp.toLocaleString()} XP</span>
                                        <span className="flex items-center gap-0.5"><Target size={9} /> {user.winRate}%</span>
                                    </div>
                                </div>
                                <button
                                    disabled={user.status === "em_duelo" || user.id === currentUserId}
                                    onClick={() => handleChallenge(user.id)}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${user.status === "em_duelo" || user.id === currentUserId
                                        ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                        : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:shadow-md"
                                        }`}>
                                    <Swords size={13} /> Desafiar
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Ranking & History placeholders simplified for real data soon */}
                    {activeTab === "ranking" && (
                        <div className="p-8 text-center text-slate-400 italic">Carregando ranking global...</div>
                    )}
                    {activeTab === "historico" && (
                        <div className="p-8 text-center text-slate-400 italic">Sem duelos recentes.</div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Duel Config */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield size={14} className="text-indigo-500" /> Configurar Duelo
                        </h3>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Materia</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {["Aleatorio", ...availableModules].map(s => (
                                        <button key={s} onClick={() => setSelectedSubject(s)}
                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedSubject === s
                                                ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                                : "text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100"
                                                }`}>
                                            {s === "Aleatorio" ? s : s
                                                .replace("Direito ", "D. ")
                                                .replace("Processo ", "P. ")
                                                .replace("Legislação ", "Leg. ")
                                                .substring(0, 20)}
                                        </button>
                                    ))}

                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[11px] text-slate-500">Rodadas iniciais</span>
                                <span className="text-[12px] font-bold text-slate-800">10 questões</span>
                            </div>
                            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[11px] text-slate-500">Sistema</span>
                                <span className="text-[12px] font-bold text-slate-800">Morte Súbita</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Prize */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Crown size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Premios da Semana</span>
                        </div>
                        <p className="text-[11px] text-indigo-500 mb-3">O topo do ranking de Arena ganha prêmios exclusivos!</p>
                        <div className="space-y-1.5">
                            {["1o: 500 XP + 50% off", "2o: 300 XP + 30% off", "3o: 200 XP + 20% off"].map((p, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px]">
                                    <Trophy size={10} className={i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : "text-orange-400"} />
                                    <span className="text-indigo-700 font-semibold">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Acoes Rapidas
                        </h3>
                        <div className="space-y-2">
                            <Link href="/questoes/treino" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Target size={14} className="text-slate-400" /> Treinar antes do duelo
                            </Link>
                            <Link href="/ranking" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <BarChart3 size={14} className="text-slate-400" /> Ver ranking geral
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
