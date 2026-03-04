"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { CheckCircle, Loader2, User, Mail, ArrowRight } from "lucide-react";
import Image from "next/image";

export default function GoogleConfirmPage() {
    const { authenticated, user, loading, isAdmin, refreshUserProfile } = useAuth();
    const router = useRouter();
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        if (!loading && !authenticated) {
            router.replace("/login");
        }
    }, [loading, authenticated, router]);

    const handleConfirm = async () => {
        setConfirming(true);
        try {
            await refreshUserProfile();
        } catch {
            // proceed anyway
        }
        if (isAdmin) {
            router.push("/admin");
        } else {
            router.push("/dashboard");
        }
    };

    const displayName =
        user?.name ||
        [user?.given_name, user?.family_name].filter(Boolean).join(" ") ||
        user?.preferred_username ||
        "Usuário";

    const displayEmail = user?.email || user?.preferred_username || "";
    const avatarUrl = user?.picture as string | undefined;

    if (loading) {
        return (
            <div className="h-[100dvh] flex items-center justify-center bg-[#020617]">
                <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
        );
    }

    if (!authenticated) return null;

    return (
        <div className="h-[100dvh] flex font-sans bg-[#F8FAFC] overflow-hidden relative">

            {/* ── Left: dark branded panel ── */}
            <div
                className="hidden lg:flex w-[42%] xl:w-[48%] relative overflow-hidden items-center justify-center p-8"
                style={{ background: "#020617" }}
            >
                {/* Aurora orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="lp-orb lp-orb-1" />
                    <div className="lp-orb lp-orb-2" />
                    <div className="lp-orb lp-orb-3" />
                </div>

                {/* Grid overlay */}
                <div
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{
                        backgroundImage:
                            "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(to right,rgba(99,102,241,0.04) 1px,transparent 1px)",
                        backgroundSize: "48px 48px",
                    }}
                />

                {/* Bottom vignette */}
                <div
                    className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none"
                    style={{ background: "linear-gradient(to top,#020617,transparent)" }}
                />

                {/* AXON background watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span
                        className="font-black text-white leading-none tracking-tight"
                        style={{
                            fontFamily: "var(--font-orbitron)",
                            fontSize: "clamp(160px,22vw,260px)",
                            opacity: 0.022,
                        }}
                    >
                        AXON
                    </span>
                </div>

                <div className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center text-center">
                    {/* AXON wordmark */}
                    <span
                        className="font-black leading-none tracking-tight select-none"
                        style={{
                            fontFamily: "var(--font-orbitron)",
                            fontSize: "clamp(60px,9vw,84px)",
                            backgroundImage:
                                "linear-gradient(135deg,#C7D2FE 0%,#818CF8 40%,#6366F1 100%)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                            filter: "drop-shadow(0 0 32px rgba(99,102,241,0.35))",
                        }}
                    >
                        AXON
                    </span>

                    <div className="flex items-center gap-3 mt-3 mb-10">
                        <div
                            className="w-10 h-px"
                            style={{
                                background:
                                    "linear-gradient(to right,transparent,rgba(255,255,255,0.12))",
                            }}
                        />
                        <span
                            className="text-[10px] font-bold tracking-[0.45em] uppercase"
                            style={{ color: "#334155" }}
                        >
                            Academy
                        </span>
                        <div
                            className="w-10 h-px"
                            style={{
                                background:
                                    "linear-gradient(to left,transparent,rgba(255,255,255,0.12))",
                            }}
                        />
                    </div>

                    <div
                        className="w-16 h-px mb-10"
                        style={{
                            background:
                                "linear-gradient(to right,transparent,rgba(99,102,241,0.5),transparent)",
                        }}
                    />

                    <h2 className="text-2xl xl:text-[1.75rem] font-black text-white leading-[1.12] tracking-tight mb-4">
                        Bem-vindo à{" "}
                        <span
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg,#818CF8 0%,#6366F1 45%,#A78BFA 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            arena.
                        </span>
                    </h2>

                    <p className="text-sm leading-relaxed font-medium" style={{ color: "#475569" }}>
                        Questões, duelos em tempo real, XP e correção de redações por IA.
                    </p>
                </div>
            </div>

            {/* ── Right: confirmation panel ── */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 sm:px-10 py-10 relative overflow-y-auto">

                {/* Google badge */}
                <div className="flex items-center gap-2 mb-8 px-3 py-1.5 rounded-full border border-green-200 bg-green-50">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    <span className="text-xs font-semibold text-green-700">Autenticado com Google</span>
                </div>

                <div className="w-full max-w-[360px]">
                    <h1 className="text-[1.75rem] font-black text-slate-900 leading-tight tracking-tight mb-1">
                        Confirme seus{" "}
                        <span
                            style={{
                                backgroundImage:
                                    "linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                            }}
                        >
                            dados
                        </span>
                    </h1>
                    <p className="text-sm text-slate-500 mb-8">
                        Estas são as informações recebidas pelo Google. Tudo certo? Só confirmar e entrar.
                    </p>

                    {/* Avatar */}
                    <div className="flex flex-col items-center mb-8">
                        {avatarUrl ? (
                            <div className="relative w-20 h-20 rounded-full overflow-hidden ring-4 ring-indigo-100 shadow-md mb-3">
                                <Image
                                    src={avatarUrl}
                                    alt={displayName}
                                    fill
                                    className="object-cover"
                                    referrerPolicy="no-referrer"
                                />
                            </div>
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center ring-4 ring-indigo-50 shadow-md mb-3">
                                <User className="w-9 h-9 text-indigo-400" />
                            </div>
                        )}
                    </div>

                    {/* Data fields — read-only */}
                    <div className="space-y-3 mb-8">
                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex items-center gap-3 shadow-sm">
                            <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                    Nome
                                </p>
                                <p className="text-sm font-semibold text-slate-800 truncate">{displayName}</p>
                            </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white px-4 py-3.5 flex items-center gap-3 shadow-sm">
                            <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                                    E-mail
                                </p>
                                <p className="text-sm font-semibold text-slate-800 truncate">{displayEmail}</p>
                            </div>
                        </div>
                    </div>

                    {/* Confirm button */}
                    <button
                        onClick={handleConfirm}
                        disabled={confirming}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-bold text-white transition-all duration-200 shadow-lg shadow-indigo-500/25 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                        style={{
                            background: confirming
                                ? "#818CF8"
                                : "linear-gradient(135deg,#6366F1 0%,#818CF8 100%)",
                        }}
                    >
                        {confirming ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            <>
                                Entrar no App
                                <ArrowRight className="w-4 h-4" />
                            </>
                        )}
                    </button>
                </div>

                {/* Footer */}
                <p className="absolute bottom-6 text-xs text-slate-400">
                    © Axon Academy — Excelência Acadêmica
                </p>
            </div>
        </div>
    );
}
