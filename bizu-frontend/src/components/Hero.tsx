"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { motion, useInView, AnimatePresence, type Variants } from "framer-motion";
import {
    ArrowRight, Swords, Trophy, Zap, Star,
    Shield, ChevronRight, GraduationCap,
    Brain, Sparkles, TrendingUp,
    BookOpen, Award, CheckCircle2, Lock, Flame
} from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

/* ─── Types ─── */
interface Course {
    id: string;
    title: string;
    description?: string;
    themeColor?: string;
}

/* ─── Scroll-reveal wrapper ─── */
function FadeIn({
    children, delay = 0, className = "", from = "bottom",
}: {
    children: React.ReactNode; delay?: number; className?: string;
    from?: "bottom" | "left" | "right" | "none";
}) {
    const ref = useRef<HTMLDivElement>(null);
    const inView = useInView(ref, { once: true, margin: "-60px" });
    const init =
        from === "left" ? { opacity: 0, x: -32 } :
        from === "right" ? { opacity: 0, x: 32 } :
        from === "none" ? { opacity: 0 } :
        { opacity: 0, y: 28 };
    return (
        <motion.div ref={ref}
            initial={init}
            animate={inView ? { opacity: 1, x: 0, y: 0 } : {}}
            transition={{ duration: 0.65, delay, ease: [0.16, 1, 0.3, 1] }}
            className={className}>
            {children}
        </motion.div>
    );
}

/* ─── Staggered headline words ─── */
const headlineVariants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: 0.13, delayChildren: 0.55 } },
};
const wordVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.7 } },
};

/* ─── XP bar (mount-animates) ─── */
function XPBar({ pct, color }: { pct: number; color: string }) {
    return (
        <div className="h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
            <motion.div className="h-full rounded-full" style={{ background: color }}
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 1.4, delay: 0.9, ease: "easeOut" }} />
        </div>
    );
}

/* ─── Animated duel score ─── */
function DuelScore({ value }: { value: number }) {
    return (
        <AnimatePresence mode="wait">
            <motion.span key={value}
                initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
                transition={{ duration: 0.3 }}
                className="text-3xl font-black text-white tabular-nums">
                {value}
            </motion.span>
        </AnimatePresence>
    );
}

/* ─── Static data ─── */
const FEATURES = [
    {
        icon: Swords, title: "Arena de Duelos", tag: "PvP em tempo real",
        desc: "Enfrente outros candidatos em questões cronometradas. Quem acerta mais, domina o ranking.",
        accent: "#6366F1",
    },
    {
        icon: Zap, title: "XP & Progressão", tag: "Gamificação real",
        desc: "Cada questão, simulado e duelo vencido vira XP. Suba de nível, desbloqueie conquistas únicas.",
        accent: "#F59E0B",
    },
    {
        icon: Brain, title: "IA nas Redações", tag: "IA com propósito",
        desc: "Correção estruturada por IA: competências da banca, pontos fortes e o que exatamente melhorar.",
        accent: "#10B981",
    },
    {
        icon: Trophy, title: "Ranking Nacional", tag: "Competição saudável",
        desc: "Veja sua posição entre candidatos do mesmo concurso e trace estratégia para subir.",
        accent: "#8B5CF6",
    },
];

const STEPS = [
    { icon: GraduationCap, num: "01", title: "Escolha seu concurso", desc: "Todo o conteúdo adaptado ao seu edital: questões, simulados e ranking.", color: "#6366F1" },
    { icon: Swords, num: "02", title: "Estude competindo", desc: "Arena de duelos, XP e streak diário. Estudar nunca foi tão viciante.", color: "#F59E0B" },
    { icon: TrendingUp, num: "03", title: "Monitore e vença", desc: "Veja seu desempenho por disciplina, posição no ranking e o que ainda falta dominar.", color: "#10B981" },
];

const AI_POINTS = [
    { title: "Não é chatbot genérico", desc: "Treinada para entender os critérios específicos de cada banca — o que o Cespe quer e o que o FCC penaliza." },
    { title: "Feedback acionável", desc: "Nota por competência, trechos destacados e sugestões concretas. Não frases vagas." },
    { title: "No seu ritmo", desc: "Resultado em segundos. Corrija, reescreva e envie novamente quantas vezes quiser." },
];

const BADGES = [
    { emoji: "🔥", label: "Sequência 10", color: "#F59E0B" },
    { emoji: "🎯", label: "Sniper", color: "#10B981" },
    { emoji: "⚡", label: "Veloz", color: "#6366F1" },
    { emoji: "🏆", label: "Top 3", color: "#8B5CF6" },
];

/* ═══════════════════════════════════════════════════════════ */

export default function Hero() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [duelTick, setDuelTick] = useState(0);
    const [showAchievement, setShowAchievement] = useState(false);

    useEffect(() => {
        const api = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";
        fetch(`${api}/public/courses`)
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => setCourses(Array.isArray(d) ? d : []))
            .catch(() => setCourses([]))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        const t = setInterval(() => setDuelTick((n) => (n + 1) % 3), 3000);
        return () => clearInterval(t);
    }, []);

    useEffect(() => {
        const t = setTimeout(() => setShowAchievement(true), 2200);
        const t2 = setTimeout(() => setShowAchievement(false), 5200);
        return () => { clearTimeout(t); clearTimeout(t2); };
    }, []);

    const duelScores = [{ you: 7, opp: 5 }, { you: 4, opp: 4 }, { you: 9, opp: 6 }];
    const { you, opp } = duelScores[duelTick];

    return (
        <div className="relative bg-[#020617] overflow-x-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-100">

            {/* ══════════════════════════════════
                HERO
            ══════════════════════════════════ */}
            <section className="relative min-h-screen flex items-center pt-24 pb-20 overflow-hidden">

                {/* ── Aurora background ── */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="aurora-orb aurora-1" />
                    <div className="aurora-orb aurora-2" />
                    <div className="aurora-orb aurora-3" />
                </div>

                {/* ── Grid overlay ── */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(to right,rgba(99,102,241,0.04) 1px,transparent 1px)",
                    backgroundSize: "60px 60px",
                }} />

                {/* ── Vignette ── */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    background: "radial-gradient(ellipse 80% 60% at 50% 100%,rgba(2,6,23,0.8) 0%,transparent 70%)",
                }} />

                <div className="relative container mx-auto px-6 z-10 max-w-7xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20 items-center">

                        {/* ── Left: copy ── */}
                        <div>
                            {/* Brand mark */}
                            <motion.div
                                initial={{ opacity: 0, y: -16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                                className="flex items-center gap-4 mb-10"
                            >
                                <span
                                    className="text-2xl sm:text-3xl font-black tracking-tight text-white"
                                    style={{ fontFamily: "var(--font-orbitron)", letterSpacing: "-0.02em" }}
                                >
                                    AXON
                                </span>
                                <div className="w-px h-7 rounded-full" style={{ background: "linear-gradient(to bottom, transparent, rgba(255,255,255,0.3), transparent)" }} />
                                <span className="text-[11px] font-bold tracking-[0.45em] uppercase text-white/40">
                                    Academy
                                </span>
                            </motion.div>

                            {/* Eyebrow pill */}
                            <motion.div
                                initial={{ opacity: 0, x: -16 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
                                style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.25)", color: "#A5B4FC" }}
                            >
                                <Sparkles size={11} />
                                Acesso Antecipado — Seja dos Primeiros
                            </motion.div>

                            {/* Animated headline */}
                            <motion.h1
                                variants={headlineVariants}
                                initial="hidden"
                                animate="show"
                                className="text-5xl sm:text-6xl md:text-[68px] font-extrabold leading-[1.06] tracking-tight mb-6"
                            >
                                {["Estude.", "Compita."].map((w, i) => (
                                    <motion.span key={w} variants={wordVariants}
                                        className="inline-block mr-3 text-white">
                                        {w}
                                    </motion.span>
                                ))}
                                <br />
                                <motion.span variants={wordVariants}
                                    className="inline-block"
                                    style={{
                                        backgroundImage: "linear-gradient(135deg,#818CF8 0%,#6366F1 45%,#A78BFA 100%)",
                                        WebkitBackgroundClip: "text",
                                        WebkitTextFillColor: "transparent",
                                        backgroundClip: "text",
                                    }}>
                                    Seja aprovado.
                                </motion.span>
                            </motion.h1>

                            {/* Sub */}
                            <motion.p
                                initial={{ opacity: 0, y: 16 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.65, delay: 0.95 }}
                                className="text-lg md:text-xl leading-relaxed font-medium max-w-lg mb-10"
                                style={{ color: "#94A3B8" }}
                            >
                                Uma plataforma nova que une preparação séria para concursos com a dinâmica de um jogo competitivo. XP, duelos, ranking — e IA onde ela realmente faz diferença.
                            </motion.p>

                            {/* CTAs */}
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.55, delay: 1.05 }}
                                className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-10"
                            >
                                <Link href="/register">
                                    <button
                                        className="group flex items-center justify-center gap-2.5 px-8 h-14 rounded-2xl text-[15px] font-bold text-white transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
                                        style={{
                                            background: "linear-gradient(135deg,#6366F1 0%,#4F46E5 100%)",
                                            boxShadow: "0 8px 32px -4px rgba(99,102,241,0.5), inset 0 1px 0 rgba(255,255,255,0.15)",
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
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.10)",
                                            color: "#CBD5E1",
                                        }}
                                    >
                                        Ver cursos e planos
                                    </button>
                                </Link>
                            </motion.div>

                            {/* Trust signals */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 1.2 }}
                                className="flex flex-wrap items-center gap-5 text-sm font-medium"
                                style={{ color: "#475569" }}
                            >
                                {[
                                    { icon: Shield, text: "7 dias de garantia" },
                                    { icon: Zap, text: "Plataforma em crescimento" },
                                    { icon: Star, text: "Metodologia inovadora" },
                                ].map(({ icon: Icon, text }) => (
                                    <div key={text} className="flex items-center gap-1.5">
                                        <Icon size={13} className="text-indigo-400 shrink-0" />
                                        {text}
                                    </div>
                                ))}
                            </motion.div>
                        </div>

                        {/* ── Right: game mockup ── */}
                        <div className="hidden lg:flex justify-center items-center relative">

                            {/* Achievement toast */}
                            <AnimatePresence>
                                {showAchievement && (
                                    <motion.div
                                        initial={{ opacity: 0, x: 40, y: 0 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 40 }}
                                        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                        className="absolute -right-4 top-8 z-20 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-2xl"
                                        style={{
                                            background: "rgba(15,23,42,0.95)",
                                            borderColor: "rgba(245,158,11,0.3)",
                                            backdropFilter: "blur(20px)",
                                            boxShadow: "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(245,158,11,0.1)",
                                        }}
                                    >
                                        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl shrink-0"
                                            style={{ background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.25)" }}>
                                            🏆
                                        </div>
                                        <div>
                                            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#F59E0B" }}>
                                                Conquista desbloqueada
                                            </div>
                                            <div className="text-sm font-bold text-white">Top 10 Semanal</div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* XP gain float */}
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5 }}
                                className="absolute -left-6 bottom-16 z-20 flex items-center gap-2 px-3.5 py-2 rounded-xl border"
                                style={{
                                    background: "rgba(99,102,241,0.12)",
                                    borderColor: "rgba(99,102,241,0.25)",
                                    backdropFilter: "blur(12px)",
                                }}
                            >
                                <Zap size={13} className="text-indigo-400" />
                                <span className="text-xs font-bold text-indigo-300">+120 XP</span>
                            </motion.div>

                            {/* Card */}
                            <motion.div
                                initial={{ opacity: 0, y: 40, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                                className="relative w-full max-w-[340px] mockup-float"
                            >
                                <div className="rounded-[2rem] overflow-hidden border"
                                    style={{
                                        background: "rgba(9,16,36,0.92)",
                                        borderColor: "rgba(99,102,241,0.2)",
                                        backdropFilter: "blur(24px)",
                                        boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.08), inset 0 1px 0 rgba(255,255,255,0.04)",
                                    }}
                                >
                                    {/* Header */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b"
                                        style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.25)" }}>
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs text-white"
                                                style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", fontFamily: "var(--font-orbitron)", fontSize: 10 }}>
                                                AX
                                            </div>
                                            <span className="text-sm font-bold text-white/70"
                                                style={{ fontFamily: "var(--font-orbitron)", fontSize: 11, letterSpacing: "0.05em" }}>
                                                AXON
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border"
                                            style={{ background: "rgba(245,158,11,0.1)", borderColor: "rgba(245,158,11,0.2)" }}>
                                            <Zap size={10} className="text-amber-400" />
                                            <span className="text-[11px] font-bold text-amber-300">2.840 XP</span>
                                        </div>
                                    </div>

                                    <div className="p-5 space-y-4">
                                        {/* Profile + XP */}
                                        <div className="flex items-center gap-3">
                                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-xs shrink-0"
                                                style={{ background: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                                                MF
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1.5">
                                                    <span className="text-[13px] font-bold text-white">Mariana Fonseca</span>
                                                    <span className="text-[9px] font-black px-2 py-0.5 rounded-full"
                                                        style={{ background: "rgba(99,102,241,0.2)", color: "#A5B4FC" }}>
                                                        Nível 7
                                                    </span>
                                                </div>
                                                <XPBar pct={71} color="linear-gradient(to right,#6366F1,#8B5CF6)" />
                                                <div className="flex justify-between text-[10px] font-medium mt-1" style={{ color: "#475569" }}>
                                                    <span>2.840</span><span>4.000 XP</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Arena duel */}
                                        <div className="rounded-2xl p-4 border relative overflow-hidden"
                                            style={{ background: "rgba(99,102,241,0.07)", borderColor: "rgba(99,102,241,0.18)" }}>
                                            <div className="absolute inset-0 pointer-events-none"
                                                style={{ background: "radial-gradient(ellipse 80% 80% at 50% -20%,rgba(99,102,241,0.08) 0%,transparent 70%)" }} />
                                            <div className="flex items-center gap-1.5 mb-3">
                                                <Swords size={12} className="text-indigo-400" />
                                                <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                    Arena Ativa
                                                </span>
                                                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="text-center">
                                                    <DuelScore value={you} />
                                                    <div className="text-[10px] text-indigo-300 font-semibold mt-0.5">Você</div>
                                                </div>
                                                <div className="text-xs font-black px-3 py-1.5 rounded-xl"
                                                    style={{ background: "rgba(99,102,241,0.15)", color: "#818CF8" }}>
                                                    VS
                                                </div>
                                                <div className="text-center">
                                                    <DuelScore value={opp} />
                                                    <div className="text-[10px] font-semibold mt-0.5" style={{ color: "#475569" }}>Rival</div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Streak + Badges */}
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shrink-0"
                                                style={{ background: "rgba(245,158,11,0.08)", borderColor: "rgba(245,158,11,0.18)" }}>
                                                <Flame size={12} className="text-amber-400" />
                                                <span className="text-xs font-black text-amber-300">12 dias</span>
                                            </div>
                                            <div className="flex gap-1.5">
                                                {BADGES.map((b) => (
                                                    <div key={b.label} title={b.label}
                                                        className="w-9 h-9 rounded-xl flex items-center justify-center text-sm cursor-default"
                                                        style={{ background: `${b.color}18`, border: `1px solid ${b.color}28` }}>
                                                        {b.emoji}
                                                    </div>
                                                ))}
                                                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                                                    style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                                                    <Lock size={11} style={{ color: "#334155" }} />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Ranking */}
                                        <div className="flex items-center justify-between rounded-2xl px-4 py-3 border"
                                            style={{ background: "rgba(245,158,11,0.06)", borderColor: "rgba(245,158,11,0.14)" }}>
                                            <div className="flex items-center gap-2">
                                                <Trophy size={13} className="text-amber-400" />
                                                <span className="text-xs font-bold text-amber-300">Ranking Semanal</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <TrendingUp size={11} className="text-emerald-400" />
                                                <span className="text-sm font-black text-amber-400">#12</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                DIFERENCIAIS
            ══════════════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border text-indigo-700 bg-indigo-50 border-indigo-100">
                            Nossa proposta
                        </div>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
                            Estudar ficou{" "}
                            <span className="text-transparent bg-clip-text" style={{ backgroundImage: "linear-gradient(135deg,#6366F1,#8B5CF6)" }}>
                                diferente
                            </span>
                        </h2>
                        <p className="text-slate-500 text-lg max-w-xl mx-auto leading-relaxed">
                            Não somos mais uma plataforma de questões. Transformamos preparação séria para concursos em uma experiência competitiva e evolutiva.
                        </p>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-5xl mx-auto">
                        {FEATURES.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <FadeIn key={f.title} delay={i * 0.08}>
                                    <div className="group relative rounded-3xl border p-8 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
                                        style={{
                                            background: "#09101E",
                                            borderColor: `${f.accent}22`,
                                            boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
                                        }}>
                                        {/* glow */}
                                        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full blur-[70px] opacity-15 transition-opacity duration-300 group-hover:opacity-30 pointer-events-none"
                                            style={{ background: f.accent }} />
                                        {/* border glow on hover */}
                                        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                                            style={{ boxShadow: `inset 0 0 0 1px ${f.accent}35` }} />

                                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
                                            style={{ background: `${f.accent}18`, border: `1px solid ${f.accent}28` }}>
                                            <Icon size={22} style={{ color: f.accent }} />
                                        </div>
                                        <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full inline-block mb-3"
                                            style={{ background: `${f.accent}15`, color: f.accent }}>
                                            {f.tag}
                                        </span>
                                        <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                                        <p className="text-[14px] leading-relaxed" style={{ color: "#64748B" }}>{f.desc}</p>
                                    </div>
                                </FadeIn>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                CURSOS (API)
            ══════════════════════════════════ */}
            <section className="py-24" style={{ background: "#F8FAFC" }}>
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">
                            Cursos disponíveis
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
                            Escolha sua arena
                        </h2>
                        <p className="text-slate-500 text-lg max-w-md mx-auto">
                            Cada curso tem ranking próprio, trilha de questões e simulados. Escolha e comece a competir.
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
                            <p className="text-slate-500 text-sm mb-5">Estamos montando as primeiras arenas. Crie sua conta para ser avisado.</p>
                            <Link href="/register" className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors">
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
                                            <div className="relative h-full bg-white rounded-3xl border border-slate-100/80 p-7 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 overflow-hidden">
                                                <div className="absolute top-0 left-6 right-6 h-[3px] rounded-b-full opacity-70" style={{ background: accent }} />
                                                <div className="absolute top-0 left-6 right-6 h-8 rounded-b-full blur-xl opacity-10" style={{ background: accent }} />
                                                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300"
                                                    style={{ background: `${accent}12`, border: `1px solid ${accent}20` }}>
                                                    <GraduationCap size={26} style={{ color: accent }} />
                                                </div>
                                                <h3 className="text-xl font-bold text-slate-900 mb-2.5 leading-snug">{course.title}</h3>
                                                {course.description && (
                                                    <p className="text-sm text-slate-500 leading-relaxed mb-5 line-clamp-2">{course.description}</p>
                                                )}
                                                <div className="flex items-center gap-1.5 text-sm font-bold" style={{ color: accent }}>
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

            {/* ══════════════════════════════════
                IA NAS REDAÇÕES
            ══════════════════════════════════ */}
            <section className="py-24 relative overflow-hidden" style={{ background: "#020617" }}>
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(255,255,255,0.02) 1px,transparent 1px),linear-gradient(to right,rgba(255,255,255,0.02) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />
                <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[160px] opacity-8 pointer-events-none" style={{ background: "#10B981" }} />

                <div className="relative container mx-auto px-6 max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <FadeIn from="left">
                            <div className="inline-flex items-center gap-2 mb-5 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
                                style={{ background: "rgba(16,185,129,0.1)", borderColor: "rgba(16,185,129,0.22)", color: "#6EE7B7" }}>
                                <Brain size={12} />
                                IA com propósito real
                            </div>
                            <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                                Correção de redação<br />
                                <span style={{ color: "#10B981" }}>que realmente ensina</span>
                            </h2>
                            <p className="text-lg leading-relaxed mb-8" style={{ color: "#94A3B8" }}>
                                Muita plataforma usa IA como enfeite. Aqui ela está onde faz sentido: na correção de redações. Feedback estruturado por competência, sem esperar dias.
                            </p>
                            <div className="space-y-5">
                                {AI_POINTS.map((p, i) => (
                                    <FadeIn key={p.title} delay={0.1 + i * 0.07} from="left">
                                        <div className="flex gap-4">
                                            <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
                                            <div>
                                                <div className="text-white font-bold mb-1">{p.title}</div>
                                                <div className="text-sm leading-relaxed" style={{ color: "#64748B" }}>{p.desc}</div>
                                            </div>
                                        </div>
                                    </FadeIn>
                                ))}
                            </div>
                        </FadeIn>

                        <FadeIn from="right" delay={0.1}>
                            <div className="rounded-3xl border overflow-hidden"
                                style={{
                                    background: "rgba(9,16,36,0.9)",
                                    borderColor: "rgba(16,185,129,0.18)",
                                    boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(16,185,129,0.06)",
                                    backdropFilter: "blur(16px)",
                                }}>
                                <div className="px-6 py-4 border-b flex items-center gap-2"
                                    style={{ borderColor: "rgba(255,255,255,0.05)", background: "rgba(0,0,0,0.2)" }}>
                                    <Brain size={15} className="text-emerald-400" />
                                    <span className="text-sm font-bold text-white/70">Resultado da Correção</span>
                                    <div className="ml-auto px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                                        style={{ background: "rgba(16,185,129,0.15)", color: "#6EE7B7" }}>
                                        Concluído
                                    </div>
                                </div>
                                <div className="p-6 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-semibold" style={{ color: "#475569" }}>Nota geral</span>
                                        <span className="text-3xl font-black text-white">760<span className="text-lg text-emerald-400 font-bold">/1000</span></span>
                                    </div>
                                    {[
                                        { label: "C-I · Domínio da norma culta", score: 160, max: 200, color: "#10B981" },
                                        { label: "C-II · Compreensão do tema", score: 160, max: 200, color: "#6366F1" },
                                        { label: "C-III · Argumentação", score: 140, max: 200, color: "#F59E0B" },
                                        { label: "C-IV · Coesão textual", score: 160, max: 200, color: "#8B5CF6" },
                                        { label: "C-V · Proposta de intervenção", score: 140, max: 200, color: "#EC4899" },
                                    ].map((c, ci) => (
                                        <div key={c.label}>
                                            <div className="flex justify-between text-[11px] font-semibold mb-1.5" style={{ color: "#64748B" }}>
                                                <span>{c.label}</span>
                                                <span style={{ color: c.color }}>{c.score}/{c.max}</span>
                                            </div>
                                            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                                                <motion.div className="h-full rounded-full" style={{ background: c.color }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(c.score / c.max) * 100}%` }}
                                                    transition={{ duration: 1, delay: 0.4 + ci * 0.1, ease: "easeOut" }} />
                                            </div>
                                        </div>
                                    ))}
                                    <div className="rounded-2xl p-4 border text-sm leading-relaxed"
                                        style={{ background: "rgba(16,185,129,0.06)", borderColor: "rgba(16,185,129,0.14)", color: "#94A3B8" }}>
                                        <span className="text-emerald-400 font-bold">Melhoria sugerida: </span>
                                        Sua proposta menciona o agente, mas não especifica a ação nem o meio. Adicione essas informações para atingir a nota máxima na C-V.
                                    </div>
                                </div>
                            </div>
                        </FadeIn>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════
                COMO FUNCIONA
            ══════════════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <FadeIn className="text-center mb-14">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">Como funciona</span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-5 tracking-tight">
                            Simples de entrar,<br className="hidden sm:block" /> impossível de largar
                        </h2>
                    </FadeIn>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto relative">
                        <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px pointer-events-none"
                            style={{ background: "linear-gradient(to right,transparent,rgba(99,102,241,0.3),transparent)" }} />
                        {STEPS.map((step, i) => {
                            const Icon = step.icon;
                            return (
                                <FadeIn key={step.num} delay={i * 0.1} className="text-center group">
                                    <div className="relative w-20 h-20 mx-auto mb-6">
                                        <div className="w-full h-full rounded-3xl flex items-center justify-center transition-transform duration-300 group-hover:scale-105"
                                            style={{ background: `${step.color}10`, border: `1px solid ${step.color}22` }}>
                                            <Icon size={28} style={{ color: step.color }} />
                                        </div>
                                        <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-lg"
                                            style={{ background: step.color }}>
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

            {/* ══════════════════════════════════
                EARLY ACCESS CTA  (AXON em destaque)
            ══════════════════════════════════ */}
            <section className="py-32 relative overflow-hidden" style={{ background: "#020617" }}>
                {/* Aurora */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] rounded-full blur-[120px] opacity-12"
                        style={{ background: "radial-gradient(ellipse,#6366F1 0%,transparent 70%)" }} />
                </div>

                {/* AXON watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span className="text-[180px] sm:text-[240px] md:text-[320px] font-black text-white/[0.018] leading-none tracking-tight"
                        style={{ fontFamily: "var(--font-orbitron)" }}>
                        AXON
                    </span>
                </div>

                <div className="relative container mx-auto px-6 text-center max-w-3xl z-10">
                    <FadeIn>
                        {/* Brand mark */}
                        <div className="flex items-center justify-center gap-4 mb-10">
                            <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                                style={{
                                    background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                                    boxShadow: "0 8px 32px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.2)",
                                }}>
                                <GraduationCap size={28} className="text-white" />
                            </div>
                            <div className="text-left">
                                <div className="text-2xl font-black text-white leading-none"
                                    style={{ fontFamily: "var(--font-orbitron)", letterSpacing: "-0.02em" }}>
                                    AXON
                                </div>
                                <div className="text-[10px] font-bold tracking-[0.4em] uppercase mt-0.5" style={{ color: "#475569" }}>
                                    Academy
                                </div>
                            </div>
                        </div>

                        <div className="inline-flex items-center gap-2 mb-7 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border"
                            style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.22)", color: "#A5B4FC" }}>
                            <Sparkles size={11} />
                            Somos novos — e isso é uma vantagem
                        </div>

                        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 tracking-tight leading-tight">
                            Seja dos primeiros.<br />
                            <span className="text-transparent bg-clip-text"
                                style={{ backgroundImage: "linear-gradient(135deg,#818CF8,#A78BFA)" }}>
                                Molde a plataforma.
                            </span>
                        </h2>

                        <p className="text-lg md:text-xl mb-4 max-w-xl mx-auto leading-relaxed" style={{ color: "#94A3B8" }}>
                            Estamos no começo — e quem entra agora ajuda a definir o que o AXON Academy vai se tornar. Acesso antecipado, preço de fundador e contato direto com a equipe.
                        </p>
                        <p className="text-sm font-medium mb-12" style={{ color: "#334155" }}>
                            Sem enrolação. Sem números inflados. Só uma plataforma honesta que quer ser a melhor.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
                            <Link href="/register">
                                <button className="group flex items-center justify-center gap-2.5 px-10 h-[60px] rounded-2xl text-[16px] font-bold text-white transition-all duration-200 hover:-translate-y-1 w-full sm:w-auto"
                                    style={{
                                        background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                                        boxShadow: "0 12px 40px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15)",
                                    }}>
                                    Criar conta gratuita
                                    <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="flex items-center justify-center gap-2 px-10 h-[60px] rounded-2xl text-[16px] font-bold transition-all duration-200 hover:-translate-y-0.5 w-full sm:w-auto"
                                    style={{
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.09)",
                                        color: "#CBD5E1",
                                    }}>
                                    Ver planos e preços
                                </button>
                            </Link>
                        </div>

                        <p className="text-sm font-medium" style={{ color: "#1E293B" }}>
                            7 dias de garantia · Sem cartão de crédito para testar · Cancele quando quiser
                        </p>
                    </FadeIn>
                </div>
            </section>

            {/* ══════════════════════════════════
                FOOTER
            ══════════════════════════════════ */}
            <footer className="py-12 border-t" style={{ background: "#020617", borderColor: "rgba(255,255,255,0.05)" }}>
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
                        <BrandLogo size="sm" variant="light" link={false} />
                        <p className="text-sm" style={{ color: "#1E293B" }}>
                            © 2026 Axon Academy · Concursos com gamificação de verdade.
                        </p>
                        <div className="flex gap-6">
                            {[{ href: "/termos", label: "Termos" }, { href: "/privacidade", label: "Privacidade" }].map((l) => (
                                <Link key={l.href} href={l.href}
                                    className="text-sm font-medium transition-colors hover:text-white"
                                    style={{ color: "#334155" }}>
                                    {l.label}
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            {/* ─── Global keyframes ─── */}
            <style jsx global>{`
        @keyframes aurora-move-1 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.18; }
          50%      { transform: translate(60px,-40px) scale(1.15); opacity:0.28; }
        }
        @keyframes aurora-move-2 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.12; }
          33%      { transform: translate(-50px,60px) scale(1.2); opacity:0.22; }
          66%      { transform: translate(40px,-20px) scale(0.9); opacity:0.14; }
        }
        @keyframes aurora-move-3 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.10; }
          50%      { transform: translate(-30px,-50px) scale(1.1); opacity:0.18; }
        }
        @keyframes mockup-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-14px); }
        }
        .aurora-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(120px);
          pointer-events: none;
        }
        .aurora-1 {
          width: 700px; height: 600px;
          top: -100px; left: 50%;
          transform: translateX(-30%);
          background: radial-gradient(circle, #6366F1 0%, transparent 70%);
          animation: aurora-move-1 12s ease-in-out infinite;
        }
        .aurora-2 {
          width: 500px; height: 400px;
          top: 30%; right: -100px;
          background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);
          animation: aurora-move-2 16s ease-in-out infinite;
        }
        .aurora-3 {
          width: 400px; height: 350px;
          bottom: 5%; left: -80px;
          background: radial-gradient(circle, #F59E0B 0%, transparent 70%);
          animation: aurora-move-3 14s ease-in-out infinite;
        }
        .mockup-float {
          animation: mockup-float 7s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
