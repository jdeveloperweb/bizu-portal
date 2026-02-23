"use client";

import { useState } from "react";
import { Check, ChevronDown, Zap, Shield, Star, Crown } from "lucide-react";
import Link from "next/link";

const plans = [
    {
        id: "mensal",
        icon: Zap,
        iconColor: "#6366F1",
        name: "Plano Mensal",
        price: "49,90",
        interval: "/mês",
        description: "Ideal para quem quer testar a plataforma e focar em um concurso específico.",
        buttonText: "Assinar Agora",
        highlight: false,
        badge: null,
        features: [
            "Banco de 50k+ questões",
            "Simulados ilimitados",
            "Resoluções detalhadas",
            "Suporte via e-mail",
        ],
        extraDetails: [
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
        iconColor: "#F59E0B",
        name: "Plano Anual",
        price: "39,90",
        interval: "/mês",
        fullPrice: "478,80",
        description: "O melhor custo-benefício para quem tem foco a longo prazo na aprovação.",
        buttonText: "Aproveitar Desconto",
        highlight: true,
        badge: "MAIS POPULAR",
        features: [
            "Tudo do Plano Mensal",
            "Acesso offline completo (PWA)",
            "Mentoria coletiva mensal ao vivo",
            "Flashcards exclusivos premium",
            "Economia de R$ 120,00",
        ],
        extraDetails: [
            "Arena PVP ilimitada — duelhe com outros candidatos",
            "Relatório de desempenho avançado com IA",
            "Trilhas de estudo personalizadas",
            "Provas comentadas de todas as bancas",
            "Grupo VIP no WhatsApp com professores",
            "Certificado de participação",
        ],
    },
    {
        id: "vitalicio",
        icon: Shield,
        iconColor: "#10B981",
        name: "Vitalício",
        price: "997,00",
        interval: " único",
        description: "Acesso para sempre. Ideal para quem está no início da jornada e quer se preparar sem pressa.",
        buttonText: "Investir na Carreira",
        highlight: false,
        badge: null,
        features: [
            "Tudo do Plano Anual",
            "Acesso vitalício garantido",
            "Todas as atualizações futuras",
            "Kit físico de boas-vindas",
        ],
        extraDetails: [
            "Mentoria individual — 1 sessão/trimestre",
            "Acesso antecipado a novos módulos e funcionalidades",
            "Suporte prioritário via WhatsApp",
            "Indicação de vagas e concursos personalizados",
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
        a: "Nunca. Nossa equipe monitora todas as bancas e atualiza o banco de questões semanalmente, garantindo que você estude sempre com conteúdo atual.",
    },
    {
        q: "Funciona no celular?",
        a: "Sim! A plataforma é um PWA (Progressive Web App), o que significa que funciona como um app no seu celular e pode ser usado offline.",
    },
    {
        q: "Existe garantia de devolução?",
        a: "Oferecemos 7 dias de garantia incondicional. Se não gostar por qualquer motivo, devolvemos 100% do seu investimento.",
    },
];

export default function PricingPage() {
    const [expandedPlan, setExpandedPlan] = useState<string | null>("anual");
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    return (
        <div className="min-h-screen bg-[#080B14] relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-20 blur-[120px]"
                    style={{ background: "radial-gradient(ellipse, #6366F1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            <div className="relative container mx-auto px-4 py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <span
                        className="inline-block text-xs font-bold uppercase tracking-[0.3em] mb-5 px-4 py-1.5 rounded-full"
                        style={{ background: "rgba(99,102,241,0.1)", color: "#A5B4FC", border: "1px solid rgba(99,102,241,0.2)" }}
                    >
                        INVESTIMENTO
                    </span>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-4">
                        Planos & <span
                            style={{
                                background: "linear-gradient(135deg, #6366F1, #A78BFA)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >Preços</span>
                    </h1>
                    <p className="text-[#64748B] text-lg max-w-xl mx-auto">
                        Escolha o plano ideal para o seu ritmo de estudos. Todos incluem 7 dias de garantia.
                    </p>
                </div>

                {/* Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto mb-20">
                    {plans.map((plan) => {
                        const Icon = plan.icon;
                        const isExpanded = expandedPlan === plan.id;

                        return (
                            <div
                                key={plan.id}
                                className="relative rounded-3xl overflow-hidden transition-all duration-500"
                                style={
                                    plan.highlight
                                        ? {
                                            background: "linear-gradient(#0E1525, #0E1525) padding-box, linear-gradient(135deg, #6366F1, #A78BFA, #F59E0B) border-box",
                                            border: "2px solid transparent",
                                            boxShadow: "0 0 60px rgba(99,102,241,0.2), 0 20px 60px rgba(0,0,0,0.4)",
                                            transform: "scale(1.03)",
                                        }
                                        : {
                                            background: "#0E1525",
                                            border: "1px solid rgba(99,102,241,0.12)",
                                        }
                                }
                            >
                                {/* Badge */}
                                {plan.badge && (
                                    <div
                                        className="absolute top-0 left-0 right-0 py-2 text-center text-[10px] font-black uppercase tracking-[0.3em] text-white"
                                        style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                                    >
                                        ⭐ {plan.badge}
                                    </div>
                                )}

                                <div className={`p-8 ${plan.badge ? "pt-12" : ""}`}>
                                    {/* Ícone */}
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                                        style={{ background: `${plan.iconColor}18` }}
                                    >
                                        <Icon className="w-6 h-6" style={{ color: plan.iconColor }} />
                                    </div>

                                    <h3 className="text-xl font-black text-white mb-2">{plan.name}</h3>
                                    <p className="text-sm text-[#64748B] mb-6 leading-relaxed min-h-[48px]">{plan.description}</p>

                                    {/* Preço */}
                                    <div className="flex items-baseline gap-1 mb-2">
                                        <span className="text-sm font-bold text-[#64748B]">R$</span>
                                        <span className="text-4xl font-black text-white">{plan.price}</span>
                                        <span className="text-sm text-[#64748B]">{plan.interval}</span>
                                    </div>
                                    {plan.fullPrice && (
                                        <p className="text-xs text-[#64748B] mb-6">Cobrança anual: R$ {plan.fullPrice}</p>
                                    )}

                                    {/* Features principais */}
                                    <div className="space-y-3 mb-6">
                                        {plan.features.map((f) => (
                                            <div key={f} className="flex items-start gap-3">
                                                <div
                                                    className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center"
                                                    style={{ background: "#10B98120" }}
                                                >
                                                    <Check className="w-3 h-3 text-[#10B981]" />
                                                </div>
                                                <span className="text-sm text-[#94A3B8] font-medium">{f}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Expandir detalhes */}
                                    <button
                                        onClick={() => setExpandedPlan(isExpanded ? null : plan.id)}
                                        className="flex items-center gap-2 text-xs font-bold w-full mb-6 transition-colors"
                                        style={{ color: isExpanded ? "#A5B4FC" : "#64748B" }}
                                    >
                                        <ChevronDown
                                            className="w-4 h-4 transition-transform duration-300"
                                            style={{ transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                                        />
                                        {isExpanded ? "Ocultar detalhes" : `Ver todos os ${plan.extraDetails.length} benefícios`}
                                    </button>

                                    {/* Detalhes extras (accordion) */}
                                    <div
                                        className="overflow-hidden transition-all duration-500"
                                        style={{ maxHeight: isExpanded ? `${plan.extraDetails.length * 40}px` : "0px" }}
                                    >
                                        <div
                                            className="rounded-2xl p-4 mb-6 space-y-2"
                                            style={{ background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.1)" }}
                                        >
                                            {plan.extraDetails.map((d) => (
                                                <div key={d} className="flex items-start gap-3">
                                                    <Star className="w-3.5 h-3.5 text-[#6366F1] mt-0.5 flex-shrink-0" />
                                                    <span className="text-xs text-[#94A3B8]">{d}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Botão CTA */}
                                    <Link href="/register">
                                        <button
                                            className="w-full h-12 rounded-2xl font-black text-sm transition-all duration-300 hover:scale-[1.02]"
                                            style={
                                                plan.highlight
                                                    ? {
                                                        background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                                        color: "#FFFFFF",
                                                        boxShadow: "0 8px 30px rgba(99,102,241,0.4)",
                                                    }
                                                    : {
                                                        background: "rgba(99,102,241,0.1)",
                                                        color: "#A5B4FC",
                                                        border: "1px solid rgba(99,102,241,0.2)",
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
                <div
                    className="max-w-2xl mx-auto rounded-2xl p-6 text-center mb-20"
                    style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.15)" }}
                >
                    <div className="text-3xl mb-3">🛡️</div>
                    <h3 className="text-lg font-bold text-white mb-2">7 Dias de Garantia Incondicional</h3>
                    <p className="text-sm text-[#64748B]">
                        Assine sem medo. Se por qualquer motivo você não estiver satisfeito nos primeiros 7 dias,
                        devolvemos 100% do seu dinheiro. Sem perguntas.
                    </p>
                </div>

                {/* FAQ */}
                <div className="max-w-2xl mx-auto">
                    <h2 className="text-3xl font-extrabold text-white text-center mb-10">
                        Dúvidas Frequentes
                    </h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="rounded-2xl overflow-hidden"
                                style={{
                                    background: "#0E1525",
                                    border: expandedFaq === i ? "1px solid rgba(99,102,241,0.3)" : "1px solid rgba(99,102,241,0.1)",
                                }}
                            >
                                <button
                                    className="w-full flex items-center justify-between px-6 py-5 text-left"
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                >
                                    <span className="font-bold text-white text-sm">{faq.q}</span>
                                    <ChevronDown
                                        className="w-5 h-5 text-[#6366F1] flex-shrink-0 transition-transform duration-300"
                                        style={{ transform: expandedFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </button>
                                <div
                                    className="overflow-hidden transition-all duration-300"
                                    style={{ maxHeight: expandedFaq === i ? "200px" : "0px" }}
                                >
                                    <p className="px-6 pb-5 text-sm text-[#64748B] leading-relaxed">{faq.a}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="text-center text-sm text-[#64748B] mt-12">
                    Pagamento seguro via Stripe/Pagar.me · Cancelamento fácil · Suporte em português
                </p>
            </div>
        </div>
    );
}
