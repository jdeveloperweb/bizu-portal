"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, Rocket, Mail, Phone, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";
import { formatPhone } from "@/lib/utils";

export default function RegisterPage() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Info, 2: Verification
    const { register, loginDirect, sendVerificationCode } = useAuth();
    const { notify } = useNotification();
    const router = useRouter();

    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirm: "",
        emailCode: "",
        phoneCode: ""
    });

    const isPWA = typeof window !== "undefined" && (
        window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
    );

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

    const handleSendCodes = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mismatch) {
            notify("Senhas não coincidem", "Verifique se as senhas informadas são iguais.", "error");
            return;
        }
        setLoading(true);

        try {
            const [emailResult, whatsappResult] = await Promise.all([
                sendVerificationCode(form.email, form.name, 'EMAIL'),
                sendVerificationCode(form.phone, form.name, 'WHATSAPP')
            ]);

            if (emailResult && whatsappResult) {
                notify("Códigos Enviados! 📩", "Verifique seu e-mail e seu WhatsApp.", "success");
                setStep(2);
            } else {
                notify("Erro ao enviar", "Não conseguimos enviar os códigos. Verifique os dados.", "error");
            }
        } catch (error) {
            notify("Erro técnico", "Não foi possível processar sua solicitação agora.", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleFinalRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const planId = searchParams?.get('plan');
        const courseId = searchParams?.get('course');

        try {
            const success = await register(form.name, form.email, form.password, form.phone, form.emailCode, form.phoneCode);
            if (success) {
                await loginDirect(form.email, form.password);
                notify("Bem-vindo(a)! 🚀", "Conta criada com sucesso.", "success");

                let checkoutUrl = "/checkout";
                if (planId) {
                    checkoutUrl += `?plan=${planId}`;
                    if (courseId) checkoutUrl += `&course=${courseId}`;
                }
                router.push(checkoutUrl);
            } else {
                notify("Verificação falhou", "Os códigos informados são inválidos ou expiraram.", "error");
            }
        } catch (error) {
            notify("Erro no sistema", "Tente novamente em instantes.", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-[100dvh] flex font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-[#F8FAFC] overflow-hidden relative">

            {/* ── Left: dark branded panel ── */}
            <div className="hidden lg:flex w-[42%] xl:w-[48%] relative overflow-hidden items-center justify-center p-8" style={{ background: "#020617" }}>

                {/* Aurora orbs (reutiliza CSS do login) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                    <div className="lp-orb lp-orb-1" />
                    <div className="lp-orb lp-orb-2" />
                    <div className="lp-orb lp-orb-3" />
                </div>
                <div className="absolute inset-0 z-0 pointer-events-none" style={{
                    backgroundImage: "linear-gradient(rgba(99,102,241,0.04) 1px,transparent 1px),linear-gradient(to right,rgba(99,102,241,0.04) 1px,transparent 1px)",
                    backgroundSize: "48px 48px",
                }} />
                <div className="absolute bottom-0 left-0 right-0 h-40 pointer-events-none" style={{ background: "linear-gradient(to top,#020617,transparent)" }} />

                {/* AXON background watermark */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none overflow-hidden">
                    <span className="font-black text-white leading-none tracking-tight"
                        style={{ fontFamily: "var(--font-orbitron)", fontSize: "clamp(160px,22vw,260px)", opacity: 0.022 }}>
                        AXON
                    </span>
                </div>

                <div className="relative z-10 w-full max-w-sm px-4 flex flex-col items-center text-center">

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
                        Entre para a{" "}
                        <span style={{
                            backgroundImage: "linear-gradient(135deg,#818CF8 0%,#6366F1 45%,#A78BFA 100%)",
                            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                        }}>elite dos aprovados.</span>
                    </h2>

                    <p className="text-sm leading-relaxed font-medium" style={{ color: "#475569" }}>
                        Verificamos sua identidade por e-mail e WhatsApp. Sua conta protegida desde o primeiro acesso.
                    </p>
                </div>
            </div>

            {/* ── Right: Register Form (Alinhado com Login) ── */}
            <div className={`flex-1 flex flex-col relative transition-all duration-500 overflow-y-auto ${isPWA ? 'bg-slate-50/50' : 'bg-white'}`}>

                <main className="flex-1 flex flex-col justify-center px-6 sm:px-16 lg:px-24 xl:px-32 py-10 relative z-10">
                    <div className={`w-full max-w-[440px] mx-auto animate-in fade-in slide-in-from-bottom-6 duration-1000 ${isPWA ? 'bg-white p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.04)] border border-slate-100' : ''}`}>

                        {/* Top Branding Section */}
                        <div className={`flex flex-col items-center text-center ${isPWA ? 'mb-12' : 'mb-8'}`}>
                            {!isPWA && (
                                <div className="w-full flex justify-between items-center mb-8">
                                    <button onClick={() => step === 2 ? setStep(1) : router.push('/login')} className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-all group">
                                        <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                        </div>
                                        {step === 2 ? 'Voltar' : 'Já tenho conta'}
                                    </button>
                                    <div className="lg:hidden scale-75 origin-right">
                                        <BrandLogo size="md" variant="dark" />
                                    </div>
                                </div>
                            )}

                            {isPWA && (
                                <div className="mb-10 transform scale-110">
                                    <BrandLogo size="lg" variant="dark" link={false} />
                                </div>
                            )}

                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
                                <span className="text-indigo-600">{step === 1 ? 'Crie' : 'Valide'}</span> sua conta
                            </h1>
                            <p className="text-[15px] text-slate-500 font-medium">
                                {step === 1 ? 'Junte-se à nossa comunidade hoje.' : 'Enviamos os códigos de acesso.'}
                            </p>

                            {/* Progress Indicator */}
                            <div className="w-full flex gap-2 mt-6 mb-2">
                                <div className={`h-1 flex-1 rounded-full ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                                <div className={`h-1 flex-1 rounded-full ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                            </div>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleSendCodes} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Nome Completo</label>
                                    <input type="text" required value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        placeholder="Como quer ser chamado?"
                                        className="w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">E-mail</label>
                                    <input type="email" required value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="seu@exemplo.com"
                                        className="w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">WhatsApp</label>
                                    <input type="tel" required value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: formatPhone(e.target.value) })}
                                        placeholder="(00) 00000-0000"
                                        className="w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Senha</label>
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
                                    {form.password && (
                                        <div className="mt-1 text-[9px] font-black uppercase tracking-widest text-right" style={{ color: sColors[strength] }}>
                                            {sLabels[strength]}
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-1.5">
                                    <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Confirmar Senha</label>
                                    <input type={show ? "text" : "password"} required value={form.confirm}
                                        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                        placeholder="••••••••"
                                        className={`w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium ${mismatch ? "border-red-400 text-red-600" : ""}`} />
                                </div>

                                <button type="submit" disabled={loading || mismatch}
                                    className="group relative w-full h-14 rounded-2xl font-black text-[15px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 mt-4 overflow-hidden active:scale-[0.98]"
                                    style={{ background: "linear-gradient(135deg,#6366F1,#4F46E5)", boxShadow: "0 8px 28px -4px rgba(99,102,241,0.45)" }}>
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Próximo Passo
                                            <Rocket size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        </span>
                                    )}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleFinalRegister} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-4">
                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                                            <Mail size={14} className="text-indigo-500" /> Código do E-mail
                                        </label>
                                        <input type="text" maxLength={6} required value={form.emailCode}
                                            onChange={(e) => setForm({ ...form, emailCode: e.target.value })}
                                            placeholder="000000"
                                            className="w-full h-14 px-5 text-center text-xl font-black tracking-[0.4em] rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-indigo-500 outline-none transition-all" />
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest flex items-center gap-2">
                                            <Phone size={14} className="text-emerald-500" /> Código do WhatsApp
                                        </label>
                                        <input type="text" maxLength={6} required value={form.phoneCode}
                                            onChange={(e) => setForm({ ...form, phoneCode: e.target.value })}
                                            placeholder="000000"
                                            className="w-full h-14 px-5 text-center text-xl font-black tracking-[0.4em] rounded-2xl bg-slate-50/50 border border-slate-100 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                                    </div>
                                </div>

                                <button type="submit" disabled={loading}
                                    className="group relative w-full h-14 rounded-2xl font-black text-[15px] text-white transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:hover:translate-y-0 mt-2 overflow-hidden active:scale-[0.98]"
                                    style={{ background: "linear-gradient(135deg,#0F172A,#1E293B)", boxShadow: "0 8px 28px -4px rgba(15,23,42,0.4)" }}>
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Finalizar Cadastro
                                            <CheckCircle2 size={18} className="group-hover:scale-110 transition-transform" />
                                        </span>
                                    )}
                                </button>

                                <button type="button" onClick={() => setStep(1)} className="w-full text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                                    Voltar e corrigir dados
                                </button>
                            </form>
                        )}

                        <div className="mt-10 text-center">
                            <p className="text-[14px] text-slate-400 font-bold">
                                Já tem uma conta?{" "}
                                <Link href="/login" className="text-indigo-600 font-black hover:text-indigo-800 transition-all">
                                    Fazer login
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
                    background:radial-gradient(circle,#10B981 0%,transparent 70%);
                    animation:lp-orb-3 14s ease-in-out infinite; }
            `}</style>
        </div>
    );
}
