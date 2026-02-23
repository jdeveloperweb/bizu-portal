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
}

export default function QuestionViewer({
    statement,
    options,
    correctOptionId,
    resolution,
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
        <div className="bg-card border rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
                <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
                    Questão de Prova • TRF4 • 2024
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Bookmark className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="rounded-full">
                        <Share2 className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            <div className="text-lg font-medium leading-relaxed mb-10 prose prose-primary dark:prose-invert max-w-none">
                {statement}
            </div>

            <div className="space-y-4 mb-10">
                {options.map((option) => {
                    const isCorrect = option.id === correctOptionId;
                    const isSelected = option.id === selectedOption;

                    return (
                        <button
                            key={option.id}
                            onClick={() => handleSelect(option.id)}
                            disabled={isSubmitted}
                            className={cn(
                                "w-full flex items-center gap-4 p-5 rounded-2xl border-2 text-left transition-all duration-300",
                                !isSubmitted && isSelected && "border-primary bg-primary/5",
                                !isSubmitted && !isSelected && "border-border hover:border-primary/50",
                                isSubmitted && isCorrect && "border-success bg-success/10",
                                isSubmitted && isSelected && !isCorrect && "border-danger bg-danger/10",
                                isSubmitted && !isCorrect && !isSelected && "opacity-50"
                            )}
                        >
                            <div className={cn(
                                "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm border-2",
                                isSelected ? "bg-primary border-primary text-primary-foreground" : "bg-muted border-border text-muted-foreground"
                            )}>
                                {option.id}
                            </div>
                            <div className="flex-1 text-sm font-medium">
                                {option.text}
                            </div>
                            {isSubmitted && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-success" />
                            )}
                            {isSubmitted && isSelected && !isCorrect && (
                                <XCircle className="w-5 h-5 text-danger" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex items-center justify-between">
                <Button variant="ghost" className="rounded-xl font-bold flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    12 Comentários
                </Button>

                {!isSubmitted ? (
                    <Button
                        onClick={handleSubmit}
                        disabled={!selectedOption}
                        className="rounded-2xl px-12 h-14 font-bold text-lg shadow-lg shadow-primary/20"
                    >
                        Responder
                    </Button>
                ) : (
                    <Button className="rounded-2xl px-12 h-14 font-bold text-lg variant-secondary">
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
