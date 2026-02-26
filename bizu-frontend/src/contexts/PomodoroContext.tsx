"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";

export type SessionType = "focus" | "shortBreak" | "longBreak";

interface PomodoroContextType {
    timeLeft: number;
    isRunning: boolean;
    sessionType: SessionType;
    completedCycles: number;
    totalFocusToday: number;
    focusDuration: number;
    shortBreakDuration: number;
    longBreakDuration: number;
    selectedSubject: string;
    availableModules: string[];

    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
    toggleTimer: () => void;
    resetTimer: () => void;
    skipSession: () => void;
    setSessionType: (type: SessionType) => void;
    setSelectedSubject: (subject: string) => void;
    setDurations: (focus: number, short: number, long: number) => void;
    saveSession: () => Promise<void>;
}

const PomodoroContext = createContext<PomodoroContextType | undefined>(undefined);

export function PomodoroProvider({ children }: { children: React.ReactNode }) {
    const [focusDuration, setFocusDuration] = useState(25);
    const [shortBreakDuration, setShortBreakDuration] = useState(5);
    const [longBreakDuration, setLongBreakDuration] = useState(15);
    const [timeLeft, setTimeLeft] = useState(25 * 60);
    const [isRunning, setIsRunning] = useState(false);
    const [isOpen, setIsOpen] = useState(true);
    const [sessionType, setSessionType] = useState<SessionType>("focus");
    const [completedCycles, setCompletedCycles] = useState(0);
    const [selectedSubject, setSelectedSubject] = useState("Selecione um módulo");
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [totalFocusToday, setTotalFocusToday] = useState(0);

    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchSummary = useCallback(async () => {
        try {
            const res = await apiFetch('/student/pomodoro/summary');
            if (res.ok) {
                const data = await res.json();
                setTotalFocusToday(data.totalFocusToday || 0);
                setCompletedCycles(data.completedCycles || 0);
            }
        } catch (error) {
            console.error("Error fetching pomodoro summary:", error);
        }
    }, []);

    const fetchModules = useCallback(async () => {
        try {
            const selectedCourseId = getStoredSelectedCourseId();
            if (selectedCourseId) {
                const res = await apiFetch(`/public/courses/${selectedCourseId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (data.modules && data.modules.length > 0) {
                        const moduleTitles = data.modules.map((m: any) => m.title);
                        setAvailableModules(moduleTitles);
                        if (selectedSubject === "Selecione um módulo") {
                            setSelectedSubject(moduleTitles[0]);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error fetching modules:", error);
        }
    }, [selectedSubject]);

    useEffect(() => {
        fetchSummary();
        fetchModules();
    }, [fetchSummary, fetchModules]);

    const getCurrentDuration = useCallback((type?: SessionType) => {
        const t = type || sessionType;
        switch (t) {
            case "focus": return focusDuration * 60;
            case "shortBreak": return shortBreakDuration * 60;
            case "longBreak": return longBreakDuration * 60;
        }
    }, [sessionType, focusDuration, shortBreakDuration, longBreakDuration]);

    const saveSession = useCallback(async () => {
        try {
            const selectedCourseId = getStoredSelectedCourseId();
            await apiFetch('/student/pomodoro/session', {
                method: "POST",
                body: JSON.stringify({
                    subject: selectedSubject,
                    focusMinutes: focusDuration,
                    cycles: 1,
                    courseId: selectedCourseId || null
                })
            });
            fetchSummary();
        } catch (error) {
            console.error("Error saving pomodoro session:", error);
        }
    }, [selectedSubject, focusDuration, fetchSummary]);

    const handleSessionComplete = useCallback(() => {
        setIsRunning(false);
        if (sessionType === "focus") {
            saveSession();
            const newCycles = completedCycles + 1;
            setCompletedCycles(newCycles);
            setTotalFocusToday(prev => prev + focusDuration);

            if (newCycles % 4 === 0) {
                setSessionType("longBreak");
                setTimeLeft(longBreakDuration * 60);
            } else {
                setSessionType("shortBreak");
                setTimeLeft(shortBreakDuration * 60);
            }
        } else {
            setSessionType("focus");
            setTimeLeft(focusDuration * 60);
        }

        // Notification logic can go here
        if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Pomodoro Concluido!", {
                body: sessionType === "focus" ? "Hora de uma pausa!" : "Hora de focar!",
                icon: "/favicon.ico"
            });
        }
    }, [sessionType, focusDuration, completedCycles, longBreakDuration, shortBreakDuration, saveSession]);

    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current!);
                        handleSessionComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, timeLeft, handleSessionComplete]);

    useEffect(() => {
        // Load from localStorage
        const saved = localStorage.getItem("bizu-pomodoro-state");
        if (saved) {
            try {
                const { timeLeft: sTime, sessionType: sType, isRunning: sRunning, isOpen: sOpen, lastUpdate } = JSON.parse(saved);
                const elapsedSinceLastUpdate = Math.floor((Date.now() - lastUpdate) / 1000);

                if (sOpen !== undefined) setIsOpen(sOpen);

                if (sRunning) {
                    const newTime = Math.max(0, sTime - elapsedSinceLastUpdate);
                    setTimeLeft(newTime);
                    // If time reached 0 while away, it will trigger complete on next tick
                    setIsRunning(true);
                } else {
                    setTimeLeft(sTime);
                    setSessionType(sType);
                }
            } catch (e) {
                console.error("Error parsing pomodoro state", e);
            }
        }
    }, []);

    useEffect(() => {
        // Save to localStorage
        const state = {
            timeLeft,
            sessionType,
            isRunning,
            isOpen,
            lastUpdate: Date.now()
        };
        localStorage.setItem("bizu-pomodoro-state", JSON.stringify(state));
    }, [timeLeft, sessionType, isRunning, isOpen]);

    const toggleTimer = () => setIsRunning(prev => !prev);

    const resetTimer = () => {
        setIsRunning(false);
        setTimeLeft(getCurrentDuration());
    };

    const skipSession = () => {
        setIsRunning(false);
        if (sessionType === "focus") {
            setSessionType("shortBreak");
            setTimeLeft(shortBreakDuration * 60);
        } else {
            setSessionType("focus");
            setTimeLeft(focusDuration * 60);
        }
    };

    const setDurations = (focus: number, short: number, long: number) => {
        setFocusDuration(focus);
        setShortBreakDuration(short);
        setLongBreakDuration(long);
        // If not running, update timeLeft
        if (!isRunning) {
            if (sessionType === "focus") setTimeLeft(focus * 60);
            else if (sessionType === "shortBreak") setTimeLeft(short * 60);
            else if (sessionType === "longBreak") setTimeLeft(long * 60);
        }
    };

    const changeSessionType = (type: SessionType) => {
        setIsRunning(false);
        setSessionType(type);
        setTimeLeft(getCurrentDuration(type));
    };

    const value = {
        timeLeft,
        isRunning,
        sessionType,
        isOpen,
        completedCycles,
        totalFocusToday,
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        selectedSubject,
        availableModules,
        toggleTimer,
        resetTimer,
        skipSession,
        setIsOpen,
        setSessionType: changeSessionType,
        setSelectedSubject,
        setDurations,
        saveSession
    };

    return (
        <PomodoroContext.Provider value={value}>
            {children}
        </PomodoroContext.Provider>
    );
}

export function usePomodoro() {
    const context = useContext(PomodoroContext);
    if (context === undefined) {
        throw new Error("usePomodoro must be used within a PomodoroProvider");
    }
    return context;
}
