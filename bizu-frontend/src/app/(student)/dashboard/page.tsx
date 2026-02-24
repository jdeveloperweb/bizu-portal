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
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";

const quickActions = [
    { icon: Target, label: "Quiz", desc: "Questões personalizadas", href: "/questoes/treino" },
    { icon: Layers, label: "Flashcards", desc: "Revisão inteligente", href: "/flashcards" },
    { icon: Swords, label: "Arena", desc: "Desafie outros alunos", href: "/arena" },
    { icon: Timer, label: "Foco", desc: "Sessões de estudo", href: "/pomodoro" },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const [performance, setPerformance] = useState<any>(null);
    const [gamification, setGamification] = useState<any>(null);
    const [badges, setBadges] = useState<any[]>([]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [perfRes, gamiRes, badgeRes, rankRes] = await Promise.all([
                    apiFetch("/student/performance/summary"),
                    apiFetch("/student/gamification/me"),
                    apiFetch("/student/badges/me"),
                    apiFetch("/student/ranking/me")
                ]);

                if (perfRes.ok) setPerformance(await perfRes.json());
                if (gamiRes.ok) setGamification(await gamiRes.json());
                if (badgeRes.ok) setBadges(await badgeRes.json());
                if (rankRes.ok) {
                    const rankData = await rankRes.json();
                    setGamification((prev: any) => ({ ...prev, rank: rankData.rank }));
                }
            } catch (err) {
                console.error("Failed to fetch dashboard stats", err);
            }
        };
        fetchDashboardData();
    }, []);

    const subjects = performance?.bySubject || [];
    const recentActivity: any[] = []; // Not implemented yet functionally
    const pendingTasks: any[] = []; // Not implemented yet functionally

    const totalResolved = performance?.totalAttempted || 0;
    const accuracy = performance?.overallAccuracy ? parseFloat(performance.overallAccuracy).toFixed(1) + "%" : "0%";
    const totalXp = gamification?.totalXp || 0;
    const streak = gamification?.currentStreak || 0;
    const userName = typeof user?.name === "string" && user.name.trim().length > 0 ? user.name : "Aluno";

    const achivementsData = [
        { icon: Flame, unlocked: badges.some(b => b.badgeId === 'first_blood'), color: "from-orange-400 to-rose-500", shadow: "shadow-orange-500/40", anim: "group-hover:rotate-12 group-hover:scale-125" },
        { icon: Target, unlocked: badges.some(b => b.badgeId === 'sharpshooter'), color: "from-blue-400 to-indigo-500", shadow: "shadow-blue-500/40", anim: "group-hover:scale-125" },
        { icon: Swords, unlocked: badges.some(b => b.badgeId === 'arena_master'), color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/40", anim: "group-hover:-rotate-12 group-hover:scale-125" },
        { icon: Star, unlocked: badges.some(b => b.badgeId === 'dedication'), color: "from-amber-300 to-orange-400", shadow: "shadow-amber-500/40", anim: "group-hover:rotate-45 group-hover:scale-125" },
        { icon: Brain, unlocked: badges.some(b => b.badgeId === 'genius') },
        { icon: Crown, unlocked: badges.some(b => b.badgeId === 'champion') },
        { icon: Layers, unlocked: badges.some(b => b.badgeId === 'flashcard_pro') },
        { icon: BookOpen, unlocked: badges.some(b => b.badgeId === 'bookworm') },
    ];

    // Fallback se não bater nomes de badges
    if (badges.length > 0) {
        achivementsData.forEach((ach, index) => {
            if (index < badges.length) ach.unlocked = true;
        });
    }

    return (
        <div className="p-6 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto min-h-screen font-sans">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-light text-foreground tracking-tight mb-1.5">
                        Bom dia, <span className="font-semibold text-foreground">{userName}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium tracking-wide">
                        Visão Geral do seu Desempenho
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative hidden md:block group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar materiais, questões..."
                            className="bg-card border border-border text-sm rounded-full pl-9 pr-4 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-card border border-border px-3.5 py-2 rounded-full shadow-sm">
                        <Flame size={15} className="text-orange-500" /> {streak} dias
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground bg-card border border-border px-3.5 py-2 rounded-full shadow-sm">
                        <Trophy size={15} className="text-indigo-600" /> {totalXp} XP
                    </div>
                    <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-all relative shadow-sm">
                        <Bell size={17} />
                        <span className="absolute top-2 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                    </button>
                </div>
            </div>

            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[
                    { label: "Questões Resolvidas", val: totalResolved.toString(), delta: "", icon: BarChart3 },
                    { label: "Taxa de Acerto", val: accuracy, delta: "", icon: Target },
                    { label: "Nível", val: (gamification?.level || 1).toString(), delta: "", icon: TrendingUp },
                    { label: "Ranking", val: gamification?.rank ? `#${gamification.rank}` : "-", delta: "", icon: Trophy },
                ].map((s) => (
                    <div key={s.label} className="bg-card p-5 md:p-6 rounded-2xl border border-border shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] flex flex-col justify-between hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.1)] transition-all duration-300 group">
                        <div className="flex items-start justify-between mb-5">
                            <div className="w-10 h-10 rounded-xl bg-muted group-hover:bg-indigo-50 flex items-center justify-center border border-border/60 group-hover:border-indigo-100 transition-colors">
                                <s.icon size={18} className="text-foreground/80 group-hover:text-indigo-600 transition-colors" />
                            </div>
                            {s.delta && <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50/80 px-2 py-1 rounded-md">{s.delta}</span>}
                        </div>
                        <div>
                            <div className="text-2xl font-bold text-foreground tracking-tight">{s.val}</div>
                            <div className="text-[13px] font-medium text-muted-foreground mt-1">{s.label}</div>
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
                                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Sessão de Treino Diário</h2>
                                <p className="text-muted-foreground text-sm leading-relaxed mb-8 max-w-md mx-auto md:mx-0">
                                    A constância é a chave para a aprovação. Mantenha seu streak ativo fazendo pelo menos 10 questões hoje.
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start">
                                    <Link href="/questoes/treino" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-card text-foreground px-6 py-3 rounded-xl text-sm font-bold hover:bg-muted/80 transition-all hover:scale-[1.02] shadow-lg shadow-white/10">
                                        <PlayCircle size={18} /> Iniciar Treino
                                    </Link>
                                </div>
                            </div>

                            {/* Decorative graphical element */}
                            <div className="hidden md:flex shrink-0 relative w-40 h-40">
                                <div className="absolute inset-0 border-[6px] border-slate-800 rounded-full" />
                                <div className="absolute inset-0 border-[6px] border-indigo-500 rounded-full" style={{ clipPath: 'polygon(50% 0, 100% 0, 100% 100%, 50% 100%)' }} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <span className="block text-2xl font-bold text-white tracking-tighter">{gamification?.nextLevelProgress || 0}%</span>
                                        <span className="block text-[10px] uppercase font-bold text-muted-foreground tracking-wider">P/ Próximo Nível</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Tools */}
                    <div>
                        <div className="flex items-center justify-between mb-5">
                            <h3 className="text-base font-bold text-foreground">Acesso Rápido</h3>
                            <button className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 md:gap-5">
                            {quickActions.map((a) => (
                                <Link key={a.label} href={a.href}
                                    className="group bg-card border border-border hover:border-border rounded-2xl p-5 md:p-6 flex flex-col items-center text-center transition-all hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
                                    <div className="w-12 h-12 rounded-xl bg-muted group-hover:bg-slate-900 border border-border/60 flex items-center justify-center mb-4 transition-colors">
                                        <a.icon size={20} className="text-foreground/80 group-hover:text-white transition-colors" />
                                    </div>
                                    <div className="text-sm font-bold text-foreground mb-1 group-hover:text-foreground">{a.label}</div>
                                    <div className="text-[11px] font-medium text-muted-foreground">{a.desc}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Lists Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Tasks */}
                        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[15px] font-bold text-foreground">Plano de Estudo</h3>
                                <Link href="/tarefas" className="text-xs font-bold text-indigo-600 hover:text-indigo-700">Ver tudo</Link>
                            </div>
                            {pendingTasks.length > 0 ? (
                                <div className="space-y-1">
                                    {pendingTasks.map((t, i) => (
                                        <Link key={i} href="/tarefas" className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-muted transition-colors group">
                                            <div className={`w-5 h-5 rounded-[6px] border-2 transition-colors shrink-0 flex items-center justify-center
                                                ${t.priority === 'high' ? 'border-rose-300 group-hover:border-rose-400' :
                                                    t.priority === 'medium' ? 'border-amber-300 group-hover:border-amber-400' :
                                                        'border-border group-hover:border-border'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-semibold text-foreground truncate mb-1">{t.title}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider mix-blend-multiply">{t.subject}</span>
                                                    <span className="w-1 h-1 rounded-full bg-border" />
                                                    <span className="text-[10px] font-medium text-muted-foreground">{t.type}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-xs text-muted-foreground">Nenhum plano pendente.</p>
                                </div>
                            )}
                        </div>

                        {/* Activity */}
                        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-5">
                                <h3 className="text-[15px] font-bold text-foreground">Últimas Atividades</h3>
                            </div>
                            {recentActivity.length > 0 ? (
                                <div className="space-y-1">
                                    {recentActivity.map((a, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted transition-colors">
                                            <div className="w-10 h-10 rounded-xl bg-muted/80 flex items-center justify-center shrink-0">
                                                <a.icon size={16} className="text-muted-foreground" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-semibold text-foreground truncate mb-0.5">{a.text}</div>
                                                <div className="text-[11px] font-medium text-muted-foreground truncate">{a.desc}</div>
                                            </div>
                                            <div className="text-right shrink-0">
                                                <div className="text-[13px] font-bold text-foreground">{a.score}</div>
                                                <div className="text-[10px] font-medium text-muted-foreground">{a.time}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-xs text-muted-foreground">Nenhuma atividade recente.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column (Narrower) */}
                <div className="space-y-8">

                    {/* Performance */}
                    <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-sm relative overflow-hidden">
                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <TrendingUp size={18} className="text-indigo-600" />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-bold text-foreground leading-tight">Desempenho Geral</h3>
                                    <p className="text-[11px] font-medium text-muted-foreground">Por disciplina</p>
                                </div>
                            </div>

                            {subjects.length > 0 ? (
                                <div className="space-y-6">
                                    {subjects.slice(0, 5).map((s: any) => (
                                        <div key={s.subject} className="group cursor-pointer">
                                            <div className="flex justify-between items-end mb-2.5">
                                                <span className="text-[13px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors truncate max-w-[150px]">{s.subject}</span>
                                                <span className="text-[13px] font-bold text-foreground">{parseFloat(s.accuracy).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-1.5 bg-muted/80 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-800 rounded-full transition-all duration-1000 ease-out"
                                                    style={{ width: `${s.accuracy}%` }} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-xs text-muted-foreground">Resolva questões para ver seu desempenho aqui.</p>
                                </div>
                            )}

                            <Link href="/desempenho" className="mt-8 flex items-center justify-center gap-1.5 text-[13px] font-bold text-foreground bg-muted hover:bg-muted/80 hover:text-foreground border border-border w-full py-3.5 rounded-xl transition-all">
                                Relatório Completo <ArrowUpRight size={14} />
                            </Link>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-card border border-border rounded-3xl p-6 lg:p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-[15px] font-bold text-foreground">Conquistas</h3>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full uppercase tracking-wider">{badges.length} Desbloqueadas</span>
                        </div>
                        <div className="grid grid-cols-4 gap-3">
                            {achivementsData.map((c, i) => (
                                <div key={i} className="relative group cursor-pointer" title={c.unlocked ? "Desbloqueado" : "Bloqueado"}>
                                    {c.unlocked && c.color && (
                                        <div className={`absolute -inset-0.5 bg-gradient-to-r ${c.color} rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500 group-hover:duration-200 animate-pulse`} />
                                    )}
                                    <div
                                        className={`relative aspect-square rounded-2xl flex items-center justify-center transition-all duration-500 ${c.unlocked && c.color
                                            ? `bg-gradient-to-br ${c.color} shadow-lg ${c.shadow} group-hover:scale-105 group-hover:-translate-y-1`
                                            : "bg-muted border border-border/60"
                                            }`}>
                                        <div className={`transition-all duration-300 ${c.unlocked ? c.anim : ""}`}>
                                            <c.icon
                                                size={c.unlocked && c.color ? 24 : 18}
                                                className={`${c.unlocked && c.color ? "text-white drop-shadow-md" : "text-muted-foreground/60"}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
