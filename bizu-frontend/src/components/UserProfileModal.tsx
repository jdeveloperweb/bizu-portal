"use client";

import { useState, useEffect } from "react";
import {
    X, Trophy, Flame, UserPlus, UserCheck,
    UserMinus, Zap, Star, ShieldAlert, Loader2,
    Sunrise, Target, Play, Swords, Crown, Layers,
    Brain, CheckCircle2, Award, Clock, Sparkles,
    TrendingUp, BookOpen
} from "lucide-react";
import { apiFetch } from "@/lib/api";

const iconMap: Record<string, any> = {
    sunrise: Sunrise,
    flame: Flame,
    clock: Clock,
    target: Target,
    play: Play,
    swords: Swords,
    crown: Crown,
    layers: Layers,
    brain: Brain,
    checkCircle2: CheckCircle2,
    award: Award,
    zap: Zap,
    shield: Shield,
    star: Star,
    bookOpen: BookOpen,
    sparkles: Sparkles,
};

// Fallback shield for missing icons
function Shield(props: any) {
    return <ShieldAlert {...props} />;
}

interface UserProfileModalProps {
    nickname: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export function UserProfileModal({ nickname, isOpen, onClose }: UserProfileModalProps) {
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen && nickname) {
            fetchProfile();
        }
    }, [isOpen, nickname]);

    async function fetchProfile() {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch(`/student/profile/${nickname}`);
            if (res.ok) {
                const data = await res.json();
                setProfile(data);
            } else {
                setError("Usuário não encontrado.");
            }
        } catch (err) {
            setError("Erro ao carregar perfil.");
        } finally {
            setLoading(false);
        }
    }

    const handleFriendAction = async (action: 'request' | 'accept' | 'reject') => {
        try {
            if (action === 'request') {
                const res = await apiFetch(`/friends/request/${profile.id}`, { method: 'POST' });
                if (res.ok) {
                    const data = await res.json();
                    setProfile({ ...profile, friendshipStatus: 'PENDING', friendshipId: data.id });
                }
            } else if (action === 'reject') {
                const res = await apiFetch(`/friends/reject/${profile.friendshipId}`, { method: 'DELETE' });
                if (res.ok) setProfile({ ...profile, friendshipStatus: null, friendshipId: null });
            } else if (action === 'accept') {
                const res = await apiFetch(`/friends/accept/${profile.friendshipId}`, { method: 'POST' });
                if (res.ok) setProfile({ ...profile, friendshipStatus: 'ACCEPTED' });
            }
        } catch (e) {
            console.error(e);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 sm:pb-20">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-[500px] bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
                {/* Header/Banner */}
                <div className="h-24 bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-600 relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-white transition-colors z-20"
                    >
                        <X size={18} />
                    </button>

                    {/* Floating Avatar */}
                    <div className="absolute -bottom-10 left-8">
                        <div className="w-24 h-24 rounded-3xl bg-white p-1.5 shadow-xl">
                            <div className="w-full h-full rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-3xl font-extrabold text-indigo-700">
                                {profile?.avatar || profile?.name?.substring(0, 2).toUpperCase() || "?"}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-14 px-8 pb-8">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-3">
                            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                            <p className="text-slate-500 font-medium italic">Buscando perfil...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center py-12 gap-4 text-center">
                            <ShieldAlert className="w-12 h-12 text-rose-500" />
                            <p className="text-slate-800 font-bold">{error}</p>
                            <button onClick={onClose} className="btn btn-primary btn-sm">Fechar</button>
                        </div>
                    ) : profile && (
                        <div className="space-y-6">
                            {/* User Info & Actions */}
                            <div className="flex justify-between items-start gap-4">
                                <div>
                                    <h2 className="text-2xl font-extrabold text-slate-900 leading-tight">
                                        {profile.name}
                                    </h2>
                                    <p className="text-indigo-600 font-bold">@{profile.nickname}</p>
                                </div>
                                <div className="shrink-0 flex gap-2">
                                    {profile.friendshipStatus === 'ACCEPTED' ? (
                                        <button onClick={() => handleFriendAction('reject')} className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors shadow-sm" title="Desfazer Amizade">
                                            <UserMinus size={20} />
                                        </button>
                                    ) : profile.friendshipStatus === 'PENDING' ? (
                                        <button className="px-4 py-2 rounded-xl bg-slate-100 flex items-center gap-2 text-slate-500 font-bold text-sm cursor-not-allowed shadow-sm">
                                            <UserCheck size={16} /> Pendente
                                        </button>
                                    ) : (
                                        <button onClick={() => handleFriendAction('request')} className="px-4 py-2 rounded-xl bg-indigo-600 flex items-center gap-2 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                                            <UserPlus size={16} /> Adicionar
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Level & Streak Pills */}
                            <div className="flex flex-wrap gap-2">
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 rounded-full border border-amber-100">
                                    <Trophy size={14} className="text-amber-500" />
                                    <span className="text-xs font-bold text-amber-700">Nível {profile.level}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full border border-orange-100">
                                    <Flame size={14} className="text-orange-500" />
                                    <span className="text-xs font-bold text-orange-700">{profile.streak} dias de ofensiva</span>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        <TrendingUp size={10} /> Ranking Global
                                    </div>
                                    <div className="text-lg font-black text-indigo-600">#{profile.rank}</div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        <Zap size={10} /> XP Total
                                    </div>
                                    <div className="text-lg font-black text-slate-800">{profile.xp?.toLocaleString()}</div>
                                </div>
                            </div>

                            {/* Achievements - Only earned ones */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                        <Award size={16} className="text-indigo-500" />
                                        Conquistas
                                    </h3>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                                        {profile.badges?.length || 0} conquistadas
                                    </span>
                                </div>

                                {profile.badges && profile.badges.length > 0 ? (
                                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-3">
                                        {profile.badges.slice(0, 12).map((badge: any, i: number) => {
                                            const Icon = iconMap[badge.icon] || Trophy;
                                            return (
                                                <div key={i} className="group relative">
                                                    <div className={`aspect-square rounded-2xl bg-gradient-to-br ${badge.color || 'from-indigo-500 to-violet-600'} flex items-center justify-center p-2.5 shadow-sm transition-transform hover:-translate-y-1 hover:rotate-3 cursor-default`}>
                                                        <Icon size={18} className="text-white drop-shadow" />

                                                        {/* Tooltip on hover */}
                                                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-slate-900 text-white text-[10px] rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-30 pointer-events-none shadow-xl">
                                                            <p className="font-bold">{badge.name}</p>
                                                            <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-slate-900" />
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="py-6 px-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center">
                                        <p className="text-xs text-slate-400 italic">Ainda não possui conquistas.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
