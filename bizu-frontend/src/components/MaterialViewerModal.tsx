"use client";

import { X, FileText, Play, Download, ExternalLink, Info, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVideoEmbedUrl } from "@/lib/video-embed";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

interface Material {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    moduleTitle?: string;
    courseTitle?: string;
}

interface MaterialViewerModalProps {
    material: Material | null;
    isOpen: boolean;
    onClose: () => void;
    onComplete?: (materialId: string) => void;
}

export default function MaterialViewerModal({ material, isOpen, onClose, onComplete }: MaterialViewerModalProps) {
    const [isCompleted, setIsCompleted] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && material) {
            checkCompletion();
        }
    }, [isOpen, material]);

    const checkCompletion = async () => {
        if (!material) return;
        try {
            const res = await apiFetch(`/student/materials/completed`);
            if (res.ok) {
                const completedIds = await res.json();
                setIsCompleted(completedIds.includes(material.id));
            }
        } catch (error) {
            console.error("Error checking completion", error);
        }
    };

    const toggleCompletion = async () => {
        if (!material || loading) return;
        setLoading(true);
        try {
            const res = await apiFetch(`/student/materials/${material.id}/complete`, {
                method: 'POST'
            });
            if (res.ok) {
                setIsCompleted(!isCompleted);
                if (onComplete) {
                    onComplete(material.id);
                }
            }
        } catch (error) {
            console.error("Failed to toggle completion", error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !material) return null;

    const embedVideoUrl = material.fileType === "VIDEO" ? getVideoEmbedUrl(material.fileUrl) : null;

    // Check if it's a PDF to try embedding it
    const isPDF = material.fileType === "PDF" || (material.fileUrl && material.fileUrl.toLowerCase().endsWith('.pdf'));

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 fade-in duration-300">

                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm",
                            material.fileType === 'VIDEO' ? "bg-amber-50 text-amber-600" : "bg-indigo-50 text-indigo-600"
                        )}>
                            {material.fileType === 'VIDEO' ? <Play size={24} className="fill-current" /> : <FileText size={24} />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{material.title}</h3>
                            <div className="flex items-center gap-2 mt-1">
                                {material.courseTitle && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                        {material.courseTitle}
                                    </span>
                                )}
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {material.moduleTitle || "Módulo Geral"}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl hidden sm:flex gap-2"
                            onClick={() => window.open(material.fileUrl, '_blank')}
                        >
                            <Download size={16} /> Baixar
                        </Button>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center text-slate-500 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main Viewer */}
                        <div className="lg:col-span-8 space-y-6">
                            <div className="aspect-video bg-black rounded-[32px] overflow-hidden shadow-xl border-4 border-slate-50 dark:border-slate-800 relative">
                                {material.fileType === 'VIDEO' ? (
                                    embedVideoUrl ? (
                                        <iframe
                                            src={embedVideoUrl}
                                            className="w-full h-full border-none"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            referrerPolicy="strict-origin-when-cross-origin"
                                            allowFullScreen
                                            title={material.title}
                                        />
                                    ) : (
                                        <video
                                            src={material.fileUrl}
                                            className="w-full h-full"
                                            controls
                                        />
                                    )
                                ) : isPDF ? (
                                    <iframe
                                        src={`${material.fileUrl}#toolbar=0`}
                                        className="w-full h-full border-none"
                                        title={material.title}
                                    />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/50">
                                        <FileText className="w-20 h-20 text-indigo-400 mb-6 opacity-20" />
                                        <p className="text-lg font-bold text-slate-600 dark:text-slate-300">Pré-visualização indisponível</p>
                                        <p className="text-sm text-slate-400 mt-2 mb-8">Este tipo de arquivo não pode ser visualizado diretamente.</p>
                                        <Button
                                            className="rounded-2xl px-8 h-12 gap-2 shadow-lg shadow-indigo-200"
                                            onClick={() => window.open(material.fileUrl, '_blank')}
                                        >
                                            <ExternalLink size={18} /> Ver Documento Completo
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info Sidebar */}
                        <div className="lg:col-span-4 space-y-6">
                            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <Info size={18} className="text-indigo-500" />
                                    Sobre o conteúdo
                                </h4>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                                    {material.description || "Nenhuma descrição detalhada disponível para este material."}
                                </p>
                            </div>

                            <div className="bg-card border border-slate-100 dark:border-slate-800 rounded-[32px] p-6">
                                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-4">
                                    <CheckCircle2 size={18} className={isCompleted ? "text-emerald-500" : "text-slate-300"} />
                                    Progresso
                                </h4>
                                <Button
                                    variant={isCompleted ? "default" : "outline"}
                                    onClick={toggleCompletion}
                                    disabled={loading}
                                    className={cn(
                                        "w-full rounded-2xl font-bold h-12 transition-all",
                                        isCompleted
                                            ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                            : "border-emerald-100 text-emerald-600 hover:bg-emerald-50"
                                    )}
                                >
                                    {isCompleted ? "Concluído" : "Marcar como Concluído"}
                                </Button>
                            </div>

                            <div className="p-6 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
                                <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 mb-4">
                                    <Download size={24} />
                                </div>
                                <h5 className="font-bold text-slate-800 dark:text-slate-200 text-sm">Download Disponível</h5>
                                <p className="text-xs text-slate-400 mt-1 mb-4">Baixe o material para estudar de forma offline.</p>
                                <Button
                                    className="w-full rounded-2xl bg-indigo-600 hover:bg-indigo-700"
                                    onClick={() => window.open(material.fileUrl, '_blank')}
                                >
                                    Baixar Agora
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer (Optional) */}
                <div className="px-8 py-4 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex justify-end shrink-0">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold">
                        Fechar Visualização
                    </Button>
                </div>
            </div>
        </div>
    );
}
