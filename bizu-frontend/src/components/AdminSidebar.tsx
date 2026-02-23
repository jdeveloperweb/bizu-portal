"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import {
    PieChart, Users, BookOpen, CreditCard, Ticket,
    Palette, Settings, HelpCircle, LogOut, ChevronRight,
    ShieldAlert
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();

    const navItems = [
        { href: "/admin", icon: PieChart, label: "Visao Geral" },
        { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
        { href: "/admin/cursos", icon: BookOpen, label: "Cursos" },
        { href: "/admin/questoes", icon: HelpCircle, label: "Banco de Questoes" },
        { href: "/admin/planos", icon: CreditCard, label: "Planos & Precos" },
        { href: "/admin/cupons", icon: Ticket, label: "Cupons" },
        { href: "/admin/branding", icon: Palette, label: "Branding" },
    ];

    const bottomItems = [
        { href: "/admin/configuracoes", icon: Settings, label: "Configuracoes" },
    ];

    const NavLink = ({ item, exact = false }: { item: any, exact?: boolean }) => {
        const active = exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
            <Link href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${active
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                    }`}>
                <item.icon size={18} className={active ? "text-white" : "text-slate-400 group-hover:text-slate-600"} />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={14} className="text-white/70" />}
            </Link>
        );
    };

    return (
        <aside className="w-[280px] shrink-0 h-screen sticky top-0 flex flex-col bg-white border-r border-slate-100">
            <div className="h-20 flex px-6 items-center justify-between border-b border-slate-50">
                <BrandLogo size="sm" variant="gradient" link={false} />
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-50 text-red-600 border border-red-100" title="Modo Admin">
                    <ShieldAlert size={14} />
                </div>
            </div>

            <div className="flex-1 px-4 py-6 overflow-y-auto flex flex-col gap-1">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mb-2">Principal</p>
                <NavLink item={navItems[0]} exact />

                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-3 mt-6 mb-2">Gerenciamento</p>
                {navItems.slice(1).map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
            </div>

            <div className="p-4 border-t border-slate-50">
                <div className="space-y-1 mb-4">
                    {bottomItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold">
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold text-slate-900 truncate">Admin Geral</div>
                        <div className="text-[11px] text-slate-500">Sessao ativa</div>
                    </div>
                    <button className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                        <LogOut size={16} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
