"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import {
    FileText, Send, Upload, History, CheckCircle2,
    AlertCircle, Loader2, Sparkles, Image as ImageIcon,
    File as FileIcon, ChevronRight, Star, Plus,
    ArrowLeft, Calendar, FileType, Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RedacaoPage() {
    const { selectedCourseId } = useAuth();
    const [essays, setEssays] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState<"list" | "new" | "details">("list");
    const [selectedEssay, setSelectedEssay] = useState<any>(null);

    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [uploadType, setUploadType] = useState<"TEXT" | "IMAGE" | "PDF">("TEXT");
    const [fileBase64, setFileBase64] = useState<string | null>(null);

    useEffect(() => {
        if (selectedCourseId) {
            fetchEssays();
        }
    }, [selectedCourseId]);

    const fetchEssays = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/student/essays?courseId=${selectedCourseId}`);
            if (res.ok) {
                const data = await res.json();
                setEssays(data);
            }
        } catch (error) {
            console.error("Failed to fetch essays", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFileBase64(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const res = await apiFetch("/student/essays", {
                method: "POST",
                body: JSON.stringify({
                    courseId: selectedCourseId,
                    title,
                    content: uploadType === "TEXT" ? content : "",
                    attachmentUrl: uploadType !== "TEXT" ? fileBase64 : "",
                    type: uploadType
                })
            });

            if (res.ok) {
                const newEssay = await res.json();
                setEssays([newEssay, ...essays]);
                setSelectedEssay(newEssay);
                setView("details");
                setTitle("");
                setContent("");
                setFileBase64(null);
            }
        } catch (error) {
            console.error("Failed to submit essay", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getGradeColor = (grade: number) => {
        if (grade >= 7) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        if (grade >= 5) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    };

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <PageHeader
                    title="Seção de Redação"
                    description="Escreva ou envie sua redação para correção instantânea com nossa IA avançada."
                    badge="INTELIGÊNCIA ARTIFICIAL"
                />
                <Button
                    onClick={() => setView(view === "new" ? "list" : "new")}
                    className="h-12 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 gap-2"
                >
                    {view === "new" ? (
                        <><ArrowLeft className="w-4 h-4" /> Voltar</>
                    ) : (
                        <><Plus className="w-4 h-4" /> Nova Redação</>
                    )}
                </Button>
            </div>

            <AnimatePresence mode="wait">
                {view === "list" && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="h-48 rounded-2xl bg-card border border-border animate-pulse" />
                            ))
                        ) : essays.length === 0 ? (
                            <div className="col-span-full h-64 flex flex-col items-center justify-center rounded-3xl bg-card/50 border border-dashed border-border text-muted-foreground gap-4">
                                <FileText className="w-12 h-12 opacity-20" />
                                <p className="font-medium">Você ainda não enviou nenhuma redação.</p>
                                <Button variant="outline" onClick={() => setView("new")}>Começar agora</Button>
                            </div>
                        ) : (
                            essays.map((essay) => (
                                <button
                                    key={essay.id}
                                    onClick={() => {
                                        setSelectedEssay(essay);
                                        setView("details");
                                    }}
                                    className="group text-left p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all hover:shadow-xl hover:shadow-primary/5 relative overflow-hidden"
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                            {essay.type === "TEXT" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                        </div>
                                        <div className={`px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider ${getGradeColor(essay.grade || 0)}`}>
                                            Nota: {essay.grade?.toFixed(2) || "---"}
                                        </div>
                                    </div>
                                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{essay.title || "Sem título"}</h3>
                                    <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {format(new Date(essay.createdAt), "dd MMM, yyyy", { locale: ptBR })}</span>
                                        <span className="flex items-center gap-1 uppercase tracking-tighter"><FileType size={12} /> {essay.type}</span>
                                    </div>
                                    <div className="mt-4 flex items-center text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                        Ver correção completa <ChevronRight size={14} />
                                    </div>
                                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                        <Sparkles size={100} />
                                    </div>
                                </button>
                            ))
                        )}
                    </motion.div>
                )}

                {view === "new" && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="max-w-4xl mx-auto"
                    >
                        <form onSubmit={handleSubmit} className="bg-card border border-border rounded-3xl p-8 shadow-2xl space-y-8">
                            <div className="space-y-2">
                                <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Título da Redação</label>
                                <input
                                    required
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    placeholder="Ex: Os desafios da educação no Brasil"
                                    className="w-full h-14 px-6 rounded-2xl bg-muted/50 border-none text-lg font-bold focus:ring-2 focus:ring-primary transition-all"
                                />
                            </div>

                            <div className="flex p-1 rounded-2xl bg-muted/50 w-fit">
                                <button
                                    type="button"
                                    onClick={() => setUploadType("TEXT")}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${uploadType === "TEXT" ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Digitar Texto
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setUploadType("IMAGE")}
                                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${uploadType === "IMAGE" ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Subir Imagem/PDF
                                </button>
                            </div>

                            {uploadType === "TEXT" ? (
                                <div className="space-y-4">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Texto da Redação</label>
                                    <textarea
                                        required
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        placeholder="Comece a escrever sua redação aqui..."
                                        className="w-full min-h-[400px] p-8 rounded-3xl bg-muted/50 border-none text-base leading-relaxed resize-none focus:ring-2 focus:ring-primary transition-all font-serif"
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Arquivo da Redação</label>
                                    <div className="relative group">
                                        <input
                                            type="file"
                                            accept="image/*,application/pdf"
                                            onChange={handleFileChange}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="h-64 rounded-3xl border-2 border-dashed border-border group-hover:border-primary/50 group-hover:bg-primary/5 transition-all flex flex-col items-center justify-center gap-4">
                                            {fileBase64 ? (
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                                                        <Check size={32} />
                                                    </div>
                                                    <p className="text-sm font-bold text-emerald-500">Arquivo carregado com sucesso</p>
                                                    <button type="button" onClick={() => setFileBase64(null)} className="text-xs text-muted-foreground hover:underline">Trocar arquivo</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                        <Upload size={32} />
                                                    </div>
                                                    <div className="text-center">
                                                        <p className="text-sm font-bold">Clique ou arraste para enviar</p>
                                                        <p className="text-xs text-muted-foreground">Suporta imagens (JPG, PNG) ou PDF</p>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-start gap-4 p-6 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                                <Sparkles className="text-indigo-600 shrink-0" size={24} />
                                <div className="space-y-1">
                                    <p className="text-sm font-bold text-indigo-900">Correção Inteligente</p>
                                    <p className="text-xs text-indigo-600/80 leading-relaxed font-medium">
                                        Ao enviar, nossa IA analisará gramática, coesão, coerência e estrutura.
                                        A correção leva em torno de 15 a 30 segundos.
                                    </p>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || (uploadType === "TEXT" ? !content : !fileBase64)}
                                className="w-full h-16 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl shadow-primary/20 gap-3"
                            >
                                {isSubmitting ? (
                                    <><Loader2 className="w-6 h-6 animate-spin" /> Corrigindo...</>
                                ) : (
                                    <><Send className="w-5 h-5" /> Enviar para Avaliação</>
                                )}
                            </Button>
                        </form>
                    </motion.div>
                )}

                {view === "details" && selectedEssay && (
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                    >
                        <div className="lg:col-span-2 space-y-8">
                            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black">{selectedEssay.title}</h2>
                                        <p className="text-sm text-muted-foreground font-medium">
                                            {format(new Date(selectedEssay.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </p>
                                    </div>
                                </div>
                                <div className="prose prose-slate dark:prose-invert max-w-none font-serif leading-loose whitespace-pre-wrap text-lg bg-muted/30 p-8 rounded-2xl border border-dashed">
                                    {selectedEssay.content || "Redação enviada em formato de imagem/PDF."}
                                </div>
                                {selectedEssay.attachmentUrl && (
                                    <div className="mt-6">
                                        <p className="text-sm font-bold mb-3 text-muted-foreground">Original Enviado:</p>
                                        <img src={selectedEssay.attachmentUrl} alt="Redação original" className="max-w-full rounded-2xl border bg-muted" />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-3xl p-8 shadow-xl relative overflow-hidden">
                                <div className="relative z-10">
                                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Avaliação da IA</h3>
                                    <div className="flex flex-col items-center gap-4 mb-8">
                                        <div className={`text-6xl font-black flex flex-col items-center ${getGradeColor(selectedEssay.grade || 0)} p-8 rounded-full border-4 aspect-square justify-center shadow-inner`}>
                                            {selectedEssay.grade?.toFixed(1)}
                                            <span className="text-xs uppercase tracking-tighter opacity-50 mt-1 font-black">Nota Final</span>
                                        </div>
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} size={20} className={s <= Math.round((selectedEssay.grade || 0) / 2) ? "fill-primary text-primary" : "text-muted"} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center gap-3 text-sm font-bold p-3 rounded-xl bg-muted/50">
                                            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center"><CheckCircle2 size={16} /></div>
                                            <span>Estrutura Adequada</span>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm font-bold p-3 rounded-xl bg-muted/50">
                                            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center"><Sparkles size={16} /></div>
                                            <span>Análise Lexical OK</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 p-8 opacity-5">
                                    <Star size={150} />
                                </div>
                            </div>

                            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Feedback Detalhado</h3>
                                <div className="text-sm leading-relaxed prose prose-indigo max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                        {selectedEssay.feedback || "Aguardando correção..."}
                                    </ReactMarkdown>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
