"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import {
    LayoutDashboard, BookOpen, ClipboardList, Layers,
    Swords, TrendingUp, User, Trophy, LogOut,
    ChevronRight, Search, Flame,
} from "lucide-react";

const studyNav = [
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
    const { logout } = useAuth();

    const Item = ({ href, icon: Icon, label }: { href: string; icon: typeof LayoutDashboard; label: string }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
            <Link href={href}
                className={`group flex items-center gap-2.5 px-3 py-[7px] rounded-xl text-[13px] font-medium transition-all ${active
                    ? "bg-gradient-to-r from-indigo-50 to-violet-50 text-indigo-700 font-semibold"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                    }`}>
                <Icon size={16} className={active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500"} />
                <span className="flex-1">{label}</span>
                {active && <ChevronRight size={12} className="text-indigo-400" />}
            </Link>
        );
    };

    return (
        <aside className="w-[230px] shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-100/80">
            <div className="h-14 flex items-center justify-between px-4 border-b border-slate-50">
                <BrandLogo size="sm" variant="dark" />
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                    <Flame size={10} /> 7
                </div>
            </div>

            <div className="px-3 py-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-100 text-slate-400 text-[11px] cursor-pointer hover:border-slate-200 transition-colors">
                    <Search size={13} />
                    <span>Buscar...</span>
                    <span className="ml-auto bg-white border border-slate-200 px-1.5 py-0.5 rounded text-[9px] font-mono">⌘K</span>
                </div>
            </div>

            <nav className="flex-1 px-2.5 overflow-y-auto">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] px-3 mb-1.5 mt-1">Estudar</p>
                <div className="space-y-px mb-4">
                    {studyNav.map((i) => <Item key={i.href} {...i} />)}
                </div>
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.15em] px-3 mb-1.5">Acompanhar</p>
                <div className="space-y-px">
                    {trackNav.map((i) => <Item key={i.href} {...i} />)}
                </div>
            </nav>

            <div className="px-2.5 py-3 border-t border-slate-50 space-y-2">
                <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-3.5 py-3">
                    <p className="text-[11px] font-bold text-indigo-700 mb-0.5">Plano Free</p>
                    <p className="text-[10px] text-indigo-500/70 mb-2">Faca upgrade para desbloquear tudo</p>
                    <Link href="/pricing" className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                        Ver planos <ChevronRight size={11} />
                    </Link>
                </div>
                <button
                    onClick={logout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12px] font-medium text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                    <LogOut size={15} /> Sair
                </button>
            </div>
        </aside>
    );
}
