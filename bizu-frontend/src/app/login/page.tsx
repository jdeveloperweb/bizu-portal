"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, CheckCircle2, GraduationCap, Sparkles, BookOpen, Trophy, Target } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

const getRealmRoles = (user: unknown): string[] => {
    if (!user || typeof user !== "object") return [];

    const realmAccess = (user as { realm_access?: unknown }).realm_access;
    if (!realmAccess || typeof realmAccess !== "object") return [];

    const roles = (realmAccess as { roles?: unknown }).roles;
    if (!Array.isArray(roles)) return [];

    return roles.filter((role): role is string => typeof role === "string");
};

export default function LoginPage() {
    const { loginDirect, authenticated, user } = useAuth();
    const { notify } = useNotification();
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    const [isPWA, setIsPWA] = useState(false);

    useEffect(() => {
        const checkPWA = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches
                || (window.navigator as any).standalone;
            setIsPWA(isStandalone);
        };
        checkPWA();
    }, []);

    useEffect(() => {
        if (typeof window !== "undefined") {
            const params = new URLSearchParams(window.location.search);
            if (params.get("error") === "device_mismatch") {
                notify("Sessão Expirada", "Sua conta foi logada em outro dispositivo. Apenas um aparelho por conta pode estar conectado ao mesmo tempo.", "error");
                window.history.replaceState({}, document.title, window.location.pathname);
            }
        }
    }, [notify]);

    useEffect(() => {
        if (authenticated && user) {
            const roles = getRealmRoles(user);
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
        <div className="h-[100dvh] flex font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-white overflow-hidden relative">

            {/* ── Left: Premium Hero Section ── */}
            <div className="hidden lg:flex w-[42%] xl:w-[48%] relative overflow-hidden bg-[#0a0c10] items-center justify-center p-8">

                {/* Background Artwork */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                        alt="Education"
                        className="w-full h-full object-cover opacity-30 animate-ken-burns scale-110"
                    />
                    {/* Deep Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0c10] via-[#0a0c10]/80 to-indigo-900/40"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_50%)]"></div>

                    {/* Animated Glows */}
                    <div className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[100px]" />
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                <div className="relative z-20 w-full max-w-2xl px-12 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="mb-14 drop-shadow-2xl">
                        <BrandLogo size="xl" variant="light" link={false} />
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-[13px] font-semibold tracking-wide backdrop-blur-md shadow-2xl">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                            PLATAFORMA DE EXCELÊNCIA
                        </div>

                        <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                            Domine o seu <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                                futuro acadêmico.
                            </span>
                        </h2>

                        <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                            Conecte-se à ferramenta que transforma esforço em resultados, desenhada para quem busca o topo.
                        </p>

                        <div className="grid grid-cols-1 gap-4 py-6">
                            {[
                                { text: "Análises de performance em tempo real", icon: Target, delay: "500ms" },
                                { text: "Simulados otimizados por IA", icon: Trophy, delay: "600ms" },
                                { text: "Ciclos de estudo personalizados", icon: BookOpen, delay: "700ms" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 group group cursor-default"
                                    style={{ animation: `slideIn 0.5s ease-out forwards ${item.delay}` }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 group-hover:bg-indigo-500/20 group-hover:scale-110 transition-all">
                                        <item.icon size={22} className="text-indigo-400" />
                                    </div>
                                    <span className="text-[15px] font-bold tracking-tight text-white/90">{item.text}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Visual Accent */}
                <div className="absolute bottom-12 left-12 flex items-center gap-4 text-white/20 select-none animate-pulse">
                    <Sparkles size={20} />
                    <span className="text-xs font-bold tracking-widest uppercase">Powered by Bizu AI</span>
                </div>
            </div>

            {/* ── Right: Sophisticated Login Form ── */}
            <div className={`flex-1 flex flex-col relative transition-all duration-500 overflow-y-auto ${isPWA ? 'bg-slate-50/50' : 'bg-white'}`}>

                {/* Background Decorativo exclusivo para PWA/Mobile */}
                {isPWA && (
                    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-[10%] -right-[10%] w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute bottom-[10%] -left-[10%] w-72 h-72 bg-violet-500/5 rounded-full blur-3xl" />
                    </div>
                )}

                <main className="flex-1 flex flex-col justify-center px-6 sm:px-16 lg:px-24 xl:px-32 py-10 relative z-10">
                    <div className={`w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 ${isPWA ? 'bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.04)] border border-slate-100' : ''}`}>

                        {/* Top Branding Section */}
                        <div className={`flex flex-col items-center text-center ${isPWA ? 'mb-12' : 'mb-10'}`}>
                            {!isPWA && (
                                <div className="w-full flex justify-between items-center mb-8">
                                    <Link href="/" className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-all group">
                                        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                        </div>
                                        Voltar
                                    </Link>
                                    <div className="lg:hidden scale-75 origin-right">
                                        <BrandLogo size="md" variant="dark" />
                                    </div>
                                </div>
                            )}

                            {/* Centered Logo for PWA (cara de app) */}
                            {isPWA && (
                                <div className="mb-10 transform scale-110">
                                    <BrandLogo size="lg" variant="dark" link={false} />
                                </div>
                            )}

                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
                                Bem-vindo <span className="text-indigo-600">de volta!</span>
                            </h1>
                            <p className="text-[15px] text-slate-500 font-medium">Acesse sua plataforma de estudos.</p>
                        </div>

                        {/* Google Social Login - Estilo Pill para Apps */}
                        <button className="w-full h-14 rounded-2xl font-bold text-[14px] text-slate-700 bg-white border border-slate-200 hover:border-indigo-100 hover:bg-slate-50 hover:shadow-sm transition-all flex items-center justify-center gap-3 mb-8 group active:scale-[0.98]">
                            <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover:rotate-12 transition-transform duration-500">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Entrar com Google
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">ou e-mail</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">E-mail</label>
                                <input type="text" required value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="seu@exemplo.com"
                                    className="w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Senha</label>
                                    <Link href="/forgot-password"
                                        className="text-[11px] text-indigo-500 font-bold hover:text-indigo-700 transition-all">
                                        Esqueceu?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <input type={show ? "text" : "password"} required value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full h-14 px-5 pr-14 rounded-2xl text-[15px] bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                                    <button type="button" onClick={() => setShow(!show)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors focus:outline-none p-1">
                                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="group relative w-full h-14 rounded-2xl font-black text-[15px] text-white bg-indigo-600 hover:bg-slate-900 transition-all shadow-[0_10px_25px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_-10px_rgba(15,23,42,0.4)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:bg-slate-400 mt-4 overflow-hidden active:scale-[0.98]">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Entrar no App
                                        <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-[14px] text-slate-400 font-bold">
                                Não tem conta?{" "}
                                <Link href="/register" className="text-indigo-600 font-black hover:text-indigo-800 transition-all">
                                    Criar agora
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="py-8 text-center relative z-10 px-6">
                    <p className="text-[12px] text-slate-400 font-bold tracking-tight">
                        &copy; Bizu! Academy — Excelência Acadêmica
                    </p>
                </footer>
            </div>
            {/* Background Decorativo no form (opcional) */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-50/50 rounded-full blur-[100px] -mr-40 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50/30 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

            {/* Custom Animations Inline to avoid CSS bloat */}
            <style jsx global>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateX(-20px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}
