"use client";

import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";

// Extend Window interface for the experimental beforeinstallprompt event
interface BeforeInstallPromptEvent extends Event {
    readonly platforms: string[];
    readonly userChoice: Promise<{
        outcome: "accepted" | "dismissed";
        platform: string;
    }>;
    prompt(): Promise<void>;
}

const DISMISS_KEY = "pwa-install-dismissed-at";
const DISMISS_COOLDOWN_DAYS = 7;

function wasDismissedRecently(): boolean {
    try {
        const ts = localStorage.getItem(DISMISS_KEY);
        if (!ts) return false;
        const diff = Date.now() - parseInt(ts, 10);
        return diff < DISMISS_COOLDOWN_DAYS * 24 * 60 * 60 * 1000;
    } catch {
        return false;
    }
}

export function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [showInstallPrompt, setShowInstallPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Register Service Worker
        if (typeof window !== "undefined" && "serviceWorker" in navigator) {
            window.addEventListener("load", function () {
                navigator.serviceWorker
                    .register("/sw.js")
                    .then(
                        function (registration) {
                            console.log("Service Worker registration successful with scope: ", registration.scope);
                        },
                        function (err) {
                            console.log("Service Worker registration failed: ", err);
                        }
                    );
            });
        }

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        // Detect if already installed/standalone
        const isStandaloneMode = window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true;
        setIsStandalone(isStandaloneMode);

        // Don't show if already installed or dismissed recently
        if (isStandaloneMode || wasDismissedRecently()) return;

        // Handle standard beforeinstallprompt (Android/Desktop Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            // Small delay so the page settles first
            setTimeout(() => setShowInstallPrompt(true), 2500);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // iOS: show manual instructions after a short delay
        if (isIosDevice && !isStandaloneMode) {
            setTimeout(() => setShowInstallPrompt(true), 3000);
        }

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const installApp = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowInstallPrompt(false);
            }
        }
    };

    const dismissPrompt = () => {
        try {
            localStorage.setItem(DISMISS_KEY, String(Date.now()));
        } catch { /* ignore */ }
        setShowInstallPrompt(false);
    };

    if (isStandalone || !showInstallPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-[360px] bg-white border border-slate-200 rounded-2xl p-4 shadow-2xl z-[200] animate-in slide-in-from-bottom-5 duration-500">
            <div className="flex items-start gap-3">
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-lg">
                    <Smartphone className="h-6 w-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-black text-slate-900 leading-tight">Instale o App AXON!</h4>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                        Acesso rápido, notificações e modo offline direto na sua tela inicial.
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

            <div className="mt-4">
                {isIOS && !deferredPrompt ? (
                    <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 leading-relaxed">
                        Toque em <span className="font-bold text-indigo-600">Compartilhar</span> na barra do Safari e escolha <span className="font-bold text-indigo-600">"Adicionar à Tela Inicial"</span>.
                    </div>
                ) : (
                    <Button
                        onClick={installApp}
                        className="w-full font-black text-[13px] h-11 rounded-xl"
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
