"use client";

import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "https://bizu.mjolnix.com.br/api/v1").replace("/api/v1", "/ws");

export function useDuelWebSocket(duelId: string | null, onMessage: (msg: any) => void) {
    const stompClientRef = useRef<Client | null>(null);

    const onMessageRef = useRef(onMessage);
    onMessageRef.current = onMessage;

    useEffect(() => {
        if (!duelId) return;

        const socket = new SockJS(WS_URL);
        const client = new Client({
            webSocketFactory: () => socket,
            connectHeaders: {
                Authorization: `Bearer ${Cookies.get("token")}`
            },
            onConnect: () => {
                client.subscribe(`/topic/duelos/${duelId}`, (message) => {
                    try {
                        onMessageRef.current(JSON.parse(message.body));
                    } catch (e) {
                        console.error("Error parsing duel message:", e);
                    }
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
    }, [duelId]);

    return stompClientRef.current;
}
