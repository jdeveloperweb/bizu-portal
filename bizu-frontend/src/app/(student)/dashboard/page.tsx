"use client";

import Link from "next/link";
import {
    Trophy, Flame, Target, Clock, TrendingUp,
    ArrowUpRight, BookOpen, Swords, Layers,
    BarChart3, Zap, ChevronRight, Bell, Rocket,
    PlayCircle, CheckCircle2,
} from "lucide-react";

const quickActions = [
    { icon: Target, label: "Resolver questoes", desc: "Questoes personalizadas pela IA", href: "/questoes", color: "from-indigo-500 to-violet-600" },
    { icon: Layers, label: "Flashcards", desc: "Revisar cartoes de hoje", href: "/flashcards", color: "from-amber-500 to-orange-500" },
    { icon: Swords, label: "Arena PVP", desc: "Entrar em uma partida", href: "/arena", color: "from-rose-500 to-pink-600" },
    { icon: BookOpen, label: "Estudar", desc: "Explorar materiais", href: "/cursos", color: "from-emerald-500 to-teal-600" },
];

const recentActivity = [
    { text: "Resolveu 25 questoes", time: "Ha 1h", icon: Target, badge: "+35 XP" },
    { text: "Revisou 30 flashcards", time: "Ha 3h", icon: Layers, badge: "+20 XP" },
    { text: "Venceu duelo na Arena", time: "Ha 5h", icon: Swords, badge: "+30 XP" },
    { text: "Completou simulado geral", time: "Ontem", icon: CheckCircle2, badge: "+50 XP" },
];

const subjects = [
    { label: "Direito Constitucional", pct: 92, color: "#059669" },
    { label: "Direito Penal", pct: 85, color: "#6366F1" },
    { label: "Direito Civil", pct: 72, color: "#F59E0B" },
    { label: "Direito Administrativo", pct: 58, color: "#DC2626" },
    { label: "Processo Civil", pct: 68, color: "#8B5CF6" },
];

export default function DashboardPage() {
    return (
        <div className="p-6 lg:p-8 max-w-[1200px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Bom dia! 👋
                    </h1>
                    <p className="text-sm text-slate-500">Voce tem 3 revisoes pendentes hoje. Vamos estudar?</p>
                </div>
                <div className="flex items-center gap-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Flame size={13} /> 7 dias seguidos
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <Trophy size={13} /> 1.247 XP
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:border-slate-300 transition-all relative">
                        <Bell size={15} />
                        <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#F8FAFF]" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Questoes resolvidas", val: "2.847", delta: "+124 esta semana", icon: BarChart3, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Taxa de acerto", val: "78%", delta: "+3% vs anterior", icon: Target, bg: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "Simulados feitos", val: "23", delta: "3 esta semana", icon: TrendingUp, bg: "bg-violet-50", text: "text-violet-600" },
                    { label: "Ranking geral", val: "#142", delta: "Subiu 18 posicoes", icon: Trophy, bg: "bg-amber-50", text: "text-amber-600" },
                ].map((s) => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-4 hover:!transform-none">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                                    <Icon size={15} className={s.text} />
                                </div>
                                <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">{s.delta}</span>
                            </div>
                            <div className="text-xl font-extrabold text-slate-900">{s.val}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2 space-y-5">

                    {/* Welcome CTA */}
                    <div className="relative rounded-2xl overflow-hidden p-6 text-white"
                        style={{ background: "linear-gradient(135deg, #6366F1 0%, #7C3AED 50%, #9333EA 100%)" }}>
                        <div className="absolute inset-0 opacity-[0.08]" style={{
                            backgroundImage: `radial-gradient(circle, white 0.8px, transparent 0.8px)`,
                            backgroundSize: "24px 24px",
                        }} />
                        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/4 blur-2xl" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-indigo-200 mb-3">
                                <Rocket size={12} /> Sua evolucao
                            </div>
                            <h2 className="text-xl font-extrabold mb-2">Continue de onde parou</h2>
                            <p className="text-indigo-200 text-sm mb-5 max-w-md">
                                Voce esta no caminho certo! Mantenha a constancia e resolva mais questoes para subir no ranking.
                            </p>
                            <div className="flex items-center gap-3">
                                <Link href="/questoes" className="btn-primary !bg-white !text-indigo-700 !shadow-none hover:!bg-indigo-50 !h-9 !text-xs !px-5">
                                    <PlayCircle size={14} /> Resolver questoes
                                </Link>
                                <Link href="/simulados" className="text-xs font-semibold text-white/80 hover:text-white flex items-center gap-1 transition-colors">
                                    Simulado rapido <ArrowUpRight size={13} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Acoes rapidas */}
                    <div>
                        <h3 className="text-sm font-bold text-slate-800 mb-3">O que voce quer fazer?</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {quickActions.map((a) => {
                                const Icon = a.icon;
                                return (
                                    <Link key={a.label} href={a.href}
                                        className="group card-elevated !rounded-2xl p-4 flex items-start gap-3">
                                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-sm`}>
                                            <Icon size={16} className="text-white" />
                                        </div>
                                        <div>
                                            <div className="text-[13px] font-bold text-slate-800 flex items-center gap-1">
                                                {a.label}
                                                <ChevronRight size={12} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                                            </div>
                                            <div className="text-[11px] text-slate-400 mt-0.5">{a.desc}</div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>

                    {/* Atividade recente */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Clock size={14} className="text-slate-400" /> Atividade recente
                        </h3>
                        <div className="space-y-2.5">
                            {recentActivity.map((a, i) => {
                                const Icon = a.icon;
                                return (
                                    <div key={i} className="flex items-center gap-3 py-1">
                                        <div className="w-7 h-7 rounded-lg bg-slate-50 flex items-center justify-center">
                                            <Icon size={13} className="text-slate-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] text-slate-700 font-medium truncate">{a.text}</div>
                                            <div className="text-[10px] text-slate-400">{a.time}</div>
                                        </div>
                                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full flex items-center gap-0.5 shrink-0">
                                            <Zap size={9} /> {a.badge}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Coluna lateral */}
                <div className="space-y-5">
                    {/* Desempenho */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-indigo-500" /> Suas materias
                        </h3>
                        <div className="space-y-3.5">
                            {subjects.map((s) => (
                                <div key={s.label}>
                                    <div className="flex justify-between text-[11px] mb-1">
                                        <span className="font-semibold text-slate-700">{s.label}</span>
                                        <span className="font-bold" style={{ color: s.color }}>{s.pct}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${s.pct}%`, background: s.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/desempenho" className="btn-ghost text-[11px] mt-4 w-full justify-center">
                            Ver relatorio <ArrowUpRight size={12} />
                        </Link>
                    </div>

                    {/* Conquistas */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Trophy size={14} className="text-amber-500" /> Conquistas
                        </h3>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { emoji: "🔥", unlocked: true },
                                { emoji: "🎯", unlocked: true },
                                { emoji: "⚔️", unlocked: true },
                                { emoji: "🏆", unlocked: true },
                                { emoji: "📚", unlocked: false },
                                { emoji: "💎", unlocked: false },
                                { emoji: "🌟", unlocked: false },
                                { emoji: "👑", unlocked: false },
                            ].map((c, i) => (
                                <div key={i}
                                    className={`aspect-square rounded-xl flex items-center justify-center text-base transition-all ${c.unlocked
                                            ? "bg-amber-50 border border-amber-100 hover:scale-110 cursor-pointer"
                                            : "bg-slate-50 border border-slate-100 grayscale opacity-30"
                                        }`}>
                                    {c.emoji}
                                </div>
                            ))}
                        </div>
                        <Link href="/conquistas" className="btn-ghost text-[11px] mt-3 w-full justify-center">
                            Ver todas <ChevronRight size={11} />
                        </Link>
                    </div>

                    {/* Ranking */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2.5 mb-3">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                                <BarChart3 size={14} className="text-white" />
                            </div>
                            <div>
                                <div className="text-[13px] font-bold text-indigo-800">Ranking</div>
                                <div className="text-[10px] text-indigo-500">Top 10%</div>
                            </div>
                        </div>
                        <div className="flex items-baseline gap-1 mb-3">
                            <span className="text-2xl font-extrabold text-indigo-700">#142</span>
                            <span className="text-[11px] text-emerald-600 font-semibold">↑18</span>
                        </div>
                        <Link href="/ranking" className="btn-primary !h-8 !text-[11px] w-full">
                            Ver ranking
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
