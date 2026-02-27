"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, Rocket, BookOpen, Target, GraduationCap, Sparkles, ShieldCheck, Zap } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
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
    const sColors = ["", "#ef4444", "#f59e0b", "#6366f1", "#10b981"];
    const sLabels = ["", "VULNERÁVEL", "RAZOÁVEL", "SEGURA", "INVIOLÁVEL"];
    const mismatch = !!form.confirm && form.password !== form.confirm;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mismatch) return;
        setLoading(true);

        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const planId = searchParams?.get('plan');
        const courseId = searchParams?.get('course');

        try {
            const success = await register(form.name, form.email, form.password);
            if (success) {
                notify("Conta Criada! 🚀", "Agora vamos configurar seu acesso.", "success");
                let checkoutUrl = "/checkout";
                if (planId) {
                    checkoutUrl += `?plan=${planId}`;
                    if (courseId) checkoutUrl += `&course=${courseId}`;
                }
                router.push(checkoutUrl);
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
        <div className="min-h-screen flex font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-white overflow-hidden">

            {/* ── Left: Premium Hero Section ── */}
            <div className="hidden lg:flex w-[42%] xl:w-[48%] relative overflow-hidden bg-[#0a0c10] items-center justify-center p-8">

                {/* Background Artwork */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                        alt="Education"
                        className="w-full h-full object-cover opacity-25 animate-ken-burns scale-110"
                    />
                    {/* Deep Overlays */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c10] via-[#0a0c10]/90 to-violet-900/40"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(139,92,246,0.15),transparent_50%)]"></div>

                    {/* Animated Glows */}
                    <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] bg-violet-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[100px]" />
                </div>

                {/* Grid Pattern Overlay */}
                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                <div className="relative z-20 w-full max-w-2xl px-12 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="mb-14 drop-shadow-2xl">
                        <BrandLogo size="xl" variant="light" link={false} />
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-[13px] font-semibold tracking-wide backdrop-blur-md shadow-2xl">
                            <Zap size={14} className="text-amber-400" />
                            INÍCIO DA SUA JORNADA
                        </div>

                        <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                            Junte-se à elite <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
                                da aprovação.
                            </span>
                        </h2>

                        <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                            Construa sua base, teste seus limites em simulados semanais e conquiste a vaga dos seus sonhos.
                        </p>

                        <div className="grid grid-cols-1 gap-4 py-6">
                            {[
                                { text: "Crie sua conta. É grátis por 7 dias.", icon: Rocket, delay: "500ms" },
                                { text: "Construa uma base sólida de conhecimento", icon: BookOpen, delay: "600ms" },
                                { text: "Domine seu edital em tempo recorde", icon: GraduationCap, delay: "700ms" },
                            ].map((item, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-5 p-5 rounded-2xl bg-white/[0.03] border border-white/[0.08] backdrop-blur-xl transition-all hover:bg-white/[0.06] hover:border-white/[0.15] hover:-translate-y-1 group group cursor-default"
                                    style={{ animation: `slideIn 0.5s ease-out forwards ${item.delay}` }}
                                >
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0 border border-violet-500/20 group-hover:bg-violet-500/20 group-hover:scale-110 transition-all">
                                        <item.icon size={22} className="text-violet-400" />
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
                    <span className="text-xs font-bold tracking-widest uppercase">O padrão de excelência</span>
                </div>
            </div>

            {/* ── Right: Sophisticated Register Form ── */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto relative">
                <main className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-20 relative z-10">
                    <div className="w-full max-w-[460px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

                        <div className="mb-12 flex items-center justify-between">
                            <Link href="/" className="inline-flex items-center gap-2.5 text-[14px] font-bold text-slate-400 hover:text-indigo-600 transition-all group">
                                <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                                </div>
                                Voltar
                            </Link>

                            <div className="lg:hidden scale-75 origin-right">
                                <BrandLogo size="lg" variant="dark" />
                            </div>
                        </div>

                        <div className="mb-10">
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
                                Sua nova <span className="text-indigo-600">conta</span>
                            </h1>
                            <p className="text-[16px] text-slate-500 font-medium">Experimente a plataforma gratuitamente.</p>
                        </div>

                        {/* Google Social Login */}
                        <button className="w-full h-[58px] rounded-2xl font-bold text-[15px] text-slate-700 bg-white border-2 border-slate-100 hover:border-indigo-100 hover:bg-slate-50 hover:shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all flex items-center justify-center gap-3.5 mb-8 group active:scale-[0.98]">
                            <svg width="22" height="22" viewBox="0 0 24 24" className="group-hover:scale-110 transition-transform duration-500">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            Cadastrar com o Google
                        </button>

                        <div className="flex items-center gap-5 mb-8">
                            <div className="flex-1 h-[2px] bg-slate-50" />
                            <span className="text-[12px] font-extrabold text-slate-300 uppercase tracking-widest px-2">Ou com e-mail</span>
                            <div className="flex-1 h-[2px] bg-slate-50" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase tracking-wider">Nome Completo</label>
                                <input type="text" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="Ex: Jaime Vicente"
                                    className="w-full h-[60px] px-5 rounded-2xl text-[15px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-400 outline-none transition-all shadow-sm font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase tracking-wider">E-mail</label>
                                <input type="email" required value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="seu@email.com"
                                    className="w-full h-[60px] px-5 rounded-2xl text-[15px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-400 outline-none transition-all shadow-sm font-medium" />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase tracking-wider">Senha</label>
                                <div className="relative group">
                                    <input type={show ? "text" : "password"} required value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="Crie uma senha segura"
                                        className="w-full h-[60px] px-5 pr-14 rounded-2xl text-[15px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-400 outline-none transition-all shadow-sm font-medium" />
                                    <button type="button" onClick={() => setShow(!show)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors focus:outline-none p-1">
                                        {show ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                                {form.password && (
                                    <div className="mt-3 px-1 animate-in fade-in zoom-in-95 duration-300">
                                        <div className="flex gap-2 mb-2">
                                            {[1, 2, 3, 4].map(i => (
                                                <div key={i} className="h-[5px] flex-1 rounded-full transition-all duration-500 shadow-sm"
                                                    style={{ background: i <= strength ? sColors[strength] : "#F1F5F9" }} />
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <p className="text-[10px] font-black uppercase tracking-widest flex items-center gap-1" style={{ color: sColors[strength] }}>
                                                {strength >= 3 && <ShieldCheck size={12} />}
                                                Força: {sLabels[strength]}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase tracking-wider">Confirmar Senha</label>
                                <input type={show ? "text" : "password"} required value={form.confirm}
                                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                    placeholder="Repita sua senha"
                                    className={`w-full h-[60px] px-5 rounded-2xl text-[15px] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-400 outline-none transition-all shadow-sm font-medium ${mismatch ? "!border-red-500 !bg-red-50" : ""}`} />
                                {mismatch && (
                                    <p className="text-[12px] text-red-500 mt-2 font-bold ml-1 animate-bounce">
                                        As senhas não coincidem
                                    </p>
                                )}
                            </div>

                            <button type="submit" disabled={loading || mismatch}
                                className="group relative w-full h-[62px] rounded-2xl font-black text-[16px] text-white bg-indigo-600 hover:bg-slate-900 transition-all shadow-[0_15px_30px_-5px_rgba(79,70,229,0.35)] hover:shadow-[0_20px_40px_-10px_rgba(15,23,42,0.4)] hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 disabled:bg-slate-400 mt-6 overflow-hidden active:scale-[0.98]">
                                {loading ? (
                                    <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2.5">
                                        Validar minha conta
                                        <Rocket size={20} className="group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform duration-300" />
                                    </span>
                                )}
                            </button>

                            <p className="text-[12px] text-center text-slate-400 pt-2 font-medium">
                                Ao se cadastrar, você concorda com nossos{" "}
                                <Link href="/termos" className="text-indigo-600 font-bold hover:underline">Termos</Link> e{" "}
                                <Link href="/privacidade" className="text-indigo-600 font-bold hover:underline">Privacidade</Link>.
                            </p>
                        </form>

                        <div className="mt-12 text-center">
                            <div className="inline-block p-1 bg-slate-50 rounded-2xl">
                                <p className="text-[15px] text-slate-500 font-bold px-6 py-3">
                                    Já faz parte?{" "}
                                    <Link href="/login" className="text-indigo-600 font-extrabold hover:text-indigo-800 transition-all">
                                        Fazer login
                                    </Link>
                                </p>
                            </div>
                        </div>
                    </div>
                </main>

                <footer className="py-10 text-center relative z-10 bg-white">
                    <p className="text-[13px] text-slate-400 font-bold tracking-tight">
                        &copy; {new Date().getFullYear()} Bizu! Academy <span className="mx-2 text-slate-200">|</span> O padrão de excelência acadêmica.
                    </p>
                </footer>
            </div>

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
