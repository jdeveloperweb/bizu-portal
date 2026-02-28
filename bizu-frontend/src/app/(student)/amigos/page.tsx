"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, ShieldAlert, Loader2, Check, X, ArrowRight, Sparkles, UserCircle2 } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { UserProfileModal } from "@/components/UserProfileModal";

type Tab = "amigos" | "pedidos" | "buscar";

export default function AmigosPage() {
    const { isFree } = useAuth();
    const [activeTab, setActiveTab] = useState<Tab>("amigos");
    const [friends, setFriends] = useState<any[]>([]);
    const [pending, setPending] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [selectedNickname, setSelectedNickname] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openProfile = (nickname: string) => {
        setSelectedNickname(nickname);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (activeTab === "amigos") fetchFriends();
        if (activeTab === "pedidos") fetchPending();
        if (activeTab === "buscar") fetchSuggestions();
    }, [activeTab]);

    const fetchFriends = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/friends");
            if (res.ok) setFriends(await res.json());
            else setFriends([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/friends/pending");
            if (res.ok) setPending(await res.json());
            else setPending([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchSuggestions = async () => {
        const courseId = getStoredSelectedCourseId();
        if (!courseId) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/friends/suggestions?courseId=${courseId}`);
            if (res.ok) setSuggestions(await res.json());
            else setSuggestions([]);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/friends/search?nickname=${encodeURIComponent(searchQuery)}`);
            if (res.ok) setSearchResults(await res.json());
        } finally {
            setLoading(false);
        }
    };

    const handleAcceptRequest = async (id: string) => {
        const res = await apiFetch(`/friends/accept/${id}`, { method: 'POST' });
        if (res.ok) {
            fetchPending();
            window.dispatchEvent(new CustomEvent("friends:updated"));
        }
    };

    const handleRejectRequest = async (id: string) => {
        const res = await apiFetch(`/friends/reject/${id}`, { method: 'DELETE' });
        if (res.ok) {
            fetchPending();
            window.dispatchEvent(new CustomEvent("friends:updated"));
        }
    };

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Rede de Amigos Premium"
                    description="A rede social de amigos é exclusiva para assinantes. Conecte-se com outros concurseiros e estudem juntos!"
                />
            </div>
        );
    }

    return (
        <div className="p-6 lg:p-8 w-full max-w-[900px] mx-auto animate-in fade-in duration-500">
            <UserProfileModal
                nickname={selectedNickname}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <div className="mb-8">
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Rede de Amigos</h1>
                <p className="text-slate-500">Conecte-se com outros concurseiros e acompanhem seus progressos.</p>
            </div>

            <div className="card-elevated !rounded-2xl p-1.5 flex gap-1 mb-6 glass-card">
                {[
                    { key: "amigos", label: "Meus Amigos", icon: Users },
                    { key: "pedidos", label: "Pedidos Pendentes", icon: ShieldAlert },
                    { key: "buscar", label: "Adicionar Amigos", icon: Search },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
                        className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"
                            }`}>
                        <tab.icon size={14} /> {tab.label} {tab.key === "pedidos" && pending.length > 0 && (
                            <span className="bg-rose-500 text-white px-1.5 rounded-full text-[10px]">{pending.length}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="mb-20">
                {loading && (
                    <div className="flex justify-center p-20">
                        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
                    </div>
                )}

                {!loading && activeTab === "amigos" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {friends.length === 0 ? (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                    <Users size={32} />
                                </div>
                                <p className="text-slate-400 font-medium">Você ainda não adicionou nenhum amigo.</p>
                            </div>
                        ) : (
                            friends.map(f => {
                                const user = f.requester;
                                return (
                                    <div key={f.id} className="group relative bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center font-black text-indigo-600 text-lg border border-indigo-50 group-hover:scale-105 transition-transform">
                                                {user.avatar || user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-extrabold text-slate-800 truncate">{user.name}</div>
                                                <div className="text-xs font-bold text-indigo-500">@{user.nickname}</div>
                                            </div>
                                            <button
                                                onClick={() => openProfile(user.nickname)}
                                                className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                                            >
                                                <UserCircle2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {!loading && activeTab === "pedidos" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pending.length === 0 ? (
                            <div className="col-span-full py-20 text-center space-y-4">
                                <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-300">
                                    <ShieldAlert size={32} />
                                </div>
                                <p className="text-slate-400 font-medium">Nenhum pedido de amizade pendente.</p>
                            </div>
                        ) : (
                            pending.map(f => (
                                <div key={f.id} className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-lg">
                                            {f.requester.avatar || f.requester.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-extrabold text-slate-800 truncate">{f.requester.name}</div>
                                            <div className="text-xs font-bold text-slate-400">@{f.requester.nickname}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => handleAcceptRequest(f.id)} className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                                            <Check size={14} /> Aceitar
                                        </button>
                                        <button onClick={() => handleRejectRequest(f.id)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs hover:bg-rose-50 hover:text-rose-600 transition-all flex items-center justify-center gap-2">
                                            <X size={14} /> Recusar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "buscar" && (
                    <div className="space-y-8">
                        <form onSubmit={handleSearch} className="relative group">
                            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
                                <Search size={20} />
                            </div>
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar por @nickname..."
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-4 pl-12 pr-32 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all font-bold text-slate-700"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 px-6 rounded-xl bg-indigo-600 text-white font-black text-xs hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100 disabled:opacity-50"
                                disabled={loading || !searchQuery.trim()}
                            >
                                BUSCAR
                            </button>
                        </form>

                        {!loading && searchResults.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {searchResults.map(u => (
                                    <div key={u.id} className="group relative bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-slate-400 text-lg group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-all">
                                                {u.avatar || u.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-extrabold text-slate-800 truncate">{u.name}</div>
                                                <div className="text-xs font-bold text-slate-400 group-hover:text-indigo-500 transition-colors">@{u.nickname}</div>
                                            </div>
                                            <button
                                                onClick={() => openProfile(u.nickname)}
                                                className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 font-bold text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                            >
                                                VER PERFIL <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && searchResults.length === 0 && searchQuery && (
                            <div className="py-20 text-center">
                                <p className="text-slate-400 font-medium">Nenhum usuário encontrado com esse nickname.</p>
                            </div>
                        )}

                        {!loading && searchResults.length === 0 && !searchQuery && suggestions.length > 0 && (
                            <div>
                                <h3 className="text-sm font-black text-slate-800 mb-6 flex items-center gap-2">
                                    <Sparkles size={18} className="text-indigo-500 animate-pulse" />
                                    SUGESTÕES DO SEU CURSO
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {suggestions.map(u => (
                                        <div key={u.id} className="group relative bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
                                            <div className="flex items-center gap-4">
                                                <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-lg group-hover:scale-105 transition-transform">
                                                    {u.avatar || u.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-extrabold text-slate-800 truncate">{u.name}</div>
                                                    <div className="text-xs font-bold text-indigo-500">@{u.nickname}</div>
                                                </div>
                                                <button
                                                    onClick={() => openProfile(u.nickname)}
                                                    className="px-4 py-2 rounded-xl bg-slate-50 text-slate-500 font-bold text-[10px] hover:bg-indigo-600 hover:text-white transition-all shadow-sm flex items-center gap-1.5"
                                                >
                                                    VER PERFIL <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
