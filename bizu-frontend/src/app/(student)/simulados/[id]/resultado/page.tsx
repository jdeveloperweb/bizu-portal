"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import {
    CheckCircle2, XCircle, AlertTriangle, ChevronRight,
    Target, Loader2, Ban, Clock, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface QuestionResult {
    questionId: string;
    statement: string;
    correctOption: string;
    userAnswer: string | null;
    correct: boolean;
    resolution: string | null;
}

interface ExamResult {
    sessionId: string;
    status: string;
    score: number;
    totalQuestions: number;
    scorePercent: number;
    startedAt: string;
    submittedAt: string | null;
    questionResults: QuestionResult[];
}

export default function SimuladoResultadoPage() {
    const params = useParams();
    const router = useRouter();
    const simuladoId = params.id as string;

    const [result, setResult] = useState<ExamResult | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expanded, setExpanded] = useState<string | null>(null);

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiFetch(`/simulados/${simuladoId}/meu-resultado`);
                if (res.ok) {
                    setResult(await res.json());
                } else {
                    setError("Resultado não encontrado.");
                }
            } catch {
                setError("Erro ao carregar resultado.");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, [simuladoId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <Loader2 size={28} className="animate-spin text-primary" />
            </div>
        );
    }

    if (error || !result) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
                <AlertTriangle size={36} className="text-amber-500 mb-4" />
                <p className="text-base font-bold text-foreground mb-2">{error || "Resultado não disponível"}</p>
                <Button onClick={() => router.push("/simulados")} className="mt-4 rounded-2xl">
                    Voltar para simulados
                </Button>
            </div>
        );
    }

    const pct = Math.round(result.scorePercent);
    const passed = pct >= 60;
    const isCancelled = result.status === "CANCELLED" || result.status === "EXPIRED";
    const submittedAt = result.submittedAt ? new Date(result.submittedAt).toLocaleString("pt-BR") : null;

    return (
        <div className="min-h-screen bg-background pb-16">
            {/* Header */}
            <div className="border-b border-border/40 bg-card/40 px-6 py-4 sticky top-0 z-10 backdrop-blur-md">
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-xl">
                            <BookOpen size={16} className="text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none mb-0.5">Resultado</p>
                            <p className="text-xs text-muted-foreground font-bold">Simulado {simuladoId.slice(0, 8)}...</p>
                        </div>
                    </div>
                    <button
                        onClick={() => router.push("/simulados")}
                        className="text-xs font-black text-muted-foreground hover:text-foreground uppercase tracking-widest transition-colors"
                    >
                        ← Voltar
                    </button>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-10">
                {/* Score hero */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={cn(
                        "rounded-3xl p-8 mb-8 text-center border",
                        isCancelled
                            ? "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-900"
                            : passed
                                ? "bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900"
                                : "bg-card border-border/50"
                    )}
                >
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4",
                        isCancelled ? "border-red-300 dark:border-red-700 bg-red-100 dark:bg-red-900/30" :
                            passed ? "border-emerald-300 dark:border-emerald-700 bg-emerald-100 dark:bg-emerald-900/30"
                                : "border-border bg-muted"
                    )}>
                        {isCancelled ? <Ban size={32} className="text-red-500" />
                            : passed ? <CheckCircle2 size={32} className="text-emerald-600" />
                                : <Target size={32} className="text-muted-foreground" />}
                    </div>

                    {isCancelled ? (
                        <>
                            <div className="text-4xl font-black text-red-500 mb-1">
                                {result.status === "EXPIRED" ? "Tempo Esgotado" : "Cancelado"}
                            </div>
                            <p className="text-sm text-muted-foreground font-medium">
                                {result.status === "EXPIRED"
                                    ? "O tempo da prova esgotou antes de você submeter."
                                    : "Você saiu da tela da prova e o simulado foi cancelado."}
                            </p>
                        </>
                    ) : (
                        <>
                            <div className={cn("text-6xl font-black mb-1", passed ? "text-emerald-600" : "text-foreground")}>
                                {pct}%
                            </div>
                            <p className="text-muted-foreground font-bold mb-4">
                                {result.score} de {result.totalQuestions} questões corretas
                            </p>
                            <div className="h-2 bg-muted rounded-full overflow-hidden max-w-xs mx-auto">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
                                    className={cn("h-full rounded-full", passed ? "bg-emerald-500" : "bg-primary")}
                                />
                            </div>
                        </>
                    )}

                    {submittedAt && (
                        <div className="flex items-center justify-center gap-1.5 mt-4 text-xs text-muted-foreground font-bold">
                            <Clock size={11} />
                            Finalizado em {submittedAt}
                        </div>
                    )}
                </motion.div>

                {/* Question by question review */}
                {!isCancelled && (
                    <div className="space-y-4">
                        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">
                            Gabarito — {result.totalQuestions} questões
                        </p>
                        {result.questionResults.length > 0 ? (
                            result.questionResults.map((qr, i) => (
                                <motion.div
                                    key={qr.questionId}
                                    initial={{ opacity: 0, y: 8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: i * 0.02 }}
                                    className={cn(
                                        "rounded-2xl border overflow-hidden",
                                        qr.correct
                                            ? "border-emerald-200 dark:border-emerald-900 bg-emerald-50/50 dark:bg-emerald-950/20"
                                            : "border-border/50 bg-card"
                                    )}
                                >
                                    <button
                                        onClick={() => setExpanded(expanded === qr.questionId ? null : qr.questionId)}
                                        className="w-full flex items-center gap-3 p-4 text-left"
                                    >
                                        <div className={cn(
                                            "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                                            qr.correct ? "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/40" : "text-muted-foreground bg-muted"
                                        )}>
                                            {qr.correct ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                                        </div>
                                        <span className="text-[11px] font-black text-muted-foreground shrink-0">Q{i + 1}</span>
                                        <p
                                            className="flex-1 text-sm text-foreground/80 font-medium line-clamp-1"
                                            dangerouslySetInnerHTML={{ __html: qr.statement }}
                                        />
                                        <div className="flex items-center gap-2 shrink-0">
                                            {qr.userAnswer ? (
                                                <span className={cn(
                                                    "text-[11px] font-black px-2 py-0.5 rounded-lg",
                                                    qr.correct
                                                        ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400"
                                                        : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
                                                )}>
                                                    Você: {qr.userAnswer}
                                                </span>
                                            ) : (
                                                <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-muted text-muted-foreground">
                                                    Em branco
                                                </span>
                                            )}
                                            {!qr.correct && (
                                                <span className="text-[11px] font-black px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
                                                    Gabarito: {qr.correctOption}
                                                </span>
                                            )}
                                            <ChevronRight size={13} className={cn(
                                                "text-muted-foreground transition-transform",
                                                expanded === qr.questionId && "rotate-90"
                                            )} />
                                        </div>
                                    </button>
                                    <AnimatePresence>
                                        {expanded === qr.questionId && qr.resolution && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="border-t border-border/40 px-4 py-4 overflow-hidden"
                                            >
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2">Resolução</p>
                                                <div
                                                    className="text-sm text-foreground/70 leading-relaxed"
                                                    dangerouslySetInnerHTML={{ __html: qr.resolution }}
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            ))
                        ) : (
                            <div className="bg-muted/40 border border-dashed rounded-3xl p-12 text-center text-muted-foreground py-16">
                                <AlertTriangle size={32} className="mx-auto mb-3 opacity-20" />
                                <p className="text-xs font-bold uppercase tracking-widest">Gabarito indisponível</p>
                                <p className="text-[11px] mt-1 opacity-60">Não foi possível carregar as questões deste simulado.</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="mt-8 flex justify-center">
                    <Button
                        onClick={() => router.push("/simulados")}
                        variant="outline"
                        className="rounded-2xl px-8 h-11 font-black text-xs uppercase tracking-widest border-border/60"
                    >
                        Voltar para simulados
                    </Button>
                </div>
            </div>
        </div>
    );
}
