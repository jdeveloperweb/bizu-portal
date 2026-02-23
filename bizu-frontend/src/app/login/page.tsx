"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // TODO: integrar com API de autenticação
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-[#F8FAFF] flex items-center justify-center px-4">

            {/* Decoração fundo */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-[480px] h-[480px] rounded-full opacity-[0.06]"
                    style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
                <div className="absolute -bottom-32 -left-16 w-[400px] h-[400px] rounded-full opacity-[0.05]"
                    style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)" }} />
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <Link href="/" className="flex items-center justify-center gap-1.5 mb-8">
                    <span className="text-[30px] leading-none" style={{ fontFamily: "Bobaland, sans-serif" }}>
                        <span className="text-slate-900">Bizu</span>
                        <span className="text-[#6366F1]">!</span>
                    </span>
                </Link>

                {/* Card */}
                <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-100 border border-slate-100">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">
                            Bem-vindo de volta!
                        </h1>
                        <p className="text-sm text-slate-500">
                            Entre na sua conta para continuar estudando.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                E-mail
                            </label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="seu@email.com"
                                className="w-full h-11 px-4 rounded-xl text-sm text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 border border-slate-200 bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                            />
                        </div>

                        {/* Senha */}
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Senha
                                </label>
                                <Link
                                    href="/forgot-password"
                                    className="text-xs text-[#6366F1] hover:text-[#4F46E5] font-semibold transition-colors"
                                >
                                    Esqueceu a senha?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="••••••••"
                                    className="w-full h-11 px-4 pr-11 rounded-xl text-sm text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 border border-slate-200 bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full h-11 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <LogIn className="w-4 h-4" />
                                    Entrar
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="flex items-center gap-4 my-6">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400 font-medium">ou continue com</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    {/* Google */}
                    <button className="w-full h-11 rounded-xl font-semibold text-sm text-slate-700 border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar com Google
                    </button>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Ainda não tem conta?{" "}
                        <Link href="/register" className="text-[#6366F1] font-bold hover:text-[#4F46E5] transition-colors">
                            Criar conta grátis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
