import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function PricingPage() {
    const plans = [
        {
            name: "Plano Mensal",
            price: "49,90",
            interval: "mês",
            description: "Ideal para quem quer testar a plataforma e focar em um concurso específico.",
            features: [
                "Banco de 50k+ questões",
                "Simulados ilimitados",
                "Resoluções detalhadas",
                "Suporte via e-mail",
            ],
            buttonText: "Assinar Agora",
            highlight: false,
        },
        {
            name: "Plano Anual",
            price: "39,90",
            interval: "mês",
            description: "O melhor custo-benefício para quem tem foco a longo prazo na aprovação.",
            features: [
                "Tudo do Plano Mensal",
                "Acesso offline (PWA)",
                "Mentoria coletiva mensal",
                "Flashcards exclusivos",
                "Economia de R$ 120,00",
            ],
            buttonText: "Melhor Escolha",
            highlight: true,
        },
        {
            name: "Vitalício",
            price: "997,00",
            interval: "único",
            description: "Acesso para sempre. Ideal para quem está no início da jornada.",
            features: [
                "Tudo do Plano Anual",
                "Acesso vitalício",
                "Atualizações garantidas",
                "Kit de boas-vindas físico",
            ],
            buttonText: "Investir na Carreira",
            highlight: false,
        }
    ];

    return (
        <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-16">
                <PageHeader
                    title="Planos e Preços"
                    description="Escolha o plano que melhor se adapta ao seu ritmo de estudos e comece sua jornada para a aprovação."
                    badge="INVESTIMENTO"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {plans.map((plan) => (
                    <div
                        key={plan.name}
                        className={`relative p-8 rounded-[40px] border-2 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${plan.highlight
                                ? "border-primary bg-primary/5 scale-105 shadow-xl shadow-primary/10"
                                : "border-border bg-card"
                            }`}
                    >
                        {plan.highlight && (
                            <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-6 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                                Mais Popular
                            </div>
                        )}

                        <div className="mb-8">
                            <h3 className="text-2xl font-black mb-2">{plan.name}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                {plan.description}
                            </p>
                        </div>

                        <div className="mb-8 flex items-baseline gap-1">
                            <span className="text-4xl font-black">R$ {plan.price}</span>
                            <span className="text-muted-foreground font-medium">/{plan.interval}</span>
                        </div>

                        <div className="space-y-4 mb-10">
                            {plan.features.map((feature) => (
                                <div key={feature} className="flex items-start gap-3">
                                    <div className="mt-1 flex-shrink-0 w-5 h-5 rounded-full bg-success/20 flex items-center justify-center">
                                        <Check className="w-3 h-3 text-success" />
                                    </div>
                                    <span className="text-sm font-medium">{feature}</span>
                                </div>
                            ))}
                        </div>

                        <Button
                            className={`w-full rounded-2xl h-14 font-black text-lg transition-all ${plan.highlight
                                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                                    : "variant-outline"
                                }`}
                        >
                            {plan.buttonText}
                        </Button>
                    </div>
                ))}
            </div>

            <div className="mt-20 text-center text-muted-foreground">
                <p className="text-sm">Pagamento seguro via Stripe/Pagar.me. Cancelamento fácil a qualquer momento.</p>
            </div>
        </div>
    );
}
