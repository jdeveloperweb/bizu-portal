"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, CheckCircle2, Sparkles, GraduationCap } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
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

    useEffect(() => {
        if (authenticated && user) {
            const roles = getRealmRoles(user);
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
        <div className="min-h-screen flex font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-white">

            {/* ── Left: Visual Branding (Academy Style) ── */}
            <div className="hidden lg:flex w-[45%] xl:w-[50%] relative overflow-hidden bg-slate-50 items-center justify-center">

                {/* Imagem de Fundo de Estudo com Movimento */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1517673132405-a56a62b18caf?q=80&w=2076&auto=format&fit=crop"
                        alt="Study Background"
                        className="w-full h-full object-cover opacity-40 animate-ken-burns scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-50/40 via-transparent to-indigo-50/40"></div>
                </div>

                {/* Background Decorativo (Grid) */}
                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

                {/* Efeitos de Luz Sutis */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-100/50 rounded-full blur-[100px] opacity-70 pointer-events-none" />
                <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-blue-100/40 rounded-full blur-[80px] pointer-events-none" />

                <div className="relative z-10 w-full max-w-xl p-12 xl:p-16">
                    <div className="mb-12">
                        <BrandLogo size="xl" variant="dark" link={false} />
                    </div>

                    <div className="space-y-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-[12px] font-bold uppercase tracking-wider mb-2 shadow-sm">
                            <GraduationCap size={14} />
                            Plataforma de Excelência
                        </div>

                        <h2 className="text-4xl xl:text-5xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
                            Acelere a sua <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                                aprovação diária
                            </span>
                        </h2>

                        <p className="text-slate-600 text-lg max-w-md leading-relaxed font-medium">
                            Conecte-se e continue sua preparação com as melhores ferramentas e métricas focadas no seu sucesso.
                        </p>

                        <div className="grid grid-cols-1 gap-5 py-8">
                            {[
                                "Análises precisas do seu progresso",
                                "Simulados inéditos com ranking",
                                "Metas e ciclos controlados",
                            ].map((p, i) => (
                                <div key={p} className="flex items-center gap-4 text-slate-700 group bg-white/60 p-4 rounded-2xl border border-white shadow-sm backdrop-blur-md transition-all hover:bg-white hover:shadow-md hover:-translate-y-0.5" style={{ animationDelay: `${400 + i * 100}ms` }}>
                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0 border border-indigo-100">
                                        <CheckCircle2 size={20} className="text-indigo-600" />
                                    </div>
                                    <span className="text-[15px] font-bold tracking-tight text-slate-800">{p}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right: Form (Clean Light) ── */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto">
                <main className="flex-1 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16">
                    <div className="w-full max-w-[420px] mx-auto">

                        <div className="mb-10">
                            <Link href="/" className="inline-flex items-center gap-2 text-[14px] font-semibold text-slate-400 hover:text-slate-700 transition-all group">
                                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                Voltar
                            </Link>
                        </div>

                        <div className="lg:hidden mb-12 flex justify-center">
                            <BrandLogo size="lg" variant="dark" />
                        </div>

                        <div className="mb-10 text-center lg:text-left">
                            <h1 className="text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight mb-3">Bem-vindo de volta</h1>
                            <p className="text-[15px] text-slate-500 font-medium">Informe suas credenciais para continuar.</p>
                        </div>

                        {/* Google Social Login */}
                        <button className="w-full h-[52px] rounded-xl font-bold text-[14px] text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:bg-slate-50 hover:shadow-md transition-all flex items-center justify-center gap-3 mb-8 group">
                            <svg width="20" height="20" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Continuar com o Google
                        </button>

                        <div className="flex items-center gap-4 mb-8">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Ou email</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-[12px] font-bold text-slate-700 ml-1">Usuário ou E-mail</label>
                                <input type="text" required value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="jaime@email.com" className="w-full h-[52px] px-4 rounded-xl text-[15px] bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 outline-none transition-all shadow-sm" />
                            </div>
                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-[12px] font-bold text-slate-700">Senha</label>
                                    <Link href="/forgot-password" title="Recuperar senha" className="text-[12px] text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Esqueceu a senha?</Link>
                                </div>
                                <div className="relative">
                                    <input type={show ? "text" : "password"} required value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••" className="w-full h-[52px] px-4 pr-12 rounded-xl text-[15px] bg-slate-50 border border-slate-200 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 placeholder:text-slate-400 outline-none transition-all shadow-sm" />
                                    <button type="button" onClick={() => setShow(!show)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none">
                                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button type="submit" disabled={loading}
                                className="w-full h-[52px] rounded-xl font-bold text-[15px] text-white bg-slate-900 hover:bg-slate-800 flex items-center justify-center gap-2 transition-all shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_25px_-8px_rgba(0,0,0,0.4)] hover:-translate-y-0.5 disabled:opacity-50 disabled:hover:translate-y-0 mt-6">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Entrar
                                        <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-[14px] text-slate-500 font-medium">
                                Não possui uma conta?{" "}
                                <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-800 transition-all hover:underline decoration-2 underline-offset-4">
                                    Cadastre-se grátis
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="py-8 text-center bg-white">
                    <p className="text-[12px] text-slate-400 font-medium">
                        &copy; {new Date().getFullYear()} Bizu! Academy · O padrão de excelência.
                    </p>
                </footer>
            </div>
        </div>
    );
}
