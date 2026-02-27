"use client";

import { useCourse } from "@/contexts/CourseContext";
import { useAuth } from "@/components/AuthProvider";
import { usePathname } from "next/navigation";
import Link from "next/link";

/**
 * Blocks access to protected content when entitlement is expired.
 * Shows a paywall overlay instead of the content.
 * Place this in the student layout to cover all student routes.
 */
export default function PaywallGate({ children }: { children: React.ReactNode }) {
    const { entitlementExpired, activeCourseId, loading } = useCourse();
    const { isFree } = useAuth();
    const pathname = usePathname();

    // Don't block public pages, admin pages, or settings
    const isExempt =
        !pathname ||
        pathname === "/" ||
        pathname === "/login" ||
        pathname === "/register" ||
        pathname.startsWith("/pricing") ||
        pathname.startsWith("/termos") ||
        pathname.startsWith("/privacidade") ||
        pathname.startsWith("/admin") ||
        pathname.startsWith("/configuracoes") ||
        pathname.startsWith("/perfil");

    if (isExempt || loading || !entitlementExpired || isFree) {
        return <>{children}</>;
    }

    return (
        <>
            {children}
            <div className="fixed inset-0 z-[90] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-6">
                <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl text-center">
                    <div className="mx-auto w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-slate-900">
                        Acesso expirado
                    </h2>
                    <p className="mt-3 text-slate-600 leading-relaxed">
                        Seu plano para este curso expirou. Renove sua assinatura para
                        continuar acessando todo o conteúdo, simulados e rankings.
                    </p>

                    <Link
                        href="/pricing"
                        className="mt-6 inline-block w-full h-12 rounded-xl bg-indigo-600 text-white font-semibold leading-[3rem] hover:bg-indigo-700 transition-colors"
                    >
                        Ver planos
                    </Link>

                    <p className="mt-3 text-xs text-slate-400">
                        Seu progresso está salvo e será restaurado ao renovar.
                    </p>
                </div>
            </div>
        </>
    );
}
