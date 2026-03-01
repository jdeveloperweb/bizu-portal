"use client";

import { useState, useEffect } from "react";
import { X, Loader2, ArrowRight, CheckCircle2, CreditCard, Sparkles } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/components/AuthProvider";
import { useCustomDialog } from "@/components/CustomDialogProvider";
import { Button } from "@/components/ui/button";

type Plan = {
    id: string;
    name: string;
    price: number | string;
    billingInterval: string;
    currency: string;
    course?: { id: string, title: string };
};

type UpgradePreview = {
    currentPlan: string;
    newPlan: string;
    upgradePrice: number;
    currency: string;
};

const formatPrice = (price: number | string, currency = "BRL") => {
    const value = typeof price === "number" ? price : Number(price);
    return new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(value);
};

export default function SubscriptionManagementModal({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
    const { subscription, selectedCourseId, refreshUserProfile } = useAuth();
    const { confirm } = useCustomDialog();
    const [availablePlans, setAvailablePlans] = useState<Plan[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [preview, setPreview] = useState<UpgradePreview | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        if (open && selectedCourseId) {
            fetchPlans();
        }
    }, [open, selectedCourseId]);

    const fetchPlans = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/public/plans?courseId=${selectedCourseId}`);
            if (res.ok) {
                const data = await res.json();
                // Filtramos o plano atual para mostrar apenas upgrades/trocas
                setAvailablePlans(data.filter((p: Plan) => p.id !== subscription?.plan?.id));
            }
        } catch (error) {
            toast.error("Erro ao carregar planos");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectPlan = async (plan: Plan) => {
        setSelectedPlan(plan);
        setIsLoading(true);
        try {
            const res = await apiFetch(`/subscriptions/me/upgrade-preview?newPlanId=${plan.id}`);
            if (res.ok) {
                setPreview(await res.json());
            } else {
                toast.error("Erro ao calcular diferença de preço");
            }
        } catch (error) {
            toast.error("Erro na comunicação");
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpgrade = async () => {
        if (!selectedPlan) return;
        setIsProcessing(true);
        try {
            const res = await apiFetch(`/subscriptions/me/upgrade?newPlanId=${selectedPlan.id}`, {
                method: "POST"
            });
            if (res.ok) {
                const data = await res.json();
                if (data.url) {
                    window.location.href = data.url;
                } else {
                    toast.success("Plano atualizado com sucesso!");
                    await refreshUserProfile();
                    onOpenChange(false);
                }
            } else {
                toast.error(await res.text() || "Erro ao processar upgrade");
            }
        } catch (error) {
            toast.error("Erro na comunicação");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleCancel = async () => {
        if (!(await confirm("Tem certeza que deseja cancelar sua assinatura? Você manterá o acesso até o fim do período atual.", { type: "danger", title: "Cancelar Assinatura" }))) return;

        setIsProcessing(true);
        try {
            const res = await apiFetch("/subscriptions/me/cancel", { method: "POST" });
            if (res.ok) {
                toast.success("Cancelamento agendado com sucesso!");
                await refreshUserProfile();
                onOpenChange(false);
            }
        } catch {
            toast.error("Erro ao cancelar");
        } finally {
            setIsProcessing(false);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={() => onOpenChange(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-[550px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300 flex flex-col max-h-[90vh]">

                {/* Header Section */}
                <div className="relative p-8 bg-gradient-to-br from-indigo-600 via-indigo-700 to-primary text-white shrink-0">
                    <button
                        onClick={() => onOpenChange(false)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all active:scale-90"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center">
                            <CreditCard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black">Minha Assinatura</h2>
                            <p className="text-white/70 text-sm font-medium">Gerencie seu plano e pagamentos</p>
                        </div>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Current Plan info */}
                    <div className="p-6 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">PLANO ATUAL</span>
                            <div className="text-xl font-black text-slate-900">{subscription?.plan?.name || "Nenhum Plano Ativo"}</div>
                            {subscription && (
                                <div className="text-xs font-semibold text-slate-500 mt-1">
                                    Vence em {new Date(subscription.currentPeriodEnd).toLocaleDateString('pt-BR')}
                                </div>
                            )}
                        </div>
                        {subscription && (
                            <div className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-xs font-black shadow-sm ring-1 ring-emerald-100">ATIVO</div>
                        )}
                    </div>

                    {!selectedPlan ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h3 className="text-sm font-black text-slate-900 uppercase flex items-center gap-2">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Planos Disponíveis
                                </h3>
                                <span className="text-[10px] font-bold text-slate-400">{availablePlans.length} opções</span>
                            </div>

                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-12 gap-3">
                                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                                    <p className="text-slate-400 text-sm font-medium italic">Buscando opções...</p>
                                </div>
                            ) : availablePlans.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {availablePlans.map(plan => (
                                        <button
                                            key={plan.id}
                                            onClick={() => handleSelectPlan(plan)}
                                            className="group flex items-center justify-between p-6 rounded-[2rem] border border-slate-100 hover:border-primary/20 hover:bg-primary/5 transition-all text-left active:scale-[0.98]"
                                        >
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-white border border-slate-50 flex items-center justify-center shadow-sm group-hover:border-primary/20 group-hover:shadow-md transition-all">
                                                    <div className="text-xl font-black text-primary">{plan.name.charAt(0)}</div>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-slate-900 group-hover:text-primary transition-colors text-lg">{plan.name}</div>
                                                    <div className="text-xs font-semibold text-slate-500">{formatPrice(plan.price, plan.currency)} • {plan.billingInterval}</div>
                                                </div>
                                            </div>
                                            <div className="w-10 h-10 rounded-full bg-slate-50 group-hover:bg-primary group-hover:text-white flex items-center justify-center text-slate-300 transition-all">
                                                <ArrowRight className="w-5 h-5" />
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-12 px-6 border-2 border-dashed border-slate-100 rounded-[2rem] text-center space-y-2">
                                    <div className="text-slate-200 text-4xl font-black italic">TOP</div>
                                    <p className="text-sm font-bold text-slate-400">Você já está no melhor plano disponível!</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-300">
                            <button
                                onClick={() => { setSelectedPlan(null); setPreview(null); }}
                                className="flex items-center gap-2 text-primary font-black text-sm group"
                            >
                                <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">←</div>
                                Voltar para planos
                            </button>

                            <div className="p-8 rounded-[2.5rem] bg-indigo-50/50 border border-indigo-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <Sparkles size={120} />
                                </div>

                                <h4 className="text-lg font-black text-indigo-900 mb-6 flex items-center gap-2">
                                    Resumo do Upgrade
                                </h4>

                                {preview ? (
                                    <div className="space-y-5 relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-slate-400 w-12 text-right">DE:</div>
                                            <div className="flex-1 px-4 py-2 rounded-xl bg-white border border-slate-100 text-sm font-bold text-slate-600 line-through decoration-slate-300/60 opacity-60">{preview.currentPlan}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="text-xs font-bold text-primary w-12 text-right">PARA:</div>
                                            <div className="flex-1 px-4 py-2 rounded-xl bg-white border border-primary/20 text-sm font-black text-indigo-700 shadow-sm">{preview.newPlan}</div>
                                        </div>

                                        <div className="h-px bg-indigo-100 mx-4" />

                                        <div className="flex flex-col items-center py-4">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">DIFERENÇA PROPORCIONAL</span>
                                            <div className="text-4xl font-black text-primary">{formatPrice(preview.upgradePrice, preview.currency)}</div>
                                            <p className="text-[10px] text-indigo-700/60 font-medium text-center max-w-[280px] mt-4 leading-relaxed">
                                                Economizamos o valor não utilizado do seu plano atual para que você pague apenas a diferença.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-10 gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="text-indigo-400 text-xs font-bold">Calculando pro-rata...</p>
                                    </div>
                                )}
                            </div>

                            <Button
                                onClick={handleUpgrade}
                                disabled={isProcessing || !preview}
                                className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl shadow-2xl shadow-indigo-200 active:scale-[0.97] transition-all flex items-center justify-center gap-3"
                            >
                                {isProcessing ? <Loader2 className="w-6 h-6 animate-spin" /> : (
                                    <>
                                        Pagar Diferença
                                        <ArrowRight size={22} />
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                        <button
                            onClick={handleCancel}
                            disabled={isProcessing || !subscription}
                            className="text-xs font-bold text-slate-300 hover:text-rose-500 hover:bg-rose-50 px-4 py-2 rounded-xl transition-all disabled:opacity-0"
                        >
                            Cancelar Assinatura
                        </button>

                        <div className="flex items-center gap-2.5 px-4 py-2 bg-slate-50 rounded-xl border border-slate-100">
                            <CheckCircle2 size={12} className="text-emerald-500" />
                            <span className="text-[9px] font-black text-slate-400 tracking-wider">CHECKOUT SEGURO • INFINITEPAY</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
