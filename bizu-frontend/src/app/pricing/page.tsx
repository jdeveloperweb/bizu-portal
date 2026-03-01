"use client";

import { useState, useEffect, Suspense } from "react";
import { Check, ChevronDown, Zap, Shield, Crown, Star, BookOpen, Anchor, Users, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";

function PricingContent() {
    const searchParams = useSearchParams();
    const [courses, setCourses] = useState<any[]>([]);
    const [plans, setPlans] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(searchParams.get('courseId'));
    const [isLoading, setIsLoading] = useState(true);
    const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                // Fetch public courses
                const coursesRes = await fetch(`${apiUrl}/public/courses`);
                if (coursesRes.ok) {
                    const coursesData = await coursesRes.json();
                    setCourses(coursesData);
                    if (coursesData.length > 0 && !selectedCourseId) {
                        setSelectedCourseId(coursesData[0].id);
                    }
                }

                // Fetch all active plans
                const plansRes = await fetch(`${apiUrl}/public/plans`);
                if (plansRes.ok) {
                    const plansData = await plansRes.json();
                    setPlans(plansData);
                }
            } catch (error) {
                console.error("Failed to fetch pricing data", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [apiUrl]);

    const filteredPlans = plans.filter(p => !selectedCourseId || (p.course && p.course.id === selectedCourseId));

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

    const getPlanIcon = (plan: any) => {
        if (plan.group) return Users;
        if (plan.billingInterval === 'YEARLY') return Crown;
        if (plan.billingInterval === 'ONE_TIME') return Shield;
        return Zap;
    };

    const getPlanColors = (plan: any) => {
        if (plan.highlight) return { bg: "#EEF2FF", icon: "#4F46E5", border: "border-indigo-400" };
        if (plan.group) return { bg: "#F0F9FF", icon: "#0284C7", border: "border-sky-400" };
        if (plan.billingInterval === 'YEARLY') return { bg: "#FDF4FF", icon: "#C026D3", border: "border-fuchsia-400" };
        return { bg: "#F8FAFF", icon: "#475569", border: "border-slate-300" };
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            {/* Header */}
            <div className="bg-[#F8FAFF] pt-28 pb-16 text-center border-b border-slate-100">
                <span className="inline-block text-xs font-bold uppercase tracking-[0.25em] text-[#6366F1] mb-4 pill-primary px-4 py-1.5 rounded-full">
                    Investimento
                </span>
                <h1 className="text-4xl font-extrabold text-slate-900 mb-4">
                    Planos & Preços
                </h1>
                <p className="text-slate-500 text-base max-w-xl mx-auto mb-10">
                    Escolha o plano ideal para o seu objetivo. Todos incluem{" "}
                    <strong className="text-slate-700">7 dias de garantia incondicional</strong>.
                </p>

                {/* Course Selection Tabs */}
                {courses.length > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto px-6">
                        {courses.map(course => (
                            <button
                                key={course.id}
                                onClick={() => setSelectedCourseId(course.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${selectedCourseId === course.id
                                    ? "bg-white border-2 border-primary text-primary shadow-lg"
                                    : "bg-white border border-slate-200 text-slate-500 hover:border-primary/50"
                                    }`}
                            >
                                <Anchor size={16} style={{ color: selectedCourseId === course.id ? course.themeColor : '#94a3b8' }} />
                                {course.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="container mx-auto px-6 py-16">
                {isLoading ? (
                    <div className="text-center py-20">
                        <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p className="text-slate-500 font-medium tracking-widest text-xs uppercase">Carregando planos...</p>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="text-center py-20 bg-slate-50 rounded-[40px] border border-dashed">
                        <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                        <h3 className="text-xl font-bold text-slate-700">Nenhum plano disponível</h3>
                        <p className="text-slate-500">Ainda não cadastramos planos para este curso. Volte em breve!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto mb-16">
                        {filteredPlans.map((plan) => {
                            const Icon = getPlanIcon(plan);
                            const colors = getPlanColors(plan);
                            const expanded = expandedPlanId === plan.id;
                            let features = [];
                            try {
                                features = plan.features ? JSON.parse(plan.features) : [];
                            } catch (e) {
                                console.error("Error parsing features for plan:", plan.id, e);
                            }

                            return (
                                <div
                                    key={plan.id}
                                    className={`relative rounded-[32px] overflow-hidden transition-all duration-300 flex flex-col group ${plan.highlight
                                        ? `shadow-2xl shadow-indigo-500/20 ring-4 ring-indigo-500 scale-105 z-10 bg-white`
                                        : `border-2 border-slate-100 bg-slate-50 hover:bg-white hover:border-slate-300 hover:shadow-xl hover:-translate-y-2 opacity-95 hover:opacity-100`
                                        }`}
                                >
                                    {plan.badge && (
                                        <div
                                            className="py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-sm flex items-center justify-center gap-2"
                                            style={plan.highlight ? { background: "linear-gradient(135deg, #F59E0B, #D97706)" } : { background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                                        >
                                            ⭐ {plan.badge}
                                        </div>
                                    )}

                                    <div className={`p-8 ${plan.badge ? "pt-6" : ""} flex flex-col h-full`}>
                                        <div
                                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform"
                                            style={{ background: colors.bg }}
                                        >
                                            <Icon size={32} style={{ color: colors.icon }} />
                                        </div>

                                        <h3 className="text-xl font-black text-slate-900 mb-1">{plan.name}</h3>
                                        <p className="text-sm text-slate-500 mb-6 leading-relaxed min-h-[48px] font-medium">
                                            {plan.description || "Acesso completo ao conteúdo do curso."}
                                        </p>

                                        <div className="flex items-baseline gap-1 mb-4">
                                            {plan.free ? (
                                                <span className="text-5xl font-black text-slate-900 tracking-tight">Grátis</span>
                                            ) : (
                                                <>
                                                    <span className="text-sm text-slate-400 font-bold">R$</span>
                                                    <span className="text-5xl font-black text-slate-900 tracking-tight">
                                                        {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className="text-sm text-slate-400 font-bold capitalize ml-1">
                                                        {plan.billingInterval === 'MONTHLY' ? '/mês' :
                                                            plan.billingInterval === 'YEARLY' ? '/ano' :
                                                                ' (único)'}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="space-y-4 my-8 flex-1">
                                            {features.length > 0 ? features.map((f: string) => (
                                                <div key={f} className="flex items-start gap-3">
                                                    <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                                        <Check size={12} className="text-emerald-500" />
                                                    </div>
                                                    <span className="text-[15px] text-slate-600 font-medium leading-tight">{f}</span>
                                                </div>
                                            )) : (
                                                <>
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                                            <Check size={12} className="text-emerald-500" />
                                                        </div>
                                                        <span className="text-[15px] text-slate-600 font-medium leading-tight">Acesso ilimitado ao curso</span>
                                                    </div>
                                                    <div className="flex items-start gap-3">
                                                        <div className="mt-1 w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 border border-emerald-100">
                                                            <Check size={12} className="text-emerald-500" />
                                                        </div>
                                                        <span className="text-[15px] text-slate-600 font-medium leading-tight">Simulados e questões</span>
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        <Link href={`/register?plan=${plan.id}&course=${selectedCourseId}`} className="block mt-auto w-full">
                                            <button
                                                className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 ${plan.highlight
                                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 shadow-xl shadow-indigo-200"
                                                    : "bg-slate-100 text-slate-700 hover:bg-slate-900 hover:text-white hover:shadow-lg"
                                                    }`}
                                            >
                                                {plan.free ? "Começar Agora" : "Assinar Agora"}
                                                <ChevronRight size={18} />
                                            </button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* FAQ */}
                <div className="max-w-3xl mx-auto mt-20">
                    <h2 className="text-3xl font-black text-slate-900 text-center mb-10">Dúvidas Frequentes</h2>
                    <div className="space-y-4">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className={`rounded-3xl overflow-hidden border transition-all duration-300 ${expandedFaq === i ? "border-[#C7D2FE] bg-[#F8FAFF] shadow-lg shadow-indigo-500/5" : "border-slate-100 bg-white"
                                    }`}
                            >
                                <button
                                    className="w-full flex items-center justify-between px-8 py-6 text-left"
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                >
                                    <span className="font-bold text-slate-800 text-base">{faq.q}</span>
                                    <ChevronDown
                                        size={20}
                                        className="text-[#6366F1] shrink-0 transition-transform duration-500"
                                        style={{ transform: expandedFaq === i ? "rotate(180deg)" : "rotate(0deg)" }}
                                    />
                                </button>
                                <div
                                    className="overflow-hidden transition-all duration-500 ease-in-out"
                                    style={{ maxHeight: expandedFaq === i ? "160px" : "0px" }}
                                >
                                    <p className="px-8 pb-8 text-base text-slate-500 leading-relaxed font-medium">
                                        {faq.a}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function PricingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white">
                <Navbar />
                <div className="container mx-auto px-6 py-16 text-center">
                    <div className="animate-spin w-10 h-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-500 font-medium tracking-widest text-xs uppercase">Carregando...</p>
                </div>
            </div>
        }>
            <PricingContent />
        </Suspense>
    );
}

