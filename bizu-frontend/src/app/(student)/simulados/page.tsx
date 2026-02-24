"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    FileText, CheckCircle2, PlayCircle,
    Calendar, Target,
    Clock, Trophy,
    Lock, Star, BookOpen
} from "lucide-react";
import { apiFetch } from "@/lib/api";

type SimuladoTab = "disponiveis" | "concluidos" | "meus";

const statusConfig: Record<string, any> = {
    disponivel: { label: "Disponivel", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    em_andamento: { label: "Em andamento", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    concluido: { label: "Concluido", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    bloqueado: { label: "Em breve", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

export default function SimuladosPage() {
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
            course: sim.course?.title || "Geral"
        };
    });

    const completed = mappedSimulados.filter(s => s.status === "concluido");
    const avgScore = performance?.overallAccuracy ? parseFloat(performance.overallAccuracy).toFixed(1) : "0";

    const displayedSimulados = activeTab === "concluidos"
        ? mappedSimulados.filter(s => s.status === "concluido")
        : activeTab === "disponiveis"
            ? mappedSimulados.filter(s => s.status !== "concluido")
            : mappedSimulados;

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1100px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Simulados</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Simulados
                    </h1>
                    <p className="text-sm text-slate-500">Treine com tempo real e questoes selecionadas para o seu concurso.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                        <CheckCircle2 size={13} /> {completed.length} concluidos
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <Target size={13} /> {avgScore}% media
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Realizados", val: String(completed.length), icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "Media geral", val: `${avgScore}%`, icon: Target, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Melhor nota", val: "-", icon: Star, bg: "bg-amber-50", text: "text-amber-600" },
                    { label: "Melhor ranking", val: "-", icon: Trophy, bg: "bg-violet-50", text: "text-violet-600" },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-4 hover:!transform-none">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                                    <Icon size={13} className={s.text} />
                                </div>
                            </div>
                            <div className="text-xl font-extrabold text-slate-900">{s.val}</div>
                            <div className="text-[11px] text-slate-400">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 mb-5">
                {([
                    { key: "disponiveis" as SimuladoTab, label: "Disponiveis" },
                    { key: "concluidos" as SimuladoTab, label: "Concluidos" },
                    { key: "meus" as SimuladoTab, label: "Todos" },
                ]).map(f => (
                    <button key={f.key} onClick={() => setActiveTab(f.key)}
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${activeTab === f.key ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
                            }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Simulados List */}
            <div className="space-y-3">
                {isLoading ? (
                    <div className="text-center p-8 text-muted-foreground">Carregando simulados...</div>
                ) : displayedSimulados.length === 0 ? (
                    <div className="text-center p-8 text-muted-foreground bg-slate-50 rounded-2xl border border-slate-100">
                        Nenhum simulado encontrado nesta categoria.
                    </div>
                ) : displayedSimulados.map(sim => {
                    const sConfig = statusConfig[sim.status] || statusConfig["disponivel"];
                    return (
                        <div key={sim.id} className={`card-elevated !rounded-2xl p-5 hover:!transform-none ${sim.status === "bloqueado" ? "opacity-60" : ""}`}>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sConfig.bg} ${sConfig.color} ${sConfig.border} border`}>
                                            {sConfig.label}
                                        </span>
                                        <span className="text-[9px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                                            {sim.course}
                                        </span>
                                    </div>
                                    <h3 className="text-[14px] font-bold text-slate-800 mb-1">{sim.title}</h3>
                                    <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">{sim.description}</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><FileText size={10} /> {sim.questions} questoes</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10} /> {sim.date}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {sim.status === "disponivel" && (
                                        <Link href={`/questoes/treino?simulado=${sim.id}`}
                                            className="btn-primary !h-9 !text-[12px] !px-5">
                                            <PlayCircle size={14} /> Iniciar
                                        </Link>
                                    )}
                                    {sim.status === "bloqueado" && (
                                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400">
                                            <Lock size={13} /> Em breve
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
