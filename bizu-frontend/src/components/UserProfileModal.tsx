"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
    X, Trophy, Flame, UserPlus, UserCheck,
    UserMinus, Zap, Star, ShieldAlert, Loader2,
    Sunrise, Target, Play, Swords, Crown, Layers,
    Brain, CheckCircle2, Award, Clock, Sparkles,
    TrendingUp, BookOpen
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/components/AuthProvider";
import { BadgeInsignia } from "@/components/gamification/BadgeInsignia";
import { RankInsignia } from "@/components/gamification/RankInsignia";

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
    const { user } = useAuth();
    const isMe = profile?.id === user?.id || profile?.id === user?.sub;

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
                    <div className="absolute -bottom-10 left-8 p-1.5 bg-white shadow-xl rounded-[2rem]">
                        <Avatar
                            src={profile?.avatar}
                            name={profile?.name}
                            size="xl"
                            className="!w-24 !h-24 !rounded-[1.5rem]"
                            rankLevel={profile?.level}
                            activeAura={profile?.activeAura}
                            activeBorder={profile?.activeBorder}
                            auraMetadata={profile?.auraMetadata}
                            borderMetadata={profile?.borderMetadata}
                        />
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
                                {!isMe && (
                                    <div className="shrink-0 flex gap-2">
                                        {profile.friendshipStatus === 'ACCEPTED' ? (
                                            <div className="flex gap-2">
                                                <Link href="/arena" className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm" title="Desafiar na Arena">
                                                    <Swords size={20} />
                                                </Link>
                                                <button onClick={() => handleFriendAction('reject')} className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-600 hover:bg-rose-100 transition-colors shadow-sm" title="Desfazer Amizade">
                                                    <UserMinus size={20} />
                                                </button>
                                            </div>
                                        ) : profile.friendshipStatus === 'PENDING' ? (
                                            <button className="px-4 py-2 rounded-xl bg-slate-100 flex items-center gap-2 text-slate-500 font-bold text-sm cursor-not-allowed shadow-sm">
                                                <UserCheck size={16} /> Pendente
                                            </button>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Link href="/arena" className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 hover:bg-indigo-100 transition-colors shadow-sm" title="Ver na Arena">
                                                    <Swords size={20} />
                                                </Link>
                                                <button onClick={() => handleFriendAction('request')} className="px-4 py-2 rounded-xl bg-indigo-600 flex items-center gap-2 text-white font-bold text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
                                                    <UserPlus size={16} /> Adicionar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Level & Streak Pills */}
                            <div className="flex flex-wrap gap-2">
                                <RankInsignia
                                    level={profile.level}
                                    rank={profile.rank}
                                    showName={true}
                                    size="md"
                                    className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex-1 min-w-[200px]"
                                />
                                <div className="flex items-center gap-2 px-4 py-3 bg-orange-50 rounded-2xl border border-orange-100 flex-1 min-w-[150px]">
                                    <Flame size={18} className="text-orange-500" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-orange-400 uppercase tracking-widest leading-none mb-1">Ofensiva</span>
                                        <span className="text-sm font-black text-orange-700 leading-none">{profile.streak} dias</span>
                                    </div>
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
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        <Swords size={10} /> Duelos Arena
                                    </div>
                                    <div className="text-lg font-black text-emerald-600">
                                        {profile.pvpWins || 0}V <span className="text-slate-300 mx-1">/</span> <span className="text-rose-500">{profile.pvpLosses || 0}D</span>
                                    </div>
                                </div>
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                                        <Brain size={10} /> Especialidade
                                    </div>
                                    <div className="text-[13px] font-black text-slate-800 truncate" title={profile.strongestSubject || "Ainda impreciso"}>
                                        {profile.strongestSubject || "—"}
                                    </div>
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
                                        {profile.badges.slice(0, 12).map((badge: any, i: number) => (
                                            <BadgeInsignia
                                                key={i}
                                                name={badge.name}
                                                icon={iconMap[badge.icon] || Trophy}
                                                earned={true}
                                                color={badge.color}
                                                variant="compact"
                                            />
                                        ))}
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
