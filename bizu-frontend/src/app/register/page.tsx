"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft, Check, Star, CheckCircle2 } from "lucide-react";

const benefits = [
    "7 dias gratis sem cartao",
    "50k+ questoes comentadas",
    "Simulados com inteligencia artificial",
    "Arena de duelos em tempo real",
    "Cancele quando quiser",
];

export default function RegisterPage() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });

    const strength = (() => {
        const p = form.password;
        if (!p) return 0;
        let s = 0;
        if (p.length >= 8) s++;
        if (/[A-Z]/.test(p)) s++;
        if (/[0-9]/.test(p)) s++;
        if (/[^A-Za-z0-9]/.test(p)) s++;
        return s;
    })();

    const sColors = ["", "#DC2626", "#F59E0B", "#6366F1", "#059669"];
    const sLabels = ["", "Fraca", "Razoavel", "Boa", "Forte"];
    const mismatch = !!form.confirm && form.password !== form.confirm;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mismatch) return;
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">

            {/* ── Painel esquerdo: branding visual ── */}
            <div className="hidden lg:flex w-[48%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-3xl" style={{ fontFamily: "Bobaland, sans-serif" }}>
                            <span className="text-white">Bizu</span><span className="text-indigo-200">!</span>
                        </span>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-200 uppercase mt-1">Portal</span>
                    </Link>

                    <div>
                        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                            Comece sua jornada
                            <br />
                            <span className="text-indigo-200">de aprovacao</span>
                        </h2>
                        <p className="text-indigo-200/80 text-base mb-8 max-w-sm leading-relaxed">
                            Junte-se a mais de 10.000 concurseiros que ja transformaram sua preparacao.
                        </p>
                        <ul className="space-y-3">
                            {benefits.map((b) => (
                                <li key={b} className="flex items-center gap-3 text-sm text-indigo-100">
                                    <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                                    {b}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 max-w-sm">
                        <div className="flex gap-0.5 mb-3">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                        </div>
                        <p className="text-sm text-indigo-100 italic leading-relaxed mb-3">
                            "Os flashcards com repeticao espacada me fizeram memorizar em semanas o que eu nao conseguia em meses."
                        </p>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">DS</div>
                            <div>
                                <div className="text-xs font-bold text-white">Diego S.</div>
                                <div className="text-[11px] text-indigo-200">Aprovado TRF5 2023</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Painel direito: form ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#FAFBFF]">
                <div className="w-full max-w-[420px]">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors mb-8">
                        <ArrowLeft size={15} /> Voltar ao site
                    </Link>

                    <div className="lg:hidden flex items-center gap-1.5 mb-8">
                        <span className="text-3xl" style={{ fontFamily: "Bobaland, sans-serif" }}>
                            <span className="text-slate-900">Bizu</span><span className="text-indigo-500">!</span>
                        </span>
                    </div>

                    <div className="mb-7">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Crie sua conta</h1>
                        <p className="text-sm text-slate-500">7 dias gratis. Sem cartao de credito.</p>
                    </div>

                    {/* Google */}
                    <button className="w-full h-11 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 mb-6">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Cadastrar com Google
                    </button>

                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400 font-medium">ou com e-mail</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3.5">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Nome completo</label>
                            <input type="text" required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Seu nome" className="input-field" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">E-mail</label>
                            <input type="email" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="seu@email.com" className="input-field" />
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Senha</label>
                            <div className="relative">
                                <input type={show ? "text" : "password"} required value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Minimo 8 caracteres" className="input-field pr-11" />
                                <button type="button" onClick={() => setShow(!show)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                                style={{ background: i <= strength ? sColors[strength] : "#E2E8F0" }} />
                                        ))}
                                    </div>
                                    <p className="text-[11px] mt-1 font-semibold" style={{ color: sColors[strength] }}>{sLabels[strength]}</p>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Confirmar senha</label>
                            <input type={show ? "text" : "password"} required value={form.confirm}
                                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                placeholder="Repita a senha"
                                className={`input-field ${mismatch ? "!border-red-400 focus:!border-red-400 focus:!shadow-red-100" : ""}`}
                            />
                            {mismatch && <p className="text-xs text-red-500 mt-1 font-medium">As senhas nao coincidem</p>}
                        </div>

                        <button type="submit" disabled={loading || mismatch}
                            className="btn-primary w-full mt-1 disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><UserPlus size={16} />Criar conta gratis</>}
                        </button>

                        <p className="text-[11px] text-center text-slate-400 pt-1">
                            Ao criar conta voce concorda com os{" "}
                            <Link href="/termos" className="text-indigo-500 hover:underline">Termos</Link> e{" "}
                            <Link href="/privacidade" className="text-indigo-500 hover:underline">Privacidade</Link>.
                        </p>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-5">
                        Ja tem conta?{" "}
                        <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Entrar</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
