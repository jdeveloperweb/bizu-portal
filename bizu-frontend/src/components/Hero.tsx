"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
    ArrowRight, BookOpen, Target, Award, Zap,
    Brain, BarChart3, Swords, Layers, Timer,
    ChevronRight, Play, CheckCircle2, Sparkles, Shield,
    ClipboardList, ListChecks, StickyNote, Settings,
    Trophy, Anchor, Rocket, Users, Star,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

/* ── Features reais do app ── */
const features = [
    {
        icon: Brain,
        title: "Quiz Game",
        desc: "Mais de 2.000 questoes especificas para C-EspFN e C-Hab/Ap-SG, elaboradas por especialistas.",
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

/* ── Concursos ── */
const concursos = [
    { name: "C-EspFN", full: "Cabo Fuzileiro Naval" },
    { name: "C-Hab/Ap-SG", full: "Habilitacao e Aperfeicoamento de Sargentos" },
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
          50%      { transform: translateY(-12px) rotate(1deg); }
        }
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%      { opacity: 0.6; transform: scale(1.08); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .slide-in { animation: slide-in 0.8s ease-out forwards; }
        .slide-in-d1 { animation: slide-in 0.8s ease-out 0.15s forwards; opacity: 0; }
        .slide-in-d2 { animation: slide-in 0.8s ease-out 0.3s forwards; opacity: 0; }
        .slide-in-d3 { animation: slide-in 0.8s ease-out 0.45s forwards; opacity: 0; }
      `}</style>

            {/* ═══════════════════════════
           HERO
         ═══════════════════════════ */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* BG */}
                <div className="absolute inset-0">
                    <div className="absolute inset-0" style={{
                        background: `
              radial-gradient(ellipse 80% 50% at 50% -20%, rgba(99,102,241,0.1) 0%, transparent 70%),
              radial-gradient(ellipse 50% 40% at 85% 70%, rgba(139,92,246,0.05) 0%, transparent 55%),
              radial-gradient(ellipse 40% 30% at 10% 80%, rgba(245,158,11,0.03) 0%, transparent 50%)
            `,
                    }} />
                    <div className="absolute inset-0 opacity-[0.2]" style={{
                        backgroundImage: `radial-gradient(circle, #CBD5E1 0.8px, transparent 0.8px)`,
                        backgroundSize: "32px 32px",
                    }} />
                </div>

                {/* Glow */}
                <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[400px] blur-[150px] pointer-events-none"
                    style={{ background: "linear-gradient(180deg, rgba(99,102,241,0.2) 0%, transparent 100%)", animation: "pulse-glow 8s ease-in-out infinite" }} />

                <div className="relative container mx-auto px-6 pt-28 pb-20">
                    <div className="max-w-5xl mx-auto text-center">

                        {/* Badge */}
                        <div className="slide-in inline-flex items-center gap-2 px-4 py-2 rounded-full mb-10 bg-indigo-50/80 backdrop-blur-sm border border-indigo-100">
                            <Anchor size={15} className="text-indigo-600" />
                            <span className="text-[13px] font-semibold text-indigo-600">
                                Preparatorio Marinha do Brasil
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        </div>

                        {/* Logo grande */}
                        <div className="slide-in-d1 mb-8">
                            <BrandLogo size="hero" variant="gradient" link={false} />
                        </div>

                        {/* Subtitulo */}
                        <h1 className="slide-in-d1 text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 leading-tight mb-3">
                            O jeito certo de estudar
                            <br />
                            <span className="gradient-text">para a Marinha</span>
                        </h1>

                        <p className="slide-in-d2 max-w-2xl mx-auto text-base md:text-lg text-slate-500 mb-5 leading-relaxed">
                            Questoes especificas, simulados semanais, ranking e desempenho detalhado.
                            <br className="hidden sm:block" />
                            Tudo que voce precisa para conquistar sua vaga.
                        </p>

                        {/* Concursos */}
                        <div className="slide-in-d2 flex flex-wrap items-center justify-center gap-2.5 mb-10">
                            {concursos.map((c) => (
                                <div key={c.name} className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-slate-200 shadow-sm">
                                    <Anchor size={14} className="text-indigo-500" />
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-slate-800">{c.name}</div>
                                        <div className="text-[10px] text-slate-400">{c.full}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTAs */}
                        <div className="slide-in-d3 flex flex-col sm:flex-row items-center justify-center gap-3 mb-5">
                            <Link href="/register">
                                <button className="group flex items-center gap-2.5 px-10 h-[56px] rounded-2xl text-[15px] font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/35 hover:scale-[1.02] transition-all duration-300">
                                    <Rocket size={18} />
                                    Comece gratis agora
                                    <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
                                </button>
                            </Link>
                            <Link href="/pricing">
                                <button className="flex items-center gap-2 px-7 h-[56px] rounded-2xl text-[15px] font-semibold text-slate-600 bg-white border border-slate-200 shadow-sm hover:border-indigo-200 hover:text-indigo-600 transition-all">
                                    <Play size={16} />
                                    Ver planos
                                </button>
                            </Link>
                        </div>

                        <p className="slide-in-d3 text-xs text-slate-400 flex items-center justify-center gap-1.5 mb-20">
                            <Shield size={13} className="text-emerald-500" />
                            Sem cartao de credito · Cancele quando quiser
                        </p>
                    </div>

                    {/* ── Dashboard Mockup ── */}
                    <div className="max-w-5xl mx-auto relative">
                        <div className="absolute -inset-8 bg-gradient-to-r from-indigo-500/10 via-violet-500/8 to-purple-500/10 rounded-[2.5rem] blur-3xl" />
                        <div className="relative rounded-2xl overflow-hidden border border-slate-200/80 shadow-2xl shadow-slate-300/40 bg-white" style={{ animation: "float-slow 8s ease-in-out infinite" }}>
                            {/* Browser bar */}
                            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50/80 border-b border-slate-100">
                                <div className="flex gap-1.5">
                                    <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
                                    <div className="w-3 h-3 rounded-full bg-[#FEBC2E]" />
                                    <div className="w-3 h-3 rounded-full bg-[#28C840]" />
                                </div>
                                <div className="flex-1 mx-8">
                                    <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-1.5 border border-slate-200 max-w-xs mx-auto">
                                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                        <span className="text-[11px] text-slate-400 font-medium">bizu.mjolnix.com.br</span>
                                    </div>
                                </div>
                            </div>
                            {/* App content */}
                            <div className="flex">
                                <div className="w-52 shrink-0 bg-[#FAFBFF] border-r border-slate-100 p-4 hidden md:block">
                                    <div className="flex items-center gap-1.5 mb-5">
                                        <span className="text-[18px] leading-none" style={{ fontFamily: "Bobaland, sans-serif" }}>
                                            <span className="gradient-text">Bizu!</span>
                                        </span>
                                        <span className="text-[7px] font-bold tracking-[0.2em] text-slate-400 uppercase border-l border-slate-200 pl-1.5 mt-0.5">Academy</span>
                                    </div>
                                    {[
                                        { name: "Dashboard", active: true },
                                        { name: "Quiz Game", active: false },
                                        { name: "Simulados", active: false },
                                        { name: "Ranking", active: false },
                                        { name: "Desempenho", active: false },
                                        { name: "Pomodoro", active: false },
                                    ].map((item) => (
                                        <div key={item.name} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-[11px] font-medium mb-0.5 ${item.active ? "bg-indigo-50 text-indigo-600" : "text-slate-400"
                                            }`}>
                                            <div className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-indigo-500" : "bg-slate-300"}`} />
                                            {item.name}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex-1 p-5">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <div className="text-[13px] font-bold text-slate-800">Seja um Bizurado! 😎</div>
                                            <div className="text-[10px] text-slate-400">C-EspFN · Preparatorio ativo</div>
                                        </div>
                                        <div className="flex gap-2">
                                            <div className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-100 text-[10px] font-bold text-amber-600">🔥 12 dias</div>
                                            <div className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-600">🏆 #23</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-4 gap-2.5 mb-4">
                                        {[
                                            { l: "Questoes", v: "1.847", bg: "bg-indigo-50", c: "text-indigo-600" },
                                            { l: "Acertos", v: "82%", bg: "bg-emerald-50", c: "text-emerald-600" },
                                            { l: "Simulados", v: "15", bg: "bg-violet-50", c: "text-violet-600" },
                                            { l: "Ranking", v: "#23", bg: "bg-amber-50", c: "text-amber-600" },
                                        ].map((c) => (
                                            <div key={c.l} className={`${c.bg} rounded-xl p-2.5 text-center`}>
                                                <div className={`text-base font-extrabold ${c.c}`}>{c.v}</div>
                                                <div className="text-[9px] text-slate-400 font-medium mt-0.5">{c.l}</div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Desempenho mini */}
                                    <div className="rounded-xl border border-slate-100 p-3.5">
                                        <div className="text-[10px] font-bold text-slate-600 mb-3">Desempenho por assunto</div>
                                        {[
                                            { name: "Org. Militares Navais", pct: 88, color: "#059669" },
                                            { name: "Armamento", pct: 74, color: "#6366F1" },
                                            { name: "Navegacao", pct: 65, color: "#F59E0B" },
                                            { name: "Poder e Funcoes", pct: 91, color: "#8B5CF6" },
                                        ].map((s) => (
                                            <div key={s.name} className="mb-2 last:mb-0">
                                                <div className="flex justify-between text-[9px] mb-1">
                                                    <span className="text-slate-500 font-medium">{s.name}</span>
                                                    <span className="font-bold" style={{ color: s.color }}>{s.pct}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div className="h-full rounded-full" style={{ width: `${s.pct}%`, background: s.color }} />
                                                </div>
                                            </div>
                                        ))}
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
                                desc: "Cadastre-se gratuitamente e escolha entre C-EspFN ou C-Hab/Ap-SG.",
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
                                desc: "Acompanhe seu desempenho, ajuste sua estrategia e passe com confianca.",
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
           SOCIAL PROOF - mural
         ═══════════════════════════ */}
            <section className="py-24 overflow-hidden relative border-y border-slate-100 bg-slate-50/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/20 via-white to-violet-50/20" />


                <div className="absolute inset-0 opacity-20" style={{
                    backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.15) 1px, transparent 1px)`,
                    backgroundSize: "28px 28px",
                }} />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-500/20 rounded-full blur-[150px] mix-blend-screen" />

                <div className="relative container mx-auto px-6 text-center z-10">
                    <div className="inline-block hover:scale-105 transition-transform duration-500 mb-2">
                        <BrandLogo size="md" variant="dark" link={false} />
                    </div>
                    <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mt-8 mb-5 slide-in-d1">
                        Junte-se a milhares de
                        <br />
                        <span className="gradient-text">bizurados</span>
                    </h2>
                    <p className="text-slate-500 mb-14 max-w-md mx-auto text-lg slide-in-d2">
                        Concurseiros que ja estao usando o Bizu! para conquistar sua vaga na Marinha.
                    </p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-14">
                        {[
                            { val: "2000", suffix: "+", label: "Questoes especificas", icon: BookOpen },
                            { val: "52", suffix: "", label: "Simulados por ano", icon: ClipboardList },
                            { val: "98", suffix: "%", label: "Recomendacoes", icon: Star },
                            { val: "24", suffix: "/7", label: "Disponibilidade", icon: Zap },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.label} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-indigo-400/30 transition-all group">
                                    <Icon size={20} className="text-indigo-600 mx-auto mb-3" />
                                    <div className="text-2xl font-extrabold text-slate-900 mb-1 group-hover:text-indigo-600 transition-colors">
                                        <Counter target={s.val} />{s.suffix && <span className="text-indigo-600">{s.suffix}</span>}
                                    </div>
                                    <div className="text-[11px] text-slate-400 font-medium">{s.label}</div>
                                </div>
                            );
                        })}
                    </div>

                    <p className="text-[10px] text-slate-400 uppercase tracking-[0.2em] font-bold mb-4">
                        Concursos cobertos
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2.5">
                        {[
                            { tag: "C-EspFN", desc: "Cabo Fuzileiro Naval" },
                            { tag: "C-Hab/Ap-SG", desc: "Sargento" },
                        ].map((c) => (
                            <div key={c.tag} className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-slate-200 hover:border-indigo-200 transition-all">
                                <Anchor size={14} className="text-indigo-600" />
                                <div className="text-left">
                                    <div className="text-xs font-bold text-slate-900">{c.tag}</div>
                                    <div className="text-[10px] text-slate-400">{c.desc}</div>
                                </div>
                            </div>
                        ))}
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
                            <Link href="https://www.mar.mil.br" target="_blank" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Marinha do Brasil</Link>
                            <Link href="/termos" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Termos</Link>
                            <Link href="/privacidade" className="text-xs text-slate-400 hover:text-indigo-500 transition-colors">Privacidade</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
