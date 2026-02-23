"use client";

import PageHeader from "@/components/PageHeader";
import {
    BrainCircuit,
    Layers,
    CirclePlay,
    Plus,
    Search,
    BookOpen,
    Shield,
    Scale,
    Gavel
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const iconMap: Record<string, any> = {
    Shield: Shield,
    Scale: Scale,
    Gavel: Gavel,
    BookOpen: BookOpen
};

export default function FlashcardsPage() {
    const decks = [
        {
            id: "1",
            title: "Direito Administrativo",
            description: "Atos, Poderes e Organização Administrativa.",
            icon: "Shield",
            cardCount: 120,
            newCards: 15,
            progress: 65,
            lastStudied: "Há 2 horas"
        },
        {
            id: "2",
            title: "Direito Constitucional",
            description: "Direitos Fundamentais e Organização do Estado.",
            icon: "Scale",
            cardCount: 200,
            newCards: 42,
            progress: 30,
            lastStudied: "Há 1 dia"
        },
        {
            id: "3",
            title: "Processo Penal",
            description: "Prisões, Inquérito e Ação Penal.",
            icon: "Gavel",
            cardCount: 85,
            newCards: 0,
            progress: 90,
            lastStudied: "Há 3 dias"
        }
    ];

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Minhas Coleções"
                    description="Memorize conceitos complexos através da repetição espaçada."
                    badge="FLASHCARDS"
                />
                <Button className="h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    Criar Coleção
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {decks.map((deck, idx) => {
                    const IconComponent = iconMap[deck.icon] || BookOpen;
                    return (
                        <motion.div
                            key={deck.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="group relative"
                        >
                            <div className="absolute inset-x-0 -bottom-2 h-4 bg-foreground/5 rounded-[48px] blur-xl group-hover:bg-primary/10 transition-colors" />

                            <div className="relative bg-card border rounded-[48px] p-8 h-full flex flex-col hover:border-primary/50 transition-all overflow-hidden">
                                {/* Progress Background */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />

                                <div className="flex items-start justify-between mb-8">
                                    <div className="w-16 h-16 rounded-[24px] bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                        <IconComponent className="w-8 h-8" />
                                    </div>
                                    {deck.newCards > 0 && (
                                        <div className="bg-success text-success-foreground text-[10px] font-black px-3 py-1 rounded-full">
                                            {deck.newCards} NOVAS
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1">
                                    <h3 className="text-2xl font-black mb-2 group-hover:text-primary transition-colors">{deck.title}</h3>
                                    <p className="text-sm text-muted-foreground font-medium mb-8 leading-relaxed">
                                        {deck.description}
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                        <span>Progresso</span>
                                        <span className="text-foreground">{deck.progress}%</span>
                                    </div>
                                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${deck.progress}%` }}
                                            transition={{ duration: 1, delay: idx * 0.2 }}
                                            className="h-full bg-primary"
                                        />
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <Layers className="w-4 h-4" />
                                            {deck.cardCount} cartas
                                        </div>
                                        <Link href="/flashcards/estudar">
                                            <Button size="sm" className="rounded-xl font-black gap-2 h-10 px-4">
                                                Revisar
                                                <CirclePlay className="w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}

                {/* Empty State / Add Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="border-4 border-dashed rounded-[48px] flex flex-col items-center justify-center p-12 text-center space-y-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer group"
                >
                    <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary transition-all">
                        <BrainCircuit className="w-10 h-10" />
                    </div>
                    <div>
                        <div className="font-black text-xl">Nova Coleção</div>
                        <p className="text-sm text-muted-foreground font-medium">Adicione seus próprios flashcards ou importe de um curso.</p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
