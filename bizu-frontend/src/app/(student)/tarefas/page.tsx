"use client";

import { useState } from "react";
import Link from "next/link";
import {
    CheckSquare, Plus, Calendar, Filter, Target, BookOpen,
    Timer, StickyNote, ChevronRight, AlertCircle, TrendingUp,
    Flame, Clock, Trash2, Flag, CheckCircle2, Circle,
    BarChart3, Zap, Brain,
} from "lucide-react";

type Priority = "alta" | "media" | "baixa";
type TaskStatus = "pendente" | "em_progresso" | "concluida";
type TaskSource = "manual" | "questao_errada" | "simulado" | "desempenho" | "ranking";

interface Task {
    id: string;
    title: string;
    description: string;
    subject: string;
    priority: Priority;
    status: TaskStatus;
    source: TaskSource;
    dueDate: string;
    linkedActionType?: string;
    linkedActionLabel?: string;
    linkedActionHref?: string;
}

const priorityConfig = {
    alta: { label: "Alta", color: "text-red-600", bg: "bg-red-50", border: "border-red-100", dot: "bg-red-500" },
    media: { label: "Media", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100", dot: "bg-amber-500" },
    baixa: { label: "Baixa", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100", dot: "bg-emerald-500" },
};

const sourceLabels: Record<TaskSource, string> = {
    manual: "Manual",
    questao_errada: "Questao Errada",
    simulado: "Simulado",
    desempenho: "Desempenho",
    ranking: "Meta Ranking",
};

import { useEffect } from "react";
import { apiFetch } from "@/lib/api";

export default function TarefasPage() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resTasks = await apiFetch("/student/tasks");
                if (resTasks.ok) {
                    setTasks(await resTasks.json());
                }
                const resSuggestions = await apiFetch("/student/tasks/suggestions");
                if (resSuggestions.ok) {
                    setSuggestions(await resSuggestions.json());
                }
                const resCourses = await apiFetch("/public/courses");
                if (resCourses.ok) {
                    const coursesData = await resCourses.json();
                    setCourses(coursesData);
                    if (coursesData.length > 0) {
                        setSelectedCourse(coursesData[0].id);
                        if (coursesData[0].modules?.length > 0) {
                            setSelectedModule(coursesData[0].modules[0].id);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const [filter, setFilter] = useState<"todas" | "pendente" | "em_progresso" | "concluida">("todas");
    const [showNewTask, setShowNewTask] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("");
    const [selectedModule, setSelectedModule] = useState("");
    const [newPriority, setNewPriority] = useState<Priority>("media");

    const toggleStatus = async (id: string) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return;
        const next: TaskStatus = task.status === "pendente" ? "em_progresso" : task.status === "em_progresso" ? "concluida" : "pendente";

        try {
            const res = await apiFetch(`/student/tasks/${id}/status`, {
                method: "PATCH",
                body: JSON.stringify({ status: next })
            });
            if (res.ok) {
                setTasks(prev => prev.map(t => t.id === id ? { ...t, status: next } : t));
            }
        } catch (error) {
            console.error("Error updating task status", error);
        }
    };

    const deleteTask = async (id: string) => {
        try {
            const res = await apiFetch(`/student/tasks/${id}`, { method: "DELETE" });
            if (res.ok) {
                setTasks(prev => prev.filter(t => t.id !== id));
            }
        } catch (error) {
            console.error("Error deleting task", error);
        }
    };

    const addTask = async () => {
        if (!newTitle.trim()) return;

        const course = courses.find(c => c.id === selectedCourse);
        const module = course?.modules?.find((m: any) => m.id === selectedModule);
        const subjectName = module ? `${course.title} - ${module.title}` : (course ? course.title : "Geral");

        const newTaskData = {
            title: newTitle,
            subject: subjectName,
            priority: newPriority,
            status: "pendente",
            source: "manual",
            dueDate: "Sem prazo"
        };

        try {
            const res = await apiFetch("/student/tasks", {
                method: "POST",
                body: JSON.stringify(newTaskData)
            });

            if (res.ok) {
                const savedTask = await res.json();
                setTasks(prev => [savedTask, ...prev]);
                setNewTitle("");
                setShowNewTask(false);
            }
        } catch (error) {
            console.error("Error creating task", error);
        }
    };

    const createSuggestedTask = async (taskData: any) => {
        try {
            const res = await apiFetch("/student/tasks", {
                method: "POST",
                body: JSON.stringify(taskData)
            });

            if (res.ok) {
                const savedTask = await res.json();
                setTasks(prev => [savedTask, ...prev]);

                // Optional: remove suggestion after adding
                setSuggestions(prev => prev.filter(s => s.taskToCreate.title !== taskData.title));
            }
        } catch (error) {
            console.error("Error creating suggested task", error);
        }
    };

    const filteredTasks = tasks.filter(t => filter === "todas" || t.status === filter);
    const pendingCount = tasks.filter(t => t.status === "pendente").length;
    const inProgressCount = tasks.filter(t => t.status === "em_progresso").length;
    const completedCount = tasks.filter(t => t.status === "concluida").length;

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Planejamento</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Minhas Tarefas
                    </h1>
                    <p className="text-sm text-slate-500">Organize o que estudar, quando e como. Tarefas automaticas e manuais.</p>
                </div>
                <button onClick={() => setShowNewTask(true)}
                    className="btn-primary !h-10 !text-[12px] !px-5">
                    <Plus size={15} /> Nova Tarefa
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-3 mb-6">
                {[
                    { label: "Pendentes", val: pendingCount, icon: Circle, bg: "bg-amber-50", text: "text-amber-600" },
                    { label: "Em progresso", val: inProgressCount, icon: Clock, bg: "bg-indigo-50", text: "text-indigo-600" },
                    { label: "Concluidas", val: completedCount, icon: CheckCircle2, bg: "bg-emerald-50", text: "text-emerald-600" },
                ].map(s => {
                    const Icon = s.icon;
                    return (
                        <div key={s.label} className="card-elevated p-4 hover:!transform-none">
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-7 h-7 rounded-lg ${s.bg} flex items-center justify-center`}>
                                    <Icon size={13} className={s.text} />
                                </div>
                            </div>
                            <div className="text-xl font-extrabold text-slate-900">{s.val}</div>
                            <div className="text-[11px] text-slate-400">{s.label}</div>
                        </div>
                    );
                })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Filter Tabs */}
                    <div className="flex items-center gap-2">
                        {([
                            { key: "todas" as const, label: "Todas" },
                            { key: "pendente" as const, label: "Pendentes" },
                            { key: "em_progresso" as const, label: "Em progresso" },
                            { key: "concluida" as const, label: "Concluidas" },
                        ]).map(f => (
                            <button key={f.key} onClick={() => setFilter(f.key)}
                                className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold transition-all ${filter === f.key ? "bg-indigo-50 text-indigo-700 border border-indigo-100" : "text-slate-400 hover:text-slate-600"
                                    }`}>
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {/* New Task Form */}
                    {showNewTask && (
                        <div className="card-elevated !rounded-2xl p-5 border-indigo-200">
                            <div className="flex items-center gap-2 mb-4">
                                <Plus size={14} className="text-indigo-500" />
                                <span className="text-[13px] font-bold text-slate-800">Nova Tarefa</span>
                            </div>
                            <input value={newTitle} onChange={e => setNewTitle(e.target.value)}
                                placeholder="Titulo da tarefa..." autoFocus
                                className="input-field mb-3" />
                            <div className="flex flex-col gap-3 mb-4">
                                <div className="flex items-center gap-3">
                                    <select value={selectedCourse} onChange={e => {
                                        setSelectedCourse(e.target.value);
                                        const course = courses.find(c => c.id === e.target.value);
                                        if (course?.modules?.length > 0) {
                                            setSelectedModule(course.modules[0].id);
                                        } else {
                                            setSelectedModule("");
                                        }
                                    }}
                                        className="input-field !h-9 text-[12px] flex-1">
                                        {courses.length === 0 ? <option value="">Nenhum curso dispon&iacute;vel</option> : null}
                                        {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                                    </select>
                                    <select value={newPriority} onChange={e => setNewPriority(e.target.value as Priority)}
                                        className="input-field !w-auto !h-9 text-[12px]">
                                        <option value="alta">Alta</option>
                                        <option value="media">M&eacute;dia</option>
                                        <option value="baixa">Baixa</option>
                                    </select>
                                </div>
                                {courses.find((c: any) => c.id === selectedCourse)?.modules?.length > 0 && (
                                    <select value={selectedModule} onChange={e => setSelectedModule(e.target.value)}
                                        className="input-field !h-9 text-[12px] w-full">
                                        <option value="">Selecione um m&oacute;dulo...</option>
                                        {courses.find((c: any) => c.id === selectedCourse)?.modules?.map((m: any) => (
                                            <option key={m.id} value={m.id}>{m.title}</option>
                                        ))}
                                    </select>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={addTask} className="btn-primary !h-9 !text-[12px] !px-4">Adicionar</button>
                                <button onClick={() => setShowNewTask(false)} className="btn-ghost text-[12px]">Cancelar</button>
                            </div>
                        </div>
                    )}

                    {/* Task List */}
                    <div className="space-y-2.5">
                        {filteredTasks.map(task => {
                            const pConfig = priorityConfig[task.priority];
                            return (
                                <div key={task.id}
                                    className={`card-elevated !rounded-2xl p-4 hover:!transform-none ${task.status === "concluida" ? "opacity-60" : ""
                                        }`}>
                                    <div className="flex items-start gap-3">
                                        <button onClick={() => toggleStatus(task.id)} className="mt-0.5 shrink-0">
                                            {task.status === "concluida" ? (
                                                <CheckCircle2 size={18} className="text-emerald-500" />
                                            ) : task.status === "em_progresso" ? (
                                                <Clock size={18} className="text-indigo-500" />
                                            ) : (
                                                <Circle size={18} className="text-slate-300" />
                                            )}
                                        </button>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[13px] font-bold ${task.status === "concluida" ? "line-through text-slate-400" : "text-slate-800"}`}>
                                                    {task.title}
                                                </span>
                                            </div>
                                            {task.description && (
                                                <p className="text-[11px] text-slate-400 mb-2 line-clamp-1">{task.description}</p>
                                            )}
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${pConfig.bg} ${pConfig.color} ${pConfig.border} border`}>
                                                    {pConfig.label}
                                                </span>
                                                <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                                    {task.subject}
                                                </span>
                                                <span className="text-[9px] font-semibold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full">
                                                    {sourceLabels[task.source]}
                                                </span>
                                                <span className="text-[9px] text-slate-400 flex items-center gap-0.5">
                                                    <Calendar size={9} /> {task.dueDate}
                                                </span>
                                            </div>
                                            {task.linkedActionHref && task.status !== "concluida" && (
                                                <Link href={task.linkedActionHref}
                                                    className="inline-flex items-center gap-1 mt-2.5 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors">
                                                    {task.linkedActionLabel} <ChevronRight size={11} />
                                                </Link>
                                            )}
                                        </div>
                                        <button onClick={() => deleteTask(task.id)}
                                            className="text-slate-300 hover:text-red-400 transition-colors shrink-0">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-5">
                    {/* Auto-suggestions */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <Brain size={14} className="text-indigo-500" /> Sugestoes do Sistema
                        </h3>
                        <div className="space-y-2.5">
                            {suggestions.map((s, i) => {
                                const Icon = s.type === 'alert' ? AlertCircle : s.type === 'trend' ? TrendingUp : BarChart3;
                                return (
                                    <div key={i} className="flex items-start gap-2.5 py-2 px-3 rounded-xl bg-slate-50 border border-slate-100">
                                        <Icon size={13} className={`${s.color} mt-0.5 shrink-0`} />
                                        <div className="flex-1">
                                            <div className="text-[11px] text-slate-600 font-medium">{s.text}</div>
                                            <button
                                                onClick={() => createSuggestedTask(s.taskToCreate)}
                                                className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 mt-1">
                                                {s.actionLabel}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="card-elevated !rounded-2xl p-5 hover:!transform-none">
                        <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                            <Zap size={14} className="text-amber-500" /> Links Rapidos
                        </h3>
                        <div className="space-y-2">
                            <Link href="/pomodoro" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Timer size={14} className="text-slate-400" /> Iniciar Pomodoro
                            </Link>
                            <Link href="/questoes/treino" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <Target size={14} className="text-slate-400" /> Quiz rapido
                            </Link>
                            <Link href="/anotacoes" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <StickyNote size={14} className="text-slate-400" /> Minhas anotacoes
                            </Link>
                            <Link href="/desempenho" className="flex items-center gap-2.5 py-2 px-3 rounded-xl text-[12px] font-medium text-slate-600 hover:bg-slate-50 transition-all">
                                <BarChart3 size={14} className="text-slate-400" /> Ver desempenho
                            </Link>
                        </div>
                    </div>

                    {/* Weekly Progress */}
                    <div className="rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Flame size={14} className="text-indigo-600" />
                            <span className="text-[12px] font-bold text-indigo-800">Progresso Semanal</span>
                        </div>
                        <div className="text-2xl font-extrabold text-indigo-700 mb-1">{completedCount}/{tasks.length}</div>
                        <div className="text-[11px] text-indigo-500">tarefas concluidas esta semana</div>
                        <div className="mt-3 h-1.5 bg-indigo-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-600"
                                style={{ width: `${tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
