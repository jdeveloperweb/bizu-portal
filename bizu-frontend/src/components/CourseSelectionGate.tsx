"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

interface Course {
    id: string;
    title: string;
}

export default function CourseSelectionGate({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { authenticated, loading, selectedCourseId, setSelectedCourseId, refreshUserProfile, isAdmin } = useAuth();
    const [courses, setCourses] = useState<Course[]>([]);
    const [saving, setSaving] = useState(false);
    const [selected, setSelected] = useState("");

    useEffect(() => {
        if (!authenticated || loading || selectedCourseId || isAdmin) return;

        const loadCourses = async () => {
            const res = await apiFetch("/public/courses");
            if (res.ok) {
                setCourses(await res.json());
            }
        };

        loadCourses();
    }, [authenticated, loading, selectedCourseId, isAdmin]);

    const isPublicPath = !pathname || pathname === "/" || pathname === "/login" || pathname === "/register" ||
        pathname.startsWith("/pricing") || pathname.startsWith("/termos") || pathname.startsWith("/privacidade") ||
        pathname.startsWith("/forgot-password") || pathname.startsWith("/checkout");

    const shouldBlock = authenticated && !loading && !selectedCourseId && !isPublicPath && !pathname?.startsWith("/admin") && !isAdmin;

    const handleConfirm = async () => {
        if (!selected) return;
        setSaving(true);
        const res = await apiFetch("/student/courses/select", {
            method: "PUT",
            body: JSON.stringify({ courseId: selected }),
        });

        if (res.ok) {
            setSelectedCourseId(selected);
            await refreshUserProfile();
        }
        setSaving(false);
    };

    return (
        <>
            {children}
            {shouldBlock && (
                <div className="fixed inset-0 z-[100] bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-6">
                    <div className="w-full max-w-lg rounded-3xl bg-white p-8 shadow-2xl">
                        <h2 className="text-2xl font-bold text-slate-900">Escolha seu curso para continuar</h2>
                        <p className="mt-2 text-slate-600">
                            Antes de avançar, selecione o curso que você quer testar. Seu conteúdo será carregado com base nessa escolha.
                        </p>

                        <select
                            value={selected}
                            onChange={(e) => setSelected(e.target.value)}
                            className="mt-6 w-full h-12 rounded-xl border border-slate-200 px-4"
                        >
                            <option value="">Selecione um curso</option>
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.title}</option>
                            ))}
                        </select>

                        <button
                            onClick={handleConfirm}
                            disabled={!selected || saving}
                            className="mt-6 w-full h-12 rounded-xl bg-slate-900 text-white font-semibold disabled:opacity-50"
                        >
                            {saving ? "Salvando..." : "Confirmar curso"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
