import { apiFetch } from "./api";

export interface DuelStats {
    wins: number;
    losses: number;
    winRate: number;
    streak: number;
    dailyAbandonCount: number;
    abandonBlockedUntil?: string | null;
}

export interface Question {
    id: string;
    statement: string;
    options: Record<string, string>;
    correctOption: string;
    resolution?: string;
}

export interface DuelQuestion {
    id: string;
    question: Question;
    roundNumber: number;
    challengerAnswerIndex?: number;
    opponentAnswerIndex?: number;
    challengerCorrect?: boolean;
    opponentCorrect?: boolean;
    difficulty: string;
}

export interface User {
    id: string;
    name: string;
    nickname?: string;
    avatarUrl?: string;
}

export interface Duel {
    id: string;
    challenger: User;
    opponent: User;
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED";
    challengerScore: number;
    opponentScore: number;
    currentRound: number;
    suddenDeath: boolean;
    winner?: User;
    subject: string;
    questions: DuelQuestion[];
    completedAt?: string;
}

export const DuelService = {
    getPendingDuels: async () => {
        const res = await apiFetch("/duelos/pendentes");
        return res.json();
    },

    getActiveDuel: async () => {
        const res = await apiFetch("/duelos/me/ativo");
        if (res.status === 204 || !res.ok) return null;
        return res.json();
    },

    createDuel: async (opponentId: string, subject: string) => {
        const res = await apiFetch(`/duelos/desafiar?opponentId=${opponentId}&subject=${subject}`, {
            method: "POST",
        });
        return res.json();
    },

    acceptDuel: async (duelId: string) => {
        const res = await apiFetch(`/duelos/${duelId}/aceitar`, {
            method: "POST",
        });
        return res.json();
    },

    declineDuel: async (duelId: string) => {
        const res = await apiFetch(`/duelos/${duelId}/recusar`, {
            method: "POST",
        });
        return res;
    },

    submitAnswer: async (duelId: string, answerIndex: number) => {
        const res = await apiFetch(`/duelos/${duelId}/responder?answerIndex=${answerIndex}`, {
            method: "POST",
        });
        return res.json();
    },

    getDuel: async (duelId: string) => {
        const res = await apiFetch(`/duelos/${duelId}`);
        return res.json();
    },

    getRanking: async (courseId?: string, page: number = 0, size: number = 10) => {
        const query = [`page=${page}`, `size=${size}`];
        if (courseId) query.push(`courseId=${courseId}`);
        const res = await apiFetch(`/duelos/ranking?${query.join("&")}`);
        if (!res.ok) return { content: [], last: true };
        return res.json();
    },

    joinQueue: async (courseId: string) => {
        const res = await apiFetch(`/duelos/fila/entrar?courseId=${courseId}`, {
            method: "POST",
        });
        return res;
    },

    leaveQueue: async (courseId: string) => {
        const res = await apiFetch(`/duelos/fila/sair?courseId=${courseId}`, {
            method: "POST",
        });
        return res;
    },

    getHistory: async (page: number = 0, size: number = 10) => {
        const res = await apiFetch(`/duelos/historico?page=${page}&size=${size}`);
        if (!res.ok) return { content: [], last: true };
        return res.json();
    },

    getOnlineUsers: async (courseId?: string, page: number = 0, size: number = 10) => {
        const query = [`page=${page}`, `size=${size}`];
        if (courseId) query.push(`courseId=${courseId}`);
        const res = await apiFetch(`/duelos/online?${query.join("&")}`);
        if (!res.ok) return [];
        return res.json();
    }
};
