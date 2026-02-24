"use client";

import PageHeader from "../../../../components/PageHeader";
import { Plus, Settings, Trash2, Pencil, Calendar, Clock, BookOpen, Search } from "lucide-react";
import { Button } from "../../../../components/ui/button";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/api";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { Input } from "../../../../components/ui/input";

export default function AdminSimuladosPage() {
    const router = useRouter();
    const [simulados, setSimulados] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchSimulados = async () => {
        setIsLoading(true);
        try {
            const res = await apiFetch(`/admin/simulados`);
            if (res.ok) {
                const data = await res.json();
                setSimulados(data.content || []);
            }
        } catch (error) {
            console.error("Failed to fetch simulados", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSimulados();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Tem certeza que deseja excluir este Simulado?")) return;
        try {
            const res = await apiFetch(`/admin/simulados/${id}`, { method: "DELETE" });
            if (res.ok) {
                fetchSimulados();
            }
        } catch (error) {
            console.error("Failed to delete simulado", error);
        }
    };

    return (
        <div className="w-full px-8 py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <PageHeader
                    title="Simulados"
                    description="Crie simulados com data e hora marcada para seus alunos."
                    badge="CONTEÚDO"
                />
                <Button
                    className="h-14 rounded-xl font-black px-8 gap-2 shadow-xl shadow-primary/20"
                    onClick={() => router.push("/admin/simulados/novo")}
                >
                    <Plus className="w-5 h-5" />
                    Novo Simulado
                </Button>
            </div>

            <div className="space-y-6">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-primary transition-colors" />
                        <Input
                            placeholder="Buscar simulado por título..."
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
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Simulado</th>
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Início</th>
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest">Término</th>
                                <th className="px-8 py-6 text-xs font-black text-muted-foreground uppercase tracking-widest text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-6 text-center text-muted-foreground">
                                        Carregando simulados...
                                    </td>
                                </tr>
                            ) : simulados.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center">
                                        <div className="flex flex-col items-center gap-4 grayscale opacity-50">
                                            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                                                <Search className="w-10 h-10" />
                                            </div>
                                            <div className="text-xl font-black">Nenhum simulado encontrado</div>
                                        </div>
                                    </td>
                                </tr>
                            ) : simulados.filter(s => s.title.toLowerCase().includes(searchTerm.toLowerCase())).map((simulado) => (
                                <tr key={simulado.id} className="hover:bg-muted/30 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-primary/10 text-primary">
                                                <BookOpen className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-lg">{simulado.title}</div>
                                                <div className="text-xs text-muted-foreground font-medium">
                                                    {simulado.course?.title || "Geral"} • {simulado.questions?.length || 0} Questões
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-bold text-sm">
                                                {simulado.startDate ? new Date(simulado.startDate).toLocaleDateString() : "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-muted-foreground" />
                                            <span className="font-bold text-sm">
                                                {simulado.endDate ? new Date(simulado.endDate).toLocaleDateString() : "-"}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="rounded-xl hover:bg-primary/10 text-primary"
                                                onClick={() => router.push(`/admin/simulados/${simulado.id}`)}
                                                title="Gerenciar Questões"
                                            >
                                                <Settings className="w-4 h-4 mr-2" />
                                                Questões
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDelete(simulado.id)}
                                                className="rounded-xl text-destructive hover:bg-destructive/10"
                                                title="Excluir Simulado"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
