"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Search,
    CreditCard,
    QrCode,
    CheckCircle2,
    XCircle,
    Loader2,
    Download,
    TrendingUp,
    Calendar,
    ChevronUp,
    ChevronDown,
    DollarSign,
    Users,
    Play,
    Trash2
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Payment {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    stripeIntentId?: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
    };
    plan?: {
        name: string;
    };
}

export default function AdminPaymentsPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const res = await apiFetch("/admin/payments");
                if (res.ok) setPayments(await res.json());
            } catch (error) {
                toast.error("Erro ao carregar pagamentos");
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const totalRevenue = payments
        .filter(p => p.status === 'SUCCEEDED')
        .reduce((acc, p) => acc + p.amount, 0);

    const filtered = payments.filter(p => {
        const name = p.user?.name?.toLowerCase() || "";
        const email = p.user?.email?.toLowerCase() || "";
        const search = searchTerm.toLowerCase();
        return name.includes(search) || email.includes(search);
    });

    const simulateApproval = async (orderNsu: string) => {
        try {
            const res = await apiFetch("/admin/payments/test-simulate", {
                method: "POST",
                body: JSON.stringify({ orderNsu })
            });
            if (res.ok) {
                toast.success("Simulação enviada! Verifique a assinatura do aluno.");
                // Refresh list
                const freshRes = await apiFetch("/admin/payments");
                if (freshRes.ok) setPayments(await freshRes.json());
            } else {
                toast.error("Erro ao simular aprovação");
            }
        } catch (error) {
            toast.error("Erro de conexão");
        }
    };

    const deletePayment = async (id: string) => {
        if (!confirm("Deseja realmente excluir este registro de pagamento?")) return;
        try {
            const res = await apiFetch(`/admin/payments/${id}`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Registro removido");
                setPayments(prev => prev.filter(p => p.id !== id));
            } else {
                toast.error("Erro ao remover registro");
            }
        } catch (error) {
            toast.error("Erro de conexão");
        }
    };

    const clearAllPending = async () => {
        if (!confirm("Deseja realmente excluir TODOS os registros pendentes? Esta ação não pode ser desfeita.")) return;
        try {
            const res = await apiFetch(`/admin/payments/pending`, { method: "DELETE" });
            if (res.ok) {
                toast.success("Todos os pendentes foram removidos");
                setPayments(prev => prev.filter(p => p.status !== 'PENDING'));
            } else {
                toast.error("Erro ao remover registros");
            }
        } catch (error) {
            toast.error("Erro de conexão");
        }
    };

    return (
        <div className="w-full px-8 py-8 h-full font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <PageHeader
                    title="Fluxo de Caixa"
                    description="Acompanhe todas as transações realizadas na plataforma em tempo real."
                    badge="REVENUE"
                />
                <div className="flex gap-3">
                    {payments.some(p => p.status === 'PENDING') && (
                        <Button
                            variant="outline"
                            onClick={clearAllPending}
                            className="h-12 rounded-xl border-red-100 bg-red-50 text-red-600 gap-2 font-bold hover:bg-red-100"
                        >
                            <Trash2 className="w-4 h-4" /> Limpar Pendentes
                        </Button>
                    )}
                    <Button variant="outline" className="h-12 rounded-xl border-slate-200 gap-2 font-bold text-slate-600">
                        <Download className="w-4 h-4" /> Exportar CSV
                    </Button>
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="p-6 rounded-[2rem] bg-white border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center mb-4 text-emerald-600">
                        <DollarSign size={20} />
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Receita Total</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="p-6 rounded-[2rem] bg-white border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center mb-4 text-indigo-600">
                        <TrendingUp size={20} />
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Transações (Total)</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">{payments.length}</div>
                </div>
                <div className="p-6 rounded-[2rem] bg-white border border-slate-100">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center mb-4 text-blue-600">
                        <Users size={20} />
                    </div>
                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Taxa de Sucesso</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">
                        {payments.length > 0 ? ((payments.filter(p => p.status === 'SUCCEEDED').length / payments.length) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] overflow-hidden bg-white border border-slate-100">
                <div className="p-6 border-b border-slate-100">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email do aluno..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 text-sm font-medium outline-none transition-all border border-slate-100 text-slate-700 placeholder:text-slate-400 focus:border-indigo-500"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Transação</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Valor</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Método</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-500 mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-black text-slate-800">{p.user?.name || 'Usuário não identificado'}</div>
                                        <div className="text-[11px] font-bold text-indigo-600 uppercase tracking-tight mb-0.5">{p.plan?.name || 'Plano não identificado'}</div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="text-[10px] font-bold text-slate-400">{p.createdAt ? format(new Date(p.createdAt), "dd/MM/yyyy HH:mm") : 'Sem data'}</div>
                                            {p.status === 'PENDING' && p.createdAt && (
                                                <div className="text-[9px] font-black text-amber-500 uppercase tracking-tight bg-amber-50 px-1.5 py-0.5 rounded-md">
                                                    Pendente há {formatDistanceToNow(new Date(p.createdAt), { locale: ptBR })}
                                                </div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 font-black text-slate-900">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase">
                                            {p.paymentMethod === 'PIX' ? <QrCode size={14} /> : <CreditCard size={14} />} {p.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            {p.status === 'PENDING' && p.stripeIntentId && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => simulateApproval(p.stripeIntentId!)}
                                                    className="h-8 border-indigo-100 text-indigo-600 hover:bg-indigo-50 font-bold text-[9px] gap-1.5"
                                                >
                                                    <Play size={10} fill="currentColor" /> SIMULAR APROVAÇÃO
                                                </Button>
                                            )}
                                            {p.status !== 'SUCCEEDED' && (
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    onClick={() => deletePayment(p.id)}
                                                    className="h-8 w-8 p-0 text-slate-300 hover:text-red-500 hover:bg-red-50"
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            )}
                                            <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'SUCCEEDED' ? 'bg-emerald-50 text-emerald-600' : p.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                                }`}>
                                                {p.status === 'SUCCEEDED' ? 'SUCESSO' : p.status === 'PENDING' ? 'PENDENTE' : 'FALHA'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!loading && filtered.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="text-slate-400 font-medium">Nenhuma transação encontrada</div>
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
