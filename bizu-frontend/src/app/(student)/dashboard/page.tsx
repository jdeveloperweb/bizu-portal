"use client";

import Link from "next/link";
import {
    Trophy, Flame, Target, Clock, TrendingUp,
    ArrowUpRight, BookOpen, Swords, Layers,
    BarChart3, Zap, ChevronRight, Bell, Rocket,
    PlayCircle, CheckCircle2, Timer, CheckSquare,
    StickyNote, Brain, Star, Crown, MoreHorizontal,
    Search, FileText, PartyPopper
} from "lucide-react";
import confetti from "canvas-confetti";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCourse } from "@/contexts/CourseContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import LevelTable from "@/components/gamification/LevelTable";
import ActiveDuelBanner from "@/components/arena/ActiveDuelBanner";

const quickActions = [
    { icon: Target, label: "Quiz", desc: "Questões personalizadas", href: "/questoes/treino" },
    { icon: Layers, label: "Flashcards", desc: "Revisão inteligente", href: "/flashcards" },
    { icon: Swords, label: "Arena", desc: "Desafie outros alunos", href: "/arena" },
    { icon: Timer, label: "Foco", desc: "Sessões de estudo", href: "/pomodoro" },
];

export default function DashboardPage() {
    const { user } = useAuth();
    const router = useRouter();
    const { isGracePeriod } = useCourse();
    const [stats, setStats] = useState<any>(null);
    const [gamification, setGamification] = useState<any>(null);
    const [ranking, setRanking] = useState<any>(null);
    const [badges, setBadges] = useState<any[]>([]);
    const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [statsRes, gamificationRes, badgesRes, rankingRes, coursesRes, materialsRes, subscriptionRes] = await Promise.all([
                    apiFetch("/student/performance/summary"),
                    apiFetch("/student/gamification/me"),
                    apiFetch("/student/badges/me"),
                    apiFetch("/student/ranking/me"),
                    apiFetch("/student/courses/me"),
                    apiFetch("/student/materials"),
                    apiFetch("/subscriptions/me")
                ]);

                if (statsRes.ok) setStats(await statsRes.json());
                if (gamificationRes.ok) setGamification(await gamificationRes.json());
                if (badgesRes.ok) setBadges(await badgesRes.json());
                if (rankingRes.ok) setRanking(await rankingRes.json());
                if (coursesRes.ok) setCourses(await coursesRes.json());
                if (materialsRes.ok) setRecentMaterials(await materialsRes.json());
                if (subscriptionRes.ok) {
                    const data = await subscriptionRes.json();
                    setSubscription(data);
                } else if (subscriptionRes.status === 404 && user?.role !== 'ADMIN') {
                    // Se não tem assinatura e não é admin, manda pro checkout
                    router.push("/checkout");
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            }
        };
        fetchDashboardData();
    }, []);

    useEffect(() => {
        if (courses.length > 0 && courses[0]?.progress === 100) {
            const timer = setTimeout(() => {
                confetti({
                    particleCount: 150,
                    spread: 70,
                    origin: { y: 0.6 },
                    colors: ['#6366f1', '#a855f7', '#ec4899']
                });
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [courses]);

    const subjects = stats?.bySubject || [];
    const recentActivity: any[] = [];
    const pendingTasks: any[] = [];

    const totalResolved = stats?.totalAttempted || 0;
    const accuracy = stats?.overallAccuracy ? parseFloat(stats.overallAccuracy).toFixed(1) + "%" : "0%";
    const totalXp = gamification?.totalXp || 0;
    const streak = gamification?.currentStreak ?? gamification?.streak ?? 0;
    const userName = typeof user?.name === "string" && user.name.trim().length > 0 ? user.name : "Aluno";

    const earnedBadgesCount = badges.filter((badge) => badge.earned).length;

    const hasEarnedBadge = (badgeCode: string) => badges.some((badge) =>
        badge.earned && (badge.badgeId === badgeCode || badge.code === badgeCode || badge.id === badgeCode)
    );

    const achivementsData = [
        { icon: Flame, unlocked: hasEarnedBadge('first_blood'), color: "from-orange-400 to-rose-500", shadow: "shadow-orange-500/40", anim: "group-hover:rotate-12 group-hover:scale-125" },
        { icon: Target, unlocked: hasEarnedBadge('sharpshooter'), color: "from-blue-400 to-indigo-500", shadow: "shadow-blue-500/40", anim: "group-hover:scale-125" },
        { icon: Swords, unlocked: hasEarnedBadge('arena_master'), color: "from-emerald-400 to-teal-500", shadow: "shadow-emerald-500/40", anim: "group-hover:-rotate-12 group-hover:scale-125" },
        { icon: Star, unlocked: hasEarnedBadge('dedication'), color: "from-amber-300 to-orange-400", shadow: "shadow-amber-500/40", anim: "group-hover:rotate-45 group-hover:scale-125" },
        { icon: Brain, unlocked: hasEarnedBadge('genius') },
        { icon: Crown, unlocked: hasEarnedBadge('champion') },
        { icon: Layers, unlocked: hasEarnedBadge('flashcard_pro') },
        { icon: BookOpen, unlocked: hasEarnedBadge('bookworm') },
    ];

    if (earnedBadgesCount > 0 && !achivementsData.some((achievement) => achievement.unlocked)) {
        achivementsData.forEach((achievement, index) => {
            if (index < earnedBadgesCount) achievement.unlocked = true;
        });
    }

    const mainCourse = courses[0]; // Define mainCourse here

    return (
        <div className="p-6 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto min-h-screen font-sans bg-slate-50/30">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                    <h1 className="text-3xl font-light text-foreground tracking-tight mb-1.5">
                        Bom dia, <span className="font-semibold text-indigo-600">{userName}</span>
                    </h1>
                    <p className="text-sm text-muted-foreground font-medium tracking-wide">
                        Sua jornada para a aprovação continua hoje.
                    </p>
                    {subscription && subscription.currentPeriodEnd && !isGracePeriod && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-indigo-50 border border-indigo-100/50 text-[11px] font-bold text-indigo-600 animate-in fade-in slide-in-from-left-4 duration-700">
                            <Clock size={12} />
                            Seu plano expira em {(() => {
                                const d = new Date(subscription.currentPeriodEnd);
                                d.setDate(d.getDate() - 1);
                                return d.toLocaleDateString('pt-BR');
                            })()} e será renovado em {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                        </div>
                    )}

                    {isGracePeriod && (
                        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-red-50 border border-red-100/50 text-[11px] font-bold text-red-600 animate-pulse">
                            <Clock size={12} className="text-red-500" />
                            Pagamento em atraso. Seu acesso será bloqueado em 5 dias se não regularizado.
                        </div>
                    )}
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
                    <div className="flex items-center gap-2 text-sm font-semibold text-orange-600 bg-orange-50 border border-orange-100 px-3.5 py-2 rounded-full shadow-sm">
                        <Flame size={15} /> {streak} dias
                    </div>
                    <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3.5 py-2 rounded-full shadow-sm">
                        <Trophy size={15} /> {totalXp} XP
                    </div>

                    <button className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all relative shadow-sm">
                        <Bell size={17} />
                        <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border border-white" />
                    </button>
                </div>
            </div>

            <ActiveDuelBanner />

            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[
                    { label: "Questões Resolvidas", val: (stats?.totalUniqueAttempted || 0).toString(), icon: BarChart3, color: "indigo" },
                    { label: "Taxa de Acerto", val: accuracy, icon: Target, color: "rose" },
                    { label: "Nível Atual", val: (gamification?.level || 1).toString(), icon: Zap, color: "amber" },
                    { label: "Posição Ranking", val: ranking?.position ? `#${ranking.position}` : "-", icon: Trophy, color: "emerald" },
                ].map((s) => (
                    <div key={s.label} className="bg-card p-5 md:p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
                        <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 flex items-center justify-center border border-${s.color}-100 group-hover:scale-110 transition-transform`}>
                            <s.icon size={22} className={`text-${s.color}-600`} />
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

                    {/* Continue Studying Card */}
                    <div className="relative rounded-[40px] overflow-hidden bg-gradient-to-br from-slate-900 to-indigo-950 border border-slate-800 shadow-2xl">
                        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.2),_transparent_60%)]" />

                        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 h-full">
                            <div className="max-w-md text-center md:text-left">
                                <div className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-indigo-400 mb-6 bg-indigo-500/10 px-4 py-1.5 rounded-full border border-indigo-500/20">
                                    <PlayCircle size={14} /> Continue de onde parou
                                </div>
                                <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                                    {mainCourse ? mainCourse.title : "Inicie sua Jornada"}
                                </h2>
                                <p className="text-slate-400 text-base leading-relaxed mb-8">
                                    Próximo Módulo: <span className="text-white font-semibold">{mainCourse?.nextModule || "Primeiros Passos"}</span>
                                </p>
                                <div className="flex flex-col sm:flex-row items-center gap-4">
                                    <Link
                                        href={mainCourse ? (mainCourse.nextMaterialId ? `/cursos/${mainCourse.id}/player/${mainCourse.nextMaterialId}` : `/cursos/${mainCourse.id}`) : "/cursos"}
                                        className="w-full sm:w-auto flex items-center justify-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl text-base font-black hover:bg-indigo-50 transition-all hover:scale-105 shadow-xl"
                                    >
                                        {mainCourse?.progress === 100 ? "Revisar Curso" : "Assistir Agora"} <ChevronRight size={18} />
                                    </Link>
                                </div>
                            </div>

                            <div className="shrink-0 relative w-44 h-44">
                                <svg className="w-full h-full transform -rotate-90">
                                    <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                    <circle cx="88" cy="88" r="80" stroke="currentColor" strokeWidth="8" fill="transparent" className={cn(mainCourse?.progress === 100 ? "text-emerald-500" : "text-indigo-500")}
                                        strokeDasharray={502.6} strokeDashoffset={502.6 * (1 - (mainCourse?.progress || 0) / 100)} strokeLinecap="round" />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center flex-col">
                                    {mainCourse?.progress === 100 ? (
                                        <>
                                            <PartyPopper className="w-10 h-10 text-emerald-400 mb-1 animate-bounce" />
                                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Concluído!</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-3xl font-black text-white">{mainCourse?.progress || 0}%</span>
                                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concluído</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Access Tools */}
                    <div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-foreground">Menu de Estudo</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {[
                                { icon: BookOpen, label: "Meus Cursos", desc: "Aulas e track", href: "/cursos", color: "indigo" },
                                { icon: FileText, label: "Materiais", desc: "PDFs e Mapas", href: "/materiais", color: "rose" },
                                { icon: Target, label: "Quiz", desc: "Treino diário", href: "/questoes/treino", color: "emerald" },
                                { icon: Layers, label: "Flashcards", desc: "Revisão", href: "/flashcards", color: "amber" },
                            ].map((a: any) => (
                                <Link key={a.label} href={a.href}
                                    className="group bg-card border border-border rounded-3xl p-6 flex flex-col items-center text-center transition-all hover:shadow-lg hover:-translate-y-1">
                                    <div className={`w-14 h-14 rounded-2xl bg-${a.color}-50 group-hover:bg-${a.color}-600 flex items-center justify-center mb-4 transition-all duration-300`}>
                                        <a.icon size={24} className={`text-${a.color}-600 group-hover:text-white transition-colors`} />
                                    </div>
                                    <div className="text-sm font-black text-foreground mb-1">{a.label}</div>
                                    <div className="text-[11px] font-medium text-muted-foreground">{a.desc}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Materials & Tasks Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Latest Materials */}
                        <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <FileText size={18} className={`text-rose-500`} /> Materiais de Estudo
                                </h3>
                                <Link href="/materiais" className="text-xs font-bold text-indigo-600">Ver todos</Link>
                            </div>
                            <div className="space-y-3">
                                {recentMaterials.length > 0 ? (
                                    recentMaterials.slice(0, 3).map((m, i) => (
                                        <Link key={m.id} href={`/materiais/${m.id}`} className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center text-[10px] font-black group-hover:scale-110 transition-transform",
                                                m.fileType === 'VIDEO' ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                                            )}>
                                                {m.fileType}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-[13px] font-bold text-foreground truncate">{m.title}</div>
                                                <div className="text-[11px] text-muted-foreground font-medium">{m.description || "Material complementar"}</div>
                                            </div>
                                        </Link>
                                    ))
                                ) : (
                                    <div className="text-center py-10 text-xs text-muted-foreground">Nenhum material disponível.</div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity / Plan */}
                        <div className="bg-card border border-border rounded-[32px] p-6 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                                    <TrendingUp size={18} className="text-emerald-500" /> Desempenho Recente
                                </h3>
                            </div>
                            <div className="space-y-6">
                                {subjects.slice(0, 3).map((s: any) => (
                                    <div key={s.subject} className="space-y-2">
                                        <div className="flex justify-between items-end">
                                            <span className="text-xs font-bold text-slate-700">{s.subject}</span>
                                            <span className="text-xs font-black text-indigo-600">{parseFloat(s.accuracy).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.accuracy}%` }} />
                                        </div>
                                    </div>
                                ))}
                                {subjects.length === 0 && (
                                    <div className="text-center py-10 opacity-50">
                                        <p className="text-xs font-bold">Inicie sua jornada para ver os dados</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Achievements */}
                    <div className="bg-card border border-border rounded-[40px] p-8 shadow-sm">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-base font-bold text-slate-800">Conquistas</h3>
                            <span className="text-[10px] font-black text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">{earnedBadgesCount} / {achivementsData.length}</span>
                        </div>
                        <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                            {achivementsData.map((c, i) => (
                                <div key={i} className="relative group cursor-pointer aspect-square">
                                    <div
                                        className={`w-full h-full rounded-2xl flex items-center justify-center transition-all duration-300 ${c.unlocked
                                            ? `bg-gradient-to-br ${c.color} shadow-lg group-hover:scale-110`
                                            : "bg-slate-50 border border-slate-100"
                                            }`}>
                                        <c.icon
                                            size={c.unlocked ? 20 : 16}
                                            className={`${c.unlocked ? "text-white" : "text-slate-300"}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link href="/conquistas" className="mt-8 flex items-center justify-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors">
                            Ver galeria completa <ArrowUpRight size={14} />
                        </Link>
                    </div>
                </div>

                {/* Right Column (Narrower) */}
                <div className="space-y-8">

                    {/* Daily Goal Card */}
                    <div className="bg-white border-2 border-indigo-100 rounded-[40px] p-8 shadow-xl shadow-indigo-100/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-full -mr-12 -mt-12" />
                        <div className="relative z-10">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-indigo-200">
                                <Target size={24} />
                            </div>
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Meta Diária</h3>
                            <p className="text-slate-500 text-sm font-medium mb-8">Resolva 10 questões hoje para manter sua ofensiva ativa.</p>

                            <div className="space-y-4 mb-8">
                                <div className="flex justify-between items-center text-xs font-black tracking-widest uppercase text-slate-400">
                                    <span>Progresso</span>
                                    <span className="text-indigo-600">{stats?.dailyAttempted || 0}/10</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min((stats?.dailyAttempted || 0) * 10, 100)}%` }} />
                                </div>
                            </div>

                            <Link href="/questoes/treino" className="block w-full text-center bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all hover:scale-[1.02]">
                                Começar Agora
                            </Link>
                        </div>
                    </div>

                    {/* Level Progress Table */}
                    <div className="lg:col-span-1">
                        <LevelTable
                            levels={gamification?.levelTable || []}
                            currentLevel={gamification?.level || 1}
                            currentXp={totalXp}
                        />
                    </div>

                </div>
            </div>
        </div>
    );
}
