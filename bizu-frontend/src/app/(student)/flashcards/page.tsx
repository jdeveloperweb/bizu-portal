"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Layers, Plus, BookOpen, Shield, Scale, Gavel,
    ChevronRight, Target, Brain, Zap, Clock,
    Star, TrendingUp, CheckCircle2, BarChart3,
    Flame, PlayCircle, Loader2, XCircle
} from "lucide-react";
import { apiFetch } from "@/lib/api";

interface Deck {
    id: string;
    title: string;
    description: string;
    icon: string;
    totalCards: number;
    newCards: number;
    dueCards: number;
    progress: number;
    lastStudied: string;
    color: string;
}

interface Summary {
    totalCards: number;
    totalDue: number;
    totalNew: number;
    avgProgress: number;
}

const ICON_MAP: Record<string, any> = {
    Shield, Scale, Gavel, BookOpen, Brain, Layers, Target, Zap, Clock, Star, TrendingUp
};

export default function FlashcardsPage() {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeck, setNewDeck] = useState({ title: "", description: "", icon: "Layers", color: "from-indigo-500 to-violet-600" });
    const [isSaving, setIsSaving] = useState(false);

    const fetchData = async () => {
        try {
            const [decksRes, summaryRes] = await Promise.all([
                apiFetch("/student/flashcards/decks"),
                apiFetch("/student/flashcards/summary")
            ]);

            if (decksRes.ok && summaryRes.ok) {
                const decksData = await decksRes.json();
                const summaryData = await summaryRes.json();
                setDecks(decksData);
                setSummary(summaryData);
            }
        } catch (error) {
            console.error("Error fetching flashcards:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const res = await apiFetch("/student/flashcards/decks", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDeck)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setNewDeck({ title: "", description: "", icon: "Layers", color: "from-indigo-500 to-violet-600" });
                fetchData();
            }
        } catch (error) {
            console.error("Error creating deck:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-medium">Carregando suas coleções...</p>
            </div>
        );
    }

    const totalCards = summary?.totalCards || 0;
    const totalDue = summary?.totalDue || 0;
    const totalNew = summary?.totalNew || 0;
    const avgProgress = summary?.avgProgress || 0;

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Flashcards</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Minhas Coleções
                    </h1>
                    <p className="text-sm text-slate-500">Memorize conceitos com repetição espaçada.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Clock size={13} /> {totalDue} pendentes
                    </div>
                    <button onClick={() => setIsModalOpen(true)} className="btn-primary !h-10 !text-[12px] !px-5 whitespace-nowrap">
                        <Plus size={15} /> Nova Coleção
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Total de cartas", val: String(totalCards), icon: Layers, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Pendentes hoje", val: String(totalDue), icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
                    { label: "Novas", val: String(totalNew), icon: Star, bg: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "Progresso médio", val: `${avgProgress}%`, icon: TrendingUp, bg: "bg-violet-50", text: "text-violet-600" },
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
                    {decks.length > 0 ? (
                        decks.map(deck => {
                            const Icon = ICON_MAP[deck.icon] || BookOpen;
                            const colorClass = deck.color || "from-indigo-500 to-violet-600";
                            return (
                                <div key={deck.id} className="card-elevated !rounded-2xl p-5 hover:!transform-none group">
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
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
                                            <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{deck.description}</p>

                                            {/* Progress bar */}
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
                                                        style={{ width: `${deck.progress}%` }} />
                                                </div>
                                                <span className="text-[11px] font-bold text-slate-600">{deck.progress}%</span>
                                            </div>

                                            <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                                <span className="flex items-center gap-1"><Layers size={10} /> {deck.totalCards} cartas</span>
                                                <span className="flex items-center gap-1"><Clock size={10} /> {deck.dueCards} pendentes</span>
                                                <span>{deck.lastStudied}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2 shrink-0">
                                            <Link href={`/flashcards/estudar?deckId=${deck.id}`}
                                                className="btn-primary !h-9 !text-[11px] !px-4 whitespace-nowrap">
                                                <PlayCircle size={13} /> Revisar
                                            </Link>
                                            <Link href={`/flashcards/gerenciar?deckId=${deck.id}`}
                                                className="btn-outline !h-9 !text-[11px] !px-4 !border-slate-200 !text-slate-600 hover:!bg-slate-50 whitespace-nowrap flex items-center justify-center gap-1.5 rounded-xl font-bold">
                                                <Plus size={12} /> Cartas
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="card-elevated !rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed !border-slate-200">
                            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                <Layers size={32} className="text-slate-300" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Nenhuma coleção encontrada</h3>
                                <p className="text-sm text-slate-500 max-w-md mx-auto">
                                    Você ainda não possui coleções de flashcards. Adicione uma nova coleção ou importe de um curso para começar a estudar.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Add New Collection */}
                    <button onClick={() => setIsModalOpen(true)} className="w-full card-elevated !rounded-2xl p-6 hover:!transform-none border-2 border-dashed !border-slate-200 hover:!border-indigo-300 transition-all group">
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                                <Brain size={18} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            </div>
                            <span className="text-[13px] font-bold text-slate-500 group-hover:text-indigo-600 transition-colors">Nova Coleção</span>
                            <span className="text-[11px] text-slate-400">Adicione flashcards ou importe de um curso</span>
                        </div>
                    </button>
                </div>

                {/* Modal for New Collection */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-slate-900">Nova Coleção</h2>
                                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleCreateDeck} className="space-y-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Título</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all"
                                        placeholder="Ex: Legislação de Trânsito"
                                        value={newDeck.title}
                                        onChange={e => setNewDeck({ ...newDeck, title: e.target.value })}
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Descrição</label>
                                    <textarea
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none"
                                        rows={3}
                                        placeholder="Uma breve descrição sobre o que será estudado..."
                                        value={newDeck.description}
                                        onChange={e => setNewDeck({ ...newDeck, description: e.target.value })}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Ícone</label>
                                        <select
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                                            value={newDeck.icon}
                                            onChange={e => setNewDeck({ ...newDeck, icon: e.target.value })}
                                        >
                                            <option value="Layers">Camadas</option>
                                            <option value="Brain">Cérebro</option>
                                            <option value="Target">Alvo</option>
                                            <option value="Zap">Raio</option>
                                            <option value="BookOpen">Livro</option>
                                            <option value="Shield">Escudo</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Cor</label>
                                        <select
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all appearance-none"
                                            value={newDeck.color}
                                            onChange={e => setNewDeck({ ...newDeck, color: e.target.value })}
                                        >
                                            <option value="from-indigo-500 to-violet-600">Índigo</option>
                                            <option value="from-emerald-500 to-teal-600">Esmeralda</option>
                                            <option value="from-rose-500 to-pink-600">Rosa</option>
                                            <option value="from-amber-500 to-orange-600">Âmbar</option>
                                            <option value="from-blue-500 to-indigo-600">Azul</option>
                                        </select>
                                    </div>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="w-full btn-primary !h-12 !text-md mt-4 gap-2"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus size={20} />}
                                    Criar Coleção
                                </button>
                            </form>
                        </div>
                    </div>
                )}

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Today's Session */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Target size={14} className="text-indigo-500" /> Sessão de Hoje
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: "Cartas para revisar", value: String(totalDue), color: "text-amber-600" },
                                { label: "Novas para aprender", value: String(totalNew), color: "text-indigo-600" },
                                { label: "Tempo estimado", value: `${Math.round(totalDue * 0.5 + totalNew * 1)}min`, color: "text-emerald-600" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between py-1.5">
                                    <span className="text-[12px] text-slate-500">{s.label}</span>
                                    <span className={`text-[13px] font-extrabold ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                        <Link href="/flashcards/estudar" className="btn-primary !h-9 !text-[11px] w-full mt-4">
                            <Zap size={12} /> Iniciar Revisão
                        </Link>
                    </div>

                    {/* Study Tips */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Brain size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Dica do Dia</span>
                        </div>
                        <p className="text-[11px] text-indigo-500 leading-relaxed">
                            A repetição espaçada é mais eficiente quando você revisa no momento certo. Não deixe cartas acumularem - revise diariamente!
                        </p>
                    </div>

                    {/* Quick Actions */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Ações Rápidas
                        </h3>
                        <div className="space-y-2">
                            <Link href="/questoes/treino" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Target size={14} className="text-slate-400" /> Resolver questões
                            </Link>
                            <Link href="/pomodoro" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Clock size={14} className="text-slate-400" /> Iniciar Pomodoro
                            </Link>
                            <Link href="/anotacoes" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <BookOpen size={14} className="text-slate-400" /> Ver anotações
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
