"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Bookmark, MessageSquare, Share2, CheckCircle2, XCircle } from "lucide-react";

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
}

export default function QuestionViewer({
    statement,
    options,
    correctOptionId,
    resolution,
    onNext,
}: QuestionProps) {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSelect = (id: string) => {
        if (!isSubmitted) setSelectedOption(id);
    };

    const handleSubmit = () => {
        if (selectedOption) setIsSubmitted(true);
    };

    return (
        <div className="bg-card border rounded-2xl md:rounded-3xl p-5 md:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 md:mb-8 gap-4 sm:gap-0">
                <div className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest break-words w-full sm:w-auto pr-8 sm:pr-0">
                    Questão de Prova • TRF4 • 2024
                </div>
                <div className="flex items-center gap-1 sm:gap-2 absolute sm:relative top-5 right-5 sm:top-0 sm:right-0">
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 sm:w-10 sm:h-10">
                        <Bookmark className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full w-8 h-8 sm:w-10 sm:h-10">
                        <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </Button>
                </div>
            </div>

            <div className="text-base md:text-lg font-medium leading-relaxed mb-8 md:mb-10 prose prose-primary dark:prose-invert max-w-none break-words">
                {statement}
            </div>

            <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                {options.map((option) => {
                    const isCorrect = option.id === correctOptionId;
                    const isSelected = option.id === selectedOption;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            disabled={isSubmitted}
                            className={cn(
                                "w-full flex items-start sm:items-center gap-3 md:gap-4 p-4 md:p-5 rounded-xl md:rounded-2xl border-2 text-left transition-all duration-300",
                                !isSubmitted && isSelected && "border-primary bg-primary/5",
                                !isSubmitted && !isSelected && "border-border hover:border-primary/50",
                                isSubmitted && isCorrect && "border-success bg-success/10",
                                isSubmitted && isSelected && !isCorrect && "border-danger bg-danger/10",
                                isSubmitted && !isCorrect && !isSelected && "opacity-50"
                            )}
                        >
                            <div className={cn(
                                "flex-shrink-0 w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold text-xs md:text-sm border-2 mt-0.5 sm:mt-0",
                                isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                            )}>
                                {option.id}
                            </div>
                            <div className="flex-1 text-sm font-medium leading-snug md:leading-normal">
                                {option.text}
                            </div>
                            {isSubmitted && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-success shrink-0" />
                            )}
                            {isSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-danger shrink-0" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <Button variant="ghost" className="rounded-xl font-bold flex items-center gap-2 w-full sm:w-auto h-12 md:h-10 justify-center text-sm md:text-base">
                    <MessageSquare className="w-4 h-4" />
                    12 Comentários
                </Button>

                {!isSubmitted ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className="rounded-2xl px-8 md:px-12 h-14 font-bold text-base md:text-lg shadow-lg shadow-primary/20 w-full sm:w-auto"
                    >
                        Responder
                    </Button>
                ) : (
                    <Button
                        onClick={onNext}
                        className="rounded-2xl px-8 md:px-12 h-14 font-bold text-base md:text-lg variant-secondary w-full sm:w-auto">
                        Próxima Questão
                    </Button>
                )}
            </div>

            {isSubmitted && resolution && (
                <div className="mt-12 p-8 rounded-3xl bg-muted/50 border border-dashed border-border animate-in fade-in slide-in-from-top-4 duration-500">
                    <h4 className="font-bold text-primary mb-4 flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5" />
                        Resolução Bizu!
                    </h4>
                    <div className="text-sm leading-relaxed text-muted-foreground">
                        {resolution}
                    </div>
                </div>
            )}
        </div>
    );
}
