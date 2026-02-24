"use client";

import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import {
    Activity, Award, Zap,
    Brain, BarChart3, Timer,
    ChevronRight, Play, CheckCircle2, Sparkles, Shield,
    ClipboardList, ListChecks, StickyNote, Settings,
    Trophy, Rocket, BookOpen, Target, GraduationCap
} from "lucide-react";
import { useEffect, useState, useRef } from "react";

/* ── Features reais do app ── */
const features = [
    {
        icon: Brain,
        title: "Quiz Game",
        desc: "Milhares de questões dos principais concursos, elaboradas por especialistas e atualizadas constantemente.",
        bg: "bg-indigo-50",
        text: "text-indigo-600"
    },
    {
        icon: ClipboardList,
        title: "Simulado Semanal",
        desc: "Simulados inéditos todo sábado às 10h. Simule o ambiente real de prova e confira seu ranking.",
        bg: "bg-emerald-50",
        text: "text-emerald-600"
    },
    {
        icon: Trophy,
        title: "Ranking",
        desc: "Compare seu desempenho com outros candidatos e ajuste sua estratégia para ficar no topo.",
        bg: "bg-amber-50",
        text: "text-amber-600"
    },
    {
        icon: BarChart3,
        title: "Desempenho Detalhado",
        desc: "Visualize acertos e erros por assunto. Saiba exatamente onde focar seus estudos.",
        bg: "bg-blue-50",
        text: "text-blue-600"
    },
    {
        icon: Timer,
        title: "Pomodoro Integrado",
        desc: "Otimize foco e produtividade com ciclos de estudo e descanso direto no app.",
        bg: "bg-rose-50",
        text: "text-rose-600"
    },
    {
        icon: ListChecks,
        title: "Criador de Tarefas",
        desc: "Organize sua rotina, crie prazos e acompanhe tudo que precisa estudar.",
        bg: "bg-purple-50",
        text: "text-purple-600"
    },
    {
        icon: StickyNote,
        title: "Anotações",
        desc: "Registre insights e informações importantes enquanto estuda. Tudo em um só lugar.",
        bg: "bg-sky-50",
        text: "text-sky-600"
    },
    {
        icon: Settings,
        title: "Configurações Personalizáveis",
        desc: "Ajuste tempo, filtre por assunto e configure o app do seu jeito.",
        bg: "bg-slate-100",
        text: "text-slate-600"
    },
];

export default function Hero() {
    return (
        <div className="relative bg-slate-50 overflow-hidden font-sans selection:bg-indigo-100 selection:text-indigo-900">

            <style jsx>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes float-subtle {
          0%, 100% { transform: translateY(0px); }
          50%      { transform: translateY(-10px); }
        }
        @keyframes pulse-soft {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50%      { opacity: 0.8; transform: scale(1.05); }
        }
        .animate-fade-in-up {
            animation: fade-in-up 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        
        .bg-grid-pattern {
            background-image: 
                linear-gradient(to right, rgba(0,0,0,0.03) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(0,0,0,0.03) 1px, transparent 1px);
            background-size: 40px 40px;
        }
      `}</style>

            {/* ═══════════════════════════
           HERO - LEVE E CLEAN
         ═══════════════════════════ */}
            <section className="relative min-h-screen pt-32 pb-24 flex flex-col items-center justify-center overflow-hidden">
                {/* Background Decorativo */}
                <div className="absolute inset-0 z-0 bg-grid-pattern [mask-image:radial-gradient(ellipse_at_center,white,transparent_80%)]" />

                {/* Efeitos de Luz Sutis */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-[500px] bg-indigo-50/50 rounded-full blur-3xl opacity-70 pointer-events-none" />
                <div className="absolute -top-32 -left-32 w-96 h-96 bg-blue-100/40 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute top-48 -right-32 w-96 h-96 bg-violet-100/40 rounded-full blur-[100px] pointer-events-none animate-pulse-soft" />

                <div className="relative container mx-auto px-6 z-10 flex flex-col items-center">

                    <div className="max-w-4xl mx-auto text-center flex flex-col items-center mb-16">

                        {/* Title */}
                        <h1 className="animate-fade-in-up delay-100 text-4xl sm:text-5xl md:text-7xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6">
                            A excelência na sua <br className="hidden md:block" />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-500">
                                preparação diária
                            </span>
                        </h1>

                        <p className="animate-fade-in-up delay-200 max-w-2xl text-lg md:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                            Conquiste sua aprovação com uma plataforma moderna, inteligente e focada em resultados reais. Questões, simulados e métricas avançadas em um só lugar.
                        </p>

                        {/* CTAs */}
                        <div className="animate-fade-in-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 w-full sm:w-auto">
                            <Link href="/register" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-xl text-[15px] font-bold text-white bg-slate-900 hover:bg-slate-800 shadow-[0_8px_20px_-6px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_25px_-8px_rgba(0,0,0,0.4)] transition-all hover:-translate-y-0.5">
                                    <GraduationCap size={18} />
                                    Começar minha jornada
                                </button>
                            </Link>
                            <Link href="/pricing" className="w-full sm:w-auto">
                                <button className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 h-14 rounded-xl text-[15px] font-bold text-slate-700 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm transition-all">
                                    Conhecer a plataforma
                                </button>
                            </Link>
                        </div>
                    </div>

                    {/* ── Dashboard Mockup Light & Clean ── */}
                    <div className="animate-fade-in-up delay-400 w-full max-w-5xl mx-auto relative perspective-[2000px]">

                        {/* Shadow Backing para destacar o vidro */}
                        <div className="absolute -inset-1 bg-gradient-to-b from-slate-200/50 to-transparent rounded-[2.5rem] blur-xl opacity-60" />

                        <div className="relative rounded-[2rem] overflow-hidden border border-white/60 bg-white/70 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05),0_0_20px_rgba(255,255,255,0.8)]"
                            style={{ animation: "float-subtle 6s ease-in-out infinite" }}>

                            {/* Browser bar */}
                            <div className="flex items-center gap-2 px-5 py-4 bg-white/40 border-b border-white/50">
                                <div className="flex gap-2.5">
                                    <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300/50" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300/50" />
                                    <div className="w-3 h-3 rounded-full bg-slate-200 border border-slate-300/50" />
                                </div>
                                <div className="flex-1 mx-8 flex justify-center hidden sm:flex">
                                    <div className="flex items-center gap-2 bg-white/60 rounded-lg px-4 py-1.5 border border-slate-200/50 shadow-sm">
                                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                        <span className="text-[11px] text-slate-500 font-medium tracking-tight">bizu.academy.com.br/dashboard</span>
                                    </div>
                                </div>
                            </div>

                            {/* App content mockup - Light Mode */}
                            <div className="flex h-[450px]">
                                {/* Sidebar */}
                                <div className="w-60 bg-white/40 border-r border-slate-100 p-6 hidden md:flex flex-col">
                                    <div className="flex items-center gap-3 mb-10">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-600/20">B!</div>
                                        <span className="text-[16px] font-bold text-slate-800 tracking-tight">Academy.</span>
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        {[
                                            { name: "Visão Geral", icon: BarChart3, active: true },
                                            { name: "Trilha de Estudo", icon: BookOpen, active: false },
                                            { name: "Simulados", icon: ClipboardList, active: false },
                                            { name: "Ranking Elite", icon: Trophy, active: false },
                                            { name: "Metas", icon: Target, active: false },
                                        ].map((item) => {
                                            const Icon = item.icon;
                                            return (
                                                <div key={item.name} className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-semibold transition-all cursor-pointer ${item.active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                                                    }`}>
                                                    <Icon size={16} className={item.active ? "text-indigo-600" : "text-slate-400"} />
                                                    {item.name}
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {/* User Profiling */}
                                    <div className="mt-auto pt-4 border-t border-slate-200">
                                        <div className="flex items-center gap-3 px-2 py-2">
                                            <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs ring-2 ring-white shadow-sm">JV</div>
                                            <div>
                                                <div className="text-[12px] font-bold text-slate-800">Jaime Vicente</div>
                                                <div className="text-[10px] text-slate-400 font-medium">Plano Elite</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Main Content */}
                                <div className="flex-1 bg-slate-50/50 p-6 sm:p-8 overflow-y-auto">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                                        <div>
                                            <h4 className="text-xl font-bold text-slate-800 mb-1">Bom dia, Jaime! ☕</h4>
                                            <p className="text-[13px] text-slate-500 font-medium">Aqui está o seu progresso de hoje. Continue focado.</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 shadow-sm text-[12px] font-bold text-slate-600">
                                                <span className="text-amber-500 text-lg leading-none">🔥</span> 12 Dias de Foco
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Cards */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                                        {[
                                            { l: "Questões Resolvidas", v: "1.847", inc: "+24 hoje", c: "text-indigo-600", bg: "bg-indigo-50" },
                                            { l: "Taxa de Acerto", v: "82%", inc: "+2.1% ref", c: "text-emerald-600", bg: "bg-emerald-50" },
                                            { l: "Horas de Estudo", v: "45h", inc: "Esta semana", c: "text-violet-600", bg: "bg-violet-50" },
                                            { l: "Posição Geral", v: "#23", inc: "Top 5%", c: "text-amber-600", bg: "bg-amber-50" },
                                        ].map((c) => (
                                            <div key={c.l} className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-5 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] transition-transform hover:-translate-y-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className={`w-8 h-8 rounded-lg ${c.bg} flex items-center justify-center`}>
                                                        <Activity size={16} className={c.c} />
                                                    </div>
                                                </div>
                                                <div className="text-2xl font-extrabold text-slate-800 mb-1">{c.v}</div>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold uppercase tracking-wider">{c.l}</span>
                                                    <span className={`text-[10px] font-bold ${c.c}`}>{c.inc}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Progress Panel */}
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        <div className="flex-1 rounded-2xl bg-white border border-slate-100 p-6 shadow-sm">
                                            <div className="text-[13px] font-bold text-slate-800 mb-6">Desempenho por Disciplina</div>
                                            <div className="space-y-5">
                                                {[
                                                    { n: "Língua Portuguesa", p: 88, c: "bg-emerald-500", text: "text-emerald-700" },
                                                    { n: "Direito Constitucional", p: 74, c: "bg-indigo-500", text: "text-indigo-700" },
                                                    { n: "Raciocínio Lógico", p: 65, c: "bg-amber-500", text: "text-amber-700" },
                                                ].map(s => (
                                                    <div key={s.n}>
                                                        <div className="flex justify-between text-[12px] font-bold mb-2.5">
                                                            <span className="text-slate-600">{s.n}</span>
                                                            <span className={s.text}>{s.p}%</span>
                                                        </div>
                                                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                            <div className={`h-full ${s.c} rounded-full`} style={{ width: `${s.p}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="w-full lg:w-1/3 rounded-2xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white p-6 shadow-lg shadow-indigo-900/10 flex flex-col justify-between">
                                            <div>
                                                <div className="text-[13px] font-bold text-indigo-300 mb-2">Próximo Simulado</div>
                                                <div className="text-xl font-bold mb-1">Elite Policial #24</div>
                                                <div className="text-[12px] text-indigo-200/80 mb-6 lg:mb-0">Disponível no sábado às 10h</div>
                                            </div>
                                            <button className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-sm font-bold transition-colors mt-auto">
                                                Ativar Lembrete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           COMO FUNCIONA - ACADEMY STYLE
         ═══════════════════════════ */}
            <section className="py-24 bg-white border-y border-slate-100 flex items-center justify-center">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <span className="text-indigo-600 text-[11px] font-bold uppercase tracking-[0.2em] mb-4 inline-block">
                            Metodologia Comprovada
                        </span>
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
                            Sua jornada até a <span className="font-light italic text-slate-500">aprovação</span>
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                        {[
                            {
                                step: "1",
                                title: "Fundação",
                                desc: "Construa sua base de conhecimento com milhares de questões organizadas e comentadas.",
                                icon: BookOpen,
                            },
                            {
                                step: "2",
                                title: "Prática",
                                desc: "Teste seus limites com simulados semanais que replicam o ambiente real de prova.",
                                icon: Brain,
                            },
                            {
                                step: "3",
                                title: "Evolução",
                                desc: "Acompanhe métricas precisas para lapidar seus pontos fracos e dominar o edital.",
                                icon: Target,
                            },
                        ].map((s) => {
                            const Icon = s.icon;
                            return (
                                <div key={s.step} className="group p-8 rounded-[2rem] bg-slate-50/50 border border-slate-100 hover:bg-white hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] transition-all duration-300">
                                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center mb-6 group-hover:-translate-y-1 transition-transform">
                                        <Icon size={24} className="text-slate-800" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 flex items-center gap-3">
                                        <span className="text-indigo-300 font-light text-2xl">0{s.step}.</span>
                                        {s.title}
                                    </h3>
                                    <p className="text-[15px] text-slate-600 leading-relaxed">{s.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           FUNCIONALIDADES - ELEGANCIA
         ═══════════════════════════ */}
            <section id="funcionalidades" className="py-24 bg-slate-50 flex items-center justify-center">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-6">
                            Ecossistema Completo
                        </h2>
                        <p className="text-slate-600 max-w-2xl mx-auto text-lg">
                            Diga adeus às dezenas de abas abertas. Tudo que você precisa para uma preparação de elite, orquestrado em uma única plataforma.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
                        {features.map((f) => {
                            const Icon = f.icon;
                            return (
                                <div key={f.title} className="bg-white rounded-[1.5rem] p-6 border border-slate-100 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.03)] hover:shadow-lg transition-all duration-300 group">
                                    <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                                        <Icon size={22} className={f.text} />
                                    </div>
                                    <h3 className="text-[16px] font-bold text-slate-900 mb-2">{f.title}</h3>
                                    <p className="text-[14px] text-slate-500 leading-relaxed">{f.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           CTA FINAL - ACADEMY
         ═══════════════════════════ */}
            <section className="py-32 bg-white relative overflow-hidden flex items-center justify-center">
                <div className="container mx-auto px-6 text-center relative z-10 max-w-3xl">
                    <div className="w-20 h-20 mx-auto bg-slate-900 rounded-[2rem] flex items-center justify-center mb-8 shadow-xl shadow-slate-900/20 rotate-3 cursor-default hover:rotate-0 transition-transform">
                        <GraduationCap size={40} className="text-white" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6 tracking-tight">
                        Seu futuro começa <span className="text-indigo-600">agora</span>
                    </h2>
                    <p className="text-slate-600 text-lg md:text-xl mb-12 max-w-xl mx-auto leading-relaxed">
                        Junte-se à elite dos aprovados. Experimente o Bizu Academy e transforme sua forma de estudar hoje mesmo.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link href="/register">
                            <button className="flex items-center justify-center gap-2 px-10 h-[60px] rounded-xl text-[16px] font-bold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-600/25 hover:shadow-xl hover:shadow-indigo-600/40 hover:-translate-y-1 transition-all w-full sm:w-auto">
                                <Rocket size={20} />
                                Criar conta gratuita
                            </button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* ═══════════════════════════
           FOOTER - MINIMAL
         ═══════════════════════════ */}
            <footer className="py-12 bg-white border-t border-slate-100 flex items-center justify-center">
                <div className="container mx-auto px-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6 max-w-6xl mx-auto">
                        <div className="flex items-center gap-2">
                            <BrandLogo size="sm" variant="dark" link={false} />
                            <span className="text-slate-300">|</span>
                            <span className="text-sm font-medium text-slate-500">Academy</span>
                        </div>
                        <p className="text-sm text-slate-400">© 2026 Bizu! Academy · O padrão de excelência.</p>
                        <div className="flex gap-6">
                            <Link href="/termos" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Termos</Link>
                            <Link href="/privacidade" className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors">Privacidade</Link>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
