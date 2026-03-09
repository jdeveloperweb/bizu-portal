"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
    Bookmark, MessageSquare, Share2,
    CheckCircle2, XCircle, Sparkles,
    Pause, Play, SkipForward,
} from "lucide-react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";
import { apiFetch } from "@/lib/api";

interface Option {
    id: string;
    text: string;
}

interface QuestionProps {
    id: string;
    statement: string;
    options: Option[];
    correctOptionId: string;
    resolution?: string;
    onNext?: () => void;
    isSimuladoMode?: boolean;
    subject?: string;
    banca?: string;
    year?: number | string;
    hideTopBar?: boolean;
}

export default function QuestionViewer({
    id,
    statement,
    options,
    correctOptionId,
    resolution,
    onNext,
    isSimuladoMode = false,
    subject,
    banca,
    year,
    hideTopBar = false,
}: QuestionProps) {
    const AUTO_NEXT_DELAY_MS = 5000;

    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [showResolution, setShowResolution] = useState(false);

    const timerControls = useAnimationControls();
    const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const timerStartRef = useRef<number>(0);
    const remainingMsRef = useRef<number>(AUTO_NEXT_DELAY_MS);

    const clearTimer = () => {
        if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
    };

    const startTimerAnimation = (duration: number) => {
        const fromPct = (duration / AUTO_NEXT_DELAY_MS) * 100;
        timerControls.set({ width: `${fromPct}%` });
        timerControls.start({ width: "0%" }, { duration: duration / 1000, ease: "linear" });
    };

    const beginTimer = (duration: number) => {
        remainingMsRef.current = duration;
        timerStartRef.current = Date.now();
        clearTimer();
        autoNextTimeoutRef.current = setTimeout(() => onNext?.(), duration);
        // Animation is started via useEffect after the timer dock mounts
    };

    // Start animation only after isSubmitted flips to true and the dock is in the DOM
    useEffect(() => {
        if (!isSubmitted || isSimuladoMode) return;
        const raf = requestAnimationFrame(() => {
            startTimerAnimation(AUTO_NEXT_DELAY_MS);
        });
        return () => cancelAnimationFrame(raf);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSubmitted]);

    const handleSelect = async (optionId: string) => {
        if (isSubmitted) return;
        setSelectedOption(optionId);
        if (!isSimuladoMode) {
            setIsSubmitted(true);
            setIsPaused(false);
            setShowResolution(false);
            beginTimer(AUTO_NEXT_DELAY_MS);

            try {
                await apiFetch("/student/activities/quick-answer", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ questionId: id, selectedOption: optionId })
                });
            } catch (error) {
                console.error("Falha ao submeter resposta:", error);
            }
        }
    };

    const handleSubmit = () => {
        if (selectedOption) setIsSubmitted(true);
    };

    const handlePauseResume = () => {
        if (isPaused) {
            const remaining = remainingMsRef.current;
            timerStartRef.current = Date.now();
            clearTimer();
            autoNextTimeoutRef.current = setTimeout(() => onNext?.(), remaining);
            startTimerAnimation(remaining);
            setIsPaused(false);
        } else {
            const elapsed = Date.now() - timerStartRef.current;
            remainingMsRef.current = Math.max(0, remainingMsRef.current - elapsed);
            timerControls.stop();
            clearTimer();
            setIsPaused(true);
        }
    };

    const handleSkip = () => {
        timerControls.stop();
        clearTimer();
        onNext?.();
    };

    useEffect(() => {
        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "PrintScreen")
                navigator.clipboard.writeText("Captura de tela bloqueada por direitos autorais.");
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && ["p", "s", "c"].includes(e.key))
                e.preventDefault();
        };
        window.addEventListener("keyup", handleKeyUp);
        window.addEventListener("keydown", handleKeyDown);
        return () => {
            clearTimer();
            window.removeEventListener("keyup", handleKeyUp);
            window.removeEventListener("keydown", handleKeyDown);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="select-none print:hidden"
            onCopy={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* ── Metadata bar ── */}
            {!hideTopBar && (
                <div className="flex items-start justify-between mb-5 md:mb-7 gap-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-primary/8 border border-primary/15 text-[10px] font-black uppercase tracking-widest text-primary">
                            <Sparkles className="w-2.5 h-2.5" />
                            {banca || "Bizu"}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-muted/60 border border-border/40 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                            {year || "2026"}
                        </span>
                        {subject && (
                            <span className="hidden sm:inline text-[10px] font-black text-muted-foreground/50 uppercase tracking-[0.18em] pl-2 border-l border-border/40">
                                {subject}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-primary/8 hover:text-primary text-muted-foreground/50">
                            <Bookmark className="w-3.5 h-3.5" />
                        </Button>
                        <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-primary/8 hover:text-primary text-muted-foreground/50">
                            <Share2 className="w-3.5 h-3.5" />
                        </Button>
                    </div>
                </div>
            )}

            {/* ── Question statement ── */}
            <div
                className="text-[17px] md:text-[22px] font-bold leading-[1.55] md:leading-[1.5] text-foreground mb-7 md:mb-9 break-words prose prose-primary dark:prose-invert max-w-none [&>p]:mb-3 last:[&>p]:mb-0 [&_strong]:font-extrabold [&_strong]:text-foreground"
                dangerouslySetInnerHTML={{ __html: statement }}
            />

            {/* ── Options ── */}
            <div className="flex flex-col gap-2.5 md:gap-3 mb-6 md:mb-8">
                {options.map((option, index) => {
                    const isCorrect = option.id === correctOptionId;
                    const isSelected = option.id === selectedOption;
                    const isDimmed = isSubmitted && !isCorrect && !isSelected && !isSimuladoMode;

                    return (
                        <motion.button
                            key={option.id}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{
                                opacity: isDimmed ? 0.28 : 1,
                                x: 0,
                                scale: isSubmitted && isCorrect && !isSimuladoMode ? 1.005 : 1,
                            }}
                            transition={{
                                opacity: { delay: index * 0.04, duration: 0.35 },
                                x: { delay: index * 0.04, duration: 0.35 },
                                scale: { duration: 0.4, ease: [0.16, 1, 0.3, 1] },
                            }}
                            onClick={() => handleSelect(option.id)}
                            disabled={isSubmitted}
                            className={cn(
                                "w-full flex items-center gap-3 md:gap-4 px-4 md:px-5 py-4 md:py-5 rounded-2xl border-[1.5px] text-left transition-all duration-400 relative overflow-hidden group min-h-[60px] md:min-h-[68px]",
                                // Idle
                                !isSubmitted && !isSelected && "border-border/50 bg-background hover:border-primary/30 hover:bg-primary/[0.015]",
                                // Selected (pre-submit)
                                !isSubmitted && isSelected && "border-primary bg-primary/5 shadow-[0_0_0_4px_hsl(var(--primary)/0.06)]",
                                // Correct answer revealed
                                isSubmitted && isCorrect && !isSimuladoMode && "border-success/70 bg-success/[0.05] shadow-[0_0_0_4px_hsl(var(--color-success)/0.06)]",
                                // Wrong selected
                                isSubmitted && isSelected && !isCorrect && !isSimuladoMode && "border-danger/70 bg-danger/[0.05]",
                                // Simulado selected
                                isSubmitted && isSelected && isSimuladoMode && "border-primary/50 bg-primary/5"
                            )}
                        >
                            {/* Letter badge */}
                            <div className={cn(
                                "flex-shrink-0 w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center font-black text-[13px] md:text-sm border-[1.5px] transition-all duration-400",
                                !isSubmitted && !isSelected && "border-border/60 bg-muted/40 text-muted-foreground group-hover:border-primary/40 group-hover:text-primary",
                                !isSubmitted && isSelected && "border-primary bg-primary text-white shadow-md shadow-primary/30",
                                isSubmitted && isCorrect && !isSimuladoMode && "border-success bg-success text-white shadow-md shadow-success/30",
                                isSubmitted && isSelected && !isCorrect && !isSimuladoMode && "border-danger bg-danger text-white",
                                isSubmitted && !isCorrect && !isSelected && !isSimuladoMode && "border-border/30 bg-muted/20 text-muted-foreground/40",
                                isSubmitted && isSelected && isSimuladoMode && "border-primary bg-primary text-white"
                            )}>
                                {option.id}
                            </div>

                            {/* Option text */}
                            <div
                                className="flex-1 text-[13px] md:text-[15px] font-medium leading-snug prose prose-sm dark:prose-invert [&>p]:mb-0 text-foreground/90"
                                dangerouslySetInnerHTML={{ __html: option.text }}
                            />

                            {/* Result icon */}
                            <AnimatePresence>
                                {isSubmitted && isCorrect && !isSimuladoMode && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: -20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="shrink-0"
                                    >
                                        <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success" />
                                    </motion.div>
                                )}
                                {isSubmitted && isSelected && !isCorrect && !isSimuladoMode && (
                                    <motion.div
                                        initial={{ scale: 0, rotate: 20 }}
                                        animate={{ scale: 1, rotate: 0 }}
                                        className="shrink-0"
                                    >
                                        <XCircle className="w-5 h-5 md:w-6 md:h-6 text-danger" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </div>

            {/* ── Footer divider ── */}
            <div className="border-t border-border/25 pt-4 md:pt-5">

                {/* Community comments */}
                <button className="flex items-center gap-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-muted-foreground/40 hover:text-primary/60 transition-colors mb-5">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Comentários da comunidade
                </button>

                {/* ── Action area ── */}
                {isSimuladoMode ? (
                    !isSubmitted ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className={cn(
                                "w-full h-14 rounded-2xl font-black text-base transition-all duration-500",
                                selectedOption
                                    ? "bg-primary text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-[1.01] active:scale-[0.99]"
                                    : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                            )}
                        >
                            Confirmar Resposta
                        </Button>
                    ) : (
                        <Button
                            onClick={onNext}
                            className="w-full h-14 rounded-2xl font-black text-base bg-foreground text-background hover:scale-[1.01] active:scale-[0.99] transition-all"
                        >
                            Próxima Questão →
                        </Button>
                    )
                ) : isSubmitted ? (
                    /* ── Timer Dock ── */
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                        className={cn(
                            "flex items-center gap-2 p-2 rounded-2xl border-[1.5px] transition-colors duration-300",
                            isPaused
                                ? "bg-amber-50/80 border-amber-200/80"
                                : "bg-muted/30 border-border/40"
                        )}
                    >
                        {/* Pause / Resume */}
                        <motion.button
                            onClick={handlePauseResume}
                            whileTap={{ scale: 0.9 }}
                            title={isPaused ? "Retomar" : "Pausar"}
                            className={cn(
                                "flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl flex-shrink-0 transition-all duration-250 border",
                                isPaused
                                    ? "bg-amber-100 border-amber-300/80 text-amber-700 hover:bg-amber-200"
                                    : "bg-background border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5"
                            )}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isPaused ? (
                                    <motion.div key="play" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <Play className="w-4 h-4 fill-current" />
                                    </motion.div>
                                ) : (
                                    <motion.div key="pause" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ duration: 0.15 }}>
                                        <Pause className="w-4 h-4 fill-current" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Progress track */}
                        <div className="flex-1 flex flex-col gap-1.5 px-1">
                            <div className="flex items-center justify-between">
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-widest transition-colors duration-300",
                                    isPaused ? "text-amber-600" : "text-primary/60"
                                )}>
                                    {isPaused ? "Pausado" : "Próxima em…"}
                                </span>
                                <span className="text-[9px] font-bold text-muted-foreground/40 uppercase tracking-wider">
                                    Clique para pular →
                                </span>
                            </div>
                            <div
                                className="h-1.5 rounded-full overflow-hidden cursor-pointer"
                                style={{ background: isPaused ? "rgba(251,191,36,0.15)" : "hsl(var(--primary)/0.08)" }}
                                onClick={handleSkip}
                                title="Pular"
                            >
                                <motion.div
                                    animate={timerControls}
                                    initial={{ width: "100%" }}
                                    className={cn(
                                        "h-full rounded-full",
                                        isPaused ? "bg-amber-400/70" : "bg-primary/60"
                                    )}
                                />
                            </div>
                        </div>

                        {/* Skip button */}
                        <motion.button
                            onClick={handleSkip}
                            whileTap={{ scale: 0.9 }}
                            title="Pular questão"
                            className="flex items-center justify-center w-11 h-11 md:w-12 md:h-12 rounded-xl flex-shrink-0 bg-background border border-border/50 text-muted-foreground hover:border-primary/30 hover:text-primary hover:bg-primary/5 transition-all duration-250"
                        >
                            <SkipForward className="w-4 h-4" />
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="flex items-center gap-2 text-[10px] font-black text-muted-foreground/25 uppercase tracking-widest h-11">
                        <span className="inline-block w-4 h-4 rounded-full border-[1.5px] border-dashed border-muted-foreground/20" />
                        Escolha uma alternativa
                    </div>
                )}
            </div>

            {/* ── Resolution ── */}
            <AnimatePresence>
                {isSubmitted && resolution && !isSimuladoMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                        className="overflow-hidden mt-6 md:mt-8"
                    >
                        {/* Toggle header */}
                        <button
                            onClick={() => setShowResolution(!showResolution)}
                            className="w-full flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-muted/30 border border-border/30 hover:bg-muted/50 transition-colors group"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-xl bg-success/10 border border-success/20 flex items-center justify-center">
                                    <CheckCircle2 className="w-4 h-4 text-success" />
                                </div>
                                <div className="text-left">
                                    <div className="text-xs font-black uppercase tracking-widest text-foreground">Gabarito Comentado</div>
                                    <div className="text-[10px] text-muted-foreground font-medium mt-0.5">Aprenda com o erro ou reforce o acerto</div>
                                </div>
                            </div>
                            <motion.div
                                animate={{ rotate: showResolution ? 180 : 0 }}
                                transition={{ duration: 0.25 }}
                                className="text-muted-foreground/50 group-hover:text-foreground transition-colors"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="6 9 12 15 18 9" />
                                </svg>
                            </motion.div>
                        </button>

                        <AnimatePresence>
                            {showResolution && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                                    className="overflow-hidden"
                                >
                                    <div className="mt-2 px-5 py-5 rounded-2xl bg-muted/20 border border-border/20 border-l-2 border-l-success/40">
                                        <div
                                            className="text-sm md:text-base leading-relaxed text-foreground/80 font-medium prose prose-primary dark:prose-invert max-w-none [&>p]:mb-3 last:[&>p]:mb-0"
                                            dangerouslySetInnerHTML={{ __html: resolution }}
                                        />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
