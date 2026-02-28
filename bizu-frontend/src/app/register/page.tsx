"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft, Rocket, BookOpen, GraduationCap, Sparkles, ShieldCheck, Zap, Mail, Phone, CheckCircle2, Trophy, Target } from "lucide-react";
import BrandLogo from "@/components/BrandLogo";
import { useAuth } from "@/components/AuthProvider";
import { useRouter } from "next/navigation";
import { useNotification } from "@/components/NotificationProvider";

export default function RegisterPage() {
    const [show, setShow] = useState(false);
    const [loading, setLoading] = useState(false);
    const { register, loginDirect } = useAuth();
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

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (mismatch) return;
        setLoading(true);

        const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
        const planId = searchParams?.get('plan');
        const courseId = searchParams?.get('course');

        try {
            // Enviamos códigos vazios pois a validação foi removida conforme pedido
            const success = await register(form.name, form.email, form.password, form.phone, "", "");
            if (success) {
                await loginDirect(form.email, form.password);
                notify("Conta criada! 🚀", "Bem-vindo(a) à AXON Academy.", "success");

                let checkoutUrl = "/checkout";
                if (planId) {
                    checkoutUrl += `?plan=${planId}`;
                    if (courseId) checkoutUrl += `&course=${courseId}`;
                }
                router.push(checkoutUrl);
            } else {
                notify("Erro no Cadastro", "Verifique seus dados ou tente outro e-mail.", "error");
            }
        } catch (error) {
            notify("Erro técnico", "Não foi possível criar sua conta agora. Tente mais tarde.", "error");
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
                        src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070&auto=format&fit=crop"
                        alt="Education"
                        className="w-full h-full object-cover opacity-30 animate-ken-burns scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-tr from-[#0a0c10] via-[#0a0c10]/80 to-indigo-900/40"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(99,102,241,0.15),transparent_50%)]"></div>
                </div>
                <div className="absolute inset-0 z-10 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                <div className="relative z-20 w-full max-w-2xl px-12 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="mb-14 drop-shadow-2xl">
                        <BrandLogo size="xl" variant="light" link={false} />
                    </div>

                    <div className="space-y-8">
                        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/90 text-[13px] font-semibold tracking-wide backdrop-blur-md shadow-2xl">
                            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse"></div>
                            VANTAGENS DE SE CADASTRAR
                        </div>

                        <h2 className="text-5xl xl:text-6xl font-black text-white leading-[1.05] tracking-tight">
                            Comece hoje sua <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-fuchsia-400">
                                jornada de sucesso.
                            </span>
                        </h2>

                        <p className="text-slate-400 text-lg max-w-md leading-relaxed font-medium">
                            Crie sua conta em segundos e tenha acesso ilimitado à melhor ferramenta de estudos do Brasil.
                        </p>

                        <div className="grid grid-cols-1 gap-4 py-6">
                            {[
                                { text: "Material exclusivo atualizado diariamente", icon: BookOpen, delay: "500ms" },
                                { text: "Ranking nacional e simulados por IA", icon: Trophy, delay: "600ms" },
                                { text: "Cronograma de estudos inteligente", icon: Target, delay: "700ms" },
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
            </div>

            {/* ── Right: Step-by-Step Form ── */}
            <div className="flex-1 flex flex-col bg-white overflow-y-auto relative">
                <main className="flex-1 flex flex-col justify-center px-8 sm:px-16 lg:px-24 xl:px-32 py-20 relative z-10">
                    <div className="w-full max-w-[460px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">

                        <div className="mb-10 text-center lg:text-left">
                            <Link href="/login" className="inline-flex items-center gap-2 text-[13px] font-bold text-slate-400 hover:text-indigo-600 transition-all group mb-8">
                                <div className="p-2 rounded-lg bg-slate-50 group-hover:bg-indigo-50 transition-colors">
                                    <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                                </div>
                                Voltar para o login
                            </Link>
                            <h1 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mb-3">
                                Crie sua <span className="text-indigo-600">conta</span>
                            </h1>
                            <p className="text-[15px] text-slate-500 font-medium">Preencha os campos abaixo para começar.</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Nome Completo</label>
                                <input type="text" required value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    className="w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">E-mail</label>
                                <input type="email" required value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    className="w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">WhatsApp (com DDD)</label>
                                <input type="tel" required value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="Ex: 5511999999999"
                                    className="w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Senha</label>
                                <div className="relative group">
                                    <input type={show ? "text" : "password"} required value={form.password}
                                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                                        placeholder="••••••••"
                                        className="w-full h-14 px-5 pr-14 rounded-2xl text-[15px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium" />
                                    <button type="button" onClick={() => setShow(!show)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-500 transition-colors focus:outline-none p-1">
                                        {show ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {form.password && (
                                    <div className="px-1 flex justify-between items-center mt-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map((i) => (
                                                <div key={i} className={`h-1 w-8 rounded-full transition-all ${i <= strength ? '' : 'bg-slate-100'}`} style={{ backgroundColor: i <= strength ? sColors[strength] : undefined }} />
                                            ))}
                                        </div>
                                        <span className="text-[9px] font-black tracking-widest uppercase" style={{ color: sColors[strength] }}>{sLabels[strength]}</span>
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <label className="block text-[11px] font-black text-slate-400 ml-1 uppercase tracking-widest">Confirmar Senha</label>
                                <input type={show ? "text" : "password"} required value={form.confirm}
                                    onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                                    placeholder="••••••••"
                                    className={`w-full h-14 px-5 rounded-2xl text-[15px] bg-slate-50 border border-slate-100 focus:bg-white focus:border-indigo-500 focus:ring-0 placeholder:text-slate-300 outline-none transition-all font-medium ${mismatch ? "border-red-500" : ""}`} />
                            </div>

                            <button type="submit" disabled={loading || mismatch}
                                className="group relative w-full h-14 rounded-2xl font-black text-[15px] text-white bg-indigo-600 hover:bg-slate-900 transition-all shadow-[0_10px_25px_-5px_rgba(79,70,229,0.3)] hover:shadow-[0_15px_30px_-10px_rgba(15,23,42,0.4)] hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0 disabled:bg-slate-400 mt-6 overflow-hidden active:scale-[0.98]">
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Finalizar Cadastro
                                        <Rocket size={18} className="group-hover:translate-y-[-2px] group-hover:translate-x-[2px] transition-transform" />
                                    </span>
                                )}
                            </button>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-[14px] text-slate-400 font-bold">
                                Já tem conta?{" "}
                                <Link href="/login" className="text-indigo-600 font-black hover:text-indigo-800 transition-all">
                                    Fazer login
                                </Link>
                            </p>
                        </div>
                    </div>
                </main>

                <footer className="py-8 text-center px-6">
                    <p className="text-[12px] text-slate-400 font-bold tracking-tight">
                        &copy; Bizu! Academy — Excelência Acadêmica
                    </p>
                </footer>

                <style jsx global>{`
                    @keyframes slideIn {
                        from { opacity: 0; transform: translateX(-20px); }
                        to { opacity: 1; transform: translateX(0); }
                    }
                `}</style>
            </div>
        </div>
    );
}
