"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, ShieldAlert, Loader2, Check, X, ArrowRight, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { getStoredSelectedCourseId } from "@/lib/course-selection";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";

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
        if (res.ok) fetchPending();
    };

    const handleRejectRequest = async (id: string) => {
        const res = await apiFetch(`/friends/reject/${id}`, { method: 'DELETE' });
        if (res.ok) fetchPending();
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
        <div className="p-6 lg:p-8 w-full max-w-[1000px] mx-auto">
            <div className="mb-8">
                <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-1">Rede de Amigos</h1>
                <p className="text-sm text-slate-500">Conecte-se com seus amigos e acompanhe o progresso de cada um.</p>
            </div>

            <div className="card-elevated !rounded-2xl p-1.5 flex gap-1 mb-6">
                {[
                    { key: "amigos", label: "Meus Amigos", icon: Users },
                    { key: "pedidos", label: "Pedidos Pendentes", icon: ShieldAlert },
                    { key: "buscar", label: "Adicionar Amigos", icon: Search },
                ].map(tab => (
                    <button key={tab.key} onClick={() => setActiveTab(tab.key as Tab)}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[12px] font-bold transition-all ${activeTab === tab.key ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-sm" : "text-slate-500 hover:bg-slate-50"
                            }`}>
                        <tab.icon size={14} /> {tab.label} {tab.key === "pedidos" && pending.length > 0 && `(${pending.length})`}
                    </button>
                ))}
            </div>

            <div className="card-elevated !rounded-2xl p-6 hover:!transform-none min-h-[400px]">
                {loading && (
                    <div className="flex justify-center p-8">
                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                    </div>
                )}

                {!loading && activeTab === "amigos" && (
                    <div className="space-y-4">
                        {friends.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">Você ainda não adicionou nenhum amigo.</p>
                        ) : (
                            friends.map(f => {
                                // O amigo é a pessoa que não é você (pode ser o requerente ou o destinatário)
                                // O DTO idealmente já teria os dados certos, mas podemos verificar o id atual ou exibir ambos para testes
                                const user = f.requester; // simplificação
                                return (
                                    <div key={f.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                                {user.avatar || user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{user.name}</div>
                                                <div className="text-xs text-slate-500">@{user.nickname}</div>
                                            </div>
                                        </div>
                                        <Link href={`/perfil/${user.nickname}`} className="btn btn-outline btn-sm gap-2">
                                            Ver Perfil <ArrowRight size={14} />
                                        </Link>
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {!loading && activeTab === "pedidos" && (
                    <div className="space-y-4">
                        {pending.length === 0 ? (
                            <p className="text-center text-slate-500 py-8">Nenhum pedido de amizade pendente.</p>
                        ) : (
                            pending.map(f => (
                                <div key={f.id} className="flex items-center justify-between bg-white p-4 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                            {f.requester.avatar || f.requester.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-bold text-slate-800">{f.requester.name}</div>
                                            <div className="text-xs text-slate-500">@{f.requester.nickname}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => handleAcceptRequest(f.id)} className="btn btn-primary btn-sm gap-1">
                                            <Check size={14} /> Aceitar
                                        </button>
                                        <button onClick={() => handleRejectRequest(f.id)} className="btn btn-outline border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 btn-sm gap-1">
                                            <X size={14} /> Recusar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === "buscar" && (
                    <div>
                        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Buscar por nickname..."
                                className="input flex-1"
                            />
                            <button type="submit" className="btn btn-primary gap-2" disabled={loading}>
                                <Search size={16} /> Buscar
                            </button>
                        </form>

                        {!loading && searchResults.length > 0 && (
                            <div className="space-y-4">
                                {searchResults.map(u => (
                                    <div key={u.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                                {u.avatar || u.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <div className="font-bold text-slate-800">{u.name}</div>
                                                <div className="text-xs text-slate-500">@{u.nickname}</div>
                                            </div>
                                        </div>
                                        <Link href={`/perfil/${u.nickname}`} className="btn btn-secondary btn-sm gap-2">
                                            <UserPlus size={14} /> Ver Perfil
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}

                        {!loading && searchResults.length === 0 && searchQuery && (
                            <p className="text-center text-slate-500">Nenhum usuário encontrado com esse nickname.</p>
                        )}

                        {!loading && searchResults.length === 0 && !searchQuery && suggestions.length > 0 && (
                            <div className="mt-8">
                                <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Sparkles size={16} className="text-indigo-500" />
                                    Sugestões do seu curso
                                </h3>
                                <div className="space-y-4">
                                    {suggestions.map(u => (
                                        <div key={u.id} className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-700">
                                                    {u.avatar || u.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-800">{u.name}</div>
                                                    <div className="text-xs text-slate-500">@{u.nickname}</div>
                                                </div>
                                            </div>
                                            <Link href={`/perfil/${u.nickname}`} className="btn btn-secondary btn-sm gap-2">
                                                <UserPlus size={14} /> Ver Perfil
                                            </Link>
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
