"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    BookOpen,
    Plus,
    Settings,
    Trash2,
    Eye,
    ChevronRight,
    Pencil,
    Layers,
    Tag,
    Palette
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../../../components/ui/input";
import { apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminCursosPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);
    const [previewIndex, setPreviewIndex] = useState(0);

    const [formCourse, setFormCourse] = useState({
        title: "",
        description: "",
        themeColor: "#8b5cf6",
        textColor: "#ffffff",
        status: "PUBLISHED",
        category: "",
        hasEssay: false
    });

    const fetchCourses = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch("/admin/courses");
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, []);

    const updateCourseColor = async (id: string, newColor: string, type: 'themeColor' | 'textColor' = 'themeColor') => {
        const course = courses.find(c => c.id === id);
        if (!course) return;

        try {
            const body = { ...course };
            if (type === 'themeColor') body.themeColor = newColor;
            else body.textColor = newColor;

            const res = await apiFetch(`/admin/courses/${id}`, {
                method: "PUT",
                body: JSON.stringify(body)
            });
            if (res.ok) {
                const updated = await res.json();
                setCourses(prev => prev.map(c => c.id === id ? updated : c));
            }
        } catch (error) {
            console.error("Failed to update course color", error);
        }
    };

    const handleSubmitCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const method = isEditing ? "PUT" : "POST";
            const url = isEditing ? `/admin/courses/${editingCourse.id}` : "/admin/courses";

            const res = await apiFetch(url, {
                method,
                body: JSON.stringify({
                    ...formCourse,
                    thumbnailUrl: ""
                })
            });
            if (res.ok) {
                await fetchCourses();
                setIsCreating(false);
                setIsEditing(false);
                setEditingCourse(null);
                setFormCourse({ title: "", description: "", themeColor: "#8b5cf6", textColor: "#ffffff", status: "PUBLISHED", category: "", hasEssay: false });
            }
        } catch (error) {
            console.error(`Failed to ${isEditing ? 'update' : 'create'} course`, error);
        }
    };

    const handleEditClick = (course: any) => {
        setEditingCourse(course);
        setFormCourse({
            title: course.title,
            description: course.description || "",
            themeColor: course.themeColor || course.color || "#8b5cf6",
            textColor: course.textColor || "#ffffff",
            status: course.status || "PUBLISHED",
            category: course.category || "",
            hasEssay: course.hasEssay || false
        });
        setIsEditing(true);
    };

    const handleDeleteCourse = async (id: string) => {
        if (!confirm("Tem certeza que deseja remover este curso?")) return;
        try {
            const res = await apiFetch(`/admin/courses/${id}`, { method: "DELETE" });
            if (res.ok) {
                setCourses(prev => prev.filter(c => c.id !== id));
            }
        } catch (error) {
            console.error("Failed to delete course", error);
        }
    };

    return (
        <div className="w-full px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
                <PageHeader
                    title="Gestão de Cursos"
                    description="Crie e configure seus cursos. Defina cores exclusivas para personalizar a experiência do aluno."
                    badge="CONTEÚDO"
                />
                <Button
                    className="h-14 rounded-xl font-black px-8 gap-2 shadow-xl shadow-primary/20"
                    onClick={() => {
                        setIsEditing(false);
                        setFormCourse({ title: "", description: "", themeColor: "#8b5cf6", textColor: "#ffffff", status: "PUBLISHED", category: "", hasEssay: false });
                        setIsCreating(true);
                    }}
                >
                    <Plus className="w-5 h-5" />
                    Novo Curso
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Course List */}
                <div className="lg:col-span-2 space-y-3">
                    {isLoading ? (
                        <>
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-card border rounded-2xl p-5 animate-pulse flex items-center gap-5">
                                    <div className="w-14 h-14 rounded-2xl bg-muted flex-shrink-0" />
                                    <div className="flex-1 space-y-2.5">
                                        <div className="h-4 bg-muted rounded-lg w-2/5" />
                                        <div className="h-3 bg-muted rounded-lg w-1/3" />
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="w-7 h-7 rounded-lg bg-muted" />
                                        <div className="w-7 h-7 rounded-lg bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : courses.length === 0 ? (
                        <div className="bg-card border rounded-2xl p-16 text-center">
                            <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
                                <BookOpen className="w-10 h-10 text-primary" />
                            </div>
                            <h3 className="text-xl font-black mb-2">Nenhum curso cadastrado</h3>
                            <p className="text-muted-foreground text-sm font-medium mb-8 max-w-xs mx-auto">
                                Crie seu primeiro curso para começar a organizar o conteúdo para os alunos.
                            </p>
                            <Button onClick={() => setIsCreating(true)} className="gap-2 h-12 rounded-xl px-8">
                                <Plus className="w-4 h-4" />
                                Criar Primeiro Curso
                            </Button>
                        </div>
                    ) : (
                        courses.map((course) => (
                            <div
                                key={course.id}
                                className="bg-card border rounded-2xl overflow-hidden hover:shadow-md transition-all group cursor-default"
                                onMouseEnter={() => setPreviewIndex(courses.indexOf(course))}
                            >
                                <div className="flex items-center gap-5 p-5">
                                    {/* Course Icon */}
                                    <div
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-md"
                                        style={{ backgroundColor: course.themeColor || course.color || '#6366f1', color: course.textColor || "#ffffff" }}
                                    >
                                        <BookOpen className="w-7 h-7" />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                                            <span className="font-black text-base leading-tight">{course.title}</span>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider flex-shrink-0",
                                                course.status === "PUBLISHED"
                                                    ? "bg-emerald-100 text-emerald-700"
                                                    : "bg-amber-100 text-amber-700"
                                            )}>
                                                {course.status === "PUBLISHED" ? "Publicado" : "Rascunho"}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 text-xs text-muted-foreground font-medium">
                                            <span className="flex items-center gap-1.5">
                                                <Layers className="w-3.5 h-3.5" />
                                                {course.modules?.length || 0} módulos
                                            </span>
                                            {course.category && (
                                                <>
                                                    <span className="opacity-40">•</span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Tag className="w-3 h-3" />
                                                        {course.category}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Color Swatches */}
                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <div className="flex gap-1.5">
                                            <div className="relative" title="Cor de Identidade — clique para alterar">
                                                <div
                                                    className="w-8 h-8 rounded-xl shadow-sm ring-2 ring-white cursor-pointer hover:scale-110 transition-transform"
                                                    style={{ backgroundColor: course.themeColor || course.color || "#000000" }}
                                                />
                                                <input
                                                    type="color"
                                                    value={course.themeColor || course.color || "#000000"}
                                                    onChange={(e) => updateCourseColor(course.id, e.target.value, 'themeColor')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    title="Cor de Identidade"
                                                />
                                            </div>
                                            <div className="relative" title="Cor do Texto — clique para alterar">
                                                <div
                                                    className="w-8 h-8 rounded-xl shadow-sm ring-2 ring-white cursor-pointer hover:scale-110 transition-transform border border-input"
                                                    style={{ backgroundColor: course.textColor || "#ffffff" }}
                                                />
                                                <input
                                                    type="color"
                                                    value={course.textColor || "#ffffff"}
                                                    onChange={(e) => updateCourseColor(course.id, e.target.value, 'textColor')}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    title="Cor do Texto"
                                                />
                                            </div>
                                        </div>
                                        <span className="font-mono text-[11px] text-muted-foreground font-bold hidden sm:block">
                                            {(course.themeColor || course.color || "#000000").toUpperCase()}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl hover:bg-muted h-9 w-9 p-0"
                                            onClick={() => handleEditClick(course)}
                                            title="Editar informações"
                                        >
                                            <Pencil className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="rounded-xl hover:bg-primary/10 text-primary h-9 w-9 p-0"
                                            onClick={() => router.push(`/admin/cursos/${course.id}`)}
                                            title="Gerenciar módulos e aulas"
                                        >
                                            <Settings className="w-4 h-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDeleteCourse(course.id)}
                                            className="rounded-xl text-destructive hover:bg-destructive/10 h-9 w-9 p-0"
                                            title="Excluir curso"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-4">
                    <div className="p-6 rounded-2xl bg-card border">
                        <div className="flex items-center gap-2.5 text-primary mb-3">
                            <Eye className="w-4 h-4" />
                            <h4 className="font-black text-xs uppercase tracking-widest">Preview do Tema</h4>
                        </div>

                        <p className="text-xs text-muted-foreground font-medium leading-relaxed mb-5">
                            Ao definir uma cor para o curso, toda a interface do aluno (botões, ícones, menus) adotará essa tonalidade quando ele estiver estudando este conteúdo.
                        </p>

                        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                            {courses.length > 0 ? courses.map((c, idx) => (
                                <div
                                    key={c.id}
                                    className={cn(
                                        "p-4 rounded-xl border-2 transition-all cursor-pointer",
                                        previewIndex === idx
                                            ? "border-primary/30 bg-primary/5 shadow-sm"
                                            : "border-dashed border-muted-foreground/20 hover:border-muted-foreground/40"
                                    )}
                                    onClick={() => setPreviewIndex(idx)}
                                >
                                    <div className="flex items-center gap-2.5 mb-3">
                                        <div
                                            className="w-6 h-6 rounded-lg shadow-sm flex-shrink-0"
                                            style={{ backgroundColor: c.themeColor || c.color }}
                                        />
                                        <span className="text-xs font-bold truncate">{c.title}</span>
                                    </div>
                                    <div
                                        className="w-full py-2 rounded-lg text-center text-[11px] font-black uppercase tracking-wide flex items-center justify-center gap-1"
                                        style={{ backgroundColor: c.themeColor || c.color, color: c.textColor || "#ffffff" }}
                                    >
                                        Continuar Estudando
                                        <ChevronRight className="w-3 h-3" />
                                    </div>
                                </div>
                            )) : (
                                <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center text-muted-foreground text-sm font-medium">
                                    Crie um curso para visualizar o preview.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Create / Edit Modal */}
            {(isCreating || isEditing) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-lg rounded-2xl shadow-2xl border overflow-hidden">
                        {/* Live Preview Header */}
                        <div
                            className="px-8 py-7 transition-colors duration-300 relative overflow-hidden"
                            style={{ backgroundColor: formCourse.themeColor }}
                        >
                            <div
                                className="absolute inset-0 opacity-10"
                                style={{
                                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 8px, rgba(255,255,255,0.15) 8px, rgba(255,255,255,0.15) 9px)`
                                }}
                            />
                            <div className="relative flex items-center gap-4">
                                <div
                                    className="w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-sm flex-shrink-0"
                                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: formCourse.textColor }}
                                >
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <div style={{ color: formCourse.textColor }}>
                                    <h2 className="text-xl font-black leading-tight">
                                        {formCourse.title || (isEditing ? 'Editar Curso' : 'Novo Curso')}
                                    </h2>
                                    <p className="text-xs font-bold opacity-70 mt-0.5">
                                        {isEditing ? 'Editando identidade visual' : 'Pré-visualização da identidade'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSubmitCourse} className="p-6 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Título do Curso</label>
                                <Input
                                    autoFocus
                                    required
                                    placeholder="Ex: Direito Administrativo"
                                    value={formCourse.title}
                                    onChange={e => setFormCourse({ ...formCourse, title: e.target.value })}
                                    className="h-11 rounded-xl"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Descrição</label>
                                <textarea
                                    placeholder="Breve descrição do curso"
                                    value={formCourse.description}
                                    onChange={e => setFormCourse({ ...formCourse, description: e.target.value })}
                                    className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring min-h-[70px] resize-none"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Categoria</label>
                                <select
                                    value={formCourse.category}
                                    onChange={e => setFormCourse({ ...formCourse, category: e.target.value })}
                                    className="w-full h-11 px-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
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

                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Cor de Identidade</label>
                                    <div className="relative h-11 rounded-xl overflow-hidden cursor-pointer border border-input">
                                        <div className="absolute inset-0" style={{ backgroundColor: formCourse.themeColor }} />
                                        <div className="absolute inset-0 flex items-center px-3 gap-2">
                                            <Palette className="w-3.5 h-3.5 opacity-70" style={{ color: formCourse.textColor }} />
                                            <span
                                                className="font-mono text-[11px] font-black"
                                                style={{ color: formCourse.textColor, textShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                                            >
                                                {formCourse.themeColor.toUpperCase()}
                                            </span>
                                        </div>
                                        <input
                                            type="color"
                                            value={formCourse.themeColor}
                                            onChange={e => setFormCourse({ ...formCourse, themeColor: e.target.value })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-black text-muted-foreground uppercase tracking-wider">Cor do Texto</label>
                                    <div className="relative h-11 rounded-xl overflow-hidden cursor-pointer border border-input">
                                        <div className="absolute inset-0" style={{ backgroundColor: formCourse.textColor }} />
                                        <div className="absolute inset-0 flex items-center px-3 gap-2">
                                            <Palette className="w-3.5 h-3.5 text-muted-foreground" />
                                            <span className="font-mono text-[11px] font-black text-muted-foreground">
                                                {formCourse.textColor.toUpperCase()}
                                            </span>
                                        </div>
                                        <input
                                            type="color"
                                            value={formCourse.textColor}
                                            onChange={e => setFormCourse({ ...formCourse, textColor: e.target.value })}
                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100">
                                <input
                                    type="checkbox"
                                    id="hasEssay"
                                    checked={formCourse.hasEssay}
                                    onChange={e => setFormCourse({ ...formCourse, hasEssay: e.target.checked })}
                                    className="w-5 h-5 rounded border-indigo-300 text-indigo-600 focus:ring-indigo-500"
                                />
                                <label htmlFor="hasEssay" className="text-sm font-bold text-indigo-900 cursor-pointer">
                                    Habilitar Seção de Redação com IA
                                </label>
                            </div>

                            <div className="flex gap-3 pt-1">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-11 rounded-xl font-bold"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setIsEditing(false);
                                        setEditingCourse(null);
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 h-11 rounded-xl font-bold">
                                    {isEditing ? 'Salvar Alterações' : 'Criar Curso'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
