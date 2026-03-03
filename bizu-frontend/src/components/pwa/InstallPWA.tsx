"use client";

import { useState, useEffect, useRef } from "react";
import { Download, X, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
    prompt(): Promise<void>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_COOLDOWN_DAYS = 7;
const SHOW_DELAY_MS = 4000;

function wasDismissedRecently(): boolean {
    try {
        const ts = localStorage.getItem(DISMISS_KEY);
        if (!ts) return false;
        return Date.now() - parseInt(ts, 10) < DISMISS_COOLDOWN_DAYS * 86400000;
    } catch {
        return false;
    }
}

type Platform = "android" | "ios" | "desktop" | "unknown";

function detectPlatform(): Platform {
    const ua = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(ua)) return "ios";
    if (/android/.test(ua)) return "android";
    if (window.matchMedia("(pointer: coarse)").matches) return "android"; // generic touch
    return "desktop";
}

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [platform, setPlatform] = useState<Platform>("unknown");
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        // Register Service Worker
        if ("serviceWorker" in navigator) {
            navigator.serviceWorker.register("/sw.js").catch(() => {});
        }

        const isStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;

        // Already running as installed PWA — never show
        if (isStandalone) return;

        if (wasDismissedRecently()) return;

        const detectedPlatform = detectPlatform();
        setPlatform(detectedPlatform);

        // Capture the native install prompt when Chrome/Edge fires it
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
        };
        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Show our custom banner after a delay regardless of whether
        // beforeinstallprompt fired — Chrome can suppress it for weeks
        timerRef.current = setTimeout(() => {
            setShowInstallPrompt(true);
        }, SHOW_DELAY_MS);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, []);

    const installApp = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowInstallPrompt(false);
            }
        }
        // For iOS / fallback: banner stays visible showing instructions
    };

    const dismissPrompt = () => {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* ignore */ }
        setShowInstallPrompt(false);
    };

    if (!showInstallPrompt) return null;

    const isIOS = platform === "ios";
    const isDesktop = platform === "desktop";
    const hasNativePrompt = !!deferredPrompt;

    return (
        <div className="fixed bottom-[calc(3.5rem+env(safe-area-inset-bottom)+12px)] left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-[360px] bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-[200] animate-in slide-in-from-bottom-5 duration-500">
            {/* Header */}
            <div className="flex items-start gap-3">
                <div className="h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg"
                    style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)" }}>
                    {isDesktop ? <Monitor className="h-6 w-6" /> : <Smartphone className="h-6 w-6" />}
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 leading-tight">
                        {isDesktop ? "Instale o AXON no PC!" : "Instale o App AXON!"}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        Acesso rápido e direto sem abrir o navegador.
                    </p>
                </div>
                <button
                    onClick={dismissPrompt}
                    className="text-slate-300 hover:text-slate-500 shrink-0 p-1 transition-colors"
                    aria-label="Fechar"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            {/* Action */}
            <div className="mt-4">
                {isIOS && !hasNativePrompt ? (
                    <div className="bg-indigo-50 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                        No Safari, toque em{" "}
                        <span className="font-bold text-indigo-600">Compartilhar</span>{" "}
                        e escolha{" "}
                        <span className="font-bold text-indigo-600">"Adicionar à Tela Inicial"</span>.
                    </div>
                ) : isDesktop && !hasNativePrompt ? (
                    <div className="bg-indigo-50 rounded-xl p-3 text-xs text-slate-700 leading-relaxed">
                        No Chrome, clique no ícone{" "}
                        <span className="font-bold text-indigo-600">⊕</span>{" "}
                        na barra de endereços ou em{" "}
                        <span className="font-bold text-indigo-600">Menu (⋮) → Instalar AXON</span>.
                    </div>
                ) : (
                    <Button
                        onClick={installApp}
                        className="w-full font-black text-[13px] h-11 rounded-xl text-white"
                        style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 4px 14px -2px rgba(99,102,241,0.5)" }}
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Instalar App
                    </Button>
                )}
            </div>
        </div>
    );
}
