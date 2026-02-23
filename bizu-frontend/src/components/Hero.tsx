"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
    ArrowRight, BookOpen, Target, Award, Users, Zap,
    Brain, BarChart3, Swords, Layers, GraduationCap,
    ChevronRight, Play, CheckCircle2, Sparkles, Shield,
    Clock, Rocket,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

/* ── Data ── */
const features = [
    { icon: Brain, title: "Simulados com IA", desc: "Algoritmo adaptativo que ajusta a dificuldade em tempo real ao seu nivel.", gradient: "from-violet-500 to-indigo-600" },
    { icon: BookOpen, title: "Banco de Questoes", desc: "Milhares de questoes comentadas de todas as principais bancas do Brasil.", gradient: "from-blue-500 to-cyan-500" },
    { icon: Layers, title: "Flashcards", desc: "Repeticao espacada cientifica para maximizar a retencao do conteudo.", gradient: "from-amber-500 to-orange-500" },
    { icon: Swords, title: "Arena PVP", desc: "Duelos em tempo real contra outros candidatos com ranking nacional.", gradient: "from-rose-500 to-pink-600" },
    { icon: BarChart3, title: "Analytics", desc: "Dashboards que mostram sua evolucao, pontos fracos e projecao de resultado.", gradient: "from-emerald-500 to-teal-500" },
    { icon: GraduationCap, title: "Trilhas", desc: "Percursos organizados por concurso com curadoria de especialistas.", gradient: "from-purple-500 to-violet-600" },
];

const approvals = [
    "Ana Claudia — Aprovada TRF2",
    "Marcos V. — Aprovado MPF",
    "Julia M. — Aprovada DPU",
    "Rafael S. — Aprovado TRF5",
    "Camila R. — Aprovada TJSP",
    "Diego N. — Aprovado TRE-MG",
    "Fernanda L. — Aprovada AGU",
    "Lucas P. — Aprovado INSS",
    "Beatriz K. — Aprovada TRT2",
    "Thiago A. — Aprovado PRF",
    "Marina C. — Aprovada CGU",
    "Pedro H. — Aprovado TCU",
];

const milestones = [
    { val: "50k+", label: "Questoes no banco", icon: BookOpen },
    { val: "10k+", label: "Aprovados", icon: Award },
    { val: "98%", label: "Satisfacao", icon: Target },
    { val: "24/7", label: "Disponibilidade", icon: Clock },
];

/* ── Marquee duplicado infinito ── */
function ApprovalMarquee({ direction = "left" }: { direction?: "left" | "right" }) {
    const items = direction === "left" ? approvals : [...approvals].reverse();
    const doubled = [...items, ...items];

    return (
        <div className="overflow-hidden relative">
            <div
                className="flex gap-3 whitespace-nowrap"
                style={{
                    animation: `marquee-${direction} 40s linear infinite`,
                }}
            >
                {doubled.map((name, i) => (
                    <div
                        key={i}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white border border-slate-100 shadow-sm shrink-0"
                    >
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <CheckCircle2 size={12} className="text-white" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700">{name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Animated counter ── */
function Counter({ target }: { target: string }) {
    const [val, setVal] = useState("0");
    const ref = useRef<HTMLDivElement>(null);
    const numeric = target.replace(/[^\d]/g, "");
    const suffix = target.replace(/[\d]/g, "");

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const end = parseInt(numeric);
                    const dur = 2000;
                    const inc = end / (dur / 16);
                    let cur = 0;
                    const t = setInterval(() => {
                        cur += inc;
                        if (cur >= end) { cur = end; clearInterval(t); }
                        setVal(Math.floor(cur).toLocaleString("pt-BR") + suffix);
                    }, 16);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [numeric, suffix]);

    return <div ref={ref}>{val}</div>;
}

export default function Hero() {
    return (
        <div className="relative bg-white overflow-hidden">

            {/* ═══════════ CSS para marquee ═══════════ */}
            <style jsx>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes marquee-right {
          0%   { transform: translateX(-50%); }
          100% { transform: translateX(0); }
        }
        @keyframes orbit {
          0%   { transform: rotate(0deg) translateX(140px) rotate(0deg); }
          100% { transform: rotate(360deg) translateX(140px) rotate(-360deg); }
        }
        @keyframes glow-pulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>

            {/* ═══════════════════════════
           HERO
         ═══════════════════════════ */}
            <section className="relative min-h-[95vh] flex items-center overflow-hidden">
                {/* Background */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{
                        background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.12) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 85% 60%, rgba(139,92,246,0.08) 0%, transparent 55%),
              radial-gradient(ellipse 40% 30% at 10% 80%, rgba(245,158,11,0.05) 0%, transparent 50%)
            `,
                    }} />
                    <div className="absolute inset-0 opacity-[0.3]" style={{
                        backgroundImage: `radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)`,
                        backgroundSize: "28px 28px",
                    }} />
                </div>

                {/* Floating glow */}
                <div className="absolute top-16 left-1/2 -translate-x-1/2 w-[700px] h-[350px] blur-[120px] pointer-events-none"
                    style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.2) 0%, transparent 100%)", animation: "glow-pulse 6s ease-in-out infinite" }} />

                <div className="relative container mx-auto px-6 pt-24 pb-16">
                    <div className="max-w-4xl mx-auto text-center">

                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 text-indigo-600">
                            <Sparkles size={14} />
                            <span className="text-[13px] font-semibold">
                                Plataforma inteligente para concursos
                            </span>
                        </div>

                        {/* Titulo */}
                        <h1 className="text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[5.5rem] font-extrabold leading-[0.95] tracking-tight mb-7">
                            <span className="block text-slate-900">Estude com</span>
                            <span className="block mt-1">
                                <span className="relative inline-block" style={{
                                    background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #A855F7 100%)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}>
                                    estrategia
                                </span>
                            </span>
                            <span className="block text-slate-900 mt-1">
                                passe com{" "}
                                <span className="inline-block" style={{ fontFamily: "Bobaland, sans-serif" }}>
                                    <span style={{
                                        background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}>Bizu!</span>
                                </span>
                            </span>
                        </h1>

                        <p className="max-w-xl mx-auto text-base md:text-lg text-slate-500 mb-10 leading-relaxed">
                            Simulados adaptativos, banco de questoes atualizado,
                            duelos em tempo real e analytics avancado.
                            Tudo que voce precisa em um so lugar.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
                            <Link href="/register">
                                <button className="group flex items-center gap-2 px-8 h-14 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all duration-300">
                                    <Rocket size={17} />
                                    Comece gratis — 7 dias
                                    <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="flex items-center gap-2 px-6 h-14 rounded-2xl text-sm font-semibold text-slate-600 bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                    <Play size={15} />
                                    Ver planos
                                </button>
                            </Link>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-16">
                            <Shield size={13} className="text-emerald-500" />
                            Sem cartao · Cancele quando quiser · Garantia de 7 dias
                        </p>
                    </div>

                    {/* ── Dashboard Mockup ── */}
                    <div className="max-w-5xl mx-auto relative">
                        <div className="absolute -inset-6 bg-gradient-to-r from-indigo-500/8 via-violet-500/8 to-purple-500/8 rounded-[2rem] blur-2xl" />
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl shadow-slate-200/60 bg-white">
                            {/* Browser bar */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                                </div>
                                <div className="flex-1 mx-8">
                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200 max-w-xs mx-auto">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] text-slate-400">bizu.mjolnix.com.br/dashboard</span>
                                    </div>
                                </div>
                            </div>
                            {/* Dashboard content */}
                            <div className="flex">
                                <div className="w-48 shrink-0 bg-[#FAFBFF] border-r border-slate-100 p-4 hidden md:block">
                                    <div className="mb-5">
                                        <BrandLogo size="sm" variant="dark" link={false} />
                                    </div>
                                    {["Dashboard", "Simulados", "Flashcards", "Arena PVP", "Analytics"].map((item, i) => (
                                        <div key={item} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium mb-0.5 ${i === 0 ? "bg-indigo-50 text-indigo-600" : "text-slate-400"
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-500" : "bg-slate-300"}`} />
                                            {item}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-1 p-5">
                                    <div className="flex items-center justify-between mb-5">
                                        <div>
                                            <div className="text-[13px] font-bold text-slate-800">Bom dia! 👋</div>
                                            <div className="text-[10px] text-slate-400">3 revisoes pendentes</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-600">🔥 7 dias</div>
                                            <div className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600">🏆 1.2k XP</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2.5 mb-5">
                                        {[
                                            { l: "Questoes", v: "2.847", bg: "bg-indigo-50", c: "text-indigo-600" },
                                            { l: "Acertos", v: "78%", bg: "bg-emerald-50", c: "text-emerald-600" },
                                            { l: "Simulados", v: "23", bg: "bg-violet-50", c: "text-violet-600" },
                                            { l: "Ranking", v: "#142", bg: "bg-amber-50", c: "text-amber-600" },
                                        ].map((c) => (
                                            <div key={c.l} className={`${c.bg} rounded-xl p-2.5 text-center`}>
                                                <div className={`text-base font-extrabold ${c.c}`}>{c.v}</div>
                                                <div className="text-[9px] text-slate-400 font-medium mt-0.5">{c.l}</div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="rounded-xl border border-slate-100 p-3">
                                        <div className="text-[10px] font-bold text-slate-600 mb-2">Evolucao semanal</div>
                                        <div className="flex items-end gap-1 h-16">
                                            {[35, 50, 42, 60, 55, 72, 80, 68, 85, 75, 90, 82].map((h, i) => (
                                                <div key={i} className="flex-1 rounded-sm" style={{
                                                    height: `${h}%`,
                                                    background: i >= 10 ? "linear-gradient(180deg, #6366F1, #8B5CF6)" : i >= 8 ? "#C7D2FE" : "#E2E8F0",
                                                }} />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           MURAL DE APROVACOES (Marquee)
         ═══════════════════════════ */}
            <section className="py-10 bg-slate-50/50 border-y border-slate-100 overflow-hidden">
                <div className="space-y-3">
                    <ApprovalMarquee direction="left" />
                    <ApprovalMarquee direction="right" />
                </div>
            </section>

            {/* ═══════════════════════════
           STATS
         ═══════════════════════════ */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {milestones.map((m) => {
                            const Icon = m.icon;
                            return (
                                <div key={m.label} className="text-center group">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-indigo-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <Icon size={20} className="text-indigo-600" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">
                                        <Counter target={m.val} />
                                    </div>
                                    <div className="text-sm text-slate-400 font-medium">{m.label}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           FUNCIONALIDADES
         ═══════════════════════════ */}
            <section id="funcionalidades" className="py-24 bg-slate-50/60">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-flex">
                            <Sparkles size={12} />
                            Funcionalidades
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
                            Tecnologia que{" "}
                            <span className="gradient-text">transforma</span>
                            <br className="hidden md:block" />
                            sua preparacao
                        </h2>
                        <p className="text-slate-500 max-w-md mx-auto">
                            Cada recurso foi pensado para maximizar seu tempo de estudo e suas chances de aprovacao.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="group card-elevated !rounded-2xl p-6">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-slate-900 mb-2">{f.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           COMO FUNCIONA
         ═══════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-flex">
                            Como Funciona
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                            3 passos para sua{" "}
                            <span className="gradient-text">aprovacao</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                        {[
                            {
                                step: "01",
                                title: "Crie sua conta",
                                desc: "Cadastre-se gratuitamente e tenha acesso imediato a plataforma por 7 dias.",
                                icon: Rocket,
                                gradient: "from-indigo-500 to-violet-600",
                            },
                            {
                                step: "02",
                                title: "Escolha sua trilha",
                                desc: "Selecione o concurso desejado e receba um plano de estudo personalizado pela IA.",
                                icon: Target,
                                gradient: "from-violet-500 to-purple-600",
                            },
                            {
                                step: "03",
                                title: "Evolua e passe",
                                desc: "Pratique com simulados, duele na Arena e acompanhe sua evolucao ate a aprovacao.",
                                icon: Award,
                                gradient: "from-purple-500 to-pink-600",
                            },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.step} className="relative text-center group">
                                    {/* Numero grande de fundo */}
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 text-[80px] font-extrabold text-slate-50 leading-none select-none pointer-events-none">
                                        {s.step}
                                    </div>
                                    <div className="relative pt-12">
                                        <div className={`w-14 h-14 mx-auto mb-5 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg shadow-indigo-500/15 group-hover:scale-110 transition-transform`}>
                                            <Icon size={24} className="text-white" />
                                        </div>
                                        <h3 className="text-base font-bold text-slate-900 mb-2">{s.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed max-w-[250px] mx-auto">{s.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           RESULTADOS REAIS
         ═══════════════════════════ */}
            <section className="py-24 overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 to-violet-950" />
                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 rounded-full blur-[120px]" />

                <div className="relative container mx-auto px-6 text-center">
                    <span className="pill text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-flex bg-white/10 text-indigo-300 border border-white/10">
                        <Award size={12} />
                        Resultados
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
                        Numeros que falam
                        <br />
                        <span className="text-indigo-300">por si mesmos</span>
                    </h2>
                    <p className="text-indigo-300/60 mb-14 max-w-md mx-auto">
                        Milhares de concurseiros ja transformaram sua preparacao com a plataforma.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto mb-14">
                        {[
                            { val: "10.247", label: "Alunos aprovados", icon: "🏆" },
                            { val: "94%", label: "Taxa de aprovacao", icon: "📊" },
                            { val: "2.8M", label: "Questoes resolvidas", icon: "📝" },
                            { val: "4.9", label: "Nota media (5.0)", icon: "⭐" },
                        ].map((s) => (
                            <div key={s.label} className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-indigo-400/30 transition-all group">
                                <div className="text-2xl mb-2">{s.icon}</div>
                                <div className="text-3xl font-extrabold text-white mb-1 group-hover:text-indigo-300 transition-colors">
                                    {s.val}
                                </div>
                                <div className="text-xs text-indigo-300/60 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>

                    {/* Instituicoes */}
                    <p className="text-xs text-indigo-300/40 uppercase tracking-[0.2em] font-bold mb-6">
                        Nossos alunos passaram em
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
                        {["TRF2", "MPF", "DPU", "AGU", "TRF5", "TCU", "CGU", "PRF", "INSS", "TRE", "TJSP", "TRT"].map((inst) => (
                            <div key={inst} className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-xs font-bold text-indigo-200/80 hover:bg-white/10 hover:border-indigo-400/30 transition-all cursor-default">
                                {inst}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           CTA FINAL
         ═══════════════════════════ */}
            <section className="py-24 bg-white relative overflow-hidden">
                <div className="absolute inset-0" style={{
                    background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.06) 0%, transparent 70%)",
                }} />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <BrandLogo size="lg" variant="gradient" link={false} />
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-8 mb-4">
                        Pronto para comecar?
                    </h2>
                    <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">
                        7 dias gratis. Sem cartao. Sem compromisso.
                        <br />
                        A aprovacao esta a um clique de distancia.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/register">
                            <button className="group flex items-center gap-2 px-8 h-14 rounded-2xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all">
                                <Zap size={17} />
                                Criar conta gratis
                                <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="px-6 h-14 rounded-2xl text-sm font-semibold text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                Comparar planos
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           FOOTER
         ═══════════════════════════ */}
            <footer className="py-10 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <BrandLogo size="sm" variant="dark" />
                    <p className="text-xs text-slate-400">© 2025 Bizu! Academy · Todos os direitos reservados</p>
                    <div className="flex gap-5">
                        <Link href="/termos" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Termos</Link>
                        <Link href="/privacidade" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Privacidade</Link>
                        <Link href="/pricing" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Planos</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
