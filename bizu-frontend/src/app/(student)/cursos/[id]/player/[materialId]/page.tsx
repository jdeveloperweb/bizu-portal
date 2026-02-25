"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Download, Share2, Maximize2, FileText, ChevronLeft, Play, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";

export default function CoursePlayerPage() {
    const params = useParams<{ id: string | string[]; materialId: string | string[] }>();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;
    const materialId = Array.isArray(params.materialId) ? params.materialId[0] : params.materialId;
    const [course, setCourse] = useState<any>(null);
    const [module, setModule] = useState<any>(null);
    const [currentMaterial, setCurrentMaterial] = useState<any>(null);
    const [isCompleted, setIsCompleted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!courseId || !materialId) {
            setIsLoading(false);
            return;
        }

        const fetchContent = async () => {
            setIsLoading(true);
            try {
                const courseRes = await apiFetch(`/public/courses/${courseId}`);
                if (courseRes.ok) {
                    const courseData = await courseRes.json();
                    setCourse(courseData);

                    let foundModule = null;
                    let foundMaterial = null;

                    for (const mod of (courseData.modules || [])) {
                        const mat = mod.materials?.find((m: any) => m.id === materialId);
                        if (mat) {
                            foundModule = mod;
                            foundMaterial = mat;
                            break;
                        }
                    }

                    setModule(foundModule);
                    setCurrentMaterial(foundMaterial);

                    // Check completion if material exists
                    if (foundMaterial) {
                        const compRes = await apiFetch(`/student/materials/completed`);
                        if (compRes.ok) {
                            const completedIds = await compRes.json();
                            setIsCompleted(completedIds.includes(materialId));
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch player content", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchContent();
    }, [courseId, materialId]);

    const toggleCompletion = async () => {
        try {
            const res = await apiFetch(`/student/materials/${materialId}/complete`, {
                method: 'POST'
            });
            if (res.ok) {
                setIsCompleted(!isCompleted);
            }
        } catch (error) {
            console.error("Failed to toggle completion", error);
        }
    };

    if (isLoading) return <div className="p-20 text-center text-foreground">Carregando player...</div>;
    if (!currentMaterial) return (
        <div className="p-20 text-center">
            <h2 className="text-2xl font-bold mb-4">Material não encontrado.</h2>
            <Link href={`/cursos/${courseId}`}>
                <Button>Voltar para o Curso</Button>
            </Link>
        </div>
    );

    const materials = module?.materials || [];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/cursos/${courseId}`}>
                        <Button variant="ghost" className="rounded-xl flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ChevronLeft className="w-5 h-5 text-primary" />
                            Voltar ao Curso
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-slate-200 hidden md:block" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{currentMaterial.title}</h2>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{module?.title || course?.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-2xl px-4 flex items-center gap-2 border-slate-200">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Compartilhar</span>
                    </Button>
                    <Button
                        className="rounded-2xl px-6 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10"
                        onClick={() => window.open(currentMaterial.fileUrl, '_blank')}
                    >
                        <Download className="w-4 h-4" />
                        Download Material
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Video/PDF) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Player Area */}
                    <div className="aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl relative group">
                        {currentMaterial.fileType === 'VIDEO' ? (
                            (currentMaterial.fileUrl.includes('youtube.com') || currentMaterial.fileUrl.includes('vimeo.com')) ? (
                                <iframe
                                    src={currentMaterial.fileUrl}
                                    className="w-full h-full border-none"
                                    allowFullScreen
                                    title={currentMaterial.title}
                                />
                            ) : (
                                <video
                                    src={currentMaterial.fileUrl}
                                    className="w-full h-full"
                                    controls
                                    poster={course?.thumbnailUrl}
                                />
                            )
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/10">
                                <FileText className="w-20 h-20 text-primary mb-4" />
                                <p className="text-xl font-bold">{currentMaterial.title}</p>
                                <Button
                                    className="mt-6 rounded-2xl"
                                    onClick={() => window.open(currentMaterial.fileUrl, '_blank')}
                                >
                                    Abrir Documento
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-card border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                Detalhes da Aula
                            </h3>
                            <Button
                                variant={isCompleted ? "default" : "ghost"}
                                className={cn("font-bold gap-2", isCompleted ? "bg-success hover:bg-success/90 text-white" : "text-success")}
                                onClick={toggleCompletion}
                            >
                                <CheckCircle2 className={cn("w-4 h-4", isCompleted && "fill-current")} />
                                {isCompleted ? "Concluída" : "Marcar como Concluída"}
                            </Button>
                        </div>
                        <div className="text-muted-foreground leading-relaxed">
                            {currentMaterial.description || "Nenhuma descrição disponível para esta aula."}
                        </div>
                        {currentMaterial.content && (
                            <div className="mt-8 pt-8 border-t prose dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: currentMaterial.content }} />
                        )}
                    </div>
                </div>

                {/* Sidebar - Playlist */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[40px] bg-card border shadow-sm flex flex-col h-[600px] overflow-hidden">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Play className="w-5 h-5 text-amber-500" />
                            Aulas do Módulo
                        </h3>
                        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            {materials.map((item: any, idx: number) => (
                                <Link key={item.id} href={`/cursos/${courseId}/player/${item.id}`}>
                                    <div className={cn(
                                        "p-5 rounded-3xl text-sm transition-all cursor-pointer border group mb-2",
                                        materialId === item.id
                                            ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/10"
                                            : "hover:bg-muted border-transparent text-foreground"
                                    )}>
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={materialId === item.id ? "opacity-80 text-[10px] font-bold" : "text-muted-foreground text-[10px] uppercase font-bold tracking-widest"}>Aula {idx + 1}</span>
                                            {materialId === item.id && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                        </div>
                                        <div className="font-bold flex items-center gap-2">
                                            {item.fileType === 'VIDEO' ? <Play className="w-3 h-3 fill-current" /> : <FileText className="w-3 h-3" />}
                                            <span className="truncate">{item.title}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    <div className="p-2">
                        <Link href={`/estudar/${module?.id}`} className="block">
                            <Button className="w-full h-16 rounded-[28px] font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                                <CheckCircle2 className="w-6 h-6" />
                                Fazer Quiz do Módulo
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
