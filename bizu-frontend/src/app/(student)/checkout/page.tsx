"use client";

import { useEffect, useMemo, useState } from "react";
import {
    Anchor,
    ArrowLeft,
    Calendar,
    Check,
    CheckCircle2,
    ChevronRight,
    Copy,
    CreditCard as CardIcon,
    Loader2,
    Lock,
    QrCode,
    Rocket,
    ShieldCheck,
    Tag,
    Wallet,
    Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useNotification } from "@/components/NotificationProvider";
import { useRouter } from "next/navigation";
import Image from "next/image";
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
    free?: boolean;
    course?: {
        id: string;
        title: string;
        themeColor?: string;
    };
}

interface Course {
    id: string;
    title: string;
    themeColor?: string;
}

type CheckoutStep = "PLANS" | "DETAILS" | "PAYMENT_METHOD" | "PAYING" | "SUCCESS";
type PaymentMethod = "PIX" | "CARD" | "BOLETO";

const digitsOnly = (value: string) => value.replace(/\D/g, "");

const formatCardNumber = (value: string) => {
    const digits = digitsOnly(value).slice(0, 19);
    return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value: string) => {
    const digits = digitsOnly(value).slice(0, 4);
    if (digits.length <= 2) return digits;
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const formatCpf = (value: string) => {
    const digits = digitsOnly(value).slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d)/, "$1.$2")
        .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const detectCardBrand = (cardNumber: string) => {
    const digits = digitsOnly(cardNumber);
    if (/^4/.test(digits)) return "Visa";
    if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
    if (/^3[47]/.test(digits)) return "Amex";
    if (/^(4011|4312|4389|4514|4576|5041|5067|509|6277|6362|6363|650|6516|6550)/.test(digits)) return "Elo";
    if (/^(6062|3841)/.test(digits)) return "Hipercard";
    return "Cartão";
};

const getAccessLabel = (billingInterval?: string) => {
    switch (billingInterval) {
        case "MONTHLY":
            return "Acesso mensal (renovação a cada mês)";
        case "YEARLY":
            return "Acesso anual (renovação a cada ano)";
        case "LIFETIME":
            return "Acesso vitalício";
        default:
            return "Acesso conforme o tipo da assinatura";
    }
};

const getBillingSuffix = (billingInterval?: string) => {
    switch (billingInterval) {
        case "MONTHLY":
            return "/mês";
        case "YEARLY":
            return "/ano";
        case "LIFETIME":
            return "/vitalício";
        default:
            return "";
    }
};



const getCardBrandLogo = (brand: string) => {
    switch (brand) {
        case "Visa":
            return "/card-brands/visa.svg";
        case "Mastercard":
            return "/card-brands/mastercard.svg";
        case "Amex":
            return "/card-brands/amex.svg";
        case "Elo":
            return "/card-brands/elo.svg";
        case "Hipercard":
            return "/card-brands/hipercard.svg";
        default:
            return "/card-brands/generic.svg";
    }
};

const getPaymentModeLabel = (billingInterval?: string) => {
    switch (billingInterval) {
        case "MONTHLY":
        case "YEARLY":
            return "ASSINATURA RECORRENTE";
        case "LIFETIME":
            return "PAGAMENTO ÚNICO";
        default:
            return "ASSINATURA";
    }
};

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { notify } = useNotification();

    const [step, setStep] = useState<CheckoutStep>("PLANS");
    const [plans, setPlans] = useState<Plan[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("PIX");
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [coupon, setCoupon] = useState("");
    const [isPixPaid, setIsPixPaid] = useState(false);
    const [isCardFocused, setIsCardFocused] = useState(false);
    const [cardNumber, setCardNumber] = useState("");
    const [cardName, setCardName] = useState("");
    const [cardCpf, setCardCpf] = useState("");
    const [cardExpiry, setCardExpiry] = useState("");
    const [cardCvc, setCardCvc] = useState("");

    const initialPlanId = searchParams.get("plan");
    const initialCourseId = searchParams.get("course");

    const cardBrand = useMemo(() => detectCardBrand(cardNumber), [cardNumber]);
    const filteredPlans = useMemo(
        () => plans.filter((plan) => !selectedCourseId || !plan.course || plan.course.id === selectedCourseId),
        [plans, selectedCourseId],
    );

    const isCardFormValid =
        digitsOnly(cardNumber).length >= 13 &&
        cardName.trim().length > 4 &&
        digitsOnly(cardCpf).length === 11 &&
        digitsOnly(cardExpiry).length === 4 &&
        digitsOnly(cardCvc).length >= 3;

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const [coursesRes, plansRes] = await Promise.all([apiFetch("/public/courses"), apiFetch("/public/plans")]);

                if (plansRes.ok) {
                    const plansData: Plan[] = await plansRes.json();
                    setPlans(plansData);

                    if (initialPlanId) {
                        const plan = plansData.find(p => p.id === initialPlanId);
                        if (plan) {
                            setSelectedPlan(plan);
                            setStep("DETAILS");
                        }
                    }
                }

                if (coursesRes.ok) {
                    const coursesData: Course[] = await coursesRes.json();
                    setCourses(coursesData);
                    if (initialCourseId) {
                        setSelectedCourseId(initialCourseId);
                    } else if (coursesData.length > 0) {
                        setSelectedCourseId(coursesData[0].id);
                    }
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

    const handleProcessPayment = async () => {
        if (selectedPlan?.free) {
            handleFinish();
            return;
        }

        if (paymentMethod === "CARD" && !isCardFormValid) {
            notify("Dados incompletos", "Preencha corretamente os dados do cartão para continuar.", "info");
            return;
        }

        setProcessing(true);
        try {
            const res = await apiFetch("/checkout/create-session", {
                method: "POST",
                body: JSON.stringify({
                    planId: selectedPlan?.id,
                    amount: selectedPlan?.price,
                    provider: paymentMethod === "CARD" ? "STRIPE" : "MERCADO_PAGO",
                }),
            });

            if (res.ok) {
                setStep("PAYING");
                if (paymentMethod === "PIX") {
                    setTimeout(() => {
                        setIsPixPaid(true);
                        setTimeout(() => handleFinish(), 2000);
                    }, 5000);
                } else {
                    setTimeout(() => {
                        handleFinish();
                    }, 3000);
                }
            }
        } catch {
            notify("Erro", "Falha ao processar pagamento", "error");
        } finally {
            setProcessing(false);
        }
    };

    const handleFinish = async () => {
        try {
            await apiFetch("/checkout/confirm", {
                method: "POST",
                body: JSON.stringify({ planId: selectedPlan?.id }),
            });
            setStep("SUCCESS");
        } catch {
            notify(
                "Erro na ativação",
                "Seu pagamento foi aprovado, mas houve um erro ao liberar seu curso. Entre em contato com o suporte.",
                "error",
            );
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

    if (step === "PLANS") {
        return (
            <div className="min-h-screen bg-slate-50 font-sans">
                <header className="h-16 px-6 md:px-10 border-b border-slate-200 bg-white/90 backdrop-blur sticky top-0 z-50 flex items-center justify-between">
                    <BrandLogo size="sm" variant="dark" />
                    <Button variant="ghost" className="text-slate-500" onClick={() => router.push("/dashboard")}>Voltar ao painel</Button>
                </header>

                <div className="max-w-6xl mx-auto px-6 py-14">
                    <div className="text-center mb-14">
                        <p className="inline-flex px-4 py-1 rounded-full bg-yellow-300 text-[11px] font-black tracking-widest uppercase mb-4">Investimento</p>
                        <h1 className="text-5xl font-black text-slate-900 mb-3 tracking-tight">Planos & Preços</h1>
                        <p className="text-slate-500 font-medium">Escolha o curso e veja os planos daquele curso.</p>
                    </div>

                    {courses.length > 0 && (
                        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto px-6 mb-10">
                            {courses.map((course) => (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourseId(course.id)}
                                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCourseId === course.id
                                        ? "bg-white border-2 border-indigo-500 text-indigo-600 shadow-lg"
                                        : "bg-white border border-slate-200 text-slate-500 hover:border-indigo-300"
                                        }`}
                                >
                                    <Anchor size={16} style={{ color: selectedCourseId === course.id ? (course.themeColor || "#4f46e5") : "#94a3b8" }} />
                                    {course.title}
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredPlans.map((plan) => {
                            let features = [];
                            try {
                                features = plan.features ? JSON.parse(plan.features) : [];
                            } catch (e) {
                                console.error("Error parsing features for plan:", plan.id, e);
                            }
                            return (
                                <div
                                    key={plan.id}
                                    className={`bg-white rounded-3xl p-8 border transition-all hover:shadow-xl hover:-translate-y-1 flex flex-col ${plan.highlight ? "border-indigo-500 ring-4 ring-indigo-50" : "border-slate-100"}`}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 text-indigo-600 flex items-center justify-center mb-5">
                                        <Zap size={20} />
                                    </div>
                                    <h2 className="text-3xl font-black text-slate-900">{plan.name}</h2>
                                    <p className="text-sm text-slate-500 mt-2 min-h-[40px]">{plan.description}</p>
                                    {plan.course?.title && (
                                        <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 mt-3">Curso: {plan.course.title}</p>
                                    )}

                                    <div className="mt-6 mb-8">
                                        {plan.free ? (
                                            <span className="text-5xl font-black text-slate-900">Grátis</span>
                                        ) : (
                                            <>
                                                <span className="text-sm text-slate-400">R$</span>
                                                <span className="text-5xl font-black text-slate-900 ml-1">{plan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
                                                <span className="text-slate-400 font-bold ml-1">{getBillingSuffix(plan.billingInterval)}</span>
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-3 mb-8 flex-1">
                                        {features.map((f: string, index: number) => (
                                            <div key={`${plan.id}-${index}`} className="flex gap-2 items-start">
                                                <Check size={14} className="text-emerald-500 mt-1" />
                                                <span className="text-sm text-slate-600 font-medium">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <Button onClick={() => handleSelectPlan(plan)} className="h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 font-bold">
                                        {plan.free ? "Começar Agora" : "Assinar Agora"}
                                    </Button>
                                </div>
                            );
                        })}
                    </div>

                    {filteredPlans.length === 0 && (
                        <div className="mt-10 text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <p className="text-slate-500 font-semibold">Nenhum plano encontrado para o curso selecionado.</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
            <div className="bg-white border-b border-slate-100 py-4 px-8 flex items-center justify-between sticky top-0 z-50">
                <BrandLogo size="sm" variant="dark" link={false} />
                <div className="flex items-center gap-2 text-[10px] sm:text-[12px] font-bold text-slate-400 uppercase tracking-widest">
                    <Lock size={14} className="text-emerald-500" /> Ambiente 100% Seguro
                </div>
            </div>

            <div className="flex-1 max-w-5xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 p-6 lg:p-12">
                <div className="lg:col-span-7 space-y-6">
                    {step !== "SUCCESS" && step !== "PAYING" && (
                        <button
                            onClick={() => setStep(step === "DETAILS" ? "PLANS" : "DETAILS")}
                            className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-900 transition-colors mb-4 group"
                        >
                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                            Voltar
                        </button>
                    )}

                    {step === "DETAILS" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Revise seu pedido</h2>
                            <p className="text-slate-500 font-medium">Confirme os detalhes antes de prosseguir para o pagamento.</p>

                            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
                                <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
                                    <div className="w-16 h-16 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shrink-0 shadow-lg shadow-indigo-100">
                                        <Rocket size={32} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mb-1">Produto</div>
                                        <h3 className="text-xl font-black text-slate-900">{selectedPlan?.name}</h3>
                                        <p className="text-sm text-slate-500 font-medium">{selectedPlan?.description}</p>
                                        <p className="text-xs font-bold text-slate-400 mt-2 uppercase">{getAccessLabel(selectedPlan?.billingInterval)}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Valor</div>
                                        <div className="text-xl font-black text-slate-900">
                                            {selectedPlan?.free ? "Grátis" : `R$ ${selectedPlan?.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                                        </div>
                                        {!selectedPlan?.free && <div className="text-[10px] font-bold text-slate-400">{getPaymentModeLabel(selectedPlan?.billingInterval)}</div>}
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
                                            onChange={(e) => setCoupon(e.target.value.toUpperCase())}
                                            placeholder="TEMCUPOM?"
                                            className="flex-1 h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm transition-all"
                                        />
                                        <Button variant="outline" className="h-12 rounded-xl px-6 border-slate-200 text-slate-600 font-bold hover:bg-slate-50">Aplicar</Button>
                                    </div>
                                </div>
                            </div>

                            <Button onClick={() => selectedPlan?.free ? handleProcessPayment() : setStep("PAYMENT_METHOD")} className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg gap-3">
                                {selectedPlan?.free ? "Confirmar Inscrição" : "Continuar para Pagamento"}
                                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    )}

                    {step === "PAYMENT_METHOD" && (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-6">
                            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forma de pagamento</h2>
                            <p className="text-slate-500 font-medium">Escolha como deseja finalizar seu investimento.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <button
                                    onClick={() => setPaymentMethod("PIX")}
                                    className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left ${paymentMethod === "PIX" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 bg-white hover:border-slate-200"}`}
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
                                    className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col gap-4 text-left ${paymentMethod === "CARD" ? "border-indigo-600 bg-indigo-50/50" : "border-slate-100 bg-white hover:border-slate-200"}`}
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
                                <div className="p-6 bg-white rounded-3xl border border-slate-200 space-y-5 animate-in fade-in duration-300">
                                    <div className="w-full flex justify-center">
                                        <div className={`relative w-full max-w-[420px] aspect-[1.586/1] overflow-hidden rounded-2xl p-5 text-white transition-all duration-300 ${isCardFocused ? "scale-[1.02]" : "scale-100"} bg-gradient-to-br from-indigo-600 via-indigo-500 to-slate-900`}>
                                            <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent,rgba(255,255,255,.2),transparent)] animate-[pulse_2.5s_ease-in-out_infinite]" />
                                            <div className="relative h-full flex flex-col justify-between">
                                                <div className="flex items-center justify-between text-[11px] uppercase tracking-widest">
                                                    <span className="opacity-80">Cartão</span>
                                                    <Image
                                                        src={getCardBrandLogo(cardBrand)}
                                                        alt={cardBrand}
                                                        width={76}
                                                        height={24}
                                                        className="h-6 w-auto rounded-md"
                                                    />
                                                </div>

                                                <div className="text-[clamp(1rem,2vw,1.4rem)] font-black tracking-[0.12em] leading-none whitespace-nowrap">{cardNumber || "0000 0000 0000 0000"}</div>

                                                <div className="flex justify-between text-xs uppercase tracking-widest">
                                                    <div className="min-w-0">
                                                        <p className="opacity-70">Nome</p>
                                                        <p className="font-bold truncate max-w-[180px]">{cardName || "SEU NOME"}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="opacity-70">Validade</p>
                                                        <p className="font-bold">{cardExpiry || "MM/AA"}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Número do Cartão</label>
                                        <input
                                            inputMode="numeric"
                                            value={cardNumber}
                                            onFocus={() => setIsCardFocused(true)}
                                            onBlur={() => setIsCardFocused(false)}
                                            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                                            placeholder="0000 0000 0000 0000"
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nome no Cartão</label>
                                        <input
                                            type="text"
                                            value={cardName}
                                            onChange={(e) => setCardName(e.target.value.toUpperCase())}
                                            placeholder="NOME COMO ESTÁ NO CARTÃO"
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm"
                                        />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CPF do Comprador</label>
                                        <input
                                            inputMode="numeric"
                                            value={cardCpf}
                                            onChange={(e) => setCardCpf(formatCpf(e.target.value))}
                                            placeholder="000.000.000-00"
                                            className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Validade (MM/AA)</label>
                                            <input
                                                inputMode="numeric"
                                                value={cardExpiry}
                                                onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                                                placeholder="01/30"
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm"
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CVC</label>
                                            <input
                                                inputMode="numeric"
                                                value={cardCvc}
                                                onChange={(e) => setCardCvc(digitsOnly(e.target.value).slice(0, 4))}
                                                placeholder="123"
                                                className="w-full h-12 px-4 rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-600 outline-none font-bold text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <Button onClick={handleProcessPayment} disabled={processing || (paymentMethod === "CARD" && !isCardFormValid)} className="w-full h-16 rounded-[1.5rem] bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg gap-3">
                                {processing ? <Loader2 className="animate-spin" /> : <>Finalizar Compra <Rocket size={20} /></>}
                            </Button>
                        </div>
                    )}

                    {step === "PAYING" && (
                        <div className="animate-in fade-in duration-500 space-y-8 flex flex-col items-center py-12">
                            {paymentMethod === "PIX" ? (
                                <>
                                    <div className="text-center space-y-2">
                                        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Aguardando Pagamento</h2>
                                        <p className="text-slate-500 font-medium">Abra o app do seu banco e escaneie o código abaixo.</p>
                                    </div>
                                    <div className={`p-6 bg-white rounded-[2.5rem] border-4 transition-all duration-700 ${isPixPaid ? "border-emerald-500" : "border-indigo-100"}`}>
                                        <div className="w-64 h-64 rounded-2xl bg-slate-100 flex items-center justify-center">QR PIX</div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white rounded-xl px-4 py-2 border border-slate-200">
                                        <span className="font-mono text-xs">00020126...PIX</span>
                                        <button onClick={() => notify("Sucesso", "Código copiado!", "success")} className="w-8 h-8 rounded-md bg-slate-50 grid place-items-center">
                                            <Copy size={16} />
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="py-20 flex flex-col items-center gap-6">
                                    <div className="w-16 h-16 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                                    <h3 className="text-xl font-black text-slate-900">Processando sua transação</h3>
                                </div>
                            )}
                        </div>
                    )}

                    {step === "SUCCESS" && (
                        <div className="animate-in zoom-in-95 duration-700 py-12 flex flex-col items-center text-center space-y-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-emerald-500 flex items-center justify-center text-white">
                                <Rocket size={48} className="animate-bounce" />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black text-slate-900 tracking-tighter">SUA JORNADA COMEÇOU!</h1>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto">
                                    Seu pagamento no plano <span className="font-bold text-slate-900">{selectedPlan?.name}</span> foi processado com sucesso.
                                </p>
                            </div>

                            <Button onClick={() => router.push("/dashboard")} className="w-full h-16 rounded-[1.5rem] bg-slate-900 hover:bg-black text-white font-black text-lg gap-3">
                                Acessar Plataforma <ChevronRight size={20} />
                            </Button>
                        </div>
                    )}
                </div>

                <div className="lg:col-span-5 h-fit lg:sticky lg:top-28">
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-200 shadow-xl shadow-slate-200/50 space-y-8">
                        <div>
                            <h3 className="text-lg font-black text-slate-900 mb-6">Resumo do Pedido</h3>
                            {selectedPlan ? (
                                <div className="flex justify-between items-start gap-3">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 grid place-items-center text-indigo-600"><Zap size={18} /></div>
                                        <div>
                                            <div className="text-sm font-black text-slate-900">{selectedPlan.name}</div>
                                            <div className="text-[11px] text-slate-400 font-bold uppercase tracking-tight">{getAccessLabel(selectedPlan.billingInterval)}</div>
                                        </div>
                                    </div>
                                    <div className="text-sm font-black text-slate-900">
                                        {selectedPlan.free ? "Grátis" : `R$ ${selectedPlan.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Nenhum plano selecionado</p>
                            )}
                        </div>

                        <div className="space-y-3 pt-6 border-t border-slate-50">
                            <div className="flex justify-between text-sm font-bold text-slate-500">
                                <span>Subtotal</span>
                                <span className="whitespace-nowrap">
                                    {selectedPlan?.free ? "R$ 0,00" : `R$ ${selectedPlan?.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm font-bold text-emerald-500">
                                <span>Descontos</span>
                                <span className="whitespace-nowrap">- R$ 0,00</span>
                            </div>
                            <div className="pt-4 flex items-center justify-between">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total a pagar</div>
                                <div className="text-xl font-black text-indigo-600 tracking-tighter whitespace-nowrap">
                                    {selectedPlan?.free ? "Grátis" : `R$ ${selectedPlan?.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 rounded-2xl space-y-4">
                            <div className="flex items-center gap-3 text-slate-600">
                                <ShieldCheck size={20} className="text-emerald-500" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">Pagamento criptografado</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Calendar size={20} className="text-blue-500" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">{getAccessLabel(selectedPlan?.billingInterval)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-600">
                                <Wallet size={20} className="text-indigo-500" />
                                <span className="text-[11px] font-bold uppercase tracking-tight">{getPaymentModeLabel(selectedPlan?.billingInterval)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-white font-sans">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="w-12 h-12 animate-spin text-indigo-600" />
                    <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Carregando...</p>
                </div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
