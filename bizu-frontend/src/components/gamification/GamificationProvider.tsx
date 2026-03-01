"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import LevelUpOverlay from "./LevelUpOverlay";
import XPRewardAnimation from "./XPRewardAnimation";
// We removed setGlobalOverlayShown dependency to allow duels to show properly.
// Overlays should probably be managed by a higher-level toast/notification system in the future.

interface Reward {
    xpGained: number;
    totalXp: number;
    currentLevel: number;
    previousLevel: number;
    leveledUp: boolean;
    nextLevelProgress: number;
}

interface GamificationContextType {
    showReward: (reward: Reward) => void;
}

const GamificationContext = createContext<GamificationContextType | undefined>(undefined);

export function GamificationProvider({ children }: { children: React.ReactNode }) {
    const [rewardQueue, setRewardQueue] = useState<Reward[]>([]);
    const [currentReward, setCurrentReward] = useState<Reward | null>(null);
    const [showXP, setShowXP] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);

    const showReward = useCallback((newReward: Reward) => {
        setRewardQueue(prev => [...prev, newReward]);
    }, []);

    // Processar a fila de recompensas
    useEffect(() => {
        if (!isProcessing && rewardQueue.length > 0) {
            setIsProcessing(true);
            const nextReward = rewardQueue[0];
            setRewardQueue(prev => prev.slice(1));

            // Iniciar exibição
            setCurrentReward(nextReward);

            if (nextReward.xpGained !== 0) {
                setShowXP(true);
            }

            if (nextReward.leveledUp) {
                setTimeout(() => {
                    setShowLevelUp(true);
                }, 1500);
            } else if (nextReward.xpGained !== 0) {
                // Se não subir de nível, liberar para o próximo após a animação de XP (3s)
                setTimeout(() => {
                    setShowXP(false);
                    // Pequeno delay extra para a transição
                    setTimeout(() => setIsProcessing(false), 500);
                }, 3500);
            } else {
                // Caso não tenha XP nem LevelUp
                setIsProcessing(false);
            }
        }
    }, [rewardQueue, isProcessing]);

    const handleLevelUpClose = useCallback(() => {
        setShowLevelUp(false);
        setShowXP(false);
        // Liberar processamento após fechar o overlay de level up
        setTimeout(() => setIsProcessing(false), 500);
    }, []);

    const handleXPComplete = useCallback(() => {
        // Agora controlado principalmente pelo useEffect do timer no próprio componente
        // mas mantemos o callback para compatibilidade de prop
    }, []);

    return (
        <GamificationContext.Provider value={{ showReward }}>
            {children}

            {currentReward && (
                <>
                    <XPRewardAnimation
                        amount={currentReward.xpGained}
                        show={showXP}
                        onComplete={handleXPComplete}
                    />
                    <LevelUpOverlay
                        level={currentReward.currentLevel}
                        show={showLevelUp}
                        onClose={handleLevelUpClose}
                    />
                </>
            )}
        </GamificationContext.Provider>
    );
}

export const useGamification = () => {
    const context = useContext(GamificationContext);
    if (!context) {
        throw new Error("useGamification must be used within a GamificationProvider");
    }
    return context;
};

