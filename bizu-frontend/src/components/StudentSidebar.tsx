"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import {
    LayoutDashboard, BookOpen, ClipboardList, Layers,
    Swords, TrendingUp, User, Trophy, LogOut,
    ChevronRight, ChevronLeft, Search, Timer, CheckSquare,
    StickyNote, Settings, BarChart3, Menu, X, FileText, PlayCircle, CreditCard, Users
} from "lucide-react";
import { getAvatarUrl } from "@/lib/imageUtils";
import { usePomodoro } from "@/contexts/PomodoroContext";

const studyNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/cursos", icon: BookOpen, label: "Meus Cursos" },
    { href: "/materiais", icon: FileText, label: "Materiais" },
    { href: "/questoes/treino", icon: PlayCircle, label: "Quiz" },
    { href: "/simulados", icon: ClipboardList, label: "Simulados" },
    { href: "/pomodoro", icon: Timer, label: "Pomodoro" },
    { href: "/flashcards", icon: Layers, label: "Flashcards" },
    { href: "/arena", icon: Swords, label: "Arena PVP" },
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
    const { logout, user, subscription, entitlements, selectedCourseId } = useAuth();
    const { setIsOpen: setPomodoroOpen } = usePomodoro();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const Item = ({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        const handleClick = () => {
            setIsMobileMenuOpen(false);
            if (label === "Pomodoro") {
                setPomodoroOpen(true);
            }
        };

        return (
            <Link href={href}
                onClick={handleClick}
                title={isCollapsed ? label : undefined}
                className={`group flex items-center ${isCollapsed ? 'justify-center px-0' : 'gap-2.5 px-3'} py-[7px] rounded-lg text-[13px] font-medium transition-all ${active
                    ? "bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}>
                <Icon size={16} className={active ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground opacity-70 group-hover:opacity-100"} />
                {!isCollapsed && <span className="flex-1">{label}</span>}
                {active && !isCollapsed && <ChevronRight size={12} className="text-indigo-400" />}
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
                        <div className="w-10 h-10 rounded-xl overflow-hidden bg-indigo-100 border border-indigo-200 shadow-sm shrink-0" title={user?.name || 'Usuário'}>
                            {user?.avatarUrl ? (
                                <img
                                    src={getAvatarUrl(user.avatarUrl)}
                                    className="w-full h-full object-cover"
                                    alt="Profile"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-indigo-600 font-bold text-sm">
                                    {(user?.name || 'U').slice(0, 1).toUpperCase()}
                                </div>
                            )}
                        </div>
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
                        {studyNav.map((i) => <Item key={i.href} {...i} />)}
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
                        {planNav.map((i) => <Item key={i.href} {...i} />)}
                    </div>

                    {!isCollapsed ? (
                        <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5 mt-3">Acompanhar</p>
                    ) : (
                        <div className="w-4 h-px bg-border mx-auto my-3" />
                    )}
                    <div className="space-y-px mb-3">
                        {trackNav.map((i) => <Item key={i.href} {...i} />)}
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
