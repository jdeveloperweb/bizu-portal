"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft, CheckCircle2, Rocket } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";

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
            {/* ── Left ── */}
            <div className="hidden lg:flex w-[50%] relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=1471&auto=format&fit=crop')`,
                        filter: 'brightness(0.6)',
                        transform: 'scale(1.02)',
                        animation: 'float-slow 25s ease-in-out infinite alternate',
                    }}
                />
                <div className="absolute inset-0 bg-indigo-950/70 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/90 via-indigo-900/40 to-transparent" />
                <div className="absolute inset-0 opacity-[0.1]" style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: "32px 32px",
                }} />

                <div className="relative z-10 flex flex-col justify-end p-14 xl:p-20 w-full h-full">
                    <div>
                        <div className="mb-10">
                            <BrandLogo size="hero" variant="light" link={false} />
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-extrabold text-white leading-[1.1] mb-5">
                            Sua aprovacao
                            <br />
                            <span className="text-indigo-200">comeca aqui.</span>
                        </h2>
                        <p className="text-indigo-200/80 text-sm max-w-sm leading-relaxed mb-8">
                            Junte-se a milhares de concurseiros que ja estao evoluindo com a plataforma mais completa do Brasil.
                        </p>

                        {/* Steps */}
                        <div className="space-y-4 mb-10">
                            {[
                                { step: "1", text: "Crie sua conta gratis" },
                                { step: "2", text: "Explore a plataforma por 7 dias" },
                                { step: "3", text: "Evolua e conquiste sua vaga" },
                            ].map((s) => (
                                <div key={s.step} className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-xs font-bold text-white border border-white/10">
                                        {s.step}
                                    </div>
                                    <span className="text-sm text-indigo-50">{s.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2.5">
                            {["JM", "LC", "BR", "FK"].map((init, i) => (
                                <div key={init} className="w-8 h-8 rounded-full border-2 border-indigo-900 flex items-center justify-center text-[9px] font-bold text-white"
                                    style={{ background: `hsl(${260 + i * 20}, 55%, ${50 + i * 5}%)`, zIndex: 4 - i }}>
                                    {init}
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">+247 novos esta semana</div>
                            <div className="text-[10px] text-indigo-200/60">Comunidade em crescimento</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-10 bg-[#FAFBFF]">
                <div className="w-full max-w-[400px]">
                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors mb-8">
                        <ArrowLeft size={14} /> Voltar
                    </Link>

                    <div className="lg:hidden mb-8">
                        <BrandLogo size="md" variant="gradient" />
                    </div>

                    <h1 className="text-[22px] font-extrabold text-slate-900 mb-1">Criar sua conta</h1>
                    <p className="text-sm text-slate-500 mb-6">7 dias gratis. Sem cartao.</p>

                    {/* Google */}
                    <button className="w-full h-11 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all flex items-center justify-center gap-2.5 mb-5">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Cadastrar com Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[11px] text-slate-400">ou</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nome</label>
                            <input type="text" required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Seu nome completo" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">E-mail</label>
                            <input type="email" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="voce@email.com" className="input-field" />
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Senha</label>
                            <div className="relative">
                                <input type={show ? "text" : "password"} required value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Minimo 8 caracteres" className="input-field pr-10" />
                                <button type="button" onClick={() => setShow(!show)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                                                style={{ background: i <= strength ? sColors[strength] : "#E2E8F0" }} />
                                        ))}
                                    </div>
                                    <p className="text-[10px] mt-1 font-semibold" style={{ color: sColors[strength] }}>{sLabels[strength]}</p>
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Confirmar senha</label>
                            <input type={show ? "text" : "password"} required value={form.confirm}
                                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                placeholder="Repita a senha"
                                className={`input-field ${mismatch ? "!border-red-400 focus:!border-red-400" : ""}`} />
                            {mismatch && <p className="text-[10px] text-red-500 mt-1 font-medium">Senhas nao coincidem</p>}
                        </div>

                        <button type="submit" disabled={loading || mismatch}
                            className="btn-primary w-full !h-11 !rounded-xl mt-1 disabled:opacity-60">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Rocket size={15} /> Criar conta gratis</>}
                        </button>

                        <p className="text-[10px] text-center text-slate-400 pt-1">
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
