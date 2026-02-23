import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Plus, Edit2, Trash2, Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function AdminCoursesPage() {
    const courses = [
        { id: "1", title: "Magistratura Federal", status: "PUBLICADO", students: 1250, price: "R$ 49.90/mês" },
        { id: "2", title: "Delegado de Polícia Civil", status: "PUBLICADO", students: 840, price: "R$ 39.90/mês" },
        { id: "3", title: "Analista Judiciário", status: "RASCUNHO", students: 0, price: "R$ 29.90/mês" },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                <PageHeader
                    title="Gestão de Cursos"
                    description="Crie, edite e gerencie os conteúdos oferecidos na plataforma."
                    badge="CONTEÚDO"
                />
                <Button className="rounded-2xl h-14 px-8 font-black gap-2 shadow-lg shadow-primary/20">
                    <Plus className="w-5 h-5" />
                    Novo Curso
                </Button>
            </div>

            <div className="bg-card border rounded-[40px] overflow-hidden">
                <div className="p-8 border-b flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input placeholder="Filtrar cursos..." className="pl-10 h-12 rounded-2xl bg-muted/30 border-none" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="rounded-xl h-12 font-bold">Todos os Status</Button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-muted/30">
                            <tr>
                                <th className="text-left px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Curso</th>
                                <th className="text-left px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Status</th>
                                <th className="text-left px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Alunos</th>
                                <th className="text-left px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Preço</th>
                                <th className="text-right px-8 py-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {courses.map((course) => (
                                <tr key={course.id} className="hover:bg-muted/10 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-lg">{course.title}</div>
                                        <div className="text-xs text-muted-foreground">ID: {course.id}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest ${course.status === "PUBLICADO" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"
                                            }`}>
                                            {course.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 font-medium">{course.students.toLocaleString()}</td>
                                    <td className="px-8 py-6 font-medium">{course.price}</td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button variant="ghost" size="icon" className="rounded-xl"><Edit2 className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl text-danger"><Trash2 className="w-4 h-4" /></Button>
                                            <Button variant="ghost" size="icon" className="rounded-xl"><MoreVertical className="w-4 h-4" /></Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-8 bg-muted/10 text-center border-t">
                    <p className="text-xs text-muted-foreground font-medium">Exibindo {courses.length} de {courses.length} cursos cadastrados.</p>
                </div>
            </div>
        </div>
    );
}
