"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Zap, Target, Swords, Trophy, BookOpen, Clock, Flame } from "lucide-react";

interface XPInfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function XPInfoModal({ isOpen, onClose }: XPInfoModalProps) {
    const rules = [
        { icon: Target, label: "Questões do Quiz", xp: "+10 XP", desc: "Por cada questão respondida corretamente nos treinos diários." },
        { icon: BookOpen, label: "Simulados Oficiais", xp: "Até 100 XP", desc: "XP base (50) + bônus por desempenho ao finalizar um simulado completo." },
        { icon: BookOpen, label: "Quizzes de Módulos", xp: "Até 40 XP", desc: "XP base (20) + bônus por desempenho ao finalizar um quiz de aula." },
        { icon: Swords, label: "Arena PVP (Vitória)", xp: "+100 XP", desc: "Vença um duelo contra outro aluno na Arena." },
        { icon: Swords, label: "Arena PVP (Empate)", xp: "+50 XP", desc: "Ambos ganham XP em caso de empate técnico." },
        { icon: Swords, label: "Arena PVP (Derrota)", xp: "+25 XP & Axons", desc: "Mesmo perdendo, você ganha XP e Axons pela participação." },
        { icon: Clock, label: "Sessão Pomodoro", xp: "1 XP & Axon / min", desc: "Ganhe recompensas proporcionais ao tempo de foco cronometrado." },
        { icon: Target, label: "Completar Tarefa", xp: "+25 XP & Axons", desc: "Mantenha sua agenda em dia e ganhe bônus por cada tarefa concluída." },
        { icon: Trophy, label: "Conquistas (Badges)", xp: "50-500 XP", desc: "Ganhe bônus massivos ao desbloquear insignias raras." },
        { icon: Flame, label: "Ofensiva (Streak)", xp: "Bônus Diário", desc: "Mantenha sua sequência de estudos para ganhar mais XP." },
    ];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="relative w-full max-w-lg bg-white rounded-[32px] shadow-2xl overflow-hidden border border-slate-200"
                    >
                        {/* Header */}
                        <div className="bg-indigo-600 p-8 text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                            <div className="relative z-10">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                                        <Zap className="w-6 h-6 fill-current" />
                                    </div>
                                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>
                                <h2 className="text-2xl font-black italic tracking-tight">Manual do Estudante Elite</h2>
                                <p className="text-indigo-100/80 text-sm font-medium">Saiba como ganhar XP, Axons e subir de patente.</p>
                            </div>
                        </div>

                        {/* Rules List */}
                        <div className="p-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            <div className="space-y-4">
                                {rules.map((rule, i) => (
                                    <div key={i} className="flex items-start gap-4 p-4 rounded-2xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all">
                                        <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shrink-0">
                                            <rule.icon className="w-5 h-5 text-indigo-600" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h3 className="font-bold text-slate-900 text-[14px]">{rule.label}</h3>
                                                <span className="text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">{rule.xp}</span>
                                            </div>
                                            <p className="text-[12px] text-slate-500 font-medium leading-relaxed">
                                                {rule.desc}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-6 bg-slate-50/80 border-t border-slate-100">
                            <button
                                onClick={onClose}
                                className="w-full py-4 bg-slate-900 text-white font-black rounded-2xl hover:bg-slate-800 transition-all hover:scale-[1.01]"
                            >
                                Entendi, vamos evoluir!
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
