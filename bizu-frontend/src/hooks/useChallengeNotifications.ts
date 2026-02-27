"use client";

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1").replace("/api/v1", "/ws");

export function useChallengeNotifications(userId: string | null, onChallengeReceived: (duel: any) => void) {
    const stompClientRef = useRef<Client | null>(null);
    const onChallengeReceivedRef = useRef(onChallengeReceived);

    useEffect(() => {
        onChallengeReceivedRef.current = onChallengeReceived;
    }, [onChallengeReceived]);

    useEffect(() => {
        if (!userId || userId === "") return;

        console.log("Subscribing to challenges for user:", userId);

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
                console.log("Connected to challenges WebSocket");
                client.subscribe(`/topic/desafios/${userId}`, (message) => {
                    try {
                        const duel = JSON.parse(message.body);
                        console.log("Received challenge notification:", duel);
                        onChallengeReceivedRef.current(duel);
                    } catch (err) {
                        console.error("Error parsing challenge message", err);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP Error:', frame);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket Error:', event);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                console.log("Deactivating challenges WebSocket");
                stompClientRef.current.deactivate();
            }
        };
    }, [userId]);

    return stompClientRef.current;
}
