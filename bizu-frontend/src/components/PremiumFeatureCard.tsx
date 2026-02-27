"use client";

import { Crown, Lock, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useAuth } from "./AuthProvider";

interface PremiumFeatureCardProps {
    courseId?: string;
    title?: string;
    description?: string;
}

export function PremiumFeatureCard({
    courseId,
    title = "Conteúdo Premium",
    description = "Este módulo é exclusivo para assinantes. Garanta seu acesso completo agora e acelere sua aprovação!"
}: PremiumFeatureCardProps) {
    const { selectedCourseId } = useAuth();
    const finalCourseId = courseId || selectedCourseId;

    return (
        <div className="relative overflow-hidden rounded-[3rem] border-2 border-slate-100 bg-white p-10 md:p-16 text-center shadow-[0_40px_80px_-15px_rgba(0,0,0,0.08)]">
            {/* Background Decorations - Premium Glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-100/50 rounded-full blur-[100px] -mr-48 -mt-48" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-100/50 rounded-full blur-[100px] -ml-48 -mb-48" />

            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                {/* Premium Icon Container */}
                <div className="relative mb-10 group">
                    <div className="absolute inset-0 bg-amber-400 rounded-[2.5rem] rotate-6 blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-[2.2rem] bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center relative z-10 shadow-[0_20px_40px_rgba(245,158,11,0.25)] border-4 border-white rotate-3 group-hover:rotate-6 transition-transform">
                        <Crown className="w-12 h-12 md:w-14 md:h-14 text-white fill-white/20 animate-pulse" />
                    </div>
                </div>

                {/* Restricted Badge */}
                <div className="mb-6 flex items-center gap-2 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-2 rounded-full border border-amber-200 shadow-sm">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] text-amber-700">Acesso Restrito</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                    {title}
                </h2>

                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-12">
                    {description}
                </p>

                {/* CTA Button */}
                <div className="w-full">
                    <Link href={`/pricing${finalCourseId ? `?courseId=${finalCourseId}` : ''}`} className="block">
                        <Button className="w-full h-16 md:h-20 rounded-[1.8rem] bg-slate-900 hover:bg-black text-white font-black text-xl md:text-2xl gap-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98] group relative overflow-hidden">
                            <span className="relative z-10">Quero Ser Premium</span>
                            <ArrowRight className="w-6 h-6 md:w-7 md:h-7 relative z-10 group-hover:translate-x-2 transition-transform" />
                        </Button>
                    </Link>
                </div>

                {/* Footer Info */}
                <div className="mt-10 flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-50/80 border border-slate-100 backdrop-blur-sm">
                    <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">
                        Liberação instantânea após o pagamento
                    </p>
                </div>
            </div>
        </div>
    );
}
