"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    ChevronLeft,
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    FileText,
    Video,
    Music,
    Upload,
    ExternalLink,
    Eye,
    Save,
    X,
    Layout,
    CheckCircle2,
    Circle,
    MoreVertical,
    BookOpen,
    HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Material {
    id: string;
    title: string;
    description: string;
    content: string;
    fileUrl: string;
    fileType: string;
    isFree: boolean;
    durationMinutes: number;
}

interface Module {
    id: string;
    title: string;
    description: string;
    objectives: string;
    orderIndex: number;
    materials: Material[];
    durationMinutes: number;
}

interface Course {
    id: string;
    title: string;
    description: string;
    thumbnailUrl: string;
    themeColor: string;
    textColor: string;
    status: string;
    category: string;
    level: string;
    isMandatory: boolean;
    modules: Module[];
}

export default function CourseEditorPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Modals
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [isStudioOpen, setIsStudioOpen] = useState(false);

    // Forms
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [moduleForm, setModuleForm] = useState({ title: "", description: "", objectives: "", orderIndex: 1 });

    const [studioTab, setStudioTab] = useState<"editor" | "preview">("editor");
    const [isUploading, setIsUploading] = useState(false);
    const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
    const [activeModuleId, setActiveModuleId] = useState<string | null>(null);
    const [materialForm, setMaterialForm] = useState({
        title: "",
        description: "",
        content: "",
        fileUrl: "",
        fileType: "VIDEO",
        isFree: false,
        durationMinutes: 30
    });

    const fetchCourse = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/admin/courses/${courseId}`);
            if (res.ok) {
                const data = await res.json();
                setCourse(data);
            }
        } catch (error) {
            toast.error("Erro ao carregar curso");
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        if (courseId) fetchCourse();
    }, [courseId, fetchCourse]);

    const handleSaveCourse = async () => {
        if (!course) return;
        try {
            const res = await apiFetch(`/admin/courses/${courseId}`, {
                method: "PUT",
                body: JSON.stringify(course)
            });
            if (res.ok) {
                toast.success("Curso salvo com sucesso!");
                fetchCourse();
            }
        } catch (error) {
            toast.error("Erro ao salvar curso");
        }
    };

    const handleSaveModule = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = editingModule ? "PUT" : "POST";
            const url = editingModule ? `/admin/modules/${editingModule.id}` : "/admin/modules";

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    ...moduleForm,
                    course: { id: courseId },
                    orderIndex: Number(moduleForm.orderIndex)
                })
            });

            if (res.ok) {
                toast.success(editingModule ? "Módulo atualizado" : "Módulo criado");
                fetchCourse();
                setIsModuleModalOpen(false);
                setEditingModule(null);
                setModuleForm({ title: "", description: "", objectives: "", orderIndex: 1 });
            }
        } catch (error) {
            toast.error("Erro ao salvar módulo");
        }
    };

    const handleSaveMaterial = async () => {
        try {
            const method = editingMaterial ? "PUT" : "POST";
            const url = editingMaterial ? `/admin/materials/${editingMaterial.id}` : "/admin/materials";

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    ...materialForm,
                    module: { id: activeModuleId },
                    durationMinutes: Number(materialForm.durationMinutes)
                })
            });

            if (res.ok) {
                toast.success("Conteúdo publicado!");
                fetchCourse();
                setIsStudioOpen(false);
                setEditingMaterial(null);
            }
        } catch (error) {
            toast.error("Erro ao salvar conteúdo");
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Remover este módulo e todo seu conteúdo?")) return;
        try {
            const res = await apiFetch(`/admin/modules/${moduleId}`, { method: "DELETE" });
            if (res.ok) fetchCourse();
        } catch (error) {
            toast.error("Erro ao deletar módulo");
        }
    };

    const handleDeleteMaterial = async (materialId: string) => {
        if (!confirm("Remover esta aula?")) return;
        try {
            const res = await apiFetch(`/admin/materials/${materialId}`, { method: "DELETE" });
            if (res.ok) fetchCourse();
        } catch (error) {
            toast.error("Erro ao deletar conteúdo");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const res = await apiFetch("/admin/files/upload", {
                method: "POST",
                body: formData
            });

            if (res.ok) {
                const url = await res.text();
                setMaterialForm({ ...materialForm, fileUrl: url });
                toast.success("Arquivo enviado com sucesso!");
            } else {
                toast.error("Erro ao enviar arquivo.");
            }
        } catch (error) {
            console.error("Upload error", error);
            toast.error("Erro na conexão com o servidor.");
        } finally {
            setIsUploading(false);
        }
    };

    if (isLoading) return <div className="p-20 text-center font-black animate-pulse text-muted-foreground uppercase tracking-widest">Carregando Studio...</div>;
    if (!course) return <div className="p-20 text-center text-destructive font-black">Curso não encontrado.</div>;

    return (
        <div className="min-h-screen bg-[#F8F9FC] pb-24">
            {/* Header */}
            <header className="bg-white border-b px-8 py-6 sticky top-0 z-30 shadow-sm">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => router.back()}
                            className="bg-slate-50 hover:bg-slate-100 p-2.5 rounded-2xl border transition-all"
                        >
                            <ChevronLeft className="w-5 h-5 text-slate-600" />
                        </button>
                        <div>
                            <div className="flex items-center gap-3">
                                <h1 className="text-3xl font-[900] tracking-tight text-slate-900">Editor de Conteúdo</h1>
                                <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter">ID: {courseId.split('-')[0]}</span>
                            </div>
                            <p className="text-slate-500 text-sm font-medium">Configure os detalhes, rituais, módulos e lições do treinamento.</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="outline"
                            className="h-12 px-6 rounded-2xl font-bold border-2 hover:bg-slate-50"
                            onClick={() => router.push(`/cursos/${courseId}`)}
                        >
                            <Eye className="w-4 h-4" />
                            Visualizar como Aluno
                        </Button>
                        <Button
                            className="h-12 px-8 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 gap-2"
                            onClick={handleSaveCourse}
                        >
                            <Save className="w-4 h-4" />
                            Salvar Alterações
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-8 mt-10">
                <div className="grid grid-cols-12 gap-10">
                    {/* Left Column */}
                    <div className="col-span-8 space-y-10">
                        {/* Course Info Card */}
                        <section className="bg-white rounded-[40px] border p-10 shadow-sm">
                            <h2 className="text-xl font-black text-slate-800 mb-8">Editar Treinamento</h2>

                            <div className="space-y-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título do Curso</label>
                                    <Input
                                        value={course.title}
                                        onChange={e => setCourse({ ...course, title: e.target.value })}
                                        className="h-14 rounded-2xl text-lg font-bold border-2 focus:ring-blue-500"
                                        placeholder="Ex: Telecurso 2000"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Categoria</label>
                                        <select
                                            value={course.category || ""}
                                            onChange={e => setCourse({ ...course, category: e.target.value })}
                                            className="w-full h-14 px-4 rounded-2xl border-2 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none shadow-sm cursor-pointer"
                                        >
                                            <option value="">Selecione...</option>
                                            <option value="Direito">Direito</option>
                                            <option value="Matemática">Matemática</option>
                                            <option value="Português">Português</option>
                                            <option value="Cultura">Cultura Geral</option>
                                            <option value="Carreira Militar">Carreira Militar</option>
                                            <option value="Formação">Formação</option>
                                            <option value="Específicos">Conhecimentos Específicos</option>
                                            <option value="Inglês">Inglês / Idiomas</option>
                                            <option value="Administrativo">Administrativo</option>
                                            <option value="Saúde">Saúde / Primeiros Socorros</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Nível de Dificuldade</label>
                                        <div className="flex p-1 bg-slate-100 rounded-2xl">
                                            {["INICIANTE", "INTERMEDIARIO", "AVANCADO"].map(lvl => (
                                                <button
                                                    key={lvl}
                                                    onClick={() => setCourse({ ...course, level: lvl })}
                                                    className={cn(
                                                        "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                                                        course.level === lvl ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:text-slate-800"
                                                    )}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Descrição Completa</label>
                                    <textarea
                                        value={course.description}
                                        onChange={e => setCourse({ ...course, description: e.target.value })}
                                        className="w-full min-h-[160px] p-5 rounded-[24px] border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium resize-none"
                                        placeholder="Descreva o que o aluno irá aprender..."
                                    />
                                </div>

                                <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border-2">
                                    <div>
                                        <p className="font-black text-slate-800">Treinamento Obrigatório</p>
                                        <p className="text-xs text-slate-400 font-medium">Este curso será marcado como mandatório para todos.</p>
                                    </div>
                                    <button
                                        onClick={() => setCourse({ ...course, isMandatory: !course.isMandatory })}
                                        className={cn(
                                            "w-14 h-8 rounded-full transition-all relative",
                                            course.isMandatory ? "bg-blue-600" : "bg-slate-300"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 bg-white rounded-full absolute top-1 transition-all",
                                            course.isMandatory ? "left-7" : "left-1"
                                        )} />
                                    </button>
                                </div>
                            </div>
                        </section>

                        {/* Content Structure Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-4">
                                <div>
                                    <h2 className="text-2xl font-[900] text-slate-800">Estrutura de Conteúdo</h2>
                                    <p className="text-slate-400 text-sm font-medium">Módulos e Lições do curso.</p>
                                </div>
                                <Button
                                    className="h-12 px-6 rounded-2xl font-black bg-white border-2 text-blue-600 hover:bg-blue-50 gap-2"
                                    onClick={() => {
                                        setEditingModule(null);
                                        setModuleForm({
                                            title: "",
                                            description: "",
                                            objectives: "",
                                            orderIndex: (course.modules?.length || 0) + 1
                                        });
                                        setIsModuleModalOpen(true);
                                    }}
                                >
                                    <Plus className="w-5 h-5" />
                                    Novo Módulo
                                </Button>
                            </div>

                            <div className="space-y-6">
                                {course.modules?.sort((a, b) => a.orderIndex - b.orderIndex).map((mod, mIdx) => (
                                    <div key={mod.id} className="bg-white rounded-[40px] border shadow-sm overflow-hidden border-transparent hover:border-blue-100 transition-all group">
                                        <div className="p-8 flex items-center justify-between border-b bg-slate-50/30">
                                            <div className="flex items-center gap-6">
                                                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-lg shadow-lg">
                                                    {mIdx + 1}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-black text-slate-800">{mod.title}</h3>
                                                    {mod.description && <p className="text-sm text-slate-400 font-medium">{mod.description}</p>}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => {
                                                        setEditingModule(mod);
                                                        setModuleForm({
                                                            title: mod.title,
                                                            description: mod.description || "",
                                                            objectives: mod.objectives || "",
                                                            orderIndex: mod.orderIndex
                                                        });
                                                        setIsModuleModalOpen(true);
                                                    }}
                                                    className="p-2 hover:bg-slate-100 rounded-xl transition-all"
                                                >
                                                    <Pencil className="w-4 h-4 text-slate-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteModule(mod.id)}
                                                    className="p-2 hover:bg-red-50 rounded-xl transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4 text-red-300 hover:text-red-500" />
                                                </button>
                                            </div>
                                        </div>

                                        <div className="p-8 space-y-4">
                                            {mod.materials?.map((mat) => (
                                                <div key={mat.id} className="bg-slate-50 border-2 border-transparent hover:border-blue-100 hover:bg-white p-5 rounded-3xl flex items-center justify-between transition-all group/item shadow-sm hover:shadow-lg">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 rounded-2xl bg-white border flex items-center justify-center text-blue-600 shadow-sm transition-transform group-hover/item:scale-110">
                                                            {mat.fileType === "VIDEO" ? <Video className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-slate-800">{mat.title}</p>
                                                            <div className="flex items-center gap-3 mt-1">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">{mat.durationMinutes || 0}M</span>
                                                                <div className="w-1 h-1 rounded-full bg-slate-300" />
                                                                <span className="text-[10px] font-black text-blue-500 uppercase tracking-tighter">{mat.fileType}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                                                        <button
                                                            onClick={() => {
                                                                setEditingMaterial(mat);
                                                                setMaterialForm({
                                                                    title: mat.title,
                                                                    description: mat.description || "",
                                                                    content: mat.content || "",
                                                                    fileUrl: mat.fileUrl,
                                                                    fileType: mat.fileType,
                                                                    isFree: mat.isFree,
                                                                    durationMinutes: mat.durationMinutes || 0
                                                                });
                                                                setActiveModuleId(mod.id);
                                                                setIsStudioOpen(true);
                                                                setStudioTab("editor");
                                                            }}
                                                            className="p-3 bg-white border rounded-2xl hover:border-blue-500 text-slate-400 hover:text-blue-600 transition-all shadow-sm"
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteMaterial(mat.id)}
                                                            className="p-3 bg-white border rounded-2xl hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all shadow-sm"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}

                                            <button
                                                onClick={() => {
                                                    setEditingMaterial(null);
                                                    setMaterialForm({
                                                        title: "",
                                                        description: "",
                                                        content: "",
                                                        fileUrl: "",
                                                        fileType: "VIDEO",
                                                        isFree: false,
                                                        durationMinutes: 30
                                                    });
                                                    setActiveModuleId(mod.id);
                                                    setIsStudioOpen(true);
                                                }}
                                                className="w-full py-6 rounded-[32px] border-2 border-dashed border-slate-200 text-blue-600 font-black text-xs uppercase tracking-widest hover:bg-blue-50 hover:border-blue-200 transition-all flex items-center justify-center gap-3"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Adicionar Aula
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Sidebar) */}
                    <div className="col-span-4 space-y-8">
                        {/* Capa do Treinamento */}
                        <section className="bg-white rounded-[40px] border p-8 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6">Capa do Treinamento</h3>

                            <div className="space-y-6">
                                <div className="aspect-video bg-slate-100 rounded-3xl border-2 border-dashed overflow-hidden flex items-center justify-center group relative">
                                    {course.thumbnailUrl ? (
                                        <img src={course.thumbnailUrl} alt="Capa" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="text-center p-6">
                                            <Upload className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                            <p className="text-xs font-bold text-slate-400">Imagem que aparecerá no card do treinamento.</p>
                                        </div>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ou link da internet</label>
                                    <div className="relative">
                                        <Input
                                            value={course.thumbnailUrl || ""}
                                            onChange={e => setCourse({ ...course, thumbnailUrl: e.target.value })}
                                            className="h-12 pl-10 rounded-2xl border-2 text-xs font-medium"
                                            placeholder="https://images.unsplash.com/..."
                                        />
                                        <ExternalLink className="w-4 h-4 text-slate-400 absolute left-4 top-4" />
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Ações e Status */}
                        <section className="bg-white rounded-[40px] border p-8 shadow-sm">
                            <h3 className="text-lg font-black text-slate-800 mb-6">Ações e Status</h3>

                            <div className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Estado Atual</label>
                                    <div className="flex p-1 bg-slate-100 rounded-2xl">
                                        {["RASCUNHO", "PUBLICADO"].map(st => (
                                            <button
                                                key={st}
                                                onClick={() => setCourse({ ...course, status: st === "PUBLICADO" ? "PUBLISHED" : "DRAFT" })}
                                                className={cn(
                                                    "flex-1 py-3 rounded-xl text-[10px] font-black uppercase transition-all",
                                                    (course.status === "PUBLISHED" && st === "PUBLICADO") || (course.status !== "PUBLISHED" && st === "RASCUNHO")
                                                        ? "bg-white text-slate-900 shadow-sm border"
                                                        : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                {st}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <Button
                                    className="w-full h-14 rounded-2xl font-black bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-200 gap-2"
                                    onClick={handleSaveCourse}
                                >
                                    <Save className="w-5 h-5" />
                                    Salvar Alterações
                                </Button>

                                <button
                                    onClick={() => router.back()}
                                    className="w-full text-center text-slate-400 hover:text-slate-600 text-sm font-bold flex items-center justify-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Voltar para Lista
                                </button>
                            </div>
                        </section>

                        {/* Zona Crítica */}
                        <section className="bg-red-50/50 rounded-[40px] border border-red-100 p-8">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
                                    <Trash2 className="w-4 h-4" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-black text-red-600 uppercase tracking-widest">Zona Crítica</h3>
                                    <p className="text-[10px] text-red-400 font-bold">Ações irreversíveis</p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full h-14 rounded-2xl font-black border-red-200 text-red-500 hover:bg-red-500 hover:text-white transition-all shadow-sm"
                                onClick={() => {
                                    if (confirm("DELETAR ESTE CURSO? Não há volta.")) {
                                        apiFetch(`/admin/courses/${courseId}`, { method: "DELETE" }).then(() => router.push('/admin/cursos'));
                                    }
                                }}
                            >
                                Excluir este Treinamento
                            </Button>
                            <p className="text-[10px] text-red-400 text-center mt-4 font-medium px-4 leading-relaxed">
                                Ao confirmar, todos os dados relacionados a este curso serão removidos permanentemente.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            {/* Modals */}
            <AnimatePresence>
                {/* Module Modal */}
                {isModuleModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                            onClick={() => setIsModuleModalOpen(false)}
                        />
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[48px] p-12 shadow-2xl relative z-10"
                        >
                            <button onClick={() => setIsModuleModalOpen(false)} className="absolute top-8 right-8 p-2 hover:bg-slate-100 rounded-full transition-all">
                                <X className="w-6 h-6 text-slate-400" />
                            </button>

                            <h2 className="text-3xl font-[900] text-slate-800 mb-2">{editingModule ? 'Editar Módulo' : 'Novo Módulo'}</h2>
                            <p className="text-slate-400 font-medium mb-10 text-lg">Defina como este módulo será exibido na jornada.</p>

                            <form onSubmit={handleSaveModule} className="space-y-10">
                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Título do Módulo</label>
                                    <Input
                                        autoFocus
                                        required
                                        value={moduleForm.title}
                                        onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                                        className="h-16 rounded-[24px] text-xl font-bold border-2 focus:ring-blue-500 bg-slate-50/50"
                                        placeholder="Ex: Introdução ao CRM"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Objetivos do Módulo (um por linha)</label>
                                    <textarea
                                        value={moduleForm.objectives}
                                        onChange={e => setModuleForm({ ...moduleForm, objectives: e.target.value })}
                                        className="w-full min-h-[120px] p-5 rounded-[24px] border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm font-medium resize-none bg-slate-50/50"
                                        placeholder="Ex: Dominar os conceitos de CRM&#10;Praticar abordagens de vendas"
                                    />
                                </div>

                                <div className="space-y-4">
                                    <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Ordem de Exibição</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        required
                                        value={moduleForm.orderIndex}
                                        onChange={e => setModuleForm({
                                            ...moduleForm,
                                            orderIndex: Math.max(1, Number(e.target.value) || 1)
                                        })}
                                        className="h-16 rounded-[24px] text-xl font-bold border-2 focus:ring-blue-500 bg-slate-50/50 w-32"
                                    />
                                </div>

                                <div className="flex gap-4 pt-6">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="flex-1 h-16 rounded-[24px] font-black text-slate-400 hover:text-slate-600 hover:bg-slate-100 text-lg"
                                        onClick={() => setIsModuleModalOpen(false)}
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="flex-1 h-16 rounded-[24px] font-black bg-slate-900 hover:bg-black text-white text-lg shadow-xl shadow-slate-200"
                                    >
                                        {editingModule ? 'Salvar Módulo' : 'Salvar Módulo'}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                {/* Content Studio Modal */}
                {isStudioOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl"
                        />
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            className="bg-white w-full max-w-6xl h-[85vh] rounded-[48px] overflow-hidden shadow-2xl relative z-10 flex flex-col"
                        >
                            {/* Studio Header */}
                            <div className="bg-slate-900 text-white px-12 py-8 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-3xl bg-blue-600 flex items-center justify-center shadow-lg">
                                        <Video className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-[900]">Studio de Conteúdo</h2>
                                        <p className="text-blue-200 text-sm font-black uppercase tracking-widest mt-0.5">Montando material para: {course.modules.find(m => m.id === activeModuleId)?.title}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex p-1 bg-white/10 rounded-2xl border border-white/10">
                                        <button
                                            onClick={() => setStudioTab("editor")}
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                                                studioTab === "editor" ? "bg-white text-slate-900 shadow-lg" : "text-white/60 hover:text-white"
                                            )}
                                        >
                                            <Pencil className="w-3.5 h-3.5" />
                                            Editor
                                        </button>
                                        <button
                                            onClick={() => setStudioTab("preview")}
                                            className={cn(
                                                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all gap-2 flex items-center",
                                                studioTab === "preview" ? "bg-white text-slate-900 shadow-lg" : "text-white/60 hover:text-white"
                                            )}
                                        >
                                            <Eye className="w-3.5 h-3.5" />
                                            Preview
                                        </button>
                                    </div>
                                    <button onClick={() => setIsStudioOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-all">
                                        <X className="w-8 h-8 text-white/40" />
                                    </button>
                                </div>
                            </div>

                            {/* Studio Body */}
                            <div className="flex-1 flex overflow-hidden">
                                {studioTab === "editor" ? (
                                    <>
                                        {/* Editor Sidebar */}
                                        <div className="w-96 border-r bg-slate-50/50 p-10 overflow-y-auto space-y-10">
                                            <div>
                                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500 mb-6">Configurações Gerais</h4>
                                                <div className="space-y-8">
                                                    <div className="space-y-3">
                                                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Título da Aula</label>
                                                        <Input
                                                            value={materialForm.title}
                                                            onChange={e => setMaterialForm({ ...materialForm, title: e.target.value })}
                                                            className="h-14 rounded-2xl border-2 font-bold focus:ring-blue-500"
                                                            placeholder="Ex: Introducao ao Tema"
                                                        />
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Tipo de Conteúdo</label>
                                                        <select
                                                            value={materialForm.fileType}
                                                            onChange={e => setMaterialForm({ ...materialForm, fileType: e.target.value })}
                                                            className="w-full h-14 px-4 rounded-2xl border-2 bg-white text-sm font-bold focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                                                        >
                                                            <option value="VIDEO">Vídeo (YouTube/Vimeo)</option>
                                                            <option value="ARTICLE">Artigo / Texto</option>
                                                            <option value="PDF">Documento (PDF/Google Drive)</option>
                                                            <option value="QUIZ">Quiz / Desafio</option>
                                                        </select>
                                                    </div>
                                                    <div className="space-y-3">
                                                        <label className="text-[11px] font-black text-slate-400 ml-1 uppercase">Duração (Minutos)</label>
                                                        <Input
                                                            type="number"
                                                            min={1}
                                                            value={materialForm.durationMinutes}
                                                            onChange={e => setMaterialForm({ ...materialForm, durationMinutes: Number(e.target.value) })}
                                                            className="h-14 rounded-2xl border-2 font-bold focus:ring-blue-500"
                                                        />
                                                    </div>
                                                    <div className="pt-4 flex items-center justify-between p-6 bg-white rounded-3xl border-2 shadow-sm">
                                                        <div className="flex items-center gap-3">
                                                            <HelpCircle className="w-5 h-5 text-blue-500" />
                                                            <span className="font-black text-slate-700 text-sm">Aula Gratuita?</span>
                                                        </div>
                                                        <button
                                                            onClick={() => setMaterialForm({ ...materialForm, isFree: !materialForm.isFree })}
                                                            className={cn(
                                                                "w-12 h-6 rounded-full transition-all relative",
                                                                materialForm.isFree ? "bg-green-500" : "bg-slate-300"
                                                            )}
                                                        >
                                                            <div className={cn(
                                                                "w-4 h-4 bg-white rounded-full absolute top-1 transition-all",
                                                                materialForm.isFree ? "left-7" : "left-1"
                                                            )} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Editor Content Area */}
                                        <div className="flex-1 p-16 bg-white overflow-y-auto">
                                            {materialForm.fileType === "ARTICLE" ? (
                                                <div className="max-w-3xl mx-auto space-y-8">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center">
                                                            <BookOpen className="w-6 h-6" />
                                                        </div>
                                                        <div>
                                                            <h3 className="text-2xl font-[900] text-slate-800">Redigir Artigo</h3>
                                                            <p className="text-slate-400 font-medium">Use Markdown ou HTML para formatar o texto.</p>
                                                        </div>
                                                    </div>
                                                    <textarea
                                                        value={materialForm.content}
                                                        onChange={e => setMaterialForm({ ...materialForm, content: e.target.value })}
                                                        className="w-full min-h-[500px] bg-slate-50 border-2 border-transparent p-10 rounded-[40px] focus:outline-none focus:bg-white focus:border-blue-100 transition-all text-lg font-medium leading-relaxed"
                                                        placeholder="Comece a escrever seu conteúdo aqui..."
                                                    />
                                                </div>
                                            ) : (
                                                <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center">
                                                    <div className="w-24 h-24 rounded-[32px] bg-blue-50 text-blue-600 flex items-center justify-center mb-8 shadow-inner ring-8 ring-blue-50/50">
                                                        {materialForm.fileType === "VIDEO" ? <Video className="w-10 h-10" /> : <Upload className="w-10 h-10" />}
                                                    </div>
                                                    <h3 className="text-3xl font-[900] text-slate-900 mb-4">Link do Conteúdo Externo</h3>
                                                    <p className="text-slate-400 font-bold mb-10 leading-relaxed px-8">Insira a URL do vídeo (YouTube/Vimeo) ou do documento (PDF/Drive).</p>

                                                    <div className="w-full relative space-y-4">
                                                        <Input
                                                            value={materialForm.fileUrl}
                                                            onChange={e => setMaterialForm({ ...materialForm, fileUrl: e.target.value })}
                                                            className="h-20 rounded-[32px] border-4 border-slate-50 bg-slate-50 px-10 text-xl font-bold focus:border-blue-100 focus:bg-white text-center shadow-inner"
                                                            placeholder="https://..."
                                                        />

                                                        <div className="flex items-center gap-4 justify-center">
                                                            <div className="h-px bg-slate-100 flex-1" />
                                                            <span className="text-[10px] font-black text-slate-300 uppercase">OU</span>
                                                            <div className="h-px bg-slate-100 flex-1" />
                                                        </div>

                                                        <div className="relative">
                                                            <input
                                                                type="file"
                                                                id="file-upload"
                                                                className="hidden"
                                                                onChange={handleFileUpload}
                                                                disabled={isUploading}
                                                            />
                                                            <label
                                                                htmlFor="file-upload"
                                                                className={cn(
                                                                    "w-full h-20 rounded-[32px] border-2 border-dashed border-slate-200 flex items-center justify-center gap-4 cursor-pointer hover:bg-slate-50 hover:border-blue-200 transition-all",
                                                                    isUploading && "opacity-50 cursor-not-allowed animate-pulse"
                                                                )}
                                                            >
                                                                <Upload className="w-6 h-6 text-slate-400" />
                                                                <span className="font-black text-slate-500">
                                                                    {isUploading ? "Enviando arquivo..." : "Upload de arquivo local"}
                                                                </span>
                                                            </label>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    /* Preview Area */
                                    <div className="flex-1 bg-slate-100 overflow-y-auto p-12">
                                        <div className="max-w-4xl mx-auto bg-white rounded-[48px] shadow-2xl overflow-hidden min-h-full border border-white">
                                            {materialForm.fileType === "ARTICLE" ? (
                                                <div className="p-20 text-center">
                                                    <span className="bg-blue-600/10 text-blue-600 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">Artigo</span>
                                                    <h1 className="text-4xl font-[900] text-slate-900 mb-10 tracking-tight leading-tight">{materialForm.title || "Sem Título"}</h1>
                                                    <div className="prose prose-xl max-w-none text-left font-medium text-slate-600 leading-[1.8] min-h-[400px]">
                                                        {materialForm.content ? (
                                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                                {materialForm.content}
                                                            </ReactMarkdown>
                                                        ) : (
                                                            "Sem conteúdo para pré-visualizar."
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="p-20 min-h-[600px] flex flex-col items-center justify-center text-center">
                                                    <div className="w-24 h-24 rounded-[32px] bg-blue-50 text-blue-600 flex items-center justify-center mb-8 shadow-inner ring-8 ring-blue-50/50">
                                                        {materialForm.fileType === "VIDEO" ? <Video className="w-10 h-10" /> : <FileText className="w-10 h-10" />}
                                                    </div>
                                                    <span className="bg-slate-900/5 text-slate-500 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-8 inline-block">
                                                        {materialForm.fileType === "VIDEO" ? "Vídeo" : "Documento"}
                                                    </span>
                                                    <h1 className="text-5xl font-[900] text-slate-900 mb-8 tracking-tight leading-tight">{materialForm.title || "Sem Título"}</h1>
                                                    <p className="text-slate-500 font-medium text-lg max-w-2xl leading-relaxed mb-8">
                                                        {materialForm.fileType === "VIDEO"
                                                            ? "Pré-visualização de vídeo disponível no player do aluno."
                                                            : "Pré-visualização de documento disponível no player do aluno quando o link for PDF compatível."}
                                                    </p>
                                                    <div className="w-full max-w-2xl bg-slate-50 border-2 border-slate-100 rounded-[28px] px-8 py-6 text-left">
                                                        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 mb-3">URL do conteúdo</p>
                                                        <p className="font-bold text-slate-700 break-all">{materialForm.fileUrl || "Sem URL informada."}</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Studio Footer */}
                            <div className="px-12 py-8 bg-slate-50 border-t flex items-center justify-between">
                                <button
                                    onClick={() => setIsStudioOpen(false)}
                                    className="text-slate-400 hover:text-slate-800 font-black text-sm uppercase tracking-widest"
                                >
                                    Fechar sem salvar
                                </button>
                                <div className="flex items-center gap-4">
                                    <span className="text-slate-400 text-xs font-bold mr-4 italic">Salvo automaticamente há 2 minutos</span>
                                    <Button
                                        className="h-14 px-12 rounded-[24px] font-[900] bg-blue-600 hover:bg-black text-white text-lg shadow-2xl shadow-blue-200 transition-all hover:scale-105 active:scale-95 flex items-center gap-3"
                                        onClick={handleSaveMaterial}
                                    >
                                        <Save className="w-6 h-6" />
                                        Salvar e Publicar Aula
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
