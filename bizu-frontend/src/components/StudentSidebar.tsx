"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BookOpen,
    ClipboardList,
    Layers,
    Swords,
    TrendingUp,
    User,
    Trophy,
    LogOut,
    ChevronRight,
    Search,
    Bell,
    Flame,
} from "lucide-react";

const mainNav = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/cursos", icon: BookOpen, label: "Cursos" },
    { href: "/simulados", icon: ClipboardList, label: "Simulados" },
    { href: "/flashcards", icon: Layers, label: "Flashcards" },
    { href: "/arena", icon: Swords, label: "Arena PVP" },
];

const trackNav = [
    { href: "/desempenho", icon: TrendingUp, label: "Desempenho" },
    { href: "/conquistas", icon: Trophy, label: "Conquistas" },
    { href: "/perfil", icon: User, label: "Meu Perfil" },
];

export default function StudentSidebar() {
    const pathname = usePathname();

    const NavItem = ({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
            <Link
                href={href}
                className={`group flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 ${active
                        ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 font-semibold shadow-sm shadow-indigo-500/5"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}
            >
                <Icon
                    size={17}
                    className={`shrink-0 ${active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"}`}
                />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={13} className="text-indigo-400" />}
            </Link>
        );
    };

    return (
        <aside className="w-[240px] shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-100">

            {/* Logo + streak */}
            <div className="h-16 flex items-center justify-between px-5 border-b border-slate-50">
                <Link href="/" className="flex items-center gap-1.5">
                    <span className="text-[22px] leading-none" style={{ fontFamily: "Bobaland, sans-serif" }}>
                        <span className="text-slate-900">Bizu</span>
                        <span className="text-indigo-500">!</span>
                    </span>
                    <span className="text-[9px] font-bold tracking-[0.15em] text-slate-400 uppercase mt-0.5">Portal</span>
                </Link>
                <div className="flex items-center gap-1 pill-warning text-[10px] py-0.5 px-2">
                    <Flame size={11} />
                    <span className="font-bold">7</span>
                </div>
            </div>

            {/* Search */}
            <div className="px-4 py-3">
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-slate-400">
                    <Search size={14} />
                    <span className="text-xs">Buscar...</span>
                    <span className="ml-auto text-[10px] bg-white border border-slate-200 px-1.5 py-0.5 rounded font-mono">Ctrl+K</span>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2 mt-1">
                    Estudar
                </p>
                <div className="space-y-0.5 mb-5">
                    {mainNav.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </div>

                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">
                    Acompanhar
                </p>
                <div className="space-y-0.5">
                    {trackNav.map((item) => (
                        <NavItem key={item.href} {...item} />
                    ))}
                </div>
            </nav>

            {/* Plan badge + Sair */}
            <div className="px-3 py-3 border-t border-slate-50 space-y-2">
                <div className="bg-gradient-to-r from-indigo-50 to-violet-50 rounded-xl px-4 py-3 border border-indigo-100">
                    <p className="text-[11px] font-bold text-indigo-700 mb-0.5">Plano Gratuito</p>
                    <p className="text-[10px] text-indigo-500 mb-2">5 dias restantes do trial</p>
                    <Link href="/pricing" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors flex items-center gap-1">
                        Fazer upgrade <ChevronRight size={12} />
                    </Link>
                </div>

                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <LogOut size={16} />
                    Sair da conta
                </button>
            </div>
        </aside>
    );
}
