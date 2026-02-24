import { apiFetch } from "./api";

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
    avatar?: string;
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
}

export const DuelService = {
    getPendingDuels: async () => {
        const res = await apiFetch("/duelos/pendentes");
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

    getRanking: async () => {
        const res = await apiFetch("/duelos/ranking");
        return res.json();
    }
};
