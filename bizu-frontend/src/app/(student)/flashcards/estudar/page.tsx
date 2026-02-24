import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ChevronLeft,
    RotateCcw,
    CheckCircle2,
    XCircle,
    AlertCircle,
    HelpCircle,
    ArrowRight,
    BrainCircuit,
    Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";

interface Flashcard {
    id: string;
    front: string;
    back: string;
    subject: string;
    topic: string;
}

function StudyContent() {
    const searchParams = useSearchParams();
    const deckId = searchParams.get("deckId");

    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isFlipped, setIsFlipped] = useState(false);
    const [finished, setFinished] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCards = async () => {
            if (!deckId) {
                setLoading(false);
                return;
            }
            try {
                const res = await apiFetch(`/student/flashcards/decks/${deckId}/cards`);
                if (res.ok) {
                    const data = await res.json();
                    setCards(data);
                }
            } catch (error) {
                console.error("Error fetching cards:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchCards();
    }, [deckId]);

    const handleRate = async (rating: 'easy' | 'medium' | 'hard') => {
        const cardId = cards[currentIndex].id;

        // Optimistic UI update or wait for recording?
        // Let's do optimistic for better UX
        setIsFlipped(false);

        try {
            await apiFetch(`/student/flashcards/cards/${cardId}/result?rating=${rating}`, {
                method: 'POST'
            });
        } catch (error) {
            console.error("Error recording result:", error);
        }

        setTimeout(() => {
            if (currentIndex < cards.length - 1) {
                setCurrentIndex(prev => prev + 1);
            } else {
                setFinished(true);
            }
        }, 300);
    };

    if (loading) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="font-bold text-muted-foreground">Preparando sua sessão...</p>
            </div>
        );
    }

    if (cards.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8 gap-6">
                <div className="w-20 h-20 rounded-3xl bg-amber-50 flex items-center justify-center text-amber-500">
                    <CheckCircle2 className="w-10 h-10" />
                </div>
                <div className="space-y-2">
                    <h2 className="text-2xl font-black">Nada para revisar agora!</h2>
                    <p className="text-muted-foreground max-w-sm">Você já revisou todas as cartas pendentes deste deck. Volte mais tarde ou adicione novas cartas!</p>
                </div>
                <Link href="/flashcards">
                    <Button variant="outline" className="rounded-2xl px-8 h-12 font-bold">
                        Voltar para Coleções
                    </Button>
                </Link>
            </div>
        );
    }

    if (finished) {
        return (
            <div className="min-h-[80vh] flex items-center justify-center p-4">
                <div className="text-center space-y-8 max-w-lg">
                    <div className="w-24 h-24 rounded-[32px] bg-primary/10 flex items-center justify-center text-primary mx-auto">
                        <BrainCircuit className="w-12 h-12" />
                    </div>
                    <h1 className="text-4xl font-black">Sessão Concluída!</h1>
                    <p className="text-muted-foreground">Você revisou todas as {cards.length} cartas programadas para esta sessão.</p>
                    <div className="flex flex-col gap-3 pt-4">
                        <Link href="/flashcards">
                            <Button className="w-full h-14 rounded-2xl font-black text-lg gap-2">
                                Voltar para Coleções
                            </Button>
                        </Link>
                        <Button variant="ghost" className="h-14 font-bold" onClick={() => window.location.reload()}>
                            <RotateCcw className="w-4 h-4 mr-2" /> Revisar Novamente
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    const currentCard = cards[currentIndex];

    return (
        <div className="min-h-screen bg-muted/30">
            <header className="h-20 bg-background border-b flex items-center px-4 md:px-8 justify-between sticky top-0 z-50">
                <div className="flex items-center gap-6">
                    <Link href="/flashcards">
                        <Button variant="ghost" size="icon" className="rounded-xl">
                            <ChevronLeft className="w-6 h-6" />
                        </Button>
                    </Link>
                    <div className="hidden md:block">
                        <div className="text-xs font-black text-muted-foreground uppercase tracking-widest">Revisando</div>
                        <div className="font-bold">{currentCard.subject || "Conceito Geral"}</div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-sm font-black text-primary bg-primary/10 px-4 py-2 rounded-xl border border-primary/20">
                        {currentIndex + 1} / {cards.length}
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12 max-w-2xl">
                <div className="relative h-[450px] w-full [perspective:1000px] mb-12">
                    <motion.div
                        initial={false}
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                        className="w-full h-full [transform-style:preserve-3d] cursor-pointer"
                        onClick={() => setIsFlipped(!isFlipped)}
                    >
                        {/* Front */}
                        <div className="absolute inset-0 [backface-visibility:hidden] p-10 rounded-[48px] bg-card border-2 shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
                            <div className="text-xs font-black text-primary uppercase tracking-widest bg-primary/5 px-3 py-1 rounded-full">{currentCard.topic || "Pergunta"}</div>
                            <h2 className="text-2xl font-bold leading-relaxed">{currentCard.front}</h2>
                            <div className="absolute bottom-10 flex items-center gap-2 text-muted-foreground font-bold text-sm">
                                <ArrowRight className="w-4 h-4" /> Toque para virar
                            </div>
                        </div>

                        {/* Back */}
                        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)] p-10 rounded-[48px] bg-primary text-primary-foreground shadow-2xl flex flex-col items-center justify-center text-center space-y-6">
                            <div className="text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">Resposta</div>
                            <p className="text-xl font-medium leading-relaxed whitespace-pre-wrap">{currentCard.back}</p>
                            <div className="absolute bottom-10 opacity-60 flex items-center gap-2 font-bold text-sm text-white">
                                <HelpCircle className="w-4 h-4" /> Como foi sua lembrança?
                            </div>
                        </div>
                    </motion.div>
                </div>

                <AnimatePresence>
                    {isFlipped && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="grid grid-cols-3 gap-4"
                        >
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRate('hard'); }}
                                className="p-6 rounded-[32px] bg-card border-2 border-red-100 hover:bg-red-50 hover:border-red-400 transition-all group"
                            >
                                <XCircle className="w-8 h-8 text-red-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-black uppercase tracking-tight text-red-600">Difícil</div>
                                <div className="text-[10px] text-muted-foreground font-bold whitespace-nowrap">Revisar amanhã</div>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleRate('medium'); }}
                                className="p-6 rounded-[32px] bg-card border-2 border-amber-100 hover:bg-amber-50 hover:border-amber-400 transition-all group"
                            >
                                <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-black uppercase tracking-tight text-amber-600">Médio</div>
                                <div className="text-[10px] text-muted-foreground font-bold whitespace-nowrap">Próximos dias</div>
                            </button>

                            <button
                                onClick={(e) => { e.stopPropagation(); handleRate('easy'); }}
                                className="p-6 rounded-[32px] bg-card border-2 border-emerald-100 hover:bg-emerald-50 hover:border-emerald-400 transition-all group"
                            >
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-3 group-hover:scale-110 transition-transform" />
                                <div className="text-sm font-black uppercase tracking-tight text-emerald-600">Fácil</div>
                                <div className="text-[10px] text-muted-foreground font-bold whitespace-nowrap">Semana que vem</div>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}

export default function FlashcardStudyPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
            </div>
        }>
            <StudyContent />
        </Suspense>
    );
}
