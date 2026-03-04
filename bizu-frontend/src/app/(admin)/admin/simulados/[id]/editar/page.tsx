"use client";

import PageHeader from "../../../../../../components/PageHeader";
import { ArrowLeft, Save, Settings2 } from "lucide-react";
import { Button } from "../../../../../../components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Input } from "../../../../../../components/ui/input";

function toDatetimeLocal(iso: string | null | undefined): string {
    if (!iso) return "";
    return iso.slice(0, 16);
}

export default function EditarSimuladoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [courseId, setCourseId] = useState("");
    const [durationMinutes, setDurationMinutes] = useState<string>("");
    const [courses, setCourses] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [simuladoRes, coursesRes] = await Promise.all([
                apiFetch(`/admin/simulados/${id}`),
                apiFetch("/admin/courses"),
            ]);

            if (simuladoRes.ok) {
                const s = await simuladoRes.json();
                setTitle(s.title || "");
                setDescription(s.description || "");
                setStartDate(toDatetimeLocal(s.startDate));
                setEndDate(toDatetimeLocal(s.endDate));
                setCourseId(s.course?.id || "");
                setDurationMinutes(s.durationMinutes ? String(s.durationMinutes) : "");
            }

            if (coursesRes.ok) {
                const data = await coursesRes.json();
                setCourses(data);
            }

            setIsLoading(false);
        };
        fetchData();
    }, [id]);

    const handleSave = async () => {
        const bodyData: any = { title, description };
        if (startDate) bodyData.startDate = new Date(startDate).toISOString();
        if (endDate) bodyData.endDate = new Date(endDate).toISOString();
        if (courseId) bodyData.courseId = courseId;
        if (durationMinutes) bodyData.durationMinutes = parseInt(durationMinutes, 10);

        const res = await apiFetch(`/admin/simulados/${id}`, {
            method: "PUT",
            body: JSON.stringify(bodyData),
        });

        if (res.ok) {
            router.push("/admin/simulados");
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground font-bold">Carregando...</p>
            </div>
        );
    }

    return (
        <div className="w-full px-8 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16"
                >
                    <div className="space-y-6">
                        <Link
                            href="/admin/simulados"
                            className="group text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-all duration-300"
                        >
                            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                <ArrowLeft className="w-4 h-4" />
                            </div>
                            Voltar para Simulados
                        </Link>
                        <PageHeader
                            title="Editar Simulado"
                            description="Atualize as propriedades do simulado."
                            badge="CMS PLATFORM"
                        />
                    </div>
                    <Button
                        onClick={handleSave}
                        className="h-14 rounded-2xl font-black px-12 gap-3 shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-primary-dark border-none hover:opacity-90 active:scale-95 transition-all"
                    >
                        <Save className="w-5 h-5" />
                        Salvar Alterações
                    </Button>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Título do Simulado</label>
                                <Input
                                    autoFocus
                                    required
                                    placeholder="Ex: Simulado Nacional TRT"
                                    value={title}
                                    onChange={e => setTitle(e.target.value)}
                                    className="h-14 rounded-xl border-2 font-bold text-lg focus-visible:ring-0 focus-visible:border-primary"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-bold text-muted-foreground">Descrição</label>
                                <textarea
                                    placeholder="Instruções gerais, detalhes ou temas abordados no simulado..."
                                    value={description}
                                    onChange={e => setDescription(e.target.value)}
                                    className="flex w-full rounded-xl border-2 border-input bg-transparent px-4 py-3 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50 min-h-[150px] resize-none"
                                />
                            </div>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-4 lg:pl-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="sticky top-12 p-8 rounded-[48px] bg-card border-2 border-muted/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-8 backdrop-blur-md"
                        >
                            <h3 className="text-2xl font-black flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Settings2 className="w-6 h-6" />
                                </div>
                                Propriedades
                            </h3>

                            <div className="space-y-6 text-left">
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Curso Vinculado</label>
                                    <select
                                        className="w-full h-14 px-5 pr-10 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-bold text-sm outline-none appearance-none transition-all cursor-pointer"
                                        value={courseId}
                                        onChange={(e) => setCourseId(e.target.value)}
                                    >
                                        <option value="">Geral (Todos os alunos)</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Data/Hora Início</label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-black text-sm outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Data/Hora Fim</label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-black text-sm outline-none transition-all"
                                    />
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Duração (minutos)</label>
                                    <input
                                        type="number"
                                        min="1"
                                        placeholder="Ex: 180 (3 horas)"
                                        value={durationMinutes}
                                        onChange={(e) => setDurationMinutes(e.target.value)}
                                        className="w-full h-14 px-5 rounded-2xl bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-white font-black text-sm outline-none transition-all"
                                    />
                                    {durationMinutes && (
                                        <p className="text-[11px] text-muted-foreground font-bold ml-1">
                                            ≈ {Math.floor(parseInt(durationMinutes) / 60)}h {parseInt(durationMinutes) % 60}min
                                        </p>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
        </div>
    );
}
