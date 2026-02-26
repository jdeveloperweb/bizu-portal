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
    Plus,
    Sparkles
} from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";

export default function CustomQuizPage() {
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [questionCount, setQuestionCount] = useState(20);
    const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');

    const [availableModules, setAvailableModules] = useState<string[]>([]);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const selectedCourseId = getStoredSelectedCourseId();
                if (selectedCourseId) {
                    const res = await apiFetch(`/public/courses/${selectedCourseId}`);
                    if (res.ok) {
                        const data = await res.json();
                        if (data.modules) {
                            setAvailableModules(data.modules.map((m: any) => m.title));
                        }
                    }
                }
            } catch (error) {
                console.error("Error fetching modules:", error);
            }
        };
        fetchModules();
    }, []);


    const toggleSubject = (s: string) => {
        setSelectedSubjects(prev =>
            prev.includes(s) ? prev.filter(i => i !== s) : [...prev, s]
        );
    };

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-20">
            {/* Background Decorations */}
            <div className="pointer-events-none absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/5 blur-[100px]" />
            <div className="pointer-events-none absolute bottom-0 -left-20 h-[400px] w-[400px] rounded-full bg-primary/5 blur-[80px]" />

            <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-5xl relative z-10">
                <div className="max-w-4xl mx-auto">
                    <PageHeader
                        title="Treino Inteligente"
                        description="Personalize sua sessão de estudos. Escolha os temas e o nível de desafio para hoje."
                        badge="CUSTOM QUIZ"
                    />

                    <div className="grid grid-cols-1 gap-6 md:gap-8 mt-10 md:mt-12">
                        {/* Step 1: Subjects */}
                        <section className="bg-card/50 backdrop-blur-xl border border-border/40 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl shadow-primary/5">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-sm md:text-base shadow-lg shadow-primary/20">01</div>
                                <div>
                                    <h3 className="text-xl md:text-2xl font-black text-foreground">Matérias para Estudo</h3>
                                    <p className="text-xs md:text-sm text-muted-foreground font-medium">Selecione um ou mais módulos</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                {availableModules.map(s => (
                                    <button
                                        key={s}
                                        onClick={() => toggleSubject(s)}
                                        className={`p-5 md:p-6 rounded-2xl md:rounded-[2rem] border-2 text-left transition-all duration-300 flex items-center justify-between group ${selectedSubjects.includes(s) ? 'border-primary bg-primary/5 shadow-lg shadow-primary/5' : 'border-border/50 hover:border-primary/30 hover:bg-primary/[0.02]'}`}
                                    >
                                        <span className={`font-bold transition-colors ${selectedSubjects.includes(s) ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`}>{s}</span>
                                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${selectedSubjects.includes(s) ? 'bg-primary text-white scale-110 rotate-12' : 'bg-muted/50 text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'}`}>
                                            {selectedSubjects.includes(s) ? (
                                                <CheckCircle2 className="w-5 h-5" />
                                            ) : (
                                                <Plus className="w-5 h-5" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </section>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                            {/* Step 2: Quantity */}
                            <section className="bg-card/50 backdrop-blur-xl border border-border/40 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl shadow-primary/5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm md:text-base">02</div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black">Quantidade</h3>
                                        <p className="text-xs text-muted-foreground font-medium">Quantas questões deseja?</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    {[10, 20, 50].map(n => (
                                        <button
                                            key={n}
                                            onClick={() => setQuestionCount(n)}
                                            className={`py-4 md:py-5 rounded-2xl font-black text-sm md:text-base border-2 transition-all duration-300 ${questionCount === n ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'border-border/50 hover:border-primary/20 text-muted-foreground'}`}
                                        >
                                            {n} <span className="text-[10px] opacity-70">Q</span>
                                        </button>
                                    ))}
                                </div>
                            </section>

                            {/* Step 3: Difficulty */}
                            <section className="bg-card/50 backdrop-blur-xl border border-border/40 rounded-[2rem] md:rounded-[3rem] p-6 md:p-10 shadow-xl shadow-primary/5 space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm md:text-base">03</div>
                                    <div>
                                        <h3 className="text-lg md:text-xl font-black">Dificuldade</h3>
                                        <p className="text-xs text-muted-foreground font-medium">Nível do desafio</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2.5">
                                    {(['easy', 'medium', 'hard'] as const).map(d => (
                                        <button
                                            key={d}
                                            onClick={() => setDifficulty(d)}
                                            className={`py-4 md:py-5 rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest border-2 transition-all duration-300 ${difficulty === d ? 'border-primary bg-primary text-white shadow-lg shadow-primary/30 scale-105' : 'border-border/50 hover:border-primary/20 text-muted-foreground'}`}
                                        >
                                            {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Médio' : 'Difícil'}
                                        </button>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Action Section */}
                        <div className="flex flex-col items-center pt-6 md:pt-10">
                            <motion.div
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="w-full md:w-auto"
                            >
                                <Button
                                    className="w-full md:w-96 h-16 md:h-20 rounded-[1.5rem] md:rounded-[2.5rem] font-black text-lg md:text-xl gap-3 shadow-2xl shadow-primary/30 bg-primary hover:bg-primary/90 transition-all"
                                    disabled={selectedSubjects.length === 0}
                                >
                                    Gerar Treino agora
                                    <ChevronRight className="w-6 h-6" />
                                </Button>
                            </motion.div>
                            <div className="mt-6 flex items-center gap-2 px-6 py-2 rounded-full bg-primary/5 border border-primary/10">
                                <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">
                                    Consome 1 ticket de treino personalizado
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
