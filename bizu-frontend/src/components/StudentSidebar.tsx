"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import {
    LayoutDashboard, BookOpen, ClipboardList, Layers,
    Swords, TrendingUp, User, Trophy, LogOut,
    ChevronRight, ChevronLeft, Search, Timer, CheckSquare,
    StickyNote, Settings, BarChart3, Menu, X, FileText, PlayCircle, CreditCard, Users, Lock, Brain,
    Zap, Target, Crown, Shield
} from "lucide-react";
import { getAvatarUrl } from "@/lib/imageUtils";
import { Avatar } from "@/components/ui/Avatar";
import { usePomodoro } from "@/contexts/PomodoroContext";
import { useDuels } from "@/contexts/DuelContext";
import { apiFetch } from "@/lib/api";

const studyNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/cursos", icon: BookOpen, label: "Meus Cursos" },
    { href: "/materiais", icon: FileText, label: "Materiais" },
    { href: "/questoes/treino", icon: PlayCircle, label: "Quiz" },
    { href: "/simulados", icon: ClipboardList, label: "Simulados" },
    { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
    { href: "/flashcards", icon: Layers, label: "Flashcards" },
    { href: "/arena", icon: Swords, label: "Arena PVP" },
    { href: "/loja", icon: Brain, label: "Axon Store" },
];

const planNav = [
    { href: "/tarefas", icon: CheckSquare, label: "Tarefas" },
    { href: "/anotacoes", icon: StickyNote, label: "Anotacoes" },
];

const trackNav = [
    { href: "/desempenho", icon: TrendingUp, label: "Desempenho" },
    { href: "/ranking", icon: BarChart3, label: "Ranking" },
    { href: "/conquistas", icon: Trophy, label: "Conquistas" },
    { href: "/amigos", icon: Users, label: "Amigos" },
    { href: "/guilds", icon: Shield, label: "Guilds" },
];

const bottomNav = [
    { href: "/faturamento", icon: CreditCard, label: "Faturamento" },
    { href: "/configuracoes", icon: Settings, label: "Configuracoes" },
    { href: "/perfil", icon: User, label: "Meu Perfil" },
];

const allNavItems = [...studyNav, ...planNav, ...trackNav, ...bottomNav];

export default function StudentSidebar() {
    const pathname = usePathname();
    const { logout, user, subscription, entitlements, selectedCourseId, isFree, authenticated } = useAuth();
    const { setIsOpen: setPomodoroOpen } = usePomodoro();
    const { pendingDuels } = useDuels();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [pendingFriendsCount, setPendingFriendsCount] = useState(0);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [rankingPosition, setRankingPosition] = useState<number | null>(null);
    const [buffs, setBuffs] = useState<{ xpBoost: boolean; radar: boolean; elite: boolean }>({ xpBoost: false, radar: false, elite: false });
    const [onlineCount, setOnlineCount] = useState<number>(0);
    const [pendingFlashcardsCount, setPendingFlashcardsCount] = useState(0);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [userLevel, setUserLevel] = useState<number>(1);
    const [activeAura, setActiveAura] = useState<string | null>(null);
    const [activeBorder, setActiveBorder] = useState<string | null>(null);
    const [activeAuraMetadata, setActiveAuraMetadata] = useState<any>(null);
    const [activeBorderMetadata, setActiveBorderMetadata] = useState<any>(null);

    const fetchSidebarData = useCallback(async () => {
        if (!authenticated || isFree) return;
        try {
            const [friendsRes, tasksRes, rankingRes, gamRes, onlineRes, flashcardsRes] = await Promise.all([
                apiFetch("/friends/pending").catch(() => null),
                apiFetch("/student/tasks").catch(() => null),
                apiFetch("/student/ranking/me").catch(() => null),
                apiFetch("/student/gamification/me").catch(() => null),
                apiFetch(`/duelos/online/count${selectedCourseId ? `?courseId=${selectedCourseId}` : ''}`).catch(() => null),
                apiFetch("/student/flashcards/summary").catch(() => null)
            ]);

            if (friendsRes && friendsRes.ok) {
                const data = await friendsRes.json();
                setPendingFriendsCount(data.length);
            }
            if (tasksRes && tasksRes.ok) {
                const data = await tasksRes.json();
                const pending = data.filter((t: any) => t.status !== 'COMPLETED');
                setPendingTasksCount(pending.length);
            }
            if (rankingRes && rankingRes.ok) {
                const data = await rankingRes.json();
                if (data.position) setRankingPosition(data.position);
            }
            if (gamRes && gamRes.ok) {
                const data = await gamRes.json();
                const now = new Date();
                setBuffs({
                    xpBoost: data.xpBoostUntil ? new Date(data.xpBoostUntil) > now : false,
                    radar: data.radarMateriaUntil ? new Date(data.radarMateriaUntil) > now : false,
                    elite: data.activeTitle === "Elite"
                });
                setUserLevel(data.level || 1);
                setActiveAura(data.activeAura || null);
                setActiveBorder(data.activeBorder || null);
                setActiveAuraMetadata(data.activeAuraMetadata || null);
                setActiveBorderMetadata(data.activeBorderMetadata || null);
            }
            if (onlineRes && onlineRes.ok) {
                const data = await onlineRes.json();
                setOnlineCount(data.count || 0);
            }
            if (flashcardsRes && flashcardsRes.ok) {
                const data = await flashcardsRes.json();
                setPendingFlashcardsCount(data.totalDue || 0);
            }
        } catch (err) {
            console.error("Failed to fetch sidebar data", err);
        }
    }, [authenticated, isFree]);

    useEffect(() => {
        fetchSidebarData();
        window.addEventListener("friends:updated", fetchSidebarData);
        window.addEventListener("tasks:updated", fetchSidebarData);
        window.addEventListener("buff-activated", fetchSidebarData);

        const interval = setInterval(fetchSidebarData, 120000);

        return () => {
            window.removeEventListener("friends:updated", fetchSidebarData);
            window.removeEventListener("tasks:updated", fetchSidebarData);
            window.removeEventListener("buff-activated", fetchSidebarData);
            clearInterval(interval);
        };
    }, [fetchSidebarData]);

    // Close more sheet when navigating
    useEffect(() => {
        setIsMoreOpen(false);
    }, [pathname]);

    // Command palette keyboard shortcut
    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault();
                setIsSearchOpen(o => !o);
            }
            if (e.key === "Escape") {
                setIsSearchOpen(false);
                setSearchQuery("");
            }
        };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, []);

    const Item = ({ href, icon: Icon, label, badge, badgeVariant = "rose", customBadge }: { href: string; icon: typeof LayoutDashboard; label: string; badge?: number; badgeVariant?: "rose" | "amber"; customBadge?: React.ReactNode }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        const isPremiumRoute = ["/pomodoro", "/simulados", "/flashcards", "/arena", "/redacao", "/desempenho", "/ranking", "/conquistas", "/amigos"].some(r => href.startsWith(r));
        const showLock = isFree && isPremiumRoute;
        const hasArenaInvite = label === "Arena PVP" && typeof badge === "number" && badge > 0;

        const handleClick = () => {
            setIsMoreOpen(false);
            if (label === "Pomodoro") {
                setPomodoroOpen(true);
            }
        };

        const baseClass = `group relative flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-[7px] rounded-lg text-[13px] font-medium transition-all`;
        let stateClass = "";

        if (hasArenaInvite) {
            stateClass = "bg-rose-50 text-rose-600 shadow-sm border border-rose-100 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20";
        } else if (active) {
            stateClass = "bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-700 dark:text-indigo-400 font-semibold";
        } else {
            stateClass = "text-muted-foreground hover:bg-muted hover:text-foreground";
        }

        const isPomodoro = label === "Pomodoro";
        const { isRunning, timeLeft } = usePomodoro();
        const displayLabel = isPomodoro && isRunning ? (
            <span className="flex items-center gap-1.5 flex-1 line-clamp-1">
                {label}
                <span className="text-indigo-600 font-bold bg-indigo-100 px-1 py-px rounded text-[10px] animate-pulse whitespace-nowrap">
                    {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
                </span>
            </span>
        ) : (
            <span className="flex-1 line-clamp-1">{label}</span>
        );

        return (
            <Link href={href}
                onClick={handleClick}
                title={isCollapsed ? label : undefined}
                className={`${baseClass} ${stateClass}`}>
                <div className="relative">
                    <Icon size={16} className={hasArenaInvite ? "text-rose-500 animate-pulse" : active ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground opacity-70 group-hover:opacity-100"} />
                    {isCollapsed && badge && badge > 0 && (
                        <div className={`absolute -top-1.5 -right-1.5 w-3.5 h-3.5 ${badgeVariant === "amber" ? "bg-amber-500" : "bg-rose-500"} text-white text-[8px] flex items-center justify-center rounded-full border border-white font-bold`}
                            title={badgeVariant === "amber" ? `${badge} cartas para revisar` : undefined}>
                            {badge > 9 ? '9+' : badge}
                        </div>
                    )}
                </div>
                {!isCollapsed && displayLabel}
                {!isCollapsed && (typeof badge === 'number' && badge > 0) && (
                    <span
                        className={`${badgeVariant === "amber" ? "bg-amber-500" : "bg-rose-500"} text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center`}
                        title={badgeVariant === "amber" ? `${badge} cartas para revisar` : undefined}>
                        {badge}
                    </span>
                )}
                {!isCollapsed && customBadge}
                {showLock && !isCollapsed && <Lock size={12} className="text-amber-500 shrink-0" />}
                {active && !isCollapsed && !showLock && !hasArenaInvite && <ChevronRight size={12} className="text-indigo-400 shrink-0" />}
            </Link>
        );
    };

    const paletteItems = allNavItems.filter(i =>
        searchQuery.trim() === "" || i.label.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Mobile bottom nav tabs
    const mobileNavTabs = [
        { href: "/dashboard", icon: LayoutDashboard, label: "Início" },
        { href: "/questoes/treino", icon: PlayCircle, label: "Quiz" },
        { href: "/arena", icon: Swords, label: "Arena", badge: pendingDuels.length },
        { href: "/ranking", icon: BarChart3, label: "Ranking", customBadge: rankingPosition },
    ];

    return (
        <>
            {/* ── Mobile top bar ─────────────────────────────────────────── */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-[calc(3.5rem+env(safe-area-inset-top))] pt-[env(safe-area-inset-top)] bg-card border-b border-border flex items-center justify-between px-4 z-40">
                <BrandLogo size="md" variant="dark" />
                <button
                    onClick={() => setIsMoreOpen(true)}
                    className="relative p-1"
                    aria-label="Menu"
                >
                    <Avatar
                        src={user?.avatarUrl}
                        name={user?.name || 'Usuário'}
                        rankLevel={userLevel}
                        activeAura={activeAura}
                        activeBorder={activeBorder}
                        auraMetadata={activeAuraMetadata}
                        borderMetadata={activeBorderMetadata}
                    />
                    {(buffs.xpBoost || buffs.radar || buffs.elite) && (
                        <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-card" />
                    )}
                </button>
            </div>

            {/* ── Mobile bottom nav ──────────────────────────────────────── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40 pb-[env(safe-area-inset-bottom)]">
                <div className="flex items-stretch h-14">
                    {mobileNavTabs.map(({ href, icon: Icon, label, badge, customBadge }) => {
                        const active = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${active ? "text-indigo-600" : "text-muted-foreground"}`}
                            >
                                {active && (
                                    <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-b-full" />
                                )}
                                <div className="relative">
                                    <Icon size={20} strokeWidth={active ? 2.5 : 1.75} />
                                    {typeof badge === "number" && badge > 0 && (
                                        <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold border-2 border-card">
                                            {badge > 9 ? '9+' : badge}
                                        </span>
                                    )}
                                    {typeof customBadge === "number" && customBadge > 0 && (
                                        <span className="absolute -top-1.5 -right-2 bg-amber-100 text-amber-700 text-[8px] font-bold px-1 rounded leading-tight border border-amber-200">
                                            #{customBadge}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] leading-none ${active ? "font-semibold" : "font-medium"}`}>{label}</span>
                            </Link>
                        );
                    })}

                    {/* More tab */}
                    <button
                        onClick={() => setIsMoreOpen(true)}
                        className={`flex-1 flex flex-col items-center justify-center gap-0.5 relative transition-colors ${isMoreOpen ? "text-indigo-600" : "text-muted-foreground"}`}
                    >
                        {isMoreOpen && (
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-indigo-600 rounded-b-full" />
                        )}
                        <div className="relative">
                            <Menu size={20} strokeWidth={1.75} />
                            {(pendingFriendsCount + pendingTasksCount + pendingFlashcardsCount) > 0 && (
                                <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full font-bold border-2 border-card">
                                    {(pendingFriendsCount + pendingTasksCount + pendingFlashcardsCount) > 9 ? '9+' : pendingFriendsCount + pendingTasksCount + pendingFlashcardsCount}
                                </span>
                            )}
                        </div>
                        <span className="text-[10px] font-medium leading-none">Mais</span>
                    </button>
                </div>
            </nav>

            {/* ── More sheet (mobile) ────────────────────────────────────── */}
            {isMoreOpen && (
                <>
                    <div
                        className="md:hidden fixed inset-0 bg-slate-900/30 z-50 backdrop-blur-sm"
                        onClick={() => setIsMoreOpen(false)}
                    />
                    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card rounded-t-2xl shadow-2xl overflow-hidden max-h-[85dvh] flex flex-col pb-[env(safe-area-inset-bottom)]">
                        {/* Drag handle */}
                        <div className="flex justify-center pt-2.5 pb-1 shrink-0">
                            <div className="w-9 h-1 bg-border rounded-full" />
                        </div>

                        {/* User profile */}
                        <div className="px-4 pt-2 pb-3 border-b border-border flex items-center gap-3 shrink-0">
                            <Avatar src={user?.avatarUrl} name={user?.name || 'Usuário'} rankLevel={userLevel} activeAura={activeAura} activeBorder={activeBorder} />
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-foreground truncate leading-none mb-1">
                                    {user?.name || 'Usuário'}
                                </p>
                                <p className="text-[11px] text-indigo-500 truncate leading-none">
                                    @{user?.nickname || 'nickname'}
                                </p>
                                {(buffs.xpBoost || buffs.radar || buffs.elite) && (
                                    <div className="flex gap-1.5 items-center mt-1.5">
                                        {buffs.xpBoost && (
                                            <div title="XP 2x Ativo" className="h-5 px-1.5 rounded-md bg-amber-100 flex items-center gap-0.5 text-amber-600 border border-amber-200">
                                                <Zap size={10} className="fill-current" />
                                                <span className="text-[9px] font-black leading-none">2x</span>
                                            </div>
                                        )}
                                        {buffs.radar && (
                                            <div title="Radar Ativo" className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                                                <Target size={10} />
                                            </div>
                                        )}
                                        {buffs.elite && (
                                            <div title="Status Elite" className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
                                                <Crown size={10} className="fill-current" />
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={() => setIsMoreOpen(false)}
                                className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted transition-colors"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Search */}
                        <div className="px-3 py-2.5 border-b border-border shrink-0">
                            <button
                                onClick={() => { setIsSearchOpen(true); setIsMoreOpen(false); }}
                                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg bg-muted border border-border text-muted-foreground text-[13px] hover:border-indigo-300 transition-colors"
                            >
                                <Search size={14} />
                                <span>Buscar...</span>
                            </button>
                        </div>

                        {/* Nav content */}
                        <div className="overflow-y-auto flex-1 px-3 py-3 space-y-3">
                            {/* Estudar */}
                            <div>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">Estudar</p>
                                <div className="space-y-px">
                                    {studyNav.map((i) => (
                                        <Item
                                            key={i.href}
                                            {...i}
                                            badge={i.label === "Arena PVP" ? pendingDuels.length : i.label === "Flashcards" ? pendingFlashcardsCount || undefined : undefined}
                                            badgeVariant={i.label === "Flashcards" ? "amber" : "rose"}
                                            customBadge={
                                                i.label === "Arena PVP" && (!pendingDuels || pendingDuels.length === 0) && onlineCount > 0 ? (
                                                    <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                                        {onlineCount}
                                                    </div>
                                                ) : undefined
                                            }
                                        />
                                    ))}
                                    {entitlements?.find(e => e.course?.id === selectedCourseId)?.course?.hasEssay && (
                                        <Item href="/redacao" icon={FileText} label="Redação" />
                                    )}
                                </div>
                            </div>

                            {/* Planejar */}
                            <div>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">Planejar</p>
                                <div className="space-y-px">
                                    {planNav.map((i) => (
                                        <Item key={i.href} {...i} badge={i.label === "Tarefas" ? pendingTasksCount || undefined : undefined} />
                                    ))}
                                </div>
                            </div>

                            {/* Acompanhar */}
                            <div>
                                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">Acompanhar</p>
                                <div className="space-y-px">
                                    {trackNav.map((i) => (
                                        <Item
                                            key={i.href}
                                            {...i}
                                            badge={i.label === "Amigos" ? pendingFriendsCount : undefined}
                                            customBadge={
                                                i.label === "Ranking" && rankingPosition ? (
                                                    <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md">
                                                        #{rankingPosition}
                                                    </span>
                                                ) : undefined
                                            }
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* Bottom nav items */}
                            <div className="border-t border-border pt-3 space-y-px">
                                {bottomNav.map((i) => <Item key={i.href} {...i} />)}
                            </div>
                        </div>

                        {/* Plan info + logout */}
                        <div className="px-3 py-3 border-t border-border shrink-0 space-y-2">
                            <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-3.5 py-3">
                                {subscription || entitlements?.some(e => e.course?.id === selectedCourseId && e.active) ? (
                                    <>
                                        <p className="text-[11px] font-bold text-indigo-700 mb-0.5">
                                            {subscription?.plan?.name || (entitlements?.find(e => e.course?.id === selectedCourseId)?.source === 'MANUAL' ? 'Plano Vitalício' : 'Plano Ativo')}
                                        </p>
                                        <p className="text-[10px] text-indigo-500/70 truncate">
                                            {entitlements?.find(e => e.course?.id === selectedCourseId)?.course?.title || "Curso Ativo"}
                                        </p>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-[11px] font-bold text-indigo-700 mb-0.5">Plano Free</p>
                                        <p className="text-[10px] text-indigo-500/70">Faca upgrade para desbloquear tudo</p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={logout}
                                className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] font-medium text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all"
                            >
                                <LogOut size={15} />
                                Sair
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* ── Desktop sidebar (unchanged) ───────────────────────────── */}
            <aside className={`
                ${isCollapsed ? 'w-[72px]' : 'w-[230px]'} shrink-0 h-[100dvh] bg-card border-r border-border flex-col
                hidden md:flex sticky top-0 z-50 transition-[width] duration-300 ease-in-out
            `}>
                <div
                    className={`h-16 flex items-center ${isCollapsed ? 'justify-center cursor-pointer hover:bg-muted/50 transition-colors' : 'justify-between px-4'} border-b border-border shrink-0`}
                    onClick={() => isCollapsed && setIsCollapsed(false)}
                    title={isCollapsed ? "Expandir menu" : undefined}
                >
                    <BrandLogo size="md" variant="dark" collapsed={isCollapsed} link={!isCollapsed} />
                    {!isCollapsed && (
                        <button onClick={(e) => { e.stopPropagation(); setIsCollapsed(true); }} className="p-1.5 text-muted-foreground hover:bg-muted rounded-md transition-colors flex-shrink-0">
                            <ChevronLeft size={18} />
                        </button>
                    )}
                </div>

                {/* User Profile Summary */}
                <div className={`px-3 py-4 border-b border-border bg-slate-50/50 ${isCollapsed ? 'flex justify-center' : ''}`}>
                    <div className={`flex items-center gap-3 ${!isCollapsed ? 'px-2' : ''}`}>
                        <Avatar
                            src={user?.avatarUrl}
                            name={user?.name || 'Usuário'}
                            rankLevel={userLevel}
                            activeAura={activeAura}
                            activeBorder={activeBorder}
                            auraMetadata={activeAuraMetadata}
                            borderMetadata={activeBorderMetadata}
                        />
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-900 truncate leading-none mb-1">
                                    {user?.name || 'Usuário'}
                                </p>
                                <p className="text-[10px] font-medium text-indigo-500 truncate leading-none mb-2">
                                    @{user?.nickname || 'nickname'}
                                </p>
                                <div className="flex gap-1.5 items-center">
                                    {buffs.xpBoost && (
                                        <div title="XP 2x Ativo" className="h-5 px-1.5 rounded-md bg-amber-100 flex items-center gap-0.5 justify-center text-amber-600 border border-amber-200">
                                            <Zap size={10} className="fill-current" />
                                            <span className="text-[9px] font-black leading-none">2x</span>
                                        </div>
                                    )}
                                    {buffs.radar && (
                                        <div title="Radar Ativo" className="w-5 h-5 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-600 border border-emerald-200">
                                            <Target size={10} />
                                        </div>
                                    )}
                                    {buffs.elite && (
                                        <div title="Status Elite" className="w-5 h-5 rounded-md bg-purple-100 flex items-center justify-center text-purple-600 border border-purple-200">
                                            <Crown size={10} className="fill-current" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                    {isCollapsed && (buffs.xpBoost || buffs.radar || buffs.elite) && (
                        <div className="flex justify-center mt-2 gap-1 flex-wrap px-2">
                            {buffs.xpBoost && <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />}
                            {buffs.radar && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />}
                            {buffs.elite && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                        </div>
                    )}
                </div>

                <div className="px-3 py-2.5">
                    <button
                        onClick={() => setIsSearchOpen(true)}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0 py-2' : 'gap-2 px-3 py-1.5'} rounded-lg bg-muted border border-border text-muted-foreground text-[11px] hover:border-indigo-300 transition-colors`}
                        title={isCollapsed ? "Buscar..." : undefined}
                    >
                        <Search size={13} />
                        {!isCollapsed && <span>Buscar...</span>}
                        {!isCollapsed && <span className="ml-auto bg-card border border-border px-1.5 py-0.5 rounded text-[9px] font-mono">&#8984;K</span>}
                    </button>
                </div>

                <nav className="flex-1 px-2.5 overflow-y-auto overflow-x-hidden">
                    {!isCollapsed ? (
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5 mt-1">Estudar</p>
                    ) : (
                        <div className="h-4" />
                    )}
                    <div className="space-y-px mb-3">
                        {studyNav.map((i) => (
                            <Item
                                key={i.href}
                                {...i}
                                badge={i.label === "Arena PVP" ? pendingDuels.length : i.label === "Flashcards" ? pendingFlashcardsCount || undefined : undefined}
                                badgeVariant={i.label === "Flashcards" ? "amber" : "rose"}
                                customBadge={
                                    i.label === "Arena PVP" && (!pendingDuels || pendingDuels.length === 0) && onlineCount > 0 ? (
                                        <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400" title={`${onlineCount} online`}>
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_5px_rgba(16,185,129,0.5)]" />
                                            {onlineCount}
                                        </div>
                                    ) : undefined
                                }
                            />
                        ))}
                        {entitlements?.find(e => e.course?.id === selectedCourseId)?.course?.hasEssay && (
                            <Item href="/redacao" icon={FileText} label="Redação" />
                        )}
                    </div>

                    {!isCollapsed ? (
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5 mt-3">Planejar</p>
                    ) : (
                        <div className="w-4 h-px bg-border mx-auto my-3" />
                    )}
                    <div className="space-y-px mb-3">
                        {planNav.map((i) => <Item key={i.href} {...i} badge={i.label === "Tarefas" ? pendingTasksCount || undefined : undefined} />)}
                    </div>

                    {!isCollapsed ? (
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5 mt-3">Acompanhar</p>
                    ) : (
                        <div className="w-4 h-px bg-border mx-auto my-3" />
                    )}
                    <div className="space-y-px mb-3">
                        {trackNav.map((i) => (
                            <Item
                                key={i.href}
                                {...i}
                                badge={i.label === "Amigos" ? pendingFriendsCount : undefined}
                                customBadge={
                                    i.label === "Ranking" && rankingPosition ? (
                                        <span className="bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-bold px-1.5 py-0.5 rounded-md min-w-[24px] text-center">
                                            #{rankingPosition}
                                        </span>
                                    ) : undefined
                                }
                            />
                        ))}
                    </div>
                    <div className="border-t border-border pt-2 space-y-px mt-2">
                        {bottomNav.map((i) => <Item key={i.href} {...i} />)}
                    </div>
                </nav>

                <div className={`px-2.5 py-3 border-t border-border space-y-2`}>
                    {!isCollapsed && (
                        <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-3.5 py-3">
                            {subscription || entitlements?.some(e => e.course?.id === selectedCourseId && e.active) ? (
                                <>
                                    <p className="text-[11px] font-bold text-indigo-700 mb-0.5">
                                        {subscription?.plan?.name || (entitlements?.find(e => e.course?.id === selectedCourseId)?.source === 'MANUAL' ? 'Plano Vitalício' : 'Plano Ativo')}
                                    </p>
                                    <p className="text-[10px] text-indigo-500/70 mb-2 truncate">
                                        {entitlements?.find(e => e.course?.id === selectedCourseId)?.course?.title || "Curso Ativo"}
                                    </p>
                                </>
                            ) : (
                                <>
                                    <p className="text-[11px] font-bold text-indigo-700 mb-0.5">Plano Free</p>
                                    <p className="text-[10px] text-indigo-500/70 mb-2">Faca upgrade para desbloquear tudo</p>
                                </>
                            )}
                            <Link href="/ranking" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                                Ver metas <ChevronRight size={11} />
                            </Link>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        title={isCollapsed ? "Sair" : undefined}
                        className={`w-full flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-2 rounded-lg text-[12px] font-medium text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all`}>
                        <LogOut size={15} /> {!isCollapsed && "Sair"}
                    </button>
                </div>
            </aside>

            {/* ── Command Palette ─────────────────────────────────────────── */}
            {isSearchOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[200] flex items-start justify-center pt-[15vh]"
                    onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                >
                    <div
                        className="palette-in w-full max-w-lg mx-4 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border">
                            <Search size={16} className="text-muted-foreground flex-shrink-0" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar páginas..."
                                className="flex-1 bg-transparent text-[14px] outline-none text-foreground placeholder:text-muted-foreground"
                            />
                            <kbd className="text-[10px] font-mono text-muted-foreground bg-muted border border-border px-1.5 py-0.5 rounded">ESC</kbd>
                        </div>
                        <div className="max-h-80 overflow-y-auto py-2">
                            {paletteItems.map(item => {
                                const PIcon = item.icon;
                                return (
                                    <Link
                                        key={item.href}
                                        href={item.href}
                                        onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-muted transition-colors group"
                                    >
                                        <PIcon size={15} className="text-muted-foreground group-hover:text-foreground flex-shrink-0" />
                                        <span className="text-[13px] text-foreground">{item.label}</span>
                                    </Link>
                                );
                            })}
                            {paletteItems.length === 0 && (
                                <p className="text-center text-[13px] text-muted-foreground py-8">Nenhum resultado</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
