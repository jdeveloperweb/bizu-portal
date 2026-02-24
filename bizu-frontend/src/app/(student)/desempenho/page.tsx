"use client";

import { useState } from "react";
import Link from "next/link";
import {
    TrendingUp, Target, BarChart3, PieChart, AlertCircle,
    ChevronRight, Flame, Trophy, BookOpen, CheckCircle2,
    ArrowUp, ArrowDown, Brain, Zap, Clock,
    Calendar, Star, Activity, PlayCircle,
} from "lucide-react";

type DesempenhoTab = "geral" | "materias" | "evolucao";

interface SubjectStat {
    subject: string;
    shortName: string;
    total: number;
    correct: number;
    accuracy: number;
    trend: number;
    color: string;
    weakTopics: string[];
}

const subjectStats: SubjectStat[] = [
    { subject: "Direito Constitucional", shortName: "D. Const.", total: 320, correct: 290, accuracy: 91, trend: 3, color: "#6366F1", weakTopics: ["Controle de Constitucionalidade", "Ordem Social"] },
    { subject: "Direito Administrativo", shortName: "D. Admin.", total: 450, correct: 382, accuracy: 85, trend: -2, color: "#8B5CF6", weakTopics: ["Atos Administrativos", "Licitacoes"] },
    { subject: "Direito Penal", shortName: "D. Penal", total: 280, correct: 238, accuracy: 85, trend: 5, color: "#059669", weakTopics: ["Crimes contra o Patrimonio"] },
    { subject: "Direito Civil", shortName: "D. Civil", total: 200, correct: 140, accuracy: 70, trend: -4, color: "#F59E0B", weakTopics: ["Contratos", "Responsabilidade Civil", "Obrigacoes"] },
    { subject: "Processo Civil", shortName: "P. Civil", total: 180, correct: 140, accuracy: 78, trend: 1, color: "#EC4899", weakTopics: ["Recursos", "Tutela Provisoria"] },
    { subject: "Processo Penal", shortName: "P. Penal", total: 150, correct: 110, accuracy: 73, trend: 2, color: "#14B8A6", weakTopics: ["Provas em Especie", "Nulidades"] },
];

const weeklyData = [
    { day: "Seg", questions: 32, accuracy: 81 },
    { day: "Ter", questions: 45, accuracy: 78 },
    { day: "Qua", questions: 28, accuracy: 85 },
    { day: "Qui", questions: 52, accuracy: 82 },
    { day: "Sex", questions: 38, accuracy: 79 },
    { day: "Sab", questions: 15, accuracy: 87 },
    { day: "Dom", questions: 20, accuracy: 90 },
];

export default function DesempenhoPage() {
    const [activeTab, setActiveTab] = useState<DesempenhoTab>("geral");
    const [selectedSubject, setSelectedSubject] = useState<SubjectStat | null>(null);

    const totalQuestions = subjectStats.reduce((a, s) => a + s.total, 0);
    const totalCorrect = subjectStats.reduce((a, s) => a + s.correct, 0);
    const overallAccuracy = Math.round((totalCorrect / totalQuestions) * 100);
    const weakSubjects = subjectStats.filter(s => s.accuracy < 75).sort((a, b) => a.accuracy - b.accuracy);
    const strongSubjects = subjectStats.filter(s => s.accuracy >= 85).sort((a, b) => b.accuracy - a.accuracy);
    const maxWeeklyQuestions = Math.max(...weeklyData.map(d => d.questions));
    const weeklyTotal = weeklyData.reduce((a, d) => a + d.questions, 0);

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Analytics</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Meu Desempenho
                    </h1>
                    <p className="text-sm text-slate-500">Analise sua evolucao, identifique pontos fracos e otimize seus estudos.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                        <Target size={13} /> {overallAccuracy}% geral
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <Activity size={13} /> {weeklyTotal} esta semana
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Questoes resolvidas", val: totalQuestions.toLocaleString(), icon: BarChart3, bg: "bg-indigo-50", text: "text-indigo-600", delta: "+124 esta semana" },
                    { label: "Taxa de acerto", val: `${overallAccuracy}%`, icon: Target, bg: "bg-emerald-50", text: "text-emerald-600", delta: "+3% vs anterior" },
                    { label: "Tempo de estudo", val: "47h", icon: Clock, bg: "bg-violet-50", text: "text-violet-600", delta: "8h esta semana" },
                    { label: "Ranking geral", val: "#142", icon: Trophy, bg: "bg-amber-50", text: "text-amber-600", delta: "Subiu 18 pos." },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-4 hover:!transform-none">
                            <div className="flex items-center justify-between mb-3">
                                <div className={`w-8 h-8 rounded-lg ${s.bg} flex items-center justify-center`}>
                                    <Icon size={15} className={s.text} />
                                </div>
                                <span className="text-[9px] text-emerald-600 font-semibold bg-emerald-50 px-1.5 py-0.5 rounded-full">{s.delta}</span>
                            </div>
                            <div className="text-xl font-extrabold text-slate-900">{s.val}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="card-elevated !rounded-2xl p-1.5 flex gap-1 mb-6">
                {([
                    { key: "geral" as DesempenhoTab, label: "Visao Geral", icon: PieChart },
                    { key: "materias" as DesempenhoTab, label: "Por Materia", icon: BookOpen },
                    { key: "evolucao" as DesempenhoTab, label: "Evolucao", icon: TrendingUp },
                ]).map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all ${active ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                                }`}>
                            <Icon size={14} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-5">
                    {/* General Tab - Subject bars */}
                    {activeTab === "geral" && (
                        <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <PieChart size={14} className="text-indigo-500" /> Desempenho por Materia
                            </h3>
                            <div className="space-y-4">
                                {subjectStats.map(stat => (
                                    <button key={stat.subject} onClick={() => setSelectedSubject(stat)}
                                        className="w-full text-left group">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: stat.color }} />
                                                <span className="text-[12px] font-bold text-slate-700 group-hover:text-indigo-600 transition-colors">
                                                    {stat.subject}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] text-slate-400">{stat.correct}/{stat.total}</span>
                                                <span className="text-[13px] font-extrabold" style={{ color: stat.color }}>{stat.accuracy}%</span>
                                                {stat.trend > 0 ? (
                                                    <span className="text-[9px] font-bold text-emerald-600 flex items-center"><ArrowUp size={8} />{stat.trend}%</span>
                                                ) : (
                                                    <span className="text-[9px] font-bold text-red-500 flex items-center"><ArrowDown size={8} />{Math.abs(stat.trend)}%</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${stat.accuracy}%`, backgroundColor: stat.color }} />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Materias Tab - Detailed cards */}
                    {activeTab === "materias" && (
                        <div className="space-y-3">
                            {subjectStats.map(stat => (
                                <div key={stat.subject} className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: stat.color }} />
                                            <h4 className="text-[14px] font-bold text-slate-800">{stat.subject}</h4>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[20px] font-extrabold" style={{ color: stat.color }}>{stat.accuracy}%</span>
                                            {stat.trend > 0 ? (
                                                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ArrowUp size={8} />{stat.trend}%</span>
                                            ) : (
                                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full flex items-center gap-0.5"><ArrowDown size={8} />{Math.abs(stat.trend)}%</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden mb-3">
                                        <div className="h-full rounded-full transition-all" style={{ width: `${stat.accuracy}%`, backgroundColor: stat.color }} />
                                    </div>
                                    <div className="flex items-center gap-4 text-[11px] text-slate-400 mb-3">
                                        <span>{stat.total} questoes</span>
                                        <span>{stat.correct} acertos</span>
                                        <span>{stat.total - stat.correct} erros</span>
                                    </div>
                                    {stat.weakTopics.length > 0 && (
                                        <div>
                                            <span className="text-[10px] font-bold text-slate-500 mb-1.5 block">Pontos de atencao:</span>
                                            <div className="flex gap-1.5 flex-wrap">
                                                {stat.weakTopics.map(t => (
                                                    <span key={t} className="text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Evolution Tab - Weekly chart */}
                    {activeTab === "evolucao" && (
                        <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                            <h3 className="text-sm font-bold text-slate-800 mb-5 flex items-center gap-2">
                                <Activity size={14} className="text-indigo-500" /> Atividade Semanal
                            </h3>
                            <div className="flex items-end gap-2 h-40 mb-4">
                                {weeklyData.map(d => (
                                    <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-[10px] font-bold text-slate-500">{d.questions}</span>
                                        <div className="w-full rounded-t-lg bg-gradient-to-t from-indigo-500 to-violet-500 transition-all"
                                            style={{ height: `${(d.questions / maxWeeklyQuestions) * 100}%`, minHeight: "8px" }} />
                                        <span className="text-[10px] text-slate-400 font-semibold">{d.day}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="grid grid-cols-3 gap-3 pt-4 border-t border-slate-100">
                                <div className="text-center">
                                    <div className="text-lg font-extrabold text-slate-800">{weeklyTotal}</div>
                                    <div className="text-[10px] text-slate-400">Questoes na semana</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-extrabold text-emerald-600">{Math.round(weeklyData.reduce((a, d) => a + d.accuracy, 0) / weeklyData.length)}%</div>
                                    <div className="text-[10px] text-slate-400">Media de acerto</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-extrabold text-indigo-600">7</div>
                                    <div className="text-[10px] text-slate-400">Dias ativos</div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Weak Points */}
                    {weakSubjects.length > 0 && (
                        <div className="card-elevated !rounded-2xl p-5 hover:!transform-none border-amber-100">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <AlertCircle size={14} className="text-amber-500" /> Atencao Necessaria
                            </h3>
                            <div className="space-y-3">
                                {weakSubjects.map(s => (
                                    <div key={s.subject} className="p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-[12px] font-bold text-slate-700">{s.shortName}</span>
                                            <span className="text-[12px] font-extrabold text-amber-600">{s.accuracy}%</span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 mb-2">Revise: {s.weakTopics.join(", ")}</p>
                                        <Link href="/questoes/treino" className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-0.5">
                                            Praticar <ChevronRight size={9} />
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Strong Points */}
                    {strongSubjects.length > 0 && (
                        <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                            <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Star size={14} className="text-emerald-500" /> Pontos Fortes
                            </h3>
                            <div className="space-y-2.5">
                                {strongSubjects.map(s => (
                                    <div key={s.subject} className="flex items-center justify-between py-1.5">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                                            <span className="text-[12px] text-slate-600 font-medium">{s.shortName}</span>
                                        </div>
                                        <span className="text-[12px] font-extrabold text-emerald-600">{s.accuracy}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Study Goal CTA */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Meta de Hoje</span>
                        </div>
                        <p className="text-[11px] text-indigo-500 mb-3">Faltam 15 questoes para atingir sua meta diaria e ganhar bonus de XP!</p>
                        <div className="h-1.5 bg-indigo-100 rounded-full overflow-hidden mb-3">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600" style={{ width: "70%" }} />
                        </div>
                        <Link href="/questoes/treino" className="btn-primary !h-8 !text-[11px] w-full">
                            <PlayCircle size={12} /> Continuar estudando
                        </Link>
                    </div>

                    {/* Quick Actions */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Brain size={14} className="text-indigo-500" /> Sugestoes da IA
                        </h3>
                        <div className="space-y-2">
                            <Link href="/questoes/treino" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Target size={14} className="text-slate-400" /> Focar em Direito Civil
                            </Link>
                            <Link href="/pomodoro" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Clock size={14} className="text-slate-400" /> Sessao de Processo Penal
                            </Link>
                            <Link href="/flashcards" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <BookOpen size={14} className="text-slate-400" /> Revisar flashcards atrasados
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

