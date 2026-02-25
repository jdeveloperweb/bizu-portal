"use client";

import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";

export interface SnapshotItem {
    id: string;
    questionOrder: number;
    snapshotStatement: string;
    snapshotOptions: Record<string, string>;
    snapshotCorrectOption: string;
    snapshotResolution: string | null;
    snapshotDifficulty: string | null;
    snapshotSubject: string | null;
    studentSelectedOption: string | null;
    studentCorrect: boolean | null;
    timeSpentSeconds: number | null;
}

export interface ActivityAttempt {
    id: string;
    activityType: "OFFICIAL_EXAM" | "MODULE_QUIZ";
    status: string;
    startedAt: string;
    finishedAt: string | null;
    timeLimitSeconds: number | null;
    totalQuestions: number;
    correctAnswers: number;
    scorePercent: number;
    xpEarned: number;
    snapshots: SnapshotItem[];
}

export function useActivityAttempt() {
    const [attempt, setAttempt] = useState<ActivityAttempt | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const startExam = useCallback(async (simuladoId: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/student/activities/exam/start", {
                method: "POST",
                body: JSON.stringify({ simuladoId }),
            });
            if (res.ok) {
                const data = await res.json();
                setAttempt(data);
                return data;
            } else {
                const err = await res.json();
                setError(err.message || "Erro ao iniciar simulado");
            }
        } catch {
            setError("Erro de conexão");
        } finally {
            setLoading(false);
        }
    }, []);

    const startQuiz = useCallback(async (moduleId: string, questionCount = 10) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/student/activities/quiz/start", {
                method: "POST",
                body: JSON.stringify({ moduleId, questionCount }),
            });
            if (res.ok) {
                const data = await res.json();
                setAttempt(data);
                return data;
            } else {
                const err = await res.json();
                setError(err.message || "Erro ao iniciar quiz");
            }
        } catch {
            setError("Erro de conexão");
        } finally {
            setLoading(false);
        }
    }, []);

    const submitAnswer = useCallback(async (attemptId: string, snapshotId: string, selectedOption: string) => {
        try {
            const res = await apiFetch(`/student/activities/${attemptId}/answer`, {
                method: "POST",
                body: JSON.stringify({ snapshotId, selectedOption }),
            });
            if (res.ok) {
                const snapshot: SnapshotItem = await res.json();
                // Update local state
                setAttempt((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        snapshots: prev.snapshots.map((s) =>
                            s.id === snapshot.id ? snapshot : s
                        ),
                    };
                });
                return snapshot;
            } else {
                const err = await res.json();
                setError(err.message);
            }
        } catch {
            setError("Erro de conexão");
        }
    }, []);

    const finishAttempt = useCallback(async (attemptId: string) => {
        setLoading(true);
        try {
            const res = await apiFetch(`/student/activities/${attemptId}/finish`, {
                method: "POST",
            });
            if (res.ok) {
                const data = await res.json();
                setAttempt(data);
                return data;
            } else {
                const err = await res.json();
                setError(err.message);
            }
        } catch {
            setError("Erro de conexão");
        } finally {
            setLoading(false);
        }
    }, []);

    const loadAttempt = useCallback(async (attemptId: string) => {
        setLoading(true);
        try {
            const res = await apiFetch(`/student/activities/${attemptId}`);
            if (res.ok) {
                const data = await res.json();
                setAttempt(data);
                return data;
            }
        } catch {
            setError("Erro de conexão");
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        attempt,
        loading,
        error,
        startExam,
        startQuiz,
        submitAnswer,
        finishAttempt,
        loadAttempt,
    };
}
