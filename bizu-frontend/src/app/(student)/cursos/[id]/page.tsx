"use client";

import { useState, useEffect, useMemo } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
    ChevronRight, Play, CheckCircle2,
    Star, Clock, FileText
} from "lucide-react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useParams } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import { Lock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CourseDetailsPage() {
    const params = useParams<{ id: string | string[] }>();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const [course, setCourse] = useState<any>(null);
    const [activeModule, setActiveModule] = useState(0);
    const [completedMaterials, setCompletedMaterials] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { isFree, isPremium } = useAuth();

    const router = useRouter();

    const handleViewMaterial = (material: any) => {
        router.push(`/cursos/${courseId}/player/${material.id}`);
    };

    const handleMaterialComplete = (materialId: string) => {
        setCompletedMaterials(prev => [...prev, materialId]);
    };

    useEffect(() => {
        if (!courseId) {
            setIsLoading(false);
            return;
        }

        const fetchCourse = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch(`/public/courses/${courseId}`);
                if (res.ok) {
                    const data = await res.json();
                    setCourse(data);

                    // Fetch completions
                    const compRes = await apiFetch('/student/materials/completed');
                    if (compRes.ok) {
                        setCompletedMaterials(await compRes.json());
                    }
                }
            } catch (error) {
                console.error("Failed to fetch course", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourse();
    }, [courseId]);

    const completedMaterialsSet = useMemo(() => new Set(completedMaterials), [completedMaterials]);
    const currentModule = course?.modules?.[activeModule];

    const progressData = useMemo(() => {
        const modules = course?.modules || [];

        let totalWeight = 0;
        let completedWeight = 0;

        const moduleProgressMap: Record<string, number> = {};

        modules.forEach((module: any) => {
            const materials = module.materials || [];
            const moduleWeight = materials.length;
            if (moduleWeight <= 0) {
                moduleProgressMap[module.id] = 0;
                return;
            }

            totalWeight += moduleWeight;

            const completedMaterials = materials.filter((material: any) => completedMaterialsSet.has(material.id)).length;
            const moduleCompletedWeight = completedMaterials;
            const moduleProgress = Math.min(100, Math.round((moduleCompletedWeight / moduleWeight) * 100));

            moduleProgressMap[module.id] = moduleProgress;
            completedWeight += (moduleProgress / 100) * moduleWeight;
        });

        const overallProgress = totalWeight > 0 ? Math.min(100, Math.round((completedWeight / totalWeight) * 100)) : 0;

        return { overallProgress, moduleProgressMap };
    }, [course, completedMaterialsSet]);

    const moduleStatus = useMemo(() => {
        if (!currentModule) return null;
        const progress = progressData.moduleProgressMap[currentModule.id] || 0;
        if (progress === 100) return {
            label: "Refazer Módulo",
            color: "bg-success hover:bg-success/90",
            shadow: "shadow-success/20",
            status: "completed"
        };
        if (progress > 0) return {
            label: "Continuar",
            color: "bg-[#F59E0B] hover:bg-[#F59E0B]/90",
            shadow: "shadow-[#F59E0B]/20",
            status: "in_progress"
        };
        return {
            label: "Começar Módulo",
            color: "bg-danger hover:bg-danger/90",
            shadow: "shadow-danger/20",
            status: "not_started"
        };
    }, [currentModule, progressData.moduleProgressMap]);

    if (isLoading) return <div className="p-20 text-center">Carregando detalhes do curso...</div>;
    if (!course) return <div className="p-20 text-center text-danger">Curso não encontrado.</div>;


    return (
        <div className="w-full px-4 lg:px-8 py-8 lg:py-10">
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
                        <span className="text-primary">{progressData.overallProgress}%</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden border">
                        <div
                            className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000"
                            style={{ width: `${progressData.overallProgress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-10 items-start">
                {/* Module Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2 mb-4">Trilha do Curso</h3>
                    {course.modules?.map((mod: any, idx: number) => (
                        <div
                            key={mod.id}
                            onClick={() => setActiveModule(idx)}
                            className={cn(
                                "p-5 rounded-3xl border-2 transition-all cursor-pointer group flex items-start gap-4 backdrop-blur-sm",
                                activeModule === idx
                                    ? "bg-white border-primary shadow-[0_20px_40px_rgba(var(--primary),0.15)] ring-1 ring-primary/5 scale-[1.02]"
                                    : "bg-white/40 border-slate-100 hover:border-slate-200 hover:bg-white/60"
                            )}
                        >
                            <div className={cn(
                                "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-all duration-500 group-hover:rotate-6",
                                activeModule === idx
                                    ? (progressData.moduleProgressMap[mod.id] === 100 ? "bg-success text-white shadow-lg shadow-success/30" :
                                        progressData.moduleProgressMap[mod.id] > 0 ? "bg-[#F59E0B] text-white shadow-lg shadow-[#F59E0B]/30" :
                                            "bg-danger text-white shadow-lg shadow-danger/30")
                                    : (progressData.moduleProgressMap[mod.id] === 100 ? "bg-success/10 text-success" :
                                        progressData.moduleProgressMap[mod.id] > 0 ? "bg-[#F59E0B]/10 text-[#F59E0B]" :
                                            "bg-danger/10 text-danger")
                            )}>
                                <Play className={cn("w-6 h-6", activeModule === idx || progressData.moduleProgressMap[mod.id] > 0 ? "fill-current" : "fill-transparent")} />
                            </div>

                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="font-bold text-lg leading-tight truncate">{mod.title}</div>
                                    {isFree && !mod.isFree && (
                                        <Lock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                                    )}
                                </div>
                                <div className="text-xs text-muted-foreground line-clamp-1">{mod.description || "Inicie o estudo deste módulo."}</div>
                                <div className="mt-2 text-[11px] font-bold text-muted-foreground">{progressData.moduleProgressMap[mod.id] || 0}% concluído</div>
                            </div>

                            {activeModule === idx && <ChevronRight className="w-5 h-5 text-primary self-center" />}
                        </div>
                    ))}
                    {(!course.modules || course.modules.length === 0) && (
                        <div className="p-8 text-center bg-muted/20 rounded-xl border border-dashed">
                            Nenhum módulo cadastrado.
                        </div>
                    )}
                </div>

                {/* Selected Module Content */}
                <div className="lg:col-span-8">
                    {currentModule ? (
                        isFree && !currentModule.isFree ? (
                            <PremiumFeatureCard courseId={course.id} />
                        ) : (
                            <div className="p-6 md:p-8 rounded-2xl bg-card border shadow-xl relative overflow-hidden min-h-[calc(100vh-220px)]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                                <div className="relative z-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 pb-8 border-b">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-3xl font-black">{currentModule.title}</h2>
                                                {currentModule.isFree && (
                                                    <span className="bg-success/10 text-success text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-success/20">
                                                        Gratuito
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-muted-foreground">{currentModule.description}</p>
                                        </div>
                                        <button
                                            onClick={() => handleViewMaterial(currentModule.materials[0])}
                                            className={cn(
                                                "rounded-2xl h-14 px-8 font-black gap-2 text-lg shadow-xl transition-all hover:scale-105 shrink-0 border-none text-white flex items-center justify-center",
                                                moduleStatus?.color,
                                                moduleStatus?.shadow
                                            )}
                                        >
                                            <Play className="w-5 h-5 fill-current" />
                                            {moduleStatus?.label}
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                        <div className="space-y-6">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Star className="w-4 h-4 text-primary animate-pulse" />
                                                Objetivos do Módulo
                                            </h4>
                                            <ul className="space-y-4">
                                                {currentModule.objectives ? (
                                                    currentModule.objectives.split('\n').filter((line: string) => line.trim() !== "").map((objective: string, index: number) => (
                                                        <li key={index} className="flex items-start gap-3 text-sm font-bold text-slate-600 group/item transition-all hover:translate-x-1">
                                                            <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(var(--primary),0.6)] group-hover/item:scale-125 transition-transform" />
                                                            {objective}
                                                        </li>
                                                    ))
                                                ) : (
                                                    <>
                                                        <li className="flex items-start gap-3 text-sm font-bold text-slate-500/70 italic">
                                                            <div className="w-2 h-2 rounded-full bg-slate-300 mt-1.5 shrink-0" />
                                                            Objetivos ainda não definidos para este módulo.
                                                        </li>
                                                    </>
                                                )}
                                            </ul>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                                <Clock className="w-4 h-4 text-primary" />
                                                Informações do Percurso
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100/50 flex flex-col items-center justify-center transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                                                    <div className="text-3xl font-black text-slate-900">{currentModule.materials?.length || 0}</div>
                                                    <div className="text-[10px] uppercase font-bold text-primary tracking-tighter">Aulas</div>
                                                </div>
                                                <div className="p-5 rounded-[2rem] bg-slate-50 border border-slate-100/50 flex flex-col items-center justify-center transition-all hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1">
                                                    <div className="text-3xl font-black text-slate-900">{currentModule.durationMinutes || 0}</div>
                                                    <div className="text-[10px] uppercase font-bold text-primary tracking-tighter">Minutos</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-10 border-t">
                                        <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Aulas Disponíveis</h4>
                                        {currentModule.materials && currentModule.materials.length > 0 ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {currentModule.materials.map((material: any) => (
                                                    <div
                                                        key={material.id}
                                                        onClick={() => handleViewMaterial(material)}
                                                        className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-white hover:shadow-lg transition-all group cursor-pointer"
                                                    >
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                                                            completedMaterials.includes(material.id) ? "bg-success/10 text-success" : "bg-white text-slate-400 group-hover:text-primary transition-colors"
                                                        )}>
                                                            {completedMaterials.includes(material.id) ? (
                                                                <CheckCircle2 className="w-5 h-5" />
                                                            ) : (
                                                                (material.fileType === 'VIDEO' || (material.fileUrl && (material.fileUrl.includes('youtube.com') || material.fileUrl.includes('vimeo.com') || material.fileUrl.includes('youtu.be') || material.fileUrl.match(/\.(mp4|webm|mov|m4v)$/i)))) ? <Play className="w-5 h-5 fill-current" /> : <FileText className="w-5 h-5" />
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="font-bold text-sm truncate group-hover:text-primary transition-colors">{material.title}</div>
                                                            <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{material.fileType || 'AULA'}</div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-10 bg-slate-50 rounded-xl border border-dashed text-sm text-slate-400">
                                                Nenhuma aula disponível para este módulo ainda.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="p-10 text-center bg-card border rounded-2xl shadow-sm min-h-[420px] flex items-center justify-center">
                            Selecione um módulo para ver o conteúdo.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
