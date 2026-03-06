"use client";

import { useEffect } from "react";

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Critical Global error:", error);

        // Auto-reload on ChunkLoadError
        if (error.name === "ChunkLoadError" || error.message.includes("Failed to load chunk")) {
            console.warn("ChunkLoadError in layout! Reloading...");
            window.location.reload();
        }
    }, [error]);

    return (
        <html>
            <body>
                <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center">
                    <div className="max-w-md">
                        <h2 className="text-2xl font-black text-slate-900 mb-4">Algo deu muito errado</h2>
                        <p className="text-slate-600 mb-8">
                            Ocorreu um erro crítico na aplicação. Tentamos recarregar automaticamente, mas se o problema persistir, por favor limpe o cache do seu navegador.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-4 rounded-2xl bg-indigo-600 text-white font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200"
                        >
                            Recarregar Manualmente
                        </button>
                    </div>
                </div>
            </body>
        </html>
    );
}
