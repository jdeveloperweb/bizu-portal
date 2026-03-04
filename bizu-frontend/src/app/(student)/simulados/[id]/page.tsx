"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useDuels } from "@/contexts/DuelContext";
import { motion, AnimatePresence } from "framer-motion";
import {
    AlertTriangle, Clock, CheckCircle2, XCircle, Flag, ChevronLeft,
    ChevronRight, Send, Ban, Loader2, BookOpen, Target, LayoutGrid, X, RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuestionExam {
    id: string;
    statement: string;
    options: Record<string, string>;
    banca: string | null;
    year: number | null;
    subject: string | null;
    imageBase64: string | null;
}

interface SessionStart {
    sessionId: string;
    startedAt: string;
    expiresAt: string;
    durationMinutes: number | null;
    simuladoTitle: string;
    questions: QuestionExam[];
}

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

// ─── Timer Component ─────────────────────────────────────────────────────────

function ExamTimer({
    expiresAt,
    onExpire,
    compact = false,
}: { expiresAt: string; onExpire: () => void; compact?: boolean }) {
    const [remaining, setRemaining] = useState(0);
    const calledRef = useRef(false);

    useEffect(() => {
        const tick = () => {
            const secs = Math.max(0, Math.floor((new Date(expiresAt).getTime() - Date.now()) / 1000));
            setRemaining(secs);
            if (secs === 0 && !calledRef.current) {
                calledRef.current = true;
                onExpire();
            }
        };
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [expiresAt, onExpire]);

    const h = Math.floor(remaining / 3600);
    const m = Math.floor((remaining % 3600) / 60);
    const s = remaining % 60;
    const pad = (n: number) => String(n).padStart(2, "0");
    const isUrgent = remaining < 300;
    const timeStr = h > 0 ? `${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;

    return (
        <div className={cn(
            "flex items-center gap-1.5 font-mono font-black tabular-nums transition-all",
            compact
                ? cn(
                    "text-base",
                    isUrgent ? "text-red-400 animate-pulse" : "text-slate-200"
                )
                : cn(
                    "px-4 py-2 rounded-xl text-sm border",
                    isUrgent
                        ? "bg-red-500/15 text-red-400 border-red-500/30 animate-pulse"
                        : "bg-slate-800 text-slate-200 border-slate-700"
                )
        )}>
            <Clock size={compact ? 13 : 14} className={isUrgent ? "text-red-400" : "text-slate-400"} />
            {timeStr}
        </div>
    );
}

// ─── Question Grid ───────────────────────────────────────────────────────────

function QuestionGrid({
    total,
    answers,
    flagged,
    current,
    onSelect,
}: {
    total: number;
    answers: Record<number, string>;
    flagged: Set<number>;
    current: number;
    onSelect: (i: number) => void;
}) {
    return (
        <div className="grid grid-cols-5 gap-2">
            {Array.from({ length: total }).map((_, i) => {
                const answered = !!answers[i];
                const isCurrent = i === current;
                const isFlagged = flagged.has(i);
                return (
                    <button
                        key={i}
                        onClick={() => onSelect(i)}
                        className={cn(
                            "w-full aspect-square rounded-xl text-[11px] font-black border-2 transition-all duration-150 relative touch-manipulation",
                            isCurrent && "border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-110 z-10",
                            !isCurrent && answered && !isFlagged && "border-emerald-500/60 bg-emerald-500/10 text-emerald-400",
                            !isCurrent && answered && isFlagged && "border-amber-400/80 bg-amber-400/15 text-amber-300",
                            !isCurrent && !answered && isFlagged && "border-amber-400/60 bg-amber-400/8 text-amber-500",
                            !isCurrent && !answered && !isFlagged && "border-slate-700 bg-slate-800/60 text-slate-400 hover:border-slate-500",
                        )}
                    >
                        {i + 1}
                        {isFlagged && (
                            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-amber-400 rounded-full border border-slate-900" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}

// ─── Mobile Question Drawer ──────────────────────────────────────────────────

function MobileQuestionDrawer({
    open,
    onClose,
    total,
    answers,
    flagged,
    current,
    onSelect,
}: {
    open: boolean;
    onClose: () => void;
    total: number;
    answers: Record<number, string>;
    flagged: Set<number>;
    current: number;
    onSelect: (i: number) => void;
}) {
    const answeredCount = Object.keys(answers).length;

    return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                        className="fixed bottom-0 left-0 right-0 z-50 bg-slate-900 rounded-t-3xl border-t border-slate-700/60 shadow-2xl"
                        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                    >
                        {/* Handle */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 bg-slate-700 rounded-full" />
                        </div>

                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800">
                            <div>
                                <p className="text-xs font-black text-slate-200">Caderno de Questões</p>
                                <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                                    {answeredCount} de {total} respondidas
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center touch-manipulation"
                            >
                                <X size={14} className="text-slate-400" />
                            </button>
                        </div>

                        {/* Grid */}
                        <div className="px-5 py-4 max-h-[50vh] overflow-y-auto">
                            <QuestionGrid
                                total={total}
                                answers={answers}
                                flagged={flagged}
                                current={current}
                                onSelect={(i) => { onSelect(i); onClose(); }}
                            />
                        </div>

                        {/* Legend */}
                        <div className="flex items-center gap-4 px-5 pb-4 flex-wrap">
                            {[
                                { color: "bg-primary", label: "Atual" },
                                { color: "bg-emerald-500/30 border border-emerald-500/50", label: "Respondida" },
                                { color: "bg-amber-400/20 border border-amber-400/50", label: "Marcada" },
                                { color: "bg-slate-800 border border-slate-700", label: "Em branco" },
                            ].map(l => (
                                <div key={l.label} className="flex items-center gap-1.5">
                                    <div className={`w-2.5 h-2.5 rounded ${l.color}`} />
                                    <span className="text-[10px] text-slate-500 font-bold">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// ─── Option Button ───────────────────────────────────────────────────────────

function OptionButton({
    letter,
    text,
    selected,
    onClick,
}: { letter: string; text: string; selected: boolean; onClick: () => void }) {
    return (
        <motion.button
            whileTap={{ scale: 0.985 }}
            onClick={onClick}
            className={cn(
                "w-full flex items-start gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 group touch-manipulation",
                selected
                    ? "border-primary bg-primary/8 shadow-md shadow-primary/10"
                    : "border-slate-200 dark:border-slate-700/60 bg-background hover:border-primary/40 hover:bg-primary/[0.02]"
            )}
        >
            <span className={cn(
                "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-xs font-black border-2 transition-all",
                selected
                    ? "bg-primary border-primary text-white"
                    : "bg-muted border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary"
            )}>
                {letter}
            </span>
            <span
                className="flex-1 text-sm font-medium leading-relaxed text-foreground/90 pt-1"
                dangerouslySetInnerHTML={{ __html: text }}
            />
        </motion.button>
    );
}

// ─── Result View ─────────────────────────────────────────────────────────────

function ExamResultView({ result, simuladoTitle, isPractice, onBack }: {
    result: ExamResult;
    simuladoTitle: string;
    isPractice?: boolean;
    onBack: () => void;
}) {
    const pct = Math.round(result.scorePercent);
    const passed = pct >= 60;
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100">
            <div className="bg-slate-900 border-b border-slate-800 px-6 py-4">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-2 rounded-xl", isPractice ? "bg-amber-500/20" : "bg-indigo-500/20")}>
                            {isPractice
                                ? <RotateCcw size={18} className="text-amber-400" />
                                : <Target size={18} className="text-indigo-400" />
                            }
                        </div>
                        <div>
                            <p className={cn("text-xs font-black uppercase tracking-widest", isPractice ? "text-amber-400" : "text-indigo-400")}>
                                {isPractice ? "Resultado — Modo Prática" : "Resultado"}
                            </p>
                            <p className="text-sm font-bold text-slate-300 truncate max-w-[240px] md:max-w-[400px]">{simuladoTitle}</p>
                        </div>
                    </div>
                    <button onClick={onBack} className="text-xs font-black text-slate-400 hover:text-slate-200 uppercase tracking-widest transition-colors">
                        ← Voltar
                    </button>
                </div>
            </div>
            {isPractice && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-6 py-2.5">
                    <div className="max-w-4xl mx-auto flex items-center gap-2 text-amber-400 text-xs font-bold">
                        <RotateCcw size={12} />
                        Este resultado é apenas para estudo e não conta para o ranking.
                    </div>
                </div>
            )}

            <div className="max-w-4xl mx-auto px-4 py-10">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className={cn(
                        "rounded-3xl p-8 mb-8 text-center border",
                        passed
                            ? "bg-emerald-950/60 border-emerald-800/60"
                            : "bg-slate-900 border-slate-800"
                    )}
                >
                    <div className={cn(
                        "w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-4",
                        passed ? "bg-emerald-900/60 border-emerald-500/40" : "bg-slate-800 border-slate-700"
                    )}>
                        {passed
                            ? <CheckCircle2 size={36} className="text-emerald-400" />
                            : <XCircle size={36} className="text-slate-500" />
                        }
                    </div>
                    <div className={cn("text-6xl font-black mb-1", passed ? "text-emerald-400" : "text-slate-300")}>
                        {pct}%
                    </div>
                    <p className="text-slate-400 font-bold mb-6">
                        {result.score} de {result.totalQuestions} questões corretas
                    </p>
                    <div className="h-2 bg-slate-800 rounded-full overflow-hidden max-w-xs mx-auto mb-4">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
                            className={cn("h-full rounded-full", passed ? "bg-emerald-500" : "bg-indigo-500")}
                        />
                    </div>
                    {result.status === "CANCELLED" && (
                        <div className="flex items-center justify-center gap-2 text-red-400 text-sm font-bold">
                            <Ban size={14} /> Simulado cancelado
                        </div>
                    )}
                </motion.div>

                <div className="space-y-3">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">
                        Gabarito — {result.totalQuestions} questões
                    </h3>
                    {result.questionResults.map((qr, i) => (
                        <motion.div
                            key={qr.questionId}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            className={cn(
                                "rounded-2xl border overflow-hidden",
                                qr.correct
                                    ? "border-emerald-800/50 bg-emerald-950/30"
                                    : "border-slate-800 bg-slate-900/50"
                            )}
                        >
                            <button
                                onClick={() => setExpanded(expanded === qr.questionId ? null : qr.questionId)}
                                className="w-full flex items-center gap-4 p-4 text-left touch-manipulation"
                            >
                                <div className={cn(
                                    "w-7 h-7 rounded-full flex items-center justify-center shrink-0",
                                    qr.correct ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                                )}>
                                    {qr.correct ? <CheckCircle2 size={15} /> : <XCircle size={15} />}
                                </div>
                                <span className="text-xs font-bold text-slate-400 shrink-0">Q{i + 1}</span>
                                <p className="flex-1 text-sm text-slate-300 font-medium line-clamp-1"
                                    dangerouslySetInnerHTML={{ __html: qr.statement }} />
                                <div className="flex items-center gap-2 shrink-0">
                                    {qr.userAnswer && (
                                        <span className={cn(
                                            "text-xs font-black px-2 py-0.5 rounded-lg",
                                            qr.correct ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/15 text-red-400"
                                        )}>
                                            Você: {qr.userAnswer}
                                        </span>
                                    )}
                                    {!qr.correct && (
                                        <span className="text-xs font-black px-2 py-0.5 rounded-lg bg-emerald-500/15 text-emerald-400">
                                            Gabarito: {qr.correctOption}
                                        </span>
                                    )}
                                    <ChevronRight size={14} className={cn(
                                        "text-slate-600 transition-transform",
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
                                        transition={{ duration: 0.25 }}
                                        className="border-t border-slate-800 px-4 py-4 overflow-hidden"
                                    >
                                        <p className="text-xs font-black text-slate-500 uppercase tracking-widest mb-2">Resolução</p>
                                        <div
                                            className="text-sm text-slate-400 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: qr.resolution }}
                                        />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}

// ─── Main Exam Page ───────────────────────────────────────────────────────────

export default function SimuladoExamPage() {
    const params = useParams();
    const router = useRouter();
    const simuladoId = params.id as string;
    const [isPractice, setIsPractice] = useState(false);

    useEffect(() => {
        const p = new URLSearchParams(window.location.search);
        setIsPractice(p.get("modo") === "pratica");
    }, []);
    const { setFocusMode } = useDuels();

    const [phase, setPhase] = useState<"loading" | "starting" | "exam" | "submitting" | "result" | "cancelled" | "error">("loading");
    const [session, setSession] = useState<SessionStart | null>(null);
    const [currentIdx, setCurrentIdx] = useState(0);
    const [answers, setAnswers] = useState<Record<number, string>>({});
    const [flagged, setFlagged] = useState<Set<number>>(new Set());
    const [showSubmitModal, setShowSubmitModal] = useState(false);
    const [showDrawer, setShowDrawer] = useState(false);
    const [result, setResult] = useState<ExamResult | null>(null);
    const [errorMsg, setErrorMsg] = useState<string>("");
    const cancelledRef = useRef(false);
    const sessionRef = useRef<SessionStart | null>(null);

    // Swipe gesture refs
    const touchStartRef = useRef<{ x: number; y: number } | null>(null);

    // ── Focus mode: block duel notifications during exam ──────────────────
    useEffect(() => {
        if (phase === "exam") {
            setFocusMode(true);
        } else if (phase === "result" || phase === "cancelled" || phase === "error") {
            setFocusMode(false);
        }
    }, [phase, setFocusMode]);

    // Ensure focus mode is cleared if user navigates away mid-exam
    useEffect(() => {
        return () => { setFocusMode(false); };
    }, [setFocusMode]);

    // ── Start exam ────────────────────────────────────────────────────────
    useEffect(() => {
        const startExam = async () => {
            setPhase("starting");
            const endpoint = isPractice
                ? `/simulados/${simuladoId}/refazer/iniciar`
                : `/simulados/${simuladoId}/iniciar`;
            try {
                const res = await apiFetch(endpoint, { method: "POST" });
                if (res.ok) {
                    const data: SessionStart = await res.json();
                    setSession(data);
                    sessionRef.current = data;
                    setPhase("exam");
                } else if (!isPractice && res.status === 409) {
                    router.replace(`/simulados/${simuladoId}/resultado`);
                } else {
                    const text = await res.text();
                    let msg = "Não foi possível iniciar o simulado.";
                    try { msg = JSON.parse(text)?.message || msg; } catch {}
                    setErrorMsg(msg);
                    setPhase("error");
                }
            } catch {
                setErrorMsg("Erro de conexão ao iniciar o simulado.");
                setPhase("error");
            }
        };
        startExam();
    }, [simuladoId, isPractice]);

    // ── Anti-cheat (official exams only) ─────────────────────────────────
    useEffect(() => {
        if (phase !== "exam" || isPractice) return;
        const handleHidden = async () => {
            if (document.hidden && !cancelledRef.current) {
                cancelledRef.current = true;
                try { await apiFetch(`/simulados/${simuladoId}/cancelar`, { method: "POST" }); } catch {}
                setPhase("cancelled");
            }
        };
        document.addEventListener("visibilitychange", handleHidden);
        return () => document.removeEventListener("visibilitychange", handleHidden);
    }, [phase, simuladoId, isPractice]);

    // ── Timer expire → auto submit ─────────────────────────────────────────
    const handleTimerExpire = useCallback(async () => {
        if (cancelledRef.current || phase !== "exam") return;
        await doSubmit();
    }, [phase]); // eslint-disable-line

    // ── Submit ────────────────────────────────────────────────────────────
    const doSubmit = async () => {
        if (cancelledRef.current) return;
        setShowSubmitModal(false);
        setPhase("submitting");
        const currentSession = sessionRef.current;
        if (!currentSession) return;
        const answersMap: Record<string, string> = {};
        currentSession.questions.forEach((q, i) => {
            if (answers[i]) answersMap[q.id] = answers[i];
        });
        try {
            const endpoint = isPractice
                ? `/simulados/${simuladoId}/refazer/submeter?sessionId=${currentSession.sessionId}`
                : `/simulados/${simuladoId}/submeter`;
            const res = await apiFetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ answers: answersMap }),
            });
            if (res.ok) {
                const data: ExamResult = await res.json();
                setResult(data);
                setPhase("result");
            } else {
                setErrorMsg("Erro ao enviar respostas. Tente novamente.");
                setPhase("error");
            }
        } catch {
            setErrorMsg("Erro de conexão ao enviar respostas.");
            setPhase("error");
        }
    };

    // ── Navigate ──────────────────────────────────────────────────────────
    const goTo = (i: number) => {
        if (session && i >= 0 && i < session.questions.length) setCurrentIdx(i);
    };

    const toggleFlag = () => {
        setFlagged(prev => {
            const next = new Set(prev);
            if (next.has(currentIdx)) next.delete(currentIdx);
            else next.add(currentIdx);
            return next;
        });
    };

    const selectAnswer = (letter: string) => {
        setAnswers(prev => ({ ...prev, [currentIdx]: letter }));
    };

    // ── Swipe handlers ─────────────────────────────────────────────────────
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchStartRef.current || !session) return;
        const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
        const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
        // Only trigger on clear horizontal swipe (> 60px, less than 40px vertical drift)
        if (Math.abs(dx) > 60 && Math.abs(dy) < 40) {
            if (dx < 0) goTo(currentIdx + 1);
            else goTo(currentIdx - 1);
        }
        touchStartRef.current = null;
    };

    // ─────────────────────────────────────────────────────────────────────
    // PHASES
    // ─────────────────────────────────────────────────────────────────────

    if (phase === "loading" || phase === "starting") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-indigo-400" />
                <p className="text-sm font-black uppercase tracking-widest">Carregando simulado...</p>
            </div>
        );
    }

    if (phase === "submitting") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 gap-4 text-slate-400">
                <Loader2 size={32} className="animate-spin text-emerald-400" />
                <p className="text-sm font-black uppercase tracking-widest">Enviando respostas...</p>
            </div>
        );
    }

    if (phase === "cancelled") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-slate-900 border border-red-900/60 rounded-3xl p-10 max-w-md w-full text-center"
                >
                    <div className="w-16 h-16 bg-red-950/60 border border-red-800/50 rounded-full flex items-center justify-center mx-auto mb-5">
                        <Ban size={28} className="text-red-400" />
                    </div>
                    <h2 className="text-xl font-black text-slate-100 mb-2">Simulado Cancelado</h2>
                    <p className="text-sm text-slate-400 mb-2 font-medium">
                        Você saiu da tela da prova. Por regras anti-trapaça, o simulado foi cancelado automaticamente.
                    </p>
                    <p className="text-xs text-slate-500 mb-8">
                        Simulados cancelados são registrados e não podem ser refeitos.
                    </p>
                    <Button
                        onClick={() => router.push("/simulados")}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl h-12 font-black uppercase tracking-widest text-xs border border-slate-700"
                    >
                        Voltar para simulados
                    </Button>
                </motion.div>
            </div>
        );
    }

    if (phase === "error") {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-md w-full text-center">
                    <AlertTriangle size={40} className="text-amber-400 mx-auto mb-4" />
                    <h2 className="text-lg font-black text-slate-100 mb-2">Simulado indisponível</h2>
                    <p className="text-sm text-slate-400 mb-8">{errorMsg}</p>
                    <Button
                        onClick={() => router.push("/simulados")}
                        className="w-full rounded-2xl h-12 font-black text-xs uppercase tracking-widest"
                    >
                        Voltar para simulados
                    </Button>
                </div>
            </div>
        );
    }

    if (phase === "result" && result && session) {
        return (
            <ExamResultView
                result={result}
                simuladoTitle={session.simuladoTitle}
                isPractice={isPractice}
                onBack={() => router.push("/simulados")}
            />
        );
    }

    if (!session || session.questions.length === 0) return null;

    const q = session.questions[currentIdx];
    const sortedOptions = Object.entries(q.options).sort(([a], [b]) => a.localeCompare(b));
    const answeredCount = Object.keys(answers).length;
    const unansweredCount = session.questions.length - answeredCount;
    const isFlagged = flagged.has(currentIdx);
    const progressPct = (answeredCount / session.questions.length) * 100;
    const isLastQuestion = currentIdx === session.questions.length - 1;

    // ─────────────────────────────────────────────────────────────────────
    // EXAM UI
    // ─────────────────────────────────────────────────────────────────────

    return (
        <div
            className="h-[100dvh] bg-slate-950 flex flex-col overflow-hidden select-none"
            onContextMenu={e => e.preventDefault()}
        >
            {/* ── Submit Modal ── */}
            <AnimatePresence>
                {showSubmitModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-[9999] bg-slate-950/90 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
                        style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
                    >
                        <motion.div
                            initial={{ y: 40, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 40, opacity: 0 }}
                            transition={{ type: "spring", damping: 26, stiffness: 300 }}
                            className="bg-slate-900 border border-slate-700 rounded-3xl p-8 max-w-sm w-full shadow-2xl"
                        >
                            <div className="w-14 h-14 bg-indigo-950/60 border border-indigo-800/50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                                <Send size={24} className="text-indigo-400" />
                            </div>
                            <h3 className="text-lg font-black text-slate-100 text-center mb-1">
                                Finalizar Prova?
                            </h3>
                            <p className="text-sm text-slate-400 text-center mb-6">
                                {answeredCount === session.questions.length
                                    ? "Você respondeu todas as questões."
                                    : `${answeredCount} de ${session.questions.length} respondidas. ${unansweredCount} em branco.`
                                }
                            </p>
                            {unansweredCount > 0 && (
                                <div className="flex items-center gap-2 bg-amber-950/40 border border-amber-800/40 rounded-2xl p-3 mb-5">
                                    <AlertTriangle size={14} className="text-amber-400 shrink-0" />
                                    <p className="text-xs text-amber-400 font-bold">
                                        Questões em branco contam como erradas.
                                    </p>
                                </div>
                            )}
                            <div className="flex flex-col gap-3">
                                <Button
                                    onClick={doSubmit}
                                    className="w-full h-12 rounded-2xl font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white gap-2"
                                >
                                    <Send size={14} />
                                    Confirmar e Enviar
                                </Button>
                                <Button
                                    variant="ghost"
                                    onClick={() => setShowSubmitModal(false)}
                                    className="w-full h-11 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-400 hover:text-slate-200"
                                >
                                    Continuar revisando
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Mobile Drawer ── */}
            <MobileQuestionDrawer
                open={showDrawer}
                onClose={() => setShowDrawer(false)}
                total={session.questions.length}
                answers={answers}
                flagged={flagged}
                current={currentIdx}
                onSelect={goTo}
            />

            {/* ── Top Bar ── */}
            <div className="bg-slate-900 border-b border-slate-800 px-4 md:px-6 py-3 flex items-center justify-between shrink-0 z-10"
                style={{ paddingTop: "max(0.75rem, env(safe-area-inset-top))" }}
            >
                {/* Left: Title */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn("p-1.5 rounded-xl shrink-0", isPractice ? "bg-amber-500/15" : "bg-indigo-500/15")}>
                        {isPractice
                            ? <RotateCcw size={15} className="text-amber-400" />
                            : <BookOpen size={15} className="text-indigo-400" />
                        }
                    </div>
                    <div className="min-w-0">
                        <p className={cn("text-[9px] font-black uppercase tracking-widest leading-none mb-0.5", isPractice ? "text-amber-400" : "text-indigo-400")}>
                            {isPractice ? "Modo Prática" : "Modo Prova"}
                        </p>
                        <p className="text-xs text-slate-400 font-bold truncate max-w-[130px] sm:max-w-[300px] md:max-w-[400px]">
                            {session.simuladoTitle}
                        </p>
                    </div>
                </div>

                {/* Center: Timer */}
                <div className="shrink-0 absolute left-1/2 -translate-x-1/2">
                    {session.expiresAt && (
                        <ExamTimer expiresAt={session.expiresAt} onExpire={handleTimerExpire} />
                    )}
                </div>

                {/* Right: Submit */}
                <div className="flex items-center gap-2 shrink-0">
                    <div className="hidden sm:flex flex-col items-end">
                        <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            Respondidas
                        </span>
                        <span className="text-sm font-black text-slate-200 tabular-nums">
                            {answeredCount}/{session.questions.length}
                        </span>
                    </div>
                    <Button
                        onClick={() => setShowSubmitModal(true)}
                        className="h-9 px-4 rounded-xl font-black text-xs uppercase tracking-widest bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 shadow-lg shadow-indigo-900/50"
                    >
                        <Send size={12} />
                        <span className="hidden sm:inline">Finalizar</span>
                    </Button>
                </div>
            </div>

            {/* ── Progress Bar ── */}
            <div className="h-1 bg-slate-800 shrink-0">
                <motion.div
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className={cn("h-full", isPractice ? "bg-amber-500" : "bg-indigo-500")}
                />
            </div>

            {/* ── Practice Mode Notice ── */}
            {isPractice && (
                <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 shrink-0 flex items-center justify-center gap-2">
                    <RotateCcw size={11} className="text-amber-400" />
                    <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest">
                        Modo Prática — Não conta para o ranking
                    </span>
                </div>
            )}

            {/* ── Body ── */}
            <div className="flex-1 flex min-h-0">

                {/* ── Desktop Sidebar ── */}
                <aside className="hidden md:flex flex-col w-[220px] lg:w-[240px] bg-slate-900 border-r border-slate-800 shrink-0">
                    <div className="px-4 pt-5 pb-3 border-b border-slate-800">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Caderno</p>
                        <p className="text-xs text-slate-300 font-bold">
                            {answeredCount}/{session.questions.length} respondidas
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4">
                        <QuestionGrid
                            total={session.questions.length}
                            answers={answers}
                            flagged={flagged}
                            current={currentIdx}
                            onSelect={goTo}
                        />
                    </div>
                    <div className="px-4 py-3 border-t border-slate-800 space-y-1.5">
                        {[
                            { color: "bg-primary", label: "Atual" },
                            { color: "bg-emerald-500/30 border border-emerald-500/50", label: "Respondida" },
                            { color: "bg-amber-400/20 border border-amber-400/50", label: "Marcada" },
                            { color: "bg-slate-800 border border-slate-700", label: "Em branco" },
                        ].map(l => (
                            <div key={l.label} className="flex items-center gap-2">
                                <div className={`w-3 h-3 rounded ${l.color}`} />
                                <span className="text-[10px] text-slate-500 font-bold">{l.label}</span>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* ── Main Question Area ── */}
                <main
                    className="flex-1 flex flex-col min-h-0 bg-background overflow-hidden"
                    onTouchStart={handleTouchStart}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Question header */}
                    <div className="border-b border-border/40 px-5 md:px-8 py-3 md:py-4 flex items-center justify-between shrink-0 bg-background">
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-black text-muted-foreground uppercase tracking-widest">
                                Questão
                            </span>
                            <span className="text-sm font-black text-foreground tabular-nums">
                                {currentIdx + 1} / {session.questions.length}
                            </span>
                            {q.banca && (
                                <>
                                    <span className="text-muted-foreground/30">·</span>
                                    <span className="text-[11px] font-bold text-muted-foreground">
                                        {q.banca}{q.year ? ` ${q.year}` : ""}
                                    </span>
                                </>
                            )}
                            {q.subject && (
                                <span className="text-[11px] font-bold text-muted-foreground hidden sm:inline">
                                    · {q.subject}
                                </span>
                            )}
                        </div>
                        <button
                            onClick={toggleFlag}
                            className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all touch-manipulation",
                                isFlagged
                                    ? "bg-amber-100 dark:bg-amber-900/30 text-amber-600 border border-amber-200 dark:border-amber-700"
                                    : "bg-muted/50 text-muted-foreground hover:bg-amber-50 hover:text-amber-600 border border-border/40"
                            )}
                        >
                            <Flag size={12} />
                            {isFlagged ? "Marcada" : "Marcar"}
                        </button>
                    </div>

                    {/* Scrollable question body */}
                    <div className="flex-1 overflow-y-auto px-5 md:px-10 py-6 md:py-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={q.id}
                                initial={{ opacity: 0, x: 24 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -24 }}
                                transition={{ duration: 0.2, ease: "easeInOut" }}
                            >
                                {q.imageBase64 && (
                                    <img
                                        src={`data:image/png;base64,${q.imageBase64}`}
                                        alt="Imagem da questão"
                                        className="max-w-full rounded-xl mb-6 border border-border/30"
                                    />
                                )}
                                <div
                                    className="text-base md:text-lg font-semibold leading-relaxed text-foreground mb-6 md:mb-8 prose prose-sm dark:prose-invert max-w-none"
                                    dangerouslySetInnerHTML={{ __html: q.statement }}
                                />
                                <div className="space-y-3">
                                    {sortedOptions.map(([letter, text]) => (
                                        <OptionButton
                                            key={letter}
                                            letter={letter}
                                            text={text}
                                            selected={answers[currentIdx] === letter}
                                            onClick={() => selectAnswer(letter)}
                                        />
                                    ))}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* ── Desktop Bottom Nav ── */}
                    <div className="hidden md:flex border-t border-border/40 px-5 md:px-8 py-4 items-center justify-between shrink-0 bg-background">
                        <div />
                        <div className="flex items-center gap-3">
                            <Button
                                variant="outline"
                                onClick={() => goTo(currentIdx - 1)}
                                disabled={currentIdx === 0}
                                className="h-10 px-5 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 border-border/60"
                            >
                                <ChevronLeft size={15} />
                                Anterior
                            </Button>
                            {!isLastQuestion ? (
                                <Button
                                    onClick={() => goTo(currentIdx + 1)}
                                    className="h-10 px-5 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 bg-foreground text-background hover:bg-foreground/90"
                                >
                                    Próxima
                                    <ChevronRight size={15} />
                                </Button>
                            ) : (
                                <Button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="h-10 px-5 rounded-2xl font-black text-xs uppercase tracking-widest gap-2 bg-indigo-600 hover:bg-indigo-500 text-white"
                                >
                                    <Send size={13} />
                                    Finalizar
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* ── Mobile Bottom Bar ── */}
                    <div
                        className="md:hidden bg-slate-900 border-t border-slate-800 shrink-0"
                        style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
                    >
                        <div className="flex items-center h-[68px] px-3 gap-2">

                            {/* Prev */}
                            <button
                                onClick={() => goTo(currentIdx - 1)}
                                disabled={currentIdx === 0}
                                className={cn(
                                    "flex items-center justify-center w-12 h-12 rounded-2xl border-2 transition-all touch-manipulation shrink-0",
                                    currentIdx === 0
                                        ? "border-slate-800 text-slate-700 bg-slate-800/30"
                                        : "border-slate-700 text-slate-300 bg-slate-800 active:scale-95"
                                )}
                            >
                                <ChevronLeft size={20} />
                            </button>

                            {/* Center: Question counter + Caderno button */}
                            <button
                                onClick={() => setShowDrawer(true)}
                                className="flex-1 flex flex-col items-center justify-center h-12 rounded-2xl bg-slate-800/80 border border-slate-700 gap-0.5 touch-manipulation active:scale-[0.97] transition-transform"
                            >
                                <div className="flex items-center gap-1.5">
                                    <LayoutGrid size={11} className="text-indigo-400" />
                                    <span className="text-base font-black text-slate-100 tabular-nums leading-none">
                                        {currentIdx + 1}
                                        <span className="text-slate-500 font-bold text-sm">/{session.questions.length}</span>
                                    </span>
                                    {isFlagged && <Flag size={10} className="text-amber-400" />}
                                </div>
                                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">
                                    {answeredCount} respondidas · toque p/ caderno
                                </span>
                            </button>

                            {/* Next or Submit */}
                            {!isLastQuestion ? (
                                <button
                                    onClick={() => goTo(currentIdx + 1)}
                                    className="flex items-center justify-center w-12 h-12 rounded-2xl border-2 border-slate-700 text-slate-300 bg-slate-800 touch-manipulation active:scale-95 transition-transform shrink-0"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setShowSubmitModal(true)}
                                    className="flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 text-white touch-manipulation active:scale-95 transition-transform shrink-0 shadow-lg shadow-indigo-900/60"
                                >
                                    <Send size={17} />
                                </button>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
