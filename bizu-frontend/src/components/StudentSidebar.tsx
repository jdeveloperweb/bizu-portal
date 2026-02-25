"use client";

import { useState } from "react"; import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import {
    LayoutDashboard, BookOpen, ClipboardList, Layers,
    Swords, TrendingUp, User, Trophy, LogOut,
    ChevronRight, Search, Timer, CheckSquare,
    StickyNote, Settings, BarChart3, Menu, X, FileText, PlayCircle, CreditCard
} from "lucide-react";

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
];

const bottomNav = [
    { href: "/faturamento", icon: CreditCard, label: "Faturamento" },
    { href: "/configuracoes", icon: Settings, label: "Configuracoes" },
    { href: "/perfil", icon: User, label: "Meu Perfil" },
];

export default function StudentSidebar() {
    const pathname = usePathname();
    const { logout, subscription, entitlements, selectedCourseId } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const Item = ({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
            <Link href={href}
                onClick={() => setIsOpen(false)}
                className={`group flex items-center gap-2.5 px-3 py-[7px] rounded-lg text-[13px] font-medium transition-all ${active
                    ? "bg-gradient-to-r from-indigo-50 to-violet-50 dark:from-indigo-500/10 dark:to-violet-500/10 text-indigo-700 dark:text-indigo-400 font-semibold"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}>
                <Icon size={16} className={active ? "text-indigo-600 dark:text-indigo-400" : "text-muted-foreground opacity-70 group-hover:opacity-100"} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} className="text-indigo-400" />}
            </Link>
        );
    };

    return (
        <>
            {/* Menu Mobile Topo */}
            <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-background border-b border-border flex items-center justify-between px-4 z-40">
                <BrandLogo size="md" variant="dark" />
                <button onClick={() => setIsOpen(!isOpen)} className="p-2 -mr-2 text-muted-foreground hover:text-indigo-600 transition-colors">
                    {isOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
            </div>

            {/* Overlay Mobile */}
            {isOpen && (
                <div
                    className="md:hidden fixed inset-0 bg-slate-900/20 z-40 backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <aside className={`
                w-[230px] shrink-0 h-[100dvh] bg-card border-r border-border flex flex-col
                fixed md:sticky top-0 z-50 transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                <div className="h-16 flex items-center px-4 border-b border-border shrink-0">
                    <BrandLogo size="md" variant="dark" />
                </div>

                <div className="px-3 py-2.5">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-[11px] cursor-pointer hover:border-border transition-colors">
                        <Search size={13} />
                        <span>Buscar...</span>
                        <span className="ml-auto bg-card border border-border px-1.5 py-0.5 rounded text-[9px] font-mono">&#8984;K</span>
                    </div>
                </div>

                <nav className="flex-1 px-2.5 overflow-y-auto">
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5 mt-1">Estudar</p>
                    <div className="space-y-px mb-3">
                        {studyNav.map((i) => <Item key={i.href} {...i} />)}
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">Planejar</p>
                    <div className="space-y-px mb-3">
                        {planNav.map((i) => <Item key={i.href} {...i} />)}
                    </div>
                    <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-[0.15em] px-3 mb-1.5">Acompanhar</p>
                    <div className="space-y-px mb-3">
                        {trackNav.map((i) => <Item key={i.href} {...i} />)}
                    </div>
                    <div className="border-t border-border pt-2 space-y-px">
                        {bottomNav.map((i) => <Item key={i.href} {...i} />)}
                    </div>
                </nav>

                <div className="px-2.5 py-3 border-t border-border space-y-2">
                    <div className="rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-3.5 py-3">
                        {subscription || entitlements?.some(e => e.course?.id === selectedCourseId && e.active) ? (
                            <>
                                <p className="text-[11px] font-bold text-indigo-700 mb-0.5">
                                    {subscription?.plan?.name || (entitlements?.find(e => e.course?.id === selectedCourseId)?.source === 'MANUAL' ? 'Plano Vitalício' : 'Plano Ativo')}
                                </p>
                                <p className="text-[10px] text-indigo-500/70 mb-2">
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
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[12px] font-medium text-muted-foreground hover:bg-red-50 hover:text-red-500 transition-all">
                        <LogOut size={15} /> Sair
                    </button>
                </div>
            </aside>
        </>
    );
}
