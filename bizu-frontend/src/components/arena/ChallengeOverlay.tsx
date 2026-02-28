"use client";

import { Swords, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useDuels } from "@/contexts/DuelContext";

export default function ChallengeOverlay() {
    const router = useRouter();
    const {
        activeDuel: duel,
        showOverlay: isVisible,
        setShowOverlay,
        acceptDuel,
        declineDuel
    } = useDuels();

    const handleAccept = async (duelId: string) => {
        try {
            await acceptDuel(duelId);
            router.push(`/arena?duelId=${duelId}`);
        } catch (error) {
            console.error("Erro ao aceitar desafio:", error);
        }
    };

    const handleDecline = async (duelId: string) => {
        try {
            await declineDuel(duelId);
        } catch (error) {
            console.error("Erro ao recusar desafio:", error);
        }
    };

    if (!isVisible || !duel) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                    className="relative w-full max-w-[400px] overflow-hidden rounded-[40px] bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] border border-white/20"
                >
                    {/* Premium Header with animated gradient */}
                    <div className="absolute top-0 left-0 w-full h-[180px] bg-gradient-to-br from-indigo-600 via-violet-600 to-primary overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                rotate: [0, 5, 0]
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                rotate: [0, -5, 0]
                            }}
                            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                            className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-400/20 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="relative pt-16 pb-10 px-8 flex flex-col items-center text-center">
                        {/* Status Icon */}
                        <div className="relative mb-8">
                            <motion.div
                                initial={{ rotate: -15, scale: 0 }}
                                animate={{ rotate: -5, scale: 1 }}
                                transition={{ type: "spring", damping: 12, delay: 0.1 }}
                                className="w-24 h-24 rounded-[32px] bg-white shadow-2xl flex items-center justify-center transform hover:rotate-0 transition-transform duration-500"
                            >
                                <Swords size={48} className="text-indigo-600" />

                                {/* Badge animado */}
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full border-4 border-white"
                                />
                            </motion.div>
                        </div>

                        <div className="space-y-2 mb-8">
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Desafio Recebido!</h3>
                            <div className="flex flex-col items-center text-slate-500 leading-relaxed">
                                <span className="text-lg font-medium">Você foi desafiado por:</span>
                                {/* Robust text container for long names */}
                                <div className="w-full max-w-[320px] overflow-hidden">
                                    <span className="text-2xl font-black text-indigo-600 truncate block py-1" title={duel.challenger.name}>
                                        {duel.challenger.name}
                                    </span>
                                </div>
                                <span className="text-sm mt-1">
                                    Matéria: <span className="font-bold text-slate-800">{duel.subject}</span>
                                </span>
                            </div>
                        </div>

                        <div className="flex flex-col w-full gap-4">
                            <button
                                onClick={() => handleAccept(duel.id)}
                                className="group relative w-full py-5 rounded-2xl bg-indigo-600 text-white font-bold text-xl shadow-[0_12px_24px_-8px_rgba(79,70,229,0.5)] hover:shadow-[0_20px_32px_-12px_rgba(79,70,229,0.6)] hover:-translate-y-0.5 active:scale-[0.98] transition-all overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <span className="relative z-10">Aceitar Duelo</span>
                            </button>
                            <button
                                onClick={() => handleDecline(duel.id)}
                                className="w-full py-4 rounded-2xl bg-slate-50 text-slate-500 font-bold text-lg hover:bg-slate-100 hover:text-slate-700 transition-all border border-slate-200"
                            >
                                Deixar para depois
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={() => setShowOverlay(false)}
                        className="absolute top-6 right-6 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

// These are no longer needed as we use the context, but keep exports empty if needed for backward compatibility
// Although it's better to remove them to avoid confusion.
export const setGlobalOverlayShown = (_value: boolean) => { };
export const getGlobalOverlayShown = () => false;


