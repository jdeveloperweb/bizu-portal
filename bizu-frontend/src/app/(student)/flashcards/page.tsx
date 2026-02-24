"use client";

import { useState } from "react";
import Link from "next/link";
import {
    Layers, Plus, BookOpen, Shield, Scale, Gavel,
    ChevronRight, Target, Brain, Zap, Clock,
    Star, TrendingUp, CheckCircle2, BarChart3,
    Flame, PlayCircle,
} from "lucide-react";

interface Deck {
    id: string;
    title: string;
    description: string;
    icon: typeof Shield;
    cardCount: number;
    newCards: number;
    dueCards: number;
    progress: number;
    lastStudied: string;
    color: string;
}

const decks: Deck[] = [
    {
        id: "1", title: "Direito Administrativo", description: "Atos, Poderes e Organizacao Administrativa.",
        icon: Shield, cardCount: 120, newCards: 15, dueCards: 23, progress: 65, lastStudied: "Ha 2 horas", color: "from-indigo-500 to-violet-600",
    },
    {
        id: "2", title: "Direito Constitucional", description: "Direitos Fundamentais e Organizacao do Estado.",
        icon: Scale, cardCount: 200, newCards: 42, dueCards: 35, progress: 30, lastStudied: "Ha 1 dia", color: "from-emerald-500 to-teal-600",
    },
    {
        id: "3", title: "Processo Penal", description: "Prisoes, Inquerito e Acao Penal.",
        icon: Gavel, cardCount: 85, newCards: 0, dueCards: 8, progress: 90, lastStudied: "Ha 3 dias", color: "from-amber-500 to-orange-600",
    },
    {
        id: "4", title: "Direito Civil", description: "Contratos, Obrigacoes e Responsabilidade Civil.",
        icon: BookOpen, cardCount: 150, newCards: 28, dueCards: 18, progress: 45, lastStudied: "Ha 5 horas", color: "from-rose-500 to-pink-600",
    },
];

export default function FlashcardsPage() {
    const totalCards = decks.reduce((a, d) => a + d.cardCount, 0);
    const totalDue = decks.reduce((a, d) => a + d.dueCards, 0);
    const totalNew = decks.reduce((a, d) => a + d.newCards, 0);
    const avgProgress = Math.round(decks.reduce((a, d) => a + d.progress, 0) / decks.length);

    return (
        <div className="p-6 lg:p-8 max-w-[1100px]">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Flashcards</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Minhas Colecoes
                    </h1>
                    <p className="text-sm text-slate-500">Memorize conceitos com repeticao espacada.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Clock size={13} /> {totalDue} pendentes
                    </div>
                    <button className="btn-primary !h-10 !text-[12px] !px-5">
                        <Plus size={15} /> Nova Colecao
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Total de cartas", val: String(totalCards), icon: Layers, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Pendentes hoje", val: String(totalDue), icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
                    { label: "Novas", val: String(totalNew), icon: Star, bg: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "Progresso medio", val: `${avgProgress}%`, icon: TrendingUp, bg: "bg-violet-50", text: "text-violet-600" },
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                    {/* Deck List */}
                    {decks.map(deck => {
                        const Icon = deck.icon;
                        return (
                            <div key={deck.id} className="card-elevated !rounded-2xl p-5 hover:!transform-none group">
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${deck.color} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className="text-[14px] font-bold text-slate-800">{deck.title}</h3>
                                            {deck.newCards > 0 && (
                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                    {deck.newCards} novas
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-[11px] text-slate-400 mb-3">{deck.description}</p>

                                        {/* Progress bar */}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className={`h-full rounded-full bg-gradient-to-r ${deck.color} transition-all duration-700`}
                                                    style={{ width: `${deck.progress}%` }} />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-600">{deck.progress}%</span>
                                        </div>

                                        <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                            <span className="flex items-center gap-1"><Layers size={10} /> {deck.cardCount} cartas</span>
                                            <span className="flex items-center gap-1"><Clock size={10} /> {deck.dueCards} pendentes</span>
                                            <span>{deck.lastStudied}</span>
                                        </div>
                                    </div>
                                    <Link href="/flashcards/estudar"
                                        className="btn-primary !h-9 !text-[11px] !px-4 shrink-0">
                                        <PlayCircle size={13} /> Revisar
                                    </Link>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Collection */}
                    <button className="w-full card-elevated !rounded-2xl p-6 hover:!transform-none border-2 border-dashed !border-slate-200 hover:!border-indigo-300 transition-all group">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                                <Brain size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <span className="text-[13px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Nova Colecao</span>
                            <span className="text-[11px] text-slate-400">Adicione flashcards ou importe de um curso</span>
                        </div>
                    </button>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Today's Session */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target size={14} className="text-indigo-500" /> Sessao de Hoje
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: "Cartas para revisar", value: String(totalDue), color: "text-amber-600" },
                                { label: "Novas para aprender", value: String(totalNew), color: "text-indigo-600" },
                                { label: "Tempo estimado", value: `${Math.round(totalDue * 0.5)}min`, color: "text-emerald-600" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between py-1.5">
                                    <span className="text-[12px] text-slate-500">{s.label}</span>
                                    <span className={`text-[13px] font-extrabold ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/flashcards/estudar" className="btn-primary !h-9 !text-[11px] w-full mt-4">
                            <Zap size={12} /> Iniciar Revisao
                        </Link>
                    </div>

                    {/* Study Tips */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Dica do Dia</span>
                        </div>
                        <p className="text-[11px] text-indigo-500 leading-relaxed">
                            A repeticao espacada e mais eficiente quando voce revisa no momento certo. Nao deixe cartas acumularem - revise diariamente!
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Acoes Rapidas
                        </h3>
                        <div className="space-y-2">
                            <Link href="/questoes/treino" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Target size={14} className="text-slate-400" /> Resolver questoes
                            </Link>
                            <Link href="/pomodoro" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Clock size={14} className="text-slate-400" /> Iniciar Pomodoro
                            </Link>
                            <Link href="/anotacoes" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <BookOpen size={14} className="text-slate-400" /> Ver anotacoes
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
