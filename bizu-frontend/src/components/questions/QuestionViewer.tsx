"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, MessageSquare, Share2, CheckCircle2, XCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
}: QuestionProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const autoNextTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSelect = (id: string) => {
        if (isSubmitted) return;

        setSelectedOption(id);

        if (!isSimuladoMode) {
            setIsSubmitted(true);
            if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
            autoNextTimeoutRef.current = setTimeout(() => {
                onNext?.();
            }, 5000);
        }
    };

    const handleSubmit = () => {
        if (selectedOption) setIsSubmitted(true);
    };

    useEffect(() => {
        return () => {
            if (autoNextTimeoutRef.current) clearTimeout(autoNextTimeoutRef.current);
        };
    }, []);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="bg-card border-2 border-border/50 rounded-3xl md:rounded-[2.5rem] p-6 md:p-10 shadow-xl shadow-black/5 relative overflow-hidden"
        >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary/40 via-primary to-primary/40 opacity-50" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 md:mb-10 gap-4 sm:gap-0 relative z-10">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider rounded-lg">
                        {banca || "Bizu"}
                    </span>
                    <span className="px-3 py-1 bg-muted text-muted-foreground font-bold text-xs uppercase tracking-wider rounded-lg">
                        {year || "2026"}
                    </span>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-2 border-l-2 border-border/50">
                        {subject || "Geral"}
                    </span>
                </div>
                <div className="flex items-center gap-2 absolute sm:relative top-0 right-0">
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full w-10 h-10 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div
                className="text-lg md:text-xl font-medium leading-relaxed mb-10 md:mb-12 text-foreground break-words prose prose-primary dark:prose-invert max-w-none [&>p]:mb-4 last:[&>p]:mb-0 [&_strong]:text-primary"
                dangerouslySetInnerHTML={{ __html: statement }}
            />

            <div className="space-y-4 mb-10 md:mb-12">
                <AnimatePresence>
                    {options.map((option, index) => {
                        const isCorrect = option.id === correctOptionId;
                        const isSelected = option.id === selectedOption;

                        return (
                            <motion.button
                                key={option.id}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1, duration: 0.3 }}
                                onClick={() => handleSelect(option.id)}
                                disabled={isSubmitted}
                                className={cn(
                                    "w-full flex items-center gap-4 p-5 md:p-6 rounded-2xl border-2 text-left transition-all duration-300 relative overflow-hidden group",
                                    !isSubmitted && isSelected && "border-primary bg-primary/5 shadow-md shadow-primary/10 scale-[1.01] z-10",
                                    !isSubmitted && !isSelected && "border-border hover:border-primary/40 hover:bg-primary/5 hover:scale-[1.01]",
                                    isSubmitted && isCorrect && !isSimuladoMode && "border-success bg-success/10 shadow-md shadow-success/10",
                                    isSubmitted && isSelected && !isCorrect && !isSimuladoMode && "border-danger bg-danger/10 shadow-md shadow-danger/10",
                                    isSubmitted && !isCorrect && !isSelected && !isSimuladoMode && "opacity-40 scale-[0.98]",
                                    isSubmitted && isSelected && isSimuladoMode && "border-primary bg-primary/5"
                                )}
                            >
                                <div className={cn(
                                    "flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm border-2 transition-colors",
                                    isSelected && !isSubmitted ? "bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/50" : "bg-muted/50 border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary",
                                    isSubmitted && isCorrect && !isSimuladoMode && "bg-success border-success text-success-foreground shadow-sm shadow-success/50",
                                    isSubmitted && isSelected && !isCorrect && !isSimuladoMode && "bg-danger border-danger text-danger-foreground shadow-sm shadow-danger/50",
                                    isSubmitted && isSelected && isSimuladoMode && "bg-primary border-primary text-primary-foreground"
                                )}>
                                    {option.id}
                                </div>
                                <div
                                    className="flex-1 text-base font-medium leading-relaxed prose prose-sm dark:prose-invert [&>p]:mb-0"
                                    dangerouslySetInnerHTML={{ __html: option.text }}
                                />
                                {isSubmitted && isCorrect && !isSimuladoMode && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 relative z-10">
                                        <CheckCircle2 className="w-6 h-6 text-success drop-shadow-sm bg-background rounded-full" />
                                    </motion.div>
                                )}
                                {isSubmitted && isSelected && !isCorrect && !isSimuladoMode && (
                                    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="shrink-0 relative z-10">
                                        <XCircle className="w-6 h-6 text-danger drop-shadow-sm bg-background rounded-full" />
                                    </motion.div>
                                )}
                            </motion.button>
                        );
                    })}
                </AnimatePresence>
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-6 md:pt-8 border-t border-border/50">
                <Button variant="ghost" className="rounded-xl font-bold flex items-center gap-2 h-12 md:h-14 justify-center text-sm md:text-base hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                    <MessageSquare className="w-5 h-5" />
                    Ver Comentários
                </Button>

                {isSimuladoMode ? (
                    !isSubmitted ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={!selectedOption}
                            className={cn(
                                "rounded-2xl px-10 h-14 font-black text-lg transition-all duration-300",
                                selectedOption ? "shadow-xl shadow-primary/30 hover:scale-105" : "opacity-50"
                            )}
                        >
                            Responder Agora
                        </Button>
                    ) : (
                        <Button
                            onClick={onNext}
                            className="rounded-2xl px-10 h-14 font-black text-lg transition-all shadow-xl hover:scale-105 duration-300 bg-foreground text-background hover:bg-foreground/90"
                        >
                            Salvar e Continuar
                        </Button>
                    )
                ) : isSubmitted ? (
                    <div className="flex items-center justify-center h-14 px-6 rounded-2xl bg-primary/10 text-primary font-bold text-sm md:text-base">
                        Próxima questão em 5 segundos...
                    </div>
                ) : null}
            </div>

            <AnimatePresence>
                {isSubmitted && resolution && !isSimuladoMode && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, marginTop: 0 }}
                        animate={{ opacity: 1, height: "auto", marginTop: 40 }}
                        exit={{ opacity: 0, height: 0, marginTop: 0 }}
                        transition={{ duration: 0.4, ease: "easeOut" }}
                        className="overflow-hidden"
                    >
                        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 relative">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary rounded-l-3xl" />
                            <h4 className="font-bold text-primary mb-4 flex items-center gap-2 text-lg">
                                <CheckCircle2 className="w-6 h-6" />
                                Resolução Detalhada
                            </h4>
                            <div
                                className="text-base leading-relaxed text-foreground/80 prose prose-sm max-w-none dark:prose-invert [&>p]:mb-4 last:[&>p]:mb-0"
                                dangerouslySetInnerHTML={{ __html: resolution }}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
