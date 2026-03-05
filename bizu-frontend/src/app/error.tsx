"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Global error:", error);

        // Se for erro de carregamento de chunk (comum em deploys), recarrega a página automaticamente
        if (error.name === "ChunkLoadError" || error.message.includes("Failed to load chunk")) {
            console.warn("ChunkLoadError detectado! Recarregando a página...");
            window.location.reload();
        }
    }, [error]);

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="text-center max-w-md w-full">
                {/* Ícone de erro */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 rounded-[28px] bg-red-50 border border-red-100 flex items-center justify-center shadow-lg">
                        <AlertTriangle className="w-9 h-9 text-red-400" />
                    </div>
                </div>

                <h1 className="text-2xl font-black text-foreground mb-3">
                    Algo deu errado
                </h1>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-3">
                    Ocorreu um erro inesperado. Tente recarregar a página ou voltar ao início.
                </p>
                {error.digest && (
                    <p className="text-[11px] font-mono text-muted-foreground/50 bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 mb-8 mx-auto max-w-[280px] truncate">
                        ID: {error.digest}
                    </p>
                )}

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                        onClick={reset}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                    >
                        <RefreshCw size={16} />
                        Tentar Novamente
                    </button>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                    >
                        <Home size={16} />
                        Ir ao Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
