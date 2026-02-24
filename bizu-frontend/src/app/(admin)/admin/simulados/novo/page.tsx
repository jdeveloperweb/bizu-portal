"use client";

import PageHeader from "../../../../../components/PageHeader";
import { ArrowLeft, Save, PlusCircle, Calendar, Settings2 } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { apiFetch } from "@/lib/api";
import { Input } from "../../../../../components/ui/input";

export default function NovoSimuladoPage() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [courseId, setCourseId] = useState("");
    const [courses, setCourses] = useState<any[]>([]);

    useEffect(() => {
        const fetchCourses = async () => {
            const res = await apiFetch("/admin/courses");
            if (res.ok) {
                const data = await res.json();
                setCourses(data);
            }
        };
        fetchCourses();
    }, []);

    const handleSave = async () => {
        try {
            const bodyData: any = {
                title,
                description,
            };
            if (startDate) bodyData.startDate = new Date(startDate).toISOString();
            if (endDate) bodyData.endDate = new Date(endDate).toISOString();
            if (courseId) bodyData.courseId = courseId;

            const res = await apiFetch("/admin/simulados", {
                method: "POST",
                body: JSON.stringify(bodyData)
            });

            if (res.ok) {
                const newSimulado = await res.json();
                router.push(`/admin/simulados/${newSimulado.id}`);
            }
        } catch (error) {
            console.error("Failed to save simulado", error);
        }
    };

    return (
        <div className="relative min-h-screen">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-6 py-12 max-w-7xl relative">
                {/* Header Section */}
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
                        <div className="relative">
                            <PageHeader
                                title="Criar Novo Simulado"
                                description="Defina as propriedades do simulado antes de adicionar questões."
                                badge="CMS PLATFORM"
                            />
                            <div className="absolute -left-12 top-10 w-1 h-12 bg-primary/20 rounded-full hidden lg:block" />
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleSave}
                            className="h-14 rounded-2xl font-black px-12 gap-3 shadow-2xl shadow-primary/30 bg-gradient-to-r from-primary to-primary-dark border-none hover:opacity-90 active:scale-95 transition-all"
                        >
                            <Save className="w-5 h-5" />
                            Criar e Adicionar Questões
                        </Button>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Main Content Area */}
                    <div className="lg:col-span-8 space-y-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="group space-y-6"
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

                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 lg:pl-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5 }}
                            className="sticky top-12 p-8 rounded-[48px] bg-card border-2 border-muted/50 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] space-y-8 backdrop-blur-md"
                        >
                            <div className="relative">
                                <h3 className="text-2xl font-black flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <Settings2 className="w-6 h-6" />
                                    </div>
                                    Propriedades
                                </h3>
                            </div>

                            <div className="space-y-6 text-left">
                                {/* Course Selector */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground ml-1">Curso Vinculado</label>
                                    <div className="relative group">
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
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
