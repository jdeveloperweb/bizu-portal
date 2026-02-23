"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Target, Award, Users, Zap, Star } from "lucide-react";

const stats = [
    { icon: BookOpen, value: "50k+", label: "Questões", color: "#6366F1" },
    { icon: Users, value: "10k+", label: "Aprovados", color: "#F59E0B" },
    { icon: Target, value: "98%", label: "Satisfação", color: "#059669" },
    { icon: Award, value: "500+", label: "Concursos", color: "#4F46E5" },
];

const features = [
    { icon: "⚡", title: "Simulados com IA", desc: "A plataforma adapta as questões ao seu nível em tempo real." },
    { icon: "📚", title: "Banco de Questões", desc: "50 mil questões comentadas de todas as bancas, sempre atualizadas." },
    { icon: "🃏", title: "Flashcards Inteligentes", desc: "Repetição espaçada para fixar o conteúdo de forma definitiva." },
    { icon: "🏆", title: "Arena PVP", desc: "Duelhe com outros candidatos ao vivo e suba no ranking nacional." },
    { icon: "📊", title: "Análise de Desempenho", desc: "Relatórios que apontam seus pontos fracos com precisão." },
    { icon: "🎓", title: "Provas Comentadas", desc: "Resoluções passo a passo das provas dos últimos 10 anos." },
];

export default function Hero() {
    return (
        <div className="relative bg-white overflow-hidden">

            {/* ── Decoração de fundo leve ── */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Blob superior esquerdo */}
                <div
                    className="absolute -top-32 -left-32 w-[560px] h-[560px] rounded-full opacity-[0.07]"
                    style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }}
                />
                {/* Blob inferior direito */}
                <div
                    className="absolute -bottom-32 -right-16 w-[480px] h-[480px] rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)" }}
                />
                {/* Grade pontilhada */}
                <div
                    className="absolute inset-0 opacity-[0.04]"
                    style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, #6366F1 1px, transparent 0)`,
                        backgroundSize: "40px 40px",
                    }}
                />
            </div>

            {/* ── Hero principal ── */}
            <div className="relative container mx-auto px-6 pt-32 pb-20 text-center">

                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 pill-primary text-sm font-semibold">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#6366F1] opacity-60" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#6366F1]" />
                    </span>
                    Nova versão 2.0 — Aprovação garantida ou devolvemos seu dinheiro
                </div>

                {/* Título */}
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-[1.05]">
                    <span className="block text-slate-900 mb-1">Sua Aprovação</span>
                    {/* "Comeca Aqui" em Inter bold para evitar problema de caracteres especiais */}
                    <span className="block gradient-text">Começa Aqui</span>
                    {/* Logo "Bizu!" em Bobaland, sem acento, só onde a fonte suporta */}
                    <span
                        className="block text-4xl md:text-5xl mt-1 text-[#6366F1]"
                        style={{ fontFamily: "Bobaland, sans-serif" }}
                    >
                        com Bizu!
                    </span>
                </h1>

                <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
                    A plataforma definitiva para quem leva concurso a sério.
                    Simulados com IA, banco de questões atualizado e trilhas personalizadas para a sua{" "}
                    <strong className="text-[#6366F1] font-semibold">aprovação garantida</strong>.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                    <Link href="/register">
                        <button
                            className="group flex items-center gap-2 px-8 h-14 rounded-full text-base font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
                            style={{
                                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                boxShadow: "0 4px 20px rgba(99,102,241,0.35)",
                            }}
                        >
                            Começar Grátis
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </Link>
                    <Link href="/pricing">
                        <button className="flex items-center gap-2 px-8 h-14 rounded-full text-base font-semibold text-slate-700 border border-slate-200 hover:border-[#6366F1] hover:text-[#6366F1] transition-all hover:scale-105">
                            Ver Planos &amp; Preços
                        </button>
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
                    {stats.map(({ icon: Icon, value, label, color }) => (
                        <div key={label} className="card-light rounded-2xl p-5 text-center transition-all duration-200 cursor-default">
                            <Icon className="w-7 h-7 mx-auto mb-3" style={{ color }} />
                            <div className="text-2xl font-extrabold text-slate-900 mb-0.5">{value}</div>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Seção Funcionalidades ── */}
            <section id="funcionalidades" className="bg-[#F8FAFF] py-24">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#6366F1] mb-3 pill-primary px-4 py-1.5 rounded-full">
                            Funcionalidades
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                            Tudo para você{" "}
                            <span className="gradient-text">passar</span>
                        </h2>
                        <p className="text-slate-500 max-w-lg mx-auto">
                            Tecnologia de ponta combinada com metodologia aprovada por milhares de concurseiros.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((f) => (
                            <div
                                key={f.title}
                                className="card-light rounded-2xl p-6 transition-all duration-200 cursor-default group"
                            >
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl mb-4 bg-[#EEF2FF] group-hover:scale-110 transition-transform">
                                    {f.icon}
                                </div>
                                <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Depoimento / Social Proof ── */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6 text-center">
                    <div className="flex justify-center gap-1 mb-4">
                        {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />)}
                    </div>
                    <p className="text-xl font-medium text-slate-700 max-w-2xl mx-auto mb-6 leading-relaxed">
                        "Aprovei para o TRF2 depois de 8 meses usando o Bizu! Portal.
                        Os simulados adaptativos identificaram exatamente onde eu precisava melhorar."
                    </p>
                    <div className="flex items-center justify-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}>
                            MC
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-slate-900">Marcos C.</div>
                            <div className="text-xs text-slate-400">Aprovado · TRF2 2024</div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ── CTA Final ── */}
            <section className="py-20 bg-[#F8FAFF]">
                <div className="container mx-auto px-6 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                        Pronto para{" "}
                        <span className="gradient-text">passar?</span>
                    </h2>
                    <p className="text-slate-500 mb-10 max-w-md mx-auto">
                        Junte-se a mais de 10.000 aprovados. 7 dias grátis, sem cartão de crédito.
                    </p>
                    <Link href="/register">
                        <button
                            className="flex items-center gap-2 mx-auto px-10 h-14 rounded-full text-lg font-bold text-white transition-all hover:scale-105 hover:shadow-xl"
                            style={{
                                background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                boxShadow: "0 4px 24px rgba(99,102,241,0.35)",
                            }}
                        >
                            <Zap className="w-5 h-5" />
                            Criar Conta Grátis
                        </button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-8 text-center text-sm text-slate-400 border-t border-slate-100">
                © 2025{" "}
                <span style={{ fontFamily: "Bobaland, sans-serif" }} className="text-[#6366F1]">
                    Bizu!
                </span>{" "}
                Portal · Todos os direitos reservados
            </footer>
        </div>
    );
}
