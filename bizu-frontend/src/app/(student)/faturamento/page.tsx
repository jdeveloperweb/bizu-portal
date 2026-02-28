"use client";

import { useState, useEffect } from "react";
import {
    CreditCard,
    Calendar,
    History,
    AlertCircle,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowRight,
    ExternalLink,
    Clock,
    ShieldCheck,
    ChevronRight,
    QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Subscription {
    id: string;
    status: string;
    cancelAtPeriodEnd: boolean;
    currentPeriodEnd: string;
    plan: {
        name: string;
        price: number;
        billingInterval: string;
    };
}

interface Payment {
    id: string;
    amount: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
}

export default function StudentFaturamentoPage() {
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [history, setHistory] = useState<Subscription[]>([]);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelling, setCancelling] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [subRes, histRes, payRes] = await Promise.all([
                apiFetch("/subscriptions/me"),
                apiFetch("/subscriptions/me/history"),
                apiFetch("/subscriptions/me/payments")
            ]);

            if (subRes.ok) setSubscription(await subRes.json());
            if (histRes.ok) setHistory(await histRes.json());
            if (payRes.ok) setPayments(await payRes.json());
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar dados de faturamento");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleCancel = async () => {
        if (!confirm("Tem certeza que deseja cancelar a renovação automática?")) return;
        setCancelling(true);
        try {
            const res = await apiFetch("/subscriptions/me/cancel", { method: "POST" });
            if (res.ok) {
                toast.success("Renovação cancelada com sucesso.");
                fetchData();
            }
        } catch (error) {
            toast.error("Erro ao cancelar assinatura");
        } finally {
            setCancelling(false);
        }
    };

    if (loading) {
        return (
            <div className="w-full h-[60vh] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
        );
    }

    const isActive = subscription?.status === "ACTIVE";
    const isOverdue = subscription?.status === "PAST_DUE";

    return (
        <div className="max-w-6xl mx-auto p-6 lg:p-10 space-y-10 font-sans">
            <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight mb-2">Minha Assinatura</h1>
                <p className="text-slate-500 font-medium">Gerencie seu plano, histórico de pagamentos e faturamento.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Status da Assinatura */}
                <div className="lg:col-span-8 space-y-6">
                    <div className={`bg-white rounded-[2.5rem] p-8 border-2 shadow-sm relative overflow-hidden ${isOverdue ? "border-red-100 ring-4 ring-red-50" : "border-slate-100"}`}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50" />

                        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                            <div className="flex gap-5 items-center">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg ${isOverdue ? "bg-red-500 shadow-red-100" : "bg-indigo-600 shadow-indigo-100"}`}>
                                    <CreditCard size={28} />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="text-xl font-black text-slate-900">{subscription?.plan.name || "Nenhum plano ativo"}</h3>
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${isActive ? "bg-emerald-50 text-emerald-600" : (isOverdue ? "bg-red-50 text-red-600" : "bg-slate-100 text-slate-500")}`}>
                                            {subscription?.status || "INATIVO"}
                                        </span>
                                    </div>
                                    <p className="text-sm text-slate-500 font-medium">
                                        {isActive ? (
                                            subscription?.cancelAtPeriodEnd
                                                ? `Acesso garantido até ${format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM", { locale: ptBR })}`
                                                : `Próxima cobrança em ${format(new Date(subscription.currentPeriodEnd), "dd 'de' MMMM", { locale: ptBR })}`
                                        ) : "Você ainda não possui uma assinatura ativa."}
                                    </p>
                                </div>
                            </div>

                            {!subscription ? (
                                <Button onClick={() => window.location.href = '/checkout'} className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6">Assinar Agora</Button>
                            ) : (
                                isActive && !subscription.cancelAtPeriodEnd && (
                                    <button onClick={handleCancel} disabled={cancelling} className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors uppercase tracking-widest">
                                        {cancelling ? "Processando..." : "Cancelar Renovação"}
                                    </button>
                                )
                            )}
                        </div>

                        {isOverdue && (
                            <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4 text-red-700 animate-in slide-in-from-top-2">
                                <AlertCircle size={20} />
                                <div className="flex-1 text-[13px] font-bold">Atenção: Identificamos uma falha no seu último pagamento. Regularize para não perder o acesso.</div>
                                <Button variant="destructive" size="sm" className="h-9 px-4 font-bold rounded-lg shadow-lg shadow-red-200">Pagar Agora</Button>
                            </div>
                        )}
                    </div>

                    {/* Histórico de Pagamentos */}
                    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
                            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                                <History size={18} className="text-slate-400" /> Histórico de Transações
                            </h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50/50">
                                    <tr>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Data</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Valor</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Método</th>
                                        <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {payments.map(p => (
                                        <tr key={p.id} className="hover:bg-slate-50/30 transition-colors">
                                            <td className="px-8 py-4 text-[13px] font-bold text-slate-600">{format(new Date(p.createdAt), "dd/MM/yyyy HH:mm")}</td>
                                            <td className="px-8 py-4 text-[13px] font-black text-slate-900">R$ {p.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                                            <td className="px-8 py-4 text-[11px] font-bold text-slate-500 uppercase flex items-center gap-2">
                                                {p.paymentMethod === 'PIX' ? <QrCode size={14} /> : <CreditCard size={14} />} {p.paymentMethod}
                                            </td>
                                            <td className="px-8 py-4 text-right">
                                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-tighter ${p.status === 'SUCCEEDED' ? "bg-emerald-50 text-emerald-600" :
                                                    p.status === 'PENDING' ? "bg-amber-50 text-amber-600" :
                                                        "bg-red-50 text-red-600"
                                                    }`}>
                                                    {p.status === 'SUCCEEDED' ? "Aprovado" : p.status === 'PENDING' ? "Pendente" : "Falhou"}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                    {payments.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-12 text-center text-sm font-medium text-slate-400 italic">Nenhuma transação encontrada.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* Sidebar com informações úteis */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden group">
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl -mr-16 -mb-16 group-hover:scale-150 transition-transform duration-700" />
                        <h4 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-4">Suporte ao Aluno</h4>
                        <p className="text-sm text-slate-300 leading-relaxed mb-8">Teve problemas com sua cobrança ou quer mudar o plano? Nossa equipe está pronta para ajudar.</p>
                        <Button className="w-full h-12 rounded-xl bg-white text-slate-900 font-bold hover:bg-slate-100">Falar com Suporte</Button>
                    </div>

                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm space-y-6">
                        <div className="flex items-center gap-3 text-emerald-500">
                            <ShieldCheck size={20} />
                            <span className="text-[11px] font-black uppercase tracking-widest">Assinatura Segura</span>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3">
                                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                <p className="text-[12px] text-slate-500 font-medium">Carga de cobrança processada pelo Stripe ou Mercado Pago.</p>
                            </div>
                            <div className="flex items-start gap-3">
                                <CheckCircle2 size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                                <p className="text-[12px] text-slate-500 font-medium">Cancelamento a qualquer momento sem burocracia.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div >
    );
}
