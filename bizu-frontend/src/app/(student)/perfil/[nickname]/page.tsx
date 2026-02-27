"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, ArrowLeft, Trophy, Flame, UserPlus, UserCheck, UserMinus, ShieldAlert } from "lucide-react";
import { apiFetch } from "@/lib/api";

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const nickname = params.nickname as string;

    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!nickname) return;
        async function fetchProfile() {
            setLoading(true);
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
        fetchProfile();
    }, [nickname]);

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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    if (error || !profile) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <ShieldAlert className="w-12 h-12 text-slate-300" />
                <p className="text-slate-500 font-medium">{error}</p>
                <button onClick={() => router.back()} className="btn btn-outline">Voltar</button>
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 w-full max-w-[800px] mx-auto">
            <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
                <ArrowLeft size={16} /> Voltar
            </button>

            <div className="card-elevated !rounded-2xl p-8 hover:!transform-none mb-6">
                <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-indigo-100 to-violet-100 flex items-center justify-center text-3xl font-extrabold text-indigo-700 shadow-inner">
                        {profile.avatar || profile.name.substring(0, 2).toUpperCase()}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                        <h1 className="text-2xl font-extrabold text-slate-900">{profile.name}</h1>
                        <p className="text-indigo-600 font-medium mb-4">@{profile.nickname}</p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                <Trophy size={16} className="text-amber-500" />
                                <span className="text-sm font-bold text-slate-700">Nível {profile.level}</span>
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-lg border border-slate-100">
                                <Flame size={16} className="text-orange-500" />
                                <span className="text-sm font-bold text-slate-700">{profile.streak} dias</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                        {profile.friendshipStatus === 'ACCEPTED' ? (
                            <button onClick={() => handleFriendAction('reject')} className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 gap-2">
                                <UserMinus size={16} /> Desfazer Amizade
                            </button>
                        ) : profile.friendshipStatus === 'PENDING' ? (
                            <button className="btn btn-secondary cursor-not-allowed gap-2" disabled>
                                <UserCheck size={16} /> Pendente
                            </button>
                        ) : (
                            <button onClick={() => handleFriendAction('request')} className="btn btn-primary gap-2">
                                <UserPlus size={16} /> Adicionar
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="card-elevated !rounded-2xl p-6 hover:!transform-none">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Estatísticas</h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-slate-500 text-sm">Ranking Global</span>
                            <span className="font-extrabold text-indigo-600">#{profile.rank}</span>
                        </div>
                        <div className="flex justify-between items-center py-2 border-b border-slate-50">
                            <span className="text-slate-500 text-sm">XP Total</span>
                            <span className="font-extrabold text-slate-800">{profile.xp.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
