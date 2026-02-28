"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { DuelService, Duel } from "@/lib/duelService";
import { useChallengeNotifications } from "@/hooks/useChallengeNotifications";

interface DuelContextType {
    pendingDuels: Duel[];
    activeDuel: Duel | null;
    showOverlay: boolean;
    setShowOverlay: (show: boolean) => void;
    refreshDuels: () => Promise<void>;
    acceptDuel: (duelId: string) => Promise<void>;
    declineDuel: (duelId: string) => Promise<void>;
}

const DuelContext = createContext<DuelContextType | undefined>(undefined);

export function DuelProvider({ children }: { children: React.ReactNode }) {
    const { user, authenticated } = useAuth();
    const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
    const [showOverlay, setShowOverlay] = useState(false);
    const [hasNewDuelSinceLastRefresh, setHasNewDuelSinceLastRefresh] = useState(false);
    const lastNotifiedDuelId = useRef<string | null>(null);

    const refreshDuels = useCallback(async () => {
        if (!authenticated || !user) return;
        try {
            const data = await DuelService.getPendingDuels();
            setPendingDuels(data || []);

            // If there's a pending duel and we haven't shown the overlay yet in this session
            if (data && data.length > 0 && !hasNewDuelSinceLastRefresh) {
                setShowOverlay(true);
                setHasNewDuelSinceLastRefresh(true);
            }
        } catch (error) {
            console.error("Failed to fetch pending duels:", error);
        }
    }, [authenticated, user, hasNewDuelSinceLastRefresh]);

    useEffect(() => {
        if (authenticated) {
            refreshDuels();
        } else {
            setPendingDuels([]);
            setShowOverlay(false);
        }
    }, [authenticated, refreshDuels]);

    // WebSocket listener for real-time duels
    useChallengeNotifications(user?.id || user?.sub || null, (newDuel: Duel) => {
        if (!newDuel || newDuel.id === lastNotifiedDuelId.current) return;

        lastNotifiedDuelId.current = newDuel.id;

        setPendingDuels(prev => {
            if (prev.some(d => d.id === newDuel.id)) return prev;
            return [newDuel, ...prev];
        });

        // Always show overlay for a REAL new notification via WS
        setShowOverlay(true);
        setHasNewDuelSinceLastRefresh(true);

        // Dispatch custom event for sound or other side effects if needed
        window.dispatchEvent(new CustomEvent('duel:received', { detail: newDuel }));
    });

    const acceptDuel = async (duelId: string) => {
        try {
            await DuelService.acceptDuel(duelId);
            setPendingDuels(prev => prev.filter(d => d.id !== duelId));
            setShowOverlay(false);
        } catch (error) {
            console.error("Failed to accept duel:", error);
            throw error;
        }
    };

    const declineDuel = async (duelId: string) => {
        try {
            await DuelService.declineDuel(duelId);
            setPendingDuels(prev => prev.filter(d => d.id !== duelId));
            setShowOverlay(false);
        } catch (error) {
            console.error("Failed to decline duel:", error);
            throw error;
        }
    };

    return (
        <DuelContext.Provider value={{
            pendingDuels,
            activeDuel: pendingDuels.length > 0 ? pendingDuels[0] : null,
            showOverlay,
            setShowOverlay,
            refreshDuels,
            acceptDuel,
            declineDuel
        }}>
            {children}
        </DuelContext.Provider>
    );
}

export const useDuels = () => {
    const context = useContext(DuelContext);
    if (context === undefined) {
        throw new Error("useDuels must be used within a DuelProvider");
    }
    return context;
};
