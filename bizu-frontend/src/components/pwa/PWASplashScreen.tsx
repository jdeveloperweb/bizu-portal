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
            || document.referrer.includes('android-app://');

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
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white dark:bg-slate-900 transition-opacity duration-500 overflow-hidden">
            <div className="flex flex-col items-center max-w-xs w-full px-6 text-center">
                {/* Logo com animação suave */}
                <div className="relative w-32 h-32 mb-10 animate-pulse-slow">
                    <Image
                        src="/icons/icon-512x512.png"
                        alt="Bizu! Logo"
                        fill
                        className="object-contain"
                        priority
                    />
                </div>

                {/* Nome do App */}
                <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">
                    Bizu! Portal
                </h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium text-sm mb-10">
                    Sua aprovação começa aqui
                </p>

                {/* Barra de Progresso customizada */}
                <div className="w-full space-y-4">
                    <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-600 rounded-full animate-loading-slide shadow-[0_0_12px_rgba(79,70,229,0.5)]" />
                    </div>
                    <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] animate-pulse">
                        Carregando recursos e fontes
                    </p>
                </div>
            </div>

            <style jsx>{`
                @keyframes loading-slide {
                    0% { transform: translateX(-100%) scaleX(0.5); }
                    50% { transform: translateX(0) scaleX(1); }
                    100% { transform: translateX(100%) scaleX(0.5); }
                }
                @keyframes pulse-slow {
                    0%, 100% { transform: scale(1); opacity: 1; }
                    50% { transform: scale(1.05); opacity: 0.9; }
                }
                .animate-loading-slide {
                    width: 100%;
                    animation: loading-slide 1.8s infinite ease-in-out;
                }
                .animate-pulse-slow {
                    animation: pulse-slow 3s infinite ease-in-out;
                }
            `}</style>
        </div>
    );
}
