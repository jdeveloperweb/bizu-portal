"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

const navLinks = [
    { href: "/#funcionalidades", label: "Funcionalidades" },
    { href: "/pricing", label: "Planos" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

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
                            className="text-[13px] font-semibold text-slate-500 hover:text-slate-900 transition-colors">
                            {l.label}
                        </Link>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login"
                        className="text-[13px] font-semibold text-slate-600 hover:text-indigo-600 transition-colors px-3 py-2">
                        Entrar
                    </Link>
                    <Link href="/register" className="btn-primary !h-9 !text-xs !rounded-full !px-5">
                        Comece gratis
                    </Link>
                </div>

                <button className="md:hidden text-slate-500" onClick={() => setMobileOpen(!mobileOpen)}>
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
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
