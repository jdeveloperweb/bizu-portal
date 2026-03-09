"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Zap, Brain, Trophy, Loader2, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

interface Quest {
    id: string;
    code: string;
    title: string;
    description: string;
    rewardXp: number;
    rewardAxons: number;
    type: "DAILY" | "WEEKLY";
    goalValue: number;
    currentValue: number;
    status: "IN_PROGRESS" | "COMPLETED" | "CLAIMED";
}

interface ClaimResult {
    xpGained: number;
    axonsGained: number;
    totalXp: number;
    currentLevel: number;
    leveledUp: boolean;
}

interface ClaimedQuest {
    code: string;
    result: ClaimResult;
}

// Confetti particle component
function ConfettiParticle({ delay, color }: { delay: number; color: string }) {
    const x = (Math.random() - 0.5) * 140;
    const rotate = (Math.random() - 0.5) * 720;
    return (
        <motion.div
            className="absolute w-2 h-2 rounded-sm pointer-events-none"
            style={{ backgroundColor: color, top: "50%", left: "50%" }}
            initial={{ opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }}
            animate={{ opacity: 0, x, y: -80 - Math.random() * 60, rotate, scale: 0.3 }}
            transition={{ duration: 0.9 + Math.random() * 0.4, delay, ease: "easeOut" }}
        />
    );
}

const CONFETTI_COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#a78bfa", "#34d399"];

export function QuestMural() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);
    const [justClaimed, setJustClaimed] = useState<ClaimedQuest | null>(null);
    const claimTimeout = useRef<NodeJS.Timeout | null>(null);

    const fetchQuests = async () => {
        try {
            const res = await apiFetch("/student/quests/me");
            if (res.ok) {
                setQuests(await res.json());
            }
        } catch (e) {
            console.error("Error fetching quests:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuests();
        const interval = setInterval(fetchQuests, 60000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        return () => {
            if (claimTimeout.current) clearTimeout(claimTimeout.current);
        };
    }, []);

    const handleClaim = async (code: string) => {
        setClaiming(code);
        try {
            const res = await apiFetch(`/student/quests/${code}/claim`, { method: "POST" });
            if (res.ok) {
                const result: ClaimResult = await res.json();
                setJustClaimed({ code, result });

                // After 2.5s, clear animation state and refresh
                if (claimTimeout.current) clearTimeout(claimTimeout.current);
                claimTimeout.current = setTimeout(() => {
                    setJustClaimed(null);
                    fetchQuests();
                }, 2500);
            }
        } catch (e) {
            console.error("Error claiming quest:", e);
        } finally {
            setClaiming(null);
        }
    };

    if (loading && quests.length === 0) {
        return (
            <div className="bg-white border-2 border-indigo-100 rounded-[40px] p-8 shadow-xl shadow-indigo-100/20">
                <div className="flex items-center gap-3 mb-6">
                    <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                    <h3 className="text-xl font-black text-slate-900">Carregando Missões...</h3>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white border-2 border-indigo-100 rounded-[40px] p-6 shadow-xl shadow-indigo-100/20">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-600 rounded-xl text-white">
                        <Target size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 leading-tight">Mural de Missões</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ganhos extras por esforço</p>
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {quests.map((quest) => {
                    const progress = (quest.currentValue / quest.goalValue) * 100;
                    const isCompleted = quest.status === "COMPLETED";
                    const isClaimed = quest.status === "CLAIMED";
                    const isClaiming = claiming === quest.code;
                    const isJustClaimed = justClaimed?.code === quest.code;

                    return (
                        <motion.div
                            key={quest.id}
                            animate={isJustClaimed ? {
                                boxShadow: ["0 0 0 0 rgba(16,185,129,0)", "0 0 0 8px rgba(16,185,129,0.3)", "0 0 0 0 rgba(16,185,129,0)"],
                            } : {}}
                            transition={{ duration: 0.7, ease: "easeOut" }}
                            className={cn(
                                "group relative p-4 rounded-3xl border transition-all duration-300",
                                isClaimed ? "bg-slate-50 border-slate-100 opacity-60" :
                                    isJustClaimed ? "bg-emerald-50 border-emerald-300" :
                                        isCompleted ? "bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/20" :
                                            "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md"
                            )}
                        >
                            {/* Confetti burst on claim */}
                            <AnimatePresence>
                                {isJustClaimed && (
                                    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                                        {CONFETTI_COLORS.flatMap((color, ci) =>
                                            Array.from({ length: 3 }).map((_, pi) => (
                                                <ConfettiParticle
                                                    key={`${ci}-${pi}`}
                                                    color={color}
                                                    delay={pi * 0.06}
                                                />
                                            ))
                                        )}
                                    </div>
                                )}
                            </AnimatePresence>

                            <div className="flex items-start justify-between gap-3 mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h4 className="text-sm font-black text-slate-800">{quest.title}</h4>
                                        <span className={cn(
                                            "text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-tighter",
                                            quest.type === 'DAILY' ? "bg-amber-100 text-amber-600" : "bg-purple-100 text-purple-600"
                                        )}>
                                            {quest.type === 'DAILY' ? 'Diária' : 'Semanal'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 font-medium leading-tight">
                                        {quest.description}
                                    </p>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="flex items-center gap-1 text-[10px] font-black text-indigo-600">
                                        <Zap size={10} fill="currentColor" /> +{quest.rewardXp}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-violet-600">
                                        <Brain size={10} fill="currentColor" /> +{quest.rewardAxons}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                    <span>Progresso</span>
                                    <span>{quest.currentValue} / {quest.goalValue}</span>
                                </div>
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.6, ease: "easeOut" }}
                                        className={cn(
                                            "h-full rounded-full",
                                            isCompleted || isClaimed || isJustClaimed ? "bg-emerald-500" : "bg-indigo-500"
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Claim button */}
                            <AnimatePresence mode="wait">
                                {isCompleted && !isClaimed && !isJustClaimed && (
                                    <motion.button
                                        key="claim-btn"
                                        initial={{ opacity: 0, y: 6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        onClick={() => handleClaim(quest.code)}
                                        disabled={isClaiming}
                                        className="relative w-full mt-4 bg-emerald-600 text-white py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2 overflow-hidden"
                                    >
                                        <AnimatePresence mode="wait">
                                            {isClaiming ? (
                                                <motion.span
                                                    key="loading"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Loader2 className="w-3 h-3 animate-spin" />
                                                    Resgatando...
                                                </motion.span>
                                            ) : (
                                                <motion.span
                                                    key="idle"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Trophy size={14} /> Resgatar Recompensa
                                                </motion.span>
                                            )}
                                        </AnimatePresence>
                                    </motion.button>
                                )}

                                {/* Reward claimed animation */}
                                {isJustClaimed && justClaimed && (
                                    <motion.div
                                        key="claimed-reward"
                                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ type: "spring", stiffness: 400, damping: 20 }}
                                        className="mt-4 rounded-xl bg-emerald-600 p-3 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-2 text-white">
                                            <motion.div
                                                animate={{ rotate: [0, -15, 15, -10, 10, 0] }}
                                                transition={{ duration: 0.5, delay: 0.1 }}
                                            >
                                                <Sparkles size={16} />
                                            </motion.div>
                                            <span className="text-xs font-black">Resgatado!</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.15 }}
                                                className="flex items-center gap-1 text-[11px] font-black text-yellow-300"
                                            >
                                                <Zap size={11} fill="currentColor" />
                                                +{justClaimed.result.xpGained}
                                            </motion.span>
                                            <motion.span
                                                initial={{ opacity: 0, x: 10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.25 }}
                                                className="flex items-center gap-1 text-[11px] font-black text-violet-200"
                                            >
                                                <Brain size={11} fill="currentColor" />
                                                +{justClaimed.result.axonsGained}
                                            </motion.span>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Level up banner */}
                                {isJustClaimed && justClaimed?.result.leveledUp && (
                                    <motion.div
                                        key="levelup"
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                                        className="mt-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 p-2 flex items-center justify-center gap-2"
                                    >
                                        <Trophy size={12} className="text-yellow-300" />
                                        <span className="text-[10px] font-black text-white uppercase tracking-wider">
                                            Level Up! Nível {justClaimed.result.currentLevel}
                                        </span>
                                    </motion.div>
                                )}

                                {/* Already claimed state */}
                                {isClaimed && (
                                    <motion.div
                                        key="done"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest"
                                    >
                                        <CheckCircle2 size={12} /> Completada & Resgatada
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    );
                })}
            </div>

            <p className="mt-6 text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                As missões diárias resetam à meia-noite.<br />Semanais resetam todo domingo.
            </p>
        </div>
    );
}
