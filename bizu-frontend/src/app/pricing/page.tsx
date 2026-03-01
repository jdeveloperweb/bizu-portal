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

            {/* Header — dark, alinhado com o tema */}
            <div className="relative pt-28 pb-16 text-center overflow-hidden" style={{ background: "#020617" }}>
                {/* Aurora sutil */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[120px] opacity-15"
                        style={{ background: "radial-gradient(circle,#6366F1 0%,transparent 70%)" }} />
                    <div className="absolute top-1/2 right-0 w-[300px] h-[300px] rounded-full blur-[100px] opacity-8"
                        style={{ background: "#8B5CF6" }} />
                </div>
                {/* Grid */}
                <div className="absolute inset-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(to right,rgba(99,102,241,0.04) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />

                <div className="relative z-10">
                    {/* Brand mark pequeno */}
                    <div className="flex items-center justify-center gap-2.5 mb-6">
                        <span className="text-sm font-black text-white/80" style={{ fontFamily: "var(--font-orbitron)", letterSpacing: "-0.01em" }}>AXON</span>
                        <div className="w-px h-4 rounded-full bg-white/15" />
                        <span className="text-[10px] font-bold tracking-[0.35em] uppercase text-white/30">Academy</span>
                    </div>

                    <div className="inline-flex items-center gap-2 mb-5 px-4 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest border"
                        style={{ background: "rgba(99,102,241,0.1)", borderColor: "rgba(99,102,241,0.25)", color: "#A5B4FC" }}>
                        Escolha seu plano
                    </div>

                    <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">
                        Planos & Preços
                    </h1>
                    <p className="text-base max-w-xl mx-auto mb-10 leading-relaxed" style={{ color: "#64748B" }}>
                        Escolha o plano ideal para o seu objetivo. Todos incluem{" "}
                        <strong style={{ color: "#94A3B8" }}>7 dias de garantia incondicional</strong>.
                    </p>

                    {/* Course Selection Tabs */}
                    {courses.length > 1 && (
                        <div className="flex flex-wrap items-center justify-center gap-3 max-w-4xl mx-auto px-6">
                            {courses.map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourseId(course.id)}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all duration-200"
                                    style={selectedCourseId === course.id ? {
                                        background: "rgba(99,102,241,0.15)",
                                        border: "1.5px solid rgba(99,102,241,0.5)",
                                        color: "#A5B4FC",
                                        boxShadow: "0 0 20px rgba(99,102,241,0.15)",
                                    } : {
                                        background: "rgba(255,255,255,0.04)",
                                        border: "1px solid rgba(255,255,255,0.08)",
                                        color: "#475569",
                                    }}
                                >
                                    <Anchor size={14} style={{ color: selectedCourseId === course.id ? (course.themeColor || '#818CF8') : '#475569' }} />
                                    {course.title}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
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
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-16">
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
                                    className={`relative rounded-3xl overflow-hidden transition-all duration-300 flex flex-col group ${plan.highlight
                                        ? "z-10 scale-105"
                                        : "hover:-translate-y-2"
                                        }`}
                                    style={plan.highlight ? {
                                        background: "#09101E",
                                        border: "1.5px solid rgba(99,102,241,0.4)",
                                        boxShadow: "0 24px 60px rgba(99,102,241,0.2), 0 0 0 1px rgba(99,102,241,0.1)",
                                    } : {
                                        background: "#F8FAFC",
                                        border: "1px solid #E2E8F0",
                                        boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
                                    }}
                                >
                                    {plan.badge && (
                                        <div
                                            className="py-2.5 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white flex items-center justify-center gap-2"
                                            style={plan.highlight
                                                ? { background: "linear-gradient(135deg,#6366F1,#4F46E5)" }
                                                : { background: "linear-gradient(135deg,#F59E0B,#D97706)" }}
                                        >
                                            ⭐ {plan.badge}
                                        </div>
                                    )}

                                    <div className={`p-8 ${plan.badge ? "pt-6" : ""} flex flex-col h-full`}>
                                        <div
                                            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
                                            style={{ background: colors.bg }}
                                        >
                                            <Icon size={28} style={{ color: colors.icon }} />
                                        </div>

                                        <h3 className={`text-xl font-black mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>{plan.name}</h3>
                                        <p className={`text-sm mb-6 leading-relaxed min-h-[48px] font-medium ${plan.highlight ? "text-slate-400" : "text-slate-500"}`}>
                                            {plan.description || "Acesso completo ao conteúdo do curso."}
                                        </p>

                                        <div className="flex items-baseline gap-1 mb-4">
                                            {plan.free ? (
                                                <span className={`text-5xl font-black tracking-tight ${plan.highlight ? "text-white" : "text-slate-900"}`}>Grátis</span>
                                            ) : (
                                                <>
                                                    <span className={`text-sm font-bold ${plan.highlight ? "text-slate-400" : "text-slate-400"}`}>R$</span>
                                                    <span className={`text-5xl font-black tracking-tight ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                                                        {plan.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                                                    </span>
                                                    <span className={`text-sm font-bold capitalize ml-1 ${plan.highlight ? "text-slate-400" : "text-slate-400"}`}>
                                                        {plan.billingInterval === 'MONTHLY' ? '/mês' :
                                                            plan.billingInterval === 'YEARLY' ? '/ano' :
                                                                ' (único)'}
                                                    </span>
                                                </>
                                            )}
                                        </div>

                                        <div className="space-y-3.5 my-7 flex-1">
                                            {features.length > 0 ? features.map((f: string) => (
                                                <div key={f} className="flex items-start gap-3">
                                                    <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                                        style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                                                        <Check size={11} className="text-emerald-500" />
                                                    </div>
                                                    <span className={`text-[14px] font-medium leading-snug ${plan.highlight ? "text-slate-300" : "text-slate-600"}`}>{f}</span>
                                                </div>
                                            )) : (
                                                <>
                                                    {["Acesso ilimitado ao curso", "Simulados e questões", "Arena de Duelos", "XP e Conquistas"].map((f) => (
                                                        <div key={f} className="flex items-start gap-3">
                                                            <div className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                                                                style={{ background: "rgba(16,185,129,0.12)", border: "1px solid rgba(16,185,129,0.2)" }}>
                                                                <Check size={11} className="text-emerald-500" />
                                                            </div>
                                                            <span className={`text-[14px] font-medium leading-snug ${plan.highlight ? "text-slate-300" : "text-slate-600"}`}>{f}</span>
                                                        </div>
                                                    ))}
                                                </>
                                            )}
                                        </div>

                                        <Link href={`/register?plan=${plan.id}&course=${selectedCourseId}`} className="block mt-auto w-full">
                                            <button
                                                className="w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                                                style={plan.highlight ? {
                                                    background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                                                    color: "#fff",
                                                    boxShadow: "0 8px 24px rgba(99,102,241,0.4)",
                                                } : {
                                                    background: "#0F172A",
                                                    color: "#fff",
                                                }}
                                            >
                                                {plan.free ? "Começar Agora" : "Assinar Agora"}
                                                <ChevronRight size={17} />
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
                    <div className="text-center mb-10">
                        <span className="text-indigo-600 text-xs font-bold uppercase tracking-[0.2em] mb-3 inline-block">FAQ</span>
                        <h2 className="text-3xl font-black text-slate-900">Dúvidas Frequentes</h2>
                    </div>
                    <div className="space-y-3">
                        {faqs.map((faq, i) => (
                            <div
                                key={i}
                                className="rounded-2xl overflow-hidden border transition-all duration-300"
                                style={expandedFaq === i ? {
                                    borderColor: "rgba(99,102,241,0.25)",
                                    background: "#F8FAFF",
                                    boxShadow: "0 4px 20px rgba(99,102,241,0.06)",
                                } : {
                                    borderColor: "#E2E8F0",
                                    background: "#fff",
                                }}
                            >
                                <button
                                    className="w-full flex items-center justify-between px-7 py-5 text-left"
                                    onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                                >
                                    <span className="font-bold text-slate-800 text-[15px] pr-4">{faq.q}</span>
                                    <ChevronDown
                                        size={18}
                                        className="shrink-0 transition-transform duration-300"
                                        style={{
                                            color: expandedFaq === i ? "#6366F1" : "#94A3B8",
                                            transform: expandedFaq === i ? "rotate(180deg)" : "rotate(0deg)",
                                        }}
                                    />
                                </button>
                                <div
                                    className="overflow-hidden transition-all duration-400 ease-in-out"
                                    style={{ maxHeight: expandedFaq === i ? "200px" : "0px" }}
                                >
                                    <p className="px-7 pb-6 text-[15px] text-slate-500 leading-relaxed font-medium">
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

