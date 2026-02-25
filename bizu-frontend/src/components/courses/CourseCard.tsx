import { Button } from "@/components/ui/button";
import { BookOpen, Users, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface CourseCardProps {
    id: string;
    title: string;
    description: string;
    thumbnail?: string;
    studentsCount?: number;
    rating?: number;
    lessonsCount?: number;
    themeColor?: string;
    textColor?: string;
}

export default function CourseCard({
    id,
    title,
    description,
    thumbnail,
    studentsCount = 0,
    rating = 5.0,
    lessonsCount = 0,
    themeColor,
    textColor,
}: CourseCardProps) {
    return (
        <div className="group relative bg-card border rounded-xl overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
            <div className="aspect-video relative overflow-hidden bg-muted">
                {thumbnail ? (
                    <Image
                        src={thumbnail}
                        alt={title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                ) : (
                    <div className="w-full h-full bg-primary/5 flex items-center justify-center" style={themeColor ? { backgroundColor: themeColor + '10' } : {}}>
                        <BookOpen className="w-12 h-12" style={themeColor ? { color: themeColor } : { color: 'var(--primary-20)' }} />
                    </div>
                )}
                <div className="absolute top-4 right-4 px-2 py-1 rounded-lg bg-background/80 backdrop-blur-md text-xs font-bold flex items-center gap-1">
                    <Star className="w-3 h-3 text-accent fill-accent" />
                    {rating.toFixed(1)}
                </div>
            </div>

            <div className="p-6 text-left">
                <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors text-foreground" style={themeColor ? { '--primary': themeColor } as any : {}}>
                    {title}
                </h3>
                <p className="text-sm text-muted-foreground mb-6 line-clamp-2">
                    {description}
                </p>

                <div className="flex items-center gap-4 mb-6 text-xs text-muted-foreground font-medium">
                    <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        {lessonsCount} Módulos
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {studentsCount > 1000 ? `${(studentsCount / 1000).toFixed(1)}k` : studentsCount} Alunos
                    </div>
                </div>

                <Link href={`/cursos/${id}`} className="block">
                    <Button
                        className="w-full rounded-xl font-bold py-6 transition-all"
                        style={themeColor ? { backgroundColor: themeColor, color: textColor || "#ffffff" } : {}}
                    >
                        Acessar Curso
                    </Button>
                </Link>
            </div>
        </div>
    );
}
