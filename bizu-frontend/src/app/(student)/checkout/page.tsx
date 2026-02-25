"use client";

import { useEffect, useState } from "react";
import {
    Check,
    CreditCard,
    Rocket,
    Loader2,
    Target,
    ShieldCheck,
    Zap,
    ArrowLeft,
    QrCode,
    Copy,
    CheckCircle2,
    Lock,
    CreditCard as CardIcon,
    Wallet,
    Calendar,
    ChevronRight,
    Tag
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useNotification } from "@/components/NotificationProvider";
import { useRouter } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

interface Plan {
    id: string;
    name: string;
    description: string;
    price: number;
    billingInterval: string;
    features: string;
    highlight: boolean;
    badge: string;
}

type CheckoutStep = "PLANS" | "DETAILS" | "PAYMENT_METHOD" | "PAYING" | "SUCCESS";
type PaymentMethod = "PIX" | "CARD" | "BOLETO";

export default function CheckoutPage() {
    const [step, setStep] = useState<CheckoutStep>("PLANS");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [isPixPaid, setIsPixPaid] = useState(false);

    const { notify } = useNotification();
    const router = useRouter();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const res = await apiFetch("/public/plans");
                if (res.ok) {
                    const data = await res.json();
                    setPlans(data);
                }
            } catch (error) {
                console.error("Erro ao carregar planos", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPlans();
    }, []);

    const handleSelectPlan = (plan: Plan) => {
        setSelectedPlan(plan);
        setStep("DETAILS");
    };

    const handleConfirmDetails = () => {
        setStep("PAYMENT_METHOD");
    };

    const handleProcessPayment = async () => {
        setProcessing(true);
        try {
            // Em um fluxo real, aqui chamaríamos o backend para criar o objeto de cobrança
            const res = await apiFetch("/checkout/create-session", {
                method: "POST",
                body: JSON.stringify({
                    planId: selectedPlan?.id,
                    amount: selectedPlan?.price,
                    provider: paymentMethod === 'CARD' ? "STRIPE" : "MERCADO_PAGO"
                }),
            });

            if (res.ok) {
                setStep("PAYING");

                // Simulação de tempo de processamento/espera
                if (paymentMethod === "PIX") {
                    // Monitoramento fake do PIX
                    setTimeout(() => {
                        setIsPixPaid(true);
                        setTimeout(() => handleFinish(), 2000);
                    }, 5000);
                } else {
                    // Cartão simulado
                    setTimeout(() => {
                        handleFinish();
                    }, 3000);
                }
            }
        } catch (error) {
            notify("Erro", "Falha ao processar pagamento", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleFinish = async () => {
        try {
            await apiFetch("/checkout/confirm", {
                method: "POST",
                body: JSON.stringify({ planId: selectedPlan?.id })
            });
            setStep("SUCCESS");
        } catch (e) {
            notify("Erro na ativação", "Seu pagamento foi aprovado, mas houve um erro ao liberar seu curso. Entre em contato com o suporte.", "error");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white font-sans">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest animate-pulse">Carregando Ofertas...</p>
                </div>
            </div>
        );
    }

    // --- STEP: PLANS ---
    if (step === "PLANS") {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex justify-center mb-12">
                        <BrandLogo size="lg" variant="dark" />
                    </div>

                    <div className="text-center mb-16">
                        <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">Escolha seu plano Bizu</h1>
                        <p className="text-lg text-slate-500 font-medium">Invista na sua aprovação com o melhor material do mercado.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {plans.map(plan => {
                            const features = plan.features ? JSON.parse(plan.features) : [];
                            return (
                                <div key={plan.id} className={`bg-white rounded-[2.5rem] p-8 border transition-all hover:shadow-2xl hover:-translate-y-2 flex flex-col ${plan.highlight ? 'border-indigo-600 ring-4 ring-indigo-50' : 'border-slate-100 shadow-sm'}`}>
                                    {plan.highlight && (
                                        <div className="bg-indigo-600 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full self-start mb-6 -mt-2">
                                            Recomendado
                                        </div>
                                    )}
                                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                                    <p className="text-slate-500 text-sm mb-6 font-medium">{plan.description}</p>

                                    <div className="mb-8">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-black text-slate-900">R$ {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                                            <span className="text-sm font-bold text-slate-400">/{plan.billingInterval === 'YEARLY' ? 'ano' : 'mês'}</span>
                                        </div>
                                    </div>

                                    <div className="flex-1 space-y-4 mb-10">
                                        {features.map((f: string, i: number) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                                                    <Check size={12} strokeWidth={3} />
                                                </div>
                                                <span className="text-[13px] font-bold text-slate-600 leading-snug">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button
                                        onClick={() => handleSelectPlan(plan)}
                                        className={`h-14 rounded-2xl font-bold text-base transition-all ${plan.highlight ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900 hover:bg-black text-white'}`}
                                    >
                                        Selecionar este plano
                                    </Button>
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        );
    }

    // --- STEPS WRAPPER ---
    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            {/* Header Fino Checkout */}
            <div className="bg-white border-b border-slate-100 py-4 px-8 flex items-center justify-between sticky top-0 z-50">
                <BrandLogo size="sm" variant="dark" link={false} />
                <div className="flex items-center gap-6 text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                        <Lock size={14} className="text-emerald-500" />
                        Ambiente 100% Seguro
                    </div>
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-12">

                {/* Main Flow Content */}
                <div className="lg:col-span-7 space-y-6">

                    {/* Back Button */}
                    {step !== "SUCCESS" && step !== "PAYING" && (
                        <button
                            onClick={() => setStep(step === "DETAILS" ? "PLANS" : "DETAILS")}
                            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors mb-4 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar
                        </button>
                    )}

                    {/* DETAILS STEP */}
                    {step === "DETAILS" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revise seu pedido</h2>
                            <p className="text-slate-500 font-medium">Confirme os detalhes antes de prosseguir para o pagamento.</p>

                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-3xl -mr-16 -mt-16" />

                                <div className="relative flex flex-col md:flex-row gap-6 mb-8 items-start">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                                        <Rocket size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">PRODUTO</div>
                                        <h3 className="text-xl font-black text-slate-900">{selectedPlan?.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{selectedPlan?.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">VALOR</div>
                                        <div className="text-xl font-black text-slate-900">R$ {selectedPlan?.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                        <div className="text-[10px] font-bold text-slate-400">PAGAMENTO ÚNICO</div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-slate-50">
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-indigo-600" />
                                        <span className="text-[12px] font-bold text-slate-800 uppercase tracking-widest">Código de Desconto</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={coupon}
                                            onChange={e => setCoupon(e.target.value.toUpperCase())}
                                            placeholder="TEMCUPOM?"
                                            className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm transition-all"
                                        />
                                        <Button variant="outline" className="h-12 rounded-xl px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Aplicar</Button>
                                    </div>
                                </div>
                            </div>

                            <Button
                                onClick={handleConfirmDetails}
                                className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg gap-3 shadow-xl shadow-indigo-100 group"
                            >
                                Continuar para Pagamento
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {/* PAYMENT METHOD STEP */}
                    {step === "PAYMENT_METHOD" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forma de pagamento</h2>
                            <p className="text-slate-500 font-medium">Escolha como deseja finalizar seu investimento.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod("PIX")}
                                    className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left ${paymentMethod === "PIX" ? "border-indigo-600 bg-indigo-50/50 shadow-lg ring-4 ring-indigo-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === "PIX" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <QrCode size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">PIX Imediato</div>
                                        <p className="text-[11px] text-slate-500 font-medium">Liberação automática em segundos.</p>
                                    </div>
                                    {paymentMethod === "PIX" && <CheckCircle2 size={24} className="absolute top-4 right-4 text-indigo-600" />}
                                </button>

                                <button
                                    onClick={() => setPaymentMethod("CARD")}
                                    className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left ${paymentMethod === "CARD" ? "border-indigo-600 bg-indigo-50/50 shadow-lg ring-4 ring-indigo-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${paymentMethod === "CARD" ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-400"}`}>
                                        <CardIcon size={20} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-black text-slate-900 uppercase tracking-tight">Cartão de Crédito</div>
                                        <p className="text-[11px] text-slate-500 font-medium">Pague em até 12x no cartão.</p>
                                    </div>
                                    {paymentMethod === "CARD" && <CheckCircle2 size={24} className="absolute top-4 right-4 text-indigo-600" />}
                                </button>
                            </div>

                            {paymentMethod === "CARD" && (
                                <div className="p-8 bg-white rounded-3xl border border-slate-200 space-y-4 animate-in fade-in duration-300">
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número do Cartão</label>
                                        <div className="relative">
                                            <input type="text" placeholder="0000 0000 0000 0000" className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm" />
                                            <CardIcon className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Validade (MM/AA)</label>
                                            <input type="text" placeholder="01/30" className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm" />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CVC</label>
                                            <input type="password" placeholder="***" className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button
                                onClick={handleProcessPayment}
                                disabled={processing}
                                className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg gap-3 shadow-xl shadow-indigo-100"
                            >
                                {processing ? <Loader2 className="animate-spin" /> : <>Finalizar Compra <Rocket size={20} /></>}
                            </Button>
                        </div>
                    )}

                    {/* PAYING STEP (PIX OR LOADING) */}
                    {step === "PAYING" && (
                        <div className="animate-in fade-in duration-500 space-y-8 flex flex-col items-center py-12">
                            {paymentMethod === "PIX" ? (
                                <>
                                    <div className="text-center space-y-4">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Aguardando Pagamento</h2>
                                        <p className="text-slate-500 font-medium">Abra o app do seu banco e escaneie o código abaixo.</p>
                                    </div>

                                    <div className={`p-6 bg-white rounded-[2.5rem] border-4 transition-all duration-700 ${isPixPaid ? 'border-emerald-500 shadow-2xl shadow-emerald-100 scale-110' : 'border-indigo-100 shadow-xl shadow-indigo-100'}`}>
                                        {isPixPaid ? (
                                            <div className="w-64 h-64 flex flex-col items-center justify-center gap-4 text-emerald-500 animate-in zoom-in-50">
                                                <CheckCircle2 size={80} strokeWidth={3} />
                                                <span className="font-black text-xl uppercase tracking-tighter">Recebido!</span>
                                            </div>
                                        ) : (
                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=bizu-mock-pix-payment" alt="Pix QR" className="w-64 h-64 opacity-90" />
                                        )}
                                    </div>

                                    {!isPixPaid && (
                                        <div className="w-full space-y-4">
                                            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-center justify-between gap-4">
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-0.5">Código PIX Copia e Cola</div>
                                                    <div className="text-[12px] font-bold text-indigo-900 truncate">00020126360014BR.GOV.BCB.PIX0114+5511999999999520400005303986540510.005802BR5913BIZU_ACADEMIA6009SAO_PAULO62070503***6304E2D8</div>
                                                </div>
                                                <button onClick={() => notify("Sucesso", "Código copiado!", "success")} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm hover:shadow-md transition-all">
                                                    <Copy size={18} />
                                                </button>
                                            </div>
                                            <p className="text-center text-[11px] font-bold text-slate-400 animate-pulse">Detectando pagamento automaticamente...</p>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-20 flex flex-col items-center gap-8">
                                    <div className="relative">
                                        <div className="w-24 h-24 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                                        <CardIcon className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-600" size={32} />
                                    </div>
                                    <div className="text-center space-y-2">
                                        <h3 className="text-xl font-black text-slate-900">Processando sua transação</h3>
                                        <p className="text-sm text-slate-500 font-medium tracking-tight">Nossos servidores estão validando seus dados. <br /> Não feche esta página.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SUCCESS STEP */}
                    {step === "SUCCESS" && (
                        <div className="animate-in zoom-in-95 duration-700 py-12 flex flex-col items-center text-center space-y-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white shadow-2xl shadow-emerald-200 rotate-12">
                                <Rocket size={48} className="animate-bounce" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SUA JORNADA COMEÇOU!</h1>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                    Seu pagamento no plano <span className="font-bold text-slate-900">{selectedPlan?.name}</span> foi processado com sucesso. Prepare-se para a aprovação!
                                </p>
                            </div>

                            <div className="w-full grid md:grid-cols-2 gap-4">
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">ACESSO LIBERADO</div>
                                    <div className="flex items-center gap-2 text-emerald-500 font-bold">
                                        <CheckCircle2 size={16} /> Imediato
                                    </div>
                                </div>
                                <div className="p-6 bg-white rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">PRÓXIMO PASSO</div>
                                    <div className="font-bold text-slate-900">Sala de Aula</div>
                                </div>
                            </div>

                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white font-black text-lg gap-3 shadow-2xl"
                            >
                                Acessar Plataforma <ChevronRight size={20} />
                            </Button>
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Enviamos os dados de acesso para seu e-mail.</p>
                        </div>
                    )}
                </div>

                {/* Right Column: Order Summary (Sticky) */}
                <div className="lg:col-span-5 h-fit lg:sticky lg:top-28">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                                Resumo do Pedido
                            </h3>

                            <div className="space-y-4">
                                {selectedPlan ? (
                                    <div className="flex justify-between items-start group">
                                        <div className="flex gap-4">
                                            <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform shrink-0">
                                                <Zap size={20} fill="currentColor" />
                                            </div>
                                            <div>
                                                <div className="text-sm font-black text-slate-900">{selectedPlan.name}</div>
                                                <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">Acesso Vitalício</div>
                                            </div>
                                        </div>
                                        <div className="text-sm font-black text-slate-900">R$ {selectedPlan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 italic">Nenhum plano selecionado</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-50">
                            <div className="flex justify-between text-sm font-bold text-slate-500">
                                <span>Subtotal</span>
                                <span>R$ {selectedPlan?.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-emerald-500">
                                <span>Descontos</span>
                                <span>- R$ 0,00</span>
                            </div>
                            <div className="flex justify-between items-end pt-4">
                                <div>
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">TOTAL A PAGAR</div>
                                    <div className="text-3xl font-black text-indigo-600 tracking-tighter">R$ {selectedPlan?.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <ShieldCheck size={20} className="text-emerald-500" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">Pagamento Criptografado</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Calendar size={20} className="text-blue-500" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">Liberado por 12 meses</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-8 opacity-40">
                        <img src="https://logodownload.org/wp-content/uploads/2014/07/visa-logo-1.png" alt="Visa" className="h-4 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                        <img src="https://logodownload.org/wp-content/uploads/2014/07/mastercard-logo-7.png" alt="Master" className="h-6 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                        <img src="https://logodownload.org/wp-content/uploads/2020/02/pix-logo-1.png" alt="Pix" className="h-4 grayscale hover:grayscale-0 transition-all cursor-crosshair" />
                    </div>
                </div>
            </div>
        </div>
    );
}
