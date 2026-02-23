"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    RotateCcw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    HelpCircle,
    ArrowRight,
    BrainCircuit
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function FlashcardStudyPage() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [finished, setFinished] = useState(false);

    const flashcards = [
        {
            id: "1",
            question: "Qual o prazo para anulação de atos administrativos favoráveis ao destinatário de boa-fé?",
            answer: "5 anos, salvo comprovada má-fé (conforme Lei 9.784/99).",
            subject: "Direito Administrativo",
            topic: "Atos Administrativos"
        },
        {
            id: "2",
            question: "Quais são os requisitos de validade do ato administrativo (COM-FI-FOR-M-OB)?",
            answer: "Competência, Finalidade, Forma, Motivo e Objeto.",
            subject: "Direito Administrativo",
            topic: "Poderes"
        },
        {
            id: "3",
            question: "Diferença entre Anulação e Revogação do ato administrativo?",
            answer: "Anulação incide sobre atos ILEGAIS (Efeito Ex-Tunc). Revogação incide sobre atos LEGAIS por conveniência e oportunidade (Efeito Ex-Nunc).",
            subject: "Direito Administrativo",
            topic: "Controle da Administração"
        }
    ];

    const handleRate = (rating: 'easy' | 'medium' | 'hard') => {
        setIsFlipped(false);
        setTimeout(() => {
            if (currentIndex < flashcards.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setFinished(true);
            }
        }, 300);
    };

    if (finished) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="text-center space-y-8 max-w-lg">
                    <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <BrainCircuit className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-black">Revisão Concluída!</h1>
                    <p className="text-muted-foreground">Você revisou todas as cartas programadas para hoje no tópico de <b>Direito Administrativo</b>.</p>
                    <div className="flex flex-col gap-3 pt-4">
                        <Link href="/flashcards">
                            <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                                Voltar para Coleções
                            </Button>
                        </Link>
                        <Button variant="ghost" className="h-14 font-bold" onClick={() => window.location.reload()}>
                            <RotateCcw className="w-4 h-4 mr-2" /> Revisar Novamente
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="h-20 bg-background border-b flex items-center px-4 md:px-8 justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/flashcards">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="hidden md:block">
                        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">Revisando</div>
                        <div className="font-bold">{flashcards[currentIndex].subject}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                        {currentIndex + 1} / {flashcards.length}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="relative h-[450px] w-full [perspective:1000px] mb-12">
                    <motion.div
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        className="w-full h-full [transform-style:preserve-3d] cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 [backface-visibility:hidden] p-10 rounded-[48px] bg-card border-2 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
                            <div className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">Pergunta</div>
                            <h2 className="text-2xl font-bold leading-relaxed">{flashcards[currentIndex].question}</h2>
                            <div className="absolute bottom-10 flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                <ArrowRight className="w-4 h-4" /> Toque para virar
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-10 rounded-[48px] bg-primary text-primary-foreground shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
                            <div className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Resposta</div>
                            <p className="text-xl font-medium leading-relaxed">{flashcards[currentIndex].answer}</p>
                            <div className="absolute bottom-10 opacity-60 flex items-center gap-2 font-bold text-sm text-white">
                                <HelpCircle className="w-4 h-4" /> Como foi sua lembrança?
                            </div>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            <button
                                onClick={() => handleRate('hard')}
                                className="p-6 rounded-[32px] bg-card border-2 border-danger/20 hover:bg-danger/5 hover:border-danger transition-all group"
                            >
                                <XCircle className="w-8 h-8 text-danger mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-black uppercase tracking-tight text-danger">Difícil</div>
                                <div className="text-[10px] text-muted-foreground font-bold">Revisar amanhã</div>
                            </button>

                            <button
                                onClick={() => handleRate('medium')}
                                className="p-6 rounded-[32px] bg-card border-2 border-warning/20 hover:bg-warning/5 hover:border-warning transition-all group"
                            >
                                <AlertCircle className="w-8 h-8 text-warning mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-black uppercase tracking-tight text-warning">Médio</div>
                                <div className="text-[10px] text-muted-foreground font-bold">Revisar em 3 dias</div>
                            </button>

                            <button
                                onClick={() => handleRate('easy')}
                                className="p-6 rounded-[32px] bg-card border-2 border-success/20 hover:bg-success/5 hover:border-success transition-all group"
                            >
                                <CheckCircle2 className="w-8 h-8 text-success mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-black uppercase tracking-tight text-success">Fácil</div>
                                <div className="text-[10px] text-muted-foreground font-bold">Revisar em 7 dias</div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
