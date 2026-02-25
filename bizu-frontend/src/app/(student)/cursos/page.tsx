"use client";

import CourseCard from "@/components/courses/CourseCard";
import PageHeader from "@/components/PageHeader";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { apiFetch } from "@/lib/api";
import { getMediaSourceType, resolveMediaUrl } from "@/lib/media";

interface StudentCourse {
    id: string;
    title: string;
    description?: string;
    thumbnailUrl?: string;
    modules?: Array<unknown>;
    studentsCount?: number;
    progress?: number;
    themeColor?: string;
    textColor?: string;
    category?: string;
}

export default function CoursesPage() {
    const [courses, setCourses] = useState<StudentCourse[]>([]);
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

    const filteredCourses = courses.filter((course) => {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        const titleMatch = course.title.toLowerCase().includes(normalizedSearchTerm);
        const descriptionMatch = (course.description || "").toLowerCase().includes(normalizedSearchTerm);

        return titleMatch || descriptionMatch;
    });

    return (
        <div className="w-full px-4 py-8 md:px-6 lg:px-8 xl:px-10">
            <PageHeader
                title="Meus Cursos"
                description="Acesse seus conteúdos e continue evoluindo nos seus estudos."
                badge="ÁREA DO ALUNO"
            />

            <div className="mb-10 flex flex-col gap-4 md:flex-row">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        placeholder="Buscar cursos..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="h-12 rounded-2xl border-none bg-card pl-10 shadow-sm focus-visible:ring-primary"
                    />
                </div>
                <button className="flex h-12 items-center justify-center gap-2 rounded-2xl border bg-card px-6 font-medium shadow-sm transition-colors hover:bg-muted">
                    <Filter className="h-4 w-4" />
                    Filtros
                </button>
            </div>

            {isLoading ? (
                <div className="py-20 text-center">Carregando cursos...</div>
            ) : filteredCourses.length === 0 ? (
                <div className="rounded-[40px] border border-dashed bg-muted/20 py-20 text-center">
                    Nenhum curso encontrado.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 2xl:grid-cols-3">
                    {filteredCourses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={course.title}
                            description={course.description || "Sem descrição disponível."}
                            thumbnail={resolveMediaUrl(course.thumbnailUrl)}
                            mediaSourceType={getMediaSourceType(course.thumbnailUrl)}
                            lessonsCount={course.modules?.length || 0}
                            studentsCount={course.studentsCount || 0}
                            progress={course.progress || 0}
                            themeColor={course.themeColor}
                            textColor={course.textColor}
                            category={course.category}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
