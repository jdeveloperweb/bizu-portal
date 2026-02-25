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
    Users
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api";
import { format } from "date-fns";

interface Payment {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    user: {
        name: string;
        email: string;
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

    const filtered = payments.filter(p =>
        p.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full px-8 py-8 h-full bg-slate-50/30 font-sans">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <PageHeader
                    title="Fluxo de Caixa"
                    description="Acompanhe todas as transações realizadas na plataforma em tempo real."
                    badge="REVENUE"
                />
                <Button variant="outline" className="h-12 rounded-xl border-slate-200 gap-2 font-bold text-slate-600">
                    <Download className="w-4 h-4" /> Exportar CSV
                </Button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                        <DollarSign size={20} />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Receita Total</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                        <TrendingUp size={20} />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transações (Total)</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">{payments.length}</div>
                </div>
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                        <Users size={20} />
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taxa de Sucesso</div>
                    <div className="text-2xl font-black text-slate-900 leading-none">
                        {payments.length > 0 ? ((payments.filter(p => p.status === 'SUCCEEDED').length / payments.length) * 100).toFixed(1) : 0}%
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por nome ou email do aluno..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full h-11 pl-11 pr-4 rounded-xl bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-600 outline-none text-sm font-medium transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Transação</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Método</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
                                    </td>
                                </tr>
                            ) : filtered.map(p => (
                                <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="text-sm font-black text-slate-900">{p.user.name}</div>
                                        <div className="text-[11px] font-bold text-slate-400">{format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")}</div>
                                    </td>
                                    <td className="px-8 py-5 font-black text-slate-700">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 uppercase">
                                            {p.paymentMethod === 'PIX' ? <QrCode size={14} /> : <CreditCard size={14} />} {p.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'SUCCEEDED' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                                            }`}>
                                            {p.status === 'SUCCEEDED' ? 'SUCESSO' : 'FALHA'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
