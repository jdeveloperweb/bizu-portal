"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { MapUpdateEvent, RankingUpdateEvent } from "@/lib/warDayService";

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1")
  .replace("/api/v1", "") + "/ws";

interface UseWarDayWebSocketOptions {
  eventId: string;
  guildId: string;
  token?: string;
  onMapUpdate?: (event: MapUpdateEvent) => void;
  onRankingUpdate?: (event: RankingUpdateEvent) => void;
  onEventStatusChange?: (data: { status: string; title: string }) => void;
}

export function useWarDayWebSocket({
  eventId,
  guildId,
  token,
  onMapUpdate,
  onRankingUpdate,
  onEventStatusChange,
}: UseWarDayWebSocketOptions) {
  const clientRef = useRef<Client | null>(null);
  const connectedRef = useRef(false);

  const onMapUpdateRef = useRef(onMapUpdate);
  const onRankingUpdateRef = useRef(onRankingUpdate);
  const onEventStatusRef = useRef(onEventStatusChange);

  useEffect(() => { onMapUpdateRef.current = onMapUpdate; }, [onMapUpdate]);
  useEffect(() => { onRankingUpdateRef.current = onRankingUpdate; }, [onRankingUpdate]);
  useEffect(() => { onEventStatusRef.current = onEventStatusChange; }, [onEventStatusChange]);

  useEffect(() => {
    if (!eventId || !guildId) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      reconnectDelay: 5000,
      onConnect: () => {
        connectedRef.current = true;

        // Subscribe to guild-specific map updates
        client.subscribe(`/topic/war-day/${guildId}/map`, (msg: IMessage) => {
          try {
            const data: MapUpdateEvent = JSON.parse(msg.body);
            onMapUpdateRef.current?.(data);
          } catch (e) {
            console.warn("[WarDay WS] Failed to parse map update:", e);
          }
        });

        // Subscribe to event-wide ranking updates
        client.subscribe(`/topic/war-day/${eventId}/ranking`, (msg: IMessage) => {
          try {
            const data: RankingUpdateEvent = JSON.parse(msg.body);
            onRankingUpdateRef.current?.(data);
          } catch (e) {
            console.warn("[WarDay WS] Failed to parse ranking update:", e);
          }
        });

        // Subscribe to event status changes (start/end)
        client.subscribe(`/topic/war-day/${eventId}/status`, (msg: IMessage) => {
          try {
            const data = JSON.parse(msg.body);
            onEventStatusRef.current?.(data);
          } catch (e) {
            console.warn("[WarDay WS] Failed to parse status update:", e);
          }
        });
      },
      onDisconnect: () => {
        connectedRef.current = false;
      },
      onStompError: (frame) => {
        console.warn("[WarDay WS] STOMP error:", frame.headers?.message);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      client.deactivate();
      clientRef.current = null;
      connectedRef.current = false;
    };
  }, [eventId, guildId, token]);

  const isConnected = useCallback(() => connectedRef.current, []);

  return { isConnected };
}
