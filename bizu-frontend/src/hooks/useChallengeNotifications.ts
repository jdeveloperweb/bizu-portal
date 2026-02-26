"use client";

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1").replace("/api/v1", "/ws");

export function useChallengeNotifications(userId: string | null, onChallengeReceived: (duel: any) => void) {
    const stompClientRef = useRef<Client | null>(null);

    useEffect(() => {
        if (!userId) return;

        const socket = new SockJS(WS_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${Cookies.get("token")}`
            },
            onConnect: () => {
                client.subscribe(`/topic/desafios/${userId}`, (message) => {
                    onChallengeReceived(JSON.parse(message.body));
                });
            },
            onStompError: (frame) => {
                console.error('WebSocket Error:', frame);
            },
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                stompClientRef.current.deactivate();
            }
        };
    }, [userId]);

    return stompClientRef.current;
}
