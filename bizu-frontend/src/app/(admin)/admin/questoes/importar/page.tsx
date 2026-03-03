"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    Download,
    Upload,
    CheckCircle2,
    AlertCircle,
    FileJson,
    BookOpen,
    Zap,
    History,
    ChevronDown,
    ChevronUp,
    Loader2,
    Settings2,
    FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiFetch } from "@/lib/api";
import { useCustomDialog } from "@/components/CustomDialogProvider";
import PageHeader from "@/components/PageHeader";

type ImportLog = {
    id: string;
    courseTitle: string;
    moduleTitle: string;
    category: string;
    questionCount: number;
    fileName: string;
    importedBy: string;
    importedAt: string;
};

type ImportResult = {
    count: number;
    errors: string[];
    logId: string;
};

export default function ImportarQuestoes() {
    const { alert } = useCustomDialog();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Template step
    const [courses, setCourses] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [selectedModuleId, setSelectedModuleId] = useState("");
    const [templateCategory, setTemplateCategory] = useState<"QUIZ" | "SIMULADO">("QUIZ");
    const [downloadingTemplate, setDownloadingTemplate] = useState(false);

    // Upload step
    const [uploadFile, setUploadFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [importResult, setImportResult] = useState<ImportResult | null>(null);

    // Logs
    const [logs, setLogs] = useState<ImportLog[]>([]);
    const [loadingLogs, setLoadingLogs] = useState(true);
    const [showLogs, setShowLogs] = useState(false);

    useEffect(() => {
        apiFetch("/admin/courses")
            .then(r => r.json())
            .then(d => Array.isArray(d) && setCourses(d))
            .catch(console.error);

        loadLogs();
    }, []);

    useEffect(() => {
        setModules([]);
        setSelectedModuleId("");
        if (selectedCourseId) {
            apiFetch(`/admin/modules/course/${selectedCourseId}`)
                .then(r => r.json())
                .then(d => Array.isArray(d) && setModules(d))
                .catch(console.error);
        }
    }, [selectedCourseId]);

    const loadLogs = () => {
        setLoadingLogs(true);
        apiFetch("/admin/questions/import/logs")
            .then(r => r.json())
            .then(d => Array.isArray(d) && setLogs(d))
            .catch(console.error)
            .finally(() => setLoadingLogs(false));
    };

    const handleDownloadTemplate = async () => {
        if (!selectedCourseId || !selectedModuleId) {
            alert("Selecione um curso e um módulo para o template.", { type: "danger" });
            return;
        }
        setDownloadingTemplate(true);
        try {
            const course = courses.find(c => c.id === selectedCourseId);
            const module = modules.find(m => m.id === selectedModuleId);
            const params = new URLSearchParams({
                courseId: selectedCourseId,
                courseTitle: course?.title || "",
                moduleId: selectedModuleId,
                moduleTitle: module?.title || "",
                category: templateCategory
            });
            const res = await apiFetch(`/admin/questions/import/template?${params}`);
            if (!res.ok) throw new Error("Falha ao baixar template");
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `template_questoes_${templateCategory.toLowerCase()}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Erro ao baixar o template.", { type: "danger" });
        } finally {
            setDownloadingTemplate(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setUploadFile(file);
            setImportResult(null);
        }
    };

    const handleImport = async () => {
        if (!uploadFile) {
            alert("Selecione um arquivo JSON para importar.", { type: "danger" });
            return;
        }
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append("file", uploadFile);
            const res = await apiFetch("/admin/questions/import/json", {
                method: "POST",
                body: formData,
                headers: {} // let browser set multipart boundary
            });
            const data = await res.json();
            if (res.ok) {
                setImportResult(data);
                setUploadFile(null);
                if (fileInputRef.current) fileInputRef.current.value = "";
                loadLogs();
            } else {
                alert(data.message || "Erro ao importar questões.", { type: "danger" });
            }
        } catch {
            alert("Erro ao processar o arquivo.", { type: "danger" });
        } finally {
            setUploading(false);
        }
    };

    const handleDownloadLogFile = async (logId: string, fileName: string) => {
        try {
            const res = await apiFetch(`/admin/questions/import/logs/${logId}/file`);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName || `import_${logId}.json`;
            a.click();
            URL.revokeObjectURL(url);
        } catch {
            alert("Erro ao baixar o arquivo.", { type: "danger" });
        }
    };

    const categoryColor = templateCategory === "SIMULADO"
        ? { border: "border-amber-200", bg: "bg-amber-50", text: "text-amber-600", btn: "bg-amber-500 hover:bg-amber-600" }
        : { border: "border-indigo-200", bg: "bg-indigo-50", text: "text-indigo-600", btn: "bg-primary hover:bg-primary/90" };

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 py-12 max-w-[900px] relative">
                {/* Header */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
                    <Link href="/admin/questoes" className="group text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-all mb-6 w-fit">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Voltar para Banco
                    </Link>
                    <PageHeader title="Importar Questões em Lote" description="Baixe o template, preencha suas questões e faça upload para importar automaticamente." badge="CMS PLATFORM" />
                </motion.div>

                {/* ── STEP 1: Download Template ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border-2 border-muted rounded-[40px] p-8 mb-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">1</div>
                        <div>
                            <h2 className="text-xl font-extrabold">Baixar Template JSON</h2>
                            <p className="text-sm text-muted-foreground">Selecione curso, módulo e tipo para gerar o template com exemplos.</p>
                        </div>
                    </div>

                    {/* Category toggle */}
                    <div className="flex gap-3">
                        {(["QUIZ", "SIMULADO"] as const).map(cat => (
                            <button
                                key={cat}
                                onClick={() => setTemplateCategory(cat)}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wide transition-all border-2 ${templateCategory === cat
                                    ? cat === "SIMULADO"
                                        ? "bg-amber-50 border-amber-300 text-amber-700"
                                        : "bg-indigo-50 border-indigo-300 text-indigo-700"
                                    : "border-muted text-muted-foreground hover:border-primary/30"}`}
                            >
                                {cat === "QUIZ" ? <Zap className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                                {cat === "QUIZ" ? "Treino / Quiz" : "Simulado"}
                            </button>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Curso</label>
                            <div className="relative">
                                <select
                                    className="w-full h-12 px-4 pr-10 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 font-bold text-sm outline-none appearance-none transition-all cursor-pointer"
                                    value={selectedCourseId}
                                    onChange={e => setSelectedCourseId(e.target.value)}
                                >
                                    <option value="">Selecione um curso...</option>
                                    {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                </select>
                                <Settings2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">Módulo</label>
                            <div className="relative">
                                <select
                                    className="w-full h-12 px-4 pr-10 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 font-bold text-sm outline-none appearance-none transition-all cursor-pointer disabled:opacity-50"
                                    value={selectedModuleId}
                                    onChange={e => setSelectedModuleId(e.target.value)}
                                    disabled={!selectedCourseId}
                                >
                                    <option value="">{selectedCourseId ? "Selecione um módulo..." : "Primeiro selecione o curso"}</option>
                                    {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                </select>
                                <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={handleDownloadTemplate}
                        disabled={!selectedCourseId || !selectedModuleId || downloadingTemplate}
                        className="h-12 rounded-2xl font-black px-8 gap-2 bg-gradient-to-r from-primary to-primary-dark shadow-lg shadow-primary/20"
                    >
                        {downloadingTemplate ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        Baixar Template JSON
                    </Button>
                </motion.div>

                {/* ── Template structure info ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-muted/30 border border-muted rounded-3xl p-6 mb-8">
                    <h3 className="font-black text-sm mb-3 flex items-center gap-2"><FileJson className="w-4 h-4 text-primary" /> Estrutura do JSON</h3>
                    <pre className="text-xs text-muted-foreground leading-relaxed overflow-x-auto bg-muted/40 rounded-2xl p-4 font-mono">{`{
  "course": "Nome do Curso",
  "courseId": "uuid",
  "module": "Nome do Módulo",
  "moduleId": "uuid",
  "category": "QUIZ",         // ou "SIMULADO"
  "questions": [
    {
      "statement": "Enunciado aqui...",
      "imageBase64": null,    // base64 da imagem ou null
      "options": { "A": "...", "B": "...", "C": "...", "D": "..." },
      "correctOption": "A",
      "resolution": "Explicação da resposta...",
      "banca": "VUNESP",      // opcional
      "year": 2024,
      "subject": "Disciplina",
      "topic": "Assunto",
      "difficulty": "EASY"    // EASY, MEDIUM ou HARD
    }
  ]
}`}</pre>
                </motion.div>

                {/* ── STEP 2: Upload ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border-2 border-muted rounded-[40px] p-8 mb-8 space-y-6">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-lg">2</div>
                        <div>
                            <h2 className="text-xl font-extrabold">Fazer Upload do JSON Preenchido</h2>
                            <p className="text-sm text-muted-foreground">As questões serão importadas automaticamente e o arquivo ficará salvo para auditoria.</p>
                        </div>
                    </div>

                    {uploadFile ? (
                        <div className="flex items-center gap-4 p-4 bg-primary/5 border-2 border-primary/20 rounded-2xl">
                            <FileJson className="w-8 h-8 text-primary" />
                            <div className="flex-1">
                                <p className="font-bold text-sm">{uploadFile.name}</p>
                                <p className="text-xs text-muted-foreground">{(uploadFile.size / 1024).toFixed(1)} KB</p>
                            </div>
                            <button onClick={() => { setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ""; }} className="text-muted-foreground hover:text-destructive transition-colors text-xs font-bold">Remover</button>
                        </div>
                    ) : (
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="w-full h-28 rounded-3xl border-2 border-dashed border-muted hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
                        >
                            <Upload className="w-6 h-6 group-hover:scale-110 transition-transform" />
                            <span className="text-sm font-semibold">Clique para selecionar o arquivo JSON</span>
                        </button>
                    )}
                    <input ref={fileInputRef} type="file" accept=".json,application/json" onChange={handleFileChange} className="hidden" />

                    <Button
                        onClick={handleImport}
                        disabled={!uploadFile || uploading}
                        className="h-12 rounded-2xl font-black px-8 gap-2 bg-gradient-to-r from-primary to-primary-dark shadow-lg shadow-primary/20"
                    >
                        {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? "Importando..." : "Importar Questões"}
                    </Button>

                    {/* Result */}
                    <AnimatePresence>
                        {importResult && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`p-5 rounded-2xl border-2 space-y-3 ${importResult.errors.length === 0 ? "bg-success/5 border-success/30" : "bg-amber-50 border-amber-200"}`}
                            >
                                <div className="flex items-center gap-3">
                                    {importResult.errors.length === 0
                                        ? <CheckCircle2 className="w-5 h-5 text-success" />
                                        : <AlertCircle className="w-5 h-5 text-amber-600" />
                                    }
                                    <p className="font-black text-sm">
                                        {importResult.count} questão{importResult.count !== 1 ? "s" : ""} importada{importResult.count !== 1 ? "s" : ""} com sucesso
                                        {importResult.errors.length > 0 && ` — ${importResult.errors.length} erro(s)`}
                                    </p>
                                </div>
                                {importResult.errors.length > 0 && (
                                    <ul className="text-xs text-amber-700 space-y-1 ml-8">
                                        {importResult.errors.map((e, i) => <li key={i}>• {e}</li>)}
                                    </ul>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* ── Import History ── */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <button
                        onClick={() => setShowLogs(!showLogs)}
                        className="w-full flex items-center justify-between px-6 py-4 bg-card border-2 border-muted rounded-3xl font-bold text-sm hover:border-primary/20 transition-all"
                    >
                        <span className="flex items-center gap-3">
                            <History className="w-4 h-4 text-muted-foreground" />
                            Histórico de Importações
                            {!loadingLogs && <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{logs.length}</span>}
                        </span>
                        {showLogs ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </button>

                    <AnimatePresence>
                        {showLogs && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="mt-3 space-y-3">
                                    {loadingLogs ? (
                                        <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
                                    ) : logs.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground text-sm">Nenhuma importação registrada ainda.</div>
                                    ) : (
                                        logs.map(log => (
                                            <div key={log.id} className="flex items-center justify-between gap-4 bg-card border border-muted rounded-2xl px-5 py-4">
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${log.category === "SIMULADO" ? "bg-amber-100 text-amber-600" : "bg-indigo-100 text-indigo-600"}`}>
                                                        {log.category === "SIMULADO" ? <BookOpen className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-bold text-sm truncate">{log.courseTitle} — {log.moduleTitle}</p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {log.questionCount} questão{log.questionCount !== 1 ? "s" : ""} · {log.category} · {new Date(log.importedAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={() => handleDownloadLogFile(log.id, log.fileName)}
                                                    className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-primary transition-colors"
                                                >
                                                    <Download className="w-3.5 h-3.5" /> Arquivo
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}
