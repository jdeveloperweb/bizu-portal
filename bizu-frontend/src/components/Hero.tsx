"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Target, Award, Zap, Star, Users } from "lucide-react";
import { useEffect, useRef } from "react";

const stats = [
    { icon: BookOpen, value: "50k+", label: "Questões", color: "#6366F1" },
    { icon: Users, value: "10k+", label: "Alunos Aprovados", color: "#F59E0B" },
    { icon: Target, value: "98%", label: "Satisfação", color: "#10B981" },
    { icon: Award, value: "500+", label: "Concursos Cobertos", color: "#A78BFA" },
];

const features = [
    { icon: "⚡", title: "Simulados Inteligentes", desc: "IA que adapta as questões ao seu nível de conhecimento em tempo real." },
    { icon: "🎯", title: "Banco de Questões", desc: "Mais de 50 mil questões comentadas e atualizadas de todas as bancas." },
    { icon: "🃏", title: "Flashcards Dinâmicos", desc: "Sistema de repetição espaçada para fixar o conteúdo de forma definitiva." },
    { icon: "🏆", title: "Arena PVP", desc: "Duelhe com outros candidatos em tempo real e suba no ranking nacional." },
    { icon: "📊", title: "Análise de Desempenho", desc: "Relatórios detalhados apontando seus pontos fracos com precisão cirúrgica." },
    { icon: "🎓", title: "Provas Comentadas", desc: "Resoluções passo a passo das principais provas dos últimos 10 anos." },
];

export default function Hero() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-[#080B14]">

            {/* ── Fundo animado ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Orbe principal */}
                <div
                    className="absolute top-[-20%] left-[10%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 animate-float"
                    style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }}
                />
                {/* Orbe secundário */}
                <div
                    className="absolute bottom-[-10%] right-[5%] w-[500px] h-[500px] rounded-full blur-[100px] opacity-20 animate-float"
                    style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)", animationDelay: "-3s" }}
                />
                {/* Grade */}
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* ── Hero principal ── */}
            <div className="relative container mx-auto px-4 pt-36 pb-20 text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                    style={{
                        background: "rgba(99,102,241,0.1)",
                        border: "1px solid rgba(99,102,241,0.3)",
                    }}
                >
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366F1]" />
                    </span>
                    <span className="text-sm font-bold text-[#A5B4FC] tracking-wide">
                        Nova versão 2.0 — Aprovação garantida ou seu dinheiro de volta
                    </span>
                </div>

                {/* Título principal */}
                <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight mb-6 leading-none">
                    <span className="block text-white mb-2">Sua Aprovação</span>
                    <span
                        className="block"
                        style={{
                            fontFamily: "Bobaland, sans-serif",
                            background: "linear-gradient(135deg, #6366F1 0%, #A78BFA 50%, #F59E0B 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        Começa Aqui!
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-[#64748B] mb-10 leading-relaxed">
                    A plataforma definitiva para quem leva concurso a sério.
                    Simulados com IA, duelhe em tempo real e trilhas personalizadas
                    para a sua{" "}
                    <span className="text-[#6366F1] font-semibold">aprovação certa</span>.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Link href="/register">
                        <button
                            className="group relative px-8 h-14 rounded-full text-lg font-bold text-white overflow-hidden transition-transform hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                boxShadow: "0 0 40px rgba(99,102,241,0.5), 0 8px 32px rgba(99,102,241,0.3)",
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                Começar Grátis
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors" />
                        </button>
                    </Link>
                    <Link href="/pricing">
                        <button
                            className="px-8 h-14 rounded-full text-lg font-bold text-[#A5B4FC] hover:text-white transition-all duration-300 hover:scale-105"
                            style={{
                                border: "1px solid rgba(99,102,241,0.3)",
                                background: "rgba(99,102,241,0.05)",
                            }}
                        >
                            Ver Planos & Preços
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mb-32">
                    {stats.map(({ icon: Icon, value, label, color }) => (
                        <div
                            key={label}
                            className="group p-6 rounded-2xl text-center transition-all duration-300 hover:-translate-y-1 cursor-default"
                            style={{
                                background: "rgba(14,21,37,0.8)",
                                border: "1px solid rgba(99,102,241,0.12)",
                            }}
                        >
                            <Icon className="w-7 h-7 mx-auto mb-3" style={{ color }} />
                            <div className="text-2xl font-black text-white mb-1">{value}</div>
                            <div className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Seção Features ── */}
            <section className="relative py-24" style={{ background: "rgba(14,21,37,0.6)" }}>
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(99,102,241,1) 1px, transparent 0)`,
                        backgroundSize: "40px 40px",
                    }}
                />
                <div className="container mx-auto px-4 relative">
                    <div className="text-center mb-16">
                        <span
                            className="inline-block text-xs font-bold uppercase tracking-[0.3em] mb-4 px-4 py-1.5 rounded-full"
                            style={{ background: "rgba(99,102,241,0.1)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.2)" }}
                        >
                            FUNCIONALIDADES
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                            Tudo que você precisa para
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #6366F1, #A78BFA)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                {" "}passar
                            </span>
                        </h2>
                        <p className="text-[#64748B] max-w-xl mx-auto">
                            Tecnologia de ponta combinada com metodologia aprovada por milhares de aprovados.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f, i) => (
                            <div
                                key={f.title}
                                className="group p-6 rounded-2xl transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_20px_60px_rgba(99,102,241,0.15)] cursor-default"
                                style={{
                                    background: "rgba(14,21,37,0.9)",
                                    border: "1px solid rgba(99,102,241,0.1)",
                                    animationDelay: `${i * 0.1}s`,
                                }}
                            >
                                <div
                                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-5 transition-transform group-hover:scale-110"
                                    style={{ background: "rgba(99,102,241,0.12)" }}
                                >
                                    {f.icon}
                                </div>
                                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                                <p className="text-sm text-[#64748B] leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── CTA final ── */}
            <section className="relative py-24 overflow-hidden">
                <div
                    className="absolute inset-0 opacity-20"
                    style={{ background: "radial-gradient(ellipse at center, rgba(99,102,241,0.5) 0%, transparent 70%)" }}
                />
                <div className="container mx-auto px-4 text-center relative">
                    <h2
                        className="text-5xl md:text-6xl font-extrabold text-white mb-6"
                        style={{ fontFamily: "Bobaland, sans-serif" }}
                    >
                        Pronto para passar?
                    </h2>
                    <p className="text-[#64748B] text-lg mb-10 max-w-md mx-auto">
                        Junte-se a mais de 10.000 aprovados que escolheram o Bizu! Portal.
                    </p>
                    <Link href="/register">
                        <button
                            className="group px-10 h-16 rounded-full text-xl font-bold text-white relative overflow-hidden transition-transform hover:scale-105"
                            style={{
                                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                boxShadow: "0 0 60px rgba(99,102,241,0.6), 0 8px 32px rgba(99,102,241,0.3)",
                            }}
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                <Zap className="w-6 h-6" />
                                Criar Conta Grátis
                            </span>
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer simples */}
            <footer
                className="py-8 text-center text-sm text-[#64748B]"
                style={{ borderTop: "1px solid rgba(99,102,241,0.1)" }}
            >
                © 2025 Bizu! Portal · Feito com 💜 para concurseiros
            </footer>
        </div>
    );
}
