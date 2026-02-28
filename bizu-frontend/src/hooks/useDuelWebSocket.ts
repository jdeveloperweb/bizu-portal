"use client";

import { useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

// Tenta obter a URL base da API e derivar a URL do WebSocket de forma robusta
const getWsUrl = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1";
    // Como o NextJS intercepta rotas não-API, movemos o WS para dentro do namespace /api/v1/ws
    return `${apiUrl}/ws`.replace("//ws", "/ws");
};

const WS_URL = getWsUrl();

export function useDuelWebSocket(duelId: string | null, onMessage: (msg: any) => void) {
    const stompClientRef = useRef<Client | null>(null);

    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    useEffect(() => {
        if (!duelId) return;

        console.log(`Connecting to duel ${duelId} WebSocket on ${WS_URL}`);

        const socket = new SockJS(WS_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${Cookies.get("token")}`
            },
            reconnectDelay: 5000,
            onConnect: () => {
                console.log(`Connected to duel ${duelId} WebSocket`);
                client.subscribe(`/topic/duelos/${duelId}`, (message) => {
                    try {
                        onMessageRef.current(JSON.parse(message.body));
                    } catch (e) {
                        console.error("Error parsing duel message:", e);
                    }
                });
            },
            onStompError: (frame) => {
                console.error('STOMP Error in duel websocket:', frame.headers['message'], frame.body);
            },
            onWebSocketError: (event) => {
                console.error('WebSocket Error in duel:', event);
            }
        });

        client.activate();
        stompClientRef.current = client;

        return () => {
            if (stompClientRef.current) {
                console.log(`Deactivating duel ${duelId} WebSocket`);
                stompClientRef.current.deactivate();
            }
        };
    }, [duelId]);

    return stompClientRef.current;
}

