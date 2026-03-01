"use client";

import { X, FileText, Play, Download, ExternalLink, Info, CheckCircle2, Highlighter, StickyNote, X as CloseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getVideoEmbedUrl } from "@/lib/video-embed";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import MarkdownViewer from "@/components/MarkdownViewer";

interface Material {
    id: string;
    title: string;
    description?: string;
    fileUrl: string;
    fileType: string;
    moduleTitle?: string;
    courseTitle?: string;
    content?: string;
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

    // Context for article highligting
    const [highlights, setHighlights] = useState<any[]>([]);
    const [selection, setSelection] = useState<{ text: string, x: number, y: number } | null>(null);
    const [isAddingNote, setIsAddingNote] = useState(false);
    const [noteContent, setNoteContent] = useState("");

    useEffect(() => {
        if (isOpen && material) {
            checkCompletion();
            if (material.fileType === "ARTICLE" || material.content) {
                fetchHighlights();
            }
        }
    }, [isOpen, material]);

    const fetchHighlights = async () => {
        if (!material) return;
        try {
            const notesRes = await apiFetch(`/student/notes`);
            if (notesRes.ok) {
                const allNotes = await notesRes.json();
                const materialHighlights = allNotes.filter((n: any) => n.materialId === material.id);
                setHighlights(materialHighlights.map((n: any) => ({
                    id: n.id,
                    text: n.highlightedText || "",
                    color: n.highlightColor
                })));
            }
        } catch (error) {
            console.error("Error fetching notes", error);
        }
    };

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

    const handleTextSelection = () => {
        setTimeout(() => {
            const sel = window.getSelection();
            if (sel && !sel.isCollapsed && sel.toString().trim().length > 3) {
                try {
                    const range = sel.getRangeAt(0);
                    const rect = range.getBoundingClientRect();
                    setSelection({
                        text: sel.toString().trim(),
                        x: rect.left + rect.width / 2 + window.scrollX,
                        y: rect.top + window.scrollY
                    });
                } catch (e) {
                    console.warn("Erro ao processar seleção", e);
                }
            } else {
                if (!isAddingNote) {
                    setSelection(null);
                    setIsAddingNote(false);
                }
            }
        }, 100);
    };

    const saveHighlight = async (withNote = false) => {
        if (!selection || !material) return;

        const payload = {
            title: `Destaque em: ${material.title}`,
            content: withNote ? noteContent : "Texto destacado no artigo.",
            materialId: material.id,
            highlightedText: selection.text,
            highlightColor: "yellow",
            tags: ["highlight"],
            pinned: false,
            starred: false
        };

        try {
            const res = await apiFetch(`/student/notes`, {
                method: 'POST',
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const newNote = await res.json();
                setHighlights(prev => [...prev, {
                    id: newNote.id,
                    text: selection.text,
                    color: "yellow"
                }]);
                setSelection(null);
                setIsAddingNote(false);
                setNoteContent("");
            }
        } catch (error) {
            console.error("Erro ao salvar destaque", error);
        }
    };

    if (!isOpen || !material) return null;

    const embedVideoUrl = material.fileType === "VIDEO" ? getVideoEmbedUrl(material.fileUrl) : null;

    // Check if it's a PDF to try embedding it
    const isPDF = material.fileType === "PDF" || (material.fileUrl && material.fileUrl.toLowerCase().endsWith('.pdf'));
    const isArticle = material.fileType === "ARTICLE" || Boolean(material.content);

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
                            className="rounded-xl flex gap-2"
                            onClick={() => window.open(material.fileUrl, '_blank')}
                            title="Baixar material"
                        >
                            <Download size={16} /> <span className="hidden sm:inline">Baixar</span>
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
                        <div className="lg:col-span-8 space-y-6 flex flex-col">
                            <div className={cn(
                                "bg-black rounded-[32px] overflow-hidden shadow-xl border-4 border-slate-50 dark:border-slate-800 relative w-full",
                                (isPDF || isArticle) ? "h-[75vh]" : "aspect-video"
                            )}>
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
                                ) : isArticle ? (
                                    <div className="w-full h-full bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 overflow-y-auto">
                                        <article className="max-w-4xl mx-auto px-6 sm:px-10 py-12">
                                            <div className="text-center mb-10">
                                                <span className="bg-indigo-600/10 text-indigo-600 dark:text-indigo-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] inline-block">Artigo</span>
                                                <h1 className="text-2xl sm:text-3xl font-[900] text-slate-900 dark:text-white mt-6 tracking-tight leading-tight">
                                                    {material.title}
                                                </h1>
                                            </div>
                                            <div className="text-slate-600 dark:text-slate-300 leading-[1.8]" onMouseUp={handleTextSelection} onTouchEnd={handleTextSelection}>
                                                <MarkdownViewer
                                                    content={material.content || material.description || "Nenhum conteúdo para este artigo."}
                                                    highlights={highlights}
                                                />
                                            </div>

                                            {/* Selection Tooltip */}
                                            {selection && (
                                                <div
                                                    className="fixed z-[99999] bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex flex-col gap-2 animate-in fade-in zoom-in duration-200"
                                                    style={{
                                                        top: Math.max(10, selection.y - 120),
                                                        left: selection.x,
                                                        transform: 'translateX(-50%)',
                                                        width: isAddingNote ? '280px' : 'auto'
                                                    }}
                                                >
                                                    {!isAddingNote ? (
                                                        <div className="flex items-center gap-1">
                                                            <button
                                                                onClick={() => saveHighlight(false)}
                                                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-amber-600 transition-colors"
                                                            >
                                                                <Highlighter size={14} /> Marcar
                                                            </button>
                                                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                                                            <button
                                                                onClick={() => setIsAddingNote(true)}
                                                                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-xs font-bold text-indigo-600 transition-colors"
                                                            >
                                                                <StickyNote size={14} /> Anotar
                                                            </button>
                                                            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700" />
                                                            <button
                                                                onClick={() => setSelection(null)}
                                                                className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                                            >
                                                                <CloseIcon size={14} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="p-1 space-y-2">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <span className="text-[10px] font-bold uppercase text-slate-400">Nova Anotação</span>
                                                                <button onClick={() => setIsAddingNote(false)}><CloseIcon size={12} /></button>
                                                            </div>
                                                            <textarea
                                                                autoFocus
                                                                value={noteContent}
                                                                onChange={(e) => setNoteContent(e.target.value)}
                                                                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-2 text-xs outline-none focus:ring-1 focus:ring-primary h-20 resize-none text-slate-900 dark:text-slate-100"
                                                                placeholder="Digite sua anotação..."
                                                            />
                                                            <Button size="sm" className="w-full text-[11px] h-8" onClick={() => saveHighlight(true)}>
                                                                Salvar Destaque e Nota
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </article>
                                    </div>
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
