"use client";

import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import Cookies from 'js-cookie';

const WS_URL = "https://bizu.mjolnix.com.br/ws"; // Match your backend WS endpoint

export function useDuelWebSocket(duelId: string | null, onMessage: (msg: any) => void) {
    const stompClientRef = useRef<Client | null>(null);

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
                    onMessage(JSON.parse(message.body));
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
    }, [duelId, onMessage]);

    return stompClientRef.current;
}
