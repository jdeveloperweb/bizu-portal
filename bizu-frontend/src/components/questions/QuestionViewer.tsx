"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, MessageSquare, Share2, CheckCircle2, XCircle, Sparkles, Pause, Play, SkipForward } from "lucide-react";
import { motion, AnimatePresence, useAnimationControls } from "framer-motion";

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
        timerControls.start(
            { width: "0%" },
            { duration: duration / 1000, ease: "linear" }
        );
    };

    const beginTimer = (duration: number) => {
        remainingMsRef.current = duration;
        timerStartRef.current = Date.now();
        clearTimer();
        autoNextTimeoutRef.current = setTimeout(() => onNext?.(), duration);
        startTimerAnimation(duration);
    };

    const handleSelect = (id: string) => {
        if (isSubmitted) return;
        setSelectedOption(id);

        if (!isSimuladoMode) {
            setIsSubmitted(true);
            setIsPaused(false);
            beginTimer(AUTO_NEXT_DELAY_MS);
        }
    };

    const handleSubmit = () => {
        if (selectedOption) setIsSubmitted(true);
    };

    const handlePauseResume = () => {
        if (isPaused) {
            // Resume
            const remaining = remainingMsRef.current;
            timerStartRef.current = Date.now();
            clearTimer();
            autoNextTimeoutRef.current = setTimeout(() => onNext?.(), remaining);
            startTimerAnimation(remaining);
            setIsPaused(false);
        } else {
            // Pause
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
            if (e.key === "PrintScreen") {
                navigator.clipboard.writeText("Captura de tela bloqueada por direitos autorais.");
            }
        };
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && (e.key === 'p' || e.key === 's' || e.key === 'c')) {
                e.preventDefault();
            }
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
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="bg-card/70 backdrop-blur-xl border border-border/40 rounded-[1.5rem] md:rounded-[3rem] p-4 md:p-10 shadow-2xl shadow-primary/5 relative overflow-hidden select-none print:hidden"
            onCopy={(e) => e.preventDefault()}
            onContextMenu={(e) => e.preventDefault()}
        >
            {/* Subtle Gradient Background Effect */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

            {/* Top Bar with Tags and Actions */}
            {!hideTopBar && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 md:mb-8 gap-3 sm:gap-0 relative z-10">
                    <div className="flex flex-wrap items-center gap-1.5 md:gap-2">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 bg-primary/10 text-primary font-black text-[9px] md:text-[10px] uppercase tracking-wider rounded-full border border-primary/20">
                            <Sparkles className="w-3 h-3" />
                            {banca || "Bizu"}
                        </div>
                        <div className="px-2.5 py-1 md:px-3 md:py-1.5 bg-muted/50 text-muted-foreground font-bold text-[9px] md:text-[10px] uppercase tracking-wider rounded-full border border-border/50">
                            {year || "2026"}
                        </div>
                        <div className="text-[9px] md:text-[10px] font-black text-muted-foreground/60 uppercase tracking-[0.2em] pl-2.5 md:pl-3 border-l border-border/50">
                            {subject || "Geral"}
                        </div>
                    </div>
                    <div className="flex items-center gap-1 absolute sm:relative top-0 right-0">
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 md:w-9 md:h-9 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                            <Bookmark className="w-3.5 h-3.5 md:w-4 md:h-4 shadow-sm" />
                        </Button>
                        <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 md:w-9 md:h-9 hover:bg-primary/10 hover:text-primary transition-all duration-300">
                            <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4 shadow-sm" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Question Statement */}
            <div
                className="text-base md:text-2xl font-bold leading-tight md:leading-snug mb-6 md:mb-10 text-foreground break-words prose prose-primary dark:prose-invert max-w-none [&>p]:mb-3 md:mb-4 last:[&>p]:mb-0 [&_strong]:text-primary [&_strong]:bg-primary/5 [&_strong]:px-1 [&_strong]:rounded"
                dangerouslySetInnerHTML={{ __html: statement }}
            />

            {/* Options List */}
            <div className="grid grid-cols-1 gap-2.5 md:gap-4 mb-6 md:mb-10">
                <AnimatePresence mode="popLayout">
                    {options.map((option, index) => {
                        const isCorrect = option.id === correctOptionId;
                        const isSelected = option.id === selectedOption;

                        return (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05, duration: 0.4, ease: "easeOut" }}
                                onClick={() => handleSelect(option.id)}
                                disabled={isSubmitted}
                                className={cn(
                                    "w-full flex items-center gap-3 md:gap-4 p-3.5 md:p-6 rounded-[1.25rem] md:rounded-[2rem] border-2 text-left transition-all duration-500 relative overflow-hidden group",
                                    !isSubmitted && isSelected && "border-primary bg-primary/5 shadow-xl shadow-primary/10 ring-4 ring-primary/5 z-10",
                                    !isSubmitted && !isSelected && "border-border/60 bg-muted/10 hover:border-primary/30 hover:bg-primary/[0.02] hover:translate-x-1",
                                    isSubmitted && isCorrect && !isSimuladoMode && "border-success bg-success/10 shadow-xl shadow-success/10 ring-4 ring-success/5 md:translate-x-2",
                                    isSubmitted && isSelected && !isCorrect && !isSimuladoMode && "border-danger bg-danger/10 shadow-xl shadow-danger/10 ring-4 ring-danger/5",
                                    isSubmitted && !isCorrect && !isSelected && !isSimuladoMode && "opacity-30 grayscale-[0.5] scale-[0.98]",
                                    isSubmitted && isSelected && isSimuladoMode && "border-primary bg-primary/5 shadow-md"
                                )}
                            >
                                <div className={cn(
                                    "flex-shrink-0 w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center font-black text-xs md:text-sm border-2 transition-all duration-500",
                                    isSelected && !isSubmitted ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/40 rotate-12" : "bg-background border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary",
                                    isSubmitted && isCorrect && !isSimuladoMode && "bg-success border-success text-white shadow-lg shadow-success/40 scale-110",
                                    isSubmitted && isSelected && !isCorrect && !isSimuladoMode && "bg-danger border-danger text-white shadow-lg shadow-danger/40",
                                    isSubmitted && isSelected && isSimuladoMode && "bg-primary border-primary text-primary-foreground"
                                )}>
                                    {option.id}
                                </div>
                                <div
                                    className="flex-1 text-[13px] md:text-base font-bold leading-relaxed prose prose-sm dark:prose-invert [&>p]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: option.text }}
                                />
                                {isSubmitted && isCorrect && !isSimuladoMode && (
                                    <motion.div initial={{ scale: 0, rotate: -45 }} animate={{ scale: 1, rotate: 0 }} className="shrink-0 relative z-10">
                                        <div className="bg-white rounded-full p-0.5 shadow-sm">
                                            <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-success" />
                                        </div>
                                    </motion.div>
                                )}
                                {isSubmitted && isSelected && !isCorrect && !isSimuladoMode && (
                                    <motion.div initial={{ scale: 0, rotate: 45 }} animate={{ scale: 1, rotate: 0 }} className="shrink-0 relative z-10">
                                        <div className="bg-white rounded-full p-0.5 shadow-sm">
                                            <XCircle className="w-5 h-5 md:w-6 md:h-6 text-danger" />
                                        </div>
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Bottom Section: Footer Actions and Feedback */}
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-5 md:pt-8 border-t border-border/30">
                <Button variant="ghost" className="rounded-2xl font-black flex items-center gap-2 h-10 md:h-14 justify-center text-[10px] md:text-sm hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all duration-300">
                    <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
                    COMENTÁRIOS DA COMUNIDADE
                </Button>

                {isSimuladoMode ? (
                    !isSubmitted ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className={cn(
                                "rounded-[1rem] md:rounded-[1.25rem] px-8 md:px-10 h-12 md:h-14 font-black text-sm md:text-base shadow-2xl transition-all duration-500",
                                selectedOption ? "bg-primary text-white shadow-primary/40 hover:scale-[1.05] hover:shadow-primary/60 active:scale-95" : "bg-muted text-muted-foreground opacity-50 cursor-not-allowed"
                            )}
                        >
                            Confirmar Resposta
                        </Button>
                    ) : (
                        <Button
                            onClick={onNext}
                            className="rounded-[1rem] md:rounded-[1.25rem] px-8 md:px-10 h-12 md:h-14 font-black text-sm md:text-base bg-foreground text-background shadow-2xl shadow-black/20 hover:scale-[1.05] active:scale-95 transition-all duration-500"
                        >
                            Próxima Questão
                        </Button>
                    )
                ) : isSubmitted ? (
                    /* ── Timer Controls: Pause/Resume + Skip ── */
                    <div className="flex items-stretch gap-2 w-full sm:w-auto">
                        {/* Pause / Resume button */}
                        <motion.button
                            onClick={handlePauseResume}
                            whileTap={{ scale: 0.93 }}
                            title={isPaused ? "Retomar contagem" : "Pausar contagem"}
                            className={cn(
                                "flex items-center justify-center w-12 md:w-14 h-12 md:h-14 rounded-[1rem] md:rounded-[1.25rem] border-2 transition-all duration-300 flex-shrink-0",
                                isPaused
                                    ? "bg-amber-50 border-amber-300 text-amber-600 shadow-md shadow-amber-100 hover:bg-amber-100"
                                    : "bg-primary/[0.03] border-primary/15 text-primary/50 hover:bg-primary/[0.08] hover:border-primary/30 hover:text-primary/70"
                            )}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isPaused ? (
                                    <motion.div
                                        key="play"
                                        initial={{ scale: 0.6, opacity: 0, rotate: -10 }}
                                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                                        exit={{ scale: 0.6, opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <Play className="w-4 h-4 md:w-[18px] md:h-[18px] fill-current" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="pause"
                                        initial={{ scale: 0.6, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.6, opacity: 0 }}
                                        transition={{ duration: 0.18 }}
                                    >
                                        <Pause className="w-4 h-4 md:w-[18px] md:h-[18px] fill-current" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        {/* Skip button with countdown bar */}
                        <motion.button
                            onClick={handleSkip}
                            whileTap={{ scale: 0.97 }}
                            className="flex-1 sm:w-[230px] h-12 md:h-14 rounded-[1rem] md:rounded-[1.25rem] border-2 overflow-hidden relative group transition-all duration-300 bg-primary/[0.03] border-primary/15 hover:bg-primary/[0.08] hover:border-primary/30"
                        >
                            {/* Content */}
                            <div className="flex items-center justify-center gap-2.5 h-full relative z-10 px-4">
                                <AnimatePresence mode="wait" initial={false}>
                                    {isPaused ? (
                                        <motion.div
                                            key="paused-state"
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="flex items-center gap-2.5"
                                        >
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                            <div className="flex flex-col items-start">
                                                <span className="text-[9px] md:text-[10px] font-black text-amber-600/90 uppercase tracking-widest leading-none">Pausado</span>
                                                <span className="text-[7px] md:text-[8px] text-muted-foreground/50 uppercase font-bold tracking-wide leading-none mt-0.5">Clique para pular</span>
                                            </div>
                                            <SkipForward className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary/50 transition-colors ml-1" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="running-state"
                                            initial={{ opacity: 0, y: 4 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -4 }}
                                            className="flex items-center gap-2"
                                        >
                                            <motion.div
                                                animate={{ rotate: 360 }}
                                                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                            >
                                                <Sparkles className="w-3.5 h-3.5 md:w-4 md:h-4 text-primary/50 group-hover:text-primary transition-colors" />
                                            </motion.div>
                                            <div className="flex flex-col items-start">
                                                <span className="text-[9px] md:text-[10px] font-black text-primary/70 uppercase tracking-widest leading-none group-hover:text-primary transition-colors">Avançando...</span>
                                                <span className="text-[7px] md:text-[8px] text-muted-foreground/40 uppercase font-bold tracking-wide leading-none mt-0.5 group-hover:text-primary/50 transition-colors">Clique para pular</span>
                                            </div>
                                            <SkipForward className="w-3.5 h-3.5 text-muted-foreground/30 group-hover:text-primary/50 transition-colors ml-1" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Countdown progress bar */}
                            <div className="absolute bottom-0 left-0 h-[3px] w-full bg-primary/5">
                                <motion.div
                                    animate={timerControls}
                                    className={cn(
                                        "h-full shadow-[0_0_8px_rgba(99,102,241,0.4)] transition-colors duration-300",
                                        isPaused ? "bg-amber-400/60" : "bg-primary/50"
                                    )}
                                />
                            </div>
                        </motion.button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 text-[9px] md:text-[10px] font-black text-muted-foreground/30 uppercase tracking-widest pr-4">
                        <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                        Escolha uma alternativa
                    </div>
                )}
            </div>

            {/* Detailed Resolution Area */}
            <AnimatePresence>
                {isSubmitted && resolution && !isSimuladoMode && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                        className="mt-6 md:mt-12"
                    >
                        <div className="p-5 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] bg-primary/[0.02] border border-primary/10 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-success/40 via-success to-success/40 opacity-30" />
                            <div className="flex items-center gap-2.5 md:gap-3 mb-5 md:mb-6">
                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-success/10 flex items-center justify-center text-success border border-success/20">
                                    <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5" />
                                </div>
                                <div>
                                    <h4 className="font-black text-foreground text-xs md:text-sm uppercase tracking-widest leading-none mb-1 md:mb-1.5">Gabarito Comentado</h4>
                                    <p className="text-[9px] md:text-[10px] text-muted-foreground font-bold uppercase tracking-wider">Aprenda com o erro ou reforce o acerto</p>
                                </div>
                            </div>
                            <div
                                className="text-sm md:text-lg leading-relaxed text-foreground/80 font-medium prose prose-primary dark:prose-invert max-w-none [&>p]:mb-3 md:mb-4 last:[&>p]:mb-0 selection:bg-success/20"
                                dangerouslySetInnerHTML={{ __html: resolution }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
