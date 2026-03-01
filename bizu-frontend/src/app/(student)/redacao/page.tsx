"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { apiFetch } from "@/lib/api";
import PageHeader from "@/components/PageHeader";
import {
    FileText, Send, Upload, History, CheckCircle2,
    AlertCircle, Loader2, Sparkles, Image as ImageIcon,
    File as FileIcon, ChevronRight, Star, Plus,
    ArrowLeft, Calendar, FileType, Check, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PremiumFeatureCard } from "@/components/PremiumFeatureCard";
import MarkdownViewer from "@/components/MarkdownViewer";
import { resolveMediaUrl } from "@/lib/media";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function RedacaoPage() {
    const { selectedCourseId, isFree } = useAuth();
    const [essays, setEssays] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [view, setView] = useState<"list" | "new" | "details">("list");
    const [selectedEssay, setSelectedEssay] = useState<any>(null);

    const [title, setTitle] = useState("");
    const [topic, setTopic] = useState("");
    const [content, setContent] = useState("");
    const [uploadType, setUploadType] = useState<"TEXT" | "IMAGE" | "PDF">("TEXT");
    const [fileBase64, setFileBase64] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedFont, setSelectedFont] = useState<string>("var(--font-kalam)");
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [lineCount, setLineCount] = useState(0);
    const [isExtracting, setIsExtracting] = useState(false);

    // Efeito para calcular as linhas visuais reais
    useEffect(() => {
        const updateLineCount = () => {
            if (content.trim() === "") {
                setLineCount(0);
                return;
            }
            // Criamos um elemento fantasma para medir a altura exata do texto com as mesmas propriedades do textarea
            const div = document.createElement("div");
            const styles = window.getComputedStyle(textareaRef.current!);
            div.style.fontFamily = styles.fontFamily;
            div.style.fontSize = styles.fontSize;
            div.style.lineHeight = styles.lineHeight;
            div.style.whiteSpace = "pre-wrap";
            div.style.wordBreak = "break-word";
            div.style.width = `${textareaRef.current?.clientWidth}px`;
            div.style.position = "absolute";
            div.style.visibility = "hidden";
            div.style.padding = styles.padding;
            div.innerHTML = content.replace(/\n/g, "<br/>") + " "; // Adiciona um espaço para garantir que a última linha seja contada
            document.body.appendChild(div);

            const height = div.offsetHeight;
            const lines = Math.floor(height / 32);
            setLineCount(lines);

            document.body.removeChild(div);
        };

        if (textareaRef.current) {
            updateLineCount();
        }
    }, [content, uploadType, fileBase64]);

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
            reader.onloadend = async () => {
                const base64 = reader.result as string;
                setFileBase64(base64);

                // Automatic extraction
                setIsExtracting(true);
                setError(null);
                try {
                    const res = await apiFetch("/student/essays/extract-text", {
                        method: "POST",
                        body: JSON.stringify({ imageUrl: base64 })
                    });
                    if (res.ok) {
                        const data = await res.json();
                        setContent(data.text);
                    } else {
                        setError("Não foi possível extrair o texto automaticamente. Você pode digitar manualmente se preferir.");
                    }
                } catch (err) {
                    console.error("Failed to extract text", err);
                    setError("Erro na extração de texto.");
                } finally {
                    setIsExtracting(false);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleDelete = async (essayId: string, e?: React.MouseEvent) => {
        if (e) e.stopPropagation();

        if (!window.confirm("Tem certeza que deseja excluir esta redação? Esta ação não pode ser desfeita.")) {
            return;
        }

        try {
            const res = await apiFetch(`/student/essays/${essayId}`, {
                method: "DELETE"
            });

            if (res.ok) {
                setEssays(essays.filter(e => e.id !== essayId));
                if (selectedEssay?.id === essayId) {
                    setSelectedEssay(null);
                    setView("list");
                }
            }
        } catch (error) {
            console.error("Failed to delete essay", error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadType === "TEXT") {
            if (lineCount < 20) {
                setError("Sua redação precisa ter no mínimo 20 linhas para ser avaliada.");
                return;
            }
            if (lineCount > 30) {
                setError("Sua redação ultrapassou o limite máximo de 30 linhas.");
                return;
            }
        }

        setError(null);
        setIsSubmitting(true);

        try {
            const res = await apiFetch("/student/essays", {
                method: "POST",
                body: JSON.stringify({
                    courseId: selectedCourseId,
                    title,
                    topic,
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
                setTopic("");
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
        if (grade >= 700) return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
        if (grade >= 500) return "text-amber-500 bg-amber-500/10 border-amber-500/20";
        return "text-rose-500 bg-rose-500/10 border-rose-500/20";
    };

    const CompetencyProgress = ({ title, score, colorClass }: { title: string, score: number, colorClass: string }) => (
        <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
                <span className="font-medium text-muted-foreground">{title}</span>
                <span className={`font-bold ${colorClass}`}>{score}/200</span>
            </div>
            <div className="h-2 w-full bg-muted rounded-full overflow-hidden shadow-inner">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(score / 200) * 100}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full rounded-full ${colorClass.replace('text-', 'bg-')}`}
                />
            </div>
        </div>
    );

    if (isFree) {
        return (
            <div className="p-6 lg:p-12 w-full max-w-4xl mx-auto flex items-center justify-center min-h-[60vh]">
                <PremiumFeatureCard
                    title="Correção de Redação Premium"
                    description="A correção inteligente com IA é um recurso exclusivo para assinantes. Eleve o nível das suas redações e garanta a nota máxima!"
                />
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    {view !== "list" && (
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setView("list")}
                            className="h-10 w-10 rounded-xl"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    )}
                    <PageHeader
                        title="Seção de Redação"
                        description="Escreva ou envie sua redação para correção instantânea com nossa IA avançada."
                        badge="INTELIGÊNCIA ARTIFICIAL"
                    />
                </div>
                {view !== "new" && (
                    <Button
                        onClick={() => setView("new")}
                        className="h-12 rounded-xl px-6 font-bold shadow-lg shadow-primary/20 gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nova Redação
                    </Button>
                )}
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
                                        <div className="flex gap-2">
                                            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
                                                {essay.type === "TEXT" ? <FileText className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                                            </div>
                                            <button
                                                onClick={(e) => handleDelete(essay.id, e)}
                                                className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Título da Redação</label>
                                    <input
                                        required
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="Ex: Minha Redação"
                                        className="w-full h-14 px-6 rounded-2xl bg-muted/50 border-none text-lg font-bold focus:ring-2 focus:ring-primary transition-all"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">Tema Proposto</label>
                                    <input
                                        required
                                        value={topic}
                                        onChange={e => setTopic(e.target.value)}
                                        placeholder="Ex: Os desafios da educação no Brasil"
                                        className="w-full h-14 px-6 rounded-2xl bg-muted/50 border-none text-lg font-bold focus:ring-2 focus:ring-primary transition-all"
                                    />
                                </div>
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

                            {uploadType === "TEXT" || fileBase64 ? (
                                <div className="space-y-4">
                                    <div className="flex justify-between items-end px-2">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-sm font-black uppercase tracking-widest text-muted-foreground">
                                                {uploadType === "TEXT" ? "Texto da Redação" : "Extraído da Imagem (Revise aqui)"}
                                            </label>
                                            <div className="flex gap-2 p-1 bg-muted/50 rounded-xl">
                                                {[
                                                    { name: "Manuscrita 1", value: "var(--font-kalam)" },
                                                    { name: "Manuscrita 2", value: "var(--font-caveat)" },
                                                    { name: "Manual", value: "var(--font-indie)" },
                                                    { name: "Times New Roman", value: "'Times New Roman', Times, serif" }
                                                ].map((font) => (
                                                    <button
                                                        key={font.value}
                                                        type="button"
                                                        onClick={() => setSelectedFont(font.value)}
                                                        className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${selectedFont === font.value ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                                        style={{ fontFamily: font.value }}
                                                    >
                                                        {font.name}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className={`text-[10px] font-black uppercase tracking-tighter px-3 py-1 rounded-full transition-all duration-300 shadow-sm ${lineCount < 20 || lineCount > 30 ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                                            {lineCount} / 30 LINHAS {lineCount < 20 && "• MÍNIMO 20"}
                                        </div>
                                    </div>

                                    {uploadType === "IMAGE" && fileBase64 && (
                                        <div className="relative group mb-4">
                                            <div className="rounded-2xl border border-border overflow-hidden bg-muted max-h-40 relative">
                                                <img src={fileBase64} alt="Original" className="w-full h-auto object-cover opacity-50" />
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 text-white font-bold text-xs uppercase tracking-widest">
                                                    Imagem Carregada
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => { setFileBase64(null); setContent(""); }}
                                                    className="absolute top-2 right-2 p-1.5 bg-rose-500 rounded-lg text-white hover:bg-rose-600 transition-colors"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className="relative bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden transition-all duration-500 focus-within:ring-8 focus-within:ring-primary/5">
                                        {/* Margem e Números de Linha */}
                                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50 border-r border-rose-100 flex flex-col pt-[32px] items-center text-[10px] font-mono text-slate-300 select-none z-10">
                                            {Array.from({ length: Math.max(30, lineCount + 5) }).map((_, i) => (
                                                <div key={i} className="h-8 flex items-center">{String(i + 1).padStart(2, '0')}</div>
                                            ))}
                                        </div>

                                        {/* Papel Pautado */}
                                        <div
                                            className="ml-12 min-h-[960px] bg-[linear-gradient(#f1f5f9_1px,transparent_1px)] bg-[length:100%_32px]"
                                            style={{ backgroundPosition: '0 31px' }}
                                        >
                                            {isExtracting ? (
                                                <div className="flex flex-col items-center justify-center h-[400px] gap-4">
                                                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                                    <p className="text-sm font-bold text-muted-foreground animate-pulse">Extraindo texto da imagem...</p>
                                                </div>
                                            ) : (
                                                <textarea
                                                    ref={textareaRef}
                                                    required
                                                    value={content}
                                                    onChange={e => {
                                                        setContent(e.target.value);
                                                        if (error) setError(null);
                                                    }}
                                                    placeholder="Desenvolva seu texto aqui, respeitando as normas da ABNT e o limite de linhas..."
                                                    className="w-full min-h-[960px] p-0 bg-transparent border-none text-base leading-[32px] resize-none focus:ring-0 text-slate-700 px-8 py-0 selection:bg-primary/20 placeholder:text-slate-300"
                                                    style={{
                                                        outline: 'none',
                                                        paddingTop: '0px',
                                                        fontFamily: selectedFont,
                                                        hyphens: 'auto',
                                                        textAlign: 'justify'
                                                    }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                    <AnimatePresence>
                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 text-sm font-bold flex items-center gap-3 shadow-lg shadow-rose-500/5"
                                            >
                                                <AlertCircle size={18} className="shrink-0" /> {error}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
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
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                                                <Upload size={32} />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-sm font-bold">Clique ou arraste para enviar</p>
                                                <p className="text-xs text-muted-foreground">Suporta imagens (JPG, PNG) ou PDF</p>
                                            </div>
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
                                disabled={isSubmitting || isExtracting || !content}
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
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black">{selectedEssay.title}</h2>
                                            <div className="flex flex-col gap-1">
                                                <p className="text-sm text-primary font-bold">
                                                    Tema: {selectedEssay.topic}
                                                </p>
                                                <p className="text-xs text-muted-foreground font-medium">
                                                    {format(new Date(selectedEssay.createdAt), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        onClick={() => handleDelete(selectedEssay.id)}
                                        className="rounded-2xl border-rose-200 text-rose-500 hover:bg-rose-500 hover:text-white hover:border-rose-500 transition-all active:scale-95"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>

                                {selectedEssay.type === "TEXT" ? (
                                    <div className="relative bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                                        <div className="absolute left-0 top-0 bottom-0 w-12 bg-slate-50 border-r border-rose-100 flex flex-col pt-[32px] items-center text-[10px] font-mono text-slate-300 select-none">
                                            {Array.from({ length: Math.max(30, selectedEssay.content.split('\n').length) }).map((_, i) => (
                                                <div key={i} className="h-8 flex items-center">{String(i + 1).padStart(2, '0')}</div>
                                            ))}
                                        </div>
                                        <div
                                            className="ml-12 p-8 pt-0 bg-[linear-gradient(#f8fafc_1px,transparent_1px)] bg-[length:100%_32px]"
                                            style={{ backgroundPosition: '0 31px' }}
                                        >
                                            <div
                                                className="text-slate-700 text-base leading-[32px] whitespace-pre-wrap py-2"
                                                style={{
                                                    fontFamily: selectedFont,
                                                    hyphens: 'auto',
                                                    textAlign: 'justify'
                                                }}
                                            >
                                                {selectedEssay.content}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        {selectedEssay.attachmentUrl && (
                                            <div className="space-y-3">
                                                <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Original Enviado</p>
                                                <div className="rounded-3xl border border-border overflow-hidden bg-muted shadow-lg">
                                                    <img src={resolveMediaUrl(selectedEssay.attachmentUrl)} alt="Redação original" className="w-full h-auto" />
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-3">
                                            <p className="text-sm font-black uppercase tracking-widest text-muted-foreground">Texto Extraído (OCR)</p>
                                            <div className="p-8 rounded-3xl bg-muted/30 border border-dashed border-border font-serif text-lg leading-relaxed text-slate-600 whitespace-pre-wrap">
                                                {selectedEssay.content || "Nenhum texto pôde ser extraído da imagem."}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Feedback movido para baixo da redação */}
                            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
                                <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground mb-6">Feedback Detalhado</h3>
                                <div className="text-sm leading-relaxed max-w-none">
                                    <MarkdownViewer
                                        content={selectedEssay.feedback || "Aguardando correção..."}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-card border border-border rounded-3xl p-8 shadow-2xl relative overflow-hidden">
                                <div className="relative z-10 flex flex-col gap-8">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600">
                                                <Sparkles size={18} />
                                            </div>
                                            <h3 className="font-bold text-lg">Resultado da Correção</h3>
                                        </div>
                                        <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                                            Concluído
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-muted-foreground text-sm font-medium mb-1">Nota geral</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-6xl font-black text-foreground">{selectedEssay.grade || 0}</span>
                                            <span className="text-2xl font-black text-emerald-500">/1000</span>
                                        </div>
                                    </div>

                                    <div className="space-y-6">
                                        <CompetencyProgress
                                            title="Competência I — Domínio da norma culta"
                                            score={selectedEssay.c1Score || 0}
                                            colorClass="text-emerald-500"
                                        />
                                        <CompetencyProgress
                                            title="Competência II — Compreensão do tema"
                                            score={selectedEssay.c2Score || 0}
                                            colorClass="text-indigo-500"
                                        />
                                        <CompetencyProgress
                                            title="Competência III — Argumentação"
                                            score={selectedEssay.c3Score || 0}
                                            colorClass="text-amber-500"
                                        />
                                        <CompetencyProgress
                                            title="Competência IV — Coesão textual"
                                            score={selectedEssay.c4Score || 0}
                                            colorClass="text-purple-500"
                                        />
                                        <CompetencyProgress
                                            title="Competência V — Proposta de intervenção"
                                            score={selectedEssay.c5Score || 0}
                                            colorClass="text-pink-500"
                                        />
                                    </div>

                                    {selectedEssay.improvementHint && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 relative"
                                        >
                                            <p className="text-sm leading-relaxed text-slate-600">
                                                <span className="text-emerald-600 font-bold">Ponto de melhoria:</span> {selectedEssay.improvementHint}
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                                <div className="absolute -right-20 -top-20 opacity-[0.05] rotate-12 text-primary">
                                    <Sparkles size={300} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
