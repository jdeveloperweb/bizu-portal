"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, Check } from "lucide-react";

const benefits = [
    "7 dias grátis sem cartão",
    "50k+ questões comentadas",
    "Simulados ilimitados com IA",
    "Cancele quando quiser",
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

    const passwordStrength = () => {
        const p = form.password;
        if (!p) return 0;
        let score = 0;
        if (p.length >= 8) score++;
        if (/[A-Z]/.test(p)) score++;
        if (/[0-9]/.test(p)) score++;
        if (/[^A-Za-z0-9]/.test(p)) score++;
        return score;
    };

    const strengthColors = ["", "#EF4444", "#F59E0B", "#6366F1", "#10B981"];
    const strengthLabels = ["", "Fraca", "Razoável", "Boa", "Forte"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (form.password !== form.confirmPassword) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
    };

    const strength = passwordStrength();

    return (
        <div className="min-h-screen bg-[#080B14] flex relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 animate-float"
                    style={{ background: "radial-gradient(circle, #6366F1 0%, transparent 70%)" }}
                />
                <div
                    className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-15"
                    style={{ background: "radial-gradient(circle, #F59E0B 0%, transparent 70%)" }}
                />
                <div
                    className="absolute inset-0 opacity-[0.025]"
                    style={{
                        backgroundImage: `linear-gradient(rgba(99,102,241,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(99,102,241,1) 1px, transparent 1px)`,
                        backgroundSize: "80px 80px",
                    }}
                />
            </div>

            {/* Left - Branding (desktop) */}
            <div className="hidden lg:flex flex-col justify-center items-start w-1/2 px-20 relative z-10">
                <Link href="/" className="mb-12">
                    <span
                        className="text-5xl leading-none"
                        style={{ fontFamily: "Bobaland, sans-serif" }}
                    >
                        <span className="text-white">Bizu</span>
                        <span style={{ color: "#6366F1", textShadow: "0 0 30px rgba(99,102,241,0.8)" }}>!</span>
                    </span>
                </Link>

                <h2 className="text-4xl font-extrabold text-white mb-4 leading-tight">
                    Comece sua jornada
                    <br />
                    <span
                        style={{
                            background: "linear-gradient(135deg, #6366F1, #A78BFA)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                            backgroundClip: "text",
                        }}
                    >
                        rumo à aprovação
                    </span>
                </h2>
                <p className="text-[#64748B] mb-10 leading-relaxed max-w-sm">
                    Junte-se a mais de 10.000 concurseiros que já transformaram sua preparação com o Bizu! Portal.
                </p>

                <div className="space-y-4">
                    {benefits.map((b) => (
                        <div key={b} className="flex items-center gap-3">
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(16,185,129,0.15)" }}
                            >
                                <Check className="w-3.5 h-3.5 text-[#10B981]" />
                            </div>
                            <span className="text-sm text-[#94A3B8] font-medium">{b}</span>
                        </div>
                    ))}
                </div>

                {/* Testemunho */}
                <div
                    className="mt-14 p-5 rounded-2xl max-w-sm"
                    style={{
                        background: "rgba(14,21,37,0.8)",
                        border: "1px solid rgba(99,102,241,0.15)",
                    }}
                >
                    <p className="text-sm text-[#94A3B8] italic leading-relaxed mb-4">
                        "Aprovei para TRF2 usando o Bizu! Portal por 8 meses. Os simulados adaptativos fizeram toda a diferença!"
                    </p>
                    <div className="flex items-center gap-3">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                            style={{ background: "linear-gradient(135deg, #6366F1, #A78BFA)" }}
                        >
                            MC
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">Marcos C.</div>
                            <div className="text-xs text-[#64748B]">Aprovado • TRF2 2024</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right - Form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center px-4 py-12 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <Link href="/" className="flex items-center justify-center gap-2 mb-8 lg:hidden">
                        <span
                            className="text-4xl"
                            style={{ fontFamily: "Bobaland, sans-serif" }}
                        >
                            <span className="text-white">Bizu</span>
                            <span style={{ color: "#6366F1" }}>!</span>
                        </span>
                    </Link>

                    <div
                        className="rounded-3xl p-8"
                        style={{
                            background: "#0E1525",
                            border: "1px solid rgba(99,102,241,0.2)",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
                        }}
                    >
                        <div className="mb-8">
                            <h1 className="text-2xl font-extrabold text-white mb-1">Criar sua conta</h1>
                            <p className="text-sm text-[#64748B]">7 dias grátis. Sem cartão de crédito.</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* Nome */}
                            <div>
                                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                                    Nome completo
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Seu nome"
                                    className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder-[#334155] outline-none transition-all"
                                    style={{
                                        background: "rgba(30,40,69,0.8)",
                                        border: "1px solid rgba(99,102,241,0.15)",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.15)")}
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                                    E-mail
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="seu@email.com"
                                    className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder-[#334155] outline-none transition-all"
                                    style={{
                                        background: "rgba(30,40,69,0.8)",
                                        border: "1px solid rgba(99,102,241,0.15)",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                                    onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.15)")}
                                />
                            </div>

                            {/* Senha */}
                            <div>
                                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                                    Senha
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        required
                                        value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Mínimo 8 caracteres"
                                        className="w-full h-12 px-4 pr-12 rounded-xl text-sm text-white placeholder-[#334155] outline-none transition-all"
                                        style={{
                                            background: "rgba(30,40,69,0.8)",
                                            border: "1px solid rgba(99,102,241,0.15)",
                                        }}
                                        onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                                        onBlur={(e) => (e.target.style.borderColor = "rgba(99,102,241,0.15)")}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#334155] hover:text-[#94A3B8] transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {/* Força da senha */}
                                {form.password && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div
                                                    key={i}
                                                    className="h-1 flex-1 rounded-full transition-all duration-300"
                                                    style={{
                                                        background: i <= strength ? strengthColors[strength] : "rgba(99,102,241,0.1)",
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs" style={{ color: strengthColors[strength] }}>
                                            Força: {strengthLabels[strength]}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirmar Senha */}
                            <div>
                                <label className="block text-xs font-bold text-[#94A3B8] uppercase tracking-wider mb-2">
                                    Confirmar senha
                                </label>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={form.confirmPassword}
                                    onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                    placeholder="Repita a senha"
                                    className="w-full h-12 px-4 rounded-xl text-sm text-white placeholder-[#334155] outline-none transition-all"
                                    style={{
                                        background: "rgba(30,40,69,0.8)",
                                        border:
                                            form.confirmPassword && form.password !== form.confirmPassword
                                                ? "1px solid #EF4444"
                                                : "1px solid rgba(99,102,241,0.15)",
                                    }}
                                    onFocus={(e) => (e.target.style.borderColor = "#6366F1")}
                                    onBlur={(e) =>
                                    (e.target.style.borderColor =
                                        form.password !== form.confirmPassword ? "#EF4444" : "rgba(99,102,241,0.15)")
                                    }
                                />
                                {form.confirmPassword && form.password !== form.confirmPassword && (
                                    <p className="text-xs text-[#EF4444] mt-1">As senhas não coincidem</p>
                                )}
                            </div>

                            {/* Botão */}
                            <button
                                type="submit"
                                disabled={loading || (!!form.confirmPassword && form.password !== form.confirmPassword)}
                                className="w-full h-12 rounded-xl font-bold text-white transition-all duration-300 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                                style={{
                                    background: "linear-gradient(135deg, #6366F1, #4F46E5)",
                                    boxShadow: "0 8px 30px rgba(99,102,241,0.4)",
                                }}
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <UserPlus className="w-4 h-4" />
                                        Criar Conta Grátis
                                    </>
                                )}
                            </button>

                            <p className="text-xs text-center text-[#334155]">
                                Ao criar conta você concorda com os{" "}
                                <Link href="/termos" className="text-[#6366F1] hover:underline">Termos de Uso</Link>
                                {" "}e{" "}
                                <Link href="/privacidade" className="text-[#6366F1] hover:underline">Política de Privacidade</Link>.
                            </p>
                        </form>

                        <p className="text-center text-sm text-[#64748B] mt-6">
                            Já tem conta?{" "}
                            <Link href="/login" className="text-[#6366F1] font-bold hover:text-[#A5B4FC] transition-colors">
                                Entrar
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
