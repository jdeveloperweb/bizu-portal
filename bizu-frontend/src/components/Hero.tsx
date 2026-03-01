"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
    ArrowRight, BookOpen, GraduationCap, BarChart3,
    CheckCircle2, Star, Shield, ChevronRight,
    BookMarked, Target, FileText, Users
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

/* ─── Types ─── */
interface Course {
    id: string;
    title: string;
    description?: string;
    themeColor?: string;
}

/* ─── Animated Counter ─── */
function StatCounter({ value, suffix = "", label }: { value: number; suffix?: string; label: string }) {
    const [count, setCount] = useState(0);
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true });

    useEffect(() => {
        if (!inView) return;
        const duration = 1800;
        const step = value / (duration / 16);
        let curr = 0;
        const timer = setInterval(() => {
            curr += step;
            if (curr >= value) { setCount(value); clearInterval(timer); }
            else setCount(Math.floor(curr));
        }, 16);
        return () => clearInterval(timer);
    }, [inView, value]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {count.toLocaleString("pt-BR")}{suffix}
            </div>
            <div className="text-sm text-slate-500 font-medium mt-1.5">{label}</div>
        </div>
    );
}

/* ─── Fade-in on scroll ─── */
function FadeIn({
    children, delay = 0, className = "", from = "bottom"
}: {
    children: React.ReactNode; delay?: number; className?: string; from?: "bottom" | "left" | "right";
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-64px" });
    const initial = from === "left" ? { opacity: 0, x: -32 } : from === "right" ? { opacity: 0, x: 32 } : { opacity: 0, y: 28 };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── Static data ─── */
const FEATURES = [
    {
        icon: BookMarked,
        title: "Banco de Questões",
        desc: "Mais de 50.000 questões comentadas, organizadas por banca e disciplina, atualizadas semanalmente.",
        color: "text-indigo-600", bg: "bg-indigo-50/80",
    },
    {
        icon: BarChart3,
        title: "Análise de Desempenho",
        desc: "Métricas precisas por disciplina. Saiba exatamente onde focar para maximizar seu resultado.",
        color: "text-emerald-600", bg: "bg-emerald-50/80",
    },
    {
        icon: Target,
        title: "Simulados Semanais",
        desc: "Provas inéditas com o mesmo padrão das principais bancas. Treine como se fosse a prova real.",
        color: "text-amber-600", bg: "bg-amber-50/80",
    },
    {
        icon: Shield,
        title: "7 Dias de Garantia",
        desc: "Experimente sem risco. Se não ficar satisfeito, devolvemos 100% do seu investimento.",
        color: "text-violet-600", bg: "bg-violet-50/80",
    },
];

const STEPS = [
    {
        num: "01",
        title: "Escolha seu Concurso",
        desc: "Selecione o cargo que deseja conquistar. O conteúdo é adaptado ao seu edital específico.",
    },
    {
        num: "02",
        title: "Estude com Método",
        desc: "Questões, simulados e revisões organizados em trilhas inteligentes de aprendizado progressivo.",
    },
    {
        num: "03",
        title: "Monitore e Ajuste",
        desc: "Acompanhe sua evolução em tempo real e corrija sua rota antes que seja tarde demais.",
    },
];

const TESTIMONIALS = [
    {
        name: "Ana Carolina Ferreira",
        role: "Aprovada — Polícia Federal",
        text: "Em 6 meses de preparação passei de 58% para 87% nas simulações. O acompanhamento de desempenho foi o diferencial que me faltava.",
        initials: "AC",
        bg: "bg-indigo-100",
        text_: "text-indigo-700",
    },
    {
        name: "Ricardo Mendonça",
        role: "Aprovado — TRT 3ª Região",
        text: "Nunca pensei que uma plataforma de estudos pudesse ser tão séria e completa. A qualidade do banco de questões é superior ao que eu já usei.",
        initials: "RM",
        bg: "bg-emerald-100",
        text_: "text-emerald-700",
    },
    {
        name: "Juliana Carvalho",
        role: "Aprovada — Receita Federal",
        text: "A metodologia é sólida. Estudei por 8 meses usando a plataforma e cheguei na prova com uma confiança que nunca havia sentido antes.",
        initials: "JC",
        bg: "bg-amber-100",
        text_: "text-amber-700",
    },
];

/* ═══════════════════════════════════════════════ */
export default function Hero() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        fetch(`${api}/public/courses`)
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setCourses(Array.isArray(d) ? d : []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="relative bg-white overflow-x-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

            {/* ══════════════════════════
                HERO
            ══════════════════════════ */}
            <section className="relative min-h-screen flex items-center pt-20 pb-20 overflow-hidden">

                {/* Background layers */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: "linear-gradient(to right,#e2e8f0 1px,transparent 1px),linear-gradient(to bottom,#e2e8f0 1px,transparent 1px)",
                        backgroundSize: "56px 56px",
                        maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%,#000 60%,transparent 100%)",
                        opacity: 0.28,
                    }}
                />
                <div className="absolute -top-32 right-[-10%] w-[700px] h-[700px] rounded-full bg-indigo-50 blur-[130px] opacity-70 pointer-events-none" />
                <div className="absolute top-1/2 -left-24 w-[400px] h-[400px] rounded-full bg-slate-100 blur-[100px] opacity-50 pointer-events-none" />

                <div className="relative container mx-auto px-6 z-10 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left — copy */}
                        <div>
                            {/* Eyebrow */}
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-8"
                            >
                                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                                Plataforma #1 para Concursos
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 28 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.75, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-slate-900 leading-[1.05] tracking-tight mb-8"
                            >
                                Sua aprovação,{" "}
                                <span className="relative inline-block whitespace-nowrap">
                                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
                                        planejada.
                                    </span>
                                    {/* Decorative underline */}
                                    <svg
                                        className="absolute -bottom-1.5 left-0 w-full"
                                        height="6"
                                        viewBox="0 0 280 6"
                                        fill="none"
                                        preserveAspectRatio="none"
                                        aria-hidden
                                    >
                                        <path
                                            d="M2 4 Q70 1 140 4 Q210 7 278 4"
                                            stroke="#818CF8"
                                            strokeWidth="2"
                                            fill="none"
                                            strokeLinecap="round"
                                            opacity="0.5"
                                        />
                                    </svg>
                                </span>
                            </motion.h1>

                            {/* Sub */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.22, ease: "easeOut" }}
                                className="text-lg md:text-xl text-slate-600 leading-relaxed font-medium max-w-lg mb-10"
                            >
                                A plataforma séria que transforma sua preparação para concursos em resultados reais. Método comprovado, conteúdo atualizado, análise inteligente.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.34, ease: "easeOut" }}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10"
                            >
                                <Link href="/register">
                                    <button className="group flex items-center justify-center gap-2.5 px-8 h-14 rounded-2xl text-[15px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto">
                                        Começar agora
                                        <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-200" />
                                    </button>
                                </Link>
                                <Link href="/pricing">
                                    <button className="flex items-center justify-center gap-2 px-8 h-14 rounded-2xl text-[15px] font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm hover:-translate-y-0.5 transition-all duration-200 w-full sm:w-auto">
                                        Ver cursos e planos
                                    </button>
                                </Link>
                            </motion.div>

                            {/* Trust signals */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.6, delay: 0.5 }}
                                className="flex flex-wrap items-center gap-5 text-sm text-slate-500 font-medium"
                            >
                                {[
                                    { icon: CheckCircle2, text: "7 dias de garantia" },
                                    { icon: Shield, text: "Pagamento seguro" },
                                    { icon: Star, text: "4.9 / 5 estrelas" },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.text} className="flex items-center gap-1.5">
                                            <Icon size={14} className="text-emerald-500 shrink-0" />
                                            {item.text}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </div>

                        {/* Right — visual proof card */}
                        <motion.div
                            initial={{ opacity: 0, x: 40 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="hidden lg:block"
                        >
                            <div
                                className="relative rounded-[2.5rem] bg-white border border-slate-200/80 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.08),0_0_0_1px_rgba(255,255,255,0.5)] overflow-hidden"
                                style={{ animation: "float 7s ease-in-out infinite" }}
                            >
                                {/* Header bar */}
                                <div className="flex items-center gap-2 px-6 py-4 bg-slate-50/80 border-b border-slate-100">
                                    <div className="flex gap-2">
                                        {["bg-red-300", "bg-amber-300", "bg-emerald-300"].map((c) => (
                                            <div key={c} className={`w-3 h-3 rounded-full ${c}`} />
                                        ))}
                                    </div>
                                    <div className="flex-1 flex justify-center">
                                        <div className="flex items-center gap-2 bg-white rounded-lg px-4 py-1.5 border border-slate-200/60 text-[11px] text-slate-400 font-medium">
                                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            bizu.academy.com.br/dashboard
                                        </div>
                                    </div>
                                </div>

                                {/* Dashboard mockup */}
                                <div className="p-7 space-y-5 bg-slate-50/30">
                                    {/* Welcome */}
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-base font-bold text-slate-800">Bom dia, Mariana ☀️</div>
                                            <div className="text-xs text-slate-400 font-medium mt-0.5">Continue sua preparação de hoje</div>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                                            <span className="text-base leading-none">🔥</span>
                                            <span className="text-xs font-bold text-amber-700">21 dias</span>
                                        </div>
                                    </div>

                                    {/* Stats row */}
                                    <div className="grid grid-cols-3 gap-3">
                                        {[
                                            { l: "Questões", v: "2.341", c: "text-indigo-600", bg: "bg-indigo-50" },
                                            { l: "Acertos", v: "84%", c: "text-emerald-600", bg: "bg-emerald-50" },
                                            { l: "Ranking", v: "#18", c: "text-amber-600", bg: "bg-amber-50" },
                                        ].map((s) => (
                                            <div key={s.l} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
                                                <div className={`text-xl font-extrabold ${s.c} mb-0.5`}>{s.v}</div>
                                                <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{s.l}</div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress bars */}
                                    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
                                        <div className="text-[12px] font-bold text-slate-700 mb-4">Desempenho por Disciplina</div>
                                        <div className="space-y-3.5">
                                            {[
                                                { n: "Língua Portuguesa", p: 91, c: "bg-emerald-400" },
                                                { n: "Dir. Constitucional", p: 76, c: "bg-indigo-400" },
                                                { n: "Raciocínio Lógico", p: 62, c: "bg-amber-400" },
                                            ].map((s) => (
                                                <div key={s.n}>
                                                    <div className="flex justify-between text-[11px] font-semibold mb-1.5">
                                                        <span className="text-slate-500">{s.n}</span>
                                                        <span className="text-slate-700">{s.p}%</span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                        <div className={`h-full ${s.c} rounded-full`} style={{ width: `${s.p}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Next exam */}
                                    <div className="flex items-center gap-4 bg-slate-900 rounded-2xl px-5 py-4 text-white">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-600/30 flex items-center justify-center shrink-0">
                                            <FileText size={18} className="text-indigo-300" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-[11px] text-slate-400 font-medium mb-0.5">Próximo Simulado</div>
                                            <div className="text-sm font-bold truncate">Policial Federal #31</div>
                                        </div>
                                        <div className="text-[11px] font-bold text-indigo-300 shrink-0">Sáb 10h</div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                STATS BAR
            ══════════════════════════ */}
            <section className="border-y border-slate-100 bg-slate-50/60 py-12">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto divide-x-0 md:divide-x divide-slate-200">
                        <StatCounter value={28000} suffix="+" label="Alunos ativos" />
                        <StatCounter value={50000} suffix="+" label="Questões no banco" />
                        <StatCounter value={87} suffix="%" label="Taxa de aprovação" />
                        <StatCounter value={200} suffix="+" label="Simulados realizados" />
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                CURSOS (API)
            ══════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Nossos Cursos
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Escolha sua jornada
                        </h2>
                        <p className="text-slate-500 text-lg max-w-lg mx-auto leading-relaxed">
                            Cada curso é desenvolvido com foco total no edital. Conteúdo atualizado e metodologia comprovada.
                        </p>
                    </FadeIn>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-52 rounded-3xl bg-slate-100 animate-pulse" />
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <FadeIn className="text-center py-16 bg-slate-50 rounded-[2.5rem] max-w-lg mx-auto border border-dashed border-slate-200">
                            <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center mx-auto mb-5">
                                <BookOpen size={28} className="text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">Cursos em breve</h3>
                            <p className="text-slate-500 text-sm">Estamos preparando algo incrível. Fique de olho!</p>
                        </FadeIn>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                            {courses.map((course, i) => {
                                const accent = course.themeColor || "#6366F1";
                                return (
                                    <FadeIn key={course.id} delay={i * 0.07}>
                                        <Link href={`/pricing?courseId=${course.id}`} className="block h-full group">
                                            <div className="relative h-full bg-white rounded-3xl border border-slate-100 p-8 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                                                {/* top accent strip */}
                                                <div
                                                    className="absolute top-0 left-8 right-8 h-[3px] rounded-b-full"
                                                    style={{ background: accent, opacity: 0.7 }}
                                                />
                                                {/* icon */}
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-105 transition-transform duration-300"
                                                    style={{ background: `${accent}18` }}
                                                >
                                                    <GraduationCap size={26} style={{ color: accent }} />
                                                </div>

                                                <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug">{course.title}</h3>
                                                {course.description && (
                                                    <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">
                                                        {course.description}
                                                    </p>
                                                )}

                                                <div
                                                    className="flex items-center gap-1.5 text-sm font-bold mt-auto"
                                                    style={{ color: accent }}
                                                >
                                                    Ver planos
                                                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform duration-200" />
                                                </div>
                                            </div>
                                        </Link>
                                    </FadeIn>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* ══════════════════════════
                HOW IT WORKS
            ══════════════════════════ */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                {/* Background grid */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.03) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[250px] bg-indigo-600/8 rounded-full blur-[120px] pointer-events-none" />

                <div className="relative container mx-auto px-6">
                    <FadeIn className="text-center mb-16">
                        <span className="text-indigo-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Metodologia
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                            Como funciona
                        </h2>
                        <p className="text-slate-400 text-lg max-w-md mx-auto">
                            Três etapas simples, resultado extraordinário.
                        </p>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-5xl mx-auto relative">
                        {/* connector line */}
                        <div className="hidden md:block absolute top-11 left-[19%] right-[19%] h-px bg-gradient-to-r from-transparent via-indigo-500/25 to-transparent pointer-events-none" />

                        {STEPS.map((step, i) => (
                            <FadeIn key={step.num} delay={i * 0.1} className="text-center">
                                <div className="w-[88px] h-[88px] rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm flex items-center justify-center mx-auto mb-7">
                                    <span className="text-4xl font-black text-indigo-400/50 tabular-nums">{step.num}</span>
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                                <p className="text-slate-400 text-[15px] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                FEATURES
            ══════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Por que o Bizu Academy
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Tudo que você precisa,<br className="hidden sm:block" /> em um só lugar
                        </h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <FadeIn key={f.title} delay={i * 0.07}>
                                    <div className="group p-7 rounded-3xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:shadow-lg hover:border-slate-200 hover:-translate-y-1 transition-all duration-300 h-full">
                                        <div className={`w-12 h-12 rounded-2xl ${f.bg} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon size={22} className={f.color} />
                                        </div>
                                        <h3 className="text-[15px] font-bold text-slate-900 mb-2.5 leading-snug">{f.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                TESTIMONIALS
            ══════════════════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Histórias de Aprovação
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
                            Quem confiou,<br className="hidden sm:block" /> foi aprovado
                        </h2>
                        <p className="text-slate-500 text-lg max-w-md mx-auto">
                            Resultados reais de candidatos que levaram a sério sua preparação.
                        </p>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {TESTIMONIALS.map((t, i) => (
                            <FadeIn key={t.name} delay={i * 0.1}>
                                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm hover:shadow-md transition-shadow h-full flex flex-col">
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-5">
                                        {[...Array(5)].map((_, si) => (
                                            <Star key={si} size={13} className="fill-amber-400 text-amber-400" />
                                        ))}
                                    </div>

                                    <blockquote className="text-slate-600 text-[15px] leading-relaxed flex-1 mb-7 font-medium">
                                        "{t.text}"
                                    </blockquote>

                                    <div className="flex items-center gap-3.5 pt-5 border-t border-slate-100">
                                        <div className={`w-11 h-11 rounded-full ${t.bg} ${t.text_} flex items-center justify-center text-sm font-black shrink-0`}>
                                            {t.initials}
                                        </div>
                                        <div>
                                            <div className="text-sm font-bold text-slate-900">{t.name}</div>
                                            <div className="text-xs text-emerald-600 font-semibold flex items-center gap-1 mt-0.5">
                                                <CheckCircle2 size={10} />
                                                {t.role}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </FadeIn>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                FINAL CTA
            ══════════════════════════ */}
            <section className="py-32 bg-white relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse 80% 80% at 50% -10%, rgba(99,102,241,0.07) 0%, transparent 70%)",
                    }}
                />
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-slate-100/50 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative container mx-auto px-6 text-center max-w-3xl">
                    <FadeIn>
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-600 mb-10 shadow-2xl shadow-indigo-500/30 rotate-3 hover:rotate-0 transition-transform duration-300 cursor-default">
                            <GraduationCap size={36} className="text-white" />
                        </div>

                        <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
                            Sua aprovação está<br />
                            <span className="text-indigo-600">mais perto do que você pensa</span>
                        </h2>

                        <p className="text-slate-500 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
                            Junte-se a mais de 28.000 candidatos que escolheram a preparação séria. Comece hoje, sem risco.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                            <Link href="/register">
                                <button className="group flex items-center justify-center gap-2.5 px-10 h-[60px] rounded-2xl text-[16px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-500/25 hover:shadow-2xl hover:shadow-indigo-500/35 hover:-translate-y-1 transition-all duration-200 w-full sm:w-auto">
                                    Criar conta gratuita
                                    <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform duration-200" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="flex items-center justify-center gap-2 px-10 h-[60px] rounded-2xl text-[16px] font-bold text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 w-full sm:w-auto">
                                    Ver planos e preços
                                </button>
                            </Link>
                        </div>

                        <p className="text-sm text-slate-400 font-medium">
                            Sem cartão de crédito · 7 dias de garantia · Cancele quando quiser
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* ══════════════════════════
                FOOTER
            ══════════════════════════ */}
            <footer className="py-12 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
                        <div className="flex items-center gap-3">
                            <BrandLogo size="sm" variant="dark" link={false} />
                            <span className="text-slate-200">·</span>
                            <span className="text-sm font-semibold text-slate-500">Academy</span>
                        </div>
                        <p className="text-sm text-slate-400">
                            © 2026 Bizu Academy · O padrão de excelência em concursos.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/termos" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                Termos
                            </Link>
                            <Link href="/privacidade" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">
                                Privacidade
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Float animation for mockup card */}
            <style jsx global>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-12px); }
        }
      `}</style>
        </div>
    );
}
