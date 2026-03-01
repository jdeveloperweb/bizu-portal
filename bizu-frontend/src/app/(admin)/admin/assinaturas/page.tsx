"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Search,
    Filter,
    MoreVertical,
    User,
    Calendar,
    CreditCard,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    RefreshCw,
    AlertTriangle,
    Mail
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default function AdminSubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSubscriptions = async () => {
        setLoading(true);
        try {
            const res = await apiFetch("/admin/subscriptions");
            if (res.ok) {
                const data = await res.json();
                setSubscriptions(data);
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
        fetchSubscriptions();
    }, []);

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

    const filtered = subscriptions.filter(s =>
        s.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.plan?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full px-8 py-8 h-full font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <PageHeader
                    title="Gestão de Assinaturas"
                    description="Monitore os planos ativos, renovações e status de pagamento dos alunos."
                    badge="COMMERCE"
                />
                <Button
                    onClick={fetchSubscriptions}
                    variant="outline"
                    className="h-12 rounded-xl font-bold px-6 gap-2 border-slate-200 text-slate-600 hover:bg-slate-50"
                >
                    <RefreshCw className="w-4 h-4" />
                    Atualizar Lista
                </Button>
            </div>

            <div className="rounded-[2rem] overflow-hidden border" style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(255,255,255,0.06)" }}>
                <div className="p-6 border-b flex flex-col md:flex-row gap-4 justify-between items-center" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por aluno, email ou plano..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl text-sm font-medium outline-none transition-all text-slate-200 placeholder:text-slate-600 focus:border-indigo-500"
                            style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.07)" }}
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr style={{ background: "rgba(255,255,255,0.03)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Aluno / Plano</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Período / Renovação</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.map(s => (
                                <tr key={s.id} className="hover:bg-white/[0.03] transition-colors" style={{ borderColor: "rgba(255,255,255,0.04)" }}>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-indigo-400" style={{ background: "rgba(99,102,241,0.1)" }}>
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-200">{s.user?.name || 'Usuário não identificado'}</div>
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
                            {!loading && filtered.length === 0 && (
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
            </div>
        </div>
    );
}
