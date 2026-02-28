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
                {/* AMBER BORDER (XP BOOST) */}
                {buffs.xpBoost && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 z-0 pointer-events-none"
                        style={{
                            boxShadow: "inset 0 0 40px rgba(245, 158, 11, 0.2), inset 0 0 4px rgba(245, 158, 11, 0.5)",
                            border: "3px solid rgba(245, 158, 11, 0.1)"
                        }}
                    />
                )}

                {/* PURPLE BORDER (ELITE TITLE) */}
                {buffs.eliteTitle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 z-1 pointer-events-none"
                        style={{
                            boxShadow: "inset 0 0 60px rgba(168, 85, 247, 0.15), inset 0 0 4px rgba(168, 85, 247, 0.4)",
                            border: buffs.xpBoost ? "none" : "3px solid rgba(168, 85, 247, 0.1)"
                        }}
                    />
                )}

                {/* EMERALD BORDER (RADAR) */}
                {buffs.radar && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.2, 0.5, 0.2] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 z-2 pointer-events-none"
                        style={{
                            boxShadow: "inset 0 0 30px rgba(16, 185, 129, 0.15), inset 0 0 4px rgba(16, 185, 129, 0.4)",
                            border: (buffs.xpBoost || buffs.eliteTitle) ? "none" : "3px solid rgba(16, 185, 129, 0.1)"
                        }}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}
