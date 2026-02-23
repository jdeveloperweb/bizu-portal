"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const navLinks = [
    { href: "/cursos", label: "Cursos" },
    { href: "/simulados", label: "Simulados" },
    { href: "/flashcards", label: "Flashcards" },
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
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled
                    ? "bg-[#080B14]/90 backdrop-blur-xl border-b border-[rgba(99,102,241,0.15)] shadow-[0_4px_30px_rgba(99,102,241,0.08)]"
                    : "bg-transparent"
                }`}
        >
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center gap-2 group">
                    <span
                        className="text-3xl leading-none font-brand"
                        style={{ fontFamily: "Bobaland, sans-serif" }}
                    >
                        <span className="text-white">Bizu</span>
                        <span
                            className="text-[#6366F1]"
                            style={{
                                textShadow: "0 0 20px rgba(99,102,241,0.6)",
                            }}
                        >
                            !
                        </span>
                    </span>
                    <span className="text-xs font-bold tracking-[0.2em] text-[#64748B] uppercase mt-1">
                        Portal
                    </span>
                </Link>

                {/* Desktop links */}
                <div className="hidden md:flex items-center gap-8">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors duration-200 relative group"
                        >
                            {link.label}
                            <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#6366F1] rounded-full group-hover:w-full transition-all duration-300" />
                        </Link>
                    ))}
                </div>

                {/* CTA buttons */}
                <div className="hidden md:flex items-center gap-3">
                    <Link href="/login">
                        <button className="text-sm font-semibold text-[#94A3B8] hover:text-white transition-colors px-4 py-2">
                            Entrar
                        </button>
                    </Link>
                    <Link href="/register">
                        <button
                            className="relative px-5 py-2 rounded-full text-sm font-bold text-white overflow-hidden group"
                            style={{
                                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
                            }}
                        >
                            <span className="relative z-10">Criar Conta</span>
                            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-200" />
                        </button>
                    </Link>
                </div>

                {/* Mobile toggle */}
                <button
                    className="md:hidden text-[#94A3B8] hover:text-white"
                    onClick={() => setMobileOpen(!mobileOpen)}
                >
                    {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
            </div>

            {/* Mobile menu */}
            {mobileOpen && (
                <div className="md:hidden bg-[#0E1525]/95 backdrop-blur-xl border-b border-[rgba(99,102,241,0.15)] px-4 pb-6 pt-2">
                    <div className="flex flex-col gap-4">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="text-sm font-medium text-[#94A3B8] hover:text-white transition-colors py-1"
                                onClick={() => setMobileOpen(false)}
                            >
                                {link.label}
                            </Link>
                        ))}
                        <div className="flex flex-col gap-3 pt-4 border-t border-[rgba(99,102,241,0.1)]">
                            <Link href="/login" onClick={() => setMobileOpen(false)}>
                                <button className="w-full text-sm font-semibold text-[#94A3B8] hover:text-white border border-[rgba(99,102,241,0.2)] rounded-full py-2 transition-colors">
                                    Entrar
                                </button>
                            </Link>
                            <Link href="/register" onClick={() => setMobileOpen(false)}>
                                <button
                                    className="w-full text-sm font-bold text-white rounded-full py-2"
                                    style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                                >
                                    Criar Conta
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}
