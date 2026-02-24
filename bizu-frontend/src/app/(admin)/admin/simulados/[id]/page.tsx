"use client";

import PageHeader from "../../../../../components/PageHeader";
import { Plus, Trash2, ArrowLeft, Calendar, BookOpen, Clock } from "lucide-react";
import { Button } from "../../../../../components/ui/button";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";

export default function DetalhesSimuladoPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [simulado, setSimulado] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSimulado = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/admin/simulados/${id}`);
            if (res.ok) {
                const data = await res.json();
                setSimulado(data);
            }
        } catch (error) {
            console.error("Failed to fetch simulado", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchSimulado();
        }
    }, [id]);

    const handleRemoveQuestion = async (questionId: string) => {
        if (!confirm("Tem certeza que deseja remover esta questão do simulado?")) return;
        try {
            const res = await apiFetch(`/admin/simulados/${id}/questions/${questionId}`, { method: "DELETE" });
            if (res.ok) {
                fetchSimulado();
            }
        } catch (error) {
            console.error("Failed to remove question", error);
        }
    };

    if (isLoading) return <div className="p-8 text-center">Carregando detalhes do simulado...</div>;
    if (!simulado) return <div className="p-8 text-center text-red-500">Erro ao carregar simulado.</div>;

    return (
        <div className="w-full px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                <div className="space-y-6">
                    <Link
                        href="/admin/simulados"
                        className="group text-xs font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2 hover:text-primary transition-all duration-300"
                    >
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                            <ArrowLeft className="w-4 h-4" />
                        </div>
                        Voltar para Lista
                    </Link>
                    <PageHeader
                        title={`Gerenciar: ${simulado.title}`}
                        description={simulado.description || "Adicione ou remova questões para montar este simulado."}
                        badge="SIMULADOS"
                    />
                </div>
                <div className="flex gap-4">
                    <Button
                        className="h-14 rounded-xl font-black px-8 gap-2 shadow-xl shadow-primary/20"
                        onClick={() => router.push(`/admin/simulados/${id}/nova-questao`)}
                    >
                        <Plus className="w-5 h-5" />
                        Nova Questão
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <div className="p-6 rounded-2xl bg-card border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Curso Vinculado</div>
                        <div className="font-bold">{simulado.course?.title || "Geral (Todos os alunos)"}</div>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data/Hora Início</div>
                        <div className="font-bold">{simulado.startDate ? new Date(simulado.startDate).toLocaleString() : "-"}</div>
                    </div>
                </div>
                <div className="p-6 rounded-2xl bg-card border flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                        <Clock className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Data/Hora Fim</div>
                        <div className="font-bold">{simulado.endDate ? new Date(simulado.endDate).toLocaleString() : "-"}</div>
                    </div>
                </div>
            </div>

            <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-muted/30 border-b">
                        <tr>
                            <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Enunciado / Matéria</th>
                            <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Banca / Ano</th>
                            <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-center">Dificuldade</th>
                            <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ação</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {!simulado.questions || simulado.questions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-8 py-16 text-center text-muted-foreground font-medium">
                                    Nenhuma questão cadastrada neste simulado ainda. Clique em "Nova Questão" acima.
                                </td>
                            </tr>
                        ) : simulado.questions.map((q: any) => (
                            <tr key={q.id} className="hover:bg-muted/30 transition-colors group">
                                <td className="px-8 py-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="font-bold text-slate-800 line-clamp-2" title={q.statement}>
                                            {q.statement.replace(/[#*]/g, '')}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-primary bg-primary/5 px-2 py-0.5 rounded">
                                                {q.subject}
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
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveQuestion(q.id)}
                                        className="rounded-xl text-destructive hover:bg-destructive/10"
                                        title="Remover do Simulado"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
