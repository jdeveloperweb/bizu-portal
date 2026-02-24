"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
    ArrowRight, Award, Zap,
    Brain, BarChart3, Timer,
    ChevronRight, Play, CheckCircle2, Sparkles, Shield,
    ClipboardList, ListChecks, StickyNote, Settings,
    Trophy, Rocket,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

/* ── Features reais do app ── */
const features = [
    {
        icon: Brain,
        title: "Quiz Game",
        desc: "Milhares de questões dos principais concursos, elaboradas por especialistas e atualizadas constantemente.",
        gradient: "from-indigo-500 to-violet-600",
    },
    {
        icon: ClipboardList,
        title: "Simulado Semanal",
        desc: "Simulados ineditos todo sabado as 10h. Simule o ambiente real de prova e confira seu ranking.",
        gradient: "from-emerald-500 to-teal-500",
    },
    {
        icon: Trophy,
        title: "Ranking",
        desc: "Compare seu desempenho com outros candidatos e ajuste sua estrategia para ficar no topo.",
        gradient: "from-amber-500 to-orange-500",
    },
    {
        icon: BarChart3,
        title: "Desempenho Detalhado",
        desc: "Visualize acertos e erros por assunto. Saiba exatamente onde focar seus estudos.",
        gradient: "from-blue-500 to-cyan-500",
    },
    {
        icon: Timer,
        title: "Pomodoro Integrado",
        desc: "Otimize foco e produtividade com ciclos de estudo e descanso direto no app.",
        gradient: "from-rose-500 to-pink-600",
    },
    {
        icon: ListChecks,
        title: "Criador de Tarefas",
        desc: "Organize sua rotina, crie prazos e acompanhe tudo que precisa estudar.",
        gradient: "from-purple-500 to-violet-600",
    },
    {
        icon: StickyNote,
        title: "Anotacoes",
        desc: "Registre insights e informacoes importantes enquanto estuda. Tudo em um so lugar.",
        gradient: "from-sky-500 to-blue-600",
    },
    {
        icon: Settings,
        title: "Configuracoes Personalizaveis",
        desc: "Ajuste tempo, filtre por assunto e configure o app do seu jeito.",
        gradient: "from-slate-500 to-gray-600",
    },
];



/* ── Counter ── */
function Counter({ target }: { target: string }) {
    const [val, setVal] = useState("0");
    const ref = useRef<HTMLDivElement>(null);
    const numeric = target.replace(/[^\d]/g, "");
    const suffix = target.replace(/[\d]/g, "");

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    const end = parseInt(numeric);
                    const dur = 2000;
                    const inc = end / (dur / 16);
                    let cur = 0;
                    const t = setInterval(() => {
                        cur += inc;
                        if (cur >= end) { cur = end; clearInterval(t); }
                        setVal(Math.floor(cur).toLocaleString("pt-BR") + suffix);
                    }, 16);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );
        if (ref.current) observer.observe(ref.current);
        return () => observer.disconnect();
    }, [numeric, suffix]);

    return <div ref={ref}>{val}</div>;
}

export default function Hero() {
    return (
        <div className="relative bg-white overflow-hidden">

            <style jsx>{`
        @keyframes marquee-left {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-20px) rotate(1deg); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(-1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slow-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.15); }
        }
        @keyframes rotate-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes aurora {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .aurora {
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg at 50% 50%, #6366f1 0deg, #a855f7 90deg, #ec4899 180deg, #6366f1 270deg);
          filter: blur(100px);
          opacity: 0.15;
          animation: aurora 20s linear infinite;
          z-index: -1;
        }
        .noise {
            position: absolute;
            inset: 0;
            opacity: 0.03;
            pointer-events: none;
            z-index: 10;
            background-image: url('https://grainy-gradients.vercel.app/noise.svg');
        }
        .slide-in { animation: slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .slide-in-d1 { animation: slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.15s forwards; opacity: 0; }
        .slide-in-d2 { animation: slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.3s forwards; opacity: 0; }
        .slide-in-d3 { animation: slide-in 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.45s forwards; opacity: 0; }
        .glass-card {
            background: rgba(255, 255, 255, 0.03);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
      `}</style>

            {/* ═══════════════════════════
           HERO
         ═══════════════════════════ */}
            <section className="relative min-h-screen flex items-center overflow-hidden bg-slate-950">
                {/* ── BACKGROUND DINAMICO ── */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <div className="aurora" />
                    <div className="noise" />
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-40 scale-105 contrast-125"
                        style={{ animation: 'slow-zoom 30s linear infinite alternate' }}
                    >
                        <source src="https://player.vimeo.com/external/400494519.hd.mp4?s=f5e49cf9d414f6b0f945377f3a6a9d700e395562&profile_id=175" type="video/mp4" />
                    </video>
                    {/* Overlays para profundidade e legibilidade */}
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/50 to-slate-950/95" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(99,102,241,0.2),transparent_60%)]" />
                    <div className="absolute inset-0 opacity-[0.05]" style={{
                        backgroundImage: `radial-gradient(circle, #fff 1px, transparent 1px)`,
                        backgroundSize: "60px 60px",
                    }} />
                </div>

                {/* Elementos flutuantes decorativos */}
                <div className="absolute top-[15%] left-[10%] w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-[20%] right-[10%] w-80 h-80 bg-violet-600/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: "2s" }} />

                {/* Icones Decorativos Flutuantes */}
                <div className="absolute top-[20%] right-[15%] text-indigo-400/20 hidden lg:block scale-150" style={{ animation: "float-slow 10s ease-in-out infinite" }}>
                    <Sparkles size={40} />
                </div>
                <div className="absolute bottom-[25%] left-[15%] text-indigo-400/20 hidden lg:block" style={{ animation: "float-medium 12s ease-in-out infinite" }}>
                    <Shield size={32} />
                </div>

                <div className="relative container mx-auto px-6 pt-32 pb-20 z-10">
                    <div className="max-w-5xl mx-auto text-center">


                        {/* Logo grande com brilho */}
                        <div className="slide-in-d1 mb-6 relative inline-block">
                            <div className="absolute -inset-4 bg-indigo-500/20 blur-2xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            <BrandLogo size="xl" variant="gradient" link={false} />
                        </div>

                        {/* Subtitulo Cinematográfico */}
                        <h1 className="slide-in-d1 text-3xl sm:text-4xl md:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tighter">
                            O jeito certo de estudar
                            <br />
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-indigo-400 animate-gradient-x drop-shadow-[0_0_15px_rgba(99,102,241,0.3)]">
                                para o seu concurso
                            </span>
                        </h1>

                        <p className="slide-in-d2 max-w-2xl mx-auto text-base md:text-lg text-slate-400 mb-10 leading-relaxed font-medium">
                            Questões específicas, simulados semanais, ranking e desempenho detalhado em tempo real.
                            <br className="hidden sm:block" />
                            Tudo que você precisa para conquistar sua aprovação.
                        </p>



                        {/* CTAs de Alto Impacto */}
                        <div className="slide-in-d3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
                            <Link href="/register" className="w-full sm:w-auto">
                                <button className="group relative flex items-center justify-center gap-3 px-12 h-[56px] rounded-2xl text-[15px] font-bold text-white overflow-hidden shadow-[0_20px_40px_-10px_rgba(99,102,241,0.5)] hover:scale-[1.05] hover:shadow-[0_25px_50px_-12px_rgba(99,102,241,0.6)] transition-all duration-500 active:scale-95">
                                    {/* Background animado do botão */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 bg-[length:200%_auto] animate-gradient-x" />
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out" />
                                    <div className="relative flex items-center gap-3">
                                        <Rocket size={18} className="group-hover:translate-y-[-4px] group-hover:translate-x-[2px] transition-transform duration-500" />
                                        Comece grátis agora
                                        <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform duration-500" />
                                    </div>
                                </button>
                            </Link>
                            <Link href="/pricing" className="w-full sm:w-auto">
                                <button className="flex items-center justify-center gap-2 px-10 h-[56px] rounded-2xl text-[15px] font-semibold text-white bg-white/5 backdrop-blur-md border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all shadow-xl">
                                    <Play size={16} className="fill-white" />
                                    Ver planos
                                </button>
                            </Link>
                        </div>

                        <p className="slide-in-d3 text-sm text-slate-400 flex items-center justify-center gap-2 mb-20 drop-shadow-sm">
                            <Shield size={14} className="text-emerald-400" />
                            Acesso imediato · Cancele quando quiser
                        </p>
                    </div>

                    {/* ── Dashboard Mockup Premium (Glass) ── */}
                    <div className="max-w-5xl mx-auto relative px-4">
                        {/* Brilho atrás do mockup */}
                        <div className="absolute -inset-10 bg-gradient-to-r from-indigo-500/20 via-violet-500/20 to-purple-500/20 rounded-[3rem] blur-[80px] pointer-events-none" />

                        <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.6)] bg-slate-900/80 backdrop-blur-xl"
                            style={{ animation: "float-slow 8s ease-in-out infinite" }}>
                            {/* Browser bar */}
                            <div className="flex items-center gap-2 px-4 py-4 bg-white/5 border-b border-white/5">
                                <div className="flex gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57] shadow-lg shadow-red-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E] shadow-lg shadow-yellow-500/20" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840] shadow-lg shadow-green-500/20" />
                                </div>
                                <div className="flex-1 mx-8 hidden sm:block">
                                    <div className="flex items-center gap-2 bg-white/5 rounded-lg px-4 py-1.5 border border-white/10 max-w-sm mx-auto">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.4)]" />
                                        <span className="text-[11px] text-slate-400 font-medium tracking-tight">bizu.academy.com.br</span>
                                    </div>
                                </div>
                            </div>

                            {/* App content mockup */}
                            <div className="flex min-h-[400px]">
                                <div className="w-56 shrink-0 bg-white/5 border-r border-white/5 p-5 hidden md:block">
                                    <div className="flex items-center gap-2 mb-8">
                                        <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                                        <span className="text-[18px] font-black text-white tracking-tight">Bizu!</span>
                                    </div>
                                    <div className="space-y-1.5">
                                        {[
                                            { name: "Dashboard", active: true },
                                            { name: "Quiz Game", active: false },
                                            { name: "Simulados", active: false },
                                            { name: "Ranking", active: false },
                                            { name: "Desempenho", active: false },
                                        ].map((item) => (
                                            <div key={item.name} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[12px] font-semibold transition-all ${item.active ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-400 hover:bg-white/5"
                                                }`}>
                                                {item.name}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex-1 p-6 sm:p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h4 className="text-[15px] font-bold text-white mb-1">Seja um Bizurado! 😎</h4>
                                            <p className="text-[11px] text-slate-400 font-medium tracking-wide">FOCADO NA APROVAÇÃO · ACESSO PREMIUM</p>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-500">🔥 12 DIAS</div>
                                            <div className="px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-bold text-indigo-400">🏆 #23</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { l: "Questões", v: "1.847", c: "text-indigo-400" },
                                            { l: "Acertos", v: "82%", c: "text-emerald-400" },
                                            { l: "Simulados", v: "15", c: "text-violet-400" },
                                            { l: "Semanas", v: "12", c: "text-amber-400" },
                                        ].map((c) => (
                                            <div key={c.l} className="bg-white/5 border border-white/5 rounded-2xl p-4 transition-transform hover:scale-[1.02]">
                                                <div className={`text-xl font-black ${c.c}`}>{c.v}</div>
                                                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mt-1">{c.l}</div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="rounded-2xl bg-white/5 border border-white/5 p-6">
                                        <div className="flex items-center justify-between mb-6">
                                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Desempenho Geral</span>
                                            <Zap size={14} className="text-amber-400" />
                                        </div>
                                        <div className="space-y-4">
                                            {[
                                                { n: "Conhecimentos Específicos", p: 88, c: "bg-emerald-500" },
                                                { n: "Técnicas de Estudo", p: 74, c: "bg-indigo-500" },
                                                { n: "Simulados de Elite", p: 65, c: "bg-amber-500" },
                                            ].map(s => (
                                                <div key={s.n}>
                                                    <div className="flex justify-between text-[10px] font-bold mb-2">
                                                        <span className="text-slate-400">{s.n}</span>
                                                        <span className="text-white">{s.p}%</span>
                                                    </div>
                                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                        <div className={`h-full ${s.c} rounded-full transition-all duration-1000 shadow-lg`} style={{ width: `${s.p}%` }} />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* ═══════════════════════════
           COMO FUNCIONA
         ═══════════════════════════ */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-flex">
                            Como funciona
                        </span>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
                            Sua preparacao em{" "}
                            <span className="gradient-text">3 passos</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-4xl mx-auto relative">
                        {/* Linha conectora */}
                        <div className="hidden md:block absolute top-16 left-[17%] right-[17%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-purple-200" />

                        {[
                            {
                                step: "01",
                                title: "Crie sua conta",
                                desc: "Cadastre-se gratuitamente e escolha o foco dos seus estudos.",
                                icon: Rocket,
                                gradient: "from-indigo-500 to-violet-600",
                            },
                            {
                                step: "02",
                                title: "Estude com o Quiz",
                                desc: "Resolva questoes por assunto, faca simulados semanais e suba no ranking.",
                                icon: Brain,
                                gradient: "from-violet-500 to-purple-600",
                            },
                            {
                                step: "03",
                                title: "Conquiste sua vaga",
                                desc: "Acompanhe seu desempenho, ajuste sua estratégia e passe dentro das vagas.",
                                icon: Award,
                                gradient: "from-purple-500 to-pink-600",
                            },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.step} className="relative text-center group">
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[90px] font-extrabold text-slate-50 leading-none select-none pointer-events-none">
                                        {s.step}
                                    </div>
                                    <div className="relative pt-14">
                                        <div className={`w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br ${s.gradient} flex items-center justify-center shadow-lg shadow-indigo-500/15 group-hover:scale-110 transition-transform`}>
                                            <Icon size={28} className="text-white" />
                                        </div>
                                        <h3 className="text-lg font-bold text-slate-900 mb-2">{s.title}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed max-w-[260px] mx-auto">{s.desc}</p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           FUNCIONALIDADES
         ═══════════════════════════ */}
            <section id="funcionalidades" className="py-24 bg-slate-50/60">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-flex">
                            <Sparkles size={12} />
                            Tudo que voce precisa
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">
                            Ferramentas pensadas
                            <br />
                            <span className="gradient-text">para sua aprovacao</span>
                        </h2>
                        <p className="text-slate-500 max-w-lg mx-auto">
                            Do quiz ao ranking, cada recurso foi projetado para maximizar seu tempo de estudo e suas chances de passar.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="group card-elevated !rounded-2xl p-5">
                                    <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm`}>
                                        <Icon size={20} className="text-white" />
                                    </div>
                                    <h3 className="text-[14px] font-bold text-slate-900 mb-1.5">{f.title}</h3>
                                    <p className="text-[13px] text-slate-500 leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           SIMULADO SEMANAL - destaque
         ═══════════════════════════ */}
            <section className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="max-w-5xl mx-auto flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
                        {/* Visual esquerda */}
                        <div className="flex-1 w-full">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-3xl blur-2xl" />
                                <div className="relative bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-8 text-white overflow-hidden shadow-2xl shadow-emerald-900/20" style={{
                                    transform: "perspective(1000px) rotateY(-5deg) rotateX(5deg)",
                                    transition: "transform 0.5s ease"
                                }} onMouseEnter={(e) => e.currentTarget.style.transform = "perspective(1000px) rotateY(0deg) rotateX(0deg)"} onMouseLeave={(e) => e.currentTarget.style.transform = "perspective(1000px) rotateY(-5deg) rotateX(5deg)"}>

                                    {/* ── IMAGEM DE FUNDO REALISTA ── */}
                                    <div className="absolute inset-0 mix-blend-overlay opacity-30" style={{
                                        backgroundImage: "url('https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1470&auto=format&fit=crop')",
                                        backgroundSize: "cover",
                                        backgroundPosition: "center",
                                        filter: "grayscale(100%)"
                                    }} />

                                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl" />
                                    <div className="absolute inset-0 opacity-[0.15]" style={{
                                        backgroundImage: `radial-gradient(circle, white 0.8px, transparent 0.8px)`,
                                        backgroundSize: "20px 20px",
                                    }} />
                                    <div className="relative z-10 backdrop-blur-[2px]">
                                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-emerald-100 mb-6 drop-shadow-md">
                                            <ClipboardList size={14} />
                                            Simulado Semanal
                                        </div>
                                        <div className="flex items-center justify-between mb-8">
                                            <div>
                                                <div className="text-3xl font-extrabold mb-1">Simulado #24</div>
                                                <div className="text-sm text-emerald-200">40 questoes · 3h de prova</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] text-emerald-200 font-medium mb-1">Disponivel</div>
                                                <div className="text-sm font-bold">Sab 10h → Dom 10h</div>
                                            </div>
                                        </div>
                                        {/* Ranking simulado */}
                                        <div className="space-y-2">
                                            {[
                                                { pos: 1, name: "Lucas M.", score: "38/40", you: false },
                                                { pos: 2, name: "Ana P.", score: "37/40", you: false },
                                                { pos: 3, name: "Voce", score: "36/40", you: true },
                                            ].map((r) => (
                                                <div key={r.pos}
                                                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl ${r.you ? "bg-white/15 border border-white/20" : "bg-white/5"}`}>
                                                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-extrabold ${r.pos === 1 ? "bg-amber-400 text-amber-900" :
                                                        r.pos === 2 ? "bg-slate-300 text-slate-700" :
                                                            "bg-amber-600 text-amber-100"
                                                        }`}>
                                                        {r.pos}
                                                    </div>
                                                    <span className={`flex-1 text-sm font-semibold ${r.you ? "text-white" : "text-emerald-100"}`}>{r.name}</span>
                                                    <span className="text-sm font-bold">{r.score}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Texto direita */}
                        <div className="flex-1">
                            <span className="pill pill-success text-[10px] font-bold uppercase tracking-[0.2em] mb-4 inline-flex">
                                <ClipboardList size={12} />
                                Destaque
                            </span>
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4 leading-tight">
                                Simulado semanal
                                <br />
                                <span className="gradient-text">com ranking real</span>
                            </h2>
                            <p className="text-slate-500 mb-6 leading-relaxed">
                                Todo sabado as 10h um novo simulado inedito e liberado. Voce tem ate domingo as 10h para responder. Na segunda, confira sua posicao no ranking e compare com outros candidatos.
                            </p>
                            <ul className="space-y-3 mb-8">
                                {[
                                    "Questoes ineditas elaboradas por especialistas",
                                    "Simula o ambiente e tempo real de prova",
                                    "Ranking atualizado toda semana",
                                    "Analise detalhada dos seus acertos e erros",
                                ].map((t) => (
                                    <li key={t} className="flex items-start gap-2.5 text-sm text-slate-600">
                                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                                        {t}
                                    </li>
                                ))}
                            </ul>
                            <Link href="/register">
                                <button className="btn-primary !h-12 !px-8">
                                    <Rocket size={16} /> Quero participar
                                </button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>



            {/* ═══════════════════════════
           CTA FINAL
         ═══════════════════════════ */}
            <section className="py-28 bg-white relative overflow-hidden">
                <div className="absolute inset-0" style={{
                    background: "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(99,102,241,0.08) 0%, transparent 70%)",
                }} />

                <div className="container mx-auto px-6 text-center relative z-10">
                    <BrandLogo size="xl" variant="gradient" link={false} />
                    <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mt-8 mb-4">
                        Pronto para ser
                        <br />
                        <span className="gradient-text">um Bizurado?</span>
                    </h2>
                    <p className="text-slate-500 text-lg mb-10 max-w-md mx-auto">
                        Comece agora. Sem compromisso.
                        <br />
                        A aprovacao esta a um clique de distancia.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                        <Link href="/register">
                            <button className="group flex items-center gap-2.5 px-10 h-[56px] rounded-2xl text-[15px] font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:scale-[1.02] transition-all">
                                <Zap size={18} />
                                Criar conta gratis
                                <ChevronRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                            </button>
                        </Link>
                        <Link href="/pricing">
                            <button className="px-7 h-[56px] rounded-2xl text-[15px] font-semibold text-slate-600 border border-slate-200 hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                Ver planos
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           FOOTER
         ═══════════════════════════ */}
            <footer className="py-10 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <BrandLogo size="sm" variant="dark" />
                        <p className="text-xs text-slate-400">© 2025 Bizu! Academy · Todos os direitos reservados</p>
                        <div className="flex gap-5">
                            <Link href="/termos" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Termos</Link>
                            <Link href="/privacidade" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Privacidade</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
