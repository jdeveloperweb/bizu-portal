"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
    Layers, Plus, BookOpen, Shield, Scale, Gavel,
    Target, Brain, Zap, Clock,
    Star, TrendingUp, CheckCircle2,
    PlayCircle, Loader2, XCircle, Share2, Users, ShoppingBag, Edit, Settings
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
    sharedWith?: Array<{ deckId: string; name: string; avatarUrl?: string; type: "GUILD" | "USER" }>;
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
    const { isFree, user } = useAuth();
    const [decks, setDecks] = useState<Deck[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newDeck, setNewDeck] = useState({ title: "", description: "", icon: "Layers", color: "from-indigo-500 to-violet-600" });
    const [editingDeckId, setEditingDeckId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [myGuilds, setMyGuilds] = useState<GuildResponseDTO[]>([]);
    const [sharingDeckId, setSharingDeckId] = useState<string | null>(null);
    const [isSharing, setIsSharing] = useState(false);
    const [activeTab, setActiveTab] = useState<"my" | "store">("my");
    const [storeDecks, setStoreDecks] = useState<Deck[]>([]);
    const [storeLoading, setStoreLoading] = useState(false);
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
        setStoreLoading(true);
        try {
            const res = await apiFetch("/student/flashcards/store");
            if (res.ok) {
                setStoreDecks(await res.json());
            }
        } catch (error) {
            console.error("Error fetching store decks:", error);
        } finally {
            setStoreLoading(false);
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

    const handleSaveDeck = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const url = editingDeckId
                ? `/student/flashcards/decks/${editingDeckId}`
                : "/student/flashcards/decks";
            const method = editingDeckId ? "PUT" : "POST";

            const res = await apiFetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newDeck)
            });
            if (res.ok) {
                setIsModalOpen(false);
                setEditingDeckId(null);
                setNewDeck({ title: "", description: "", icon: "Layers", color: "from-indigo-500 to-violet-600" });
                fetchData();
            }
        } catch (error) {
            console.error("Error saving deck:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleShareDeck = async (deckId: string, targetId: string, targetType: "GUILD" | "USER") => {
        setIsSharing(true);
        try {
            const res = await apiFetch(`/student/flashcards/decks/${deckId}/share`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ targetType, targetId })
            });
            if (res.ok) {
                setSharingDeckId(null);
                fetchData();
            }
        } catch (error) {
            console.error("Error sharing deck:", error);
        } finally {
            setIsSharing(false);
        }
    };

    const handleUnshare = async (sharedDeckId: string) => {
        if (!confirm("Interromper compartilhamento? O destinatário perderá o acesso.")) return;
        try {
            const res = await apiFetch(`/student/flashcards/shared-decks/${sharedDeckId}/unshare`, {
                method: "POST"
            });
            if (res.ok) fetchData();
        } catch (error) {
            console.error("Error unsharing deck:", error);
        }
    };

    const handleDeleteDeck = async (deckId: string) => {
        if (await confirm("Tem certeza que deseja excluir esta coleção? Esta ação não pode ser desfeita.")) {
            try {
                const res = await apiFetch(`/student/flashcards/decks/${deckId}`, { method: "DELETE" });
                if (res.ok) {
                    setDecks(prev => prev.filter(d => d.id !== deckId));
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
                        {activeTab === "my" ? "Minhas Coleções" : "Loja de Decks"}
                    </h1>
                    <p className="text-sm text-slate-500">
                        {activeTab === "my" ? "Memorize conceitos com repetição espaçada." : "Adquira coleções criadas pela comunidade."}
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Tab switcher */}
                    <div className="flex items-center bg-slate-100 rounded-xl p-1 gap-0.5">
                        <button
                            onClick={() => setActiveTab("my")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "my"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <Layers size={13} /> Minhas Coleções
                            {totalDue > 0 && (
                                <span className="bg-amber-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                                    {totalDue}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab("store")}
                            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold transition-all whitespace-nowrap ${activeTab === "store"
                                ? "bg-white text-slate-800 shadow-sm"
                                : "text-slate-500 hover:text-slate-700"
                                }`}
                        >
                            <ShoppingBag size={13} /> Loja de Decks
                        </button>
                    </div>

                    {/* New collection CTA */}
                    {activeTab === "my" && (
                        <button onClick={() => {
                            setEditingDeckId(null);
                            setNewDeck({ title: "", description: "", icon: "Layers", color: "from-indigo-500 to-violet-600" });
                            setIsModalOpen(true);
                        }} className="btn-primary !h-10 !text-[12px] !px-5 whitespace-nowrap">
                            <Plus size={15} /> Nova Coleção
                        </button>
                    )}
                </div>
            </div>

            {/* Stats (only on my tab) */}
            {activeTab === "my" && (
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
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">

                    {/* MY DECKS */}
                    {activeTab === "my" && (
                        <>
                            {decks.length > 0 ? decks.map(deck => {
                                const Icon = ICON_MAP[deck.icon] || BookOpen;
                                const colorClass = deck.color || "from-indigo-500 to-violet-600";
                                return (
                                    <div key={deck.id} className="relative group" style={{ paddingBottom: '14px', paddingRight: '14px', zIndex: sharingDeckId === deck.id ? 100 : 'auto' }}>
                                        {/* Ghost card 2 — deepest, fans out on hover via Tailwind group classes */}
                                        <div className="absolute inset-0 rounded-2xl bg-slate-200 border border-slate-300/60 translate-x-[8px] translate-y-[8px] transition-transform duration-300 ease-out group-hover:translate-x-[11px] group-hover:translate-y-[11px]" />
                                        {/* Ghost card 1 — middle layer */}
                                        <div className="absolute inset-0 rounded-2xl bg-slate-100 border border-slate-200/80 translate-x-[4px] translate-y-[4px] transition-transform duration-300 ease-out group-hover:translate-x-[6px] group-hover:translate-y-[6px]" />

                                        {/* Main card — NO overflow-hidden (clips the share dropdown) and NO explicit z-index (creates stacking context trapping dropdown) */}
                                        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300">
                                            {/* Stripe uses rounded-t-2xl instead of relying on overflow-hidden */}
                                            <div className={`h-1.5 w-full bg-gradient-to-r ${colorClass} rounded-t-2xl`} />

                                            <div className="p-5">
                                                <div className="flex items-start gap-4">
                                                    {/* Icon */}
                                                    <div className={`w-13 h-13 min-w-[52px] min-h-[52px] rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shadow-md transition-transform duration-300 group-hover:scale-105`}>
                                                        <Icon size={22} className="text-white" />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                                                            <h3 className="text-[14px] font-bold text-slate-800">{deck.title}</h3>
                                                            {deck.newCards > 0 && (
                                                                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                                                                    {deck.newCards} novas
                                                                </span>
                                                            )}
                                                            {/* Guild tag for recipients (non-owners) */}
                                                            {deck.sharedWithGuildName && deck.userId !== user?.id && (
                                                                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-full flex items-center gap-1">
                                                                    <Users size={9} /> {deck.sharedWithGuildName}
                                                                </span>
                                                            )}

                                                            {/* Visual sharing info for owners */}
                                                            {deck.sharedWith && deck.sharedWith.length > 0 && deck.userId === user?.id && (
                                                                <div className="flex items-center gap-1.5 ml-1">
                                                                    <div className="flex items-center -space-x-1.5">
                                                                        {deck.sharedWith.slice(0, 3).map((share, idx) => (
                                                                            <button
                                                                                key={idx}
                                                                                onClick={(e) => { e.stopPropagation(); handleUnshare(share.deckId); }}
                                                                                className="w-5 h-5 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center overflow-hidden shadow-sm ring-1 ring-slate-100 hover:scale-110 hover:ring-rose-200 transition-all cursor-pointer group/share"
                                                                                title={`Remover compartilhamento com ${share.name}`}
                                                                            >
                                                                                {share.type === "GUILD" ? (
                                                                                    <Users size={10} className="text-indigo-500 fill-indigo-50 group-hover/share:text-rose-500" />
                                                                                ) : (
                                                                                    <img
                                                                                        src={share.avatarUrl || `https://ui-avatars.com/api/?name=${share.name}&background=random`}
                                                                                        alt={share.name}
                                                                                        className="w-full h-full object-cover group-hover/share:opacity-40"
                                                                                    />
                                                                                )}
                                                                            </button>
                                                                        ))}
                                                                        {deck.sharedWith.length > 3 && (
                                                                            <div className="w-5 h-5 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center shadow-sm ring-1 ring-slate-100">
                                                                                <span className="text-[8px] font-bold text-slate-600">+{deck.sharedWith.length - 3}</span>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Shared</span>
                                                                </div>
                                                            )}
                                                            {deck.originalCreatorName && (
                                                                <span className="text-[9px] font-bold text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded-full">
                                                                    Criador: {deck.originalCreatorName}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-slate-400 mb-3 line-clamp-1">{deck.description}</p>

                                                        {/* Progress bar */}
                                                        <div className="flex items-center gap-2 mb-2.5">
                                                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                                <div className={`h-full rounded-full bg-gradient-to-r ${colorClass} transition-all duration-700`}
                                                                    style={{ width: `${deck.progress}%` }} />
                                                            </div>
                                                            <span className="text-[11px] font-bold text-slate-500 w-8 text-right">{deck.progress}%</span>
                                                        </div>

                                                        <div className="flex items-center gap-4 text-[10px] text-slate-400">
                                                            <span className="flex items-center gap-1"><Layers size={10} /> {deck.totalCards} cartas</span>
                                                            {deck.dueCards > 0 && (
                                                                <span className="flex items-center gap-1 text-amber-500 font-semibold"><Clock size={10} /> {deck.dueCards} pendentes</span>
                                                            )}
                                                            <span>{deck.lastStudied}</span>
                                                        </div>
                                                    </div>

                                                    {/* Actions */}
                                                    <div className="flex flex-col gap-1.5 shrink-0">
                                                        <Link href={`/flashcards/estudar?deckId=${deck.id}`}
                                                            className="btn-primary !h-9 !text-[11px] !px-4 whitespace-nowrap">
                                                            <PlayCircle size={13} /> Revisar
                                                        </Link>

                                                        {deck.userId === user?.id && (
                                                            <>
                                                                <div className="flex gap-1.5">
                                                                    <Link href={`/flashcards/gerenciar?deckId=${deck.id}`}
                                                                        className="flex-1 btn-outline !h-9 !text-[11px] !px-4 !border-slate-200 !text-slate-600 hover:!bg-slate-50 whitespace-nowrap flex items-center justify-center gap-1.5 rounded-xl font-bold">
                                                                        <Plus size={12} /> Cartas
                                                                    </Link>
                                                                    <button
                                                                        onClick={() => {
                                                                            setEditingDeckId(deck.id);
                                                                            setNewDeck({ title: deck.title, description: deck.description, icon: deck.icon, color: deck.color });
                                                                            setIsModalOpen(true);
                                                                        }}
                                                                        className="btn-outline !h-9 !w-9 flex items-center justify-center !p-0 !border-slate-200 !text-slate-400 hover:!text-indigo-600 hover:!bg-indigo-50 rounded-xl"
                                                                        title="Editar Deck"
                                                                    >
                                                                        <Edit size={12} />
                                                                    </button>
                                                                </div>

                                                                <div className="relative">
                                                                    <button
                                                                        onClick={() => setSharingDeckId(sharingDeckId === deck.id ? null : deck.id)}
                                                                        className={`btn-outline w-full !h-9 !text-[11px] !px-4 !border-slate-200 !text-slate-600 hover:!bg-slate-50 whitespace-nowrap flex items-center justify-center gap-1.5 rounded-xl font-bold ${sharingDeckId === deck.id ? "!bg-indigo-50 !text-indigo-600 !border-indigo-200" : ""}`}>
                                                                        <Share2 size={12} /> Share
                                                                    </button>
                                                                    {sharingDeckId === deck.id && (
                                                                        <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-[200] animate-in fade-in zoom-in-95 duration-150">
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
                                                                    className="text-[10px] font-bold text-rose-400 hover:text-rose-600 p-1 opacity-50 hover:opacity-100 transition-all flex items-center justify-center gap-1"
                                                                >
                                                                    <XCircle size={12} /> Excluir
                                                                </button>
                                                            </>
                                                        )}
                                                        {deck.originalCreatorId && deck.originalCreatorId !== deck.userId && (
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
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="card-elevated !rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed !border-slate-200">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                        <Layers size={32} className="text-slate-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Nenhuma coleção ainda</h3>
                                        <p className="text-sm text-slate-500 max-w-md mx-auto">
                                            Crie sua primeira coleção ou explore a loja para adquirir decks da comunidade.
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
                        </>
                    )}

                    {/* STORE */}
                    {activeTab === "store" && (
                        <>
                            {storeLoading ? (
                                <div className="flex flex-col items-center justify-center py-16 gap-3">
                                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                                    <p className="text-sm text-slate-400">Carregando loja...</p>
                                </div>
                            ) : storeDecks.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {storeDecks.map(deck => {
                                        const Icon = ICON_MAP[deck.icon] || BookOpen;
                                        const colorClass = deck.color || "from-indigo-500 to-violet-600";
                                        const rating = deck.rating || 0;
                                        return (
                                            <div key={deck.id} className="relative group">
                                                {/* Stack effect */}
                                                <div className={`absolute left-4 right-4 top-3 h-full -z-10 rounded-2xl bg-gradient-to-br ${colorClass} opacity-15 transition-all duration-300 group-hover:top-4`} />
                                                <div className={`absolute left-2 right-2 top-1.5 h-full -z-10 rounded-2xl bg-gradient-to-br ${colorClass} opacity-10 transition-all duration-300 group-hover:top-2.5`} />

                                                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col">
                                                    {/* Colored header */}
                                                    <div className={`bg-gradient-to-br ${colorClass} p-6 text-center relative overflow-hidden`}>
                                                        {/* Decorative blobs */}
                                                        <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-white/10" />
                                                        <div className="absolute -bottom-4 -left-4 w-14 h-14 rounded-full bg-white/10" />

                                                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 relative">
                                                            <Icon size={28} className="text-white" />
                                                        </div>
                                                        <h3 className="text-white font-bold text-[16px] mb-1">{deck.title}</h3>

                                                        {/* Star rating */}
                                                        <div className="flex items-center justify-center gap-0.5">
                                                            {[1, 2, 3, 4, 5].map(s => (
                                                                <Star key={s} size={11}
                                                                    className={s <= Math.round(rating) ? "text-yellow-300 fill-yellow-300" : "text-white/30"}
                                                                />
                                                            ))}
                                                            <span className="text-white/60 text-[10px] ml-1.5">
                                                                {rating > 0 ? rating.toFixed(1) : "Sem avaliações"} {deck.ratingCount ? `(${deck.ratingCount})` : ""}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Card body */}
                                                    <div className="p-4 flex flex-col flex-1">
                                                        {deck.originalCreatorName && (
                                                            <p className="text-[10px] text-indigo-500 font-semibold mb-1">por {deck.originalCreatorName}</p>
                                                        )}
                                                        <p className="text-[12px] text-slate-500 mb-4 line-clamp-2 flex-1">{deck.description}</p>

                                                        <div className="flex items-center justify-between mb-3">
                                                            <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                                                <Layers size={11} className="text-slate-300" /> {deck.totalCards} cartas
                                                            </span>
                                                            {deck.isPurchased ? (
                                                                <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
                                                                    <CheckCircle2 size={11} /> Adquirido
                                                                </span>
                                                            ) : (
                                                                <span className="font-extrabold text-indigo-600 text-[15px] flex items-center gap-1">
                                                                    <Zap size={12} className="text-indigo-400" /> {deck.price} <span className="text-[11px] font-semibold text-indigo-400">axons</span>
                                                                </span>
                                                            )}
                                                        </div>

                                                        <button
                                                            onClick={() => !deck.isPurchased && handleBuyDeck(deck.id, deck.price || 0)}
                                                            disabled={deck.isPurchased}
                                                            className={`w-full h-10 rounded-xl text-[12px] font-bold flex items-center justify-center gap-2 transition-all
                                                                ${deck.isPurchased
                                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                                                    : "btn-primary"
                                                                }`}
                                                        >
                                                            {deck.isPurchased
                                                                ? <><CheckCircle2 size={14} /> Já Adquirido</>
                                                                : <><ShoppingBag size={14} /> Comprar por {deck.price} Axons</>
                                                            }
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="card-elevated !rounded-2xl p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed !border-slate-200">
                                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
                                        <ShoppingBag size={32} className="text-slate-300" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-800">Loja vazia por enquanto</h3>
                                        <p className="text-sm text-slate-500">Em breve haverá decks disponíveis para compra.</p>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Modal for New Collection */}
                {isModalOpen && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-black text-slate-900">{editingDeckId ? "Editar Coleção" : "Nova Coleção"}</h2>
                                <button onClick={() => { setIsModalOpen(false); setEditingDeckId(null); }} className="text-slate-400 hover:text-slate-600">
                                    <XCircle size={20} />
                                </button>
                            </div>

                            <form onSubmit={handleSaveDeck} className="space-y-4">
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
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingDeckId ? <Settings size={20} /> : <Plus size={20} />)}
                                    {editingDeckId ? "Salvar Alterações" : "Criar Coleção"}
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
