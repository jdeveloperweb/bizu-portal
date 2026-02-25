"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    Play,
    CheckCircle2,
    Circle,
    X,
    Menu,
    Clock,
    FileText,
    Settings,
    MessageCircle,
    Share2,
    List,
    Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface Material {
    id: string;
    title: string;
    description: string;
    content: string;
    fileUrl: string;
    fileType: string;
}

interface Module {
    id: string;
    title: string;
    materials: Material[];
}

interface Course {
    id: string;
    title: string;
    modules: Module[];
}

export default function CoursePlayerPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;
    const materialId = params.materialId as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [currentMaterial, setCurrentMaterial] = useState<Material | null>(null);
    const [completedIds, setCompletedIds] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const fetchCourseData = useCallback(async () => {
        try {
            const [courseRes, completionRes] = await Promise.all([
                apiFetch(`/public/courses/${courseId}`),
                apiFetch(`/student/materials/completed`)
            ]);

            if (courseRes.ok) {
                const data = await courseRes.json();
                setCourse(data);

                let materialFound = null;
                for (const mod of data.modules) {
                    const mat = mod.materials.find((m: any) => m.id === materialId);
                    if (mat) {
                        materialFound = mat;
                        break;
                    }
                }
                setCurrentMaterial(materialFound);
            }

            if (completionRes.ok) {
                setCompletedIds(await completionRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch data", error);
        } finally {
            setIsLoading(false);
        }
    }, [courseId, materialId]);

    useEffect(() => {
        if (courseId && materialId) fetchCourseData();
    }, [courseId, materialId, fetchCourseData]);

    const handleNavigate = (newMaterialId: string) => {
        router.push(`/cursos/${courseId}/player/${newMaterialId}`);
    };

    const toggleCompletion = async () => {
        if (!currentMaterial) return;

        try {
            const res = await apiFetch(`/student/materials/${currentMaterial.id}/complete`, {
                method: "POST"
            });

            if (res.ok) {
                setCompletedIds(prev =>
                    prev.includes(currentMaterial.id)
                        ? prev.filter(id => id !== currentMaterial.id)
                        : [...prev, currentMaterial.id]
                );
            }
        } catch (error) {
            console.error("Failed to toggle completion", error);
        }
    };

    const getNavigation = () => {
        if (!course) return { prev: null, next: null };
        const allMaterials = course.modules.flatMap(m => m.materials);
        const currentIndex = allMaterials.findIndex(m => m.id === materialId);
        return {
            prev: currentIndex > 0 ? allMaterials[currentIndex - 1] : null,
            next: currentIndex < allMaterials.length - 1 ? allMaterials[currentIndex + 1] : null
        };
    };

    const { prev, next } = getNavigation();

    const isCompleted = currentMaterial ? completedIds.includes(currentMaterial.id) : false;

    // Calculate total progress
    const allMaterials = course?.modules.flatMap(m => m.materials) || [];
    const completedCount = allMaterials.filter(m => completedIds.includes(m.id)).length;
    const progressPercent = allMaterials.length > 0 ? (completedCount / allMaterials.length) * 100 : 0;

    if (isLoading) return <div className="h-screen flex items-center justify-center bg-slate-900 text-white font-black uppercase tracking-widest animate-pulse">Carregando Experiência...</div>;
    if (!course || !currentMaterial) return <div className="h-screen flex items-center justify-center">Conteúdo não encontrado.</div>;

    const renderContent = () => {
        if (currentMaterial.fileType === "VIDEO") {
            // Simple embed logic for YouTube/Vimeo
            let embedUrl = currentMaterial.fileUrl;
            if (embedUrl.includes("youtube.com/watch?v=")) {
                embedUrl = embedUrl.replace("watch?v=", "embed/");
            } else if (embedUrl.includes("youtu.be/")) {
                embedUrl = embedUrl.replace("youtu.be/", "youtube.com/embed/");
            }

            return (
                <div className="aspect-video w-full bg-black rounded-[32px] overflow-hidden shadow-2xl">
                    <iframe
                        src={embedUrl}
                        className="w-full h-full"
                        allowFullScreen
                    />
                </div>
            );
        }

        return (
            <div className="max-w-4xl mx-auto bg-white rounded-[40px] shadow-sm border p-12 lg:p-20">
                <div className="text-center mb-16">
                    <span className="bg-blue-600/10 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">Artigo</span>
                    <h1 className="text-4xl lg:text-6xl font-[900] text-slate-900 tracking-tight leading-tight mb-8">{currentMaterial.title}</h1>
                    <p className="text-slate-400 font-medium text-lg max-w-2xl mx-auto leading-relaxed">{currentMaterial.description}</p>
                </div>

                <div
                    className="prose prose-slate prose-xl max-w-none text-slate-700 font-medium leading-[1.8]"
                    dangerouslySetInnerHTML={{ __html: currentMaterial.content || "Este conteúdo não possui texto. Verifique os materiais extras ou o vídeo da aula." }}
                />

                {currentMaterial.fileUrl && currentMaterial.fileType !== "VIDEO" && currentMaterial.fileType !== "ARTICLE" && (
                    <div className="mt-12 p-8 bg-slate-50 rounded-3xl border-2 border-dashed flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-white border shadow-sm flex items-center justify-center text-blue-600">
                                <FileText className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="font-black text-slate-800">Material Complementar</p>
                                <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">{currentMaterial.fileUrl.split('.').pop()} Resource</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-xl font-bold gap-2"
                            onClick={() => window.open(currentMaterial.fileUrl.startsWith('http') ? currentMaterial.fileUrl : `${process.env.NEXT_PUBLIC_API_URL || 'https://bizu.mjolnix.com.br/api/v1'}${currentMaterial.fileUrl}`, '_blank')}
                        >
                            <Download className="w-4 h-4" />
                            Download
                        </Button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="h-screen bg-[#F8F9FC] flex flex-col overflow-hidden">
            {/* Top Bar */}
            <nav className="h-20 bg-white border-b px-6 flex items-center justify-between z-20 shadow-sm shrink-0">
                <div className="flex items-center gap-6">
                    <button
                        onClick={() => router.push(`/cursos/${courseId}`)}
                        className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                    >
                        <X className="w-6 h-6 text-slate-400" />
                    </button>
                    <div className="h-10 w-px bg-slate-100 hidden md:block" />
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{course.title}</span>
                            <ChevronRight className="w-3 h-3 text-slate-300" />
                            <span className="text-sm font-bold text-slate-800 line-clamp-1">{currentMaterial.title}</span>
                        </div>
                        {/* Global Progress Bar */}
                        <div className="w-full h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="hidden lg:flex flex-col items-end mr-4">
                        <span className="text-[10px] font-black text-slate-400 uppercase">Progresso do Curso</span>
                        <span className="text-sm font-black text-slate-800">{completedCount} de {allMaterials.length} aulas concluídas ({Math.round(progressPercent)}%)</span>
                    </div>
                    <Button variant="ghost" className="rounded-xl border hover:bg-slate-50 gap-2 font-bold text-slate-600">
                        <Settings className="w-4 h-4" />
                        Ajustes
                    </Button>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className={cn(
                            "p-3 rounded-2xl border transition-all lg:hidden",
                            isSidebarOpen ? "bg-slate-900 text-white" : "bg-white text-slate-600"
                        )}
                    >
                        <List className="w-6 h-6" />
                    </button>
                </div>
            </nav>

            <div className="flex-1 flex overflow-hidden relative">
                {/* Main Content Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-12 scroll-smooth">
                    <div className="max-w-5xl mx-auto pb-24">
                        {renderContent()}

                        {/* Lesson Completion Actions */}
                        <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-6 p-8 bg-blue-600 rounded-[32px] text-white shadow-xl shadow-blue-100">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center">
                                    <CheckCircle2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h4 className="text-xl font-bold">Você finalizou este conteúdo?</h4>
                                    <p className="text-blue-100 text-sm">Marque como concluído para avançar na sua trilha.</p>
                                </div>
                            </div>
                            <Button
                                size="lg"
                                className={cn(
                                    "h-16 px-10 rounded-2xl font-black text-lg transition-all shadow-lg",
                                    isCompleted ? "bg-green-500 hover:bg-green-600" : "bg-white text-blue-600 hover:bg-slate-50"
                                )}
                                onClick={toggleCompletion}
                            >
                                {isCompleted ? "Aula Concluída!" : "Marcar como Concluído"}
                            </Button>
                        </div>
                    </div>

                    {/* Navigation Bar */}
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-white p-2 rounded-3xl shadow-2xl flex items-center gap-2 z-30 ring-1 ring-slate-900/5">
                        <Button
                            variant="ghost"
                            disabled={!prev}
                            onClick={() => prev && handleNavigate(prev.id)}
                            className="h-14 px-6 rounded-2xl font-bold gap-2 text-slate-600 disabled:opacity-30"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            <span className="hidden sm:inline">Anterior</span>
                        </Button>
                        <div className="h-8 w-px bg-slate-200 mx-2" />
                        <Button
                            disabled={!next}
                            onClick={() => next && handleNavigate(next.id)}
                            className="h-14 px-8 rounded-2xl font-black gap-2 bg-slate-900 text-white shadow-lg shadow-slate-200 disabled:opacity-30"
                        >
                            <span className="hidden sm:inline">Próxima Aula</span>
                            <ChevronRight className="w-5 h-5 font-black" />
                        </Button>
                    </div>
                </main>

                {/* Sidebar (Lesson List) */}
                <AnimatePresence>
                    {isSidebarOpen && (
                        <motion.aside
                            initial={{ x: 400 }}
                            animate={{ x: 0 }}
                            exit={{ x: 400 }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            className="w-full lg:w-96 bg-white border-l z-10 flex flex-col absolute lg:relative inset-0 lg:inset-auto"
                        >
                            <div className="p-8 border-b">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-xl font-black text-slate-900">Conteúdo do Curso</h3>
                                    <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 hover:bg-slate-100 rounded-lg">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>
                                <div className="flex items-center justify-between text-xs font-black text-blue-500 uppercase tracking-widest">
                                    <span>24 aulas</span>
                                    <span>Total: 4h 30m</span>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                                {course.modules.map((mod, idx) => (
                                    <div key={mod.id} className="space-y-3">
                                        <div className="flex items-center gap-3 px-4">
                                            <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                                {idx + 1}
                                            </div>
                                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">{mod.title}</h4>
                                        </div>
                                        <div className="space-y-1">
                                            {mod.materials.map((mat) => (
                                                <button
                                                    key={mat.id}
                                                    onClick={() => handleNavigate(mat.id)}
                                                    className={cn(
                                                        "w-full text-left p-4 rounded-2xl transition-all group flex items-start gap-4 border-2 border-transparent",
                                                        materialId === mat.id ? "bg-blue-50 border-blue-100" : "hover:bg-slate-50"
                                                    )}
                                                >
                                                    <div className={cn(
                                                        "shrink-0 mt-1",
                                                        materialId === mat.id ? "text-blue-600" : (completedIds.includes(mat.id) ? "text-green-500" : "text-slate-300")
                                                    )}>
                                                        {materialId === mat.id ? <Play className="w-5 h-5 fill-current" /> : (completedIds.includes(mat.id) ? <CheckCircle2 className="w-5 h-5 fill-current" /> : <Circle className="w-5 h-5" />)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className={cn(
                                                            "text-sm font-bold line-clamp-2",
                                                            materialId === mat.id ? "text-slate-900" : "text-slate-600"
                                                        )}>
                                                            {mat.title}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1">
                                                            <Clock className="w-3 h-3 text-slate-300" />
                                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">15 min</span>
                                                        </div>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="p-6 border-t bg-slate-50/50">
                                <Button className="w-full h-12 rounded-xl font-bold bg-white border text-slate-600 hover:bg-slate-100 gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Fazer uma Pergunta
                                </Button>
                            </div>
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
