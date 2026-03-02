"use client";

import Link from "next/link";
import {
    Trophy, Flame, Target, Clock, TrendingUp,
    ArrowUpRight, BookOpen, Swords, Layers,
    BarChart3, Zap, ChevronRight, Bell, Rocket,
    PlayCircle, CheckCircle2, Timer, CheckSquare,
    StickyNote, Brain, Star, Crown, MoreHorizontal,
    Search, FileText, PartyPopper, Coffee, SkipForward, Play, Pause, Maximize2, Pin, PinOff
} from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCourse } from "@/contexts/CourseContext";
import { usePomodoro } from "@/contexts/PomodoroContext";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import LevelTable from "@/components/gamification/LevelTable";
import ActiveDuelBanner from "@/components/arena/ActiveDuelBanner";
import { Skeleton } from "@/components/ui/skeleton";
import MaterialViewerModal from "@/components/MaterialViewerModal";
import XPInfoModal from "@/components/gamification/XPInfoModal";
import { BadgeInsignia } from "@/components/gamification/BadgeInsignia";
import { HelpCircle, Info, Shield } from "lucide-react";

const quickActions = [
    { icon: Target, label: "Quiz", desc: "Questões personalizadas", href: "/questoes/treino" },
    { icon: Layers, label: "Flashcards", desc: "Revisão inteligente", href: "/flashcards" },
    { icon: Swords, label: "Arena", desc: "Desafie outros alunos", href: "/arena" },
    { icon: Timer, label: "Foco", desc: "Sessões de estudo", href: "/pomodoro" },
];

export default function DashboardPage() {
    const { user, isAdmin, refreshUserProfile } = useAuth();
    const router = useRouter();
    const { isGracePeriod } = useCourse();
    const {
        isOpen, setIsOpen, timeLeft, isRunning,
        toggleTimer, skipSession, sessionType, completedCycles,
        isFloating, setIsFloating
    } = usePomodoro();
    const [stats, setStats] = useState<any>(null);
    const [gamification, setGamification] = useState<any>(null);
    const [ranking, setRanking] = useState<any>(null);
    const [badges, setBadges] = useState<any[]>([]);
    const [recentMaterials, setRecentMaterials] = useState<any[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [subscription, setSubscription] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modal state
    const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const [isXPModalOpen, setIsXPModalOpen] = useState(false);

    const handleViewMaterial = (material: any) => {
        setSelectedMaterial(material);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            setIsLoading(true);
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

                let fetchedCourses = [];
                if (coursesRes.ok) {
                    fetchedCourses = await coursesRes.json();
                    setCourses(fetchedCourses);
                }

                if (materialsRes.ok) setRecentMaterials(await materialsRes.json());

                if (subscriptionRes.ok) {
                    const data = await subscriptionRes.json();
                    setSubscription(data);
                } else if (subscriptionRes.status === 404 && !isAdmin && fetchedCourses.length === 0) {
                    // Só manda pro checkout se realmente não tiver assinatura NEM cursos ativos
                    router.push("/checkout");
                }
            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setIsLoading(false);
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
    const totalAxons = gamification?.axons || 0;
    const streak = gamification?.currentStreak ?? gamification?.streak ?? 0;
    const userName = typeof user?.name === "string" && user.name.trim().length > 0 ? user.name : "Aluno";

    const earnedBadgesCount = badges.filter((badge) => badge.earned).length;

    const hasEarnedBadge = (badgeCode: string) => badges.some((badge) =>
        badge.earned && (badge.badgeId === badgeCode || badge.code === badgeCode || badge.id === badgeCode)
    );

    const achivementsData = [
        { name: "Gladiador", icon: Swords, unlocked: hasEarnedBadge('arena_master'), color: "from-purple-500 to-indigo-600" },
        { name: "Fogo Amigo", icon: Flame, unlocked: hasEarnedBadge('first_blood'), color: "from-orange-400 to-rose-500" },
        { name: "Sniper", icon: Target, unlocked: hasEarnedBadge('sharpshooter'), color: "from-blue-400 to-indigo-500" },
        { name: "Dedicação", icon: Star, unlocked: hasEarnedBadge('dedication'), color: "from-amber-300 to-orange-400" },
        { name: "Mestre", icon: Brain, unlocked: hasEarnedBadge('genius'), color: "from-emerald-400 to-teal-500" },
        { name: "Rei da Arena", icon: Crown, unlocked: hasEarnedBadge('champion'), color: "from-yellow-400 to-amber-600" },
        { name: "Multitask", icon: Layers, unlocked: hasEarnedBadge('flashcard_pro'), color: "from-cyan-400 to-blue-500" },
        { name: "Estudioso", icon: BookOpen, unlocked: hasEarnedBadge('bookworm'), color: "from-violet-400 to-purple-600" },
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
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 md:mb-10 bg-white/40 p-5 md:p-8 rounded-3xl md:rounded-[40px] border border-slate-200/50 shadow-sm backdrop-blur-sm">
                <div className="flex-1">
                    {isLoading ? (
                        <div className="space-y-3">
                            <Skeleton className="h-10 w-64 rounded-xl" />
                            <Skeleton className="h-4 w-80 rounded-lg" />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <h1 className="text-2xl md:text-3xl font-light text-foreground tracking-tight">
                                Bom dia, <span className="font-semibold text-indigo-600">{userName}</span>
                            </h1>
                            <p className="text-sm text-muted-foreground font-medium tracking-wide">
                                Sua jornada para a aprovação continua hoje.
                            </p>

                            <div className="flex flex-wrap gap-2 mt-4">
                                {subscription && subscription.currentPeriodEnd && !isGracePeriod && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-100/50 text-[11px] font-bold text-indigo-600 animate-in fade-in slide-in-from-left-4 duration-700">
                                        <Clock size={12} />
                                        Seu plano expira em {(() => {
                                            const d = new Date(subscription.currentPeriodEnd);
                                            d.setDate(d.getDate() - 1);
                                            return d.toLocaleDateString('pt-BR');
                                        })()} e será renovado em {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                                    </div>
                                )}

                                {isGracePeriod && (
                                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-red-50 border border-red-100/50 text-[11px] font-bold text-red-600 animate-pulse">
                                        <Clock size={12} className="text-red-500" />
                                        Pagamento em atraso. Seu acesso será bloqueado em 5 dias se não regularizado.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-2 md:gap-3 bg-white/80 p-1.5 md:p-2.5 rounded-2xl md:rounded-[24px] shadow-sm border border-slate-100 flex-wrap md:flex-nowrap w-full md:w-auto justify-center md:justify-start">
                    {/* Inline Pomodoro Timer */}
                    <AnimatePresence>
                        {isOpen && !isFloating && (
                            <motion.div
                                initial={{ width: 0, opacity: 0, x: -20 }}
                                animate={{ width: "auto", opacity: 1, x: 0 }}
                                exit={{ width: 0, opacity: 0, x: -20 }}
                                className="overflow-hidden flex items-center"
                            >
                                <div className="flex items-center gap-3 pr-4 pl-2 border-r border-slate-100 mr-1">
                                    <div className={cn(
                                        "w-8 h-8 md:w-9 md:h-9 rounded-lg md:rounded-xl flex items-center justify-center text-white shadow-sm transition-colors duration-500",
                                        sessionType === 'focus' ? "bg-indigo-600" :
                                            sessionType === 'shortBreak' ? "bg-emerald-500" : "bg-orange-500"
                                    )}>
                                        {sessionType === 'focus' ? <Brain size={16} className="md:size-[18px]" /> : <Coffee size={16} className="md:size-[18px]" />}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-15px font-black text-slate-900 tabular-nums leading-none">
                                            {(() => {
                                                const minutes = Math.floor(timeLeft / 60);
                                                const seconds = timeLeft % 60;
                                                return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
                                            })()}
                                        </span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">
                                            Ciclo {completedCycles % 4 + 1}/4
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-0.5 md:gap-1 ml-0.5 md:ml-1">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleTimer(); }}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-600 transition-colors"
                                        >
                                            {isRunning ? <Pause size={12} className="md:size-[14px]" /> : <Play size={12} className="ml-0.5 md:size-[14px]" />}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); skipSession(); }}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                                        >
                                            <SkipForward size={12} className="md:size-[14px]" />
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); setIsFloating(true); }}
                                            className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-400 transition-colors"
                                            title="Tornar Flutuante"
                                        >
                                            <Maximize2 size={12} className="md:size-[14px]" />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Toggle Pomodoro Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={cn(
                            "w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center transition-all relative border group",
                            isOpen
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                                : "bg-white border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                        )}
                        title={isOpen ? "Desativar Pomodoro" : "Ativar Pomodoro"}
                    >
                        <Timer size={18} className={cn("md:size-5 transition-transform", isOpen && "animate-pulse")} />
                        {isOpen && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-emerald-500 rounded-full border-2 border-white animate-bounce" />}
                    </button>

                    <div className="hidden md:block h-8 w-[1px] bg-slate-100 mx-1" />

                    <div className="flex items-center gap-1.5 md:gap-2.5 text-xs md:text-sm font-bold text-orange-600 bg-orange-50/50 border border-orange-100 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl">
                        <Flame size={16} />
                        {isLoading ? <Skeleton className="h-4 w-4" /> : <span>{streak} <span className="text-[10px] uppercase tracking-wider opacity-70 border-l border-orange-200 ml-1 pl-1">DIAS</span></span>}
                    </div>

                    <div
                        onClick={() => setIsXPModalOpen(true)}
                        className="flex items-center gap-1.5 md:gap-2.5 text-xs md:text-sm font-bold text-indigo-600 bg-indigo-50/50 border border-indigo-100 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl cursor-pointer hover:bg-indigo-100/70 transition-all hover:scale-105 group"
                        title="Ver ganhos de XP e Axons"
                    >
                        <Trophy size={16} />
                        {isLoading ? <Skeleton className="h-4 w-12" /> : <span>{totalXp} <span className="text-[10px] uppercase tracking-wider opacity-70 border-l border-indigo-200 ml-1 pl-1">XP</span></span>}
                    </div>

                    <Link
                        href="/loja"
                        className="flex items-center gap-1.5 md:gap-2.5 text-xs md:text-sm font-bold text-violet-600 bg-violet-50/50 border border-violet-100 px-3 py-2 md:px-4 md:py-2.5 rounded-xl md:rounded-2xl cursor-pointer hover:bg-violet-100/70 transition-all hover:scale-105 group"
                    >
                        <Brain size={16} />
                        {isLoading ? <Skeleton className="h-4 w-12" /> : <span>{totalAxons} <span className="text-[10px] uppercase tracking-wider opacity-70 border-l border-violet-200 ml-1 pl-1">AXONS</span></span>}
                    </Link>

                    <div className="hidden md:block h-8 w-[1px] bg-slate-100 mx-1" />

                    <div className="hidden md:block h-8 w-[1px] bg-slate-100 mx-1" />

                    <button
                        onClick={async () => {
                            const newState = !user?.duelFocusMode;
                            try {
                                await apiFetch(`/users/me/duel-focus?enabled=${newState}`, { method: 'POST' });
                                refreshUserProfile();
                            } catch (error) {
                                console.error("Failed to toggle focus mode:", error);
                            }
                        }}
                        className={cn(
                            "w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl flex items-center justify-center transition-all relative border group",
                            user?.duelFocusMode
                                ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-100 hover:bg-amber-600"
                                : "bg-white border-slate-200 text-slate-400 hover:text-amber-600 hover:border-amber-200 hover:bg-amber-50/50"
                        )}
                        title={user?.duelFocusMode ? "Modo Focado Ativo (Duelos bloqueados)" : "Ativar Modo Focado (Não receber duelos)"}
                    >
                        <Shield size={18} className={cn("md:size-5 transition-all", user?.duelFocusMode && "scale-110")} />
                        {user?.duelFocusMode && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 md:w-3 md:h-3 bg-red-500 rounded-full border-2 border-white animate-pulse" />}
                    </button>

                    <button className="w-10 h-10 md:w-11 md:h-11 rounded-xl md:rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/30 transition-all relative shadow-sm group">
                        <Bell size={18} className="md:size-5 group-hover:rotate-12 transition-transform" />
                        <span className="absolute top-3 right-3 md:top-3.5 md:right-3.5 w-2 md:w-2.5 h-2 md:h-2.5 bg-rose-500 rounded-full border-2 border-white shadow-sm" />
                    </button>
                </div>
            </div>

            <ActiveDuelBanner />

            {/* Top Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
                {[
                    { label: "Questões Resolvidas", val: (stats?.totalUniqueAttempted || 0).toString(), icon: BarChart3, color: "indigo" },
                    { label: "Taxa de Acerto", val: accuracy, icon: Target, color: "rose" },
                    {
                        label: gamification?.rank ? `Nível (${gamification.rank})` : "Nível Atual",
                        val: (gamification?.level || 1).toString(),
                        icon: Zap,
                        color: "amber"
                    },
                    { label: "Posição Ranking", val: ranking?.position ? `#${ranking.position}` : "-", icon: Trophy, color: "emerald" },
                ].map((s) => (
                    <div key={s.label} className="bg-card p-5 md:p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300 group">
                        <div className={`w-12 h-12 rounded-2xl bg-${s.color}-50 flex items-center justify-center border border-${s.color}-100 group-hover:scale-110 transition-transform`}>
                            <s.icon size={22} className={`text-${s.color}-600`} />
                        </div>
                        <div>
                            {isLoading ? (
                                <Skeleton className="h-8 w-20 mb-1" />
                            ) : (
                                <div className="text-2xl font-bold text-foreground tracking-tight">{s.val}</div>
                            )}
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
                                {isLoading ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-10 w-full bg-slate-800" />
                                        <Skeleton className="h-6 w-48 bg-slate-800" />
                                    </div>
                                ) : (
                                    <>
                                        <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                                            {mainCourse ? mainCourse.title : "Inicie sua Jornada"}
                                        </h2>
                                        <p className="text-slate-400 text-base leading-relaxed mb-8">
                                            Próximo Módulo: <span className="text-white font-semibold">{mainCourse?.nextModule || "Primeiros Passos"}</span>
                                        </p>
                                    </>
                                )}
                                <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
                                    <Link
                                        href={mainCourse ? `/cursos/${mainCourse.id}` : "/cursos"}
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
                                    {isLoading ? (
                                        <Skeleton className="h-10 w-16 bg-slate-800 rounded-full" />
                                    ) : mainCourse?.progress === 100 ? (
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
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="flex items-center gap-4 p-4 rounded-2xl border border-transparent">
                                            <Skeleton className="w-10 h-10 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <Skeleton className="h-4 w-3/4" />
                                                <Skeleton className="h-3 w-1/2" />
                                            </div>
                                        </div>
                                    ))
                                ) : recentMaterials.length > 0 ? (
                                    recentMaterials.slice(0, 3).map((m, i) => (
                                        <div
                                            key={m.id}
                                            onClick={() => handleViewMaterial(m)}
                                            className="flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group"
                                        >
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
                                        </div>
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
                                {isLoading ? (
                                    [1, 2, 3].map(i => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <Skeleton className="h-3 w-24" />
                                                <Skeleton className="h-3 w-8" />
                                            </div>
                                            <Skeleton className="h-2 w-full rounded-full" />
                                        </div>
                                    ))
                                ) : subjects.length > 0 ? (
                                    subjects.slice(0, 3).map((s: any) => (
                                        <div key={s.subject} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-xs font-bold text-slate-700">{s.subject}</span>
                                                <span className="text-xs font-black text-indigo-600">{parseFloat(s.accuracy).toFixed(0)}%</span>
                                            </div>
                                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${s.accuracy}%` }} />
                                            </div>
                                        </div>
                                    ))
                                ) : (
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
                            {isLoading ? (
                                Array.from({ length: 8 }).map((_, i) => (
                                    <Skeleton key={i} className="aspect-square rounded-2xl" />
                                ))
                            ) : achivementsData.map((c, i) => (
                                <BadgeInsignia
                                    key={i}
                                    name={c.name}
                                    icon={c.icon}
                                    earned={c.unlocked}
                                    color={c.color}
                                    variant="compact"
                                />
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
                                    <span className="text-indigo-600">{isLoading ? <Skeleton className="h-3 w-8" /> : `${stats?.dailyAttempted || 0}/10`}</span>
                                </div>
                                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                    {isLoading ? (
                                        <Skeleton className="h-full w-full" />
                                    ) : (
                                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-1000" style={{ width: `${Math.min((stats?.dailyAttempted || 0) * 10, 100)}%` }} />
                                    )}
                                </div>
                            </div>

                            <Link href="/questoes/treino" className="block w-full text-center bg-slate-900 text-white py-4 rounded-2xl font-black hover:bg-slate-800 transition-all hover:scale-[1.02]">
                                Começar Agora
                            </Link>
                        </div>
                    </div>

                    {/* Level Progress Table */}
                    <div className="lg:col-span-1">
                        {isLoading ? (
                            <Skeleton className="h-[400px] w-full rounded-[40px]" />
                        ) : (
                            <LevelTable
                                levels={gamification?.levelTable || []}
                                currentLevel={gamification?.level || 1}
                                currentXp={totalXp}
                            />
                        )}
                    </div>

                </div>
            </div>
            <MaterialViewerModal
                material={selectedMaterial}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
            <XPInfoModal
                isOpen={isXPModalOpen}
                onClose={() => setIsXPModalOpen(false)}
            />
        </div>
    );
}
