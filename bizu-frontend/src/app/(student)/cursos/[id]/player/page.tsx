"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";

export default function PlayerEntryPage() {
    const router = useRouter();
    const params = useParams<{ id: string | string[] }>();
    const courseId = Array.isArray(params.id) ? params.id[0] : params.id;

    useEffect(() => {
        if (!courseId) {
            router.replace(`/cursos`);
            return;
        }

        const redirectToFirstLesson = async () => {
            try {
                const res = await apiFetch(`/public/courses/${courseId}`);
                if (res.ok) {
                    const course = await res.json();
                    if (course.modules && course.modules.length > 0) {
                        const firstModule = course.modules[0];
                        if (firstModule.materials && firstModule.materials.length > 0) {
                            const firstMaterial = firstModule.materials[0];
                            router.replace(`/cursos/${courseId}/player/${firstMaterial.id}`);
                            return;
                        }
                    }
                }
                // Fallback to course details if anything fails
                router.replace(`/cursos/${courseId}`);
            } catch (error) {
                console.error("Failed to redirect to player", error);
                router.replace(`/cursos/${courseId}`);
            }
        };

        redirectToFirstLesson();
    }, [courseId, router]);

    return (
        <div className="flex h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium">Preparando seu ambiente de estudo...</p>
            </div>
        </div>
    );
}
