"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

/* Links exclusivos da landing page pública */
const navLinks = [
    { href: "/#funcionalidades", label: "Funcionalidades" },
    { href: "/pricing", label: "Preços" },
    { href: "/ranking", label: "Ranking" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-white/90 backdrop-blur-xl shadow-sm border-b border-slate-100"
                    : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-1.5 group">
                    <span
                        className="text-[28px] leading-none select-none"
                        style={{ fontFamily: "Bobaland, sans-serif" }}
                    >
                        <span className="text-slate-900">Bizu</span>
                        <span className="text-[#6366F1]">!</span>
                    </span>
                    <span className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mt-1 hidden sm:block">
                        Portal
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-slate-600 hover:text-[#6366F1] transition-colors duration-200"
                        >
                            {link.label}
                        </Link>
                    ))}
                </div>

                {/* CTAs */}
                <div className="hidden md:flex items-center gap-3">
                    <Link
                        href="/login"
                        className="text-sm font-semibold text-slate-600 hover:text-[#6366F1] transition-colors px-3 py-2"
                    >
                        Entrar
                    </Link>
                    <Link
                        href="/register"
                        className="px-5 py-2 rounded-full text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-md"
                        style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                    >
                        Criar Conta Grátis
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden text-slate-500 hover:text-slate-900 transition-colors"
                    onClick={() => setMobileOpen(!mobileOpen)}
                    aria-label="Menu"
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-white border-b border-slate-100 shadow-lg px-6 pb-6 pt-2">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-slate-600 hover:text-[#6366F1] transition-colors py-1"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 pt-4 border-t border-slate-100">
                            <Link
                                href="/login"
                                onClick={() => setMobileOpen(false)}
                                className="w-full text-center text-sm font-semibold text-slate-600 border border-slate-200 rounded-full py-2 hover:border-[#6366F1] transition-colors"
                            >
                                Entrar
                            </Link>
                            <Link
                                href="/register"
                                onClick={() => setMobileOpen(false)}
                                className="w-full text-center text-sm font-bold text-white rounded-full py-2"
                                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                            >
                                Criar Conta Grátis
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
