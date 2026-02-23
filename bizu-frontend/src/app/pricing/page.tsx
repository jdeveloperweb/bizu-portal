"use client";

import { useState } from "react";
import { Check, ChevronDown, Zap, Shield, Crown, Star } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const plans = [
    {
        id: "mensal",
        icon: Zap,
        iconBg: "#EEF2FF",
        iconColor: "#6366F1",
        name: "Plano Mensal",
        price: "49,90",
        interval: "/mês",
        description: "Ideal para testar a plataforma e focar em um concurso específico.",
        buttonText: "Assinar Agora",
        highlight: false,
        badge: null,
        features: [
            "Banco de 50k+ questões",
            "Simulados ilimitados",
            "Resoluções detalhadas",
            "Suporte via e-mail",
        ],
        extras: [
            "Acesso a todas as bancas cobradas",
            "Histórico completo de simulados",
            "Estatísticas básicas de desempenho",
            "App PWA — use offline",
            "Cancele quando quiser",
        ],
    },
    {
        id: "anual",
        icon: Crown,
        iconBg: "#FEF3C7",
        iconColor: "#D97706",
        name: "Plano Anual",
        price: "39,90",
        interval: "/mês",
        fullPrice: "478,80",
        description: "Melhor custo-benefício para quem tem foco a longo prazo.",
        buttonText: "Melhor Escolha",
        highlight: true,
        badge: "MAIS POPULAR",
        features: [
            "Tudo do Plano Mensal",
            "Acesso offline completo (PWA)",
            "Mentoria coletiva mensal ao vivo",
            "Flashcards exclusivos premium",
            "Economia de R$ 120,00/ano",
        ],
        extras: [
            "Arena PVP ilimitada",
            "Relatório avançado com IA",
            "Trilhas de estudo personalizadas",
            "Provas comentadas de todas as bancas",
            "Grupo VIP no WhatsApp com professores",
            "Certificado de participação",
        ],
    },
    {
        id: "vitalicio",
        icon: Shield,
        iconBg: "#D1FAE5",
        iconColor: "#059669",
        name: "Vitalício",
        price: "997,00",
        interval: " único",
        description: "Acesso para sempre. Para quem quer se preparar sem pressa.",
        buttonText: "Investir na Carreira",
        highlight: false,
        badge: null,
        features: [
            "Tudo do Plano Anual",
            "Acesso vitalício garantido",
            "Todas as atualizações futuras",
            "Kit físico de boas-vindas",
        ],
        extras: [
            "Mentoria individual — 1 sessão/trimestre",
            "Acesso antecipado a novos módulos",
            "Suporte prioritário via WhatsApp",
            "Indicação de vagas e concursos",
            "Nome no Mural dos Aprovados",
            "Desconto em cursos parceiros",
        ],
    },
];

const faqs = [
    {
        q: "Posso cancelar a assinatura quando quiser?",
        a: "Sim! Os planos mensais e anuais podem ser cancelados a qualquer momento sem multa. O acesso continua até o fim do período já pago.",
    },
    {
        q: "O conteúdo fica desatualizado?",
        a: "Nunca. Nossa equipe monitora todas as bancas e atualiza o banco de questões semanalmente.",
    },
    {
        q: "Funciona no celular?",
        a: "Sim! A plataforma é um PWA — funciona como app no seu celular e pode ser usado offline.",
    },
    {
        q: "Existe garantia de devolução?",
        a: "Sim. Oferecemos 7 dias de garantia incondicional. Se não gostar, devolvemos 100% do seu dinheiro.",
    },
];

export default function PricingPage() {
    const [expandedPlan, setExpandedPlan] = useState<string | null>("anual");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Header */}
            <div className="bg-[#F8FAFF] pt-28 pb-16 text-center border-b border-slate-100">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#6366F1] mb-4 pill-primary px-4 py-1.5 rounded-full">
                    Investimento
                </span>
                <h1 className="text-5xl font-extrabold text-slate-900 mb-4">
                    Planos &amp; Preços
                </h1>
                <p className="text-slate-500 text-lg max-w-xl mx-auto">
                    Escolha o plano ideal. Todos incluem{" "}
                    <strong className="text-slate-700">7 dias de garantia incondicional</strong>.
                </p>
            </div>

            <div className="container mx-auto px-6 py-16">
                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const expanded = expandedPlan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-3xl overflow-hidden transition-all duration-300 ${plan.highlight
                                        ? "shadow-2xl shadow-[#6366F1]/15 ring-2 ring-[#6366F1] scale-[1.02]"
                                        : "card-light"
                                    }`}
                            >
                                {plan.badge && (
                                    <div
                                        className="py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white"
                                        style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                                    >
                                        ⭐ {plan.badge}
                                    </div>
                                )}

                                <div className={`p-7 ${plan.badge ? "pt-5" : ""} bg-white`}>
                                    {/* Ícone */}
                                    <div
                                        className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
                                        style={{ background: plan.iconBg }}
                                    >
                                        <Icon size={20} style={{ color: plan.iconColor }} />
                                    </div>

                                    <h3 className="text-lg font-extrabold text-slate-900 mb-1">{plan.name}</h3>
                                    <p className="text-sm text-slate-500 mb-5 leading-relaxed min-h-[40px]">
                                        {plan.description}
                                    </p>

                                    {/* Preço */}
                                    <div className="flex items-baseline gap-1 mb-1">
                                        <span className="text-xs text-slate-400 font-medium">R$</span>
                                        <span className="text-3xl font-extrabold text-slate-900">{plan.price}</span>
                                        <span className="text-sm text-slate-400">{plan.interval}</span>
                                    </div>
                                    {plan.fullPrice && (
                                        <p className="text-xs text-slate-400 mb-5">
                                            Cobrado anualmente: R$ {plan.fullPrice}
                                        </p>
                                    )}

                                    {/* Features */}
                                    <div className="space-y-2.5 mb-5">
                                        {plan.features.map((f) => (
                                            <div key={f} className="flex items-start gap-2.5">
                                                <div className="mt-0.5 w-4.5 h-4.5 rounded-full bg-[#D1FAE5] flex items-center justify-center shrink-0">
                                                    <Check size={11} className="text-[#059669]" />
                                                </div>
                                                <span className="text-sm text-slate-700">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Accordion toggle */}
                                    <button
                                        onClick={() => setExpandedPlan(expanded ? null : plan.id)}
                                        className="flex items-center gap-1.5 text-xs font-semibold mb-5 transition-colors text-slate-400 hover:text-[#6366F1]"
                                    >
                                        <ChevronDown
                                            size={15}
                                            className="transition-transform duration-300"
                                            style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                        />
                                        {expanded ? "Ocultar detalhes" : `+ ${plan.extras.length} benefícios adicionais`}
                                    </button>

                                    {/* Extras expandidos */}
                                    <div
                                        className="overflow-hidden transition-all duration-400"
                                        style={{ maxHeight: expanded ? `${plan.extras.length * 34}px` : "0px" }}
                                    >
                                        <div className="rounded-xl bg-[#F8FAFF] border border-slate-100 p-4 mb-5 space-y-2">
                                            {plan.extras.map((e) => (
                                                <div key={e} className="flex items-start gap-2">
                                                    <Star size={12} className="text-[#6366F1] mt-0.5 shrink-0" />
                                                    <span className="text-xs text-slate-600">{e}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* CTA */}
                                    <Link href="/register">
                                        <button
                                            className="w-full h-11 rounded-xl font-bold text-sm transition-all duration-200 hover:scale-[1.02]"
                                            style={
                                                plan.highlight
                                                    ? {
                                                        background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                                        color: "#FFFFFF",
                                                        boxShadow: "0 4px 16px rgba(99,102,241,0.35)",
                                                    }
                                                    : {
                                                        background: "#F8FAFF",
                                                        color: "#4F46E5",
                                                        border: "1px solid #C7D2FE",
                                                    }
                                            }
                                        >
                                            {plan.buttonText}
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Garantia */}
                <div className="max-w-xl mx-auto rounded-2xl p-6 text-center mb-16 bg-[#D1FAE5]/40 border border-[#A7F3D0]">
                    <div className="text-3xl mb-2">🛡️</div>
                    <h3 className="text-base font-bold text-slate-800 mb-1">7 Dias de Garantia Incondicional</h3>
                    <p className="text-sm text-slate-500">
                        Se por qualquer motivo não estiver satisfeito nos primeiros 7 dias,
                        devolvemos 100% do seu investimento. Sem perguntas.
                    </p>
                </div>

                {/* FAQ */}
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-2xl font-extrabold text-slate-900 text-center mb-8">Perguntas Frequentes</h2>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`rounded-2xl overflow-hidden border transition-all ${expandedFaq === i ? "border-[#C7D2FE] bg-[#F8FAFF]" : "border-slate-100 bg-white"
                                    }`}
                            >
                                <button
                                    className="w-full flex items-center justify-between px-6 py-4 text-left"
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                >
                                    <span className="font-semibold text-slate-800 text-sm">{faq.q}</span>
                                    <ChevronDown
                                        size={18}
                                        className="text-[#6366F1] shrink-0 transition-transform duration-300"
                                        style={{ transform: expandedFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </button>
                                <div
                                    className="overflow-hidden transition-all duration-300"
                                    style={{ maxHeight: expandedFaq === i ? "160px" : "0px" }}
                                >
                                    <p className="px-6 pb-5 text-sm text-slate-500 leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-sm text-slate-400 mt-12">
                    Pagamento seguro via Stripe · Cancelamento fácil · Suporte em português
                </p>
            </div>
        </div>
    );
}
