import CourseCard from "@/components/courses/CourseCard";
import PageHeader from "@/components/PageHeader";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function CoursesPage() {
    const mockCourses = [
        {
            id: "1",
            title: "Magistratura Federal - Completo",
            description: "Preparação de alto nível para o concurso de Juiz Federal com foco total no edital unificado.",
            lessonsCount: 24,
            studentsCount: 1250,
            rating: 4.9,
        },
        {
            id: "2",
            title: "Ministério Público Estadual",
            description: "Curso focado nas carreiras de Promotor de Justiça, abrangendo todas as disciplinas do certame.",
            lessonsCount: 18,
            studentsCount: 840,
            rating: 4.8,
        },
        {
            id: "3",
            title: "Delegado de Polícia Civil",
            description: "Foco total em Direito Penal, Processo Penal e Legislação Especial para Delegados.",
            lessonsCount: 12,
            studentsCount: 2100,
            rating: 4.7,
        },
        {
            id: "4",
            title: "Analista Judiciário - TRFs",
            description: "Curso voltado para quem busca estabilidade nos tribunais federais brasileiros.",
            lessonsCount: 15,
            studentsCount: 3200,
            rating: 4.6,
        },
    ];

    return (
        <div className="container mx-auto px-4 py-12">
            <PageHeader
                title="Meus Cursos"
                description="Acesse seus conteúdos e continue evoluindo nos seus estudos."
                badge="ÁREA DO ALUNO"
            />

            <div className="flex flex-col md:flex-row gap-4 mb-12">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cursos..."
                        className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 h-12 bg-card rounded-2xl border shadow-sm hover:bg-muted transition-colors font-medium">
                    <Filter className="w-4 h-4" />
                    Filtros
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {mockCourses.map((course) => (
                    <CourseCard key={course.id} {...course} />
                ))}
            </div>
        </div>
    );
}
