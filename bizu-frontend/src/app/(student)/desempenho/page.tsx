"use client";

import PageHeader from "@/components/PageHeader";
import {
    BarChart3,
    Target,
    TrendingUp,
    PieChart,
    ChevronRight,
    AlertCircle
} from "lucide-react";
import { motion } from "framer-motion";

export default function PerformancePage() {
    const stats = [
        { subject: "Direito Administrativo", total: 450, correct: 382, color: "bg-blue-500" },
        { subject: "Direito Constitucional", total: 320, correct: 290, color: "bg-purple-500" },
        { subject: "Direito Civil", total: 200, correct: 140, color: "bg-amber-500" },
        { subject: "Processo Penal", total: 150, correct: 110, color: "bg-emerald-500" },
    ];

    const overallAccuracy = 82;

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <PageHeader
                title="Meu Desempenho"
                description="Analise sua evolução, identifique pontos fracos e domine as matérias."
                badge="ANALYTICS"
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-8 rounded-[40px] bg-card border flex flex-col items-center justify-center text-center space-y-2 relative overflow-hidden group"
                >
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-2">
                        <Target className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black">{overallAccuracy}%</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Precisão Geral</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-8 rounded-[40px] bg-card border flex flex-col items-center justify-center text-center space-y-2"
                >
                    <div className="w-12 h-12 rounded-2xl bg-success/10 flex items-center justify-center text-success mb-2">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black">1.120</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Questões Resolvidas</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-8 rounded-[40px] bg-card border flex flex-col items-center justify-center text-center space-y-2"
                >
                    <div className="w-12 h-12 rounded-2xl bg-warning/10 flex items-center justify-center text-warning mb-2">
                        <BarChart3 className="w-6 h-6" />
                    </div>
                    <div className="text-4xl font-black">12h</div>
                    <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Tempo de Estudo</div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-8 rounded-[40px] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 flex flex-col items-center justify-center text-center space-y-2"
                >
                    <div className="text-4xl font-black">TOP 5%</div>
                    <div className="text-xs font-black uppercase tracking-widest opacity-80">Ranking Global</div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Performance by Subject */}
                <div className="lg:col-span-8 p-10 rounded-[48px] bg-card border">
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black flex items-center gap-3">
                            <PieChart className="w-6 h-6 text-primary" />
                            Desempenho por Matéria
                        </h3>
                    </div>

                    <div className="space-y-8">
                        {stats.map((item, idx) => {
                            const accuracy = Math.round((item.correct / item.total) * 100);
                            return (
                                <div key={item.subject} className="group cursor-default">
                                    <div className="flex justify-between items-end mb-3">
                                        <div>
                                            <div className="font-bold text-lg group-hover:text-primary transition-colors">{item.subject}</div>
                                            <div className="text-xs text-muted-foreground font-medium">{item.correct} acertos de {item.total} questões</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xl font-black">{accuracy}%</div>
                                        </div>
                                    </div>
                                    <div className="h-4 bg-muted rounded-full overflow-hidden border p-[2px]">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${accuracy}%` }}
                                            transition={{ duration: 1, delay: idx * 0.1 }}
                                            className={`h-full rounded-full ${item.color} shadow-[0_0_10px_rgba(var(--primary),0.3)]`}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Weak Points & Tips */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="p-8 rounded-[40px] bg-card border border-warning/20 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-warning/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        <h4 className="text-lg font-black mb-6 flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-warning" />
                            Atenção Necessária
                        </h4>
                        <div className="space-y-4">
                            <div className="p-4 rounded-2xl bg-muted/30 border border-dashed">
                                <div className="font-bold text-sm mb-1 uppercase tracking-tight">Direito Civil</div>
                                <p className="text-xs text-muted-foreground">Sua precisão em Contratos caiu 15% esta semana. Recomendamos revisar a base teórica.</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 rounded-[48px] bg-primary/5 border border-primary/20 flex flex-col items-center text-center">
                        <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-primary-foreground mb-6 shadow-xl shadow-primary/40">
                            <TrendingUp className="w-8 h-8" />
                        </div>
                        <h4 className="text-xl font-black mb-4">Meta de Estudo</h4>
                        <p className="text-sm text-muted-foreground mb-8">Faltam apenas 15 questões para você atingir sua meta diária e ganhar bônus de XP!</p>
                        <button className="w-full h-14 rounded-2xl bg-primary text-primary-foreground font-black text-lg gap-2 flex items-center justify-center hover:scale-105 transition-transform">
                            Continuar agora
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
