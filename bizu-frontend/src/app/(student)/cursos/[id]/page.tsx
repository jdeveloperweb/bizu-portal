"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
    ChevronRight, Play, CheckCircle2, Lock,
    Star, Clock, FileText, BookOpen,
    Download
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function CourseDetailsPage({ params }: { params: { id: string } }) {
    const [course, setCourse] = useState<any>(null);
    const [activeModule, setActiveModule] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchCourse = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch(`/public/courses/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);
                }
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [params.id]);

    if (isLoading) return <div className="p-20 text-center">Carregando detalhes do curso...</div>;
    if (!course) return <div className="p-20 text-center text-danger">Curso não encontrado.</div>;

    const currentModule = course.modules?.[activeModule];

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
                <div className="flex-1">
                    <PageHeader
                        title={course.title}
                        description={course.description || "Domine todos os pontos do edital com nossa metodologia de elite."}
                        badge="CURSO ATIVO"
                    />
                </div>

                <div className="lg:w-80 flex flex-col justify-center gap-4">
                    <div className="flex items-center justify-between text-sm font-bold mb-1">
                        <span>Progresso Total</span>
                        <span className="text-primary">0%</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden border">
                        <div
                            className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000"
                            style={{ width: `0%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Module Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2 mb-4">Trilha do Curso</h3>
                    {course.modules?.map((mod: any, idx: number) => (
                        <div
                            key={mod.id}
                            onClick={() => setActiveModule(idx)}
                            className={cn(
                                "p-6 rounded-[32px] border transition-all cursor-pointer group flex items-start gap-4",
                                activeModule === idx ? "bg-card border-primary/30 shadow-xl ring-1 ring-primary/10" : "hover:bg-muted/50 border-transparent"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110 bg-primary/10 text-primary"
                            )}>
                                <Play className="w-6 h-6 fill-primary/20" />
                            </div>

                            <div className="flex-1">
                                <div className="font-bold text-lg leading-tight mb-1">{mod.title}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">{mod.description || "Inicie o estudo deste módulo."}</div>
                            </div>

                            {activeModule === idx && <ChevronRight className="w-5 h-5 text-primary self-center" />}
                        </div>
                    ))}
                    {(!course.modules || course.modules.length === 0) && (
                        <div className="p-8 text-center bg-muted/20 rounded-3xl border border-dashed">
                            Nenhum módulo cadastrado.
                        </div>
                    )}
                </div>

                {/* Selected Module Content */}
                <div className="lg:col-span-8 space-y-10">
                    {currentModule ? (
                        <div className="p-10 rounded-[48px] bg-card border shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                            <div className="relative z-10">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                    <div>
                                        <h2 className="text-3xl font-black mb-2">{currentModule.title}</h2>
                                        <p className="text-muted-foreground">{currentModule.description}</p>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Link href={`/materiais?moduleId=${currentModule.id}`}>
                                            <Button variant="outline" className="rounded-2xl h-14 px-8 font-black gap-2 text-lg border-2 hover:bg-slate-50 transition-all">
                                                <FileText className="w-5 h-5" />
                                                Ver Materiais
                                            </Button>
                                        </Link>
                                        <Link href={`/estudar/${currentModule.id}`}>
                                            <Button className="rounded-2xl h-14 px-8 font-black gap-2 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                                <Play className="w-5 h-5 fill-current" />
                                                Fazer Quiz
                                            </Button>
                                        </Link>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Star className="w-4 h-4 text-primary" />
                                            Objetivos do Módulo
                                        </h4>
                                        <ul className="space-y-4">
                                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                Compreender a fundamentação teórica
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                Praticar com questões de concursos anteriores
                                            </li>
                                            <li className="flex items-center gap-3 text-sm font-bold text-slate-600">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                Dominar os principais pontos do edital
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-primary" />
                                            Recursos
                                        </h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-3xl bg-muted/30 text-center">
                                                <div className="text-2xl font-black">{currentModule.orderIndex || activeModule + 1}</div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Posição</div>
                                            </div>
                                            <div className="p-4 rounded-3xl bg-muted/30 text-center">
                                                <div className="text-2xl font-black">?</div>
                                                <div className="text-[10px] uppercase font-bold text-muted-foreground">Conteúdos</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 pt-10 border-t">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Materiais Disponíveis</h4>
                                    {currentModule.materials && currentModule.materials.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {currentModule.materials.map((material: any) => (
                                                <Link key={material.id} href={`/materiais/${material.id}`}>
                                                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-lg transition-all group">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                            material.fileType === 'VIDEO' ? "bg-indigo-50 text-indigo-600" : "bg-rose-50 text-rose-600"
                                                        )}>
                                                            {material.fileType === 'VIDEO' ? <Play className="w-5 h-5 fill-current" /> : <FileText className="w-5 h-5" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-sm font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{material.title}</div>
                                                            <div className="text-[10px] text-muted-foreground uppercase font-black">{material.fileType}</div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-colors" />
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-10 bg-slate-50 rounded-3xl border border-dashed text-sm text-slate-400">
                                            Nenhum material disponível para este módulo ainda.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="p-10 text-center">Selecione um módulo para ver o conteúdo.</div>
                    )}
                </div>
            </div>
        </div>
    );
}
