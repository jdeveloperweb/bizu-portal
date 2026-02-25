"use client";

import { Button } from "@/components/ui/button";
import { Download, Share2, ZoomIn, ZoomOut, Maximize2, FileText, ChevronLeft, Play, Info } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MaterialViewerPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/cursos">
                        <Button variant="ghost" className="rounded-xl flex items-center gap-2 hover:bg-slate-100">
                            <ChevronLeft className="w-5 h-5 text-indigo-600" />
                            Voltar ao Curso
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-slate-200 hidden md:block" />
                    <div>
                        <h2 className="text-xl font-bold text-slate-800">Aula 02: Atos Administrativos</h2>
                        <p className="text-xs font-medium text-slate-500 uppercase tracking-widest">Direito Administrativo</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-2xl px-4 flex items-center gap-2 border-slate-200">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Compartilhar</span>
                    </Button>
                    <Button className="rounded-2xl px-6 flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100">
                        <Download className="w-4 h-4" />
                        Download Apostila
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Video/PDF) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Video Player Area */}
                    <div className="aspect-video bg-slate-900 rounded-[40px] overflow-hidden shadow-2xl relative group">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-indigo-600 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform shadow-2xl shadow-indigo-500/20">
                                <Play className="w-8 h-8 fill-current ml-1" />
                            </div>
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-slate-950 to-transparent">
                            <div className="h-1 w-full bg-slate-700 rounded-full mb-4">
                                <div className="h-full w-1/3 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                            </div>
                            <div className="flex items-center justify-between text-white text-sm font-bold">
                                <span>12:45 / 45:00</span>
                                <div className="flex items-center gap-4">
                                    <span className="hover:text-indigo-400 cursor-pointer">1.0x</span>
                                    <Maximize2 className="w-5 h-5 hover:text-indigo-400 cursor-pointer" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* PDF/Material Preview Secondary */}
                    <div className="bg-card border-2 border-slate-100 rounded-[40px] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <FileText className="w-5 h-5 text-rose-500" />
                                Material da Aula
                            </h3>
                            <Button variant="ghost" className="text-indigo-600 font-bold hover:bg-indigo-50">Zoom Máximo</Button>
                        </div>
                        <div className="aspect-[1/1.4] bg-slate-50 rounded-3xl p-10 border border-slate-100 overflow-hidden relative">
                            {/* Mock PDF Content Snippet */}
                            <div className="space-y-6 max-w-xl mx-auto opacity-60">
                                <div className="h-8 w-1/3 bg-slate-200 rounded-lg" />
                                <div className="space-y-3">
                                    <div className="h-3 w-full bg-slate-200 rounded-full" />
                                    <div className="h-3 w-5/6 bg-slate-200 rounded-full" />
                                </div>
                                <div className="p-6 bg-white border rounded-2xl space-y-3">
                                    <div className="h-3 w-1/2 bg-slate-200 rounded-full" />
                                    <div className="h-3 w-full bg-slate-100 rounded-full" />
                                </div>
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-50 flex items-end justify-center pb-12">
                                <Button className="rounded-2xl font-black gap-2 shadow-xl">
                                    Abrir em Tela Cheia
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar - Lesson List */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[40px] bg-card border shadow-sm flex flex-col h-[700px]">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Info className="w-5 h-5 text-amber-500" />
                            Conteúdo do Módulo
                        </h3>
                        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            {[
                                { title: "01. Conceitos Fundamentais", duration: "12:00", active: false },
                                { title: "02. Atos Administrativos", duration: "45:00", active: true },
                                { title: "03. Poderes do Estado", duration: "32:00", active: false },
                                { title: "04. Licitações - Parte 1", duration: "55:00", active: false },
                                { title: "05. Licitações - Parte 2", duration: "48:00", active: false },
                                { title: "06. Exercícios de Fixação", duration: "20:00", active: false },
                            ].map((item, idx) => (
                                <div key={idx} className={cn(
                                    "p-5 rounded-3xl text-sm transition-all cursor-pointer border group",
                                    item.active
                                        ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100"
                                        : "hover:bg-slate-50 border-transparent text-slate-600"
                                )}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={item.active ? "text-indigo-200 text-[10px] font-bold" : "text-slate-400 text-[10px] uppercase font-bold tracking-widest"}>Aula {idx + 1}</span>
                                        {item.active && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                    </div>
                                    <div className="font-bold">{item.title}</div>
                                    <div className={cn("text-[11px] mt-2 flex items-center gap-1", item.active ? "text-indigo-200" : "text-slate-400")}>
                                        <Play size={10} className={item.active ? "fill-current" : ""} /> {item.duration}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-8 rounded-[40px] bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 text-center">
                        <h4 className="font-bold text-amber-900 mb-2">Dúvidas?</h4>
                        <p className="text-xs text-amber-700 font-medium mb-6 leading-relaxed">Nossos professores respondem em até 24h na comunidade.</p>
                        <Button variant="outline" className="w-full rounded-2xl font-extrabold border-amber-200 text-amber-900 hover:bg-amber-100">Acessar Fórum</Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

