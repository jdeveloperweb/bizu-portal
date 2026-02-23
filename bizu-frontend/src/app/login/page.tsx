"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, Star, CheckCircle2 } from "lucide-react";

const perks = [
    "50.000+ questoes comentadas",
    "Simulados adaptativos com IA",
    "Arena PVP em tempo real",
    "Flashcards inteligentes",
];

export default function LoginPage() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        await new Promise((r) => setTimeout(r, 1500));
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex">

            {/* ── Painel esquerdo: branding ── */}
            <div className="hidden lg:flex w-[48%] relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700">
                {/* Decoracao */}
                <div className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`, backgroundSize: "32px 32px" }} />
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-violet-400/10 rounded-full blur-[80px]" />

                <div className="relative z-10 flex flex-col justify-between p-12 xl:p-16 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <span className="text-3xl" style={{ fontFamily: "Bobaland, sans-serif" }}>
                            <span className="text-white">Bizu</span>
                            <span className="text-indigo-200">!</span>
                        </span>
                        <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-200 uppercase mt-1">Portal</span>
                    </Link>

                    {/* Centro */}
                    <div>
                        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-tight mb-4">
                            A plataforma que
                            <br />
                            <span className="text-indigo-200">aprova de verdade</span>
                        </h2>
                        <p className="text-indigo-200/80 text-base mb-8 max-w-sm leading-relaxed">
                            Mais de 10.000 aprovados usaram o Bizu! para conquistar a vaga dos sonhos.
                        </p>
                        <ul className="space-y-3">
                            {perks.map((p) => (
                                <li key={p} className="flex items-center gap-3 text-sm text-indigo-100">
                                    <CheckCircle2 size={16} className="text-emerald-300 shrink-0" />
                                    {p}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Depoimento */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/10 max-w-sm">
                        <div className="flex gap-0.5 mb-3">
                            {[1, 2, 3, 4, 5].map(i => <Star key={i} size={13} className="fill-amber-400 text-amber-400" />)}
                        </div>
                        <p className="text-sm text-indigo-100 italic leading-relaxed mb-3">
                            "Aprovei para o TRF2 em 8 meses. A plataforma mudou completamente minha forma de estudar."
                        </p>
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-xs font-bold text-white">MC</div>
                            <div>
                                <div className="text-xs font-bold text-white">Marcos C.</div>
                                <div className="text-[11px] text-indigo-200">Aprovado TRF2 2024</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Painel direito: formulario ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAFBFF]">
                <div className="w-full max-w-[420px]">
                    {/* Voltar (mobile) */}
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors mb-8">
                        <ArrowLeft size={15} />
                        Voltar ao site
                    </Link>

                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-1.5 mb-8">
                        <span className="text-3xl" style={{ fontFamily: "Bobaland, sans-serif" }}>
                            <span className="text-slate-900">Bizu</span><span className="text-indigo-500">!</span>
                        </span>
                    </div>

                    <div className="mb-8">
                        <h1 className="text-2xl font-extrabold text-slate-900 mb-1">Bem-vindo de volta</h1>
                        <p className="text-sm text-slate-500">Entre na sua conta para continuar estudando</p>
                    </div>

                    {/* Google */}
                    <button className="w-full h-11 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-2.5 mb-6">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar com Google
                    </button>

                    {/* Divider */}
                    <div className="flex items-center gap-4 mb-6">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400 font-medium">ou com e-mail</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">E-mail</label>
                            <input
                                type="email"
                                required
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="seu@email.com"
                                className="input-field"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-xs font-semibold text-slate-500">Senha</label>
                                <Link href="/forgot-password" className="text-xs text-indigo-500 hover:text-indigo-700 font-semibold transition-colors">
                                    Esqueceu?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={show ? "text" : "password"}
                                    required
                                    value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Sua senha"
                                    className="input-field pr-11"
                                />
                                <button type="button" onClick={() => setShow(!show)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {show ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn size={16} /> Entrar</>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Novo por aqui?{" "}
                        <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">
                            Crie sua conta gratis
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
