"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import {
    BookOpen,
    ChevronLeft,
    Plus,
    Pencil,
    Trash2,
    GripVertical,
    FileText,
    Video,
    Music,
    MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiFetch } from "@/lib/api";

interface Material {
    id: string;
    title: string;
    description: string;
    fileUrl: string;
    fileType: string;
    isFree: boolean;
}

interface Module {
    id: string;
    title: string;
    description: string;
    orderIndex: number;
    materials: Material[];
}

interface Course {
    id: string;
    title: string;
    description: string;
    themeColor: string;
    modules: Module[];
}

export default function CourseManagementPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.id as string;

    const [course, setCourse] = useState<Course | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isModuleModalOpen, setIsModuleModalOpen] = useState(false);
    const [editingModule, setEditingModule] = useState<Module | null>(null);
    const [moduleForm, setModuleForm] = useState({ title: "", description: "" });

    const fetchCourse = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/admin/courses/${courseId}`);
            if (res.ok) {
                const data = await res.json();
                setCourse(data);
            }
        } catch (error) {
            console.error("Failed to fetch course", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (courseId) fetchCourse();
    }, [courseId]);

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
                    orderIndex: editingModule?.orderIndex || (course?.modules.length || 0)
                })
            });

            if (res.ok) {
                await fetchCourse();
                setIsModuleModalOpen(false);
                setEditingModule(null);
                setModuleForm({ title: "", description: "" });
            }
        } catch (error) {
            console.error("Failed to save module", error);
        }
    };

    const handleDeleteModule = async (moduleId: string) => {
        if (!confirm("Remover este módulo e todos os seus materiais?")) return;
        try {
            const res = await apiFetch(`/admin/modules/${moduleId}`, { method: "DELETE" });
            if (res.ok) fetchCourse();
        } catch (error) {
            console.error("Failed to delete module", error);
        }
    };

    if (isLoading) return <div className="p-12 text-center font-bold">Carregando gerenciador...</div>;
    if (!course) return <div className="p-12 text-center font-bold text-destructive">Curso não encontrado.</div>;

    return (
        <div className="container mx-auto px-4 py-12 max-w-5xl">
            <Button
                variant="ghost"
                className="mb-8 gap-2 rounded-xl text-muted-foreground hover:text-foreground"
                onClick={() => router.back()}
            >
                <ChevronLeft className="w-4 h-4" />
                Voltar aos Cursos
            </Button>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title={`Gerenciar: ${course.title}`}
                    description="Organize o conteúdo do curso em módulos e materiais didáticos."
                    badge="CONTEÚDO"
                />
                <Button
                    className="h-12 rounded-2xl font-black px-6 gap-2 shadow-lg"
                    style={{ backgroundColor: course.themeColor || "#8b5cf6" }}
                    onClick={() => {
                        setEditingModule(null);
                        setModuleForm({ title: "", description: "" });
                        setIsModuleModalOpen(true);
                    }}
                >
                    <Plus className="w-5 h-5" />
                    Novo Módulo
                </Button>
            </div>

            <div className="space-y-8">
                {course.modules?.length === 0 ? (
                    <div className="bg-card border-2 border-dashed rounded-[48px] p-20 text-center space-y-4">
                        <div
                            className="w-20 h-20 rounded-[32px] mx-auto flex items-center justify-center text-white opacity-20"
                            style={{ backgroundColor: course.themeColor || "#8b5cf6" }}
                        >
                            <BookOpen className="w-10 h-10" />
                        </div>
                        <div className="max-w-xs mx-auto">
                            <h3 className="text-xl font-bold mb-2">Inicie o Conteúdo</h3>
                            <p className="text-sm text-muted-foreground">Comece criando o primeiro módulo para organizar as aulas do seu curso.</p>
                        </div>
                        <Button
                            variant="outline"
                            className="rounded-xl border-2 font-bold px-8 mt-4"
                            onClick={() => setIsModuleModalOpen(true)}
                        >
                            Adicionar Primeiro Módulo
                        </Button>
                    </div>
                ) : (
                    course.modules.sort((a, b) => a.orderIndex - b.orderIndex).map((module, index) => (
                        <div key={module.id} className="bg-card border rounded-[40px] overflow-hidden group shadow-sm hover:shadow-md transition-all">
                            <div className="p-8 flex items-start justify-between gap-6 border-b bg-muted/20">
                                <div className="flex items-start gap-4">
                                    <div className="cursor-grab text-muted-foreground pt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <GripVertical className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="text-[10px] font-black uppercase tracking-tighter px-2 py-0.5 rounded-md bg-foreground/10 text-foreground/70">Módulo {index + 1}</span>
                                            <h3 className="text-xl font-black">{module.title}</h3>
                                        </div>
                                        <p className="text-sm text-muted-foreground font-medium">{module.description || "Sem descrição disponível."}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl"
                                        onClick={() => {
                                            setEditingModule(module);
                                            setModuleForm({ title: module.title, description: module.description || "" });
                                            setIsModuleModalOpen(true);
                                        }}
                                    >
                                        <Pencil className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl text-destructive hover:bg-destructive/10"
                                        onClick={() => handleDeleteModule(module.id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>

                            <div className="p-8 space-y-4">
                                {(module.materials || []).length === 0 ? (
                                    <p className="text-sm text-muted-foreground italic px-2">Nenhum material neste módulo ainda.</p>
                                ) : (
                                    module.materials.map(material => (
                                        <div key={material.id} className="flex items-center justify-between p-4 rounded-2xl bg-muted/30 border border-transparent hover:border-primary/20 hover:bg-muted/50 transition-all group/item">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center text-primary shadow-sm">
                                                    {material.fileType === 'VIDEO' ? <Video className="w-5 h-5" /> : material.fileType === 'AUDIO' ? <Music className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{material.title}</div>
                                                    <div className="text-[10px] font-black text-muted-foreground uppercase">{material.fileType} • {material.isFree ? "Gratuito" : "Premium"}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg"><Pencil className="w-3.5 h-3.5" /></Button>
                                                <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-lg text-destructive hover:bg-destructive/10"><Trash2 className="w-3.5 h-3.5" /></Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start gap-2 h-12 rounded-2xl text-xs font-black uppercase text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all border-2 border-dashed border-transparent hover:border-primary/20"
                                >
                                    <Plus className="w-4 h-4" />
                                    Adicionar Material Didático
                                </Button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {isModuleModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-card w-full max-w-md rounded-[32px] p-8 shadow-2xl border">
                        <h2 className="text-2xl font-black mb-6">{editingModule ? 'Editar Módulo' : 'Novo Módulo'}</h2>
                        <form onSubmit={handleSaveModule} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Nome do Módulo</label>
                                <Input
                                    autoFocus
                                    required
                                    placeholder="Ex: Introdução ao Curso"
                                    value={moduleForm.title}
                                    onChange={e => setModuleForm({ ...moduleForm, title: e.target.value })}
                                    className="h-12 rounded-xl"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Descrição (opcional)</label>
                                <textarea
                                    placeholder="Do que trata este módulo?"
                                    value={moduleForm.description}
                                    onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })}
                                    className="flex w-full rounded-xl border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-12 rounded-xl font-bold"
                                    onClick={() => setIsModuleModalOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button type="submit" className="flex-1 h-12 rounded-xl font-bold">
                                    {editingModule ? 'Salvar Alterações' : 'Adicionar Módulo'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
