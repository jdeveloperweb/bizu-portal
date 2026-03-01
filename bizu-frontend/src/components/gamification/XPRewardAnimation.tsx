"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Zap, Star } from "lucide-react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

interface XPRewardAnimationProps {
    amount: number;
    show: boolean;
    onComplete: () => void;
}

export default function XPRewardAnimation({ amount, show, onComplete }: XPRewardAnimationProps) {
    useEffect(() => {
        if (show && amount > 0) {
            // Pequena explosão de confete para XP
            confetti({
                particleCount: 40,
                spread: 60,
                origin: { y: 0.7 },
                colors: ['#6366F1', '#818CF8', '#A5B4FC'], // Cores do Bizu
                zIndex: 200
            });

            // Auto-complete após a animação
            const timer = setTimeout(() => {
                onComplete();
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [show, amount, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <div className="fixed inset-0 z-[150] pointer-events-none flex items-center justify-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 20 }}
                        animate={{
                            opacity: [0, 1, 1, 0],
                            scale: [0.5, 1.2, 1, 0.8],
                            y: [20, 0, -50, -100]
                        }}
                        transition={{
                            duration: 2.5,
                            times: [0, 0.2, 0.8, 1],
                            ease: "easeOut"
                        }}
                        className="flex flex-col items-center gap-4"
                    >
                        {/* Glow effect */}
                        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full blur-3xl ${amount > 0 ? "bg-primary/30" : "bg-red-500/30"}`} />

                        <div className={`relative ${amount > 0 ? "bg-primary" : "bg-red-500"} text-white px-8 py-4 rounded-[32px] shadow-[0_20px_50px_rgba(var(--primary),0.4)] flex items-center gap-4 border-4 border-white/20 backdrop-blur-sm`}>
                            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
                                <Zap className="w-6 h-6 fill-current" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80">
                                    {amount > 0 ? "Recompensa" : "Penalidade"}
                                </span>
                                <span className="text-4xl font-black tabular-nums">
                                    {amount > 0 ? `+${amount}` : amount} XP
                                </span>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-card/80 backdrop-blur-md border border-white/20 px-4 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-2"
                        >
                            <Star className={`w-3 h-3 fill-current ${amount > 0 ? "text-primary" : "text-red-500"}`} />
                            <span>{amount > 0 ? "Mandou bem!" : "Não desista!"}</span>
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
