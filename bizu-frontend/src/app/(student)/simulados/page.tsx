"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText, CheckCircle2, PlayCircle,
    Calendar, Target,
    Clock, Trophy,
    Lock, Star, BookOpen, Sparkles
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";

type SimuladoTab = "disponiveis" | "concluidos" | "meus";

const statusConfig: Record<string, any> = {
    disponivel: { label: "Disponivel", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    em_andamento: { label: "Em andamento", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    concluido: { label: "Concluido", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    bloqueado: { label: "Em breve", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

import { motion } from "framer-motion";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";

export default function SimuladosPage() {
    const { isFree } = useAuth();
    const [activeTab, setActiveTab] = useState<SimuladoTab>("disponiveis");
    const [realSimulados, setRealSimulados] = useState<any[]>([]);
    const [performance, setPerformance] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDados = async () => {
            setIsLoading(true);
            try {
                const [simRes, perfRes] = await Promise.all([
                    apiFetch("/simulados/disponiveis"),
                    apiFetch("/student/performance/summary")
                ]);

                if (simRes.ok) setRealSimulados(await simRes.json());
                if (perfRes.ok) setPerformance(await perfRes.json());
            } catch (error) {
                console.error("Failed to fetch student data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDados();
    }, []);

    const mappedSimulados = realSimulados.map(sim => {
        const isFuture = sim.startDate && new Date(sim.startDate) > new Date();
        const isPast = sim.endDate && new Date(sim.endDate) < new Date();

        let status = "disponivel";
        if (isFuture) status = "bloqueado";
        if (isPast) status = "concluido";

        return {
            id: sim.id,
            title: sim.title,
            description: sim.description,
            questions: sim.questions?.length || 0,
            status: status,
            date: sim.startDate ? new Date(sim.startDate).toLocaleDateString('pt-BR') : "-",
            course: sim.course?.title || "Geral",
            themeColor: sim.course?.themeColor,
            textColor: sim.course?.textColor,
        };
    });

    const completed = mappedSimulados.filter(s => s.status === "concluido");
    const avgScore = performance?.overallAccuracy ? parseFloat(performance.overallAccuracy).toFixed(1) : "0";

    const displayedSimulados = activeTab === "concluidos"
        ? mappedSimulados.filter(s => s.status === "concluido")
        : activeTab === "disponiveis"
            ? mappedSimulados.filter(s => s.status !== "concluido")
            : mappedSimulados;

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Simulados Premium"
                    description="O acesso aos simulados de concurso é exclusivo para assinantes. Aperfeiçoe seus estudos e ganhe vantagem na aprovação!"
                />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative overflow-hidden pb-12">
            {/* Design Background elements */}
            <div className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />
            <div className="pointer-events-none absolute top-1/2 -left-40 h-[600px] w-[600px] rounded-full bg-primary/5 blur-[120px]" />

            <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-5xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-10 md:mb-12">
                    <PageHeader
                        title="Simulados de Concurso"
                        description="Treine em tempo real com questões selecionadas e cronometradas."
                        badge="MARIA PENHA ET AL."
                    />

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-success/10 text-success text-xs font-black rounded-2xl border border-success/20 shadow-sm">
                            <CheckCircle2 size={16} />
                            <span>{completed.length} CONCLUÍDOS</span>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary text-xs font-black rounded-2xl border border-primary/20 shadow-sm">
                            <Target size={16} />
                            <span>{avgScore}% PERFORMANCE</span>
                        </div>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
                    {[
                        { label: "Realizados", val: String(completed.length), icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-500/10" },
                        { label: "Média Geral", val: `${avgScore}%`, icon: Target, color: "text-blue-500", bg: "bg-blue-500/10" },
                        { label: "Melhor Nota", val: "-", icon: Star, color: "text-amber-500", bg: "bg-amber-500/10" },
                        { label: "Ranking", val: "-", icon: Trophy, color: "text-violet-500", bg: "bg-violet-500/10" },
                    ].map((s, idx) => {
                        const Icon = s.icon;
                        return (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                key={s.label}
                                className="bg-card/40 backdrop-blur-md border border-border/50 p-5 rounded-[1.5rem] shadow-xl shadow-primary/5 hover:border-primary/30 transition-all"
                            >
                                <div className={`w-9 h-9 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3 shadow-inner`}>
                                    <Icon size={18} />
                                </div>
                                <div className="text-2xl font-black text-foreground">{s.val}</div>
                                <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{s.label}</div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Tabs & List Section */}
                <div className="bg-card/50 backdrop-blur-xl border border-border/40 rounded-[2.5rem] p-6 md:p-8 shadow-2xl shadow-primary/5">
                    <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
                        {([
                            { key: "disponiveis" as SimuladoTab, label: "Disponíveis agora" },
                            { key: "concluidos" as SimuladoTab, label: "Histórico" },
                            { key: "meus" as SimuladoTab, label: "Todos" },
                        ]).map(f => (
                            <button
                                key={f.key}
                                onClick={() => setActiveTab(f.key)}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === f.key ? "bg-primary text-white shadow-lg shadow-primary/30" : "bg-muted/50 text-muted-foreground hover:bg-primary/5 hover:text-primary"}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    <div className="space-y-4">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-20 gap-4 opacity-40">
                                <Sparkles className="w-8 h-8 animate-spin text-primary" />
                                <span className="font-black text-xs uppercase tracking-[0.2em]">Carregando simulados...</span>
                            </div>
                        ) : displayedSimulados.length === 0 ? (
                            <div className="text-center p-16 rounded-[2rem] border-2 border-dashed border-border/40">
                                <FileText className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
                                <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">
                                    Nenhum simulado disponível no momento.
                                </p>
                            </div>
                        ) : displayedSimulados.map((sim, idx) => {
                            const sConfig = statusConfig[sim.status] || statusConfig["disponivel"];
                            return (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={sim.id}
                                    className={`group relative bg-background/50 hover:bg-background rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 border border-border/50 hover:border-primary/30 transition-all duration-300 ${sim.status === "bloqueado" ? "opacity-50" : "hover:shadow-2xl hover:shadow-primary/5"}`}
                                >
                                    <div className="flex flex-col md:flex-row md:items-center gap-5">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-3 flex-wrap">
                                                <div className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${sConfig.bg} ${sConfig.color} ${sConfig.border}`}>
                                                    {sConfig.label}
                                                </div>
                                                <div className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">
                                                    {sim.course}
                                                </div>
                                            </div>
                                            <h3 className="text-lg md:text-xl font-black text-foreground mb-1 group-hover:text-primary transition-colors">{sim.title}</h3>
                                            <p className="text-xs md:text-sm text-muted-foreground font-medium mb-4 line-clamp-1">{sim.description}</p>

                                            <div className="flex items-center gap-5">
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <BookOpen className="w-4 h-4 text-primary/40" />
                                                    {sim.questions} QUESTÕES
                                                </div>
                                                <div className="flex items-center gap-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                                                    <Clock className="w-4 h-4 text-primary/40" />
                                                    {sim.date}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0">
                                            {sim.status === "disponivel" && (
                                                <Link href={`/simulados/${sim.id}`}>
                                                    <Button className="rounded-2xl h-12 md:h-14 px-8 font-black uppercase tracking-widest text-xs gap-2 shadow-xl shadow-primary/20 hover:scale-105 transition-all">
                                                        <PlayCircle className="w-5 h-5" />
                                                        Iniciar Simulado
                                                    </Button>
                                                </Link>
                                            )}
                                            {sim.status === "bloqueado" && (
                                                <div className="flex items-center gap-2 bg-muted/50 px-6 py-3 rounded-2xl">
                                                    <Lock size={16} className="text-muted-foreground" />
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Em breve</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}
