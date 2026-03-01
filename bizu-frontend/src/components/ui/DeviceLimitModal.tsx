"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";

interface DeviceLimitModalProps {
    maskedEmail: string;
    maskedPhone: string;
    fingerprint: string;
    os: string;
    browser: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function DeviceLimitModal({
    maskedEmail,
    maskedPhone,
    fingerprint,
    os,
    browser,
    onSuccess,
    onCancel
}: DeviceLimitModalProps) {
    const [step, setStep] = useState<"CHOICE" | "CODE">("CHOICE");
    const [type, setType] = useState<"EMAIL" | "WHATSAPP">("EMAIL");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSendCode = async (selectedType: "EMAIL" | "WHATSAPP") => {
        setType(selectedType);
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/devices/send-code", {
                method: "POST",
                body: JSON.stringify({ type: selectedType })
            });

            if (res.ok) {
                setStep("CODE");
            } else {
                const data = await res.text();
                setError(data || "Erro ao enviar código. Verifique se o canal escolhido está cadastrado.");
            }
        } catch (err) {
            setError("Falha na conexão com o servidor.");
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        if (code.length < 6) return;
        setLoading(true);
        setError(null);
        try {
            const res = await apiFetch("/devices/verify-and-register", {
                method: "POST",
                body: JSON.stringify({
                    code,
                    type,
                    fingerprint,
                    os,
                    browser
                })
            });

            if (res.ok) {
                onSuccess();
            } else {
                setError("Código inválido ou expirado.");
            }
        } catch (err) {
            setError("Falha na validação.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[#1a1c1e] border border-[#2d2f31] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                <div className="p-6">
                    <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mb-4 border border-amber-500/20">
                            <svg className="w-8 h-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Limite de Dispositivos</h2>
                        <p className="text-gray-400 text-sm">
                            Você já está conectado em outro dispositivo. Para entrar aqui, você precisa desconectar o outro aparelho enviando um código de segurança.
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-xs text-center">
                            {error}
                        </div>
                    )}

                    {step === "CHOICE" ? (
                        <div className="space-y-3">
                            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Onde deseja receber?</p>

                            {maskedWhatsAppAvailable(maskedPhone) && (
                                <button
                                    onClick={() => handleSendCode("WHATSAPP")}
                                    disabled={loading}
                                    className="w-full flex items-center justify-between p-4 bg-[#25282c] hover:bg-[#2d3136] border border-[#363a3f] rounded-xl transition-all group"
                                >
                                    <div className="flex items-center gap-3 text-left">
                                        <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="text-white font-medium text-sm">WhatsApp</p>
                                            <p className="text-gray-500 text-xs">{maskedPhone}</p>
                                        </div>
                                    </div>
                                    <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </button>
                            )}

                            <button
                                onClick={() => handleSendCode("EMAIL")}
                                disabled={loading}
                                className="w-full flex items-center justify-between p-4 bg-[#25282c] hover:bg-[#2d3136] border border-[#363a3f] rounded-xl transition-all group"
                            >
                                <div className="flex items-center gap-3 text-left">
                                    <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-white font-medium text-sm">E-mail</p>
                                        <p className="text-gray-500 text-xs">{maskedEmail}</p>
                                    </div>
                                </div>
                                <svg className="w-5 h-5 text-gray-600 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <div className="text-center">
                                <p className="text-gray-400 text-sm mb-4">
                                    Enviamos um código de 6 dígitos para o seu {type === "EMAIL" ? "e-mail" : "WhatsApp"}.
                                </p>
                                <input
                                    type="text"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                                    placeholder="000000"
                                    className="w-full text-center text-4xl tracking-[0.5em] font-mono p-4 bg-[#25282c] border-2 border-[#363a3f] focus:border-amber-500 outline-none rounded-xl text-white placeholder:text-gray-700 transition-colors"
                                    maxLength={6}
                                />
                            </div>

                            <button
                                onClick={handleVerify}
                                disabled={loading || code.length < 6}
                                className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-xl transition-all shadow-lg active:scale-95"
                            >
                                {loading ? "Validando..." : "Confirmar e Desconectar Outros"}
                            </button>

                            <button
                                onClick={() => setStep("CHOICE")}
                                disabled={loading}
                                className="w-full py-2 text-gray-500 hover:text-white text-sm transition-colors"
                            >
                                Reenviar código ou trocar canal
                            </button>
                        </div>
                    )}

                    <button
                        onClick={onCancel}
                        disabled={loading}
                        className="mt-6 w-full py-3 text-gray-500 hover:text-gray-300 text-sm font-medium border-t border-[#2d2f31] pt-6"
                    >
                        Cancelar login
                    </button>
                </div>
            </div>
        </div>
    );
}

function maskedWhatsAppAvailable(phone: string | null) {
    return phone && phone !== "..." && phone.length > 5;
}
