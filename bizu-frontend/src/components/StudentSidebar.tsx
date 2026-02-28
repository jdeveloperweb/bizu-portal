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
    StickyNote, Settings, BarChart3, Menu, X, FileText, PlayCircle, CreditCard, Users, Lock, Brain
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
];

const bottomNav = [
    { href: "/faturamento", icon: CreditCard, label: "Faturamento" },
    { href: "/configuracoes", icon: Settings, label: "Configuracoes" },
    { href: "/perfil", icon: User, label: "Meu Perfil" },
];

export default function StudentSidebar() {
    const pathname = usePathname();
    const { logout, user, subscription, entitlements, selectedCourseId, isFree, authenticated } = useAuth();
    const { setIsOpen: setPomodoroOpen } = usePomodoro();
    const { pendingDuels } = useDuels();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [pendingFriendsCount, setPendingFriendsCount] = useState(0);
    const [pendingTasksCount, setPendingTasksCount] = useState(0);
    const [rankingPosition, setRankingPosition] = useState<number | null>(null);

    const fetchSidebarData = useCallback(async () => {
        if (!authenticated || isFree) return;
        try {
            const [friendsRes, tasksRes, rankingRes] = await Promise.all([
                apiFetch("/friends/pending").catch(() => null),
                apiFetch("/student/tasks").catch(() => null),
                apiFetch("/student/ranking/me").catch(() => null)
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
        } catch (err) {
            console.error("Failed to fetch sidebar data", err);
        }
    }, [authenticated, isFree]);

    useEffect(() => {
        fetchSidebarData();
        window.addEventListener("friends:updated", fetchSidebarData);
        window.addEventListener("tasks:updated", fetchSidebarData);

        const interval = setInterval(fetchSidebarData, 120000); // 2 minutos

        return () => {
            window.removeEventListener("friends:updated", fetchSidebarData);
            window.removeEventListener("tasks:updated", fetchSidebarData);
            clearInterval(interval);
        };
    }, [fetchSidebarData]);

    const Item = ({ href, icon: Icon, label, badge, customBadge }: { href: string; icon: typeof LayoutDashboard; label: string; badge?: number; customBadge?: React.ReactNode }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        const isPremiumRoute = ["/pomodoro", "/simulados", "/flashcards", "/arena", "/redacao", "/desempenho", "/ranking", "/conquistas", "/amigos"].some(r => href.startsWith(r));
        const showLock = isFree && isPremiumRoute;
        const hasArenaInvite = label === "Arena PVP" && typeof badge === "number" && badge > 0;

        const handleClick = () => {
            setIsMobileMenuOpen(false);
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
                        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border border-white font-bold">
                            {badge > 9 ? '9+' : badge}
                        </div>
                    )}
                </div>
                {!isCollapsed && displayLabel}
                {!isCollapsed && badge && badge > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                        {badge}
                    </span>
                )}
                {!isCollapsed && customBadge}
                {showLock && !isCollapsed && <Lock size={12} className="text-amber-500 shrink-0" />}
                {active && !isCollapsed && !showLock && !hasArenaInvite && <ChevronRight size={12} className="text-indigo-400 shrink-0" />}
            </Link>
        );
    };

    return (
        <>
            {/* Menu Mobile Topo */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center justify-between px-4 z-40">
                <BrandLogo size="md" variant="dark" />
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 -mr-2 text-muted-foreground hover:text-indigo-600 transition-colors">
                    {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Overlay Mobile */}
            {isMobileMenuOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            <aside className={`
                ${isCollapsed ? 'w-[72px]' : 'w-[230px]'} shrink-0 h-[100dvh] bg-card border-r border-border flex flex-col
                fixed md:sticky top-0 z-50 transition-[width,transform] duration-300 ease-in-out
                ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
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
                        />
                        {!isCollapsed && (
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-slate-900 truncate leading-none mb-1">
                                    {user?.name || 'Usuário'}
                                </p>
                                <p className="text-[10px] font-medium text-indigo-500 truncate leading-none">
                                    @{user?.nickname || 'nickname'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="px-3 py-2.5">
                    <div className={`flex items-center ${isCollapsed ? 'justify-center px-0 py-2' : 'gap-2 px-3 py-1.5'} rounded-lg bg-muted border border-border text-muted-foreground text-[11px] cursor-pointer hover:border-border transition-colors`} title={isCollapsed ? "Buscar..." : undefined}>
                        <Search size={13} />
                        {!isCollapsed && <span>Buscar...</span>}
                        {!isCollapsed && <span className="ml-auto bg-card border border-border px-1.5 py-0.5 rounded text-[9px] font-mono">&#8984;K</span>}
                    </div>
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
                                badge={i.label === "Arena PVP" ? pendingDuels.length : undefined}
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
        </>
    );
}
