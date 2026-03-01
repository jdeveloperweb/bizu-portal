"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import BrandLogo from "@/components/BrandLogo";
import {
    PieChart, Users, BookOpen, CreditCard, Ticket,
    Palette, Settings, HelpCircle, LogOut, ChevronRight,
    ShieldAlert
} from "lucide-react";

export default function AdminSidebar() {
    const pathname = usePathname();
    const { logout } = useAuth();

    const navItems = [
        { href: "/admin", icon: PieChart, label: "Visao Geral" },
        { href: "/admin/usuarios", icon: Users, label: "Usuarios" },
        { href: "/admin/assinaturas", icon: ShieldAlert, label: "Assinaturas" },
        { href: "/admin/pagamentos", icon: Ticket, label: "Fluxo de Caixa" },
        { href: "/admin/cursos", icon: BookOpen, label: "Cursos" },
        { href: "/admin/simulados", icon: BookOpen, label: "Simulados" },
        { href: "/admin/questoes", icon: HelpCircle, label: "Banco de Questoes" },
        { href: "/admin/planos", icon: CreditCard, label: "Planos & Precos" },
        { href: "/admin/cupons", icon: Ticket, label: "Cupons" },
        { href: "/admin/branding", icon: Palette, label: "Branding" },
    ];

    const bottomItems = [
        { href: "/admin/configuracoes", icon: Settings, label: "Configuracoes" },
    ];

    const NavLink = ({ item, exact = false }: { item: any; exact?: boolean }) => {
        const active = exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(item.href + "/");

        return (
            <Link
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                    active ? "text-indigo-300" : "text-slate-500 hover:text-slate-300"
                }`}
                style={
                    active
                        ? { background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.22)" }
                        : { border: "1px solid transparent" }
                }
            >
                <item.icon
                    size={15}
                    className={active ? "text-indigo-400" : "text-slate-600 group-hover:text-slate-400"}
                />
                <span className="flex-1">{item.label}</span>
                {active && <ChevronRight size={11} className="text-indigo-500/50" />}
            </Link>
        );
    };

    return (
        <aside
            className="w-[256px] shrink-0 h-screen sticky top-0 flex flex-col border-r"
            style={{ background: "#060D1A", borderColor: "rgba(99,102,241,0.1)" }}
        >
            {/* Header */}
            <div
                className="h-16 flex px-5 items-center justify-between border-b"
                style={{ borderColor: "rgba(255,255,255,0.04)" }}
            >
                <BrandLogo size="sm" variant="light" link={false} />
                <div
                    className="flex items-center justify-center w-7 h-7 rounded-lg"
                    title="Modo Admin"
                    style={{
                        background: "rgba(239,68,68,0.08)",
                        border: "1px solid rgba(239,68,68,0.15)",
                        color: "#F87171",
                    }}
                >
                    <ShieldAlert size={12} />
                </div>
            </div>

            {/* Nav */}
            <div className="flex-1 px-3 py-5 overflow-y-auto flex flex-col gap-0.5">
                <p
                    className="text-[9px] font-black uppercase tracking-[0.22em] px-3 mb-2"
                    style={{ color: "#1E2A3B" }}
                >
                    Principal
                </p>
                <NavLink item={navItems[0]} exact />

                <p
                    className="text-[9px] font-black uppercase tracking-[0.22em] px-3 mt-5 mb-2"
                    style={{ color: "#1E2A3B" }}
                >
                    Gerenciamento
                </p>
                {navItems.slice(1).map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
            </div>

            {/* Bottom */}
            <div className="p-3 border-t" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                <div className="space-y-0.5 mb-3">
                    {bottomItems.map((item) => (
                        <NavLink key={item.href} item={item} />
                    ))}
                </div>

                <div
                    className="flex items-center gap-3 p-3 rounded-xl"
                    style={{
                        background: "rgba(255,255,255,0.02)",
                        border: "1px solid rgba(255,255,255,0.05)",
                    }}
                >
                    <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-black shrink-0"
                        style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}
                    >
                        AD
                    </div>
                    <div className="flex-1 min-w-0">
                        <div
                            className="text-[13px] font-bold truncate"
                            style={{ color: "rgba(255,255,255,0.65)" }}
                        >
                            Admin Geral
                        </div>
                        <div className="text-[10px]" style={{ color: "#334155" }}>
                            Sessao ativa
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <LogOut size={15} />
                    </button>
                </div>
            </div>
        </aside>
    );
}
