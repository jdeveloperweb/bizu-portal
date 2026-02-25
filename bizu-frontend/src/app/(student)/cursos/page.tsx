"use client";

import CourseCard from "@/components/courses/CourseCard";
import PageHeader from "@/components/PageHeader";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function CoursesPage() {
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const fetchCourses = async () => {
            setIsLoading(true);
            try {
                const res = await apiFetch("/student/courses/me");
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
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(c =>
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description && c.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

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
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 rounded-2xl bg-card border-none shadow-sm focus-visible:ring-primary"
                    />
                </div>
                <button className="flex items-center justify-center gap-2 px-6 h-12 bg-card rounded-2xl border shadow-sm hover:bg-muted transition-colors font-medium">
                    <Filter className="w-4 h-4" />
                    Filtros
                </button>
            </div>

            {isLoading ? (
                <div className="text-center py-20">Carregando cursos...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-muted/20 rounded-[40px] border border-dashed">
                    Nenhum curso encontrado.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            description={course.description}
                            thumbnail={course.thumbnailUrl}
                            lessonsCount={course.modules?.length || 0}
                            themeColor={course.themeColor}
                            textColor={course.textColor}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
