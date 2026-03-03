"use client";

import PageHeader from "../../../../components/PageHeader";
import {
    Plus,
    Search,
    Filter,
    MoreHorizontal,
    Trash2,
    Edit2,
    CheckCircle2,
    HelpCircle,
    Zap,
    Layout,
    ArrowUpRight,
    TrendingUp,
    FileText,
    Dumbbell,
    AlertTriangle,
    X,
    Loader2,
    Upload
} from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { Input } from "../../../../components/ui/input";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";

import { apiFetch } from "@/lib/api";

export default function AdminQuestoesPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"SIMULADO" | "QUIZ">("SIMULADO");
    const [questions, setQuestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [stats, setStats] = useState({ total: 0, easy: 0, medium: 0, hard: 0 });

    // Bulk Delete Modal States
    const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
    const [bulkDeleteType, setBulkDeleteType] = useState<"topic" | "subject">("topic");
    const [bulkDeleteItems, setBulkDeleteItems] = useState<string[]>([]);
    const [selectedBulkItem, setSelectedBulkItem] = useState("");
    const [confirmInput, setConfirmInput] = useState("");
    const [isFetchingItems, setIsFetchingItems] = useState(false);

    const fetchStats = async () => {
        try {
            const res = await apiFetch(`/admin/questions/stats?category=${activeTab}`);
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const fetchQuestions = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/admin/questions?category=${activeTab}&search=${searchTerm}`);
            if (res.ok) {
                const data = await res.json();
                setQuestions(data.content || []);
            }
        } catch (error) {
            console.error("Failed to fetch questions", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchQuestions();
        fetchStats();
    }, [activeTab, searchTerm]);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir esta questão?")) return;
        try {
            const res = await apiFetch(`/admin/questions/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchQuestions();
                fetchStats();
            }
        } catch (error) {
            console.error("Failed to delete question", error);
        }
    };

    const openBulkDeleteModal = async (type: "topic" | "subject") => {
        setBulkDeleteType(type);
        setIsBulkDeleteModalOpen(true);
        setSelectedBulkItem("");
        setConfirmInput("");
        setIsFetchingItems(true);

        try {
            const endpoint = type === "topic" ? "topics" : "subjects";
            const res = await apiFetch(`/admin/questions/${endpoint}?category=${activeTab}`);
            if (res.ok) {
                const data = await res.json();
                setBulkDeleteItems(data.filter((i: string) => i && i.trim() !== "") || []);
            }
        } catch (error) {
            console.error("Failed to fetch items", error);
        } finally {
            setIsFetchingItems(false);
        }
    };

    const handleExecuteBulkDelete = async () => {
        if (confirmInput.toLowerCase() !== "confirmar") {
            alert("Por favor, digite 'confirmar' para prosseguir.");
            return;
        }

        try {
            const endpoint = bulkDeleteType === "topic" ? "topic" : "subject";
            const param = bulkDeleteType === "topic" ? "topic" : "subject";
            const res = await apiFetch(`/admin/questions/${endpoint}?${param}=${encodeURIComponent(selectedBulkItem)}`, { method: "DELETE" });
            if (res.ok) {
                fetchQuestions();
                fetchStats();
                setIsBulkDeleteModalOpen(false);
                alert("Exclusão em massa realizada com sucesso!");
            }
        } catch (error) {
            console.error("Failed to execute bulk delete", error);
        }
    };

    return (
        <div className="w-full px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Banco de Questões"
                    description="Gerencie o acervo de questões para simulados oficiais e para o modo de treino rápido (Quick Quiz)."
                    badge="CONTEÚDO"
                />
                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-14 rounded-2xl font-black px-8 gap-2">
                                <Trash2 className="w-5 h-5" />
                                Limpar Acervo
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-56 rounded-2xl p-2 shadow-2xl border-muted/50">
                            <DropdownMenuItem onClick={() => openBulkDeleteModal("topic")} className="rounded-xl font-bold gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer h-10">
                                <Trash2 className="w-4 h-4" />
                                Por Assunto
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openBulkDeleteModal("subject")} className="rounded-xl font-bold gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer h-10">
                                <Trash2 className="w-4 h-4" />
                                Por Matéria
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="outline" className="h-14 rounded-2xl font-black px-8 gap-2">
                        <Filter className="w-5 h-5" />
                        Filtros Avançados
                    </Button>
                    <Link href="/admin/questoes/importar">
                        <Button variant="outline" className="h-14 rounded-xl font-black px-8 gap-2">
                            <Upload className="w-5 h-5" />
                            Importar em Lote
                        </Button>
                    </Link>
                    <Link href="/admin/questoes/nova">
                        <Button className="h-14 rounded-xl font-black px-8 gap-2 shadow-xl shadow-primary/20">
                            <Plus className="w-5 h-5" />
                            Cadastrar Questão
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Tabs Design */}
            <div className="flex gap-4 mb-8 bg-muted/20 p-2 rounded-2xl w-fit border border-muted/50">
                <button
                    onClick={() => setActiveTab("SIMULADO")}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black transition-all ${activeTab === "SIMULADO" ? "bg-white text-primary shadow-xl shadow-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <FileText className="w-5 h-5" />
                    Banca de Simulados
                </button>
                <button
                    onClick={() => setActiveTab("QUIZ")}
                    className={`flex items-center gap-3 px-8 py-4 rounded-xl font-black transition-all ${activeTab === "QUIZ" ? "bg-white text-primary shadow-xl shadow-primary/10" : "text-muted-foreground hover:text-foreground"}`}
                >
                    <Dumbbell className="w-5 h-5" />
                    Quick Quiz (Treino)
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                <div className="p-8 rounded-2xl bg-card border group hover:border-primary/50 transition-all cursor-default relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary/10 transition-colors" />
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Total no Banco</div>
                    <div className="text-4xl font-black mb-2">{stats.total}</div>
                    <div className="text-xs font-bold text-primary flex items-center gap-1">
                        Questões ativas
                        <ArrowUpRight className="w-3 h-3" />
                    </div>
                </div>
                <div className="p-8 rounded-2xl bg-card border hover:border-success/50 transition-all cursor-default">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Fácil</div>
                    <div className="text-4xl font-black mb-2 text-success">{stats.easy}</div>
                    <div className="text-xs font-bold text-muted-foreground">Iniciantes</div>
                </div>
                <div className="p-8 rounded-2xl bg-card border hover:border-warning/50 transition-all cursor-default">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Médio</div>
                    <div className="text-4xl font-black mb-2 text-warning">{stats.medium}</div>
                    <div className="text-xs font-bold text-muted-foreground">Intermediário</div>
                </div>
                <div className="p-8 rounded-2xl bg-card border hover:border-destructive/50 transition-all cursor-default">
                    <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">Difícil</div>
                    <div className="text-4xl font-black mb-2 text-destructive">{stats.hard}</div>
                    <div className="text-xs font-bold text-muted-foreground">Avançado</div>
                </div>
            </div>

            {/* List Section */}
            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar no conteúdo, matéria ou banca..."
                            className="h-16 pl-14 rounded-xl bg-card border-2 focus-visible:ring-0 focus-visible:border-primary font-bold text-lg transition-all shadow-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 border-b">
                            <tr>
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Enunciado & Matéria</th>
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Banca / Ano</th>
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Dificuldade</th>
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td className="px-8 py-6">
                                            <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                                            <div className="h-3 bg-muted rounded w-1/4" />
                                        </td>
                                        <td className="px-8 py-6"><div className="h-4 bg-muted rounded w-16 mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-8 bg-muted rounded-xl w-20 mx-auto" /></td>
                                        <td className="px-8 py-6"><div className="h-10 bg-muted rounded-xl w-10 ml-auto" /></td>
                                    </tr>
                                ))
                            ) : questions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-50">
                                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                                <Search className="w-10 h-10" />
                                            </div>
                                            <div className="text-xl font-black">Nenhuma questão encontrada</div>
                                            <p className="text-sm font-medium text-muted-foreground max-w-xs">
                                                Tente outros termos de busca ou mude a categoria acima para encontrar o que procura.
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : questions.map((q) => (
                                <tr key={q.id} className="group hover:bg-muted/20 transition-all">
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col gap-1">
                                            <div
                                                className="font-bold text-slate-800 line-clamp-1 group-hover:text-primary transition-colors cursor-default"
                                                title={q.statement}
                                                dangerouslySetInnerHTML={{ __html: q.statement }}
                                            />
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">
                                                    {q.module?.title || q.subject}
                                                </span>
                                                <span className="text-[10px] font-bold text-muted-foreground">
                                                    {q.topic}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-center font-black text-sm text-slate-500">
                                        {q.banca} • {q.year}
                                    </td>
                                    <td className="px-8 py-6 text-center">
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black border uppercase tracking-widest ${q.difficulty === 'EASY' ? 'bg-success/5 text-success border-success/20' :
                                            q.difficulty === 'MEDIUM' ? 'bg-warning/5 text-warning border-warning/20' :
                                                'bg-destructive/5 text-destructive border-destructive/20'
                                            }`}>
                                            {q.difficulty === 'EASY' ? 'Fácil' : q.difficulty === 'MEDIUM' ? 'Médio' : 'Difícil'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-white hover:shadow-md transition-all">
                                                    <MoreHorizontal className="w-5 h-5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl border-muted/50">
                                                <DropdownMenuItem
                                                    onClick={() => router.push(`/admin/questoes/nova?id=${q.id}`)}
                                                    className="rounded-xl font-bold gap-2 focus:bg-primary focus:text-white cursor-pointer h-10"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                    Editar Questão
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(q.id)}
                                                    className="rounded-xl font-bold gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer h-10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                    Remover do Acervo
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bulk Delete Modal */}
            <AnimatePresence>
                {isBulkDeleteModalOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsBulkDeleteModalOpen(false)}
                            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-md"
                        />

                        {/* Modal container */}
                        <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
                            <motion.div
                                key="modal"
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="w-full max-w-lg bg-card border shadow-2xl rounded-[32px] overflow-hidden pointer-events-auto"
                            >
                                <div className="p-8">
                                    <div className="flex items-center justify-between mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-destructive/10 flex items-center justify-center text-destructive">
                                                <AlertTriangle className="w-6 h-6" />
                                            </div>
                                            <div className="text-left">
                                                <h3 className="text-xl font-black">Limpar Acervo</h3>
                                                <p className="text-sm font-bold text-muted-foreground leading-tight">
                                                    Excluir por {bulkDeleteType === "topic" ? "Assunto" : "Matéria"} em <span className="text-primary">{activeTab === 'QUIZ' ? 'Quick Quiz' : 'Simulados'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setIsBulkDeleteModalOpen(false)}
                                            className="w-10 h-10 rounded-xl hover:bg-muted flex items-center justify-center transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <div className="space-y-2 text-left">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                Selecione o {bulkDeleteType === "topic" ? "Assunto" : "Matéria"}
                                            </label>
                                            <div className="relative">
                                                {isFetchingItems ? (
                                                    <div className="h-14 rounded-2xl bg-muted/50 animate-pulse flex items-center justify-center">
                                                        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                                                    </div>
                                                ) : (
                                                    <select
                                                        value={selectedBulkItem}
                                                        onChange={(e) => setSelectedBulkItem(e.target.value)}
                                                        className="w-full h-14 rounded-2xl bg-muted/50 border-2 border-transparent focus:border-primary px-6 font-bold outline-none transition-all appearance-none cursor-pointer"
                                                    >
                                                        <option value="">Selecione uma opção...</option>
                                                        {bulkDeleteItems.sort().map((item) => (
                                                            <option key={item} value={item}>{item}</option>
                                                        ))}
                                                    </select>
                                                )}
                                            </div>
                                        </div>

                                        {selectedBulkItem && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="space-y-4 pt-4 border-t"
                                            >
                                                <div className="p-5 rounded-2xl bg-destructive/5 border border-destructive/10 text-destructive text-sm font-bold leading-relaxed text-left">
                                                    ⚠️ CUIDADO: Esta ação apagará permanentemente todas as questões de <strong>"{selectedBulkItem}"</strong>, incluindo histórico de duelos e tentativas de alunos.
                                                </div>

                                                <div className="space-y-2 text-left">
                                                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground ml-1">
                                                        Digite <span className="text-destructive font-black">confirmar</span> para apagar
                                                    </label>
                                                    <Input
                                                        placeholder="Escreva 'confirmar' aqui..."
                                                        value={confirmInput}
                                                        onChange={(e) => setConfirmInput(e.target.value)}
                                                        className="h-14 rounded-2xl border-2 border-muted focus-visible:border-destructive focus-visible:ring-destructive/10 font-bold px-6"
                                                    />
                                                </div>

                                                <Button
                                                    disabled={confirmInput.toLowerCase() !== "confirmar"}
                                                    onClick={handleExecuteBulkDelete}
                                                    className="w-full h-16 rounded-2xl font-black gap-2 bg-destructive hover:bg-destructive/90 text-white shadow-xl shadow-destructive/20 transition-all disabled:opacity-50 disabled:grayscale"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                    APAGAR TUDO AGORA
                                                </Button>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
