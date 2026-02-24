"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, UserPlus, ArrowLeft, CheckCircle2, Rocket } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function RegisterPage() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { notify } = useNotification();
    const router = useRouter();
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

        try {
            const success = await register(form.name, form.email, form.password);
            if (success) {
                notify("Conta Criada! 🚀", "Sua jornada rumo à aprovação começou. Faça login para acessar a plataforma.", "success");
                router.push("/login");
            } else {
                notify("Houve um problema", "Não conseguimos criar sua conta. Verifique se o e-mail já está em uso.", "error");
            }
        } catch (error) {
            notify("Indisponibilidade temporária", "Nosso serviço está passando por instabilidades. Tente novamente em instantes.", "error");
        } finally {
            setLoading(false);
        }
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

                <div className="relative z-10 flex flex-col justify-end p-10 xl:p-14 w-full h-full">
                    <div>
                        <div className="mb-8">
                            <BrandLogo size="xl" variant="light" link={false} />
                        </div>
                        <h2 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-6 tracking-tighter">
                            Sua aprovação
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-200 to-violet-200">começa aqui.</span>
                        </h2>
                        <p className="text-indigo-100/70 text-base xl:text-lg max-w-sm leading-relaxed mb-10">
                            Junte-se a milhares de concurseiros que já estão evoluindo com a plataforma mais completa do Brasil.
                        </p>

                        {/* Steps */}
                        <div className="space-y-6 mb-12">
                            {[
                                { step: "1", text: "Crie sua conta grátis" },
                                { step: "2", text: "Explore a plataforma por 7 dias" },
                                { step: "3", text: "Evolua e conquiste sua vaga" },
                            ].map((s) => (
                                <div key={s.step} className="flex items-center gap-4 group">
                                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-[15px] font-black text-white border border-white/20 shadow-xl backdrop-blur-md group-hover:scale-110 transition-transform">
                                        {s.step}
                                    </div>
                                    <span className="text-[17px] font-bold text-indigo-50 tracking-tight">{s.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
            </div>

            {/* ── Right ── */}
            <div className="flex-1 flex items-center justify-center px-8 lg:px-12 py-16 bg-[#FAFBFF]">
                <div className="w-full max-w-[460px]">
                    <Link href="/" className="inline-flex items-center gap-2 text-[15px] font-semibold text-slate-400 hover:text-indigo-600 transition-all mb-12 group">
                        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Voltar ao início
                    </Link>

                    <div className="lg:hidden mb-12">
                        <BrandLogo size="lg" variant="gradient" />
                    </div>

                    <div className="mb-10">
                        <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">Criar sua conta</h1>
                        <p className="text-lg text-slate-500 font-medium">Experimente grátis por 7 dias. Sem cartão.</p>
                    </div>

                    {/* Google */}
                    <button className="w-full h-14 rounded-2xl font-bold text-[15px] text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all flex items-center justify-center gap-3 mb-8 group">
                        <svg width="22" height="22" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Cadastrar com Google
                    </button>

                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-1 h-px bg-slate-200/60" />
                        <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">ou por e-mail</span>
                        <div className="flex-1 h-px bg-slate-200/60" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">Nome completo</label>
                            <input type="text" required value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="Como quer ser chamado?" className="input-field !h-14 !text-base bg-white border-slate-200 focus:border-indigo-500 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">E-mail</label>
                            <input type="email" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="seu@email.com" className="input-field !h-14 !text-base bg-white border-slate-200 focus:border-indigo-500 shadow-sm" />
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">Senha</label>
                            <div className="relative">
                                <input type={show ? "text" : "password"} required value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Crie uma senha forte" className="input-field !h-14 !text-base !pr-14 bg-white border-slate-200 focus:border-indigo-500 shadow-sm" />
                                <button type="button" onClick={() => setShow(!show)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {show ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-3 px-1">
                                    <div className="flex gap-1.5 mb-1.5">
                                        {[1, 2, 3, 4].map(i => (
                                            <div key={i} className="h-1.5 flex-1 rounded-full transition-all duration-300"
                                                style={{ background: i <= strength ? sColors[strength] : "#E2E8F0" }} />
                                        ))}
                                    </div>
                                    <p className="text-[11px] font-bold uppercase tracking-wider" style={{ color: sColors[strength] }}>{sLabels[strength]}</p>
                                </div>
                            )}
                        </div>
                        <div className="space-y-2">
                            <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">Confirmar senha</label>
                            <input type={show ? "text" : "password"} required value={form.confirm}
                                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                placeholder="Repita sua senha"
                                className={`input-field !h-14 !text-base bg-white border-slate-200 focus:border-indigo-500 shadow-sm ${mismatch ? "!border-red-400 focus:!border-red-400" : ""}`} />
                            {mismatch && <p className="text-xs text-red-500 mt-1 font-bold ml-1">As senhas não coincidem</p>}
                        </div>

                        <button type="submit" disabled={loading || mismatch}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-[0.98] mt-4">
                            {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <><Rocket size={20} /> Criar conta agora</>}
                        </button>

                        <p className="text-[12px] text-center text-slate-400 leading-relaxed pt-2">
                            Ao criar conta você concorda com os nossos{" "}
                            <Link href="/termos" className="text-indigo-600 font-bold hover:underline">Termos</Link> e{" "}
                            <Link href="/privacidade" className="text-indigo-600 font-bold hover:underline">Privacidade</Link>.
                        </p>
                    </form>

                    <div className="mt-12 pt-8 border-t border-slate-100 text-center">
                        <p className="text-[15px] text-slate-500 font-medium">
                            Já tem uma conta?{" "}
                            <Link href="/login" className="text-indigo-600 font-extrabold hover:text-indigo-800 transition-all hover:underline decoration-2 underline-offset-4">Entrar agora</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
