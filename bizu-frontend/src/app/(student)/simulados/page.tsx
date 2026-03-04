"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText, CheckCircle2, PlayCircle, Clock, Trophy,
    Lock, BookOpen, AlertTriangle, XCircle, Timer,
    CalendarDays, ChevronRight, Sparkles, Target, Ban
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

type Availability = "DISPONIVEL" | "EM_BREVE" | "REALIZADO" | "EXPIRADO" | "SEM_DATA";
type SessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "EXPIRED" | null;

interface SimuladoItem {
    id: string;
    title: string;
    description: string;
    startDate: string | null;
    endDate: string | null;
    durationMinutes: number | null;
    questionCount: number;
    courseTitle: string;
    courseThemeColor: string | null;
    courseTextColor: string | null;
    sessionStatus: SessionStatus;
    sessionScore: number | null;
    sessionTotalQuestions: number | null;
    availability: Availability;
}

const availabilityConfig = {
    DISPONIVEL: {
        label: "Disponível",
        color: "text-emerald-600",
        bg: "bg-emerald-50 dark:bg-emerald-950/40",
        border: "border-emerald-200 dark:border-emerald-800",
        dot: "bg-emerald-500",
    },
    EM_BREVE: {
        label: "Em breve",
        color: "text-amber-600",
        bg: "bg-amber-50 dark:bg-amber-950/40",
        border: "border-amber-200 dark:border-amber-800",
        dot: "bg-amber-500",
    },
    REALIZADO: {
        label: "Realizado",
        color: "text-primary",
        bg: "bg-primary/5",
        border: "border-primary/20",
        dot: "bg-primary",
    },
    EXPIRADO: {
        label: "Expirado",
        color: "text-slate-500",
        bg: "bg-slate-100 dark:bg-slate-800/40",
        border: "border-slate-200 dark:border-slate-700",
        dot: "bg-slate-400",
    },
    SEM_DATA: {
        label: "Indisponível",
        color: "text-slate-400",
        bg: "bg-slate-50 dark:bg-slate-900/40",
        border: "border-slate-200 dark:border-slate-800",
        dot: "bg-slate-300",
    },
};

const sessionConfig: Record<string, { label: string; icon: any; color: string }> = {
    COMPLETED: { label: "Concluído", icon: CheckCircle2, color: "text-emerald-600" },
    CANCELLED: { label: "Cancelado", icon: Ban, color: "text-red-500" },
    EXPIRED: { label: "Tempo esgotado", icon: Timer, color: "text-amber-600" },
    IN_PROGRESS: { label: "Em andamento", icon: PlayCircle, color: "text-primary" },
};

function formatDuration(minutes: number | null) {
    if (!minutes) return null;
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h === 0) return `${m}min`;
    if (m === 0) return `${h}h`;
    return `${h}h ${m}min`;
}

function formatDateRange(start: string | null, end: string | null) {
    if (!start || !end) return null;
    const s = new Date(start).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
    const e = new Date(end).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
    return `${s} – ${e}`;
}

function ScoreBar({ score, total }: { score: number; total: number }) {
    const pct = total > 0 ? Math.round((score / total) * 100) : 0;
    const color = pct >= 70 ? "bg-emerald-500" : pct >= 50 ? "bg-amber-500" : "bg-red-500";
    return (
        <div className="flex items-center gap-3 w-full max-w-[200px]">
            <div className="flex-1 h-1.5 bg-muted/50 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                    className={`h-full rounded-full ${color}`}
                />
            </div>
            <span className={`text-xs font-black tabular-nums ${pct >= 70 ? "text-emerald-600" : pct >= 50 ? "text-amber-600" : "text-red-500"}`}>
                {pct}%
            </span>
        </div>
    );
}

function SimuladoCard({ sim, idx }: { sim: SimuladoItem; idx: number }) {
    const avConfig = availabilityConfig[sim.availability];
    const dateRange = formatDateRange(sim.startDate, sim.endDate);
    const duration = formatDuration(sim.durationMinutes);
    const isDisponivel = sim.availability === "DISPONIVEL";
    const isRealizado = sim.availability === "REALIZADO";
    const isEmBreve = sim.availability === "EM_BREVE";
    const sessConf = sim.sessionStatus ? sessionConfig[sim.sessionStatus] : null;
    const scorePercent = sim.sessionScore != null && sim.sessionTotalQuestions
        ? Math.round((sim.sessionScore / sim.sessionTotalQuestions) * 100) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`group relative bg-card/60 backdrop-blur-sm border rounded-[1.75rem] p-5 md:p-6 transition-all duration-300 ${
                isDisponivel
                    ? "border-primary/20 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/8 hover:-translate-y-0.5"
                    : isRealizado
                        ? "border-border/40 hover:border-border/70"
                        : "border-border/30 opacity-70"
            }`}
        >
            {/* Left accent line for available */}
            {isDisponivel && (
                <div className="absolute left-0 top-6 bottom-6 w-1 bg-gradient-to-b from-primary/60 to-primary/20 rounded-r-full" />
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                {/* Course color badge + info */}
                <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Availability pill */}
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${avConfig.bg} ${avConfig.color} ${avConfig.border}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${avConfig.dot}`} />
                            {avConfig.label}
                        </span>

                        {/* Session status if already done */}
                        {sessConf && (
                            <span className={`inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-muted/50 border border-border/50 ${sessConf.color}`}>
                                <sessConf.icon size={11} />
                                {sessConf.label}
                            </span>
                        )}

                        {/* Course badge */}
                        <span
                            className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full"
                            style={{
                                background: sim.courseThemeColor ? `${sim.courseThemeColor}20` : undefined,
                                color: sim.courseThemeColor || undefined,
                                border: `1px solid ${sim.courseThemeColor ? `${sim.courseThemeColor}40` : "transparent"}`,
                            }}
                        >
                            {sim.courseTitle}
                        </span>
                    </div>

                    <h3 className={`text-base md:text-lg font-black mb-1 transition-colors ${
                        isDisponivel ? "text-foreground group-hover:text-primary" : "text-foreground/70"
                    }`}>
                        {sim.title}
                    </h3>

                    {sim.description && (
                        <p className="text-xs text-muted-foreground font-medium mb-3 line-clamp-1">
                            {sim.description}
                        </p>
                    )}

                    {/* Meta row */}
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                            <BookOpen size={13} className="text-primary/40" />
                            {sim.questionCount} questões
                        </div>
                        {duration && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                                <Clock size={13} className="text-primary/40" />
                                {duration}
                            </div>
                        )}
                        {dateRange && (
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground">
                                <CalendarDays size={13} className="text-primary/40" />
                                {dateRange}
                            </div>
                        )}
                    </div>

                    {/* Score bar if completed */}
                    {isRealizado && sim.sessionScore != null && sim.sessionTotalQuestions && (
                        <div className="mt-3 flex items-center gap-3">
                            <span className="text-[11px] font-bold text-muted-foreground">
                                {sim.sessionScore}/{sim.sessionTotalQuestions} acertos
                            </span>
                            <ScoreBar score={sim.sessionScore} total={sim.sessionTotalQuestions} />
                        </div>
                    )}
                </div>

                {/* Action area */}
                <div className="shrink-0 flex flex-col items-start sm:items-end gap-2">
                    {isDisponivel && (
                        <Link href={`/simulados/${sim.id}`}>
                            <Button className="rounded-2xl h-12 px-7 font-black text-xs uppercase tracking-widest gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105 transition-all">
                                <PlayCircle size={16} />
                                Iniciar Prova
                            </Button>
                        </Link>
                    )}
                    {isRealizado && (
                        <Link href={`/simulados/${sim.id}/resultado`}>
                            <Button variant="outline" className="rounded-2xl h-11 px-6 font-black text-xs uppercase tracking-widest gap-2 border-border/60 hover:border-primary/40 hover:text-primary transition-all">
                                Ver resultado
                                <ChevronRight size={14} />
                            </Button>
                        </Link>
                    )}
                    {isEmBreve && (
                        <div className="flex items-center gap-2 bg-muted/40 px-5 py-2.5 rounded-2xl border border-border/40">
                            <Lock size={14} className="text-muted-foreground" />
                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Em breve</span>
                        </div>
                    )}
                    {(sim.availability === "EXPIRADO" || sim.availability === "SEM_DATA") && !isRealizado && (
                        <div className="flex items-center gap-2 bg-muted/30 px-5 py-2.5 rounded-2xl border border-border/30">
                            <AlertTriangle size={14} className="text-muted-foreground/50" />
                            <span className="text-[11px] font-black text-muted-foreground/50 uppercase tracking-widest">
                                {sim.availability === "EXPIRADO" ? "Encerrado" : "Indisponível"}
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}

type Tab = "proximos" | "realizados";

export default function SimuladosPage() {
    const { isFree } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("proximos");
    const [simulados, setSimulados] = useState<SimuladoItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetch = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch("/simulados/disponiveis");
                if (res.ok) setSimulados(await res.json());
            } catch (e) {
                console.error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetch();
    }, []);

    if (isFree) {
        return (
            <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Simulados Premium"
                    description="O acesso aos simulados de concurso é exclusivo para assinantes. Aperfeiçoe seus estudos e ganhe vantagem na aprovação!"
                />
            </div>
        );
    }

    const available = simulados.filter(s => s.availability === "DISPONIVEL");
    const upcoming = simulados.filter(s => s.availability === "EM_BREVE");
    const realized = simulados.filter(s => s.availability === "REALIZADO");
    const expired = simulados.filter(s => s.availability === "EXPIRADO" || s.availability === "SEM_DATA");

    // Stats
    const completed = realized.filter(s => s.sessionStatus === "COMPLETED");
    const avgPct = completed.length > 0
        ? Math.round(completed.reduce((acc, s) => {
            const p = s.sessionScore != null && s.sessionTotalQuestions
                ? (s.sessionScore / s.sessionTotalQuestions) * 100 : 0;
            return acc + p;
        }, 0) / completed.length)
        : 0;

    const currentList = activeTab === "proximos"
        ? [...available, ...upcoming, ...expired]
        : realized;

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">

                {/* Header */}
                <div className="mb-10">
                    <PageHeader
                        title="Simulados de Concurso"
                        description="Prove o seu conhecimento. Cada simulado conta para o ranking."
                    />
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-3 gap-3 mb-10">
                    {[
                        { label: "Realizados", val: String(completed.length), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/8" },
                        { label: "Média geral", val: `${avgPct}%`, icon: Target, color: "text-primary", bg: "bg-primary/8" },
                        { label: "Disponíveis", val: String(available.length), icon: PlayCircle, color: "text-amber-500", bg: "bg-amber-500/8" },
                    ].map((s, i) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                key={s.label}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                className="bg-card/50 border border-border/40 rounded-2xl p-4 flex flex-col gap-2"
                            >
                                <div className={`w-8 h-8 rounded-xl ${s.bg} ${s.color} flex items-center justify-center`}>
                                    <Icon size={16} />
                                </div>
                                <div className="text-xl font-black text-foreground">{s.val}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-2 mb-6">
                    {([
                        { key: "proximos" as Tab, label: "Esta semana & Próximos", count: available.length + upcoming.length + expired.length },
                        { key: "realizados" as Tab, label: "Já realizados", count: realized.length },
                    ]).map(t => (
                        <button
                            key={t.key}
                            onClick={() => setActiveTab(t.key)}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === t.key
                                    ? "bg-primary text-white shadow-lg shadow-primary/30"
                                    : "bg-muted/40 text-muted-foreground hover:bg-primary/5 hover:text-primary"
                            }`}
                        >
                            {t.label}
                            {t.count > 0 && (
                                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                                    activeTab === t.key ? "bg-white/20" : "bg-muted"
                                }`}>{t.count}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="space-y-3">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-24 gap-4 opacity-40">
                            <Sparkles className="w-7 h-7 animate-spin text-primary" />
                            <span className="font-black text-xs uppercase tracking-[0.2em]">Carregando simulados...</span>
                        </div>
                    ) : currentList.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-20 rounded-[2rem] border-2 border-dashed border-border/30"
                        >
                            <FileText className="w-10 h-10 text-muted-foreground/20 mx-auto mb-3" />
                            <p className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">
                                {activeTab === "realizados" ? "Você ainda não realizou nenhum simulado." : "Nenhum simulado disponível no momento."}
                            </p>
                        </motion.div>
                    ) : (
                        <AnimatePresence mode="popLayout">
                            {/* Available section header */}
                            {activeTab === "proximos" && available.length > 0 && (
                                <motion.div
                                    key="avail-header"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 pt-2 pb-1"
                                >
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Disponível agora</span>
                                </motion.div>
                            )}
                            {activeTab === "proximos" && available.map((s, i) => (
                                <SimuladoCard key={s.id} sim={s} idx={i} />
                            ))}

                            {activeTab === "proximos" && upcoming.length > 0 && (
                                <motion.div
                                    key="upcoming-header"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 pt-4 pb-1"
                                >
                                    <div className="w-2 h-2 rounded-full bg-amber-500" />
                                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Próximos</span>
                                </motion.div>
                            )}
                            {activeTab === "proximos" && upcoming.map((s, i) => (
                                <SimuladoCard key={s.id} sim={s} idx={available.length + i} />
                            ))}

                            {activeTab === "proximos" && expired.length > 0 && (
                                <motion.div
                                    key="expired-header"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-2 pt-4 pb-1"
                                >
                                    <div className="w-2 h-2 rounded-full bg-slate-400" />
                                    <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">Encerrados / Sem data</span>
                                </motion.div>
                            )}
                            {activeTab === "proximos" && expired.map((s, i) => (
                                <SimuladoCard key={s.id} sim={s} idx={available.length + upcoming.length + i} />
                            ))}

                            {activeTab === "realizados" && realized.map((s, i) => (
                                <SimuladoCard key={s.id} sim={s} idx={i} />
                            ))}
                        </AnimatePresence>
                    )}
                </div>
        </div>
    );
}
