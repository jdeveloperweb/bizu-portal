"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, Check } from "lucide-react";

const benefits = [
    "7 dias grátis sem cartão de crédito",
    "50 mil questões comentadas de todas as bancas",
    "Simulados adaptativos com inteligência artificial",
    "Cancele quando quiser, sem multa",
];

export default function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const passwordStrength = (): number => {
        const p = form.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };

    const strengthColors = ["", "#DC2626", "#F59E0B", "#6366F1", "#059669"];
    const strengthLabels = ["", "Fraca", "Razoável", "Boa", "Forte"];
    const strength = passwordStrength();
    const passwordMismatch = !!form.confirmPassword && form.password !== form.confirmPassword;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordMismatch) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
    };

    const inputClass =
        "w-full h-11 px-4 rounded-xl text-sm text-slate-900 placeholder-slate-300 outline-none transition-all duration-200 border border-slate-200 bg-white focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20";

    return (
        <div className="min-h-screen bg-[#F8FAFF] flex">
            {/* Decoração */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden">
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.05]"
                    style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }} />
                <div className="absolute -bottom-20 left-0 w-[400px] h-[400px] rounded-full opacity-[0.04]"
                    style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)" }} />
            </div>

            {/* Left branding (desktop) */}
            <div className="hidden lg:flex flex-col justify-center w-[42%] px-14 xl:px-20 bg-white border-r border-slate-100 relative z-10">
                <Link href="/" className="mb-10">
                    <span className="text-4xl" style={{ fontFamily: "Bobaland, sans-serif" }}>
                        <span className="text-slate-900">Bizu</span>
                        <span className="text-[#6366F1]">!</span>
                    </span>
                </Link>

                <h2 className="text-3xl font-extrabold text-slate-900 mb-3 leading-snug">
                    Comece sua jornada
                    <br />
                    <span className="gradient-text">rumo a aprovacao</span>
                </h2>
                <p className="text-slate-500 text-sm mb-8 leading-relaxed max-w-xs">
                    Mais de 10.000 concurseiros ja transformaram sua preparacao com o Bizu! Portal.
                </p>

                <ul className="space-y-3 mb-10">
                    {benefits.map((b) => (
                        <li key={b} className="flex items-start gap-3 text-sm text-slate-600">
                            <span className="mt-0.5 w-5 h-5 rounded-full bg-[#EEF2FF] flex items-center justify-center shrink-0">
                                <Check className="w-3 h-3 text-[#6366F1]" />
                            </span>
                            {b}
                        </li>
                    ))}
                </ul>

                {/* Testemunho */}
                <div className="rounded-2xl bg-[#F8FAFF] border border-slate-100 p-5 max-w-xs">
                    <p className="text-sm text-slate-600 italic leading-relaxed mb-4">
                        "Aprovei para TRF2 em 8 meses. Os simulados adaptativos fizeram toda a diferenca!"
                    </p>
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full text-xs font-bold text-white flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}>
                            MC
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-800">Marcos C.</div>
                            <div className="text-[11px] text-slate-400">Aprovado · TRF2 2024</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right form */}
            <div className="flex-1 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <Link href="/" className="flex items-center justify-center mb-8 lg:hidden">
                        <span className="text-[30px]" style={{ fontFamily: "Bobaland, sans-serif" }}>
                            <span className="text-slate-900">Bizu</span>
                            <span className="text-[#6366F1]">!</span>
                        </span>
                    </Link>

                    <div className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-100 border border-slate-100">
                        <div className="mb-7">
                            <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Criar sua conta</h1>
                            <p className="text-sm text-slate-500">7 dias gratis. Sem cartao de credito.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Seu nome"
                                    className={inputClass}
                                />
                            </div>

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
                                    className={inputClass}
                                />
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Minimo 8 caracteres"
                                        className={`${inputClass} pr-11`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                                    </button>
                                </div>
                                {/* Indicador de força */}
                                {form.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                                    style={{ background: i <= strength ? strengthColors[strength] : "#E2E8F0" }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs font-semibold" style={{ color: strengthColors[strength] }}>
                                            Forca: {strengthLabels[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirmar Senha */}
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Confirmar senha
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    placeholder="Repita a senha"
                                    className={`${inputClass} ${passwordMismatch ? "border-red-400 focus:border-red-400 focus:ring-red-100" : ""}`}
                                />
                                {passwordMismatch && (
                                    <p className="text-xs text-red-500 mt-1 font-medium">As senhas nao coincidem</p>
                                )}
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || passwordMismatch}
                                className="w-full h-11 rounded-xl font-bold text-white transition-all duration-200 hover:scale-[1.02] hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-1"
                                style={{ background: "linear-gradient(135deg, #6366F1, #4F46E5)" }}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Criar Conta Gratis
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-slate-400">
                                Ao criar conta voce concorda com os{" "}
                                <Link href="/termos" className="text-[#6366F1] hover:underline">Termos de Uso</Link>{" "}
                                e{" "}
                                <Link href="/privacidade" className="text-[#6366F1] hover:underline">Politica de Privacidade</Link>.
                            </p>
                        </form>

                        <p className="text-center text-sm text-slate-500 mt-5">
                            Ja tem conta?{" "}
                            <Link href="/login" className="text-[#6366F1] font-bold hover:text-[#4F46E5] transition-colors">
                                Entrar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
