"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";
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

        // Handle standard beforeinstallprompt (Android/Desktop Chrome)
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e as BeforeInstallPromptEvent);
            setShowInstallPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        // Provide a delayed iOS prompt if not standalone
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
        setShowInstallPrompt(false);
    };

    if (isStandalone || !showInstallPrompt) {
        return null;
    }

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-xl z-[100] animate-in slide-in-from-bottom-5">
            <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                    <div className="h-12 w-12 bg-indigo-600 rounded-xl flex items-center justify-center text-white shrink-0 shadow-inner">
                        <Download className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0 pr-4">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">Instalar Bizu!</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                            Adicione à tela inicial para uma experiência rápida e offline.
                        </p>
                    </div>
                </div>
                <button
                    onClick={dismissPrompt}
                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0 p-1"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="mt-4">
                {isIOS && !deferredPrompt ? (
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 text-xs text-slate-600 dark:text-slate-300">
                        Para instalar: toque em <span className="font-bold">Compartilhar</span> na barra inferior do Safari e escolha <span className="font-bold">"Adicionar à Tela Principal"</span>.
                    </div>
                ) : (
                    <Button
                        onClick={installApp}
                        className="w-full bg-indigo-600 text-white hover:bg-indigo-700 font-medium"
                        size="sm"
                    >
                        Instalar App
                    </Button>
                )}
            </div>
        </div>
    );
}
