"use client";

import { useState } from "react";
import Link from "next/link";
import {
    ClipboardList, Timer, FileText, CheckCircle2, PlayCircle,
    Calendar, TrendingUp, Target, Flame, BarChart3,
    Clock, ChevronRight, Trophy, Filter, Zap,
    Lock, Star,
} from "lucide-react";

type SimuladoStatus = "disponivel" | "em_andamento" | "concluido" | "bloqueado";
type SimuladoTab = "disponiveis" | "concluidos" | "meus";

interface Simulado {
    id: string;
    title: string;
    description: string;
    questions: number;
    time: number;
    status: SimuladoStatus;
    difficulty: "Facil" | "Medio" | "Dificil";
    score?: number;
    accuracy?: number;
    ranking?: number;
    totalParticipants?: number;
    date: string;
    subjects: string[];
}

const simulados: Simulado[] = [
    {
        id: "1", title: "Simulado Geral TRF - Semanal #12", description: "50 questoes multidisciplinares com foco em Direito Administrativo e Constitucional.",
        questions: 50, time: 120, status: "disponivel", difficulty: "Medio", date: "Disponivel ate Dom, 02 Mar",
        subjects: ["D. Administrativo", "D. Constitucional", "D. Civil"],
    },
    {
        id: "2", title: "Legislacao Especial - Delegado PC", description: "30 questoes sobre legislacao especial para o concurso de Delegado PC.",
        questions: 30, time: 60, status: "concluido", difficulty: "Dificil", score: 85, accuracy: 85, ranking: 12, totalParticipants: 234, date: "Concluido em 20 Fev",
        subjects: ["Leg. Especial", "Processo Penal"],
    },
    {
        id: "3", title: "Estatuto da Magistratura (LOMAN)", description: "20 questoes focadas na Lei Organica da Magistratura Nacional.",
        questions: 20, time: 45, status: "disponivel", difficulty: "Dificil", date: "Disponivel ate Sex, 28 Fev",
        subjects: ["D. Constitucional", "Org. Judiciaria"],
    },
    {
        id: "4", title: "Mini Simulado - Direito Civil", description: "Simulado rapido com 15 questoes de Direito Civil, foco em contratos e obrigacoes.",
        questions: 15, time: 30, status: "concluido", difficulty: "Facil", score: 93, accuracy: 93, ranking: 5, totalParticipants: 189, date: "Concluido em 18 Fev",
        subjects: ["D. Civil"],
    },
    {
        id: "5", title: "Simulado Nacional - Proxima semana", description: "Grande simulado com 100 questoes multidisciplinares. Competicao nacional.",
        questions: 100, time: 240, status: "bloqueado", difficulty: "Dificil", date: "Disponivel em 03 Mar",
        subjects: ["Multidisciplinar"],
    },
];

const statusConfig = {
    disponivel: { label: "Disponivel", color: "text-indigo-600", bg: "bg-indigo-50", border: "border-indigo-100" },
    em_andamento: { label: "Em andamento", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
    concluido: { label: "Concluido", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
    bloqueado: { label: "Em breve", color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" },
};

const difficultyConfig = {
    Facil: { color: "text-emerald-600", bg: "bg-emerald-50" },
    Medio: { color: "text-amber-600", bg: "bg-amber-50" },
    Dificil: { color: "text-red-600", bg: "bg-red-50" },
};

export default function SimuladosPage() {
    const [activeTab, setActiveTab] = useState<SimuladoTab>("disponiveis");

    const completed = simulados.filter(s => s.status === "concluido");
    const available = simulados.filter(s => s.status === "disponivel" || s.status === "bloqueado");
    const avgScore = completed.length > 0 ? Math.round(completed.reduce((a, s) => a + (s.score || 0), 0) / completed.length) : 0;

    const displayedSimulados = activeTab === "concluidos"
        ? simulados.filter(s => s.status === "concluido")
        : activeTab === "disponiveis"
        ? simulados.filter(s => s.status !== "concluido")
        : simulados;

    return (
        <div className="p-6 lg:p-8 max-w-[1100px]">
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
                    { label: "Melhor nota", val: "93%", icon: Star, bg: "bg-amber-50", text: "text-amber-600" },
                    { label: "Melhor ranking", val: "#5", icon: Trophy, bg: "bg-violet-50", text: "text-violet-600" },
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
                        className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${
                            activeTab === f.key ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
                        }`}>
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Simulados List */}
            <div className="space-y-3">
                {displayedSimulados.map(sim => {
                    const sConfig = statusConfig[sim.status];
                    const dConfig = difficultyConfig[sim.difficulty];
                    return (
                        <div key={sim.id} className={`card-elevated !rounded-2xl p-5 hover:!transform-none ${sim.status === "bloqueado" ? "opacity-60" : ""}`}>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${sConfig.bg} ${sConfig.color} ${sConfig.border} border`}>
                                            {sConfig.label}
                                        </span>
                                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${dConfig.bg} ${dConfig.color}`}>
                                            {sim.difficulty}
                                        </span>
                                        {sim.subjects.map(s => (
                                            <span key={s} className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <h3 className="text-[14px] font-bold text-slate-800 mb-1">{sim.title}</h3>
                                    <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">{sim.description}</p>
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><FileText size={10} /> {sim.questions} questoes</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Timer size={10} /> {sim.time} min</span>
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1"><Calendar size={10} /> {sim.date}</span>
                                        {sim.score !== undefined && (
                                            <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                                                <CheckCircle2 size={10} /> Nota: {sim.score}%
                                            </span>
                                        )}
                                        {sim.ranking !== undefined && (
                                            <span className="text-[10px] font-bold text-indigo-600 flex items-center gap-1">
                                                <Trophy size={10} /> #{sim.ranking} de {sim.totalParticipants}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    {sim.status === "disponivel" && (
                                        <Link href={`/questoes/treino?simulado=${sim.id}`}
                                            className="btn-primary !h-9 !text-[12px] !px-5">
                                            <PlayCircle size={14} /> Iniciar
                                        </Link>
                                    )}
                                    {sim.status === "concluido" && (
                                        <>
                                            <Link href={`/questoes/treino?simulado=${sim.id}&revisao=true`}
                                                className="px-4 py-2 rounded-xl text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 hover:bg-indigo-100 transition-all">
                                                Revisar
                                            </Link>
                                            <Link href={`/questoes/treino?simulado=${sim.id}`}
                                                className="px-4 py-2 rounded-xl text-[11px] font-bold text-slate-500 bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-all">
                                                Refazer
                                            </Link>
                                        </>
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
