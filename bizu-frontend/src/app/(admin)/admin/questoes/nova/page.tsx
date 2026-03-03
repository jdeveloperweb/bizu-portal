"use client";

import PageHeader from "../../../../../components/PageHeader";
import RichTextEditor from "../../../../../components/admin/RichTextEditor";
import {
    Save,
    ArrowLeft,
    HelpCircle,
    Settings2,
    CheckCircle2,
    FileText,
    Dumbbell,
    PlusCircle,
    Trash2,
    MinusCircle,
    Image as ImageIcon,
    X,
    BookOpen,
    Zap,
    Upload
} from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { apiFetch } from "@/lib/api";
import { useCustomDialog } from "@/components/CustomDialogProvider";

function QuestionFormContainer() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { alert } = useCustomDialog();
    const editId = searchParams.get("id");
    const imageInputRef = useRef<HTMLInputElement>(null);

    const [content, setContent] = useState("");
    const [resolution, setResolution] = useState("");
    const [category, setCategory] = useState<"SIMULADO" | "QUIZ">("QUIZ");
    const [difficulty, setDifficulty] = useState<"EASY" | "MEDIUM" | "HARD">("EASY");
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");
    const [banca, setBanca] = useState("");
    const [year, setYear] = useState(new Date().getFullYear());
    const [imageBase64, setImageBase64] = useState<string | null>(null);
    const [options, setOptions] = useState({ A: "", B: "", C: "", D: "" });
    const [correctOption, setCorrectOption] = useState("A");

    const [courses, setCourses] = useState<any[]>([]);
    const [modules, setModules] = useState<any[]>([]);
    const [simulados, setSimulados] = useState<any[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState<string>("");
    const [selectedModuleId, setSelectedModuleId] = useState<string>("");
    const [selectedSimuladoId, setSelectedSimuladoId] = useState<string>("");

    const [isLoading, setIsLoading] = useState(!!editId);

    useEffect(() => {
        if (editId) {
            setIsLoading(true);
            apiFetch(`/admin/questions/${editId}`)
                .then(res => res.json())
                .then(data => {
                    setContent(data.statement || "");
                    setResolution(data.resolution || "");
                    setCategory(data.category || "QUIZ");
                    setDifficulty(data.difficulty || "EASY");
                    setSubject(data.subject || "");
                    setTopic(data.topic || "");
                    setBanca(data.banca || "");
                    setYear(data.year || new Date().getFullYear());
                    setImageBase64(data.imageBase64 || null);
                    setOptions(data.options || { A: "", B: "", C: "", D: "" });
                    setCorrectOption(data.correctOption || "A");
                    if (data.module) {
                        setSelectedModuleId(data.module.id);
                        if (data.module.course) setSelectedCourseId(data.module.course.id);
                    }
                })
                .catch(() => alert("Erro ao carregar os dados da questão.", { type: "danger" }))
                .finally(() => setIsLoading(false));
        }
    }, [editId]);

    useEffect(() => {
        apiFetch("/admin/courses")
            .then(res => res.json())
            .then(data => Array.isArray(data) && setCourses(data))
            .catch(err => console.error("Error fetching courses", err));

        apiFetch("/admin/simulados")
            .then(res => res.json())
            .then(data => {
                const list = data.content || data;
                Array.isArray(list) && setSimulados(list);
            })
            .catch(err => console.error("Error fetching simulados", err));
    }, []);

    useEffect(() => {
        setModules([]);
        setSelectedModuleId("");
        if (selectedCourseId) {
            apiFetch(`/admin/modules/course/${selectedCourseId}`)
                .then(res => res.json())
                .then(data => Array.isArray(data) && setModules(data))
                .catch(err => console.error("Error fetching modules", err));

            const currentSimulado = simulados.find(s => s.id === selectedSimuladoId);
            if (currentSimulado?.course?.id !== selectedCourseId) setSelectedSimuladoId("");
        } else {
            setSelectedSimuladoId("");
        }
    }, [selectedCourseId, simulados]);

    useEffect(() => {
        if (category === "QUIZ") setSelectedSimuladoId("");
    }, [category]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            alert("Imagem muito grande. Máximo permitido: 5MB.", { type: "danger" });
            return;
        }
        const reader = new FileReader();
        reader.onload = () => setImageBase64(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleSave = async () => {
        if (!content.trim()) {
            alert("O enunciado da questão é obrigatório.", { type: "danger" });
            return;
        }
        const filledOptions = Object.values(options).filter(v => v.trim());
        if (filledOptions.length < 2) {
            alert("Preencha pelo menos 2 alternativas.", { type: "danger" });
            return;
        }

        try {
            const method = editId ? "PUT" : "POST";
            let url = editId ? `/admin/questions/${editId}` : "/admin/questions";

            if (!editId && category === "SIMULADO" && selectedSimuladoId) {
                url = `/admin/simulados/${selectedSimuladoId}/questions`;
            }

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    statement: content,
                    resolution,
                    imageBase64,
                    category,
                    difficulty,
                    subject,
                    topic,
                    banca: banca || null,
                    year,
                    options,
                    correctOption,
                    questionType: "MULTIPLE_CHOICE",
                    module: selectedModuleId ? { id: selectedModuleId } : null
                })
            });

            if (res.ok) {
                alert(editId ? "Questão atualizada!" : "Questão publicada com sucesso!", { type: "success" })
                    .then(() => router.push("/admin/questoes"));
            } else {
                alert("Erro ao salvar. Verifique os campos.", { type: "danger" });
            }
        } catch {
            alert("Erro ao salvar a questão.", { type: "danger" });
        }
    };

    if (isLoading) return <div className="p-12 text-center font-bold">Carregando dados da questão...</div>;

    const isSimulado = category === "SIMULADO";

    return (
        <div className="relative min-h-screen">
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-40 left-0 -z-10 w-[400px] h-[400px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="container mx-auto px-6 py-12 max-w-[1600px] relative">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-6">
                        <Link
                            href="/admin/questoes"
                            className="group text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-all duration-300"
                        >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Voltar para Banco
                        </Link>
                        <PageHeader
                            title={editId ? "Editar Questão" : "Cadastrar Questão"}
                            description={isSimulado
                                ? "Questão de simulado — avaliação formal com gabarito e controle."
                                : "Questão de treino (quiz) — prática rápida para estudo livre."}
                            badge="CMS PLATFORM"
                        />
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Category Toggle */}
                        <div className={`flex p-1.5 rounded-2xl border-2 mr-4 transition-all ${isSimulado ? "bg-amber-50 border-amber-200" : "bg-indigo-50 border-indigo-100"}`}>
                            <button
                                onClick={() => setCategory("QUIZ")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${!isSimulado
                                    ? "bg-white text-primary shadow-sm ring-1 ring-primary/10"
                                    : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                Treino / Quiz
                            </button>
                            <button
                                onClick={() => setCategory("SIMULADO")}
                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-wider transition-all ${isSimulado
                                    ? "bg-white text-amber-600 shadow-sm ring-1 ring-amber-200"
                                    : "text-muted-foreground hover:text-foreground"}`}
                            >
                                <BookOpen className="w-3.5 h-3.5" />
                                Simulado
                            </button>
                        </div>
                        <Button
                            onClick={handleSave}
                            className={`h-14 rounded-2xl font-black px-10 gap-3 shadow-2xl border-none hover:opacity-90 active:scale-95 transition-all ${isSimulado
                                ? "bg-gradient-to-r from-amber-500 to-orange-500 shadow-amber-500/30"
                                : "bg-gradient-to-r from-primary to-primary-dark shadow-primary/30"}`}
                        >
                            <Save className="w-5 h-5" />
                            {editId ? "Salvar Alterações" : "Publicar Questão"}
                        </Button>
                    </div>
                </motion.div>

                {/* Category banner */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={category}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        className={`mb-8 px-6 py-3 rounded-2xl text-sm font-semibold flex items-center gap-3 ${isSimulado
                            ? "bg-amber-50 border border-amber-200 text-amber-700"
                            : "bg-indigo-50 border border-indigo-100 text-indigo-700"}`}
                    >
                        {isSimulado
                            ? <><BookOpen className="w-4 h-4 shrink-0" /> <span><strong>Questão de Simulado</strong> — será vinculada a um simulado oficial. Campos como banca e ano são recomendados.</span></>
                            : <><Zap className="w-4 h-4 shrink-0" /> <span><strong>Questão de Treino (Quiz)</strong> — aparece no banco de treino e pode ser usada em duelos. Banca é opcional.</span></>
                        }
                    </motion.div>
                </AnimatePresence>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content */}
                    <div className="lg:col-span-8 space-y-10">

                        {/* Statement */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="group">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <MinusCircle className="w-3 h-3" /> Enunciado Principal
                                </label>
                                <span className="text-[10px] font-medium text-muted-foreground">Markdown Suportado</span>
                            </div>
                            <div className="relative rounded-[40px] overflow-hidden border-2 border-muted transition-all duration-500 group-focus-within:border-primary/30 group-focus-within:shadow-[0_0_40px_rgba(99,102,241,0.08)] bg-card">
                                <RichTextEditor content={content} onChange={setContent} placeholder="Comece a digitar o enunciado da questão..." />
                            </div>
                        </motion.div>

                        {/* Image Upload */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                            <div className="flex items-center justify-between mb-4 px-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <ImageIcon className="w-3 h-3" /> Imagem da Questão <span className="text-[9px] text-muted-foreground/60 normal-case">(opcional)</span>
                                </label>
                            </div>
                            {imageBase64 ? (
                                <div className="relative rounded-3xl overflow-hidden border-2 border-muted bg-card">
                                    <img src={imageBase64} alt="Imagem da questão" className="max-h-64 w-full object-contain p-4" />
                                    <button
                                        onClick={() => setImageBase64(null)}
                                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-destructive/10 text-destructive flex items-center justify-center hover:bg-destructive/20 transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => imageInputRef.current?.click()}
                                    className="w-full h-24 rounded-3xl border-2 border-dashed border-muted hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group"
                                >
                                    <Upload className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-semibold">Clique para adicionar imagem (máx. 5MB)</span>
                                </button>
                            )}
                            <input ref={imageInputRef} type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </motion.div>

                        {/* Alternatives */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                            <div className="flex items-center justify-between border-b-2 border-muted pb-4 mb-8">
                                <h3 className="text-xl font-extrabold flex items-center gap-3">
                                    <PlusCircle className="w-6 h-6 text-primary" /> Alternativas
                                </h3>
                                <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                    <span className="flex w-2 h-2 rounded-full bg-success" /> Selecione a Correta
                                </span>
                            </div>
                            <div className="grid grid-cols-1 gap-5">
                                {Object.entries(options).map(([key, value], idx) => (
                                    <motion.div
                                        key={key}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 + idx * 0.05 }}
                                        whileHover={{ y: -3 }}
                                        className={`flex items-stretch gap-5 p-2 pr-6 rounded-[28px] border-2 transition-all duration-300 ${correctOption === key
                                            ? "border-success bg-success/[0.03] shadow-[0_16px_32px_-12px_rgba(5,150,105,0.12)]"
                                            : "border-muted hover:border-primary/20 bg-card"}`}
                                    >
                                        <button
                                            onClick={() => setCorrectOption(key)}
                                            className={`w-14 h-14 rounded-[20px] flex items-center justify-center text-lg font-black transition-all duration-300 relative overflow-hidden ${correctOption === key
                                                ? "bg-success text-white shadow-lg shadow-success/30"
                                                : "bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary"}`}
                                        >
                                            {key}
                                        </button>
                                        <div className="flex-1 flex items-center">
                                            <input
                                                type="text"
                                                value={value}
                                                onChange={(e) => setOptions({ ...options, [key]: e.target.value })}
                                                placeholder={`Alternativa ${key}...`}
                                                className={`w-full bg-transparent outline-none font-bold text-base placeholder:text-muted-foreground/30 transition-all ${correctOption === key ? "text-success-800" : "text-foreground"}`}
                                            />
                                        </div>
                                        <div className="flex items-center">
                                            {correctOption === key
                                                ? <div className="w-9 h-9 rounded-full bg-success/10 flex items-center justify-center text-success"><CheckCircle2 className="w-5 h-5" /></div>
                                                : <div className="w-9 h-9 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground opacity-20 hover:opacity-60 transition-opacity cursor-pointer" onClick={() => setOptions({ ...options, [key]: "" })}><Trash2 className="w-4 h-4" /></div>
                                            }
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Resolution / Explanation */}
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="group">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground flex items-center gap-2">
                                    <HelpCircle className="w-3 h-3" /> Explicação / Resolução
                                    <span className="text-[9px] text-muted-foreground/60 normal-case">(mostrada após responder)</span>
                                </label>
                                <span className="text-[10px] font-medium text-muted-foreground">Markdown Suportado</span>
                            </div>
                            <div className="relative rounded-[40px] overflow-hidden border-2 border-muted transition-all duration-500 group-focus-within:border-primary/30 group-focus-within:shadow-[0_0_40px_rgba(99,102,241,0.08)] bg-card">
                                <RichTextEditor content={resolution} onChange={setResolution} placeholder="Explique por que a alternativa correta está certa..." />
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 lg:pl-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.4 }}
                            className={`sticky top-12 p-8 rounded-[48px] border-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-7 backdrop-blur-md transition-all ${isSimulado ? "bg-amber-50/50 border-amber-100" : "bg-card border-muted/50"}`}
                        >
                            <div className="relative">
                                <h3 className="text-2xl font-black flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${isSimulado ? "bg-amber-100 text-amber-600" : "bg-primary/10 text-primary"}`}>
                                        <Settings2 className="w-6 h-6" />
                                    </div>
                                    Propriedades
                                </h3>
                            </div>

                            <div className="space-y-5">
                                {/* Course */}
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isSimulado ? "text-amber-600" : "text-primary"}`}>Curso Vinculado</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 px-4 pr-10 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 font-bold text-sm outline-none appearance-none transition-all cursor-pointer"
                                            value={selectedCourseId}
                                            onChange={(e) => setSelectedCourseId(e.target.value)}
                                        >
                                            <option value="">Selecione um curso...</option>
                                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                        </select>
                                        <Settings2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>

                                {/* Module */}
                                <div className="space-y-2">
                                    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${isSimulado ? "text-amber-600" : "text-primary"}`}>Módulo do Curso</label>
                                    <div className="relative">
                                        <select
                                            className="w-full h-12 px-4 pr-10 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 font-bold text-sm outline-none appearance-none transition-all cursor-pointer disabled:opacity-50"
                                            value={selectedModuleId}
                                            onChange={(e) => setSelectedModuleId(e.target.value)}
                                            disabled={!selectedCourseId}
                                        >
                                            <option value="">{selectedCourseId ? "Selecione um módulo..." : "Selecione um curso primeiro"}</option>
                                            {modules.map(m => <option key={m.id} value={m.id}>{m.title}</option>)}
                                        </select>
                                        <FileText className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                                    </div>
                                </div>

                                {/* Simulado — only for SIMULADO category */}
                                <AnimatePresence>
                                    {isSimulado && (
                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-2 overflow-hidden">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] ml-1 text-amber-600">Simulado Vinculado</label>
                                            <div className="relative">
                                                <select
                                                    className="w-full h-12 px-4 pr-10 rounded-2xl bg-amber-50 border-2 border-amber-200 focus:border-amber-400 font-bold text-sm outline-none appearance-none transition-all cursor-pointer"
                                                    value={selectedSimuladoId}
                                                    onChange={(e) => setSelectedSimuladoId(e.target.value)}
                                                >
                                                    <option value="">Selecione um simulado...</option>
                                                    {simulados
                                                        .filter(s => !selectedCourseId || s.course?.id === selectedCourseId)
                                                        .map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                                                </select>
                                                <BookOpen className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500 pointer-events-none" />
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Subject */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Disciplina</label>
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="Ex: Direito Administrativo"
                                        className="w-full h-12 px-4 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-bold text-sm outline-none transition-all"
                                    />
                                </div>

                                {/* Topic */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Assunto / Tópico</label>
                                    <input
                                        type="text"
                                        value={topic}
                                        onChange={(e) => setTopic(e.target.value)}
                                        placeholder="Ex: Atos administrativos"
                                        className="w-full h-12 px-4 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-bold text-sm outline-none transition-all"
                                    />
                                </div>

                                {/* Banca — optional */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">
                                        Banca Examinadora <span className="text-[9px] text-muted-foreground/50 normal-case">(opcional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={banca}
                                        onChange={(e) => setBanca(e.target.value)}
                                        placeholder="Ex: VUNESP, CEBRASPE..."
                                        className="w-full h-12 px-4 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-bold text-sm outline-none transition-all"
                                    />
                                </div>

                                {/* Year */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Ano da Questão</label>
                                    <input
                                        type="number"
                                        value={year}
                                        onChange={(e) => setYear(parseInt(e.target.value))}
                                        className="w-full h-12 px-4 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-black text-sm outline-none transition-all"
                                    />
                                </div>

                                {/* Difficulty */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Grau de Dificuldade</label>
                                    <div className="bg-muted/30 p-1.5 rounded-2xl grid grid-cols-3 gap-1.5 border border-muted/50">
                                        {[
                                            { id: "EASY", label: "Fácil", color: "bg-success" },
                                            { id: "MEDIUM", label: "Médio", color: "bg-amber-500" },
                                            { id: "HARD", label: "Difícil", color: "bg-destructive" }
                                        ].map(d => (
                                            <button
                                                key={d.id}
                                                onClick={() => setDifficulty(d.id as any)}
                                                className={`h-10 rounded-xl font-bold text-[10px] uppercase transition-all flex flex-col items-center justify-center gap-1 ${difficulty === d.id ? "bg-white text-foreground shadow-sm ring-2 ring-primary/10" : "hover:text-foreground text-muted-foreground"}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${difficulty === d.id ? d.color : "bg-muted-foreground/30"}`} />
                                                {d.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Tip */}
                            <div className={`p-5 rounded-[28px] border space-y-3 ${isSimulado ? "bg-amber-50 border-amber-200" : "bg-gradient-to-br from-indigo-500/10 to-primary/5 border-primary/20"}`}>
                                <div className={`flex items-center gap-2 ${isSimulado ? "text-amber-600" : "text-primary"}`}>
                                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${isSimulado ? "bg-amber-100" : "bg-primary/20"}`}>
                                        <HelpCircle className="w-3.5 h-3.5" />
                                    </div>
                                    <h4 className="font-black text-[10px] uppercase tracking-widest">Dica</h4>
                                </div>
                                <p className="text-[11px] text-muted-foreground font-medium leading-relaxed">
                                    {isSimulado
                                        ? <>Questões de <strong className="text-amber-600">Simulado</strong> são avaliações cronometradas e formais. Preencha banca e ano para rastreabilidade.</>
                                        : <>Questões de <strong className="text-primary">Treino</strong> aparecem no quiz diário e duelos. Banca é opcional — foque em enunciados objetivos.</>
                                    }
                                </p>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function NovaQuestaoPage() {
    return (
        <Suspense fallback={<div className="p-12 text-center font-bold">Carregando editor...</div>}>
            <QuestionFormContainer />
        </Suspense>
    );
}
