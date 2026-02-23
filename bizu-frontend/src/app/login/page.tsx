"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LogIn, ArrowLeft, CheckCircle2, Sparkles } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
    const { login, authenticated, user } = useAuth();
    const router = useRouter();
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ email: "", password: "" });

    useEffect(() => {
        if (authenticated) {
            const roles = user?.realm_access?.roles || [];
            if (roles.includes("ADMIN")) {
                router.push("/admin");
            } else {
                router.push("/");
            }
        }
    }, [authenticated, user, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        login();
    };

    return (
        <div className="min-h-screen flex">

            {/* ── Left: visual branding ── */}
            <div className="hidden lg:flex w-[50%] relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                        backgroundImage: `url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=1470&auto=format&fit=crop')`,
                        filter: 'brightness(0.7)',
                        transform: 'scale(1.02)',
                        animation: 'float-slow 20s ease-in-out infinite alternate',
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
                            Estude com
                            <br />
                            estrategia.
                            <br />
                            <span className="text-indigo-200">Passe com certeza.</span>
                        </h2>
                        <p className="text-indigo-200/80 text-sm max-w-sm leading-relaxed mb-8">
                            A plataforma inteligente que ja ajudou mais de 10.000 concurseiros a conquistar a aprovacao.
                        </p>
                        <div className="flex flex-col gap-2.5 mb-10">
                            {[
                                "Simulados adaptativos com IA",
                                "Banco de questoes atualizado",
                                "Duelos em tempo real",
                                "Analytics de desempenho",
                            ].map((p) => (
                                <div key={p} className="flex items-center gap-2.5 text-sm text-indigo-50">
                                    <CheckCircle2 size={15} className="text-emerald-400 shrink-0" />
                                    {p}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Social proof */}
                    <div className="flex items-center gap-3">
                        <div className="flex -space-x-2.5">
                            {["MC", "AP", "DS", "JM"].map((init, i) => (
                                <div key={init} className="w-8 h-8 rounded-full border-2 border-indigo-900 flex items-center justify-center text-[9px] font-bold text-white"
                                    style={{ background: `hsl(${240 + i * 15}, 60%, ${55 + i * 5}%)`, zIndex: 4 - i }}>
                                    {init}
                                </div>
                            ))}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-white">10.000+ aprovados</div>
                            <div className="text-[10px] text-indigo-200/60">Junte-se a comunidade</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Right: form ── */}
            <div className="flex-1 flex items-center justify-center px-6 py-12 bg-[#FAFBFF]">
                <div className="w-full max-w-[400px]">

                    <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-slate-400 hover:text-indigo-600 transition-colors mb-8">
                        <ArrowLeft size={14} /> Voltar
                    </Link>

                    <div className="lg:hidden mb-8">
                        <BrandLogo size="md" variant="gradient" />
                    </div>

                    <h1 className="text-[22px] font-extrabold text-slate-900 mb-1">Entrar na conta</h1>
                    <p className="text-sm text-slate-500 mb-7">Continue de onde voce parou</p>

                    {/* Google */}
                    <button className="w-full h-11 rounded-xl font-semibold text-sm text-slate-700 bg-white border border-slate-200 shadow-sm hover:border-slate-300 hover:shadow transition-all flex items-center justify-center gap-2.5 mb-5">
                        <svg width="18" height="18" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continuar com Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-[11px] text-slate-400">ou</span>
                        <div className="flex-1 h-px bg-slate-100" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Usuário ou E-mail</label>
                            <input type="text" required value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                placeholder="Seu usuário ou e-mail" className="input-field" />
                        </div>
                        <div>
                            <div className="flex justify-between items-center mb-1.5">
                                <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Senha</label>
                                <Link href="/forgot-password" className="text-[11px] text-indigo-500 font-semibold hover:text-indigo-700 transition-colors">Esqueceu?</Link>
                            </div>
                            <div className="relative">
                                <input type={show ? "text" : "password"} required value={form.password}
                                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                                    placeholder="Sua senha" className="input-field pr-10" />
                                <button type="button" onClick={() => setShow(!show)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                                    {show ? <EyeOff size={15} /> : <Eye size={15} />}
                                </button>
                            </div>
                        </div>
                        <button type="submit" disabled={loading}
                            className="btn-primary w-full !h-11 !rounded-xl mt-1 disabled:opacity-60 disabled:cursor-not-allowed">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><LogIn size={15} /> Entrar</>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-slate-500 mt-6">
                        Novo por aqui?{" "}
                        <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors">Crie sua conta</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
