"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import {
    ArrowRight, Swords, Trophy, Zap, Star,
    Shield, ChevronRight, GraduationCap,
    Brain, Sparkles, TrendingUp, Target,
    BookOpen, FlameIcon, Award, CheckCircle2, Lock
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

/* ─── Types ─── */
interface Course {
    id: string;
    title: string;
    description?: string;
    themeColor?: string;
}

/* ─── Scroll reveal ─── */
function FadeIn({
    children, delay = 0, className = "", from = "bottom"
}: {
    children: React.ReactNode; delay?: number; className?: string; from?: "bottom" | "left" | "right" | "none";
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const initial =
        from === "left" ? { opacity: 0, x: -28 } :
        from === "right" ? { opacity: 0, x: 28 } :
        from === "none" ? { opacity: 0 } :
        { opacity: 0, y: 24 };

    return (
        <motion.div
            ref={ref}
            initial={initial}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

/* ─── XP bar (decorative) ─── */
function XPBar({ value, max, color = "#6366F1" }: { value: number; max: number; color?: string }) {
    const pct = Math.min(100, (value / max) * 100);
    return (
        <div className="relative h-2.5 bg-white/10 rounded-full overflow-hidden">
            <motion.div
                className="absolute inset-y-0 left-0 rounded-full"
                style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
            />
        </div>
    );
}

/* ─── Floating badge (decorative) ─── */
function FloatingBadge({
    icon: Icon, label, color, delay, className
}: {
    icon: React.ElementType; label: string; color: string; delay?: number; className?: string;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, delay: delay ?? 0.8, ease: "backOut" }}
            className={`absolute flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-3 py-2 shadow-xl ${className}`}
        >
            <div className="w-7 h-7 rounded-xl flex items-center justify-center" style={{ background: `${color}30` }}>
                <Icon size={14} style={{ color }} />
            </div>
            <span className="text-xs font-bold text-white/90 whitespace-nowrap">{label}</span>
        </motion.div>
    );
}

/* ─── Feature card ─── */
const FEATURES = [
    {
        icon: Swords,
        title: "Arena de Duelos",
        desc: "Desafie outros candidatos em tempo real. Questões cronometradas, adrenalina de verdade. Quem acerta mais, sobe no ranking.",
        accent: "#6366F1",
        bg: "from-indigo-950/50 to-indigo-900/30",
        border: "border-indigo-500/20",
        tag: "PvP em tempo real",
    },
    {
        icon: Zap,
        title: "XP & Progressão",
        desc: "Cada questão respondida, cada simulado, cada duelo vencido — tudo vira XP. Suba de nível e desbloqueie conquistas únicas.",
        accent: "#F59E0B",
        bg: "from-amber-950/50 to-amber-900/30",
        border: "border-amber-500/20",
        tag: "Gamificação real",
    },
    {
        icon: Brain,
        title: "IA nas Redações",
        desc: "Envie sua redação e receba uma correção estruturada por IA: competências da banca, pontos fortes e o que exatamente melhorar.",
        accent: "#10B981",
        bg: "from-emerald-950/50 to-emerald-900/30",
        border: "border-emerald-500/20",
        tag: "IA com propósito",
    },
    {
        icon: Trophy,
        title: "Ranking Nacional",
        desc: "Compare seu desempenho com outros candidatos. Veja onde você está no ranking geral e por curso — e trace estratégia para subir.",
        accent: "#8B5CF6",
        bg: "from-violet-950/50 to-violet-900/30",
        border: "border-violet-500/20",
        tag: "Competição saudável",
    },
];

/* ─── Why AI section items ─── */
const AI_POINTS = [
    {
        icon: CheckCircle2,
        title: "Não é chatbot genérico",
        desc: "A IA foi treinada para entender os critérios específicos de cada banca. Ela sabe o que o Cespe quer e o que o FCC penaliza.",
    },
    {
        icon: CheckCircle2,
        title: "Feedback acionável",
        desc: "Você recebe uma nota por competência, os trechos problemáticos destacados e sugestões concretas de melhoria — não frases vagas.",
    },
    {
        icon: CheckCircle2,
        title: "Mais rápido que esperar professor",
        desc: "Resultado em segundos. Corrija, reescreva e submeta novamente quantas vezes quiser, no seu ritmo.",
    },
];

/* ─── Courses ─── */

export default function Hero() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [duelTick, setDuelTick] = useState(0);

    useEffect(() => {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        fetch(`${api}/public/courses`)
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setCourses(Array.isArray(d) ? d : []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    // Cycle through "duel" scores in the mockup
    useEffect(() => {
        const t = setInterval(() => setDuelTick((n) => (n + 1) % 3), 3200);
        return () => clearInterval(t);
    }, []);

    const duelScores = [
        { you: 7, opp: 5 },
        { you: 4, opp: 4 },
        { you: 9, opp: 6 },
    ];
    const { you, opp } = duelScores[duelTick];

    return (
        <div className="relative bg-[#020617] overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-100">

            {/* ══════════════════════════
                HERO — dark, energetic
            ══════════════════════════ */}
            <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">

                {/* Layered dark background */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(to right,rgba(99,102,241,0.04) 1px,transparent 1px)," +
                            "linear-gradient(to bottom,rgba(99,102,241,0.04) 1px,transparent 1px)",
                        backgroundSize: "60px 60px",
                    }}
                />
                {/* Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full opacity-20 blur-[120px] pointer-events-none"
                    style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
                <div className="absolute top-32 right-0 w-[400px] h-[400px] rounded-full opacity-10 blur-[100px] pointer-events-none"
                    style={{ background: "#F59E0B" }} />
                <div className="absolute bottom-0 left-0 w-[400px] h-[300px] rounded-full opacity-10 blur-[100px] pointer-events-none"
                    style={{ background: "#8B5CF6" }} />

                <div className="relative container mx-auto px-6 z-10 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* ── Left: copy ── */}
                        <div>
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest"
                                style={{
                                    background: "rgba(99,102,241,0.12)",
                                    borderColor: "rgba(99,102,241,0.3)",
                                    color: "#A5B4FC",
                                }}
                            >
                                <Sparkles size={12} />
                                Acesso Antecipado — Seja dos Primeiros
                            </motion.div>

                            {/* Headline */}
                            <motion.h1
                                initial={{ opacity: 0, y: 32 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                                className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-[1.05] tracking-tight mb-6 text-white"
                            >
                                Estude.{" "}
                                <span
                                    className="block"
                                    style={{
                                        backgroundImage: "linear-gradient(135deg, #818CF8 0%, #6366F1 40%, #A78BFA 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}
                                >
                                    Compita.
                                </span>
                                Evolua.
                            </motion.h1>

                            {/* Sub */}
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.22 }}
                                className="text-lg md:text-xl leading-relaxed font-medium max-w-lg mb-10"
                                style={{ color: "#94A3B8" }}
                            >
                                Uma plataforma nova que une preparação séria para concursos com a dinâmica de um jogo competitivo. XP, duelos, ranking e correção de redações por IA — onde a IA realmente faz diferença.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.34 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10"
                            >
                                <Link href="/register">
                                    <button
                                        className="group flex items-center justify-center gap-2.5 px-8 h-14 rounded-2xl text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
                                        style={{
                                            background: "linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)",
                                            boxShadow: "0 8px 32px rgba(99,102,241,0.4)",
                                        }}
                                    >
                                        Garantir meu acesso
                                        <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </Link>
                                <Link href="/pricing">
                                    <button
                                        className="flex items-center justify-center gap-2 px-8 h-14 rounded-2xl text-[15px] font-bold transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
                                        style={{
                                            background: "rgba(255,255,255,0.06)",
                                            border: "1px solid rgba(255,255,255,0.12)",
                                            color: "#CBD5E1",
                                        }}
                                    >
                                        Ver cursos e planos
                                    </button>
                                </Link>
                            </motion.div>

                            {/* Honest trust signals */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                className="flex flex-wrap items-center gap-5 text-sm font-medium"
                                style={{ color: "#64748B" }}
                            >
                                {[
                                    { icon: Shield, text: "7 dias de garantia" },
                                    { icon: Zap, text: "Plataforma em crescimento" },
                                    { icon: Star, text: "Metodologia inovadora" },
                                ].map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <div key={item.text} className="flex items-center gap-1.5">
                                            <Icon size={14} className="text-indigo-400 shrink-0" />
                                            {item.text}
                                        </div>
                                    );
                                })}
                            </motion.div>
                        </div>

                        {/* ── Right: game mockup ── */}
                        <div className="hidden lg:flex justify-center relative">
                            {/* Floating badges */}
                            <FloatingBadge icon={FlameIcon} label="🔥 12 dias de streak" color="#F59E0B" delay={1.1} className="-top-4 left-4" />
                            <FloatingBadge icon={Award} label="Nova conquista!" color="#A78BFA" delay={1.3} className="-bottom-4 right-4" />

                            <motion.div
                                initial={{ opacity: 0, y: 32 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                                className="relative w-full max-w-sm"
                                style={{ animation: "float 7s ease-in-out infinite" }}
                            >
                                <div
                                    className="rounded-[2rem] overflow-hidden border"
                                    style={{
                                        background: "rgba(15,23,42,0.85)",
                                        backdropFilter: "blur(24px)",
                                        borderColor: "rgba(99,102,241,0.25)",
                                        boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(99,102,241,0.1), inset 0 1px 0 rgba(255,255,255,0.05)",
                                    }}
                                >
                                    {/* Header */}
                                    <div
                                        className="flex items-center justify-between px-5 py-4 border-b"
                                        style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.2)" }}
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div
                                                className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-sm text-white"
                                                style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}
                                            >B!</div>
                                            <span className="text-sm font-bold text-white/80">Bizu Academy</span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/25 px-3 py-1 rounded-full">
                                            <Zap size={11} className="text-amber-400" />
                                            <span className="text-xs font-bold text-amber-300">2.840 XP</span>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Player profile */}
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-sm shrink-0"
                                                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}
                                            >
                                                MF
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className="text-sm font-bold text-white">Mariana Fonseca</span>
                                                    <span
                                                        className="text-[10px] font-black px-2 py-0.5 rounded-full"
                                                        style={{ background: "rgba(99,102,241,0.2)", color: "#A5B4FC" }}
                                                    >
                                                        Nível 7
                                                    </span>
                                                </div>
                                                <XPBar value={2840} max={4000} color="#6366F1" />
                                                <div className="flex justify-between text-[10px] font-medium mt-1" style={{ color: "#64748B" }}>
                                                    <span>2.840 XP</span>
                                                    <span>4.000 XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arena duel */}
                                        <div
                                            className="rounded-2xl p-4 border"
                                            style={{
                                                background: "rgba(99,102,241,0.08)",
                                                borderColor: "rgba(99,102,241,0.2)",
                                            }}
                                        >
                                            <div className="flex items-center gap-2 mb-3">
                                                <Swords size={13} className="text-indigo-400" />
                                                <span className="text-xs font-bold uppercase tracking-widest text-indigo-400">Arena Ativa</span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-center">
                                                    <div className="text-2xl font-black text-white">{you}</div>
                                                    <div className="text-[10px] text-indigo-300 font-semibold">Você</div>
                                                </div>
                                                <div
                                                    className="px-4 py-1.5 rounded-xl text-xs font-black"
                                                    style={{ background: "rgba(99,102,241,0.2)", color: "#818CF8" }}
                                                >
                                                    VS
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-black text-white/60">{opp}</div>
                                                    <div className="text-[10px] text-slate-500 font-semibold">Rival</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Badges row */}
                                        <div>
                                            <div className="text-[11px] font-bold uppercase tracking-wider mb-2.5" style={{ color: "#475569" }}>
                                                Conquistas recentes
                                            </div>
                                            <div className="flex gap-2">
                                                {[
                                                    { color: "#F59E0B", icon: "🔥", label: "Sequência 10" },
                                                    { color: "#10B981", icon: "🎯", label: "Sniper" },
                                                    { color: "#6366F1", icon: "⚡", label: "Veloz" },
                                                    { color: "#8B5CF6", icon: "🏆", label: "Top 3" },
                                                ].map((b) => (
                                                    <div
                                                        key={b.label}
                                                        title={b.label}
                                                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg cursor-default"
                                                        style={{ background: `${b.color}20`, border: `1px solid ${b.color}30` }}
                                                    >
                                                        {b.icon}
                                                    </div>
                                                ))}
                                                <div
                                                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                                                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                                                >
                                                    <Lock size={12} style={{ color: "#475569" }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ranking */}
                                        <div
                                            className="flex items-center justify-between rounded-2xl px-4 py-3 border"
                                            style={{ background: "rgba(245,158,11,0.07)", borderColor: "rgba(245,158,11,0.15)" }}
                                        >
                                            <div className="flex items-center gap-2">
                                                <Trophy size={14} className="text-amber-400" />
                                                <span className="text-xs font-bold text-amber-300">Ranking Semanal</span>
                                            </div>
                                            <span className="text-sm font-black text-amber-400">#12</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                O QUE NOS DIFERENCIA
            ══════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Nossa proposta
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
                            Estudar ficou{" "}
                            <span
                                className="text-transparent bg-clip-text"
                                style={{ backgroundImage: "linear-gradient(135deg, #6366F1, #8B5CF6)" }}
                            >
                                diferente
                            </span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                            Não somos mais uma plataforma de questões. Transformamos sua preparação em uma experiência competitiva e evolutiva — onde cada sessão de estudo importa de verdade.
                        </p>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <FadeIn key={f.title} delay={i * 0.08}>
                                    <div
                                        className={`group relative rounded-3xl border p-8 overflow-hidden hover:-translate-y-1.5 transition-all duration-300 bg-gradient-to-br ${f.bg} ${f.border}`}
                                        style={{ background: "#0F172A" }}
                                    >
                                        {/* accent glow */}
                                        <div
                                            className="absolute -top-10 -right-10 w-40 h-40 rounded-full blur-[60px] opacity-20 pointer-events-none transition-opacity duration-300 group-hover:opacity-35"
                                            style={{ background: f.accent }}
                                        />
                                        <div
                                            className="w-13 h-13 w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                                            style={{ background: `${f.accent}20`, border: `1px solid ${f.accent}30` }}
                                        >
                                            <Icon size={22} style={{ color: f.accent }} />
                                        </div>
                                        <div
                                            className="text-[10px] font-black uppercase tracking-widest mb-2 px-2.5 py-1 rounded-full inline-block"
                                            style={{ background: `${f.accent}18`, color: f.accent }}
                                        >
                                            {f.tag}
                                        </div>
                                        <h3 className="text-xl font-bold text-white mb-3 mt-2">{f.title}</h3>
                                        <p className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{f.desc}</p>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                CURSOS (API)
            ══════════════════════════ */}
            <section className="py-24 bg-slate-50">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Cursos disponíveis
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
                            Escolha sua arena
                        </h2>
                        <p className="text-slate-500 text-lg max-w-md mx-auto">
                            Cada curso tem seu próprio ranking, trilha de questões e simulados. Escolha o seu e comece a competir.
                        </p>
                    </FadeIn>

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-52 rounded-3xl bg-slate-200 animate-pulse" />
                            ))}
                        </div>
                    ) : courses.length === 0 ? (
                        <FadeIn className="text-center py-16 max-w-lg mx-auto">
                            <div className="w-16 h-16 rounded-3xl bg-indigo-50 flex items-center justify-center mx-auto mb-5">
                                <BookOpen size={28} className="text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-700 mb-2">Cursos chegando em breve</h3>
                            <p className="text-slate-500 text-sm">Estamos montando as primeiras arenas. Crie sua conta para ser avisado.</p>
                            <Link href="/register" className="inline-flex items-center gap-2 mt-5 px-6 py-2.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
                                Criar conta <ArrowRight size={14} />
                            </Link>
                        </FadeIn>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
                            {courses.map((course, i) => {
                                const accent = course.themeColor || "#6366F1";
                                return (
                                    <FadeIn key={course.id} delay={i * 0.07}>
                                        <Link href={`/pricing?courseId=${course.id}`} className="block h-full group">
                                            <div className="relative h-full bg-white rounded-3xl border border-slate-100 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                                                {/* top accent */}
                                                <div
                                                    className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full"
                                                    style={{ background: accent, opacity: 0.7 }}
                                                />
                                                {/* icon */}
                                                <div
                                                    className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300"
                                                    style={{ background: `${accent}15` }}
                                                >
                                                    <GraduationCap size={26} style={{ color: accent }} />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2.5 leading-snug">{course.title}</h3>
                                                {course.description && (
                                                    <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-2">{course.description}</p>
                                                )}
                                                <div
                                                    className="flex items-center gap-1.5 text-sm font-bold"
                                                    style={{ color: accent }}
                                                >
                                                    Entrar na arena
                                                    <ChevronRight size={15} className="group-hover:translate-x-1 transition-transform" />
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
                IA NAS REDAÇÕES — spotlight
            ══════════════════════════ */}
            <section className="py-24 bg-slate-900 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(255,255,255,0.025) 1px,transparent 1px)," +
                            "linear-gradient(to right,rgba(255,255,255,0.025) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />
                <div
                    className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10 pointer-events-none"
                    style={{ background: "#10B981" }}
                />

                <div className="relative container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

                        {/* Left: copy */}
                        <FadeIn from="left">
                            <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
                                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.25)", color: "#6EE7B7" }}>
                                <Brain size={12} />
                                IA com propósito real
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                                Correção de redação<br />
                                <span style={{ color: "#10B981" }}>que realmente ensina</span>
                            </h2>
                            <p className="text-lg leading-relaxed mb-8" style={{ color: "#94A3B8" }}>
                                Muita plataforma usa IA como enfeite. A gente usou onde faz sentido: na correção de redações. Receba um feedback detalhado, por competência, sem esperar dias por um professor.
                            </p>

                            <div className="space-y-5">
                                {AI_POINTS.map((point) => (
                                    <div key={point.title} className="flex gap-4">
                                        <div className="mt-0.5 shrink-0">
                                            <CheckCircle2 size={18} className="text-emerald-400" />
                                        </div>
                                        <div>
                                            <div className="text-white font-bold mb-1">{point.title}</div>
                                            <div className="text-sm leading-relaxed" style={{ color: "#94A3B8" }}>{point.desc}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </FadeIn>

                        {/* Right: mock correction card */}
                        <FadeIn from="right" delay={0.1}>
                            <div
                                className="rounded-3xl border overflow-hidden"
                                style={{
                                    background: "rgba(15,23,42,0.8)",
                                    borderColor: "rgba(16,185,129,0.2)",
                                    backdropFilter: "blur(16px)",
                                    boxShadow: "0 24px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(16,185,129,0.08)",
                                }}
                            >
                                {/* Header */}
                                <div
                                    className="px-6 py-4 border-b flex items-center gap-2"
                                    style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.25)" }}
                                >
                                    <Brain size={16} className="text-emerald-400" />
                                    <span className="text-sm font-bold text-white/80">Resultado da Correção</span>
                                    <div className="ml-auto px-2.5 py-1 rounded-full text-[10px] font-black"
                                        style={{ background: "rgba(16,185,129,0.2)", color: "#6EE7B7" }}>
                                        Concluído
                                    </div>
                                </div>

                                <div className="p-6 space-y-5">
                                    {/* Score */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold" style={{ color: "#64748B" }}>Nota geral</span>
                                        <span className="text-3xl font-black text-white">760<span className="text-lg text-emerald-400">/1000</span></span>
                                    </div>

                                    {/* Competências */}
                                    {[
                                        { label: "Competência I — Domínio da norma culta", score: 160, max: 200, color: "#10B981" },
                                        { label: "Competência II — Compreensão do tema", score: 160, max: 200, color: "#6366F1" },
                                        { label: "Competência III — Argumentação", score: 140, max: 200, color: "#F59E0B" },
                                        { label: "Competência IV — Coesão textual", score: 160, max: 200, color: "#8B5CF6" },
                                        { label: "Competência V — Proposta de intervenção", score: 140, max: 200, color: "#EC4899" },
                                    ].map((c) => (
                                        <div key={c.label}>
                                            <div className="flex justify-between text-[11px] font-semibold mb-1.5" style={{ color: "#64748B" }}>
                                                <span className="truncate pr-2">{c.label}</span>
                                                <span className="shrink-0" style={{ color: c.color }}>{c.score}/{c.max}</span>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ background: c.color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(c.score / c.max) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                                                />
                                            </div>
                                        </div>
                                    ))}

                                    {/* Feedback snippet */}
                                    <div
                                        className="rounded-2xl p-4 border text-sm leading-relaxed"
                                        style={{
                                            background: "rgba(16,185,129,0.06)",
                                            borderColor: "rgba(16,185,129,0.15)",
                                            color: "#94A3B8",
                                        }}
                                    >
                                        <span className="text-emerald-400 font-bold">Ponto de melhoria: </span>
                                        Sua proposta de intervenção menciona o agente, mas não especifica a ação nem o meio de execução. Adicione essas informações para atingir a nota máxima nessa competência.
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                HOW IT WORKS
            ══════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Como funciona
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
                            Simples de entrar,<br className="hidden sm:block" /> difícil de parar
                        </h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                        {/* connector */}
                        <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px pointer-events-none"
                            style={{ background: "linear-gradient(to right,transparent,rgba(99,102,241,0.3),transparent)" }} />

                        {[
                            {
                                num: "01",
                                icon: GraduationCap,
                                title: "Escolha seu concurso",
                                desc: "Selecione o cargo que quer conquistar. Todo o conteúdo — questões, simulados e ranking — é do seu edital.",
                                color: "#6366F1",
                            },
                            {
                                num: "02",
                                icon: Swords,
                                title: "Estude competindo",
                                desc: "Responda questões, entre na Arena de Duelos, ganhe XP e suba de nível. Estudar nunca foi tão motivador.",
                                color: "#F59E0B",
                            },
                            {
                                num: "03",
                                icon: TrendingUp,
                                title: "Monitore sua evolução",
                                desc: "Acompanhe seu desempenho por disciplina, sua posição no ranking e o que ainda falta dominar.",
                                color: "#10B981",
                            },
                        ].map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <FadeIn key={step.num} delay={i * 0.1} className="text-center">
                                    <div
                                        className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 relative"
                                        style={{ background: `${step.color}12`, border: `1px solid ${step.color}25` }}
                                    >
                                        <Icon size={30} style={{ color: step.color }} />
                                        <div
                                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                                            style={{ background: step.color }}
                                        >
                                            {i + 1}
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                                    <p className="text-slate-500 text-[15px] leading-relaxed max-w-xs mx-auto">{step.desc}</p>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════
                EARLY ACCESS CTA
            ══════════════════════════ */}
            <section className="py-32 relative overflow-hidden" style={{ background: "#020617" }}>
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(99,102,241,0.15) 0%, transparent 70%)",
                    }}
                />
                <div
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[200px] rounded-full blur-[100px] pointer-events-none opacity-20"
                    style={{ background: "#6366F1" }}
                />

                <div className="relative container mx-auto px-6 text-center max-w-3xl">
                    <FadeIn>
                        <div
                            className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full text-sm font-bold"
                            style={{
                                background: "rgba(99,102,241,0.12)",
                                border: "1px solid rgba(99,102,241,0.25)",
                                color: "#A5B4FC",
                            }}
                        >
                            <Sparkles size={14} />
                            Somos novos — e isso é uma vantagem
                        </div>

                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                            Seja dos primeiros.<br />
                            <span
                                className="text-transparent bg-clip-text"
                                style={{ backgroundImage: "linear-gradient(135deg, #818CF8, #A78BFA)" }}
                            >
                                Molde a plataforma.
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl mb-4 max-w-xl mx-auto leading-relaxed" style={{ color: "#94A3B8" }}>
                            Estamos no começo — e isso significa que quem entra agora ajuda a definir o que essa plataforma vai se tornar. Acesso antecipado, preço de fundador e suporte direto com a equipe.
                        </p>
                        <p className="text-sm font-medium mb-12" style={{ color: "#475569" }}>
                            Sem enrolação. Sem números inflados. Só uma plataforma honesta que quer ser a melhor.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                            <Link href="/register">
                                <button
                                    className="group flex items-center justify-center gap-2.5 px-10 h-[60px] rounded-2xl text-[16px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
                                    style={{
                                        background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                        boxShadow: "0 12px 40px rgba(99,102,241,0.4)",
                                    }}
                                >
                                    Criar conta gratuita
                                    <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button
                                    className="flex items-center justify-center gap-2 px-10 h-[60px] rounded-2xl text-[16px] font-bold transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
                                    style={{
                                        background: "rgba(255,255,255,0.05)",
                                        border: "1px solid rgba(255,255,255,0.1)",
                                        color: "#CBD5E1",
                                    }}
                                >
                                    Ver planos e preços
                                </button>
                            </Link>
                        </div>

                        <p className="text-sm font-medium" style={{ color: "#334155" }}>
                            7 dias de garantia incondicional · Sem cartão de crédito para testar · Cancele quando quiser
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* ══════════════════════════
                FOOTER
            ══════════════════════════ */}
            <footer
                className="py-12 border-t"
                style={{ background: "#020617", borderColor: "rgba(255,255,255,0.06)" }}
            >
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
                        <div className="flex items-center gap-3">
                            <BrandLogo size="sm" variant="light" link={false} />
                            <span style={{ color: "#1E293B" }}>·</span>
                            <span className="text-sm font-semibold" style={{ color: "#475569" }}>Academy</span>
                        </div>
                        <p className="text-sm" style={{ color: "#334155" }}>
                            © 2026 Bizu Academy · Concursos com gamificação de verdade.
                        </p>
                        <div className="flex gap-6">
                            <Link href="/termos" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "#475569" }}>
                                Termos
                            </Link>
                            <Link href="/privacidade" className="text-sm font-medium transition-colors hover:text-white" style={{ color: "#475569" }}>
                                Privacidade
                            </Link>
                        </div>
                    </div>
                </div>
            </footer>

            {/* Float animation */}
            <style jsx global>{`
        @keyframes float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
      `}</style>
        </div>
    );
}
