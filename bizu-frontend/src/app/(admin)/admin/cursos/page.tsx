"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    BookOpen,
    Plus,
    Settings,
    Trash2,
    Layout,
    Palette,
    Eye,
    ChevronRight,
    Pencil
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "../../../../components/ui/input";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

export default function AdminCursosPage() {
    const router = useRouter();
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editingCourse, setEditingCourse] = useState<any>(null);

    const [formCourse, setFormCourse] = useState({
        title: "",
        description: "",
        themeColor: "#8b5cf6",
        textColor: "#ffffff",
        status: "PUBLISHED",
        category: "",
        hasEssay: false
    });

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

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
        <div className="w-full px-8 py-12 text-slate-100">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
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

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border rounded-2xl overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Curso</th>
                                    <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Identidade</th>
                                    <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-6 text-center text-muted-foreground">
                                            Carregando cursos...
                                        </td>
                                    </tr>
                                ) : courses.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-6 text-center text-muted-foreground">
                                            Nenhum curso cadastrado.
                                        </td>
                                    </tr>
                                ) : courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                                    style={{ backgroundColor: course.themeColor || course.color, color: course.textColor || "#ffffff" }}
                                                >
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg">{course.title}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">{course.modules?.length || 0} módulos • {course.status}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={course.themeColor || course.color || "#000000"}
                                                        onChange={(e) => updateCourseColor(course.id, e.target.value, 'themeColor')}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none p-0"
                                                        title="Cor do Fundo"
                                                    />
                                                    <span className="font-mono text-xs font-bold text-muted-foreground w-16">{(course.themeColor || course.color || "#000000").toUpperCase()}</span>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={course.textColor || "#ffffff"}
                                                        onChange={(e) => updateCourseColor(course.id, e.target.value, 'textColor')}
                                                        className="w-8 h-8 rounded-lg cursor-pointer border-none p-0"
                                                        title="Cor do Texto"
                                                    />
                                                    <span className="font-mono text-xs font-bold text-muted-foreground w-16">{(course.textColor || "#ffffff").toUpperCase()}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl hover:bg-muted"
                                                    onClick={() => handleEditClick(course)}
                                                    title="Editar informações"
                                                >
                                                    <Pencil className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="rounded-xl hover:bg-primary/10 text-primary"
                                                    onClick={() => router.push(`/admin/cursos/${course.id}`)}
                                                    title="Gerenciar módulos e aulas"
                                                >
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteCourse(course.id)}
                                                    className="rounded-xl text-destructive hover:bg-destructive/10"
                                                    title="Excluir curso"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="p-8 rounded-2xl bg-card border space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Eye className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Preview do Tema</h4>
                        </div>

                        <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                            Ao definir uma cor para o curso, toda a interface do aluno (botões, ícones, menus) adotará essa tonalidade quando ele estiver estudando este conteúdo.
                        </p>

                        <div className="space-y-4">
                            {courses.length > 0 ? (
                                <div className="p-6 rounded-xl bg-muted/30 border border-dashed">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-lg bg-primary" style={{ backgroundColor: courses[0]?.themeColor || courses[0]?.color }} />
                                        <div className="text-sm font-bold">{courses[0]?.title}</div>
                                    </div>
                                    <Button className="w-full h-10 rounded-xl text-xs font-black uppercase" style={{ backgroundColor: courses[0]?.themeColor || courses[0]?.color, color: courses[0]?.textColor || "#ffffff" }}>
                                        Continuar Estudando
                                        <ChevronRight className="w-3 h-3 ml-2" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="p-6 rounded-xl bg-muted/30 border border-dashed text-center text-muted-foreground text-sm font-medium">
                                    Crie um curso para visualizar o preview.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {(isCreating || isEditing) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-md rounded-2xl p-8 shadow-2xl border">
                        <h2 className="text-2xl font-black mb-6">{isEditing ? 'Editar Curso' : 'Novo Curso'}</h2>
                        <form onSubmit={handleSubmitCourse} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Título do Curso</label>
                                <Input
                                    autoFocus
                                    required
                                    placeholder="Ex: Direito Administrativo"
                                    value={formCourse.title}
                                    onChange={e => setFormCourse({ ...formCourse, title: e.target.value })}
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Descrição</label>
                                <textarea
                                    placeholder="Breve descrição do curso"
                                    value={formCourse.description}
                                    onChange={e => setFormCourse({ ...formCourse, description: e.target.value })}
                                    className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[100px] resize-none"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Categoria</label>
                                <select
                                    value={formCourse.category}
                                    onChange={e => setFormCourse({ ...formCourse, category: e.target.value })}
                                    className="w-full h-12 px-4 rounded-xl border border-input bg-background text-sm font-medium focus:outline-none focus:ring-1 focus:ring-ring"
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

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Cor de Identidade</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={formCourse.themeColor}
                                            onChange={e => setFormCourse({ ...formCourse, themeColor: e.target.value })}
                                            className="w-12 h-12 rounded-xl cursor-pointer border-none p-0"
                                        />
                                        <span className="font-mono font-bold text-lg">{formCourse.themeColor.toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-muted-foreground">Cor do Texto</label>
                                    <div className="flex items-center gap-4">
                                        <input
                                            type="color"
                                            value={formCourse.textColor}
                                            onChange={e => setFormCourse({ ...formCourse, textColor: e.target.value })}
                                            className="w-12 h-12 rounded-xl cursor-pointer border-none p-0"
                                        />
                                        <span className="font-mono font-bold text-lg">{formCourse.textColor.toUpperCase()}</span>
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

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl font-bold"
                                    onClick={() => {
                                        setIsCreating(false);
                                        setIsEditing(false);
                                        setEditingCourse(null);
                                    }}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 h-12 rounded-xl font-bold">
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
