"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { Zap, Target, Crown } from "lucide-react";

export default function ActiveBuffsAura() {
    const [buffs, setBuffs] = useState<{
        xpBoost: boolean;
        radar: boolean;
        eliteTitle: boolean;
    }>({ xpBoost: false, radar: false, eliteTitle: false });

    const checkBuffs = async () => {
        try {
            const res = await apiFetch("/student/gamification/me");
            if (res.ok) {
                const data = await res.json();
                const now = new Date();
                setBuffs({
                    xpBoost: data.xpBoostUntil ? new Date(data.xpBoostUntil) > now : false,
                    radar: data.radarMateriaUntil ? new Date(data.radarMateriaUntil) > now : false,
                    eliteTitle: data.activeTitle === "Elite"
                });
            }
        } catch (e) {
            console.error("Error checking buffs:", e);
        }
    };

    useEffect(() => {
        checkBuffs();
        window.addEventListener("buff-activated", checkBuffs);
        const interval = setInterval(checkBuffs, 30000);
        return () => {
            window.removeEventListener("buff-activated", checkBuffs);
            clearInterval(interval);
        };
    }, []);

    if (!buffs.xpBoost && !buffs.radar && !buffs.eliteTitle) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {/* GLOBAL ENERGY FLOOR (AXON AURA) */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_110%,_rgba(99,102,241,0.05),_transparent_70%)]" />

                {/* ELITE TITLE AURA - PURPLE MAJESTY */}
                {buffs.eliteTitle && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-x-0 bottom-0 h-[40vh] bg-[radial-gradient(circle_at_50%_100%,_rgba(168,85,247,0.2),_transparent_70%)]"
                    />
                )}

                {/* XP BOOST EFFECT - AMBER ENERGY */}
                {buffs.xpBoost && (
                    <>
                        {/* Intense Bottom Glow */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.4, 0.7, 0.4] }}
                            transition={{ duration: 3, repeat: Infinity }}
                            className="absolute inset-x-0 bottom-0 h-[50vh] bg-[radial-gradient(circle_at_50%_100%,_rgba(245,158,11,0.25),_transparent_70%)]"
                        />

                        {/* Energy Waves */}
                        {[...Array(3)].map((_, i) => (
                            <motion.div
                                key={`wave-${i}`}
                                initial={{ scaleY: 0, opacity: 0 }}
                                animate={{
                                    scaleY: [1, 1.2, 1],
                                    opacity: [0.1, 0.3, 0.1],
                                    y: [-20 * i, -40 * i, -20 * i]
                                }}
                                transition={{
                                    duration: 4 + i,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="absolute inset-x-0 bottom-0 h-[20vh] bg-gradient-to-t from-amber-500/20 to-transparent blur-xl origin-bottom"
                            />
                        ))}

                        {/* Rising Embers (Particles) */}
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={`xp-p-${i}`}
                                initial={{ y: "100vh", x: `${10 + (i * 8)}%`, opacity: 0, scale: 0 }}
                                animate={{
                                    y: ["100vh", "60vh", "40vh"],
                                    opacity: [0, 0.6, 0],
                                    scale: [0.5, 1.2, 0.2],
                                    x: [`${10 + (i * 8)}%`, `${10 + (i * 8) + (Math.sin(i) * 10)}%`]
                                }}
                                transition={{
                                    duration: 4 + (i % 3),
                                    repeat: Infinity,
                                    delay: i * 0.3,
                                    ease: "easeOut"
                                }}
                                className="absolute"
                            >
                                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full blur-[1px] shadow-[0_0_10px_#f59e0b]" />
                            </motion.div>
                        ))}
                    </>
                )}

                {/* RADAR EFFECT - EMERALD PULSE */}
                {buffs.radar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.5, 0.3] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-x-0 bottom-0 h-[40vh] bg-[radial-gradient(circle_at_50%_100%,_rgba(16,185,129,0.2),_transparent_70%)]"
                    />
                )}
            </AnimatePresence>

        </div>
    );
}
