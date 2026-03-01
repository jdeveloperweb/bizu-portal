"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, GraduationCap } from "lucide-react";
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
    const { loginDirect, authenticated, user, isAdmin } = useAuth();
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
            if (isAdmin) {
                router.push("/admin");
            } else {
                router.push("/dashboard");
            }
        }
    }, [authenticated, user, isAdmin, router]);

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
        <div className="h-[100dvh] flex font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-[#F8FAFC] overflow-hidden relative">

            {/* ── Left: dark branded panel ── */}
            <div className="hidden lg:flex w-[42%] xl:w-[48%] relative overflow-hidden items-center justify-center p-8" style={{ background: "#020617" }}>

                {/* Aurora orbs */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="lp-orb lp-orb-1" />
                    <div className="lp-orb lp-orb-2" />
                    <div className="lp-orb lp-orb-3" />
                </div>

                {/* Grid overlay */}
                <div className="absolute inset-0 z-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(to right,rgba(99,102,241,0.04) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />

                {/* Bottom vignette */}
                <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{
                    background: "linear-gradient(to top,#020617,transparent)",
                }} />

                <div className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center text-center">
                    {/* Icon mark — glowing */}
                    <div className="relative mb-7">
                        <div className="absolute inset-0 rounded-2xl animate-pulse"
                            style={{ background: "rgba(99,102,241,0.2)", transform: "scale(1.5)", filter: "blur(12px)" }} />
                        <div className="relative w-16 h-16 rounded-2xl flex items-center justify-center"
                            style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 0 44px rgba(99,102,241,0.45), 0 8px 24px rgba(99,102,241,0.3)" }}>
                            <GraduationCap size={28} className="text-white" />
                        </div>
                    </div>

                    {/* AXON wordmark */}
                    <span
                        className="font-black leading-none tracking-tight select-none"
                        style={{
                            fontFamily: "var(--font-orbitron)",
                            fontSize: "clamp(60px,9vw,84px)",
                            backgroundImage: "linear-gradient(135deg,#C7D2FE 0%,#818CF8 40%,#6366F1 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                            filter: "drop-shadow(0 0 32px rgba(99,102,241,0.35))",
                        }}
                    >
                        AXON
                    </span>

                    {/* Academy separator */}
                    <div className="flex items-center gap-3 mt-3 mb-10">
                        <div className="w-10 h-px" style={{ background: "linear-gradient(to right,transparent,rgba(255,255,255,0.12))" }} />
                        <span className="text-[10px] font-bold tracking-[0.45em] uppercase" style={{ color: "#334155" }}>Academy</span>
                        <div className="w-10 h-px" style={{ background: "linear-gradient(to left,transparent,rgba(255,255,255,0.12))" }} />
                    </div>

                    {/* Thin indigo rule */}
                    <div className="w-16 h-px mb-10" style={{ background: "linear-gradient(to right,transparent,rgba(99,102,241,0.5),transparent)" }} />

                    {/* Headline */}
                    <h2 className="text-2xl xl:text-[1.75rem] font-black text-white leading-[1.12] tracking-tight mb-4">
                        A arena onde{" "}
                        <span style={{
                            backgroundImage: "linear-gradient(135deg,#818CF8 0%,#6366F1 45%,#A78BFA 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>vencedores surgem.</span>
                    </h2>

                    <p className="text-sm leading-relaxed font-medium" style={{ color: "#475569" }}>
                        Questões, duelos em tempo real, XP e correção de redações por IA.
                    </p>
                </div>
            </div>

            {/* ── Right: Login Form ── */}
            <div className={`flex-1 flex flex-col relative transition-all duration-500 overflow-y-auto ${isPWA ? 'bg-slate-50' : 'bg-white'}`}>

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
                                className="group relative w-full h-14 rounded-2xl font-black text-[15px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 mt-4 overflow-hidden active:scale-[0.98]"
                                style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 8px 28px -4px rgba(99,102,241,0.45)" }}>
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
                        &copy; Axon Academy — Excelência Acadêmica
                    </p>
                    <div className="mt-3 flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-400">
                        <Link href="/termos" className="hover:text-indigo-500 transition-colors">Termos de Uso</Link>
                        <span>•</span>
                        <Link href="/privacidade" className="hover:text-indigo-500 transition-colors">Política de Privacidade</Link>
                    </div>
                </footer>
            </div>
            {/* Background Decorativo no form (opcional) */}
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-slate-50/50 rounded-full blur-[100px] -mr-40 -mt-20 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-50/30 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none" />

            <style jsx global>{`
                @keyframes lp-orb-1 {
                    0%,100% { transform:translate(0,0) scale(1); opacity:.18; }
                    50%     { transform:translate(40px,-30px) scale(1.12); opacity:.28; }
                }
                @keyframes lp-orb-2 {
                    0%,100% { transform:translate(0,0) scale(1); opacity:.10; }
                    50%     { transform:translate(-30px,40px) scale(1.18); opacity:.18; }
                }
                @keyframes lp-orb-3 {
                    0%,100% { transform:translate(0,0) scale(1); opacity:.08; }
                    50%     { transform:translate(20px,-40px) scale(1.1); opacity:.15; }
                }
                .lp-orb { position:absolute; border-radius:50%; filter:blur(100px); pointer-events:none; }
                .lp-orb-1 { width:420px;height:380px; top:-80px; left:-60px;
                    background:radial-gradient(circle,#6366F1 0%,transparent 70%);
                    animation:lp-orb-1 12s ease-in-out infinite; }
                .lp-orb-2 { width:340px;height:300px; bottom:-60px; right:-40px;
                    background:radial-gradient(circle,#8B5CF6 0%,transparent 70%);
                    animation:lp-orb-2 16s ease-in-out infinite; }
                .lp-orb-3 { width:280px;height:260px; top:40%; left:40%;
                    background:radial-gradient(circle,#F59E0B 0%,transparent 70%);
                    animation:lp-orb-3 14s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
