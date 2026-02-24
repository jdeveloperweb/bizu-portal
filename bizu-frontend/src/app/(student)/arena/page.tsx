"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Swords, Trophy, Zap, Timer, Users,
    ChevronRight, Target, Crown, Flame,
    Shield, Star, CheckCircle2, XCircle,
    TrendingUp, BarChart3, Clock,
} from "lucide-react";

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

interface DuelHistory {
    id: string;
    opponent: string;
    avatar: string;
    subject: string;
    result: "vitoria" | "derrota";
    myScore: number;
    opponentScore: number;
    date: string;
    xpGained: number;
}

const onlineUsers: OnlineUser[] = [
    { id: "1", name: "Maria Silva", avatar: "MS", level: 15, xp: 12000, winRate: 82, status: "online" },
    { id: "2", name: "Ricardo Oliveira", avatar: "RO", level: 10, xp: 6200, winRate: 68, status: "online" },
    { id: "3", name: "Ana Costa", avatar: "AC", level: 18, xp: 15400, winRate: 75, status: "em_duelo" },
    { id: "4", name: "Pedro Santos", avatar: "PS", level: 12, xp: 8900, winRate: 71, status: "online" },
    { id: "5", name: "Julia Ferreira", avatar: "JF", level: 9, xp: 5100, winRate: 65, status: "online" },
];

const duelRanking = [
    { pos: 1, name: "Ana Costa", avatar: "AC", wins: 52, losses: 8, winRate: 87 },
    { pos: 2, name: "Maria Silva", avatar: "MS", wins: 45, losses: 10, winRate: 82 },
    { pos: 3, name: "Jaime Vicente", avatar: "JV", wins: 38, losses: 12, winRate: 76 },
    { pos: 4, name: "Ricardo Oliveira", avatar: "RO", wins: 30, losses: 14, winRate: 68 },
    { pos: 5, name: "Pedro Santos", avatar: "PS", wins: 28, losses: 11, winRate: 72 },
];

const duelHistory: DuelHistory[] = [
    { id: "1", opponent: "Maria Silva", avatar: "MS", subject: "D. Administrativo", result: "vitoria", myScore: 8, opponentScore: 5, date: "Ha 2h", xpGained: 35 },
    { id: "2", opponent: "Ricardo Oliveira", avatar: "RO", subject: "D. Constitucional", result: "derrota", myScore: 4, opponentScore: 7, date: "Ha 5h", xpGained: 10 },
    { id: "3", opponent: "Pedro Santos", avatar: "PS", subject: "D. Penal", result: "vitoria", myScore: 9, opponentScore: 6, date: "Ontem", xpGained: 40 },
    { id: "4", opponent: "Julia Ferreira", avatar: "JF", subject: "D. Civil", result: "vitoria", myScore: 7, opponentScore: 4, date: "Ontem", xpGained: 30 },
];

const SUBJECTS = [
    "Aleatorio", "Direito Constitucional", "Direito Administrativo",
    "Direito Civil", "Direito Penal", "Processo Civil",
];

export default function ArenaPage() {
    const [activeTab, setActiveTab] = useState<ArenaTab>("online");
    const [selectedSubject, setSelectedSubject] = useState("Aleatorio");
    const [showChallenge, setShowChallenge] = useState(true);

    const myStats = { wins: 25, losses: 10, winRate: 71, streak: 3 };

    return (
        <div className="p-6 lg:p-8 max-w-[1100px]">
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

            {/* Pending Challenge */}
            {showChallenge && (
                <div className="relative rounded-2xl overflow-hidden p-5 text-white mb-6"
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
                            <p className="text-[12px] text-indigo-200">Maria Silva te desafiou em Direito Administrativo</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button className="px-4 py-2 rounded-xl bg-white text-indigo-700 text-[12px] font-bold hover:bg-indigo-50 transition-all">
                                Aceitar
                            </button>
                            <button onClick={() => setShowChallenge(false)}
                                className="px-4 py-2 rounded-xl bg-white/10 text-white text-[12px] font-bold hover:bg-white/20 transition-all">
                                Recusar
                            </button>
                        </div>
                    </div>
                </div>
            )}

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
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all ${
                                active ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
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
                                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${
                                        user.status === "online" ? "bg-emerald-400" : "bg-amber-400"
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
                                <button disabled={user.status === "em_duelo"}
                                    className={`px-4 py-2 rounded-xl text-[11px] font-bold flex items-center gap-1.5 transition-all ${
                                        user.status === "em_duelo"
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:shadow-md"
                                    }`}>
                                    <Swords size={13} /> Desafiar
                                </button>
                            </div>
                        </div>
                    ))}

                    {/* Ranking */}
                    {activeTab === "ranking" && (
                        <div className="card-elevated !rounded-2xl hover:!transform-none overflow-hidden">
                            <div className="px-5 py-4 border-b border-slate-100">
                                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                    <Trophy size={14} className="text-amber-500" /> Ranking de Duelos
                                </h3>
                            </div>
                            <div className="divide-y divide-slate-50">
                                {duelRanking.map(user => (
                                    <div key={user.pos} className={`flex items-center gap-3 px-5 py-3.5 hover:bg-slate-50/50 transition-colors ${user.pos <= 3 ? "bg-indigo-50/30" : ""}`}>
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-extrabold text-[12px] ${
                                            user.pos === 1 ? "bg-amber-100 text-amber-700" :
                                            user.pos === 2 ? "bg-slate-200 text-slate-600" :
                                            user.pos === 3 ? "bg-orange-100 text-orange-700" :
                                            "bg-slate-100 text-slate-500"
                                        }`}>
                                            {user.pos}
                                        </div>
                                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-[11px] font-bold text-indigo-700">
                                            {user.avatar}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-bold text-slate-800">{user.name}</div>
                                            <div className="text-[10px] text-slate-400">{user.wins}V / {user.losses}D</div>
                                        </div>
                                        <div className="text-[13px] font-extrabold text-indigo-600">{user.winRate}%</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* History */}
                    {activeTab === "historico" && duelHistory.map(duel => (
                        <div key={duel.id} className={`card-elevated !rounded-2xl p-4 hover:!transform-none border-l-4 ${
                            duel.result === "vitoria" ? "!border-l-emerald-400" : "!border-l-red-400"
                        }`}>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-[11px] font-bold text-indigo-700">
                                    {duel.avatar}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="text-[13px] font-bold text-slate-800">vs {duel.opponent}</span>
                                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                                            duel.result === "vitoria" ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                                        }`}>
                                            {duel.result === "vitoria" ? "Vitoria" : "Derrota"}
                                        </span>
                                    </div>
                                    <div className="text-[10px] text-slate-400 flex items-center gap-2">
                                        <span>{duel.subject}</span>
                                        <span>{duel.myScore} x {duel.opponentScore}</span>
                                        <span>{duel.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                                    <Zap size={10} /> +{duel.xpGained} XP
                                </div>
                            </div>
                        </div>
                    ))}
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
                                    {SUBJECTS.map(s => (
                                        <button key={s} onClick={() => setSelectedSubject(s)}
                                            className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                                selectedSubject === s
                                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                                    : "text-slate-400 hover:text-slate-600 bg-slate-50 border border-slate-100"
                                            }`}>
                                            {s === "Aleatorio" ? s : s.replace("Direito ", "D. ").replace("Processo ", "P. ")}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[11px] text-slate-500">Questoes por duelo</span>
                                <span className="text-[12px] font-bold text-slate-800">10</span>
                            </div>
                            <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                <span className="text-[11px] text-slate-500">Tempo por questao</span>
                                <span className="text-[12px] font-bold text-slate-800">30s</span>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Prize */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Crown size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Premios da Semana</span>
                        </div>
                        <p className="text-[11px] text-indigo-500 mb-3">Os 3 primeiros do ranking ganham cupons de desconto e XP bonus!</p>
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
