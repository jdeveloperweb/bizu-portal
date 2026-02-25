"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

// ------------------------------------------------------------------
// Types
// ------------------------------------------------------------------
export interface CourseEntitlement {
    id: string;
    courseId: string;
    courseTitle?: string;
    source: string;
    expiresAt: string | null;
    active: boolean;
}

export interface GamificationState {
    xp: number;
    streak: number;
    maxStreak: number;
    level?: number;
}

export interface CourseContextType {
    /** Currently selected course ID (single source of truth) */
    activeCourseId: string | null;
    /** Set selected course (persists to backend + localStorage) */
    selectCourse: (courseId: string) => Promise<void>;
    /** Active entitlements for the current user */
    entitlements: CourseEntitlement[];
    /** Whether the user has active entitlement for the selected course */
    hasEntitlement: boolean;
    /** Real-time gamification state (updated via SSE) */
    gamification: GamificationState;
    /** Loading state */
    loading: boolean;
    /** Whether entitlement is expired (shows paywall) */
    entitlementExpired: boolean;
}

const defaultGamification: GamificationState = { xp: 0, streak: 0, maxStreak: 0 };

const CourseCtx = createContext<CourseContextType | undefined>(undefined);

// ------------------------------------------------------------------
// Provider
// ------------------------------------------------------------------
export function CourseProvider({ children }: { children: React.ReactNode }) {
    const { authenticated, user, selectedCourseId, setSelectedCourseId, refreshUserProfile } = useAuth();
    const [entitlements, setEntitlements] = useState<CourseEntitlement[]>([]);
    const [gamification, setGamification] = useState<GamificationState>(defaultGamification);
    const [loading, setLoading] = useState(true);
    const eventSourceRef = useRef<EventSource | null>(null);

    const activeCourseId = selectedCourseId ?? null;

    // Derived: does user have entitlement for selected course?
    const currentEntitlement = entitlements.find(
        (e) => e.courseId === activeCourseId && e.active
    );
    const hasEntitlement = !!currentEntitlement;
    const entitlementExpired = activeCourseId !== null && !hasEntitlement && !loading;

    // ------------------------------------------------------------------
    // Load entitlements on auth
    // ------------------------------------------------------------------
    const loadEntitlements = useCallback(async () => {
        if (!authenticated) return;
        try {
            const res = await apiFetch("/student/entitlements/me");
            if (res.ok) {
                const data = await res.json();
                setEntitlements(
                    data.map((e: Record<string, unknown>) => ({
                        id: e.id,
                        courseId: (e.course as Record<string, unknown>)?.id ?? e.courseId,
                        source: e.source,
                        expiresAt: e.expiresAt,
                        active: e.active,
                    }))
                );
            }
        } catch {
            // Entitlement endpoint may not exist yet during migration
        } finally {
            setLoading(false);
        }
    }, [authenticated]);

    useEffect(() => {
        loadEntitlements();
    }, [loadEntitlements]);

    // ------------------------------------------------------------------
    // SSE for real-time gamification updates
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!authenticated || !activeCourseId) return;

        const token = typeof window !== "undefined"
            ? document.cookie.match(/(?:^|;\s*)token=([^;]*)/)?.[1]
            : null;

        if (!token) return;

        const apiBase = process.env.NEXT_PUBLIC_API_URL || "";
        const sseUrl = `${apiBase}/student/sse/progress`;

        const es = new EventSource(sseUrl);
        eventSourceRef.current = es;

        es.addEventListener("gamification", (event) => {
            try {
                const data = JSON.parse(event.data);
                setGamification({
                    xp: data.xp ?? 0,
                    streak: data.streak ?? 0,
                    maxStreak: data.maxStreak ?? 0,
                    level: data.level,
                });
            } catch {
                // ignore parse errors
            }
        });

        es.addEventListener("entitlement_change", () => {
            loadEntitlements();
        });

        es.onerror = () => {
            es.close();
            eventSourceRef.current = null;
        };

        return () => {
            es.close();
            eventSourceRef.current = null;
        };
    }, [authenticated, activeCourseId, loadEntitlements]);

    // ------------------------------------------------------------------
    // Load gamification on mount
    // ------------------------------------------------------------------
    useEffect(() => {
        if (!authenticated) return;
        (async () => {
            try {
                const res = await apiFetch("/student/gamification/me");
                if (res.ok) {
                    const data = await res.json();
                    setGamification({
                        xp: data.totalXp ?? data.xp ?? 0,
                        streak: data.currentStreak ?? data.streak ?? 0,
                        maxStreak: data.maxStreak ?? data.max_streak ?? 0,
                        level: data.level,
                    });
                }
            } catch {
                // silently fail
            }
        })();
    }, [authenticated]);

    // ------------------------------------------------------------------
    // Select course
    // ------------------------------------------------------------------
    const selectCourse = useCallback(async (courseId: string) => {
        setSelectedCourseId(courseId);

        // Persist to backend
        await apiFetch("/users/me/selected-course", {
            method: "PUT",
            body: JSON.stringify({ courseId }),
        });

        await refreshUserProfile();
        await loadEntitlements();
    }, [setSelectedCourseId, refreshUserProfile, loadEntitlements]);

    return (
        <CourseCtx.Provider
            value={{
                activeCourseId,
                selectCourse,
                entitlements,
                hasEntitlement,
                gamification,
                loading,
                entitlementExpired,
            }}
        >
            {children}
        </CourseCtx.Provider>
    );
}

// ------------------------------------------------------------------
// Hook
// ------------------------------------------------------------------
export function useCourse() {
    const ctx = useContext(CourseCtx);
    if (!ctx) throw new Error("useCourse must be used within <CourseProvider>");
    return ctx;
}
