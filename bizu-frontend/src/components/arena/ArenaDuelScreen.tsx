"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swords, Trophy, Timer, CheckCircle2, XCircle, Zap, Shield, Crown, Maximize2, Minimize2, Target, Maximize, Minimize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Duel, DuelQuestion, DuelService } from "@/lib/duelService";
import { useDuelWebSocket } from "@/hooks/useDuelWebSocket";
import { useGamification } from "@/components/gamification/GamificationProvider";
import { apiFetch } from "@/lib/api";
import { getAvatarUrl } from "@/lib/imageUtils";
import confetti from "canvas-confetti";

interface ArenaDuelScreenProps {
    duelId: string;
    onClose: () => void;
    currentUserId: string;
}

export default function ArenaDuelScreen({ duelId, onClose, currentUserId }: ArenaDuelScreenProps) {
    const { showReward } = useGamification();
    const [duel, setDuel] = useState<Duel | null>(null);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [timeLeft, setTimeLeft] = useState(30);
    const [showCorrection, setShowCorrection] = useState(false);
    const [isMaximized, setIsMaximized] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useDuelWebSocket(duelId, (updatedDuel) => {
        setDuel(updatedDuel);
    });

    // Reset local state when round changes (works for both WebSocket and Polling)
    useEffect(() => {
        if (duel?.currentRound) {
            setSelectedAnswer(null);
            setShowCorrection(false);
            setTimeLeft(30);
        }
    }, [duel?.currentRound]);

    useEffect(() => {
        const fetchDuel = async () => {
            try {
                const data = await DuelService.getDuel(duelId);
                setDuel(data);
            } catch (err) {
                console.error("Failed to fetch duel", err);
            }
        };
        fetchDuel();

        // Fallback polling as redundancy for WebSockets
        const interval = setInterval(() => {
            if (!duel || duel.status === "PENDING" || duel.status === "IN_PROGRESS") {
                fetchDuel();
            }
        }, 8000); // 8 seconds is enough for fallback

        return () => clearInterval(interval);
    }, [duelId, duel?.status]);

    useEffect(() => {
        if (!duel || duel.status !== "IN_PROGRESS") return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [duel?.currentRound, duel?.status]);

    useEffect(() => {
        if (duel?.status === "COMPLETED") {
            if (duel.winner?.id === currentUserId) {
                // Show reward animation
                showReward({
                    xpGained: 100,
                    totalXp: 0,
                    currentLevel: 0,
                    previousLevel: 1,
                    leveledUp: false,
                    nextLevelProgress: 0
                });
            } else {
                // Participou mas perdeu
                showReward({
                    xpGained: 25,
                    totalXp: 0,
                    currentLevel: 0,
                    previousLevel: 1,
                    leveledUp: false,
                    nextLevelProgress: 0
                });
            }
        }
    }, [duel?.status]);

    const currentRoundQuestion = duel?.questions?.find(q => q.roundNumber === duel.currentRound);
    const isChallenger = duel?.challenger?.id === currentUserId;
    const myAnswer = isChallenger ? currentRoundQuestion?.challengerAnswerIndex : currentRoundQuestion?.opponentAnswerIndex;
    const opponentAnswer = isChallenger ? currentRoundQuestion?.opponentAnswerIndex : currentRoundQuestion?.challengerAnswerIndex;

    const handleAnswer = async (index: number) => {
        if (selectedAnswer !== null || (myAnswer !== undefined && myAnswer !== null)) return;

        // Optimistic update
        setSelectedAnswer(index);

        try {
            const updated = await DuelService.submitAnswer(duelId, index);
            setDuel(updated);
        } catch (err) {
            console.error("Failed to submit answer", err);
            setSelectedAnswer(null); // Rollback on error
        }
    };

    const handleCancel = async () => {
        if (confirm("Tem certeza que deseja abandonar e cancelar este duelo?")) {
            try {
                await DuelService.declineDuel(duelId);
                onClose();
            } catch (err) {
                console.error("Failed to cancel duel", err);
                onClose();
            }
        }
    };

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener("fullscreenchange", handleFullscreenChange);
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    };

    if (!duel) {
        return (
            <div className="fixed inset-0 z-[10000] bg-slate-900 flex items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-white">
                    <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                    <p className="font-bold text-lg text-slate-300">Carregando duelo...</p>
                    <button onClick={onClose} className="mt-4 text-sm text-slate-500 hover:text-white transition-colors">Cancelar</button>
                </div>
            </div>
        );
    }

    return (
        <div className={`fixed inset-0 z-[10000] bg-slate-900 flex items-center justify-center ${isMaximized ? "p-0" : "sm:p-4"}`}>
            <div className={`w-full bg-white overflow-hidden shadow-2xl relative flex flex-col h-full ${isMaximized ? "sm:h-screen sm:rounded-none" : "max-w-4xl sm:rounded-3xl sm:h-[90vh]"}`}>
                {/* Close Button */}
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4 z-[100]">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="bg-white/80 backdrop-blur-sm border border-white/40 shadow-sm text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all h-8 w-8 sm:h-10 sm:w-10"
                        title="Fechar e voltar"
                    >
                        <XCircle size={20} className="w-4 h-4 sm:w-5 sm:h-5" />
                    </Button>
                </div>

                {/* Header / Scoreboard */}
                {!isMaximized && (
                    <div className="bg-slate-50 p-4 md:p-6 border-b border-slate-100 relative">
                        <div className="flex items-center justify-between gap-8 md:px-6">
                            {/* Challenger */}
                            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center overflow-hidden shadow-lg ${isChallenger ? "ring-4 ring-indigo-200" : ""}`}>
                                    {duel.challenger?.avatarUrl ? (
                                        <img
                                            src={getAvatarUrl(duel.challenger.avatarUrl)}
                                            className="w-full h-full object-cover"
                                            alt={duel.challenger.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-white text-lg md:text-xl font-bold">${(duel.challenger?.name || "U").slice(0, 2).toUpperCase()}</span>`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-white text-lg md:text-xl font-bold">
                                            {(duel.challenger?.name || "U").slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] md:text-sm font-bold text-slate-800 truncate w-full text-center">{duel.challenger?.name}</span>
                                <div className="flex gap-0.5 md:gap-1 mt-0.5">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${duel.questions[i]?.challengerCorrect === true ? "bg-emerald-500" :
                                            duel.questions[i]?.challengerCorrect === false ? "bg-red-500" :
                                                "bg-slate-200"
                                            }`} />
                                    ))}
                                </div>
                            </div>

                            {/* VS / Round Info */}
                            <div className="flex flex-col items-center gap-1 relative">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Rodada {duel.currentRound}</div>
                                <div className="flex items-center gap-2 md:gap-4">
                                    <span className="text-2xl md:text-4xl font-black text-slate-900">{duel.challengerScore}</span>
                                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-slate-900 flex items-center justify-center text-white shadow-lg shrink-0">
                                        <span className="text-[10px] md:text-xs font-bold leading-none">VS</span>
                                    </div>
                                    <span className="text-2xl md:text-4xl font-black text-slate-900">{duel.opponentScore}</span>
                                </div>
                                {duel.suddenDeath && (
                                    <motion.div
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        className="bg-red-500 text-white text-[9px] md:text-[10px] font-bold px-1.5 md:py-0.5 rounded-full mt-1 flex items-center gap-0.5 md:gap-1"
                                    >
                                        <Zap size={8} /> MORTE SÚBITA
                                    </motion.div>
                                )}
                            </div>

                            {/* Opponent */}
                            <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
                                <div className={`w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center overflow-hidden shadow-lg ${!isChallenger ? "ring-4 ring-indigo-200" : ""}`}>
                                    {duel.opponent?.avatarUrl ? (
                                        <img
                                            src={getAvatarUrl(duel.opponent.avatarUrl)}
                                            className="w-full h-full object-cover"
                                            alt={duel.opponent.name}
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).style.display = 'none';
                                                (e.target as HTMLImageElement).parentElement!.innerHTML = `<span class="text-slate-600 text-lg md:text-xl font-bold">${(duel.opponent?.name || "U").slice(0, 2).toUpperCase()}</span>`;
                                            }}
                                        />
                                    ) : (
                                        <span className="text-slate-600 text-lg md:text-xl font-bold">
                                            {(duel.opponent?.name || "U").slice(0, 2).toUpperCase()}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] md:text-sm font-bold text-slate-800 truncate w-full text-center">{duel.opponent?.name}</span>
                                <div className="flex gap-0.5 md:gap-1 mt-0.5">
                                    {Array.from({ length: 10 }).map((_, i) => (
                                        <div key={i} className={`w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full ${duel.questions[i]?.opponentCorrect === true ? "bg-emerald-500" :
                                            duel.questions[i]?.opponentCorrect === false ? "bg-red-500" :
                                                "bg-slate-200"
                                            }`} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Question Area */}
                <div className="flex-1 overflow-y-auto px-4 py-6 md:p-8 flex flex-col items-center justify-center min-h-0">
                    <AnimatePresence mode="wait">
                        {duel.status === "IN_PROGRESS" && currentRoundQuestion ? (
                            <motion.div
                                key={currentRoundQuestion.id}
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: -20, opacity: 0 }}
                                className="w-full max-w-2xl"
                            >
                                <div className="mb-6 flex items-center justify-center gap-4">
                                    <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                                        <Timer size={18} /> {timeLeft}s
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${currentRoundQuestion.difficulty === 'EASY' ? 'bg-emerald-50 text-emerald-600' :
                                        currentRoundQuestion.difficulty === 'MEDIUM' ? 'bg-amber-50 text-amber-600' :
                                            'bg-red-50 text-red-600'
                                        }`}>
                                        Nível {currentRoundQuestion.difficulty}
                                    </div>
                                </div>

                                <h2
                                    className="text-lg md:text-xl font-bold text-slate-900 mb-6 md:mb-8 leading-relaxed px-2"
                                    dangerouslySetInnerHTML={{ __html: currentRoundQuestion.question.statement }}
                                />

                                <div className="grid grid-cols-1 gap-3">
                                    {Object.entries(currentRoundQuestion.question.options).map(([key, option], idx) => {
                                        const isSelected = selectedAnswer === idx || (myAnswer !== undefined && myAnswer !== null && myAnswer === idx);
                                        const isWaitingOpponent = (myAnswer !== undefined && myAnswer !== null) && (opponentAnswer === undefined || opponentAnswer === null);

                                        return (
                                            <motion.button
                                                key={key}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.99 }}
                                                onClick={() => handleAnswer(idx)}
                                                disabled={myAnswer !== undefined && myAnswer !== null}
                                                className={`p-4 rounded-2xl border-2 text-left transition-all relative ${isSelected ? "border-indigo-500 bg-indigo-50 shadow-md" :
                                                    "border-slate-100 hover:border-indigo-200 hover:bg-slate-50"
                                                    }`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center font-bold border shrink-0 ${isSelected ? "bg-indigo-500 text-white border-indigo-500" : "bg-white text-slate-400 border-slate-200"
                                                        }`}>
                                                        {String.fromCharCode(65 + idx)}
                                                    </div>
                                                    <div
                                                        className={`text-[13px] md:text-[15px] font-medium leading-relaxed ${isSelected ? "text-indigo-900" : "text-slate-700"}`}
                                                        dangerouslySetInnerHTML={{ __html: option }}
                                                    />
                                                </div>
                                                {isWaitingOpponent && isSelected && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2 text-[10px] font-bold text-indigo-500 italic">
                                                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" /> Aguardando oponente...
                                                    </div>
                                                )}
                                            </motion.button>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        ) : duel.status === "COMPLETED" ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-6"
                            >
                                <div className={`w-24 h-24 rounded-full flex items-center justify-center shadow-xl ${duel.winner?.id === currentUserId ? "bg-amber-100 text-amber-500" : "bg-slate-100 text-slate-400"
                                    }`}>
                                    <Trophy size={48} />
                                </div>
                                <div className="text-center">
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                                        {duel.winner?.id === currentUserId ? "VOCÊ VENCEU!" : "DERROTA"}
                                    </h2>
                                    <p className="text-slate-500">{duel.winner?.name || "O adversário"} é o campeão da Arena.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95" onClick={onClose}>
                                        Voltar para Arena
                                    </button>
                                </div>
                            </motion.div>
                        ) : duel.status === "CANCELLED" ? (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="flex flex-col items-center gap-6 text-center"
                            >
                                <div className="w-24 h-24 rounded-full flex items-center justify-center shadow-xl bg-red-100 text-red-500">
                                    <XCircle size={48} />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-slate-900 mb-2">
                                        DUELO CANCELADO
                                    </h2>
                                    <p className="text-slate-500">O duelo foi abandonado por um dos jogadores.</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <button className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-95" onClick={onClose}>
                                        Voltar para Arena
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <div className="flex flex-col items-center gap-4 text-slate-400">
                                <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                                <p className="font-bold">
                                    {duel.status === "PENDING" ? "Aguardando oponente aceitar..." : "Sincronizando duelo..."}
                                </p>
                            </div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Status Bar */}
                <div className="px-4 py-3 md:px-8 md:py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-3 md:gap-6 flex-wrap">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                            <Shield size={14} className="text-slate-400" /> Matéria: {duel.subject}
                        </div>

                        <div className="w-px h-6 bg-slate-200 hidden md:block" />

                        {/* Controls move to footer */}
                        <div className="flex items-center gap-2">
                            <Button
                                variant={isMaximized ? "default" : "outline"}
                                size="sm"
                                className={`h-8 rounded-lg px-3 flex items-center gap-1.5 text-xs font-bold transition-all ${isMaximized ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm border-transparent" : "text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                                onClick={() => setIsMaximized(!isMaximized)}
                                title={isMaximized ? "Sair do modo foco" : "Modo foco (mais espaço)"}
                            >
                                {isMaximized ? <Shield size={14} /> : <Zap size={14} />}
                                <span>{isMaximized ? "Foco Ativo" : "Modo Foco"}</span>
                            </Button>

                            <Button
                                variant={isFullscreen ? "default" : "outline"}
                                size="sm"
                                className={`h-8 rounded-lg px-3 flex items-center gap-1.5 text-xs font-bold transition-all ${isFullscreen ? "bg-slate-900 hover:bg-slate-800 text-white shadow-sm border-transparent" : "text-slate-600 border-slate-200 hover:bg-slate-100"}`}
                                onClick={toggleFullscreen}
                                title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                            >
                                {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                                <span className="hidden sm:inline">{isFullscreen ? "Sair" : "Tela Cheia"}</span>
                            </Button>
                        </div>
                    </div>
                    {duel.status === "IN_PROGRESS" && (
                        <button
                            onClick={handleCancel}
                            className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors ml-auto md:ml-0"
                        >
                            <XCircle size={14} /> <span className="hidden sm:inline">Abandonar Duelo</span>
                            <span className="sm:hidden">Sair</span>
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
