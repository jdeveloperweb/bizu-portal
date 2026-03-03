"use client";

import PageHeader from "@/components/PageHeader";
import {
    Search,
    User,
    Calendar,
    Loader2,
    RefreshCw,
    AlertTriangle,
    Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";

interface Subscription {
    id: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    plan: {
        name: string;
    };
}

export default function SubscriptionsList() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const size = 10;

    const fetchSubscriptions = async (currentPage = page, search = searchTerm) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                size: size.toString(),
                sort: "createdAt,desc"
            });

            if (search) {
                queryParams.append("search", search);
            }

            const res = await apiFetch(`/admin/subscriptions?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
                // Spring Data Page object structure
                setSubscriptions(data.content || []);
                setTotalPages(data.totalPages || 0);
                setTotalElements(data.totalElements || 0);
            } else {
                toast.error("Erro ao carregar assinaturas: " + res.status);
            }
        } catch (error) {
            toast.error("Erro ao carregar assinaturas");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(0);
            fetchSubscriptions(0, searchTerm);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm]);

    // Initial load and page changes
    useEffect(() => {
        if (page !== 0 || !searchTerm) {
            fetchSubscriptions(page, searchTerm);
        }
    }, [page]);

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const res = await apiFetch(`/admin/subscriptions/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: newStatus })
            });
            if (res.ok) {
                toast.success("Status atualizado!");
                fetchSubscriptions();
            }
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    return (
        <div className="w-full px-8 py-8 h-full font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <PageHeader
                    title="Gestão de Assinaturas"
                    description="Monitore os planos ativos, renovações e status de pagamento dos alunos."
                    badge="COMMERCE"
                />
                <Button
                    onClick={() => fetchSubscriptions()}
                    variant="outline"
                    className="h-12 rounded-xl font-bold px-6 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar Lista
                </Button>
            </div>

            <div className="rounded-[2rem] overflow-hidden bg-white border border-slate-100">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por aluno, email ou plano..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 text-sm font-medium outline-none transition-all border border-slate-100 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500"
                        />
                    </div>
                    {totalElements > 0 && (
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {totalElements} assinaturas encontradas
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aluno / Plano</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Período / Renovação</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : subscriptions.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-800">{s.user?.name || 'Usuário não identificado'}</div>
                                                <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-tight">{s.plan?.name || 'Plano não identificado'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600' :
                                            s.status === 'PAST_DUE' ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                                            }`}>
                                            {s.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-slate-600 mb-1">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-[12px] font-bold">Até {s.currentPeriodEnd ? format(new Date(s.currentPeriodEnd), "dd/MM/yyyy") : 'Sem data'}</span>
                                        </div>
                                        {s.cancelAtPeriodEnd && (
                                            <div className="flex items-center gap-1.5 text-red-500 text-[10px] font-black uppercase tracking-tighter">
                                                <AlertTriangle size={12} /> Não renovará
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-2">
                                            {s.status === 'PAST_DUE' && (
                                                <Button size="sm" onClick={() => updateStatus(s.id, 'ACTIVE')} className="h-8 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none font-bold text-[10px]">REATIVAR</Button>
                                            )}
                                            {s.status === 'ACTIVE' && (
                                                <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, 'PAST_DUE')} className="h-8 text-red-400 hover:text-red-500 hover:bg-red-50 font-bold text-[10px]">MARCAR ATRASO</Button>
                                            )}
                                            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                                <Mail size={14} className="text-slate-400" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <AlertTriangle className="w-8 h-8 mb-2 opacity-20" />
                                            <p className="text-sm font-medium">Nenhuma assinatura encontrada</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between">
                        <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                            Página {page + 1} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                                className="h-9 px-4 rounded-xl font-bold text-xs border-slate-200 text-slate-600 disabled:opacity-50"
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                className="h-9 px-4 rounded-xl font-bold text-xs border-slate-200 text-slate-600 disabled:opacity-50"
                            >
                                Próxima
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
