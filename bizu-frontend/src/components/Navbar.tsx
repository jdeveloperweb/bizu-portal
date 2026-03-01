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
    { href: "/pricing", label: "Cursos" },
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

    // Quando não rolou: navbar está sobre o hero escuro → texto claro
    // Quando rolou: navbar tem fundo branco → texto escuro
    const light = !scrolled;

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                ? "bg-white/90 backdrop-blur-2xl shadow-sm border-b border-slate-100/80"
                : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <BrandLogo size="sm" variant={light ? "light" : "dark"} />

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((l) => (
                        <Link key={l.label} href={l.href}
                            className={`text-[14px] font-bold transition-colors ${light
                                ? "text-white/70 hover:text-white"
                                : "text-slate-600 hover:text-indigo-600"
                                }`}>
                            {l.label}
                        </Link>
                    ))}
                </div>

                {/* Desktop actions */}
                <div className="hidden md:flex items-center gap-3">
                    {authenticated ? (
                        <>
                            <Link href={dashboardHref}
                                className={`flex items-center gap-2 text-[14px] font-bold transition-all px-5 py-2.5 rounded-full ${light
                                    ? "text-white/80 bg-white/10 hover:bg-white/20 border border-white/15"
                                    : "text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                                    }`}>
                                <LayoutDashboard size={16} />
                                Painel
                            </Link>
                            <button
                                onClick={logout}
                                className={`p-2.5 rounded-full transition-colors ${light
                                    ? "text-white/50 hover:text-white hover:bg-white/10"
                                    : "text-slate-400 hover:text-red-600 hover:bg-red-50"
                                    }`}
                                title="Sair">
                                <LogOut size={18} />
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/login"
                                className={`text-[14px] font-bold transition-colors px-4 py-2 rounded-full ${light
                                    ? "text-white/70 hover:text-white hover:bg-white/10"
                                    : "text-slate-700 hover:text-indigo-600 hover:bg-slate-50"
                                    }`}>
                                Entrar
                            </Link>
                            <Link href="/register"
                                className="relative group inline-flex items-center justify-center px-6 py-2.5 text-[14px] font-bold text-white transition-all duration-300 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full shadow-md shadow-indigo-500/30 hover:shadow-lg hover:shadow-indigo-500/50 hover:-translate-y-0.5 overflow-hidden">
                                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                                <span className="relative z-10">Comece grátis</span>
                            </Link>
                        </>
                    )}
                </div>

                {/* Mobile hamburger */}
                <button
                    className={`md:hidden transition-colors ${light ? "text-white/70 hover:text-white" : "text-slate-600 hover:text-indigo-600"}`}
                    onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile menu — sempre fundo escuro para manter consistência */}
            {mobileOpen && (
                <div className="md:hidden border-b px-6 pb-6 pt-2"
                    style={{ background: "#0F172A", borderColor: "rgba(255,255,255,0.08)" }}>
                    <div className="flex flex-col gap-3">
                        {navLinks.map((l) => (
                            <Link key={l.label} href={l.href}
                                className="text-sm font-medium text-white/60 hover:text-white py-1.5 transition-colors"
                                onClick={() => setMobileOpen(false)}>
                                {l.label}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-2.5 pt-3 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                            <Link href="/login" onClick={() => setMobileOpen(false)}
                                className="text-center text-sm font-semibold text-white/70 border rounded-xl py-2.5 hover:bg-white/5 transition-colors"
                                style={{ borderColor: "rgba(255,255,255,0.12)" }}>
                                Entrar
                            </Link>
                            <Link href="/register" onClick={() => setMobileOpen(false)}
                                className="text-center text-sm font-bold text-white py-2.5 rounded-xl transition-colors"
                                style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}>
                                Comece grátis
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
