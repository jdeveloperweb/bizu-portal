"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import LevelUpOverlay from "./LevelUpOverlay";
import XPRewardAnimation from "./XPRewardAnimation";

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
    const [reward, setReward] = useState<Reward | null>(null);
    const [showXP, setShowXP] = useState(false);
    const [showLevelUp, setShowLevelUp] = useState(false);

    const showReward = useCallback((newReward: Reward) => {
        setReward(newReward);

        if (newReward.xpGained > 0) {
            setShowXP(true);
        }

        if (newReward.leveledUp) {
            // Delay Level Up overlay slightly to let XP animation breathe
            setTimeout(() => {
                setShowLevelUp(true);
            }, 1500);
        }
    }, []);

    return (
        <GamificationContext.Provider value={{ showReward }}>
            {children}

            {reward && (
                <>
                    <XPRewardAnimation
                        amount={reward.xpGained}
                        show={showXP}
                        onComplete={() => setShowXP(false)}
                    />
                    <LevelUpOverlay
                        level={reward.currentLevel}
                        show={showLevelUp}
                        onClose={() => setShowLevelUp(false)}
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
