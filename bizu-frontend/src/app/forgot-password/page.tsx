"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { apiFetch } from "@/lib/api";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await apiFetch("/public/auth/forgot-password", {
                method: "POST",
                body: JSON.stringify({ email }),
            });

            if (!response.ok) {
                const data = await response.json().catch(() => ({ message: "Erro ao processar solicitação" }));
                throw new Error(data.message || "Erro ao processar solicitação");
            }

            setSubmitted(true);
        } catch (err: any) {
            console.error("Forgot password error:", err);
            setError(err.message || "Ocorreu um erro inesperado. Tente novamente mais tarde.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center mb-6">
                    <BrandLogo size="lg" variant="gradient" />
                </div>
                <h2 className="mt-2 text-center text-3xl font-extrabold text-slate-900">
                    Recuperar senha
                </h2>
                <p className="mt-2 text-center text-sm text-slate-600">
                    Enviaremos um link para resetar sua senha.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl shadow-slate-200/50 sm:rounded-2xl sm:px-10 border border-slate-100">
                    {!submitted ? (
                        <form className="space-y-6" onSubmit={handleSubmit}>
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-start text-red-600 text-sm animate-in fade-in slide-in-from-top-1 duration-300">
                                    <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div>
                                <label htmlFor="email" className="block text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">
                                    Endereço de E-mail
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                    </div>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full pl-10 px-3 py-3 border border-slate-200 rounded-xl shadow-sm placeholder-slate-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-slate-50 focus:bg-white transition-all"
                                        placeholder="seu@email.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all disabled:opacity-50"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Enviar link de recuperação"}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className="text-center py-4">
                            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
                                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 mb-2">E-mail enviado!</h3>
                            <p className="text-sm text-slate-600">
                                Se houver uma conta associada ao e-mail {email}, você receberá instruções em breve.
                            </p>
                            <button
                                onClick={() => setSubmitted(false)}
                                className="mt-6 text-sm font-bold text-indigo-600 hover:text-indigo-500"
                            >
                                Tentar outro e-mail
                            </button>
                        </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-50">
                        <Link
                            href="/login"
                            className="flex items-center justify-center text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors group"
                        >
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform" />
                            Voltar para o login
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
