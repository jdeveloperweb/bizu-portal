"use client";

import Link from "next/link";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="text-center max-w-md w-full">
                {/* Número 404 estilizado */}
                <div className="relative mb-8 select-none">
                    <span
                        className="text-[160px] font-black leading-none tracking-tighter"
                        style={{
                            background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 50%, #6366F1 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            opacity: 0.15,
                        }}
                    >
                        404
                    </span>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-[28px] bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-lg">
                            <Search className="w-9 h-9 text-indigo-400" />
                        </div>
                    </div>
                </div>

                <h1 className="text-2xl font-black text-foreground mb-3">
                    Página não encontrada
                </h1>
                <p className="text-muted-foreground font-medium text-sm leading-relaxed mb-10">
                    O endereço que você acessou não existe ou foi movido.
                    Verifique o link ou volte ao início.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-sm hover:bg-indigo-700 transition-all hover:scale-105 shadow-lg shadow-indigo-200"
                    >
                        <Home size={16} />
                        Ir ao Dashboard
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all"
                    >
                        <ArrowLeft size={16} />
                        Voltar
                    </button>
                </div>
            </div>
        </div>
    );
}
