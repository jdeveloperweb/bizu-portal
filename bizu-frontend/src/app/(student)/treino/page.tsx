"use client";

import PageHeader from "@/components/PageHeader";
import {
    Settings2,
    CheckCircle2,
    ChevronRight,
    Layers,
    Target,
    BarChart3,
    Calendar,
    Plus
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function CustomQuizPage() {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState(20);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const subjects = [
        "Direito Administrativo",
        "Direito Constitucional",
        "Direito Civil",
        "Processo Penal",
        "Direito Tributário",
        "Língua Portuguesa"
    ];

    const toggleSubject = (s: string) => {
        setSelectedSubjects(prev =>
            prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]
        );
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-4xl">
            <PageHeader
                title="Treino Rápido"
                description="Configure seu quiz ideal para memorização. Selecione assuntos, nível e quantidade de questões."
                badge="CUSTOM QUIZ"
            />

            <div className="grid grid-cols-1 gap-8 mt-12">
                {/* Step 1: Subjects */}
                <div className="bg-card border rounded-[48px] p-10 space-y-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">01</div>
                        <h3 className="text-2xl font-black">Selecione as Matérias</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {subjects.map(s => (
                            <button
                                key={s}
                                onClick={() => toggleSubject(s)}
                                className={`p-6 rounded-[32px] border-2 text-left transition-all flex items-center justify-between group ${selectedSubjects.includes(s) ? 'border-primary bg-primary/5' : 'hover:border-primary/30'}`}
                            >
                                <span className="font-bold">{s}</span>
                                {selectedSubjects.includes(s) ? (
                                    <CheckCircle2 className="w-6 h-6 text-primary" />
                                ) : (
                                    <Plus className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Step 2: Configuration */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-card border rounded-[48px] p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">02</div>
                            <h3 className="text-xl font-black">Quantidade</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {[10, 20, 50].map(n => (
                                <button
                                    key={n}
                                    onClick={() => setQuestionCount(n)}
                                    className={`py-4 rounded-2xl font-black border-2 transition-all ${questionCount === n ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/20'}`}
                                >
                                    {n} Q
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="bg-card border rounded-[48px] p-10 space-y-8">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black">03</div>
                            <h3 className="text-xl font-black">Dificuldade</h3>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                            {(['easy', 'medium', 'hard'] as const).map(d => (
                                <button
                                    key={d}
                                    onClick={() => setDifficulty(d)}
                                    className={`py-4 rounded-2xl font-black border-2 transition-all capitalize ${difficulty === d ? 'border-primary bg-primary/5 text-primary' : 'hover:border-primary/20'}`}
                                >
                                    {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : 'Difícil'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Action */}
                <div className="flex flex-col items-center pt-8">
                    <Button className="w-full md:w-80 h-16 rounded-[24px] font-black text-xl gap-3 shadow-2xl shadow-primary/30 hover:scale-105 transition-transform" disabled={selectedSubjects.length === 0}>
                        Gerar Treino
                        <ChevronRight className="w-6 h-6" />
                    </Button>
                    <p className="mt-4 text-xs font-bold text-muted-foreground uppercase tracking-widest text-center">
                        Isso consumirá 1 ticket de treino personalizado
                    </p>
                </div>
            </div>
        </div>
    );
}
