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
    ChevronRight
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState } from "react";

export default function AdminCursosPage() {
    const [courses, setCourses] = useState([
        { id: "1", title: "Direito Administrativo", color: "#8b5cf6", modules: 12, status: "PUBLISHED" },
        { id: "2", title: "Direito Constitucional", color: "#10b981", modules: 15, status: "PUBLISHED" },
        { id: "3", title: "Raciocínio Lógico", color: "#f59e0b", modules: 8, status: "DRAFT" },
    ]);

    const updateCourseColor = (id: string, newColor: string) => {
        setCourses(prev => prev.map(c => c.id === id ? { ...c, color: newColor } : c));
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-7xl">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Gestão de Cursos"
                    description="Crie e configure seus cursos. Defina cores exclusivas para personalizar a experiência do aluno."
                    badge="CONTEÚDO"
                />
                <Button className="h-14 rounded-2xl font-black px-8 gap-2 shadow-xl shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    Novo Curso
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-card border rounded-[48px] overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-muted/50 border-b">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Curso</th>
                                    <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest">Identidade</th>
                                    <th className="px-8 py-5 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div
                                                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white"
                                                    style={{ backgroundColor: course.color }}
                                                >
                                                    <BookOpen className="w-6 h-6" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg">{course.title}</div>
                                                    <div className="text-xs text-muted-foreground font-medium">{course.modules} módulos • {course.status}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="color"
                                                    value={course.color}
                                                    onChange={(e) => updateCourseColor(course.id, e.target.value)}
                                                    className="w-10 h-10 rounded-xl cursor-pointer border-none p-0"
                                                />
                                                <span className="font-mono text-xs font-bold text-muted-foreground">{course.color.toUpperCase()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="ghost" size="sm" className="rounded-xl hover:bg-muted">
                                                    <Settings className="w-4 h-4" />
                                                </Button>
                                                <Button variant="ghost" size="sm" className="rounded-xl text-destructive hover:bg-destructive/10">
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
                    <div className="p-8 rounded-[48px] bg-card border space-y-6">
                        <div className="flex items-center gap-3 text-primary">
                            <Eye className="w-5 h-5" />
                            <h4 className="font-black text-sm uppercase tracking-widest">Preview do Tema</h4>
                        </div>

                        <p className="text-xs text-muted-foreground font-medium leading-relaxed italic">
                            Ao definir uma cor para o curso, toda a interface do aluno (botões, ícones, menus) adotará essa tonalidade quando ele estiver estudando este conteúdo.
                        </p>

                        <div className="space-y-4">
                            <div className="p-6 rounded-3xl bg-muted/30 border border-dashed">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-primary" style={{ backgroundColor: courses[0].color }} />
                                    <div className="text-sm font-bold">{courses[0].title}</div>
                                </div>
                                <Button className="w-full h-10 rounded-xl text-xs font-black uppercase" style={{ backgroundColor: courses[0].color }}>
                                    Continuar Estudando
                                    <ChevronRight className="w-3 h-3 ml-2" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
