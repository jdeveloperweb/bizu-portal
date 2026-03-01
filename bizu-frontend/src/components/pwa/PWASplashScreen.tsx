"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import Image from "next/image";

/**
 * Componente que gerencia o Splash Screen, o carregamento de fontes
 * e a lógica de redirecionamento específica para PWA.
 */
export default function PWASplashScreen() {
    const [isVisible, setIsVisible] = useState(true);
    const pathname = usePathname();
    const router = useRouter();
    const { authenticated, loading: authLoading } = useAuth();
    const hasRedirected = useRef(false);

    // Efeito para Redirecionamento PWA
    useEffect(() => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches
            || (window.navigator as any).standalone
            || window.location.search.includes('source=pwa');

        if (isStandalone && pathname === "/" && !authLoading && !hasRedirected.current) {
            hasRedirected.current = true;
            // Redireciona para /login (que por sua vez redireciona para o dash se já logado)
            router.replace("/login");
        }
    }, [pathname, router, authenticated, authLoading]);

    // Efeito para Splash Screen e Fontes
    useEffect(() => {
        const waitForResources = async () => {
            try {
                // 1. Aguarda fontes
                if (document.fonts) {
                    await document.fonts.ready;
                }

                // 2. Aguarda Auth (no máximo 3 segundos extras)
                const startTime = Date.now();
                if (authLoading) {
                    let timeout = 0;
                    while (authLoading && timeout < 30) { // max 3s
                        await new Promise(r => setTimeout(r, 100));
                        timeout++;
                    }
                }

                // 3. Garante tempo mínimo de splash (1.5s total)
                const elapsed = Date.now() - startTime;
                if (elapsed < 1500) {
                    await new Promise(r => setTimeout(r, 1500 - elapsed));
                }
            } catch (e) {
                console.warn("Erro no splash screen", e);
            } finally {
                setIsVisible(false);
            }
        };

        waitForResources();
    }, [authLoading]);

    if (!isVisible) return null;

    return (
        <div
            className="fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden select-none"
            style={{ background: "#020617" }}
        >
            {/* ── Aurora orbs ── */}
            <div className="splash-orb splash-orb-1" />
            <div className="splash-orb splash-orb-2" />
            <div className="splash-orb splash-orb-3" />

            {/* ── Grid overlay ── */}
            <div className="absolute inset-0 pointer-events-none" style={{
                backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(to right,rgba(99,102,241,0.04) 1px,transparent 1px)",
                backgroundSize: "52px 52px",
            }} />

            {/* ── Content ── */}
            <div className="relative z-10 flex flex-col items-center gap-10">

                {/* Brand */}
                <div className="splash-brand flex flex-col items-center gap-3">
                    {/* Icon mark */}
                    <div
                        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
                        style={{
                            background: "linear-gradient(135deg,#6366F1,#4F46E5)",
                            boxShadow: "0 0 40px rgba(99,102,241,0.35), 0 8px 24px rgba(99,102,241,0.3)",
                        }}
                    >
                        {/* Graduation cap inline SVG to avoid extra import */}
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                            <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                        </svg>
                    </div>

                    {/* AXON wordmark */}
                    <span
                        className="text-[56px] sm:text-[68px] font-black leading-none tracking-tight"
                        style={{
                            fontFamily: "var(--font-orbitron), sans-serif",
                            backgroundImage: "linear-gradient(135deg,#C7D2FE 0%,#818CF8 40%,#6366F1 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter: "drop-shadow(0 0 28px rgba(99,102,241,0.3))",
                        }}
                    >
                        AXON
                    </span>

                    {/* Separator + Academy */}
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(255,255,255,0.15))" }} />
                        <span
                            className="text-[11px] font-bold tracking-[0.45em] uppercase"
                            style={{ color: "#334155" }}
                        >
                            Academy
                        </span>
                        <div className="w-8 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(255,255,255,0.15))" }} />
                    </div>
                </div>

                {/* Loading bar */}
                <div className="w-36 flex flex-col items-center gap-3">
                    <div className="w-full h-[2px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                        <div className="splash-bar h-full rounded-full" style={{ background: "linear-gradient(to right,#6366F1,#8B5CF6)" }} />
                    </div>
                    <span
                        className="text-[9px] font-bold uppercase tracking-[0.25em]"
                        style={{ color: "#1E293B" }}
                    >
                        Carregando...
                    </span>
                </div>
            </div>

            <style jsx>{`
                /* Aurora */
                .splash-orb {
                    position: absolute;
                    border-radius: 50%;
                    pointer-events: none;
                    filter: blur(90px);
                }
                .splash-orb-1 {
                    width: 480px; height: 420px;
                    top: -120px; left: 50%; transform: translateX(-40%);
                    background: radial-gradient(circle, #6366F1 0%, transparent 70%);
                    opacity: 0.18;
                    animation: sp-orb1 12s ease-in-out infinite;
                }
                .splash-orb-2 {
                    width: 320px; height: 280px;
                    bottom: -80px; right: -60px;
                    background: radial-gradient(circle, #8B5CF6 0%, transparent 70%);
                    opacity: 0.12;
                    animation: sp-orb2 16s ease-in-out infinite;
                }
                .splash-orb-3 {
                    width: 240px; height: 220px;
                    bottom: 20%; left: -40px;
                    background: radial-gradient(circle, #F59E0B 0%, transparent 70%);
                    opacity: 0.08;
                    animation: sp-orb3 14s ease-in-out infinite;
                }
                @keyframes sp-orb1 {
                    0%,100% { transform: translateX(-40%) scale(1); opacity: 0.18; }
                    50%     { transform: translateX(-35%) scale(1.1); opacity: 0.26; }
                }
                @keyframes sp-orb2 {
                    0%,100% { opacity: 0.12; transform: scale(1); }
                    50%     { opacity: 0.20; transform: scale(1.15); }
                }
                @keyframes sp-orb3 {
                    0%,100% { opacity: 0.08; }
                    50%     { opacity: 0.14; }
                }

                /* Brand entrance */
                .splash-brand {
                    animation: splash-in 0.7s cubic-bezier(0.16,1,0.3,1) both;
                }
                @keyframes splash-in {
                    from { opacity: 0; transform: translateY(20px); }
                    to   { opacity: 1; transform: translateY(0); }
                }

                /* Loading bar shimmer */
                .splash-bar {
                    width: 40%;
                    animation: splash-slide 1.6s ease-in-out infinite;
                }
                @keyframes splash-slide {
                    0%   { transform: translateX(-160%); width: 40%; }
                    50%  { width: 60%; }
                    100% { transform: translateX(280%); width: 40%; }
                }
            `}</style>
        </div>
    );
}
