"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    Swords, Trophy, Zap, Users,
    Target, Crown, Flame,
    Shield, CheckCircle2, XCircle,
    BarChart3, Clock,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";
import { DuelService, Duel } from "@/lib/duelService";
import ArenaDuelScreen from "@/components/arena/ArenaDuelScreen";
import { getAvatarUrl } from "@/lib/imageUtils";
import ActiveDuelBanner from "@/components/arena/ActiveDuelBanner";
import { UserProfileModal } from "@/components/UserProfileModal";
import Cookies from "js-cookie";
import { useChallengeNotifications } from "@/hooks/useChallengeNotifications";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar } from "@/components/ui/Avatar";

type ArenaTab = "online" | "ranking" | "historico";

interface OnlineUser {
    id: string;
    name: string;
    avatar: string;
    nickname: string;
    level: number;
    xp: number;
    winRate: number;
    status: "online" | "em_duelo";
}

interface RankingUser {
    id: string;
    name: string;
    nickname: string;
    avatar: string;
    wins: number;
}


export default function ArenaPage() {
    return (
        <Suspense fallback={<div>Carregando Arena...</div>}>
            <ArenaPageContent />
        </Suspense>
    );
}

function ArenaPageContent() {
    const { user, isFree } = useAuth();
    const [activeTab, setActiveTab] = useState<ArenaTab>("online");
    const [selectedSubject, setSelectedSubject] = useState("Aleatorio");
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
    const [pendingDuels, setPendingDuels] = useState<Duel[]>([]);
    const [activeDuelId, setActiveDuelId] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string>("");
    const [myStats, setMyStats] = useState({ wins: 0, losses: 0, winRate: 0, streak: 0 });
    const [availableModules, setAvailableModules] = useState<string[]>([]);
    const [ranking, setRanking] = useState<RankingUser[]>([]);
    const [history, setHistory] = useState<Duel[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingRanking, setIsLoadingRanking] = useState(false);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isInQueue, setIsInQueue] = useState(false);
    const [queueTime, setQueueTime] = useState(0);

    const [selectedProfileNickname, setSelectedProfileNickname] = useState<string | null>(null);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const searchParams = useSearchParams();

    useEffect(() => {
        const urlDuelId = searchParams.get("duelId");
        if (urlDuelId) {
            setActiveDuelId(urlDuelId);
        }
    }, [searchParams]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isInQueue) {
            interval = setInterval(() => setQueueTime(t => t + 1), 1000);
        } else {
            setQueueTime(0);
        }
        return () => clearInterval(interval);
    }, [isInQueue]);

    useEffect(() => {
        if (user) {
            const userId = (user.id || user.sub) as string;
            setCurrentUserId(userId);
        }
    }, [user]);

    useEffect(() => {

        const loadData = async (showLoading = true) => {
            if (showLoading) setIsLoading(true);
            try {
                const currentCourseId = getStoredSelectedCourseId();
                const courseQuery = currentCourseId ? `?courseId=${currentCourseId}` : "";

                const res = await apiFetch(`/duelos/online${courseQuery}`);
                if (res.ok) {
                    const users = await res.json();
                    setOnlineUsers(users.map((u: any) => ({
                        id: u.id,
                        name: u.name || "Usuário",
                        nickname: u.nickname || "",
                        avatar: u.avatar || "", // Keep empty if no URL
                        level: parseInt(Math.floor(Number(u.level) || 1).toString()),
                        xp: Number(u.xp) || 0,
                        winRate: Number(u.winRate) || 0,
                        status: u.status || "online"
                    })));
                }

                const pending = await DuelService.getPendingDuels();
                setPendingDuels(pending);

                const statsRes = await apiFetch("/duelos/me/stats");
                if (statsRes.ok) {
                    const data = await statsRes.json();
                    setMyStats({
                        wins: data.wins || 0,
                        losses: data.losses || 0,
                        winRate: data.wins + data.losses > 0 ? Math.round((data.wins / (data.wins + data.losses)) * 100) : 0,
                        streak: data.streak || 0
                    });
                }

                // Fetch modules for the selected course
                if (currentCourseId) {
                    const courseRes = await apiFetch(`/public/courses/${currentCourseId}`);
                    if (courseRes.ok) {
                        const courseData = await courseRes.json();
                        if (courseData.modules) {
                            setAvailableModules(courseData.modules.map((m: any) => m.title));
                        }
                    }
                }

                // Initial fetch for ranking and history if needed
                fetchRanking(currentCourseId || undefined);
                fetchHistory();

            } catch (error) {
                console.error("Failed to load arena data", error);
            } finally {
                if (showLoading) setIsLoading(false);
            }
        };

        const fetchRanking = async (courseId?: string) => {
            setIsLoadingRanking(true);
            try {
                const data = await DuelService.getRanking(courseId);
                setRanking(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingRanking(false);
            }
        };

        const fetchHistory = async () => {
            setIsLoadingHistory(true);
            try {
                const data = await DuelService.getHistory();
                setHistory(data);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoadingHistory(false);
            }
        };


        loadData(true);
        const interval = setInterval(() => loadData(false), 10000);
        return () => clearInterval(interval);
    }, []);



    useChallengeNotifications(currentUserId, (newDuel: Duel) => {
        setPendingDuels(prev => {
            if (prev.find(d => d.id === newDuel.id)) return prev;
            return [newDuel, ...prev];
        });
        setIsInQueue(false);
    });

    const handleJoinQueue = async () => {
        const courseId = getStoredSelectedCourseId();
        if (!courseId) {
            alert("Selecione um curso primeiro.");
            return;
        }
        try {
            await DuelService.joinQueue(courseId);
            setIsInQueue(true);
        } catch (err) {
            alert("Erro ao entrar na fila.");
        }
    };

    const handleLeaveQueue = async () => {
        const courseId = getStoredSelectedCourseId();
        if (!courseId) return;
        try {
            await DuelService.leaveQueue(courseId);
            setIsInQueue(false);
        } catch (err) {
            alert("Erro ao sair da fila.");
        }
    };

    const handleChallenge = async (opponentId: string) => {
        try {
            console.log("Creating duel with:", opponentId);
            const duel = await DuelService.createDuel(opponentId, selectedSubject);
            if (duel && duel.id) {
                console.log("Duel created, entering screen:", duel.id);
                setActiveDuelId(duel.id);
            } else {
                throw new Error("Invalid duel object received");
            }
        } catch (error) {
            console.error("Failed to challenge:", error);
            alert("Erro ao enviar desafio. Tente novamente.");
        }
    };

    const handleAccept = async (duelId: string) => {
        try {
            await DuelService.acceptDuel(duelId);
            setPendingDuels(prev => prev.filter(d => d.id !== duelId));
            setActiveDuelId(duelId);
        } catch (error) {
            console.error(error);
            alert("Erro ao aceitar o duelo.");
        }
    };

    const handleDecline = async (duelId: string) => {
        try {
            await DuelService.declineDuel(duelId);
            setPendingDuels(prev => prev.filter(d => d.id !== duelId));
        } catch (error) {
            console.error(error);
        }
    };

    const handleSeed = async () => {
        const currentCourseId = getStoredSelectedCourseId();
        if (!currentCourseId) {
            alert("Selecione um curso primeiro.");
            return;
        }

        if (!confirm("Isso vai cadastrar 50 questões de teste para este curso. Continuar?")) return;

        try {
            const res = await apiFetch(`/public/dev/seed-questions?courseId=${currentCourseId}&count=50`, {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                alert(`Sucesso! ${data.created} questões criadas.`);
                window.location.reload();
            }
        } catch (err) {
            console.error(err);
            alert("Erro ao semear questões.");
        }
    };

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Arena PVP Premium"
                    description="As batalhas na Arena são exclusivas para assinantes. Desbloqueie o modo competitivo e mostre seu conhecimento!"
                />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {selectedProfileNickname && (
                <UserProfileModal
                    nickname={selectedProfileNickname}
                    isOpen={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                />
            )}
            {!activeDuelId && <ActiveDuelBanner onReturn={(id) => setActiveDuelId(id)} />}

            {activeDuelId && (
                <ArenaDuelScreen
                    duelId={activeDuelId}
                    onClose={() => setActiveDuelId(null)}
                    currentUserId={currentUserId}
                />
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 md:mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[9px] md:text-[10px] font-bold uppercase tracking-[0.15em]">Competitivo</span>
                    </div>
                    <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Arena PVP
                    </h1>
                    <p className="text-[12px] md:text-sm text-slate-500">Duelos de conhecimento em tempo real.</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                        <Trophy size={13} /> {myStats.wins}V / {myStats.losses}D
                    </div>
                    <div className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 text-[10px] md:text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-full">
                        <Flame size={13} /> {myStats.streak} seguidas
                    </div>
                </div>
            </div>

            {/* Queue Button */}
            <div className="mb-6 flex justify-center">
                {isInQueue ? (
                    <button onClick={handleLeaveQueue} className="flex items-center gap-2 px-6 py-3 bg-red-100/80 text-red-600 rounded-full font-bold shadow-sm hover:bg-red-200 transition-all border border-red-200">
                        <Clock size={18} className="animate-spin" /> Procurando Oponente ({Math.floor(queueTime / 60)}:{String(queueTime % 60).padStart(2, '0')})...
                        <span className="text-[10px] ml-2 text-red-500 font-extrabold uppercase tracking-widest bg-white px-2 py-0.5 rounded-full">Cancelar</span>
                    </button>
                ) : (
                    <button onClick={handleJoinQueue} className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-600 text-white rounded-full font-bold shadow-md hover:shadow-lg transition-all active:scale-95">
                        <Swords size={18} /> Procurar Duelo Aleatório
                    </button>
                )}
            </div>

            {/* Pending Challenges List */}
            {pendingDuels.length > 0 && (
                <div className="mb-6 md:mb-8 space-y-3">
                    <h3 className="text-[11px] md:text-sm font-black text-slate-900 flex items-center gap-2 uppercase tracking-wider">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" /> Desafios Pendentes ({pendingDuels.length})
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingDuels.map(duel => (
                            <div key={duel.id} className="card-elevated !rounded-2xl p-4 bg-white border-2 border-indigo-100 flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <Avatar
                                        src={duel.challenger.avatarUrl}
                                        name={duel.challenger.name}
                                        size="md"
                                        className="ring-2 ring-white"
                                    />
                                    <div>
                                        <div className="text-sm font-bold text-slate-800">{duel.challenger.name}</div>
                                        <div className="text-[10px] text-slate-500">Matéria: {duel.subject}</div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAccept(duel.id)}
                                        className="px-3 md:px-4 py-2 rounded-xl bg-indigo-600 text-white text-[10px] md:text-[11px] font-bold hover:bg-indigo-700 transition-all shadow-sm"
                                    >
                                        Aceitar
                                    </button>
                                    <button
                                        onClick={() => handleDecline(duel.id)}
                                        className="px-3 md:px-4 py-2 rounded-xl bg-slate-100 text-slate-600 text-[10px] md:text-[11px] font-bold hover:bg-slate-200 transition-all"
                                    >
                                        Recusar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}



            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
                {[
                    { label: "Vitorias", val: String(myStats.wins), icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
                    { label: "Derrotas", val: String(myStats.losses), icon: XCircle, bg: "bg-red-50", text: "text-red-500" },
                    { label: "Aproveitamento", val: `${myStats.winRate}%`, icon: Target, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Sequencia", val: `${myStats.streak}W`, icon: Flame, bg: "bg-amber-50", text: "text-amber-600" },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-3 md:p-4 hover:!transform-none">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                                    <Icon size={13} className={s.text} />
                                </div>
                                <div className="text-[10px] md:text-[11px] text-slate-400 font-medium uppercase tracking-tight">{s.label}</div>
                            </div>
                            {isLoading ? (
                                <Skeleton className="h-7 w-12 mb-1" />
                            ) : (
                                <div className="text-lg md:text-xl font-extrabold text-slate-900">{s.val}</div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Tabs */}
            <div className="card-elevated !rounded-2xl p-1 flex gap-1 mb-6 overflow-x-auto no-scrollbar">
                {([
                    { key: "online" as ArenaTab, label: "Online", icon: Users },
                    { key: "ranking" as ArenaTab, label: "Ranking", icon: Trophy },
                    { key: "historico" as ArenaTab, label: "Histórico", icon: Clock },
                ]).map(tab => {
                    const Icon = tab.icon;
                    const active = activeTab === tab.key;
                    return (
                        <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                            className={`flex-1 min-w-fit flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-[11px] md:text-[12px] font-bold transition-all whitespace-nowrap ${active ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                                }`}>
                            <Icon size={14} /> {tab.label}
                        </button>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-3">
                    {/* Online Players */}
                    {activeTab === "online" && (
                        isLoading ? (
                            <div className="space-y-3">
                                {[1, 2, 3].map(i => (
                                    <Skeleton key={i} className="h-20 w-full rounded-2xl" />
                                ))}
                            </div>
                        ) : onlineUsers.length === 0 ? (
                            <div className="p-12 text-center card-elevated !rounded-2xl border-dashed border-2 border-slate-100 bg-slate-50/50">
                                <Users size={32} className="mx-auto text-slate-300 mb-3" />
                                <p className="text-slate-500 text-sm font-medium">Nenhum jogador online no momento.</p>
                                <p className="text-slate-400 text-[11px]">Tente novamente em alguns minutos.</p>
                            </div>
                        ) : onlineUsers.map(user => (
                            <div key={user.id} className="card-elevated !rounded-2xl p-3 md:p-4 hover:!transform-none">
                                <div className="flex items-center gap-2.5 md:gap-3">
                                    <div
                                        className="relative flex-shrink-0 cursor-pointer"
                                        onClick={() => {
                                            setSelectedProfileNickname(user.nickname);
                                            setIsProfileModalOpen(true);
                                        }}
                                    >
                                        <Avatar
                                            src={user.avatar}
                                            name={user.name}
                                            size="md"
                                            className="md:w-11 md:h-11 border border-indigo-200/50"
                                        />
                                        <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${user.status === "online" ? "bg-emerald-400" : "bg-amber-400"
                                            }`} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="flex items-center gap-0.5 whitespace-nowrap cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => {
                                            setSelectedProfileNickname(user.nickname);
                                            setIsProfileModalOpen(true);
                                        }}>
                                            <span className="text-[13px] font-bold text-slate-800 truncate">{user.name}</span>
                                        </span>
                                        {user.status === "em_duelo" && (
                                            <span className="text-[8px] md:text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">Em duelo</span>
                                        )}
                                    </div>
                                    <div className="text-[9px] md:text-[10px] text-slate-400 flex items-center gap-1.5 md:gap-2">
                                        <span className="flex items-center gap-0.5 whitespace-nowrap"><Zap size={9} className="text-amber-500" /> Lv.{user.level}</span>
                                        <span className="hidden xs:inline-block">•</span>
                                        <span className="hidden xs:inline-block">{user.xp.toLocaleString()} XP</span>
                                        <span className="flex items-center gap-0.5 whitespace-nowrap"><Target size={9} /> {user.winRate}%</span>
                                    </div>
                                    <button
                                        disabled={user.status === "em_duelo" || user.id === currentUserId}
                                        onClick={() => handleChallenge(user.id)}
                                        className={`px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-[10px] md:text-[11px] font-bold flex items-center justify-center gap-1 transition-all flex-shrink-0 ${user.status === "em_duelo" || user.id === currentUserId
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm hover:shadow-md active:scale-95"
                                            }`}>
                                        <Swords size={12} /> <span className="hidden sm:inline">Desafiar</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}


                    {/* Ranking & History placeholders simplified for real data soon */}
                    {activeTab === "ranking" && (
                        <div className="space-y-3">
                            {isLoadingRanking ? (
                                <div className="p-8 text-center text-slate-400 italic">Carregando ranking global...</div>
                            ) : ranking.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic">Nenhum dado de ranking disponível.</div>
                            ) : (
                                ranking.map((r, i) => (
                                    <div key={r.id} className="card-elevated !rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4">
                                        <div className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? "bg-amber-100 text-amber-600" :
                                            i === 1 ? "bg-slate-100 text-slate-500" :
                                                i === 2 ? "bg-orange-100 text-orange-600" : "bg-slate-50 text-slate-400"
                                            }`}>
                                            {i + 1}º
                                        </div>
                                        <Avatar
                                            src={r.avatar}
                                            name={r.name}
                                            size="md"
                                            className="bg-indigo-50"
                                            fallbackClassName="text-indigo-600"
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div
                                                className="text-sm font-bold text-slate-800 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                                                onClick={() => {
                                                    setSelectedProfileNickname(r.nickname);
                                                    setIsProfileModalOpen(true);
                                                }}
                                            >
                                                {r.name}
                                            </div>
                                            <div className="text-[10px] text-slate-500">Ganhador de {r.wins} duelos na semana</div>
                                        </div>
                                        {i < 3 && (
                                            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-bold">
                                                <Crown size={12} /> XP Bônus: {i === 0 ? "500" : i === 1 ? "300" : "200"}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                    {activeTab === "historico" && (
                        <div className="space-y-3">
                            {isLoadingHistory ? (
                                <div className="p-8 text-center text-slate-400 italic">Carregando histórico...</div>
                            ) : history.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 italic">Sem duelos recentes.</div>
                            ) : (
                                history.map(duel => {
                                    const isChallenger = duel.challenger.id === currentUserId;
                                    const opponent = isChallenger ? duel.opponent : duel.challenger;
                                    const myScore = isChallenger ? duel.challengerScore : duel.opponentScore;
                                    const opScore = isChallenger ? duel.opponentScore : duel.challengerScore;
                                    const result = duel.winner?.id === currentUserId ? "Vitoria" : duel.winner ? "Derrota" : "Empate";

                                    return (
                                        <div key={duel.id} className="card-elevated !rounded-2xl p-3 md:p-4 flex items-center gap-3 md:gap-4">
                                            <div className={`w-10 h-10 flex-shrink-0 rounded-xl flex items-center justify-center ${result === "Vitoria" ? "bg-emerald-50 text-emerald-600" :
                                                result === "Derrota" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
                                                }`}>
                                                {result === "Vitoria" ? <Trophy size={18} /> : <Swords size={18} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    <span
                                                        className="text-[13px] font-bold text-slate-800 truncate cursor-pointer hover:text-indigo-600 transition-colors"
                                                        onClick={() => {
                                                            setSelectedProfileNickname(opponent.nickname || null);
                                                            setIsProfileModalOpen(true);
                                                        }}
                                                    >
                                                        vs {opponent.name}
                                                    </span>
                                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${result === "Vitoria" ? "bg-emerald-50 text-emerald-600" :
                                                        result === "Derrota" ? "bg-red-50 text-red-600" : "bg-slate-50 text-slate-600"
                                                        }`}>{result}</span>
                                                </div>
                                                <div className="text-[10px] text-slate-500 truncate">
                                                    Placar: {myScore} - {opScore} • {duel.subject}
                                                </div>
                                                <div className="text-[9px] text-slate-400">
                                                    {new Date(duel.completedAt!).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-[11px] md:text-[12px] font-bold text-slate-800">+{result === "Vitoria" ? 100 : 25} XP</div>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4 md:space-y-5">
                    {/* Duel Config */}
                    <div className="card-elevated !rounded-2xl p-4 md:p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Shield size={14} className="text-indigo-500" /> Configurar Duelo
                        </h3>
                        <div className="space-y-4 md:space-y-5">
                            <div>
                                <label className="text-[10px] font-bold text-slate-500 mb-1.5 block uppercase tracking-wider">Escolha a Matéria</label>
                                <div className="flex flex-wrap gap-1.5">
                                    {["Aleatorio", ...availableModules].map(s => (
                                        <button key={s} onClick={() => setSelectedSubject(s)}
                                            className={`px-2.5 py-2 rounded-lg text-[10px] font-bold transition-all border ${selectedSubject === s
                                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm"
                                                : "text-slate-400 hover:text-slate-600 bg-slate-50 border-slate-100"
                                                }`}>
                                            {s === "Aleatorio" ? s : s
                                                .replace("Direito ", "D. ")
                                                .replace("Processo ", "P. ")
                                                .replace("Legislação ", "Leg. ")
                                                .substring(0, 20)}
                                        </button>
                                    ))}

                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div className="flex flex-col gap-0.5 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Rodadas</span>
                                    <span className="text-[11px] font-bold text-slate-800">10 Questões</span>
                                </div>
                                <div className="flex flex-col gap-0.5 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Sistema</span>
                                    <span className="text-[11px] font-bold text-slate-800">Morte Súbita</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Weekly Prize */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-4 md:p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Crown size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Prêmios da Semana</span>
                        </div>
                        <p className="text-[11px] text-indigo-500 mb-3">O topo do ranking da Arena ganha prêmios exclusivos!</p>
                        <div className="space-y-1.5">
                            {["1o: 500 XP + 50% Cupom", "2o: 300 XP + 30% Cupom", "3o: 200 XP + 20% Cupom"].map((p, i) => (
                                <div key={i} className="flex items-center gap-2 text-[11px]">
                                    <Trophy size={10} className={i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : "text-orange-400"} />
                                    <span className="text-indigo-700 font-semibold">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="card-elevated !rounded-2xl p-4 md:p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Ações Rápidas
                        </h3>
                        <div className="space-y-1.5">
                            <Link href="/questoes/treino" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Target size={14} className="text-slate-400" /> Treinar antes do duelo
                            </Link>
                            <Link href="/ranking" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[11px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <BarChart3 size={14} className="text-slate-400" /> Ver ranking geral
                            </Link>
                            <button
                                onClick={handleSeed}
                                className="w-full flex items-center gap-2.5 py-2 px-3 rounded-xl text-[11px] font-medium text-amber-600 hover:bg-amber-50 transition-all border border-dashed border-amber-200 mt-2"
                            >
                                <Zap size={14} /> [DEV] Gerar Questões
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}

