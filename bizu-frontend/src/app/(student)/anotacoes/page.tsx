"use client";

import { useState } from "react";
import {
    StickyNote, Plus, Search, Filter, BookOpen,
    Tag, Clock, Trash2, Edit3, ChevronRight,
    Star, Pin, Target, CheckSquare, FileText,
    X,
} from "lucide-react";

interface Note {
    id: string;
    title: string;
    content: string;
    subject: string;
    tags: string[];
    linkedTo?: { type: "questao" | "tarefa" | "assunto"; label: string };
    pinned: boolean;
    starred: boolean;
    createdAt: string;
    updatedAt: string;
}

const SUBJECTS = [
    "Todos", "Direito Constitucional", "Direito Administrativo", "Direito Civil",
    "Direito Penal", "Processo Civil", "Processo Penal",
];

export default function AnotacoesPage() {
    const [notes, setNotes] = useState<Note[]>([
        {
            id: "1", title: "Principios da Administracao Publica",
            content: "LIMPE: Legalidade, Impessoalidade, Moralidade, Publicidade, Eficiencia. Art. 37, CF/88. A legalidade para o administrador significa que ele so pode fazer o que a lei permite (diferente do particular). Impessoalidade: vedacao de promocao pessoal.",
            subject: "Direito Administrativo", tags: ["principios", "CF/88", "art.37"],
            linkedTo: { type: "questao", label: "Questao #247 - TRF4 2024" },
            pinned: true, starred: true, createdAt: "Hoje, 14:30", updatedAt: "Hoje, 14:30",
        },
        {
            id: "2", title: "Direitos Fundamentais - Geracoes",
            content: "1a geracao: liberdade (civis e politicos). 2a geracao: igualdade (sociais, economicos, culturais). 3a geracao: fraternidade (difusos e coletivos, meio ambiente, paz). 4a geracao: democracia, informacao, pluralismo. 5a geracao: paz (Bonavides).",
            subject: "Direito Constitucional", tags: ["direitos-fundamentais", "geracoes"],
            linkedTo: { type: "assunto", label: "Direitos Fundamentais" },
            pinned: true, starred: false, createdAt: "Ontem, 10:15", updatedAt: "Ontem, 16:40",
        },
        {
            id: "3", title: "Contratos - Classificacao",
            content: "Unilaterais x Bilaterais. Onerosos x Gratuitos. Comutativos x Aleatorios. Nominados x Inominados. Solenes x Nao solenes. Principais x Acessorios. Instantaneos x Continuados.",
            subject: "Direito Civil", tags: ["contratos", "classificacao"],
            linkedTo: { type: "tarefa", label: "Revisar Contratos" },
            pinned: false, starred: true, createdAt: "22 Fev", updatedAt: "23 Fev",
        },
        {
            id: "4", title: "Prisao em Flagrante - Especies",
            content: "Flagrante proprio (art. 302, I e II): esta cometendo ou acabou de cometer. Flagrante improprio (III): perseguido logo apos. Flagrante presumido (IV): encontrado logo depois com instrumentos. Flagrante preparado: invalido (Sumula 145 STF). Flagrante esperado: valido.",
            subject: "Processo Penal", tags: ["prisao", "flagrante", "art.302"],
            pinned: false, starred: false, createdAt: "20 Fev", updatedAt: "20 Fev",
        },
        {
            id: "5", title: "Responsabilidade Civil do Estado",
            content: "Art. 37, par. 6, CF. Teoria do risco administrativo (regra): responsabilidade objetiva. Excludentes: culpa exclusiva da vitima, caso fortuito, forca maior. Teoria do risco integral (excecao): dano nuclear, ambiental, terrorismo em aeronave.",
            subject: "Direito Administrativo", tags: ["responsabilidade", "estado", "risco"],
            pinned: false, starred: false, createdAt: "18 Fev", updatedAt: "19 Fev",
        },
    ]);

    const [selectedSubject, setSelectedSubject] = useState("Todos");
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0]);
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState("");
    const [editContent, setEditContent] = useState("");
    const [showNewNote, setShowNewNote] = useState(false);

    const filteredNotes = notes.filter(n => {
        const matchSubject = selectedSubject === "Todos" || n.subject === selectedSubject;
        const matchSearch = searchQuery === "" ||
            n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.tags.some(t => t.includes(searchQuery.toLowerCase()));
        return matchSubject && matchSearch;
    }).sort((a, b) => {
        if (a.pinned && !b.pinned) return -1;
        if (!a.pinned && b.pinned) return 1;
        return 0;
    });

    const togglePin = (id: string) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, pinned: !n.pinned } : n));
    };

    const toggleStar = (id: string) => {
        setNotes(prev => prev.map(n => n.id === id ? { ...n, starred: !n.starred } : n));
    };

    const deleteNote = (id: string) => {
        setNotes(prev => prev.filter(n => n.id !== id));
        if (selectedNote?.id === id) setSelectedNote(null);
    };

    const startEditing = (note: Note) => {
        setEditTitle(note.title);
        setEditContent(note.content);
        setIsEditing(true);
    };

    const saveEdit = () => {
        if (!selectedNote) return;
        setNotes(prev => prev.map(n =>
            n.id === selectedNote.id ? { ...n, title: editTitle, content: editContent, updatedAt: "Agora" } : n
        ));
        setSelectedNote({ ...selectedNote, title: editTitle, content: editContent, updatedAt: "Agora" });
        setIsEditing(false);
    };

    const createNewNote = () => {
        const newNote: Note = {
            id: Date.now().toString(), title: "Nova Anotacao",
            content: "", subject: selectedSubject === "Todos" ? SUBJECTS[1] : selectedSubject,
            tags: [], pinned: false, starred: false, createdAt: "Agora", updatedAt: "Agora",
        };
        setNotes(prev => [newNote, ...prev]);
        setSelectedNote(newNote);
        setEditTitle(newNote.title);
        setEditContent(newNote.content);
        setIsEditing(true);
        setShowNewNote(false);
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
                        <span className="pill pill-primary text-[10px] font-bold uppercase tracking-[0.15em]">Anotacoes</span>
                    </div>
                    <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mb-0.5">
                        Minhas Anotacoes
                    </h1>
                    <p className="text-sm text-slate-500">Registre insights e crie sua base de revisao personalizada.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[11px] font-bold text-slate-400">{notes.length} anotacoes</span>
                    <button onClick={createNewNote} className="btn-primary !h-10 !text-[12px] !px-5">
                        <Plus size={15} /> Nova Anotacao
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
                            placeholder="Buscar anotacoes..."
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
                    <div className="space-y-2 overflow-y-auto" style={{ maxHeight: "calc(100vh - 320px)" }}>
                        {filteredNotes.map(note => (
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
                                                {note.subject.replace("Direito ", "D. ").replace("Processo ", "P. ")}
                                            </span>
                                            <span className="text-[9px] text-slate-400">{note.updatedAt}</span>
                                        </div>
                                    </div>
                                </div>
                            </button>
                        ))}
                        {filteredNotes.length === 0 && (
                            <div className="text-center py-12">
                                <FileText size={32} className="text-slate-200 mx-auto mb-3" />
                                <p className="text-[12px] text-slate-400">Nenhuma anotacao encontrada</p>
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
                                            className="text-xl font-extrabold text-slate-900 w-full bg-transparent border-b-2 border-indigo-300 pb-1 outline-none mb-2" />
                                    ) : (
                                        <h2 className="text-xl font-extrabold text-slate-900 mb-2">{selectedNote.title}</h2>
                                    )}
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                            {selectedNote.subject}
                                        </span>
                                        {selectedNote.linkedTo && (
                                            <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                {(() => { const Icon = linkedTypeIcon[selectedNote.linkedTo.type]; return <Icon size={9} />; })()}
                                                {selectedNote.linkedTo.label}
                                            </span>
                                        )}
                                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                            <Clock size={9} /> {selectedNote.updatedAt}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <button onClick={() => togglePin(selectedNote.id)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedNote.pinned ? "bg-indigo-50 text-indigo-600" : "text-slate-400 hover:bg-slate-50"
                                            }`}>
                                        <Pin size={14} />
                                    </button>
                                    <button onClick={() => toggleStar(selectedNote.id)}
                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${selectedNote.starred ? "bg-amber-50 text-amber-600" : "text-slate-400 hover:bg-slate-50"
                                            }`}>
                                        <Star size={14} className={selectedNote.starred ? "fill-amber-500" : ""} />
                                    </button>
                                    {!isEditing ? (
                                        <button onClick={() => startEditing(selectedNote)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                                            <Edit3 size={14} />
                                        </button>
                                    ) : (
                                        <button onClick={() => setIsEditing(false)}
                                            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-50 transition-all">
                                            <X size={14} />
                                        </button>
                                    )}
                                    <button onClick={() => deleteNote(selectedNote.id)}
                                        className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-500 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            {/* Tags */}
                            {selectedNote.tags.length > 0 && (
                                <div className="flex items-center gap-1.5 mb-5">
                                    <Tag size={11} className="text-slate-400" />
                                    {selectedNote.tags.map(tag => (
                                        <span key={tag} className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-full">
                                            #{tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Content */}
                            {isEditing ? (
                                <div className="space-y-4">
                                    <textarea value={editContent} onChange={e => setEditContent(e.target.value)}
                                        rows={12}
                                        className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-[13px] text-slate-700 leading-relaxed outline-none focus:border-indigo-300 focus:ring-2 focus:ring-indigo-100 resize-none" />
                                    <div className="flex items-center gap-2">
                                        <button onClick={saveEdit} className="btn-primary !h-9 !text-[12px] !px-4">Salvar</button>
                                        <button onClick={() => setIsEditing(false)} className="btn-ghost text-[12px]">Cancelar</button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-[13px] text-slate-600 leading-relaxed whitespace-pre-wrap">
                                    {selectedNote.content}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="card-elevated !rounded-2xl p-12 flex flex-col items-center justify-center text-center h-full hover:!transform-none">
                            <StickyNote size={40} className="text-slate-200 mb-4" />
                            <h3 className="text-[15px] font-bold text-slate-600 mb-1">Selecione uma anotacao</h3>
                            <p className="text-[12px] text-slate-400">Escolha uma anotacao na lista ou crie uma nova</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
