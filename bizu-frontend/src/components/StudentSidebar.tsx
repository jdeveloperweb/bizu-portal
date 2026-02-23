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
} from "lucide-react";

const navItems = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/cursos", icon: BookOpen, label: "Cursos" },
    { href: "/simulados", icon: ClipboardList, label: "Simulados" },
    { href: "/flashcards", icon: Layers, label: "Flashcards" },
    { href: "/arena", icon: Swords, label: "Arena PVP" },
    { href: "/desempenho", icon: TrendingUp, label: "Desempenho" },
    { href: "/conquistas", icon: Trophy, label: "Conquistas" },
    { href: "/perfil", icon: User, label: "Perfil" },
];

export default function StudentSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-60 shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-100 shadow-sm">
            {/* Logo */}
            <div className="h-16 flex items-center px-5 border-b border-slate-100">
                <Link href="/" className="flex items-center gap-1.5">
                    <span
                        className="text-[26px] leading-none"
                        style={{ fontFamily: "Bobaland, sans-serif" }}
                    >
                        <span className="text-slate-900">Bizu</span>
                        <span className="text-[#6366F1]">!</span>
                    </span>
                    <span className="text-[9px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-1">
                        Portal
                    </span>
                </Link>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-3 py-4 overflow-y-auto">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-3">
                    Menu
                </p>
                <ul className="space-y-0.5">
                    {navItems.map(({ href, icon: Icon, label }) => {
                        const active = pathname === href || pathname.startsWith(href + "/");
                        return (
                            <li key={href}>
                                <Link
                                    href={href}
                                    className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 ${active
                                            ? "bg-[#EEF2FF] text-[#4F46E5] font-semibold"
                                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                        }`}
                                >
                                    <Icon
                                        className={`w-4.5 h-4.5 shrink-0 ${active ? "text-[#6366F1]" : "text-slate-400 group-hover:text-slate-600"}`}
                                        size={18}
                                    />
                                    {label}
                                    {active && <ChevronRight size={14} className="ml-auto text-[#6366F1]" />}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Sair */}
            <div className="px-3 py-4 border-t border-slate-100">
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
                    <LogOut size={18} />
                    Sair
                </button>
            </div>
        </aside>
    );
}
