"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Download, Share2, ZoomIn, ZoomOut, Maximize2, FileText, ChevronLeft, Play, Info, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function MaterialViewerPage({ params }: { params: { id: string } }) {
    const [module, setModule] = useState<any>(null);
    const [activeMaterialIdx, setActiveMaterialIdx] = useState(0);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchModule = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch(`/public/modules/${params.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setModule(data);
                }
            } catch (error) {
                console.error("Failed to fetch module", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchModule();
    }, [params.id]);

    if (isLoading) return <div className="p-20 text-center text-foreground">Carregando conteúdo do módulo...</div>;
    if (!module) return <div className="p-20 text-center text-danger">Módulo não encontrado.</div>;

    const materials = module.materials || [];
    const currentMaterial = materials[activeMaterialIdx];

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/cursos/${module.courseId || ""}`}>
                        <Button variant="ghost" className="rounded-xl flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
                            <ChevronLeft className="w-5 h-5 text-primary" />
                            Voltar ao Curso
                        </Button>
                    </Link>
                    <div className="h-6 w-px bg-slate-200 hidden md:block" />
                    <div>
                        <h2 className="text-xl font-bold text-foreground">{currentMaterial?.title || module.title}</h2>
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest">{module.title}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" className="rounded-2xl px-4 flex items-center gap-2 border-slate-200">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Compartilhar</span>
                    </Button>
                    <Button
                        className="rounded-2xl px-6 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10"
                        onClick={() => currentMaterial?.fileUrl && window.open(currentMaterial.fileUrl, '_blank')}
                        disabled={!currentMaterial}
                    >
                        <Download className="w-4 h-4" />
                        Download Material
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Content (Video/PDF) */}
                <div className="lg:col-span-8 space-y-6">
                    {/* Video Player Area */}
                    <div className="aspect-video bg-black rounded-[40px] overflow-hidden shadow-2xl relative group">
                        {currentMaterial?.fileType === 'VIDEO' ? (
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
                                    poster={module.thumbnailUrl}
                                />
                            )
                        ) : currentMaterial ? (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/20">
                                <FileText className="w-20 h-20 text-primary mb-4" />
                                <p className="text-xl font-bold">{currentMaterial.title}</p>
                                <Button
                                    className="mt-6 rounded-2xl"
                                    onClick={() => window.open(currentMaterial.fileUrl, '_blank')}
                                >
                                    Ver Documento Completo
                                </Button>
                            </div>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-muted/20">
                                <p className="text-muted-foreground">Nenhum material selecionado</p>
                            </div>
                        )}

                        {/* Playback Controls Overlay (Simulado se não for iframe) */}
                        {!currentMaterial?.fileUrl.includes('youtube') && !currentMaterial?.fileUrl.includes('vimeo') && currentMaterial?.fileType === 'VIDEO' && (
                            <div className="absolute bottom-0 left-0 right-0 p-8 pt-20 bg-gradient-to-t from-slate-950 to-transparent">
                                <div className="h-1 w-full bg-slate-700 rounded-full mb-4">
                                    <div className="h-full w-1/3 bg-primary rounded-full" />
                                </div>
                                <div className="flex items-center justify-between text-white text-sm font-bold">
                                    <span>00:00 / 00:00</span>
                                    <div className="flex items-center gap-4">
                                        <span className="hover:text-primary cursor-pointer">1.0x</span>
                                        <Maximize2 className="w-5 h-5 hover:text-primary cursor-pointer" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* PDF/Material Description */}
                    <div className="bg-card border-2 border-slate-100 dark:border-slate-800 rounded-[40px] p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                Sobre este conteúdo
                            </h3>
                        </div>
                        <div className="text-muted-foreground leading-relaxed">
                            {currentMaterial?.description || "Inicie seus estudos com este conteúdo preparado pela nossa equipe técnica."}
                        </div>
                    </div>
                </div>

                {/* Sidebar - Lesson List */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-8 rounded-[40px] bg-card border shadow-sm flex flex-col h-[700px] overflow-hidden">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Play className="w-5 h-5 text-amber-500" />
                            Conteúdo do Módulo
                        </h3>
                        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            {materials.map((item: any, idx: number) => (
                                <div key={item.id}
                                    onClick={() => setActiveMaterialIdx(idx)}
                                    className={cn(
                                        "p-5 rounded-3xl text-sm transition-all cursor-pointer border group",
                                        activeMaterialIdx === idx
                                            ? "bg-primary border-primary text-primary-foreground shadow-xl shadow-primary/10"
                                            : "hover:bg-muted border-transparent text-foreground"
                                    )}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={activeMaterialIdx === idx ? "opacity-80 text-[10px] font-bold" : "text-muted-foreground text-[10px] uppercase font-bold tracking-widest"}>Conteúdo {idx + 1}</span>
                                        {activeMaterialIdx === idx && <div className="w-2 h-2 rounded-full bg-white animate-pulse" />}
                                    </div>
                                    <div className="font-bold flex items-center gap-2">
                                        {item.fileType === 'VIDEO' ? <Play className="w-3 h-3 fill-current" /> : <FileText className="w-3 h-3" />}
                                        {item.title}
                                    </div>
                                    <div className={cn("text-[11px] mt-2 flex items-center gap-1", activeMaterialIdx === idx ? "opacity-80" : "text-muted-foreground")}>
                                        <span className="uppercase">{item.fileType}</span>
                                    </div>
                                </div>
                            ))}
                            {materials.length === 0 && (
                                <div className="text-center py-10 text-muted-foreground italic">
                                    Nenhum material cadastrado neste módulo.
                                </div>
                            )}
                        </div>
                    </div>

                    <Link href={`/estudar/${module.id}`} className="block">
                        <Button className="w-full h-16 rounded-[28px] font-black text-lg gap-3 shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform">
                            <CheckCircle2 className="w-6 h-6" />
                            Fazer Quiz do Módulo
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

