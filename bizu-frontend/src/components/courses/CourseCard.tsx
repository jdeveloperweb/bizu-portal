"use client";

import { Button } from "@/components/ui/button";
import type { MediaSourceType } from "@/lib/media";
import { BookOpen, Globe, HardDriveDownload, Star, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { type CSSProperties, useMemo, useState } from "react";

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
    category?: string;
    progress?: number;
    mediaSourceType?: MediaSourceType;
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
    category,
    progress = 0,
    mediaSourceType = "uploaded",
}: CourseCardProps) {
    const [hasImageError, setHasImageError] = useState(false);

    const normalizedProgress = useMemo(() => Math.max(0, Math.min(100, progress)), [progress]);
    const hasThumbnail = Boolean(thumbnail && !hasImageError);

    return (
        <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl">
            <div className="relative aspect-video overflow-hidden bg-muted">
                {hasThumbnail ? (
                    mediaSourceType === "external" ? (
                        <img
                            src={thumbnail}
                            alt={title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                            loading="lazy"
                            onError={() => setHasImageError(true)}
                        />
                    ) : (
                        <Image
                            src={thumbnail!}
                            alt={title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            onError={() => setHasImageError(true)}
                        />
                    )
                ) : (
                    <div
                        className="flex h-full w-full items-center justify-center bg-primary/5"
                        style={themeColor ? { backgroundColor: `${themeColor}10` } : {}}
                    >
                        <BookOpen
                            className="h-12 w-12"
                            style={themeColor ? { color: themeColor } : { color: "var(--primary-20)" }}
                        />
                    </div>
                )}

                <div className="absolute left-4 top-4 rounded-lg bg-background/85 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-foreground backdrop-blur-md">
                    <span className="inline-flex items-center gap-1">
                        {mediaSourceType === "external" ? <Globe className="h-3 w-3" /> : <HardDriveDownload className="h-3 w-3" />}
                        {mediaSourceType === "external" ? "Link externo" : "Imagem carregada"}
                    </span>
                </div>

                <div className="absolute right-4 top-4 flex items-center gap-1 rounded-lg bg-background/85 px-2 py-1 text-xs font-bold backdrop-blur-md">
                    <Star className="h-3 w-3 fill-accent text-accent" />
                    {rating.toFixed(1)}
                </div>

                {category && (
                    <div className="absolute bottom-4 left-4 rounded-xl bg-background/90 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-foreground shadow-sm backdrop-blur-md">
                        {category}
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col p-6 text-left">
                <h3
                    className="mb-2 line-clamp-1 text-xl font-bold text-foreground transition-colors group-hover:text-primary"
                    style={themeColor ? ({ "--primary": themeColor } as CSSProperties) : {}}
                >
                    {title}
                </h3>
                <p className="mb-5 line-clamp-2 text-sm text-muted-foreground">{description}</p>

                <div className="mb-5 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {lessonsCount} Módulos
                    </div>
                    <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {studentsCount > 1000 ? `${(studentsCount / 1000).toFixed(1)}k` : studentsCount} Alunos
                    </div>
                </div>

                <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold text-muted-foreground">
                        <span>Andamento</span>
                        <span>{normalizedProgress}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                                width: `${normalizedProgress}%`,
                                backgroundColor: themeColor || "hsl(var(--primary))",
                            }}
                        />
                    </div>
                </div>

                <Link href={`/cursos/${id}`} className="mt-auto block">
                    <Button
                        className="w-full rounded-xl py-6 font-bold transition-all"
                        style={themeColor ? { backgroundColor: themeColor, color: textColor || "#ffffff" } : {}}
                    >
                        Acessar Curso
                    </Button>
                </Link>
            </div>
        </div>
    );
}
