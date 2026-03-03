"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, BookOpen, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Material {
    id: string;
    title: string;
}

interface Module {
    id: string;
    title: string;
}

interface Props {
    material: Material;
    module: Module;
    onClose: () => void;
    onStart: (count: number, category: "QUIZ" | "SIMULADO") => void;
}

const COUNT_OPTIONS = [10, 20, 30, 50];

export default function GenerateQuestionsModal({ material, module, onClose, onStart }: Props) {
    const [count, setCount] = useState(20);
    const [category, setCategory] = useState<"QUIZ" | "SIMULADO">("QUIZ");

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                onClick={onClose}
            />
            <motion.div
                initial={{ scale: 0.9, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.9, y: 20, opacity: 0 }}
                className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl relative z-10"
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-indigo-600 px-8 py-7 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-all"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div className="min-w-0">
                            <h2 className="text-xl font-black text-white">Gerar Questões com IA</h2>
                            <p className="text-violet-200 text-sm font-medium mt-0.5 truncate">{material.title}</p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8 space-y-7">
                    {/* Module info */}
                    <div className="flex items-center gap-3 px-4 py-3 bg-slate-50 rounded-xl border">
                        <BookOpen className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Módulo vinculado</p>
                            <p className="text-sm font-bold text-slate-700">{module.title}</p>
                        </div>
                    </div>

                    {/* Category selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Tipo de Questão
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            {([
                                {
                                    value: "QUIZ" as const,
                                    label: "Quiz Rápido",
                                    desc: "Objetivas e diretas",
                                    icon: <Zap className="w-5 h-5" />,
                                    activeClass: "border-violet-500 bg-violet-50",
                                    iconClass: "bg-violet-100 text-violet-600",
                                },
                                {
                                    value: "SIMULADO" as const,
                                    label: "Simulado",
                                    desc: "Narrativas militares",
                                    icon: <BookOpen className="w-5 h-5" />,
                                    activeClass: "border-blue-500 bg-blue-50",
                                    iconClass: "bg-blue-100 text-blue-600",
                                },
                            ] as const).map((opt) => (
                                <button
                                    key={opt.value}
                                    onClick={() => setCategory(opt.value)}
                                    className={cn(
                                        "p-4 rounded-xl border-2 text-left transition-all",
                                        category === opt.value ? opt.activeClass : "border-slate-200 hover:border-slate-300"
                                    )}
                                >
                                    <div
                                        className={cn(
                                            "w-9 h-9 rounded-xl flex items-center justify-center mb-3",
                                            category === opt.value ? opt.iconClass : "bg-slate-100 text-slate-400"
                                        )}
                                    >
                                        {opt.icon}
                                    </div>
                                    <p className="font-black text-slate-800 text-sm">{opt.label}</p>
                                    <p className="text-xs text-slate-400 font-medium mt-0.5">{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Count selector */}
                    <div className="space-y-3">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">
                            Quantidade de Questões
                        </label>
                        <div className="flex gap-2">
                            {COUNT_OPTIONS.map((n) => (
                                <button
                                    key={n}
                                    onClick={() => setCount(n)}
                                    className={cn(
                                        "flex-1 h-12 rounded-xl font-black text-sm transition-all border-2",
                                        count === n
                                            ? "border-violet-500 bg-violet-50 text-violet-700"
                                            : "border-slate-200 text-slate-500 hover:border-slate-300"
                                    )}
                                >
                                    {n}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex gap-3 pt-1">
                        <Button
                            variant="ghost"
                            onClick={onClose}
                            className="flex-1 h-12 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                        >
                            Cancelar
                        </Button>
                        <Button
                            onClick={() => onStart(count, category)}
                            className="flex-1 h-12 rounded-xl font-black bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white shadow-lg shadow-violet-200 gap-2"
                        >
                            <Sparkles className="w-4 h-4" />
                            Gerar {count} Questões
                        </Button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
