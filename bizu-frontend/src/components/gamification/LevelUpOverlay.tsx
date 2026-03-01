"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Award, Star, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import confetti from "canvas-confetti";

interface LevelUpOverlayProps {
    level: number;
    show: boolean;
    onClose: () => void;
}

export default function LevelUpOverlay({ level, show, onClose }: LevelUpOverlayProps) {
    useEffect(() => {
        if (show) {
            const duration = 5 * 1000;
            const animationEnd = Date.now() + duration;
            const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

            const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

            const interval: any = setInterval(function () {
                const timeLeft = animationEnd - Date.now();

                if (timeLeft <= 0) {
                    return clearInterval(interval);
                }

                const particleCount = 50 * (timeLeft / duration);
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
                confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
            }, 250);

            setTimeout(onClose, 6000);
        }
    }, [show, onClose]);

    return (
        <AnimatePresence>
            {show && (
                <div
                    className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-background/80 backdrop-blur-xl cursor-pointer"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.5, rotate: 10 }}
                        className="relative max-w-lg w-full text-center space-y-8"
                    >
                        {/* Background Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />

                        <div className="relative">
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                                className="absolute inset-0 flex items-center justify-center opacity-20"
                            >
                                <Star className="w-64 h-64 text-primary fill-current" />
                            </motion.div>

                            <div className="relative z-10 bg-card border-4 border-primary/50 rounded-[64px] p-12 shadow-[0_0_100px_rgba(var(--primary),0.3)]">
                                <div className="w-24 h-24 rounded-3xl bg-primary flex items-center justify-center text-primary-foreground mx-auto mb-8 shadow-2xl shadow-primary/40">
                                    <Zap className="w-12 h-12 fill-current" />
                                </div>

                                <h2 className="text-sm font-black text-primary uppercase tracking-[0.3em] mb-2">Novo Nível Atingido!</h2>
                                <h1 className="text-7xl font-black mb-6">NÍVEL {level}</h1>

                                <p className="text-muted-foreground font-medium text-lg leading-relaxed mb-10">
                                    Sua dedicação está dando resultados. <br />
                                    Você desbloqueou novos desafios e badges!
                                </p>

                                <div className="flex justify-center gap-4">
                                    {[1, 2, 3].map((i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + (i * 0.1) }}
                                            className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground border"
                                        >
                                            <Award className="w-8 h-8" />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.5 }}
                            className="text-muted-foreground font-bold tracking-widest uppercase text-xs"
                        >
                            Clique em qualquer lugar para continuar
                        </motion.div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
