"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
    ChevronLeft, Plus, Trash2, Save,
    Layers, BookOpen, Loader2, XCircle,
    CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Flashcard {
    id?: string;
    front: string;
    back: string;
}

interface Deck {
    id: string;
    title: string;
}

function GerenciarContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const deckId = searchParams.get("deckId");

    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);

    // Form for new card
    const [newCard, setNewCard] = useState({ front: "", back: "" });

    useEffect(() => {
        const fetchData = async () => {
            if (!deckId) return;
            try {
                // Fetch deck info (using the decks list endpoint for now or a specific one)
                const [decksRes, cardsRes] = await Promise.all([
                    apiFetch("/student/flashcards/decks"),
                    apiFetch(`/student/flashcards/decks/${deckId}/all-cards`)
                ]);

                if (decksRes.ok && cardsRes.ok) {
                    const decks = await decksRes.json();
                    const currentDeck = decks.find((d: any) => d.id === deckId);
                    setDeck(currentDeck);

                    const cardsData = await cardsRes.json();
                    setCards(cardsData);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [deckId]);

    const handleAddCard = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newCard.front || !newCard.back) return;

        setIsSaving(true);
        try {
            const res = await apiFetch(`/student/flashcards/decks/${deckId}/cards`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newCard)
            });

            if (res.ok) {
                const addedCard = await res.json();
                setCards([...cards, addedCard]);
                setNewCard({ front: "", back: "" });
            }
        } catch (error) {
            console.error("Error adding card:", error);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="text-slate-500 font-medium">Carregando coleção...</p>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1000px] mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/flashcards">
                    <button className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                </Link>
                <div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                        Gerenciar Cartas
                    </h1>
                    <p className="text-sm text-slate-500">{deck?.title || "Coleção"}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Add Card Form */}
                <div className="lg:col-span-1">
                    <div className="card-elevated p-6 sticky top-24">
                        <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                            <Plus size={18} className="text-indigo-500" /> Nova Carta
                        </h2>

                        <form onSubmit={handleAddCard} className="space-y-5">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Frente (Pergunta)</label>
                                <textarea
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none"
                                    rows={4}
                                    placeholder="Qual é a capital da França?"
                                    value={newCard.front}
                                    onChange={e => setNewCard({ ...newCard, front: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Verso (Resposta)</label>
                                <textarea
                                    required
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-indigo-500 transition-all resize-none"
                                    rows={4}
                                    placeholder="Paris"
                                    value={newCard.back}
                                    onChange={e => setNewCard({ ...newCard, back: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isSaving}
                                className="w-full btn-primary !h-12 font-bold gap-2"
                            >
                                {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
                                Salvar Carta
                            </button>
                        </form>
                    </div>
                </div>

                {/* Cards List */}
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-800">
                            Cartas na Coleção ({cards.length})
                        </h2>
                    </div>

                    <div className="space-y-3">
                        {cards.length > 0 ? (
                            cards.map((card, index) => (
                                <div key={card.id || index} className="card-elevated p-5 group hover:!transform-none">
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="flex-1 space-y-3">
                                            <div>
                                                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest block mb-1">Frente</span>
                                                <p className="text-sm font-bold text-slate-700">{card.front}</p>
                                            </div>
                                            <div className="pt-3 border-t border-slate-50">
                                                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest block mb-1">Verso</span>
                                                <p className="text-sm text-slate-500 whitespace-pre-wrap">{card.back}</p>
                                            </div>
                                        </div>
                                        {/* Optional delete button could go here */}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="card-elevated p-12 flex flex-col items-center justify-center text-center gap-3 border-2 border-dashed !border-slate-200">
                                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                                    <BookOpen size={24} />
                                </div>
                                <p className="text-sm text-slate-500 font-medium">Esta coleção ainda não tem cartas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function GerenciarFlashcardsPage() {
    return (
        <Suspense fallback={
            <div className="p-8 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        }>
            <GerenciarContent />
        </Suspense>
    );
}
