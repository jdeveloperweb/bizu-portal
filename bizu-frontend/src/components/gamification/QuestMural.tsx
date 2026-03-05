"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, CheckCircle2, Zap, Brain, Swords, Trophy, Loader2 } from "lucide-react";
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

export function QuestMural() {
    const [quests, setQuests] = useState<Quest[]>([]);
    const [loading, setLoading] = useState(true);
    const [claiming, setClaiming] = useState<string | null>(null);

    const fetchQuests = async () => {
        try {
            const res = await apiFetch("/student/quests/me");
            if (res.ok) {
                const data = await res.json();
                setQuests(data);
            }
        } catch (e) {
            console.error("Error fetching quests:", e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQuests();
        const interval = setInterval(fetchQuests, 60000); // Refresh every minute
        return () => clearInterval(interval);
    }, []);

    const handleClaim = async (code: string) => {
        setClaiming(code);
        try {
            const res = await apiFetch(`/student/quests/${code}/claim`, { method: "POST" });
            if (res.ok) {
                // Success animation or toast could go here
                fetchQuests();
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

                    return (
                        <div key={quest.id} className={cn(
                            "group p-4 rounded-3xl border transition-all duration-300",
                            isClaimed ? "bg-slate-50 border-slate-100 opacity-60" :
                                isCompleted ? "bg-emerald-50 border-emerald-100 ring-2 ring-emerald-500/20" :
                                    "bg-white border-slate-100 hover:border-indigo-200 hover:shadow-md"
                        )}>
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
                                        className={cn(
                                            "h-full rounded-full transition-all duration-500",
                                            isCompleted || isClaimed ? "bg-emerald-500" : "bg-indigo-500"
                                        )}
                                    />
                                </div>
                            </div>

                            {isCompleted && !isClaimed && (
                                <button
                                    onClick={() => handleClaim(quest.code)}
                                    disabled={claiming === quest.code}
                                    className="w-full mt-4 bg-emerald-600 text-white py-2 rounded-xl text-xs font-black shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    {claiming === quest.code ? (
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                    ) : (
                                        <>
                                            <Trophy size={14} /> Resgatar Recompensa
                                        </>
                                    )}
                                </button>
                            )}

                            {isClaimed && (
                                <div className="w-full mt-4 py-2 flex items-center justify-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest">
                                    <CheckCircle2 size={12} /> Completada & Resgatada
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <p className="mt-6 text-[9px] text-center font-bold text-slate-400 uppercase tracking-widest leading-relaxed">
                As missões diárias resetam à meia-noite.<br />Semanais resetam todo domingo.
            </p>
        </div>
    );
}
