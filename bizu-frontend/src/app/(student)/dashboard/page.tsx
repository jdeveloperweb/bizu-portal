"use client";

import Link from "next/link";
import {
    Trophy, Flame, Target, Clock, TrendingUp,
    ArrowUpRight, BookOpen, Swords, Layers,
    BarChart3, Zap, ChevronRight, Bell, Rocket,
    PlayCircle, CheckCircle2, Timer, CheckSquare,
    StickyNote, Brain, Star, Crown, MoreHorizontal,
    Search
} from "lucide-react";

const quickActions = [
    { icon: Target, label: "Quiz", desc: "Questões personalizadas", href: "/questoes/treino" },
    { icon: Layers, label: "Flashcards", desc: "Revisão inteligente", href: "/flashcards" },
    { icon: Swords, label: "Arena", desc: "Desafie outros alunos", href: "/arena" },
    { icon: Timer, label: "Foco", desc: "Sessões de estudo", href: "/pomodoro" },
];

const recentActivity = [
    { text: "Direito Administrativo", desc: "25 questões resolvidas", time: "Hoje, 09:41", icon: Target, score: "85%" },
    { text: "Simulado Geral", desc: "120 questões", time: "Ontem", icon: CheckCircle2, score: "72%" },
    { text: "Direito Civil", desc: "Revisão de flashcards", time: "Ontem", icon: Layers, score: "100%" },
];

const subjects = [
    { label: "Direito Constitucional", pct: 91 },
    { label: "Direito Penal", pct: 85 },
    { label: "Direito Administrativo", pct: 85 },
    { label: "Processo Civil", pct: 78 },
    { label: "Direito Civil", pct: 70 },
];

const pendingTasks = [
    { title: "Revisar Atos Administrativos", subject: "D. Admin.", type: "Revisão", priority: "high" },
    { title: "Resolver 30 questões de D. Const.", subject: "D. Const.", type: "Prática", priority: "medium" },
    { title: "Anotar jurisprudência de P. Civil", subject: "P. Civil", type: "Leitura", priority: "low" },
];

export default function DashboardPage() {
    return (
        <div className="p-6 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto min-h-screen font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-light text-slate-800 tracking-tight mb-1.5">
                        Bom dia, <span className="font-semibold text-slate-900">Aluno</span>
                    </h1>
                    <p className="text-sm text-slate-500 font-medium tracking-wide">
                        Visão Geral do seu Desempenho
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar materiais, questões..."
                            className="bg-white border border-slate-200 text-sm rounded-full pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-sm">
                        <Flame size={15} className="text-orange-500" /> 7 dias
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 px-3.5 py-2 rounded-full shadow-sm">
                        <Trophy size={15} className="text-indigo-600" /> 1.247 XP
                    </div>
                    <button className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-900 hover:border-slate-300 transition-all relative shadow-sm">
                        <Bell size={17} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                    </button>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[
                    { label: "Questões Resolvidas", val: "2.847", delta: "+124", icon: BarChart3 },
                    { label: "Taxa de Acerto", val: "78%", delta: "+3%", icon: Target },
                    { label: "Simulados", val: "23", delta: "+3", icon: TrendingUp },
                    { label: "Ranking Geral", val: "#142", delta: "+18", icon: Trophy },
                ].map((s) => (
                    <div key={s.label} className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-5">
                            <div className="w-10 h-10 rounded-xl bg-slate-50 group-hover:bg-indigo-50 flex items-center justify-center border border-slate-100 group-hover:border-indigo-100 transition-colors">
                                <s.icon size={18} className="text-slate-600 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2 py-1 rounded-md">{s.delta}</span>
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-slate-900 tracking-tight">{s.val}</div>
                            <div className="text-[13px] font-medium text-slate-500 mt-1">{s.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Column (Wider) */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Premium CTA Card */}
                    <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-800 shadow-xl">
                        {/* Elegant background elements */}
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.15),_transparent_50%)]" />
                        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,_rgba(244,63,94,0.1),_transparent_50%)]" />

                        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full rounded-3xl ring-1 ring-white/10 ring-inset">
                            <div className="max-w-lg text-center md:text-left">
                                <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-indigo-400 mb-4 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
                                    <Rocket size={13} /> Continue evoluindo
                                </div>
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Sessão de Revisão Pendente</h2>
                                <p className="text-slate-400 text-sm leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                                    Você tem 23 flashcards de Direito Constitucional agendados para hoje. Mantenha sua constância para fixar o conteúdo.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                    <Link href="/questoes/treino" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-xl text-sm font-bold hover:bg-slate-100 transition-all hover:scale-[1.02] shadow-lg shadow-white/10">
                                        <PlayCircle size={18} /> Iniciar Revisão
                                    </Link>
                                    <Link href="/simulados" className="w-full sm:w-auto flex items-center justify-center gap-1.5 text-sm font-semibold text-slate-300 hover:text-white px-6 py-3 rounded-xl hover:bg-white/5 transition-colors">
                                        Simulado Rápido <ArrowUpRight size={15} />
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative graphical element */}
                            <div className="hidden md:flex shrink-0 relative w-40 h-40">
                                <div className="absolute inset-0 border-[6px] border-slate-800 rounded-full" />
                                <div className="absolute inset-0 border-[6px] border-indigo-500 rounded-full" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-white tracking-tighter">78%</span>
                                        <span className="block text-[10px] uppercase font-bold text-slate-400 tracking-wider">Meta Diária</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Tools */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-slate-800">Acesso Rápido</h3>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
                            {quickActions.map((a) => (
                                <Link key={a.label} href={a.href}
                                    className="group bg-white border border-slate-200 hover:border-slate-300 rounded-2xl p-5 md:p-6 flex flex-col items-center text-center transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 group-hover:bg-slate-900 border border-slate-100 flex items-center justify-center mb-4 transition-colors">
                                        <a.icon size={20} className="text-slate-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-sm font-bold text-slate-800 mb-1 group-hover:text-slate-900">{a.label}</div>
                                    <div className="text-[11px] font-medium text-slate-500">{a.desc}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Lists Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Tasks */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[15px] font-bold text-slate-800">Plano de Estudo</h3>
                                <Link href="/tarefas" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Ver tudo</Link>
                            </div>
                            <div className="space-y-1">
                                {pendingTasks.map((t, i) => (
                                    <Link key={i} href="/tarefas" className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                                        <div className={`w-5 h-5 rounded-[6px] border-2 transition-colors shrink-0 flex items-center justify-center
                                            ${t.priority === 'high' ? 'border-rose-300 group-hover:border-rose-400' :
                                                t.priority === 'medium' ? 'border-amber-300 group-hover:border-amber-400' :
                                                    'border-slate-300 group-hover:border-slate-400'}`} />
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-semibold text-slate-800 truncate mb-1">{t.title}</div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mix-blend-multiply">{t.subject}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                <span className="text-[10px] font-medium text-slate-500">{t.type}</span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>

                        {/* Activity */}
                        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[15px] font-bold text-slate-800">Últimas Atividades</h3>
                            </div>
                            <div className="space-y-1">
                                {recentActivity.map((a, i) => (
                                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors">
                                        <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                                            <a.icon size={16} className="text-slate-500" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[13px] font-semibold text-slate-800 truncate mb-0.5">{a.text}</div>
                                            <div className="text-[11px] font-medium text-slate-500 truncate">{a.desc}</div>
                                        </div>
                                        <div className="text-right shrink-0">
                                            <div className="text-[13px] font-bold text-slate-800">{a.score}</div>
                                            <div className="text-[10px] font-medium text-slate-400">{a.time}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column (Narrower) */}
                <div className="space-y-8">

                    {/* Performance */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <TrendingUp size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-slate-800 leading-tight">Desempenho Geral</h3>
                                    <p className="text-[11px] font-medium text-slate-500">Por disciplina</p>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {subjects.map((s) => (
                                    <div key={s.label} className="group cursor-pointer">
                                        <div className="flex justify-between items-end mb-2.5">
                                            <span className="text-[13px] font-semibold text-slate-600 group-hover:text-slate-900 transition-colors">{s.label}</span>
                                            <span className="text-[13px] font-bold text-slate-800">{s.pct}%</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-slate-800 rounded-full transition-all duration-1000 ease-out"
                                                style={{ width: `${s.pct}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Link href="/desempenho" className="mt-8 flex items-center justify-center gap-1.5 text-[13px] font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 w-full py-3.5 rounded-xl transition-all">
                                Relatório Completo <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-white border border-slate-200 rounded-3xl p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[15px] font-bold text-slate-800">Conquistas</h3>
                            <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">4 Bloqueadas</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { icon: Flame, unlocked: true },
                                { icon: Target, unlocked: true },
                                { icon: Swords, unlocked: true },
                                { icon: Star, unlocked: true },
                                { icon: Brain, unlocked: false },
                                { icon: Crown, unlocked: false },
                                { icon: Layers, unlocked: false },
                                { icon: BookOpen, unlocked: false },
                            ].map((c, i) => (
                                <div key={i}
                                    className={`aspect-square rounded-2xl flex items-center justify-center transition-all ${c.unlocked
                                        ? `bg-slate-900 shadow-md hover:scale-[1.05] hover:shadow-lg hover:-translate-y-0.5 cursor-pointer`
                                        : "bg-slate-50 border border-slate-100"
                                        }`}>
                                    <c.icon size={18} className={c.unlocked ? "text-white" : "text-slate-300"} />
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
