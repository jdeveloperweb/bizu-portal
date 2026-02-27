"use client";

import { Crown, Lock, ArrowRight } from "lucide-react";
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
        <div className="relative overflow-hidden rounded-[2.5rem] border-2 border-primary/20 bg-white p-10 md:p-16 text-center shadow-2xl">
            {/* Background Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px] -ml-32 -mb-32" />

            <div className="relative z-10 flex flex-col items-center max-w-lg mx-auto">
                <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-8 rotate-3 shadow-lg border border-primary/20">
                    <Crown className="w-12 h-12 text-primary fill-primary/20 animate-pulse" />
                </div>

                <div className="mb-4 flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full border border-primary/20">
                    <Lock className="w-4 h-4 text-primary" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Acesso Restrito</span>
                </div>

                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                    {title}
                </h2>

                <p className="text-slate-500 font-medium text-lg leading-relaxed mb-10">
                    {description}
                </p>

                <div className="w-full flex flex-col sm:flex-row gap-4">
                    <Link href={`/pricing${finalCourseId ? `?courseId=${finalCourseId}` : ''}`} className="flex-1">
                        <Button className="w-full h-16 rounded-[1.5rem] bg-primary hover:bg-primary/90 text-white font-black text-xl gap-3 shadow-[0_20px_40px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02] active:scale-[0.98]">
                            Quero Ser Premium
                            <ArrowRight className="w-6 h-6" />
                        </Button>
                    </Link>
                </div>

                <p className="mt-8 text-sm font-bold text-slate-400">
                    Liberação instantânea após o pagamento
                </p>
            </div>
        </div>
    );
}
