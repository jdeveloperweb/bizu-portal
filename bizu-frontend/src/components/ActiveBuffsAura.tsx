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
        xpEndsAt: Date | null;
        radarEndsAt: Date | null;
    }>({ xpBoost: false, radar: false, eliteTitle: false, xpEndsAt: null, radarEndsAt: null });

    const [now, setNow] = useState(new Date());

    const checkBuffs = async () => {
        try {
            const res = await apiFetch("/student/gamification/me");
            if (res.ok) {
                const data = await res.json();
                const currentDate = new Date();
                const xpEnd = data.xpBoostUntil ? new Date(data.xpBoostUntil) : null;
                const radarEnd = data.radarMateriaUntil ? new Date(data.radarMateriaUntil) : null;
                setBuffs({
                    xpBoost: xpEnd ? xpEnd > currentDate : false,
                    radar: radarEnd ? radarEnd > currentDate : false,
                    eliteTitle: data.activeTitle === "Elite",
                    xpEndsAt: xpEnd,
                    radarEndsAt: radarEnd
                });
            }
        } catch (e) {
            console.error("Error checking buffs:", e);
        }
    };

    useEffect(() => {
        checkBuffs();
        window.addEventListener("buff-activated", checkBuffs);

        // Verifica buffs no servidor a cada 30 segundos
        const fetchInterval = setInterval(checkBuffs, 30000);

        // Atualiza a hora local suavemente a cada segundo, para o efeito visual de perda de opacidade
        const timeInterval = setInterval(() => setNow(new Date()), 1000);

        return () => {
            window.removeEventListener("buff-activated", checkBuffs);
            clearInterval(fetchInterval);
            clearInterval(timeInterval);
        };
    }, []);

    // Calcula a intensidade baseada na porção de tempo de duração "padrão" do item de loja
    const getIntensity = (endsAt: Date | null, maxDurationInHours: number) => {
        if (!endsAt) return 0;
        const timeLeftMs = endsAt.getTime() - now.getTime();
        if (timeLeftMs <= 0) return 0;
        const maxDurationMs = maxDurationInHours * 60 * 60 * 1000;
        // Permite ficar 100% no começo caso o usuário tenha um stack de vários boosts iguais, diminuindo só quando atingir `maxDurationMs`
        return Math.max(0, Math.min(1, timeLeftMs / maxDurationMs));
    };

    // XPBoost base is 2 Hours
    const xpIntensity = buffs.xpBoost ? getIntensity(buffs.xpEndsAt, 2) : 0;
    // Radar base is 24 Hours
    const radarIntensity = buffs.radar ? getIntensity(buffs.radarEndsAt, 24) : 0;

    if (!buffs.xpBoost && !buffs.radar && !buffs.eliteTitle) return null;

    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            <AnimatePresence>
                {/* AMBER BORDER (XP BOOST) */}
                {buffs.xpBoost && xpIntensity > 0 && (
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ opacity: xpIntensity }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.5, 0.9, 0.5] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 z-0 pointer-events-none"
                            style={{
                                boxShadow: `inset 0 0 80px rgba(245, 158, 11, 0.35), inset 0 0 10px rgba(245, 158, 11, 0.7)`,
                                border: `4px solid rgba(245, 158, 11, 0.5)`
                            }}
                        />
                    </div>
                )}

                {/* PURPLE BORDER (ELITE TITLE) - Permanente, não sofre decaimento */}
                {buffs.eliteTitle && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0.4, 0.8, 0.4] }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute inset-0 z-1 pointer-events-none"
                        style={{
                            boxShadow: "inset 0 0 100px rgba(168, 85, 247, 0.3), inset 0 0 10px rgba(168, 85, 247, 0.6)",
                            border: buffs.xpBoost ? "none" : "4px solid rgba(168, 85, 247, 0.4)"
                        }}
                    />
                )}

                {/* EMERALD BORDER (RADAR) */}
                {buffs.radar && radarIntensity > 0 && (
                    <div className="absolute inset-0 pointer-events-none transition-opacity duration-1000" style={{ opacity: radarIntensity }}>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.4, 0.8, 0.4] }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            className="absolute inset-0 z-2 pointer-events-none"
                            style={{
                                boxShadow: `inset 0 0 80px rgba(16, 185, 129, 0.3), inset 0 0 10px rgba(16, 185, 129, 0.6)`,
                                border: (buffs.xpBoost || buffs.eliteTitle) ? "none" : `4px solid rgba(16, 185, 129, 0.4)`
                            }}
                        />
                    </div>
                )}
            </AnimatePresence>

        </div>
    );
}
