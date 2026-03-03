"use client";

import PageHeader from "@/components/PageHeader";
import {
    Search,
    User,
    Calendar,
    Loader2,
    RefreshCw,
    AlertTriangle,
    Mail,
    Filter,
    Trash2,
    CheckCircle,
    XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { useCustomDialog } from "@/components/CustomDialogProvider";

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
    const { confirm } = useCustomDialog();
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [stats, setStats] = useState({ active: 0, canceled: 0 });
    const size = 10;

    const fetchStats = async () => {
        try {
            const res = await apiFetch("/admin/subscriptions/stats");
            if (res.ok) setStats(await res.json());
        } catch (error) {
            console.error("Erro ao carregar stats", error);
        }
    };

    const fetchSubscriptions = useCallback(async (currentPage = page, search = searchTerm, status = statusFilter) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams({
                page: currentPage.toString(),
                size: size.toString(),
                sort: "createdAt,desc"
            });

            if (search) queryParams.append("search", search);
            if (status) queryParams.append("status", status);

            const res = await apiFetch(`/admin/subscriptions?${queryParams.toString()}`);
            if (res.ok) {
                const data = await res.json();
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
    }, [page, searchTerm, statusFilter]);

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(0);
            fetchSubscriptions(0, searchTerm, statusFilter);
        }, 500);
        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter]);

    // Initial load and page changes
    useEffect(() => {
        if (page !== 0 || (!searchTerm && !statusFilter)) {
            fetchSubscriptions(page, searchTerm, statusFilter);
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
                fetchStats();
            }
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    const deleteSubscription = async (id: string) => {
        const ok = await confirm("Deseja realmente excluir esta assinatura permanentemente?", { type: "danger", title: "Excluir Assinatura" });
        if (!ok) return;

        try {
            const res = await apiFetch(`/admin/subscriptions/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Assinatura excluída!");
                fetchSubscriptions();
                fetchStats();
            }
        } catch (error) {
            toast.error("Erro ao excluir assinatura");
        }
    };

    const deleteCanceled = async () => {
        const ok = await confirm("Deseja realmente excluir TODAS as assinaturas canceladas?", { type: "danger", title: "Limpar Canceladas" });
        if (!ok) return;

        try {
            const res = await apiFetch(`/admin/subscriptions/status/CANCELED`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Assinaturs excluídas!");
                fetchSubscriptions();
                fetchStats();
            }
        } catch (error) {
            toast.error("Erro ao limpar assinaturas");
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
                <div className="flex gap-3">
                    <Button
                        onClick={deleteCanceled}
                        variant="ghost"
                        className="h-12 rounded-xl font-bold px-6 gap-2 text-red-500 hover:bg-red-50 hover:text-red-600 border border-transparent hover:border-red-100"
                    >
                        <Trash2 className="w-4 h-4" />
                        Limpar Canceladas
                    </Button>
                    <Button
                        onClick={() => { fetchSubscriptions(); fetchStats(); }}
                        variant="outline"
                        className="h-12 rounded-xl font-bold px-6 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Atualizar
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                        <CheckCircle size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assinaturas Ativas</div>
                        <div className="text-3xl font-black text-slate-800 leading-none">{stats.active}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center gap-4 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                        <XCircle size={24} />
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Assinaturas Canceladas</div>
                        <div className="text-3xl font-black text-slate-800 leading-none">{stats.canceled}</div>
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] overflow-hidden bg-white border border-slate-100 shadow-sm transition-all">
                <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row gap-4 justify-between items-center bg-white">
                    <div className="flex gap-4 w-full md:w-auto flex-1">
                        <div className="relative flex-1 md:max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Buscar por aluno, email ou plano..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 text-sm font-medium outline-none transition-all border border-slate-100 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500 focus:bg-white"
                            />
                        </div>
                        <div className="relative min-w-[170px]">
                            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full h-11 pl-11 pr-10 rounded-xl bg-slate-50 text-[11px] font-black outline-none border border-slate-100 text-slate-700 appearance-none cursor-pointer focus:border-indigo-500 focus:bg-white transition-all"
                            >
                                <option value="">TODOS OS STATUS</option>
                                <option value="ACTIVE">ATIVAS</option>
                                <option value="CANCELED">CANCELADAS</option>
                                <option value="PAST_DUE">EM ATRASO</option>
                            </select>
                        </div>
                    </div>
                    {totalElements > 0 && (
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                            {totalElements} ENCONTRADAS
                        </div>
                    )}
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
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
                                        <Loader2 className="w-10 h-10 animate-spin text-indigo-500 mx-auto opacity-50" />
                                    </td>
                                </tr>
                            ) : subscriptions.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100/50">
                                                <User size={20} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-800 leading-none mb-1.5">{s.user?.name || 'Não identificado'}</div>
                                                <div className="flex items-center gap-1.5">
                                                    <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest group-hover:text-indigo-700 transition-colors">{s.plan?.name || 'Plano'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className={`inline-flex px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${s.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                s.status === 'PAST_DUE' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    s.status === 'CANCELED' ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                                        'bg-slate-50 text-slate-400 border-slate-100'
                                            }`}>
                                            {s.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-slate-600 mb-1.5">
                                            <Calendar size={14} className="text-slate-400" />
                                            <span className="text-xs font-black text-slate-700">Até {s.currentPeriodEnd ? format(new Date(s.currentPeriodEnd), "dd/MM/yyyy") : 'N/A'}</span>
                                        </div>
                                        {s.cancelAtPeriodEnd && (
                                            <div className="inline-flex items-center gap-1.5 text-red-500 text-[9px] font-black uppercase tracking-tight bg-red-50 px-2 py-0.5 rounded border border-red-100/50">
                                                <AlertTriangle size={10} /> Não renovará automaticamente
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200">
                                            {s.status === 'PAST_DUE' && (
                                                <Button size="sm" onClick={() => updateStatus(s.id, 'ACTIVE')} className="h-9 rounded-xl px-4 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border-none font-black text-[10px] uppercase tracking-widest">REATIVAR</Button>
                                            )}
                                            {s.status === 'ACTIVE' && (
                                                <Button size="sm" variant="ghost" onClick={() => updateStatus(s.id, 'PAST_DUE')} className="h-9 rounded-xl px-4 text-red-400 hover:text-red-500 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest">ATRASAR</Button>
                                            )}
                                            {s.status === 'CANCELED' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deleteSubscription(s.id)}
                                                    className="h-9 rounded-xl px-4 text-slate-400 hover:text-red-600 hover:bg-red-50 font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    EXCLUIR
                                                </Button>
                                            )}
                                            <Button size="sm" variant="ghost" className="h-9 w-9 rounded-xl p-0 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 border border-transparent hover:border-indigo-100">
                                                <Mail size={16} />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && subscriptions.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-24 text-center">
                                        <div className="flex flex-col items-center justify-center text-slate-400">
                                            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                                                <AlertTriangle className="w-8 h-8 opacity-20" />
                                            </div>
                                            <p className="text-sm font-black uppercase tracking-widest">Nenhuma assinatura encontrada</p>
                                            <p className="text-xs font-medium text-slate-400 mt-1">Tente ajustar seus filtros de busca</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-6 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Página {page + 1} de {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page === 0}
                                onClick={() => setPage(p => p - 1)}
                                className="h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-white transition-all disabled:opacity-30"
                            >
                                Anterior
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={page >= totalPages - 1}
                                onClick={() => setPage(p => p + 1)}
                                className="h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-white transition-all disabled:opacity-30"
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
