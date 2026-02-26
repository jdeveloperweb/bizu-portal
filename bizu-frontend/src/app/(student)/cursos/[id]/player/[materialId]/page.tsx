"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Download, Share2, FileText, ChevronLeft, Play, Info, CheckCircle2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { getVideoEmbedUrl } from "@/lib/video-embed";
import { useGamification } from "@/components/gamification/GamificationProvider";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function CoursePlayerPage() {
    const { showReward } = useGamification();
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
                const reward = await res.json();
                setIsCompleted(!isCompleted);
                if (reward) {
                    showReward(reward);
                }
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
    const normalizedFileType = currentMaterial.fileType?.trim().toUpperCase();
    const isVideo = normalizedFileType === "VIDEO";
    const isArticle = normalizedFileType === "ARTICLE";
    const isPdf = normalizedFileType === "PDF" || currentMaterial.fileUrl?.toLowerCase().includes(".pdf");
    const hasDownloadUrl = Boolean(currentMaterial.fileUrl?.trim());
    const embedVideoUrl = isVideo ? getVideoEmbedUrl(currentMaterial.fileUrl) : null;

    return (
        <div className="w-full px-4 lg:px-8 py-6 lg:py-8">
            {/* Header / Breadcrumb */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
                <div className="flex items-center gap-4">
                    <Link href={`/cursos/${courseId}`}>
                        <Button variant="ghost" className="rounded-lg flex items-center gap-2 hover:bg-slate-100 dark:hover:bg-slate-800">
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
                    <Button variant="outline" className="rounded-lg px-4 flex items-center gap-2 border-slate-200">
                        <Share2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Compartilhar</span>
                    </Button>
                    {hasDownloadUrl && (
                        <Button
                            className="rounded-lg px-6 flex items-center gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/10"
                            onClick={() => window.open(currentMaterial.fileUrl, '_blank')}
                        >
                            <Download className="w-4 h-4" />
                            Download Material
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8 items-stretch">
                {/* Main Content (Video/PDF) */}
                <div className="lg:col-span-8 space-y-4 min-h-[calc(100vh-180px)] flex flex-col">
                    {/* Player Area */}
                    <div className="flex-1 min-h-[420px] bg-black rounded-2xl overflow-hidden shadow-xl relative group border border-slate-900/40">
                        {isVideo ? (
                            embedVideoUrl ? (
                                <iframe
                                    src={embedVideoUrl}
                                    className="w-full h-full border-none"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin"
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
                        ) : isPdf ? (
                            <iframe
                                src={`${currentMaterial.fileUrl}#toolbar=1&navpanes=0&scrollbar=1`}
                                className="w-full h-full border-none bg-white"
                                title={currentMaterial.title}
                            />
                        ) : isArticle ? (
                            <div className="w-full h-full bg-white text-slate-900 overflow-y-auto">
                                <article className="max-w-4xl mx-auto px-8 sm:px-12 lg:px-20 py-16 sm:py-20">
                                    <div className="text-center mb-14">
                                        <span className="bg-blue-600/10 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block">Artigo</span>
                                        <h1 className="text-3xl sm:text-4xl font-[900] text-slate-900 mt-8 tracking-tight leading-tight">
                                            {currentMaterial.title}
                                        </h1>
                                    </div>
                                    <div className="prose prose-lg max-w-none text-slate-600 leading-[1.8]">
                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                            {currentMaterial.content || currentMaterial.description || "Sem conteúdo para este artigo."}
                                        </ReactMarkdown>
                                    </div>
                                </article>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-muted/10 p-6 text-center">
                                <FileText className="w-16 h-16 text-primary mb-4" />
                                <p className="text-xl font-bold text-white">{currentMaterial.title}</p>
                                <p className="text-sm text-slate-300 mt-2">Pré-visualização não disponível para este formato.</p>
                                {hasDownloadUrl && (
                                    <Button
                                        className="mt-6 rounded-lg"
                                        onClick={() => window.open(currentMaterial.fileUrl, '_blank')}
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                        Abrir Documento
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div className="bg-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold flex items-center gap-2">
                                <Info className="w-5 h-5 text-primary" />
                                Detalhes da Aula
                            </h3>
                            <Button
                                variant={isCompleted ? "default" : "ghost"}
                                className={cn("font-bold gap-2 rounded-lg", isCompleted ? "bg-success hover:bg-success/90 text-white" : "text-success")}
                                onClick={toggleCompletion}
                            >
                                <CheckCircle2 className={cn("w-4 h-4", isCompleted && "fill-current")} />
                                {isCompleted ? "Concluída" : "Marcar como Concluída"}
                            </Button>
                        </div>
                        <div className="text-muted-foreground leading-relaxed prose dark:prose-invert max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {currentMaterial.description || "Nenhuma descrição disponível para esta aula."}
                            </ReactMarkdown>
                        </div>
                        {currentMaterial.content && (
                            <div className="mt-8 pt-8 border-t prose dark:prose-invert max-w-none">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {currentMaterial.content}
                                </ReactMarkdown>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar - Playlist */}
                <div className="lg:col-span-4 space-y-4 min-h-[calc(100vh-180px)] flex flex-col">
                    <div className="p-6 rounded-2xl bg-card border shadow-sm flex flex-col flex-1 overflow-hidden min-h-[420px]">
                        <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                            <Play className="w-5 h-5 text-amber-500" />
                            Aulas do Módulo
                        </h3>
                        <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar">
                            {materials.map((item: any, idx: number) => (
                                <Link key={item.id} href={`/cursos/${courseId}/player/${item.id}`}>
                                    <div className={cn(
                                        "p-4 rounded-xl text-sm transition-all cursor-pointer border group mb-2",
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
                            <Button className="w-full h-14 rounded-xl font-black text-lg gap-3 shadow-xl shadow-primary/20 hover:scale-[1.01] transition-transform">
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
