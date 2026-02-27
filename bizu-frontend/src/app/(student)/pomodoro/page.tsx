"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
    Timer, Play, Pause, RotateCcw, SkipForward,
    Coffee, Brain, TrendingUp, Flame, Target,
    CheckCircle2, ChevronRight, Settings, Volume2,
    VolumeX, BookOpen, Zap,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";

import { usePomodoro, SessionType } from "@/contexts/PomodoroContext";

interface PomodoroSession {
    id: string;
    subject: string;
    focusMinutes: number;
    completedAt: string;
    cycles: number;
}

const PRESETS = [
    { label: "Classico", focus: 25, short: 5, long: 15 },
    { label: "Intenso", focus: 50, short: 10, long: 20 },
    { label: "Rapido", focus: 15, short: 3, long: 10 },
];

export default function PomodoroPage() {
    const {
        timeLeft,
        isRunning,
        sessionType,
        completedCycles,
        totalFocusToday,
        focusDuration,
        shortBreakDuration,
        longBreakDuration,
        selectedSubject,
        availableModules,
        isOpen,
        toggleTimer,
        resetTimer,
        skipSession,
        setSessionType,
        setSelectedSubject,
        setDurations,
        setIsOpen
    } = usePomodoro();

    const { isFree } = useAuth();

    const [showSubjectPicker, setShowSubjectPicker] = useState(false);
    const [soundEnabled, setSoundEnabled] = useState(true);
    const [recentSessions, setRecentSessions] = useState<PomodoroSession[]>([]);

    useEffect(() => {
        const fetchRecent = async () => {
            try {
                const res = await apiFetch('/student/pomodoro/summary');
                if (res.ok) {
                    const data = await res.json();
                    setRecentSessions(data.recentSessions || []);
                }
            } catch (error) {
                console.error("Error fetching recent sessions:", error);
            }
        };
        fetchRecent();
    }, [completedCycles]);

    const applyPreset = (preset: typeof PRESETS[0]) => {
        setDurations(preset.focus, preset.short, preset.long);
    };

    const switchSession = (type: SessionType) => {
        setSessionType(type);
    };

    const totalSeconds = (sessionType === "focus"
        ? focusDuration
        : sessionType === "shortBreak"
            ? shortBreakDuration
            : longBreakDuration) * 60;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const progress = 1 - (timeLeft / totalSeconds);

    const sessionColors = {
        focus: { bg: "from-indigo-500 to-violet-600", ring: "stroke-indigo-500", text: "text-indigo-600", light: "bg-indigo-50" },
        shortBreak: { bg: "from-emerald-500 to-teal-600", ring: "stroke-emerald-500", text: "text-emerald-600", light: "bg-emerald-50" },
        longBreak: { bg: "from-amber-500 to-orange-600", ring: "stroke-amber-500", text: "text-amber-600", light: "bg-amber-50" },
    };
    const colors = sessionColors[sessionType];

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Pomodoro Premium"
                    description="O ciclo Pomodoro é um recurso exclusivo para assinantes. Desbloqueie todo o potencial de foco!"
                />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Pomodoro</span>
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className={`pill text-[10px] font-bold uppercase tracking-[0.15em] transition-all ${isOpen ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}
                        >
                            Widget {isOpen ? 'Ativo' : 'Oculto'}
                        </button>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Foco Total
                    </h1>
                    <p className="text-sm text-slate-500">Controle seus ciclos de estudo e descanso para maxima produtividade.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`hidden md:flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold transition-all border ${isOpen
                            ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                            : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                            }`}
                    >
                        <Timer size={14} /> {isOpen ? "Ocultar Widget" : "Mostrar Widget"}
                    </button>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                        <Flame size={13} /> {totalFocusToday}min hoje
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-full">
                        <Target size={13} /> {completedCycles} ciclos
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Timer */}
                <div className="lg:col-span-2 space-y-5">
                    {/* Session Tabs */}
                    <div className="card-elevated !rounded-2xl p-2 flex gap-1">
                        {([
                            { type: "focus" as SessionType, label: "Foco", icon: Brain },
                            { type: "shortBreak" as SessionType, label: "Pausa Curta", icon: Coffee },
                            { type: "longBreak" as SessionType, label: "Pausa Longa", icon: Coffee },
                        ]).map(tab => {
                            const Icon = tab.icon;
                            const active = sessionType === tab.type;
                            return (
                                <button key={tab.type} onClick={() => switchSession(tab.type)}
                                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all ${active ? `bg-gradient-to-r ${sessionColors[tab.type].bg} text-white shadow-sm` : "text-slate-500 hover:bg-slate-50"
                                        }`}>
                                    <Icon size={14} /> {tab.label}
                                </button>
                            );
                        })}
                    </div>

                    {/* Timer Circle */}
                    <div className="card-elevated !rounded-2xl p-8 flex flex-col items-center hover:!transform-none">
                        {/* Subject Selector */}
                        <div className="relative mb-6">
                            <button onClick={() => setShowSubjectPicker(!showSubjectPicker)}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[12px] font-bold ${colors.text} ${colors.light} border border-current/10 transition-all hover:shadow-sm`}>
                                <BookOpen size={13} /> {selectedSubject} <ChevronRight size={11} className={showSubjectPicker ? "rotate-90" : ""} />
                            </button>
                            {showSubjectPicker && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-lg z-10 p-1.5 min-w-[240px] max-h-48 overflow-y-auto hidden-scrollbar">
                                    {availableModules.length > 0 ? (
                                        availableModules.map(s => (
                                            <button key={s} onClick={() => { setSelectedSubject(s); setShowSubjectPicker(false); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-[12px] font-medium transition-all ${s === selectedSubject ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"
                                                    }`}>
                                                {s}
                                            </button>
                                        ))
                                    ) : (
                                        <div className="text-[12px] text-slate-500 p-2 text-center">Nenhum módulo encontrado</div>
                                    )}
                                </div>

                            )}
                        </div>

                        {/* Circular Progress */}
                        <div className="relative w-64 h-64 mb-8">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                                <circle cx="100" cy="100" r="88" fill="none" stroke="#F1F5F9" strokeWidth="8" />
                                <circle cx="100" cy="100" r="88" fill="none" className={colors.ring}
                                    strokeWidth="8" strokeLinecap="round"
                                    strokeDasharray={2 * Math.PI * 88}
                                    strokeDashoffset={2 * Math.PI * 88 * (1 - progress)}
                                    style={{ transition: "stroke-dashoffset 1s linear" }} />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <div className="text-5xl font-extrabold text-slate-900 tabular-nums tracking-tight">
                                    {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
                                </div>
                                <div className={`text-[11px] font-bold uppercase tracking-widest mt-1 ${colors.text}`}>
                                    {sessionType === "focus" ? "Focando" : sessionType === "shortBreak" ? "Pausa Curta" : "Pausa Longa"}
                                </div>
                            </div>
                        </div>

                        {/* Controls */}
                        <div className="flex items-center gap-3">
                            <button onClick={resetTimer}
                                className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
                                <RotateCcw size={16} />
                            </button>
                            <button onClick={toggleTimer}
                                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${colors.bg} flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all hover:scale-105`}>
                                {isRunning ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                            </button>
                            <button onClick={skipSession}
                                className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
                                <SkipForward size={16} />
                            </button>
                            <button onClick={() => setSoundEnabled(!soundEnabled)}
                                className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200 transition-all">
                                {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                            </button>
                        </div>

                        {/* Cycle Indicators */}
                        <div className="flex items-center gap-2 mt-6">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className={`w-3 h-3 rounded-full transition-all ${i <= (completedCycles % 4) ? `bg-gradient-to-br ${colors.bg}` : "bg-slate-200"
                                    }`} />
                            ))}
                            <span className="text-[10px] text-slate-400 font-semibold ml-1">
                                {completedCycles % 4}/4 ate pausa longa
                            </span>
                        </div>
                    </div>

                    {/* Presets */}
                    <div className="grid grid-cols-3 gap-3">
                        {PRESETS.map(p => (
                            <button key={p.label} onClick={() => applyPreset(p)}
                                className="card-elevated !rounded-2xl p-4 text-center group hover:border-indigo-200">
                                <div className="text-[11px] font-bold text-slate-800 mb-1">{p.label}</div>
                                <div className="text-[10px] text-slate-400">{p.focus}min foco / {p.short}min pausa</div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Stats Today */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <TrendingUp size={14} className="text-indigo-500" /> Resumo de Hoje
                        </h3>
                        <div className="space-y-3">
                            {[
                                { label: "Tempo de foco", value: `${totalFocusToday}min`, color: "text-indigo-600" },
                                { label: "Ciclos completos", value: String(completedCycles), color: "text-violet-600" },
                                { label: "Sessoes", value: String(recentSessions.length), color: "text-emerald-600" },
                            ].map(s => (
                                <div key={s.label} className="flex items-center justify-between py-1.5">
                                    <span className="text-[12px] text-slate-500">{s.label}</span>
                                    <span className={`text-[13px] font-extrabold ${s.color}`}>{s.value}</span>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all"
                                style={{ width: `${Math.min((totalFocusToday / 120) * 100, 100)}%` }} />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1.5">Meta: 120min diarios ({Math.round((totalFocusToday / 120) * 100)}%)</div>
                    </div>

                    {/* Recent Sessions */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Timer size={14} className="text-slate-400" /> Sessoes Recentes
                        </h3>
                        <div className="space-y-2.5">
                            {recentSessions.map(session => (
                                <div key={session.id} className="flex items-center gap-3 py-1.5">
                                    <div className="w-7 h-7 rounded-lg bg-indigo-50 flex items-center justify-center">
                                        <Brain size={13} className="text-indigo-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-[12px] text-slate-700 font-medium truncate">{session.subject}</div>
                                        <div className="text-[10px] text-slate-400">{session.focusMinutes}min - {session.cycles} ciclos - {session.completedAt}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Acoes Rapidas
                        </h3>
                        <div className="space-y-2">
                            <Link href="/tarefas" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <CheckCircle2 size={14} className="text-slate-400" /> Ver tarefas pendentes
                            </Link>
                            <Link href="/questoes/treino" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Target size={14} className="text-slate-400" /> Resolver questoes
                            </Link>
                            <Link href="/configuracoes" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Settings size={14} className="text-slate-400" /> Ajustar tempos
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
