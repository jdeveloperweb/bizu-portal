"use client";

import { useState, useEffect } from "react";
import {
    StickyNote, Plus, Search, Filter, BookOpen,
    Tag, Clock, Trash2, Edit3, ChevronRight,
    Star, Pin, Target, CheckSquare, FileText,
    X,
} from "lucide-react";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/components/AuthProvider";

interface Note {
    id: string;
    title: string;
    content: string;
    subject: string;
    moduleId?: string;
    tags: string[];
    linkedTo?: { type: "questao" | "tarefa" | "assunto"; label: string };
    pinned: boolean;
    starred: boolean;
    createdAt: string;
    updatedAt: string;
}

interface Module {
    id: string;
    title: string;
}

interface Course {
    id: string;
    title: string;
    modules: Module[];
}

export default function AnotacoesPage() {
    const [notes, setNotes] = useState<Note[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedSubject, setSelectedSubject] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNote, setSelectedNote] = useState<Note | null>(null);
    const [isEditing, setIsEditing] = useState(false);

    const { selectedCourseId } = useAuth();

    // Edit States
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [editModuleId, setEditModuleId] = useState("");
    const [editTags, setEditTags] = useState("");

    // UI states
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [notesRes, coursesRes] = await Promise.all([
                apiFetch("/student/notes"),
                apiFetch("/public/courses")
            ]);
            if (notesRes.ok) {
                const data = await notesRes.json();
                setNotes(Array.isArray(data) ? data : []);
            }
            if (coursesRes.ok) {
                const data = await coursesRes.json();
                setCourses(Array.isArray(data) ? data : []);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsLoading(false);
        }
    };

    const displayCourses = courses.filter(c => c.id === selectedCourseId);

    // Derived subject list from courses modules + Geral
    const SUBJECTS = ["Todos", "Geral", ...Array.from(new Set(displayCourses.flatMap(c => c.modules.map(m => m.title))))];

    const filteredNotes = notes.filter(n => {
        const matchSubject = selectedSubject === "Todos" || n.subject === selectedSubject;
        const matchSearch = searchQuery === "" ||
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (n.tags && n.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
        return matchSubject && matchSearch;
    }).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });

    const togglePin = async (id: string, currentlyPinned: boolean) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !currentlyPinned } : n));
        if (selectedNote?.id === id) setSelectedNote(prev => prev ? { ...prev, pinned: !currentlyPinned } : null);
        try {
            await apiFetch(`/student/notes/${id}/pin`, { method: "PATCH" });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const toggleStar = async (id: string, currentlyStarred: boolean) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, starred: !currentlyStarred } : n));
        if (selectedNote?.id === id) setSelectedNote(prev => prev ? { ...prev, starred: !currentlyStarred } : null);
        try {
            await apiFetch(`/student/notes/${id}/star`, { method: "PATCH" });
            fetchData();
        } catch (e) {
            console.error(e);
        }
    };

    const deleteNote = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta anotação?")) return;
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNote?.id === id) setSelectedNote(null);
        try {
            await apiFetch(`/student/notes/${id}`, { method: "DELETE" });
        } catch (e) {
            console.error(e);
        }
    };

    const startEditing = (note: Note) => {
        setEditTitle(note.title);
        setEditContent(note.content);
        setEditModuleId(note.moduleId || "");
        setEditTags(note.tags ? note.tags.join(", ") : "");
        setIsEditing(true);
    };

    const saveEdit = async () => {
        if (!editTitle || !editContent) {
            alert("Título e conteúdo são obrigatórios.");
            return;
        }

        const tagsArray = editTags.split(",").map(t => t.trim()).filter(t => t !== "");

        const payload = {
            title: editTitle,
            content: editContent,
            moduleId: editModuleId || null,
            tags: tagsArray,
            pinned: selectedNote?.pinned || false,
            starred: selectedNote?.starred || false,
        };

        try {
            let res;
            if (selectedNote && selectedNote.id !== "new") {
                res = await apiFetch(`/student/notes/${selectedNote.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload)
                });
            } else {
                res = await apiFetch(`/student/notes`, {
                    method: "POST",
                    body: JSON.stringify(payload)
                });
            }

            if (res.ok) {
                setIsEditing(false);
                setSelectedNote(null);
                fetchData();
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.error("Erro ao salvar:", errorData);
                alert(`Erro ao salvar anotação: ${errorData.message || res.statusText}`);
            }
        } catch (e) {
            console.error(e);
            alert("Erro de conexão ao salvar anotação.");
        }
    };

    const createNewNote = () => {
        const newNote: Note = {
            id: "new", title: "", content: "",
            subject: "Geral", tags: [], pinned: false, starred: false,
            createdAt: "Agora", updatedAt: "Agora",
        };
        setSelectedNote(newNote);
        setEditTitle("");
        setEditContent("");
        setEditModuleId("");
        setEditTags("");
        setIsEditing(true);
    };

    const linkedTypeIcon = {
        questao: Target,
        tarefa: CheckSquare,
        assunto: BookOpen,
    };

    return (
        <div className="p-6 lg:p-8 w-full max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Anotações</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Minhas Anotações
                    </h1>
                    <p className="text-sm text-slate-500">Registre insights e crie sua base de revisão personalizada.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{notes.length} anotações</span>
                    <button onClick={createNewNote} className="btn-primary !h-10 !text-[12px] !px-5">
                        <Plus size={15} /> Nova Anotação
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" style={{ minHeight: "calc(100vh - 200px)" }}>
                {/* Notes List Panel */}
                <div className="lg:col-span-4 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                            placeholder="Buscar anotações..."
                            className="input-field !pl-9 !h-10 text-[12px]" />
                    </div>

                    {/* Subject Filter */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                        {SUBJECTS.map(s => (
                            <button key={s} onClick={() => setSelectedSubject(s)}
                                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold whitespace-nowrap transition-all ${selectedSubject === s
                                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    }`}>
                                {s === "Todos" ? s : s.replace("Direito ", "D. ").replace("Processo ", "P. ")}
                            </button>
                        ))}
                    </div>

                    {/* Notes List */}
                    <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 280px)" }}>
                        {isLoading ? (
                            <div className="text-center py-12 text-slate-400">Carregando anotações...</div>
                        ) : filteredNotes.map(note => (
                            <button key={note.id} onClick={() => { setSelectedNote(note); setIsEditing(false); }}
                                className={`w-full text-left card-elevated !rounded-xl p-3.5 hover:!transform-none transition-all ${selectedNote?.id === note.id ? "!border-indigo-300 !shadow-[0_0_0_2px_rgba(99,102,241,0.1)]" : ""
                                    }`}>
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            {note.pinned && <Pin size={10} className="text-indigo-500" />}
                                            {note.starred && <Star size={10} className="text-amber-500 fill-amber-500" />}
                                            <span className="text-[12px] font-bold text-slate-800 truncate">{note.title}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">{note.content}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[9px] font-semibold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                {note.subject ? note.subject.replace("Direito ", "D. ").replace("Processo ", "P. ") : "Geral"}
                                            </span>
                                            <span className="text-[9px] text-slate-400">{note.updatedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {!isLoading && filteredNotes.length === 0 && (
                            <div className="text-center py-12">
                                <FileText size={32} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-[12px] text-slate-400">Nenhuma anotação encontrada</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Note Detail Panel */}
                <div className="lg:col-span-8">
                    {selectedNote ? (
                        <div className="card-elevated !rounded-2xl p-6 hover:!transform-none h-full">
                            {/* Note Header */}
                            <div className="flex items-start justify-between mb-5 pb-4 border-b border-slate-100">
                                <div className="flex-1">
                                    {isEditing ? (
                                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                                            placeholder="Título da Anotação"
                                            className="text-xl font-extrabold text-slate-900 w-full bg-transparent border-b-2 border-indigo-300 pb-1 outline-none mb-4" />
                                    ) : (
                                        <h2 className="text-xl font-extrabold text-slate-900 mb-2">{selectedNote.title || "Sem título"}</h2>
                                    )}

                                    {!isEditing && (
                                        <div className="flex items-center gap-3">
                                            <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                {selectedNote.subject}
                                            </span>
                                            {selectedNote.linkedTo && (
                                                <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                    {(() => { const Icon = linkedTypeIcon[selectedNote.linkedTo.type]; return Icon ? <Icon size={9} /> : null; })()}
                                                    {selectedNote.linkedTo.label}
                                                </span>
                                            )}
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock size={9} /> {selectedNote.updatedAt}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0 pl-4">
                                    {(selectedNote.id !== "new" && !isEditing) && (
                                        <>
                                            <button onClick={() => togglePin(selectedNote.id, selectedNote.pinned)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedNote.pinned ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"
                                                    }`}>
                                                <Pin size={14} />
                                            </button>
                                            <button onClick={() => toggleStar(selectedNote.id, selectedNote.starred)}
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedNote.starred ? "bg-amber-50 text-amber-600" : "text-slate-400 hover:bg-slate-50"
                                                    }`}>
                                                <Star size={14} className={selectedNote.starred ? "fill-amber-500" : ""} />
                                            </button>
                                            <button onClick={() => startEditing(selectedNote)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                                                <Edit3 size={14} />
                                            </button>
                                            <button onClick={() => deleteNote(selectedNote.id)}
                                                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}

                                    {isEditing && selectedNote.id !== "new" && (
                                        <button onClick={() => setIsEditing(false)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                                            <X size={14} />
                                        </button>
                                    )}
                                    {isEditing && selectedNote.id === "new" && (
                                        <button onClick={() => { setIsEditing(false); setSelectedNote(null); }}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                                            <X size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Edit Form / Content */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Módulo vinculado (Opcional)</label>
                                            <select
                                                value={editModuleId}
                                                onChange={e => setEditModuleId(e.target.value)}
                                                className="input-field !text-[13px] bg-slate-50"
                                            >
                                                <option value="">Geral / Nenhum módulo</option>
                                                {displayCourses.map(course => (
                                                    <optgroup key={course.id} label={course.title}>
                                                        {course.modules.map(module => (
                                                            <option key={module.id} value={module.id}>{module.title}</option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">Marcadores (separados por vírgula)</label>
                                            <input
                                                value={editTags}
                                                onChange={e => setEditTags(e.target.value)}
                                                placeholder="ex: art.37, penal, dicas"
                                                className="input-field !text-[13px] bg-slate-50"
                                            />
                                        </div>
                                    </div>

                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                                        rows={12}
                                        placeholder="Escreva sua anotação aqui..."
                                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700 leading-relaxed outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none" />
                                    <div className="flex items-center gap-2">
                                        <button onClick={saveEdit} className="btn-primary !h-9 !text-[12px] !px-4">Salvar Anotação</button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Tags view */}
                                    {selectedNote.tags && selectedNote.tags.length > 0 && (
                                        <div className="flex items-center flex-wrap gap-1.5 mb-5">
                                            <Tag size={11} className="text-slate-400" />
                                            {selectedNote.tags.map((tag, i) => (
                                                <span key={i} className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                        {selectedNote.content}
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="card-elevated !rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full hover:!transform-none">
                            <StickyNote size={40} className="text-slate-200 mb-4" />
                            <h3 className="text-[15px] font-bold text-slate-600 mb-1">Selecione uma anotação</h3>
                            <p className="text-[12px] text-slate-400">Escolha uma anotação na lista ou crie uma nova</p>
                            <button onClick={createNewNote} className="btn-primary mt-6 !h-9 !text-[12px] !px-5">
                                <Plus size={14} /> Nova Anotação
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
