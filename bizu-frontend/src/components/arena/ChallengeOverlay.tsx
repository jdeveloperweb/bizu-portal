"use client";

import { useState, useEffect } from "react";
import { Swords } from "lucide-react";
import { useChallengeNotifications } from "@/hooks/useChallengeNotifications";
import { useAuth } from "@/components/AuthProvider";
import { DuelService, Duel } from "@/lib/duelService";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function ChallengeOverlay() {
    const { user } = useAuth();
    const router = useRouter();
    const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
    const [currentUserId, setCurrentUserId] = useState<string>("");

    useEffect(() => {
        if (user) {
            // Prioritize database 'id' over keycloak 'sub'
            const userId = (user.id || user.sub) as string;
            setCurrentUserId(userId);
        }
    }, [user]);

    useEffect(() => {
        const fetchInitialPending = async () => {
            if (!currentUserId) return;
            try {
                const pending = await DuelService.getPendingDuels();
                if (pending && pending.length > 0) {
                    setPendingDuels(pending);
                }
            } catch (err) {
                console.error("Erro ao buscar duelos pendentes:", err);
            }
        };
        fetchInitialPending();
    }, [currentUserId]);

    useChallengeNotifications(currentUserId, (newDuel: Duel) => {
        setPendingDuels(prev => {
            if (prev.find(d => d.id === newDuel.id)) return prev;
            return [newDuel, ...prev];
        });
    });

    const handleAccept = async (duelId: string) => {
        try {
            await DuelService.acceptDuel(duelId);
            setPendingDuels(prev => prev.filter(d => d.id !== duelId));
            router.push(`/arena?duelId=${duelId}`);
        } catch (error) {
            console.error("Erro ao aceitar desafio:", error);
        }
    };

    const handleDecline = async (duelId: string) => {
        try {
            await DuelService.declineDuel(duelId);
            setPendingDuels(prev => prev.filter(d => d.id !== duelId));
        } catch (error) {
            console.error("Erro ao recusar desafio:", error);
        }
    };

    if (pendingDuels.length === 0) return null;

    const duel = pendingDuels[0];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative w-full max-w-sm overflow-hidden rounded-[32px] bg-white shadow-2xl"
                >
                    {/* Header Area Area colorida */}
                    <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-indigo-600 via-violet-600 to-indigo-700" />
                    <div className="absolute top-0 left-0 w-full h-32 opacity-10" style={{
                        backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
                        backgroundSize: "20px 20px"
                    }} />

                    <div className="relative pt-12 pb-8 px-6 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-2xl bg-white shadow-xl flex items-center justify-center mb-6 -mt-10 transform -rotate-2">
                            <Swords size={40} className="text-indigo-600" />
                        </div>

                        <h3 className="text-2xl font-black text-slate-900 mb-2">Desafio Recebido!</h3>
                        <div className="text-slate-500 mb-8 px-2 leading-relaxed max-w-[280px]">
                            <span className="font-bold text-indigo-600">{duel.challenger.name}</span> te convidou para um duelo de <span className="font-bold text-slate-800">{duel.subject}</span>.
                        </div>

                        <div className="flex flex-col w-full gap-3">
                            <button
                                onClick={() => handleAccept(duel.id)}
                                className="w-full py-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-700 text-white font-bold text-lg shadow-lg shadow-indigo-100 hover:brightness-110 active:scale-[0.98] transition-all"
                            >
                                Aceitar Desafio
                            </button>
                            <button
                                onClick={() => handleDecline(duel.id)}
                                className="w-full py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-all"
                            >
                                Recusar
                            </button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
