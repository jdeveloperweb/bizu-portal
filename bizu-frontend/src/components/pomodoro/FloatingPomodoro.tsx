"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Timer, Play, Pause, RotateCcw, SkipForward,
    Brain, Coffee, Target, Plus, X, StickyNote, CheckSquare,
    ChevronRight, ChevronLeft, GripVertical, Pin, PinOff
} from "lucide-react";
import { usePathname } from "next/navigation";
import { usePomodoro, SessionType } from "@/contexts/PomodoroContext";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function FloatingPomodoro() {
    const {
        timeLeft,
        isRunning,
        sessionType,
        completedCycles,
        toggleTimer,
        resetTimer,
        skipSession,
        isOpen,
        setIsOpen,
        isFloating,
        setIsFloating
    } = usePomodoro();

    const pathname = usePathname();
    const isDashboard = pathname === "/dashboard" || pathname === "/(student)/dashboard";

    const [isExpanded, setIsExpanded] = useState(false);
    const [showQuickAction, setShowQuickAction] = useState<"none" | "task" | "note">("none");
    const [quickValue, setQuickValue] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    if (!isOpen) return null;
    if (isDashboard && !isFloating) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    const colors = {
        focus: "from-indigo-500 to-violet-600",
        shortBreak: "from-emerald-500 to-teal-600",
        longBreak: "from-amber-500 to-orange-600",
    }[sessionType];

    const shadowColors = {
        focus: "shadow-indigo-200",
        shortBreak: "shadow-emerald-200",
        longBreak: "shadow-amber-200",
    }[sessionType];

    const handleSaveQuick = async () => {
        if (!quickValue.trim()) return;
        setIsSaving(true);
        try {
            if (showQuickAction === "task") {
                await apiFetch("/student/tasks", {
                    method: "POST",
                    body: JSON.stringify({
                        title: quickValue,
                        subject: "Geral",
                        priority: "media",
                        status: "pendente",
                        source: "manual",
                        dueDate: "Sem prazo"
                    })
                });
            } else if (showQuickAction === "note") {
                await apiFetch("/student/notes", {
                    method: "POST",
                    body: JSON.stringify({
                        title: quickValue.split("\n")[0].substring(0, 50),
                        content: quickValue,
                        moduleId: null,
                        tags: ["pomodoro"],
                        pinned: false,
                        starred: false,
                    })
                });
            }
            setQuickValue("");
            setShowQuickAction("none");
        } catch (error) {
            console.error("Error saving quick item:", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed bottom-24 right-6 z-[9999] pointer-events-none">
            <motion.div
                drag
                dragMomentum={false}
                dragConstraints={{ top: -800, left: -1200, right: 0, bottom: 0 }}
                dragElastic={0.1}
                className={`pointer-events-auto relative flex items-center gap-3 p-1.5 rounded-2xl bg-white border border-slate-200 shadow-xl ${shadowColors} group`}
            >
                {/* Floating Quick Action Panel */}
                <AnimatePresence>
                    {showQuickAction !== "none" && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 10 }}
                            className="absolute bottom-full right-0 mb-3 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 p-4"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-[12px] font-bold text-slate-800 flex items-center gap-2">
                                    {showQuickAction === "task" ? <CheckSquare size={13} className="text-indigo-500" /> : <StickyNote size={13} className="text-amber-500" />}
                                    {showQuickAction === "task" ? "Nova Tarefa Rápida" : "Nova Anotação Rápida"}
                                </h4>
                                <button onClick={() => setShowQuickAction("none")} className="text-slate-400 hover:text-slate-600">
                                    <X size={14} />
                                </button>
                            </div>
                            {showQuickAction === "task" ? (
                                <input
                                    value={quickValue}
                                    onChange={e => setQuickValue(e.target.value)}
                                    placeholder="O que você precisa fazer?"
                                    autoFocus
                                    className="input-field !h-10 text-[12px] mb-3"
                                    onKeyDown={e => e.key === 'Enter' && handleSaveQuick()}
                                />
                            ) : (
                                <textarea
                                    value={quickValue}
                                    onChange={e => setQuickValue(e.target.value)}
                                    placeholder="Escreva seu insight..."
                                    autoFocus
                                    className="w-full p-3 rounded-xl bg-slate-50 border border-slate-200 text-[12px] text-slate-700 leading-relaxed outline-none mb-3 h-24 resize-none"
                                />
                            )}
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSaveQuick}
                                    disabled={isSaving || !quickValue.trim()}
                                    className="btn-primary !h-8 !text-[11px] flex-1 disabled:opacity-50"
                                >
                                    {isSaving ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="flex items-center gap-2 pl-1">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${colors} flex items-center justify-center text-white shadow-md`}>
                        {sessionType === "focus" ? <Brain size={16} /> : <Coffee size={16} />}
                    </div>
                    <div className="pr-1">
                        <div className="text-[13px] font-extrabold text-slate-900 tabular-nums leading-tight">
                            {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                        </div>
                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter -mt-0.5">
                            Ciclo {completedCycles % 4 + 1}/4
                        </div>
                    </div>
                </div>

                <div className="h-8 w-[1px] bg-slate-100" />

                <div className="flex items-center gap-1 pr-1">
                    <button onClick={toggleTimer} className="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-600 transition-all">
                        {isRunning ? <Pause size={15} /> : <Play size={15} className="ml-0.5" />}
                    </button>

                    {isExpanded ? (
                        <>
                            <button onClick={skipSession} className="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-slate-400 transition-all">
                                <SkipForward size={14} />
                            </button>
                            <div className="h-6 w-[1px] bg-slate-100 mx-1" />
                            <button onClick={() => setShowQuickAction("task")} className="w-8 h-8 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 flex items-center justify-center text-slate-400 transition-all">
                                <CheckSquare size={14} />
                            </button>
                            <button onClick={() => setShowQuickAction("note")} className="w-8 h-8 rounded-xl hover:bg-amber-50 hover:text-amber-600 flex items-center justify-center text-slate-400 transition-all">
                                <StickyNote size={14} />
                            </button>
                            <button onClick={() => setIsExpanded(false)} className="w-6 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500">
                                <ChevronRight size={14} />
                            </button>
                            {isDashboard && isFloating && (
                                <button
                                    onClick={() => setIsFloating(false)}
                                    className="w-8 h-8 rounded-xl hover:bg-slate-50 flex items-center justify-center text-indigo-500 transition-all"
                                    title="Fixar no Cabeçalho"
                                >
                                    <Pin size={14} />
                                </button>
                            )}
                        </>
                    ) : (
                        <button onClick={() => setIsExpanded(true)} className="w-6 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500">
                            <ChevronLeft size={14} />
                        </button>
                    )}

                    <div className="h-4 w-[1px] bg-slate-100 mx-0.5" />

                    <button
                        onClick={() => setIsOpen(false)}
                        className="w-7 h-7 rounded-lg hover:bg-red-50 hover:text-red-500 flex items-center justify-center text-slate-300 transition-all"
                        title="Fechar Pomodoro"
                    >
                        <X size={14} />
                    </button>
                </div>

                {/* Drag handle hint */}
                <div className="absolute -top-1 -left-1 opacity-0 group-hover:opacity-100 transition-opacity cursor-move">
                    <div className="bg-slate-600 text-white p-0.5 rounded-full shadow-lg">
                        <GripVertical size={10} />
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
