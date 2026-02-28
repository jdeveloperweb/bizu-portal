"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, Rocket, BookOpen, GraduationCap, Sparkles, ShieldCheck, Zap, Mail, Phone, CheckCircle2 } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

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
        if (mismatch) return;
        setLoading(true);

        try {
            // Envia ambos os códigos simultaneamente
            const [emailResult, whatsappResult] = await Promise.all([
                sendVerificationCode(form.email, form.name, 'EMAIL'),
                sendVerificationCode(form.phone, form.name, 'WHATSAPP')
            ]);

            if (emailResult && whatsappResult) {
                notify("Códigos Enviados! 📩", "Verifique seu e-mail e seu WhatsApp.", "success");
                setStep(2);
            } else if (emailResult || whatsappResult) {
                notify("Atenção", "Um dos códigos pode não ter sido enviado. Verifique ambos.", "info");
                setStep(2);
            } else {
                notify("Erro ao enviar", "Não conseguimos enviar os códigos. Verifique os dados informados.", "error");
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
        <div className="min-h-screen flex font-sans selection:bg-indigo-100 selection:text-indigo-900 bg-white overflow-hidden">

            {/* ── Left: Premium Hero Section ── */}
            <div className="hidden lg:flex w-[42%] xl:w-[48%] relative overflow-hidden bg-[#0a0c10] items-center justify-center p-8">
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop"
                        alt="Education"
                        className="w-full h-full object-cover opacity-25 animate-ken-burns scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#0a0c10] via-[#0a0c10]/90 to-violet-900/40"></div>
                </div>
                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                <div className="relative z-20 w-full max-w-2xl px-12 animate-in fade-in slide-in-from-left-8 duration-700 lg:-translate-y-20 xl:-translate-y-28">
                    <div className="mb-14 drop-shadow-2xl">
                        <BrandLogo size="xl" variant="light" link={false} />
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-[13px] font-semibold tracking-wide backdrop-blur-md shadow-2xl">
                            <Zap size={14} className="text-amber-400" />
                            SEGURANÇA EM PRIMEIRO LUGAR
                        </div>

                        <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                            Validação em <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-indigo-400 to-cyan-400">
                                dois canais.
                            </span>
                        </h2>

                        <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                            Protegemos seu acesso com códigos via e-mail e WhatsApp para garantir a máxima segurança da sua conta.
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Right: Step-by-Step Form ── */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto relative">
                <main className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-20 relative z-10">
                    <div className="w-full max-w-[460px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

                        <div className="mb-8">
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-2">
                                {step === 1 ? "Crie sua conta" : "Verifique seu acesso"}
                            </h1>
                            <div className="flex items-center gap-2">
                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                                <div className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-indigo-600' : 'bg-slate-100'}`} />
                            </div>
                        </div>

                        {step === 1 ? (
                            <form onSubmit={handleSendCodes} className="space-y-5">
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase">Nome Completo</label>
                                    <input type="text" required value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full h-[58px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase">E-mail</label>
                                    <input type="email" required value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full h-[58px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase">WhatsApp (com DDD)</label>
                                    <input type="tel" required value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        placeholder="Ex: 5511999999999"
                                        className="w-full h-[58px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 focus:ring-0 outline-none transition-all shadow-sm font-medium" />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase">Senha</label>
                                    <div className="relative group">
                                        <input type={show ? "text" : "password"} required value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            className="w-full h-[58px] px-5 pr-14 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm font-medium" />
                                        <button type="button" onClick={() => setShow(!show)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors p-1">
                                            {show ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                    {form.password && (
                                        <div className="mt-2 text-[10px] font-black uppercase tracking-widest" style={{ color: sColors[strength] }}>
                                            Força: {sLabels[strength]}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-[13px] font-extrabold text-slate-800 ml-1 uppercase">Confirmar Senha</label>
                                    <input type={show ? "text" : "password"} required value={form.confirm}
                                        onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                        className={`w-full h-[58px] px-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:bg-white focus:border-indigo-500 outline-none transition-all shadow-sm font-medium ${mismatch ? "border-red-500 bg-red-50" : ""}`} />
                                    {mismatch && <p className="text-[12px] text-red-500 font-bold ml-1">As senhas não coincidem</p>}
                                </div>

                                <button type="submit" disabled={loading || mismatch}
                                    className="w-full h-[62px] rounded-2xl font-black text-white bg-indigo-600 hover:bg-slate-900 transition-all shadow-lg active:scale-[0.98] flex items-center justify-center gap-2 mt-4">
                                    {loading ? <Loader2 className="animate-spin" /> : <>Próximo Passo <Rocket size={20} /></>}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleFinalRegister} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                                <p className="text-slate-500 font-medium">Enviamos códigos de 6 dígitos para seus canais. Informe-os abaixo:</p>

                                <div className="space-y-4">
                                    <div className="p-6 rounded-3xl bg-indigo-50 border border-indigo-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Mail size={40} /></div>
                                        <label className="block text-[13px] font-black text-indigo-900 uppercase mb-3 flex items-center gap-2">
                                            <Mail size={16} /> Código do E-mail
                                        </label>
                                        <input type="text" maxLength={6} required value={form.emailCode}
                                            onChange={(e) => setForm({ ...form, emailCode: e.target.value })}
                                            placeholder="000000"
                                            className="w-full h-[60px] text-center text-2xl font-black tracking-[0.5em] rounded-2xl bg-white border-2 border-transparent focus:border-indigo-500 outline-none transition-all placeholder:text-slate-200" />
                                    </div>

                                    <div className="p-6 rounded-3xl bg-emerald-50 border border-emerald-100 relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-4 opacity-10"><Phone size={40} /></div>
                                        <label className="block text-[13px] font-black text-emerald-900 uppercase mb-3 flex items-center gap-2">
                                            <Phone size={16} /> Código do WhatsApp
                                        </label>
                                        <input type="text" maxLength={6} required value={form.phoneCode}
                                            onChange={(e) => setForm({ ...form, phoneCode: e.target.value })}
                                            placeholder="000000"
                                            className="w-full h-[60px] text-center text-2xl font-black tracking-[0.5em] rounded-2xl bg-white border-2 border-transparent focus:border-emerald-500 outline-none transition-all placeholder:text-slate-200" />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <button type="submit" disabled={loading}
                                        className="w-full h-[62px] rounded-2xl font-black text-white bg-slate-900 hover:bg-indigo-600 transition-all shadow-xl active:scale-[0.98] flex items-center justify-center gap-2">
                                        {loading ? <Loader2 className="animate-spin" /> : <>Finalizar Cadastro <CheckCircle2 size={20} /></>}
                                    </button>
                                    <button type="button" onClick={() => setStep(1)} className="w-full text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-colors">
                                        Voltar e corrigir dados
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className="mt-12 text-center text-slate-400 text-sm font-medium">
                            Já tem conta? <Link href="/login" className="text-indigo-600 font-bold">Fazer login</Link>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}
