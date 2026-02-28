"use client";

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

// Tenta obter a URL base da API e derivar a URL do WebSocket de forma robusta
const getWsUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1";
    // Se a URL termina com /api/v1, substitui por /ws. Caso contrário, apenas adiciona /ws
    if (apiUrl.includes("/api/v1")) {
        return apiUrl.replace("/api/v1", "/ws");
    }
    return `${apiUrl}/ws`.replace("//ws", "/ws");
};

const WS_URL = getWsUrl();

export function useChallengeNotifications(userId: string | null, onChallengeReceived: (duel: any) => void) {
    const stompClientRef = useRef<Client | null>(null);
    const onChallengeReceivedRef = useRef(onChallengeReceived);

    useEffect(() => {
        onChallengeReceivedRef.current = onChallengeReceived;
    }, [onChallengeReceived]);

    useEffect(() => {
        if (!userId || userId === "" || userId === "null" || userId === "undefined") {
            console.log("useChallengeNotifications: userId is not available yet", userId);
            return;
        }

        console.log("Subscribing to challenges for user:", userId, "on", WS_URL);

        const socket = new SockJS(WS_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${Cookies.get("token")}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log("Connected to challenges WebSocket for user:", userId);
                client.subscribe(`/topic/desafios/${userId}`, (message) => {
                    try {
                        const duel = JSON.parse(message.body);
                        console.log("Received challenge notification via WS:", duel);
                        onChallengeReceivedRef.current(duel);
                    } catch (err) {
                        console.error("Error parsing challenge message", err);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP Error in challenge notifications:', frame.headers['message'], frame.body);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket Error in challenge notifications:', event);
            },
            onDisconnect: () => {
                console.log("Disconnected from challenges WebSocket");
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                console.log("Deactivating challenges WebSocket for user:", userId);
                stompClientRef.current.deactivate();
            }
        };
    }, [userId]);

    return stompClientRef.current;
}

