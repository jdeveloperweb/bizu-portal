"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";


const getRealmRoles = (user: unknown): string[] => {
    if (!user || typeof user !== "object") return [];

    const realmAccess = (user as { realm_access?: unknown }).realm_access;
    if (!realmAccess || typeof realmAccess !== "object") return [];

    const roles = (realmAccess as { roles?: unknown }).roles;
    if (!Array.isArray(roles)) return [];

    return roles.filter((role): role is string => typeof role === "string");
};

const navLinks = [
    { href: "/#funcionalidades", label: "Funcionalidades" },
    { href: "/pricing", label: "Planos" },
];

export default function Navbar() {
    const { authenticated, logout, user, isAdmin } = useAuth();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    const dashboardHref = isAdmin ? "/admin" : "/dashboard";

    useEffect(() => {
        const fn = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", fn);
        return () => window.removeEventListener("scroll", fn);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/80 backdrop-blur-2xl shadow-sm border-b border-slate-100/80"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <BrandLogo size="sm" variant="dark" />

                {/* Desktop */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((l) => (
                        <Link key={l.href} href={l.href}
                            className="text-[14px] font-bold text-slate-600 hover:text-indigo-600 transition-colors">
                            {l.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    {authenticated ? (
                        <>
                            <Link href={dashboardHref}
                                className="flex items-center gap-2 text-[14px] font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-all px-5 py-2.5 rounded-full shadow-sm">
                                <LayoutDashboard size={16} />
                                Painel
                            </Link>
                            <button
                                onClick={logout}
                                className="p-2.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Sair">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login"
                                className="text-[14px] font-bold text-slate-700 hover:text-indigo-600 transition-colors px-4 py-2 hover:bg-slate-50 rounded-full">
                                Entrar
                            </Link>
                            <Link href="/register"
                                className="relative group inline-flex items-center justify-center px-6 py-2.5 text-[14px] font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5 overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative z-10 flex items-center gap-2">Comece grátis</span>
                            </Link>
                        </>
                    )}
                </div>

                <button className="md:hidden text-slate-600 hover:text-indigo-600 transition-colors" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 shadow-xl px-6 pb-6 pt-2">
                    <div className="flex flex-col gap-3">
                        {navLinks.map((l) => (
                            <Link key={l.href} href={l.href}
                                className="text-sm font-medium text-slate-600 py-1.5"
                                onClick={() => setMobileOpen(false)}>
                                {l.label}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-2.5 pt-3 border-t border-slate-100">
                            <Link href="/login" onClick={() => setMobileOpen(false)}
                                className="text-center text-sm font-semibold text-slate-600 border border-slate-200 rounded-xl py-2.5">
                                Entrar
                            </Link>
                            <Link href="/register" onClick={() => setMobileOpen(false)}
                                className="btn-primary !rounded-xl text-center py-2.5">
                                Comece gratis
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
