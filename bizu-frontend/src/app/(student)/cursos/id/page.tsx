"use client";

import { useState } from "react";
import PageHeader from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import {
    Play,
    BookOpen,
    FileText,
    CheckCircle2,
    Clock,
    ChevronRight,
    Lock,
    Star,
    Download
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function CourseDetailsPage() {
    const [activeModule, setActiveModule] = useState(0);

    const course = {
        title: "Magistratura Federal - Completo",
        progress: 35,
        modules: [
            {
                id: "1",
                title: "Poderes da Administração",
                description: "Hierárquico, Disciplinar, Regulamentar e de Polícia.",
                status: "CONCLUÍDO",
                topics: ["Poder de Polícia", "Abuso de Poder", "Hierarquia"],
                materials: [
                    { name: "Apostila PDF - Poderes", type: "pdf", id: "m1" },
                    { name: "Mapa Mental - Resumo", type: "img", id: "m2" }
                ],
                questionsCount: 45
            },
            {
                id: "2",
                title: "Atos Administrativos",
                description: "Requisitos, Atributos, Classificação e Extinção.",
                status: "EM_ANDAMENTO",
                topics: ["Elementos do Ato", "Anulação e Revogação", "Discricionariedade"],
                materials: [
                    { name: "Apostila PDF - Atos", type: "pdf", id: "m3" }
                ],
                questionsCount: 60
            },
            {
                id: "3",
                title: "Contratos e Licitações",
                description: "Nova Lei de Licitações (14.133/21).",
                status: "BLOQUEADO",
                topics: ["Modalidades", "Dispensa", "Contratos"],
                materials: [],
                questionsCount: 80
            }
        ]
    };

    return (
        <div className="container mx-auto px-4 py-8 lg:py-12 max-w-7xl">
            <div className="flex flex-col lg:flex-row gap-8 mb-12">
                <div className="flex-1">
                    <PageHeader
                        title={course.title}
                        description="Domine todos os pontos do edital com nossa metodologia de elite."
                        badge="CURSO ATIVO"
                    />
                </div>

                <div className="lg:w-80 flex flex-col justify-center gap-4">
                    <div className="flex items-center justify-between text-sm font-bold mb-1">
                        <span>Progresso Total</span>
                        <span className="text-primary">{course.progress}%</span>
                    </div>
                    <div className="h-4 bg-muted rounded-full overflow-hidden border">
                        <div
                            className="h-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.5)] transition-all duration-1000"
                            style={{ width: `${course.progress}%` }}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Module Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="text-sm font-black uppercase tracking-widest text-muted-foreground ml-2 mb-4">Trilha do Curso</h3>
                    {course.modules.map((mod, idx) => (
                        <div
                            key={mod.id}
                            onClick={() => mod.status !== "BLOQUEADO" && setActiveModule(idx)}
                            className={cn(
                                "p-6 rounded-[32px] border transition-all cursor-pointer group flex items-start gap-4",
                                activeModule === idx ? "bg-card border-primary/30 shadow-xl ring-1 ring-primary/10" : "hover:bg-muted/50 border-transparent",
                                mod.status === "BLOQUEADO" && "opacity-50 cursor-not-allowed"
                            )}
                        >
                            <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-110",
                                mod.status === "CONCLUÍDO" ? "bg-success/10 text-success" :
                                    mod.status === "EM_ANDAMENTO" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                            )}>
                                {mod.status === "CONCLUÍDO" ? <CheckCircle2 className="w-6 h-6" /> :
                                    mod.status === "EM_ANDAMENTO" ? <Play className="w-6 h-6 fill-primary/20" /> : <Lock className="w-5 h-5" />}
                            </div>

                            <div className="flex-1">
                                <div className="font-bold text-lg leading-tight mb-1">{mod.title}</div>
                                <div className="text-xs text-muted-foreground line-clamp-1">{mod.description}</div>
                            </div>

                            {activeModule === idx && <ChevronRight className="w-5 h-5 text-primary self-center" />}
                        </div>
                    ))}
                </div>

                {/* Selected Module Content */}
                <div className="lg:col-span-8 space-y-10">
                    <div className="p-10 rounded-[48px] bg-card border shadow-2xl relative overflow-hidden">
                        {/* Background Glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] -mr-32 -mt-32" />

                        <div className="relative z-10">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                                <div>
                                    <h2 className="text-3xl font-black mb-2">{course.modules[activeModule].title}</h2>
                                    <p className="text-muted-foreground">{course.modules[activeModule].description}</p>
                                </div>
                                <Link href={`/estudar/${course.modules[activeModule].id}`}>
                                    <Button className="rounded-2xl h-14 px-8 font-black gap-2 text-lg shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
                                        <Play className="w-5 h-5 fill-current" />
                                        Começar Estudo
                                    </Button>
                                </Link>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Topics List */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Star className="w-4 h-4 text-primary" />
                                        O que você vai aprender
                                    </h4>
                                    <ul className="space-y-4">
                                        {course.modules[activeModule].topics.map(topic => (
                                            <li key={topic} className="flex items-center gap-3 text-sm font-bold">
                                                <div className="w-2 h-2 rounded-full bg-primary" />
                                                {topic}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Quick Stats/Materials */}
                                <div className="space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-primary" />
                                        Recursos Disponíveis
                                    </h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-4 rounded-3xl bg-muted/30 text-center">
                                            <div className="text-2xl font-black">{course.modules[activeModule].questionsCount}</div>
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Questões</div>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-muted/30 text-center">
                                            <div className="text-2xl font-black">2.5h</div>
                                            <div className="text-[10px] uppercase font-bold text-muted-foreground">Carga Horária</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div className="mt-12 pt-10 border-t">
                                <h4 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-6">Materiais de Apoio</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {course.modules[activeModule].materials.length > 0 ? (
                                        course.modules[activeModule].materials.map(mat => (
                                            <Link key={mat.id} href={`/materiais/${mat.id}`} className="flex items-center justify-between p-5 rounded-3xl border hover:bg-muted/30 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                        {mat.type === "pdf" ? <FileText className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                                    </div>
                                                    <div className="text-sm font-bold">{mat.name}</div>
                                                </div>
                                                <Download className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                                            </Link>
                                        ))
                                    ) : (
                                        <div className="md:col-span-2 py-8 text-center text-sm font-medium text-muted-foreground bg-muted/20 rounded-3xl border-2 border-dashed">
                                            Nenhum material cadastrado para este módulo ainda.
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
