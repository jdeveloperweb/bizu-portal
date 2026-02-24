"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useNotification } from "@/components/NotificationProvider";

export default function LoginPage() {
    const { login, loginDirect, authenticated, user } = useAuth();
    const { notify } = useNotification();
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    useEffect(() => {
        if (authenticated && user) {
            const roles = user?.realm_access?.roles || [];
            console.log("Roles detectadas:", roles);

            const isAdmin = roles.some((role: string) => role.toUpperCase() === "ADMIN");

            if (isAdmin) {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        }
    }, [authenticated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await loginDirect(form.email, form.password);
        if (!success) {
            notify("Acesso negado", "E-mail ou senha incorretos. Verifique suas credenciais e tente novamente.", "error");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex">

            {/* ── Left: visual branding ── */}
            <div className="hidden lg:flex w-[45%] xl:w-[50%] relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1470&auto=format&fit=crop')`,
                        filter: 'brightness(0.65) contrast(1.1)',
                        transform: 'scale(1.05)',
                        animation: 'float-slow 25s ease-in-out infinite alternate',
                    }}
                />
                <div className="absolute inset-0 bg-indigo-950/60 mix-blend-multiply" />
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-indigo-900/40 to-transparent" />

                {/* Decorative Pattern overlay */}
                <div className="absolute inset-0 opacity-[0.15]" style={{
                    backgroundImage: `radial-gradient(circle, white 1px, transparent 1px)`,
                    backgroundSize: "40px 40px",
                }} />

                <div className="relative z-10 flex flex-col justify-center p-12 xl:p-16 w-full h-full">
                    <div className="max-w-xl">
                        <div className="mb-8 animate-in fade-in slide-in-from-left duration-700">
                            <BrandLogo size="xl" variant="light" link={false} />
                        </div>

                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom duration-700 delay-200 fill-mode-both">
                            <h2 className="text-4xl xl:text-6xl font-black text-white leading-[1.1] tracking-tighter">
                                Estude com
                                <br />
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 to-purple-300">estratégia.</span>
                                <br />
                                Passe com certeza.
                            </h2>

                            <p className="text-indigo-100/70 text-base xl:text-lg max-w-md leading-relaxed">
                                A plataforma inteligente que já ajudou mais de <span className="text-white font-bold">10.000</span> concurseiros a conquistar a aprovação.
                            </p>

                            <div className="grid grid-cols-1 gap-4 py-8">
                                {[
                                    "Simulados adaptativos com IA",
                                    "Banco de questões atualizado",
                                    "Duelos em tempo real",
                                    "Analytics de desempenho",
                                ].map((p, i) => (
                                    <div key={p} className="flex items-center gap-4 text-indigo-50 group" style={{ animationDelay: `${400 + i * 100}ms` }}>
                                        <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 group-hover:bg-emerald-500/30 transition-all border border-emerald-500/20">
                                            <CheckCircle2 size={18} className="text-emerald-400" />
                                        </div>
                                        <span className="text-base xl:text-lg font-bold tracking-tight">{p}</span>
                                    </div>
                                ))}
                            </div>
                        </div>


                    </div>
                </div>
            </div>

            {/* ── Right: form ── */}
            <div className="flex-1 flex flex-col bg-white">
                <main className="flex-1 flex flex-col justify-center px-8 lg:px-12 xl:px-20 py-16">
                    <div className="w-full max-w-[460px] mx-auto">

                        <div className="mb-12">
                            <Link href="/" className="inline-flex items-center gap-2 text-[15px] font-semibold text-slate-400 hover:text-indigo-600 transition-all group">
                                <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                Voltar ao início
                            </Link>
                        </div>

                        <div className="lg:hidden mb-12">
                            <BrandLogo size="lg" variant="gradient" />
                        </div>

                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[12px] font-black uppercase tracking-wider mb-5">
                                <Sparkles size={14} />
                                Bem-vindo de volta
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight mb-3">Entrar na conta</h1>
                            <p className="text-lg text-slate-500 font-medium">Continue sua jornada rumo à aprovação.</p>
                        </div>

                        {/* Google Social Login */}
                        <button className="w-full h-14 rounded-2xl font-bold text-[15px] text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all flex items-center justify-center gap-3 mb-10 group">
                            <svg width="22" height="22" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar com Google
                        </button>

                        <div className="flex items-center gap-4 mb-10">
                            <div className="flex-1 h-px bg-slate-200/60" />
                            <span className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">ou use seu e-mail</span>
                            <div className="flex-1 h-px bg-slate-200/60" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-7">
                            <div className="space-y-2.5">
                                <label className="block text-[13px] font-bold text-slate-500 uppercase tracking-wider ml-1">Usuário ou e-mail</label>
                                <input type="text" required value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="ex: jaime.vicente@email.com" className="input-field !h-14 !text-base bg-white border-slate-200 focus:border-indigo-500 shadow-sm" />
                            </div>
                            <div className="space-y-2.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">Senha</label>
                                    <Link href="/forgot-password" title="Recuperar senha" className="text-xs text-indigo-600 font-bold hover:text-indigo-800 transition-colors uppercase tracking-wider">Esqueceu a senha?</Link>
                                </div>
                                <div className="relative">
                                    <input type={show ? "text" : "password"} required value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••" className="input-field !h-14 !text-base !pr-14 bg-white border-slate-200 focus:border-indigo-500 shadow-sm" />
                                    <button type="button" onClick={() => setShow(!show)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                                        {show ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white w-full h-14 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-[0.98] mt-4">
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin" />
                                ) : (
                                    <>
                                        Entrar na plataforma
                                        <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-12 pt-10 border-t border-slate-100 text-center">
                            <p className="text-[15px] text-slate-500 font-medium">
                                Novo por aqui?{" "}
                                <Link href="/register" className="text-indigo-600 font-extrabold hover:text-indigo-800 transition-all hover:underline decoration-2 underline-offset-4">
                                    Crie sua conta agora
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="py-10 px-12 border-t border-slate-50 text-center lg:text-left">
                    <p className="text-[12px] text-slate-400 font-bold uppercase tracking-wider">
                        &copy; {new Date().getFullYear()} Bizu! Academy. Todos os direitos reservados.
                    </p>
                </footer>
            </div>
        </div>
    );
}
