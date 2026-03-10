"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from "react";
import {
  WarDayEvent, GuildMapState, GuildRankingEntry,
  MapUpdateEvent, RankingUpdateEvent, WarDayService, ZoneState,
} from "@/lib/warDayService";
import { useWarDayWebSocket } from "@/hooks/useWarDayWebSocket";
import { useAuth } from "@/components/AuthProvider";
import { useGamification } from "@/components/gamification/GamificationProvider";

interface WarDayContextType {
  event: WarDayEvent | null;
  mapState: GuildMapState | null;
  ranking: GuildRankingEntry[];
  loading: boolean;
  error: string | null;
  loadEvent: (id: string) => Promise<void>;
  joinEvent: (id: string) => Promise<void>;
  refreshMap: (id: string) => Promise<void>;
  getZoneById: (zoneId: string) => ZoneState | undefined;
  timeRemaining: number; // seconds
}

const WarDayContext = createContext<WarDayContextType | null>(null);

export function WarDayProvider({
  children,
  eventId,
}: {
  children: React.ReactNode;
  eventId: string;
}) {
  const { token } = useAuth();
  const { showReward } = useGamification();
  const [event, setEvent] = useState<WarDayEvent | null>(null);
  const [mapState, setMapState] = useState<GuildMapState | null>(null);
  const [ranking, setRanking] = useState<GuildRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const guildId = mapState?.guildId ?? "";
  const rewardShownRef = useRef(false);

  // WebSocket handlers
  const handleMapUpdate = useCallback((update: MapUpdateEvent) => {
    setMapState((prev) => {
      if (!prev) return prev;
      const zones = prev.zones.map((z) => {
        if (z.zoneId === update.zoneId) {
          return { ...z, status: update.newStatus as ZoneState["status"] };
        }
        if (update.newlyUnlockedZones?.includes(z.zoneId) && z.status === "LOCKED") {
          return { ...z, status: "AVAILABLE" as const };
        }
        return z;
      });
      return {
        ...prev,
        totalScore: update.guildTotalScore,
        zonesConquered: update.zonesConquered,
        zones,
      };
    });
  }, []);

  const handleRankingUpdate = useCallback((update: RankingUpdateEvent) => {
    setRanking(
      update.ranking.map((r) => ({
        ...r,
        isMyGuild: r.guildId === guildId,
      }))
    );
  }, [guildId]);

  const handleEventStatusChange = useCallback((data: { status: string; title: string }) => {
    if (data.status === "FINISHED") {
      setEvent((prev) => prev ? { ...prev, status: "FINISHED" } : prev);

      // Show XP reward animation if my guild is winning (position 1 in current ranking)
      if (!rewardShownRef.current && guildId) {
        setRanking((currentRanking) => {
          const myGuild = currentRanking.find((r) => r.guildId === guildId);
          if (myGuild?.position === 1) {
            rewardShownRef.current = true;
            // Use xpRewardPerCorrect as a symbolic reward indicator
            showReward({
              xpGained: (myGuild.totalScore ?? 10),
              totalXp: 0,
              currentLevel: 0,
              previousLevel: 1,
              leveledUp: false,
              nextLevelProgress: 0,
            });
          }
          return currentRanking;
        });
      }
    } else if (data.status === "STARTED") {
      setEvent((prev) => prev ? { ...prev, status: "ACTIVE" } : prev);
    }
  }, [guildId, showReward]);

  useWarDayWebSocket({
    eventId,
    guildId,
    token: token ?? undefined,
    onMapUpdate: handleMapUpdate,
    onRankingUpdate: handleRankingUpdate,
    onEventStatusChange: handleEventStatusChange,
  });

  // Load event on mount
  const loadEvent = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const [evData, rankData] = await Promise.all([
        WarDayService.getEvent(id),
        WarDayService.getRanking(id).catch(() => null),
      ]);
      setEvent(evData);
      if (rankData) setRanking(rankData.guilds);

      if (evData.guildJoined) {
        const map = await WarDayService.getMap(id);
        setMapState(map);
      }
    } catch (e: any) {
      setError(e.message ?? "Erro ao carregar o evento");
    } finally {
      setLoading(false);
    }
  }, []);

  const joinEvent = useCallback(async (id: string) => {
    const map = await WarDayService.joinEvent(id);
    setMapState(map);
    const evData = await WarDayService.getEvent(id);
    setEvent(evData);
  }, []);

  const refreshMap = useCallback(async (id: string) => {
    const map = await WarDayService.getMap(id);
    setMapState(map);
  }, []);

  const getZoneById = useCallback(
    (zoneId: string) => mapState?.zones.find((z) => z.zoneId === zoneId),
    [mapState]
  );

  // Countdown timer
  useEffect(() => {
    if (!event?.endAt) return;
    const update = () => {
      const diff = Math.max(0, Math.floor((new Date(event.endAt).getTime() - Date.now()) / 1000));
      setTimeRemaining(diff);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [event?.endAt]);

  return (
    <WarDayContext.Provider
      value={{
        event,
        mapState,
        ranking,
        loading,
        error,
        loadEvent,
        joinEvent,
        refreshMap,
        getZoneById,
        timeRemaining,
      }}
    >
      {children}
    </WarDayContext.Provider>
  );
}

export function useWarDay() {
  const ctx = useContext(WarDayContext);
  if (!ctx) throw new Error("useWarDay must be used within WarDayProvider");
  return ctx;
}
