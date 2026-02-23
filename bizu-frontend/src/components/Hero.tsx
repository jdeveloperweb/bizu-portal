"use client";

import Link from "next/link";
import {
    ArrowRight,
    BookOpen,
    Target,
    Award,
    Users,
    Zap,
    Star,
    Brain,
    BarChart3,
    Swords,
    Layers,
    GraduationCap,
    ChevronRight,
    Play,
    CheckCircle2,
} from "lucide-react";
import { useEffect, useState } from "react";

/* ── Dados ── */
const stats = [
    { value: "50.000+", label: "Questões comentadas" },
    { value: "10.000+", label: "Alunos aprovados" },
    { value: "98%", label: "Taxa de satisfação" },
    { value: "500+", label: "Concursos cobertos" },
];

const features = [
    {
        icon: Brain,
        title: "Simulados com IA",
        desc: "Algoritmo adaptativo que identifica seus pontos fracos e gera provas personalizadas.",
        gradient: "from-violet-500 to-indigo-600",
    },
    {
        icon: BookOpen,
        title: "50k+ Questões",
        desc: "Banco atualizado semanalmente com questões de todas as bancas dos últimos 10 anos.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Layers,
        title: "Flashcards Inteligentes",
        desc: "Repetição espaçada com algoritmo científico para máxima retenção do conteúdo.",
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: Swords,
        title: "Arena PVP",
        desc: "Duelhe em tempo real com outros candidatos. Ranking nacional e recompensas.",
        gradient: "from-rose-500 to-pink-600",
    },
    {
        icon: BarChart3,
        title: "Analytics Avançado",
        desc: "Dashboards detalhados mostrando evolução, pontos fracos e projeção de resultado.",
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        icon: GraduationCap,
        title: "Provas Comentadas",
        desc: "Resoluções passo a passo com vídeo e texto por professores especialistas.",
        gradient: "from-purple-500 to-violet-600",
    },
];

const testimonials = [
    {
        name: "Marcos C.",
        role: "Aprovado · TRF2 2024",
        initials: "MC",
        text: "Aprovei para o TRF2 em 8 meses. Os simulados adaptativos identificaram exatamente onde eu precisava melhorar.",
        color: "from-indigo-500 to-violet-600",
    },
    {
        name: "Ana Paula R.",
        role: "Aprovada · MPF 2024",
        initials: "AP",
        text: "A Arena PVP me motivou a estudar todos os dias. A competição saudável fez toda a diferença na minha preparação.",
        color: "from-amber-500 to-orange-500",
    },
    {
        name: "Diego S.",
        role: "Aprovado · TRF5 2023",
        initials: "DS",
        text: "Os flashcards com repetição espaçada me fizeram memorizar em semanas o que eu não conseguia em meses.",
        color: "from-emerald-500 to-teal-500",
    },
];

const concursos = [
    "Magistratura Federal",
    "Ministério Público",
    "Defensoria Pública",
    "Procuradoria",
    "Tribunais Regionais",
    "Advocacia Pública",
];

/* ── Componente de número animado ── */
function AnimatedNumber({ target }: { target: string }) {
    const [display, setDisplay] = useState("0");
    const numericPart = target.replace(/[^\d]/g, "");
    const suffix = target.replace(/[\d]/g, "");

    useEffect(() => {
        const end = parseInt(numericPart);
        const duration = 2000;
        const increment = end / (duration / 16);
        let current = 0;

        const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
                current = end;
                clearInterval(timer);
            }
            setDisplay(
                Math.floor(current).toLocaleString("pt-BR") + suffix
            );
        }, 16);

        return () => clearInterval(timer);
    }, [numericPart, suffix]);

    return <span>{display}</span>;
}

export default function Hero() {
    return (
        <div className="relative bg-white overflow-hidden">

            {/* ═══════════════════════════════
           HERO SECTION
         ═══════════════════════════════ */}
            <section className="relative min-h-[92vh] flex items-center overflow-hidden">
                {/* Fundo: malha de gradiente animada */}
                <div className="absolute inset-0">
                    {/* Gradiente radial principal */}
                    <div className="absolute inset-0"
                        style={{
                            background: `
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.15) 0%, transparent 70%),
                radial-gradient(ellipse 60% 40% at 80% 50%, rgba(168,85,247,0.08) 0%, transparent 60%),
                radial-gradient(ellipse 50% 40% at 20% 80%, rgba(245,158,11,0.06) 0%, transparent 60%)
              `,
                        }}
                    />
                    {/* Grid pontilhado */}
                    <div className="absolute inset-0 opacity-[0.35]"
                        style={{
                            backgroundImage: `radial-gradient(circle, #CBD5E1 1px, transparent 1px)`,
                            backgroundSize: "32px 32px",
                        }}
                    />
                    {/* Linha horizontal luminosa */}
                    <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300/40 to-transparent" />
                </div>

                {/* Brilho animado no topo */}
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] opacity-60 blur-[100px] pointer-events-none"
                    style={{
                        background: "linear-gradient(180deg, rgba(99,102,241,0.3) 0%, transparent 100%)",
                        animation: "float 8s ease-in-out infinite",
                    }}
                />

                <div className="relative container mx-auto px-6 pt-28 pb-20">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Badge */}
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 bg-indigo-50 border border-indigo-100 text-indigo-600">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute h-full w-full rounded-full bg-indigo-500 opacity-60" />
                                <span className="relative rounded-full h-2 w-2 bg-indigo-500" />
                            </span>
                            <span className="text-sm font-semibold">
                                Plataforma #1 para concursos — 7 dias grátis
                            </span>
                        </div>

                        {/* Título principal */}
                        <h1 className="text-[3.2rem] md:text-[4.5rem] lg:text-[5.5rem] font-extrabold leading-[1] tracking-tight mb-8">
                            <span className="block text-slate-900">
                                A plataforma que
                            </span>
                            <span className="block mt-2">
                                <span className="relative inline-block">
                                    <span
                                        className="relative z-10"
                                        style={{
                                            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #D946EF 100%)",
                                            WebkitBackgroundClip: "text",
                                            WebkitTextFillColor: "transparent",
                                            backgroundClip: "text",
                                        }}
                                    >
                                        aprova
                                    </span>
                                    {/* Underline decorativo */}
                                    <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 200 12" fill="none">
                                        <path
                                            d="M2 8C30 3 60 2 100 5C140 8 170 4 198 2"
                                            stroke="url(#grad1)"
                                            strokeWidth="4"
                                            strokeLinecap="round"
                                        />
                                        <defs>
                                            <linearGradient id="grad1" x1="0" y1="0" x2="200" y2="0" gradientUnits="userSpaceOnUse">
                                                <stop stopColor="#6366F1" />
                                                <stop offset="1" stopColor="#D946EF" />
                                            </linearGradient>
                                        </defs>
                                    </svg>
                                </span>
                                {" "}de verdade
                            </span>
                        </h1>

                        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-500 mb-10 leading-relaxed">
                            Simulados adaptativos com IA, banco de 50 mil questões,
                            flashcards inteligentes e duelos em tempo real.
                            Tudo que <strong className="text-slate-700">10.000+ aprovados</strong> usaram para conquistar a vaga.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
                            <Link href="/register">
                                <button className="group flex items-center gap-2 px-8 h-14 rounded-2xl text-base font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:scale-[1.03] transition-all duration-300">
                                    Começar grátis por 7 dias
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="group flex items-center gap-2 px-8 h-14 rounded-2xl text-base font-semibold text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-indigo-300 hover:text-indigo-600 transition-all duration-300">
                                    <Play className="w-4 h-4" />
                                    Ver como funciona
                                </button>
                            </Link>
                        </div>

                        <p className="text-xs text-slate-400 flex items-center justify-center gap-1.5">
                            <CheckCircle2 size={14} className="text-emerald-500" />
                            Sem cartão de crédito · Cancele quando quiser
                        </p>
                    </div>

                    {/* Preview / Mockup da plataforma */}
                    <div className="max-w-5xl mx-auto mt-20 relative">
                        {/* Glow atrás */}
                        <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-2xl" />

                        <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl shadow-slate-300/50 bg-white">
                            {/* Barra do "browser" */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-100">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-red-400" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                    <div className="w-3 h-3 rounded-full bg-green-400" />
                                </div>
                                <div className="flex-1 mx-4">
                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200 max-w-sm mx-auto">
                                        <div className="w-3.5 h-3.5 rounded-full bg-emerald-500 flex items-center justify-center">
                                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                                                <path d="M2 4L3.5 5.5L6 2.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                        <span className="text-xs text-slate-400">bizu.mjolnix.com.br/dashboard</span>
                                    </div>
                                </div>
                            </div>

                            {/* Conteúdo simulado do dashboard */}
                            <div className="flex">
                                {/* Sidebar simulada */}
                                <div className="w-52 shrink-0 bg-[#FAFBFF] border-r border-slate-100 p-4 hidden md:block">
                                    <div className="flex items-center gap-1.5 mb-6">
                                        <span className="text-lg" style={{ fontFamily: "Bobaland, sans-serif" }}>
                                            <span className="text-slate-800">Bizu</span>
                                            <span className="text-indigo-500">!</span>
                                        </span>
                                    </div>
                                    {["Dashboard", "Cursos", "Simulados", "Flashcards", "Arena PVP", "Desempenho"].map(
                                        (item, i) => (
                                            <div
                                                key={item}
                                                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium mb-1 ${i === 0
                                                        ? "bg-indigo-50 text-indigo-600"
                                                        : "text-slate-400"
                                                    }`}
                                            >
                                                <div className={`w-1.5 h-1.5 rounded-full ${i === 0 ? "bg-indigo-500" : "bg-slate-300"}`} />
                                                {item}
                                            </div>
                                        )
                                    )}
                                </div>

                                {/* Main content simulado */}
                                <div className="flex-1 p-6">
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <div className="text-sm font-bold text-slate-800">Dashboard</div>
                                            <div className="text-[11px] text-slate-400">Bem-vindo de volta!</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1.5 rounded-lg bg-amber-50 border border-amber-100 flex items-center gap-1.5">
                                                <span className="text-amber-500 text-[11px]">🔥</span>
                                                <span className="text-xs font-bold text-amber-600">7 dias</span>
                                            </div>
                                            <div className="px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center gap-1.5">
                                                <span className="text-[11px]">🏆</span>
                                                <span className="text-xs font-bold text-indigo-600">1.2k XP</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cards simulados */}
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                                        {[
                                            { label: "Questões", val: "2.847", color: "text-indigo-600", bg: "bg-indigo-50" },
                                            { label: "Acertos", val: "78%", color: "text-emerald-600", bg: "bg-emerald-50" },
                                            { label: "Simulados", val: "23", color: "text-violet-600", bg: "bg-violet-50" },
                                            { label: "Ranking", val: "#142", color: "text-amber-600", bg: "bg-amber-50" },
                                        ].map((c) => (
                                            <div key={c.label} className={`${c.bg} rounded-xl p-3 text-center`}>
                                                <div className={`text-lg font-extrabold ${c.color}`}>{c.val}</div>
                                                <div className="text-[10px] text-slate-400 font-medium">{c.label}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Gráfico simulado */}
                                    <div className="rounded-xl border border-slate-100 p-4">
                                        <div className="text-xs font-bold text-slate-700 mb-3">Evolução semanal</div>
                                        <div className="flex items-end gap-1.5 h-20">
                                            {[40, 55, 45, 65, 58, 75, 82, 70, 88, 78, 92, 85].map((h, i) => (
                                                <div
                                                    key={i}
                                                    className="flex-1 rounded-t-sm transition-all duration-500"
                                                    style={{
                                                        height: `${h}%`,
                                                        background:
                                                            i === 11
                                                                ? "linear-gradient(180deg, #6366F1, #8B5CF6)"
                                                                : i >= 9
                                                                    ? "#C7D2FE"
                                                                    : "#E2E8F0",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
           STATS COM NÚMEROS ANIMADOS
         ═══════════════════════════════ */}
            <section className="py-16 bg-white border-y border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
                        {stats.map((s) => (
                            <div key={s.label} className="text-center">
                                <div className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-1">
                                    <AnimatedNumber target={s.value} />
                                </div>
                                <div className="text-sm text-slate-400 font-medium">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
           FUNCIONALIDADES
         ═══════════════════════════════ */}
            <section id="funcionalidades" className="py-24 bg-slate-50/60">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 mb-3 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
                            Funcionalidades
                        </span>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
                            Tudo para você{" "}
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                passar
                            </span>
                        </h2>
                        <p className="text-slate-500 max-w-lg mx-auto text-lg">
                            Tecnologia de ponta com metodologia aprovada por milhares.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div
                                    key={f.title}
                                    className="group bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-1 hover:border-indigo-200 transition-all duration-300"
                                >
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-slate-900 mb-2">{f.title}</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
           CONCURSOS COBERTOS
         ═══════════════════════════════ */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12">
                        <div className="flex-1">
                            <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 mb-3 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
                                Cobertura
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                                Todas as bancas,
                                <br />
                                todos os concursos
                            </h2>
                            <p className="text-slate-500 mb-8 leading-relaxed">
                                Cobrimos os principais concursos de carreiras jurídicas
                                e área fiscal do Brasil. Questões atualizadas semanalmente.
                            </p>
                            <div className="grid grid-cols-2 gap-3">
                                {concursos.map((c) => (
                                    <div key={c} className="flex items-center gap-2.5 text-sm">
                                        <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                                            <CheckCircle2 size={13} className="text-emerald-500" />
                                        </div>
                                        <span className="text-slate-700 font-medium">{c}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Visual direita */}
                        <div className="flex-1 flex justify-center">
                            <div className="relative w-80 h-80">
                                {/* Círculos concêntricos */}
                                <div className="absolute inset-0 rounded-full border-2 border-dashed border-slate-100 animate-[spin_30s_linear_infinite]" />
                                <div className="absolute inset-8 rounded-full border-2 border-dashed border-indigo-100 animate-[spin_25s_linear_infinite_reverse]" />
                                <div className="absolute inset-16 rounded-full border-2 border-dashed border-violet-100 animate-[spin_20s_linear_infinite]" />

                                {/* Centro */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                                        <span className="text-3xl" style={{ fontFamily: "Bobaland, sans-serif" }}>
                                            <span className="text-white">B!</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Dots orbitando */}
                                {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                                    <div
                                        key={i}
                                        className="absolute w-10 h-10 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center text-sm"
                                        style={{
                                            top: `${50 + 42 * Math.sin((deg * Math.PI) / 180)}%`,
                                            left: `${50 + 42 * Math.cos((deg * Math.PI) / 180)}%`,
                                            transform: "translate(-50%, -50%)",
                                        }}
                                    >
                                        {["⚖️", "📚", "🎯", "📝", "🏛️", "💼"][i]}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
           DEPOIMENTOS
         ═══════════════════════════════ */}
            <section className="py-24 bg-slate-50/60">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-14">
                        <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 mb-3 bg-indigo-50 border border-indigo-100 px-4 py-1.5 rounded-full">
                            Depoimentos
                        </span>
                        <h2 className="text-4xl font-extrabold text-slate-900 mb-4">
                            Quem usa,{" "}
                            <span
                                style={{
                                    background: "linear-gradient(135deg, #6366F1, #8B5CF6)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text",
                                }}
                            >
                                aprova
                            </span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {testimonials.map((t) => (
                            <div
                                key={t.name}
                                className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300"
                            >
                                <div className="flex gap-1 mb-4">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={14} className="fill-amber-400 text-amber-400" />
                                    ))}
                                </div>
                                <p className="text-sm text-slate-600 leading-relaxed mb-5 italic">
                                    &ldquo;{t.text}&rdquo;
                                </p>
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-50">
                                    <div
                                        className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white`}
                                    >
                                        {t.initials}
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{t.name}</div>
                                        <div className="text-xs text-slate-400">{t.role}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
           CTA FINAL
         ═══════════════════════════════ */}
            <section className="relative py-24 overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                {/* Decoração */}
                <div className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                        backgroundSize: "32px 32px",
                    }}
                />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
                        Pronto para conquistar
                        <br />
                        sua vaga?
                    </h2>
                    <p className="text-indigo-200 text-lg mb-10 max-w-md mx-auto">
                        Comece agora com 7 dias grátis. Sem cartão de crédito.
                        Sem compromisso.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <button className="group flex items-center gap-2 px-8 h-14 rounded-2xl text-base font-bold text-indigo-700 bg-white shadow-xl shadow-black/10 hover:scale-[1.03] transition-all duration-300">
                                <Zap className="w-5 h-5" />
                                Criar conta grátis
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="px-8 h-14 rounded-2xl text-base font-semibold text-white/90 border border-white/20 hover:bg-white/10 transition-all duration-300">
                                Ver planos
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════════
           FOOTER
         ═══════════════════════════════ */}
            <footer className="py-10 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                        <span className="text-xl" style={{ fontFamily: "Bobaland, sans-serif" }}>
                            <span className="text-slate-800">Bizu</span>
                            <span className="text-indigo-500">!</span>
                        </span>
                        <span className="text-xs text-slate-400"> Portal</span>
                    </div>
                    <p className="text-sm text-slate-400">
                        © 2025 Bizu! Portal · Todos os direitos reservados
                    </p>
                    <div className="flex gap-6">
                        <Link href="/termos" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Termos</Link>
                        <Link href="/privacidade" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Privacidade</Link>
                        <Link href="/pricing" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Preços</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
