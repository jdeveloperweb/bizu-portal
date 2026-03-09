"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Layers, Plus, BookOpen, Shield, Scale, Gavel,
    ChevronRight, Target, Brain, Zap, Clock,
    Star, TrendingUp, CheckCircle2, BarChart3,
    Flame, PlayCircle, Loader2, XCircle, Share2, Users
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { GuildService, GuildResponseDTO } from "@/lib/guildService";
import { useCustomDialog } from "@/components/CustomDialogProvider";

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
    sharedWithGuildName?: string;
    userId?: string;
    originalCreatorId?: string;
    originalCreatorName?: string;
    isForSale?: boolean;
    price?: number;
    rating?: number;
    ratingCount?: number;
    isPurchased?: boolean;
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
    const { isFree } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeck, setNewDeck] = useState({ title: "", description: "", icon: "Layers", color: "from-indigo-500 to-violet-600" });
    const [isSaving, setIsSaving] = useState(false);
    const [myGuilds, setMyGuilds] = useState<GuildResponseDTO[]>([]);
    const [sharingDeckId, setSharingDeckId] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [activeTab, setActiveTab] = useState<"my" | "store">("my");
    const [storeDecks, setStoreDecks] = useState<Deck[]>([]);
    const [searchUser, setSearchUser] = useState("");
    const [foundUsers, setFoundUsers] = useState<any[]>([]);
    const [sharingType, setSharingType] = useState<"GUILD" | "USER">("GUILD");
    const { alert, confirm } = useCustomDialog();

    const fetchData = async () => {
        try {
            const [decksRes, summaryRes, guilds] = await Promise.all([
                apiFetch("/student/flashcards/decks"),
                apiFetch("/student/flashcards/summary"),
                GuildService.getMyGuilds()
            ]);

            setMyGuilds(guilds);

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

    const fetchStoreDecks = async () => {
        try {
            const res = await apiFetch("/student/flashcards/store");
            if (res.ok) {
                setStoreDecks(await res.json());
            }
        } catch (error) {
            console.error("Error fetching store decks:", error);
        }
    };

    useEffect(() => {
        if (activeTab === "store") {
            fetchStoreDecks();
        }
    }, [activeTab]);

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

    const handleShareDeck = async (deckId: string, targetId: string, type: "GUILD" | "USER") => {
        setIsSharing(true);
        try {
            const res = await apiFetch(`/student/flashcards/decks/${deckId}/share`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType: type, targetId })
            });
            if (res.ok) {
                alert(type === "GUILD" ? "Deck compartilhado com a guilda!" : "Deck compartilhado com o usuário!");
                setSharingDeckId(null);
            } else {
                throw new Error("Erro ao compartilhar");
            }
        } catch (error) {
            console.error(error);
            alert("Erro ao compartilhar deck.", { type: "danger" });
        } finally {
            setIsSharing(false);
        }
    };

    const handleDeleteDeck = async (deckId: string) => {
        if (await confirm("Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.")) {
            try {
                const res = await apiFetch(`/student/flashcards/decks/${deckId}`, { method: "DELETE" });
                if (res.ok) {
                    alert("Coleção excluída com sucesso!");
                    fetchData();
                }
            } catch (error) {
                alert("Erro ao excluir coleção.", { type: "danger" });
            }
        }
    };

    const handleBuyDeck = async (deckId: string, price: number) => {
        if (await confirm(`Deseja comprar este deck por ${price} Axons?`)) {
            try {
                const res = await apiFetch(`/student/flashcards/store/decks/${deckId}/buy`, { method: "POST" });
                if (res.ok) {
                    alert("Deck comprado com sucesso!");
                    setActiveTab("my");
                    fetchData();
                } else {
                    const err = await res.json();
                    alert(err.message || "Erro ao comprar deck.", { type: "danger" });
                }
            } catch (error) {
                alert("Erro ao comprar deck.", { type: "danger" });
            }
        }
    };

    const searchUsersToShare = async (nickname: string) => {
        setSearchUser(nickname);
        if (nickname.length < 3) return;
        try {
            const res = await apiFetch(`/friends/search?nickname=${nickname}`);
            if (res.ok) {
                setFoundUsers(await res.json());
            }
        } catch (error) {
            console.error(error);
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

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Flashcards Premium"
                    description="O sistema inteligente de flashcards é exclusivo para assinantes. Estude de forma mais eficaz com repetição espaçada!"
                />
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
                    <button
                        onClick={() => {
                            setActiveTab(activeTab === "my" ? "store" : "my");
                        }}
                        className={`btn-outline !h-10 !text-[12px] !px-5 whitespace-nowrap ${activeTab === "store" ? "!bg-indigo-600 !text-white" : ""}`}
                    >
                        {activeTab === "my" ? <Target size={15} /> : <Layers size={15} />}
                        {activeTab === "my" ? "Loja de Decks" : "Meus Decks"}
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
                    {(activeTab === "my" ? decks : storeDecks).length > 0 ? (
                        (activeTab === "my" ? decks : storeDecks).map(deck => {
                            const Icon = ICON_MAP[deck.icon] || BookOpen;
                            const colorClass = deck.color || "from-indigo-500 to-violet-600";
                            return (
                                <div key={deck.id} className="relative group">
                                    {/* Camadas decorativas para efeito de deck */}
                                    <div className="absolute inset-0 bg-white border border-slate-200 rounded-2xl transform translate-x-1.5 translate-y-1.5 -z-10 opacity-60 transition-transform duration-300 group-hover:translate-x-2 group-hover:translate-y-2" />
                                    <div className="absolute inset-0 bg-white border border-slate-200 rounded-2xl transform translate-x-3 translate-y-3 -z-20 opacity-30 transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4" />

                                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none bg-white relative">
                                        <div className="flex items-start gap-4">
                                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform shadow-sm`}>
                                                <Icon size={20} className="text-white" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <h3 className="text-[14px] font-bold text-slate-800">{deck.title}</h3>
                                                    {deck.newCards > 0 && activeTab === "my" && (
                                                        <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                            {deck.newCards} novas
                                                        </span>
                                                    )}
                                                    {deck.sharedWithGuildName && activeTab === "my" && (
                                                        <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                            <Users size={9} /> {deck.sharedWithGuildName}
                                                        </span>
                                                    )}
                                                    {deck.originalCreatorName && (
                                                        <span className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                            Criador: {deck.originalCreatorName}
                                                        </span>
                                                    )}
                                                    {activeTab === "store" && deck.rating !== undefined && (
                                                        <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-500">
                                                            <Star size={10} fill="currentColor" /> {deck.rating?.toFixed(1)} ({deck.ratingCount})
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{deck.description}</p>

                                                {/* Progress bar (only for my decks) */}
                                                {activeTab === "my" && (
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
                                                                style={{ width: `${deck.progress}%` }} />
                                                        </div>
                                                        <span className="text-[11px] font-bold text-slate-600">{deck.progress}%</span>
                                                    </div>
                                                )}

                                                <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                                    <span className="flex items-center gap-1"><Layers size={10} /> {deck.totalCards} cartas</span>
                                                    {activeTab === "my" && (
                                                        <>
                                                            <span className="flex items-center gap-1"><Clock size={10} /> {deck.dueCards} pendentes</span>
                                                            <span>{deck.lastStudied}</span>
                                                        </>
                                                    )}
                                                    {activeTab === "store" && (
                                                        <span className="font-bold text-indigo-600 flex items-center gap-1">
                                                            <Zap size={10} /> {deck.price} axons
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-2 shrink-0">
                                                {activeTab === "my" ? (
                                                    <>
                                                        <Link href={`/flashcards/estudar?deckId=${deck.id}`}
                                                            className="btn-primary !h-9 !text-[11px] !px-4 whitespace-nowrap">
                                                            <PlayCircle size={13} /> Revisar
                                                        </Link>
                                                        <Link href={`/flashcards/gerenciar?deckId=${deck.id}`}
                                                            className="btn-outline !h-9 !text-[11px] !px-4 !border-slate-200 !text-slate-600 hover:!bg-slate-50 whitespace-nowrap flex items-center justify-center gap-1.5 rounded-xl font-bold">
                                                            <Plus size={12} /> Cartas
                                                        </Link>

                                                        <div className="relative">
                                                            <button
                                                                onClick={() => setSharingDeckId(sharingDeckId === deck.id ? null : deck.id)}
                                                                className={`btn-outline w-full !h-9 !text-[11px] !px-4 !border-slate-200 !text-slate-600 hover:!bg-slate-50 whitespace-nowrap flex items-center justify-center gap-1.5 rounded-xl font-bold ${sharingDeckId === deck.id ? "!bg-indigo-50 !text-indigo-600 !border-indigo-200" : ""}`}>
                                                                <Share2 size={12} /> Share
                                                            </button>
                                                            {sharingDeckId === deck.id && (
                                                                <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-10 animate-in fade-in zoom-in-95 duration-150">
                                                                    <div className="flex gap-2 mb-2 p-1 bg-slate-50 rounded-lg">
                                                                        <button onClick={() => setSharingType("GUILD")} className={`flex-1 text-[10px] font-bold py-1 rounded ${sharingType === "GUILD" ? "bg-white shadow text-indigo-600" : "text-slate-400"}`}>GUILDA</button>
                                                                        <button onClick={() => setSharingType("USER")} className={`flex-1 text-[10px] font-bold py-1 rounded ${sharingType === "USER" ? "bg-white shadow text-indigo-600" : "text-slate-400"}`}>USUÁRIO</button>
                                                                    </div>

                                                                    <div className="space-y-1 max-h-48 overflow-y-auto">
                                                                        {sharingType === "GUILD" ? (
                                                                            myGuilds.length > 0 ? myGuilds.map(guild => (
                                                                                <button key={guild.id}
                                                                                    disabled={isSharing}
                                                                                    onClick={() => handleShareDeck(deck.id, guild.id, "GUILD")}
                                                                                    className="w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 transition-colors flex items-center justify-between">
                                                                                    <span className="truncate">{guild.name}</span>
                                                                                    {isSharing && <Loader2 size={10} className="animate-spin" />}
                                                                                </button>
                                                                            )) : (
                                                                                <p className="px-3 py-2 text-[11px] text-slate-400 italic">Nenhuma guilda.</p>
                                                                            )
                                                                        ) : (
                                                                            <div className="p-2 space-y-2">
                                                                                <input
                                                                                    type="text"
                                                                                    className="w-full text-[12px] px-2 py-1 border rounded"
                                                                                    placeholder="Apelido..."
                                                                                    value={searchUser}
                                                                                    onChange={e => searchUsersToShare(e.target.value)}
                                                                                />
                                                                                {foundUsers.map(user => (
                                                                                    <button key={user.id}
                                                                                        onClick={() => handleShareDeck(deck.id, user.id, "USER")}
                                                                                        className="w-full text-left px-2 py-1.5 rounded hover:bg-indigo-50 text-[11px] font-bold text-slate-600 flex items-center gap-2">
                                                                                        <div className="w-5 h-5 rounded-full bg-slate-200 bg-cover" style={{ backgroundImage: `url(${user.avatarUrl})` }} />
                                                                                        {user.nickname}
                                                                                    </button>
                                                                                ))}
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <button
                                                            onClick={() => handleDeleteDeck(deck.id)}
                                                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 p-1 opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-1"
                                                        >
                                                            <XCircle size={12} /> Excluir
                                                        </button>
                                                        {deck.originalCreatorId !== deck.userId && (
                                                            <button
                                                                onClick={async () => {
                                                                    const val = window.prompt("Qual a nota (1 a 5)?");
                                                                    if (val) {
                                                                        await apiFetch(`/student/flashcards/decks/${deck.id}/rate`, {
                                                                            method: "POST",
                                                                            headers: { "Content-Type": "application/json" },
                                                                            body: JSON.stringify({ rating: parseInt(val), comment: "" })
                                                                        });
                                                                        alert("Obrigado pela avaliação!");
                                                                        fetchData();
                                                                    }
                                                                }}
                                                                className="text-[10px] font-bold text-amber-500 hover:text-amber-600 p-1 opacity-60 hover:opacity-100 transition-all flex items-center justify-center gap-1"
                                                            >
                                                                <Star size={12} /> Avaliar
                                                            </button>
                                                        )}
                                                    </>
                                                ) : (
                                                    <button
                                                        onClick={() => handleBuyDeck(deck.id, deck.price || 0)}
                                                        disabled={deck.isPurchased}
                                                        className={`btn-primary !h-10 !text-[12px] !px-6 ${deck.isPurchased ? "!bg-slate-100 !text-slate-400 !border-slate-200" : ""}`}
                                                    >
                                                        {deck.isPurchased ? "Comprado" : "Comprar"}
                                                    </button>
                                                )}
                                            </div>
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
