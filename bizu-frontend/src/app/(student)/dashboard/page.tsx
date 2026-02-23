"use client";

import Link from "next/link";
import {
    Trophy, Flame, Target, PlayCircle, Clock,
    TrendingUp, ArrowUpRight, BookOpen, Swords,
    Layers, BarChart3, Zap, ChevronRight, Bell,
} from "lucide-react";

const quickActions = [
    { icon: Target, label: "Simulado", desc: "Iniciar simulado personalizado", href: "/simulados", color: "from-indigo-500 to-violet-600" },
    { icon: Layers, label: "Flashcards", desc: "Revisar cartoes de hoje", href: "/flashcards", color: "from-amber-500 to-orange-500" },
    { icon: Swords, label: "Arena PVP", desc: "Entrar em uma partida", href: "/arena", color: "from-rose-500 to-pink-600" },
    { icon: BookOpen, label: "Estudar", desc: "Continuar de onde parou", href: "/cursos", color: "from-emerald-500 to-teal-600" },
];

const subjects = [
    { label: "Direito Constitucional", pct: 92, color: "#059669" },
    { label: "Direito Penal", pct: 85, color: "#6366F1" },
    { label: "Direito Civil", pct: 72, color: "#F59E0B" },
    { label: "Direito Administrativo", pct: 58, color: "#DC2626" },
    { label: "Processo Civil", pct: 68, color: "#8B5CF6" },
];

const recentActivity = [
    { text: "Completou simulado MPF", time: "Há 2h", icon: Target, badge: "+45 XP" },
    { text: "Estudou 30 flashcards", time: "Há 5h", icon: Layers, badge: "+20 XP" },
    { text: "Venceu duelo na Arena", time: "Ontem", icon: Swords, badge: "+30 XP" },
    { text: "Finalizou módulo Dir. Penal", time: "Ontem", icon: BookOpen, badge: "+60 XP" },
];

export default function DashboardPage() {
    return (
        <div className="p-6 lg:p-8 max-w-[1200px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Bom dia, Jaime! 👋
                    </h1>
                    <p className="text-sm text-slate-500">Vamos continuar evoluindo. Voce tem 3 revisoes pendentes.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 pill-warning">
                        <Flame size={14} className="text-amber-600" />
                        <span className="font-bold text-amber-700 text-xs">7 dias seguidos</span>
                    </div>
                    <div className="flex items-center gap-2 pill-primary">
                        <Trophy size={14} className="text-indigo-600" />
                        <span className="font-bold text-indigo-700 text-xs">1.247 XP</span>
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all relative">
                        <Bell size={16} />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-white" />
                    </button>
                </div>
            </div>

            {/* Stat cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Questoes resolvidas", val: "2.847", delta: "+124 esta semana", icon: BarChart3, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Taxa de acerto", val: "78%", delta: "+3% vs semana anterior", icon: Target, bg: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "Simulados feitos", val: "23", delta: "3 esta semana", icon: TrendingUp, bg: "bg-violet-50", text: "text-violet-600" },
                    { label: "Ranking geral", val: "#142", delta: "Subiu 18 posicoes", icon: Trophy, bg: "bg-amber-50", text: "text-amber-600" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-5 hover:!transform-none cursor-default">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center`}>
                                    <Icon size={17} className={s.text} />
                                </div>
                                <span className="text-[10px] text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                                    {s.delta}
                                </span>
                            </div>
                            <div className="text-2xl font-extrabold text-slate-900">{s.val}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Coluna principal */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Continuar estudando */}
                    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 p-6 text-white">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
                        <div className="absolute inset-0 opacity-5"
                            style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
                        <div className="relative z-10">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-3">
                                <PlayCircle size={13} />
                                Continuar assistindo
                            </div>
                            <h2 className="text-xl font-extrabold mb-1">Magistratura Federal</h2>
                            <p className="text-indigo-200 text-sm mb-5">Modulo 4: Competencia da Justica Federal no Processo Penal</p>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="flex-1 h-2.5 bg-white/15 rounded-full overflow-hidden">
                                    <div className="w-[65%] h-full bg-white rounded-full transition-all duration-1000" />
                                </div>
                                <span className="text-sm font-bold text-white">65%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-xs text-indigo-200 font-medium">24 de 40 aulas</span>
                                <Link href="/cursos/magistratura-federal" className="btn-primary !bg-white !text-indigo-700 !shadow-none hover:!bg-indigo-50 !h-9 !text-xs !px-5">
                                    Retomar <ArrowUpRight size={14} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Acoes rapidas */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3">Acoes rapidas</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((a) => {
                                const Icon = a.icon;
                                return (
                                    <Link key={a.label} href={a.href}
                                        className="group card-elevated !rounded-2xl p-4 flex items-start gap-3.5">
                                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                                            <Icon size={18} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
                                                {a.label}
                                                <ChevronRight size={13} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <div className="text-xs text-slate-400 mt-0.5">{a.desc}</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Atividade recente */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={15} className="text-slate-400" />
                            Atividade recente
                        </h3>
                        <div className="space-y-3">
                            {recentActivity.map((a, i) => {
                                const Icon = a.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 py-1.5">
                                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <Icon size={15} className="text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-slate-700 font-medium truncate">{a.text}</div>
                                            <div className="text-[11px] text-slate-400">{a.time}</div>
                                        </div>
                                        <span className="pill-primary text-[10px] py-0.5 px-2 shrink-0">
                                            <Zap size={10} />
                                            {a.badge}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Coluna lateral */}
                <div className="space-y-6">

                    {/* Desempenho por materia */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                            <TrendingUp size={15} className="text-indigo-500" />
                            Desempenho por materia
                        </h3>
                        <div className="space-y-4">
                            {subjects.map((s) => (
                                <div key={s.label}>
                                    <div className="flex justify-between text-xs mb-1.5">
                                        <span className="font-semibold text-slate-700">{s.label}</span>
                                        <span className="font-bold" style={{ color: s.color }}>{s.pct}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${s.pct}%`, background: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/desempenho"
                            className="btn-ghost text-xs mt-5 w-full justify-center">
                            Ver relatorio completo <ArrowUpRight size={13} />
                        </Link>
                    </div>

                    {/* Conquistas */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Trophy size={15} className="text-amber-500" />
                            Conquistas recentes
                        </h3>
                        <div className="grid grid-cols-4 gap-2.5">
                            {[
                                { emoji: "🔥", title: "7 dias seguidos", unlocked: true },
                                { emoji: "🎯", title: "100 questoes", unlocked: true },
                                { emoji: "⚔️", title: "Primeiro duelo", unlocked: true },
                                { emoji: "🏆", title: "Top 200", unlocked: true },
                                { emoji: "📚", title: "1000 questoes", unlocked: false },
                                { emoji: "💎", title: "Diamante", unlocked: false },
                                { emoji: "🌟", title: "Estrela", unlocked: false },
                                { emoji: "👑", title: "Lenda", unlocked: false },
                            ].map((c) => (
                                <div
                                    key={c.title}
                                    title={c.title}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-lg cursor-help transition-all ${c.unlocked
                                            ? "bg-amber-50 border border-amber-100 hover:scale-110"
                                            : "bg-slate-50 border border-slate-100 grayscale opacity-40"
                                        }`}
                                >
                                    {c.emoji}
                                </div>
                            ))}
                        </div>
                        <Link href="/conquistas" className="btn-ghost text-xs mt-4 w-full justify-center">
                            Ver todas <ChevronRight size={13} />
                        </Link>
                    </div>

                    {/* Ranking card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-violet-50 rounded-2xl p-5 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                <BarChart3 size={15} className="text-white" />
                            </div>
                            <div>
                                <div className="text-sm font-bold text-indigo-800">Ranking Semanal</div>
                                <div className="text-[11px] text-indigo-500">Top 10% dos alunos</div>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-3xl font-extrabold text-indigo-700">#142</span>
                            <span className="text-xs text-emerald-600 font-semibold">↑18</span>
                        </div>
                        <Link href="/ranking" className="btn-primary !h-9 !text-xs w-full">
                            Ver ranking completo
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
