"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target } from "lucide-react";

export default function ActiveBuffsAura() {
    const [buffs, setBuffs] = useState<{ xpBoost: boolean; radar: boolean }>({ xpBoost: false, radar: false });

    const checkBuffs = async () => {
        try {
            const res = await apiFetch("/student/gamification/me");
            if (res.ok) {
                const data = await res.json();
                const now = new Date();
                setBuffs({
                    xpBoost: data.xpBoostUntil ? new Date(data.xpBoostUntil) > now : false,
                    radar: data.radarMateriaUntil ? new Date(data.radarMateriaUntil) > now : false
                });
            }
        } catch (e) {
            console.error("Error checking buffs:", e);
        }
    };

    useEffect(() => {
        checkBuffs();
        window.addEventListener("buff-activated", checkBuffs);
        const interval = setInterval(checkBuffs, 30000); // Check every 30s
        return () => {
            window.removeEventListener("buff-activated", checkBuffs);
            clearInterval(interval);
        };
    }, []);

    if (!buffs.xpBoost && !buffs.radar) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {/* XP BOOST RPG EFFECT */}
                {buffs.xpBoost && (
                    <>
                        {/* Initial Burst Flash */}
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: [0.5, 1.5, 1.2], opacity: [0, 0.5, 0] }}
                            transition={{ duration: 1.5, times: [0, 0.4, 1] }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,_rgba(245,158,11,0.3),_transparent_70%)]"
                        />

                        {/* Mana Rising (Particles) */}
                        {[...Array(6)].map((_, i) => (
                            <motion.div
                                key={`xp-p-${i}`}
                                initial={{ y: "100vh", x: `${20 + i * 15}%`, opacity: 0, scale: 0 }}
                                animate={{
                                    y: "-10vh",
                                    opacity: [0, 0.8, 0],
                                    scale: [0.5, 1, 0.5],
                                    rotate: 360
                                }}
                                transition={{
                                    duration: 3 + i,
                                    repeat: Infinity,
                                    delay: i * 0.5,
                                    ease: "easeInOut"
                                }}
                                className="absolute"
                            >
                                <Zap size={24 + i * 4} className="text-amber-400/30 blur-[2px] fill-current" />
                            </motion.div>
                        ))}

                        {/* Persistent Core Glow */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(245,158,11,0.12),_transparent_60%)] animate-pulse"
                        />
                    </>
                )}

                {/* RADAR RPG EFFECT */}
                {buffs.radar && (
                    <>
                        <motion.div
                            initial={{ scale: 2, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 border-[40px] border-emerald-500/10 rounded-full blur-3xl scale-150"
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,_rgba(16,185,129,0.15),_transparent_60%)]"
                        />
                    </>
                )}
            </AnimatePresence>

            {/* Corner Indicators with Flare */}
            <div className="absolute top-4 right-4 flex flex-col gap-3 pointer-events-auto">
                <AnimatePresence>
                    {buffs.xpBoost && (
                        <motion.div
                            initial={{ x: 100, scale: 0.5, filter: "brightness(2)" }}
                            animate={{ x: 0, scale: 1, filter: "brightness(1)" }}
                            exit={{ x: 100, opacity: 0 }}
                            className="relative"
                        >
                            <div className="absolute -inset-1 bg-amber-500 rounded-2xl blur-md animate-pulse opacity-50" />
                            <div className="relative bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-600 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/30 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                                <Zap size={16} className="fill-current animate-bounce text-yellow-200" />
                                <span className="drop-shadow-sm">Multiplicador 2x Ativo</span>
                            </div>
                        </motion.div>
                    )}
                    {buffs.radar && (
                        <motion.div
                            initial={{ x: 100, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 100, opacity: 0 }}
                            className="relative"
                        >
                            <div className="absolute -inset-1 bg-emerald-500 rounded-2xl blur-md opacity-30" />
                            <div className="relative bg-gradient-to-r from-emerald-500 to-teal-400 text-white px-6 py-3 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-black uppercase tracking-widest">
                                <Target size={16} className="animate-spin-slow" />
                                <span>Radar Ativo</span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
